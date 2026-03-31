import { apiClient } from '@/config/api-client.config';
import { API_ENDPOINTS } from '@/config/server.config';

// ============================================
// Settings Types
// ============================================

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  category: string;
  description?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GroupedSettings {
  [category: string]: SystemSetting[];
}

export interface CreateSettingRequest {
  key: string;
  value: string;
  category?: string;
  description?: string;
  isPublic?: boolean;
}

export interface UpdateSettingRequest {
  value: string;
  description?: string;
  isPublic?: boolean;
}

export interface BulkUpdateSettingsRequest {
  settings: { key: string; value: string }[];
}

export interface GeneralSettings {
  siteName: string;
  siteUrl: string;
  supportEmail: string;
  timezone: string;
  currency: string;
  language: string;
}

export interface MaintenanceSettings {
  isEnabled: boolean;
  message: string;
  allowedIPs: string[];
}

export interface LimitsSettings {
  maxOrdersPerDay: number;
  maxApiRequestsPerMinute: number;
  maxConcurrentOrders: number;
  minDepositAmount: number;
  maxDepositAmount: number;
}

export interface FeaturesSettings {
  registrationEnabled: boolean;
  guestCheckoutEnabled: boolean;
  referralSystemEnabled: boolean;
  reviewSystemEnabled: boolean;
  apiAccessEnabled: boolean;
}

// ============================================
// Settings API Functions
// ============================================

/**
 * Get all settings
 * GET /api/v1/admin/settings
 */
export const getAllSettings = async (): Promise<SystemSetting[]> => {
  const response = await apiClient.get<SystemSetting[]>(API_ENDPOINTS.ADMIN.SETTINGS.ROOT);
  return response.data;
};

/**
 * Get settings grouped by category
 * GET /api/v1/admin/settings/grouped
 */
export const getGroupedSettings = async (): Promise<GroupedSettings> => {
  const response = await apiClient.get<GroupedSettings>(API_ENDPOINTS.ADMIN.SETTINGS.GROUPED);
  return response.data;
};

/**
 * Get setting by key
 * GET /api/v1/admin/settings/key/:key
 */
export const getSettingByKey = async (key: string): Promise<SystemSetting> => {
  const response = await apiClient.get<SystemSetting>(API_ENDPOINTS.ADMIN.SETTINGS.BY_KEY(key));
  return response.data;
};

/**
 * Create a new setting
 * POST /api/v1/admin/settings
 */
export const createSetting = async (data: CreateSettingRequest): Promise<SystemSetting> => {
  const response = await apiClient.post<SystemSetting>(API_ENDPOINTS.ADMIN.SETTINGS.ROOT, data);
  return response.data;
};

/**
 * Update a setting by key
 * PATCH /api/v1/admin/settings/key/:key
 */
export const updateSetting = async (
  key: string,
  data: UpdateSettingRequest
): Promise<SystemSetting> => {
  const response = await apiClient.patch<SystemSetting>(
    API_ENDPOINTS.ADMIN.SETTINGS.BY_KEY(key),
    data
  );
  return response.data;
};

/**
 * Bulk update settings
 * POST /api/v1/admin/settings/bulk
 */
export const bulkUpdateSettings = async (
  data: BulkUpdateSettingsRequest
): Promise<{ updated: number }> => {
  const response = await apiClient.post<{ updated: number }>(
    API_ENDPOINTS.ADMIN.SETTINGS.BULK,
    data
  );
  return response.data;
};

/**
 * Delete a setting
 * DELETE /api/v1/admin/settings/key/:key
 */
export const deleteSetting = async (key: string): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.ADMIN.SETTINGS.BY_KEY(key));
};

/**
 * Seed default settings
 * POST /api/v1/admin/settings/seed
 */
export const seedSettingsDefaults = async (): Promise<{ created: string[]; skipped: string[] }> => {
  const response = await apiClient.post<{ created: string[]; skipped: string[] }>(
    API_ENDPOINTS.ADMIN.SETTINGS.SEED
  );
  return response.data;
};

/**
 * Get general settings
 * GET /api/v1/admin/settings/general
 */
export const getGeneralSettings = async (): Promise<GeneralSettings> => {
  const response = await apiClient.get<GeneralSettings>(API_ENDPOINTS.ADMIN.SETTINGS.GENERAL);
  return response.data;
};

/**
 * Get maintenance settings
 * GET /api/v1/admin/settings/maintenance
 */
export const getMaintenanceSettings = async (): Promise<MaintenanceSettings> => {
  const response = await apiClient.get<MaintenanceSettings>(
    API_ENDPOINTS.ADMIN.SETTINGS.MAINTENANCE
  );
  return response.data;
};

/**
 * Get limits settings
 * GET /api/v1/admin/settings/limits
 */
export const getLimitsSettings = async (): Promise<LimitsSettings> => {
  const response = await apiClient.get<LimitsSettings>(API_ENDPOINTS.ADMIN.SETTINGS.LIMITS);
  return response.data;
};

/**
 * Get features settings
 * GET /api/v1/admin/settings/features
 */
export const getFeaturesSettings = async (): Promise<FeaturesSettings> => {
  const response = await apiClient.get<FeaturesSettings>(API_ENDPOINTS.ADMIN.SETTINGS.FEATURES);
  return response.data;
};

// ============================================
// Helper Functions
// ============================================

/**
 * Parse JSON setting value safely
 */
export const parseSettingValue = <T>(value: string, defaultValue: T): T => {
  try {
    return JSON.parse(value) as T;
  } catch {
    return defaultValue;
  }
};

/**
 * Stringify setting value for storage
 */
export const stringifySettingValue = (value: unknown): string => {
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
};
