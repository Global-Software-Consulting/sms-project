"use client";

import React, { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { Button, Input, Checkbox, Divider, Alert } from "@/components/ui";
import { SocialButtons } from "@/components/auth/SocialButtons";
import { useAuth } from "@/hooks";

/**
 * Login Page - Premium SMS Activation Platform
 * 
 * SPACING (Design Guidelines 6.3.1):
 * - Header margin-bottom: 32px
 * - Social buttons margin-bottom: 24px
 * - Divider margin: 24px vertical
 * - Form fields gap: 20px
 * - Submit margin-top: 24px
 * - Footer margin-top: 32px
 */
function LoginForm() {
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  const {
    login,
    loginWithGoogle,
    loginWithGithub,
    isLoading,
    error: authError,
    clearError,
  } = useAuth();

  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  useEffect(() => {
    if (urlError) {
      setFormError(decodeURIComponent(urlError));
    }
  }, [urlError]);

  useEffect(() => {
    if (authError) {
      setFormError(authError);
    }
  }, [authError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setFormError(null);
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const result = await login({
      email: formData.email,
      password: formData.password,
    });

    if (!result.success) {
      setFormError(result.error || "Login failed. Please try again.");
    }
  };

  const handleDismissError = () => {
    setFormError(null);
    clearError();
  };

  return (
    <div className="animate-slide-up">
      {/* Header - mb: 32px */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: 700, 
          color: 'var(--text-primary)', 
          lineHeight: 1.2, 
          marginBottom: '12px' 
        }} className="sm:!text-[32px]">
          Welcome back
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Sign in to your account to continue
        </p>
      </div>

      {/* Error Alert */}
      {formError && (
        <div style={{ marginBottom: '24px' }}>
          <Alert variant="error" dismissible onDismiss={handleDismissError}>
            {formError}
          </Alert>
        </div>
      )}

      {/* Social Buttons - mb: 24px */}
      <div style={{ marginBottom: '24px' }}>
        <SocialButtons
          onGoogleClick={loginWithGoogle}
          onGithubClick={loginWithGithub}
          isLoading={isLoading}
        />
      </div>

      {/* Divider - my: 24px */}
      <div style={{ margin: '24px 0' }}>
        <Divider>or continue with email</Divider>
      </div>

      {/* Form - gap: 20px */}
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Email */}
          <Input
            label="Email address"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            leftIcon={<Mail style={{ width: '20px', height: '20px' }} />}
            required
            autoComplete="email"
            disabled={isLoading}
          />

          {/* Password */}
          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            leftIcon={<Lock style={{ width: '20px', height: '20px' }} />}
            required
            autoComplete="current-password"
            disabled={isLoading}
          />

          {/* Remember & Forgot */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <Checkbox
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              label="Remember me"
              disabled={isLoading}
            />
            <Link
              href="/forgot-password"
              style={{ fontSize: '14px', fontWeight: 500, color: 'var(--accent-gold)', textDecoration: 'none' }}
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit - mt: 24px (extra 4px from gap) */}
          <div style={{ marginTop: '4px' }}>
            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isLoading}
              rightIcon={<ArrowRight style={{ width: '20px', height: '20px' }} />}
            >
              Sign in
            </Button>
          </div>
        </div>
      </form>

      {/* Footer - mt: 32px */}
      <p style={{ marginTop: '32px', textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          style={{ fontWeight: 600, color: 'var(--accent-gold)', textDecoration: 'none' }}
        >
          Create account
        </Link>
      </p>

      {/* Trust Indicators - mt: 32px, pt: 24px */}
      <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border-default)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)' }} />
            <span>256-bit SSL</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)' }} />
            <span>2FA Available</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)' }} />
            <span>GDPR Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <div style={{ height: '40px', width: '192px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', marginBottom: '12px' }} className="animate-pulse" />
        <div style={{ height: '20px', width: '256px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }} className="animate-pulse" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={{ height: '48px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px' }} className="animate-pulse" />
        <div style={{ height: '48px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px' }} className="animate-pulse" />
      </div>
      <div style={{ height: '48px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px' }} className="animate-pulse" />
      <div style={{ height: '48px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px' }} className="animate-pulse" />
      <div style={{ height: '48px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px' }} className="animate-pulse" />
    </div>
  );
}
