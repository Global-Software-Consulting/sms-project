import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: 'SMS Activation — Knowledge Base',
  description:
    'Everything you need to know about SMS activation: what it is, how to use it, supported services and countries, success rates, and best practices.',
  path: '/knowledge-base/sms-activation',
  keywords: [
    'SMS activation guide',
    'how SMS verification works',
    'OTP receive SMS',
  ],
});

export default function SMSActivationArticle() {
  const articles = [
    {
      id: 'how-it-works',
      title: 'How SMS Activation Works',
      description: 'Complete flow from selection to SMS receipt',
      readTime: '4 min',
    },
    {
      id: 'standard-vs-premium',
      title: 'Difference Between Standard and Premium',
      description: 'Understanding V1 and V2 provider tiers',
      readTime: '5 min',
    },
    {
      id: 'choosing-service',
      title: 'Choosing the Right Service',
      description: 'How to select services and countries',
      readTime: '3 min',
    },
    {
      id: 'success-rates',
      title: 'Understanding Success Rates',
      description: 'What affects activation success',
      readTime: '4 min',
    },
    {
      id: 'refund-policy',
      title: 'Automatic Refund System',
      description: 'How refunds work when activation fails',
      readTime: '3 min',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
      <div className="mx-auto max-w-4xl space-y-8">
        <Link
          href="/knowledge-base"
          className="text-muted-foreground hover:text-primary inline-flex items-center transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Knowledge Base
        </Link>

        <div>
          <Badge className="mb-4">SMS Activation</Badge>
          <h1 className="mb-4 text-3xl font-bold sm:text-4xl">SMS Activation Guide</h1>
          <p className="text-muted-foreground text-xl">
            Learn how SMS activation works step by step and how to maximize
            success rates.
          </p>
        </div>

        <div className="space-y-4">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/knowledge-base/sms-activation/${article.id}`}
              className="group block"
            >
              <Card className="transition-all duration-180 hover:-translate-y-0.5 hover:[box-shadow:var(--glass-shadow-3),var(--glow-accent)]">
                <CardContent className="py-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="group-hover:text-primary mb-2 text-lg font-semibold transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {article.description}
                      </p>
                    </div>
                    <div className="text-muted-foreground ml-4 text-sm whitespace-nowrap">
                      {article.readTime}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
