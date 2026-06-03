/**
 * Page Editor configuration — one entry per landing page that admins can
 * edit from /admin/settings → Page Edit tab. Each page lists its editable
 * sections; each section is a flat array of fields.
 *
 * Storage: every field is stored in the `system_settings` table under the
 * key `page_<pageSlug>_<sectionKey>_<fieldKey>`. The existing
 * bulkUpdateSettings + getGroupedSettings API are reused — no schema
 * change needed.
 *
 * Pages that primarily host a body of long-form text (privacy / terms /
 * refund / disclaimer) declare a `body` field of type "textarea" with a
 * larger row count.
 */

export type FieldType = 'text' | 'textarea' | 'rich' | 'url';

export interface PageEditField {
  /** appended to the settings key after page + section */
  key: string;
  label: string;
  type: FieldType;
  /** for textarea — rows. default 3 */
  rows?: number;
  /** placeholder shown when value is empty */
  placeholder?: string;
  /** help text below the field */
  help?: string;
  /** seed value used to bootstrap a brand-new install */
  defaultValue?: string;
}

export interface PageEditSection {
  /** appended to the settings key after page */
  key: string;
  title: string;
  description?: string;
  fields: PageEditField[];
}

export interface EditablePage {
  /** appended to `page_` to form the key prefix */
  slug: string;
  label: string;
  /** path on the public site this page renders at, shown next to the label */
  path?: string;
  sections: PageEditSection[];
}

// =====================================================================
// Section templates reused across pages
// =====================================================================

const seoSection: PageEditSection = {
  key: 'seo',
  title: 'SEO',
  description: 'Meta tags, social preview text, and search visibility.',
  fields: [
    { key: 'meta_title', label: 'Page Title', type: 'text' },
    { key: 'meta_description', label: 'Meta Description', type: 'textarea', rows: 2 },
    { key: 'keywords', label: 'Keywords (comma-separated)', type: 'text' },
    { key: 'og_title', label: 'Open Graph Title', type: 'text' },
    { key: 'og_description', label: 'Open Graph Description', type: 'textarea', rows: 2 },
  ],
};

const heroSection = (variant: 'banner' | 'simple' = 'banner'): PageEditSection => ({
  key: 'hero',
  title: 'Hero / Banner',
  description: 'The top section of the page.',
  fields:
    variant === 'banner'
      ? [
          { key: 'heading_part_1', label: 'Heading (normal)', type: 'text' },
          {
            key: 'heading_part_2',
            label: 'Heading (highlighted)',
            type: 'text',
            help: 'Rendered with the accent color',
          },
          { key: 'description', label: 'Description', type: 'textarea', rows: 4 },
          { key: 'input_placeholder', label: 'Input Placeholder', type: 'text' },
          { key: 'button_text', label: 'Button Text', type: 'text' },
        ]
      : [
          { key: 'heading', label: 'Heading', type: 'text' },
          { key: 'description', label: 'Description', type: 'textarea', rows: 4 },
        ],
});

const legalBodySection: PageEditSection = {
  key: 'body',
  title: 'Page Content',
  description:
    'The full body of the page. Markdown is supported (bold **like this**, headings with #, lists with - or 1.).',
  fields: [
    {
      key: 'last_updated',
      label: 'Last Updated',
      type: 'text',
      placeholder: '2026-06-03',
      help: 'Shown under the title.',
    },
    {
      key: 'intro',
      label: 'Intro paragraph',
      type: 'textarea',
      rows: 3,
    },
    {
      key: 'content',
      label: 'Body',
      type: 'textarea',
      rows: 22,
      help: 'Full page text. Section headings go on their own line.',
    },
  ],
};

// =====================================================================
// Per-page section lists
// =====================================================================

export const PAGE_EDITOR_PAGES: EditablePage[] = [
  {
    slug: 'home',
    label: 'Home',
    path: '/',
    sections: [
      heroSection('banner'),
      {
        key: 'why',
        title: 'Why Choose Us',
        description: 'Three short value propositions shown under the hero.',
        fields: [
          { key: 'heading', label: 'Section Heading', type: 'text' },
          { key: 'item1_title', label: 'Card 1 — Title', type: 'text' },
          { key: 'item1_body', label: 'Card 1 — Body', type: 'textarea', rows: 2 },
          { key: 'item2_title', label: 'Card 2 — Title', type: 'text' },
          { key: 'item2_body', label: 'Card 2 — Body', type: 'textarea', rows: 2 },
          { key: 'item3_title', label: 'Card 3 — Title', type: 'text' },
          { key: 'item3_body', label: 'Card 3 — Body', type: 'textarea', rows: 2 },
        ],
      },
      {
        key: 'cta',
        title: 'Final Call-to-Action',
        description: 'Bottom band that converts visitors.',
        fields: [
          { key: 'heading', label: 'Heading', type: 'text' },
          { key: 'body', label: 'Body', type: 'textarea', rows: 2 },
          { key: 'button_text', label: 'Button Text', type: 'text' },
          { key: 'button_link', label: 'Button Link', type: 'url' },
        ],
      },
      seoSection,
    ],
  },
  {
    slug: 'membership',
    label: 'Membership',
    path: '/membership',
    sections: [
      heroSection('simple'),
      {
        key: 'intro',
        title: 'Intro',
        fields: [
          {
            key: 'body',
            label: 'Intro paragraph',
            type: 'textarea',
            rows: 4,
          },
        ],
      },
      {
        key: 'cta',
        title: 'Bottom CTA',
        fields: [
          { key: 'heading', label: 'Heading', type: 'text' },
          { key: 'body', label: 'Body', type: 'textarea', rows: 2 },
        ],
      },
      seoSection,
    ],
  },
  {
    slug: 'reviews',
    label: 'Reviews',
    path: '/reviews',
    sections: [heroSection('simple'), seoSection],
  },
  {
    slug: 'faq',
    label: 'FAQ',
    path: '/faq',
    sections: [
      heroSection('simple'),
      {
        key: 'footer',
        title: 'Footer Note',
        description:
          'A short paragraph shown below the FAQ list (e.g. contact prompt).',
        fields: [{ key: 'body', label: 'Footer text', type: 'textarea', rows: 3 }],
      },
      seoSection,
    ],
  },
  {
    slug: 'contact',
    label: 'Contact',
    path: '/contact',
    sections: [
      heroSection('simple'),
      {
        key: 'info',
        title: 'Contact Info',
        fields: [
          { key: 'email', label: 'Public Email', type: 'text' },
          { key: 'phone', label: 'Phone (optional)', type: 'text' },
          { key: 'hours', label: 'Support Hours', type: 'text' },
          { key: 'address', label: 'Address (optional)', type: 'textarea', rows: 2 },
        ],
      },
      seoSection,
    ],
  },
  {
    slug: 'privacy',
    label: 'Privacy Policy',
    path: '/privacy',
    sections: [
      {
        key: 'header',
        title: 'Header',
        fields: [
          { key: 'title', label: 'Page Title (H1)', type: 'text' },
        ],
      },
      legalBodySection,
      seoSection,
    ],
  },
  {
    slug: 'terms',
    label: 'Terms of Service',
    path: '/terms',
    sections: [
      { key: 'header', title: 'Header', fields: [{ key: 'title', label: 'Page Title (H1)', type: 'text' }] },
      legalBodySection,
      seoSection,
    ],
  },
  {
    slug: 'refund',
    label: 'Refund / Payment Policy',
    path: '/payment-policy',
    sections: [
      { key: 'header', title: 'Header', fields: [{ key: 'title', label: 'Page Title (H1)', type: 'text' }] },
      legalBodySection,
      seoSection,
    ],
  },
  {
    slug: 'disclaimer',
    label: 'Disclaimer',
    path: '/disclaimer',
    sections: [
      { key: 'header', title: 'Header', fields: [{ key: 'title', label: 'Page Title (H1)', type: 'text' }] },
      legalBodySection,
      seoSection,
    ],
  },
];

/** Build the system_settings key for a single field. */
export function buildKey(
  pageSlug: string,
  sectionKey: string,
  fieldKey: string,
): string {
  return `page_${pageSlug}_${sectionKey}_${fieldKey}`;
}

/** Flatten a page config into a list of every key it owns. */
export function pageKeys(page: EditablePage): string[] {
  const keys: string[] = [];
  for (const section of page.sections) {
    for (const field of section.fields) {
      keys.push(buildKey(page.slug, section.key, field.key));
    }
  }
  return keys;
}
