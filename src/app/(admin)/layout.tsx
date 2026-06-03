import { AdminShell } from '@/components/admin/admin-shell';
import { NotificationProvider } from '@/contexts/NotificationContext';

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
