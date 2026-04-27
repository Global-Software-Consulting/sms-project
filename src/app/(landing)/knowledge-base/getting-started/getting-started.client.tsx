'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function GettingStartedArticleClient() {
  const sections = [
    {
      id: 'account-setup',
      title: 'Setting Up Your Account',
      content: [
        "Visit the platform and click on 'Sign Up' or 'Get Started'",
        'Enter your email address and create a strong password',
        'Verify your email address by clicking the link sent to your inbox',
        'Complete your profile by adding your name and preferences',
        'Set up two-factor authentication (2FA) for enhanced security',
      ],
    },
    {
      id: 'first-activation',
      title: 'Your First SMS Activation',
      content: [
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
      id: 'adding-funds',
      title: 'Adding Funds to Your Wallet',
      content: [
        "Go to the 'Wallet' section in your dashboard",
        "Click on 'Add Funds' or 'Top Up'",
        'Choose your preferred payment method (Credit Card, Crypto, PayPal, etc.)',
        'Enter the amount you wish to deposit (minimum $5)',
        'Complete the payment process through the secure gateway',
        'Your balance will be updated instantly after successful payment',
      ],
    },
    {
      id: 'platform-overview',
      title: 'Platform Overview',
      content: [
        'Dashboard: View your account overview, recent activities, and quick stats',
        'Activation: Purchase virtual numbers for SMS verification',
        'Rent Numbers: Get long-term numbers for recurring verifications',
        'Favorites: Save your frequently used services for quick access',
        'Orders: Track your order history and active numbers',
        'Wallet: Manage your balance, add funds, and view transactions',
        'Membership: Upgrade to Pro or VIP for better rates and features',
        'Reviews: Earn rewards by reviewing your activation experience',
        'API: Access developer tools and integration documentation',
        'Referrals: Invite friends and earn commissions',
      ],
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Back Button */}
        <Link
          href="/knowledge-base"
          className="text-muted-foreground hover:text-primary inline-flex items-center transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Knowledge Base
        </Link>

        {/* Category Header */}
        <div>
          <Badge className="mb-4">Getting Started</Badge>
          <h1 className="mb-4 text-3xl font-bold sm:text-4xl">Getting Started</h1>
          <p className="text-muted-foreground text-xl">
            Learn the basics and set up your account to start using the
            platform.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <Card key={section.id} id={section.id}>
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 text-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                    <span className="font-semibold">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h2 className="mb-4 text-2xl font-semibold">
                      {section.title}
                    </h2>
                    <ul className="space-y-3">
                      {section.content.map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Tips */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-6">
            <div className="flex items-start gap-4">
              <Info className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
              <div>
                <h3 className="mb-2 font-semibold">Quick Tips</h3>
                <ul className="text-muted-foreground space-y-2 text-sm">
                  <li>
                    • Start with a small deposit to test the platform before
                    adding more funds
                  </li>
                  <li>
                    • V2 (Premium) providers have higher success rates but cost
                    slightly more
                  </li>
                  <li>• Enable 2FA to protect your account and funds</li>
                  <li>
                    • Check the Status page if you experience any service
                    interruptions
                  </li>
                  <li>
                    • Contact support if you don't receive an SMS within the
                    expected timeframe
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardContent className="py-6">
            <h3 className="mb-4 font-semibold">Next Steps</h3>
            <div className="space-y-3">
              <Link
                href="/knowledge-base/sms-activation"
                className="hover:bg-accent group flex items-center justify-between rounded-lg p-3 transition-colors"
              >
                <span className="text-muted-foreground group-hover:text-foreground">
                  Learn about SMS Activation
                </span>
                <ArrowLeft className="text-muted-foreground group-hover:text-primary h-4 w-4 rotate-180" />
              </Link>
              <Link
                href="/knowledge-base/wallet"
                className="hover:bg-accent group flex items-center justify-between rounded-lg p-3 transition-colors"
              >
                <span className="text-muted-foreground group-hover:text-foreground">
                  Understand Wallet Management
                </span>
                <ArrowLeft className="text-muted-foreground group-hover:text-primary h-4 w-4 rotate-180" />
              </Link>
              <Link
                href="/knowledge-base/membership"
                className="hover:bg-accent group flex items-center justify-between rounded-lg p-3 transition-colors"
              >
                <span className="text-muted-foreground group-hover:text-foreground">
                  Explore Membership Tiers
                </span>
                <ArrowLeft className="text-muted-foreground group-hover:text-primary h-4 w-4 rotate-180" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
