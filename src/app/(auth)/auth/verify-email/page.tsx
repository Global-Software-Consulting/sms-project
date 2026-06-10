'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/ui/input-otp';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  sendEmailVerification,
  verifyEmailOtp,
  selectIsLoading,
  selectUser,
  selectIsAuthenticated,
} from '@/store/slices/authSlice';

export default function VerifyEmail() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectIsLoading);
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [otp, setOtp] = useState('');
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  // Redirect if already verified
  useEffect(() => {
    if (user?.emailVerified) {
      router.push('/dashboard');
    }
  }, [user?.emailVerified, router]);

  // Send verification email on mount
  useEffect(() => {
    if (isAuthenticated && user && !user.emailVerified) {
      dispatch(sendEmailVerification());
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter the complete 6-digit code');
      return;
    }

    const result = await dispatch(verifyEmailOtp(otp));
    if (verifyEmailOtp.fulfilled.match(result)) {
      toast.success('Email verified successfully!', {
        description: 'Redirecting to your dashboard...',
      });
      router.push('/dashboard');
    } else {
      toast.error('Verification failed', {
        description: 'Invalid or expired code. Please try again.',
      });
      setOtp('');
    }
  };

  // Auto-submit when all 6 digits entered
  useEffect(() => {
    if (otp.length === 6) {
      handleVerify();
    }
  }, [otp]); // eslint-disable-line react-hooks/exhaustive-deps

  const maskedEmail = user?.email
    ? user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
    : '';

  if (!isAuthenticated || !user) return null;

  return (
    <div className="from-background via-background to-muted/20 flex min-h-screen w-full items-center justify-center bg-gradient-to-br p-4">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-primary/5 absolute top-1/4 left-1/4 h-96 w-96 rounded-full blur-[128px]" />
        <div className="bg-accent/5 absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full blur-[128px]" />
      </div>

      <Card className="relative w-full max-w-md border-[var(--glass-border)] shadow-[var(--glass-shadow-3)] backdrop-blur-[var(--glass-blur)]">
        <CardHeader className="space-y-1 text-center">
          {/* Icon */}
          <div className="from-primary to-accent mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br">
            <Mail className="text-primary-foreground h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold md:text-3xl">
            Verify Your Email
          </CardTitle>
          <CardDescription className="text-base">
            We&apos;ve sent a 6-digit verification code to{' '}
            <span className="text-foreground font-medium">{maskedEmail}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* OTP Input */}
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
              disabled={isLoading}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {/* Verify Button */}
          <Button
            className="w-full"
            onClick={handleVerify}
            disabled={isLoading || otp.length !== 6}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify Email'
            )}
          </Button>

          {/* Back to signup */}
          <div className="text-center">
            <Link
              href="/auth/signup"
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to signup
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
