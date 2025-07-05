/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'net': false,
        'tls': false,
        'dns': false,
        'fs': false,
        'path': false,
        'os': false,
        'crypto': false,
        'stream': false,
        'http': false,
        'https': false,
        'zlib': false
      };
    }
    
    return config;
  },
}

export default nextConfig
