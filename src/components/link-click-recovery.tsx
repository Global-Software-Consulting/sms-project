'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Workaround for a long-standing Next.js App Router quirk where the
 * first click on a <Link> after the page has been idle (or after a
 * route with metadata) is silently dropped — the URL doesn't change,
 * the navigation doesn't fire, and only the second click works.
 *
 * See: vercel/next.js#43972, vercel/next.js#57565
 *
 * Listen for anchor-element clicks in the capture phase. If the click
 * targets an in-app path (same-origin, no modifier keys, default mouse
 * button) AND Link hasn't already pushed to this href, fall through to
 * router.push so the navigation always commits.
 *
 * IMPORTANT: window.location.href does NOT update synchronously when
 * Link calls router.push — pushState is asynchronous. A naive check
 * "if (location.href !== url.href)" inside a queueMicrotask therefore
 * fires AGAIN for the same href and double-pushes, which Next reads as
 * "navigate to /pricing, then immediately navigate to /pricing again",
 * cancelling the in-flight RSC fetch from the first push. The cancel
 * is the actual cause of the "first click doesn't render" symptom on
 * slow networks (e.g. Contabo prod ~300ms RSC roundtrips).
 *
 * Fix: keep an in-flight set keyed by href. Skip the recovery push if
 * we've already seen the same href in the last second.
 */

const recentHrefs = new Set<string>();

export function LinkClickRecovery() {
  const router = useRouter();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      // Only main-button clicks without modifiers (let Cmd/Ctrl+click etc
      // through to the browser as normal new-tab behavior).
      if (
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey ||
        e.defaultPrevented
      ) {
        return;
      }
      const a = (e.target as Element | null)?.closest('a');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#')) return;
      const target = a.getAttribute('target');
      if (target && target !== '_self') return;
      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      // Same-page anchor change — let the browser scroll.
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search &&
        url.hash
      ) {
        return;
      }
      const dest = url.pathname + url.search + url.hash;
      // If we already saw a click for this destination very recently,
      // assume Link's onClick or this recovery already pushed and don't
      // race a second push that would cancel the first navigation.
      if (recentHrefs.has(dest)) return;
      recentHrefs.add(dest);
      setTimeout(() => recentHrefs.delete(dest), 1000);

      // Microtask check: if Link took the click, router state will
      // change before this fires. We don't push again. If Link silently
      // dropped the click, location.pathname stays equal to the source
      // page AND no router state change is observable — push to recover.
      const fromPath = window.location.pathname;
      const fromSearch = window.location.search;
      queueMicrotask(() => {
        const moved =
          window.location.pathname !== fromPath ||
          window.location.search !== fromSearch;
        if (moved) return;
        // Compare against the actual destination, not the prior URL —
        // pushState may be async on some browsers.
        if (window.location.pathname === url.pathname && window.location.search === url.search) {
          return;
        }
        router.push(dest);
      });
    };
    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, [router]);

  return null;
}
