const withPWA = require('next-pwa')({
  dest: 'public',
  disable: true, // Désactivé temporairement pour résoudre les conflits de service worker
  register: false,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  i18n: {
    locales: ['fr', 'en'],
    defaultLocale: 'fr',
  },
  images: {
    domains: ['localhost', 'line.l-ion.xyz', 'res.cloudinary.com'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true,
  },
  // Headers removed - we use proxy-stream API route to handle HTTP streams in HTTPS pages
  // The upgrade-insecure-requests CSP interferes with our proxy strategy
  async rewrites() {
    return [
      {
        source: '/api/ingest/:path*',
        destination: `${process.env.INGEST_SERVICE_URL || 'http://localhost:4000'}/:path*`,
      },
      {
        source: '/api/stream/:path*',
        destination: `${process.env.STREAM_GATEWAY_URL || 'http://localhost:4001'}/:path*`,
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
