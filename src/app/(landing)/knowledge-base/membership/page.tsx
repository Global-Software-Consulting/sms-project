import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: 'Membership — Knowledge Base',
  description:
    'Understand BestSMSHQ membership plans, benefits, billing, and how to get more value from your subscription.',
  path: '/knowledge-base/membership',
});

export default function MembershipArticle() {
  const articles = [
    {
      id: 'membership-tiers',
      title: 'Understanding Membership Tiers',
      description: 'Complete breakdown of Basic, Standard, Pro, and VIP plans',
      readTime: '5 min',
    },
    {
      id: 'routing-priority',
      title: 'Routing Priority Explained',
      description: 'How membership affects number allocation and success rates',
      readTime: '4 min',
    },
    {
      id: 'membership-benefits',
      title: 'All Membership Benefits',
      description: 'Detailed list of features and perks for each tier',
      readTime: '6 min',
    },
    {
      id: 'upgrading-downgrading',
      title: 'Upgrading or Downgrading Plans',
      description: 'How to change your membership tier and billing',
      readTime: '3 min',
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
          <Badge className="mb-4">Membership</Badge>
          <h1 className="mb-4 text-3xl font-bold sm:text-4xl">Membership & Discounts</h1>
          <p className="text-muted-foreground text-xl">
            Understanding membership tiers, benefits, and how they affect your
            experience.
          </p>
        </div>

        <div className="space-y-4">
          {articles.map((article) => (
            <Link prefetch={false}
              key={article.id}
              href={`/knowledge-base/membership/${article.id}`}
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
