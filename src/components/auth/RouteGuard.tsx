'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks';

interface RouteGuardProps {
  children: React.ReactNode;
  /** If true, only SUPER_ADMIN can access this route */
  requireAdmin?: boolean;
  /** Custom redirect path when unauthorized */
  redirectTo?: string;
}

/**
 * RouteGuard - Protects routes based on authentication and role
 * 
 * Usage:
 * - Wrap any page/component that requires authentication
 * - Set requireAdmin={true} for admin-only routes
 * 
 * @example
 * // For authenticated users only
 * <RouteGuard>
 *   <DashboardPage />
 * </RouteGuard>
 * 
 * @example
 * // For admin only
 * <RouteGuard requireAdmin>
 *   <AdminPage />
 * </RouteGuard>
 */
export function RouteGuard({ 
  children, 
  requireAdmin = false,
  redirectTo = '/login'
}: RouteGuardProps) {
  const { isAuthenticated, isInitialized, isLoading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return;

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // Requires admin but user is not admin - redirect to dashboard
    if (requireAdmin && !isAdmin) {
      router.push('/dashboard');
      return;
    }
  }, [isInitialized, isAuthenticated, isAdmin, requireAdmin, redirectTo, router]);

  // Show loading state while checking auth
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full border-4 border-accent-gold border-t-transparent animate-spin" />
          <p className="text-text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Requires admin but user is not admin
  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-2">Access Denied</h1>
          <p className="text-text-muted">You don&apos;t have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default RouteGuard;

