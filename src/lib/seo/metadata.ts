import type { Metadata } from 'next';
import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  DEFAULT_KEYWORDS,
  DEFAULT_OG_IMAGE,
  TWITTER_HANDLE,
} from './site-config';

interface BuildMetadataOptions {
  title: string;
  description?: string;
  path: string;
  keywords?: string[];
  ogImage?: string;
  noIndex?: boolean;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
}

/**
 * Build a Next.js Metadata object with sensible SEO defaults.
 * Always provides canonical URL, OG, and Twitter card metadata.
 */
export function buildMetadata(opts: BuildMetadataOptions): Metadata {
  const {
    title,
    description = SITE_DESCRIPTION,
    path,
    keywords = DEFAULT_KEYWORDS,
    ogImage = DEFAULT_OG_IMAGE,
    noIndex = false,
    type = 'website',
    publishedTime,
    modifiedTime,
    authors,
  } = opts;

  const canonical = `${SITE_URL}${path === '/' ? '' : path}`;

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
          },
        },
    openGraph: {
      type,
      url: canonical,
      siteName: SITE_NAME,
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      locale: 'en_US',
      ...(type === 'article' && publishedTime ? { publishedTime } : {}),
      ...(type === 'article' && modifiedTime ? { modifiedTime } : {}),
      ...(type === 'article' && authors ? { authors } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
      title,
      description,
      images: [ogImage],
    },
  };
}
