'use client';
import { useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import { DashboardHeader } from '@/components/dashboard-header';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="relative flex h-screen overflow-x-clip">
      {/* Subtle background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="bg-primary/5 dark:bg-primary/8 absolute top-1/4 left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full blur-[120px]" />
      </div>

      {/* Sidebar — hidden on mobile via translate, visible on lg+ */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main content area */}
      <div className="relative z-10 flex w-0 min-w-0 flex-1 flex-col">
        <DashboardHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-auto p-3 pb-24 sm:p-4 sm:pb-24 md:p-6 md:pb-24 lg:p-8 lg:pb-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>

      {/* Mobile bottom navigation — only shown on mobile */}
      <MobileBottomNav />
    </div>
  );
}
