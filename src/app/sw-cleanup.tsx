'use client';

import { useEffect } from 'react';

/**
 * Proactive service-worker + cache cleanup.
 *
 * Why this exists: when the production deployment was running an earlier
 * code base (or any third-party addon ever registered a service worker),
 * the user's browser keeps that SW alive forever. The SW intercepts
 * navigation requests at the network layer. Even after we ship a clean
 * build with no SW registration, returning users still have the old SW
 * active — and it can cache stale RSC payloads, serve wrong-route
 * content, or break App Router navigation in subtle ways.
 *
 * The "first click changes URL but page doesn't render" bug reproduced
 * in real user browsers but NOT in fresh incognito for exactly this
 * reason: incognito has no persistent SW; real browsers do.
 *
 * This component runs once on mount, finds any registered service
 * workers, and unregisters them. It also clears the Cache API. After
 * one visit, the user is permanently cleaned up.
 *
 * Mirrors IPTV (cheapstreamtv.com)'s sw-cleanup approach — same Contabo
 * + Cloudflare stack, same fix.
 */
export default function SwCleanup() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof window === 'undefined') return;

    (async () => {
      try {
        if ('serviceWorker' in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map((r) => r.unregister()));
        }
      } catch {
        // best effort — old SW staying registered is recoverable
      }

      try {
        if ('caches' in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        }
      } catch {
        // best effort
      }
    })();
  }, []);

  return null;
}
