import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  // Production-only navigation fix: Next.js caches prefetched RSC
  // payloads. On live, the cached payload was hijacking the first
  // click — URL updated but no network request fired and the
  // transition never committed, so the page only loaded on the
  // second click. dynamic:0 forces a fresh fetch on every navigation;
  // static:180 keeps a short cache for layouts that rarely change.
  // Local dev is unaffected (cache already disabled).
  experimental: {
    staleTimes: {
      dynamic: 0,
      static: 180,
    },
  },
};
export default nextConfig;
