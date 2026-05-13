import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['@react-pdf/renderer'],
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['192.168.1.153'],
}

export default nextConfig
