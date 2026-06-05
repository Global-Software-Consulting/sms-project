import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },

  // Produce a self-contained server build at .next/standalone/ so we can
  // run via a custom server.js instead of `next start`. Mirrors IPTV
  // (cheapstreamtv.com)'s deployment — same Contabo + nginx + Cloudflare
  // stack, working production. Matching their runtime model is the last
  // remaining variable in the navigation-bug investigation.
  output: 'standalone',

  // ----------------------------------------------------------------------
  // THE actual fix for the "click changes URL but page doesn't render"
  // production-only bug on Contabo + Cloudflare.
  //
  // Identified by cross-reference with the IPTV (cheapstreamtv.com)
  // project — same Contabo + nginx + Cloudflare stack, same bug, same
  // fix. Their next.config.mjs comment reads verbatim:
  //
  //   "Prevent nginx/CDN proxy caches from caching page HTML and RSC
  //   payloads. Stale cached pages are the root cause of 'clicking
  //   login shows cart page until hard reload' — the proxy serves a
  //   cached response for a different route. Private + no-store fixes
  //   this while still allowing static assets (overridden below) to
  //   be cached."
  //
  // Trade-off: mobile Lighthouse will drop from 98 to ~71 because
  // every HTML/RSC navigation now goes back to origin. Accept it.
  // Correctness > Speed Index. The static asset overrides below
  // keep the perf cost manageable.
  // ----------------------------------------------------------------------
  async headers() {
    return [
      // Default for every path: no caching by browsers, nginx, or
      // Cloudflare. Static assets are overridden below.
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-store, no-cache, must-revalidate',
          },
          // Security headers piggyback here so they ship on every
          // response too.
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      // Static asset overrides — these are content-hashed by Next or
      // immutable by their nature, safe to cache forever.
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
