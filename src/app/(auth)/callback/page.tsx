'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch } from '@/lib/store/hooks';
import { setAuthTokens, initializeAuth } from '@/lib/store/slices/authSlice';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double processing in strict mode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const error = searchParams.get('error');

    if (error) {
      // Redirect to login with error
      router.replace(`/login?error=${encodeURIComponent(error)}`);
      return;
    }

    if (accessToken && refreshToken) {
      // Store tokens
      dispatch(setAuthTokens({ accessToken, refreshToken }));
      
      // Initialize auth state with the new tokens
      dispatch(initializeAuth()).then(() => {
        // Redirect to dashboard
        router.replace('/dashboard');
      });
    } else {
      // No tokens, redirect to login
      router.replace('/login?error=Authentication failed');
    }
  }, [searchParams, dispatch, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[var(--accent-primary)] border-t-transparent mb-4" />
        <p className="text-[var(--text-secondary)]">Completing authentication...</p>
      </div>
    </div>
  );
}

