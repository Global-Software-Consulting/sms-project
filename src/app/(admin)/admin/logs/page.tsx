'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Search, 
  Filter,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Download,
  Server,
  User,
  Calendar,
  AlertTriangle,
  Info,
  AlertCircle,
  Bug
} from 'lucide-react';
import { Button, Alert } from '@/components/ui';
import { 
  apiClient,
  getLogLevelColor,
  formatRelativeTime,
  type AuditLog,
  type SystemLog
} from '@/lib/api';

// Types for log queries
interface AuditLogQueryParams {
  userId?: string;
  action?: string;
  entityType?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

interface SystemLogQueryParams {
  level?: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  context?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

interface LogsResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// API functions
const getAuditLogs = async (params?: AuditLogQueryParams): Promise<LogsResponse<AuditLog>> => {
  const response = await apiClient.get<LogsResponse<AuditLog>>('/admin/analytics/audit-logs', { params });
  return response.data;
};

const getSystemLogs = async (params?: SystemLogQueryParams): Promise<LogsResponse<SystemLog>> => {
  const response = await apiClient.get<LogsResponse<SystemLog>>('/admin/analytics/system-logs', { params });
  return response.data;
};

/**
 * Admin Logs Page
 * 
 * Features:
 * - Audit logs (user actions, admin actions)
 * - System logs (errors, warnings, info)
 * - Filtering and search
 * - Export functionality
 */
export default function AdminLogsPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState<'audit' | 'system'>('audit');

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditLoading, setAuditLoading] = useState(true);
  const [auditMeta, setAuditMeta] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [auditFilters, setAuditFilters] = useState<AuditLogQueryParams>({
    page: 1,
    limit: 20,
  });

  // System logs state
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [systemLoading, setSystemLoading] = useState(true);
  const [systemMeta, setSystemMeta] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [systemFilters, setSystemFilters] = useState<SystemLogQueryParams>({
    page: 1,
    limit: 20,
  });

  // UI state
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch audit logs
  const fetchAuditLogs = useCallback(async () => {
    try {
      setAuditLoading(true);
      const response = await getAuditLogs(auditFilters);
      setAuditLogs(response.data);
      setAuditMeta(response.meta);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load audit logs');
    } finally {
      setAuditLoading(false);
    }
  }, [auditFilters]);

  // Fetch system logs
  const fetchSystemLogs = useCallback(async () => {
    try {
      setSystemLoading(true);
      const response = await getSystemLogs(systemFilters);
      setSystemLogs(response.data);
      setSystemMeta(response.meta);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load system logs');
    } finally {
      setSystemLoading(false);
    }
  }, [systemFilters]);

  useEffect(() => {
    if (activeTab === 'audit') {
      fetchAuditLogs();
    } else {
      fetchSystemLogs();
    }
  }, [activeTab, fetchAuditLogs, fetchSystemLogs]);

  // Handle search
  const handleSearch = () => {
    if (activeTab === 'audit') {
      setAuditFilters(prev => ({ ...prev, search: searchInput || undefined, page: 1 }));
    } else {
      setSystemFilters(prev => ({ ...prev, search: searchInput || undefined, page: 1 }));
    }
  };

  // Get log level icon
  const getLogLevelIcon = (level: string) => {
    switch (level) {
      case 'ERROR': return AlertCircle;
      case 'WARN': return AlertTriangle;
      case 'DEBUG': return Bug;
      default: return Info;
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
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Logs</span>
              </div>
              <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>
                System Logs
              </h1>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="outline" onClick={() => activeTab === 'audit' ? fetchAuditLogs() : fetchSystemLogs()}>
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
        {/* Error */}
        {error && (
          <div style={{ marginBottom: '24px' }}>
            <Alert variant="error" dismissible onDismiss={() => setError(null)}>
              {error}
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
          <TabButton 
            active={activeTab === 'audit'} 
            onClick={() => { setActiveTab('audit'); setSearchInput(''); }}
            icon={FileText}
          >
            Audit Logs
          </TabButton>
          <TabButton 
            active={activeTab === 'system'} 
            onClick={() => { setActiveTab('system'); setSearchInput(''); }}
            icon={Server}
          >
            System Logs
          </TabButton>
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
                    placeholder={activeTab === 'audit' ? 'Search by action, user, entity...' : 'Search by message, context...'}
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
              {activeTab === 'audit' ? (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Action</label>
                    <select
                      value={auditFilters.action || ''}
                      onChange={(e) => setAuditFilters(prev => ({ ...prev, action: e.target.value || undefined, page: 1 }))}
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
                      <option value="">All Actions</option>
                      <option value="LOGIN">Login</option>
                      <option value="LOGOUT">Logout</option>
                      <option value="CREATE">Create</option>
                      <option value="UPDATE">Update</option>
                      <option value="DELETE">Delete</option>
                      <option value="PAYMENT">Payment</option>
                      <option value="REFUND">Refund</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Entity Type</label>
                    <select
                      value={auditFilters.entityType || ''}
                      onChange={(e) => setAuditFilters(prev => ({ ...prev, entityType: e.target.value || undefined, page: 1 }))}
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
                      <option value="">All Entities</option>
                      <option value="USER">User</option>
                      <option value="WALLET">Wallet</option>
                      <option value="PAYMENT">Payment</option>
                      <option value="SUBSCRIPTION">Subscription</option>
                      <option value="API_KEY">API Key</option>
                    </select>
                  </div>
                </>
              ) : (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Level</label>
                  <select
                    value={systemFilters.level || ''}
                    onChange={(e) => setSystemFilters(prev => ({ ...prev, level: e.target.value as SystemLogQueryParams['level'] || undefined, page: 1 }))}
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
                    <option value="">All Levels</option>
                    <option value="INFO">Info</option>
                    <option value="WARN">Warning</option>
                    <option value="ERROR">Error</option>
                    <option value="DEBUG">Debug</option>
                  </select>
                </div>
              )}

              <Button 
                variant="ghost" 
                onClick={() => {
                  if (activeTab === 'audit') {
                    setAuditFilters({ page: 1, limit: 20 });
                  } else {
                    setSystemFilters({ page: 1, limit: 20 });
                  }
                  setSearchInput('');
                }}
                style={{ alignSelf: 'flex-end' }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>

        {/* Logs Table */}
        <div style={{ 
          backgroundColor: 'var(--bg-card)', 
          border: '1px solid var(--border-default)', 
          borderRadius: '16px',
          overflow: 'hidden'
        }}>
          {activeTab === 'audit' ? (
            // Audit Logs
            auditLoading ? (
              <div style={{ padding: '64px', textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', margin: '0 auto 16px', borderRadius: '50%', border: '4px solid var(--accent-gold)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
                <p style={{ color: 'var(--text-muted)' }}>Loading audit logs...</p>
              </div>
            ) : auditLogs.length === 0 ? (
              <div style={{ padding: '64px', textAlign: 'center' }}>
                <FileText style={{ width: '48px', height: '48px', color: 'var(--text-muted)', margin: '0 auto 16px' }} />
                <p style={{ color: 'var(--text-muted)' }}>No audit logs found</p>
              </div>
            ) : (
              <>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Time</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>User</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Action</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Entity</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>IP Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((log) => (
                        <tr key={log.id} style={{ borderBottom: '1px solid var(--border-default)' }}>
                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Calendar style={{ width: '14px', height: '14px', color: 'var(--text-muted)' }} />
                              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                {formatRelativeTime(log.createdAt)}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <User style={{ width: '14px', height: '14px', color: 'var(--text-muted)' }} />
                              <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                                {log.user?.email || 'System'}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <span style={{ 
                              padding: '4px 10px', 
                              borderRadius: '6px', 
                              fontSize: '12px', 
                              fontWeight: 600,
                              backgroundColor: 'rgba(198, 167, 94, 0.1)',
                              color: 'var(--accent-gold)'
                            }}>
                              {log.action.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                              {log.entityType}
                              {log.entityId && (
                                <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '11px', marginLeft: '6px' }}>
                                  #{log.entityId.slice(0, 8)}
                                </span>
                              )}
                            </span>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                              {log.ipAddress || '-'}
                            </span>
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
                    Showing {((auditMeta.page - 1) * auditMeta.limit) + 1} to {Math.min(auditMeta.page * auditMeta.limit, auditMeta.total)} of {auditMeta.total}
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setAuditFilters(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
                      disabled={!auditMeta.hasPrevPage}
                    >
                      <ChevronLeft style={{ width: '16px', height: '16px' }} />
                    </Button>
                    <span style={{ display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: '14px', color: 'var(--text-primary)' }}>
                      Page {auditMeta.page} of {auditMeta.totalPages}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setAuditFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
                      disabled={!auditMeta.hasNextPage}
                    >
                      <ChevronRight style={{ width: '16px', height: '16px' }} />
                    </Button>
                  </div>
                </div>
              </>
            )
          ) : (
            // System Logs
            systemLoading ? (
              <div style={{ padding: '64px', textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', margin: '0 auto 16px', borderRadius: '50%', border: '4px solid var(--accent-gold)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
                <p style={{ color: 'var(--text-muted)' }}>Loading system logs...</p>
              </div>
            ) : systemLogs.length === 0 ? (
              <div style={{ padding: '64px', textAlign: 'center' }}>
                <Server style={{ width: '48px', height: '48px', color: 'var(--text-muted)', margin: '0 auto 16px' }} />
                <p style={{ color: 'var(--text-muted)' }}>No system logs found</p>
              </div>
            ) : (
              <>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Time</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Level</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Message</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Context</th>
                      </tr>
                    </thead>
                    <tbody>
                      {systemLogs.map((log) => {
                        const levelColor = getLogLevelColor(log.level);
                        const LevelIcon = getLogLevelIcon(log.level);
                        return (
                          <tr key={log.id} style={{ borderBottom: '1px solid var(--border-default)' }}>
                            <td style={{ padding: '16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Calendar style={{ width: '14px', height: '14px', color: 'var(--text-muted)' }} />
                                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                  {formatRelativeTime(log.createdAt)}
                                </span>
                              </div>
                            </td>
                            <td style={{ padding: '16px', textAlign: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                <LevelIcon style={{ width: '14px', height: '14px', color: levelColor.text }} />
                                <span style={{ 
                                  padding: '4px 10px', 
                                  borderRadius: '6px', 
                                  fontSize: '11px', 
                                  fontWeight: 600,
                                  backgroundColor: levelColor.bg,
                                  color: levelColor.text
                                }}>
                                  {log.level}
                                </span>
                              </div>
                            </td>
                            <td style={{ padding: '16px' }}>
                              <p style={{ 
                                fontSize: '13px', 
                                color: 'var(--text-primary)', 
                                maxWidth: '400px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {log.message}
                              </p>
                            </td>
                            <td style={{ padding: '16px' }}>
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                {log.context || '-'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
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
                    Showing {((systemMeta.page - 1) * systemMeta.limit) + 1} to {Math.min(systemMeta.page * systemMeta.limit, systemMeta.total)} of {systemMeta.total}
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSystemFilters(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
                      disabled={!systemMeta.hasPrevPage}
                    >
                      <ChevronLeft style={{ width: '16px', height: '16px' }} />
                    </Button>
                    <span style={{ display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: '14px', color: 'var(--text-primary)' }}>
                      Page {systemMeta.page} of {systemMeta.totalPages}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSystemFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
                      disabled={!systemMeta.hasNextPage}
                    >
                      <ChevronRight style={{ width: '16px', height: '16px' }} />
                    </Button>
                  </div>
                </div>
              </>
            )
          )}
        </div>
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

