const CHECK_INTERVAL_MS = 20_000;

function isAdminPage() {
  const search = new URLSearchParams(window.location.search);
  return window.location.hash.toLowerCase() === '#admin' || search.has('admin');
}

function readBuildVersion(html) {
  const match = html.match(/<meta\s+name=["']oliveira-build["']\s+content=["']([^"']+)["']/i);
  return match?.[1] || null;
}

/**
 * No desenvolvimento, o Vite atualiza a página automaticamente.
 * No site publicado, verifica se uma nova compilação terminou e recarrega
 * a aba aberta. A tela administrativa é ignorada para preservar formulários.
 */
export function startAutoRefresh() {
  if (import.meta.env.DEV || isAdminPage()) return;

  const currentVersion = document
    .querySelector('meta[name="oliveira-build"]')
    ?.getAttribute('content');

  if (!currentVersion) return;

  const siteRoot = new URL(import.meta.env.BASE_URL, window.location.href);
  const indexUrl = new URL('index.html', siteRoot);

  window.setInterval(async () => {
    if (document.hidden || isAdminPage()) return;

    try {
      indexUrl.searchParams.set('_build_check', Date.now().toString());
      const response = await fetch(indexUrl, { cache: 'no-store' });
      if (!response.ok) return;

      const nextVersion = readBuildVersion(await response.text());
      if (nextVersion && nextVersion !== currentVersion) {
        window.location.reload();
      }
    } catch {
      // Uma falha temporária de internet não deve interromper o site.
    }
  }, CHECK_INTERVAL_MS);
}
