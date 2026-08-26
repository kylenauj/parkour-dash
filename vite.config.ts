import { defineConfig } from 'vite'

export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? './' : '/',
  server: {
    host: '0.0.0.0',
    port: 43173,
    strictPort: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 43173,
    strictPort: true,
  },
})
