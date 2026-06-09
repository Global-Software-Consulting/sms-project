import { buildLandingMetadata } from '@/lib/seo/landing-metadata';
import { JsonLd, breadcrumbSchema } from '@/lib/seo/structured-data';
import { fetchPageContent, pick } from '@/lib/page-content';
import PricingClient, { type PricingContent } from './pricing.client';

export const generateMetadata = () =>
  buildLandingMetadata({
    slug: 'pricing',
    title: 'Pricing & Plans',
    description:
      'Transparent SMS verification pricing. Pay-as-you-go for activations, flexible rentals, and membership plans for high-volume users. No hidden fees.',
    path: '/pricing',
    keywords: [
      'SMS verification pricing',
      'SMS activation cost',
      'virtual number pricing',
      'cheap SMS service',
      'SMS membership plans',
    ],
  });

export default async function Pricing() {
  const raw = await fetchPageContent('pricing');
  const content: PricingContent = {
    heroHeading: pick(
      raw,
      'page_pricing_hero_heading',
      'Simple, Flexible Pricing',
    ),
    heroDescription: pick(
      raw,
      'page_pricing_hero_description',
      'Choose the provider tier that matches your needs. No hidden fees, no surprises.',
    ),
    ctaHeading: pick(raw, 'page_pricing_cta_heading', 'Ready to Get Started?'),
    ctaBody: pick(
      raw,
      'page_pricing_cta_body',
      'Create your account and start using our service today',
    ),
  };

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Pricing', path: '/pricing' },
        ])}
      />
      <PricingClient content={content} />
    </>
  );
}
