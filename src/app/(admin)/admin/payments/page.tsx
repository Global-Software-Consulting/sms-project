'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  CreditCard, 
  Search, 
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  RefreshCw,
  Download,
  X,
  Clock,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RotateCcw,
  Eye,
  ArrowUpRight,
  Calendar,
  User,
  ExternalLink
} from 'lucide-react';
import { Button, Alert } from '@/components/ui';
import { 
  getAdminPayments,
  getPaymentStatistics,
  refundPayment,
  markPaymentCompleted,
  getPaymentStatusColor,
  getGatewayInfo,
  formatPaymentAmount,
  formatPaymentDate,
  formatRelativeTime,
  formatCurrency,
  type AdminPayment,
  type AdminPaymentQueryParams,
  type PaymentStatistics,
  type PaymentGateway,
  type PaymentStatus
} from '@/lib/api';

/**
 * Admin Payments Page - Manage all payments
 * 
 * Features:
 * - Payment statistics cards with gateway breakdown
 * - Search and filter payments
 * - Payment table with pagination
 * - Quick actions (refund, mark completed)
 * - Payment detail modal
 */
export default function AdminPaymentsPage() {
  // Payments state
  const [payments, setPayments] = useState<AdminPayment[]>([]);
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
  const [stats, setStats] = useState<PaymentStatistics | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Filters
  const [filters, setFilters] = useState<AdminPaymentQueryParams>({
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
  const [selectedPayment, setSelectedPayment] = useState<AdminPayment | null>(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [refundAmount, setRefundAmount] = useState<string>('');
  const [completeNote, setCompleteNote] = useState('');

  // Fetch payments
  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAdminPayments(filters);
      setPayments(response.data);
      setMeta(response.meta);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch statistics
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const data = await getPaymentStatistics();
      setStats(data);
    } catch {
      // Ignore stats errors
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  useEffect(() => {
    fetchStats();
  }, []);

  // Handle search
  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchInput || undefined, page: 1 }));
  };

  // Handle filter change
  const handleFilterChange = (key: keyof AdminPaymentQueryParams, value: string | number | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  // Handle refund
  const handleRefund = async () => {
    if (!selectedPayment || !refundReason.trim()) return;
    
    try {
      setActionLoading(selectedPayment.id);
      await refundPayment(selectedPayment.id, { 
        reason: refundReason,
        amount: refundAmount ? parseFloat(refundAmount) : undefined
      });
      setActionSuccess(`Payment ${selectedPayment.id.slice(0, 8)}... has been refunded`);
      setShowRefundModal(false);
      setSelectedPayment(null);
      setRefundReason('');
      setRefundAmount('');
      await fetchPayments();
      await fetchStats();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to refund payment');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle mark completed
  const handleMarkCompleted = async () => {
    if (!selectedPayment) return;
    
    try {
      setActionLoading(selectedPayment.id);
      await markPaymentCompleted(selectedPayment.id, { note: completeNote || undefined });
      setActionSuccess(`Payment ${selectedPayment.id.slice(0, 8)}... has been marked as completed`);
      setShowCompleteModal(false);
      setSelectedPayment(null);
      setCompleteNote('');
      await fetchPayments();
      await fetchStats();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to complete payment');
    } finally {
      setActionLoading(null);
    }
  };

  // Open modals
  const openRefundModal = (payment: AdminPayment) => {
    setSelectedPayment(payment);
    setShowRefundModal(true);
    setRefundReason('');
    setRefundAmount('');
  };

  const openCompleteModal = (payment: AdminPayment) => {
    setSelectedPayment(payment);
    setShowCompleteModal(true);
    setCompleteNote('');
  };

  const openDetailModal = (payment: AdminPayment) => {
    setSelectedPayment(payment);
    setShowDetailModal(true);
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
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Payments</span>
              </div>
              <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Payment Management
              </h1>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="outline" onClick={() => { fetchPayments(); fetchStats(); }}>
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
            icon={DollarSign} 
            label="Total Revenue" 
            value={statsLoading ? '...' : formatCurrency(stats?.totalRevenue || '0')} 
            subtext={statsLoading ? '' : `${stats?.completedPayments || 0} completed`}
            color="gold" 
          />
          <StatCard 
            icon={TrendingUp} 
            label="This Month" 
            value={statsLoading ? '...' : formatCurrency(stats?.revenueThisMonth || '0')} 
            subtext={statsLoading ? '' : `Avg: ${formatCurrency(stats?.avgPaymentAmount || '0')}`}
            color="green" 
          />
          <StatCard 
            icon={Clock} 
            label="Pending" 
            value={statsLoading ? '...' : String(stats?.pendingPayments || 0)} 
            subtext="Awaiting completion"
            color="yellow" 
          />
          <StatCard 
            icon={RotateCcw} 
            label="Refunded" 
            value={statsLoading ? '...' : String(stats?.refundedPayments || 0)} 
            subtext={statsLoading ? '' : `${stats?.failedPayments || 0} failed`}
            color="red" 
          />
        </div>

        {/* Gateway Breakdown */}
        {stats?.byGateway && (
          <div style={{ 
            backgroundColor: 'var(--bg-card)', 
            border: '1px solid var(--border-default)', 
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
              Gateway Breakdown
            </h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {Object.entries(stats.byGateway).map(([gateway, data]) => {
                const info = getGatewayInfo(gateway as PaymentGateway);
                return (
                  <div 
                    key={gateway}
                    style={{ 
                      padding: '12px 16px', 
                      backgroundColor: 'var(--bg-secondary)', 
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      minWidth: '150px'
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>{info.icon}</span>
                    <div>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{info.name}</p>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {formatCurrency(data.total)}
                      </p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{data.count} payments</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
                    placeholder="Search by payment ID, user email..."
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
                  onChange={(e) => handleFilterChange('status', e.target.value as PaymentStatus || undefined)}
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
                  <option value="PENDING">Pending</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="FAILED">Failed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="EXPIRED">Expired</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Gateway</label>
                <select
                  value={filters.gateway || ''}
                  onChange={(e) => handleFilterChange('gateway', e.target.value as PaymentGateway || undefined)}
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
                  <option value="">All Gateways</option>
                  <option value="STRIPE">Stripe</option>
                  <option value="PAYGATE">PayGate</option>
                  <option value="PLISIO">Plisio</option>
                  <option value="CRYPTOMUS">Cryptomus</option>
                  <option value="NOWPAYMENTS">NOWPayments</option>
                  <option value="VOLET">Volet</option>
                  <option value="BINANCE">Binance</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Sort By</label>
                <select
                  value={filters.sortBy || 'createdAt'}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value as AdminPaymentQueryParams['sortBy'])}
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
                  <option value="amount">Amount</option>
                  <option value="completedAt">Completed Date</option>
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

        {/* Payments Table */}
        <div style={{ 
          backgroundColor: 'var(--bg-card)', 
          border: '1px solid var(--border-default)', 
          borderRadius: '16px',
          overflow: 'hidden'
        }}>
          {loading ? (
            <div style={{ padding: '64px', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', margin: '0 auto 16px', borderRadius: '50%', border: '4px solid var(--accent-gold)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
              <p style={{ color: 'var(--text-muted)' }}>Loading payments...</p>
            </div>
          ) : payments.length === 0 ? (
            <div style={{ padding: '64px', textAlign: 'center' }}>
              <CreditCard style={{ width: '48px', height: '48px', color: 'var(--text-muted)', margin: '0 auto 16px' }} />
              <p style={{ color: 'var(--text-muted)' }}>No payments found</p>
            </div>
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Payment</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>User</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Gateway</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Amount</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Date</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <PaymentRow 
                        key={payment.id} 
                        payment={payment} 
                        onView={() => openDetailModal(payment)}
                        onRefund={() => openRefundModal(payment)}
                        onComplete={() => openCompleteModal(payment)}
                        isLoading={actionLoading === payment.id}
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
                  Showing {((meta.page - 1) * meta.limit) + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} payments
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

      {/* Refund Modal */}
      {showRefundModal && selectedPayment && (
        <Modal onClose={() => setShowRefundModal(false)}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--danger)' }}>
              Refund Payment
            </h3>
            <button onClick={() => setShowRefundModal(false)} style={{ padding: '8px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X style={{ width: '20px', height: '20px', color: 'var(--text-muted)' }} />
            </button>
          </div>

          <PaymentSummary payment={selectedPayment} />

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Refund Amount (optional, leave empty for full refund)
            </label>
            <input
              type="number"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              placeholder={`Max: ${selectedPayment.amount}`}
              step="0.01"
              min="0"
              max={parseFloat(selectedPayment.amount)}
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
              Reason <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <textarea
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="e.g., Customer request, Duplicate payment, Service issue"
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
            <Button variant="outline" fullWidth onClick={() => setShowRefundModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="danger" 
              fullWidth 
              onClick={handleRefund}
              isLoading={actionLoading === selectedPayment.id}
              disabled={!refundReason.trim()}
            >
              Process Refund
            </Button>
          </div>
        </Modal>
      )}

      {/* Mark Completed Modal */}
      {showCompleteModal && selectedPayment && (
        <Modal onClose={() => setShowCompleteModal(false)}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--success)' }}>
              Mark Payment Completed
            </h3>
            <button onClick={() => setShowCompleteModal(false)} style={{ padding: '8px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X style={{ width: '20px', height: '20px', color: 'var(--text-muted)' }} />
            </button>
          </div>

          <PaymentSummary payment={selectedPayment} />

          <div style={{ 
            padding: '12px', 
            backgroundColor: 'rgba(245, 158, 11, 0.1)', 
            borderRadius: '8px', 
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}>
            <AlertTriangle style={{ width: '18px', height: '18px', color: 'var(--warning)', flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: '13px', color: 'var(--warning)' }}>
              This will manually credit the user&apos;s wallet with the payment amount. Use this only for verified payments that didn&apos;t complete automatically.
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Note (optional)
            </label>
            <textarea
              value={completeNote}
              onChange={(e) => setCompleteNote(e.target.value)}
              placeholder="e.g., Verified via gateway dashboard, Transaction ID: xxx"
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
            <Button variant="outline" fullWidth onClick={() => setShowCompleteModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              fullWidth 
              onClick={handleMarkCompleted}
              isLoading={actionLoading === selectedPayment.id}
            >
              Mark as Completed
            </Button>
          </div>
        </Modal>
      )}

      {/* Payment Detail Modal */}
      {showDetailModal && selectedPayment && (
        <Modal onClose={() => setShowDetailModal(false)} wide>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Payment Details
            </h3>
            <button onClick={() => setShowDetailModal(false)} style={{ padding: '8px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X style={{ width: '20px', height: '20px', color: 'var(--text-muted)' }} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Left Column */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase' }}>
                Payment Info
              </h4>
              <DetailRow label="Payment ID" value={selectedPayment.id} mono />
              <DetailRow label="Gateway" value={getGatewayInfo(selectedPayment.gateway).name} icon={getGatewayInfo(selectedPayment.gateway).icon} />
              <DetailRow label="Status" value={selectedPayment.status} badge={getPaymentStatusColor(selectedPayment.status)} />
              <DetailRow label="Amount" value={formatPaymentAmount(selectedPayment.amount, selectedPayment.currency)} />
              {selectedPayment.feeAmount && (
                <DetailRow label="Fee" value={formatPaymentAmount(selectedPayment.feeAmount, selectedPayment.currency)} />
              )}
              {selectedPayment.netAmount && (
                <DetailRow label="Net Amount" value={formatPaymentAmount(selectedPayment.netAmount, selectedPayment.currency)} />
              )}
              <DetailRow label="Currency" value={selectedPayment.currency} />
            </div>

            {/* Right Column */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase' }}>
                User & Dates
              </h4>
              <DetailRow label="User Email" value={selectedPayment.user.email} />
              <DetailRow label="User Name" value={selectedPayment.user.firstName ? `${selectedPayment.user.firstName} ${selectedPayment.user.lastName || ''}` : '-'} />
              <DetailRow label="Created" value={formatPaymentDate(selectedPayment.createdAt)} />
              <DetailRow label="Completed" value={formatPaymentDate(selectedPayment.completedAt)} />
              <DetailRow label="Expires" value={formatPaymentDate(selectedPayment.expiresAt)} />
              {selectedPayment.refundedAt && (
                <>
                  <DetailRow label="Refunded" value={formatPaymentDate(selectedPayment.refundedAt)} />
                  <DetailRow label="Refund Reason" value={selectedPayment.refundReason || '-'} />
                </>
              )}
            </div>
          </div>

          {/* Gateway Details */}
          {selectedPayment.gatewayPaymentId && (
            <div style={{ marginTop: '24px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase' }}>
                Gateway Details
              </h4>
              <DetailRow label="Gateway Payment ID" value={selectedPayment.gatewayPaymentId} mono />
              {selectedPayment.checkoutUrl && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Checkout URL:</span>
                  <a 
                    href={selectedPayment.checkoutUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ fontSize: '13px', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    Open <ExternalLink style={{ width: '12px', height: '12px' }} />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-default)' }}>
            <Button variant="outline" onClick={() => setShowDetailModal(false)}>
              Close
            </Button>
            {selectedPayment.status === 'PENDING' && (
              <Button variant="primary" onClick={() => { setShowDetailModal(false); openCompleteModal(selectedPayment); }}>
                <CheckCircle style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                Mark Completed
              </Button>
            )}
            {selectedPayment.status === 'COMPLETED' && (
              <Button variant="danger" onClick={() => { setShowDetailModal(false); openRefundModal(selectedPayment); }}>
                <RotateCcw style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                Refund
              </Button>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ==================== COMPONENTS ==================== */

interface StatCardProps {
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  label: string;
  value: string;
  subtext?: string;
  color: 'gold' | 'green' | 'red' | 'yellow' | 'blue';
}

function StatCard({ icon: Icon, label, value, subtext, color }: StatCardProps) {
  const colors = {
    gold: { bg: 'rgba(198, 167, 94, 0.1)', text: 'var(--accent-gold)' },
    green: { bg: 'rgba(34, 197, 94, 0.1)', text: 'var(--success)' },
    red: { bg: 'rgba(239, 68, 68, 0.1)', text: 'var(--danger)' },
    yellow: { bg: 'rgba(245, 158, 11, 0.1)', text: 'var(--warning)' },
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

interface PaymentRowProps {
  payment: AdminPayment;
  onView: () => void;
  onRefund: () => void;
  onComplete: () => void;
  isLoading: boolean;
}

function PaymentRow({ payment, onView, onRefund, onComplete, isLoading }: PaymentRowProps) {
  const [showMenu, setShowMenu] = useState(false);
  const statusColor = getPaymentStatusColor(payment.status);
  const gatewayInfo = getGatewayInfo(payment.gateway);

  return (
    <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
      {/* Payment ID */}
      <td style={{ padding: '16px' }}>
        <div>
          <p style={{ fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '13px' }}>
            {payment.id.slice(0, 8)}...
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {formatRelativeTime(payment.createdAt)}
          </p>
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
            {payment.user.email[0].toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {payment.user.firstName || payment.user.email.split('@')[0]}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {payment.user.email}
            </p>
          </div>
        </div>
      </td>

      {/* Gateway */}
      <td style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>{gatewayInfo.icon}</span>
          <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{gatewayInfo.name}</span>
        </div>
      </td>

      {/* Amount */}
      <td style={{ padding: '16px', textAlign: 'right' }}>
        <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '15px' }}>
          {formatPaymentAmount(payment.amount, payment.currency)}
        </p>
        {payment.feeAmount && parseFloat(payment.feeAmount) > 0 && (
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Fee: {formatPaymentAmount(payment.feeAmount, payment.currency)}
          </p>
        )}
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
          {payment.status}
        </span>
      </td>

      {/* Date */}
      <td style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar style={{ width: '14px', height: '14px', color: 'var(--text-muted)' }} />
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {new Date(payment.createdAt).toLocaleDateString()}
          </span>
        </div>
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
                <button
                  onClick={() => { setShowMenu(false); onView(); }}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    padding: '10px 12px', 
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    background: 'none',
                    border: 'none',
                    width: '100%',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  <Eye style={{ width: '16px', height: '16px' }} />
                  View Details
                </button>

                {payment.status === 'PENDING' && (
                  <button
                    onClick={() => { setShowMenu(false); onComplete(); }}
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
                    <CheckCircle style={{ width: '16px', height: '16px' }} />
                    Mark Completed
                  </button>
                )}

                {payment.status === 'COMPLETED' && (
                  <button
                    onClick={() => { setShowMenu(false); onRefund(); }}
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
                    <RotateCcw style={{ width: '16px', height: '16px' }} />
                    Refund
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}

function Modal({ children, onClose, wide }: ModalProps) {
  return (
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
        maxWidth: wide ? '700px' : '450px', 
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {children}
      </div>
    </div>
  );
}

function PaymentSummary({ payment }: { payment: AdminPayment }) {
  const gatewayInfo = getGatewayInfo(payment.gateway);
  const statusColor = getPaymentStatusColor(payment.status);

  return (
    <div style={{ 
      padding: '16px', 
      backgroundColor: 'var(--bg-secondary)', 
      borderRadius: '12px', 
      marginBottom: '20px' 
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>{gatewayInfo.icon}</span>
          <div>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{gatewayInfo.name}</p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{payment.id.slice(0, 16)}...</p>
          </div>
        </div>
        <span style={{ 
          padding: '4px 10px', 
          borderRadius: '6px', 
          fontSize: '12px', 
          fontWeight: 600,
          backgroundColor: statusColor.bg,
          color: statusColor.text
        }}>
          {payment.status}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Amount</p>
          <p style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {formatPaymentAmount(payment.amount, payment.currency)}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>User</p>
          <p style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{payment.user.email}</p>
        </div>
      </div>
    </div>
  );
}

interface DetailRowProps {
  label: string;
  value: string;
  mono?: boolean;
  icon?: string;
  badge?: { bg: string; text: string };
}

function DetailRow({ label, value, mono, icon, badge }: DetailRowProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-default)' }}>
      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {icon && <span>{icon}</span>}
        {badge ? (
          <span style={{ 
            padding: '2px 8px', 
            borderRadius: '4px', 
            fontSize: '12px', 
            fontWeight: 600,
            backgroundColor: badge.bg,
            color: badge.text
          }}>
            {value}
          </span>
        ) : (
          <span style={{ 
            fontSize: '13px', 
            color: 'var(--text-primary)', 
            fontFamily: mono ? 'monospace' : 'inherit',
            maxWidth: '200px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {value}
          </span>
        )}
      </div>
    </div>
  );
}

