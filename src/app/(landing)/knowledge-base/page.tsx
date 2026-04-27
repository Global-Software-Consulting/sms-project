import { buildMetadata } from '@/lib/seo/metadata';
import { JsonLd, breadcrumbSchema } from '@/lib/seo/structured-data';
import KnowledgeBaseClient from './knowledge-base.client';

export const metadata = buildMetadata({
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

export default function KnowledgeBase() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Knowledge Base', path: '/knowledge-base' },
        ])}
      />
      <KnowledgeBaseClient />
    </>
  );
}
