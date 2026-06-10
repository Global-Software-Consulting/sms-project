import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CheckCircle2,
  Zap,
  Globe,
  Shield,
  Star,
  Clock,
  TrendingUp,
  Code,
} from 'lucide-react';
import { buildLandingMetadata } from '@/lib/seo/landing-metadata';
import {
  JsonLd,
  breadcrumbSchema,
  productServiceSchema,
} from '@/lib/seo/structured-data';
import { fetchPageContent, pick } from '@/lib/page-content';

export const generateMetadata = () =>
  buildLandingMetadata({
    slug: 'features',
    title: 'Features',
    description:
      'Instant SMS activation across 180+ countries, virtual number rentals, secure API access, and 24/7 support — all the features that make BestSMSHQ the leading SMS verification platform.',
    path: '/features',
    keywords: [
      'SMS verification features',
      'virtual number rental',
      'instant SMS activation',
      'SMS API',
      'OTP verification',
    ],
  });

export default async function Features() {
  const raw = await fetchPageContent('features');
  const heroHeading = pick(
    raw,
    'page_features_hero_heading',
    'Powerful Features',
  );
  const heroDescription = pick(
    raw,
    'page_features_hero_description',
    'Everything you need for seamless SMS verification',
  );
  const features = [
    {
      icon: Zap,
      title: 'Instant Activation',
      description:
        'Get your SMS number within seconds and start receiving messages immediately. Our automated system ensures zero waiting time.',
    },
    {
      icon: Clock,
      title: 'Real-time SMS Delivery',
      description:
        'Receive SMS codes in real-time with instant delivery notifications. Never miss a verification code again.',
    },
    {
      icon: Globe,
      title: '180+ Countries',
      description:
        'Access phone numbers from over 180 countries worldwide. Global coverage for all your verification needs.',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description:
        'Your data is encrypted and secure. We never store your verification codes or personal information.',
    },
    {
      icon: Star,
      title: 'Premium Providers',
      description:
        'Choose between standard and premium providers based on your needs. Get the fastest delivery with V2 Premium.',
    },
    {
      icon: TrendingUp,
      title: '99.7% Success Rate',
      description:
        'Industry-leading success rates ensure your verifications go through the first time, every time.',
    },
    {
      icon: Code,
      title: 'Developer API',
      description:
        'Integrate our service into your workflow with our comprehensive REST API. Full documentation included.',
    },
    {
      icon: CheckCircle2,
      title: 'Membership Discounts',
      description:
        'Save up to 40% on all services with our VIP membership tiers. The more you use, the more you save.',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
      <JsonLd data={productServiceSchema()} />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Features', path: '/features' },
        ])}
      />
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 space-y-4 text-center sm:mb-16">
          <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">
            {heroHeading}
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-base sm:text-xl">
            {heroDescription}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="hover:border-primary border-2 transition-colors"
              >
                <CardHeader>
                  <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                    <Icon className="text-primary h-6 w-6" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
