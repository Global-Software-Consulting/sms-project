import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
  getTokens,
  setTokens,
  clearTokens,
  isAccessTokenExpiringSoon,
} from '@/lib/api/tokenStorage';
import { API_ENDPOINTS } from '@/config/server.config';

// API Base URL
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
  timeout: 30000, // 30 second timeout
});

// ============================================
// Request Deduplication for GET requests
// If the same GET URL is requested while one is already in-flight,
// reuse the existing promise instead of making a duplicate request.
// ============================================
const inflightRequests = new Map<string, Promise<unknown>>();

export const apiClient = {
  get: <T = unknown>(
    url: string,
    config?: Parameters<typeof axiosInstance.get>[1],
  ) => {
    const key = `GET:${url}:${JSON.stringify(config?.params || {})}`;
    const existing = inflightRequests.get(key);
    if (existing) {
      return existing as Promise<import('axios').AxiosResponse<T>>;
    }
    const request = axiosInstance.get<T>(url, config).finally(() => {
      inflightRequests.delete(key);
    });
    inflightRequests.set(key, request);
    return request;
  },
  post: <T = unknown>(
    url: string,
    data?: unknown,
    config?: Parameters<typeof axiosInstance.post>[2],
  ) => axiosInstance.post<T>(url, data, config),
  put: <T = unknown>(
    url: string,
    data?: unknown,
    config?: Parameters<typeof axiosInstance.put>[2],
  ) => axiosInstance.put<T>(url, data, config),
  patch: <T = unknown>(
    url: string,
    data?: unknown,
    config?: Parameters<typeof axiosInstance.patch>[2],
  ) => axiosInstance.patch<T>(url, data, config),
  delete: <T = unknown>(
    url: string,
    config?: Parameters<typeof axiosInstance.delete>[1],
  ) => axiosInstance.delete<T>(url, config),
  interceptors: axiosInstance.interceptors,
  defaults: axiosInstance.defaults,
} as typeof axiosInstance;

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Auth endpoints that should NOT trigger token refresh on 401
// These endpoints are expected to return 401 for invalid credentials
const AUTH_ENDPOINT_LIST = [
  API_ENDPOINTS.AUTH.LOGIN,
  API_ENDPOINTS.AUTH.REGISTER,
  API_ENDPOINTS.AUTH.GUEST,
  API_ENDPOINTS.AUTH.VERIFY_OTP,
  API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
  API_ENDPOINTS.AUTH.RESET_PASSWORD,
  API_ENDPOINTS.AUTH.REFRESH, // Don't retry refresh endpoint
];

// Check if the request URL is an auth endpoint
const isAuthEndpoint = (url: string | undefined): boolean => {
  if (!url) return false;
  return AUTH_ENDPOINT_LIST.some((endpoint) => url.includes(endpoint));
};

// Centralized refresh token function
const refreshAccessToken = async (): Promise<string> => {
  const tokens = getTokens();
  if (!tokens?.refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await axios.post(
    `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
    { refreshToken: tokens.refreshToken },
    { timeout: 10000 }, // 10 second timeout for refresh
  );

  const { accessToken, refreshToken } = response.data;
  setTokens(accessToken, refreshToken);
  return accessToken;
};

// Shared "start refresh" helper. Used by both the proactive
// (request-time) and reactive (response 401) paths so all callers
// queue behind the same in-flight refresh promise.
const ensureFreshAccessToken = async (): Promise<string> => {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }
  isRefreshing = true;
  refreshPromise = refreshAccessToken()
    .then((newToken) => {
      processQueue(null, newToken);
      return newToken;
    })
    .catch((refreshError) => {
      processQueue(refreshError as Error, null);
      clearTokens();
      // Same rule as the response interceptor below: only force-route
      // to /auth/login when the user is on a protected page. On public
      // pages, just clear tokens and let the page render its logged-
      // out state.
      if (typeof window !== 'undefined') {
        const path = window.location.pathname || '';
        const isProtected =
          path.startsWith('/dashboard') || path.startsWith('/admin');
        if (isProtected) {
          window.location.href = '/auth/login';
        }
      }
      throw refreshError;
    })
    .finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });
  return refreshPromise;
};

// Request interceptor - Add auth token AND proactively refresh if the
// access token is within 30s of expiring. Without this, the first
// request after the token expires returns 401, the response interceptor
// refreshes, and the request is retried — visible as a red 401 in the
// network panel even though the user-facing call succeeds.
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Skip refresh for auth endpoints (login, refresh itself, etc.)
    if (!isAuthEndpoint(config.url) && isAccessTokenExpiringSoon()) {
      const tokens = getTokens();
      if (tokens?.refreshToken) {
        try {
          const newToken = await ensureFreshAccessToken();
          config.headers.Authorization = `Bearer ${newToken}`;
          return config;
        } catch {
          // Fall through — if refresh failed, send the (likely expired)
          // token and let the response interceptor handle the 401 path.
        }
      }
    }
    const tokens = getTokens();
    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - Handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Skip token refresh for auth endpoints - they handle their own 401 errors
    if (isAuthEndpoint(originalRequest?.url)) {
      return Promise.reject(error);
    }

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Check if we have tokens at all
      const tokens = getTokens();
      if (!tokens?.refreshToken) {
        clearTokens();
        // Only force-navigate to login when the user is currently on a
        // protected page (dashboard / admin). Public pages (home,
        // /membership, /faq, etc.) should remain reachable for logged-
        // out users — otherwise a single unauthenticated API call from
        // the landing page kicks them straight to /auth/login.
        if (typeof window !== 'undefined') {
          const path = window.location.pathname || '';
          const isProtected =
            path.startsWith('/dashboard') || path.startsWith('/admin');
          if (isProtected) {
            window.location.href = '/auth/login';
          }
        }
        return Promise.reject(error);
      }

      try {
        const newToken = await ensureFreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
