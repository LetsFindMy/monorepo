import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import userEvent from '@testing-library/user-event';

export * from '@testing-library/react';
export { render } from './render';
export { userEvent };

const config = defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './'),
      '@repo': path.resolve(import.meta.dirname, '../../packages'),
    },
  },
});

export default config;
