'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  login,
  register,
  logout,
  initializeAuth,
  sendEmailVerification,
  verifyEmailOtp,
  clearError,
  setUser,
  selectUser,
  selectIsAuthenticated,
  selectIsLoading,
  selectIsInitialized,
  selectAuthError,
  selectEmailVerificationSent,
  selectUserRole,
  selectIsAdmin,
  selectIsUser,
} from '@/store/slices/authSlice';
import type { LoginRequest, RegisterRequest } from '@/lib/api';
import {
  getGoogleOAuthUrl,
  getGithubOAuthUrl,
  getTelegramOAuthUrl,
  getTwitterOAuthUrl,
  requestGuestLogin,
  verifyOtpAndLogin,
  isOwner as checkIsOwner,
} from '@/lib/api';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Guest login state
  const [guestLoginLoading, setGuestLoginLoading] = useState(false);
  const [guestLoginError, setGuestLoginError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpEmail, setOtpEmail] = useState<string | null>(null);

  // Selectors
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectIsLoading);
  const isInitialized = useAppSelector(selectIsInitialized);
  const error = useAppSelector(selectAuthError);
  const emailVerificationSent = useAppSelector(selectEmailVerificationSent);

  // Role selectors
  const userRole = useAppSelector(selectUserRole);
  const isAdmin = useAppSelector(selectIsAdmin);
  const isUser = useAppSelector(selectIsUser);

  // Auth initialization is handled by StoreProvider

  // Login handler
  const handleLogin = useCallback(
    async (credentials: LoginRequest) => {
      const result = await dispatch(login(credentials));
      if (login.fulfilled.match(result)) {
        // Redirect based on user role (supports 6 admin roles)
        const userRole = result.payload.user.role;
        if (checkIsOwner(userRole)) {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
        return { success: true };
      }
      return { success: false, error: result.payload as string };
    },
    [dispatch, router],
  );

  // Register handler
  const handleRegister = useCallback(
    async (data: RegisterRequest) => {
      const result = await dispatch(register(data));
      if (register.fulfilled.match(result)) {
        router.push('/dashboard');
        return { success: true };
      }
      return { success: false, error: result.payload as string };
    },
    [dispatch, router],
  );

  // Logout handler
  const handleLogout = useCallback(async () => {
    await dispatch(logout());
    router.push('/auth/login');
  }, [dispatch, router]);

  // Email verification handlers
  const handleSendEmailVerification = useCallback(async () => {
    const result = await dispatch(sendEmailVerification());
    return sendEmailVerification.fulfilled.match(result);
  }, [dispatch]);

  const handleVerifyEmail = useCallback(
    async (code: string) => {
      const result = await dispatch(verifyEmailOtp(code));
      return verifyEmailOtp.fulfilled.match(result);
    },
    [dispatch],
  );

  // Clear error
  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // OAuth handlers (Facebook removed per client decision)
  const loginWithGoogle = useCallback(() => {
    window.location.href = getGoogleOAuthUrl();
  }, []);

  const loginWithGithub = useCallback(() => {
    window.location.href = getGithubOAuthUrl();
  }, []);

  // New OAuth providers per client decision
  const loginWithTelegram = useCallback(() => {
    window.location.href = getTelegramOAuthUrl();
  }, []);

  const loginWithTwitter = useCallback(() => {
    window.location.href = getTwitterOAuthUrl();
  }, []);

  // Guest login handlers (email OTP flow - no password required)
  const handleRequestGuestLogin = useCallback(async (email: string) => {
    try {
      setGuestLoginLoading(true);
      setGuestLoginError(null);
      await requestGuestLogin(email);
      setOtpSent(true);
      setOtpEmail(email);
      return { success: true };
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const message = error.response?.data?.message || 'Failed to send OTP';
      setGuestLoginError(message);
      return { success: false, error: message };
    } finally {
      setGuestLoginLoading(false);
    }
  }, []);

  const handleVerifyGuestOtp = useCallback(
    async (email: string, code: string) => {
      try {
        setGuestLoginLoading(true);
        setGuestLoginError(null);
        const response = await verifyOtpAndLogin({ email, code });
        // Update Redux state with user
        dispatch(setUser(response.user));
        // Redirect based on role
        if (checkIsOwner(response.user.role)) {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
        return { success: true };
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        const message = error.response?.data?.message || 'Invalid OTP code';
        setGuestLoginError(message);
        return { success: false, error: message };
      } finally {
        setGuestLoginLoading(false);
      }
    },
    [dispatch, router],
  );

  const resetGuestLogin = useCallback(() => {
    setOtpSent(false);
    setOtpEmail(null);
    setGuestLoginError(null);
  }, []);

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    error,
    emailVerificationSent,

    // Role state
    userRole,
    isAdmin,
    isUser,

    // Guest login state
    guestLoginLoading,
    guestLoginError,
    otpSent,
    otpEmail,

    // Actions
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    sendEmailVerification: handleSendEmailVerification,
    verifyEmail: handleVerifyEmail,
    clearError: handleClearError,

    // OAuth (Facebook removed per client decision)
    loginWithGoogle,
    loginWithGithub,
    loginWithTelegram,
    loginWithTwitter,

    // Guest login (email OTP flow)
    requestGuestLogin: handleRequestGuestLogin,
    verifyGuestOtp: handleVerifyGuestOtp,
    resetGuestLogin,
  };
};

export default useAuth;
