import { apiClient } from '@/config/api-client.config';
import { API_ENDPOINTS } from '@/config/server.config';

// ============================================
// Types
// ============================================

export interface Rank {
  id: string;
  name: string;
  slug: string;
  description: string;
  minSpending: number;
  discountPercent: number;
  orderLimitBonus: number;
  prioritySupport: boolean;
  badge: string;
  color: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    users: number;
  };
}

export interface CreateRankRequest {
  name: string;
  slug: string;
  description: string;
  minSpending: number;
  discountPercent: number;
  orderLimitBonus: number;
  prioritySupport: boolean;
  badge: string;
  color: string;
  sortOrder: number;
  isActive: boolean;
}

export interface UpdateRankRequest {
  name?: string;
  description?: string;
  minSpending?: number;
  discountPercent?: number;
  orderLimitBonus?: number;
  prioritySupport?: boolean;
  badge?: string;
  color?: string;
  sortOrder?: number;
  isActive?: boolean;
}

// ============================================
// API Functions
// ============================================

export const getRanks = async (): Promise<Rank[]> => {
  const response = await apiClient.get<Rank[]>(
    API_ENDPOINTS.ADMIN.RANKS.ROOT,
  );
  return response.data;
};

export const getRankById = async (id: string): Promise<Rank> => {
  const response = await apiClient.get<Rank>(
    API_ENDPOINTS.ADMIN.RANKS.DETAIL(id),
  );
  return response.data;
};

export const createRank = async (data: CreateRankRequest): Promise<Rank> => {
  const response = await apiClient.post<Rank>(
    API_ENDPOINTS.ADMIN.RANKS.ROOT,
    data,
  );
  return response.data;
};

export const updateRank = async (id: string, data: UpdateRankRequest): Promise<Rank> => {
  const response = await apiClient.patch<Rank>(
    API_ENDPOINTS.ADMIN.RANKS.DETAIL(id),
    data,
  );
  return response.data;
};

export const deleteRank = async (id: string): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.ADMIN.RANKS.DETAIL(id));
};