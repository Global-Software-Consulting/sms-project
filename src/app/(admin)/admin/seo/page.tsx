'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Save,
  RefreshCw,
  Globe,
  FileText,
  Image,
  Code,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Copy
} from 'lucide-react';
import { Button, Alert } from '@/components/ui';

interface PageSeoConfig {
  path: string;
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  canonical: string;
  noIndex: boolean;
  noFollow: boolean;
}

const defaultPages: PageSeoConfig[] = [
  {
    path: '/',
    title: 'SMS Sort - Virtual Phone Numbers for SMS Verification',
    description: 'Get instant virtual phone numbers for SMS verification. Secure, fast, and reliable SMS verification service for all platforms.',
    keywords: 'sms verification, virtual phone number, receive sms online, phone verification',
    ogTitle: 'SMS Sort - Virtual Phone Numbers',
    ogDescription: 'Get instant virtual phone numbers for SMS verification',
    ogImage: '/og/home.png',
    canonical: 'https://smssort.com',
    noIndex: false,
    noFollow: false,
  },
  {
    path: '/pricing',
    title: 'Pricing - SMS Sort',
    description: 'Affordable pricing for SMS verification services. Pay-as-you-go or subscribe to a plan.',
    keywords: 'sms verification pricing, virtual number cost, cheap sms verification',
    ogTitle: 'SMS Sort Pricing',
    ogDescription: 'Affordable pricing for SMS verification services',
    ogImage: '/og/pricing.png',
    canonical: 'https://smssort.com/pricing',
    noIndex: false,
    noFollow: false,
  },
  {
    path: '/services',
    title: 'Services - SMS Sort',
    description: 'Browse our supported services for SMS verification. WhatsApp, Telegram, Google, and more.',
    keywords: 'whatsapp verification, telegram sms, google verification',
    ogTitle: 'SMS Verification Services',
    ogDescription: 'Browse supported services for SMS verification',
    ogImage: '/og/services.png',
    canonical: 'https://smssort.com/services',
    noIndex: false,
    noFollow: false,
  },
  {
    path: '/countries',
    title: 'Countries - SMS Sort',
    description: 'Virtual phone numbers from 50+ countries. USA, UK, Germany, and more.',
    keywords: 'usa phone number, uk virtual number, international sms',
    ogTitle: 'Available Countries',
    ogDescription: 'Virtual phone numbers from 50+ countries',
    ogImage: '/og/countries.png',
    canonical: 'https://smssort.com/countries',
    noIndex: false,
    noFollow: false,
  },
  {
    path: '/blog',
    title: 'Blog - SMS Sort',
    description: 'Latest news, guides, and tips about SMS verification and online privacy.',
    keywords: 'sms verification guide, online privacy tips, virtual number blog',
    ogTitle: 'SMS Sort Blog',
    ogDescription: 'Latest news and guides about SMS verification',
    ogImage: '/og/blog.png',
    canonical: 'https://smssort.com/blog',
    noIndex: false,
    noFollow: false,
  },
];

/**
 * Admin SEO Page
 * 
 * Features:
 * - Per-page meta tag configuration
 * - Open Graph settings
 * - Sitemap management
 * - Robots.txt configuration
 */
export default function AdminSeoPage() {
  const [pages, setPages] = useState<PageSeoConfig[]>(defaultPages);
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pages' | 'sitemap' | 'robots'>('pages');

  // Global SEO settings
  const [globalSettings, setGlobalSettings] = useState({
    siteTitle: 'SMS Sort',
    titleSeparator: ' | ',
    defaultOgImage: '/og/default.png',
    twitterHandle: '@smssort',
    googleVerification: '',
    bingVerification: '',
  });

  // Robots.txt content
  const [robotsTxt, setRobotsTxt] = useState(`User-agent: *
Allow: /
Disallow: /admin/
Disallow: /dashboard/
Disallow: /api/

Sitemap: https://smssort.com/sitemap.xml`);

  // Handle save
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('SEO settings saved successfully');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  // Update page config
  const updatePage = (path: string, updates: Partial<PageSeoConfig>) => {
    setPages(prev => prev.map(p => 
      p.path === path ? { ...p, ...updates } : p
    ));
  };

  // Get selected page config
  const selectedConfig = pages.find(p => p.path === selectedPage);

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: 'var(--bg-card)', 
        borderBottom: '1px solid var(--border-default)',
        padding: '24px'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <Link href="/admin" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>
                  Admin
                </Link>
                <span style={{ color: 'var(--text-muted)' }}>/</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>SEO</span>
              </div>
              <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>
                SEO Management
              </h1>
            </div>
            <Button variant="primary" onClick={handleSave} isLoading={saving}>
              <Save style={{ width: '16px', height: '16px', marginRight: '8px' }} />
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        {/* Alerts */}
        {error && (
          <div style={{ marginBottom: '24px' }}>
            <Alert variant="error" dismissible onDismiss={() => setError(null)}>
              {error}
            </Alert>
          </div>
        )}

        {success && (
          <div style={{ marginBottom: '24px' }}>
            <Alert variant="success" dismissible onDismiss={() => setSuccess(null)}>
              {success}
            </Alert>
          </div>
        )}

        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          marginBottom: '24px',
          borderBottom: '1px solid var(--border-default)',
          paddingBottom: '16px'
        }}>
          <TabButton active={activeTab === 'pages'} onClick={() => setActiveTab('pages')} icon={FileText}>
            Page SEO
          </TabButton>
          <TabButton active={activeTab === 'sitemap'} onClick={() => setActiveTab('sitemap')} icon={Globe}>
            Sitemap
          </TabButton>
          <TabButton active={activeTab === 'robots'} onClick={() => setActiveTab('robots')} icon={Code}>
            Robots.txt
          </TabButton>
        </div>

        {/* Pages Tab */}
        {activeTab === 'pages' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }} className="lg:!grid-cols-3">
            {/* Page List */}
            <div style={{ gridColumn: 'span 1' }}>
              <div style={{ 
                backgroundColor: 'var(--bg-card)', 
                border: '1px solid var(--border-default)', 
                borderRadius: '16px',
                overflow: 'hidden'
              }}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--border-default)' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Pages
                  </h3>
                </div>
                <div>
                  {pages.map((page) => (
                    <button
                      key={page.path}
                      onClick={() => setSelectedPage(page.path)}
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        borderBottom: '1px solid var(--border-default)',
                        backgroundColor: selectedPage === page.path ? 'rgba(198, 167, 94, 0.05)' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'background-color 0.15s'
                      }}
                    >
                      <div style={{ textAlign: 'left' }}>
                        <p style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '14px' }}>
                          {page.path}
                        </p>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {page.title.slice(0, 40)}...
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {page.noIndex ? (
                          <AlertTriangle style={{ width: '16px', height: '16px', color: 'var(--warning)' }} />
                        ) : (
                          <CheckCircle style={{ width: '16px', height: '16px', color: 'var(--success)' }} />
                        )}
                        <ChevronRight style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Page Config */}
            <div style={{ gridColumn: 'span 1' }} className="lg:!col-span-2">
              {selectedConfig ? (
                <div style={{ 
                  backgroundColor: 'var(--bg-card)', 
                  border: '1px solid var(--border-default)', 
                  borderRadius: '16px',
                  padding: '24px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {selectedConfig.path}
                      </h3>
                      <a 
                        href={selectedConfig.canonical} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ fontSize: '13px', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}
                      >
                        {selectedConfig.canonical} <ExternalLink style={{ width: '12px', height: '12px' }} />
                      </a>
                    </div>
                  </div>

                  {/* Meta Tags */}
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase' }}>
                      Meta Tags
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <FormField
                        label="Title"
                        value={selectedConfig.title}
                        onChange={(v) => updatePage(selectedConfig.path, { title: v })}
                        maxLength={60}
                        showCount
                      />
                      <FormField
                        label="Description"
                        value={selectedConfig.description}
                        onChange={(v) => updatePage(selectedConfig.path, { description: v })}
                        multiline
                        maxLength={160}
                        showCount
                      />
                      <FormField
                        label="Keywords"
                        value={selectedConfig.keywords}
                        onChange={(v) => updatePage(selectedConfig.path, { keywords: v })}
                        placeholder="keyword1, keyword2, keyword3"
                      />
                      <FormField
                        label="Canonical URL"
                        value={selectedConfig.canonical}
                        onChange={(v) => updatePage(selectedConfig.path, { canonical: v })}
                      />
                    </div>
                  </div>

                  {/* Open Graph */}
                  <div style={{ marginBottom: '24px', paddingTop: '24px', borderTop: '1px solid var(--border-default)' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase' }}>
                      Open Graph (Social Sharing)
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <FormField
                        label="OG Title"
                        value={selectedConfig.ogTitle}
                        onChange={(v) => updatePage(selectedConfig.path, { ogTitle: v })}
                      />
                      <FormField
                        label="OG Description"
                        value={selectedConfig.ogDescription}
                        onChange={(v) => updatePage(selectedConfig.path, { ogDescription: v })}
                        multiline
                      />
                      <FormField
                        label="OG Image URL"
                        value={selectedConfig.ogImage}
                        onChange={(v) => updatePage(selectedConfig.path, { ogImage: v })}
                        placeholder="/og/image.png"
                      />
                    </div>
                  </div>

                  {/* Indexing */}
                  <div style={{ paddingTop: '24px', borderTop: '1px solid var(--border-default)' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase' }}>
                      Search Engine Indexing
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <ToggleField
                        label="No Index"
                        description="Prevent search engines from indexing this page"
                        checked={selectedConfig.noIndex}
                        onChange={(v) => updatePage(selectedConfig.path, { noIndex: v })}
                      />
                      <ToggleField
                        label="No Follow"
                        description="Prevent search engines from following links on this page"
                        checked={selectedConfig.noFollow}
                        onChange={(v) => updatePage(selectedConfig.path, { noFollow: v })}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ 
                  backgroundColor: 'var(--bg-card)', 
                  border: '1px solid var(--border-default)', 
                  borderRadius: '16px',
                  padding: '64px',
                  textAlign: 'center'
                }}>
                  <Search style={{ width: '48px', height: '48px', color: 'var(--text-muted)', margin: '0 auto 16px' }} />
                  <p style={{ color: 'var(--text-muted)' }}>Select a page to configure SEO</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sitemap Tab */}
        {activeTab === 'sitemap' && (
          <div style={{ 
            backgroundColor: 'var(--bg-card)', 
            border: '1px solid var(--border-default)', 
            borderRadius: '16px',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Sitemap Configuration
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Manage your XML sitemap for search engines
                </p>
              </div>
              <Button variant="outline">
                <RefreshCw style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                Regenerate Sitemap
              </Button>
            </div>

            <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>Sitemap URL</p>
                  <p style={{ fontSize: '13px', color: 'var(--accent-gold)', marginTop: '4px' }}>
                    https://smssort.com/sitemap.xml
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard('https://smssort.com/sitemap.xml')}>
                  <Copy style={{ width: '14px', height: '14px' }} />
                </Button>
              </div>
            </div>

            <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '16px' }}>
              Included Pages ({pages.filter(p => !p.noIndex).length})
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {pages.filter(p => !p.noIndex).map((page) => (
                <div 
                  key={page.path}
                  style={{ 
                    padding: '12px 16px', 
                    backgroundColor: 'var(--bg-secondary)', 
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{page.path}</span>
                  <CheckCircle style={{ width: '16px', height: '16px', color: 'var(--success)' }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Robots.txt Tab */}
        {activeTab === 'robots' && (
          <div style={{ 
            backgroundColor: 'var(--bg-card)', 
            border: '1px solid var(--border-default)', 
            borderRadius: '16px',
            padding: '24px'
          }}>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Robots.txt Configuration
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Control how search engines crawl your site
              </p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
                robots.txt Content
              </label>
              <textarea
                value={robotsTxt}
                onChange={(e) => setRobotsTxt(e.target.value)}
                style={{
                  width: '100%',
                  minHeight: '300px',
                  padding: '16px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  color: 'var(--text-primary)',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ 
              padding: '12px', 
              backgroundColor: 'rgba(59, 130, 246, 0.1)', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }}>
              <AlertTriangle style={{ width: '18px', height: '18px', color: 'var(--info)', flexShrink: 0, marginTop: '2px' }} />
              <p style={{ fontSize: '13px', color: 'var(--info)' }}>
                Changes to robots.txt may take time to be recognized by search engines. Test your robots.txt using Google Search Console.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ==================== COMPONENTS ==================== */

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  children: React.ReactNode;
}

function TabButton({ active, onClick, icon: Icon, children }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 20px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: active ? 'rgba(198, 167, 94, 0.1)' : 'transparent',
        color: active ? 'var(--accent-gold)' : 'var(--text-secondary)',
        fontWeight: 500,
        fontSize: '14px',
        cursor: 'pointer',
        transition: 'all 0.15s'
      }}
    >
      <Icon style={{ width: '16px', height: '16px' }} />
      {children}
    </button>
  );
}

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  maxLength?: number;
  showCount?: boolean;
}

function FormField({ label, value, onChange, placeholder, multiline, maxLength, showCount }: FormFieldProps) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
          {label}
        </label>
        {showCount && maxLength && (
          <span style={{ fontSize: '12px', color: value.length > maxLength ? 'var(--danger)' : 'var(--text-muted)' }}>
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          style={{
            width: '100%',
            minHeight: '80px',
            padding: '12px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-default)',
            borderRadius: '8px',
            fontSize: '14px',
            color: 'var(--text-primary)',
            resize: 'vertical'
          }}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          style={{
            width: '100%',
            height: '44px',
            padding: '0 12px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-default)',
            borderRadius: '8px',
            fontSize: '14px',
            color: 'var(--text-primary)'
          }}
        />
      )}
    </div>
  );
}

interface ToggleFieldProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

function ToggleField({ label, description, checked, onChange }: ToggleFieldProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
      <div>
        <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{label}</p>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        style={{
          width: '48px',
          height: '26px',
          borderRadius: '13px',
          border: 'none',
          backgroundColor: checked ? 'var(--warning)' : 'var(--bg-secondary)',
          cursor: 'pointer',
          position: 'relative',
          transition: 'background-color 0.2s',
          flexShrink: 0
        }}
      >
        <div style={{
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          backgroundColor: 'white',
          position: 'absolute',
          top: '2px',
          left: checked ? '24px' : '2px',
          transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
        }} />
      </button>
    </div>
  );
}

