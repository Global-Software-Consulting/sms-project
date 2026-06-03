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
 * button) AND no other handler has called preventDefault, fall through
 * to router.push so the navigation always commits. If Link's own
 * onClick already prevented default, we do nothing.
 */
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
      // External / new-tab links: let the browser handle them.
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
      // Schedule a fallback navigation on the next microtask. If Next's
      // Link took the click, it will already have called router.push by
      // then and this is a no-op against the same href. If Link silently
      // dropped the click (the bug), this recovers the navigation.
      queueMicrotask(() => {
        if (window.location.href !== url.href) {
          router.push(url.pathname + url.search + url.hash);
        }
      });
    };
    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, [router]);

  return null;
}
