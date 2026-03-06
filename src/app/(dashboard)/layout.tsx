'use client';

import { useState } from 'react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { Sidebar, DashboardHeader, MobileBottomNav } from '@/components/layout';
import { Toaster } from '@/components/ui/sonner';

/**
 * Dashboard Layout - Wraps all dashboard routes with authentication protection
 * Any authenticated user (USER or SUPER_ADMIN) can access routes under /dashboard/*
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <RouteGuard>
      <div className="min-h-screen flex relative overflow-x-hidden">
        {/* Subtle background glow */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 dark:bg-primary/8 rounded-full blur-[120px]" />
        </div>
        
        {/* Sidebar — hidden on mobile via translate, visible on lg+ */}
        <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />

        {/* Main content area */}
        <div className="flex-1 flex flex-col relative z-10 min-w-0 w-0">
          <DashboardHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
          <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-auto dashboard-content-bottom">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>

        {/* Mobile bottom navigation — only shown on mobile */}
        <MobileBottomNav />
        
        {/* Toast notifications */}
        <Toaster position="top-right" richColors />
      </div>
    </RouteGuard>
  );
}
