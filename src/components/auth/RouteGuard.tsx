'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks';
import { UserRole, ROLE_HIERARCHY, ADMIN_ROLES } from '@/lib/api';

interface RouteGuardProps {
  children: React.ReactNode;
  /** 
   * If true, any admin role can access (VIEWER, SUPPORT, FINANCE, MANAGER, ADMIN, OWNER)
   * @deprecated Use requiredRole instead for more granular control
   */
  requireAdmin?: boolean;
  /**
   * Minimum role required to access this route
   * Uses role hierarchy: USER < VIEWER < SUPPORT < FINANCE < MANAGER < ADMIN < OWNER
   */
  requiredRole?: UserRole;
  /** Custom redirect path when unauthorized */
  redirectTo?: string;
}

/**
 * RouteGuard - Protects routes based on authentication and role
 * 
 * Supports 6 admin-level roles (per CLIENT_DECISIONS.md):
 * - OWNER: Full access including system settings
 * - ADMIN: Full access except system settings
 * - MANAGER: Manage users, orders, providers, SEO
 * - FINANCE: Full access to payments/wallets/refunds
 * - SUPPORT: Read + limited update on users/orders
 * - VIEWER: Read-only admin access
 * - USER: Regular user, no admin access
 * 
 * @example
 * // For authenticated users only
 * <RouteGuard>
 *   <DashboardPage />
 * </RouteGuard>
 * 
 * @example
 * // For any admin role
 * <RouteGuard requireAdmin>
 *   <AdminPage />
 * </RouteGuard>
 * 
 * @example
 * // For MANAGER or higher
 * <RouteGuard requiredRole="MANAGER">
 *   <ProviderManagementPage />
 * </RouteGuard>
 * 
 * @example
 * // For FINANCE or higher (payments access)
 * <RouteGuard requiredRole="FINANCE">
 *   <PaymentsPage />
 * </RouteGuard>
 */
export function RouteGuard({ 
  children, 
  requireAdmin = false,
  requiredRole,
  redirectTo = '/login'
}: RouteGuardProps) {
  const { isAuthenticated, isInitialized, isLoading, isAdmin, userRole } = useAuth();
  const router = useRouter();

  // Check if user has required role or higher
  const hasRequiredRole = (): boolean => {
    if (!userRole) return false;
    
    // If requiredRole is specified, check hierarchy
    if (requiredRole) {
      const userLevel = ROLE_HIERARCHY[userRole] ?? 0;
      const requiredLevel = ROLE_HIERARCHY[requiredRole] ?? 0;
      return userLevel >= requiredLevel;
    }
    
    // If only requireAdmin is set, check if user has any admin role
    if (requireAdmin) {
      return ADMIN_ROLES.includes(userRole);
    }
    
    // No role requirement, just need to be authenticated
    return true;
  };

  useEffect(() => {
    if (!isInitialized) return;

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // Check role requirements
    if ((requireAdmin || requiredRole) && !hasRequiredRole()) {
      router.push('/dashboard');
      return;
    }
  }, [isInitialized, isAuthenticated, userRole, requireAdmin, requiredRole, redirectTo, router]);

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

  // Check role requirements
  if ((requireAdmin || requiredRole) && !hasRequiredRole()) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-2">Access Denied</h1>
          <p className="text-text-muted">You don&apos;t have permission to access this page.</p>
          {requiredRole && (
            <p className="text-text-muted text-sm mt-2">
              Required role: {requiredRole} or higher
            </p>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default RouteGuard;

