import { buildLandingMetadata } from '@/lib/seo/landing-metadata';
import {
  JsonLd,
  breadcrumbSchema,
} from '@/lib/seo/structured-data';
import ContactClient from './contact.client';

export const generateMetadata = () => buildLandingMetadata({
  slug: 'contact',
  title: 'Contact Us',
  description:
    'Get in touch with the BestSMSHQ team. Reach customer support for help with SMS activation, billing, partnerships and general inquiries.',
  path: '/contact',
  keywords: [
    'BestSMSHQ contact',
    'SMS verification support',
    'customer service',
    'help and support',
  ],
});

export default function Contact() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Contact', path: '/contact' },
        ])}
      />
      <ContactClient />
    </>
  );
}
