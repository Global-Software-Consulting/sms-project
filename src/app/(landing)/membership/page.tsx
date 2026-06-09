import { buildLandingMetadata } from '@/lib/seo/landing-metadata';
import { JsonLd, breadcrumbSchema } from '@/lib/seo/structured-data';
import { fetchPageContent, pick } from '@/lib/page-content';
import MembershipClient, { type MembershipContent } from './membership.client';

export const generateMetadata = () =>
  buildLandingMetadata({
    slug: 'membership',
    title: 'Membership Plans',
    description:
      'Save more on SMS verification with BestSMSHQ membership plans. Volume discounts, priority support and exclusive features for power users.',
    path: '/membership',
    keywords: [
      'SMS verification membership',
      'SMS subscription plans',
      'volume SMS discounts',
      'BestSMSHQ membership',
    ],
  });

export default async function MembershipPage() {
  const raw = await fetchPageContent('membership');
  const content: MembershipContent = {
    heroHeading: pick(raw, 'page_membership_hero_heading', 'Choose Your Plan'),
    heroDescription: pick(
      raw,
      'page_membership_hero_description',
      'Save more, get priority access, and unlock premium features with our flexible membership tiers',
    ),
    ctaHeading: pick(
      raw,
      'page_membership_cta_heading',
      'Ready to Save More?',
    ),
    ctaBody: pick(
      raw,
      'page_membership_cta_body',
      'Join thousands of users who are already saving with our membership plans. Upgrade today and start getting more value from every activation.',
    ),
  };

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Membership', path: '/membership' },
        ])}
      />
      <MembershipClient content={content} />
    </>
  );
}
