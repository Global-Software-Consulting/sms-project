'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CreditCard, 
  Save,
  RefreshCw,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  DollarSign,
  Percent,
  ArrowUpDown
} from 'lucide-react';
import { Button, Alert } from '@/components/ui';
import { getGatewayInfo, type PaymentGateway } from '@/lib/api';

interface GatewayConfig {
  gateway: PaymentGateway;
  enabled: boolean;
  displayName: string;
  minAmount: number;
  maxAmount: number;
  fixedFee: number;
  percentageFee: number;
  passFeesToUser: boolean;
  priority: number;
  currencies: string[];
  apiKey: string;
  apiSecret: string;
  merchantId: string;
  webhookSecret: string;
  testMode: boolean;
}

const defaultGateways: GatewayConfig[] = [
  {
    gateway: 'STRIPE',
    enabled: true,
    displayName: 'Stripe',
    minAmount: 3,
    maxAmount: 100000,
    fixedFee: 0.30,
    percentageFee: 2.9,
    passFeesToUser: false,
    priority: 1,
    currencies: ['USD', 'EUR', 'GBP'],
    apiKey: '',
    apiSecret: '',
    merchantId: '',
    webhookSecret: '',
    testMode: false,
  },
  {
    gateway: 'PAYGATE',
    enabled: false,
    displayName: 'PayGate.to',
    minAmount: 5,
    maxAmount: 50000,
    fixedFee: 0,
    percentageFee: 3.5,
    passFeesToUser: false,
    priority: 2,
    currencies: ['USD'],
    apiKey: '',
    apiSecret: '',
    merchantId: '',
    webhookSecret: '',
    testMode: false,
  },
  {
    gateway: 'PLISIO',
    enabled: false,
    displayName: 'Plisio (Crypto)',
    minAmount: 10,
    maxAmount: 100000,
    fixedFee: 0,
    percentageFee: 0.5,
    passFeesToUser: true,
    priority: 3,
    currencies: ['USD', 'BTC', 'ETH', 'LTC'],
    apiKey: '',
    apiSecret: '',
    merchantId: '',
    webhookSecret: '',
    testMode: false,
  },
  {
    gateway: 'CRYPTOMUS',
    enabled: false,
    displayName: 'Cryptomus',
    minAmount: 10,
    maxAmount: 100000,
    fixedFee: 0,
    percentageFee: 0.4,
    passFeesToUser: true,
    priority: 4,
    currencies: ['USD', 'BTC', 'ETH', 'USDT'],
    apiKey: '',
    apiSecret: '',
    merchantId: '',
    webhookSecret: '',
    testMode: false,
  },
  {
    gateway: 'NOWPAYMENTS',
    enabled: false,
    displayName: 'NOWPayments',
    minAmount: 5,
    maxAmount: 100000,
    fixedFee: 0,
    percentageFee: 0.5,
    passFeesToUser: true,
    priority: 5,
    currencies: ['USD', 'BTC', 'ETH', 'USDT', 'LTC'],
    apiKey: '',
    apiSecret: '',
    merchantId: '',
    webhookSecret: '',
    testMode: false,
  },
  {
    gateway: 'VOLET',
    enabled: false,
    displayName: 'Volet',
    minAmount: 10,
    maxAmount: 50000,
    fixedFee: 0.25,
    percentageFee: 2.5,
    passFeesToUser: false,
    priority: 6,
    currencies: ['USD', 'EUR'],
    apiKey: '',
    apiSecret: '',
    merchantId: '',
    webhookSecret: '',
    testMode: false,
  },
  {
    gateway: 'BINANCE',
    enabled: false,
    displayName: 'Binance Pay',
    minAmount: 10,
    maxAmount: 100000,
    fixedFee: 0,
    percentageFee: 0,
    passFeesToUser: false,
    priority: 7,
    currencies: ['USD', 'USDT', 'BTC'],
    apiKey: '',
    apiSecret: '',
    merchantId: '',
    webhookSecret: '',
    testMode: false,
  },
];

/**
 * Admin Gateway Configuration Page
 * 
 * Features:
 * - Enable/disable payment gateways
 * - Configure fees per gateway
 * - Set min/max amounts
 * - API credentials management
 * - Priority ordering
 */
export default function AdminGatewayConfigPage() {
  const [gateways, setGateways] = useState<GatewayConfig[]>(defaultGateways);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  // Handle save
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Gateway configuration saved successfully');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  // Update gateway config
  const updateGateway = (gateway: PaymentGateway, updates: Partial<GatewayConfig>) => {
    setGateways(prev => prev.map(g => 
      g.gateway === gateway ? { ...g, ...updates } : g
    ));
  };

  // Toggle secret visibility
  const toggleSecret = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Get selected gateway config
  const selectedConfig = gateways.find(g => g.gateway === selectedGateway);

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
                <Link href="/admin/settings" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>
                  Settings
                </Link>
                <span style={{ color: 'var(--text-muted)' }}>/</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Payment Gateways</span>
              </div>
              <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Payment Gateway Configuration
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }} className="lg:!grid-cols-3">
          {/* Gateway List */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ 
              backgroundColor: 'var(--bg-card)', 
              border: '1px solid var(--border-default)', 
              borderRadius: '16px',
              overflow: 'hidden'
            }}>
              <div style={{ padding: '20px', borderBottom: '1px solid var(--border-default)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Payment Gateways
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Click to configure
                </p>
              </div>
              <div>
                {gateways.map((gateway) => {
                  const info = getGatewayInfo(gateway.gateway);
                  return (
                    <button
                      key={gateway.gateway}
                      onClick={() => setSelectedGateway(gateway.gateway)}
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        borderBottom: '1px solid var(--border-default)',
                        backgroundColor: selectedGateway === gateway.gateway ? 'rgba(198, 167, 94, 0.05)' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'background-color 0.15s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '24px' }}>{info.icon}</span>
                        <div style={{ textAlign: 'left' }}>
                          <p style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '14px' }}>
                            {gateway.displayName}
                          </p>
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            Priority: {gateway.priority}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {gateway.enabled ? (
                          <CheckCircle style={{ width: '18px', height: '18px', color: 'var(--success)' }} />
                        ) : (
                          <XCircle style={{ width: '18px', height: '18px', color: 'var(--text-muted)' }} />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Gateway Config */}
          <div style={{ gridColumn: 'span 1' }} className="lg:!col-span-2">
            {selectedConfig ? (
              <div style={{ 
                backgroundColor: 'var(--bg-card)', 
                border: '1px solid var(--border-default)', 
                borderRadius: '16px',
                padding: '24px'
              }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '32px' }}>{getGatewayInfo(selectedConfig.gateway).icon}</span>
                    <div>
                      <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {selectedConfig.displayName}
                      </h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        {selectedConfig.gateway}
                      </p>
                    </div>
                  </div>
                  <ToggleSwitch
                    checked={selectedConfig.enabled}
                    onChange={(v) => updateGateway(selectedConfig.gateway, { enabled: v })}
                    label={selectedConfig.enabled ? 'Enabled' : 'Disabled'}
                  />
                </div>

                {/* Basic Settings */}
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase' }}>
                    Basic Settings
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <FormField
                      label="Display Name"
                      value={selectedConfig.displayName}
                      onChange={(v) => updateGateway(selectedConfig.gateway, { displayName: v })}
                    />
                    <FormField
                      label="Priority"
                      value={String(selectedConfig.priority)}
                      onChange={(v) => updateGateway(selectedConfig.gateway, { priority: parseInt(v) || 1 })}
                      type="number"
                      icon={<ArrowUpDown style={{ width: '14px', height: '14px' }} />}
                    />
                    <FormField
                      label="Min Amount ($)"
                      value={String(selectedConfig.minAmount)}
                      onChange={(v) => updateGateway(selectedConfig.gateway, { minAmount: parseFloat(v) || 0 })}
                      type="number"
                      icon={<DollarSign style={{ width: '14px', height: '14px' }} />}
                    />
                    <FormField
                      label="Max Amount ($)"
                      value={String(selectedConfig.maxAmount)}
                      onChange={(v) => updateGateway(selectedConfig.gateway, { maxAmount: parseFloat(v) || 0 })}
                      type="number"
                      icon={<DollarSign style={{ width: '14px', height: '14px' }} />}
                    />
                  </div>
                </div>

                {/* Fee Settings */}
                <div style={{ marginBottom: '24px', paddingTop: '24px', borderTop: '1px solid var(--border-default)' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase' }}>
                    Fee Configuration
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <FormField
                      label="Fixed Fee ($)"
                      value={String(selectedConfig.fixedFee)}
                      onChange={(v) => updateGateway(selectedConfig.gateway, { fixedFee: parseFloat(v) || 0 })}
                      type="number"
                      step="0.01"
                      icon={<DollarSign style={{ width: '14px', height: '14px' }} />}
                    />
                    <FormField
                      label="Percentage Fee (%)"
                      value={String(selectedConfig.percentageFee)}
                      onChange={(v) => updateGateway(selectedConfig.gateway, { percentageFee: parseFloat(v) || 0 })}
                      type="number"
                      step="0.1"
                      icon={<Percent style={{ width: '14px', height: '14px' }} />}
                    />
                  </div>
                  <div style={{ marginTop: '16px' }}>
                    <ToggleField
                      label="Pass Fees to User"
                      description="Add fees to the payment amount instead of absorbing them"
                      checked={selectedConfig.passFeesToUser}
                      onChange={(v) => updateGateway(selectedConfig.gateway, { passFeesToUser: v })}
                    />
                  </div>
                  <div style={{ 
                    marginTop: '16px', 
                    padding: '12px', 
                    backgroundColor: 'var(--bg-secondary)', 
                    borderRadius: '8px' 
                  }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      Example: $100 payment → Fee: ${(selectedConfig.fixedFee + (100 * selectedConfig.percentageFee / 100)).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* API Credentials */}
                <div style={{ marginBottom: '24px', paddingTop: '24px', borderTop: '1px solid var(--border-default)' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase' }}>
                    API Credentials
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                    <FormField
                      label="API Key"
                      value={selectedConfig.apiKey}
                      onChange={(v) => updateGateway(selectedConfig.gateway, { apiKey: v })}
                      type={showSecrets[`${selectedConfig.gateway}-apiKey`] ? 'text' : 'password'}
                      placeholder="Enter API key"
                      suffix={
                        <button 
                          onClick={() => toggleSecret(`${selectedConfig.gateway}-apiKey`)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                        >
                          {showSecrets[`${selectedConfig.gateway}-apiKey`] ? (
                            <EyeOff style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
                          ) : (
                            <Eye style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
                          )}
                        </button>
                      }
                    />
                    <FormField
                      label="API Secret"
                      value={selectedConfig.apiSecret}
                      onChange={(v) => updateGateway(selectedConfig.gateway, { apiSecret: v })}
                      type={showSecrets[`${selectedConfig.gateway}-apiSecret`] ? 'text' : 'password'}
                      placeholder="Enter API secret"
                      suffix={
                        <button 
                          onClick={() => toggleSecret(`${selectedConfig.gateway}-apiSecret`)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                        >
                          {showSecrets[`${selectedConfig.gateway}-apiSecret`] ? (
                            <EyeOff style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
                          ) : (
                            <Eye style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
                          )}
                        </button>
                      }
                    />
                    {(selectedConfig.gateway === 'CRYPTOMUS' || selectedConfig.gateway === 'VOLET') && (
                      <FormField
                        label="Merchant ID"
                        value={selectedConfig.merchantId}
                        onChange={(v) => updateGateway(selectedConfig.gateway, { merchantId: v })}
                        placeholder="Enter merchant ID"
                      />
                    )}
                    <FormField
                      label="Webhook Secret"
                      value={selectedConfig.webhookSecret}
                      onChange={(v) => updateGateway(selectedConfig.gateway, { webhookSecret: v })}
                      type={showSecrets[`${selectedConfig.gateway}-webhookSecret`] ? 'text' : 'password'}
                      placeholder="Enter webhook secret"
                      suffix={
                        <button 
                          onClick={() => toggleSecret(`${selectedConfig.gateway}-webhookSecret`)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                        >
                          {showSecrets[`${selectedConfig.gateway}-webhookSecret`] ? (
                            <EyeOff style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
                          ) : (
                            <Eye style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
                          )}
                        </button>
                      }
                    />
                  </div>
                </div>

                {/* Test Mode */}
                <div style={{ paddingTop: '24px', borderTop: '1px solid var(--border-default)' }}>
                  <ToggleField
                    label="Test Mode"
                    description="Use sandbox/test environment for this gateway"
                    checked={selectedConfig.testMode}
                    onChange={(v) => updateGateway(selectedConfig.gateway, { testMode: v })}
                  />
                  {selectedConfig.testMode && (
                    <div style={{ 
                      marginTop: '12px', 
                      padding: '12px', 
                      backgroundColor: 'rgba(245, 158, 11, 0.1)', 
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <AlertTriangle style={{ width: '16px', height: '16px', color: 'var(--warning)' }} />
                      <p style={{ fontSize: '13px', color: 'var(--warning)' }}>
                        Test mode is enabled. No real payments will be processed.
                      </p>
                    </div>
                  )}
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
                <CreditCard style={{ width: '48px', height: '48px', color: 'var(--text-muted)', margin: '0 auto 16px' }} />
                <p style={{ color: 'var(--text-muted)' }}>Select a gateway to configure</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==================== COMPONENTS ==================== */

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
  step?: string;
}

function FormField({ label, value, onChange, type = 'text', placeholder, icon, suffix, step }: FormFieldProps) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        {icon && (
          <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          step={step}
          style={{
            width: '100%',
            height: '44px',
            padding: icon ? '0 40px 0 36px' : suffix ? '0 40px 0 12px' : '0 12px',
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

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}

function ToggleSwitch({ checked, onChange, label }: ToggleSwitchProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <span style={{ 
        fontSize: '13px', 
        fontWeight: 500, 
        color: checked ? 'var(--success)' : 'var(--text-muted)' 
      }}>
        {label}
      </span>
      <button
        onClick={() => onChange(!checked)}
        style={{
          width: '48px',
          height: '26px',
          borderRadius: '13px',
          border: 'none',
          backgroundColor: checked ? 'var(--success)' : 'var(--bg-secondary)',
          cursor: 'pointer',
          position: 'relative',
          transition: 'background-color 0.2s'
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

