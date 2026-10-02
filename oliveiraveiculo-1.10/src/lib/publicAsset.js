/**
 * Cria a URL de um arquivo da pasta `public` respeitando o local em que o
 * site foi publicado. Assim, os arquivos funcionam tanto no computador
 * quanto em qualquer pasta do GitHub Pages, sem depender do nome da versão.
 */
export function publicAsset(path) {
  const normalizedPath = String(path).replace(/^\/+/, '');
  return `${import.meta.env.BASE_URL}${normalizedPath}`;
}
