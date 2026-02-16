import { apiClient } from './config';
import { UserRole, UserStatus } from './authApi';

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
    SUPER_ADMIN: number;
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
  sortBy?: 'createdAt' | 'updatedAt' | 'email' | 'name' | 'lastLoginAt' | 'abuseScore';
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
export const getAdminUsers = async (params?: AdminUserQueryParams): Promise<AdminUsersResponse> => {
  const response = await apiClient.get<AdminUsersResponse>('/admin/users', { params });
  return response.data;
};

/**
 * Get user statistics
 * GET /api/v1/admin/users/statistics
 */
export const getUserStatistics = async (): Promise<UserStatistics> => {
  const response = await apiClient.get<UserStatistics>('/admin/users/statistics');
  return response.data;
};

/**
 * Get single user details
 * GET /api/v1/admin/users/:id
 */
export const getAdminUser = async (id: string): Promise<AdminUserDetail> => {
  const response = await apiClient.get<AdminUserDetail>(`/admin/users/${id}`);
  return response.data;
};

/**
 * Update user
 * PATCH /api/v1/admin/users/:id
 */
export const updateAdminUser = async (id: string, data: AdminUpdateUserRequest): Promise<AdminUser> => {
  const response = await apiClient.patch<AdminUser>(`/admin/users/${id}`, data);
  return response.data;
};

/**
 * Delete user (soft delete)
 * DELETE /api/v1/admin/users/:id
 */
export const deleteAdminUser = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(`/admin/users/${id}`);
  return response.data;
};

/**
 * Ban user
 * POST /api/v1/admin/users/:id/ban
 */
export const banUser = async (id: string, data: BanUserRequest): Promise<AdminUser> => {
  const response = await apiClient.post<AdminUser>(`/admin/users/${id}/ban`, data);
  return response.data;
};

/**
 * Unban user
 * POST /api/v1/admin/users/:id/unban
 */
export const unbanUser = async (id: string): Promise<AdminUser> => {
  const response = await apiClient.post<AdminUser>(`/admin/users/${id}/unban`);
  return response.data;
};

/**
 * Suspend user
 * POST /api/v1/admin/users/:id/suspend
 */
export const suspendUser = async (id: string, data: SuspendUserRequest): Promise<AdminUser> => {
  const response = await apiClient.post<AdminUser>(`/admin/users/${id}/suspend`, data);
  return response.data;
};

/**
 * Activate user
 * POST /api/v1/admin/users/:id/activate
 */
export const activateUser = async (id: string): Promise<AdminUser> => {
  const response = await apiClient.post<AdminUser>(`/admin/users/${id}/activate`);
  return response.data;
};

/**
 * Change user role
 * PATCH /api/v1/admin/users/:id/role
 */
export const changeUserRole = async (id: string, data: ChangeRoleRequest): Promise<AdminUser> => {
  const response = await apiClient.patch<AdminUser>(`/admin/users/${id}/role`, data);
  return response.data;
};

/**
 * Set user limits
 * PATCH /api/v1/admin/users/:id/limits
 */
export const setUserLimits = async (id: string, data: SetLimitsRequest): Promise<AdminUser> => {
  const response = await apiClient.patch<AdminUser>(`/admin/users/${id}/limits`, data);
  return response.data;
};

/**
 * Set user abuse score
 * PATCH /api/v1/admin/users/:id/abuse-score
 */
export const setUserAbuseScore = async (id: string, data: SetAbuseScoreRequest): Promise<AdminUser> => {
  const response = await apiClient.patch<AdminUser>(`/admin/users/${id}/abuse-score`, data);
  return response.data;
};

// ============================================
// Helper Functions
// ============================================

/**
 * Get status badge color
 */
export const getUserStatusColor = (status: UserStatus): { bg: string; text: string } => {
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
 */
export const getUserRoleColor = (role: UserRole): { bg: string; text: string } => {
  const colors: Record<UserRole, { bg: string; text: string }> = {
    USER: { bg: 'rgba(107, 114, 128, 0.1)', text: 'var(--text-secondary)' },
    SUPER_ADMIN: { bg: 'rgba(198, 167, 94, 0.1)', text: 'var(--accent-gold)' },
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
export const getAdminWallets = async (params?: AdminWalletQueryParams): Promise<AdminWalletsResponse> => {
  const response = await apiClient.get<AdminWalletsResponse>('/admin/wallets', { params });
  return response.data;
};

/**
 * Get wallet statistics
 */
export const getWalletStatistics = async (): Promise<WalletStatistics> => {
  const response = await apiClient.get<WalletStatistics>('/admin/wallets/statistics');
  return response.data;
};

/**
 * Get user's wallet details
 */
export const getAdminWallet = async (userId: string): Promise<AdminWalletDetail> => {
  const response = await apiClient.get<AdminWalletDetail>(`/admin/wallets/${userId}`);
  return response.data;
};

/**
 * Credit wallet (add bonus)
 */
export const creditWallet = async (userId: string, data: AdminCreditRequest): Promise<{ message: string; newBalance: string; transactionId: string }> => {
  const response = await apiClient.post(`/admin/wallets/${userId}/credit`, data);
  return response.data;
};

/**
 * Debit wallet (remove funds)
 */
export const debitWallet = async (userId: string, data: AdminDebitRequest): Promise<{ message: string; newBalance: string; transactionId: string }> => {
  const response = await apiClient.post(`/admin/wallets/${userId}/debit`, data);
  return response.data;
};

/**
 * Adjust wallet (positive or negative)
 */
export const adjustWallet = async (userId: string, data: AdminAdjustRequest): Promise<{ message: string; newBalance: string; transactionId: string }> => {
  const response = await apiClient.post(`/admin/wallets/${userId}/adjust`, data);
  return response.data;
};

/**
 * Lock wallet
 */
export const lockWallet = async (userId: string, data: AdminLockWalletRequest): Promise<{ message: string }> => {
  const response = await apiClient.post(`/admin/wallets/${userId}/lock`, data);
  return response.data;
};

/**
 * Unlock wallet
 */
export const unlockWallet = async (userId: string): Promise<{ message: string }> => {
  const response = await apiClient.post(`/admin/wallets/${userId}/unlock`);
  return response.data;
};

// ============================================
// Admin Analytics Types
// ============================================

export interface DashboardOverview {
  users: {
    totalUsers: number;
    newUsersToday: number;
    newUsersThisWeek: number;
    newUsersThisMonth: number;
    activeUsersToday: number;
    userGrowthPercent: number;
  };
  revenue: {
    totalRevenue: string;
    revenueToday: string;
    revenueThisWeek: string;
    revenueThisMonth: string;
    revenueGrowthPercent: number;
    avgTransactionValue: string;
  };
  memberships: {
    totalActive: number;
    newToday: number;
    cancelledToday: number;
    byPlan: Record<string, number>;
  };
  wallet: {
    totalBalance: string;
    totalDeposited: string;
    totalSpent: string;
    lockedWallets: number;
  };
  api: {
    totalRequests: number;
    requestsToday: number;
    activeKeys: number;
    errorRate: number;
  };
  systemHealth: {
    status: 'healthy' | 'degraded' | 'down';
    uptime: number;
    errorsToday: number;
    warningsToday: number;
  };
  generatedAt: string;
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

// ============================================
// Admin Analytics API Functions
// ============================================

/**
 * Get dashboard overview
 */
export const getDashboardOverview = async (): Promise<DashboardOverview> => {
  const response = await apiClient.get<DashboardOverview>('/admin/analytics/dashboard');
  return response.data;
};

/**
 * Get revenue chart data
 */
export const getRevenueChart = async (params?: ChartQueryParams): Promise<RevenueChartData> => {
  const response = await apiClient.get<RevenueChartData>('/admin/analytics/revenue', { params });
  return response.data;
};

/**
 * Get user growth chart data
 */
export const getUserGrowthChart = async (params?: ChartQueryParams): Promise<UserGrowthChartData> => {
  const response = await apiClient.get<UserGrowthChartData>('/admin/analytics/users/growth', { params });
  return response.data;
};

/**
 * Get payment gateway breakdown
 */
export const getPaymentBreakdown = async (params?: ChartQueryParams): Promise<PaymentBreakdown[]> => {
  const response = await apiClient.get<PaymentBreakdown[]>('/admin/analytics/payments/breakdown', { params });
  return response.data;
};

/**
 * Get membership breakdown
 */
export const getMembershipBreakdown = async (params?: ChartQueryParams): Promise<MembershipBreakdown[]> => {
  const response = await apiClient.get<MembershipBreakdown[]>('/admin/analytics/memberships/breakdown', { params });
  return response.data;
};

/**
 * Get recent audit logs (for widget)
 */
export const getRecentAuditLogs = async (limit?: number): Promise<AuditLog[]> => {
  const response = await apiClient.get<AuditLog[]>('/admin/analytics/recent/audit-logs', { params: { limit } });
  return response.data;
};

/**
 * Get recent system logs (for widget)
 */
export const getRecentSystemLogs = async (limit?: number): Promise<SystemLog[]> => {
  const response = await apiClient.get<SystemLog[]>('/admin/analytics/recent/system-logs', { params: { limit } });
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
export const getGrowthIndicator = (percent: number): { color: string; icon: 'up' | 'down' | 'neutral' } => {
  if (percent > 0) return { color: 'var(--success)', icon: 'up' };
  if (percent < 0) return { color: 'var(--danger)', icon: 'down' };
  return { color: 'var(--text-muted)', icon: 'neutral' };
};

/**
 * Get system health color
 */
export const getSystemHealthColor = (status: 'healthy' | 'degraded' | 'down'): string => {
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
export const getLogLevelColor = (level: string): { bg: string; text: string } => {
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
export const getAdminSubscriptions = async (params?: AdminSubscriptionQueryParams): Promise<AdminSubscriptionsResponse> => {
  const response = await apiClient.get<AdminSubscriptionsResponse>('/admin/membership/subscriptions', { params });
  return response.data;
};

/**
 * Get membership statistics
 */
export const getMembershipStatistics = async (): Promise<MembershipStatistics> => {
  const response = await apiClient.get<MembershipStatistics>('/admin/membership/statistics');
  return response.data;
};

/**
 * Grant subscription to user (free gift)
 */
export const grantSubscription = async (data: AdminGrantSubscriptionRequest): Promise<{ message: string; subscription: AdminSubscription }> => {
  const response = await apiClient.post('/admin/membership/grant', data);
  return response.data;
};

/**
 * Get subscription status color
 */
export const getSubscriptionStatusColor = (status: SubscriptionStatus): { bg: string; text: string } => {
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
export const getAdminApiKeys = async (params?: AdminApiKeyQueryParams): Promise<AdminApiKeysResponse> => {
  const response = await apiClient.get<AdminApiKeysResponse>('/admin/api-keys', { params });
  return response.data;
};

/**
 * Get API key statistics
 */
export const getApiKeyStatistics = async (): Promise<ApiKeyStatistics> => {
  const response = await apiClient.get<ApiKeyStatistics>('/admin/api-keys/statistics');
  return response.data;
};

/**
 * Admin revoke any API key
 */
export const adminRevokeApiKey = async (keyId: string, reason?: string): Promise<{ message: string; success: boolean }> => {
  const response = await apiClient.delete(`/admin/api-keys/${keyId}`, { data: { reason } });
  return response.data;
};
