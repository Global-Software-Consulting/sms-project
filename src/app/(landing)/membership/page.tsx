import { buildMetadata } from '@/lib/seo/metadata';
import { JsonLd, breadcrumbSchema } from '@/lib/seo/structured-data';
import MembershipClient from './membership.client';

export const metadata = buildMetadata({
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

export default function MembershipPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Membership', path: '/membership' },
        ])}
      />
      <MembershipClient />
    </>
  );
}
