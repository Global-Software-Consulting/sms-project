'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Crown, 
  Search, 
  Filter,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Download,
  Users,
  DollarSign,
  Calendar,
  Clock,
  Gift,
  X,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Button, Alert } from '@/components/ui';
import { 
  getAdminSubscriptions,
  getMembershipStatistics,
  grantSubscription,
  getSubscriptionStatusColor,
  formatCurrency,
  formatUserName,
  getUserInitials,
  getAdminUsers,
  type AdminSubscription,
  type AdminSubscriptionQueryParams,
  type MembershipStatistics,
  type SubscriptionStatus,
  type AdminUser
} from '@/lib/api';
import { getPlans, type MembershipPlan } from '@/lib/api/membershipApi';

/**
 * Admin Memberships Page - Manage all user subscriptions
 */
export default function AdminMembershipsPage() {
  // Subscriptions state
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
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
  const [stats, setStats] = useState<MembershipStatistics | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Plans for grant modal
  const [plans, setPlans] = useState<MembershipPlan[]>([]);

  // Filters
  const [filters, setFilters] = useState<AdminSubscriptionQueryParams>({
    page: 1,
    limit: 20,
  });
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Action states
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Grant modal
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [grantUserId, setGrantUserId] = useState('');
  const [grantPlanSlug, setGrantPlanSlug] = useState('');
  const [grantDuration, setGrantDuration] = useState('30');
  const [grantReason, setGrantReason] = useState('');
  
  // User search for grant modal
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userSearchResults, setUserSearchResults] = useState<AdminUser[]>([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Fetch subscriptions
  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAdminSubscriptions(filters);
      setSubscriptions(response.data);
      setMeta(response.meta);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch statistics
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const data = await getMembershipStatistics();
      setStats(data);
    } catch {
      // Ignore stats errors
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch plans
  const fetchPlans = async () => {
    try {
      const data = await getPlans();
      setPlans(data);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  useEffect(() => {
    fetchStats();
    fetchPlans();
  }, []);

  // Handle search
  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchInput || undefined, page: 1 }));
  };

  // Search users for grant modal
  const searchUsersForGrant = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setUserSearchResults([]);
      setShowUserDropdown(false);
      return;
    }
    
    try {
      setUserSearchLoading(true);
      const response = await getAdminUsers({ search: query, limit: 10 });
      setUserSearchResults(response.data);
      setShowUserDropdown(true);
    } catch {
      setUserSearchResults([]);
    } finally {
      setUserSearchLoading(false);
    }
  }, []);

  // Debounced user search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (userSearchQuery) {
        searchUsersForGrant(userSearchQuery);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [userSearchQuery, searchUsersForGrant]);

  // Select user from dropdown
  const handleSelectUser = (user: AdminUser) => {
    setSelectedUser(user);
    setGrantUserId(user.id);
    setUserSearchQuery(user.email);
    setShowUserDropdown(false);
  };

  // Clear selected user
  const handleClearUser = () => {
    setSelectedUser(null);
    setGrantUserId('');
    setUserSearchQuery('');
    setUserSearchResults([]);
  };

  // Handle filter change
  const handleFilterChange = (key: keyof AdminSubscriptionQueryParams, value: string | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  // Handle grant subscription
  const handleGrant = async () => {
    if (!grantUserId.trim() || !grantPlanSlug) return;
    
    try {
      setActionLoading(true);
      await grantSubscription({
        userId: grantUserId.trim(),
        planSlug: grantPlanSlug,
        durationDays: parseInt(grantDuration) || 30,
        reason: grantReason || undefined,
      });
      setActionSuccess('Subscription granted successfully');
      setShowGrantModal(false);
      setGrantUserId('');
      setGrantPlanSlug('');
      setGrantDuration('30');
      setGrantReason('');
      setSelectedUser(null);
      setUserSearchQuery('');
      setUserSearchResults([]);
      await fetchSubscriptions();
      await fetchStats();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to grant subscription');
    } finally {
      setActionLoading(false);
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
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Memberships</span>
              </div>
              <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Membership Management
              </h1>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="outline" onClick={fetchSubscriptions}>
                <RefreshCw style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                Refresh
              </Button>
              <Button onClick={() => setShowGrantModal(true)}>
                <Gift style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                Grant Subscription
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
            icon={Crown} 
            label="Total Subscriptions" 
            value={statsLoading ? '...' : String(stats?.totalSubscriptions ?? 0)} 
            color="gold" 
          />
          <StatCard 
            icon={CheckCircle} 
            label="Active" 
            value={statsLoading ? '...' : String(stats?.activeSubscriptions ?? 0)} 
            color="green" 
          />
          <StatCard 
            icon={XCircle} 
            label="Expired" 
            value={statsLoading ? '...' : String(stats?.expiredSubscriptions ?? 0)} 
            color="red" 
          />
          <StatCard 
            icon={DollarSign} 
            label="Total Revenue" 
            value={statsLoading ? '...' : formatCurrency(stats?.totalRevenue || '0')} 
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
                    placeholder="Search by user email..."
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
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value as SubscriptionStatus || undefined)}
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
                  <option value="EXPIRED">Expired</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="PENDING">Pending</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Plan</label>
                <select
                  value={filters.planSlug || ''}
                  onChange={(e) => handleFilterChange('planSlug', e.target.value || undefined)}
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
                  <option value="">All Plans</option>
                  {plans.map(plan => (
                    <option key={plan.slug} value={plan.slug}>{plan.name}</option>
                  ))}
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

        {/* Subscriptions Table */}
        <div style={{ 
          backgroundColor: 'var(--bg-card)', 
          border: '1px solid var(--border-default)', 
          borderRadius: '16px',
          overflow: 'hidden'
        }}>
          {loading ? (
            <div style={{ padding: '64px', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', margin: '0 auto 16px', borderRadius: '50%', border: '4px solid var(--accent-gold)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
              <p style={{ color: 'var(--text-muted)' }}>Loading subscriptions...</p>
            </div>
          ) : subscriptions.length === 0 ? (
            <div style={{ padding: '64px', textAlign: 'center' }}>
              <Crown style={{ width: '48px', height: '48px', color: 'var(--text-muted)', margin: '0 auto 16px' }} />
              <p style={{ color: 'var(--text-muted)' }}>No subscriptions found</p>
            </div>
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>User</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Plan</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Price Paid</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Expires</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Days Left</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.map((sub) => {
                      const statusColor = getSubscriptionStatusColor(sub.status);
                      return (
                        <tr key={sub.id} style={{ borderBottom: '1px solid var(--border-default)' }}>
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
                                {getUserInitials(sub.user as Parameters<typeof getUserInitials>[0])}
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <p style={{ fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {formatUserName(sub.user as Parameters<typeof formatUserName>[0])}
                                </p>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {sub.user.email}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Plan */}
                          <td style={{ padding: '16px' }}>
                            <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                              {sub.plan.name}
                            </span>
                          </td>

                          {/* Status */}
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            <span style={{ 
                              padding: '4px 10px', 
                              borderRadius: '6px', 
                              fontSize: '12px', 
                              fontWeight: 600,
                              backgroundColor: statusColor.bg,
                              color: statusColor.text
                            }}>
                              {sub.status}
                            </span>
                          </td>

                          {/* Price Paid */}
                          <td style={{ padding: '16px', textAlign: 'right' }}>
                            <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                              {formatCurrency(sub.pricePaid)}
                            </span>
                          </td>

                          {/* Expires */}
                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Calendar style={{ width: '14px', height: '14px', color: 'var(--text-muted)' }} />
                              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                                {new Date(sub.endDate).toLocaleDateString()}
                              </span>
                            </div>
                          </td>

                          {/* Days Left */}
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            <span style={{ 
                              padding: '4px 10px', 
                              borderRadius: '6px', 
                              fontSize: '12px', 
                              fontWeight: 600,
                              backgroundColor: sub.daysRemaining > 7 ? 'rgba(34, 197, 94, 0.1)' : sub.daysRemaining > 0 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              color: sub.daysRemaining > 7 ? 'var(--success)' : sub.daysRemaining > 0 ? 'var(--warning)' : 'var(--danger)'
                            }}>
                              {sub.daysRemaining > 0 ? `${sub.daysRemaining} days` : 'Expired'}
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
                  Showing {((meta.page - 1) * meta.limit) + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} subscriptions
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

      {/* Grant Subscription Modal */}
      {showGrantModal && (
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
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--accent-gold)' }}>
                Grant Subscription
              </h3>
              <button onClick={() => setShowGrantModal(false)} style={{ padding: '8px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>
                <X style={{ width: '20px', height: '20px', color: 'var(--text-muted)' }} />
              </button>
            </div>

            <div style={{ marginBottom: '16px', position: 'relative' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Search User <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              
              {/* Selected User Display */}
              {selectedUser ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--accent-gold)',
                  borderRadius: '8px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent-gold)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'var(--bg-primary)'
                    }}>
                      {getUserInitials(selectedUser)}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {formatUserName(selectedUser)}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {selectedUser.email}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={handleClearUser}
                    style={{ 
                      padding: '4px', 
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer',
                      color: 'var(--text-muted)'
                    }}
                  >
                    <X style={{ width: '16px', height: '16px' }} />
                  </button>
                </div>
              ) : (
                <>
                  {/* Search Input */}
                  <div style={{ position: 'relative' }}>
                    <Search style={{ 
                      position: 'absolute', 
                      left: '12px', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      width: '16px', 
                      height: '16px', 
                      color: 'var(--text-muted)' 
                    }} />
                    <input
                      type="text"
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      placeholder="Search by email or username..."
                      style={{
                        width: '100%',
                        height: '44px',
                        padding: '0 12px 0 40px',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-default)',
                        borderRadius: '8px',
                        color: 'var(--text-primary)',
                        fontSize: '14px'
                      }}
                    />
                    {userSearchLoading && (
                      <RefreshCw style={{ 
                        position: 'absolute', 
                        right: '12px', 
                        top: '50%', 
                        transform: 'translateY(-50%)', 
                        width: '16px', 
                        height: '16px', 
                        color: 'var(--text-muted)',
                        animation: 'spin 1s linear infinite'
                      }} />
                    )}
                  </div>
                  
                  {/* Search Results Dropdown */}
                  {showUserDropdown && userSearchResults.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      marginTop: '4px',
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-default)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      zIndex: 10,
                      maxHeight: '200px',
                      overflowY: 'auto'
                    }}>
                      {userSearchResults.map(user => (
                        <button
                          key={user.id}
                          onClick={() => handleSelectUser(user)}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 12px',
                            background: 'none',
                            border: 'none',
                            borderBottom: '1px solid var(--border-subtle)',
                            cursor: 'pointer',
                            textAlign: 'left'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--accent-gold)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: 'var(--bg-primary)',
                            flexShrink: 0
                          }}>
                            {getUserInitials(user)}
                          </div>
                          <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                              {formatUserName(user)}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {user.email}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* No Results Message */}
                  {showUserDropdown && userSearchQuery.length >= 2 && userSearchResults.length === 0 && !userSearchLoading && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      marginTop: '4px',
                      padding: '12px',
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-default)',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: 'var(--text-muted)',
                      textAlign: 'center'
                    }}>
                      No users found
                    </div>
                  )}
                </>
              )}
              
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                Type at least 2 characters to search users by email or username
              </p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Plan <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <select
                value={grantPlanSlug}
                onChange={(e) => setGrantPlanSlug(e.target.value)}
                style={{
                  width: '100%',
                  height: '44px',
                  padding: '0 12px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px'
                }}
              >
                <option value="">Select a plan</option>
                {plans.map(plan => (
                  <option key={plan.slug} value={plan.slug}>{plan.name} - {formatCurrency(plan.price)}/mo</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Duration (days)
              </label>
              <input
                type="number"
                min="1"
                value={grantDuration}
                onChange={(e) => setGrantDuration(e.target.value)}
                placeholder="30"
                style={{
                  width: '100%',
                  height: '44px',
                  padding: '0 12px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Reason (optional)
              </label>
              <textarea
                value={grantReason}
                onChange={(e) => setGrantReason(e.target.value)}
                placeholder="e.g., Promotional gift, compensation..."
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
              <Button variant="outline" fullWidth onClick={() => setShowGrantModal(false)}>
                Cancel
              </Button>
              <Button 
                fullWidth 
                onClick={handleGrant}
                isLoading={actionLoading}
                disabled={!grantUserId.trim() || !grantPlanSlug}
              >
                Grant Subscription
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

