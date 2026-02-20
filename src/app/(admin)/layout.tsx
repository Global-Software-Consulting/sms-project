'use client';

import { RouteGuard } from '@/components/auth/RouteGuard';

/**
 * Admin Layout - Wraps all admin routes with admin-only protection
 * 
 * Supports 6 admin-level roles (per CLIENT_DECISIONS.md):
 * - OWNER: Full access including system settings
 * - ADMIN: Full access except system settings
 * - MANAGER: Manage users, orders, providers, SEO
 * - FINANCE: Full access to payments/wallets/refunds
 * - SUPPORT: Read + limited update on users/orders
 * - VIEWER: Read-only admin access
 * 
 * All admin roles can access the admin panel.
 * Individual pages may have additional role requirements.
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

