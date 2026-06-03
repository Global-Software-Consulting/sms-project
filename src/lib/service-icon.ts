/**
 * Service icon URL sanitizer.
 *
 * Some services in the DB still carry icon URLs from CDNs that return 404
 * for many brands — `cdn.simpleicons.org/<brand>/<color>` for niche
 * brands, and `t[23].gstatic.com/faviconV2?client=SOCIAL&...` for certain
 * domains. Both produce visible network errors on every render even with
 * an `onError={display:none}` handler.
 *
 * This util replaces those broken URLs with Google's stable favicon CDN
 * (`https://www.google.com/s2/favicons?domain=<slug>.com&sz=64`), which
 * accepts any public domain. Anything that doesn't match a known bad
 * pattern is returned unchanged so admin uploads to our storage bucket
 * still work.
 */
export function safeServiceIcon(
  rawUrl: string | null | undefined,
  serviceNameOrSlug?: string | null,
): string | null {
  if (!rawUrl) return null;

  const fallback = (): string | null => {
    if (!serviceNameOrSlug) return null;
    const slug = serviceNameOrSlug
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
    if (slug.length < 2) return null;
    return `https://www.google.com/s2/favicons?domain=${slug}.com&sz=64`;
  };

  // simpleicons.org returns 404 for many brands we use (LinkedIn,
  // OpenAI, Outlook, Yahoo, Bumble, Hinge, Lazada, etc.)
  if (rawUrl.includes('cdn.simpleicons.org')) {
    return fallback() ?? rawUrl;
  }

  // gstatic.com faviconV2 with client=SOCIAL has restricted access and
  // 404s for arbitrary domains. The plain google.com/s2/favicons path
  // is the public, reliable one.
  if (
    rawUrl.includes('t2.gstatic.com/faviconV2') ||
    rawUrl.includes('t3.gstatic.com/faviconV2') ||
    rawUrl.includes('gstatic.com/faviconV2')
  ) {
    return fallback() ?? rawUrl;
  }

  return rawUrl;
}
