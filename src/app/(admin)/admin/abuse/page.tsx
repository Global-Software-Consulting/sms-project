'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Shield, 
  Search, 
  Filter,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Plus,
  X,
  AlertTriangle,
  Ban,
  Globe,
  Mail,
  User,
  Eye,
  Trash2,
  TrendingUp,
  Users,
  Lock
} from 'lucide-react';
import { Button, Alert } from '@/components/ui';
import { 
  getAbuseStatistics,
  getAbuseConfig,
  getBlockedEntities,
  getAtRiskUsers,
  createBlock,
  removeBlock,
  getRiskLevelColor,
  getAbuseScoreColor,
  getBlockTypeColor,
  formatRelativeTime,
  type AbuseStatistics,
  type AbuseConfig,
  type BlockedEntity,
  type AtRiskUser,
  type BlockQueryParams,
  type AbuseUserQueryParams,
  type BlockType,
  type CreateBlockRequest
} from '@/lib/api';

/**
 * Admin Abuse Control Page
 * 
 * Features:
 * - Abuse statistics dashboard
 * - At-risk users list
 * - Blocked entities management (IP, Domain, Country)
 * - Score distribution visualization
 */
export default function AdminAbuseControlPage() {
  // Statistics
  const [stats, setStats] = useState<AbuseStatistics | null>(null);
  const [config, setConfig] = useState<AbuseConfig | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Blocked entities
  const [blockedEntities, setBlockedEntities] = useState<BlockedEntity[]>([]);
  const [blockedLoading, setBlockedLoading] = useState(true);
  const [blockedMeta, setBlockedMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [blockedFilters, setBlockedFilters] = useState<BlockQueryParams>({
    page: 1,
    limit: 10,
  });

  // At-risk users
  const [atRiskUsers, setAtRiskUsers] = useState<AtRiskUser[]>([]);
  const [atRiskLoading, setAtRiskLoading] = useState(true);
  const [atRiskMeta, setAtRiskMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [atRiskFilters, setAtRiskFilters] = useState<AbuseUserQueryParams>({
    page: 1,
    limit: 10,
    minScore: 61,
  });

  // UI State
  const [activeTab, setActiveTab] = useState<'overview' | 'blocked' | 'users'>('overview');
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modals
  const [showAddBlockModal, setShowAddBlockModal] = useState(false);
  const [newBlock, setNewBlock] = useState<CreateBlockRequest>({
    type: 'IP',
    value: '',
    reason: '',
  });

  // Fetch statistics
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const [statsData, configData] = await Promise.all([
        getAbuseStatistics(),
        getAbuseConfig(),
      ]);
      setStats(statsData);
      setConfig(configData);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load statistics');
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch blocked entities
  const fetchBlocked = useCallback(async () => {
    try {
      setBlockedLoading(true);
      const response = await getBlockedEntities(blockedFilters);
      setBlockedEntities(response.data);
      setBlockedMeta(response.meta);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load blocked entities');
    } finally {
      setBlockedLoading(false);
    }
  }, [blockedFilters]);

  // Fetch at-risk users
  const fetchAtRiskUsers = useCallback(async () => {
    try {
      setAtRiskLoading(true);
      const response = await getAtRiskUsers(atRiskFilters);
      setAtRiskUsers(response.data);
      setAtRiskMeta(response.meta);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load at-risk users');
    } finally {
      setAtRiskLoading(false);
    }
  }, [atRiskFilters]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'blocked') {
      fetchBlocked();
    }
  }, [activeTab, fetchBlocked]);

  useEffect(() => {
    if (activeTab === 'users' || activeTab === 'overview') {
      fetchAtRiskUsers();
    }
  }, [activeTab, fetchAtRiskUsers]);

  // Handle add block
  const handleAddBlock = async () => {
    if (!newBlock.value.trim()) return;
    
    try {
      setActionLoading('add-block');
      await createBlock(newBlock);
      setActionSuccess(`${newBlock.type} "${newBlock.value}" has been blocked`);
      setShowAddBlockModal(false);
      setNewBlock({ type: 'IP', value: '', reason: '' });
      await fetchBlocked();
      await fetchStats();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to create block');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle remove block
  const handleRemoveBlock = async (block: BlockedEntity) => {
    try {
      setActionLoading(block.id);
      await removeBlock(block.id);
      setActionSuccess(`Block on "${block.value}" has been removed`);
      await fetchBlocked();
      await fetchStats();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to remove block');
    } finally {
      setActionLoading(null);
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
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <Link href="/admin" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>
                  Admin
                </Link>
                <span style={{ color: 'var(--text-muted)' }}>/</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Abuse Control</span>
              </div>
              <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Abuse Control
              </h1>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="outline" onClick={() => { fetchStats(); fetchBlocked(); fetchAtRiskUsers(); }}>
                <RefreshCw style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                Refresh
              </Button>
              <Button variant="primary" onClick={() => setShowAddBlockModal(true)}>
                <Plus style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                Add Block
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

        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          marginBottom: '24px',
          borderBottom: '1px solid var(--border-default)',
          paddingBottom: '16px'
        }}>
          <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
            Overview
          </TabButton>
          <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')}>
            At-Risk Users ({stats?.watchUsers || 0 + (stats?.restrictedUsers || 0) + (stats?.frozenUsers || 0)})
          </TabButton>
          <TabButton active={activeTab === 'blocked'} onClick={() => setActiveTab('blocked')}>
            Blocked Entities ({(stats?.blockedIPs || 0) + (stats?.blockedDomains || 0) + (stats?.blockedCountries || 0)})
          </TabButton>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Statistics Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }} className="lg:!grid-cols-4">
              <StatCard 
                icon={Users} 
                label="Total Users" 
                value={statsLoading ? '...' : String(stats?.totalUsers || 0)} 
                subtext={`${stats?.normalUsers || 0} normal`}
                color="gold" 
              />
              <StatCard 
                icon={AlertTriangle} 
                label="Watch List" 
                value={statsLoading ? '...' : String(stats?.watchUsers || 0)} 
                subtext="Score 61-75"
                color="yellow" 
              />
              <StatCard 
                icon={Shield} 
                label="Restricted" 
                value={statsLoading ? '...' : String(stats?.restrictedUsers || 0)} 
                subtext="Score 76-90"
                color="orange" 
              />
              <StatCard 
                icon={Lock} 
                label="Frozen" 
                value={statsLoading ? '...' : String(stats?.frozenUsers || 0)} 
                subtext="Score 91-100"
                color="red" 
              />
            </div>

            {/* Score Distribution & Blocked Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', marginBottom: '24px' }} className="lg:!grid-cols-2">
              {/* Score Distribution */}
              <div style={{ 
                backgroundColor: 'var(--bg-card)', 
                border: '1px solid var(--border-default)', 
                borderRadius: '16px',
                padding: '24px'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px' }}>
                  Score Distribution
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <ScoreBar 
                    label="Normal (0-60)" 
                    count={stats?.normalUsers || 0} 
                    total={stats?.totalUsers || 1} 
                    color="var(--success)" 
                  />
                  <ScoreBar 
                    label="Watch (61-75)" 
                    count={stats?.watchUsers || 0} 
                    total={stats?.totalUsers || 1} 
                    color="var(--warning)" 
                  />
                  <ScoreBar 
                    label="Restricted (76-90)" 
                    count={stats?.restrictedUsers || 0} 
                    total={stats?.totalUsers || 1} 
                    color="#F97316" 
                  />
                  <ScoreBar 
                    label="Frozen (91-100)" 
                    count={stats?.frozenUsers || 0} 
                    total={stats?.totalUsers || 1} 
                    color="var(--danger)" 
                  />
                </div>
              </div>

              {/* Blocked Summary */}
              <div style={{ 
                backgroundColor: 'var(--bg-card)', 
                border: '1px solid var(--border-default)', 
                borderRadius: '16px',
                padding: '24px'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px' }}>
                  Blocked Entities
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  <BlockSummaryCard 
                    icon={Ban} 
                    label="IPs" 
                    count={stats?.blockedIPs || 0} 
                    color="var(--danger)" 
                  />
                  <BlockSummaryCard 
                    icon={Mail} 
                    label="Domains" 
                    count={stats?.blockedDomains || 0} 
                    color="var(--warning)" 
                  />
                  <BlockSummaryCard 
                    icon={Globe} 
                    label="Countries" 
                    count={stats?.blockedCountries || 0} 
                    color="var(--info)" 
                  />
                </div>
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border-default)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Recent Incidents</span>
                    <span style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {stats?.recentIncidents || 0}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                    <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Chargebacks This Month</span>
                    <span style={{ fontSize: '20px', fontWeight: 600, color: 'var(--danger)' }}>
                      {stats?.chargebacksThisMonth || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Configuration */}
            {config && (
              <div style={{ 
                backgroundColor: 'var(--bg-card)', 
                border: '1px solid var(--border-default)', 
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px' }}>
                  Current Configuration
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }} className="lg:!grid-cols-4">
                  <ConfigItem label="Order Frequency" value={`1 per ${config.orderFrequencySeconds}s`} />
                  <ConfigItem label="Max Order Quantity" value={String(config.maxOrderQuantity)} />
                  <ConfigItem label="Auto-Freeze Duration" value={`${config.autoFreezeDurationHours}h`} />
                  <ConfigItem label="Login Attempts" value={`${config.loginAttempts} → ${config.loginCooldownMinutes}min cooldown`} />
                </div>
              </div>
            )}

            {/* Recent At-Risk Users */}
            <div style={{ 
              backgroundColor: 'var(--bg-card)', 
              border: '1px solid var(--border-default)', 
              borderRadius: '16px',
              overflow: 'hidden'
            }}>
              <div style={{ padding: '20px', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  At-Risk Users
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('users')}>
                  View All
                </Button>
              </div>
              {atRiskLoading ? (
                <div style={{ padding: '48px', textAlign: 'center' }}>
                  <div style={{ width: '32px', height: '32px', margin: '0 auto', borderRadius: '50%', border: '3px solid var(--accent-gold)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
                </div>
              ) : atRiskUsers.length === 0 ? (
                <div style={{ padding: '48px', textAlign: 'center' }}>
                  <Shield style={{ width: '32px', height: '32px', color: 'var(--success)', margin: '0 auto 12px' }} />
                  <p style={{ color: 'var(--text-muted)' }}>No at-risk users</p>
                </div>
              ) : (
                <div>
                  {atRiskUsers.slice(0, 5).map((user) => (
                    <AtRiskUserRow key={user.id} user={user} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div style={{ 
            backgroundColor: 'var(--bg-card)', 
            border: '1px solid var(--border-default)', 
            borderRadius: '16px',
            overflow: 'hidden'
          }}>
            {/* Filters */}
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border-default)' }}>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <select
                  value={atRiskFilters.riskLevel || ''}
                  onChange={(e) => setAtRiskFilters(prev => ({ ...prev, riskLevel: e.target.value as 'watch' | 'restricted' | 'freeze' || undefined, page: 1 }))}
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
                  <option value="">All Risk Levels</option>
                  <option value="watch">Watch (61-75)</option>
                  <option value="restricted">Restricted (76-90)</option>
                  <option value="freeze">Frozen (91-100)</option>
                </select>
              </div>
            </div>

            {atRiskLoading ? (
              <div style={{ padding: '64px', textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', margin: '0 auto 16px', borderRadius: '50%', border: '4px solid var(--accent-gold)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
                <p style={{ color: 'var(--text-muted)' }}>Loading users...</p>
              </div>
            ) : atRiskUsers.length === 0 ? (
              <div style={{ padding: '64px', textAlign: 'center' }}>
                <Shield style={{ width: '48px', height: '48px', color: 'var(--success)', margin: '0 auto 16px' }} />
                <p style={{ color: 'var(--text-muted)' }}>No at-risk users found</p>
              </div>
            ) : (
              <>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>User</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Score</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Risk Level</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Last Login</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {atRiskUsers.map((user) => (
                        <AtRiskUserTableRow key={user.id} user={user} />
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
                    Showing {((atRiskMeta.page - 1) * atRiskMeta.limit) + 1} to {Math.min(atRiskMeta.page * atRiskMeta.limit, atRiskMeta.total)} of {atRiskMeta.total}
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setAtRiskFilters(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
                      disabled={!atRiskMeta.hasPrevPage}
                    >
                      <ChevronLeft style={{ width: '16px', height: '16px' }} />
                    </Button>
                    <span style={{ display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: '14px', color: 'var(--text-primary)' }}>
                      Page {atRiskMeta.page} of {atRiskMeta.totalPages}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setAtRiskFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
                      disabled={!atRiskMeta.hasNextPage}
                    >
                      <ChevronRight style={{ width: '16px', height: '16px' }} />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Blocked Tab */}
        {activeTab === 'blocked' && (
          <div style={{ 
            backgroundColor: 'var(--bg-card)', 
            border: '1px solid var(--border-default)', 
            borderRadius: '16px',
            overflow: 'hidden'
          }}>
            {/* Filters */}
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border-default)' }}>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <select
                  value={blockedFilters.type || ''}
                  onChange={(e) => setBlockedFilters(prev => ({ ...prev, type: e.target.value as BlockType || undefined, page: 1 }))}
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
                  <option value="">All Types</option>
                  <option value="IP">IP Addresses</option>
                  <option value="DOMAIN">Email Domains</option>
                  <option value="COUNTRY">Countries</option>
                </select>
                <Button variant="primary" onClick={() => setShowAddBlockModal(true)}>
                  <Plus style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                  Add Block
                </Button>
              </div>
            </div>

            {blockedLoading ? (
              <div style={{ padding: '64px', textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', margin: '0 auto 16px', borderRadius: '50%', border: '4px solid var(--accent-gold)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
                <p style={{ color: 'var(--text-muted)' }}>Loading blocked entities...</p>
              </div>
            ) : blockedEntities.length === 0 ? (
              <div style={{ padding: '64px', textAlign: 'center' }}>
                <Shield style={{ width: '48px', height: '48px', color: 'var(--text-muted)', margin: '0 auto 16px' }} />
                <p style={{ color: 'var(--text-muted)' }}>No blocked entities</p>
              </div>
            ) : (
              <>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Type</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Value</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Reason</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Created</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {blockedEntities.map((entity) => (
                        <BlockedEntityRow 
                          key={entity.id} 
                          entity={entity} 
                          onRemove={() => handleRemoveBlock(entity)}
                          isLoading={actionLoading === entity.id}
                        />
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
                    Showing {((blockedMeta.page - 1) * blockedMeta.limit) + 1} to {Math.min(blockedMeta.page * blockedMeta.limit, blockedMeta.total)} of {blockedMeta.total}
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setBlockedFilters(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
                      disabled={!blockedMeta.hasPrevPage}
                    >
                      <ChevronLeft style={{ width: '16px', height: '16px' }} />
                    </Button>
                    <span style={{ display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: '14px', color: 'var(--text-primary)' }}>
                      Page {blockedMeta.page} of {blockedMeta.totalPages}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setBlockedFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
                      disabled={!blockedMeta.hasNextPage}
                    >
                      <ChevronRight style={{ width: '16px', height: '16px' }} />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Add Block Modal */}
      {showAddBlockModal && (
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
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Add Block
              </h3>
              <button onClick={() => setShowAddBlockModal(false)} style={{ padding: '8px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>
                <X style={{ width: '20px', height: '20px', color: 'var(--text-muted)' }} />
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Type
              </label>
              <select
                value={newBlock.type}
                onChange={(e) => setNewBlock(prev => ({ ...prev, type: e.target.value as BlockType }))}
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
                <option value="IP">IP Address</option>
                <option value="DOMAIN">Email Domain</option>
                <option value="COUNTRY">Country Code</option>
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Value <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="text"
                value={newBlock.value}
                onChange={(e) => setNewBlock(prev => ({ ...prev, value: e.target.value }))}
                placeholder={newBlock.type === 'IP' ? '192.168.1.1' : newBlock.type === 'DOMAIN' ? 'spam.com' : 'US'}
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
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Reason (optional)
              </label>
              <textarea
                value={newBlock.reason || ''}
                onChange={(e) => setNewBlock(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="e.g., Spam activity, Fraud attempt"
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
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="outline" fullWidth onClick={() => setShowAddBlockModal(false)}>
                Cancel
              </Button>
              <Button 
                variant="danger" 
                fullWidth 
                onClick={handleAddBlock}
                isLoading={actionLoading === 'add-block'}
                disabled={!newBlock.value.trim()}
              >
                Add Block
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==================== COMPONENTS ==================== */

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
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
      {children}
    </button>
  );
}

interface StatCardProps {
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  label: string;
  value: string;
  subtext?: string;
  color: 'gold' | 'green' | 'red' | 'yellow' | 'orange' | 'blue';
}

function StatCard({ icon: Icon, label, value, subtext, color }: StatCardProps) {
  const colors = {
    gold: { bg: 'rgba(198, 167, 94, 0.1)', text: 'var(--accent-gold)' },
    green: { bg: 'rgba(34, 197, 94, 0.1)', text: 'var(--success)' },
    red: { bg: 'rgba(239, 68, 68, 0.1)', text: 'var(--danger)' },
    yellow: { bg: 'rgba(245, 158, 11, 0.1)', text: 'var(--warning)' },
    orange: { bg: 'rgba(249, 115, 22, 0.1)', text: '#F97316' },
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
      <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</p>
      {subtext && (
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{subtext}</p>
      )}
    </div>
  );
}

function ScoreBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{count}</span>
      </div>
      <div style={{ height: '8px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${percentage}%`, backgroundColor: color, borderRadius: '4px', transition: 'width 0.3s' }} />
      </div>
    </div>
  );
}

function BlockSummaryCard({ icon: Icon, label, count, color }: { icon: React.ComponentType<{ style?: React.CSSProperties }>; label: string; count: number; color: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px' }}>
      <Icon style={{ width: '24px', height: '24px', color, margin: '0 auto 8px' }} />
      <p style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>{count}</p>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{label}</p>
    </div>
  );
}

function ConfigItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</p>
      <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{value}</p>
    </div>
  );
}

function AtRiskUserRow({ user }: { user: AtRiskUser }) {
  const scoreColor = getAbuseScoreColor(user.abuseScore);
  const riskColor = getRiskLevelColor(user.riskLevel);

  return (
    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          borderRadius: '50%', 
          backgroundColor: 'rgba(198, 167, 94, 0.2)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'var(--accent-gold)',
          fontWeight: 600
        }}>
          {user.email[0].toUpperCase()}
        </div>
        <div>
          <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
            {user.firstName || user.email.split('@')[0]}
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{user.email}</p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ 
          padding: '4px 10px', 
          borderRadius: '6px', 
          fontSize: '12px', 
          fontWeight: 600,
          backgroundColor: scoreColor.bg,
          color: scoreColor.text
        }}>
          Score: {user.abuseScore}
        </span>
        <span style={{ 
          padding: '4px 10px', 
          borderRadius: '6px', 
          fontSize: '12px', 
          fontWeight: 600,
          backgroundColor: riskColor.bg,
          color: riskColor.text,
          textTransform: 'capitalize'
        }}>
          {user.riskLevel}
        </span>
        <Link href={`/admin/users/${user.id}`}>
          <Button variant="ghost" size="sm">
            <Eye style={{ width: '14px', height: '14px' }} />
          </Button>
        </Link>
      </div>
    </div>
  );
}

function AtRiskUserTableRow({ user }: { user: AtRiskUser }) {
  const scoreColor = getAbuseScoreColor(user.abuseScore);
  const riskColor = getRiskLevelColor(user.riskLevel);

  return (
    <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
      <td style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '36px', 
            height: '36px', 
            borderRadius: '50%', 
            backgroundColor: 'rgba(198, 167, 94, 0.2)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--accent-gold)',
            fontWeight: 600,
            fontSize: '14px'
          }}>
            {user.email[0].toUpperCase()}
          </div>
          <div>
            <p style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '14px' }}>
              {user.firstName || user.email.split('@')[0]}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user.email}</p>
          </div>
        </div>
      </td>
      <td style={{ padding: '16px', textAlign: 'center' }}>
        <span style={{ 
          padding: '4px 10px', 
          borderRadius: '6px', 
          fontSize: '12px', 
          fontWeight: 600,
          backgroundColor: scoreColor.bg,
          color: scoreColor.text
        }}>
          {user.abuseScore}
        </span>
      </td>
      <td style={{ padding: '16px', textAlign: 'center' }}>
        <span style={{ 
          padding: '4px 10px', 
          borderRadius: '6px', 
          fontSize: '12px', 
          fontWeight: 600,
          backgroundColor: riskColor.bg,
          color: riskColor.text,
          textTransform: 'capitalize'
        }}>
          {user.riskLevel}
        </span>
      </td>
      <td style={{ padding: '16px' }}>
        <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{user.status}</span>
      </td>
      <td style={{ padding: '16px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          {formatRelativeTime(user.lastLoginAt)}
        </span>
      </td>
      <td style={{ padding: '16px', textAlign: 'right' }}>
        <Link href={`/admin/users/${user.id}`}>
          <Button variant="outline" size="sm">
            <Eye style={{ width: '14px', height: '14px', marginRight: '6px' }} />
            View
          </Button>
        </Link>
      </td>
    </tr>
  );
}

function BlockedEntityRow({ entity, onRemove, isLoading }: { entity: BlockedEntity; onRemove: () => void; isLoading: boolean }) {
  const typeColor = getBlockTypeColor(entity.type);
  const TypeIcon = entity.type === 'IP' ? Ban : entity.type === 'DOMAIN' ? Mail : Globe;

  return (
    <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
      <td style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TypeIcon style={{ width: '16px', height: '16px', color: typeColor.text }} />
          <span style={{ 
            padding: '4px 10px', 
            borderRadius: '6px', 
            fontSize: '12px', 
            fontWeight: 600,
            backgroundColor: typeColor.bg,
            color: typeColor.text
          }}>
            {entity.type}
          </span>
        </div>
      </td>
      <td style={{ padding: '16px' }}>
        <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
          {entity.value}
        </span>
      </td>
      <td style={{ padding: '16px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          {entity.reason || '-'}
        </span>
      </td>
      <td style={{ padding: '16px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          {formatRelativeTime(entity.createdAt)}
        </span>
      </td>
      <td style={{ padding: '16px', textAlign: 'right' }}>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onRemove}
          isLoading={isLoading}
        >
          <Trash2 style={{ width: '14px', height: '14px', color: 'var(--danger)' }} />
        </Button>
      </td>
    </tr>
  );
}

