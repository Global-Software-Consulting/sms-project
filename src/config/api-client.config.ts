import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getTokens, setTokens, clearTokens } from '@/lib/api/tokenStorage';
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
  withCredentials: true,
});

// ============================================
// Request Deduplication for GET requests
// If the same GET URL is requested while one is already in-flight,
// reuse the existing promise instead of making a duplicate request.
// ============================================
const inflightRequests = new Map<string, Promise<unknown>>();

export const apiClient = {
  ...axiosInstance,
  get: <T = unknown>(url: string, config?: Parameters<typeof axiosInstance.get>[1]) => {
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
  post: axiosInstance.post.bind(axiosInstance),
  put: axiosInstance.put.bind(axiosInstance),
  patch: axiosInstance.patch.bind(axiosInstance),
  delete: axiosInstance.delete.bind(axiosInstance),
  interceptors: axiosInstance.interceptors,
  defaults: axiosInstance.defaults,
} as typeof axiosInstance;

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
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

// Request interceptor - Add auth token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const tokens = getTokens();
    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Auth endpoints that should NOT trigger token refresh on 401
// These endpoints are expected to return 401 for invalid credentials
const AUTH_ENDPOINT_LIST = [
  API_ENDPOINTS.AUTH.LOGIN,
  API_ENDPOINTS.AUTH.REGISTER,
  API_ENDPOINTS.AUTH.GUEST,
  API_ENDPOINTS.AUTH.VERIFY_OTP,
  API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
];

// Check if the request URL is an auth endpoint
const isAuthEndpoint = (url: string | undefined): boolean => {
  if (!url) return false;
  return AUTH_ENDPOINT_LIST.some((endpoint) => url.includes(endpoint));
};

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
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const tokens = getTokens();
      if (!tokens?.refreshToken) {
        clearTokens();
        isRefreshing = false;
        // Redirect to login if no refresh token
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
        return Promise.reject(error);
      }

      try {
        // Attempt to refresh token
        const response = await axios.post(
          `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
          {
            refreshToken: tokens.refreshToken,
          },
        );

        const { accessToken, refreshToken } = response.data;
        setTokens(accessToken, refreshToken);

        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
