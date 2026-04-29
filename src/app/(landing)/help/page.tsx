import { buildMetadata } from '@/lib/seo/metadata';
import { JsonLd, breadcrumbSchema } from '@/lib/seo/structured-data';
import HelpClient from './help.client';

export const metadata = buildMetadata({
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

export default function Help() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Help', path: '/help' },
        ])}
      />
      <HelpClient />
    </>
  );
}
