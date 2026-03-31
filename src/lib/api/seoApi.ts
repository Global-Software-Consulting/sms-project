import { apiClient } from '@/config/api-client.config';
import { API_ENDPOINTS } from '@/config/server.config';

// ============================================
// SEO Types
// ============================================

export interface SeoSettings {
  id: string;
  pagePath: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  noIndex: boolean;
  noFollow: boolean;
  structuredData?: Record<string, unknown>;
  updatedAt: string;
}

export interface CreateSeoSettingsRequest {
  pagePath: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  structuredData?: Record<string, unknown>;
}

export interface UpdateSeoSettingsRequest {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  structuredData?: Record<string, unknown>;
}

export interface SeedSeoResponse {
  created: string[];
  skipped: string[];
}

// ============================================
// SEO API Functions
// ============================================

/**
 * Get all SEO settings
 * GET /api/v1/admin/seo
 */
export const getAllSeoSettings = async (): Promise<SeoSettings[]> => {
  const response = await apiClient.get<SeoSettings[]>(API_ENDPOINTS.ADMIN.SEO.ROOT);
  return response.data;
};

/**
 * Get SEO settings by ID
 * GET /api/v1/admin/seo/:id
 */
export const getSeoSettingsById = async (id: string): Promise<SeoSettings> => {
  const response = await apiClient.get<SeoSettings>(API_ENDPOINTS.ADMIN.SEO.DETAIL(id));
  return response.data;
};

/**
 * Create SEO settings for a path
 * POST /api/v1/admin/seo
 */
export const createSeoSettings = async (
  data: CreateSeoSettingsRequest
): Promise<SeoSettings> => {
  const response = await apiClient.post<SeoSettings>(API_ENDPOINTS.ADMIN.SEO.ROOT, data);
  return response.data;
};

/**
 * Update SEO settings by path
 * PATCH /api/v1/admin/seo/path/:path
 */
export const updateSeoSettings = async (
  pagePath: string,
  data: UpdateSeoSettingsRequest
): Promise<SeoSettings> => {
  const response = await apiClient.patch<SeoSettings>(
    API_ENDPOINTS.ADMIN.SEO.BY_PATH(pagePath),
    data
  );
  return response.data;
};

/**
 * Upsert SEO settings (create or update)
 * POST /api/v1/admin/seo/upsert
 */
export const upsertSeoSettings = async (
  data: CreateSeoSettingsRequest
): Promise<SeoSettings> => {
  const response = await apiClient.post<SeoSettings>(API_ENDPOINTS.ADMIN.SEO.UPSERT, data);
  return response.data;
};

/**
 * Delete SEO settings by path
 * DELETE /api/v1/admin/seo/path/:path
 */
export const deleteSeoSettings = async (pagePath: string): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.ADMIN.SEO.BY_PATH(pagePath));
};

/**
 * Seed default SEO settings
 * POST /api/v1/admin/seo/seed
 */
export const seedSeoDefaults = async (): Promise<SeedSeoResponse> => {
  const response = await apiClient.post<SeedSeoResponse>(API_ENDPOINTS.ADMIN.SEO.SEED);
  return response.data;
};

// ============================================
// Helper Functions
// ============================================

/**
 * Transform API SEO settings to frontend PageSEO format
 */
export const transformToPageSEO = (settings: SeoSettings) => ({
  id: settings.id,
  pageName: getPageNameFromPath(settings.pagePath),
  url: settings.pagePath,
  metaTitle: settings.metaTitle || '',
  metaDescription: settings.metaDescription || '',
  keywords: settings.metaKeywords || '',
  canonicalUrl: settings.canonicalUrl || '',
  indexed: !settings.noIndex,
  ogTitle: settings.ogTitle,
  ogDescription: settings.ogDescription,
  ogImage: settings.ogImage,
  structuredData: settings.structuredData,
});

/**
 * Get page name from path
 */
const getPageNameFromPath = (path: string): string => {
  if (path === '/') return 'Home';
  const segments = path.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  return lastSegment
    .replace(/[-_]/g, ' ')
    .replace(/\*/g, '(All)')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Transform frontend PageSEO to API format
 */
export const transformToApiFormat = (page: {
  url: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  canonicalUrl: string;
  indexed: boolean;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  structuredData?: Record<string, unknown>;
}): CreateSeoSettingsRequest => ({
  pagePath: page.url,
  metaTitle: page.metaTitle || undefined,
  metaDescription: page.metaDescription || undefined,
  metaKeywords: page.keywords || undefined,
  canonicalUrl: page.canonicalUrl || undefined,
  noIndex: !page.indexed,
  noFollow: false,
  ogTitle: page.ogTitle,
  ogDescription: page.ogDescription,
  ogImage: page.ogImage,
  structuredData: page.structuredData,
});
