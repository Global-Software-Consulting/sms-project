import { apiClient } from '@/config/client.config';
import { setTokens, clearTokens, getRefreshToken } from './tokenStorage';
import { API_ENDPOINTS } from '@/config/server.config';

// ============================================
// Types matching backend DTOs (Phase 1 Updated)
// ============================================

/**
 * User Roles - 6 admin-level roles + USER
 * Hierarchy: USER < VIEWER < SUPPORT < FINANCE < MANAGER < ADMIN < OWNER
 */
export type UserRole =
  | 'USER' // Regular user, no admin access
  | 'VIEWER' // Read-only admin access
  | 'SUPPORT' // Read + limited update on users/orders
  | 'FINANCE' // Full access to payments/wallets/refunds
  | 'MANAGER' // Manage users, orders, providers, SEO
  | 'ADMIN' // Full access except system settings
  | 'OWNER'; // Full access including system settings

export type UserStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'BANNED'
  | 'SUSPENDED'
  | 'PENDING';

/**
 * Role hierarchy levels for permission checks
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  USER: 0,
  VIEWER: 1,
  SUPPORT: 2,
  FINANCE: 3,
  MANAGER: 4,
  ADMIN: 5,
  OWNER: 6,
};

/**
 * Admin roles (all roles except USER)
 */
export const ADMIN_ROLES: UserRole[] = [
  'VIEWER',
  'SUPPORT',
  'FINANCE',
  'MANAGER',
  'ADMIN',
  'OWNER',
];

// Role checking helpers
export const isAdmin = (role: UserRole): boolean => ADMIN_ROLES.includes(role);
export const isOwner = (role: UserRole): boolean => role === 'OWNER';
export const isUser = (role: UserRole): boolean => role === 'USER';
export const hasHigherRole = (
  userRole: UserRole,
  targetRole: UserRole,
): boolean => ROLE_HIERARCHY[userRole] > ROLE_HIERARCHY[targetRole];
export const hasEqualOrHigherRole = (
  userRole: UserRole,
  targetRole: UserRole,
): boolean => ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[targetRole];

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string | null;
  avatar: string | null;
  phone: string | null;
  country: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  abuseScore: number;
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
  username?: string; // Optional - 3-24 chars, letters/numbers/._ only
  country: string;
  password: string;
}

export interface VerifyEmailRequest {
  code: string;
}

export interface GuestLoginRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
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
export const registerUser = async (
  data: RegisterRequest,
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(
    API_ENDPOINTS.AUTH.REGISTER,
    data,
  );
  const { accessToken, refreshToken } = response.data;
  setTokens(accessToken, refreshToken);
  return response.data;
};

/**
 * Login with email and password
 */
export const loginUser = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(
    API_ENDPOINTS.AUTH.LOGIN,
    data,
  );
  const { accessToken, refreshToken } = response.data;
  setTokens(accessToken, refreshToken);
  return response.data;
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<User>(API_ENDPOINTS.AUTH.ME);
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
  const response = await apiClient.post<AuthResponse>(
    API_ENDPOINTS.AUTH.REFRESH,
    { refreshToken },
  );
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
    const response = await apiClient.post<MessageResponse>(
      API_ENDPOINTS.AUTH.LOGOUT,
      { refreshToken },
    );
    return response.data;
  } finally {
    clearTokens();
  }
};

/**
 * Request email verification OTP
 */
export const requestEmailVerification = async (): Promise<OtpResponse> => {
  const response = await apiClient.post<OtpResponse>(
    API_ENDPOINTS.AUTH.REQUEST_EMAIL_VERIFICATION,
  );
  return response.data;
};

/**
 * Verify email with OTP code
 */
export const verifyEmail = async (code: string): Promise<MessageResponse> => {
  const response = await apiClient.post<MessageResponse>(
    API_ENDPOINTS.AUTH.VERIFY_EMAIL,
    { code },
  );
  return response.data;
};

/**
 * Request guest login OTP (email-code-only, no password required)
 * POST /api/v1/auth/guest
 */
export const requestGuestLogin = async (
  email: string,
): Promise<OtpResponse> => {
  const response = await apiClient.post<OtpResponse>(API_ENDPOINTS.AUTH.GUEST, {
    email,
  });
  return response.data;
};

/**
 * Verify OTP and login (for guest login flow)
 * POST /api/v1/auth/verify-otp
 */
export const verifyOtpAndLogin = async (
  data: VerifyOtpRequest,
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(
    API_ENDPOINTS.AUTH.VERIFY_OTP,
    data,
  );
  const { accessToken, refreshToken } = response.data;
  setTokens(accessToken, refreshToken);
  return response.data;
};

// ============================================
// OAuth URLs
// ============================================

export const getGoogleOAuthUrl = (): string => {
  return `${apiClient.defaults.baseURL}${API_ENDPOINTS.AUTH.GOOGLE}`;
};

export const getGithubOAuthUrl = (): string => {
  return `${apiClient.defaults.baseURL}${API_ENDPOINTS.AUTH.GITHUB}`;
};

/**
 * Telegram OAuth URL
 * Note: Telegram uses a different flow (widget-based)
 */
export const getTelegramOAuthUrl = (): string => {
  return `${apiClient.defaults.baseURL}${API_ENDPOINTS.AUTH.TELEGRAM}`;
};

/**
 * Twitter/X OAuth URL
 */
export const getTwitterOAuthUrl = (): string => {
  return `${apiClient.defaults.baseURL}${API_ENDPOINTS.AUTH.TWITTER}`;
};
