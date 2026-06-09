import { buildLandingMetadata } from '@/lib/seo/landing-metadata';
import { JsonLd, breadcrumbSchema } from '@/lib/seo/structured-data';
import { fetchPageContent, pick } from '@/lib/page-content';
import BlogClient, { type BlogContent } from './blog.client';

export const generateMetadata = () =>
  buildLandingMetadata({
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

export default async function Blog() {
  const raw = await fetchPageContent('blog');
  const content: BlogContent = {
    heroHeading: pick(raw, 'page_blog_hero_heading', 'Blog'),
    heroDescription: pick(
      raw,
      'page_blog_hero_description',
      'Latest news, guides, and updates from BestSMSHQ',
    ),
  };

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' },
        ])}
      />
      <BlogClient content={content} />
    </>
  );
}
