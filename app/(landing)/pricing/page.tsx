'use client';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle2,
  ArrowRight,
  Zap,
  Crown,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

export default function Pricing() {
  const providerTiers = [
    {
      id: 'v1',
      name: 'Standard V1',
      badge: '💰 Cost Effective',
      tagline: 'Perfect for occasional use',
      priceRange: '$0.30 - $1.50',
      features: [
        'Standard delivery speed',
        'Wide service coverage',
        'Regular priority queue',
        'Basic support',
        '500+ services available',
        '180+ countries',
      ],
      color: 'blue',
    },
    {
      id: 'v2',
      name: 'Premium V2',
      badge: '💎 Most Popular',
      tagline: 'Best balance of speed and value',
      priceRange: '$0.80 - $3.00',
      features: [
        'Lightning-fast delivery',
        'Higher success rates',
        'VIP priority routing',
        'Premium support 24/7',
        'Exclusive premium providers',
        'Advanced retry system',
      ],
      color: 'primary',
      popular: true,
    },
    {
      id: 'v3',
      name: 'Elite V3',
      badge: '👑 Ultimate',
      tagline: 'Guaranteed delivery, maximum speed',
      priceRange: '$1.50 - $5.00',
      features: [
        'Instant guaranteed delivery',
        '99.9% success rate',
        'Absolute maximum priority',
        'Dedicated elite support',
        'Elite-only providers',
        'Smart routing algorithm',
        'Extended SMS retention',
      ],
      color: 'warning',
      elite: true,
    },
  ];

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

  const membershipBenefits = [
    {
      tier: 'Basic',
      price: 'Free',
      discount: '0%',
      description: 'Standard pricing on all services',
    },
    {
      tier: 'Standard',
      price: '$29/mo',
      discount: '10%',
      description: 'Save 10% on every activation',
    },
    {
      tier: 'Pro',
      price: '$79/mo',
      discount: '25%',
      description: 'Maximum savings with priority features',
    },
    {
      tier: 'VIP',
      price: '$199/mo',
      discount: '40%',
      description: 'Ultimate discount + exclusive benefits',
    },
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-4xl space-y-6 text-center">
          <Badge variant="secondary" className="px-4 py-2">
            <Sparkles className="mr-2 inline h-4 w-4" />
            Transparent Pricing
          </Badge>

          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Simple, Flexible Pricing
          </h1>

          <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
            Choose the provider tier that matches your needs. No hidden fees, no
            surprises.
          </p>
        </div>
      </section>

      {/* Provider Tiers */}
      <section className="border-border container mx-auto border-t px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 space-y-4 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Provider Tiers</h2>
            <p className="text-muted-foreground text-lg">
              Three tiers to match your speed and reliability needs
            </p>
          </div>

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
                    {tier.features.map((feature, i) => (
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
                    <Link href="/auth/signup">
                      Get Started <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Pricing Table */}
      <section className="border-border container mx-auto border-t px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 space-y-4 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Sample Pricing</h2>
            <p className="text-muted-foreground text-lg">
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
      <section className="border-border container mx-auto border-t px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 space-y-4 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">
              Save More with Membership
            </h2>
            <p className="text-muted-foreground text-lg">
              Apply discount on top of any provider tier pricing
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {membershipBenefits.map((membership, i) => (
              <Card
                key={i}
                className={
                  membership.tier === 'VIP' ? 'border-primary border-2' : ''
                }
              >
                <CardHeader>
                  <div className="mb-2 flex items-center justify-between">
                    <CardTitle className="text-xl">{membership.tier}</CardTitle>
                    {membership.tier === 'VIP' && (
                      <Crown className="text-primary h-5 w-5" />
                    )}
                  </div>
                  <div className="text-primary text-2xl font-bold">
                    {membership.price}
                  </div>
                  <Badge
                    variant={
                      membership.tier === 'VIP' ? 'default' : 'secondary'
                    }
                    className="mt-2 w-fit"
                  >
                    {membership.discount} Discount
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 text-sm">
                    {membership.description}
                  </p>
                  {membership.tier === 'VIP' && (
                    <div className="text-primary flex items-center text-xs font-medium">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      Best Value
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button asChild size="lg">
              <Link href="/membership">
                View Full Membership Details{' '}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Example Calculation */}
      <section className="border-border bg-muted/30 container mx-auto border-t px-4 py-20">
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
                      With VIP Membership (40% off)
                    </p>
                    <p className="text-primary text-3xl font-bold">$0.90</p>
                  </div>
                </div>

                <div className="border-border border-t pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Monthly savings (100 activations)
                    </span>
                    <span className="text-success text-lg font-bold">
                      $60.00
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm">
              VIP membership at $199/mo pays for itself after just ~333
              activations
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Quick */}
      <section className="border-border container mx-auto border-t px-4 py-20">
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
                  For example, VIP members get 40% off on V1, V2, and V3
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
      <section className="border-border container mx-auto border-t px-4 py-20">
        <div className="mx-auto max-w-3xl space-y-6 text-center">
          <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
          <p className="text-muted-foreground text-lg">
            Create your account and start using our service today
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/auth/signup">
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
