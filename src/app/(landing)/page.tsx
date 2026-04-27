import { buildMetadata } from '@/lib/seo/metadata';
import {
  JsonLd,
  breadcrumbSchema,
  productServiceSchema,
} from '@/lib/seo/structured-data';
import { SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION } from '@/lib/seo/site-config';
import HomeClient from './home.client';

export const metadata = buildMetadata({
  title: `${SITE_NAME} — ${SITE_TAGLINE}`,
  description: SITE_DESCRIPTION,
  path: '/',
  keywords: [
    'SMS verification',
    'SMS activation',
    'virtual phone numbers',
    'OTP verification service',
    'receive SMS online',
    'temporary phone number',
    'rent virtual numbers',
  ],
});

export default function Home() {
  return (
    <>
      <JsonLd data={productServiceSchema()} />
      <JsonLd data={breadcrumbSchema([{ name: 'Home', path: '/' }])} />
      <HomeClient />
    </>
  );
}
