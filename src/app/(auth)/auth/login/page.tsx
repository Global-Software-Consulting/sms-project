'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Lock, Mail, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  login,
  selectIsLoading,
  selectAuthError,
  selectIsAuthenticated,
  selectUserRole,
  clearError,
} from '@/store/slices/authSlice';
import { getGoogleOAuthUrl, getGithubOAuthUrl } from '@/lib/api';
import { getLoginOptions, type LoginOptions } from '@/lib/api/settingsApi';

export default function Login() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectIsLoading);
  const authError = useAppSelector(selectAuthError);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const userRole = useAppSelector(selectUserRole);

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loginOptions, setLoginOptions] = useState<LoginOptions>({
    google: true,
    twitter: false,
    github: true,
    telegram: false,
  });
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  // Fetch login options on mount
  useEffect(() => {
    const fetchLoginOptions = async () => {
      try {
        const options = await getLoginOptions();
        setLoginOptions(options);
      } catch (error) {
        console.error('Failed to fetch login options:', error);
        // Keep default options on error
      } finally {
        setIsLoadingOptions(false);
      }
    };
    fetchLoginOptions();
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push(userRole === 'OWNER' ? '/admin/dashboard' : '/dashboard');
    }
  }, [isAuthenticated, userRole, router]);

  // Show error toast
  useEffect(() => {
    if (authError) {
      toast.error('Login failed', {
        description: authError,
      });
      dispatch(clearError());
    }
  }, [authError, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await dispatch(login({ email, password }));

    if (login.fulfilled.match(result)) {
      toast.success('Welcome back!', {
        description: 'Redirecting to your dashboard...',
      });
      const role = result.payload.user.role;
      router.push(role === 'OWNER' ? '/admin/dashboard' : '/dashboard');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = getGoogleOAuthUrl();
  };

  const handleGithubLogin = () => {
    window.location.href = getGithubOAuthUrl();
  };

  return (
    <div className="from-background via-background to-muted/20 flex min-h-screen w-full items-center justify-center bg-gradient-to-br p-4">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-primary/5 absolute top-1/4 left-1/4 h-96 w-96 rounded-full blur-[128px]" />
        <div className="bg-accent/5 absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full blur-[128px]" />
      </div>

      <div className="grid w-full max-w-6xl items-center gap-8 lg:grid-cols-2">
        {/* Quick Stats Section - Hidden on mobile */}
        <div className="hidden space-y-6 lg:block">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold">Welcome Back!</h2>
            <p className="text-muted-foreground text-lg">
              Continue your SMS activation journey
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card border-border rounded-lg border p-4">
              <p className="text-primary mb-1 text-3xl font-bold">180+</p>
              <p className="text-muted-foreground text-sm">Countries</p>
            </div>
            <div className="bg-card border-border rounded-lg border p-4">
              <p className="text-primary mb-1 text-3xl font-bold">500+</p>
              <p className="text-muted-foreground text-sm">Services</p>
            </div>
            <div className="bg-card border-border rounded-lg border p-4">
              <p className="text-primary mb-1 text-3xl font-bold">99.8%</p>
              <p className="text-muted-foreground text-sm">Uptime</p>
            </div>
            <div className="bg-card border-border rounded-lg border p-4">
              <p className="text-primary mb-1 text-3xl font-bold">24/7</p>
              <p className="text-muted-foreground text-sm">Support</p>
            </div>
          </div>

          <div className="from-primary/10 to-accent/10 border-primary/20 rounded-lg border bg-gradient-to-br p-6">
            <div className="mb-3 flex items-center gap-3">
              <Sparkles className="text-primary h-5 w-5" />
              <h3 className="font-semibold">New Features</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Check out our new V3 Elite providers with 99.9% success rates and
              instant delivery!
            </p>
          </div>
        </div>

        {/* Login Form */}
        <Card className="relative w-full border-[var(--glass-border)] shadow-[var(--glass-shadow-3)] backdrop-blur-[var(--glass-blur)]">
          <CardHeader className="space-y-1 text-center">
            {/* Logo */}
            <Link
              href="/"
              className="from-primary to-accent mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br transition-transform hover:scale-105"
            >
              <span className="text-primary-foreground text-2xl font-bold">
                S
              </span>
            </Link>
            <CardTitle className="text-2xl font-bold md:text-3xl">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-base">
              Sign in to your SMSPro account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
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
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-9 pl-9"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) =>
                      setRememberMe(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="remember"
                    className="text-muted-foreground cursor-pointer text-sm"
                  >
                    Remember me
                  </Label>
                </div>
                <Link
                  href="/auth/forgot-password"
                  className="text-primary text-sm hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Social Login - Only show if at least one option is enabled */}
            {!isLoadingOptions && (loginOptions.google || loginOptions.github || loginOptions.twitter || loginOptions.telegram) && (
              <>
                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="border-border w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card text-muted-foreground px-2">
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* Social Login Buttons */}
                <div className={`grid gap-3 ${
                  [loginOptions.google, loginOptions.github, loginOptions.twitter, loginOptions.telegram].filter(Boolean).length === 1 
                    ? 'grid-cols-1' 
                    : 'grid-cols-2'
                }`}>
                  {loginOptions.google && (
                    <Button variant="outline" type="button" onClick={handleGoogleLogin} disabled={isLoading}>
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Google
                    </Button>
                  )}
                  {loginOptions.twitter && (
                    <Button variant="outline" type="button" onClick={() => toast.info('Twitter login coming soon')} disabled={isLoading}>
                      <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                      </svg>
                      Twitter
                    </Button>
                  )}
                  {loginOptions.github && (
                    <Button variant="outline" type="button" onClick={handleGithubLogin} disabled={isLoading}>
                      <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                      GitHub
                    </Button>
                  )}
                  {loginOptions.telegram && (
                    <Button variant="outline" type="button" onClick={() => toast.info('Telegram login coming soon')} disabled={isLoading}>
                      <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                      </svg>
                      Telegram
                    </Button>
                  )}
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-muted-foreground text-sm">
              Don't have an account?{' '}
              <Link
                href="/auth/signup"
                className="text-primary font-medium hover:underline"
              >
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
