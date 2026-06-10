import { AdminShell } from '@/components/admin/admin-shell';
import { NotificationProvider } from '@/contexts/NotificationContext';

// Admin pages are auth-gated and depend on runtime state (Redux session,
// useSearchParams, etc). They should never be statically prerendered.
// Without this, `next build` tries to prerender every /admin/* route and
// fails on hooks like useSearchParams that require a Suspense boundary
// at static time. Previously this was hidden because AdminShell returned
// a Spinner at prerender time and the children never rendered.
export const dynamic = 'force-dynamic';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NotificationProvider>
      <AdminShell>{children}</AdminShell>
    </NotificationProvider>
  );
}
