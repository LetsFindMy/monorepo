// @repo/testing/vite.config.ts
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

// import { defineConfig } from "vitest/config"
// import react from "@vitejs/plugin-react"
// import path from "path"

// export default defineConfig({
//   plugins: [react()],
//   test: {
//     environment: "jsdom",
//     globals: true,
//     css: true,
//     setupFiles: ["./src/setup.ts"],
//     include: ["../**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
//     exclude: ["**/node_modules/**", "**/dist/**"],
//   },
//   resolve: {
//     alias: {
//       "@repo/testing": path.resolve(__dirname, "./src"),
//     },
//   },
// })
