import { defineConfig } from 'vite';

export default defineConfig({
  base: '/yuwen-adventure/',
  root: '.',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
  },
  server: {
    open: true,
  },
});
