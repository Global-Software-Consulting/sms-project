"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { Button, Input, Checkbox, Divider, Alert } from "@/components/ui";
import { SocialButtons } from "@/components/auth/SocialButtons";

/**
 * Login Page - Following Design Guidelines
 * 
 * Spacing:
 * - Header margin-bottom: 32px
 * - Form gap: 20px between groups
 * - Section dividers: 24px margin
 * - Footer margin-top: 32px
 */
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const error = searchParams.get("error");

  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(
    error === "CredentialsSignin" ? "Invalid email or password" : null
  );
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setFormError("Invalid email or password. Please try again.");
      } else if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setFormError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "github") => {
    setIsLoading(true);
    try {
      await signIn(provider, { callbackUrl });
    } catch {
      setFormError(`Failed to login with ${provider}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-slide-up">
      {/* Header - 32px margin bottom */}
      <div className="text-center lg:text-left mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-3">
          Welcome back
        </h1>
        <p className="text-text-secondary text-base">
          Sign in to your account to continue
        </p>
      </div>

      {/* Error Alert - 24px margin bottom */}
      {formError && (
        <Alert variant="error" className="mb-6" dismissible onDismiss={() => setFormError(null)}>
          {formError}
        </Alert>
      )}

      {/* Social Login */}
      <SocialButtons
        onGoogleClick={() => handleSocialLogin("google")}
        onGithubClick={() => handleSocialLogin("github")}
        isLoading={isLoading}
      />

      {/* Divider - 24px margin */}
      <Divider>or continue with email</Divider>

      {/* Login Form - 20px gap between form groups */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input
          label="Email address"
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          leftIcon={<Mail className="w-5 h-5" />}
          required
          autoComplete="email"
        />

        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          leftIcon={<Lock className="w-5 h-5" />}
          required
          autoComplete="current-password"
        />

        {/* Remember me row - 16px margin top */}
        <div className="flex items-center justify-between mt-1">
          <Checkbox
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
            label="Remember me"
          />
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-accent-gold hover:text-accent-gold-bright transition-colors duration-150"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit button - 8px extra margin top */}
        <div className="mt-2">
          <Button
            type="submit"
            fullWidth
            size="lg"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-5 h-5" />}
          >
            Sign in
          </Button>
        </div>
      </form>

      {/* Demo Credentials - 24px margin top */}
      <div className="mt-6 p-4 rounded-xl bg-accent-gold/5 border border-accent-gold/20">
        <p className="text-sm text-text-secondary mb-2">
          <strong className="text-text-primary">Demo credentials:</strong>
        </p>
        <div className="space-y-1">
          <p className="text-sm text-text-muted">
            Email: <code className="text-accent-gold font-mono text-xs bg-bg-secondary px-1.5 py-0.5 rounded">demo@example.com</code>
          </p>
          <p className="text-sm text-text-muted">
            Password: <code className="text-accent-gold font-mono text-xs bg-bg-secondary px-1.5 py-0.5 rounded">Demo@123</code>
          </p>
        </div>
      </div>

      {/* Footer - 32px margin top */}
      <p className="mt-8 text-center text-sm text-text-secondary">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-accent-gold hover:text-accent-gold-bright transition-colors duration-150"
        >
          Create account
        </Link>
      </p>

      {/* Trust Indicators - 32px margin top, 24px padding top */}
      <div className="mt-8 pt-6 border-t border-border-default">
        <div className="flex items-center justify-center gap-8 text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span>256-bit SSL</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span>2FA Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span>GDPR Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="h-10 w-48 skeleton rounded-lg" />
        <div className="h-5 w-64 skeleton rounded-lg" />
        <div className="h-11 w-full skeleton rounded-xl mt-8" />
        <div className="h-11 w-full skeleton rounded-xl" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
