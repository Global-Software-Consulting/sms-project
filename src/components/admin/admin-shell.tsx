'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { AdminSidebar } from './admin-sidebar';
import { AdminTopNav } from './admin-topnav';

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const { isAuthenticated, isInitialized, userRole } = useAuth();
  const isOwner = userRole === 'OWNER';
  const router = useRouter();
  const ready = isInitialized && isAuthenticated && isOwner;

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (!isOwner) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isOwner, isInitialized, router]);

  // CRITICAL: always render children. Previously this component returned a
  // <Spinner /> when ready was false, which unmounted children entirely.
  // Any Redux auth re-evaluation during a route transition (very common in
  // Next 16 App Router) would flip ready false → true → false, causing
  // children to unmount mid-navigation. The resulting RSC segment commit
  // collided with the unmount and Next held the previous segment in
  // children — symptom: URL updates (sidebar reflects new pathname) but
  // visible main content stays on the previous page until a second click.
  //
  // Now children are always mounted; the spinner is overlaid on top via
  // absolute positioning so the layout tree stays stable across transitions.
  return (
    <div className="min-h-screen bg-[#0F172A]">
      <AdminSidebar />
      <AdminTopNav />
      <main className="lg:ml-60 pt-16 min-h-screen">{children}</main>
      {!ready && (
        <div
          aria-busy="true"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F172A]"
        >
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#3B82F6]/30 border-t-[#3B82F6]" />
        </div>
      )}
    </div>
  );
}
