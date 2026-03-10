'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setEmailSent(true);
      toast.success('Reset link sent!', {
        description: 'Check your email for the password reset link',
      });
    }, 1500);
  };

  return (
    <div className="from-background via-background to-muted/20 flex min-h-screen w-full items-center justify-center bg-gradient-to-br p-4">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-primary/5 absolute top-1/4 left-1/4 h-96 w-96 rounded-full blur-[128px]" />
        <div className="bg-accent/5 absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full blur-[128px]" />
      </div>

      <Card className="relative w-full max-w-md border-[var(--glass-border)] shadow-[var(--glass-shadow-3)] backdrop-blur-[var(--glass-blur)]">
        <CardHeader className="space-y-1 text-center">
          {/* Logo */}
          <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
            <Mail className="text-primary h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold">Forgot Password?</CardTitle>
          <CardDescription>
            {emailSent
              ? 'Check your email for reset instructions'
              : "Enter your email and we'll send you a reset link"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!emailSent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center space-y-4 py-6">
                <div className="bg-success/10 flex h-16 w-16 items-center justify-center rounded-full">
                  <CheckCircle2 className="text-success h-8 w-8" />
                </div>
                <div className="space-y-2 text-center">
                  <h3 className="font-semibold">Email Sent!</h3>
                  <p className="text-muted-foreground text-sm">
                    We've sent a password reset link to{' '}
                    <span className="text-foreground font-medium">{email}</span>
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Please check your inbox and follow the instructions.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setEmailSent(false);
                  setEmail('');
                }}
              >
                Send Another Email
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link
            href="/auth/login"
            className="text-primary flex items-center space-x-1 text-sm font-medium hover:underline"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>Back to Sign In</span>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
