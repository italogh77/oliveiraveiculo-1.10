/**
 * Utilitários para suporte a imagens e vídeos do Google Drive e YouTube
 */

/**
 * Extrai o ID do arquivo do Google Drive a partir de qualquer formato comum de link
 * Exemplos aceitos:
 * - https://drive.google.com/file/d/1A2B3C4D_5E6F/view?usp=sharing
 * - https://drive.google.com/open?id=1A2B3C4D_5E6F
 * - https://drive.google.com/uc?id=1A2B3C4D_5E6F
 * - https://drive.google.com/uc?export=view&id=1A2B3C4D_5E6F
 * - https://lh3.googleusercontent.com/d/1A2B3C4D_5E6F
 */
export function extractGoogleDriveId(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // Pattern 1: /file/d/ID
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) return fileDMatch[1];

  // Pattern 2: ?id=ID ou &id=ID
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1]) return idParamMatch[1];

  // Pattern 3: lh3.googleusercontent.com/d/ID
  const lh3Match = trimmed.match(/lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
  if (lh3Match && lh3Match[1]) return lh3Match[1];

  return null;
}

export function isGoogleDriveUrl(url) {
  try {
    const host = new URL(url).hostname;
    return host === 'drive.google.com' || host === 'drive.usercontent.google.com' || host === 'lh3.googleusercontent.com';
  } catch {
    return false;
  }
}

export function isGoogleDriveFolderUrl(url) {
  return isGoogleDriveUrl(url) && /\/folders\//i.test(url);
}

/**
 * Converte qualquer link de foto do Google Drive para o link direto de alta velocidade (CDN Google)
 * Se for uma URL normal (Unsplash, Firebase, etc.), mantém inalterada.
 */
export function formatImageUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  
  const driveId = extractGoogleDriveId(trimmed);
  if (driveId) {
    // O endpoint de thumbnail funciona melhor em <img> que a página /file/d/.../view.
    return `https://drive.google.com/thumbnail?id=${encodeURIComponent(driveId)}&sz=w2000`;
  }

  return trimmed;
}

/**
 * Processa um texto contendo um ou vários links (separados por quebra de linha, espaço ou vírgula)
 * e retorna uma lista de URLs prontas para exibição.
 */
export function extractMultipleImageUrls(text) {
  if (!text || typeof text !== 'string') return [];

  // Divide por linhas, vírgulas ou múltiplos espaços
  const rawUrls = text
    .split(/[\n,\s]+/)
    .map((s) => s.trim())
    .filter((s) => s.startsWith('http://') || s.startsWith('https://'));

  const unique = new Set();
  for (const rawUrl of rawUrls) {
    if (isGoogleDriveFolderUrl(rawUrl)) continue;
    if (isGoogleDriveUrl(rawUrl) && !extractGoogleDriveId(rawUrl)) continue;
    unique.add(formatImageUrl(rawUrl));
  }
  return [...unique];
}

export function validateImageLinks(text) {
  if (!text || typeof text !== 'string') return { urls: [], errors: [] };
  const candidates = text.split(/[\n,\s]+/).map((value) => value.trim()).filter(Boolean);
  const errors = [];
  const valid = [];

  for (const value of candidates) {
    try {
      const parsed = new URL(value);
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error();
    } catch {
      errors.push('Existe um endereço inválido. Use o link completo iniciado por https://.');
      continue;
    }
    if (isGoogleDriveFolderUrl(value)) {
      errors.push('Links de pasta não funcionam como foto. Abra cada imagem no Drive e copie o link do arquivo.');
      continue;
    }
    if (isGoogleDriveUrl(value) && !extractGoogleDriveId(value)) {
      errors.push('Um link do Drive não contém um arquivo reconhecível. Copie o link em Compartilhar > Copiar link.');
      continue;
    }
    valid.push(formatImageUrl(value));
  }

  return { urls: [...new Set(valid)], errors: [...new Set(errors)] };
}

/**
 * Extrai o ID de um vídeo do YouTube (watch, youtu.be, shorts, live, embed)
 */
export function extractYouTubeId(url) {
  if (!url || typeof url !== 'string') return null;
  const m = url.match(
    /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/|v\/))([\w-]{11})/
  );
  return m ? m[1] : null;
}

/**
 * Detecta o tipo de vídeo e retorna informações para exibição:
 *  - youtube / drive: embedUrl (iframe) + thumb
 *  - direct: arquivo de vídeo tocável (mp4, webm, Firebase Storage)
 *  - link: qualquer outro endereço (Instagram, Facebook...) que não dá para incorporar
 */
export function formatVideoUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  const ytId = extractYouTubeId(trimmed);
  if (ytId) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&playsinline=1&modestbranding=1`,
      thumb: `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
    };
  }

  const driveId = extractGoogleDriveId(trimmed);
  if (driveId) {
    return {
      type: 'drive',
      embedUrl: `https://drive.google.com/file/d/${driveId}/preview`,
      thumb: `https://drive.google.com/thumbnail?id=${driveId}&sz=w640`,
    };
  }

  if (/\.(mp4|webm|mov|m4v|ogv)(\?|#|$)/i.test(trimmed) || /firebasestorage|alt=media/i.test(trimmed)) {
    return { type: 'direct', src: trimmed };
  }

  return { type: 'link', href: trimmed };
}
