import type { NextConfig } from 'next';
import path from 'node:path';

const fullPath = `${path.join(process.cwd(), 'src/styles/_mantine').replace(/\\/g, '/')}`;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  sassOptions: {
    prependData: `@import "./src/styles/_mantine.scss";`,
  },
  images: {
    remotePatterns: [
      // Local development
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      // Media domain
      {
        protocol: 'https',
        hostname: 'media.letsfindmy.com',
        port: '',
        pathname: '/**',
      },
    ],
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
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true, // TODO: Remove this line
  },
};

export default nextConfig;
