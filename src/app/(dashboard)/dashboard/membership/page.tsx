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
import { Crown, Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function MembershipDashboard() {
  const plans = [
    {
      name: 'Basic',
      price: '$0',
      discount: '0%',
      current: false,
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
      current: false,
      popular: false,
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
      current: true,
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
      current: false,
      popular: false,
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Membership</h1>
        <p className="text-muted-foreground mt-1">
          Upgrade your plan to save more
        </p>
      </div>

      {/* Current Plan */}
      <Card className="border-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Your active membership</CardDescription>
            </div>
            <Crown className="text-primary h-8 w-8" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h3 className="text-2xl font-bold">Pro</h3>
              <p className="text-muted-foreground">$79/month • 25% discount</p>
              <p className="text-muted-foreground mt-2 text-sm">
                Next billing: March 13, 2026
              </p>
            </div>
            <div className="space-y-2">
              <div className="bg-success/10 text-success rounded-lg px-4 py-2 text-center">
                <p className="text-2xl font-bold">$58.63</p>
                <p className="text-xs">Saved this month</p>
              </div>
              <Button variant="outline" className="w-full">
                Manage Billing
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div>
        <h2 className="mb-4 text-2xl font-semibold">Available Plans</h2>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative transition-all ${plan.current ? 'border-primary' : ''} ${plan.name === 'VIP' ? 'border-primary border-2 [box-shadow:var(--glow-accent-active)]' : ''}`}
            >
              {plan.popular && (
                <div className="bg-primary text-primary-foreground absolute top-0 right-0 rounded-tr-lg rounded-bl-lg px-3 py-1 text-xs font-semibold">
                  CURRENT
                </div>
              )}
              {plan.name === 'VIP' && !plan.current && (
                <div className="from-primary to-accent text-primary-foreground absolute top-0 right-0 rounded-tr-lg rounded-bl-lg bg-gradient-to-r px-3 py-1 text-xs font-semibold">
                  BEST VALUE
                </div>
              )}

              <CardHeader>
                <div className="space-y-2">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div>
                    <p className="text-3xl font-bold">{plan.price}</p>
                    <p className="text-muted-foreground text-sm">per month</p>
                  </div>
                  <Badge
                    variant={plan.name === 'VIP' ? 'default' : 'secondary'}
                    className="w-fit"
                  >
                    {plan.discount} Discount
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start space-x-2 text-sm">
                      <Check className="text-success mt-0.5 h-4 w-4 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.current ? (
                  <Button className="w-full" disabled>
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    variant={plan.name === 'VIP' ? 'default' : 'outline'}
                  >
                    {plans.findIndex((p) => p.current) <
                    plans.findIndex((p) => p.name === plan.name)
                      ? 'Upgrade'
                      : 'Downgrade'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Savings Calculator */}
      <Card>
        <CardHeader>
          <CardTitle>Membership Benefits</CardTitle>
          <CardDescription>See how much you can save</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-muted rounded-lg p-4">
              <h4 className="mb-2 font-semibold">Monthly Spend: $200</h4>
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">Basic: $200</p>
                <p className="text-muted-foreground">
                  Standard: $180 (save $20)
                </p>
                <p className="text-success font-semibold">
                  Pro: $150 (save $50)
                </p>
                <p className="text-primary font-semibold">
                  VIP: $120 (save $80)
                </p>
              </div>
            </div>

            <div className="bg-muted rounded-lg p-4">
              <h4 className="mb-2 font-semibold">Monthly Spend: $500</h4>
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">Basic: $500</p>
                <p className="text-muted-foreground">
                  Standard: $450 (save $50)
                </p>
                <p className="text-success font-semibold">
                  Pro: $375 (save $125)
                </p>
                <p className="text-primary font-semibold">
                  VIP: $300 (save $200)
                </p>
              </div>
            </div>

            <div className="bg-muted rounded-lg p-4">
              <h4 className="mb-2 font-semibold">Monthly Spend: $1000</h4>
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">Basic: $1000</p>
                <p className="text-muted-foreground">
                  Standard: $900 (save $100)
                </p>
                <p className="text-success font-semibold">
                  Pro: $750 (save $250)
                </p>
                <p className="text-primary font-semibold">
                  VIP: $600 (save $400)
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
