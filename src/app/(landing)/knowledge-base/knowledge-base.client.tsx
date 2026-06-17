'use client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Search,
  HelpCircle,
  BookOpen,
  Smartphone,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Info,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const GETTING_STARTED_ID = '__getting_started__';

interface GettingStartedSection {
  title: string;
  items: string[];
}

const GETTING_STARTED_SECTIONS: GettingStartedSection[] = [
  {
    title: 'Setting Up Your Account',
    items: [
      "Visit the platform and click on 'Sign Up' or 'Get Started'",
      'Enter your email address and create a strong password',
      'Verify your email address by clicking the link sent to your inbox',
      'Complete your profile by adding your name and preferences',
      'Set up two-factor authentication (2FA) for enhanced security',
    ],
  },
  {
    title: 'Your First SMS Activation',
    items: [
      "Navigate to the 'Activation' page from the dashboard",
      'Select the service you want to receive SMS for (e.g., WhatsApp, Telegram)',
      'Choose between V1 (Standard) or V2 (Premium) provider based on your needs',
      'Select your preferred country from the available options',
      "Click 'Get Number' and wait for your virtual number to be assigned",
      'Use the assigned number for verification on your chosen service',
      'Return to the dashboard to view your received SMS code',
    ],
  },
  {
    title: 'Adding Funds to Your Wallet',
    items: [
      "Go to the 'Wallet' section in your dashboard",
      "Click on 'Add Funds' or 'Top Up'",
      'Choose your preferred payment method (Credit Card, Crypto, PayPal, etc.)',
      'Enter the amount you wish to deposit (minimum $5)',
      'Complete the payment process through the secure gateway',
      'Your balance will be updated instantly after successful payment',
    ],
  },
  {
    title: 'Platform Overview',
    items: [
      'Dashboard: View your account overview, recent activities, and quick stats',
      'Activation: Purchase virtual numbers for SMS verification',
      'Rent Numbers: Get long-term numbers for recurring verifications',
      'Favorites: Save your frequently used services for quick access',
      'Orders: Track your order history and active numbers',
      'Wallet: Manage your balance, add funds, and view transactions',
      'Membership: Upgrade to Pro or Elite for better rates and features',
      'Reviews: Earn rewards by reviewing your activation experience',
      'API: Access developer tools and integration documentation',
      'Referrals: Invite friends and earn commissions',
    ],
  },
];

const GETTING_STARTED_QUICK_TIPS: string[] = [
  'Start with a small deposit to test the platform before adding more funds',
  'V2 (Premium) providers have higher success rates but cost slightly more',
  'Enable 2FA to protect your account and funds',
  'Check the Status page if you experience any service interruptions',
  "Contact support if you don't receive an SMS within the expected timeframe",
];

export interface KnowledgeBaseContent {
  heroHeading: string;
  heroDescription: string;
  ctaHeading: string;
  ctaBody: string;
}

const FALLBACK_KB_CONTENT: KnowledgeBaseContent = {
  heroHeading: 'Knowledge Base',
  heroDescription:
    'Everything you need to understand how the platform works, from activation flow to advanced usage.',
  ctaHeading: "Can't find what you're looking for?",
  ctaBody: 'Our support team is here to help you with any questions.',
};

export default function KnowledgeBaseClient({
  content = FALLBACK_KB_CONTENT,
}: {
  content?: KnowledgeBaseContent;
} = {}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const isGettingStartedActive = activeCategoryId === GETTING_STARTED_ID;

  const q = searchQuery.toLowerCase();
  const gettingStartedMatchesSearch =
    !searchQuery ||
    'getting started learn the basics set up your account'.includes(q);
  const smsActivationMatchesSearch =
    !searchQuery ||
    'sms activation guide how sms activation works step by step'.includes(q);
  const anyMatch = gettingStartedMatchesSearch || smsActivationMatchesSearch;

  return (
    <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
      <div className="mx-auto max-w-6xl space-y-10">
        {!isGettingStartedActive && (
          <div className="space-y-6 text-center">
            <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">
              {content.heroHeading}
            </h1>
            <p className="text-muted-foreground mx-auto max-w-2xl text-base sm:text-xl">
              {content.heroDescription}
            </p>

            <div className="relative mx-auto max-w-2xl">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 z-10 h-5 w-5 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 border-white/10 bg-white/[0.03] pl-12 text-base"
              />
            </div>
          </div>
        )}

        {isGettingStartedActive && (
          <div className="space-y-8">
            <button
              onClick={() => setActiveCategoryId(null)}
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Knowledge Base
            </button>

            <div className="space-y-4">
              <span className="bg-primary/15 text-primary inline-flex items-center rounded-full px-3 py-1 text-xs font-medium">
                Getting Started
              </span>
              <h1 className="text-3xl font-bold sm:text-4xl">
                Getting Started
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg">
                Learn the basics and set up your account to start using the
                platform.
              </p>
            </div>

            {GETTING_STARTED_SECTIONS.map((section, idx) => (
              <Card key={section.title} className="p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-sm font-semibold text-amber-400">
                    {idx + 1}
                  </div>
                  <h2 className="text-xl font-semibold">{section.title}</h2>
                </div>
                <ul className="mt-5 space-y-3 pl-11">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                      <span className="text-muted-foreground text-sm leading-relaxed">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}

            <Card className="border-amber-500/20 bg-amber-500/[0.04] p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <Info className="h-5 w-5 text-amber-400" />
                <h2 className="text-lg font-semibold">Quick Tips</h2>
              </div>
              <ul className="mt-4 space-y-2 pl-8">
                {GETTING_STARTED_QUICK_TIPS.map((tip) => (
                  <li
                    key={tip}
                    className="text-muted-foreground list-disc text-sm leading-relaxed"
                  >
                    {tip}
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6 sm:p-8">
              <h2 className="text-lg font-semibold">Next Steps</h2>
              <div className="mt-4 space-y-2">
                {[
                  { label: 'Learn about SMS Activation', href: '#' },
                  { label: 'Understand Wallet Management', href: '#' },
                  { label: 'Explore Membership Tiers', href: '/membership' },
                ].map((step) => (
                  <Link
                    key={step.label}
                    prefetch={false}
                    href={step.href}
                    className="hover:border-primary/30 hover:bg-primary/5 flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3 text-sm transition-colors"
                  >
                    <span>{step.label}</span>
                    <ArrowRight className="text-muted-foreground h-4 w-4" />
                  </Link>
                ))}
              </div>
            </Card>
          </div>
        )}

        {!isGettingStartedActive &&
          (anyMatch ? (
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {gettingStartedMatchesSearch && (
                <button
                  onClick={() => setActiveCategoryId(GETTING_STARTED_ID)}
                  className="group hover:border-primary/30 flex min-h-[200px] cursor-pointer flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-left transition-colors hover:bg-white/[0.04]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/15">
                    <BookOpen className="h-5 w-5 text-amber-400" />
                  </div>
                  <h2 className="mt-5 line-clamp-1 text-base font-semibold">
                    Getting Started
                  </h2>
                  <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                    Learn the basics and set up your account
                  </p>
                  <p className="text-muted-foreground mt-auto pt-6 text-xs">
                    {GETTING_STARTED_SECTIONS.length} sections
                  </p>
                </button>
              )}
              {smsActivationMatchesSearch && (
                <Link
                  prefetch={false}
                  href="/knowledge-base/sms-activation"
                  className="group hover:border-primary/30 flex min-h-[200px] cursor-pointer flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-left transition-colors hover:bg-white/[0.04]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15">
                    <Smartphone className="h-5 w-5 text-emerald-400" />
                  </div>
                  <h2 className="mt-5 line-clamp-1 text-base font-semibold">
                    SMS Activation Guide
                  </h2>
                  <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                    How SMS activation works step by step
                  </p>
                  <p className="text-muted-foreground mt-auto pt-6 text-xs">
                    5 articles
                  </p>
                </Link>
              )}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <HelpCircle className="text-muted-foreground mx-auto mb-4 h-12 w-12 opacity-20" />
              <p className="text-muted-foreground">
                No articles match your search
              </p>
            </Card>
          ))}

        <Card className="mt-12 text-center">
          <div className="py-12">
            <h3 className="mb-2 text-2xl font-bold">{content.ctaHeading}</h3>
            <p className="text-muted-foreground mb-6">{content.ctaBody}</p>
            <Link
              prefetch={false}
              href="/help"
              className="bg-primary text-primary-foreground inline-flex items-center justify-center rounded-lg px-6 py-3 font-medium transition-all duration-180 hover:[box-shadow:var(--glow-accent-active)]"
            >
              Contact Support
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
