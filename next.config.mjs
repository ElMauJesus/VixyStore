// En GitHub Actions, GITHUB_ACTIONS='true' se define automáticamente.
// NEXT_PUBLIC_BASE_PATH='/VixyStore' se pasa explícitamente en el workflow.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  // basePath y assetPrefix deben ser string vacía o el path, nunca undefined.
  basePath: basePath,
  assetPrefix: basePath,
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  }
};

export default nextConfig;
