import { defineConfig, mergeConfig } from 'vitest/config';
import { createConfig } from '@repo/testing/vite.config';

export default mergeConfig(
  createConfig(),
  defineConfig({
    // Add any app-specific configuration here
    test: {
      // Extend the setup files to include both the package's setup and your app's setup
      setupFiles: ['@repo/testing/src/setup.ts', './src/test-setup.ts'],
      // Include your app's test files
      include: ['./src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    },
    // Add any other app-specific Vite configuration
  }),
);
