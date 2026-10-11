import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: [],
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'frontend/src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/tests/**', '**/*.e2e.ts'],
  },
});
