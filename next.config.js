/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Screenshots are sent as base64 JSON payloads to the API route, so the
  // route needs a body size limit large enough for a typical screenshot.
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

module.exports = nextConfig;
