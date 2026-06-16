import { buildLandingMetadata } from '@/lib/seo/landing-metadata';
import { JsonLd, breadcrumbSchema } from '@/lib/seo/structured-data';
import { fetchPageContent, pick } from '@/lib/page-content';
import ReviewsClient from './ReviewsClient';

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
  const heroSubheading = pick(
    raw,
    'page_reviews_hero_subheading',
    'Read what real customers say about BestSMSHQ.',
  );

  return (
    <div className="container mx-auto px-4 py-12 sm:py-20">
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Reviews', path: '/reviews' },
        ])}
      />
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="space-y-3 text-center">
          <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">
            {heroHeading}
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-base sm:text-lg">
            {heroSubheading}
          </p>
        </div>
        <ReviewsClient />
      </div>
    </div>
  );
}
