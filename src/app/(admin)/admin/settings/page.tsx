'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Settings, 
  Save,
  RefreshCw,
  Mail,
  Lock,
  Globe,
  Bell,
  Shield,
  Palette,
  Server,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button, Alert } from '@/components/ui';

/**
 * Admin Settings Page
 * 
 * Features:
 * - General settings (site name, URL, timezone)
 * - SMTP configuration
 * - Login methods (email, Google, Discord)
 * - Security settings
 * - Notification settings
 */
export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'smtp' | 'auth' | 'security' | 'notifications'>('general');
  
  // Show password fields
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);

  // General settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'SMS Sort',
    siteUrl: 'https://smssort.com',
    supportEmail: 'support@smssort.com',
    timezone: 'UTC',
    maintenanceMode: false,
    registrationEnabled: true,
  });

  // SMTP settings
  const [smtpSettings, setSmtpSettings] = useState({
    host: '',
    port: '587',
    username: '',
    password: '',
    fromEmail: '',
    fromName: 'SMS Sort',
    encryption: 'tls',
    enabled: false,
  });

  // Auth settings
  const [authSettings, setAuthSettings] = useState({
    emailLoginEnabled: true,
    googleLoginEnabled: false,
    googleClientId: '',
    googleClientSecret: '',
    discordLoginEnabled: false,
    discordClientId: '',
    discordClientSecret: '',
    requireEmailVerification: true,
    sessionDurationHours: 24,
  });

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    maxLoginAttempts: 5,
    lockoutDurationMinutes: 15,
    passwordMinLength: 8,
    requireStrongPassword: true,
    twoFactorEnabled: false,
    ipWhitelistEnabled: false,
    ipWhitelist: '',
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailOnNewUser: true,
    emailOnPayment: true,
    emailOnRefund: true,
    emailOnHighAbuseScore: true,
    slackWebhookUrl: '',
    slackEnabled: false,
  });

  // Handle save
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Settings saved successfully');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  // Test SMTP
  const handleTestSmtp = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess('Test email sent successfully');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to send test email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: 'var(--bg-card)', 
        borderBottom: '1px solid var(--border-default)',
        padding: '24px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <Link href="/admin" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>
                  Admin
                </Link>
                <span style={{ color: 'var(--text-muted)' }}>/</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Settings</span>
              </div>
              <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>
                System Settings
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
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }} className="lg:!grid-cols-4">
          {/* Sidebar */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ 
              backgroundColor: 'var(--bg-card)', 
              border: '1px solid var(--border-default)', 
              borderRadius: '16px',
              padding: '16px'
            }}>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <NavItem 
                  icon={Globe} 
                  label="General" 
                  active={activeTab === 'general'} 
                  onClick={() => setActiveTab('general')} 
                />
                <NavItem 
                  icon={Mail} 
                  label="SMTP / Email" 
                  active={activeTab === 'smtp'} 
                  onClick={() => setActiveTab('smtp')} 
                />
                <NavItem 
                  icon={Lock} 
                  label="Authentication" 
                  active={activeTab === 'auth'} 
                  onClick={() => setActiveTab('auth')} 
                />
                <NavItem 
                  icon={Shield} 
                  label="Security" 
                  active={activeTab === 'security'} 
                  onClick={() => setActiveTab('security')} 
                />
                <NavItem 
                  icon={Bell} 
                  label="Notifications" 
                  active={activeTab === 'notifications'} 
                  onClick={() => setActiveTab('notifications')} 
                />
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div style={{ gridColumn: 'span 1' }} className="lg:!col-span-3">
            {/* General Settings */}
            {activeTab === 'general' && (
              <SettingsCard title="General Settings" icon={Globe}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }} className="sm:!grid-cols-2">
                  <FormField 
                    label="Site Name" 
                    value={generalSettings.siteName}
                    onChange={(v) => setGeneralSettings(prev => ({ ...prev, siteName: v }))}
                  />
                  <FormField 
                    label="Site URL" 
                    value={generalSettings.siteUrl}
                    onChange={(v) => setGeneralSettings(prev => ({ ...prev, siteUrl: v }))}
                  />
                  <FormField 
                    label="Support Email" 
                    value={generalSettings.supportEmail}
                    onChange={(v) => setGeneralSettings(prev => ({ ...prev, supportEmail: v }))}
                    type="email"
                  />
                  <FormField 
                    label="Timezone" 
                    value={generalSettings.timezone}
                    onChange={(v) => setGeneralSettings(prev => ({ ...prev, timezone: v }))}
                    type="select"
                    options={[
                      { value: 'UTC', label: 'UTC' },
                      { value: 'America/New_York', label: 'Eastern Time' },
                      { value: 'America/Los_Angeles', label: 'Pacific Time' },
                      { value: 'Europe/London', label: 'London' },
                    ]}
                  />
                </div>
                <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border-default)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <ToggleField 
                      label="Maintenance Mode"
                      description="Disable access to the site for non-admin users"
                      checked={generalSettings.maintenanceMode}
                      onChange={(v) => setGeneralSettings(prev => ({ ...prev, maintenanceMode: v }))}
                    />
                    <ToggleField 
                      label="User Registration"
                      description="Allow new users to register"
                      checked={generalSettings.registrationEnabled}
                      onChange={(v) => setGeneralSettings(prev => ({ ...prev, registrationEnabled: v }))}
                    />
                  </div>
                </div>
              </SettingsCard>
            )}

            {/* SMTP Settings */}
            {activeTab === 'smtp' && (
              <SettingsCard title="SMTP / Email Settings" icon={Mail}>
                <ToggleField 
                  label="Enable SMTP"
                  description="Use custom SMTP server for sending emails"
                  checked={smtpSettings.enabled}
                  onChange={(v) => setSmtpSettings(prev => ({ ...prev, enabled: v }))}
                />
                
                {smtpSettings.enabled && (
                  <div style={{ marginTop: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }} className="sm:!grid-cols-2">
                      <FormField 
                        label="SMTP Host" 
                        value={smtpSettings.host}
                        onChange={(v) => setSmtpSettings(prev => ({ ...prev, host: v }))}
                        placeholder="smtp.example.com"
                      />
                      <FormField 
                        label="SMTP Port" 
                        value={smtpSettings.port}
                        onChange={(v) => setSmtpSettings(prev => ({ ...prev, port: v }))}
                        placeholder="587"
                      />
                      <FormField 
                        label="Username" 
                        value={smtpSettings.username}
                        onChange={(v) => setSmtpSettings(prev => ({ ...prev, username: v }))}
                      />
                      <FormField 
                        label="Password" 
                        value={smtpSettings.password}
                        onChange={(v) => setSmtpSettings(prev => ({ ...prev, password: v }))}
                        type={showSmtpPassword ? 'text' : 'password'}
                        suffix={
                          <button 
                            onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                          >
                            {showSmtpPassword ? (
                              <EyeOff style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
                            ) : (
                              <Eye style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
                            )}
                          </button>
                        }
                      />
                      <FormField 
                        label="From Email" 
                        value={smtpSettings.fromEmail}
                        onChange={(v) => setSmtpSettings(prev => ({ ...prev, fromEmail: v }))}
                        placeholder="noreply@example.com"
                      />
                      <FormField 
                        label="From Name" 
                        value={smtpSettings.fromName}
                        onChange={(v) => setSmtpSettings(prev => ({ ...prev, fromName: v }))}
                      />
                      <FormField 
                        label="Encryption" 
                        value={smtpSettings.encryption}
                        onChange={(v) => setSmtpSettings(prev => ({ ...prev, encryption: v }))}
                        type="select"
                        options={[
                          { value: 'tls', label: 'TLS' },
                          { value: 'ssl', label: 'SSL' },
                          { value: 'none', label: 'None' },
                        ]}
                      />
                    </div>
                    <div style={{ marginTop: '20px' }}>
                      <Button variant="outline" onClick={handleTestSmtp} isLoading={loading}>
                        <Mail style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                        Send Test Email
                      </Button>
                    </div>
                  </div>
                )}
              </SettingsCard>
            )}

            {/* Auth Settings */}
            {activeTab === 'auth' && (
              <SettingsCard title="Authentication Settings" icon={Lock}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* Email Login */}
                  <div style={{ padding: '20px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px' }}>
                    <ToggleField 
                      label="Email/Password Login"
                      description="Allow users to login with email and password"
                      checked={authSettings.emailLoginEnabled}
                      onChange={(v) => setAuthSettings(prev => ({ ...prev, emailLoginEnabled: v }))}
                    />
                  </div>

                  {/* Google Login */}
                  <div style={{ padding: '20px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px' }}>
                    <ToggleField 
                      label="Google Login"
                      description="Allow users to login with Google"
                      checked={authSettings.googleLoginEnabled}
                      onChange={(v) => setAuthSettings(prev => ({ ...prev, googleLoginEnabled: v }))}
                    />
                    {authSettings.googleLoginEnabled && (
                      <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }} className="sm:!grid-cols-2">
                        <FormField 
                          label="Client ID" 
                          value={authSettings.googleClientId}
                          onChange={(v) => setAuthSettings(prev => ({ ...prev, googleClientId: v }))}
                          placeholder="xxx.apps.googleusercontent.com"
                        />
                        <FormField 
                          label="Client Secret" 
                          value={authSettings.googleClientSecret}
                          onChange={(v) => setAuthSettings(prev => ({ ...prev, googleClientSecret: v }))}
                          type="password"
                        />
                      </div>
                    )}
                  </div>

                  {/* Discord Login */}
                  <div style={{ padding: '20px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px' }}>
                    <ToggleField 
                      label="Discord Login"
                      description="Allow users to login with Discord"
                      checked={authSettings.discordLoginEnabled}
                      onChange={(v) => setAuthSettings(prev => ({ ...prev, discordLoginEnabled: v }))}
                    />
                    {authSettings.discordLoginEnabled && (
                      <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }} className="sm:!grid-cols-2">
                        <FormField 
                          label="Client ID" 
                          value={authSettings.discordClientId}
                          onChange={(v) => setAuthSettings(prev => ({ ...prev, discordClientId: v }))}
                        />
                        <FormField 
                          label="Client Secret" 
                          value={authSettings.discordClientSecret}
                          onChange={(v) => setAuthSettings(prev => ({ ...prev, discordClientSecret: v }))}
                          type="password"
                        />
                      </div>
                    )}
                  </div>

                  {/* Other Auth Settings */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }} className="sm:!grid-cols-2">
                    <ToggleField 
                      label="Require Email Verification"
                      description="Users must verify email before accessing features"
                      checked={authSettings.requireEmailVerification}
                      onChange={(v) => setAuthSettings(prev => ({ ...prev, requireEmailVerification: v }))}
                    />
                    <FormField 
                      label="Session Duration (hours)" 
                      value={String(authSettings.sessionDurationHours)}
                      onChange={(v) => setAuthSettings(prev => ({ ...prev, sessionDurationHours: parseInt(v) || 24 }))}
                      type="number"
                    />
                  </div>
                </div>
              </SettingsCard>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <SettingsCard title="Security Settings" icon={Shield}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }} className="sm:!grid-cols-2">
                  <FormField 
                    label="Max Login Attempts" 
                    value={String(securitySettings.maxLoginAttempts)}
                    onChange={(v) => setSecuritySettings(prev => ({ ...prev, maxLoginAttempts: parseInt(v) || 5 }))}
                    type="number"
                  />
                  <FormField 
                    label="Lockout Duration (minutes)" 
                    value={String(securitySettings.lockoutDurationMinutes)}
                    onChange={(v) => setSecuritySettings(prev => ({ ...prev, lockoutDurationMinutes: parseInt(v) || 15 }))}
                    type="number"
                  />
                  <FormField 
                    label="Min Password Length" 
                    value={String(securitySettings.passwordMinLength)}
                    onChange={(v) => setSecuritySettings(prev => ({ ...prev, passwordMinLength: parseInt(v) || 8 }))}
                    type="number"
                  />
                </div>
                <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border-default)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <ToggleField 
                      label="Require Strong Password"
                      description="Passwords must contain uppercase, lowercase, number, and special character"
                      checked={securitySettings.requireStrongPassword}
                      onChange={(v) => setSecuritySettings(prev => ({ ...prev, requireStrongPassword: v }))}
                    />
                    <ToggleField 
                      label="Two-Factor Authentication"
                      description="Allow users to enable 2FA for their accounts"
                      checked={securitySettings.twoFactorEnabled}
                      onChange={(v) => setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: v }))}
                    />
                    <ToggleField 
                      label="IP Whitelist for Admin"
                      description="Only allow admin access from specific IPs"
                      checked={securitySettings.ipWhitelistEnabled}
                      onChange={(v) => setSecuritySettings(prev => ({ ...prev, ipWhitelistEnabled: v }))}
                    />
                    {securitySettings.ipWhitelistEnabled && (
                      <FormField 
                        label="Whitelisted IPs (comma separated)" 
                        value={securitySettings.ipWhitelist}
                        onChange={(v) => setSecuritySettings(prev => ({ ...prev, ipWhitelist: v }))}
                        placeholder="192.168.1.1, 10.0.0.1"
                      />
                    )}
                  </div>
                </div>
              </SettingsCard>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <SettingsCard title="Notification Settings" icon={Bell}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
                  Email Notifications
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <ToggleField 
                    label="New User Registration"
                    description="Send email when a new user registers"
                    checked={notificationSettings.emailOnNewUser}
                    onChange={(v) => setNotificationSettings(prev => ({ ...prev, emailOnNewUser: v }))}
                  />
                  <ToggleField 
                    label="Payment Received"
                    description="Send email when a payment is completed"
                    checked={notificationSettings.emailOnPayment}
                    onChange={(v) => setNotificationSettings(prev => ({ ...prev, emailOnPayment: v }))}
                  />
                  <ToggleField 
                    label="Refund Processed"
                    description="Send email when a refund is processed"
                    checked={notificationSettings.emailOnRefund}
                    onChange={(v) => setNotificationSettings(prev => ({ ...prev, emailOnRefund: v }))}
                  />
                  <ToggleField 
                    label="High Abuse Score Alert"
                    description="Send email when a user reaches high abuse score"
                    checked={notificationSettings.emailOnHighAbuseScore}
                    onChange={(v) => setNotificationSettings(prev => ({ ...prev, emailOnHighAbuseScore: v }))}
                  />
                </div>

                <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border-default)' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
                    Slack Integration
                  </h4>
                  <ToggleField 
                    label="Enable Slack Notifications"
                    description="Send notifications to a Slack channel"
                    checked={notificationSettings.slackEnabled}
                    onChange={(v) => setNotificationSettings(prev => ({ ...prev, slackEnabled: v }))}
                  />
                  {notificationSettings.slackEnabled && (
                    <div style={{ marginTop: '16px' }}>
                      <FormField 
                        label="Slack Webhook URL" 
                        value={notificationSettings.slackWebhookUrl}
                        onChange={(v) => setNotificationSettings(prev => ({ ...prev, slackWebhookUrl: v }))}
                        placeholder="https://hooks.slack.com/services/..."
                      />
                    </div>
                  )}
                </div>
              </SettingsCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==================== COMPONENTS ==================== */

interface NavItemProps {
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  label: string;
  active: boolean;
  onClick: () => void;
}

function NavItem({ icon: Icon, label, active, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 16px',
        borderRadius: '10px',
        border: 'none',
        backgroundColor: active ? 'rgba(198, 167, 94, 0.1)' : 'transparent',
        color: active ? 'var(--accent-gold)' : 'var(--text-secondary)',
        fontWeight: 500,
        fontSize: '14px',
        cursor: 'pointer',
        transition: 'all 0.15s',
        width: '100%',
        textAlign: 'left'
      }}
    >
      <Icon style={{ width: '18px', height: '18px' }} />
      {label}
    </button>
  );
}

interface SettingsCardProps {
  title: string;
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  children: React.ReactNode;
}

function SettingsCard({ title, icon: Icon, children }: SettingsCardProps) {
  return (
    <div style={{ 
      backgroundColor: 'var(--bg-card)', 
      border: '1px solid var(--border-default)', 
      borderRadius: '16px',
      padding: '24px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          borderRadius: '10px', 
          backgroundColor: 'rgba(198, 167, 94, 0.1)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center'
        }}>
          <Icon style={{ width: '20px', height: '20px', color: 'var(--accent-gold)' }} />
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'number' | 'select';
  placeholder?: string;
  options?: { value: string; label: string }[];
  suffix?: React.ReactNode;
}

function FormField({ label, value, onChange, type = 'text', placeholder, options, suffix }: FormFieldProps) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
        {label}
      </label>
      {type === 'select' ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
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
        >
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : (
        <div style={{ position: 'relative' }}>
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            style={{
              width: '100%',
              height: '44px',
              padding: suffix ? '0 40px 0 12px' : '0 12px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-default)',
              borderRadius: '8px',
              fontSize: '14px',
              color: 'var(--text-primary)'
            }}
          />
          {suffix && (
            <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
              {suffix}
            </div>
          )}
        </div>
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
          backgroundColor: checked ? 'var(--accent-gold)' : 'var(--bg-secondary)',
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

