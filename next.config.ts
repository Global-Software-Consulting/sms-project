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
  // second click. dynamic:0 already forced fresh fetches on dynamic
  // segments; static:0 widens that to pages Next classifies as
  // static so the second-click symptom doesn't slip through there.
  // Trade-off is one extra small RSC fetch per nav — worth it.
  // Local dev is unaffected (cache already disabled in dev).
  experimental: {
    staleTimes: {
      dynamic: 0,
      static: 0,
    },
  },
};
export default nextConfig;
