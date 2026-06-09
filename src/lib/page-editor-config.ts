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
    slug: 'home',
    label: 'Home',
    path: '/',
    sections: [
      {
        key: 'hero',
        title: 'Hero',
        description: 'The top section of the home page.',
        fields: [
          {
            key: 'heading_part_1',
            label: 'Heading (line 1)',
            type: 'text',
            placeholder: 'Receive SMS Activations',
          },
          {
            key: 'heading_part_2',
            label: 'Heading (line 2, accent)',
            type: 'text',
            placeholder: 'Instantly & Reliably',
            help: 'Rendered with the gradient accent color',
          },
          {
            key: 'description',
            label: 'Description',
            type: 'textarea',
            rows: 3,
            placeholder:
              'Get instant access to SMS verification numbers from 180+ countries. Professional, fast, and secure.',
          },
          {
            key: 'button_text',
            label: 'Primary button (unauthenticated only)',
            type: 'text',
            placeholder: 'Get Started',
            help: 'Authenticated visitors see "Go to Dashboard" / "Go to Admin" instead.',
          },
        ],
      },
      {
        key: 'cta',
        title: 'Final Call-to-Action',
        description: 'The bottom band shown after the rest of the page.',
        fields: [
          {
            key: 'heading',
            label: 'Heading',
            type: 'text',
            placeholder: 'Ready to Get Started?',
          },
          {
            key: 'body',
            label: 'Body',
            type: 'textarea',
            rows: 2,
            placeholder:
              'Join thousands of satisfied customers using BestSMSHQ',
          },
          {
            key: 'button_text',
            label: 'Button (unauthenticated only)',
            type: 'text',
            placeholder: 'Start Receiving SMS Now',
            help: 'Authenticated visitors see "Open Dashboard" / "Open Admin" instead.',
          },
        ],
      },
    ],
  },
  {
    slug: 'membership',
    label: 'Membership',
    path: '/membership',
    sections: [
      {
        key: 'hero',
        title: 'Hero',
        description: 'The top section of the Membership page.',
        fields: [
          {
            key: 'heading',
            label: 'Heading',
            type: 'text',
            placeholder: 'Choose Your Plan',
          },
          {
            key: 'description',
            label: 'Description',
            type: 'textarea',
            rows: 3,
            placeholder:
              'Save more, get priority access, and unlock premium features with our flexible membership tiers',
          },
        ],
      },
      {
        key: 'cta',
        title: 'Bottom CTA',
        description: 'The card shown at the bottom of the page.',
        fields: [
          {
            key: 'heading',
            label: 'Heading',
            type: 'text',
            placeholder: 'Ready to Save More?',
          },
          {
            key: 'body',
            label: 'Body',
            type: 'textarea',
            rows: 3,
            placeholder:
              'Join thousands of users who are already saving with our membership plans. Upgrade today and start getting more value from every activation.',
          },
          {
            key: 'button_text',
            label: 'Button label',
            type: 'text',
            placeholder: 'View Plans in Dashboard',
          },
        ],
      },
    ],
  },
  {
    slug: 'reviews',
    label: 'Reviews',
    path: '/reviews',
    sections: [
      {
        key: 'hero',
        title: 'Hero',
        description: 'The top section of the Reviews page.',
        fields: [
          {
            key: 'heading',
            label: 'Heading',
            type: 'text',
            placeholder: 'Customer Reviews',
          },
        ],
      },
    ],
  },
  {
    slug: 'faq',
    label: 'FAQ',
    path: '/faq',
    sections: [
      {
        key: 'hero',
        title: 'Hero',
        description: 'The top section of the FAQ page.',
        fields: [
          {
            key: 'heading',
            label: 'Heading',
            type: 'text',
            placeholder: 'Frequently Asked Questions',
          },
        ],
      },
    ],
  },
  {
    slug: 'contact',
    label: 'Contact',
    path: '/contact',
    sections: [
      {
        key: 'hero',
        title: 'Hero',
        description:
          'The heading shown above the contact form. Phone / email / hours come from Site Info, not here.',
        fields: [
          {
            key: 'heading',
            label: 'Heading',
            type: 'text',
            placeholder: 'SUBMIT A SUPPORT TICKET',
          },
        ],
      },
    ],
  },
  {
    slug: 'features',
    label: 'Features',
    path: '/features',
    sections: [
      {
        key: 'hero',
        title: 'Hero',
        fields: [
          {
            key: 'heading',
            label: 'Heading',
            type: 'text',
            placeholder: 'Powerful Features',
          },
          {
            key: 'description',
            label: 'Description',
            type: 'textarea',
            rows: 2,
            placeholder: 'Everything you need for seamless SMS verification',
          },
        ],
      },
    ],
  },
  {
    slug: 'pricing',
    label: 'Pricing',
    path: '/pricing',
    sections: [
      {
        key: 'hero',
        title: 'Hero',
        fields: [
          {
            key: 'heading',
            label: 'Heading',
            type: 'text',
            placeholder: 'Simple, Flexible Pricing',
          },
          {
            key: 'description',
            label: 'Description',
            type: 'textarea',
            rows: 2,
            placeholder:
              'Choose the provider tier that matches your needs. No hidden fees, no surprises.',
          },
        ],
      },
      {
        key: 'cta',
        title: 'Bottom CTA',
        fields: [
          {
            key: 'heading',
            label: 'Heading',
            type: 'text',
            placeholder: 'Ready to Get Started?',
          },
          {
            key: 'body',
            label: 'Body',
            type: 'textarea',
            rows: 2,
            placeholder:
              'Create your account and start using our service today',
          },
        ],
      },
    ],
  },
  {
    slug: 'api',
    label: 'API',
    path: '/api',
    sections: [
      {
        key: 'hero',
        title: 'Hero',
        fields: [
          {
            key: 'heading',
            label: 'Heading',
            type: 'text',
            placeholder: 'Developer API',
          },
          {
            key: 'description',
            label: 'Description',
            type: 'textarea',
            rows: 2,
            placeholder:
              'Integrate SMS verification into your applications with our simple, powerful API',
          },
        ],
      },
      {
        key: 'cta',
        title: 'Bottom CTA',
        fields: [
          {
            key: 'heading',
            label: 'Heading',
            type: 'text',
            placeholder: 'Ready to Integrate?',
          },
          {
            key: 'body',
            label: 'Body',
            type: 'textarea',
            rows: 2,
            placeholder: 'Get your API key and start building today',
          },
        ],
      },
    ],
  },
  {
    slug: 'about',
    label: 'About',
    path: '/about',
    sections: [
      {
        key: 'hero',
        title: 'Hero',
        fields: [
          {
            key: 'heading',
            label: 'Heading',
            type: 'text',
            placeholder: 'About BestSMSHQ',
          },
        ],
      },
      {
        key: 'body',
        title: 'About Body',
        description:
          'Three short paragraphs shown under the hero. Leave blank to hide.',
        fields: [
          {
            key: 'intro',
            label: 'Intro paragraph',
            type: 'textarea',
            rows: 3,
            placeholder:
              'BestSMSHQ is a premium SMS activation and number rental platform serving customers worldwide.',
          },
          {
            key: 'founding',
            label: 'Founding paragraph',
            type: 'textarea',
            rows: 3,
          },
          {
            key: 'mission',
            label: 'Mission paragraph',
            type: 'textarea',
            rows: 3,
          },
        ],
      },
    ],
  },
  {
    slug: 'help',
    label: 'Help',
    path: '/help',
    sections: [
      {
        key: 'hero',
        title: 'Hero',
        fields: [
          {
            key: 'heading',
            label: 'Heading',
            type: 'text',
            placeholder: 'Help & Support',
          },
          {
            key: 'description',
            label: 'Description',
            type: 'textarea',
            rows: 2,
            placeholder:
              "We're here to help. Search our help center for answers and guides.",
          },
        ],
      },
    ],
  },
  {
    slug: 'blog',
    label: 'Blog',
    path: '/blog',
    sections: [
      {
        key: 'hero',
        title: 'Hero',
        fields: [
          {
            key: 'heading',
            label: 'Heading',
            type: 'text',
            placeholder: 'Blog',
          },
          {
            key: 'description',
            label: 'Description',
            type: 'textarea',
            rows: 2,
            placeholder: 'Latest news, guides, and updates from BestSMSHQ',
          },
        ],
      },
    ],
  },
  {
    slug: 'knowledge-base',
    label: 'Knowledge Base',
    path: '/knowledge-base',
    sections: [
      {
        key: 'hero',
        title: 'Hero',
        fields: [
          {
            key: 'heading',
            label: 'Heading',
            type: 'text',
            placeholder: 'Knowledge Base',
          },
          {
            key: 'description',
            label: 'Description',
            type: 'textarea',
            rows: 2,
            placeholder:
              'Everything you need to understand how the platform works, from activation flow to advanced usage.',
          },
        ],
      },
      {
        key: 'cta',
        title: 'Bottom CTA',
        fields: [
          {
            key: 'heading',
            label: 'Heading',
            type: 'text',
            placeholder: "Can't find what you're looking for?",
          },
          {
            key: 'body',
            label: 'Body',
            type: 'textarea',
            rows: 2,
            placeholder:
              'Our support team is here to help you with any questions.',
          },
        ],
      },
    ],
  },
  {
    slug: 'referral',
    label: 'Referral',
    path: '/referral',
    sections: [
      {
        key: 'hero',
        title: 'Hero',
        fields: [
          {
            key: 'heading_part_1',
            label: 'Heading (line 1)',
            type: 'text',
            placeholder: 'Earn Money by',
          },
          {
            key: 'heading_part_2',
            label: 'Heading (line 2, accent)',
            type: 'text',
            placeholder: 'Sharing Our Platform',
            help: 'Rendered with the gradient accent color',
          },
          {
            key: 'description',
            label: 'Description',
            type: 'textarea',
            rows: 3,
            placeholder:
              'Get up to 20% lifetime commission on every purchase made by users you refer. Start earning today with our simple and lucrative referral program.',
          },
        ],
      },
      {
        key: 'cta',
        title: 'Bottom CTA',
        fields: [
          {
            key: 'heading',
            label: 'Heading',
            type: 'text',
            placeholder: 'Ready to Start Earning?',
          },
          {
            key: 'body',
            label: 'Body',
            type: 'textarea',
            rows: 3,
            placeholder:
              'Join thousands of users earning passive income through our referral program. Sign up today and get your unique referral link instantly.',
          },
        ],
      },
    ],
  },
  {
    slug: 'status',
    label: 'Status',
    path: '/status',
    sections: [
      {
        key: 'hero',
        title: 'Hero',
        fields: [
          {
            key: 'heading',
            label: 'Heading',
            type: 'text',
            placeholder: 'All Systems Operational',
          },
        ],
      },
    ],
  },
  {
    slug: 'footer',
    label: 'Footer (site chrome)',
    sections: [
      {
        key: 'brand',
        title: 'Brand block',
        description: 'The short tagline shown under the logo on every page.',
        fields: [
          {
            key: 'tagline',
            label: 'Tagline',
            type: 'textarea',
            rows: 2,
            placeholder:
              'Premium SMS activation and number rental platform. Fast, reliable, and secure.',
          },
        ],
      },
      {
        key: 'copyright',
        title: 'Copyright line',
        description:
          'Right side of the bottom bar. The year and brand name are prepended automatically.',
        fields: [
          {
            key: 'text',
            label: 'Suffix',
            type: 'text',
            placeholder: 'All rights reserved.',
            help: 'Rendered as: © {year} {brand}. {suffix}',
          },
        ],
      },
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
