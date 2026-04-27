'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  CheckCircle,
  Info,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

export default function HowActivationWorksClient() {
  const steps = [
    {
      number: '1',
      title: 'Choose country and service',
      description: 'Select the country and service you need activation for',
    },
    {
      number: '2',
      title: 'Select provider (Standard or Premium)',
      description:
        'Choose between cost-efficient Standard or priority Premium routing',
    },
    {
      number: '3',
      title: 'Purchase using wallet',
      description: 'Confirm purchase and funds are deducted from your balance',
    },
    {
      number: '4',
      title: 'Number appears instantly',
      description: 'Your phone number is displayed immediately for use',
    },
    {
      number: '5',
      title: 'SMS is received live',
      description: 'SMS messages appear in real-time as they arrive',
    },
    {
      number: '6',
      title: 'Number expires after timeout',
      description: 'Number remains active for 15 minutes or until first SMS',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
      <div className="mx-auto max-w-4xl">
        {/* Breadcrumb */}
        <div className="text-muted-foreground mb-8 flex items-center gap-2 text-sm">
          <Link
            href="/knowledge-base"
            className="hover:text-primary transition-colors"
          >
            Knowledge Base
          </Link>
          <ArrowRight className="h-4 w-4" />
          <Link
            href="/knowledge-base/sms-activation"
            className="hover:text-primary transition-colors"
          >
            SMS Activation
          </Link>
          <ArrowRight className="h-4 w-4" />
          <span className="text-foreground">How It Works</span>
        </div>

        {/* Article Header */}
        <div className="mb-8">
          <Badge className="mb-4">SMS Activation</Badge>
          <h1 className="mb-4 text-3xl font-bold sm:text-4xl">How SMS Activation Works</h1>
          <p className="text-muted-foreground">
            Published on February 15, 2026 · 4 min read
          </p>
        </div>

        <div className="space-y-8">
          {/* Main Content */}
          <Card>
            <CardContent className="space-y-8 py-8">
              {/* Introduction */}
              <div>
                <p className="text-lg leading-relaxed">
                  SMS activation is a simple process that allows you to receive
                  verification codes and messages without using your personal
                  phone number. Here's exactly how it works on our platform.
                </p>
              </div>

              {/* Info Block */}
              <div className="flex gap-4 rounded-lg p-4 [background:var(--glass-secondary)] [border:1px_solid_var(--glass-border)]">
                <Info className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="mb-1 font-medium">Quick Tip</p>
                  <p className="text-muted-foreground text-sm">
                    Premium providers offer higher success rates and faster
                    delivery, especially during peak hours.
                  </p>
                </div>
              </div>

              {/* Steps */}
              <div>
                <h2 className="mb-6 text-2xl font-semibold">Activation Flow</h2>
                <div className="space-y-6">
                  {steps.map((step) => (
                    <div key={step.number} className="flex gap-4">
                      <div className="bg-primary text-primary-foreground flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-bold">
                        {step.number}
                      </div>
                      <div className="flex-1 pt-1">
                        <h3 className="mb-1 font-semibold">{step.title}</h3>
                        <p className="text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual Diagram Placeholder */}
              <div className="rounded-lg p-12 text-center [background:var(--glass-secondary)] [border:2px_dashed_var(--glass-border)]">
                <p className="text-muted-foreground">Visual Flow Diagram</p>
                <p className="text-muted-foreground mt-2 text-sm">
                  Country → Service → Provider → Payment → Number → SMS
                </p>
              </div>

              {/* Success Block */}
              <div className="bg-success/10 border-success/20 flex gap-4 rounded-lg border p-4">
                <CheckCircle className="text-success mt-0.5 h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="text-success mb-1 font-medium">
                    Automatic Refund Protection
                  </p>
                  <p className="text-muted-foreground text-sm">
                    If you don't receive an SMS within the timeout period, your
                    funds are automatically refunded to your wallet.
                  </p>
                </div>
              </div>

              {/* Important Notes */}
              <div>
                <h2 className="mb-4 text-2xl font-semibold">Important Notes</h2>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-success mt-0.5 h-5 w-5 flex-shrink-0" />
                    <span>
                      Numbers are single-use and expire after receiving the
                      first SMS or after 15 minutes
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-success mt-0.5 h-5 w-5 flex-shrink-0" />
                    <span>
                      Premium providers process requests with higher priority
                      during peak times
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-success mt-0.5 h-5 w-5 flex-shrink-0" />
                    <span>
                      VIP members receive top allocation priority across all
                      providers
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-success mt-0.5 h-5 w-5 flex-shrink-0" />
                    <span>
                      All SMS messages are displayed in real-time with no delay
                    </span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/knowledge-base/sms-activation"
              className="text-muted-foreground hover:text-primary inline-flex items-center transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to SMS Activation
            </Link>
            <Link
              href="/knowledge-base/sms-activation/standard-vs-premium"
              className="text-primary inline-flex items-center transition-colors hover:underline"
            >
              Next: Standard vs Premium
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
