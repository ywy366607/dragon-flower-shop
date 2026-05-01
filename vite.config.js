import { defineConfig } from 'vite'

export default defineConfig({
  base: '/dragon-flower-shop/',
  root: '.',
  publicDir: false,
  build: {
    outDir: 'dist'
  }
})
