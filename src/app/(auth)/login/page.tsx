"use client";

import React, { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, Lock, ArrowRight, KeyRound, ArrowLeft } from "lucide-react";
import { Button, Input, Checkbox, Divider, Alert } from "@/components/ui";
import { SocialButtons } from "@/components/auth/SocialButtons";
import { useAuth } from "@/hooks";
import { useToast } from "@/contexts/ToastContext";

/**
 * Login Page - Premium SMS Activation Platform
 * 
 * Features:
 * - Email/Password login
 * - Guest login (email OTP - no password required)
 * - OAuth: Google, GitHub, Telegram, Twitter/X
 * - Facebook removed per client request
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
  const toast = useToast();

  const {
    login,
    loginWithGoogle,
    loginWithGithub,
    requestGuestLogin,
    verifyGuestOtp,
    resetGuestLogin,
    isLoading,
    guestLoginLoading,
    guestLoginError,
    otpSent,
    otpEmail,
    error: authError,
    clearError,
  } = useAuth();

  // Login mode: 'password' or 'guest'
  const [loginMode, setLoginMode] = useState<'password' | 'guest'>('password');

  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  
  // Guest login state
  const [guestEmail, setGuestEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");

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

  useEffect(() => {
    if (guestLoginError) {
      setFormError(guestLoginError);
    }
  }, [guestLoginError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error when user starts typing
    if (formError) {
      setFormError(null);
      clearError();
    }
  };

  // Validate email format
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    // Client-side validation
    if (!formData.email.trim()) {
      setFormError("Please enter your email address.");
      return;
    }

    if (!isValidEmail(formData.email)) {
      setFormError("Please enter a valid email address.");
      return;
    }

    if (!formData.password) {
      setFormError("Please enter your password.");
      return;
    }

    if (formData.password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }

    // Attempt login
    const result = await login({
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    });

    if (!result.success) { 
      // The error message from the API will be shown
      const errorMsg = result.error || "Login failed. Please check your credentials and try again.";
      setFormError(errorMsg);
      toast.error(errorMsg, "Login Failed");
    } else {
      toast.success("Welcome back! Redirecting to dashboard...", "Login Successful");
    }
  };

  // Guest login - request OTP
  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    // Client-side validation
    if (!guestEmail.trim()) {
      setFormError("Please enter your email address.");
      return;
    }

    if (!isValidEmail(guestEmail)) {
      setFormError("Please enter a valid email address.");
      return;
    }

    const result = await requestGuestLogin(guestEmail.trim().toLowerCase());
    if (!result.success) {
      const errorMsg = result.error || "Failed to send verification code. Please try again.";
      setFormError(errorMsg);
      toast.error(errorMsg, "Failed to Send Code");
    } else {
      toast.success("Verification code sent to your email!", "Code Sent");
    }
  };

  // Guest login - verify OTP
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (!otpEmail) {
      setFormError("Session expired. Please request a new code.");
      return;
    }

    if (otpCode.length !== 6) {
      setFormError("Please enter the 6-digit verification code.");
      return;
    }

    const result = await verifyGuestOtp(otpEmail, otpCode);
    if (!result.success) {
      const errorMsg = result.error || "Invalid or expired verification code. Please try again.";
      setFormError(errorMsg);
      toast.error(errorMsg, "Verification Failed");
    } else {
      toast.success("Welcome! Redirecting to dashboard...", "Login Successful");
    }
  };

  const handleBackToGuestEmail = () => {
    resetGuestLogin();
    setOtpCode("");
    setFormError(null);
  };

  const handleSwitchLoginMode = (mode: 'password' | 'guest') => {
    setLoginMode(mode);
    setFormError(null);
    clearError();
    resetGuestLogin();
    setOtpCode("");
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

      {/* Social Buttons - mb: 24px (Google, GitHub active; Telegram, Twitter coming soon) */}
      <div style={{ marginBottom: '24px' }}>
        <SocialButtons
          onGoogleClick={loginWithGoogle}
          onGithubClick={loginWithGithub}
          isLoading={isLoading || guestLoginLoading}
          showAllProviders={true}
        />
      </div>

      {/* Divider - my: 24px */}
      <div style={{ margin: '24px 0' }}>
        <Divider>or continue with email</Divider>
      </div>

      {/* Login Mode Toggle */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '20px',
        padding: '4px',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '10px'
      }}>
        <button
          type="button"
          onClick={() => handleSwitchLoginMode('password')}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 150ms ease',
            backgroundColor: loginMode === 'password' ? 'var(--bg-card)' : 'transparent',
            color: loginMode === 'password' ? 'var(--text-primary)' : 'var(--text-muted)',
            boxShadow: loginMode === 'password' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
          }}
        >
          <Lock style={{ width: '14px', height: '14px', display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
          Password
        </button>
        <button
          type="button"
          onClick={() => handleSwitchLoginMode('guest')}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 150ms ease',
            backgroundColor: loginMode === 'guest' ? 'var(--bg-card)' : 'transparent',
            color: loginMode === 'guest' ? 'var(--text-primary)' : 'var(--text-muted)',
            boxShadow: loginMode === 'guest' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
          }}
        >
          <KeyRound style={{ width: '14px', height: '14px', display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
          Email Code
        </button>
      </div>

      {/* Password Login Form */}
      {loginMode === 'password' && (
        <form 
          onSubmit={handleSubmit}
          noValidate
        >
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

            {/* Submit */}
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
      )}

      {/* Guest Login Form (Email OTP) */}
      {loginMode === 'guest' && !otpSent && (
        <form 
          onSubmit={handleGuestSubmit}
          noValidate
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ 
              padding: '16px', 
              backgroundColor: 'rgba(198, 167, 94, 0.1)', 
              borderRadius: '12px',
              border: '1px solid rgba(198, 167, 94, 0.2)'
            }}>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
                <strong style={{ color: 'var(--accent-gold)' }}>Quick login:</strong> Enter your email and we&apos;ll send you a one-time code. No password needed!
              </p>
            </div>

            <Input
              label="Email address"
              type="email"
              placeholder="Enter your email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              leftIcon={<Mail style={{ width: '20px', height: '20px' }} />}
              autoComplete="email"
              disabled={guestLoginLoading}
            />

            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={guestLoginLoading}
              rightIcon={<ArrowRight style={{ width: '20px', height: '20px' }} />}
            >
              Send Code
            </Button>
          </div>
        </form>
      )}

      {/* OTP Verification Form */}
      {loginMode === 'guest' && otpSent && (
        <form 
          onSubmit={handleOtpSubmit}
          noValidate
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <button
              type="button"
              onClick={handleBackToGuestEmail}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: 0,
                border: 'none',
                background: 'none',
                color: 'var(--text-muted)',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              <ArrowLeft style={{ width: '16px', height: '16px' }} />
              Back
            </button>

            <div style={{ 
              padding: '16px', 
              backgroundColor: 'rgba(34, 197, 94, 0.1)', 
              borderRadius: '12px',
              border: '1px solid rgba(34, 197, 94, 0.2)'
            }}>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
                We sent a 6-digit code to <strong style={{ color: 'var(--success)' }}>{otpEmail}</strong>. 
                Enter it below to sign in.
              </p>
            </div>

            <Input
              label="Verification Code"
              type="text"
              placeholder="Enter 6-digit code"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              leftIcon={<KeyRound style={{ width: '20px', height: '20px' }} />}
              maxLength={6}
              disabled={guestLoginLoading}
              autoFocus
            />

            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={guestLoginLoading}
              disabled={otpCode.length !== 6}
              rightIcon={<ArrowRight style={{ width: '20px', height: '20px' }} />}
            >
              Verify & Sign In
            </Button>
          </div>
        </form>
      )}

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
