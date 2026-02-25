'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  MessageCircle, 
  Star,
  BarChart3,
  Eye,
  Search,
  RefreshCw,
  Settings,
  ExternalLink,
  Check,
  X,
  AlertCircle,
  Zap,
  Shield,
  Globe
} from 'lucide-react';
import { Button, Alert } from '@/components/ui';

interface Addon {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  category: 'chat' | 'reviews' | 'analytics' | 'security';
  isEnabled: boolean;
  isConfigured: boolean;
  configFields: ConfigField[];
  docsUrl: string;
  color: string;
}

interface ConfigField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'select';
  placeholder?: string;
  value: string;
  options?: { value: string; label: string }[];
  required: boolean;
}

const initialAddons: Addon[] = [
  {
    id: 'livechat',
    name: 'LiveChatAI',
    description: 'AI-powered live chat widget for customer support. Provides instant responses and escalation to human agents.',
    icon: MessageCircle,
    category: 'chat',
    isEnabled: false,
    isConfigured: false,
    configFields: [
      { key: 'widgetId', label: 'Widget ID', type: 'text', placeholder: 'Enter your LiveChatAI widget ID', value: '', required: true },
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Enter your API key', value: '', required: true },
      { key: 'position', label: 'Widget Position', type: 'select', value: 'bottom-right', options: [
        { value: 'bottom-right', label: 'Bottom Right' },
        { value: 'bottom-left', label: 'Bottom Left' },
      ], required: false },
    ],
    docsUrl: 'https://livechatai.com/docs',
    color: '#6366F1',
  },
  {
    id: 'trustpilot',
    name: 'TrustPilot',
    description: 'Display verified customer reviews and ratings. Build trust with potential customers through social proof.',
    icon: Star,
    category: 'reviews',
    isEnabled: false,
    isConfigured: false,
    configFields: [
      { key: 'businessUnitId', label: 'Business Unit ID', type: 'text', placeholder: 'Your TrustPilot business unit ID', value: '', required: true },
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Enter your API key', value: '', required: true },
      { key: 'widgetType', label: 'Widget Type', type: 'select', value: 'mini', options: [
        { value: 'mini', label: 'Mini Widget' },
        { value: 'carousel', label: 'Review Carousel' },
        { value: 'grid', label: 'Review Grid' },
      ], required: false },
    ],
    docsUrl: 'https://support.trustpilot.com/hc/en-us/categories/201812607-Integrations',
    color: '#00B67A',
  },
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    description: 'Track website traffic, user behavior, and conversion metrics. Essential for understanding your audience.',
    icon: BarChart3,
    category: 'analytics',
    isEnabled: false,
    isConfigured: false,
    configFields: [
      { key: 'measurementId', label: 'Measurement ID', type: 'text', placeholder: 'G-XXXXXXXXXX', value: '', required: true },
      { key: 'enableEnhanced', label: 'Enhanced Measurement', type: 'select', value: 'true', options: [
        { value: 'true', label: 'Enabled' },
        { value: 'false', label: 'Disabled' },
      ], required: false },
    ],
    docsUrl: 'https://support.google.com/analytics/answer/9304153',
    color: '#F59E0B',
  },
  {
    id: 'microsoft-clarity',
    name: 'Microsoft Clarity',
    description: 'Free heatmaps and session recordings. Understand how users interact with your site visually.',
    icon: Eye,
    category: 'analytics',
    isEnabled: false,
    isConfigured: false,
    configFields: [
      { key: 'projectId', label: 'Project ID', type: 'text', placeholder: 'Your Clarity project ID', value: '', required: true },
    ],
    docsUrl: 'https://clarity.microsoft.com/docs',
    color: '#0078D4',
  },
  {
    id: 'cloudflare-turnstile',
    name: 'Cloudflare Turnstile',
    description: 'Privacy-friendly CAPTCHA alternative. Protect forms from bots without annoying users.',
    icon: Shield,
    category: 'security',
    isEnabled: false,
    isConfigured: false,
    configFields: [
      { key: 'siteKey', label: 'Site Key', type: 'text', placeholder: 'Your Turnstile site key', value: '', required: true },
      { key: 'secretKey', label: 'Secret Key', type: 'password', placeholder: 'Your Turnstile secret key', value: '', required: true },
      { key: 'theme', label: 'Theme', type: 'select', value: 'auto', options: [
        { value: 'auto', label: 'Auto (Match System)' },
        { value: 'light', label: 'Light' },
        { value: 'dark', label: 'Dark' },
      ], required: false },
    ],
    docsUrl: 'https://developers.cloudflare.com/turnstile/',
    color: '#F38020',
  },
];

/**
 * Admin Addons Page
 * 
 * Manage third-party integrations:
 * - LiveChatAI widget
 * - TrustPilot reviews
 * - Google Analytics
 * - Microsoft Clarity
 * - Cloudflare Turnstile
 */
export default function AdminAddonsPage() {
  const [addons, setAddons] = useState<Addon[]>(initialAddons);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedAddon, setSelectedAddon] = useState<Addon | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, string>>({});
  const [searchInput, setSearchInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Filter addons
  const filteredAddons = addons.filter(addon => {
    const matchesSearch = addon.name.toLowerCase().includes(searchInput.toLowerCase()) ||
                         addon.description.toLowerCase().includes(searchInput.toLowerCase());
    const matchesCategory = !selectedCategory || addon.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Stats
  const stats = {
    total: addons.length,
    enabled: addons.filter(a => a.isEnabled).length,
    configured: addons.filter(a => a.isConfigured).length,
  };

  // Open config modal
  const handleConfigure = (addon: Addon) => {
    setSelectedAddon(addon);
    const values: Record<string, string> = {};
    addon.configFields.forEach(field => {
      values[field.key] = field.value;
    });
    setConfigValues(values);
  };

  // Save configuration
  const handleSaveConfig = async () => {
    if (!selectedAddon) return;

    // Validate required fields
    const missingFields = selectedAddon.configFields
      .filter(f => f.required && !configValues[f.key])
      .map(f => f.label);

    if (missingFields.length > 0) {
      setError(`Please fill in required fields: ${missingFields.join(', ')}`);
      return;
    }

    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      setAddons(prev => prev.map(a => 
        a.id === selectedAddon.id 
          ? { 
              ...a, 
              isConfigured: true,
              configFields: a.configFields.map(f => ({
                ...f,
                value: configValues[f.key] || f.value
              }))
            }
          : a
      ));

      setSuccess(`${selectedAddon.name} configured successfully`);
      setSelectedAddon(null);
    } catch (err) {
      setError('Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  // Toggle addon
  const handleToggle = async (addonId: string) => {
    const addon = addons.find(a => a.id === addonId);
    if (!addon) return;

    if (!addon.isConfigured && !addon.isEnabled) {
      setError('Please configure the addon before enabling it');
      return;
    }

    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));

      setAddons(prev => prev.map(a => 
        a.id === addonId ? { ...a, isEnabled: !a.isEnabled } : a
      ));

      setSuccess(`${addon.name} ${addon.isEnabled ? 'disabled' : 'enabled'} successfully`);
    } catch (err) {
      setError('Failed to toggle addon');
    } finally {
      setLoading(false);
    }
  };

  const categoryLabels: Record<string, string> = {
    chat: 'Live Chat',
    reviews: 'Reviews',
    analytics: 'Analytics',
    security: 'Security',
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
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Addons</span>
              </div>
              <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Third-Party Integrations
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
                Configure and manage external service integrations
              </p>
            </div>
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw style={{ width: '16px', height: '16px', marginRight: '8px' }} />
              Refresh
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

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <StatCard label="Total Addons" value={stats.total} icon={Zap} />
          <StatCard label="Enabled" value={stats.enabled} icon={Check} color="green" />
          <StatCard label="Configured" value={stats.configured} icon={Settings} color="blue" />
        </div>

        {/* Filters */}
        <div style={{ 
          backgroundColor: 'var(--bg-card)', 
          border: '1px solid var(--border-default)', 
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search addons..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  style={{
                    width: '100%',
                    height: '44px',
                    paddingLeft: '40px',
                    paddingRight: '16px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '12px',
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                height: '44px',
                padding: '0 12px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-default)',
                borderRadius: '12px',
                fontSize: '14px',
                color: 'var(--text-primary)',
                minWidth: '150px'
              }}
            >
              <option value="">All Categories</option>
              <option value="chat">Live Chat</option>
              <option value="reviews">Reviews</option>
              <option value="analytics">Analytics</option>
              <option value="security">Security</option>
            </select>
          </div>
        </div>

        {/* Addons Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '20px' }} className="md:!grid-cols-2 xl:!grid-cols-3">
          {filteredAddons.map((addon) => (
            <AddonCard 
              key={addon.id} 
              addon={addon}
              onConfigure={() => handleConfigure(addon)}
              onToggle={() => handleToggle(addon.id)}
              categoryLabel={categoryLabels[addon.category]}
            />
          ))}
        </div>

        {filteredAddons.length === 0 && (
          <div style={{ 
            backgroundColor: 'var(--bg-card)', 
            border: '1px solid var(--border-default)', 
            borderRadius: '16px',
            padding: '64px',
            textAlign: 'center'
          }}>
            <Zap style={{ width: '48px', height: '48px', color: 'var(--text-muted)', margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--text-muted)' }}>No addons found</p>
          </div>
        )}
      </div>

      {/* Configuration Modal */}
      {selectedAddon && (
        <>
          <div 
            style={{ 
              position: 'fixed', 
              inset: 0, 
              backgroundColor: 'rgba(0, 0, 0, 0.6)', 
              zIndex: 50,
              backdropFilter: 'blur(4px)'
            }} 
            onClick={() => setSelectedAddon(null)}
          />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            maxWidth: '500px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: '20px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4)',
            zIndex: 51,
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            {/* Modal Header */}
            <div style={{ 
              padding: '24px', 
              borderBottom: '1px solid var(--border-default)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px', 
                backgroundColor: `${selectedAddon.color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <selectedAddon.icon style={{ width: '24px', height: '24px', color: selectedAddon.color }} />
              </div>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Configure {selectedAddon.name}
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Enter your integration credentials
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {selectedAddon.configFields.map((field) => (
                  <div key={field.key}>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: 500, 
                      color: 'var(--text-primary)',
                      marginBottom: '8px'
                    }}>
                      {field.label}
                      {field.required && <span style={{ color: 'var(--danger)', marginLeft: '4px' }}>*</span>}
                    </label>
                    {field.type === 'select' ? (
                      <select
                        value={configValues[field.key] || ''}
                        onChange={(e) => setConfigValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                        style={{
                          width: '100%',
                          height: '44px',
                          padding: '0 12px',
                          backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--border-default)',
                          borderRadius: '10px',
                          fontSize: '14px',
                          color: 'var(--text-primary)',
                          outline: 'none'
                        }}
                      >
                        {field.options?.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        value={configValues[field.key] || ''}
                        onChange={(e) => setConfigValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                        style={{
                          width: '100%',
                          height: '44px',
                          padding: '0 14px',
                          backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--border-default)',
                          borderRadius: '10px',
                          fontSize: '14px',
                          color: 'var(--text-primary)',
                          outline: 'none'
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Documentation Link */}
              <a 
                href={selectedAddon.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '20px',
                  padding: '12px 16px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: '14px'
                }}
              >
                <ExternalLink style={{ width: '16px', height: '16px' }} />
                View {selectedAddon.name} Documentation
              </a>
            </div>

            {/* Modal Footer */}
            <div style={{ 
              padding: '20px 24px', 
              borderTop: '1px solid var(--border-default)',
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <Button variant="secondary" onClick={() => setSelectedAddon(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveConfig} isLoading={loading}>
                Save Configuration
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ==================== COMPONENTS ==================== */

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  color?: 'green' | 'blue' | 'gold';
}

function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
  const colors = {
    green: { bg: 'rgba(34, 197, 94, 0.1)', text: 'var(--success)' },
    blue: { bg: 'rgba(59, 130, 246, 0.1)', text: 'var(--info)' },
    gold: { bg: 'rgba(198, 167, 94, 0.1)', text: 'var(--accent-gold)' },
  };
  const c = color ? colors[color] : { bg: 'rgba(107, 114, 128, 0.1)', text: 'var(--text-secondary)' };

  return (
    <div style={{ 
      backgroundColor: 'var(--bg-card)', 
      border: '1px solid var(--border-default)', 
      borderRadius: '16px', 
      padding: '20px' 
    }}>
      <div style={{ 
        width: '40px', 
        height: '40px', 
        borderRadius: '10px', 
        backgroundColor: c.bg, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        marginBottom: '12px'
      }}>
        <Icon style={{ width: '20px', height: '20px', color: c.text }} />
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</p>
      <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</p>
    </div>
  );
}

interface AddonCardProps {
  addon: Addon;
  onConfigure: () => void;
  onToggle: () => void;
  categoryLabel: string;
}

function AddonCard({ addon, onConfigure, onToggle, categoryLabel }: AddonCardProps) {
  const Icon = addon.icon;

  return (
    <div style={{ 
      backgroundColor: 'var(--bg-card)', 
      border: '1px solid var(--border-default)', 
      borderRadius: '16px',
      overflow: 'hidden',
      transition: 'border-color 0.2s'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '20px',
        borderBottom: '1px solid var(--border-default)'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ 
              width: '52px', 
              height: '52px', 
              borderRadius: '14px', 
              backgroundColor: `${addon.color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Icon style={{ width: '26px', height: '26px', color: addon.color }} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                {addon.name}
              </h3>
              <span style={{ 
                padding: '3px 8px', 
                borderRadius: '6px', 
                fontSize: '11px', 
                fontWeight: 500,
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-muted)',
                textTransform: 'capitalize'
              }}>
                {categoryLabel}
              </span>
            </div>
          </div>
          
          {/* Status Badges */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
            {addon.isEnabled ? (
              <span style={{ 
                padding: '4px 10px', 
                borderRadius: '6px', 
                fontSize: '11px', 
                fontWeight: 600,
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Check style={{ width: '12px', height: '12px' }} />
                Active
              </span>
            ) : (
              <span style={{ 
                padding: '4px 10px', 
                borderRadius: '6px', 
                fontSize: '11px', 
                fontWeight: 600,
                backgroundColor: 'rgba(107, 114, 128, 0.1)',
                color: 'var(--text-muted)'
              }}>
                Inactive
              </span>
            )}
            {!addon.isConfigured && (
              <span style={{ 
                padding: '4px 10px', 
                borderRadius: '6px', 
                fontSize: '11px', 
                fontWeight: 600,
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                color: 'var(--warning)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <AlertCircle style={{ width: '12px', height: '12px' }} />
                Not Configured
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '20px' }}>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
          {addon.description}
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={onConfigure}
            style={{ flex: 1 }}
          >
            <Settings style={{ width: '14px', height: '14px', marginRight: '6px' }} />
            Configure
          </Button>
          <Button 
            variant={addon.isEnabled ? 'danger' : 'primary'} 
            size="sm" 
            onClick={onToggle}
            disabled={!addon.isConfigured && !addon.isEnabled}
            style={{ flex: 1 }}
          >
            {addon.isEnabled ? (
              <>
                <X style={{ width: '14px', height: '14px', marginRight: '6px' }} />
                Disable
              </>
            ) : (
              <>
                <Check style={{ width: '14px', height: '14px', marginRight: '6px' }} />
                Enable
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

