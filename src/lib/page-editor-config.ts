/**
 * Page Editor configuration — one entry per legal landing page that
 * admins can edit from /admin/settings → Page Edit tab. Each page lists
 * its editable sections; each section is a flat array of fields.
 *
 * Currently limited to the 4 legal pages (privacy / terms / refund /
 * disclaimer) because those are the only ones whose landing component
 * (`<LegalPage>`) reads `page_<slug>_header_title`,
 * `page_<slug>_body_*` from system_settings at request time. Adding
 * other pages here without also wiring their landing component would
 * surface a fake editor with no effect on the public site — see the
 * audit notes for the history.
 *
 * Storage: every field is stored in `system_settings` under the key
 * `page_<pageSlug>_<sectionKey>_<fieldKey>`. The existing
 * bulkUpdateSettings + getGroupedSettings API are reused — no schema
 * change needed.
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
    slug: 'privacy',
    label: 'Privacy Policy',
    path: '/privacy',
    sections: [
      {
        key: 'header',
        title: 'Header',
        fields: [{ key: 'title', label: 'Page Title (H1)', type: 'text' }],
      },
      legalBodySection,
    ],
  },
  {
    slug: 'terms',
    label: 'Terms of Service',
    path: '/terms',
    sections: [
      {
        key: 'header',
        title: 'Header',
        fields: [{ key: 'title', label: 'Page Title (H1)', type: 'text' }],
      },
      legalBodySection,
    ],
  },
  {
    slug: 'refund',
    label: 'Refund / Payment Policy',
    path: '/payment-policy',
    sections: [
      {
        key: 'header',
        title: 'Header',
        fields: [{ key: 'title', label: 'Page Title (H1)', type: 'text' }],
      },
      legalBodySection,
    ],
  },
  {
    slug: 'disclaimer',
    label: 'Disclaimer',
    path: '/disclaimer',
    sections: [
      {
        key: 'header',
        title: 'Header',
        fields: [{ key: 'title', label: 'Page Title (H1)', type: 'text' }],
      },
      legalBodySection,
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
