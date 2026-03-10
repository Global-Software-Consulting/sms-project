'use client';
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
} from 'lucide-react';

export default function Home() {
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
        'Choose from V1 Standard, V2 Premium, or V3 Elite providers based on your needs',
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

  const membershipTiers = [
    {
      name: 'Basic',
      price: '$0',
      discount: '0%',
      features: ['Standard pricing', 'All services', 'Basic support'],
      badge: null,
    },
    {
      name: 'Standard',
      price: '$29',
      discount: '10%',
      features: ['10% discount', 'Priority support', 'Favorite services'],
      badge: null,
    },
    {
      name: 'Pro',
      price: '$79',
      discount: '25%',
      features: ['25% discount', '24/7 support', 'API access', 'VIP routing'],
      badge: 'Popular',
    },
    {
      name: 'VIP',
      price: '$199',
      discount: '40%',
      features: [
        '40% discount',
        'Dedicated support',
        'Premium API',
        'Highest priority',
      ],
      badge: 'Best Value',
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
            Receive SMS Activations
            <span className="from-primary to-accent mt-2 block bg-gradient-to-r bg-clip-text text-transparent">
              Instantly & Reliably
            </span>
          </h1>

          <p className="text-muted-foreground mx-auto max-w-2xl px-2 text-base sm:text-xl">
            Get instant access to SMS verification numbers from 180+ countries.
            Professional, fast, and secure.
          </p>

          <div className="flex flex-col items-center justify-center gap-3 px-4 sm:flex-row sm:gap-4 sm:px-0">
            <Button
              asChild
              size="lg"
              className="btn-premium w-full text-base sm:w-auto"
            >
              <Link href="/auth/signup">
                Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full text-base sm:w-auto"
            >
              <Link href="/pricing">View Pricing</Link>
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
      <section className="border-border container mx-auto border-t px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 space-y-4 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">
              Choose Your Provider Type
            </h2>
            <p className="text-muted-foreground text-lg">
              Select from Standard, Premium, or Elite providers based on your
              needs
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Standard V1 */}
            <Card className="border-2">
              <CardHeader>
                <Badge className="mb-2 w-fit bg-blue-500">💰 Standard V1</Badge>
                <CardTitle className="text-xl">Standard Activation</CardTitle>
                <CardDescription>
                  Cost-effective SMS verification
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
                    <span className="text-sm">Standard delivery speed</span>
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
                  <p className="text-2xl font-bold">From $0.50</p>
                  <p className="text-muted-foreground text-sm">
                    per activation
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Premium V2 */}
            <Card className="border-primary relative overflow-hidden border-2">
              <div className="bg-primary text-primary-foreground absolute top-0 right-0 px-3 py-1 text-xs font-semibold">
                POPULAR
              </div>
              <CardHeader>
                <Badge className="from-primary to-accent mb-2 w-fit bg-gradient-to-r">
                  💎 Premium V2
                </Badge>
                <CardTitle className="text-xl">Premium Activation</CardTitle>
                <CardDescription>
                  Fastest and most reliable service
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
                      Premium providers only
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
                  <p className="text-primary text-2xl font-bold">From $1.50</p>
                  <p className="text-muted-foreground text-sm">
                    per activation
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Elite V3 */}
            <Card className="border-warning relative overflow-hidden border-2">
              <div className="bg-warning text-warning-foreground absolute top-0 right-0 px-3 py-1 text-xs font-semibold">
                BEST
              </div>
              <CardHeader>
                <Badge className="from-warning mb-2 w-fit bg-gradient-to-r to-amber-500">
                  👑 Elite V3
                </Badge>
                <CardTitle className="text-xl">Elite Activation</CardTitle>
                <CardDescription>
                  Ultimate tier with guaranteed delivery
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
                      Elite providers only
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
                  <p className="text-warning text-2xl font-bold">From $2.50</p>
                  <p className="text-muted-foreground text-sm">
                    per activation
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-border container mx-auto border-t px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 space-y-4 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">How It Works</h2>
            <p className="text-muted-foreground text-lg">
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
      <section className="border-border container mx-auto border-t px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 space-y-4 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Key Features</h2>
            <p className="text-muted-foreground text-lg">
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
      <section className="border-border container mx-auto border-t px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 space-y-4 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Membership Plans</h2>
            <p className="text-muted-foreground text-lg">
              Save more with our membership tiers
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {membershipTiers.map((tier) => (
              <Card
                key={tier.name}
                className={
                  tier.name === 'VIP'
                    ? 'border-primary relative border-2'
                    : 'border-2'
                }
              >
                {tier.badge && (
                  <div className="bg-primary text-primary-foreground absolute top-0 right-0 rounded-bl-lg px-3 py-1 text-xs font-semibold">
                    {tier.badge}
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <div className="pt-2">
                    <p className="text-3xl font-bold">{tier.price}</p>
                    <p className="text-muted-foreground text-sm">per month</p>
                  </div>
                  <Badge
                    variant={tier.name === 'VIP' ? 'default' : 'secondary'}
                    className="mt-2 w-fit"
                  >
                    {tier.discount} Discount
                  </Badge>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {tier.features.map((feature) => (
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
                    variant={tier.name === 'VIP' ? 'default' : 'outline'}
                  >
                    <Link href="/dashboard/membership">
                      {tier.name === 'Basic' ? 'Get Started' : 'Upgrade'}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Reviews */}
      <section className="border-border container mx-auto border-t px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 space-y-4 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">
              Trusted by Thousands
            </h2>
            <p className="text-muted-foreground text-lg">
              See what our customers have to say
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
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
                content:
                  'VIP membership pays for itself. The discounts are incredible.',
                rating: 5,
              },
            ].map((review, i) => (
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

          <div className="border-border mt-12 flex justify-center gap-8 border-t pt-12">
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
      <section className="border-border container mx-auto border-t px-4 py-20">
        <div className="mx-auto max-w-4xl space-y-6 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground text-lg">
            Join thousands of satisfied customers using SMSPro
          </p>
          <Button asChild size="lg" className="btn-premium text-base">
            <Link href="/auth/signup">
              Start Receiving SMS Now <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
