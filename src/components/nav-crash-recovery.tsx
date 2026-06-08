'use client';

import { useEffect } from 'react';

/**
 * Self-healing recovery for a React 19 client-navigation crash.
 *
 * Symptom: on the production deployment (far origin → slow/streamed RSC),
 * clicking an in-app link changes the URL but the page content stays on the
 * previous route until a second click. Headless reproduction against prod
 * showed the cause is an uncaught
 *   TypeError: Cannot read properties of null (reading 'removeChild')
 * thrown inside React DOM's commit-phase deletion walk
 * (commitDeletionEffects → unmountHoistable) while it tears down the
 * outgoing route. React 19's hoistable resource management races with the
 * navigation transition when the RSC payload arrives slowly, and the
 * aborted commit leaves the URL updated but the DOM on the old page.
 *
 * This is a known React 19 + App Router issue
 * (github.com/vercel/next.js/discussions/52625) with no framework-level fix
 * available. It is NOT caused by nginx, Cloudflare, HTTP/2, cache headers,
 * or third-party scripts — all were ruled out by triangulation. It is timing
 * dependent, which is why it never reproduces on localhost or Vercel (fast
 * origin) but does on the Contabo origin.
 *
 * Recovery strategy: a global `error` listener detects this specific
 * TypeError. Because the History API has already advanced the URL to the
 * target route, a single `location.reload()` re-renders that route cleanly
 * from scratch (a fresh load has no outgoing tree to delete, so it cannot
 * hit the race). Working navigations are untouched — they never throw, so
 * the listener never fires and the SPA stays fast.
 *
 * Loop guard: a freshly reloaded page has nothing to tear down and so will
 * not re-crash, but as a safety net we refuse to reload more than once per
 * RELOAD_GUARD_MS using a sessionStorage timestamp.
 */
const RELOAD_GUARD_MS = 5000;
const GUARD_KEY = 'nav-crash-recovery:last-reload';

function isNavCommitCrash(message: string): boolean {
  // React's commit-phase DOM teardown throws one of these with a null target.
  const m = message.toLowerCase();
  return (
    m.includes('null') &&
    (m.includes('removechild') || m.includes('insertbefore'))
  );
}

export function NavCrashRecovery() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      const message = event.error?.message ?? event.message ?? '';
      if (!isNavCommitCrash(message)) return;

      // Prevent a reload storm if something re-throws immediately.
      const now = Date.now();
      const last = Number(sessionStorage.getItem(GUARD_KEY) ?? '0');
      if (now - last < RELOAD_GUARD_MS) return;
      sessionStorage.setItem(GUARD_KEY, String(now));

      // The URL is already on the target route; reload renders it cleanly.
      event.preventDefault();
      window.location.reload();
    };

    window.addEventListener('error', onError);
    return () => window.removeEventListener('error', onError);
  }, []);

  return null;
}
