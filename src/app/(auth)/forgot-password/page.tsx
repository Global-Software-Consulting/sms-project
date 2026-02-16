"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button, Input, Alert, Card, CardContent } from "@/components/ui";

/**
 * Forgot Password Page - Following Design Guidelines
 */
export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsSubmitted(true);
    } catch {
      setError("Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="animate-slide-up text-center">
        {/* Success State */}
        <div className="mb-10">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-[32px] font-bold text-text-primary leading-tight mb-3">
            Check your email
          </h1>
          <p className="text-base text-text-secondary leading-relaxed">
            We&apos;ve sent a password reset link to
          </p>
          <p className="font-semibold text-text-primary mt-2">{email}</p>
        </div>

        <Card variant="default" className="mb-8 text-left">
          <CardContent>
            <p className="text-sm text-text-secondary leading-relaxed">
              Click the link in the email to reset your password. 
              The link will expire in 1 hour.
            </p>
            <p className="text-sm text-text-secondary mt-3 leading-relaxed">
              If you don&apos;t see the email, check your spam folder.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setIsSubmitted(false)}
          >
            Try a different email
          </Button>

          <Link href="/login" className="block">
            <Button variant="ghost" fullWidth leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to sign in
            </Button>
          </Link>
        </div>

        {/* Resend */}
        <div className="mt-8 pt-6 border-t border-border-default">
          <p className="text-sm text-text-muted">
            Didn&apos;t receive the email?{" "}
            <button
              onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
              className="font-semibold text-accent-gold hover:text-accent-gold-bright transition-colors duration-150"
            >
              Click to resend
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      {/* Header Section - 32px margin bottom */}
      <div className="mb-8">
        <h1 className="text-[32px] font-bold text-text-primary leading-tight mb-3">
          Forgot password?
        </h1>
        <p className="text-base text-text-secondary leading-relaxed">
          No worries, we&apos;ll send you reset instructions
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
        <Input
          label="Email address"
          type="email"
          name="email"
          placeholder="Enter your registered email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(null);
          }}
          leftIcon={<Mail className="w-5 h-5" />}
          hint="We'll send a password reset link to this email"
          required
          autoComplete="email"
          autoFocus
        />

        <div className="mt-1">
          <Button
            type="submit"
            fullWidth
            size="lg"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-5 h-5" />}
          >
            Send reset link
          </Button>
        </div>
      </form>

      {/* Back to Login - 32px margin top */}
      <div className="mt-8">
        <Link href="/login">
          <Button variant="ghost" fullWidth leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to sign in
          </Button>
        </Link>
      </div>

      {/* Help Section */}
      <div className="mt-8 pt-6 border-t border-border-default">
        <div className="text-center">
          <p className="text-sm text-text-muted mb-2">
            Still having trouble?
          </p>
          <Link
            href="/contact"
            className="text-sm font-semibold text-accent-gold hover:text-accent-gold-bright transition-colors duration-150"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
