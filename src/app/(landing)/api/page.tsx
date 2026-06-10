import { buildLandingMetadata } from '@/lib/seo/landing-metadata';
import { JsonLd, breadcrumbSchema } from '@/lib/seo/structured-data';
import { fetchPageContent, pick } from '@/lib/page-content';
import ApiClient, { type ApiContent } from './api.client';

export const generateMetadata = () =>
  buildLandingMetadata({
    slug: 'api',
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

export default async function ApiPage() {
  const raw = await fetchPageContent('api');
  const content: ApiContent = {
    heroHeading: pick(raw, 'page_api_hero_heading', 'Developer API'),
    heroDescription: pick(
      raw,
      'page_api_hero_description',
      'Integrate SMS verification into your applications with our simple, powerful API',
    ),
    ctaHeading: pick(raw, 'page_api_cta_heading', 'Ready to Integrate?'),
    ctaBody: pick(
      raw,
      'page_api_cta_body',
      'Get your API key and start building today',
    ),
  };

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'API', path: '/api' },
        ])}
      />
      <ApiClient content={content} />
    </>
  );
}
