import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
  server: { https: true },
  plugins: [mkcert(), react()],
  resolve: {
    alias: [{ find: /^~/, replacement: '/src' }],
  },
})
