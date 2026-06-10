import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: 'Troubleshooting — Knowledge Base',
  description:
    'Common issues and fixes for SMS verification on BestSMSHQ — code not received, payment failures, account access and more.',
  path: '/knowledge-base/troubleshooting',
});

export default function TroubleshootingArticle() {
  const articles = [
    {
      id: 'sms-not-received',
      title: 'SMS Not Received',
      description: "What to do when SMS doesn't arrive",
      readTime: '4 min',
    },
    {
      id: 'number-already-used',
      title: 'Number Already Used Error',
      description: 'Resolving duplicate number issues',
      readTime: '3 min',
    },
    {
      id: 'payment-failed',
      title: 'Payment Failed',
      description: 'Troubleshooting payment and deposit issues',
      readTime: '4 min',
    },
    {
      id: 'api-errors',
      title: 'Common API Errors',
      description: 'Fixing frequent API integration issues',
      readTime: '5 min',
    },
    {
      id: 'account-access',
      title: 'Account Access Issues',
      description: 'Login problems and account recovery',
      readTime: '3 min',
    },
    {
      id: 'refund-issues',
      title: 'Refund Not Received',
      description: 'Understanding refund processing times',
      readTime: '3 min',
    },
    {
      id: 'service-unavailable',
      title: 'Service Unavailable',
      description: 'What to do when a service is temporarily unavailable',
      readTime: '3 min',
    },
    {
      id: 'slow-delivery',
      title: 'Slow SMS Delivery',
      description: 'Improving SMS delivery speed',
      readTime: '4 min',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
      <div className="mx-auto max-w-4xl space-y-8">
        <Link prefetch={false}
          href="/knowledge-base"
          className="text-muted-foreground hover:text-primary inline-flex items-center transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Knowledge Base
        </Link>

        <div>
          <Badge className="mb-4">Troubleshooting</Badge>
          <h1 className="mb-4 text-3xl font-bold sm:text-4xl">Troubleshooting</h1>
          <p className="text-muted-foreground text-xl">
            Common issues and solutions to help you resolve problems quickly.
          </p>
        </div>

        <div className="space-y-4">
          {articles.map((article) => (
            <Link prefetch={false}
              key={article.id}
              href={`/knowledge-base/troubleshooting/${article.id}`}
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
