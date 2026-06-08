'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  ArrowRight,
  Crown,
  Sparkles,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import {
  getPlans,
  MembershipPlan,
  formatPrice,
  getPlanColor,
} from '@/lib/api/membershipApi';
import { getProviders, SmsProvider, getProviderBadge } from '@/lib/api/smsApi';

export default function PricingClient() {
  // Data state
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [providers, setProviders] = useState<SmsProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [plansRes, providersRes] = await Promise.allSettled([
        getPlans(),
        getProviders(),
      ]);

      if (plansRes.status === 'fulfilled') {
        // getPlans returns MembershipPlan[] directly
        setPlans(plansRes.value || []);
      }

      if (providersRes.status === 'fulfilled') {
        // getProviders returns { providers: [...] }
        const providersList = providersRes.value?.providers || [];
        setProviders(providersList.filter(p => p.isActive !== false));
      }
    } catch (err) {
      console.error('Failed to fetch pricing data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fallback provider tiers if API fails
  const defaultProviderTiers = [
    {
      id: 'v1',
      name: 'Standard V1',
      badge: '💰 Standard services - best price',
      tagline:
        'Suitable for customers looking for basic and affordable options.',
      priceRange: 'From $1.50',
      features: [
        'Affordable pricing',
        'Standard delivery speed',
        'Wide service coverage',
        'Regular priority',
      ],
      color: 'blue',
    },
    {
      id: 'v2',
      name: 'Premium V2',
      badge: '💎 Most Popular',
      tagline:
        'Faster delivery and higher success rate. Ideal for customers looking for more reliable results and quicker processing.',
      priceRange: 'From $2.50',
      features: [
        'Lightning-fast delivery',
        'Higher success rate',
        'Premium providers only',
        'VIP priority routing',
      ],
      color: 'primary',
      popular: true,
    },
    {
      id: 'v3',
      name: 'Elite V3',
      badge: '👑 Ultimate',
      tagline:
        'The highest quality service with priority routing and 99.9% success rate. Best for customers who demand the absolute best with premium providers and priority support.',
      priceRange: 'From $3.50',
      features: [
        'Instant guaranteed delivery',
        '99.9% success rate',
        'Basic providers only',
        'Maximum priority + support',
      ],
      color: 'warning',
      elite: true,
    },
  ];

  // Map providers to display format. The "From $X.XX" price is fetched live
  // from the backend (cheapest active product × global markup), per client
  // requirement that pricing reflects provider data automatically.
  const providerTiers = providers.length > 0
    ? providers.map((provider, index) => {
        const badge = getProviderBadge(provider.slug);
        const isPopular = index === 1;
        const isElite = index === providers.length - 1 && providers.length > 2;
        const priceRange =
          provider.fromPrice != null && provider.fromPrice > 0
            ? `From $${provider.fromPrice.toFixed(2)}`
            : 'Pricing unavailable';

        return {
          id: provider.id,
          name: provider.displayName,
          badge: `${badge.icon} ${badge.label}`,
          tagline: (provider as any).description || 'SMS verification service',
          priceRange,
          features: (provider as any).features || [
            'SMS verification',
            'Multiple countries',
            'Fast delivery',
            'Reliable service',
          ],
          color: isElite ? 'warning' : isPopular ? 'primary' : 'blue',
          popular: isPopular,
          elite: isElite,
        };
      })
    : defaultProviderTiers;

  // Sample pricing (static for now, could be fetched from API)
  const samplePricing = [
    {
      service: 'WhatsApp',
      country: '🇺🇸 United States',
      v1: '$0.50',
      v2: '$1.50',
      v3: '$2.50',
    },
    {
      service: 'Telegram',
      country: '🇬🇧 United Kingdom',
      v1: '$0.45',
      v2: '$1.35',
      v3: '$2.25',
    },
    {
      service: 'Instagram',
      country: '🇺🇸 United States',
      v1: '$0.80',
      v2: '$1.80',
      v3: '$2.95',
    },
    {
      service: 'Google',
      country: '🇨🇦 Canada',
      v1: '$0.65',
      v2: '$1.95',
      v3: '$3.15',
    },
    {
      service: 'Discord',
      country: '🇩🇪 Germany',
      v1: '$0.70',
      v2: '$2.10',
      v3: '$3.50',
    },
    {
      service: 'TikTok',
      country: '🇫🇷 France',
      v1: '$0.90',
      v2: '$2.40',
      v3: '$3.80',
    },
  ];

  // Map plans to membership benefits
  const membershipBenefits = plans.length > 0
    ? plans.map(plan => ({
        tier: plan.name,
        price: plan.price === '0' || plan.price === '0.00'
          ? 'Free'
          : `${formatPrice(plan.price, plan.currency)}/mo`,
        discount: `${plan.discountPercent ?? plan.discount ?? 0}%`,
        description: plan.description || `Save ${plan.discountPercent ?? plan.discount ?? 0}% on every activation`,
        isVIP: plan.slug === 'vip',
        color: getPlanColor(plan.slug).text,
      }))
    : [
        {
          tier: 'Basic',
          price: 'Free',
          discount: '0%',
          description: 'Standard pricing on all services',
          isVIP: false,
          color: '#6b7280',
        },
        {
          tier: 'Standard',
          price: '$29/mo',
          discount: '10%',
          description: 'Save 10% on every activation',
          isVIP: false,
          color: '#3b82f6',
        },
        {
          tier: 'Pro',
          price: '$79/mo',
          discount: '25%',
          description: 'Maximum savings with priority features',
          isVIP: false,
          color: '#8b5cf6',
        },
        {
          tier: 'VIP',
          price: '$199/mo',
          discount: '40%',
          description: 'Ultimate discount + exclusive benefits',
          isVIP: true,
          color: '#f59e0b',
        },
      ];

  // Get VIP plan for calculation example
  const vipPlan = plans.find(p => p.slug === 'vip');
  const vipDiscount = vipPlan?.discountPercent ?? vipPlan?.discount ?? 40;
  const vipPrice = vipPlan ? parseFloat(vipPlan.price) : 199;

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 sm:py-20">
        <div className="mx-auto max-w-4xl space-y-6 text-center">
          <Badge variant="secondary" className="px-4 py-2">
            <Sparkles className="mr-2 inline h-4 w-4" />
            Transparent Pricing
          </Badge>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Simple, Flexible Pricing
          </h1>

          <p className="text-muted-foreground mx-auto max-w-2xl text-base sm:text-xl">
            Choose the provider tier that matches your needs. No hidden fees, no
            surprises.
          </p>
        </div>
      </section>

      {/* Provider Tiers */}
      <section className="border-border container mx-auto border-t px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 space-y-4 text-center sm:mb-12">
            <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">Provider Tiers</h2>
            <p className="text-muted-foreground text-base sm:text-lg">
              Three tiers to match your speed and reliability needs
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="text-primary h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {providerTiers.map((tier) => (
                <Card
                  key={tier.id}
                  className={`relative ${tier.popular ? 'border-primary border-2 shadow-[var(--glow-accent)]' : ''} ${tier.elite ? 'border-warning border-2' : ''} `}
                >
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">
                        MOST POPULAR
                      </Badge>
                    </div>
                  )}
                  {tier.elite && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-warning text-warning-foreground">
                        BEST QUALITY
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="pt-8 pb-8 text-center">
                    <div className="mb-3 text-3xl">{tier.badge}</div>
                    <CardTitle className="mb-2 text-2xl">{tier.name}</CardTitle>
                    <CardDescription className="text-base">
                      {tier.tagline}
                    </CardDescription>
                    <div className="pt-4">
                      <div
                        className={`text-3xl font-bold ${tier.color === 'warning' ? 'text-warning' : tier.color === 'primary' ? 'text-primary' : 'text-blue-500'}`}
                      >
                        {tier.priceRange}
                      </div>
                      <p className="text-muted-foreground mt-1 text-sm">
                        per activation
                      </p>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <ul className="mb-6 space-y-3">
                      {tier.features.map((feature: string, i: number) => (
                        <li key={i} className="flex items-start space-x-3">
                          <CheckCircle2
                            className={`mt-0.5 h-5 w-5 flex-shrink-0 ${tier.color === 'warning' ? 'text-warning' : tier.color === 'primary' ? 'text-primary' : 'text-blue-500'}`}
                          />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      asChild
                      className="w-full"
                      variant={tier.popular || tier.elite ? 'default' : 'outline'}
                    >
                      <Link href="/auth/signup" prefetch={false}>
                        Get Started <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Sample Pricing Table */}
      <section className="border-border container mx-auto border-t px-4 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 space-y-4 text-center sm:mb-12">
            <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">Sample Pricing</h2>
            <p className="text-muted-foreground text-base sm:text-lg">
              Popular services across different provider tiers
            </p>
          </div>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-border border-b">
                    <th className="p-4 text-left font-semibold">Service</th>
                    <th className="p-4 text-left font-semibold">Country</th>
                    <th className="p-4 text-center font-semibold">
                      <div className="flex flex-col items-center">
                        <span>💰 V1</span>
                        <span className="text-muted-foreground text-xs font-normal">
                          Standard
                        </span>
                      </div>
                    </th>
                    <th className="p-4 text-center font-semibold">
                      <div className="flex flex-col items-center">
                        <span>💎 V2</span>
                        <span className="text-muted-foreground text-xs font-normal">
                          Premium
                        </span>
                      </div>
                    </th>
                    <th className="p-4 text-center font-semibold">
                      <div className="flex flex-col items-center">
                        <span>👑 V3</span>
                        <span className="text-muted-foreground text-xs font-normal">
                          Elite
                        </span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {samplePricing.map((item, i) => (
                    <tr
                      key={i}
                      className="border-border hover:bg-muted/50 border-b transition-colors"
                    >
                      <td className="p-4 font-medium">{item.service}</td>
                      <td className="text-muted-foreground p-4 text-sm">
                        {item.country}
                      </td>
                      <td className="p-4 text-center font-semibold text-blue-500">
                        {item.v1}
                      </td>
                      <td className="text-primary p-4 text-center font-semibold">
                        {item.v2}
                      </td>
                      <td className="text-warning p-4 text-center font-semibold">
                        {item.v3}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground text-sm">
                Prices vary by country and service. View full pricing in the{' '}
                <Link
                  href="/dashboard/activation"
                  className="text-primary hover:underline"
                >
                  Activation Dashboard
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Membership Discounts */}
      <section className="border-border container mx-auto border-t px-4 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 space-y-4 text-center sm:mb-12">
            <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">
              Save More with Membership
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg">
              Apply discount on top of any provider tier pricing
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="text-primary h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {membershipBenefits.map((membership, i) => (
                <Card
                  key={i}
                  className={membership.isVIP ? 'border-primary border-2' : ''}
                >
                  <CardHeader>
                    <div className="mb-2 flex items-center justify-between">
                      <CardTitle className="text-xl">{membership.tier}</CardTitle>
                      {membership.isVIP && (
                        <Crown className="text-primary h-5 w-5" />
                      )}
                    </div>
                    <div className="text-primary text-2xl font-bold">
                      {membership.price}
                    </div>
                    <Badge
                      variant={membership.isVIP ? 'default' : 'secondary'}
                      className="mt-2 w-fit"
                      style={
                        !membership.isVIP
                          ? {
                              backgroundColor: `${membership.color}20`,
                              color: membership.color,
                            }
                          : undefined
                      }
                    >
                      {membership.discount} Discount
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 text-sm">
                      {membership.description}
                    </p>
                    {membership.isVIP && (
                      <div className="text-primary flex items-center text-xs font-medium">
                        <TrendingUp className="mr-1 h-3 w-3" />
                        Best Value
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <Button asChild size="lg">
              <Link href="/dashboard/membership">
                View Full Membership Details{' '}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Example Calculation */}
      <section className="border-border bg-muted/30 container mx-auto border-t px-4 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 space-y-4 text-center">
            <h2 className="text-2xl font-bold md:text-3xl">Pricing Example</h2>
            <p className="text-muted-foreground">
              See how membership discounts work
            </p>
          </div>

          <Card className="border-2">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="border-border border-b pb-4 text-center">
                  <p className="text-muted-foreground mb-2 text-sm">
                    Example Service
                  </p>
                  <h3 className="text-xl font-semibold">
                    WhatsApp (US) - Premium V2
                  </h3>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <p className="text-muted-foreground mb-2 text-sm">
                      Without Membership
                    </p>
                    <p className="text-muted-foreground text-3xl font-bold line-through">
                      $1.50
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-2 text-sm">
                      With VIP Membership ({vipDiscount}% off)
                    </p>
                    <p className="text-primary text-3xl font-bold">
                      ${(1.5 * (1 - vipDiscount / 100)).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="border-border border-t pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Monthly savings (100 activations)
                    </span>
                    <span className="text-success text-lg font-bold">
                      ${(1.5 * (vipDiscount / 100) * 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm">
              VIP membership at ${vipPrice}/mo pays for itself after just ~
              {Math.ceil(vipPrice / (1.5 * (vipDiscount / 100)))} activations
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Quick */}
      <section className="border-border container mx-auto border-t px-4 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center text-2xl font-bold">Pricing FAQs</h2>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  How does provider tier pricing work?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Each service has three price points based on the provider tier
                  (V1, V2, V3). Higher tiers offer faster delivery, better
                  success rates, and premium features. You select the tier when
                  purchasing an activation.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Can I combine membership discounts with provider tiers?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Yes! Your membership discount applies to all provider tiers.
                  For example, VIP members get {vipDiscount}% off on V1, V2, and V3
                  pricing.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Are there any hidden fees?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  No hidden fees. The price you see is what you pay. If an
                  activation fails, you get a full refund or free retry.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-border container mx-auto border-t px-4 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-3xl space-y-6 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">Ready to Get Started?</h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Create your account and start using our service today
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/auth/signup" prefetch={false}>
                Create Free Account <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/help">Contact Support</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
