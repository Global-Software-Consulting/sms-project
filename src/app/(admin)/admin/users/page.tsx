'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Search, 
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Shield,
  Ban,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Edit,
  Eye,
  UserX,
  UserCheck,
  RefreshCw,
  Download,
  X,
  Clock,
  Mail,
  Activity
} from 'lucide-react';
import { Button, Alert, Input } from '@/components/ui';
import { 
  getAdminUsers,
  getUserStatistics,
  banUser,
  unbanUser,
  suspendUser,
  activateUser,
  getUserStatusColor,
  getUserRoleColor,
  formatUserName,
  getUserInitials,
  formatLastLogin,
  type AdminUser,
  type AdminUserQueryParams,
  type UserStatistics
} from '@/lib/api';
import { UserRole, UserStatus } from '@/lib/api/authApi';

/**
 * Admin Users Page - Manage all users
 * 
 * Features:
 * - User statistics cards
 * - Search and filter users
 * - User table with pagination
 * - Quick actions (ban, suspend, activate)
 * - User detail modal
 */
export default function AdminUsersPage() {
  // Users state
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Statistics
  const [stats, setStats] = useState<UserStatistics | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Filters
  const [filters, setFilters] = useState<AdminUserQueryParams>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Action states
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Modals
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showActionModal, setShowActionModal] = useState<'ban' | 'suspend' | null>(null);
  const [actionReason, setActionReason] = useState('');

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAdminUsers(filters);
      setUsers(response.data);
      setMeta(response.meta);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch statistics
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const data = await getUserStatistics();
      setStats(data);
    } catch {
      // Ignore stats errors
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchStats();
  }, []);

  // Handle search
  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchInput || undefined, page: 1 }));
  };

  // Handle filter change
  const handleFilterChange = (key: keyof AdminUserQueryParams, value: string | number | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  // Handle ban user
  const handleBanUser = async () => {
    if (!selectedUser || !actionReason.trim()) return;
    
    try {
      setActionLoading(selectedUser.id);
      await banUser(selectedUser.id, { reason: actionReason });
      setActionSuccess(`User ${formatUserName(selectedUser)} has been banned`);
      setShowActionModal(null);
      setSelectedUser(null);
      setActionReason('');
      await fetchUsers();
      await fetchStats();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to ban user');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle suspend user
  const handleSuspendUser = async () => {
    if (!selectedUser || !actionReason.trim()) return;
    
    try {
      setActionLoading(selectedUser.id);
      await suspendUser(selectedUser.id, { reason: actionReason });
      setActionSuccess(`User ${formatUserName(selectedUser)} has been suspended`);
      setShowActionModal(null);
      setSelectedUser(null);
      setActionReason('');
      await fetchUsers();
      await fetchStats();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to suspend user');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle unban user
  const handleUnbanUser = async (user: AdminUser) => {
    try {
      setActionLoading(user.id);
      await unbanUser(user.id);
      setActionSuccess(`User ${formatUserName(user)} has been unbanned`);
      await fetchUsers();
      await fetchStats();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to unban user');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle activate user
  const handleActivateUser = async (user: AdminUser) => {
    try {
      setActionLoading(user.id);
      await activateUser(user.id);
      setActionSuccess(`User ${formatUserName(user)} has been activated`);
      await fetchUsers();
      await fetchStats();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to activate user');
    } finally {
      setActionLoading(null);
    }
  };

  // Open action modal
  const openActionModal = (user: AdminUser, action: 'ban' | 'suspend') => {
    setSelectedUser(user);
    setShowActionModal(action);
    setActionReason('');
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
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Users</span>
              </div>
              <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>
                User Management
              </h1>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="outline" onClick={fetchUsers}>
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
            icon={Users} 
            label="Total Users" 
            value={statsLoading ? '...' : String(stats?.totalUsers ?? 0)} 
            color="gold" 
          />
          <StatCard 
            icon={CheckCircle} 
            label="Active Users" 
            value={statsLoading ? '...' : String(stats?.activeUsers ?? 0)} 
            color="green" 
          />
          <StatCard 
            icon={Ban} 
            label="Banned Users" 
            value={statsLoading ? '...' : String(stats?.bannedUsers ?? 0)} 
            color="red" 
          />
          <StatCard 
            icon={Activity} 
            label="New This Week" 
            value={statsLoading ? '...' : String(stats?.newUsersThisWeek ?? 0)} 
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
                    placeholder="Search by email, name, or username..."
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
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Role</label>
                <select
                  value={filters.role || ''}
                  onChange={(e) => handleFilterChange('role', e.target.value as UserRole || undefined)}
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
                  <option value="">All Roles</option>
                  <option value="USER">User</option>
                  <option value="VIEWER">Viewer</option>
                  <option value="SUPPORT">Support</option>
                  <option value="FINANCE">Finance</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                  <option value="OWNER">Owner</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Status</label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value as UserStatus || undefined)}
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
                  <option value="">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="BANNED">Banned</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="PENDING">Pending</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Sort By</label>
                <select
                  value={filters.sortBy || 'createdAt'}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value as AdminUserQueryParams['sortBy'])}
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
                  <option value="createdAt">Created Date</option>
                  <option value="lastLoginAt">Last Login</option>
                  <option value="email">Email</option>
                  <option value="abuseScore">Abuse Score</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Order</label>
                <select
                  value={filters.sortOrder || 'desc'}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
                  style={{
                    height: '40px',
                    padding: '0 12px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                    minWidth: '120px'
                  }}
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>

              <Button 
                variant="ghost" 
                onClick={() => {
                  setFilters({ page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' });
                  setSearchInput('');
                }}
                style={{ alignSelf: 'flex-end' }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>

        {/* Users Table */}
        <div style={{ 
          backgroundColor: 'var(--bg-card)', 
          border: '1px solid var(--border-default)', 
          borderRadius: '16px',
          overflow: 'hidden'
        }}>
          {loading ? (
            <div style={{ padding: '64px', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', margin: '0 auto 16px', borderRadius: '50%', border: '4px solid var(--accent-gold)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
              <p style={{ color: 'var(--text-muted)' }}>Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div style={{ padding: '64px', textAlign: 'center' }}>
              <Users style={{ width: '48px', height: '48px', color: 'var(--text-muted)', margin: '0 auto 16px' }} />
              <p style={{ color: 'var(--text-muted)' }}>No users found</p>
            </div>
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>User</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Role</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Last Login</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Abuse</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <UserRow 
                        key={user.id} 
                        user={user} 
                        onBan={() => openActionModal(user, 'ban')}
                        onSuspend={() => openActionModal(user, 'suspend')}
                        onUnban={() => handleUnbanUser(user)}
                        onActivate={() => handleActivateUser(user)}
                        isLoading={actionLoading === user.id}
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
                  Showing {((meta.page - 1) * meta.limit) + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} users
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handlePageChange(meta.page - 1)}
                    disabled={!meta.hasPrevPage}
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
                    disabled={!meta.hasNextPage}
                  >
                    <ChevronRight style={{ width: '16px', height: '16px' }} />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Ban/Suspend Modal */}
      {showActionModal && selectedUser && (
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
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: showActionModal === 'ban' ? 'var(--danger)' : 'var(--warning)' }}>
                {showActionModal === 'ban' ? 'Ban User' : 'Suspend User'}
              </h3>
              <button onClick={() => setShowActionModal(null)} style={{ padding: '8px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>
                <X style={{ width: '20px', height: '20px', color: 'var(--text-muted)' }} />
              </button>
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              padding: '16px', 
              backgroundColor: 'var(--bg-secondary)', 
              borderRadius: '12px', 
              marginBottom: '20px' 
            }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '50%', 
                backgroundColor: 'rgba(198, 167, 94, 0.2)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'var(--accent-gold)',
                fontWeight: 600
              }}>
                {getUserInitials(selectedUser)}
              </div>
              <div>
                <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{formatUserName(selectedUser)}</p>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{selectedUser.email}</p>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Reason <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder={showActionModal === 'ban' ? 'e.g., Violation of terms of service' : 'e.g., Suspicious activity detected'}
                style={{
                  width: '100%',
                  minHeight: '100px',
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
              <Button variant="outline" fullWidth onClick={() => setShowActionModal(null)}>
                Cancel
              </Button>
              <Button 
                variant={showActionModal === 'ban' ? 'danger' : 'primary'} 
                fullWidth 
                onClick={showActionModal === 'ban' ? handleBanUser : handleSuspendUser}
                isLoading={actionLoading === selectedUser.id}
                disabled={!actionReason.trim()}
              >
                {showActionModal === 'ban' ? 'Ban User' : 'Suspend User'}
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
      <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</p>
    </div>
  );
}

interface UserRowProps {
  user: AdminUser;
  onBan: () => void;
  onSuspend: () => void;
  onUnban: () => void;
  onActivate: () => void;
  isLoading: boolean;
}

function UserRow({ user, onBan, onSuspend, onUnban, onActivate, isLoading }: UserRowProps) {
  const [showMenu, setShowMenu] = useState(false);
  const statusColor = getUserStatusColor(user.status);
  const roleColor = getUserRoleColor(user.role);

  return (
    <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
      {/* User */}
      <td style={{ padding: '16px' }}>
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
            fontWeight: 600,
            fontSize: '14px',
            flexShrink: 0
          }}>
            {getUserInitials(user)}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {formatUserName(user)}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.email}
            </p>
          </div>
        </div>
      </td>

      {/* Role */}
      <td style={{ padding: '16px' }}>
        <span style={{ 
          padding: '4px 10px', 
          borderRadius: '6px', 
          fontSize: '12px', 
          fontWeight: 600,
          backgroundColor: roleColor.bg,
          color: roleColor.text
        }}>
          {user.role}
        </span>
      </td>

      {/* Status */}
      <td style={{ padding: '16px' }}>
        <span style={{ 
          padding: '4px 10px', 
          borderRadius: '6px', 
          fontSize: '12px', 
          fontWeight: 600,
          backgroundColor: statusColor.bg,
          color: statusColor.text
        }}>
          {user.status}
        </span>
      </td>

      {/* Last Login */}
      <td style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock style={{ width: '14px', height: '14px', color: 'var(--text-muted)' }} />
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            {formatLastLogin(user.lastLoginAt)}
          </span>
        </div>
      </td>

      {/* Abuse Score */}
      <td style={{ padding: '16px', textAlign: 'center' }}>
        <span style={{ 
          padding: '4px 10px', 
          borderRadius: '6px', 
          fontSize: '12px', 
          fontWeight: 600,
          backgroundColor: user.abuseScore > 50 ? 'rgba(239, 68, 68, 0.1)' : user.abuseScore > 20 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(34, 197, 94, 0.1)',
          color: user.abuseScore > 50 ? 'var(--danger)' : user.abuseScore > 20 ? 'var(--warning)' : 'var(--success)'
        }}>
          {user.abuseScore}
        </span>
      </td>

      {/* Actions */}
      <td style={{ padding: '16px', textAlign: 'right' }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            disabled={isLoading}
            style={{
              padding: '8px',
              borderRadius: '8px',
              backgroundColor: showMenu ? 'var(--bg-secondary)' : 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {isLoading ? (
              <RefreshCw style={{ width: '16px', height: '16px', color: 'var(--text-muted)', animation: 'spin 1s linear infinite' }} />
            ) : (
              <MoreVertical style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
            )}
          </button>

          {showMenu && (
            <>
              <div 
                style={{ position: 'fixed', inset: 0, zIndex: 10 }} 
                onClick={() => setShowMenu(false)} 
              />
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '4px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: '12px',
                padding: '8px',
                minWidth: '160px',
                zIndex: 20,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}>
                <Link 
                  href={`/admin/users/${user.id}`}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    padding: '10px 12px', 
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    textDecoration: 'none',
                    fontSize: '14px'
                  }}
                >
                  <Eye style={{ width: '16px', height: '16px' }} />
                  View Details
                </Link>

                {user.status === 'BANNED' ? (
                  <button
                    onClick={() => { setShowMenu(false); onUnban(); }}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '10px', 
                      padding: '10px 12px', 
                      borderRadius: '8px',
                      color: 'var(--success)',
                      background: 'none',
                      border: 'none',
                      width: '100%',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    <UserCheck style={{ width: '16px', height: '16px' }} />
                    Unban User
                  </button>
                ) : user.status === 'SUSPENDED' ? (
                  <button
                    onClick={() => { setShowMenu(false); onActivate(); }}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '10px', 
                      padding: '10px 12px', 
                      borderRadius: '8px',
                      color: 'var(--success)',
                      background: 'none',
                      border: 'none',
                      width: '100%',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    <UserCheck style={{ width: '16px', height: '16px' }} />
                    Activate User
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => { setShowMenu(false); onSuspend(); }}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px', 
                        padding: '10px 12px', 
                        borderRadius: '8px',
                        color: 'var(--warning)',
                        background: 'none',
                        border: 'none',
                        width: '100%',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      <AlertTriangle style={{ width: '16px', height: '16px' }} />
                      Suspend User
                    </button>
                    <button
                      onClick={() => { setShowMenu(false); onBan(); }}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px', 
                        padding: '10px 12px', 
                        borderRadius: '8px',
                        color: 'var(--danger)',
                        background: 'none',
                        border: 'none',
                        width: '100%',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      <Ban style={{ width: '16px', height: '16px' }} />
                      Ban User
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

