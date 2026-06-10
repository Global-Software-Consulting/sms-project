'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Crown,
  Check,
  ArrowRight,
  Zap,
  Shield,
  Headphones,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getPlans, MembershipPlan, formatPrice } from '@/lib/api/membershipApi';

const fallbackPlans: MembershipPlan[] = [
  {
    id: 'fallback-basic',
    slug: 'basic',
    name: 'Basic',
    description: null,
    price: '29.00',
    discount: 0,
    features: [
      'Standard pricing on all services',
      'Access to V1 & V2 providers',
      'Basic support',
      'Order history',
      'Email notifications',
    ],
    isPopular: false,
    isActive: true,
    supportTier: 'standard',
    routingPriority: 0,
    activeNumberLimit: 25,
    apiRateLimit: 60,
    orderLimit: 25,
    bonusDepositPercent: 0,
    queuePriority: 'standard',
    sortOrder: 0,
    autoRenew: false,
  },
  {
    id: 'fallback-standard',
    slug: 'standard',
    name: 'Standard',
    description: null,
    price: '59.00',
    discount: 10,
    features: [
      '10% discount on all services',
      'Priority V2 provider access',
      'Priority support',
      'Favorite services',
      'Advanced order filtering',
      'SMS notifications',
    ],
    isPopular: false,
    isActive: true,
    supportTier: 'standard',
    routingPriority: 1,
    activeNumberLimit: 50,
    apiRateLimit: 120,
    orderLimit: 25,
    bonusDepositPercent: 2,
    queuePriority: 'faster',
    sortOrder: 1,
    autoRenew: false,
  },
  {
    id: 'fallback-pro',
    slug: 'pro',
    name: 'Pro',
    description: null,
    price: '99.00',
    discount: 20,
    features: [
      '20% discount on all services',
      'VIP routing priority',
      '24/7 priority support',
      'Full API access',
      'Advanced analytics',
      'Dedicated account manager',
      'Custom integrations',
    ],
    isPopular: true,
    isActive: true,
    supportTier: 'priority',
    routingPriority: 2,
    activeNumberLimit: 75,
    apiRateLimit: 240,
    orderLimit: 25,
    bonusDepositPercent: 5,
    queuePriority: 'priority',
    sortOrder: 2,
    autoRenew: false,
  },
  {
    id: 'fallback-vip',
    slug: 'vip',
    name: 'VIP',
    description: null,
    price: '199.00',
    discount: 40,
    features: [
      '40% discount on all services',
      'Highest priority routing',
      'Dedicated VIP support',
      'Premium API with higher limits',
      'Custom SLA agreement',
      'White-label options',
      'Early access to new features',
      'Bulk order discounts',
    ],
    isPopular: false,
    isActive: true,
    supportTier: 'whatsapp',
    routingPriority: 3,
    activeNumberLimit: 100,
    apiRateLimit: 600,
    orderLimit: 25,
    bonusDepositPercent: 10,
    queuePriority: 'vip',
    sortOrder: 3,
    autoRenew: false,
  },
];

export interface MembershipContent {
  heroHeading: string;
  heroDescription: string;
  ctaHeading: string;
  ctaBody: string;
  ctaButtonText: string;
}

const FALLBACK_MEMBERSHIP_CONTENT: MembershipContent = {
  heroHeading: 'Choose Your Plan',
  heroDescription:
    'Save more, get priority access, and unlock premium features with our flexible membership tiers',
  ctaHeading: 'Ready to Save More?',
  ctaBody:
    'Join thousands of users who are already saving with our membership plans. Upgrade today and start getting more value from every activation.',
  ctaButtonText: 'View Plans in Dashboard',
};

export default function MembershipClient({
  content = FALLBACK_MEMBERSHIP_CONTENT,
}: {
  content?: MembershipContent;
} = {}) {
  const [monthlySpend, setMonthlySpend] = useState(500);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await getPlans();
        const activePlans = data.filter((p) => p.isActive !== false);
        setPlans(activePlans.length > 0 ? activePlans : fallbackPlans);
      } catch (err) {
        // Silent fallback would mask admin price/feature edits never reaching
        // the public site (e.g., wrong NEXT_PUBLIC_API_URL, CORS, downtime).
        // Log so production logs show the disconnect.
        console.error(
          '[membership] failed to fetch live plans, showing fallback:',
          err,
        );
        setPlans(fallbackPlans);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  // Find the highest-discount plan to mark as "best value"
  const bestPlanSlug =
    plans.length > 0
      ? plans.reduce(
          (best, p) => (p.discount > best.discount ? p : best),
          plans[0],
        ).slug
      : null;

  const calculateSavings = (spend: number) => {
    const result: Record<string, number> = {};
    for (const plan of plans) {
      result[plan.slug] = spend * (1 - plan.discount / 100);
    }
    return result;
  };

  const savings = calculateSavings(monthlySpend);

  // Determine recommended plan based on spending
  const getRecommendedPlan = () => {
    if (plans.length === 0) return null;
    let bestNet = -Infinity;
    let recommended: MembershipPlan | null = null;
    for (const plan of plans) {
      const price = parseFloat(plan.price);
      const saved = monthlySpend * (plan.discount / 100) - price;
      if (saved > bestNet) {
        bestNet = saved;
        recommended = plan;
      }
    }
    return recommended;
  };

  const recommendedPlan = getRecommendedPlan();
  const baseCost = plans.length > 0 ? monthlySpend : 0;
  const recommendedSavings = recommendedPlan
    ? monthlySpend * (recommendedPlan.discount / 100) -
      parseFloat(recommendedPlan.price)
    : 0;

  // Support speed labels per support tier
  const supportSpeedLabel = (tier: string) => {
    const labels: Record<string, string> = {
      community: '24-48h',
      standard: '12-24h',
      priority: '2-4h',
      whatsapp: '1h',
    };
    return labels[tier] || tier;
  };

  // Routing priority labels
  const routingLabel = (priority: number) => {
    const labels: Record<number, string> = {
      0: 'Standard',
      1: 'Enhanced',
      2: 'VIP',
      3: 'Highest',
    };
    return labels[priority] || 'Standard';
  };

  return (
    <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
      <div className="mx-auto max-w-7xl space-y-10 sm:space-y-16">
        {/* Hero Section */}
        <div className="mx-auto max-w-3xl space-y-6 text-center">
          <Badge className="mx-auto">Membership Plans</Badge>
          <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">
            {content.heroHeading}
          </h1>
          <p className="text-muted-foreground text-base sm:text-xl">
            {content.heroDescription}
          </p>
        </div>

        {/* Pricing Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
            <span className="text-muted-foreground ml-3 text-lg">
              Loading plans...
            </span>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => {
              const isBest =
                plan.slug === bestPlanSlug &&
                plan.slug !== 'basic' &&
                plan.slug !== 'free';
              const isPopular = plan.isPopular;

              return (
                <Card
                  key={plan.slug}
                  className={`relative transition-all ${
                    isBest
                      ? 'border-primary border-2 [box-shadow:var(--glow-accent-active)] lg:scale-105'
                      : isPopular
                        ? 'border-primary'
                        : ''
                  }`}
                >
                  {isPopular && !isBest && (
                    <div className="bg-primary text-primary-foreground absolute top-0 right-0 rounded-tr-lg rounded-bl-lg px-3 py-1 text-xs font-semibold">
                      POPULAR
                    </div>
                  )}
                  {isBest && (
                    <div className="from-primary to-accent text-primary-foreground absolute top-0 right-0 rounded-tr-lg rounded-bl-lg bg-gradient-to-r px-3 py-1 text-xs font-semibold">
                      BEST VALUE
                    </div>
                  )}

                  <CardHeader>
                    <div className="space-y-4">
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <div>
                        <p className="text-3xl font-bold">
                          {formatPrice(plan.price, plan.currency)}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          per month
                        </p>
                      </div>
                      <Badge
                        variant={isBest ? 'default' : 'secondary'}
                        className="w-fit"
                      >
                        {plan.discount}% Discount
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li
                          key={i}
                          className="flex items-start space-x-2 text-sm"
                        >
                          <Check className="text-success mt-0.5 h-4 w-4 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Link prefetch={false} href="/dashboard/membership">
                      <Button
                        className="w-full"
                        variant={isBest ? 'default' : 'outline'}
                      >
                        Get Started
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* How Membership Works */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl md:text-3xl">
              How Membership Works
            </CardTitle>
            <CardDescription>
              Understanding the benefits and how they apply to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="flex gap-4">
                <div className="bg-primary/10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl">
                  <TrendingUp className="text-primary h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 font-semibold">Automatic Discounts</h3>
                  <p className="text-muted-foreground text-sm">
                    Your membership discount applies automatically to every
                    activation and rental. No codes needed—just instant savings
                    on all services.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-success/10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl">
                  <Zap className="text-success h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 font-semibold">Priority Routing</h3>
                  <p className="text-muted-foreground text-sm">
                    Higher tiers get better number allocation and faster
                    processing. This improves success rates, especially during
                    peak hours.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-warning/10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl">
                  <Headphones className="text-warning h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 font-semibold">Faster Support</h3>
                  <p className="text-muted-foreground text-sm">
                    Premium members get priority in support queues with faster
                    response times. VIP members receive dedicated account
                    management.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-primary/10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl">
                  <Shield className="text-primary h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 font-semibold">Higher Limits</h3>
                  <p className="text-muted-foreground text-sm">
                    Each tier unlocks higher active number limits and API rate
                    limits. Scale your operations as your business grows.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Comparison Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Feature Comparison</CardTitle>
            <CardDescription>
              Compare features across all membership tiers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="text-primary h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-border border-b">
                      <th className="p-4 text-left font-semibold">Feature</th>
                      {plans.map((plan) => (
                        <th
                          key={plan.slug}
                          className="p-4 text-center font-semibold"
                        >
                          {plan.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-border border-b">
                      <td className="p-4 font-medium">Discount</td>
                      {plans.map((plan) => {
                        const isHighTier = plan.routingPriority >= 2;
                        return (
                          <td
                            key={plan.slug}
                            className={`p-4 text-center ${isHighTier ? (plan.slug === bestPlanSlug ? 'text-primary font-semibold' : 'text-success font-semibold') : 'text-muted-foreground'}`}
                          >
                            {plan.discount}%
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="border-border border-b">
                      <td className="p-4 font-medium">Routing Priority</td>
                      {plans.map((plan) => {
                        const isHighTier = plan.routingPriority >= 2;
                        return (
                          <td
                            key={plan.slug}
                            className={`p-4 text-center ${isHighTier ? (plan.slug === bestPlanSlug ? 'text-primary font-semibold' : 'text-success font-semibold') : 'text-muted-foreground'}`}
                          >
                            {routingLabel(plan.routingPriority)}
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="border-border border-b">
                      <td className="p-4 font-medium">Support Speed</td>
                      {plans.map((plan) => {
                        const isHighTier = plan.routingPriority >= 2;
                        return (
                          <td
                            key={plan.slug}
                            className={`p-4 text-center ${isHighTier ? (plan.slug === bestPlanSlug ? 'text-primary font-semibold' : 'text-success font-semibold') : 'text-muted-foreground'}`}
                          >
                            {supportSpeedLabel(plan.supportTier)}
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="border-border border-b">
                      <td className="p-4 font-medium">Active Number Limit</td>
                      {plans.map((plan) => {
                        const isHighTier = plan.routingPriority >= 2;
                        return (
                          <td
                            key={plan.slug}
                            className={`p-4 text-center ${isHighTier ? (plan.slug === bestPlanSlug ? 'text-primary font-semibold' : 'text-success font-semibold') : 'text-muted-foreground'}`}
                          >
                            {plan.activeNumberLimit >= 100
                              ? 'Unlimited'
                              : plan.activeNumberLimit}
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="border-border border-b">
                      <td className="p-4 font-medium">API Rate Limit</td>
                      {plans.map((plan) => {
                        const isHighTier = plan.routingPriority >= 2;
                        return (
                          <td
                            key={plan.slug}
                            className={`p-4 text-center ${isHighTier ? (plan.slug === bestPlanSlug ? 'text-primary font-semibold' : 'text-success font-semibold') : 'text-muted-foreground'}`}
                          >
                            {plan.apiRateLimit}/min
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="border-border border-b">
                      <td className="p-4 font-medium">Bonus on Deposits</td>
                      {plans.map((plan) => {
                        const isHighTier = plan.routingPriority >= 2;
                        return (
                          <td
                            key={plan.slug}
                            className={`p-4 text-center ${isHighTier ? (plan.slug === bestPlanSlug ? 'text-primary font-semibold' : 'text-success font-semibold') : 'text-muted-foreground'}`}
                          >
                            {plan.bonusDepositPercent > 0
                              ? `${plan.bonusDepositPercent}%`
                              : '\u2014'}
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="border-border border-b">
                      <td className="p-4 font-medium">VIP Queue Access</td>
                      {plans.map((plan) => (
                        <td key={plan.slug} className="p-4 text-center">
                          {plan.routingPriority >= 2 ? (
                            <Check
                              className={`mx-auto h-5 w-5 ${plan.slug === bestPlanSlug ? 'text-primary' : 'text-success'}`}
                            />
                          ) : (
                            <span className="text-muted-foreground">
                              &mdash;
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b-0">
                      <td className="p-4 font-medium">Dedicated Support</td>
                      {plans.map((plan) => (
                        <td key={plan.slug} className="p-4 text-center">
                          {plan.supportTier === 'whatsapp' ? (
                            <Check className="text-primary mx-auto h-5 w-5" />
                          ) : (
                            <span className="text-muted-foreground">
                              &mdash;
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Savings Calculator */}
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Savings Calculator</CardTitle>
            <CardDescription>
              See how much you can save with each membership tier
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="mb-3 block text-sm font-medium">
                Expected Monthly Spending: ${monthlySpend}
              </label>
              <input
                type="range"
                min="100"
                max="2000"
                step="50"
                value={monthlySpend}
                onChange={(e) => setMonthlySpend(Number(e.target.value))}
                className="bg-muted h-2 w-full cursor-pointer appearance-none rounded-lg"
              />
              <div className="text-muted-foreground mt-2 flex justify-between text-xs">
                <span>$100</span>
                <span>$2000</span>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="text-primary h-6 w-6 animate-spin" />
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-4">
                  {plans.map((plan) => {
                    const isBest =
                      plan.slug === bestPlanSlug &&
                      plan.slug !== 'basic' &&
                      plan.slug !== 'free';
                    const isHighTier = plan.routingPriority >= 2;
                    const planSavings = savings[plan.slug] ?? monthlySpend;
                    const saved = monthlySpend - planSavings;

                    return (
                      <div
                        key={plan.slug}
                        className={
                          isBest
                            ? 'bg-primary/10 border-primary/20 rounded-lg border p-6'
                            : isHighTier
                              ? 'bg-success/10 border-success/20 rounded-lg border p-6'
                              : 'rounded-lg p-6 [background:var(--glass-secondary)] [border:1px_solid_var(--glass-border)]'
                        }
                      >
                        <h4 className="mb-3 font-semibold">{plan.name}</h4>
                        <p className="mb-1 text-2xl font-bold">
                          ${planSavings.toFixed(2)}
                        </p>
                        {saved > 0 ? (
                          <p
                            className={`text-sm ${isBest ? 'text-primary font-semibold' : isHighTier ? 'text-success font-semibold' : 'text-success'}`}
                          >
                            Save ${saved.toFixed(2)}
                          </p>
                        ) : (
                          <p className="text-muted-foreground text-sm">
                            $0 saved
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {recommendedPlan && (
                  <div className="bg-primary/10 border-primary/20 rounded-lg border p-6 text-center">
                    <p className="text-muted-foreground mb-2 text-sm">
                      At ${monthlySpend}/month spending, the{' '}
                      {recommendedPlan.name} plan pays for itself
                    </p>
                    <p className="text-primary font-semibold">
                      Net savings after membership fee: $
                      {recommendedSavings.toFixed(2)}
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="text-center">
          <CardContent className="py-12">
            <Crown className="text-primary mx-auto mb-6 h-16 w-16" />
            <h3 className="mb-4 text-3xl font-bold">{content.ctaHeading}</h3>
            <p className="text-muted-foreground mx-auto mb-8 max-w-2xl">
              {content.ctaBody}
            </p>
            <Link prefetch={false} href="/dashboard/membership">
              <Button size="lg" className="px-8">
                {content.ctaButtonText}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
