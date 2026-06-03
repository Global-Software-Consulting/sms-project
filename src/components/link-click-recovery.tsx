'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Workaround for a long-standing Next.js App Router quirk where the
 * first click on a <Link> after the page has been idle (or on routes
 * with metadata) is silently dropped — URL doesn't change, navigation
 * never fires, second click works.
 *
 * See: vercel/next.js#43972, vercel/next.js#57565
 *
 * Strategy: intercept the bubble phase. By bubble time, any inline
 * onClick / Link logic has already had its chance. We then take over
 * for plain in-app left-clicks by preventing the default and routing
 * through router.push directly. This bypasses Next's internal Link
 * click handler entirely, so the navigation always commits on the
 * first click.
 *
 * Cmd/Ctrl/Shift/Alt + click, middle-button, target=_blank, cross-
 * origin, hash-only same-page, and preventDefault'd clicks are all
 * left alone.
 */
export function LinkClickRecovery() {
  const router = useRouter();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
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
      // Skip plain <a> that opted out of SPA routing.
      if (a.hasAttribute('download')) return;
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
      // Take over the click. If Link's own handler ran first it called
      // router.push(url); calling it again here is idempotent because
      // Next dedupes pushes to the current pending href. If Link
      // silently dropped the click (the bug), this one commits.
      e.preventDefault();
      router.push(url.pathname + url.search + url.hash);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [router]);

  return null;
}
