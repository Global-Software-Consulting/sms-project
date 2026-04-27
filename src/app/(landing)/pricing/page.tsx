import { buildMetadata } from '@/lib/seo/metadata';
import {
  JsonLd,
  breadcrumbSchema,
} from '@/lib/seo/structured-data';
import PricingClient from './pricing.client';

export const metadata = buildMetadata({
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

export default function Pricing() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Pricing', path: '/pricing' },
        ])}
      />
      <PricingClient />
    </>
  );
}
