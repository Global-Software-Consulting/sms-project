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
  Users,
  DollarSign,
  TrendingUp,
  Award,
  Target,
  Gift,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Percent,
  Copy,
  MousePointerClick,
  UserPlus,
  Wallet,
  Zap,
  Clock,
  Star,
} from 'lucide-react';

export default function Referral() {
  const stats = [
    { label: 'Active Referrers', value: '2,500+' },
    { label: 'Total Paid Out', value: '$125K+' },
    { label: 'Avg. Monthly Earning', value: '$450' },
    { label: 'Top Earner', value: '$3,200/mo' },
  ];

  const commissionTiers = [
    {
      name: 'Bronze',
      range: '0-49 Referrals',
      rate: '10%',
      icon: Award,
      color: 'text-orange-600',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      description: 'Great starting point for newcomers',
    },
    {
      name: 'Silver',
      range: '50-99 Referrals',
      rate: '12%',
      icon: Award,
      color: 'text-gray-400',
      bgColor: 'bg-gray-400/10',
      borderColor: 'border-gray-400/30',
      description: 'Increased earnings as you grow',
    },
    {
      name: 'Gold',
      range: '100-249 Referrals',
      rate: '15%',
      icon: Award,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/30',
      popular: true,
      description: 'Maximize your commission potential',
    },
    {
      name: 'Platinum',
      range: '250+ Referrals',
      rate: '20%',
      icon: Award,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/30',
      elite: true,
      description: 'Elite status with highest earnings',
    },
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Sign Up & Get Your Link',
      description:
        'Create an account and receive your unique referral link instantly',
      icon: UserPlus,
      color: 'text-blue-500',
    },
    {
      step: '2',
      title: 'Share Your Link',
      description:
        'Share your referral link on social media, blogs, or with friends',
      icon: MousePointerClick,
      color: 'text-primary',
    },
    {
      step: '3',
      title: 'They Sign Up',
      description: 'New users register using your unique referral link',
      icon: Users,
      color: 'text-success',
    },
    {
      step: '4',
      title: 'Earn Commissions',
      description: 'Receive instant commission on all their purchases, forever',
      icon: DollarSign,
      color: 'text-warning',
    },
  ];

  const benefits = [
    {
      icon: DollarSign,
      title: 'Lifetime Commissions',
      description:
        'Earn 10-20% commission on every purchase your referrals make, for life',
    },
    {
      icon: Zap,
      title: 'Instant Payouts',
      description:
        'Commissions are credited to your wallet immediately after each transaction',
    },
    {
      icon: TrendingUp,
      title: 'Unlimited Earnings',
      description: 'No cap on earnings - the more you refer, the more you earn',
    },
    {
      icon: Target,
      title: 'Progressive Tiers',
      description:
        'Unlock higher commission rates as you refer more users (up to 20%)',
    },
    {
      icon: Clock,
      title: 'Real-time Tracking',
      description:
        'Monitor clicks, signups, and earnings in your dashboard 24/7',
    },
    {
      icon: Star,
      title: 'Priority Support',
      description: 'Top referrers get dedicated support and exclusive benefits',
    },
  ];

  const exampleEarnings = [
    {
      referrals: '10 users',
      avgSpend: '$50/month',
      rate: '10%',
      monthly: '$50',
      yearly: '$600',
    },
    {
      referrals: '50 users',
      avgSpend: '$50/month',
      rate: '12%',
      monthly: '$300',
      yearly: '$3,600',
      popular: true,
    },
    {
      referrals: '100 users',
      avgSpend: '$50/month',
      rate: '15%',
      monthly: '$750',
      yearly: '$9,000',
    },
    {
      referrals: '250+ users',
      avgSpend: '$50/month',
      rate: '20%',
      monthly: '$2,500+',
      yearly: '$30,000+',
      elite: true,
    },
  ];

  const faqs = [
    {
      question: 'How much can I earn?',
      answer:
        "You earn 10-20% commission on every purchase made by users you refer. There's no limit to your earnings - top referrers make over $3,000/month!",
    },
    {
      question: 'When do I get paid?',
      answer:
        'Commissions are credited to your wallet instantly after each transaction. You can withdraw your earnings at any time.',
    },
    {
      question: 'Is there a minimum payout?',
      answer:
        'No minimum payout! You can withdraw your referral earnings whenever you want, regardless of the amount.',
    },
    {
      question: 'How do I track my referrals?',
      answer:
        'Your dashboard provides real-time tracking of clicks, signups, active referrals, and all commission earnings with detailed analytics.',
    },
    {
      question: 'Do commissions expire?',
      answer:
        'No! You earn lifetime recurring commissions on all purchases made by your referrals, forever.',
    },
    {
      question: 'Can I promote on social media?',
      answer:
        'Absolutely! Share your referral link on any platform - social media, blogs, YouTube, forums, or anywhere you like.',
    },
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 sm:py-20 md:py-28">
        <div className="mx-auto max-w-4xl space-y-8 text-center">
          <Badge variant="secondary" className="px-4 py-2">
            <Sparkles className="mr-2 inline h-4 w-4" />
            Referral Program
          </Badge>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-6xl">
            Earn Money by
            <span className="from-primary to-accent mt-2 block bg-gradient-to-r bg-clip-text text-transparent">
              Sharing Our Platform
            </span>
          </h1>

          <p className="text-muted-foreground mx-auto max-w-2xl text-base sm:text-xl">
            Get up to 20% lifetime commission on every purchase made by users
            you refer. Start earning today with our simple and lucrative
            referral program.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="btn-premium text-base">
              <Link href="/auth/signup">
                Start Referring Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base">
              <Link href="/dashboard/referrals">View Dashboard</Link>
            </Button>
          </div>

          {/* Live Stats */}
          <div className="grid grid-cols-2 gap-6 pt-12 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="space-y-2">
                <p className="text-primary text-3xl font-bold">{stat.value}</p>
                <p className="text-muted-foreground text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commission Tiers Section */}
      <section className="border-border container mx-auto border-t px-4 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 space-y-4 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">Commission Tiers</h2>
            <p className="text-muted-foreground text-lg">
              Unlock higher commission rates as you grow your referrals
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {commissionTiers.map((tier) => {
              const Icon = tier.icon;
              return (
                <Card
                  key={tier.name}
                  className={`border-2 ${tier.borderColor} ${tier.bgColor} card-hover-lift relative ${
                    tier.popular
                      ? 'ring-warning ring-2'
                      : tier.elite
                        ? 'ring-primary ring-2'
                        : ''
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-warning text-white">POPULAR</Badge>
                    </div>
                  )}
                  {tier.elite && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary">ELITE</Badge>
                    </div>
                  )}
                  <CardHeader className="pb-4 text-center">
                    <div
                      className={`mx-auto h-12 w-12 rounded-full ${tier.bgColor} mb-3 flex items-center justify-center`}
                    >
                      <Icon className={`h-6 w-6 ${tier.color}`} />
                    </div>
                    <CardTitle className="text-xl">{tier.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {tier.range}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-center">
                    <div>
                      <p className={`text-4xl font-bold ${tier.color}`}>
                        {tier.rate}
                      </p>
                      <p className="text-muted-foreground mt-1 text-sm">
                        Commission Rate
                      </p>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {tier.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="from-primary/10 to-accent/10 border-primary/20 mt-8 rounded-lg border bg-gradient-to-r p-6">
            <div className="flex items-start gap-4">
              <div className="bg-primary/20 rounded-full p-3">
                <TrendingUp className="text-primary h-6 w-6" />
              </div>
              <div>
                <h3 className="mb-1 text-lg font-semibold">
                  Progressive Commission System
                </h3>
                <p className="text-muted-foreground">
                  Start earning 10% and unlock higher rates as you refer more
                  users. Reach Platinum tier to earn 20% lifetime commission on
                  every purchase. The more you grow, the more you earn!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="border-border container mx-auto border-t px-4 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 space-y-4 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">How It Works</h2>
            <p className="text-muted-foreground text-lg">
              Start earning in 4 simple steps
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="space-y-4 text-center">
                  <div className="relative inline-block">
                    <div
                      className={`from-primary/20 to-accent/20 mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br`}
                    >
                      <Icon className={`h-8 w-8 ${step.color}`} />
                    </div>
                    <div className="bg-primary text-primary-foreground absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="border-border container mx-auto border-t px-4 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 space-y-4 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">
              Why Join Our Program
            </h2>
            <p className="text-muted-foreground text-lg">
              Industry-leading benefits and features
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <Card key={benefit.title} className="card-hover-lift">
                  <CardHeader>
                    <div className="bg-primary/10 mb-3 flex h-12 w-12 items-center justify-center rounded-lg">
                      <Icon className="text-primary h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Earnings Calculator Section */}
      <section className="border-border container mx-auto border-t px-4 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 space-y-4 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">
              Potential Earnings
            </h2>
            <p className="text-muted-foreground text-lg">
              See how much you could earn based on referral count
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {exampleEarnings.map((example) => (
              <Card
                key={example.referrals}
                className={`card-hover-lift ${
                  example.popular
                    ? 'border-warning ring-warning/20 border-2 ring-2'
                    : example.elite
                      ? 'border-primary ring-primary/20 border-2 ring-2'
                      : ''
                }`}
              >
                {example.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-warning text-white">AVERAGE</Badge>
                  </div>
                )}
                {example.elite && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary">TOP EARNER</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <Badge variant="secondary" className="mx-auto mb-2">
                    {example.referrals}
                  </Badge>
                  <CardDescription className="text-xs">
                    @ {example.avgSpend} avg spend
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-primary/5 rounded-lg p-3 text-center">
                    <p className="text-muted-foreground mb-1 text-xs">
                      Commission Rate
                    </p>
                    <p className="text-primary text-2xl font-bold">
                      {example.rate}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Monthly:</span>
                      <span className="text-success font-bold">
                        {example.monthly}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Yearly:</span>
                      <span className="text-success font-bold">
                        {example.yearly}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground text-sm">
              * Earnings are estimated based on average user spending. Actual
              earnings may vary.
            </p>
          </div>
        </div>
      </section>

      {/* Features Highlight */}
      <section className="border-border container mx-auto border-t px-4 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-success/30 bg-success/5 border-2">
              <CardHeader>
                <div className="bg-success/10 mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                  <Wallet className="text-success h-6 w-6" />
                </div>
                <CardTitle>Instant Withdrawals</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Access your referral earnings instantly. No minimum payout
                  required - withdraw anytime to your wallet.
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/30 bg-primary/5 border-2">
              <CardHeader>
                <div className="bg-primary/10 mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                  <Copy className="text-primary h-6 w-6" />
                </div>
                <CardTitle>Easy Sharing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Get your unique referral link with one click. Share it
                  anywhere - social media, blogs, or direct messages.
                </p>
              </CardContent>
            </Card>

            <Card className="border-warning/30 bg-warning/5 border-2">
              <CardHeader>
                <div className="bg-warning/10 mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                  <Award className="text-warning h-6 w-6" />
                </div>
                <CardTitle>Exclusive Bonuses</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Top referrers get special perks: priority support, exclusive
                  features, and bonus commission events.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-border container mx-auto border-t px-4 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 space-y-4 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground text-lg">
              Everything you need to know about our referral program
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="card-hover-lift">
                <CardHeader>
                  <CardTitle className="flex items-start gap-3 text-lg">
                    <CheckCircle2 className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
                    {faq.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground pl-8">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-border container mx-auto border-t px-4 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-4xl">
          <Card className="border-primary from-primary/10 to-accent/10 border-2 bg-gradient-to-r">
            <CardContent className="space-y-6 py-12 text-center">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">
                  Ready to Start Earning?
                </h2>
                <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
                  Join thousands of users earning passive income through our
                  referral program. Sign up today and get your unique referral
                  link instantly.
                </p>
              </div>

              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button asChild size="lg" className="btn-premium text-base">
                  <Link href="/auth/signup">
                    Create Free Account <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="text-base"
                >
                  <Link href="/auth/login">Already Have Account?</Link>
                </Button>
              </div>

              <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-8 pt-6 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="text-success h-4 w-4" />
                  <span>No fees to join</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="text-success h-4 w-4" />
                  <span>Instant commission</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="text-success h-4 w-4" />
                  <span>Lifetime earnings</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
