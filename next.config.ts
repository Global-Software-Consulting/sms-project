import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },

  // NOTE on the original "first click changes URL but page doesnt load"
  // production bug:
  //
  // Earlier attempt: experimental.staleTimes: { dynamic: 0, static: 0 }
  //   - removed, made things worse
  // Earlier attempt: Cache-Control: private, no-store headers on /:path*
  //   - tanked mobile Lighthouse from 98 -> 71 because it disabled
  //     browser caching for HTML/RSC entirely. Reverted.
  //
  // Actual root cause (identified via live browser trace): the
  // production deployment was running `next dev` (Turbopack dev
  // server) instead of `next start` (production build). The on-demand
  // route compilation in dev mode was cancelling in-flight RSC
  // requests, presenting as "URL changes, page doesnt render".
  // Fix lives on the server side: run `next build` then `next start`
  // under PM2/systemd. No Next.js config change needed for that.
};

export default nextConfig;
