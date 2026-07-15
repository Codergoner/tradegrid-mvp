import { copyFile, mkdir } from 'node:fs/promises'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    ssr: true,
    copyPublicDir: false,
    outDir: 'dist/server',
    emptyOutDir: false,
    rollupOptions: {
      input: 'server/sites-worker.js',
      output: { entryFileNames: 'index.js' },
    },
  },
  plugins: [{
    name: 'sites-metadata',
    async closeBundle() {
      await mkdir('dist/.openai', { recursive: true })
      await copyFile('.openai/hosting.json', 'dist/.openai/hosting.json')
    },
  }],
})
