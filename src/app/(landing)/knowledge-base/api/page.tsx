import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: 'API Knowledge Base',
  description:
    'Learn how to integrate with the BestSMSHQ API — quick start, authentication, endpoints, error handling and code examples.',
  path: '/knowledge-base/api',
});

export default function APIArticle() {
  const articles = [
    {
      id: 'api-quickstart',
      title: 'API Quick Start Guide',
      description: 'Get started with the API in minutes',
      readTime: '5 min',
    },
    {
      id: 'authentication',
      title: 'Authentication & API Keys',
      description: 'Managing API keys and authenticating requests',
      readTime: '4 min',
    },
    {
      id: 'activation-endpoint',
      title: 'Activation Endpoint',
      description: 'Creating activations programmatically',
      readTime: '6 min',
    },
    {
      id: 'rental-endpoint',
      title: 'Rental Endpoint',
      description: 'Managing number rentals via API',
      readTime: '5 min',
    },
    {
      id: 'webhook-notifications',
      title: 'Webhook Notifications',
      description: 'Receiving real-time SMS updates',
      readTime: '5 min',
    },
    {
      id: 'rate-limits',
      title: 'Rate Limits & Quotas',
      description: 'Understanding API usage limits',
      readTime: '3 min',
    },
    {
      id: 'error-handling',
      title: 'Error Handling',
      description: 'Handling API errors and response codes',
      readTime: '4 min',
    },
    {
      id: 'api-examples',
      title: 'Code Examples',
      description: 'Sample implementations in multiple languages',
      readTime: '8 min',
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
          <Badge className="mb-4">API Usage</Badge>
          <h1 className="mb-4 text-3xl font-bold sm:text-4xl">API Usage</h1>
          <p className="text-muted-foreground text-xl">
            Integrate our API into your workflow and automate SMS activation.
          </p>
        </div>

        <div className="space-y-4">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/knowledge-base/api/${article.id}`}
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
