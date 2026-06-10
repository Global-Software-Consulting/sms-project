import { apiClient } from '@/config/api-client.config';
import { API_ENDPOINTS } from '@/config/server.config';

// ============================================
// Types matching backend DTOs
// ============================================

/**
 * API Key Permissions (flat structure matching backend)
 */
export interface ApiKeyPermissions {
  canActivate: boolean;  // Can place SMS activation orders
  canRent: boolean;      // Can rent numbers
  canViewBalance: boolean; // Can view wallet balance
  canViewHistory: boolean; // Can view order history
}

/**
 * API Key (without full key - only shown at creation)
 * Key format: bshq_live_<random> or bshq_test_<random>
 */
export interface ApiKey {
  id: string;
  userId: string;
  name: string;
  keyPrefix: string; // First 12 chars (e.g., "bshq_live_abc...")
  environment: 'live' | 'test';
  isActive: boolean;
  canRead: boolean;
  canOrder: boolean;
  canManage: boolean;
  canWallet: boolean;
  ipWhitelist: string[];
  expiresAt?: string;
  lastUsedAt?: string;
  usageCount: number;
  revokedAt?: string;
  revokedReason?: string;
  createdAt: string;
  // Computed permissions for UI
  permissions: ApiKeyPermissions;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
}

/**
 * API Key with full key (only returned at creation)
 */
export interface ApiKeyCreated {
  id: string;
  userId: string;
  name: string;
  keyPrefix: string;
  environment: 'live' | 'test';
  key: string; // Full key - ONLY SHOWN ONCE!
  isActive: boolean;
  canRead: boolean;
  canOrder: boolean;
  canManage: boolean;
  canWallet: boolean;
  ipWhitelist: string[];
  usageCount: number;
  createdAt: string;
  // For UI compatibility
  apiKey: ApiKey;
}

/**
 * API Keys list response
 */
export interface ApiKeysListResponse {
  data: ApiKey[];
  meta: {
    total: number;
    limit: number;
  };
}

/**
 * API Key usage statistics
 */
export interface ApiKeyUsage {
  keyId: string;
  keyName: string;
  totalRequests: number;
  lastUsedAt?: string;
  createdAt: string;
  rateLimit: number;
}

// ============================================
// Request DTOs
// ============================================

export interface CreateApiKeyRequest {
  name: string;
  environment?: 'live' | 'test';
  canRead?: boolean;
  canOrder?: boolean;
  canManage?: boolean;
  canWallet?: boolean;
  ipWhitelist?: string[];
  expiresAt?: string;
}

export interface UpdateApiKeyRequest {
  name?: string;
  canRead?: boolean;
  canOrder?: boolean;
  canManage?: boolean;
  canWallet?: boolean;
  ipWhitelist?: string[];
  expiresAt?: string;
}

export interface ApiKeyQueryParams {
  includeRevoked?: boolean;
  page?: number;
  limit?: number;
}

// ============================================
// API Functions
// ============================================

/**
 * Transform backend response to frontend ApiKey format
 */
const transformApiKey = (data: any): ApiKey => {
  return {
    ...data,
    permissions: {
      canActivate: data.canOrder ?? true,
      canRent: data.canManage ?? false,
      canViewBalance: data.canWallet ?? true,
      canViewHistory: data.canRead ?? true,
    },
    status: data.revokedAt ? 'REVOKED' : (data.expiresAt && new Date(data.expiresAt) < new Date() ? 'EXPIRED' : 'ACTIVE'),
  };
};

/**
 * Create a new API key
 * POST /api/v1/api-keys
 *
 * IMPORTANT: The full key is ONLY returned once at creation!
 */
export const createApiKey = async (
  data: CreateApiKeyRequest,
): Promise<ApiKeyCreated> => {
  const response = await apiClient.post<any>(
    API_ENDPOINTS.API_KEYS.ROOT,
    data,
  );
  const apiKey = transformApiKey(response.data);
  return {
    ...response.data,
    apiKey,
  };
};

/**
 * List all user's API keys
 * GET /api/v1/api-keys
 */
export const getApiKeys = async (
  params?: ApiKeyQueryParams,
): Promise<ApiKeysListResponse> => {
  const response = await apiClient.get<any>(
    API_ENDPOINTS.API_KEYS.ROOT,
    { params },
  );
  return {
    data: (response.data.data || []).map(transformApiKey),
    meta: response.data.meta || { total: 0, limit: 5 },
  };
};

/**
 * Get single API key details
 * GET /api/v1/api-keys/:id
 */
export const getApiKey = async (id: string): Promise<ApiKey> => {
  const response = await apiClient.get<any>(
    API_ENDPOINTS.API_KEYS.DETAIL(id),
  );
  return transformApiKey(response.data);
};

/**
 * Update API key
 * PATCH /api/v1/api-keys/:id
 */
export const updateApiKey = async (
  id: string,
  data: UpdateApiKeyRequest,
): Promise<ApiKey> => {
  const response = await apiClient.patch<any>(
    API_ENDPOINTS.API_KEYS.DETAIL(id),
    data,
  );
  return transformApiKey(response.data);
};

/**
 * Revoke/Delete API key
 * DELETE /api/v1/api-keys/:id
 */
export const revokeApiKey = async (
  id: string,
  reason?: string,
): Promise<ApiKey> => {
  const response = await apiClient.delete<ApiKey>(
    API_ENDPOINTS.API_KEYS.DETAIL(id),
    {
      data: reason ? { reason } : undefined,
    },
  );
  return response.data;
};

/**
 * Get API key usage statistics
 * GET /api/v1/api-keys/:id/usage
 */
export const getApiKeyUsage = async (id: string): Promise<ApiKeyUsage> => {
  const response = await apiClient.get<ApiKeyUsage>(
    API_ENDPOINTS.API_KEYS.USAGE(id),
  );
  return response.data;
};

// ============================================
// Constants (per CLIENT_DECISIONS.md)
// ============================================

/**
 * Maximum API keys per user
 * Default: 3 (admin can increase/decrease per user)
 */
export const MAX_API_KEYS = 3;

/**
 * API Key prefixes
 * Live: bshq_live_<random>
 * Test: bshq_test_<random>
 */
export const API_KEY_PREFIX_LIVE = 'bshq_live_';
export const API_KEY_PREFIX_TEST = 'bshq_test_';

// ============================================
// Helper Functions
// ============================================

/**
 * Format key prefix for display
 */
export const formatKeyPrefix = (prefix: string): string => {
  return `${prefix}...`;
};

/**
 * Get time since last used
 */
export const getLastUsedText = (lastUsedAt?: string): string => {
  if (!lastUsedAt) return 'Never used';

  const date = new Date(lastUsedAt);
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

/**
 * Format usage count
 */
export const formatUsageCount = (count: number): string => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  }
};
