'use client';

import { useEffect } from 'react';

/**
 * Route-level error boundary. Next.js App Router uses this whenever a
 * child segment throws during render or in a useEffect that escapes a
 * lower boundary. Without this file, such errors silently abort the
 * route transition — which is one of the suspect mechanisms behind the
 * "first click changes URL but page doesn't load" symptom. Surfacing
 * the error here gives the user a recovery affordance AND gives us a
 * console trace to debug from.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('[app/error.tsx]', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h2 className="mb-2 text-xl font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground mb-6 max-w-md text-sm">
        The page hit an unexpected error. You can try again, or refresh the
        page if the problem keeps happening.
      </p>
      <div className="flex gap-2">
        <button
          onClick={reset}
          className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium"
        >
          Try again
        </button>
        <button
          onClick={() => {
            if (typeof window !== 'undefined') window.location.reload();
          }}
          className="border-border rounded-lg border px-4 py-2 text-sm font-medium"
        >
          Refresh page
        </button>
      </div>
      {error.digest && (
        <p className="text-muted-foreground mt-6 text-xs">
          Error ID: {error.digest}
        </p>
      )}
    </div>
  );
}
