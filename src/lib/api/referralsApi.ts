/**
 * Referrals API
 *
 * Handles all referral program related API calls including:
 * - Profile management
 * - Referral links
 * - Statistics
 * - Commission tracking
 * - Payout requests
 */

import { apiClient } from '@/config/api-client.config';
import { API_ENDPOINTS } from '@/config/server.config';

// ============================================
// Types
// ============================================

export type ReferralTier = 'STARTER' | 'PLUS' | 'PRO' | 'ELITE';
export type ReferralStatus = 'PENDING' | 'QUALIFIED' | 'CHURNED';
export type CommissionStatus = 'PENDING' | 'APPROVED' | 'PAID' | 'CANCELLED';
export type PayoutStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface ReferralProfile {
  id: string;
  userId: string;
  referralCode: string;
  customCode: string | null;
  commissionRate: number;
  tier: ReferralTier;
  totalReferrals: number;
  qualifiedReferrals: number;
  totalEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
  minPayoutAmount: number;
  autoPayoutEnabled: boolean;
  isActive: boolean;
  referralLink: string;
  createdAt: string;
}

export interface ReferralLink {
  code: string;
  link: string;
  customCode: string | null;
  customLink: string | null;
}

export interface ReferralStats {
  totalReferrals: number;
  qualifiedReferrals: number;
  pendingReferrals: number;
  totalEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
  currentCommissionRate: number;
  currentTier: ReferralTier;
  nextTier: string | null;
  spendingToNextTier: number | null;
  nextTierCommissionRate: number | null;
  totalSpending: number;
}

export interface Referral {
  id: string;
  referredEmail: string;
  status: ReferralStatus;
  firstDepositAmount: number | null;
  totalDeposits: number;
  totalCommission: number;
  firstDepositAt: string | null;
  qualifiedAt: string | null;
  createdAt: string;
}

export interface Commission {
  id: string;
  sourceType: string;
  sourceAmount: number;
  commissionRate: number;
  commissionAmount: number;
  status: CommissionStatus;
  paidAt: string | null;
  createdAt: string;
}

export interface Payout {
  id: string;
  amount: number;
  method: string;
  status: PayoutStatus;
  processedAt: string | null;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReferralQueryParams {
  page?: number;
  limit?: number;
  status?: ReferralStatus;
  sortBy?: 'createdAt' | 'totalDeposits' | 'totalCommission';
  sortOrder?: 'asc' | 'desc';
}

export interface CommissionQueryParams {
  page?: number;
  limit?: number;
  status?: CommissionStatus;
}

export interface PayoutQueryParams {
  page?: number;
  limit?: number;
  status?: PayoutStatus;
}

export interface UpdateReferralProfileRequest {
  customCode?: string;
  autoPayoutEnabled?: boolean;
  minPayoutAmount?: number;
}

export type CryptoCurrency = 'USDT_TRC20' | 'SOL' | 'TRX' | 'LTC';
export type PayoutMethod = 'WALLET' | 'CRYPTO';

export interface RequestPayoutRequest {
  amount?: number;
  method?: PayoutMethod;
  cryptoCurrency?: CryptoCurrency;
  walletAddress?: string;
  message?: string;
}

export interface AddToMainBalanceRequest {
  amount: number;
}

export interface AddToMainBalanceResponse {
  success: boolean;
  newBalance: number;
}

// ============================================
// API Functions
// ============================================

/**
 * Get or create referral profile
 * GET /api/v1/referrals/profile
 */
export const getReferralProfile = async (): Promise<ReferralProfile> => {
  const response = await apiClient.get<ReferralProfile>(
    API_ENDPOINTS.REFERRALS.PROFILE,
  );
  return response.data;
};

/**
 * Update referral profile settings
 * PATCH /api/v1/referrals/profile
 */
export const updateReferralProfile = async (
  data: UpdateReferralProfileRequest,
): Promise<ReferralProfile> => {
  const response = await apiClient.patch<ReferralProfile>(
    API_ENDPOINTS.REFERRALS.PROFILE,
    data,
  );
  return response.data;
};

/**
 * Get referral link info
 * GET /api/v1/referrals/link
 */
export const getReferralLink = async (): Promise<ReferralLink> => {
  const response = await apiClient.get<ReferralLink>(
    API_ENDPOINTS.REFERRALS.LINK,
  );
  return response.data;
};

/**
 * Get referral statistics
 * GET /api/v1/referrals/stats
 */
export const getReferralStats = async (): Promise<ReferralStats> => {
  const response = await apiClient.get<ReferralStats>(
    API_ENDPOINTS.REFERRALS.STATS,
  );
  return response.data;
};

/**
 * Get list of referrals
 * GET /api/v1/referrals/list
 */
export const getReferrals = async (
  params?: ReferralQueryParams,
): Promise<PaginatedResponse<Referral>> => {
  const response = await apiClient.get<PaginatedResponse<Referral>>(
    API_ENDPOINTS.REFERRALS.LIST,
    { params },
  );
  return response.data;
};

/**
 * Get commission history
 * GET /api/v1/referrals/commissions
 */
export const getCommissions = async (
  params?: CommissionQueryParams,
): Promise<PaginatedResponse<Commission>> => {
  const response = await apiClient.get<PaginatedResponse<Commission>>(
    API_ENDPOINTS.REFERRALS.COMMISSIONS,
    { params },
  );
  return response.data;
};

/**
 * Get payout history
 * GET /api/v1/referrals/payouts
 */
export const getPayouts = async (
  params?: PayoutQueryParams,
): Promise<PaginatedResponse<Payout>> => {
  const response = await apiClient.get<PaginatedResponse<Payout>>(
    API_ENDPOINTS.REFERRALS.PAYOUTS,
    { params },
  );
  return response.data;
};

/**
 * Request a payout (WALLET or CRYPTO)
 * POST /api/v1/referrals/payouts/request
 */
export const requestPayout = async (
  data?: RequestPayoutRequest,
): Promise<Payout> => {
  const response = await apiClient.post<Payout>(
    API_ENDPOINTS.REFERRALS.REQUEST_PAYOUT,
    data || {},
  );
  return response.data;
};

/**
 * Add referral earnings to main wallet balance
 * WARNING: This is non-reversible - balance cannot be withdrawn back
 * POST /api/v1/referrals/add-to-balance
 */
export const addToMainBalance = async (
  data: AddToMainBalanceRequest,
): Promise<AddToMainBalanceResponse> => {
  const response = await apiClient.post<AddToMainBalanceResponse>(
    '/referrals/add-to-balance',
    data,
  );
  return response.data;
};

/**
 * Validate a referral code (public)
 * GET /api/v1/referrals/validate/:code
 */
export const validateReferralCode = async (
  code: string,
): Promise<{ valid: boolean }> => {
  const response = await apiClient.get<{ valid: boolean }>(
    API_ENDPOINTS.REFERRALS.VALIDATE(code),
  );
  return response.data;
};

// ============================================
// Helper Functions
// ============================================

/**
 * Get tier display info
 */
export const getTierInfo = (tier: ReferralTier) => {
  const tiers: Record<ReferralTier, { name: string; color: string; icon: string }> = {
    STARTER: { name: 'Starter', color: '#9CA3AF', icon: '🌱' },
    PLUS: { name: 'Plus', color: '#60A5FA', icon: '⭐' },
    PRO: { name: 'Pro', color: '#A78BFA', icon: '💎' },
    ELITE: { name: 'Elite', color: '#F59E0B', icon: '👑' },
  };
  return tiers[tier] || tiers.STARTER;
};

/**
 * Get referral status label
 */
export const getReferralStatusLabel = (status: ReferralStatus): string => {
  const labels: Record<ReferralStatus, string> = {
    PENDING: 'Pending',
    QUALIFIED: 'Qualified',
    CHURNED: 'Churned',
  };
  return labels[status] || status;
};

/**
 * Get referral status color
 */
export const getReferralStatusColor = (status: ReferralStatus): string => {
  const colors: Record<ReferralStatus, string> = {
    PENDING: '#F59E0B',
    QUALIFIED: '#10B981',
    CHURNED: '#EF4444',
  };
  return colors[status] || '#6B7280';
};

/**
 * Get commission status label
 */
export const getCommissionStatusLabel = (status: CommissionStatus): string => {
  const labels: Record<CommissionStatus, string> = {
    PENDING: 'Pending',
    APPROVED: 'Approved',
    PAID: 'Paid',
    CANCELLED: 'Cancelled',
  };
  return labels[status] || status;
};

/**
 * Get commission status color
 */
export const getCommissionStatusColor = (status: CommissionStatus): string => {
  const colors: Record<CommissionStatus, string> = {
    PENDING: '#F59E0B',
    APPROVED: '#3B82F6',
    PAID: '#10B981',
    CANCELLED: '#EF4444',
  };
  return colors[status] || '#6B7280';
};

/**
 * Get payout status label
 */
export const getPayoutStatusLabel = (status: PayoutStatus): string => {
  const labels: Record<PayoutStatus, string> = {
    PENDING: 'Pending',
    PROCESSING: 'Processing',
    COMPLETED: 'Completed',
    FAILED: 'Failed',
    CANCELLED: 'Cancelled',
  };
  return labels[status] || status;
};

/**
 * Get payout status color
 */
export const getPayoutStatusColor = (status: PayoutStatus): string => {
  const colors: Record<PayoutStatus, string> = {
    PENDING: '#F59E0B',
    PROCESSING: '#3B82F6',
    COMPLETED: '#10B981',
    FAILED: '#EF4444',
    CANCELLED: '#6B7280',
  };
  return colors[status] || '#6B7280';
};

/**
 * Format currency amount
 */
export const formatReferralAmount = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

/**
 * Mask email for privacy
 */
export const maskEmail = (email: string): string => {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const maskedLocal = local.length > 2
    ? local[0] + '*'.repeat(local.length - 2) + local[local.length - 1]
    : local;
  return `${maskedLocal}@${domain}`;
};

