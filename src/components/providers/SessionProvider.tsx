"use client";

/**
 * SessionProvider - Placeholder for backward compatibility
 * 
 * Auth is now handled by Redux store via AuthInitializer.
 * This component is kept for any legacy code that might reference it.
 */

interface SessionProviderProps {
  children: React.ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  return <>{children}</>;
}
