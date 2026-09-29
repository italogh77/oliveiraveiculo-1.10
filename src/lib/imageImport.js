import imageCompression from 'browser-image-compression';
import imageCompressionWorkerUrl from 'browser-image-compression/dist/browser-image-compression.js?url';

const IMAGE_EXTENSION = /\.(jpe?g|png|webp)$/i;
const MAX_ZIP_IMAGES = 60;
const MAX_UNCOMPRESSED_BYTES = 250 * 1024 * 1024;
const MAX_ORIGINAL_BYTES_ON_FAILURE = 5 * 1024 * 1024;

function optimizedName(name, suffix, type) {
  const extension = type === 'image/webp' ? 'webp' : 'jpg';
  return `${name.replace(/\.[^.]+$/, '')}${suffix}.${extension}`;
}

async function dimensionsOf(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      const dimensions = { width: bitmap.width, height: bitmap.height };
      bitmap.close();
      return dimensions;
    } catch { /* Safari/iOS usa o fallback abaixo */ }
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Não foi possível ler as dimensões da imagem.'));
    };
    image.src = url;
  });
}

async function compressVariant(file, options) {
  const webp = await imageCompression(file, { ...options, fileType: 'image/webp' });
  if (webp.type === 'image/webp') return webp;
  return imageCompression(file, { ...options, fileType: 'image/jpeg' });
}

export async function compressImageFile(file, options = {}) {
  const { maxDimension = 1600, maxSizeMB = 0.39, quality = 0.82 } = options;

  if (!(file instanceof Blob) || (!file.type.startsWith('image/') && !IMAGE_EXTENSION.test(file.name || ''))) {
    throw new Error('O arquivo não é uma imagem JPG, PNG ou WebP válida.');
  }

  try {
    const common = {
      useWebWorker: true,
      preserveExif: true,
      initialQuality: quality,
      libURL: imageCompressionWorkerUrl,
    };
    const largeBlob = await compressVariant(file, {
      ...common,
      maxSizeMB,
      maxWidthOrHeight: maxDimension,
    });
    const thumbBlob = await compressVariant(file, {
      ...common,
      maxSizeMB: 0.12,
      maxWidthOrHeight: 400,
      initialQuality: 0.78,
    });
    const large = new File([largeBlob], optimizedName(file.name, '', largeBlob.type), { type: largeBlob.type, lastModified: file.lastModified });
    const thumbnail = new File([thumbBlob], optimizedName(file.name, '-thumb', thumbBlob.type), { type: thumbBlob.type, lastModified: file.lastModified });
    const [largeDimensions, thumbDimensions] = await Promise.all([dimensionsOf(large), dimensionsOf(thumbnail)]);

    return {
      large,
      thumbnail,
      originalSize: file.size,
      largeSize: large.size,
      thumbSize: thumbnail.size,
      ...largeDimensions,
      thumbWidth: thumbDimensions.width,
      thumbHeight: thumbDimensions.height,
      largeExtension: large.type === 'image/webp' ? 'webp' : 'jpg',
      thumbExtension: thumbnail.type === 'image/webp' ? 'webp' : 'jpg',
    };
  } catch {
    const sizeWarning = file.size > MAX_ORIGINAL_BYTES_ON_FAILURE
      ? ' O arquivo original tem mais de 5 MB e, por segurança, não será enviado.'
      : '';
    const heicHint = /heic|heif/i.test(`${file.type} ${file.name}`)
      ? ' Fotos HEIC do iPhone precisam ser convertidas para JPG antes do envio.'
      : '';
    throw new Error(`Não foi possível otimizar "${file.name}".${heicHint}${sizeWarning} Tente salvar a foto como JPG ou WebP.`);
  }
}

export async function extractImagesFromZip(zipFile) {
  const { default: JSZip } = await import('jszip');
  const zip = await JSZip.loadAsync(zipFile);
  const entries = Object.values(zip.files)
    .filter((entry) => !entry.dir && IMAGE_EXTENSION.test(entry.name) && !/(^|\/)\.|__MACOSX/i.test(entry.name))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { numeric: true, sensitivity: 'base' }));

  if (!entries.length) throw new Error('O ZIP não possui imagens JPG, PNG ou WebP.');
  if (entries.length > MAX_ZIP_IMAGES) throw new Error(`O ZIP possui ${entries.length} imagens. O limite por importação é ${MAX_ZIP_IMAGES}.`);
  const totalSize = entries.reduce((sum, entry) => sum + (entry._data?.uncompressedSize || 0), 0);
  if (totalSize > MAX_UNCOMPRESSED_BYTES) throw new Error('O conteúdo descompactado ultrapassa o limite de 250 MB.');

  return Promise.all(entries.map(async (entry) => {
    const blob = await entry.async('blob');
    const fileName = entry.name.split('/').pop();
    return new File([blob], fileName, { type: blob.type || mimeFromName(fileName) });
  }));
}

function mimeFromName(name) {
  if (/\.png$/i.test(name)) return 'image/png';
  if (/\.webp$/i.test(name)) return 'image/webp';
  return 'image/jpeg';
}
