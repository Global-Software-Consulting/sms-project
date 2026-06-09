/**
 * Server-side helper that fetches the public page-content settings
 * keyed by `page_<slug>_*` for a given landing slug. Used by landing
 * server components to hydrate hero / CTA / etc. text from admin
 * (/admin/settings → Page Edit) at request time.
 *
 * Returns `{}` on any failure so the landing component can fall back
 * to its hard-coded defaults without crashing the route.
 *
 * Backed by the same `/settings/page/<slug>` endpoint that legal pages
 * and `buildLandingMetadata` already use.
 */

export type PageContent = Record<string, string>;

export async function fetchPageContent(slug: string): Promise<PageContent> {
  const base =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
  try {
    const res = await fetch(`${base}/settings/page/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return {};
    return (await res.json()) as PageContent;
  } catch {
    return {};
  }
}

/**
 * Pick a single page-content value with a non-empty fallback. Trims
 * whitespace so an admin who saves only spaces still falls back to the
 * default copy.
 */
export const pick = (
  content: PageContent,
  key: string,
  fallback: string,
): string => {
  const v = content[key]?.trim();
  return v && v.length > 0 ? v : fallback;
};
