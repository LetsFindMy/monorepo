import type { NextConfig } from 'next';

import path from 'node:path';

const fullPath = `${path.join(process.cwd(), 'src/styles/_mantine').replace(/\\/g, '/')}`;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // sassOptions: {
  //   prependData: `@import "./src/styles/_mantine.scss";`,
  // },
  sassOptions: {
    prependData: `@import "./src/styles/_mantine.scss";`,
  },
  images: {
    domains: ['localhost:3000'],
  },
  experimental: {
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
    turbo: {
      resolveAlias: {
        // Add any module resolutions here
      },
      // You can add more Turbopack-specific configurations here
    },
  },
  // Consider removing this in production to enable ESLint checks during build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
