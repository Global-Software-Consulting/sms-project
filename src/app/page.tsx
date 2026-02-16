"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks";

/**
 * Root Page - Redirects based on authentication status
 * 
 * - If user is logged in → redirect to /dashboard
 * - If user is not logged in → redirect to /login
 */
export default function Home() {
  const { isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized) {
      if (isAuthenticated) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    }
  }, [isAuthenticated, isInitialized, router]);

  // Show loading state while checking authentication
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full border-4 border-accent-gold border-t-transparent animate-spin" />
        <p className="text-text-muted">Loading...</p>
      </div>
    </div>
  );
}
