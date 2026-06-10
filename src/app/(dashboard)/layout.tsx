import { DashboardShell } from '@/components/dashboard-shell';
import { NotificationProvider } from '@/contexts/NotificationContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NotificationProvider>
      <DashboardShell>{children}</DashboardShell>
    </NotificationProvider>
  );
}
