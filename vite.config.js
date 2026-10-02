import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

function buildVersion() {
  const version = Date.now().toString()

  return {
    name: 'oliveira-build-version',
    transformIndexHtml(html) {
      return html.replace(
        '<head>',
        `<head>\n    <meta name="oliveira-build" content="${version}" />`,
      )
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), buildVersion()],
  server: {
    port: 5173,
    strictPort: true,
    // Também percebe alterações em pastas sincronizadas no Windows.
    watch: { usePolling: true, interval: 700 },
  },
  build: {
    rollupOptions: {
      output: {
        // Separa bibliotecas grandes em arquivos próprios: o navegador do
        // cliente guarda esses arquivos em cache e só baixa de novo quando
        // eles mudam — a cada atualização do site, só o código da própria
        // loja precisa ser baixado outra vez.
        manualChunks(id) {
          if (id.includes('/node_modules/firebase/') || id.includes('/node_modules/@firebase/')) return 'firebase'
          if (id.includes('/node_modules/framer-motion/') || id.includes('/node_modules/motion-dom/') || id.includes('/node_modules/motion-utils/')) return 'motion'
          if (id.includes('/node_modules/lucide-react/')) return 'icons'
        },
      },
    },
  },
})
