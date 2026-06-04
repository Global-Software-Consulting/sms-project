import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },

  // ----------------------------------------------------------------------
  // The real fix for "first click changes URL but page doesn't render"
  // (production-only, Contabo VPS behind nginx).
  //
  // The Iptv project (also on Contabo + nginx) hit the same class of bug —
  // "clicking login shows cart page until hard reload" — and traced it to
  // nginx/proxy caching of HTML and RSC payloads. The proxy was serving a
  // stale cached response for a different route. Our previous workarounds
  // (220ms inline-head fallback, LinkClickRecovery, staleTimes:0) all
  // targeted the symptom; this fix targets the cause.
  //
  // private + no-store + no-cache + must-revalidate stops the nginx layer
  // from holding onto page HTML and RSC payloads at all. Static assets
  // (/_next/static, fonts, icons) are overridden with long immutable cache
  // below so we don't pay any CDN-cache cost on assets that legitimately
  // never change.
  // ----------------------------------------------------------------------
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-store, no-cache, must-revalidate',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/icons/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
