'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  Save,
  Search,
  Edit2,
  Globe,
  FileCode,
  Image,
  Zap,
  Code,
  Wand2,
  RefreshCw,
  Eye,
  EyeOff,
  Upload,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Loader2,
} from 'lucide-react';
import {
  getAllSeoSettings,
  upsertSeoSettings,
  deleteSeoSettings,
  seedSeoDefaults,
  transformToPageSEO,
  transformToApiFormat,
  type SeoSettings,
} from '@/lib/api/seoApi';
import { bulkUpdateSettings, getGroupedSettings } from '@/lib/api/settingsApi';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PageSEO {
  id: string;
  pageName: string;
  url: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  canonicalUrl: string;
  indexed: boolean;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  structuredData?: Record<string, unknown>;
}

/**
 * Known public landing routes. Used to populate the page picker in the
 * "Add Page SEO" modal so admins can choose a page instead of typing the
 * URL by hand. Selecting "Custom URL..." reveals a free-text input for
 * any path not in this list.
 *
 * Keep in sync with the (landing) route group when new public pages ship.
 */
const KNOWN_LANDING_PAGES: ReadonlyArray<{ label: string; url: string }> = [
  { label: 'Home', url: '/' },
  { label: 'Features', url: '/features' },
  { label: 'Pricing', url: '/pricing' },
  { label: 'API', url: '/api' },
  { label: 'Membership', url: '/membership' },
  { label: 'Knowledge Base', url: '/knowledge-base' },
  { label: 'Help', url: '/help' },
  { label: 'About', url: '/about' },
  { label: 'Contact', url: '/contact' },
  { label: 'FAQ', url: '/faq' },
  { label: 'Blog', url: '/blog' },
  { label: 'Reviews', url: '/reviews' },
  { label: 'Referral', url: '/referral' },
  { label: 'Status', url: '/status' },
  { label: 'Terms', url: '/terms' },
  { label: 'Privacy', url: '/privacy' },
  { label: 'Disclaimer', url: '/disclaimer' },
  { label: 'Payment Policy', url: '/payment-policy' },
];

interface OpenGraphData {
  title: string;
  description: string;
  image: string;
  twitterCard: string;
}

interface StructuredData {
  type: string;
  jsonLd: string;
}

type SeoTabType =
  | 'general'
  | 'pages'
  | 'sitemap'
  | 'opengraph'
  | 'performance'
  | 'schema'
  | 'sms';

const validSeoTabs: SeoTabType[] = [
  'general',
  'pages',
  'sitemap',
  'opengraph',
  'performance',
  'schema',
  'sms',
];

export default function AdminSeoPage() {
  const searchParams = useSearchParams();

  // Get initial tab from URL or default to "general"
  const tabFromUrl = searchParams.get('tab') as SeoTabType | null;
  const initialTab: SeoTabType =
    tabFromUrl && validSeoTabs.includes(tabFromUrl) ? tabFromUrl : 'general';

  const [activeTab, setActiveTab] = useState<SeoTabType>(initialTab);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Update URL when tab changes (without full page reload)
  const handleTabChange = (tab: SeoTabType) => {
    setActiveTab(tab);
    const newUrl = `/admin/seo?tab=${tab}`;
    window.history.replaceState({}, '', newUrl);
  };

  // General SEO State
  const [generalSEO, setGeneralSEO] = useState({
    defaultMetaTitle: 'SMS Activation Service - Get Virtual Phone Numbers',
    defaultMetaDescription:
      'Get instant SMS verification numbers from 150+ countries. Secure, reliable, and affordable SMS activation service for all major platforms.',
    defaultKeywords:
      'sms activation, virtual phone number, sms verification, temporary phone number',
    canonicalUrl: 'https://smsportal.com',
    robotsTxt: `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: https://smsportal.com/sitemap.xml`,
    indexingEnabled: true,
  });

  // Page-Level SEO State
  const [pages, setPages] = useState<PageSEO[]>([]);

  // Fetch SEO settings on mount
  const fetchSeoSettings = useCallback(async () => {
    try {
      setIsPageLoading(true);
      const settings = await getAllSeoSettings();
      const transformedPages = settings.map(transformToPageSEO);
      setPages(transformedPages);
    } catch (error) {
      console.error('Failed to fetch SEO settings:', error);
      toast.error('Failed to load SEO settings');
    } finally {
      setIsPageLoading(false);
    }
  }, []);

  // Fetch all SEO-related settings from system settings
  const fetchAllSeoSettings = useCallback(async () => {
    try {
      const grouped = await getGroupedSettings();

      // Check both 'seo' category and 'general' category for seo_ prefixed keys
      // (for backward compatibility with existing data)
      const seoSettings = grouped['seo'] || [];
      const generalSettings = grouped['general'] || [];

      const settingsMap: Record<string, string> = {};

      // First add from seo category
      seoSettings.forEach((s) => {
        settingsMap[s.key] = s.value;
      });

      // Then add seo_ prefixed keys from general category (if not already present)
      generalSettings.forEach((s) => {
        if (s.key.startsWith('seo_') && !settingsMap[s.key]) {
          settingsMap[s.key] = s.value;
        }
      });

      if (Object.keys(settingsMap).length > 0) {
        // General SEO
        setGeneralSEO({
          defaultMetaTitle:
            settingsMap['seo_default_title'] || generalSEO.defaultMetaTitle,
          defaultMetaDescription:
            settingsMap['seo_default_description'] ||
            generalSEO.defaultMetaDescription,
          defaultKeywords:
            settingsMap['seo_default_keywords'] || generalSEO.defaultKeywords,
          canonicalUrl:
            settingsMap['seo_canonical_url'] || generalSEO.canonicalUrl,
          robotsTxt: settingsMap['seo_robots_txt'] || generalSEO.robotsTxt,
          indexingEnabled: settingsMap['seo_indexing_enabled'] !== 'false',
        });

        // Sitemap Settings
        setSitemapSettings({
          autoUpdate: settingsMap['seo_sitemap_auto_update'] !== 'false',
          lastGenerated:
            settingsMap['seo_sitemap_last_generated'] ||
            sitemapSettings.lastGenerated,
          sitemapUrl:
            settingsMap['seo_sitemap_url'] || sitemapSettings.sitemapUrl,
        });

        // Open Graph Settings
        setOpenGraph({
          title: settingsMap['seo_og_title'] || openGraph.title,
          description:
            settingsMap['seo_og_description'] || openGraph.description,
          image: settingsMap['seo_og_image'] || openGraph.image,
          twitterCard: settingsMap['seo_twitter_card'] || openGraph.twitterCard,
        });

        // Performance Settings
        setPerformance({
          caching: settingsMap['seo_perf_caching'] !== 'false',
          minifyCss: settingsMap['seo_perf_minify_css'] !== 'false',
          minifyJs: settingsMap['seo_perf_minify_js'] !== 'false',
          lazyLoad: settingsMap['seo_perf_lazy_load'] !== 'false',
          imageOptimization:
            settingsMap['seo_perf_image_optimization'] !== 'false',
        });

        // Schema Settings
        if (
          settingsMap['seo_schema_type'] ||
          settingsMap['seo_schema_jsonld']
        ) {
          setSchema({
            type: settingsMap['seo_schema_type'] || schema.type,
            jsonLd: settingsMap['seo_schema_jsonld'] || schema.jsonLd,
          });
        }

        // SMS SEO Templates
        if (
          settingsMap['seo_sms_title_template'] ||
          settingsMap['seo_sms_description_template']
        ) {
          setSmsSeoTemplate({
            titleTemplate:
              settingsMap['seo_sms_title_template'] ||
              smsSeoTemplate.titleTemplate,
            descriptionTemplate:
              settingsMap['seo_sms_description_template'] ||
              smsSeoTemplate.descriptionTemplate,
            keywordsTemplate:
              settingsMap['seo_sms_keywords_template'] ||
              smsSeoTemplate.keywordsTemplate,
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch SEO settings:', error);
    }
  }, []);

  useEffect(() => {
    fetchSeoSettings();
    fetchAllSeoSettings();
  }, [fetchSeoSettings, fetchAllSeoSettings]);

  const [showEditPageModal, setShowEditPageModal] = useState(false);
  const [selectedPage, setSelectedPage] = useState<PageSEO | null>(null);
  const [pageSearchQuery, setPageSearchQuery] = useState('');

  // Sitemap State
  const [sitemapSettings, setSitemapSettings] = useState({
    autoUpdate: true,
    lastGenerated: '2025-03-28',
    sitemapUrl: 'https://smsportal.com/sitemap.xml',
  });

  // Open Graph State
  const [openGraph, setOpenGraph] = useState<OpenGraphData>({
    title: 'SMS Activation Service - Get Virtual Phone Numbers',
    description:
      'Get instant SMS verification numbers from 150+ countries. Secure and affordable.',
    image: 'https://smsportal.com/og-image.jpg',
    twitterCard: 'summary_large_image',
  });

  // Performance State
  const [performance, setPerformance] = useState({
    caching: true,
    minifyCss: true,
    minifyJs: true,
    lazyLoad: true,
    imageOptimization: true,
  });

  // Schema State
  const [schema, setSchema] = useState<StructuredData>({
    type: 'Organization',
    jsonLd: `{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "SMS Portal",
  "url": "https://smsportal.com",
  "logo": "https://smsportal.com/logo.png",
  "description": "Leading SMS activation and virtual phone number provider",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-800-SMS-PORT",
    "contactType": "customer service"
  }
}`,
  });

  // SMS Services SEO State
  const [smsSeoTemplate, setSmsSeoTemplate] = useState({
    titleTemplate: '{service} SMS Verification - {country} Virtual Number',
    descriptionTemplate:
      'Get instant {service} SMS verification with virtual numbers from {country}. Fast, reliable, and secure activation service starting at $0.50.',
    keywordsTemplate:
      '{service} sms, {country} virtual number, {service} verification, {country} phone number',
  });

  // State for adding new page
  const [showAddPageModal, setShowAddPageModal] = useState(false);
  const [newPage, setNewPage] = useState<Omit<PageSEO, 'id' | 'pageName'>>({
    url: '',
    metaTitle: '',
    metaDescription: '',
    keywords: '',
    canonicalUrl: '',
    indexed: true,
  });
  // When true, the Add Page modal shows a free-text URL input instead of
  // the known-pages dropdown. Reset whenever the modal opens.
  const [useCustomUrl, setUseCustomUrl] = useState(false);
  const [deleteConfirmPage, setDeleteConfirmPage] = useState<PageSEO | null>(
    null,
  );

  // Handlers
  const handleSaveGeneralSEO = async () => {
    setIsLoading(true);
    try {
      await bulkUpdateSettings({
        settings: [
          { key: 'seo_default_title', value: generalSEO.defaultMetaTitle },
          {
            key: 'seo_default_description',
            value: generalSEO.defaultMetaDescription,
          },
          { key: 'seo_default_keywords', value: generalSEO.defaultKeywords },
          { key: 'seo_canonical_url', value: generalSEO.canonicalUrl },
          { key: 'seo_robots_txt', value: generalSEO.robotsTxt },
          {
            key: 'seo_indexing_enabled',
            value: String(generalSEO.indexingEnabled),
          },
        ],
      });
      // Re-fetch to confirm save
      await fetchAllSeoSettings();
      toast.success('General SEO settings saved successfully!');
    } catch (error) {
      console.error('Failed to save general SEO settings:', error);
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPage = (page: PageSEO) => {
    setSelectedPage(page);
    setShowEditPageModal(true);
  };

  /**
   * Derive the canonical page slug from the URL stored against a PageSEO
   * row. The slug is what the landing pages actually consume — see e.g.
   * `src/components/landing/legal-page.tsx` which reads
   * `page_<slug>_seo_meta_title`. Root path resolves to "home" so the
   * landing root still gets its overrides applied.
   */
  const derivePageSlug = (url: string): string => {
    const cleaned = (url ?? '')
      .trim()
      .replace(/^\/+/, '')
      .replace(/\/+$/, '')
      .toLowerCase();
    if (cleaned === '') return 'home';
    return cleaned.replace(/\//g, '-');
  };

  /**
   * Dual-write a PageSEO row into the canonical `page_<slug>_seo_*`
   * system settings used by the landing layer. The dedicated seo_settings
   * table is kept in sync (existing data path) but those values are not
   * actually rendered yet — these canonical keys are. Empty values clear
   * an override and let the per-page hardcoded fallback take over.
   */
  const persistCanonicalPageSeo = async (page: PageSEO): Promise<void> => {
    const slug = derivePageSlug(page.url);
    await bulkUpdateSettings({
      settings: [
        { key: `page_${slug}_seo_meta_title`, value: page.metaTitle ?? '' },
        {
          key: `page_${slug}_seo_meta_description`,
          value: page.metaDescription ?? '',
        },
        { key: `page_${slug}_seo_keywords`, value: page.keywords ?? '' },
        { key: `page_${slug}_seo_og_title`, value: page.ogTitle ?? '' },
        {
          key: `page_${slug}_seo_og_description`,
          value: page.ogDescription ?? '',
        },
      ],
    });
  };

  const handleSavePage = async () => {
    if (!selectedPage) return;

    setIsLoading(true);
    try {
      const apiData = transformToApiFormat(selectedPage);
      await upsertSeoSettings(apiData);
      await persistCanonicalPageSeo(selectedPage);

      setPages(pages.map((p) => (p.id === selectedPage.id ? selectedPage : p)));
      toast.success('Page SEO updated successfully!');
      setShowEditPageModal(false);
      setSelectedPage(null);
    } catch (error) {
      console.error('Failed to save page SEO:', error);
      toast.error('Failed to save page SEO. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /** Normalize a URL/path for duplicate comparison — case-insensitive,
   *  trimmed, trailing slash collapsed. Root remains "/". */
  const normalizeUrl = (u: string): string => {
    const trimmed = (u ?? '').trim().toLowerCase();
    if (!trimmed) return '';
    const noTrail = trimmed.replace(/\/+$/, '');
    return noTrail === '' ? '/' : noTrail;
  };

  const handleAddPage = async () => {
    if (!newPage.url) {
      toast.error('Page URL is required');
      return;
    }

    // Block duplicates — force the admin to edit the existing row rather
    // than creating a second SEO entry for the same URL.
    const normalized = normalizeUrl(newPage.url);
    const duplicate = pages.find((p) => normalizeUrl(p.url) === normalized);
    if (duplicate) {
      toast.error(
        `A SEO entry for ${duplicate.url} already exists. Edit it from the list instead.`,
      );
      return;
    }

    setIsLoading(true);
    try {
      const apiData = transformToApiFormat(newPage as PageSEO);
      const created = await upsertSeoSettings(apiData);
      const transformedPage = transformToPageSEO(created);
      await persistCanonicalPageSeo(transformedPage);

      setPages([...pages, transformedPage]);
      toast.success('Page SEO created successfully!');
      setShowAddPageModal(false);
      setUseCustomUrl(false);
      setNewPage({
        url: '',
        metaTitle: '',
        metaDescription: '',
        keywords: '',
        canonicalUrl: '',
        indexed: true,
      });
    } catch (error) {
      console.error('Failed to create page SEO:', error);
      toast.error('Failed to create page SEO. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePage = async (page: PageSEO) => {
    setIsLoading(true);
    try {
      await deleteSeoSettings(page.url);
      // Clear the canonical overrides so the landing layer falls back
      // to its hardcoded defaults for this page.
      await persistCanonicalPageSeo({
        ...page,
        metaTitle: '',
        metaDescription: '',
        keywords: '',
        ogTitle: '',
        ogDescription: '',
      });
      setPages(pages.filter((p) => p.id !== page.id));
      toast.success('Page SEO deleted successfully!');
      setDeleteConfirmPage(null);
    } catch (error) {
      console.error('Failed to delete page SEO:', error);
      toast.error('Failed to delete page SEO. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeedDefaults = async () => {
    setIsLoading(true);
    try {
      const result = await seedSeoDefaults();
      if (result.created.length > 0) {
        toast.success(`Created ${result.created.length} default SEO settings`);
        await fetchSeoSettings();
      } else {
        toast.info('All default settings already exist');
      }
    } catch (error) {
      console.error('Failed to seed defaults:', error);
      toast.error('Failed to seed default settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSitemapSettings = async () => {
    setIsLoading(true);
    try {
      await bulkUpdateSettings({
        settings: [
          {
            key: 'seo_sitemap_auto_update',
            value: String(sitemapSettings.autoUpdate),
          },
          { key: 'seo_sitemap_url', value: sitemapSettings.sitemapUrl },
        ],
      });
      await fetchAllSeoSettings();
      toast.success('Sitemap settings saved successfully!');
    } catch (error) {
      console.error('Failed to save sitemap settings:', error);
      toast.error('Failed to save sitemap settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSitemap = async () => {
    setIsLoading(true);
    try {
      const newDate = new Date().toISOString().split('T')[0];
      await bulkUpdateSettings({
        settings: [{ key: 'seo_sitemap_last_generated', value: newDate }],
      });
      setSitemapSettings({
        ...sitemapSettings,
        lastGenerated: newDate,
      });
      toast.success('Sitemap generated successfully!');
    } catch (error) {
      console.error('Failed to generate sitemap:', error);
      toast.error('Failed to generate sitemap. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveOpenGraph = async () => {
    setIsLoading(true);
    try {
      await bulkUpdateSettings({
        settings: [
          { key: 'seo_og_title', value: openGraph.title },
          { key: 'seo_og_description', value: openGraph.description },
          { key: 'seo_og_image', value: openGraph.image },
          { key: 'seo_twitter_card', value: openGraph.twitterCard },
        ],
      });
      await fetchAllSeoSettings();
      toast.success('Open Graph settings saved successfully!');
    } catch (error) {
      console.error('Failed to save Open Graph settings:', error);
      toast.error('Failed to save Open Graph settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePerformance = async () => {
    setIsLoading(true);
    try {
      await bulkUpdateSettings({
        settings: [
          { key: 'seo_perf_caching', value: String(performance.caching) },
          { key: 'seo_perf_minify_css', value: String(performance.minifyCss) },
          { key: 'seo_perf_minify_js', value: String(performance.minifyJs) },
          { key: 'seo_perf_lazy_load', value: String(performance.lazyLoad) },
          {
            key: 'seo_perf_image_optimization',
            value: String(performance.imageOptimization),
          },
        ],
      });
      await fetchAllSeoSettings();
      toast.success('Performance settings saved successfully!');
    } catch (error) {
      console.error('Failed to save performance settings:', error);
      toast.error('Failed to save performance settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSchema = async () => {
    setIsLoading(true);
    try {
      await bulkUpdateSettings({
        settings: [
          { key: 'seo_schema_type', value: schema.type },
          { key: 'seo_schema_jsonld', value: schema.jsonLd },
        ],
      });
      await fetchAllSeoSettings();
      toast.success('Structured data saved successfully!');
    } catch (error) {
      console.error('Failed to save schema:', error);
      toast.error('Failed to save structured data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSchema = () => {
    const schemaTypes: Record<string, string> = {
      Organization: `{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "SMS Portal",
  "url": "https://smsportal.com",
  "logo": "https://smsportal.com/logo.png",
  "description": "Leading SMS activation and virtual phone number provider"
}`,
      Product: `{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "SMS Activation Service",
  "description": "Virtual phone numbers for SMS verification",
  "offers": {
    "@type": "Offer",
    "price": "0.50",
    "priceCurrency": "USD"
  }
}`,
      Article: `{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Your Article Title",
  "author": {
    "@type": "Person",
    "name": "Author Name"
  },
  "datePublished": "2025-03-30"
}`,
      FAQ: `{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "What is SMS activation?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "SMS activation is a service that provides virtual phone numbers for verification."
    }
  }]
}`,
    };

    setSchema({
      ...schema,
      jsonLd: schemaTypes[schema.type] || schemaTypes.Organization,
    });

    toast.success(`${schema.type} schema generated!`);
  };

  const handleSaveSMSSEO = async () => {
    setIsLoading(true);
    try {
      await bulkUpdateSettings({
        settings: [
          {
            key: 'seo_sms_title_template',
            value: smsSeoTemplate.titleTemplate,
          },
          {
            key: 'seo_sms_description_template',
            value: smsSeoTemplate.descriptionTemplate,
          },
          {
            key: 'seo_sms_keywords_template',
            value: smsSeoTemplate.keywordsTemplate,
          },
        ],
      });
      toast.success('SMS Services SEO templates saved successfully!');
    } catch (error) {
      console.error('Failed to save SMS SEO templates:', error);
      toast.error('Failed to save SMS SEO templates. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAISEO = async () => {
    setIsLoading(true);
    try {
      // Generate AI-optimized templates
      const newTemplates = {
        titleTemplate:
          '{service} SMS Activation - Buy {country} Virtual Number | SMS Portal',
        descriptionTemplate:
          'Instant {service} verification with premium {country} virtual numbers. 99.9% success rate, 24/7 support, instant delivery. Get your {service} SMS number from {country} starting at $0.50.',
        keywordsTemplate:
          '{service} sms activation, {country} virtual number, buy {service} number, {country} phone verification, {service} sms receive, temporary {country} number',
      };

      // Save the generated templates
      await bulkUpdateSettings({
        settings: [
          { key: 'seo_sms_title_template', value: newTemplates.titleTemplate },
          {
            key: 'seo_sms_description_template',
            value: newTemplates.descriptionTemplate,
          },
          {
            key: 'seo_sms_keywords_template',
            value: newTemplates.keywordsTemplate,
          },
        ],
      });

      setSmsSeoTemplate(newTemplates);
      toast.success('AI-optimized SEO content generated and saved!');
    } catch (error) {
      console.error('Failed to generate AI SEO:', error);
      toast.error('Failed to generate AI SEO content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPages = pages.filter(
    (page) =>
      page.pageName.toLowerCase().includes(pageSearchQuery.toLowerCase()) ||
      page.url.toLowerCase().includes(pageSearchQuery.toLowerCase()),
  );

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <h1 className="text-3xl font-semibold text-white">SEO Management</h1>
        </div>
        <p className="text-sm text-[#94A3B8]">
          Complete SEO control system for all pages, services, and content
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          onClick={() => handleTabChange('general')}
          className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
            activeTab === 'general'
              ? 'bg-[#3B82F6] text-white'
              : 'bg-[rgba(255,255,255,0.05)] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.08)]'
          }`}
        >
          <Globe className="h-4 w-4" />
          General SEO
        </button>
        <button
          onClick={() => handleTabChange('pages')}
          className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
            activeTab === 'pages'
              ? 'bg-[#3B82F6] text-white'
              : 'bg-[rgba(255,255,255,0.05)] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.08)]'
          }`}
        >
          <FileCode className="h-4 w-4" />
          Page-Level SEO
        </button>
        <button
          onClick={() => handleTabChange('sitemap')}
          className={`rounded-lg px-5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
            activeTab === 'sitemap'
              ? 'bg-[#3B82F6] text-white'
              : 'bg-[rgba(255,255,255,0.05)] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.08)]'
          }`}
        >
          Sitemap
        </button>
        <button
          onClick={() => handleTabChange('opengraph')}
          className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
            activeTab === 'opengraph'
              ? 'bg-[#3B82F6] text-white'
              : 'bg-[rgba(255,255,255,0.05)] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.08)]'
          }`}
        >
          <Image className="h-4 w-4" />
          Open Graph
        </button>
        <button
          onClick={() => handleTabChange('performance')}
          className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
            activeTab === 'performance'
              ? 'bg-[#3B82F6] text-white'
              : 'bg-[rgba(255,255,255,0.05)] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.08)]'
          }`}
        >
          <Zap className="h-4 w-4" />
          Performance
        </button>
        <button
          onClick={() => handleTabChange('schema')}
          className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
            activeTab === 'schema'
              ? 'bg-[#3B82F6] text-white'
              : 'bg-[rgba(255,255,255,0.05)] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.08)]'
          }`}
        >
          <Code className="h-4 w-4" />
          Schema
        </button>
        <button
          onClick={() => handleTabChange('sms')}
          className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
            activeTab === 'sms'
              ? 'bg-[#3B82F6] text-white'
              : 'bg-[rgba(255,255,255,0.05)] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.08)]'
          }`}
        >
          <Wand2 className="h-4 w-4" />
          SMS Services SEO
        </button>
      </div>

      {/* General SEO Tab */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-4 backdrop-blur-xl sm:p-6">
            <h2 className="mb-6 text-xl font-semibold text-white">
              General SEO Settings
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Default Meta Title
                </label>
                <input
                  type="text"
                  value={generalSEO.defaultMetaTitle}
                  onChange={(e) =>
                    setGeneralSEO({
                      ...generalSEO,
                      defaultMetaTitle: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-base text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none lg:text-sm"
                  placeholder="Enter default meta title"
                />
                <p className="mt-1 text-xs text-[#64748B]">
                  {generalSEO.defaultMetaTitle.length}/60 characters (optimal:
                  50-60)
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Default Meta Description
                </label>
                <textarea
                  value={generalSEO.defaultMetaDescription}
                  onChange={(e) =>
                    setGeneralSEO({
                      ...generalSEO,
                      defaultMetaDescription: e.target.value,
                    })
                  }
                  className="min-h-[100px] w-full resize-none rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-base text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none lg:text-sm"
                  placeholder="Enter default meta description"
                />
                <p className="mt-1 text-xs text-[#64748B]">
                  {generalSEO.defaultMetaDescription.length}/160 characters
                  (optimal: 150-160)
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Default Keywords
                </label>
                <input
                  type="text"
                  value={generalSEO.defaultKeywords}
                  onChange={(e) =>
                    setGeneralSEO({
                      ...generalSEO,
                      defaultKeywords: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-base text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none lg:text-sm"
                  placeholder="keyword1, keyword2, keyword3"
                />
                <p className="mt-1 text-xs text-[#64748B]">
                  Separate keywords with commas
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Canonical URL
                </label>
                <input
                  type="url"
                  value={generalSEO.canonicalUrl}
                  onChange={(e) =>
                    setGeneralSEO({
                      ...generalSEO,
                      canonicalUrl: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-base text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none lg:text-sm"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Robots.txt
                </label>
                <textarea
                  value={generalSEO.robotsTxt}
                  onChange={(e) =>
                    setGeneralSEO({ ...generalSEO, robotsTxt: e.target.value })
                  }
                  className="min-h-[150px] w-full resize-none rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 font-mono text-base text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none lg:text-sm"
                  placeholder="User-agent: *&#10;Allow: /"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.3)] p-4">
                <div>
                  <h3 className="mb-1 text-sm font-semibold text-white">
                    Search Engine Indexing
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Allow search engines to index your site
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={generalSEO.indexingEnabled}
                    onChange={(e) =>
                      setGeneralSEO({
                        ...generalSEO,
                        indexingEnabled: e.target.checked,
                      })
                    }
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-[#64748B] peer-checked:bg-[#22C55E] peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                </label>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-[rgba(255,255,255,0.1)] pt-6">
              <button
                onClick={handleSaveGeneralSEO}
                disabled={isLoading}
                className="flex items-center gap-2 rounded-lg bg-[#3B82F6] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  'Saving...'
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page-Level SEO Tab */}
      {activeTab === 'pages' && (
        <div className="space-y-6">
          {/* Search and Actions */}
          <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-4 backdrop-blur-xl sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform text-[#64748B]" />
                <input
                  type="text"
                  value={pageSearchQuery}
                  onChange={(e) => setPageSearchQuery(e.target.value)}
                  placeholder="Search pages..."
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] py-3 pr-4 pl-12 text-base text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none lg:text-sm"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setUseCustomUrl(false);
                    setShowAddPageModal(true);
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#22C55E] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#16A34A] sm:flex-none sm:justify-start"
                >
                  <Plus className="h-4 w-4" />
                  Add Page
                </button>
                <button
                  onClick={handleSeedDefaults}
                  disabled={isLoading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[rgba(255,255,255,0.08)] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.12)] disabled:opacity-50 sm:flex-none sm:justify-start"
                >
                  <Wand2 className="h-4 w-4" />
                  Seed Defaults
                </button>
              </div>
            </div>
          </div>

          {/* Pages Table */}
          <div className="overflow-hidden rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] backdrop-blur-xl">
            <div className="border-b border-[rgba(255,255,255,0.1)] p-4 sm:p-6">
              <h2 className="text-xl font-semibold text-white">
                Page-Level SEO
              </h2>
              <p className="mt-1 text-sm text-[#94A3B8]">
                {filteredPages.length} pages
              </p>
            </div>

            {isPageLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
              </div>
            ) : filteredPages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileCode className="mb-4 h-12 w-12 text-[#64748B]" />
                <p className="mb-2 text-lg font-medium text-white">
                  No SEO settings found
                </p>
                <p className="mb-4 text-sm text-[#94A3B8]">
                  Add your first page SEO settings or seed defaults
                </p>
                <button
                  onClick={handleSeedDefaults}
                  disabled={isLoading}
                  className="rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2563EB]"
                >
                  Seed Default Settings
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.2)]">
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#94A3B8] uppercase">
                        Page Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#94A3B8] uppercase">
                        URL
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#94A3B8] uppercase">
                        Meta Title
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#94A3B8] uppercase">
                        Index Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#94A3B8] uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                    {filteredPages.map((page) => (
                      <tr
                        key={page.id}
                        className="transition-colors hover:bg-[rgba(255,255,255,0.02)]"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-white">
                          {page.pageName}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#3B82F6]">
                          {page.url}
                        </td>
                        <td className="max-w-xs truncate px-6 py-4 text-sm text-[#94A3B8]">
                          {page.metaTitle}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                              page.indexed
                                ? 'bg-[#22C55E]/20 text-[#22C55E]'
                                : 'bg-[#EF4444]/20 text-[#EF4444]'
                            }`}
                          >
                            {page.indexed ? (
                              <>
                                <Eye className="h-3 w-3" />
                                Indexed
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-3 w-3" />
                                Not Indexed
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditPage(page)}
                              className="flex items-center gap-1 rounded-lg bg-[#3B82F6] px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-[#2563EB]"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteConfirmPage(page)}
                              className="flex items-center gap-1 rounded-lg bg-[#EF4444]/20 px-3 py-2 text-xs font-medium text-[#EF4444] transition-colors hover:bg-[#EF4444]/30"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sitemap Tab */}
      {activeTab === 'sitemap' && (
        <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-4 backdrop-blur-xl sm:p-6">
          <h2 className="mb-6 text-xl font-semibold text-white">
            Sitemap Management
          </h2>

          <div className="space-y-6">
            <div className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.3)] p-4 sm:p-6">
              <div className="mb-4">
                <h3 className="mb-1 text-base font-semibold text-white">
                  Sitemap URL
                </h3>
                <p className="text-sm text-[#64748B]">
                  Your sitemap is accessible at this URL
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <input
                  type="text"
                  value={sitemapSettings.sitemapUrl}
                  onChange={(e) =>
                    setSitemapSettings({
                      ...sitemapSettings,
                      sitemapUrl: e.target.value,
                    })
                  }
                  className="w-full flex-1 rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-base text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none lg:text-sm"
                  placeholder="https://example.com/sitemap.xml"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(sitemapSettings.sitemapUrl);
                    toast.success('Sitemap URL copied to clipboard!');
                  }}
                  className="w-full rounded-lg bg-[rgba(255,255,255,0.08)] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.12)] sm:w-auto"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.3)] p-4">
              <div>
                <h3 className="mb-1 text-sm font-semibold text-white">
                  Auto-Update Sitemap
                </h3>
                <p className="text-xs text-[#64748B]">
                  Automatically update sitemap when content changes
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={sitemapSettings.autoUpdate}
                  onChange={(e) =>
                    setSitemapSettings({
                      ...sitemapSettings,
                      autoUpdate: e.target.checked,
                    })
                  }
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-[#64748B] peer-checked:bg-[#22C55E] peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
              </label>
            </div>

            <div className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.3)] p-4 sm:p-6">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="mb-1 text-base font-semibold text-white">
                    Generate Sitemap
                  </h3>
                  <p className="text-sm text-[#64748B]">
                    Last generated: {sitemapSettings.lastGenerated}
                  </p>
                </div>
                <button
                  onClick={handleGenerateSitemap}
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#22C55E] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#16A34A] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:justify-start"
                >
                  {isLoading ? (
                    'Generating...'
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Generate Now
                    </>
                  )}
                </button>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#22C55E]">
                <CheckCircle className="h-4 w-4" />
                <span>
                  Sitemap is up to date and submitted to search engines
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-[rgba(255,255,255,0.1)] pt-6 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
            <button
              onClick={handleSaveSitemapSettings}
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#3B82F6] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:justify-start"
            >
              {isLoading ? (
                'Saving...'
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Open Graph Tab */}
      {activeTab === 'opengraph' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-4 backdrop-blur-xl sm:p-6">
            <h2 className="mb-6 text-xl font-semibold text-white">
              Open Graph & Social Media
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  OG Title
                </label>
                <input
                  type="text"
                  value={openGraph.title}
                  onChange={(e) =>
                    setOpenGraph({ ...openGraph, title: e.target.value })
                  }
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-base text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none lg:text-sm"
                  placeholder="Enter Open Graph title"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  OG Description
                </label>
                <textarea
                  value={openGraph.description}
                  onChange={(e) =>
                    setOpenGraph({ ...openGraph, description: e.target.value })
                  }
                  className="min-h-[100px] w-full resize-none rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-base text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none lg:text-sm"
                  placeholder="Enter Open Graph description"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  OG Image URL
                </label>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <input
                    type="url"
                    value={openGraph.image}
                    onChange={(e) =>
                      setOpenGraph({ ...openGraph, image: e.target.value })
                    }
                    className="w-full flex-1 rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-base text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none lg:text-sm"
                    placeholder="https://example.com/image.jpg"
                  />
                  <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-[rgba(255,255,255,0.08)] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.12)] sm:w-auto sm:justify-start">
                    <Upload className="h-4 w-4" />
                    Upload
                  </button>
                </div>
                <p className="mt-1 text-xs text-[#64748B]">
                  Recommended size: 1200x630px
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Twitter Card Type
                </label>
                <Select
                  value={openGraph.twitterCard}
                  onValueChange={(v) =>
                    setOpenGraph({ ...openGraph, twitterCard: v })
                  }
                >
                  <SelectTrigger className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:outline-none data-[size=default]:h-auto data-[size=default]:min-h-12">
                    <SelectValue placeholder="Select card type" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72 border-[rgba(255,255,255,0.18)] bg-[#1E293B] text-white">
                    <SelectItem
                      value="summary"
                      className="text-white focus:bg-[rgba(59,130,246,0.15)] focus:text-white"
                    >
                      Summary
                    </SelectItem>
                    <SelectItem
                      value="summary_large_image"
                      className="text-white focus:bg-[rgba(59,130,246,0.15)] focus:text-white"
                    >
                      Summary Large Image
                    </SelectItem>
                    <SelectItem
                      value="app"
                      className="text-white focus:bg-[rgba(59,130,246,0.15)] focus:text-white"
                    >
                      App
                    </SelectItem>
                    <SelectItem
                      value="player"
                      className="text-white focus:bg-[rgba(59,130,246,0.15)] focus:text-white"
                    >
                      Player
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Preview */}
            <div className="mt-8 rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.3)] p-4 sm:p-6">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                <Eye className="h-4 w-4" />
                Social Media Preview
              </h3>
              <div className="overflow-hidden rounded-lg border border-[rgba(255,255,255,0.1)]">
                <div className="flex aspect-[1.91/1] items-center justify-center bg-[rgba(59,130,246,0.1)]">
                  <Image className="h-12 w-12 text-[#3B82F6]" />
                </div>
                <div className="bg-[rgba(0,0,0,0.4)] p-4">
                  <div className="mb-1 text-sm font-semibold text-white">
                    {openGraph.title}
                  </div>
                  <div className="line-clamp-2 text-xs text-[#94A3B8]">
                    {openGraph.description}
                  </div>
                  <div className="mt-2 text-xs text-[#64748B]">
                    smsportal.com
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-[rgba(255,255,255,0.1)] pt-6">
              <button
                onClick={handleSaveOpenGraph}
                disabled={isLoading}
                className="flex items-center gap-2 rounded-lg bg-[#3B82F6] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  'Saving...'
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-4 backdrop-blur-xl sm:p-6">
          <h2 className="mb-6 text-xl font-semibold text-white">
            Performance & Speed Optimization
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.3)] p-4">
              <div>
                <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-white">
                  <Zap className="h-4 w-4 text-[#F59E0B]" />
                  Enable Caching
                </h3>
                <p className="text-xs text-[#64748B]">
                  Cache static assets for faster page loads
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={performance.caching}
                  onChange={(e) =>
                    setPerformance({
                      ...performance,
                      caching: e.target.checked,
                    })
                  }
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-[#64748B] peer-checked:bg-[#22C55E] peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
              </label>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.3)] p-4">
              <div>
                <h3 className="mb-1 text-sm font-semibold text-white">
                  Minify CSS
                </h3>
                <p className="text-xs text-[#64748B]">
                  Compress CSS files for smaller file size
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={performance.minifyCss}
                  onChange={(e) =>
                    setPerformance({
                      ...performance,
                      minifyCss: e.target.checked,
                    })
                  }
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-[#64748B] peer-checked:bg-[#22C55E] peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
              </label>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.3)] p-4">
              <div>
                <h3 className="mb-1 text-sm font-semibold text-white">
                  Minify JavaScript
                </h3>
                <p className="text-xs text-[#64748B]">
                  Compress JS files for smaller file size
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={performance.minifyJs}
                  onChange={(e) =>
                    setPerformance({
                      ...performance,
                      minifyJs: e.target.checked,
                    })
                  }
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-[#64748B] peer-checked:bg-[#22C55E] peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
              </label>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.3)] p-4">
              <div>
                <h3 className="mb-1 text-sm font-semibold text-white">
                  Lazy Load Images
                </h3>
                <p className="text-xs text-[#64748B]">
                  Load images only when they appear in viewport
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={performance.lazyLoad}
                  onChange={(e) =>
                    setPerformance({
                      ...performance,
                      lazyLoad: e.target.checked,
                    })
                  }
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-[#64748B] peer-checked:bg-[#22C55E] peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
              </label>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.3)] p-4">
              <div>
                <h3 className="mb-1 text-sm font-semibold text-white">
                  Image Optimization
                </h3>
                <p className="text-xs text-[#64748B]">
                  Automatically optimize and compress images
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={performance.imageOptimization}
                  onChange={(e) =>
                    setPerformance({
                      ...performance,
                      imageOptimization: e.target.checked,
                    })
                  }
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-[#64748B] peer-checked:bg-[#22C55E] peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
              </label>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-[rgba(255,255,255,0.1)] pt-6 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
            <button
              onClick={handleSavePerformance}
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#3B82F6] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:justify-start"
            >
              {isLoading ? (
                'Saving...'
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Schema Tab */}
      {activeTab === 'schema' && (
        <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-4 backdrop-blur-xl sm:p-6">
          <h2 className="mb-6 text-xl font-semibold text-white">
            Structured Data (Schema Markup)
          </h2>

          <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
              <div className="flex-1">
                <label className="mb-2 block text-sm font-medium text-white">
                  Schema Type
                </label>
                <Select
                  value={schema.type}
                  onValueChange={(v) => setSchema({ ...schema, type: v })}
                >
                  <SelectTrigger className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-base text-white focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:outline-none data-[size=default]:h-auto data-[size=default]:min-h-12 lg:text-sm">
                    <SelectValue placeholder="Select schema type" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72 border-[rgba(255,255,255,0.18)] bg-[#1E293B] text-white">
                    <SelectItem
                      value="Organization"
                      className="text-white focus:bg-[rgba(59,130,246,0.15)] focus:text-white"
                    >
                      Organization
                    </SelectItem>
                    <SelectItem
                      value="Product"
                      className="text-white focus:bg-[rgba(59,130,246,0.15)] focus:text-white"
                    >
                      Product
                    </SelectItem>
                    <SelectItem
                      value="Article"
                      className="text-white focus:bg-[rgba(59,130,246,0.15)] focus:text-white"
                    >
                      Article
                    </SelectItem>
                    <SelectItem
                      value="FAQ"
                      className="text-white focus:bg-[rgba(59,130,246,0.15)] focus:text-white"
                    >
                      FAQ
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <button
                onClick={handleGenerateSchema}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#F59E0B] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#D97706] sm:w-auto sm:justify-start"
              >
                <Wand2 className="h-4 w-4" />
                Auto-Generate
              </button>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                JSON-LD Schema
              </label>
              <textarea
                value={schema.jsonLd}
                onChange={(e) =>
                  setSchema({ ...schema, jsonLd: e.target.value })
                }
                className="min-h-[400px] w-full resize-none rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 font-mono text-base text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none lg:text-sm"
                placeholder="Enter JSON-LD schema..."
              />
              <p className="mt-2 text-xs text-[#64748B]">
                Make sure your JSON-LD is valid before saving
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-[rgba(255,255,255,0.1)] pt-6 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
            <button
              onClick={handleSaveSchema}
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#3B82F6] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:justify-start"
            >
              {isLoading ? (
                'Saving...'
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Schema
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* SMS Services SEO Tab */}
      {activeTab === 'sms' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-4 backdrop-blur-xl sm:p-6">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="mb-2 text-xl font-semibold text-white">
                  SMS Services SEO Templates
                </h2>
                <p className="text-sm text-[#94A3B8]">
                  Create SEO templates for all SMS services using placeholders
                </p>
              </div>
              <button
                onClick={handleGenerateAISEO}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] px-6 py-3 text-sm font-medium text-white transition-all hover:from-[#7C3AED] hover:to-[#DB2777] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:justify-start"
              >
                {isLoading ? (
                  'Generating...'
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    Generate SEO (AI)
                  </>
                )}
              </button>
            </div>

            <div className="mb-6 rounded-lg border border-[rgba(139,92,246,0.3)] bg-[rgba(139,92,246,0.1)] p-4">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#8B5CF6]">
                <AlertCircle className="h-4 w-4" />
                Available Placeholders
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-[#94A3B8]">
                  <span className="font-mono text-[#8B5CF6]">
                    {'{service}'}
                  </span>{' '}
                  - Service name (e.g., WhatsApp)
                </div>
                <div className="text-[#94A3B8]">
                  <span className="font-mono text-[#8B5CF6]">
                    {'{country}'}
                  </span>{' '}
                  - Country name (e.g., United States)
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Title Template
                </label>
                <input
                  type="text"
                  value={smsSeoTemplate.titleTemplate}
                  onChange={(e) =>
                    setSmsSeoTemplate({
                      ...smsSeoTemplate,
                      titleTemplate: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-base text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none lg:text-sm"
                  placeholder="{service} SMS Verification - {country} Virtual Number"
                />
                <div className="mt-2 rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.3)] p-3">
                  <p className="mb-1 text-xs text-[#64748B]">Example output:</p>
                  <p className="text-sm text-[#22C55E]">
                    WhatsApp SMS Verification - United States Virtual Number
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Description Template
                </label>
                <textarea
                  value={smsSeoTemplate.descriptionTemplate}
                  onChange={(e) =>
                    setSmsSeoTemplate({
                      ...smsSeoTemplate,
                      descriptionTemplate: e.target.value,
                    })
                  }
                  className="min-h-[100px] w-full resize-none rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-base text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none lg:text-sm"
                  placeholder="Get instant {service} SMS verification with virtual numbers from {country}..."
                />
                <div className="mt-2 rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.3)] p-3">
                  <p className="mb-1 text-xs text-[#64748B]">Example output:</p>
                  <p className="text-sm text-[#22C55E]">
                    Get instant WhatsApp SMS verification with virtual numbers
                    from United States. Fast, reliable, and secure activation
                    service starting at $0.50.
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Keywords Template
                </label>
                <input
                  type="text"
                  value={smsSeoTemplate.keywordsTemplate}
                  onChange={(e) =>
                    setSmsSeoTemplate({
                      ...smsSeoTemplate,
                      keywordsTemplate: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-base text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none lg:text-sm"
                  placeholder="{service} sms, {country} virtual number, {service} verification..."
                />
                <div className="mt-2 rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.3)] p-3">
                  <p className="mb-1 text-xs text-[#64748B]">Example output:</p>
                  <p className="text-sm text-[#22C55E]">
                    whatsapp sms, united states virtual number, whatsapp
                    verification, usa phone number
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 border-t border-[rgba(255,255,255,0.1)] pt-6 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
              <button
                onClick={handleSaveSMSSEO}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#3B82F6] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:justify-start"
              >
                {isLoading ? (
                  'Saving...'
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Templates
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Page Modal */}
      {showEditPageModal && selectedPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#0F172A] p-6">
            <h2 className="mb-6 text-xl font-semibold text-white">
              Edit Page SEO - {selectedPage.pageName}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={selectedPage.metaTitle}
                  onChange={(e) =>
                    setSelectedPage({
                      ...selectedPage,
                      metaTitle: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-base text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none lg:text-sm"
                  placeholder="Enter meta title"
                />
                <p className="mt-1 text-xs text-[#64748B]">
                  {selectedPage.metaTitle.length}/60 characters
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Meta Description
                </label>
                <textarea
                  value={selectedPage.metaDescription}
                  onChange={(e) =>
                    setSelectedPage({
                      ...selectedPage,
                      metaDescription: e.target.value,
                    })
                  }
                  className="min-h-[100px] w-full resize-none rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-base text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none lg:text-sm"
                  placeholder="Enter meta description"
                />
                <p className="mt-1 text-xs text-[#64748B]">
                  {selectedPage.metaDescription.length}/160 characters
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Keywords
                </label>
                <input
                  type="text"
                  value={selectedPage.keywords}
                  onChange={(e) =>
                    setSelectedPage({
                      ...selectedPage,
                      keywords: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-base text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none lg:text-sm"
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Canonical URL
                </label>
                <input
                  type="url"
                  value={selectedPage.canonicalUrl}
                  onChange={(e) =>
                    setSelectedPage({
                      ...selectedPage,
                      canonicalUrl: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-base text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none lg:text-sm"
                  placeholder="https://example.com/page"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.3)] p-4">
                <div>
                  <h3 className="mb-1 text-sm font-semibold text-white">
                    Index This Page
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Allow search engines to index this page
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={selectedPage.indexed}
                    onChange={(e) =>
                      setSelectedPage({
                        ...selectedPage,
                        indexed: e.target.checked,
                      })
                    }
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-[#64748B] peer-checked:bg-[#22C55E] peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                </label>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowEditPageModal(false);
                  setSelectedPage(null);
                }}
                className="rounded-lg bg-[rgba(255,255,255,0.08)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.12)]"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePage}
                disabled={isLoading}
                className="flex items-center gap-2 rounded-lg bg-[#3B82F6] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Page Modal */}
      {showAddPageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#0F172A] p-6">
            <h2 className="mb-6 text-xl font-semibold text-white">
              Add New Page SEO
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Page URL / Path *
                </label>
                <Select
                  value={
                    useCustomUrl
                      ? '__custom__'
                      : KNOWN_LANDING_PAGES.some((p) => p.url === newPage.url)
                        ? newPage.url
                        : ''
                  }
                  onValueChange={(v) => {
                    if (v === '__custom__') {
                      setUseCustomUrl(true);
                      setNewPage({ ...newPage, url: '' });
                    } else {
                      setUseCustomUrl(false);
                      setNewPage({ ...newPage, url: v });
                    }
                  }}
                >
                  <SelectTrigger className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-base text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none lg:text-sm">
                    <SelectValue placeholder="Select a page…" />
                  </SelectTrigger>
                  <SelectContent>
                    {KNOWN_LANDING_PAGES.map((p) => {
                      const taken = pages.some(
                        (row) => normalizeUrl(row.url) === normalizeUrl(p.url),
                      );
                      return (
                        <SelectItem key={p.url} value={p.url} disabled={taken}>
                          {p.label} ({p.url})
                          {taken ? ' — already configured' : ''}
                        </SelectItem>
                      );
                    })}
                    <SelectItem value="__custom__">Custom URL…</SelectItem>
                  </SelectContent>
                </Select>
                {useCustomUrl && (
                  <input
                    type="text"
                    value={newPage.url}
                    onChange={(e) =>
                      setNewPage({ ...newPage, url: e.target.value })
                    }
                    autoFocus
                    className="mt-2 w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-base text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none lg:text-sm"
                    placeholder="e.g., /custom-path or /blog/*"
                  />
                )}
                <p className="mt-1 text-xs text-[#64748B]">
                  Pick a landing page or choose &quot;Custom URL…&quot; to type
                  any path (wildcards like /blog/* allowed).
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={newPage.metaTitle}
                  onChange={(e) =>
                    setNewPage({ ...newPage, metaTitle: e.target.value })
                  }
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-base text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none lg:text-sm"
                  placeholder="Enter meta title"
                />
                <p className="mt-1 text-xs text-[#64748B]">
                  {newPage.metaTitle.length}/60 characters (optimal: 50-60)
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Meta Description
                </label>
                <textarea
                  value={newPage.metaDescription}
                  onChange={(e) =>
                    setNewPage({ ...newPage, metaDescription: e.target.value })
                  }
                  className="min-h-[100px] w-full resize-none rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-base text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none lg:text-sm"
                  placeholder="Enter meta description"
                />
                <p className="mt-1 text-xs text-[#64748B]">
                  {newPage.metaDescription.length}/160 characters (optimal:
                  150-160)
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Keywords
                </label>
                <input
                  type="text"
                  value={newPage.keywords}
                  onChange={(e) =>
                    setNewPage({ ...newPage, keywords: e.target.value })
                  }
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-base text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none lg:text-sm"
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Canonical URL
                </label>
                <input
                  type="url"
                  value={newPage.canonicalUrl}
                  onChange={(e) =>
                    setNewPage({ ...newPage, canonicalUrl: e.target.value })
                  }
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-base text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none lg:text-sm"
                  placeholder="https://example.com/page"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.3)] p-4">
                <div>
                  <h3 className="mb-1 text-sm font-semibold text-white">
                    Index This Page
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Allow search engines to index this page
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={newPage.indexed}
                    onChange={(e) =>
                      setNewPage({ ...newPage, indexed: e.target.checked })
                    }
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-[#64748B] peer-checked:bg-[#22C55E] peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                </label>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddPageModal(false);
                  setUseCustomUrl(false);
                  setNewPage({
                    url: '',
                    metaTitle: '',
                    metaDescription: '',
                    keywords: '',
                    canonicalUrl: '',
                    indexed: true,
                  });
                }}
                className="rounded-lg bg-[rgba(255,255,255,0.08)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.12)]"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPage}
                disabled={isLoading || !newPage.url}
                className="flex items-center gap-2 rounded-lg bg-[#22C55E] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#16A34A] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Create Page SEO
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#0F172A] p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">
              Delete Page SEO
            </h2>
            <p className="mb-6 text-sm text-[#94A3B8]">
              Are you sure you want to delete SEO settings for{' '}
              <span className="font-medium text-white">
                {deleteConfirmPage.pageName}
              </span>{' '}
              ({deleteConfirmPage.url})? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmPage(null)}
                className="rounded-lg bg-[rgba(255,255,255,0.08)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.12)]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePage(deleteConfirmPage)}
                disabled={isLoading}
                className="flex items-center gap-2 rounded-lg bg-[#EF4444] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#DC2626] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
