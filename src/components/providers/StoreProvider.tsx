'use client';

import { useRef, useEffect } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from '@/lib/store';
import { initializeAuth } from '@/lib/store/slices/authSlice';

interface StoreProviderProps {
  children: React.ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  const storeRef = useRef<AppStore | null>(null);

  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore();
  }

  useEffect(() => {
    // Initialize auth on mount (check for existing session)
    if (storeRef.current) {
      storeRef.current.dispatch(initializeAuth());
    }
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
