import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves the app under /ComposeUsageAudit/
  base: '/ComposeUsageAudit/',
  // When running dev, proxy data files from the parent directory
  server: {
    proxy: {
      '/reports': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  // For GitHub Pages: build output goes to ../docs so it's deployable
  build: {
    outDir: '../docs',
    emptyOutDir: false,
  },
});
