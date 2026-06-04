import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  // NOTE on the "first click changes URL but page doesn't load" bug
  // (prod-only, never reproduces in dev):
  //
  // We previously set `experimental.staleTimes: { dynamic: 0, static: 0 }`
  // hoping to force a fresh fetch on every click. In practice that
  // worked against us: in production, Next aggressively prefetches RSC
  // payloads when a <Link> enters the viewport. With staleTimes: 0,
  // the prefetched payload was treated as immediately stale, so on the
  // click Next discarded it and started a fresh fetch — URL bar moved,
  // but the new tree wasn't ready, and the route commit waited. Once
  // the upstream warmed up (10–20s of mount fetches finishing), the
  // refetch returned instantly and clicks worked first-try.
  //
  // The fix is to let Next use its default staleTimes so prefetched
  // payloads are honored. Removing the override entirely so we inherit
  // the framework default (dynamic: 0s, static: 5min as of Next 14+).
  // Local dev was always unaffected because dev mode doesn't prefetch
  // RSC payloads the same way.
};
export default nextConfig;
