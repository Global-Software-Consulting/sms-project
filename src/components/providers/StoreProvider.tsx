'use client';

import { useRef, useEffect } from 'react';
import { Provider } from 'react-redux';
import { usePathname } from 'next/navigation';
import { makeStore, AppStore } from '@/store';
import { initializeAuth } from '@/store/slices/authSlice';
import { getAccessToken, getRefreshToken } from '@/lib/api';

interface StoreProviderProps {
  children: React.ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  const storeRef = useRef<AppStore | null>(null);
  const pathname = usePathname();
  const authInitialized = useRef(false);

  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore();
  }

  useEffect(() => {
    // Only initialize auth if:
    // 1. Not already initialized
    // 2. User has tokens (logged in before) OR is on a protected route
    const hasTokens = getAccessToken() || getRefreshToken();
    const isProtectedRoute = pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin');
    
    if (!authInitialized.current && storeRef.current && (hasTokens || isProtectedRoute)) {
      authInitialized.current = true;
      storeRef.current.dispatch(initializeAuth());
    }
  }, [pathname]);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
