'use client';

import { RouteGuard } from '@/components/auth/RouteGuard';

/**
 * Dashboard Layout - Wraps all dashboard routes with authentication protection
 * Any authenticated user (USER or SUPER_ADMIN) can access routes under /dashboard/*
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard>
      {children}
    </RouteGuard>
  );
}

