import { apiClient } from '@/config/api-client.config';
import { API_ENDPOINTS } from '@/config/server.config';

// ============================================
// Types matching backend DTOs
// ============================================

/**
 * OAuth Account linked to user profile
 */
export interface OAuthAccount {
  provider: string;
  providerEmail: string;
  createdAt: string;
}

/**
 * Full user profile response from GET /users/profile
 */
export interface UserProfile {
  id: string;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  country: string | null;
  avatar: string | null;
  phone: string | null;
  role: 'USER' | 'SUPER_ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED' | 'SUSPENDED' | 'PENDING';
  emailVerified: boolean;
  phoneVerified: boolean;
  abuseScore: number;
  orderLimit: number | null;
  lastLoginAt: string | null;
  loginCount: number;
  createdAt: string;
  updatedAt: string;
  oauthAccounts: OAuthAccount[];
}

/**
 * Update profile request DTO
 * All fields are optional
 */
export interface UpdateProfileRequest {
  firstName?: string; // 2-50 chars
  lastName?: string; // 2-50 chars
  country?: string; // max 100 chars
  avatar?: string; // valid URL
  phone?: string; // format: +1234567890
}

/**
 * Change password request DTO
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string; // min 8 chars, uppercase, lowercase, number
}

/**
 * Generic message response (re-use from authApi)
 */
import type { MessageResponse } from './authApi';

// ============================================
// API Functions
// ============================================

/**
 * Get current user's full profile
 * GET /api/v1/users/profile
 */
export const getUserProfile = async (): Promise<UserProfile> => {
  const response = await apiClient.get<UserProfile>(
    API_ENDPOINTS.USERS.PROFILE,
  );
  return response.data;
};

/**
 * Update current user's profile
 * PATCH /api/v1/users/profile
 */
export const updateUserProfile = async (
  data: UpdateProfileRequest,
): Promise<UserProfile> => {
  const response = await apiClient.patch<UserProfile>(
    API_ENDPOINTS.USERS.PROFILE,
    data,
  );
  return response.data;
};

/**
 * Change current user's password
 * PATCH /api/v1/users/password
 */
export const changePassword = async (
  data: ChangePasswordRequest,
): Promise<MessageResponse> => {
  const response = await apiClient.patch<MessageResponse>(
    API_ENDPOINTS.USERS.PASSWORD,
    data,
  );
  return response.data;
};

/**
 * Delete current user's account
 * DELETE /api/v1/users/account
 * Note: Admins cannot delete their own accounts
 */
export const deleteAccount = async (): Promise<MessageResponse> => {
  const response = await apiClient.delete<MessageResponse>(
    API_ENDPOINTS.USERS.ACCOUNT,
  );
  return response.data;
};

// ============================================
// Validation Helpers
// ============================================

/**
 * Validate phone number format
 */
export const isValidPhone = (phone: string): boolean => {
  return /^\+?[1-9]\d{6,14}$/.test(phone);
};

/**
 * Validate password requirements
 */
export const validatePassword = (password: string) => {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    isValid:
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password),
  };
};
