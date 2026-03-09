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
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function Membership() {
  const [monthlySpend, setMonthlySpend] = useState(500);

  const plans = [
    {
      name: 'Basic',
      price: '$0',
      discount: '0%',
      features: [
        'Standard pricing on all services',
        'Access to V1 & V2 providers',
        'Basic support',
        'Order history',
        'Email notifications',
      ],
    },
    {
      name: 'Standard',
      price: '$29',
      discount: '10%',
      features: [
        '10% discount on all services',
        'Priority V2 provider access',
        'Priority support',
        'Favorite services',
        'Advanced order filtering',
        'SMS notifications',
      ],
    },
    {
      name: 'Pro',
      price: '$79',
      discount: '25%',
      popular: true,
      features: [
        '25% discount on all services',
        'VIP routing priority',
        '24/7 priority support',
        'Full API access',
        'Advanced analytics',
        'Dedicated account manager',
        'Custom integrations',
      ],
    },
    {
      name: 'VIP',
      price: '$199',
      discount: '40%',
      best: true,
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
    },
  ];

  const calculateSavings = (spend: number) => {
    return {
      basic: spend,
      standard: spend * 0.9,
      pro: spend * 0.75,
      vip: spend * 0.6,
    };
  };

  const savings = calculateSavings(monthlySpend);

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="mx-auto max-w-7xl space-y-16">
        {/* Hero Section */}
        <div className="mx-auto max-w-3xl space-y-6 text-center">
          <Badge className="mx-auto">Membership Plans</Badge>
          <h1 className="text-4xl font-bold md:text-5xl">Choose Your Plan</h1>
          <p className="text-muted-foreground text-xl">
            Save more, get priority access, and unlock premium features with our
            flexible membership tiers
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative transition-all ${
                plan.best
                  ? 'border-primary border-2 [box-shadow:var(--glow-accent-active)] lg:scale-105'
                  : plan.popular
                    ? 'border-primary'
                    : ''
              }`}
            >
              {plan.popular && (
                <div className="bg-primary text-primary-foreground absolute top-0 right-0 rounded-tr-lg rounded-bl-lg px-3 py-1 text-xs font-semibold">
                  POPULAR
                </div>
              )}
              {plan.best && (
                <div className="from-primary to-accent text-primary-foreground absolute top-0 right-0 rounded-tr-lg rounded-bl-lg bg-gradient-to-r px-3 py-1 text-xs font-semibold">
                  BEST VALUE
                </div>
              )}

              <CardHeader>
                <div className="space-y-4">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div>
                    <p className="text-3xl font-bold">{plan.price}</p>
                    <p className="text-muted-foreground text-sm">per month</p>
                  </div>
                  <Badge
                    variant={plan.best ? 'default' : 'secondary'}
                    className="w-fit"
                  >
                    {plan.discount} Discount
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start space-x-2 text-sm">
                      <Check className="text-success mt-0.5 h-4 w-4 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/dashboard/membership">
                  <Button
                    className="w-full"
                    variant={plan.best ? 'default' : 'outline'}
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How Membership Works */}
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">How Membership Works</CardTitle>
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-border border-b">
                    <th className="p-4 text-left font-semibold">Feature</th>
                    <th className="p-4 text-center font-semibold">Basic</th>
                    <th className="p-4 text-center font-semibold">Standard</th>
                    <th className="p-4 text-center font-semibold">Pro</th>
                    <th className="p-4 text-center font-semibold">VIP</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-border border-b">
                    <td className="p-4 font-medium">Discount</td>
                    <td className="text-muted-foreground p-4 text-center">
                      0%
                    </td>
                    <td className="text-muted-foreground p-4 text-center">
                      10%
                    </td>
                    <td className="text-success p-4 text-center font-semibold">
                      25%
                    </td>
                    <td className="text-primary p-4 text-center font-semibold">
                      40%
                    </td>
                  </tr>
                  <tr className="border-border border-b">
                    <td className="p-4 font-medium">Routing Priority</td>
                    <td className="text-muted-foreground p-4 text-center">
                      Standard
                    </td>
                    <td className="text-muted-foreground p-4 text-center">
                      Enhanced
                    </td>
                    <td className="text-success p-4 text-center font-semibold">
                      VIP
                    </td>
                    <td className="text-primary p-4 text-center font-semibold">
                      Highest
                    </td>
                  </tr>
                  <tr className="border-border border-b">
                    <td className="p-4 font-medium">Support Speed</td>
                    <td className="text-muted-foreground p-4 text-center">
                      24-48h
                    </td>
                    <td className="text-muted-foreground p-4 text-center">
                      12-24h
                    </td>
                    <td className="text-success p-4 text-center font-semibold">
                      2-4h
                    </td>
                    <td className="text-primary p-4 text-center font-semibold">
                      1h
                    </td>
                  </tr>
                  <tr className="border-border border-b">
                    <td className="p-4 font-medium">Active Number Limit</td>
                    <td className="text-muted-foreground p-4 text-center">5</td>
                    <td className="text-muted-foreground p-4 text-center">
                      20
                    </td>
                    <td className="text-success p-4 text-center font-semibold">
                      50
                    </td>
                    <td className="text-primary p-4 text-center font-semibold">
                      Unlimited
                    </td>
                  </tr>
                  <tr className="border-border border-b">
                    <td className="p-4 font-medium">VIP Queue Access</td>
                    <td className="text-muted-foreground p-4 text-center">—</td>
                    <td className="text-muted-foreground p-4 text-center">—</td>
                    <td className="p-4 text-center">
                      <Check className="text-success mx-auto h-5 w-5" />
                    </td>
                    <td className="p-4 text-center">
                      <Check className="text-primary mx-auto h-5 w-5" />
                    </td>
                  </tr>
                  <tr className="border-border border-b">
                    <td className="p-4 font-medium">Early Access Services</td>
                    <td className="text-muted-foreground p-4 text-center">—</td>
                    <td className="text-muted-foreground p-4 text-center">—</td>
                    <td className="text-muted-foreground p-4 text-center">—</td>
                    <td className="p-4 text-center">
                      <Check className="text-primary mx-auto h-5 w-5" />
                    </td>
                  </tr>
                  <tr className="border-border border-b">
                    <td className="p-4 font-medium">Manual Intervention</td>
                    <td className="text-muted-foreground p-4 text-center">—</td>
                    <td className="text-muted-foreground p-4 text-center">—</td>
                    <td className="text-muted-foreground p-4 text-center">—</td>
                    <td className="p-4 text-center">
                      <Check className="text-primary mx-auto h-5 w-5" />
                    </td>
                  </tr>
                  <tr className="border-b-0">
                    <td className="p-4 font-medium">Dedicated Monitoring</td>
                    <td className="text-muted-foreground p-4 text-center">—</td>
                    <td className="text-muted-foreground p-4 text-center">—</td>
                    <td className="text-muted-foreground p-4 text-center">—</td>
                    <td className="p-4 text-center">
                      <Check className="text-primary mx-auto h-5 w-5" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
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

            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-lg p-6 [background:var(--glass-secondary)] [border:1px_solid_var(--glass-border)]">
                <h4 className="mb-3 font-semibold">Basic</h4>
                <p className="mb-1 text-2xl font-bold">
                  ${savings.basic.toFixed(2)}
                </p>
                <p className="text-muted-foreground text-sm">$0 saved</p>
              </div>

              <div className="rounded-lg p-6 [background:var(--glass-secondary)] [border:1px_solid_var(--glass-border)]">
                <h4 className="mb-3 font-semibold">Standard</h4>
                <p className="mb-1 text-2xl font-bold">
                  ${savings.standard.toFixed(2)}
                </p>
                <p className="text-success text-sm">
                  Save ${(savings.basic - savings.standard).toFixed(2)}
                </p>
              </div>

              <div className="bg-success/10 border-success/20 rounded-lg border p-6">
                <h4 className="mb-3 font-semibold">Pro</h4>
                <p className="mb-1 text-2xl font-bold">
                  ${savings.pro.toFixed(2)}
                </p>
                <p className="text-success text-sm font-semibold">
                  Save ${(savings.basic - savings.pro).toFixed(2)}
                </p>
              </div>

              <div className="bg-primary/10 border-primary/20 rounded-lg border p-6">
                <h4 className="mb-3 font-semibold">VIP</h4>
                <p className="mb-1 text-2xl font-bold">
                  ${savings.vip.toFixed(2)}
                </p>
                <p className="text-primary text-sm font-semibold">
                  Save ${(savings.basic - savings.vip).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="bg-primary/10 border-primary/20 rounded-lg border p-6 text-center">
              <p className="text-muted-foreground mb-2 text-sm">
                At ${monthlySpend}/month spending, the{' '}
                {monthlySpend >= 800
                  ? 'VIP'
                  : monthlySpend >= 350
                    ? 'Pro'
                    : 'Standard'}{' '}
                plan pays for itself
              </p>
              <p className="text-primary font-semibold">
                Net savings after membership fee: $
                {monthlySpend >= 800
                  ? (savings.basic - savings.vip - 199).toFixed(2)
                  : monthlySpend >= 350
                    ? (savings.basic - savings.pro - 79).toFixed(2)
                    : (savings.basic - savings.standard - 29).toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="text-center">
          <CardContent className="py-12">
            <Crown className="text-primary mx-auto mb-6 h-16 w-16" />
            <h3 className="mb-4 text-3xl font-bold">Ready to Save More?</h3>
            <p className="text-muted-foreground mx-auto mb-8 max-w-2xl">
              Join thousands of users who are already saving with our membership
              plans. Upgrade today and start getting more value from every
              activation.
            </p>
            <Link href="/dashboard/membership">
              <Button size="lg" className="px-8">
                View Plans in Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
