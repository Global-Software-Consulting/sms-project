import { apiClient } from '@/config/api-client.config';
import { API_ENDPOINTS } from '@/config/server.config';

// ============================================
// Types
// ============================================

export interface AdminReferralStats {
  totalAffiliates: number;
  activeAffiliates: number;
  totalReferrals: number;
  qualifiedReferrals: number;
  totalCommissionsPaid: number;
  pendingCommissions: number;
  totalReferredDeposits: number;
  tierDistribution: {
    STARTER: number;
    PLUS: number;
    SUPER: number;
    MAX: number;
    ROYAL: number;
  };
}

export type AffiliateTier = 'STARTER' | 'PLUS' | 'SUPER' | 'MAX' | 'ROYAL';
export type PayoutStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';

export interface AffiliateProfile {
  id: string;
  userId: string;
  referralCode: string;
  customCode: string | null;
  tier: AffiliateTier;
  isActive: boolean;
  totalReferrals: number;
  qualifiedReferrals: number;
  totalEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
  commissionRate: number;
  suspendedAt: string | null;
  suspendedReason: string | null;
  createdAt: string;
  userName: string;
  userEmail: string;
  cryptoAddressUsdt: string | null;
  cryptoAddressSol: string | null;
  cryptoAddressTrx: string | null;
  cryptoAddressLtc: string | null;
  preferredPayoutMethod: string | null;
}

export interface AdminPayout {
  id: string;
  amount: number;
  method: string;
  status: PayoutStatus;
  cryptoCurrency: string | null;
  walletAddress: string | null;
  message: string | null;
  externalReference: string | null;
  userEmail: string | null;
  userName: string | null;
  processedAt: string | null;
  createdAt: string;
}

export interface AdminPayoutQueryParams {
  page?: number;
  limit?: number;
  status?: PayoutStatus;
  userId?: string;
}

export interface PayoutsResponse {
  data: AdminPayout[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AffiliateProfileQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  tier?: AffiliateTier;
  isActive?: boolean;
  sortBy?: 'totalEarnings' | 'totalReferrals' | 'qualifiedReferrals' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface AffiliateProfilesResponse {
  data: AffiliateProfile[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================
// API Functions
// ============================================

export const getAdminReferralStats = async (): Promise<AdminReferralStats> => {
  const response = await apiClient.get<AdminReferralStats>(
    API_ENDPOINTS.ADMIN.REFERRALS.STATS,
  );
  return response.data;
};

export const getAdminAffiliateProfiles = async (
  params?: AffiliateProfileQueryParams,
): Promise<AffiliateProfilesResponse> => {
  const response = await apiClient.get<AffiliateProfilesResponse>(
    API_ENDPOINTS.ADMIN.REFERRALS.PROFILES,
    { params },
  );
  return response.data;
};

// ============================================
// Payout Management
// ============================================

export const getAdminPayouts = async (
  params?: AdminPayoutQueryParams,
): Promise<PayoutsResponse> => {
  const response = await apiClient.get<PayoutsResponse>(
    `${API_ENDPOINTS.ADMIN.REFERRALS.ROOT}/payouts`,
    { params },
  );
  return response.data;
};

export const markPayoutAsPaid = async (
  payoutId: string,
  externalReference?: string,
): Promise<AdminPayout> => {
  const response = await apiClient.post<AdminPayout>(
    `${API_ENDPOINTS.ADMIN.REFERRALS.ROOT}/payouts/${payoutId}/mark-paid`,
    { externalReference },
  );
  return response.data;
};

export const rejectPayout = async (
  payoutId: string,
  reason: string,
): Promise<AdminPayout> => {
  const response = await apiClient.post<AdminPayout>(
    `${API_ENDPOINTS.ADMIN.REFERRALS.ROOT}/payouts/${payoutId}/reject`,
    { reason },
  );
  return response.data;
};

// ============================================
// Referral Settings
// ============================================

export interface ReferralSettings {
  isEnabled: boolean;
  defaultCommissionRate: number;
  minPayoutAmount: number;
  cookieDurationDays: number;
  commissionOnDeposits: boolean;
  commissionOnPurchases: boolean;
  commissionOnSubscriptions: boolean;
}

export interface UpdateReferralSettingsRequest {
  defaultCommissionRate?: number;
  minPayoutAmount?: number;
  isEnabled?: boolean;
}

export const getReferralSettings = async (): Promise<ReferralSettings> => {
  const response = await apiClient.get<ReferralSettings>(
    `${API_ENDPOINTS.ADMIN.REFERRALS.ROOT}/settings`,
  );
  return response.data;
};

export const updateReferralSettings = async (
  data: UpdateReferralSettingsRequest,
): Promise<ReferralSettings> => {
  const response = await apiClient.patch<ReferralSettings>(
    `${API_ENDPOINTS.ADMIN.REFERRALS.ROOT}/settings`,
    data,
  );
  return response.data;
};