import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo/site-config';

const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
}> = [
  { path: '/', changeFrequency: 'weekly', priority: 1.0 },
  { path: '/pricing', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/features', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/membership', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/api', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/contact', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/faq', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/blog', changeFrequency: 'daily', priority: 0.8 },
  { path: '/reviews', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/referral', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/help', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/status', changeFrequency: 'daily', priority: 0.5 },
  { path: '/knowledge-base', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/knowledge-base/getting-started', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/knowledge-base/sms-activation', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/knowledge-base/sms-activation/how-it-works', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/knowledge-base/sms-activation/standard-vs-premium', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/knowledge-base/rent-numbers', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/knowledge-base/membership', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/knowledge-base/wallet', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/knowledge-base/api', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/knowledge-base/reviews', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/knowledge-base/reviews/review-unlock-system', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/knowledge-base/troubleshooting', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/disclaimer', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/payment-policy', changeFrequency: 'yearly', priority: 0.3 },
];

interface PublicBlogPost {
  slug: string;
  updatedAt?: string;
  publishedAt?: string;
}

async function fetchBlogPosts(): Promise<PublicBlogPost[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return [];
  try {
    const res = await fetch(`${apiUrl}/blog?limit=1000&status=PUBLISHED`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as
      | PublicBlogPost[]
      | { data: PublicBlogPost[] };
    return Array.isArray(data) ? data : (data.data ?? []);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path === '/' ? '' : r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const posts = await fetchBlogPosts();
  const blogEntries: MetadataRoute.Sitemap = posts
    .filter((p) => p.slug)
    .map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
      changeFrequency: 'weekly',
      priority: 0.6,
    }));

  return [...staticEntries, ...blogEntries];
}
