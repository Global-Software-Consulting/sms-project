import { buildLandingMetadata } from '@/lib/seo/landing-metadata';
import {
  JsonLd,
  breadcrumbSchema,
  productServiceSchema,
} from '@/lib/seo/structured-data';
import {
  SITE_NAME,
  SITE_TAGLINE,
  SITE_DESCRIPTION,
} from '@/lib/seo/site-config';
import { fetchPageContent, pick } from '@/lib/page-content';
import HomeClient, { type HomeContent } from './home.client';

export const generateMetadata = () =>
  buildLandingMetadata({
    slug: 'home',
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

export default async function Home() {
  const raw = await fetchPageContent('home');
  const content: HomeContent = {
    heroHeadingPart1: pick(
      raw,
      'page_home_hero_heading_part_1',
      'Receive SMS Activations',
    ),
    heroHeadingPart2: pick(
      raw,
      'page_home_hero_heading_part_2',
      'Instantly & Reliably',
    ),
    heroDescription: pick(
      raw,
      'page_home_hero_description',
      'Get instant access to SMS verification numbers from 180+ countries. Professional, fast, and secure.',
    ),
    heroButtonText: pick(raw, 'page_home_hero_button_text', 'Get Started'),
    ctaHeading: pick(raw, 'page_home_cta_heading', 'Ready to Get Started?'),
    ctaBody: pick(
      raw,
      'page_home_cta_body',
      'Join thousands of satisfied customers using BestSMSHQ',
    ),
    ctaButtonText: pick(
      raw,
      'page_home_cta_button_text',
      'Start Receiving SMS Now',
    ),
  };

  return (
    <>
      <JsonLd data={productServiceSchema()} />
      <JsonLd data={breadcrumbSchema([{ name: 'Home', path: '/' }])} />
      <HomeClient content={content} />
    </>
  );
}
