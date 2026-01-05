import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import react from '@vitejs/plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@dhristhi/form-builder': resolve(__dirname, '../../packages/form-builder/src'),
    },
  },
  optimizeDeps: {
    exclude: ['@dhristhi/form-builder'],
  },
  server: {
    port: 3000,
    open: true,
    fs: {
      allow: [resolve(__dirname, '../..'), resolve(__dirname, '../../packages/form-builder')],
    },
  },
});
