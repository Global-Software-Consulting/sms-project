import { buildMetadata } from '@/lib/seo/metadata';

/**
 * Shared renderer for the 4 legal landing pages (privacy / terms /
 * refund / disclaimer). Reads content from system_settings at request
 * time so admin edits in /admin/settings → Page Edit show up live.
 *
 * Falls back to the hard-coded defaults below when a key is missing,
 * so a fresh install (no settings rows yet) still renders sensibly.
 *
 * Server component — fetched in the page wrapper.
 */

export interface LegalPageDefaults {
  /** e.g. "privacy" — used as the public-settings slug */
  slug: string;
  /** label-cased title shown if admin hasn't set one */
  title: string;
  /** body text shown if admin hasn't set one (markdown-lite) */
  body: string;
  /** "Last updated" line under the title */
  lastUpdated?: string;
  /** Public path for canonical URL */
  path: string;
  /** SEO defaults */
  metaTitle: string;
  metaDescription: string;
}

async function fetchPageContent(slug: string): Promise<Record<string, string>> {
  const base =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
  try {
    const res = await fetch(`${base}/settings/page/${slug}`, {
      // Public endpoint with 60s SWR cache; respect that on the server.
      next: { revalidate: 60 },
    });
    if (!res.ok) return {};
    return (await res.json()) as Record<string, string>;
  } catch {
    return {};
  }
}

/**
 * Build LegalPage metadata that incorporates admin SEO overrides.
 * Must be awaited from the page's `generateMetadata` export.
 */
export async function buildLegalMetadata(defaults: LegalPageDefaults) {
  const content = await fetchPageContent(defaults.slug);
  return buildMetadata({
    title:
      content[`page_${defaults.slug}_seo_meta_title`] || defaults.metaTitle,
    description:
      content[`page_${defaults.slug}_seo_meta_description`] ||
      defaults.metaDescription,
    path: defaults.path,
  });
}

/**
 * Render a small block of markdown-lite into HTML — supports:
 *   - paragraphs separated by blank lines
 *   - `# Heading` (level 1-3)
 *   - `- bullet` lists
 *   - `1. numbered` lists
 *   - `**bold**` inline
 * No raw HTML allowed; everything is escaped to prevent stored XSS
 * from a misbehaving admin.
 */
function renderBody(raw: string): React.ReactNode[] {
  const esc = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const inline = (s: string) =>
    esc(s).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  const lines = raw.split(/\r?\n/);
  const out: React.ReactNode[] = [];
  let i = 0;
  let key = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Blank line — separator
    if (!line.trim()) {
      i++;
      continue;
    }

    // Heading
    const h = /^(#{1,3})\s+(.+)$/.exec(line);
    if (h) {
      const level = h[1].length;
      const Tag = (`h${level + 1}` as 'h2' | 'h3' | 'h4');
      out.push(
        <Tag
          key={key++}
          className={
            level === 1
              ? 'mt-8 text-xl font-semibold sm:text-2xl'
              : level === 2
                ? 'mt-6 text-lg font-semibold sm:text-xl'
                : 'mt-4 text-base font-semibold sm:text-lg'
          }
        >
          {h[2]}
        </Tag>,
      );
      i++;
      continue;
    }

    // Bullet list
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ''));
        i++;
      }
      out.push(
        <ul
          key={key++}
          className="text-muted-foreground my-3 list-disc space-y-1 pl-6"
        >
          {items.map((it, idx) => (
            <li
              key={idx}
              dangerouslySetInnerHTML={{ __html: inline(it) }}
            />
          ))}
        </ul>,
      );
      continue;
    }

    // Numbered list
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ''));
        i++;
      }
      out.push(
        <ol
          key={key++}
          className="text-muted-foreground my-3 list-decimal space-y-1 pl-6"
        >
          {items.map((it, idx) => (
            <li
              key={idx}
              dangerouslySetInnerHTML={{ __html: inline(it) }}
            />
          ))}
        </ol>,
      );
      continue;
    }

    // Paragraph
    out.push(
      <p
        key={key++}
        className="text-muted-foreground my-3 text-sm leading-relaxed sm:text-base"
        dangerouslySetInnerHTML={{ __html: inline(line) }}
      />,
    );
    i++;
  }
  return out;
}

export async function LegalPage({
  defaults,
}: {
  defaults: LegalPageDefaults;
}) {
  const content = await fetchPageContent(defaults.slug);
  const title =
    content[`page_${defaults.slug}_header_title`] || defaults.title;
  const lastUpdated =
    content[`page_${defaults.slug}_body_last_updated`] ||
    defaults.lastUpdated ||
    '';
  const intro = content[`page_${defaults.slug}_body_intro`] || '';
  const body = content[`page_${defaults.slug}_body_content`] || defaults.body;

  return (
    <article className="container mx-auto max-w-4xl space-y-6 px-4 py-12">
      <header className="space-y-3 text-center">
        <h1 className="text-2xl font-bold sm:text-3xl md:text-4xl">{title}</h1>
        {lastUpdated && (
          <p className="text-muted-foreground text-sm">
            Last updated: {lastUpdated}
          </p>
        )}
      </header>

      {intro && (
        <p className="text-muted-foreground text-center text-sm sm:text-base">
          {intro}
        </p>
      )}

      <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-6 sm:p-8">
        {renderBody(body)}
      </div>
    </article>
  );
}
