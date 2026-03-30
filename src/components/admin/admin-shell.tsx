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

  if (!isInitialized || !isAuthenticated || !isOwner) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#3B82F6]/30 border-t-[#3B82F6] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <AdminSidebar />
      <AdminTopNav />
      <main className="lg:ml-60 pt-16 min-h-screen">
        {children}
      </main>
    </div>
  );
}
