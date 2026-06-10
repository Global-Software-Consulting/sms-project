import { buildLandingMetadata } from '@/lib/seo/landing-metadata';
import { JsonLd, breadcrumbSchema } from '@/lib/seo/structured-data';
import { fetchPageContent, pick } from '@/lib/page-content';
import ContactClient from './contact.client';

export const generateMetadata = () =>
  buildLandingMetadata({
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

export default async function Contact() {
  const raw = await fetchPageContent('contact');
  const heroHeading = pick(
    raw,
    'page_contact_hero_heading',
    'SUBMIT A SUPPORT TICKET',
  );

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Contact', path: '/contact' },
        ])}
      />
      <ContactClient heroHeading={heroHeading} />
    </>
  );
}
