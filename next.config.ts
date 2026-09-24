import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow images from YouTube's CDN domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'yt3.ggpht.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'yt3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/**',
      },
    ],
  },

  // Turbopack root — fixes "ignored package-lock.json" warning when project is
  // inside a OneDrive / user home directory on Windows
  turbopack: {
    root: __dirname,
  },

  // Ensure server-side modules (pg, googleapis) aren't bundled for the client
  serverExternalPackages: ['pg', 'googleapis', 'drizzle-orm'],

  // TypeScript strict mode (errors fail the build)
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
