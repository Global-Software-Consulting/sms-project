'use client';

import { useEffect } from 'react';

/**
 * Forces full-page (MPA-style) navigation for every internal link, bypassing
 * Next.js client-side RSC routing entirely.
 *
 * Why: the production "click changes URL but page doesn't render until a
 * second click" bug is an uncaught crash in React's commit-phase DOM
 * teardown during *client-side* navigation (commitDeletionEffects ->
 * unmountHoistable), triggered when the RSC payload streams in slowly on the
 * far Contabo origin. It never reproduces on localhost/Vercel (fast origin).
 * Soft navigation is the only code path that hits the race; a full page load
 * server-renders a fresh page with no outgoing React tree to tear down, so
 * the crash is structurally impossible.
 *
 * This interceptor runs in the capture phase, so it pre-empts Next.js's own
 * <Link> click handler: it calls preventDefault() and navigates via
 * window.location, which Next then skips (defaultPrevented). No need to touch
 * the ~126 <Link> usages individually, and it is trivial to remove if a
 * future Next/React version fixes the underlying race.
 *
 * Trade-off: navigations are full reloads (browser's native loading state +
 * a brief paint) rather than instant SPA transitions. Accepted in exchange
 * for 100% reliable navigation. SEO is unaffected (pages still SSR). The
 * NavCrashRecovery safety net stays in place for any programmatic
 * router.push() that this anchor-based interceptor does not cover.
 */
export function ForceFullNavigation() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      // Honour new-tab / middle-click / modified clicks and prior handlers.
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      // Skip links explicitly opened elsewhere or downloads.
      const linkTarget = anchor.getAttribute('target');
      if (
        (linkTarget && linkTarget !== '_self') ||
        anchor.hasAttribute('download')
      ) {
        return;
      }

      // Resolve against the current location; only handle same-origin links.
      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;

      // Let non-http schemes (mailto:, tel:, etc.) behave normally.
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

      // In-page anchor (same path, only hash differs) — leave to the browser.
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search &&
        url.hash
      ) {
        return;
      }

      // Force a full server-rendered page load.
      event.preventDefault();
      window.location.assign(url.href);
    };

    // Capture phase so we run before Next.js's Link handler.
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  return null;
}
