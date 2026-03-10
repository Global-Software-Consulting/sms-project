// Token storage keys
const ACCESS_TOKEN_KEY = 'sms_access_token';
const REFRESH_TOKEN_KEY = 'sms_refresh_token';

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Get tokens from localStorage
 */
export const getTokens = (): Tokens | null => {
  if (typeof window === 'undefined') return null;

  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

  if (!accessToken || !refreshToken) return null;

  return { accessToken, refreshToken };
};

/**
 * Set tokens in localStorage
 */
export const setTokens = (accessToken: string, refreshToken: string): void => {
  if (typeof window === 'undefined') return;

  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

/**
 * Clear tokens from localStorage
 */
export const clearTokens = (): void => {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

/**
 * Get access token only
 */
export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Get refresh token only
 */
export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Check if user has valid tokens stored
 */
export const hasTokens = (): boolean => {
  const tokens = getTokens();
  return !!tokens?.accessToken && !!tokens?.refreshToken;
};
