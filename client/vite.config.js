import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const proxy = { '/api': process.env.API_PROXY_TARGET || 'http://127.0.0.1:5000' };
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.test.jsx'],
  },
  server: { proxy },
  preview: { proxy },
});
