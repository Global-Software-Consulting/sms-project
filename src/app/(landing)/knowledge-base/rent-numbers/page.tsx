import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function RentNumbersArticle() {
  const articles = [
    {
      id: 'rental-basics',
      title: 'Rental Basics',
      description:
        'Understanding number rental and how it differs from activation',
      readTime: '4 min',
    },
    {
      id: 'rental-duration',
      title: 'Choosing Rental Duration',
      description: 'Selecting the right rental period for your needs',
      readTime: '3 min',
    },
    {
      id: 'rental-management',
      title: 'Managing Your Rentals',
      description: 'Extending, canceling, and monitoring rental numbers',
      readTime: '5 min',
    },
    {
      id: 'rental-pricing',
      title: 'Rental Pricing Guide',
      description: 'How rental pricing works and membership discounts',
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
          <Badge className="mb-4">Rent Numbers</Badge>
          <h1 className="mb-4 text-3xl font-bold sm:text-4xl">Rent Numbers Guide</h1>
          <p className="text-muted-foreground text-xl">
            Learn how number rental works and how to manage your rented numbers
            effectively.
          </p>
        </div>

        <div className="space-y-4">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/knowledge-base/rent-numbers/${article.id}`}
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
