// Catálogo consultado sob demanda: marca → ano/combustível → modelo e versão.
// Documentação: https://fipe.api.br/docs/api/fipe
const BASE = 'https://fipe.parallelum.com.br/api/v2/cars/brands';
const TTL = 24 * 60 * 60 * 1000;
const memory = new Map();
export const CURRENT_YEAR = new Date().getFullYear();

export function filterCatalogYears(rows) {
  return rows.filter((row) => {
    const year = Number(String(row.code).split('-')[0]);
    return year >= 2000 && year <= CURRENT_YEAR;
  }).sort((a, b) => String(b.code).localeCompare(String(a.code)));
}

export async function loadCatalog(path = '', signal) {
  const key = `oliveira:fipe:v2:${path}`;
  let cached = memory.get(key);
  try { cached ||= JSON.parse(localStorage.getItem(key) || 'null'); } catch { /* storage indisponível */ }
  if (cached?.expires > Date.now() && Array.isArray(cached.data)) return cached.data;
  const timeout = new AbortController();
  const abort = () => timeout.abort();
  if (signal?.aborted) abort();
  signal?.addEventListener('abort', abort, { once: true });
  const timer = setTimeout(abort, 15000);
  try {
    const response = await fetch(`${BASE}${path}`, { signal: timeout.signal });
    if (!response.ok) throw new Error(response.status === 429
      ? 'O catálogo atingiu o limite de consultas. Tente mais tarde ou preencha manualmente.'
      : 'Catálogo indisponível. Tente novamente ou preencha manualmente.');
    const data = await response.json();
    if (!Array.isArray(data) || data.some((row) => !row.code || typeof row.name !== 'string')) throw new Error('Resposta inválida do catálogo. Você pode preencher manualmente.');
    const entry = { expires: Date.now() + TTL, data };
    memory.set(key, entry);
    try { localStorage.setItem(key, JSON.stringify(entry)); } catch { /* cache opcional */ }
    return data;
  } catch (error) {
    if (signal?.aborted) throw error;
    if (error.name === 'AbortError' || error instanceof TypeError) throw new Error('Não foi possível conectar ao catálogo. Confira a internet, tente novamente ou preencha manualmente.');
    throw error;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abort);
  }
}

export function displayBrand(name) {
  if (/^VW\s*-/i.test(name)) return 'Volkswagen';
  if (/^GM\s*-/i.test(name)) return 'Chevrolet';
  return name;
}
