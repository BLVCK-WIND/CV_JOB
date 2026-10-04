import { defineConfig } from 'vite';

// Relative base so the built site works on any static host / sub-path.
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
