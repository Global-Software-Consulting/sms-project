import type { Metadata } from 'next';
import { buildMetadata } from './metadata';

/**
 * Build landing-page Next.js Metadata that incorporates admin SEO
 * overrides written from /admin/seo (Pages tab). Falls back to the
 * page's hard-coded defaults when the corresponding setting is missing,
 * so a fresh install with no rows yet still renders sensibly.
 *
 * Read keys (public — set by `persistCanonicalPageSeo` on the admin
 * SEO page):
 *   - page_<slug>_seo_meta_title
 *   - page_<slug>_seo_meta_description
 *   - page_<slug>_seo_keywords        (comma-separated)
 *   - page_<slug>_seo_og_title        (unused by buildMetadata today
 *                                       but read for forward-compat)
 *   - page_<slug>_seo_og_description
 *
 * Call from a page's `generateMetadata` export.
 */

export interface LandingMetadataDefaults {
  /** SEO slug — matches the key written by /admin/seo Pages tab. */
  slug: string;
  /** Default title when admin hasn't overridden. */
  title: string;
  /** Default description. */
  description: string;
  /** Public path for canonical URL. */
  path: string;
  /** Default keyword array (used when admin keywords are empty). */
  keywords?: string[];
}

async function fetchPageSeo(slug: string): Promise<Record<string, string>> {
  const base =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
  try {
    const res = await fetch(`${base}/settings/page/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return {};
    return (await res.json()) as Record<string, string>;
  } catch {
    return {};
  }
}

const splitKeywords = (raw: string): string[] =>
  raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

export async function buildLandingMetadata(
  defaults: LandingMetadataDefaults,
): Promise<Metadata> {
  const content = await fetchPageSeo(defaults.slug);

  const title =
    content[`page_${defaults.slug}_seo_meta_title`]?.trim() || defaults.title;
  const description =
    content[`page_${defaults.slug}_seo_meta_description`]?.trim() ||
    defaults.description;
  const adminKeywordsRaw = content[`page_${defaults.slug}_seo_keywords`] ?? '';
  const keywords = adminKeywordsRaw
    ? splitKeywords(adminKeywordsRaw)
    : defaults.keywords;

  return buildMetadata({
    title,
    description,
    path: defaults.path,
    keywords,
  });
}
