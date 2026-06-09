import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { buildLandingMetadata } from '@/lib/seo/landing-metadata';
import { JsonLd, breadcrumbSchema } from '@/lib/seo/structured-data';
import { fetchPageContent, pick } from '@/lib/page-content';

export const generateMetadata = () =>
  buildLandingMetadata({
    slug: 'reviews',
    title: 'Customer Reviews',
    description:
      'Read what real customers say about BestSMSHQ — our SMS verification service, reliability, support and value across thousands of users worldwide.',
    path: '/reviews',
    keywords: [
      'BestSMSHQ reviews',
      'SMS service reviews',
      'customer testimonials',
      'SMS verification reviews',
    ],
  });

export default async function Reviews() {
  const raw = await fetchPageContent('reviews');
  const heroHeading = pick(
    raw,
    'page_reviews_hero_heading',
    'Customer Reviews',
  );
  const reviews = [
    { name: 'Sarah J.', rating: 5, text: "Best SMS service I've used!" },
    { name: 'Mike C.', rating: 5, text: 'Fast and reliable' },
    { name: 'Emma D.', rating: 5, text: 'Great value for money' },
  ];

  return (
    <div className="container mx-auto px-4 py-12 sm:py-20">
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Reviews', path: '/reviews' },
        ])}
      />
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">
          {heroHeading}
        </h1>
        <div className="grid gap-6 md:grid-cols-2">
          {reviews.map((review, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="mb-2 flex space-x-1">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="fill-warning text-warning h-4 w-4"
                    />
                  ))}
                </div>
                <CardTitle className="text-base">{review.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{review.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
