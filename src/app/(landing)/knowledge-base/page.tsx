import { buildLandingMetadata } from '@/lib/seo/landing-metadata';
import { JsonLd, breadcrumbSchema } from '@/lib/seo/structured-data';
import { fetchPageContent, pick } from '@/lib/page-content';
import KnowledgeBaseClient, {
  type KnowledgeBaseContent,
} from './knowledge-base.client';

export const generateMetadata = () =>
  buildLandingMetadata({
    slug: 'knowledge-base',
    title: 'Knowledge Base',
    description:
      'In-depth articles and guides for BestSMSHQ — SMS activation, virtual number rentals, membership, API, wallet and more.',
    path: '/knowledge-base',
    keywords: [
      'BestSMSHQ knowledge base',
      'SMS verification guides',
      'SMS rental tutorial',
      'how SMS activation works',
    ],
  });

export default async function KnowledgeBase() {
  const raw = await fetchPageContent('knowledge-base');
  const content: KnowledgeBaseContent = {
    heroHeading: pick(
      raw,
      'page_knowledge-base_hero_heading',
      'Knowledge Base',
    ),
    heroDescription: pick(
      raw,
      'page_knowledge-base_hero_description',
      'Everything you need to understand how the platform works, from activation flow to advanced usage.',
    ),
    ctaHeading: pick(
      raw,
      'page_knowledge-base_cta_heading',
      "Can't find what you're looking for?",
    ),
    ctaBody: pick(
      raw,
      'page_knowledge-base_cta_body',
      'Our support team is here to help you with any questions.',
    ),
  };

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Knowledge Base', path: '/knowledge-base' },
        ])}
      />
      <KnowledgeBaseClient content={content} />
    </>
  );
}
