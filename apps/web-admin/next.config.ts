import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@health/design-system'],
  reactStrictMode: true,
  output: 'standalone',
};

export default nextConfig;
