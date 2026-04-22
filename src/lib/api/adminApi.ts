import { apiClient } from '@/config/api-client.config';
import { UserRole, UserStatus } from './authApi';
import { API_ENDPOINTS } from '@/config/server.config';

// ============================================
// Admin User Types
// ============================================

/**
 * Admin view of a user
 */
export interface AdminUser {
  id: string;
  email: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  country: string | null;
  avatar: string | null;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  abuseScore: number;
  orderLimit: number | null;
  lastLoginAt: string | null;
  loginCount: number;
  rank?: {
    id: string;
    name: string;
    badge: string;
    color: string;
    discountPercent: number;
  } | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Detailed admin user view (includes wallet, subscriptions, etc.)
 */
export interface AdminUserDetail extends AdminUser {
  wallet?: {
    id: string;
    balance: string;
    currency: string;
    isLocked: boolean;
  };
  subscription?: {
    id: string;
    planName: string;
    status: string;
    endDate: string;
  };
  apiKeysCount: number;
  ordersCount: number;
  totalSpent: string;
}

/**
 * User statistics for admin dashboard
 * Updated to support 6 admin roles (per CLIENT_DECISIONS.md)
 */
export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
  suspendedUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  usersByRole: {
    USER: number;
    VIEWER: number;
    SUPPORT: number;
    FINANCE: number;
    MANAGER: number;
    ADMIN: number;
    OWNER: number;
  };
}

/**
 * Paginated users response
 */
export interface AdminUsersResponse {
  data: AdminUser[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// ============================================
// Request DTOs
// ============================================

export interface AdminUserQueryParams {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  sortBy?:
    | 'createdAt'
    | 'updatedAt'
    | 'email'
    | 'name'
    | 'lastLoginAt'
    | 'abuseScore';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface AdminUpdateUserRequest {
  firstName?: string;
  lastName?: string;
  country?: string;
  phone?: string;
  avatar?: string;
}

export interface ChangeRoleRequest {
  role: UserRole;
}

export interface SetLimitsRequest {
  orderLimit?: number;
}

export interface SetAbuseScoreRequest {
  abuseScore: number;
  reason?: string;
}

export interface BanUserRequest {
  reason: string;
}

export interface SuspendUserRequest {
  reason: string;
  duration?: number; // Days
}

// ============================================
// Admin User API Functions
// ============================================

/**
 * Get all users (paginated)
 * GET /api/v1/admin/users
 */
export const getAdminUsers = async (
  params?: AdminUserQueryParams,
): Promise<AdminUsersResponse> => {
  const response = await apiClient.get<AdminUsersResponse>(
    API_ENDPOINTS.ADMIN.USERS.ROOT,
    { params },
  );
  return response.data;
};

export interface UserCountryCount {
  country: string;
  count: number;
}

/**
 * Get list of distinct countries that users belong to, with user counts
 * GET /api/v1/admin/users/countries
 */
export const getAdminUserCountries = async (): Promise<UserCountryCount[]> => {
  const response = await apiClient.get<UserCountryCount[]>(
    API_ENDPOINTS.ADMIN.USERS.COUNTRIES,
  );
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Get user statistics
 * GET /api/v1/admin/users/statistics
 */
export const getUserStatistics = async (): Promise<UserStatistics> => {
  const response = await apiClient.get<UserStatistics>(
    API_ENDPOINTS.ADMIN.USERS.STATISTICS,
  );
  return response.data;
};

/**
 * Get single user details
 * GET /api/v1/admin/users/:id
 */
export const getAdminUser = async (id: string): Promise<AdminUserDetail> => {
  const response = await apiClient.get<AdminUserDetail>(
    API_ENDPOINTS.ADMIN.USERS.DETAIL(id),
  );
  return response.data;
};

/**
 * Update user
 * PATCH /api/v1/admin/users/:id
 */
export const updateAdminUser = async (
  id: string,
  data: AdminUpdateUserRequest,
): Promise<AdminUser> => {
  const response = await apiClient.patch<AdminUser>(
    API_ENDPOINTS.ADMIN.USERS.DETAIL(id),
    data,
  );
  return response.data;
};

/**
 * Delete user (soft delete)
 * DELETE /api/v1/admin/users/:id
 */
export const deleteAdminUser = async (
  id: string,
): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(
    API_ENDPOINTS.ADMIN.USERS.DETAIL(id),
  );
  return response.data;
};

/**
 * Ban user
 * POST /api/v1/admin/users/:id/ban
 */
export const banUser = async (
  id: string,
  data: BanUserRequest,
): Promise<AdminUser> => {
  const response = await apiClient.post<AdminUser>(
    API_ENDPOINTS.ADMIN.USERS.BAN(id),
    data,
  );
  return response.data;
};

/**
 * Unban user
 * POST /api/v1/admin/users/:id/unban
 */
export const unbanUser = async (id: string): Promise<AdminUser> => {
  const response = await apiClient.post<AdminUser>(
    API_ENDPOINTS.ADMIN.USERS.UNBAN(id),
  );
  return response.data;
};

/**
 * Suspend user
 * POST /api/v1/admin/users/:id/suspend
 */
export const suspendUser = async (
  id: string,
  data: SuspendUserRequest,
): Promise<AdminUser> => {
  const response = await apiClient.post<AdminUser>(
    API_ENDPOINTS.ADMIN.USERS.SUSPEND(id),
    data,
  );
  return response.data;
};

/**
 * Activate user
 * POST /api/v1/admin/users/:id/activate
 */
export const activateUser = async (id: string): Promise<AdminUser> => {
  const response = await apiClient.post<AdminUser>(
    API_ENDPOINTS.ADMIN.USERS.ACTIVATE(id),
  );
  return response.data;
};

/**
 * Change user role
 * PATCH /api/v1/admin/users/:id/role
 */
export const changeUserRole = async (
  id: string,
  data: ChangeRoleRequest,
): Promise<AdminUser> => {
  const response = await apiClient.patch<AdminUser>(
    API_ENDPOINTS.ADMIN.USERS.ROLE(id),
    data,
  );
  return response.data;
};

/**
 * Set user limits
 * PATCH /api/v1/admin/users/:id/limits
 */
export const setUserLimits = async (
  id: string,
  data: SetLimitsRequest,
): Promise<AdminUser> => {
  const response = await apiClient.patch<AdminUser>(
    API_ENDPOINTS.ADMIN.USERS.LIMITS(id),
    data,
  );
  return response.data;
};

/**
 * Set user abuse score
 * PATCH /api/v1/admin/users/:id/abuse-score
 */
export const setUserAbuseScore = async (
  id: string,
  data: SetAbuseScoreRequest,
): Promise<AdminUser> => {
  const response = await apiClient.patch<AdminUser>(
    API_ENDPOINTS.ADMIN.USERS.ABUSE_SCORE(id),
    data,
  );
  return response.data;
};

// ============================================
// Helper Functions
// ============================================

/**
 * Get status badge color
 */
export const getUserStatusColor = (
  status: UserStatus,
): { bg: string; text: string } => {
  const colors: Record<UserStatus, { bg: string; text: string }> = {
    ACTIVE: { bg: 'rgba(34, 197, 94, 0.1)', text: 'var(--success)' },
    INACTIVE: { bg: 'rgba(107, 114, 128, 0.1)', text: 'var(--text-muted)' },
    BANNED: { bg: 'rgba(239, 68, 68, 0.1)', text: 'var(--danger)' },
    SUSPENDED: { bg: 'rgba(245, 158, 11, 0.1)', text: 'var(--warning)' },
    PENDING: { bg: 'rgba(59, 130, 246, 0.1)', text: 'var(--info)' },
  };
  return colors[status] || colors.INACTIVE;
};

/**
 * Get role badge color
 * All 7 roles: USER, VIEWER, SUPPORT, FINANCE, MANAGER, ADMIN, OWNER
 */
export const getUserRoleColor = (
  role: UserRole,
): { bg: string; text: string } => {
  const colors: Record<UserRole, { bg: string; text: string }> = {
    USER: { bg: 'rgba(107, 114, 128, 0.1)', text: 'var(--text-secondary)' },
    VIEWER: { bg: 'rgba(156, 163, 175, 0.15)', text: '#9CA3AF' },
    SUPPORT: { bg: 'rgba(59, 130, 246, 0.15)', text: '#3B82F6' },
    FINANCE: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981' },
    MANAGER: { bg: 'rgba(139, 92, 246, 0.15)', text: '#8B5CF6' },
    ADMIN: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B' },
    OWNER: { bg: 'rgba(198, 167, 94, 0.2)', text: 'var(--accent-gold)' },
  };
  return colors[role] || colors.USER;
};

/**
 * Format user display name
 */
export const formatUserName = (user: AdminUser): string => {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  if (user.firstName) return user.firstName;
  if (user.username) return user.username;
  return user.email.split('@')[0];
};

/**
 * Get user initials
 */
export const getUserInitials = (user: AdminUser): string => {
  if (user.firstName && user.lastName) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }
  if (user.firstName) return user.firstName[0].toUpperCase();
  return user.email[0].toUpperCase();
};

/**
 * Format last login
 */
export const formatLastLogin = (lastLoginAt: string | null): string => {
  if (!lastLoginAt) return 'Never';

  const date = new Date(lastLoginAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
};

// ============================================
// Admin Wallet Types
// ============================================

export interface AdminWallet {
  id: string;
  userId: string;
  balance: string;
  currency: string;
  isLocked: boolean;
  lockedReason: string | null;
  lockedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}

export interface AdminWalletDetail extends AdminWallet {
  totalDeposited: string;
  totalSpent: string;
  totalRefunded: string;
  totalBonus: string;
  transactionCount: number;
}

export interface WalletStatistics {
  totalWallets: number;
  totalBalance: string;
  lockedWallets: number;
  totalDeposited: string;
  totalSpent: string;
  avgBalance: string;
}

export interface AdminWalletsResponse {
  data: AdminWallet[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface AdminWalletQueryParams {
  search?: string;
  isLocked?: boolean;
  minBalance?: number;
  page?: number;
  limit?: number;
}

export interface AdminCreditRequest {
  amount: number;
  description: string;
  metadata?: Record<string, unknown>;
}

export interface AdminDebitRequest {
  amount: number;
  description: string;
  metadata?: Record<string, unknown>;
}

export interface AdminAdjustRequest {
  amount: number; // Can be positive or negative
  description: string;
  metadata?: Record<string, unknown>;
}

export interface AdminLockWalletRequest {
  reason: string;
}

// ============================================
// Admin Wallet API Functions
// ============================================

/**
 * Get all wallets (paginated)
 */
export const getAdminWallets = async (
  params?: AdminWalletQueryParams,
): Promise<AdminWalletsResponse> => {
  const response = await apiClient.get<AdminWalletsResponse>(
    API_ENDPOINTS.ADMIN.WALLETS.ROOT,
    { params },
  );
  return response.data;
};

/**
 * Get wallet statistics
 */
export const getWalletStatistics = async (): Promise<WalletStatistics> => {
  const response = await apiClient.get<WalletStatistics>(
    API_ENDPOINTS.ADMIN.WALLETS.STATISTICS,
  );
  return response.data;
};

/**
 * Get user's wallet details
 */
export const getAdminWallet = async (
  userId: string,
): Promise<AdminWalletDetail> => {
  const response = await apiClient.get<AdminWalletDetail>(
    API_ENDPOINTS.ADMIN.WALLETS.DETAIL(userId),
  );
  return response.data;
};

/**
 * Credit wallet (add bonus)
 */
export const creditWallet = async (
  userId: string,
  data: AdminCreditRequest,
): Promise<{ message: string; newBalance: string; transactionId: string }> => {
  const response = await apiClient.post(
    API_ENDPOINTS.ADMIN.WALLETS.CREDIT(userId),
    data,
  );
  return response.data;
};

/**
 * Debit wallet (remove funds)
 */
export const debitWallet = async (
  userId: string,
  data: AdminDebitRequest,
): Promise<{ message: string; newBalance: string; transactionId: string }> => {
  const response = await apiClient.post(
    API_ENDPOINTS.ADMIN.WALLETS.DEBIT(userId),
    data,
  );
  return response.data;
};

/**
 * Adjust wallet (positive or negative)
 */
export const adjustWallet = async (
  userId: string,
  data: AdminAdjustRequest,
): Promise<{ message: string; newBalance: string; transactionId: string }> => {
  const response = await apiClient.post(
    API_ENDPOINTS.ADMIN.WALLETS.ADJUST(userId),
    data,
  );
  return response.data;
};

/**
 * Lock wallet
 */
export const lockWallet = async (
  userId: string,
  data: AdminLockWalletRequest,
): Promise<{ message: string }> => {
  const response = await apiClient.post(
    API_ENDPOINTS.ADMIN.WALLETS.LOCK(userId),
    data,
  );
  return response.data;
};

/**
 * Unlock wallet
 */
export const unlockWallet = async (
  userId: string,
): Promise<{ message: string }> => {
  const response = await apiClient.post(
    API_ENDPOINTS.ADMIN.WALLETS.UNLOCK(userId),
  );
  return response.data;
};

// ============================================
// Admin Analytics Types
// ============================================

export interface DashboardMetric {
  label: string;
  value: string;
  changePercent: number | null;
  trend: 'up' | 'down' | null;
}

export interface DashboardOverview {
  totalUsers: DashboardMetric;
  activeActivations: DashboardMetric;
  totalRevenue: DashboardMetric;
  pendingActivations: DashboardMetric;
  failedActivations: DashboardMetric;
  totalCountries: DashboardMetric;
  totalServices: DashboardMetric;
  successRate: DashboardMetric;
}

export interface RevenueChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
  }[];
  period: string;
  total: string;
}

export interface UserGrowthChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
  }[];
  period: string;
  totalGrowth: number;
}

export interface PaymentBreakdown {
  gateway: string;
  count: number;
  total: string;
  percentage: number;
}

export interface MembershipBreakdown {
  plan: string;
  count: number;
  revenue: string;
  percentage: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown>;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user?: {
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}

export interface SystemLog {
  id: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  context: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface ChartQueryParams {
  period?: '7d' | '30d' | '90d' | '1y';
  startDate?: string;
  endDate?: string;
}

export interface TopCountry {
  name: string;
  code: string;
  flag: string;
  orderCount: number;
  revenue: string;
  percentage: number;
}

export interface TopService {
  name: string;
  slug: string;
  orderCount: number;
  revenue: string;
  percentage: number;
}

// ============================================
// Admin Analytics API Functions
// ============================================

/**
 * Get dashboard overview
 */
export const getDashboardOverview = async (): Promise<DashboardOverview> => {
  const response = await apiClient.get<DashboardOverview>(
    API_ENDPOINTS.ADMIN.ANALYTICS.DASHBOARD,
  );
  return response.data;
};

/**
 * Get revenue chart data
 */
export const getRevenueChart = async (
  params?: ChartQueryParams,
): Promise<RevenueChartData> => {
  const response = await apiClient.get<RevenueChartData>(
    API_ENDPOINTS.ADMIN.ANALYTICS.REVENUE,
    { params },
  );
  return response.data;
};

/**
 * Get user growth chart data
 */
export const getUserGrowthChart = async (
  params?: ChartQueryParams,
): Promise<UserGrowthChartData> => {
  const response = await apiClient.get<UserGrowthChartData>(
    API_ENDPOINTS.ADMIN.ANALYTICS.USERS_GROWTH,
    { params },
  );
  return response.data;
};

/**
 * Get payment gateway breakdown
 */
export const getPaymentBreakdown = async (
  params?: ChartQueryParams,
): Promise<PaymentBreakdown[]> => {
  const response = await apiClient.get<PaymentBreakdown[]>(
    API_ENDPOINTS.ADMIN.ANALYTICS.PAYMENTS_BREAKDOWN,
    { params },
  );
  return response.data;
};

/**
 * Get membership breakdown
 */
export const getMembershipBreakdown = async (
  params?: ChartQueryParams,
): Promise<MembershipBreakdown[]> => {
  const response = await apiClient.get<MembershipBreakdown[]>(
    API_ENDPOINTS.ADMIN.ANALYTICS.MEMBERSHIPS_BREAKDOWN,
    { params },
  );
  return response.data;
};

/**
 * Get recent audit logs (for widget)
 */
export const getRecentAuditLogs = async (
  limit?: number,
): Promise<AuditLog[]> => {
  const response = await apiClient.get<AuditLog[]>(
    API_ENDPOINTS.ADMIN.ANALYTICS.RECENT_AUDIT_LOGS,
    { params: { limit } },
  );
  return response.data;
};

/**
 * Get recent system logs (for widget)
 */
export const getRecentSystemLogs = async (
  limit?: number,
): Promise<SystemLog[]> => {
  const response = await apiClient.get<SystemLog[]>(
    API_ENDPOINTS.ADMIN.ANALYTICS.RECENT_SYSTEM_LOGS,
    { params: { limit } },
  );
  return response.data;
};

/**
 * Get top countries by orders
 */
export const getTopCountries = async (): Promise<TopCountry[]> => {
  const response = await apiClient.get<TopCountry[]>(
    API_ENDPOINTS.ADMIN.ANALYTICS.TOP_COUNTRIES,
  );
  return response.data;
};

/**
 * Get top services by orders
 */
export const getTopServices = async (): Promise<TopService[]> => {
  const response = await apiClient.get<TopService[]>(
    API_ENDPOINTS.ADMIN.ANALYTICS.TOP_SERVICES,
  );
  return response.data;
};

export interface TrendDataPoint {
  month: string;
  value: number;
}

export interface TrendResponse {
  months: number;
  data: TrendDataPoint[];
  total: string | number;
}

/**
 * Get monthly revenue trends
 */
export const getRevenueTrends = async (months: number = 12): Promise<TrendResponse> => {
  const response = await apiClient.get<TrendResponse>(
    API_ENDPOINTS.ADMIN.ANALYTICS.REVENUE_TRENDS,
    { params: { months } },
  );
  return response.data;
};

/**
 * Get monthly activation trends
 */
export const getActivationTrends = async (months: number = 12): Promise<TrendResponse> => {
  const response = await apiClient.get<TrendResponse>(
    API_ENDPOINTS.ADMIN.ANALYTICS.ACTIVATION_TRENDS,
    { params: { months } },
  );
  return response.data;
};

export interface RecentActivity {
  id: string;
  description: string;
  username: string;
  serviceName: string;
  status: string;
  createdAt: string;
}

/**
 * Get recent SMS activation activity
 */
export const getRecentActivity = async (limit: number = 10): Promise<RecentActivity[]> => {
  const response = await apiClient.get<RecentActivity[]>(
    API_ENDPOINTS.ADMIN.ANALYTICS.RECENT_ACTIVITY,
    { params: { limit } },
  );
  return response.data;
};

// ============================================
// Analytics Helper Functions
// ============================================

/**
 * Format currency for display
 */
export const formatCurrency = (amount: string | number): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(num);
};

/**
 * Format large numbers
 */
export const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

/**
 * Get growth indicator
 */
export const getGrowthIndicator = (
  percent: number,
): { color: string; icon: 'up' | 'down' | 'neutral' } => {
  if (percent > 0) return { color: 'var(--success)', icon: 'up' };
  if (percent < 0) return { color: 'var(--danger)', icon: 'down' };
  return { color: 'var(--text-muted)', icon: 'neutral' };
};

/**
 * Get system health color
 */
export const getSystemHealthColor = (
  status: 'healthy' | 'degraded' | 'down',
): string => {
  const colors = {
    healthy: 'var(--success)',
    degraded: 'var(--warning)',
    down: 'var(--danger)',
  };
  return colors[status];
};

/**
 * Get log level color
 */
export const getLogLevelColor = (
  level: string,
): { bg: string; text: string } => {
  const colors: Record<string, { bg: string; text: string }> = {
    INFO: { bg: 'rgba(59, 130, 246, 0.1)', text: 'var(--info)' },
    WARN: { bg: 'rgba(245, 158, 11, 0.1)', text: 'var(--warning)' },
    ERROR: { bg: 'rgba(239, 68, 68, 0.1)', text: 'var(--danger)' },
    DEBUG: { bg: 'rgba(107, 114, 128, 0.1)', text: 'var(--text-muted)' },
  };
  return colors[level] || colors.INFO;
};

// ============================================
// Admin Membership Types
// ============================================

export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING'; 

export interface AdminSubscription {
  id: string;
  userId: string;
  user: {
    id: string;
    email: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
  };
  status: SubscriptionStatus;
  pricePaid: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  cancelledAt: string | null;
  cancelReason: string | null;
  plan: {
    id: string;
    name: string;
    slug: string;
    price: string;
  };
  createdAt: string;
}

export interface MembershipStatistics {
  totalSubscriptions: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  cancelledSubscriptions: number;
  totalRevenue: string;
  byPlan: Record<string, number>;
}

export interface AdminSubscriptionsResponse {
  data: AdminSubscription[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface AdminSubscriptionQueryParams {
  userId?: string;
  planSlug?: string;
  status?: SubscriptionStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AdminGrantSubscriptionRequest {
  userId: string;
  planSlug: string;
  durationDays?: number;
  reason?: string;
}

// ============================================
// Admin Membership API Functions
// ============================================

/**
 * Get all subscriptions (paginated)
 */
export const getAdminSubscriptions = async (
  params?: AdminSubscriptionQueryParams,
): Promise<AdminSubscriptionsResponse> => {
  const response = await apiClient.get<AdminSubscriptionsResponse>(
    API_ENDPOINTS.ADMIN.MEMBERSHIP.SUBSCRIPTIONS,
    { params },
  );
  return response.data;
};

/**
 * Get membership statistics
 */
export const getMembershipStatistics =
  async (): Promise<MembershipStatistics> => {
    const response = await apiClient.get<MembershipStatistics>(
      API_ENDPOINTS.ADMIN.MEMBERSHIP.STATISTICS,
    );
    return response.data;
  };

/**
 * Grant subscription to user (free gift)
 */
export const grantSubscription = async (
  data: AdminGrantSubscriptionRequest,
): Promise<{ message: string; subscription: AdminSubscription }> => {
  const response = await apiClient.post(
    API_ENDPOINTS.ADMIN.MEMBERSHIP.GRANT,
    data,
  );
  return response.data;
};

/**
 * Get subscription status color
 */
export const getSubscriptionStatusColor = (
  status: SubscriptionStatus,
): { bg: string; text: string } => {
  const colors: Record<SubscriptionStatus, { bg: string; text: string }> = {
    ACTIVE: { bg: 'rgba(34, 197, 94, 0.1)', text: 'var(--success)' },
    EXPIRED: { bg: 'rgba(107, 114, 128, 0.1)', text: 'var(--text-muted)' },
    CANCELLED: { bg: 'rgba(239, 68, 68, 0.1)', text: 'var(--danger)' },
    PENDING: { bg: 'rgba(245, 158, 11, 0.1)', text: 'var(--warning)' },
  };
  return colors[status] || colors.PENDING;
};

// ============================================
// Admin API Keys Types
// ============================================

export interface AdminApiKey {
  id: string;
  userId: string;
  name: string;
  keyPrefix: string;
  isActive: boolean;
  lastUsedAt?: string;
  usageCount: number;
  revokedAt?: string;
  revokedReason?: string;
  createdAt: string;
  userEmail: string;
  username: string | null;
}

export interface ApiKeyStatistics {
  totalKeys: number;
  activeKeys: number;
  revokedKeys: number;
  totalUsage: number;
  usageToday: number;
}

export interface AdminApiKeysResponse {
  data: AdminApiKey[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AdminApiKeyQueryParams {
  search?: string;
  isActive?: boolean;
  userId?: string;
  userEmail?: string;
  page?: number;
  limit?: number;
}

// ============================================
// Admin API Keys API Functions
// ============================================

/**
 * Get all API keys (paginated)
 */
export const getAdminApiKeys = async (
  params?: AdminApiKeyQueryParams,
): Promise<AdminApiKeysResponse> => {
  const response = await apiClient.get<AdminApiKeysResponse>(
    API_ENDPOINTS.ADMIN.API_KEYS.ROOT,
    { params },
  );
  return response.data;
};

/**
 * Get API key statistics
 */
export const getApiKeyStatistics = async (): Promise<ApiKeyStatistics> => {
  const response = await apiClient.get<ApiKeyStatistics>(
    API_ENDPOINTS.ADMIN.API_KEYS.STATISTICS,
  );
  return response.data;
};

/**
 * Admin revoke any API key
 */
export const adminRevokeApiKey = async (
  keyId: string,
  reason?: string,
): Promise<{ message: string; success: boolean }> => {
  const response = await apiClient.delete(
    API_ENDPOINTS.ADMIN.API_KEYS.DETAIL(keyId),
    { data: { reason } },
  );
  return response.data;
};

// ============================================
// Admin Payments Types
// ============================================

export type PaymentGateway =
  | 'STRIPE'
  | 'PAYGATE'
  | 'PLISIO'
  | 'CRYPTOMUS'
  | 'NOWPAYMENTS'
  | 'VOLET'
  | 'BINANCE';
export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'REFUNDED';

export interface AdminPayment {
  id: string;
  userId: string;
  gateway: PaymentGateway;
  status: PaymentStatus;
  amount: string;
  currency: string;
  feeAmount: string | null;
  netAmount: string | null;
  checkoutUrl: string | null;
  gatewayPaymentId: string | null;
  gatewayResponse: Record<string, unknown> | null;
  expiresAt: string;
  completedAt: string | null;
  refundedAt: string | null;
  refundReason: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    username: string | null;
  };
}

export interface AdminPaymentDetail extends AdminPayment {
  walletTransaction?: {
    id: string;
    type: string;
    amount: string;
    description: string;
    createdAt: string;
  };
}

export interface PaymentStatistics {
  totalPayments: number;
  completedPayments: number;
  pendingPayments: number;
  failedPayments: number;
  refundedPayments: number;
  totalRevenue: string;
  revenueToday: string;
  revenueThisWeek: string;
  revenueThisMonth: string;
  totalFees: string;
  avgPaymentAmount: string;
  byGateway: Record<PaymentGateway, { count: number; total: string }>;
  byStatus: Record<PaymentStatus, number>;
}

export interface AdminPaymentsResponse {
  data: AdminPayment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface AdminPaymentQueryParams {
  search?: string;
  status?: PaymentStatus;
  gateway?: PaymentGateway;
  userId?: string;
  fromDate?: string;
  toDate?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: 'createdAt' | 'amount' | 'completedAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface AdminRefundRequest {
  amount?: number;
  reason: string;
}

export interface AdminMarkCompletedRequest {
  note?: string;
}

// ============================================
// Admin Payments API Functions
// ============================================

/**
 * Get all payments (admin)
 * GET /api/v1/admin/payments
 */
export const getAdminPayments = async (
  params?: AdminPaymentQueryParams,
): Promise<AdminPaymentsResponse> => {
  const response = await apiClient.get<AdminPaymentsResponse>(
    API_ENDPOINTS.ADMIN.PAYMENTS.ROOT,
    { params },
  );
  return response.data;
};

/**
 * Get payment statistics (admin)
 * GET /api/v1/admin/payments/statistics
 */
export const getPaymentStatistics = async (): Promise<PaymentStatistics> => {
  const response = await apiClient.get<PaymentStatistics>(
    API_ENDPOINTS.ADMIN.PAYMENTS.STATISTICS,
  );
  return response.data;
};

/**
 * Get single payment details (admin)
 * GET /api/v1/admin/payments/:id
 */
export const getAdminPayment = async (
  id: string,
): Promise<AdminPaymentDetail> => {
  const response = await apiClient.get<AdminPaymentDetail>(
    API_ENDPOINTS.ADMIN.PAYMENTS.DETAIL(id),
  );
  return response.data;
};

/**
 * Refund a payment (admin)
 * POST /api/v1/admin/payments/:id/refund
 */
export const refundPayment = async (
  id: string,
  data: AdminRefundRequest,
): Promise<{ message: string; payment: AdminPayment }> => {
  const response = await apiClient.post(
    API_ENDPOINTS.ADMIN.PAYMENTS.REFUND(id),
    data,
  );
  return response.data;
};

/**
 * Mark payment as completed (admin)
 * POST /api/v1/admin/payments/:id/mark-completed
 */
export const markPaymentCompleted = async (
  id: string,
  data?: AdminMarkCompletedRequest,
): Promise<{ message: string; payment: AdminPayment }> => {
  const response = await apiClient.post(
    API_ENDPOINTS.ADMIN.PAYMENTS.MARK_COMPLETED(id),
    data || {},
  );
  return response.data;
};

// ============================================
// Admin Payments Helper Functions
// ============================================

/**
 * Get payment status color
 */
export const getPaymentStatusColor = (
  status: PaymentStatus,
): { bg: string; text: string } => {
  const colors: Record<PaymentStatus, { bg: string; text: string }> = {
    PENDING: { bg: 'rgba(245, 158, 11, 0.1)', text: 'var(--warning)' },
    PROCESSING: { bg: 'rgba(59, 130, 246, 0.1)', text: 'var(--info)' },
    COMPLETED: { bg: 'rgba(34, 197, 94, 0.1)', text: 'var(--success)' },
    FAILED: { bg: 'rgba(239, 68, 68, 0.1)', text: 'var(--danger)' },
    CANCELLED: { bg: 'rgba(107, 114, 128, 0.1)', text: 'var(--text-muted)' },
    EXPIRED: { bg: 'rgba(107, 114, 128, 0.1)', text: 'var(--text-muted)' },
    REFUNDED: { bg: 'rgba(139, 92, 246, 0.1)', text: '#8B5CF6' },
  };
  return colors[status] || colors.PENDING;
};

/**
 * Get gateway display info
 */
export const getGatewayInfo = (
  gateway: PaymentGateway,
): { name: string; icon: string; color: string } => {
  const gateways: Record<
    PaymentGateway,
    { name: string; icon: string; color: string }
  > = {
    STRIPE: { name: 'Stripe', icon: '💳', color: '#635BFF' },
    PAYGATE: { name: 'PayGate', icon: '🏦', color: '#00A86B' },
    PLISIO: { name: 'Plisio', icon: '₿', color: '#F7931A' },
    CRYPTOMUS: { name: 'Cryptomus', icon: '🪙', color: '#00D4AA' },
    NOWPAYMENTS: { name: 'NOWPayments', icon: '💰', color: '#00C26F' },
    VOLET: { name: 'Volet', icon: '💵', color: '#4F46E5' },
    BINANCE: { name: 'Binance', icon: '🔶', color: '#F0B90B' },
  };
  return gateways[gateway] || { name: gateway, icon: '💳', color: '#6B7280' };
};

/**
 * Format payment amount
 */
export const formatPaymentAmount = (
  amount: string | number,
  currency: string = 'USD',
): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(num);
};

/**
 * Format date for display
 */
export const formatPaymentDate = (date: string | null): string => {
  if (!date) return '-';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format relative time
 */
export const formatRelativeTime = (date: string | null): string => {
  if (!date) return 'Never';

  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return d.toLocaleDateString();
};

// ============================================
// Admin Abuse Control Types
// ============================================

export type BlockType = 'IP' | 'DOMAIN' | 'COUNTRY';

export interface BlockedEntity {
  id: string;
  type: BlockType;
  value: string;
  reason: string | null;
  expiresAt: string | null;
  createdById: string;
  createdAt: string;
  createdBy?: {
    email: string;
    firstName: string | null;
  };
}

export interface AbuseConfig {
  thresholds: {
    normal: { min: number; max: number };
    watch: { min: number; max: number };
    restricted: { min: number; max: number };
    freeze: { min: number; max: number };
  };
  orderFrequencySeconds: number;
  maxOrderQuantity: number;
  autoFreezeDurationHours: number;
  loginAttempts: number;
  loginCooldownMinutes: number;
}

export interface AbuseStatistics {
  totalUsers: number;
  normalUsers: number;
  watchUsers: number;
  restrictedUsers: number;
  frozenUsers: number;
  blockedIPs: number;
  blockedDomains: number;
  blockedCountries: number;
  recentIncidents: number;
  chargebacksThisMonth: number;
}

export interface AtRiskUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  abuseScore: number;
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
  riskLevel: 'watch' | 'restricted' | 'freeze';
}

export interface UserAbuseInfo {
  userId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  abuseScore: number;
  status: string;
  riskLevel: 'normal' | 'watch' | 'restricted' | 'freeze';
  orderLimit: number | null;
  loginAttempts: number;
  lastLoginAt: string | null;
  walletLocked: boolean;
  recentIncidents: {
    type: string;
    description: string;
    createdAt: string;
  }[];
}

export interface AbuseScoreHistory {
  id: string;
  previousScore: number;
  newScore: number;
  reason: string;
  changedBy: string | null;
  createdAt: string;
}

export interface BlockedEntitiesResponse {
  data: BlockedEntity[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface AtRiskUsersResponse {
  data: AtRiskUser[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface BlockQueryParams {
  type?: BlockType;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AbuseUserQueryParams {
  minScore?: number;
  maxScore?: number;
  riskLevel?: 'watch' | 'restricted' | 'freeze';
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateBlockRequest {
  type: BlockType;
  value: string;
  reason?: string;
  expiresAt?: string;
}

export interface AdjustScoreRequest {
  newScore: number;
  reason: string;
}

// ============================================
// Admin Abuse Control API Functions
// ============================================

/**
 * Get abuse control configuration
 */
export const getAbuseConfig = async (): Promise<AbuseConfig> => {
  const response = await apiClient.get<AbuseConfig>(
    API_ENDPOINTS.ADMIN.ABUSE.CONFIG,
  );
  return response.data;
};

/**
 * Get abuse control statistics
 */
export const getAbuseStatistics = async (): Promise<AbuseStatistics> => {
  const response = await apiClient.get<AbuseStatistics>(
    API_ENDPOINTS.ADMIN.ABUSE.STATISTICS,
  );
  return response.data;
};

/**
 * List blocked entities
 */
export const getBlockedEntities = async (
  params?: BlockQueryParams,
): Promise<BlockedEntitiesResponse> => {
  const response = await apiClient.get<BlockedEntitiesResponse>(
    API_ENDPOINTS.ADMIN.ABUSE.BLOCKED,
    { params },
  );
  return response.data;
};

/**
 * Create a new block
 */
export const createBlock = async (
  data: CreateBlockRequest,
): Promise<BlockedEntity> => {
  const response = await apiClient.post<BlockedEntity>(
    API_ENDPOINTS.ADMIN.ABUSE.BLOCKED,
    data,
  );
  return response.data;
};

/**
 * Remove a block
 */
export const removeBlock = async (
  blockId: string,
): Promise<{ message: string; success: boolean }> => {
  const response = await apiClient.delete(
    API_ENDPOINTS.ADMIN.ABUSE.BLOCKED_DETAIL(blockId),
  );
  return response.data;
};

/**
 * Get at-risk users
 */
export const getAtRiskUsers = async (
  params?: AbuseUserQueryParams,
): Promise<AtRiskUsersResponse> => {
  const response = await apiClient.get<AtRiskUsersResponse>(
    API_ENDPOINTS.ADMIN.ABUSE.USERS_AT_RISK,
    { params },
  );
  return response.data;
};

/**
 * Get user abuse info
 */
export const getUserAbuseInfo = async (
  userId: string,
): Promise<UserAbuseInfo> => {
  const response = await apiClient.get<UserAbuseInfo>(
    API_ENDPOINTS.ADMIN.ABUSE.USER_INFO(userId),
  );
  return response.data;
};

/**
 * Adjust user abuse score
 */
export const adjustUserAbuseScore = async (
  userId: string,
  data: AdjustScoreRequest,
): Promise<UserAbuseInfo> => {
  const response = await apiClient.post<UserAbuseInfo>(
    API_ENDPOINTS.ADMIN.ABUSE.USER_ADJUST_SCORE(userId),
    data,
  );
  return response.data;
};

/**
 * Get user abuse score history
 */
export const getUserAbuseHistory = async (
  userId: string,
  limit?: number,
): Promise<AbuseScoreHistory[]> => {
  const response = await apiClient.get<AbuseScoreHistory[]>(
    API_ENDPOINTS.ADMIN.ABUSE.USER_HISTORY(userId),
    { params: { limit } },
  );
  return response.data;
};

// ============================================
// Abuse Control Helper Functions
// ============================================

/**
 * Get risk level color
 */
export const getRiskLevelColor = (
  level: string,
): { bg: string; text: string } => {
  const colors: Record<string, { bg: string; text: string }> = {
    normal: { bg: 'rgba(34, 197, 94, 0.1)', text: 'var(--success)' },
    watch: { bg: 'rgba(245, 158, 11, 0.1)', text: 'var(--warning)' },
    restricted: { bg: 'rgba(249, 115, 22, 0.1)', text: '#F97316' },
    freeze: { bg: 'rgba(239, 68, 68, 0.1)', text: 'var(--danger)' },
  };
  return colors[level] || colors.normal;
};

/**
 * Get abuse score color based on thresholds
 */
export const getAbuseScoreColor = (
  score: number,
): { bg: string; text: string } => {
  if (score >= 91)
    return { bg: 'rgba(239, 68, 68, 0.1)', text: 'var(--danger)' };
  if (score >= 76) return { bg: 'rgba(249, 115, 22, 0.1)', text: '#F97316' };
  if (score >= 61)
    return { bg: 'rgba(245, 158, 11, 0.1)', text: 'var(--warning)' };
  return { bg: 'rgba(34, 197, 94, 0.1)', text: 'var(--success)' };
};

/**
 * Get block type color
 */
export const getBlockTypeColor = (
  type: BlockType,
): { bg: string; text: string } => {
  const colors: Record<BlockType, { bg: string; text: string }> = {
    IP: { bg: 'rgba(239, 68, 68, 0.1)', text: 'var(--danger)' },
    DOMAIN: { bg: 'rgba(245, 158, 11, 0.1)', text: 'var(--warning)' },
    COUNTRY: { bg: 'rgba(59, 130, 246, 0.1)', text: 'var(--info)' },
  };
  return colors[type] || colors.IP;
};
