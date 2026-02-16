"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, ArrowRight, CheckCircle2, Check, AlertTriangle } from "lucide-react";
import { Button, Input, Alert, Card, CardContent } from "@/components/ui";

/**
 * Reset Password Page - Following Design Guidelines
 */
function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const validatePassword = (password: string) => {
    const requirements = [
      { met: password.length >= 8, text: "At least 8 characters" },
      { met: /[A-Z]/.test(password), text: "One uppercase letter" },
      { met: /[a-z]/.test(password), text: "One lowercase letter" },
      { met: /[0-9]/.test(password), text: "One number" },
      { met: /[^A-Za-z0-9]/.test(password), text: "One special character" },
    ];
    return requirements;
  };

  const passwordRequirements = validatePassword(formData.password);
  const isPasswordValid = passwordRequirements.every((req) => req.met);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (!isPasswordValid) {
      setError("Password does not meet the requirements");
      setIsLoading(false);
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsSubmitted(true);
    } catch {
      setError("Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Invalid or expired token state
  if (!token) {
    return (
      <div className="animate-slide-up text-center">
        <div className="mb-10">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-warning/10 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-warning" />
          </div>
          <h1 className="text-[32px] font-bold text-text-primary leading-tight mb-3">
            Invalid reset link
          </h1>
          <p className="text-base text-text-secondary leading-relaxed">
            This password reset link is invalid or has expired
          </p>
        </div>

        <Card variant="default" className="mb-8 text-left">
          <CardContent>
            <p className="text-sm text-text-secondary leading-relaxed">
              Password reset links expire after 1 hour for security reasons.
              Please request a new link to reset your password.
            </p>
          </CardContent>
        </Card>

        <Link href="/forgot-password">
          <Button fullWidth size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
            Request new link
          </Button>
        </Link>

        <div className="mt-6">
          <Link href="/login">
            <Button variant="ghost" fullWidth>
              Back to sign in
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Success state
  if (isSubmitted) {
    return (
      <div className="animate-slide-up text-center">
        <div className="mb-10">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-[32px] font-bold text-text-primary leading-tight mb-3">
            Password reset successful
          </h1>
          <p className="text-base text-text-secondary leading-relaxed">
            Your password has been successfully updated
          </p>
        </div>

        <Card variant="default" className="mb-8 text-left">
          <CardContent>
            <p className="text-sm text-text-secondary leading-relaxed">
              You can now sign in with your new password.
              For security, we recommend enabling two-factor authentication.
            </p>
          </CardContent>
        </Card>

        <Button
          fullWidth
          size="lg"
          onClick={() => router.push("/login")}
          rightIcon={<ArrowRight className="w-5 h-5" />}
        >
          Sign in now
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      {/* Header Section - 32px margin bottom */}
      <div className="mb-8">
        <h1 className="text-[32px] font-bold text-text-primary leading-tight mb-3">
          Reset your password
        </h1>
        <p className="text-base text-text-secondary leading-relaxed">
          Enter your new password below
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6">
          <Alert variant="error" dismissible onDismiss={() => setError(null)}>
            {error}
          </Alert>
        </div>
      )}

      {/* Form - 20px gap */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="space-y-3">
          <Input
            label="New password"
            type="password"
            name="password"
            placeholder="Enter your new password"
            value={formData.password}
            onChange={handleChange}
            leftIcon={<Lock className="w-5 h-5" />}
            required
            autoComplete="new-password"
            autoFocus
          />

          {/* Password Requirements */}
          {formData.password && (
            <div className="grid grid-cols-2 gap-2 p-4 bg-bg-secondary rounded-xl border border-border-default">
              {passwordRequirements.map((req, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 text-xs ${
                    req.met ? "text-success" : "text-text-muted"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                      req.met ? "bg-success/20" : "bg-border-default"
                    }`}
                  >
                    {req.met && <Check className="w-2.5 h-2.5" />}
                  </div>
                  <span>{req.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <Input
          label="Confirm new password"
          type="password"
          name="confirmPassword"
          placeholder="Confirm your new password"
          value={formData.confirmPassword}
          onChange={handleChange}
          leftIcon={<Lock className="w-5 h-5" />}
          required
          autoComplete="new-password"
          error={
            formData.confirmPassword &&
            formData.password !== formData.confirmPassword
              ? "Passwords do not match"
              : undefined
          }
          success={
            formData.confirmPassword &&
            formData.password === formData.confirmPassword
              ? "Passwords match"
              : undefined
          }
        />

        <div className="mt-1">
          <Button
            type="submit"
            fullWidth
            size="lg"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-5 h-5" />}
          >
            Reset password
          </Button>
        </div>
      </form>

      {/* Security Note */}
      <div className="mt-8 pt-6 border-t border-border-default">
        <Card variant="default" padding="compact">
          <CardContent className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent-gold/10 flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5 text-accent-gold" />
            </div>
            <div>
              <p className="font-medium text-text-primary text-sm mb-1">Security tip</p>
              <p className="text-text-muted text-sm leading-relaxed">
                Use a unique password that you don&apos;t use for other accounts.
                Consider using a password manager.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6 text-center">
        <div className="w-20 h-20 mx-auto rounded-full skeleton" />
        <div className="h-10 w-48 mx-auto skeleton rounded-lg" />
        <div className="h-5 w-64 mx-auto skeleton rounded-lg" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
