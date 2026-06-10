import { buildLandingMetadata } from '@/lib/seo/landing-metadata';
import { JsonLd, breadcrumbSchema } from '@/lib/seo/structured-data';
import { fetchPageContent, pick } from '@/lib/page-content';
import HelpClient, { type HelpContent } from './help.client';

export const generateMetadata = () =>
  buildLandingMetadata({
    slug: 'help',
    title: 'Help Center',
    description:
      'Find answers, guides and how-tos for using BestSMSHQ. Browse the public help center for SMS activation, rentals, billing and account topics.',
    path: '/help',
    keywords: [
      'BestSMSHQ help',
      'SMS verification help',
      'SMS activation guide',
      'how to use SMS service',
    ],
  });

export default async function Help() {
  const raw = await fetchPageContent('help');
  const content: HelpContent = {
    heroHeading: pick(raw, 'page_help_hero_heading', 'Help & Support'),
    heroDescription: pick(
      raw,
      'page_help_hero_description',
      "We're here to help. Search our help center for answers and guides.",
    ),
  };

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Help', path: '/help' },
        ])}
      />
      <HelpClient content={content} />
    </>
  );
}
