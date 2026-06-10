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
  // Fix for the "click changes URL but page doesn't render until second
  // click" production-only bug on Contabo + nginx + Cloudflare.
  //
  // Root cause (confirmed by triangulation 2026-06):
  //   - Server localhost responds in ~8ms; the app itself is fast.
  //   - The Contabo origin sits in Germany; visitors are far away, so each
  //     fresh HTML/RSC fetch crosses a slow link (TTFB 1-2s, body slower).
  //   - We previously sent `no-store` on EVERY path, including RSC prefetch
  //     payloads. `no-store` makes the Next.js App Router refuse to cache
  //     prefetched route shells. Without a prefetched shell the router must
  //     fetch the RSC payload *before* it can render anything — even the
  //     route's loading.tsx boundary. On a slow far origin that means the
  //     URL changes (history is pushed optimistically) but the UI stays
  //     frozen until the cross-continent fetch returns, looking like
  //     "first click does nothing, second click works".
  //   - It only reproduced on Contabo (not Vercel) because Vercel's edge
  //     serves prefetches instantly, hiding the disabled-prefetch cost.
  //
  // The original reason for `no-store` (a proxy serving a cached response
  // for the wrong route) does NOT apply here: the live Cloudflare zone has
  // no Page Rules, no Cache Rules, cache level Standard, and returns
  // `cf-cache-status: DYNAMIC`; nginx runs with `proxy_cache off`. Nothing
  // caches HTML/RSC at the proxy layer, so `no-store` bought nothing while
  // actively breaking client-side prefetch.
  //
  // Fix: send `private` instead of `private, no-store, no-cache,
  // must-revalidate`. `private` still forbids shared caches (Cloudflare,
  // nginx) from storing the response — preserving the wrong-route
  // protection — but lets the browser / Next.js router populate its
  // per-URL prefetch cache, restoring instant first-click navigation.
  // Static assets keep their long-lived immutable caching (overridden
  // below).
  // ----------------------------------------------------------------------
  async headers() {
    return [
      // Default for every path: allow only private (browser / router)
      // caching, never shared proxy caching. Static assets overridden
      // below.
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private',
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
