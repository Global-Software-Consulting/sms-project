'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch } from '@/lib/store/hooks';
import { setAuthTokens, initializeAuth } from '@/lib/store/slices/authSlice';

function CallbackContent() {
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

    console.log('OAuth Callback - Processing tokens...');

    if (error) {
      console.error('OAuth Error:', error);
      router.replace(`/login?error=${encodeURIComponent(error)}`);
      return;
    }

    if (accessToken && refreshToken) {
      console.log('OAuth Success - Storing tokens...');
      // Store tokens
      dispatch(setAuthTokens({ accessToken, refreshToken }));
      
      // Initialize auth state with the new tokens
      dispatch(initializeAuth()).then(() => {
        console.log('Auth initialized - Redirecting to dashboard...');
        router.replace('/dashboard');
      });
    } else {
      console.error('OAuth Failed - No tokens received');
      router.replace('/login?error=Authentication failed');
    }
  }, [searchParams, dispatch, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-accent-gold border-t-transparent mb-4" />
        <p className="text-text-secondary">Completing authentication...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-bg-primary">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-accent-gold border-t-transparent mb-4" />
            <p className="text-text-secondary">Loading...</p>
          </div>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}


