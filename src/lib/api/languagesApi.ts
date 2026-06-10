import { apiClient } from '@/config/api-client.config';
import { API_ENDPOINTS } from '@/config/server.config';

// Shape used by the frontend (normalized)
export interface Language {
  id: string;
  code: string; // Flag/country code e.g. "GB" — shown in the avatar tile
  name: string; // Display name e.g. "English"
  langCode: string; // Google Translate code e.g. "en", "zh-CN"
  flag?: string;
  isActive: boolean;
  isDefault: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateLanguageRequest {
  code: string;
  name: string;
  langCode: string;
  flag?: string;
  isActive?: boolean;
  isDefault?: boolean;
  sortOrder?: number;
}

export interface UpdateLanguageRequest {
  name?: string;
  flag?: string;
  sortOrder?: number;
}

// ============================================
// Response normalization
// ============================================
// The backend wraps lists in multiple possible shapes and uses its own field
// names (e.g. `_id`, `code` for the google-translate code, `flag` for the
// country code). This helper normalizes both shape and field names so the rest
// of the app sees a clean `Language[]`.

type RawLanguage = {
  id?: string;
  _id?: string;
  code?: string;
  langCode?: string;
  lang_code?: string;
  name?: string;
  flag?: string;
  isActive?: boolean;
  is_active?: boolean;
  isDefault?: boolean;
  is_default?: boolean;
  sortOrder?: number;
  sort_order?: number;
  createdAt?: string;
  updatedAt?: string;
};

function extractList(raw: unknown): RawLanguage[] {
  if (Array.isArray(raw)) return raw as RawLanguage[];
  if (!raw || typeof raw !== 'object') return [];
  const r = raw as Record<string, unknown>;

  // Candidate paths, in order of likelihood
  const candidates: unknown[] = [
    r.data,
    r.languages,
    r.availableLanguages,
    r.items,
    r.results,
  ];

  // Nested data object
  if (r.data && typeof r.data === 'object' && !Array.isArray(r.data)) {
    const d = r.data as Record<string, unknown>;
    candidates.push(d.availableLanguages, d.languages, d.items, d.results);
  }

  for (const c of candidates) {
    if (Array.isArray(c)) return c as RawLanguage[];
  }
  return [];
}

// Backend returns the default language code as a sibling of the list
// (e.g. `{ data: { availableLanguages: [...], defaultLanguage: 'en' } }`).
// Extract it so callers can mark the matching language as default.
function extractDefaultLanguage(raw: unknown): string | undefined {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined;
  const r = raw as Record<string, unknown>;
  if (typeof r.defaultLanguage === 'string') return r.defaultLanguage;
  if (r.data && typeof r.data === 'object' && !Array.isArray(r.data)) {
    const d = r.data as Record<string, unknown>;
    if (typeof d.defaultLanguage === 'string') return d.defaultLanguage;
  }
  return undefined;
}

function normalize(raw: RawLanguage): Language {
  // Backend uses `code` for the Google Translate code (e.g. "en")
  // and `flag` for the country/flag code (e.g. "GB"). Map to our field names:
  //   code      -> flag/country code shown in the avatar (e.g. "GB")
  //   langCode  -> Google Translate code used for translation (e.g. "en")
  const gtCode = (raw.langCode || raw.lang_code || raw.code || '').toString();
  const flagCode = (raw.flag || raw.code || '').toString().toUpperCase();

  return {
    id: (raw.id || raw._id || '').toString(),
    code: flagCode,
    name: raw.name || '',
    langCode: gtCode,
    flag: raw.flag,
    isActive: raw.isActive ?? raw.is_active ?? false,
    isDefault: raw.isDefault ?? raw.is_default ?? false,
    sortOrder: raw.sortOrder ?? raw.sort_order ?? 0,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

function normalizeList(raw: unknown): Language[] {
  const defaultLang = extractDefaultLanguage(raw);
  return extractList(raw).map((item) => {
    const normalized = normalize(item);
    if (defaultLang && normalized.langCode === defaultLang) {
      return { ...normalized, isDefault: true };
    }
    return normalized;
  });
}

function normalizeOne(raw: unknown): Language {
  if (!raw || typeof raw !== 'object') return normalize({});
  const r = raw as Record<string, unknown>;
  // Unwrap { data: {...} }
  if (r.data && typeof r.data === 'object' && !Array.isArray(r.data)) {
    return normalize(r.data as RawLanguage);
  }
  return normalize(r as RawLanguage);
}

// ============================================
// Public
// ============================================

// GET /v1/languages — active languages only (used on the user side)
export const getActiveLanguages = async (): Promise<Language[]> => {
  const response = await apiClient.get(API_ENDPOINTS.LANGUAGES);
  return normalizeList(response.data);
};

// ============================================
// Admin
// ============================================

// GET /v1/admin/languages — full list (active + inactive)
export const getAllLanguages = async (): Promise<Language[]> => {
  const response = await apiClient.get(API_ENDPOINTS.ADMIN.LANGUAGES.ROOT);
  return normalizeList(response.data);
};

// POST /v1/admin/languages
export const createLanguage = async (
  data: CreateLanguageRequest,
): Promise<Language> => {
  const response = await apiClient.post(
    API_ENDPOINTS.ADMIN.LANGUAGES.ROOT,
    data,
  );
  return normalizeOne(response.data);
};

// PATCH /v1/admin/languages/:id/toggle — body: { isActive: boolean }
export const toggleLanguage = async (
  id: string,
  isActive: boolean,
): Promise<Language> => {
  const response = await apiClient.patch(
    API_ENDPOINTS.ADMIN.LANGUAGES.TOGGLE(id),
    { isActive },
  );
  return normalizeOne(response.data);
};

// PATCH /v1/admin/languages/:id — update name/flag/sortOrder
// (backend does not accept isDefault here; set the `default_language`
// system setting instead via bulkUpdateSettings)
export const updateLanguage = async (
  id: string,
  data: UpdateLanguageRequest,
): Promise<Language> => {
  const response = await apiClient.patch(
    API_ENDPOINTS.ADMIN.LANGUAGES.DETAIL(id),
    data,
  );
  return normalizeOne(response.data);
};

// DELETE /v1/admin/languages/:id
export const deleteLanguage = async (id: string): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.ADMIN.LANGUAGES.DETAIL(id));
};
