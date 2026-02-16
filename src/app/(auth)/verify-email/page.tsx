"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, ArrowRight, CheckCircle2, RefreshCw } from "lucide-react";
import { Button, Alert, Card, CardContent } from "@/components/ui";

/**
 * Verify Email Page - Following Design Guidelines
 */
function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "your email";
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (token) {
      verifyWithToken(token);
    }
  }, [token]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const verifyWithToken = async (verificationToken: string) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Verifying token:", verificationToken);
      setIsVerified(true);
    } catch {
      setError("Verification failed. The link may have expired.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pastedValue = value.slice(0, 6).split("");
      const newOtp = [...otp];
      pastedValue.forEach((char, i) => {
        if (index + i < 6) {
          newOtp[index + i] = char;
        }
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + pastedValue.length, 5);
      inputRefs.current[nextIndex]?.focus();
    } else {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
    setError(null);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsVerified(true);
    } catch {
      setError("Invalid verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setResendCooldown(60);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch {
      setError("Failed to resend code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Success state
  if (isVerified) {
    return (
      <div className="animate-slide-up text-center">
        <div className="mb-10">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-[32px] font-bold text-text-primary leading-tight mb-3">
            Email verified!
          </h1>
          <p className="text-base text-text-secondary leading-relaxed">
            Your email has been successfully verified
          </p>
        </div>

        <Card variant="default" className="mb-8 text-left">
          <CardContent>
            <p className="text-sm text-text-secondary leading-relaxed">
              Welcome to SMSPro! You now have full access to all features.
              Start by exploring our services or adding funds to your wallet.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Button
            fullWidth
            size="lg"
            onClick={() => router.push("/dashboard")}
            rightIcon={<ArrowRight className="w-5 h-5" />}
          >
            Go to Dashboard
          </Button>

          <Link href="/login">
            <Button variant="secondary" fullWidth>
              Sign in to continue
            </Button>
          </Link>
        </div>

        {/* Welcome Benefits */}
        <div className="mt-8 pt-6 border-t border-border-default">
          <p className="text-sm text-text-muted mb-4">Your welcome benefits:</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-success/5 border border-success/20">
              <div className="text-xl font-bold text-success">$5.00</div>
              <div className="text-xs text-text-muted mt-1">Free credits</div>
            </div>
            <div className="p-4 rounded-xl bg-accent-gold/5 border border-accent-gold/20">
              <div className="text-xl font-bold text-accent-gold">VIP</div>
              <div className="text-xs text-text-muted mt-1">7-day trial</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      {/* Header Section - 32px margin bottom */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent-gold/10 flex items-center justify-center">
          <Mail className="w-8 h-8 text-accent-gold" />
        </div>
        <h1 className="text-[32px] font-bold text-text-primary leading-tight mb-3">
          Verify your email
        </h1>
        <p className="text-base text-text-secondary leading-relaxed">
          We sent a verification code to
        </p>
        <p className="font-semibold text-text-primary mt-2">{email}</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6">
          <Alert variant="error" dismissible onDismiss={() => setError(null)}>
            {error}
          </Alert>
        </div>
      )}

      {/* OTP Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-text-primary mb-4 text-center">
          Enter verification code
        </label>
        <div className="flex justify-center gap-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`
                w-12 h-14 sm:w-14 sm:h-16
                text-center text-xl sm:text-2xl font-bold
                bg-bg-secondary border-2 rounded-xl
                text-text-primary
                focus:outline-none focus:border-border-focus focus:shadow-[0_0_0_3px_rgba(198,167,94,0.15)]
                transition-all duration-200
                ${error ? "border-danger" : "border-border-default"}
              `}
              autoFocus={index === 0}
            />
          ))}
        </div>
      </div>

      {/* Verify Button */}
      <Button
        fullWidth
        size="lg"
        onClick={handleVerifyOtp}
        isLoading={isLoading}
        rightIcon={<ArrowRight className="w-5 h-5" />}
        disabled={otp.join("").length !== 6}
      >
        Verify email
      </Button>

      {/* Resend Code */}
      <div className="mt-6 text-center">
        <p className="text-sm text-text-muted mb-2">
          Didn&apos;t receive the code?
        </p>
        <button
          onClick={handleResendCode}
          disabled={resendCooldown > 0 || isLoading}
          className={`
            inline-flex items-center gap-2 text-sm font-semibold
            ${resendCooldown > 0 ? "text-text-muted cursor-not-allowed" : "text-accent-gold hover:text-accent-gold-bright"}
            transition-colors duration-150
          `}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
        </button>
      </div>

      {/* Help */}
      <div className="mt-8 pt-6 border-t border-border-default">
        <Card variant="default" padding="compact">
          <CardContent>
            <p className="font-medium text-text-primary text-sm mb-2">Can&apos;t find the email?</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-text-muted">
              <li>Check your spam or junk folder</li>
              <li>Make sure you entered the correct email</li>
              <li>Wait a few minutes and try again</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Change Email */}
      <div className="mt-6 text-center">
        <Link
          href="/register"
          className="text-sm text-text-muted hover:text-text-primary transition-colors duration-150"
        >
          Wrong email? <span className="font-semibold text-accent-gold">Change it</span>
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6 text-center">
        <div className="w-16 h-16 mx-auto rounded-full skeleton" />
        <div className="h-10 w-48 mx-auto skeleton rounded-lg" />
        <div className="h-5 w-64 mx-auto skeleton rounded-lg" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
