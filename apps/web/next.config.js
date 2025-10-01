const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
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
    domains: ['localhost', 'line.l-ion.xyz'],
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
  },
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
