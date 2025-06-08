import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com'
      },
      {
        protocol: 'https',
        hostname: 'imgur.com'
      },
      {
        protocol: 'https',
        hostname: 'drive.google.com'
      }
    ],
  },
};

export default nextConfig;
