import { Card, CardContent } from '@/components/ui/card';
import { buildLandingMetadata } from '@/lib/seo/landing-metadata';
import {
  JsonLd,
  breadcrumbSchema,
  organizationSchema,
} from '@/lib/seo/structured-data';
import { fetchPageContent, pick } from '@/lib/page-content';

export const generateMetadata = () =>
  buildLandingMetadata({
    slug: 'about',
    title: 'About Us',
    description:
      'BestSMSHQ is a premium SMS activation and number rental platform serving customers across 180+ countries. Learn about our mission and story.',
    path: '/about',
  });

export default async function About() {
  const raw = await fetchPageContent('about');
  const heroHeading = pick(raw, 'page_about_hero_heading', 'About BestSMSHQ');
  const intro = pick(
    raw,
    'page_about_body_intro',
    'BestSMSHQ is a premium SMS activation and number rental platform serving customers worldwide.',
  );
  const founding = pick(
    raw,
    'page_about_body_founding',
    "Founded in 2020, we've grown to serve thousands of customers across 180+ countries, providing reliable and instant SMS verification services for all major platforms.",
  );
  const mission = pick(
    raw,
    'page_about_body_mission',
    'Our mission is to make SMS verification simple, fast, and affordable for everyone.',
  );

  return (
    <div className="container mx-auto px-4 py-12 sm:py-20">
      <JsonLd data={organizationSchema()} />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'About', path: '/about' },
        ])}
      />
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">
          {heroHeading}
        </h1>
        <Card>
          <CardContent className="space-y-4 py-8">
            <p className="text-muted-foreground text-lg">{intro}</p>
            <p className="text-muted-foreground">{founding}</p>
            <p className="text-muted-foreground">{mission}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
