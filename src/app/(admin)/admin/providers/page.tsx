'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Server,
  RefreshCw,
  Settings,
  Power,
  PowerOff,
  TrendingUp,
  DollarSign,
  Activity,
  AlertCircle,
  Check,
  X,
  Loader2,
  ChevronRight,
  Home,
  Users,
  Wallet,
  Crown,
  Key,
  Shield,
  ChevronDown,
  LogOut,
  Smartphone
} from 'lucide-react';
import { Button, Alert } from '@/components/ui';
import { useAuth } from '@/hooks';
import {
  adminGetProviders,
  adminUpdateProvider,
  adminSyncProvider,
  adminGetStatistics,
  SmsProvider,
  formatPrice,
} from '@/lib/api';

// Actual statistics type returned by backend
interface ActualStatistics {
  orders: {
    total: number;
    completed: number;
    cancelled: number;
    today: number;
  };
  rentals: { total: number };
  revenue: string;
  activeProviders: number;
}

export default function AdminProvidersPage() {
  const { user, logout } = useAuth();
  
  const [providers, setProviders] = useState<SmsProvider[]>([]);
  const [statistics, setStatistics] = useState<ActualStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ displayName: string; markup: number; priority: number }>({ displayName: '', markup: 0, priority: 0 });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [providersRes, statsRes] = await Promise.all([
        adminGetProviders(),
        adminGetStatistics().catch(() => null), // Statistics are optional
      ]);
      setProviders(providersRes.providers || []);
      setStatistics(statsRes as ActualStatistics | null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load providers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async (providerId: string) => {
    setSyncingId(providerId);
    setError(null);
    try {
      const res = await adminSyncProvider(providerId);
      // API returns { message, services, countries, products }
      setSuccess(`Sync complete: ${res.services || 0} services, ${res.countries || 0} countries, ${res.products || 0} products updated`);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Sync failed');
    } finally {
      setSyncingId(null);
    }
  };

  const handleToggleActive = async (provider: SmsProvider) => {
    setTogglingId(provider.id);
    try {
      await adminUpdateProvider(provider.id, { isActive: !provider.isActive });
      setProviders(providers.map(p => 
        p.id === provider.id ? { ...p, isActive: !p.isActive } : p
      ));
      setSuccess(`${provider.displayName} ${provider.isActive ? 'disabled' : 'enabled'}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update provider');
    } finally {
      setTogglingId(null);
    }
  };

  const handleStartEdit = (provider: SmsProvider) => {
    setEditingId(provider.id);
    setEditForm({
      displayName: provider.displayName,
      markup: provider.markup || 0,
      priority: provider.priority,
    });
  };

  const handleSaveEdit = async (providerId: string) => {
    try {
      await adminUpdateProvider(providerId, editForm);
      setProviders(providers.map(p => 
        p.id === providerId ? { ...p, ...editForm } : p
      ));
      setEditingId(null);
      setSuccess('Provider settings updated');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update provider');
    }
  };

  // Provider stats are not available in current backend response
  // Return default values for now
  const getProviderStats = (_providerId: string) => {
    return { totalOrders: 0, successRate: 0, revenue: '0' };
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 style={{ width: '48px', height: '48px', color: 'var(--accent-gold)', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-muted)' }}>Loading providers...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: 'var(--bg-card)', 
        borderBottom: '1px solid var(--border-default)',
        padding: '16px 24px'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
              <Link href="/admin" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '10px', 
                  background: 'linear-gradient(135deg, var(--accent-gold) 0%, #D4AF37 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--bg-primary)' }}>S</span>
                </div>
                <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  SMS<span style={{ color: 'var(--accent-gold)' }}>Pro</span>
                </span>
              </Link>
              
              <nav style={{ display: 'flex', gap: '8px' }} className="hidden sm:!flex">
                <NavLink href="/admin" icon={Home} label="Home" />
                <NavLink href="/admin/providers" icon={Server} label="Providers" active />
                <NavLink href="/admin/services" icon={Smartphone} label="Services" />
                <NavLink href="/admin/sms-orders" icon={Activity} label="Orders" />
                <NavLink href="/admin/users" icon={Users} label="Users" />
              </nav>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Button variant="secondary" onClick={loadData} size="sm">
                <RefreshCw style={{ width: '14px', height: '14px', marginRight: '6px' }} />
                Refresh
              </Button>
              
              {/* User Menu */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '10px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--accent-gold) 0%, #D4AF37 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--bg-primary)' }}>
                      {user?.firstName?.[0] || 'A'}
                    </span>
                  </div>
                  <ChevronDown style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
                </button>

                {showUserMenu && (
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setShowUserMenu(false)} />
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '8px',
                      width: '200px',
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-default)',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                      overflow: 'hidden',
                      zIndex: 50
                    }}>
                      <div style={{ padding: '8px' }}>
                        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', textDecoration: 'none', color: 'var(--text-secondary)' }}>
                          <Home style={{ width: '16px', height: '16px' }} />
                          <span style={{ fontSize: '14px' }}>User Dashboard</span>
                        </Link>
                      </div>
                      <div style={{ padding: '8px', borderTop: '1px solid var(--border-default)' }}>
                        <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 12px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', color: 'var(--danger)', cursor: 'pointer', fontSize: '14px' }}>
                          <LogOut style={{ width: '16px', height: '16px' }} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page Title */}
      <div style={{ backgroundColor: 'var(--bg-primary)', padding: '24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            SMS Providers
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Manage SMS provider integrations, sync catalogs, and configure pricing
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px 24px' }}>
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

        {/* Overview Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }} className="lg:!grid-cols-4">
          <StatCard 
            icon={Activity}
            label="Total Orders"
            value={statistics?.orders?.total?.toString() || '0'}
            subtext={`${statistics?.orders?.today || 0} today`}
          />
          <StatCard 
            icon={DollarSign}
            label="Total Revenue"
            value={formatPrice(statistics?.revenue || '0')}
            subtext={`${statistics?.orders?.completed || 0} completed`}
          />
          <StatCard 
            icon={Server}
            label="Active Providers"
            value={providers.filter(p => p.isActive).length.toString()}
            subtext={`${providers.length} total`}
          />
          <StatCard 
            icon={TrendingUp}
            label="Total Rentals"
            value={statistics?.rentals?.total?.toString() || '0'}
            subtext={`${statistics?.orders?.cancelled || 0} cancelled orders`}
          />
        </div>

        {/* Providers Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }} className="lg:!grid-cols-3">
          {providers.map((provider) => {
            const stats = getProviderStats(provider.id);
            const isEditing = editingId === provider.id;
            const isSyncing = syncingId === provider.id;
            const isToggling = togglingId === provider.id;

            return (
              <div 
                key={provider.id}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: `1px solid ${provider.isActive ? 'var(--border-default)' : 'rgba(239, 68, 68, 0.3)'}`,
                  borderRadius: '20px',
                  overflow: 'hidden',
                  opacity: provider.isActive ? 1 : 0.7
                }}
              >
                {/* Provider Header */}
                <div style={{
                  padding: '20px',
                  borderBottom: '1px solid var(--border-default)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: provider.isActive ? 'rgba(198, 167, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Server style={{ 
                        width: '24px', 
                        height: '24px', 
                        color: provider.isActive ? 'var(--accent-gold)' : 'var(--danger)' 
                      }} />
                    </div>
                    <div>
                      <h3 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                        {provider.displayName}
                      </h3>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {provider.slug}
                      </span>
                    </div>
                  </div>
                  <div style={{
                    padding: '4px 10px',
                    borderRadius: '20px',
                    backgroundColor: provider.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: provider.isActive ? 'var(--success)' : 'var(--danger)',
                    fontSize: '12px',
                    fontWeight: 600
                  }}>
                    {provider.isActive ? 'Active' : 'Disabled'}
                  </div>
                </div>

                {/* Stats */}
                <div style={{ padding: '20px', borderBottom: '1px solid var(--border-default)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Orders</p>
                      <p style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {stats.totalOrders}
                      </p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Success</p>
                      <p style={{ fontSize: '18px', fontWeight: 600, color: stats.successRate > 80 ? 'var(--success)' : 'var(--warning)' }}>
                        {(stats.successRate * 100).toFixed(0)}%
                      </p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Revenue</p>
                      <p style={{ fontSize: '18px', fontWeight: 600, color: 'var(--accent-gold)' }}>
                        {formatPrice(stats.revenue)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Settings */}
                {isEditing ? (
                  <div style={{ padding: '20px', borderBottom: '1px solid var(--border-default)' }}>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={editForm.displayName}
                        onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--border-default)',
                          borderRadius: '8px',
                          color: 'var(--text-primary)',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                          Markup %
                        </label>
                        <input
                          type="number"
                          value={editForm.markup}
                          onChange={(e) => setEditForm({ ...editForm, markup: parseFloat(e.target.value) || 0 })}
                          min="0"
                          max="100"
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            backgroundColor: 'var(--bg-secondary)',
                            border: '1px solid var(--border-default)',
                            borderRadius: '8px',
                            color: 'var(--text-primary)',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                          Priority
                        </label>
                        <input
                          type="number"
                          value={editForm.priority}
                          onChange={(e) => setEditForm({ ...editForm, priority: parseInt(e.target.value) || 0 })}
                          min="0"
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            backgroundColor: 'var(--bg-secondary)',
                            border: '1px solid var(--border-default)',
                            borderRadius: '8px',
                            color: 'var(--text-primary)',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <Button size="sm" onClick={() => handleSaveEdit(provider.id)}>
                        <Check style={{ width: '14px', height: '14px', marginRight: '4px' }} />
                        Save
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '20px', borderBottom: '1px solid var(--border-default)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                      <div>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>Markup</p>
                        <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                          {provider.markup || 0}%
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>Priority</p>
                        <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                          {provider.priority}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>Balance</p>
                        <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--accent-gold)' }}>
                          {formatPrice(provider.balance || '0')}
                        </p>
                      </div>
                    </div>
                    {provider.lastSyncAt && (
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '12px' }}>
                        Last sync: {new Date(provider.lastSyncAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div style={{ padding: '16px 20px', display: 'flex', gap: '8px' }}>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => handleSync(provider.id)}
                    disabled={isSyncing}
                    style={{ flex: 1 }}
                  >
                    {isSyncing ? (
                      <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />
                    ) : (
                      <>
                        <RefreshCw style={{ width: '14px', height: '14px', marginRight: '4px' }} />
                        Sync
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleStartEdit(provider)}
                    disabled={isEditing}
                  >
                    <Settings style={{ width: '14px', height: '14px' }} />
                  </Button>
                  <Button 
                    variant={provider.isActive ? 'outline' : 'secondary'}
                    size="sm" 
                    onClick={() => handleToggleActive(provider)}
                    disabled={isToggling}
                  >
                    {isToggling ? (
                      <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />
                    ) : provider.isActive ? (
                      <PowerOff style={{ width: '14px', height: '14px', color: 'var(--danger)' }} />
                    ) : (
                      <Power style={{ width: '14px', height: '14px', color: 'var(--success)' }} />
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Provider Statistics Summary */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          borderRadius: '16px',
          padding: '20px',
          marginTop: '24px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
            Quick Actions
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <Link 
              href="/admin/services" 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-default)',
                borderRadius: '10px',
                textDecoration: 'none',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              <Smartphone style={{ width: '18px', height: '18px', color: 'var(--accent-gold)' }} />
              Manage Services
            </Link>
            <Link 
              href="/admin/sms-orders" 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-default)',
                borderRadius: '10px',
                textDecoration: 'none',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              <Activity style={{ width: '18px', height: '18px', color: 'var(--accent-gold)' }} />
              View All Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

interface StatCardProps {
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  label: string;
  value: string;
  subtext: string;
}

function StatCard({ icon: Icon, label, value, subtext }: StatCardProps) {
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
        backgroundColor: 'rgba(198, 167, 94, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '12px'
      }}>
        <Icon style={{ width: '20px', height: '20px', color: 'var(--accent-gold)' }} />
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</p>
      <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</p>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{subtext}</p>
    </div>
  );
}

interface NavLinkProps {
  href: string;
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  label: string;
  active?: boolean;
}

function NavLink({ href, icon: Icon, label, active }: NavLinkProps) {
  return (
    <Link 
      href={href} 
      style={{ 
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 12px',
        borderRadius: '8px',
        textDecoration: 'none',
        backgroundColor: active ? 'rgba(198, 167, 94, 0.1)' : 'transparent',
        color: active ? 'var(--accent-gold)' : 'var(--text-secondary)',
        fontSize: '13px',
        fontWeight: 500,
        transition: 'all 0.15s'
      }}
    >
      <Icon style={{ width: '16px', height: '16px' }} />
      {label}
    </Link>
  );
}

