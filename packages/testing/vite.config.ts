import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export const createConfig = () =>
  defineConfig({
    plugins: [react()],
    test: {
      globals: true,
      environment: 'jsdom',
      css: true,
      setupFiles: './src/setup.ts',
    },
    build: {
      target: 'es2020',
    },
  });

export default createConfig();
