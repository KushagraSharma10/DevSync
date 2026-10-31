import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // y-monaco deep-imports this path; Rolldown needs an explicit alias.
    alias: {
      'monaco-editor/esm/vs/editor/editor.api.js': path.resolve(
        rootDir,
        'node_modules/monaco-editor/esm/vs/editor/editor.api.js',
      ),
    },
  },
  optimizeDeps: {
    include: ['monaco-editor', 'y-monaco', 'yjs', 'y-protocols'],
  },
})
