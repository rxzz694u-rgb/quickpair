import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        faq: path.resolve(__dirname, 'faq/index.html'),
        privacy: path.resolve(__dirname, 'privacy/index.html'),
        terms: path.resolve(__dirname, 'terms/index.html'),
        howItWorks: path.resolve(__dirname, 'how-it-works/index.html'),
        contact: path.resolve(__dirname, 'contact/index.html'),
      },
    },
  },
});
