import { Suspense } from 'react';
import { AdminShell } from '@/components/admin/admin-shell';
import { NotificationProvider } from '@/contexts/NotificationContext';

/**
 * Admin layout is a Server Component shell. Previously this file
 * declared `export const dynamic = 'force-dynamic'` to opt the
 * entire /admin/* tree out of static prerendering, because pages
 * deep inside the tree call `useSearchParams()` without a Suspense
 * boundary and that throws during `next build` prerender.
 *
 * That approach forced every admin navigation to recompute the
 * layout RSC payload on the origin, which compounded the slow-nav
 * problem the user was hitting. By wrapping {children} in
 * <Suspense> here, the layout itself becomes prerenderable (and its
 * RSC payload cacheable at nginx), while pages that use
 * useSearchParams stay deferred behind the boundary and resolve at
 * request time as before — no breakage, but the shell is no longer
 * a per-nav bottleneck.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NotificationProvider>
      <AdminShell>
        <Suspense fallback={null}>{children}</Suspense>
      </AdminShell>
    </NotificationProvider>
  );
}
