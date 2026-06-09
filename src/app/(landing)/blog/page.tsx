import { buildLandingMetadata } from '@/lib/seo/landing-metadata';
import {
  JsonLd,
  breadcrumbSchema,
} from '@/lib/seo/structured-data';
import BlogClient from './blog.client';

export const generateMetadata = () => buildLandingMetadata({
  slug: 'blog',
  title: 'Blog & News',
  description:
    'Guides, tutorials, and news from BestSMSHQ. Learn about SMS verification, virtual numbers, security best practices and platform updates.',
  path: '/blog',
  keywords: [
    'SMS verification blog',
    'virtual phone number guides',
    'OTP security tips',
    'BestSMSHQ news',
  ],
});

export default function Blog() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' },
        ])}
      />
      <BlogClient />
    </>
  );
}
