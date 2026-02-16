'use client';

import { RouteGuard } from '@/components/auth/RouteGuard';

/**
 * Admin Layout - Wraps all admin routes with admin-only protection
 * Only users with SUPER_ADMIN role can access routes under /admin/*
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard requireAdmin redirectTo="/dashboard">
      {children}
    </RouteGuard>
  );
}

