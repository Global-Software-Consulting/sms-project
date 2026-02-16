'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Key, 
  Search, 
  Filter,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Download,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  X,
  AlertTriangle
} from 'lucide-react';
import { Button, Alert } from '@/components/ui';
import { 
  getAdminApiKeys,
  getApiKeyStatistics,
  adminRevokeApiKey,
  formatUserName,
  getUserInitials,
  formatLastLogin,
  type AdminApiKey,
  type AdminApiKeyQueryParams,
  type ApiKeyStatistics
} from '@/lib/api';

/**
 * Admin API Keys Page - Manage all user API keys
 */
export default function AdminApiKeysPage() {
  // API Keys state
  const [apiKeys, setApiKeys] = useState<AdminApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });

  // Statistics
  const [stats, setStats] = useState<ApiKeyStatistics | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Filters
  const [filters, setFilters] = useState<AdminApiKeyQueryParams>({
    page: 1,
    limit: 20,
  });
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Action states
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Revoke modal
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState<AdminApiKey | null>(null);
  const [revokeReason, setRevokeReason] = useState('');

  // Fetch API keys
  const fetchApiKeys = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAdminApiKeys(filters);
      setApiKeys(response.data);
      setMeta(response.meta);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load API keys');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch statistics
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const data = await getApiKeyStatistics();
      setStats(data);
    } catch {
      // Ignore stats errors
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

  useEffect(() => {
    fetchStats();
  }, []);

  // Handle search
  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchInput || undefined, page: 1 }));
  };

  // Handle filter change
  const handleFilterChange = (key: keyof AdminApiKeyQueryParams, value: string | boolean | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  // Handle revoke
  const handleRevoke = async () => {
    if (!selectedKey) return;
    
    try {
      setActionLoading(selectedKey.id);
      await adminRevokeApiKey(selectedKey.id, revokeReason || undefined);
      setActionSuccess(`API key "${selectedKey.name}" has been revoked`);
      setShowRevokeModal(false);
      setSelectedKey(null);
      setRevokeReason('');
      await fetchApiKeys();
      await fetchStats();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to revoke API key');
    } finally {
      setActionLoading(null);
    }
  };

  // Open revoke modal
  const openRevokeModal = (key: AdminApiKey) => {
    setSelectedKey(key);
    setShowRevokeModal(true);
    setRevokeReason('');
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
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>API Keys</span>
              </div>
              <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>
                API Keys Management
              </h1>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="outline" onClick={fetchApiKeys}>
                <RefreshCw style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                Refresh
              </Button>
              <Button variant="outline">
                <Download style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                Export
              </Button>
            </div>
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

        {actionSuccess && (
          <div style={{ marginBottom: '24px' }}>
            <Alert variant="success" dismissible onDismiss={() => setActionSuccess(null)}>
              {actionSuccess}
            </Alert>
          </div>
        )}

        {/* Statistics Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }} className="lg:!grid-cols-4">
          <StatCard 
            icon={Key} 
            label="Total Keys" 
            value={statsLoading ? '...' : String(stats?.totalKeys ?? 0)} 
            color="gold" 
          />
          <StatCard 
            icon={CheckCircle} 
            label="Active Keys" 
            value={statsLoading ? '...' : String(stats?.activeKeys ?? 0)} 
            color="green" 
          />
          <StatCard 
            icon={XCircle} 
            label="Revoked Keys" 
            value={statsLoading ? '...' : String(stats?.revokedKeys ?? 0)} 
            color="red" 
          />
          <StatCard 
            icon={Activity} 
            label="Usage Today" 
            value={statsLoading ? '...' : String(stats?.usageToday ?? 0)} 
            color="blue" 
          />
        </div>

        {/* Search and Filters */}
        <div style={{ 
          backgroundColor: 'var(--bg-card)', 
          border: '1px solid var(--border-default)', 
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ flex: 1, minWidth: '250px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search by key name or user email..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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
                <Button onClick={handleSearch}>Search</Button>
              </div>
            </div>

            {/* Filter Toggle */}
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter style={{ width: '16px', height: '16px', marginRight: '8px' }} />
              Filters
            </Button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Status</label>
                <select
                  value={filters.isActive === undefined ? '' : filters.isActive.toString()}
                  onChange={(e) => handleFilterChange('isActive', e.target.value === '' ? undefined : e.target.value === 'true')}
                  style={{
                    height: '40px',
                    padding: '0 12px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                    minWidth: '150px'
                  }}
                >
                  <option value="">All Keys</option>
                  <option value="true">Active</option>
                  <option value="false">Revoked</option>
                </select>
              </div>

              <Button 
                variant="ghost" 
                onClick={() => {
                  setFilters({ page: 1, limit: 20 });
                  setSearchInput('');
                }}
                style={{ alignSelf: 'flex-end' }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>

        {/* API Keys Table */}
        <div style={{ 
          backgroundColor: 'var(--bg-card)', 
          border: '1px solid var(--border-default)', 
          borderRadius: '16px',
          overflow: 'hidden'
        }}>
          {loading ? (
            <div style={{ padding: '64px', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', margin: '0 auto 16px', borderRadius: '50%', border: '4px solid var(--accent-gold)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
              <p style={{ color: 'var(--text-muted)' }}>Loading API keys...</p>
            </div>
          ) : apiKeys.length === 0 ? (
            <div style={{ padding: '64px', textAlign: 'center' }}>
              <Key style={{ width: '48px', height: '48px', color: 'var(--text-muted)', margin: '0 auto 16px' }} />
              <p style={{ color: 'var(--text-muted)' }}>No API keys found</p>
            </div>
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Key</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>User</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Usage</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Last Used</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiKeys.map((key) => (
                      <tr key={key.id} style={{ borderBottom: '1px solid var(--border-default)' }}>
                        {/* Key */}
                        <td style={{ padding: '16px' }}>
                          <div>
                            <p style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: '4px' }}>
                              {key.name}
                            </p>
                            <code style={{ 
                              fontSize: '12px', 
                              color: 'var(--text-muted)', 
                              backgroundColor: 'var(--bg-secondary)',
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}>
                              {key.keyPrefix}...
                            </code>
                          </div>
                        </td>

                        {/* User */}
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ 
                              width: '32px', 
                              height: '32px', 
                              borderRadius: '50%', 
                              backgroundColor: 'rgba(198, 167, 94, 0.2)', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              color: 'var(--accent-gold)',
                              fontWeight: 600,
                              fontSize: '12px',
                              flexShrink: 0
                            }}>
                              {key.userEmail[0].toUpperCase()}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <p style={{ fontSize: '14px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {key.username || key.userEmail.split('@')[0]}
                              </p>
                              <p style={{ fontSize: '12px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {key.userEmail}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <span style={{ 
                            padding: '4px 10px', 
                            borderRadius: '6px', 
                            fontSize: '12px', 
                            fontWeight: 600,
                            backgroundColor: key.isActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: key.isActive ? 'var(--success)' : 'var(--danger)'
                          }}>
                            {key.isActive ? 'Active' : 'Revoked'}
                          </span>
                        </td>

                        {/* Usage */}
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                            {key.usageCount.toLocaleString()}
                          </span>
                        </td>

                        {/* Last Used */}
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Clock style={{ width: '14px', height: '14px', color: 'var(--text-muted)' }} />
                            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                              {formatLastLogin(key.lastUsedAt || null)}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '16px', textAlign: 'right' }}>
                          {key.isActive && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => openRevokeModal(key)}
                              disabled={actionLoading === key.id}
                            >
                              <Trash2 style={{ width: '14px', height: '14px', marginRight: '6px', color: 'var(--danger)' }} />
                              <span style={{ color: 'var(--danger)' }}>Revoke</span>
                            </Button>
                          )}
                          {!key.isActive && key.revokedReason && (
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }} title={key.revokedReason}>
                              {key.revokedReason.slice(0, 20)}...
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '16px',
                borderTop: '1px solid var(--border-default)'
              }}>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                  Showing {((meta.page - 1) * meta.limit) + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} keys
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handlePageChange(meta.page - 1)}
                    disabled={meta.page <= 1}
                  >
                    <ChevronLeft style={{ width: '16px', height: '16px' }} />
                  </Button>
                  <span style={{ display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: '14px', color: 'var(--text-primary)' }}>
                    Page {meta.page} of {meta.totalPages}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handlePageChange(meta.page + 1)}
                    disabled={meta.page >= meta.totalPages}
                  >
                    <ChevronRight style={{ width: '16px', height: '16px' }} />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Revoke Modal */}
      {showRevokeModal && selectedKey && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          backgroundColor: 'rgba(0,0,0,0.6)', 
          backdropFilter: 'blur(4px)', 
          zIndex: 100, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '24px' 
        }}>
          <div style={{ 
            backgroundColor: 'var(--bg-card)', 
            borderRadius: '16px', 
            padding: '24px', 
            maxWidth: '450px', 
            width: '100%' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--danger)' }}>
                Revoke API Key
              </h3>
              <button onClick={() => setShowRevokeModal(false)} style={{ padding: '8px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>
                <X style={{ width: '20px', height: '20px', color: 'var(--text-muted)' }} />
              </button>
            </div>

            {/* Warning */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '12px', 
              padding: '16px', 
              backgroundColor: 'rgba(239, 68, 68, 0.1)', 
              borderRadius: '12px', 
              marginBottom: '20px' 
            }}>
              <AlertTriangle style={{ width: '20px', height: '20px', color: 'var(--danger)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <p style={{ fontWeight: 500, color: 'var(--danger)', marginBottom: '4px' }}>This action cannot be undone</p>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  The user will no longer be able to use this API key.
                </p>
              </div>
            </div>

            {/* Key Info */}
            <div style={{ 
              padding: '16px', 
              backgroundColor: 'var(--bg-secondary)', 
              borderRadius: '12px', 
              marginBottom: '20px' 
            }}>
              <p style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: '4px' }}>
                {selectedKey.name}
              </p>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                Owner: {selectedKey.userEmail}
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Reason (optional)
              </label>
              <textarea
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="e.g., Abuse detected, user request..."
                style={{
                  width: '100%',
                  minHeight: '80px',
                  padding: '12px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="outline" fullWidth onClick={() => setShowRevokeModal(false)}>
                Cancel
              </Button>
              <Button 
                variant="danger" 
                fullWidth 
                onClick={handleRevoke}
                isLoading={actionLoading === selectedKey.id}
              >
                Revoke Key
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==================== COMPONENTS ==================== */

interface StatCardProps {
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  label: string;
  value: string;
  color: 'gold' | 'green' | 'red' | 'blue';
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  const colors = {
    gold: { bg: 'rgba(198, 167, 94, 0.1)', text: 'var(--accent-gold)' },
    green: { bg: 'rgba(34, 197, 94, 0.1)', text: 'var(--success)' },
    red: { bg: 'rgba(239, 68, 68, 0.1)', text: 'var(--danger)' },
    blue: { bg: 'rgba(59, 130, 246, 0.1)', text: 'var(--info)' },
  };
  const c = colors[color];

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
      <p style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</p>
    </div>
  );
}

