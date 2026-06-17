'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  Zap,
  Shield,
  Globe,
  Star,
  Sparkles,
  Clock,
  Lock,
  TrendingUp,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { getPlans, MembershipPlan } from '@/lib/api/membershipApi';
import { getProviders, type SmsProvider } from '@/lib/api/smsApi';
import { apiClient } from '@/config/api-client.config';
import { API_ENDPOINTS } from '@/config/server.config';
import { useAuth } from '@/hooks/useAuth';

interface Review {
  id: string;
  user: { username: string; firstName: string };
  rating: number;
  text: string;
  title: string;
}

const fallbackReviews = [
  {
    name: 'Sarah Johnson',
    role: 'Developer',
    content:
      "Best SMS service I've used. Fast, reliable, and great API documentation.",
    rating: 5,
  },
  {
    name: 'Mike Chen',
    role: 'Business Owner',
    content:
      'The premium providers are worth it. Never had a failed verification.',
    rating: 5,
  },
  {
    name: 'Emma Davis',
    role: 'Marketing Manager',
    content: 'VIP membership pays for itself. The discounts are incredible.',
    rating: 5,
  },
];

export interface HomeContent {
  heroHeadingPart1: string;
  heroHeadingPart2: string;
  heroDescription: string;
  /** Hero primary button label shown to unauthenticated visitors. */
  heroButtonText: string;
  ctaHeading: string;
  ctaBody: string;
  /** Final CTA button label shown to unauthenticated visitors. */
  ctaButtonText: string;
}

const FALLBACK_HOME_CONTENT: HomeContent = {
  heroHeadingPart1: 'Receive SMS Activations',
  heroHeadingPart2: 'Instantly & Reliably',
  heroDescription:
    'Get instant access to SMS verification numbers from 180+ countries. Professional, fast, and secure.',
  heroButtonText: 'Get Started',
  ctaHeading: 'Ready to Get Started?',
  ctaBody: 'Join thousands of satisfied customers using BestSMSHQ',
  ctaButtonText: 'Start Receiving SMS Now',
};

export default function HomeClient({
  content = FALLBACK_HOME_CONTENT,
}: {
  content?: HomeContent;
} = {}) {
  const { isAuthenticated, isAdmin } = useAuth();
  const [authMounted, setAuthMounted] = useState(false);
  useEffect(() => {
    setAuthMounted(true);
  }, []);
  const showAuthedCta = authMounted && isAuthenticated;
  const ctaHref = isAdmin ? '/admin' : '/dashboard';
  const heroCtaLabel = showAuthedCta
    ? isAdmin
      ? 'Go to Admin'
      : 'Go to Dashboard'
    : content.heroButtonText;
  const finalCtaLabel = showAuthedCta
    ? isAdmin
      ? 'Open Admin'
      : 'Open Dashboard'
    : content.ctaButtonText;
  const ctaTargetHref = showAuthedCta ? ctaHref : '/auth/signup';

  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [providers, setProviders] = useState<SmsProvider[]>([]);
  const [providersLoaded, setProvidersLoaded] = useState(false);
  const [reviews, setReviews] =
    useState<typeof fallbackReviews>(fallbackReviews);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const fetchPlans = useCallback(async () => {
    try {
      setPlansLoading(true);
      const data = await getPlans();
      const activePlans = data.filter((p) => p.isActive !== false);
      setPlans(activePlans);
    } catch (error) {
      console.error('Failed to fetch membership plans:', error);
    } finally {
      setPlansLoading(false);
    }
  }, []);

  const fetchReviews = useCallback(async () => {
    try {
      setReviewsLoading(true);
      const response = await apiClient.get<{ data: Review[] }>(
        API_ENDPOINTS.REVIEWS.FEATURED,
      );
      const data = Array.isArray(response)
        ? response
        : ((response as any).data ?? response);
      if (Array.isArray(data) && data.length > 0) {
        setReviews(
          data.map((r: Review) => ({
            name: r.user?.firstName || r.user?.username || 'Anonymous',
            role: r.title || 'Customer',
            content: r.text,
            rating: r.rating,
          })),
        );
      }
    } catch (error) {
      console.error('Failed to fetch reviews, using fallback:', error);
    } finally {
      setReviewsLoading(false);
    }
  }, []);

  // Fetch providers so we can render dynamic "From $X.XX" prices on the
  // V1/V2/V3 cards instead of the old hardcoded values.
  const fetchProviders = useCallback(async () => {
    try {
      const res = await getProviders();
      setProviders((res?.providers || []).filter((p) => p.isActive !== false));
    } catch (error) {
      console.error('Failed to fetch providers for landing pricing:', error);
    } finally {
      setProvidersLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
    fetchReviews();
    fetchProviders();
  }, [fetchPlans, fetchReviews, fetchProviders]);

  // Map every active provider to exactly one tier slot (V1/V2/V3).
  //   1. Honor provider.version when set (handles "V1", "v1", "V1_STANDARD").
  //   2. Any provider without a recognized version is auto-assigned to a
  //      remaining slot by priority desc (highest priority claims the top
  //      empty slot). This guarantees: N active providers (N ≤ 3) render
  //      N cards, even if admin forgot to label one.
  const tierProvider = useMemo(() => {
    const slots: Record<'V1' | 'V2' | 'V3', SmsProvider | undefined> = {
      V1: undefined,
      V2: undefined,
      V3: undefined,
    };
    const claimed = new Set<string>();
    for (const p of providers) {
      const v = (p.version || '').toUpperCase().trim();
      if (v.startsWith('V1') && !slots.V1) {
        slots.V1 = p;
        claimed.add(p.id);
      } else if (v.startsWith('V2') && !slots.V2) {
        slots.V2 = p;
        claimed.add(p.id);
      } else if (v.startsWith('V3') && !slots.V3) {
        slots.V3 = p;
        claimed.add(p.id);
      }
    }
    // Fill any empty slot with the next highest-priority unclaimed provider.
    const remaining = providers
      .filter((p) => !claimed.has(p.id))
      .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
    (['V3', 'V2', 'V1'] as const).forEach((slot) => {
      if (!slots[slot] && remaining.length) slots[slot] = remaining.shift();
    });
    return slots;
  }, [providers]);

  const fromPriceFor = useCallback(
    (versionPrefix: 'V1' | 'V2' | 'V3', fallback: string): string => {
      const match = tierProvider[versionPrefix];
      if (match && match.fromPrice != null && match.fromPrice > 0) {
        return `From $${match.fromPrice.toFixed(2)}`;
      }
      return fallback;
    },
    [tierProvider],
  );

  const hasTier = useCallback(
    (versionPrefix: 'V1' | 'V2' | 'V3'): boolean =>
      Boolean(tierProvider[versionPrefix]),
    [tierProvider],
  );

  const stats = [
    { label: 'Active Numbers', value: '45K+' },
    { label: 'Countries', value: '180+' },
    { label: 'Success Rate', value: '99.7%' },
    { label: 'Uptime', value: '99.9%' },
  ];

  const features = [
    {
      icon: Zap,
      title: 'Instant Activation',
      description:
        'Get your SMS number within seconds and start receiving messages immediately',
    },
    {
      icon: Clock,
      title: 'Real-time SMS',
      description:
        'Receive SMS codes in real-time with instant delivery notifications',
    },
    {
      icon: Globe,
      title: 'Multiple Providers',
      description:
        'Choose from V1 Basic, V2 Standard, or V3 Premium providers based on your needs',
    },
    {
      icon: Sparkles,
      title: 'VIP Routing',
      description:
        'Premium members get priority access to the fastest and most reliable numbers',
    },
    {
      icon: Shield,
      title: 'Wallet System',
      description:
        'Secure wallet with instant top-ups and transparent transaction history',
    },
    {
      icon: Star,
      title: 'Membership Discounts',
      description:
        'Save up to 40% on all services with our VIP membership tiers',
    },
    {
      icon: Lock,
      title: 'Favorite Services',
      description: 'Save your most-used services for one-click quick ordering',
    },
    {
      icon: TrendingUp,
      title: 'API Support',
      description:
        'Integrate our service into your workflow with our developer-friendly API',
    },
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-14 sm:py-20 md:py-28">
        <div className="mx-auto max-w-4xl space-y-6 text-center sm:space-y-8">
          <Badge variant="secondary" className="px-3 py-1.5 sm:px-4 sm:py-2">
            <Sparkles className="mr-1.5 inline h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Premium SMS Platform
          </Badge>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-6xl">
            {content.heroHeadingPart1}
            <span className="from-primary to-accent mt-2 block bg-gradient-to-r bg-clip-text text-transparent">
              {content.heroHeadingPart2}
            </span>
          </h1>

          <p className="text-muted-foreground mx-auto max-w-2xl px-2 text-base sm:text-xl">
            {content.heroDescription}
          </p>

          <div className="flex flex-col items-center justify-center gap-3 px-4 sm:flex-row sm:gap-4 sm:px-0">
            <Button
              asChild
              size="lg"
              className="btn-premium w-full text-base sm:w-auto"
            >
              <Link prefetch={false} href={ctaTargetHref}>
                {heroCtaLabel} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full text-base sm:w-auto"
            >
              <Link prefetch={false} href="/pricing">
                View Pricing
              </Link>
            </Button>
          </div>

          {/* Live Stats */}
          <div className="grid grid-cols-2 gap-4 pt-8 sm:gap-6 sm:pt-12 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="space-y-1 sm:space-y-2">
                <p className="text-primary text-2xl font-bold sm:text-3xl">
                  {stat.value}
                </p>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Provider Comparison Section */}
      <section className="border-border container mx-auto border-t px-4 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 space-y-4 text-center sm:mb-12">
            <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">
              Choose Your Provider Type
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg">
              Select from Standard, Premium, or Basic providers based on your
              needs
            </p>
          </div>

          {/*
            Grid columns adapt to how many tiers are active in admin
            (Admin -> SMS Services -> Providers Management). When only
            one or two tiers exist, narrow the grid and center it so
            the cards do not float on the left of a 3-column track.
          */}
          {(() => {
            // Shimmer skeleton while the providers list is still in
            // flight. Renders three placeholder cards in the same
            // 3-column grid so the section reserves its final size
            // and the page does not jump when the cards swap in.
            if (!providersLoaded) {
              return (
                <div className="grid gap-6 md:grid-cols-3">
                  {[0, 1, 2].map((i) => (
                    <Card key={i} className="border-2" aria-hidden="true">
                      <CardHeader>
                        <div className="bg-muted/60 mb-3 h-5 w-28 animate-pulse rounded-full" />
                        <div className="bg-muted/60 h-6 w-40 animate-pulse rounded" />
                        <div className="bg-muted/40 mt-2 h-3 w-full animate-pulse rounded" />
                        <div className="bg-muted/40 mt-2 h-3 w-3/4 animate-pulse rounded" />
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          {[0, 1, 2, 3].map((j) => (
                            <div
                              key={j}
                              className="flex items-center space-x-2"
                            >
                              <div className="bg-muted/60 h-4 w-4 animate-pulse rounded-full" />
                              <div className="bg-muted/40 h-3 w-32 animate-pulse rounded" />
                            </div>
                          ))}
                        </div>
                        <div className="pt-4">
                          <div className="bg-muted/60 h-7 w-24 animate-pulse rounded" />
                          <div className="bg-muted/40 mt-2 h-3 w-20 animate-pulse rounded" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              );
            }
            const visibleCount = (['V1', 'V2', 'V3'] as const).filter((v) =>
              hasTier(v),
            ).length;
            const gridClass =
              visibleCount === 1
                ? 'mx-auto grid max-w-sm gap-6 md:grid-cols-1'
                : visibleCount === 2
                  ? 'mx-auto grid max-w-3xl gap-6 md:grid-cols-2'
                  : 'grid gap-6 md:grid-cols-3';
            return (
              <div className={gridClass}>
                {/* V1 - Basic */}
                {hasTier('V1') && (
                  <Card className="border-2">
                    <CardHeader>
                      <Badge className="mb-2 w-fit bg-blue-500">
                        💰 {tierProvider.V1?.displayName ?? 'V1 - Basic'}
                      </Badge>
                      <CardTitle className="text-xl">
                        Basic Activation
                      </CardTitle>
                      <CardDescription>
                        Standard services - best price. Suitable for customers
                        looking for basic and affordable options.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="text-success h-5 w-5" />
                          <span className="text-sm">Affordable pricing</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="text-success h-5 w-5" />
                          <span className="text-sm">
                            Standard delivery speed
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="text-success h-5 w-5" />
                          <span className="text-sm">Wide service coverage</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="text-success h-5 w-5" />
                          <span className="text-sm">Regular priority</span>
                        </div>
                      </div>
                      <div className="pt-4">
                        <p className="text-2xl font-bold">
                          {fromPriceFor('V1', 'From $1.50')}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          per activation
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* V2 - Standard */}
                {hasTier('V2') && (
                  <Card className="border-primary relative overflow-hidden border-2">
                    <div className="bg-primary text-primary-foreground absolute top-0 right-0 rounded-bl-xl px-3 py-1 text-xs font-semibold">
                      POPULAR
                    </div>
                    <CardHeader>
                      <Badge className="from-primary to-accent mb-2 w-fit bg-gradient-to-r">
                        💎 {tierProvider.V2?.displayName ?? 'V2 - Standard'}
                      </Badge>
                      <CardTitle className="text-xl">
                        Standard Activation
                      </CardTitle>
                      <CardDescription>
                        Faster delivery and higher success rate. Ideal for
                        customers looking for more reliable results and quicker
                        processing.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="text-primary h-5 w-5" />
                          <span className="text-sm font-medium">
                            Lightning-fast delivery
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="text-primary h-5 w-5" />
                          <span className="text-sm font-medium">
                            Higher success rate
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="text-primary h-5 w-5" />
                          <span className="text-sm font-medium">
                            Standard providers
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="text-primary h-5 w-5" />
                          <span className="text-sm font-medium">
                            VIP priority routing
                          </span>
                        </div>
                      </div>
                      <div className="pt-4">
                        <p className="text-primary text-2xl font-bold">
                          {fromPriceFor('V2', 'From $2.50')}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          per activation
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* V3 - Premium */}
                {hasTier('V3') && (
                  <Card className="border-warning relative overflow-hidden border-2">
                    <div className="bg-warning text-warning-foreground absolute top-0 right-0 rounded-bl-xl px-3 py-1 text-xs font-semibold">
                      BEST
                    </div>
                    <CardHeader>
                      <Badge className="from-warning mb-2 w-fit bg-gradient-to-r to-amber-500">
                        👑 {tierProvider.V3?.displayName ?? 'V3 - Premium'}
                      </Badge>
                      <CardTitle className="text-xl">
                        Premium Activation
                      </CardTitle>
                      <CardDescription>
                        The highest quality service with priority routing and
                        99.9% success rate. Best for customers who demand the
                        absolute best with premium providers and priority
                        support.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="text-warning h-5 w-5" />
                          <span className="text-sm font-semibold">
                            Instant guaranteed delivery
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="text-warning h-5 w-5" />
                          <span className="text-sm font-semibold">
                            99.9% success rate
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="text-warning h-5 w-5" />
                          <span className="text-sm font-semibold">
                            Premium providers only
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="text-warning h-5 w-5" />
                          <span className="text-sm font-semibold">
                            Maximum priority + support
                          </span>
                        </div>
                      </div>
                      <div className="pt-4">
                        <p className="text-warning text-2xl font-bold">
                          {fromPriceFor('V3', 'From $3.50')}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          per activation
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })()}
        </div>
      </section>

      {/* How It Works */}
      <section className="border-border container mx-auto border-t px-4 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 space-y-4 text-center sm:mb-12">
            <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">
              How It Works
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="space-y-4 text-center">
              <div className="bg-primary text-primary-foreground mx-auto flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold">
                Choose Service & Country
              </h3>
              <p className="text-muted-foreground">
                Select from 500+ services across 180+ countries
              </p>
            </div>

            <div className="space-y-4 text-center">
              <div className="bg-primary text-primary-foreground mx-auto flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold">Get Number Instantly</h3>
              <p className="text-muted-foreground">
                Receive your phone number immediately after purchase
              </p>
            </div>

            <div className="space-y-4 text-center">
              <div className="bg-primary text-primary-foreground mx-auto flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold">Receive SMS Live</h3>
              <p className="text-muted-foreground">
                Get your verification code in real-time
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="border-border container mx-auto border-t px-4 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 space-y-4 text-center sm:mb-12">
            <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">
              Key Features
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg">
              Everything you need for SMS verification
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className="hover:border-primary card-hover-lift border-2 transition-colors"
                >
                  <CardHeader>
                    <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                      <Icon className="text-primary h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Membership Preview */}
      <section className="border-border container mx-auto border-t px-4 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 space-y-4 text-center sm:mb-12">
            <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">
              Membership Plans
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg">
              Save more with our membership tiers
            </p>
          </div>

          {plansLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="text-primary h-8 w-8 animate-spin" />
            </div>
          ) : plans.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={
                    plan.isPopular
                      ? 'border-primary relative overflow-hidden border-2'
                      : 'relative overflow-hidden border-2'
                  }
                >
                  {plan.isPopular && (
                    <div className="bg-primary text-primary-foreground absolute top-0 right-0 rounded-bl-xl px-3 py-1 text-xs font-semibold">
                      Popular
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <div className="pt-2">
                      <p className="text-3xl font-bold">
                        ${parseFloat(plan.price).toFixed(0)}
                      </p>
                      <p className="text-muted-foreground text-sm">per month</p>
                    </div>
                    <Badge
                      variant={plan.isPopular ? 'default' : 'secondary'}
                      className="mt-2 w-fit"
                    >
                      {plan.discount}% Discount
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center space-x-2 text-sm"
                        >
                          <CheckCircle2 className="text-success h-4 w-4 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      asChild
                      className="mt-6 w-full"
                      variant={plan.isPopular ? 'default' : 'outline'}
                    >
                      <Link prefetch={false} href="/dashboard/membership">
                        {parseFloat(plan.price) === 0
                          ? 'Get Started'
                          : 'Upgrade'}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center">
              No membership plans available at the moment.
            </p>
          )}
        </div>
      </section>

      {/* Trust & Reviews */}
      <section className="border-border container mx-auto border-t px-4 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 space-y-4 text-center sm:mb-12">
            <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">
              Trusted by Thousands
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg">
              See what our customers have to say
            </p>
          </div>

          {reviewsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="text-primary h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {reviews.map((review, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="mb-2 flex space-x-1">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="fill-warning text-warning h-4 w-4"
                        />
                      ))}
                    </div>
                    <CardTitle className="text-base">{review.name}</CardTitle>
                    <CardDescription>{review.role}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      {review.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="border-border mt-12 flex flex-wrap justify-center gap-6 border-t pt-12 sm:gap-8">
            <div className="text-center">
              <Shield className="text-success mx-auto mb-2 h-8 w-8" />
              <p className="font-semibold">Secure</p>
              <p className="text-muted-foreground text-sm">SSL Encrypted</p>
            </div>
            <div className="text-center">
              <Clock className="text-primary mx-auto mb-2 h-8 w-8" />
              <p className="font-semibold">99.9% Uptime</p>
              <p className="text-muted-foreground text-sm">Always Available</p>
            </div>
            <div className="text-center">
              <Star className="text-warning mx-auto mb-2 h-8 w-8" />
              <p className="font-semibold">4.9/5 Rating</p>
              <p className="text-muted-foreground text-sm">From 10K+ Reviews</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-border container mx-auto border-t px-4 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-4xl space-y-6 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">
            {content.ctaHeading}
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            {content.ctaBody}
          </p>
          <Button asChild size="lg" className="btn-premium text-base">
            <Link prefetch={false} href={ctaTargetHref}>
              {finalCtaLabel} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
