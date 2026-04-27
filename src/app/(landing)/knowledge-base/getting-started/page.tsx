import { buildMetadata } from '@/lib/seo/metadata';
import { JsonLd, breadcrumbSchema } from '@/lib/seo/structured-data';
import GettingStartedArticleClient from './getting-started.client';

export const metadata = buildMetadata({
  title: 'Getting Started Guide',
  description:
    'New to BestSMSHQ? Start here. Step-by-step guide to creating an account, funding your wallet and receiving your first SMS verification code.',
  path: '/knowledge-base/getting-started',
  keywords: [
    'BestSMSHQ getting started',
    'SMS verification setup',
    'first SMS activation',
  ],
});

export default function GettingStarted() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Knowledge Base', path: '/knowledge-base' },
          { name: 'Getting Started', path: '/knowledge-base/getting-started' },
        ])}
      />
      <GettingStartedArticleClient />
    </>
  );
}
