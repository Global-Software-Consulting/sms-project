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