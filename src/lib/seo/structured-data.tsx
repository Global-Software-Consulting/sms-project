import { ORGANIZATION, SITE_NAME, SITE_URL, SITE_DESCRIPTION } from './site-config';

interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Renders a <script type="application/ld+json"> for Google rich-results.
 * Safe to use in both server and client components.
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export const organizationSchema = (): Record<string, unknown> => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: ORGANIZATION.name,
  legalName: ORGANIZATION.legalName,
  url: ORGANIZATION.url,
  logo: ORGANIZATION.logo,
  ...(ORGANIZATION.sameAs.length ? { sameAs: ORGANIZATION.sameAs } : {}),
});

export const websiteSchema = (): Record<string, unknown> => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/blog?search={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
});

export const breadcrumbSchema = (
  items: Array<{ name: string; path: string }>,
): Record<string, unknown> => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, idx) => ({
    '@type': 'ListItem',
    position: idx + 1,
    name: item.name,
    item: `${SITE_URL}${item.path === '/' ? '' : item.path}`,
  })),
});

export const faqSchema = (
  items: Array<{ question: string; answer: string }>,
): Record<string, unknown> => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
});

export const articleSchema = (opts: {
  title: string;
  description: string;
  url: string;
  image: string;
  publishedTime: string;
  modifiedTime?: string;
  authorName?: string;
}): Record<string, unknown> => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: opts.title,
  description: opts.description,
  image: [opts.image],
  datePublished: opts.publishedTime,
  ...(opts.modifiedTime ? { dateModified: opts.modifiedTime } : {}),
  author: {
    '@type': 'Person',
    name: opts.authorName || SITE_NAME,
  },
  publisher: organizationSchema(),
  mainEntityOfPage: { '@type': 'WebPage', '@id': opts.url },
});

export const productServiceSchema = (): Record<string, unknown> => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  provider: organizationSchema(),
  areaServed: { '@type': 'Place', name: 'Worldwide' },
  serviceType: 'SMS verification and number rental',
});
