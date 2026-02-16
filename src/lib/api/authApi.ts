import { apiClient } from './config';
import { setTokens, clearTokens, getRefreshToken } from './tokenStorage';

// ============================================
// Types matching backend DTOs
// ============================================

export type UserRole = 'USER' | 'SUPER_ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED' | 'SUSPENDED' | 'PENDING';

// Role checking helpers
export const isAdmin = (role: UserRole): boolean => role === 'SUPER_ADMIN';
export const isUser = (role: UserRole): boolean => role === 'USER';

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

export interface MessageResponse {
  message: string;
  success: boolean;
}

export interface OtpResponse {
  message: string;
  success: boolean;
  expiresIn: number;
}

// ============================================
// Request DTOs
// ============================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  country: string;
  password: string;
}

export interface VerifyEmailRequest {
  code: string;
}

// ============================================
// API Error type
// ============================================

export interface ApiError {
  message: string | string[];
  error?: string;
  statusCode: number;
}

// ============================================
// Auth API Functions
// ============================================

/**
 * Register a new user
 */
export const registerUser = async (data: RegisterRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/register', data);
  const { accessToken, refreshToken } = response.data;
  setTokens(accessToken, refreshToken);
  return response.data;
};

/**
 * Login with email and password
 */
export const loginUser = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', data);
  const { accessToken, refreshToken } = response.data;
  setTokens(accessToken, refreshToken);
  return response.data;
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<User>('/auth/me');
  return response.data;
};

/**
 * Refresh access token
 */
export const refreshTokens = async (): Promise<AuthResponse> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  const response = await apiClient.post<AuthResponse>('/auth/refresh', { refreshToken });
  const { accessToken, refreshToken: newRefreshToken } = response.data;
  setTokens(accessToken, newRefreshToken);
  return response.data;
};

/**
 * Logout user
 */
export const logoutUser = async (): Promise<MessageResponse> => {
  try {
    const refreshToken = getRefreshToken();
    const response = await apiClient.post<MessageResponse>('/auth/logout', { refreshToken });
    return response.data;
  } finally {
    clearTokens();
  }
};

/**
 * Request email verification OTP
 */
export const requestEmailVerification = async (): Promise<OtpResponse> => {
  const response = await apiClient.post<OtpResponse>('/auth/request-email-verification');
  return response.data;
};

/**
 * Verify email with OTP code
 */
export const verifyEmail = async (code: string): Promise<MessageResponse> => {
  const response = await apiClient.post<MessageResponse>('/auth/verify-email', { code });
  return response.data;
};

// ============================================
// OAuth URLs
// ============================================

export const getGoogleOAuthUrl = (): string => {
  return `${apiClient.defaults.baseURL}/auth/google`;
};

export const getFacebookOAuthUrl = (): string => {
  return `${apiClient.defaults.baseURL}/auth/facebook`;
};

export const getGithubOAuthUrl = (): string => {
  return `${apiClient.defaults.baseURL}/auth/github`;
};

