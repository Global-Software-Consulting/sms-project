import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: 'Reviews — Knowledge Base',
  description:
    'Learn how the BestSMSHQ review system works — submitting reviews, the unlock system, and how reviews benefit our community.',
  path: '/knowledge-base/reviews',
});

export default function ReviewsArticle() {
  const articles = [
    {
      id: 'review-unlock-system',
      title: 'Review Unlock System',
      description: 'How spending unlocks review slots and accumulation',
      readTime: '3 min',
    },
    {
      id: 'submitting-reviews',
      title: 'Submitting Quality Reviews',
      description: 'Best practices for helpful and accurate reviews',
      readTime: '4 min',
    },
    {
      id: 'review-impact',
      title: 'How Reviews Impact Services',
      description: 'Understanding how reviews affect provider rankings',
      readTime: '4 min',
    },
    {
      id: 'service-limits',
      title: 'Understanding Service Limits',
      description: 'Active number limits and how membership affects them',
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
          <Badge className="mb-4">Reviews & Limits</Badge>
          <h1 className="mb-4 text-3xl font-bold sm:text-4xl">Reviews & Limits</h1>
          <p className="text-muted-foreground text-xl">
            Understanding the review system and service usage limits.
          </p>
        </div>

        <div className="space-y-4">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/knowledge-base/reviews/${article.id}`}
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
