'use client';

import { useState } from "react";
import { toast } from "sonner";
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
  XCircle,
  AlertCircle,
} from "lucide-react";

interface PageSEO {
  id: string;
  pageName: string;
  url: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  canonicalUrl: string;
  indexed: boolean;
}

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

export default function AdminSeoPage() {
  const [activeTab, setActiveTab] = useState<
    "general" | "pages" | "sitemap" | "opengraph" | "performance" | "schema" | "sms"
  >("general");
  const [isLoading, setIsLoading] = useState(false);

  // General SEO State
  const [generalSEO, setGeneralSEO] = useState({
    defaultMetaTitle: "SMS Activation Service - Get Virtual Phone Numbers",
    defaultMetaDescription:
      "Get instant SMS verification numbers from 150+ countries. Secure, reliable, and affordable SMS activation service for all major platforms.",
    defaultKeywords: "sms activation, virtual phone number, sms verification, temporary phone number",
    canonicalUrl: "https://smsportal.com",
    robotsTxt: `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: https://smsportal.com/sitemap.xml`,
    indexingEnabled: true,
  });

  // Page-Level SEO State
  const [pages, setPages] = useState<PageSEO[]>([
    {
      id: "1",
      pageName: "Home",
      url: "/",
      metaTitle: "SMS Activation Service - Virtual Phone Numbers",
      metaDescription: "Get instant SMS verification for any platform with virtual phone numbers from 150+ countries.",
      keywords: "sms activation, virtual number, phone verification",
      canonicalUrl: "https://smsportal.com/",
      indexed: true,
    },
    {
      id: "2",
      pageName: "Services",
      url: "/services",
      metaTitle: "SMS Services - All Platforms Supported",
      metaDescription: "Access SMS verification for WhatsApp, Telegram, Instagram, Facebook and 500+ more services.",
      keywords: "sms services, whatsapp verification, telegram number",
      canonicalUrl: "https://smsportal.com/services",
      indexed: true,
    },
    {
      id: "3",
      pageName: "Pricing",
      url: "/pricing",
      metaTitle: "SMS Activation Pricing - Affordable Rates",
      metaDescription: "Transparent pricing for SMS activation services. Pay-as-you-go or subscription plans available.",
      keywords: "sms pricing, virtual number cost, cheap sms activation",
      canonicalUrl: "https://smsportal.com/pricing",
      indexed: true,
    },
    {
      id: "4",
      pageName: "FAQ",
      url: "/faq",
      metaTitle: "FAQ - SMS Activation Questions Answered",
      metaDescription: "Find answers to common questions about SMS activation, virtual numbers, and our services.",
      keywords: "sms faq, virtual number questions, activation help",
      canonicalUrl: "https://smsportal.com/faq",
      indexed: true,
    },
    {
      id: "5",
      pageName: "Blog",
      url: "/blog",
      metaTitle: "SMS Activation Blog - Tips & Updates",
      metaDescription: "Latest news, tips, and guides about SMS verification and virtual phone numbers.",
      keywords: "sms blog, virtual number tips, verification guides",
      canonicalUrl: "https://smsportal.com/blog",
      indexed: true,
    },
  ]);

  const [showEditPageModal, setShowEditPageModal] = useState(false);
  const [selectedPage, setSelectedPage] = useState<PageSEO | null>(null);
  const [pageSearchQuery, setPageSearchQuery] = useState("");

  // Sitemap State
  const [sitemapSettings, setSitemapSettings] = useState({
    autoUpdate: true,
    lastGenerated: "2025-03-28",
    sitemapUrl: "https://smsportal.com/sitemap.xml",
  });

  // Open Graph State
  const [openGraph, setOpenGraph] = useState<OpenGraphData>({
    title: "SMS Activation Service - Get Virtual Phone Numbers",
    description: "Get instant SMS verification numbers from 150+ countries. Secure and affordable.",
    image: "https://smsportal.com/og-image.jpg",
    twitterCard: "summary_large_image",
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
    type: "Organization",
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
    titleTemplate: "{service} SMS Verification - {country} Virtual Number",
    descriptionTemplate:
      "Get instant {service} SMS verification with virtual numbers from {country}. Fast, reliable, and secure activation service starting at $0.50.",
    keywordsTemplate: "{service} sms, {country} virtual number, {service} verification, {country} phone number",
  });

  // Handlers
  const handleSaveGeneralSEO = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("General SEO settings saved successfully!");
    setIsLoading(false);
  };

  const handleEditPage = (page: PageSEO) => {
    setSelectedPage(page);
    setShowEditPageModal(true);
  };

  const handleSavePage = async () => {
    if (!selectedPage) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setPages(pages.map((p) => (p.id === selectedPage.id ? selectedPage : p)));
    toast.success("Page SEO updated successfully!");

    setIsLoading(false);
    setShowEditPageModal(false);
    setSelectedPage(null);
  };

  const handleGenerateSitemap = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setSitemapSettings({
      ...sitemapSettings,
      lastGenerated: new Date().toISOString().split("T")[0],
    });

    toast.success("Sitemap generated successfully!");
    setIsLoading(false);
  };

  const handleSaveOpenGraph = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Open Graph settings saved successfully!");
    setIsLoading(false);
  };

  const handleSavePerformance = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Performance settings saved successfully!");
    setIsLoading(false);
  };

  const handleSaveSchema = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Structured data saved successfully!");
    setIsLoading(false);
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
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("SMS Services SEO templates saved successfully!");
    setIsLoading(false);
  };

  const handleGenerateAISEO = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulate AI generation
    setSmsSeoTemplate({
      titleTemplate: "{service} SMS Activation - Buy {country} Virtual Number | SMS Portal",
      descriptionTemplate:
        "Instant {service} verification with premium {country} virtual numbers. 99.9% success rate, 24/7 support, instant delivery. Get your {service} SMS number from {country} starting at $0.50.",
      keywordsTemplate:
        "{service} sms activation, {country} virtual number, buy {service} number, {country} phone verification, {service} sms receive, temporary {country} number",
    });

    toast.success("AI-optimized SEO content generated!");
    setIsLoading(false);
  };

  const filteredPages = pages.filter(
    (page) =>
      page.pageName.toLowerCase().includes(pageSearchQuery.toLowerCase()) ||
      page.url.toLowerCase().includes(pageSearchQuery.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-white text-3xl font-semibold">SEO Management</h1>
        </div>
        <p className="text-[#94A3B8] text-sm">
          Complete SEO control system for all pages, services, and content
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab("general")}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === "general"
              ? "bg-[#3B82F6] text-white"
              : "bg-[rgba(255,255,255,0.05)] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.08)]"
          }`}
        >
          <Globe className="w-4 h-4" />
          General SEO
        </button>
        <button
          onClick={() => setActiveTab("pages")}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === "pages"
              ? "bg-[#3B82F6] text-white"
              : "bg-[rgba(255,255,255,0.05)] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.08)]"
          }`}
        >
          <FileCode className="w-4 h-4" />
          Page-Level SEO
        </button>
        <button
          onClick={() => setActiveTab("sitemap")}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            activeTab === "sitemap"
              ? "bg-[#3B82F6] text-white"
              : "bg-[rgba(255,255,255,0.05)] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.08)]"
          }`}
        >
          Sitemap
        </button>
        <button
          onClick={() => setActiveTab("opengraph")}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === "opengraph"
              ? "bg-[#3B82F6] text-white"
              : "bg-[rgba(255,255,255,0.05)] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.08)]"
          }`}
        >
          <Image className="w-4 h-4" />
          Open Graph
        </button>
        <button
          onClick={() => setActiveTab("performance")}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === "performance"
              ? "bg-[#3B82F6] text-white"
              : "bg-[rgba(255,255,255,0.05)] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.08)]"
          }`}
        >
          <Zap className="w-4 h-4" />
          Performance
        </button>
        <button
          onClick={() => setActiveTab("schema")}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === "schema"
              ? "bg-[#3B82F6] text-white"
              : "bg-[rgba(255,255,255,0.05)] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.08)]"
          }`}
        >
          <Code className="w-4 h-4" />
          Schema
        </button>
        <button
          onClick={() => setActiveTab("sms")}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === "sms"
              ? "bg-[#3B82F6] text-white"
              : "bg-[rgba(255,255,255,0.05)] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.08)]"
          }`}
        >
          <Wand2 className="w-4 h-4" />
          SMS Services SEO
        </button>
      </div>

      {/* General SEO Tab */}
      {activeTab === "general" && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl">
            <h2 className="text-white text-xl font-semibold mb-6">General SEO Settings</h2>

            <div className="space-y-4">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Default Meta Title</label>
                <input
                  type="text"
                  value={generalSEO.defaultMetaTitle}
                  onChange={(e) => setGeneralSEO({ ...generalSEO, defaultMetaTitle: e.target.value })}
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  placeholder="Enter default meta title"
                />
                <p className="text-[#64748B] text-xs mt-1">
                  {generalSEO.defaultMetaTitle.length}/60 characters (optimal: 50-60)
                </p>
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">Default Meta Description</label>
                <textarea
                  value={generalSEO.defaultMetaDescription}
                  onChange={(e) => setGeneralSEO({ ...generalSEO, defaultMetaDescription: e.target.value })}
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] min-h-[100px] resize-none"
                  placeholder="Enter default meta description"
                />
                <p className="text-[#64748B] text-xs mt-1">
                  {generalSEO.defaultMetaDescription.length}/160 characters (optimal: 150-160)
                </p>
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">Default Keywords</label>
                <input
                  type="text"
                  value={generalSEO.defaultKeywords}
                  onChange={(e) => setGeneralSEO({ ...generalSEO, defaultKeywords: e.target.value })}
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  placeholder="keyword1, keyword2, keyword3"
                />
                <p className="text-[#64748B] text-xs mt-1">Separate keywords with commas</p>
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">Canonical URL</label>
                <input
                  type="url"
                  value={generalSEO.canonicalUrl}
                  onChange={(e) => setGeneralSEO({ ...generalSEO, canonicalUrl: e.target.value })}
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">Robots.txt</label>
                <textarea
                  value={generalSEO.robotsTxt}
                  onChange={(e) => setGeneralSEO({ ...generalSEO, robotsTxt: e.target.value })}
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] font-mono min-h-[150px] resize-none"
                  placeholder="User-agent: *&#10;Allow: /"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)]">
                <div>
                  <h3 className="text-white text-sm font-semibold mb-1">Search Engine Indexing</h3>
                  <p className="text-[#64748B] text-xs">Allow search engines to index your site</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={generalSEO.indexingEnabled}
                    onChange={(e) => setGeneralSEO({ ...generalSEO, indexingEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#64748B] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#22C55E]"></div>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-[rgba(255,255,255,0.1)]">
              <button
                onClick={handleSaveGeneralSEO}
                disabled={isLoading}
                className="px-6 py-3 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page-Level SEO Tab */}
      {activeTab === "pages" && (
        <div className="space-y-6">
          {/* Search */}
          <div className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#64748B]" />
              <input
                type="text"
                value={pageSearchQuery}
                onChange={(e) => setPageSearchQuery(e.target.value)}
                placeholder="Search pages..."
                className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg pl-12 pr-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
              />
            </div>
          </div>

          {/* Pages Table */}
          <div className="rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl overflow-hidden">
            <div className="p-6 border-b border-[rgba(255,255,255,0.1)]">
              <h2 className="text-white text-xl font-semibold">Page-Level SEO</h2>
              <p className="text-[#94A3B8] text-sm mt-1">{filteredPages.length} pages</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.2)]">
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#94A3B8] uppercase">Page Name</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#94A3B8] uppercase">URL</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#94A3B8] uppercase">Meta Title</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#94A3B8] uppercase">Index Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#94A3B8] uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                  {filteredPages.map((page) => (
                    <tr key={page.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                      <td className="px-6 py-4 text-white text-sm font-medium">{page.pageName}</td>
                      <td className="px-6 py-4 text-[#3B82F6] text-sm">{page.url}</td>
                      <td className="px-6 py-4 text-[#94A3B8] text-sm max-w-xs truncate">{page.metaTitle}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                            page.indexed
                              ? "bg-[#22C55E]/20 text-[#22C55E]"
                              : "bg-[#EF4444]/20 text-[#EF4444]"
                          }`}
                        >
                          {page.indexed ? (
                            <>
                              <Eye className="w-3 h-3" />
                              Indexed
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" />
                              Not Indexed
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleEditPage(page)}
                          className="px-4 py-2 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-medium transition-colors flex items-center gap-1"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Edit SEO
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sitemap Tab */}
      {activeTab === "sitemap" && (
        <div className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl">
          <h2 className="text-white text-xl font-semibold mb-6">Sitemap Management</h2>

          <div className="space-y-6">
            <div className="p-6 rounded-lg bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white text-base font-semibold mb-1">Sitemap URL</h3>
                  <p className="text-[#64748B] text-sm">Your sitemap is accessible at this URL</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={sitemapSettings.sitemapUrl}
                  readOnly
                  className="flex-1 bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-[#3B82F6] text-sm focus:outline-none"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(sitemapSettings.sitemapUrl);
                    toast.success("Sitemap URL copied to clipboard!");
                  }}
                  className="px-4 py-3 rounded-lg bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.12)] text-white text-sm font-medium transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)]">
              <div>
                <h3 className="text-white text-sm font-semibold mb-1">Auto-Update Sitemap</h3>
                <p className="text-[#64748B] text-xs">Automatically update sitemap when content changes</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={sitemapSettings.autoUpdate}
                  onChange={(e) =>
                    setSitemapSettings({ ...sitemapSettings, autoUpdate: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#64748B] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#22C55E]"></div>
              </label>
            </div>

            <div className="p-6 rounded-lg bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white text-base font-semibold mb-1">Generate Sitemap</h3>
                  <p className="text-[#64748B] text-sm">
                    Last generated: {sitemapSettings.lastGenerated}
                  </p>
                </div>
                <button
                  onClick={handleGenerateSitemap}
                  disabled={isLoading}
                  className="px-6 py-3 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    "Generating..."
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Generate Now
                    </>
                  )}
                </button>
              </div>
              <div className="flex items-center gap-2 text-[#22C55E] text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>Sitemap is up to date and submitted to search engines</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Open Graph Tab */}
      {activeTab === "opengraph" && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl">
            <h2 className="text-white text-xl font-semibold mb-6">Open Graph & Social Media</h2>

            <div className="space-y-4">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">OG Title</label>
                <input
                  type="text"
                  value={openGraph.title}
                  onChange={(e) => setOpenGraph({ ...openGraph, title: e.target.value })}
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  placeholder="Enter Open Graph title"
                />
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">OG Description</label>
                <textarea
                  value={openGraph.description}
                  onChange={(e) => setOpenGraph({ ...openGraph, description: e.target.value })}
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] min-h-[100px] resize-none"
                  placeholder="Enter Open Graph description"
                />
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">OG Image URL</label>
                <div className="flex gap-3">
                  <input
                    type="url"
                    value={openGraph.image}
                    onChange={(e) => setOpenGraph({ ...openGraph, image: e.target.value })}
                    className="flex-1 bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                    placeholder="https://example.com/image.jpg"
                  />
                  <button className="px-4 py-3 rounded-lg bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.12)] text-white text-sm font-medium transition-colors flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Upload
                  </button>
                </div>
                <p className="text-[#64748B] text-xs mt-1">Recommended size: 1200x630px</p>
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">Twitter Card Type</label>
                <select
                  value={openGraph.twitterCard}
                  onChange={(e) => setOpenGraph({ ...openGraph, twitterCard: e.target.value })}
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                >
                  <option value="summary">Summary</option>
                  <option value="summary_large_image">Summary Large Image</option>
                  <option value="app">App</option>
                  <option value="player">Player</option>
                </select>
              </div>
            </div>

            {/* Preview */}
            <div className="mt-8 p-6 rounded-lg bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)]">
              <h3 className="text-white text-sm font-semibold mb-4 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Social Media Preview
              </h3>
              <div className="border border-[rgba(255,255,255,0.1)] rounded-lg overflow-hidden">
                <div className="aspect-[1.91/1] bg-[rgba(59,130,246,0.1)] flex items-center justify-center">
                  <Image className="w-12 h-12 text-[#3B82F6]" />
                </div>
                <div className="p-4 bg-[rgba(0,0,0,0.4)]">
                  <div className="text-white text-sm font-semibold mb-1">{openGraph.title}</div>
                  <div className="text-[#94A3B8] text-xs line-clamp-2">{openGraph.description}</div>
                  <div className="text-[#64748B] text-xs mt-2">smsportal.com</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-[rgba(255,255,255,0.1)]">
              <button
                onClick={handleSaveOpenGraph}
                disabled={isLoading}
                className="px-6 py-3 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === "performance" && (
        <div className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl">
          <h2 className="text-white text-xl font-semibold mb-6">Performance & Speed Optimization</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)]">
              <div>
                <h3 className="text-white text-sm font-semibold mb-1 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#F59E0B]" />
                  Enable Caching
                </h3>
                <p className="text-[#64748B] text-xs">Cache static assets for faster page loads</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={performance.caching}
                  onChange={(e) => setPerformance({ ...performance, caching: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#64748B] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#22C55E]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)]">
              <div>
                <h3 className="text-white text-sm font-semibold mb-1">Minify CSS</h3>
                <p className="text-[#64748B] text-xs">Compress CSS files for smaller file size</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={performance.minifyCss}
                  onChange={(e) => setPerformance({ ...performance, minifyCss: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#64748B] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#22C55E]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)]">
              <div>
                <h3 className="text-white text-sm font-semibold mb-1">Minify JavaScript</h3>
                <p className="text-[#64748B] text-xs">Compress JS files for smaller file size</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={performance.minifyJs}
                  onChange={(e) => setPerformance({ ...performance, minifyJs: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#64748B] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#22C55E]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)]">
              <div>
                <h3 className="text-white text-sm font-semibold mb-1">Lazy Load Images</h3>
                <p className="text-[#64748B] text-xs">Load images only when they appear in viewport</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={performance.lazyLoad}
                  onChange={(e) => setPerformance({ ...performance, lazyLoad: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#64748B] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#22C55E]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)]">
              <div>
                <h3 className="text-white text-sm font-semibold mb-1">Image Optimization</h3>
                <p className="text-[#64748B] text-xs">Automatically optimize and compress images</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={performance.imageOptimization}
                  onChange={(e) =>
                    setPerformance({ ...performance, imageOptimization: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#64748B] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#22C55E]"></div>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-[rgba(255,255,255,0.1)]">
            <button
              onClick={handleSavePerformance}
              disabled={isLoading}
              className="px-6 py-3 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                "Saving..."
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Schema Tab */}
      {activeTab === "schema" && (
        <div className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl">
          <h2 className="text-white text-xl font-semibold mb-6">Structured Data (Schema Markup)</h2>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-white text-sm font-medium mb-2 block">Schema Type</label>
                <select
                  value={schema.type}
                  onChange={(e) => setSchema({ ...schema, type: e.target.value })}
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                >
                  <option value="Organization">Organization</option>
                  <option value="Product">Product</option>
                  <option value="Article">Article</option>
                  <option value="FAQ">FAQ</option>
                </select>
              </div>
              <button
                onClick={handleGenerateSchema}
                className="mt-7 px-6 py-3 rounded-lg bg-[#F59E0B] hover:bg-[#D97706] text-white text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Wand2 className="w-4 h-4" />
                Auto-Generate
              </button>
            </div>

            <div>
              <label className="text-white text-sm font-medium mb-2 block">JSON-LD Schema</label>
              <textarea
                value={schema.jsonLd}
                onChange={(e) => setSchema({ ...schema, jsonLd: e.target.value })}
                className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] font-mono min-h-[400px] resize-none"
                placeholder="Enter JSON-LD schema..."
              />
              <p className="text-[#64748B] text-xs mt-2">
                Make sure your JSON-LD is valid before saving
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-[rgba(255,255,255,0.1)]">
            <button
              onClick={handleSaveSchema}
              disabled={isLoading}
              className="px-6 py-3 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                "Saving..."
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Schema
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* SMS Services SEO Tab */}
      {activeTab === "sms" && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-white text-xl font-semibold mb-2">SMS Services SEO Templates</h2>
                <p className="text-[#94A3B8] text-sm">
                  Create SEO templates for all SMS services using placeholders
                </p>
              </div>
              <button
                onClick={handleGenerateAISEO}
                disabled={isLoading}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] hover:from-[#7C3AED] hover:to-[#DB2777] text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  "Generating..."
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Generate SEO (AI)
                  </>
                )}
              </button>
            </div>

            <div className="p-4 rounded-lg bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.3)] mb-6">
              <h3 className="text-[#8B5CF6] text-sm font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Available Placeholders
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-[#94A3B8]">
                  <span className="text-[#8B5CF6] font-mono">{"{service}"}</span> - Service name
                  (e.g., WhatsApp)
                </div>
                <div className="text-[#94A3B8]">
                  <span className="text-[#8B5CF6] font-mono">{"{country}"}</span> - Country name
                  (e.g., United States)
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Title Template</label>
                <input
                  type="text"
                  value={smsSeoTemplate.titleTemplate}
                  onChange={(e) =>
                    setSmsSeoTemplate({ ...smsSeoTemplate, titleTemplate: e.target.value })
                  }
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  placeholder="{service} SMS Verification - {country} Virtual Number"
                />
                <div className="mt-2 p-3 rounded-lg bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)]">
                  <p className="text-[#64748B] text-xs mb-1">Example output:</p>
                  <p className="text-[#22C55E] text-sm">
                    WhatsApp SMS Verification - United States Virtual Number
                  </p>
                </div>
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">Description Template</label>
                <textarea
                  value={smsSeoTemplate.descriptionTemplate}
                  onChange={(e) =>
                    setSmsSeoTemplate({ ...smsSeoTemplate, descriptionTemplate: e.target.value })
                  }
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] min-h-[100px] resize-none"
                  placeholder="Get instant {service} SMS verification with virtual numbers from {country}..."
                />
                <div className="mt-2 p-3 rounded-lg bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)]">
                  <p className="text-[#64748B] text-xs mb-1">Example output:</p>
                  <p className="text-[#22C55E] text-sm">
                    Get instant WhatsApp SMS verification with virtual numbers from United States. Fast,
                    reliable, and secure activation service starting at $0.50.
                  </p>
                </div>
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">Keywords Template</label>
                <input
                  type="text"
                  value={smsSeoTemplate.keywordsTemplate}
                  onChange={(e) =>
                    setSmsSeoTemplate({ ...smsSeoTemplate, keywordsTemplate: e.target.value })
                  }
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  placeholder="{service} sms, {country} virtual number, {service} verification..."
                />
                <div className="mt-2 p-3 rounded-lg bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)]">
                  <p className="text-[#64748B] text-xs mb-1">Example output:</p>
                  <p className="text-[#22C55E] text-sm">
                    whatsapp sms, united states virtual number, whatsapp verification, usa phone number
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-[rgba(255,255,255,0.1)]">
              <button
                onClick={handleSaveSMSSEO}
                disabled={isLoading}
                className="px-6 py-3 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="w-4 h-4" />
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F172A] border border-[rgba(255,255,255,0.1)] rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-white text-xl font-semibold mb-6">Edit Page SEO - {selectedPage.pageName}</h2>

            <div className="space-y-4">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Meta Title</label>
                <input
                  type="text"
                  value={selectedPage.metaTitle}
                  onChange={(e) => setSelectedPage({ ...selectedPage, metaTitle: e.target.value })}
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  placeholder="Enter meta title"
                />
                <p className="text-[#64748B] text-xs mt-1">
                  {selectedPage.metaTitle.length}/60 characters
                </p>
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">Meta Description</label>
                <textarea
                  value={selectedPage.metaDescription}
                  onChange={(e) => setSelectedPage({ ...selectedPage, metaDescription: e.target.value })}
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] min-h-[100px] resize-none"
                  placeholder="Enter meta description"
                />
                <p className="text-[#64748B] text-xs mt-1">
                  {selectedPage.metaDescription.length}/160 characters
                </p>
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">Keywords</label>
                <input
                  type="text"
                  value={selectedPage.keywords}
                  onChange={(e) => setSelectedPage({ ...selectedPage, keywords: e.target.value })}
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">Canonical URL</label>
                <input
                  type="url"
                  value={selectedPage.canonicalUrl}
                  onChange={(e) => setSelectedPage({ ...selectedPage, canonicalUrl: e.target.value })}
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  placeholder="https://example.com/page"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)]">
                <div>
                  <h3 className="text-white text-sm font-semibold mb-1">Index This Page</h3>
                  <p className="text-[#64748B] text-xs">Allow search engines to index this page</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPage.indexed}
                    onChange={(e) => setSelectedPage({ ...selectedPage, indexed: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#64748B] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#22C55E]"></div>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditPageModal(false);
                  setSelectedPage(null);
                }}
                className="px-5 py-2.5 rounded-lg bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.12)] text-white text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePage}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
