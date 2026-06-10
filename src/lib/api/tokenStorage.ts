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

/**
 * Decode the `exp` claim from a JWT without verifying the signature.
 * Returns the expiry as epoch milliseconds, or null if the token is
 * malformed / has no `exp`.
 */
const getTokenExpiryMs = (token: string): number | null => {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    // Base64URL → Base64 → JSON
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(base64);
    const parsed = JSON.parse(decoded) as { exp?: number };
    return typeof parsed.exp === 'number' ? parsed.exp * 1000 : null;
  } catch {
    return null;
  }
};

/**
 * True when the access token expires within `bufferSec` (default 30s).
 * Lets the request interceptor refresh proactively so we never send a
 * request that will 401 — which would otherwise show up as a noisy
 * red request in the network panel before the silent retry succeeds.
 */
export const isAccessTokenExpiringSoon = (bufferSec = 30): boolean => {
  const token = getAccessToken();
  if (!token) return false;
  const expMs = getTokenExpiryMs(token);
  if (!expMs) return false;
  return Date.now() + bufferSec * 1000 >= expMs;
};
