'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
  login,
  register,
  logout,
  initializeAuth,
  sendEmailVerification,
  verifyEmailOtp,
  clearError,
  selectUser,
  selectIsAuthenticated,
  selectIsLoading,
  selectIsInitialized,
  selectAuthError,
  selectEmailVerificationSent,
  selectUserRole,
  selectIsAdmin,
  selectIsUser,
} from '@/lib/store/slices/authSlice';
import type { LoginRequest, RegisterRequest } from '@/lib/api';
import { getGoogleOAuthUrl, getGithubOAuthUrl } from '@/lib/api';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

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

  // Initialize auth on mount
  useEffect(() => {
    if (!isInitialized) {
      dispatch(initializeAuth());
    }
  }, [dispatch, isInitialized]);

  // Login handler
  const handleLogin = useCallback(
    async (credentials: LoginRequest) => {
      const result = await dispatch(login(credentials));
      if (login.fulfilled.match(result)) {
        // Redirect based on user role
        const userRole = result.payload.user.role;
        if (userRole === 'SUPER_ADMIN') {
          router.push('/admin');
        } else {
        router.push('/dashboard');
        }
        return { success: true };
      }
      return { success: false, error: result.payload as string };
    },
    [dispatch, router]
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
    [dispatch, router]
  );

  // Logout handler
  const handleLogout = useCallback(async () => {
    await dispatch(logout());
    router.push('/login');
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
    [dispatch]
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
  };
};

export default useAuth;

