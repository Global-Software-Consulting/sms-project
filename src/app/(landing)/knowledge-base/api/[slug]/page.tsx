import { redirect } from 'next/navigation';

/**
 * Each of the eight historical article slugs (api-quickstart,
 * authentication, activation-endpoint, rental-endpoint,
 * webhook-notifications, rate-limits, error-handling, api-examples)
 * used to be its own page. They're now sections on the main
 * /knowledge-base/api page — this catch-all preserves the old URLs by
 * redirecting them to the right anchor.
 */
export default async function KbApiSlugRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/knowledge-base/api#${slug}`);
}
