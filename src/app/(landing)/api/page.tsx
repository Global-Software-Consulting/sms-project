import { buildMetadata } from '@/lib/seo/metadata';
import { JsonLd, breadcrumbSchema } from '@/lib/seo/structured-data';
import ApiClient from './api.client';

export const metadata = buildMetadata({
  title: 'Developer API',
  description:
    'Integrate SMS verification into your application with the BestSMSHQ REST API. Endpoints for activations, rentals, balance, services and webhooks.',
  path: '/api',
  keywords: [
    'SMS verification API',
    'OTP API',
    'SMS activation API',
    'developer SMS API',
    'REST API SMS',
  ],
});

export default function ApiPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'API', path: '/api' },
        ])}
      />
      <ApiClient />
    </>
  );
}
