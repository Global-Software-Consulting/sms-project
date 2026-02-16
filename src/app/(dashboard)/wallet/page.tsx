'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Wallet as WalletIcon, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft,
  TrendingUp,
  Gift,
  RefreshCw,
  Filter,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Lock,
  Calendar,
  Download
} from 'lucide-react';
import { Button, Alert } from '@/components/ui';
import { DashboardShell } from '@/components/layout';
import { 
  getWallet, 
  getTransactions,
  formatBalance,
  getTransactionTypeLabel,
  getTransactionTypeColor,
  getTransactionStatusColor,
  isPositiveTransaction,
  type Wallet,
  type WalletTransaction,
  type TransactionType,
  type TransactionStatus,
  type TransactionQueryParams
} from '@/lib/api';

/**
 * Wallet Page - View balance and transaction history
 * 
 * Sections:
 * 1. Balance Card - Large balance display with Add Funds button
 * 2. Wallet Stats - Total deposited, spent, refunded, bonus
 * 3. Transaction History - Filterable list with pagination
 */
export default function WalletPage() {
  // Wallet state
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [walletLoading, setWalletLoading] = useState(true);
  const [walletError, setWalletError] = useState<string | null>(null);

  // Transactions state
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionsMeta, setTransactionsMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Filters
  const [filters, setFilters] = useState<TransactionQueryParams>({
    page: 1,
    limit: 10,
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch wallet on mount
  useEffect(() => {
    fetchWallet();
  }, []);

  // Fetch transactions when filters change
  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const fetchWallet = async () => {
    try {
      setWalletLoading(true);
      setWalletError(null);
      const data = await getWallet();
      setWallet(data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      // If wallet doesn't exist yet (404), show empty state
      if ((err as { response?: { status?: number } }).response?.status === 404) {
        setWallet(null);
      } else {
        setWalletError(error.response?.data?.message || 'Failed to load wallet');
      }
    } finally {
      setWalletLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setTransactionsLoading(true);
      const response = await getTransactions(filters);
      setTransactions(response.data);
      setTransactionsMeta(response.meta);
    } catch {
      // Silently fail for transactions - wallet might not exist yet
      setTransactions([]);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const handleFilterChange = (key: keyof TransactionQueryParams, value: string | number | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
      page: key !== 'page' ? 1 : (value as number), // Reset to page 1 when filter changes
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  // Loading state
  if (walletLoading) {
    return (
      <DashboardShell>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', margin: '0 auto 16px', borderRadius: '50%', border: '4px solid var(--accent-gold)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: 'var(--text-muted)' }}>Loading wallet...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  // No wallet state (user hasn't made any deposits yet)
  if (!wallet && !walletError) {
    return (
      <DashboardShell>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ width: '80px', height: '80px', margin: '0 auto 24px', borderRadius: '20px', backgroundColor: 'rgba(198, 167, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <WalletIcon style={{ width: '40px', height: '40px', color: 'var(--accent-gold)' }} />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
            Your Wallet is Empty
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>
            Add funds to your wallet to start purchasing SMS verification numbers. Your wallet will be created automatically after your first deposit.
          </p>
          <Link href="/wallet/deposit">
            <Button size="lg">
              <Plus style={{ width: '20px', height: '20px', marginRight: '8px' }} />
              Add Funds
            </Button>
          </Link>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '24px' }}>
            Minimum deposit: $5.00 • Maximum: $10,000.00
          </p>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Wallet
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Manage your balance and view transaction history
        </p>
      </div>

      {/* Error Alert */}
      {walletError && (
        <div style={{ marginBottom: '24px' }}>
          <Alert variant="error" dismissible onDismiss={() => setWalletError(null)}>
            {walletError}
          </Alert>
        </div>
      )}

      {/* Locked Wallet Warning */}
      {wallet?.isLocked && (
        <div style={{ marginBottom: '24px' }}>
          <Alert variant="warning">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock style={{ width: '18px', height: '18px' }} />
              <span>Your wallet is locked. {wallet.lockedReason || 'Please contact support for assistance.'}</span>
            </div>
          </Alert>
        </div>
      )}

      {/* Balance Card */}
      <div style={{ 
        background: 'linear-gradient(135deg, rgba(198, 167, 94, 0.1) 0%, rgba(198, 167, 94, 0.05) 100%)',
        border: '1px solid rgba(198, 167, 94, 0.2)',
        borderRadius: '20px',
        padding: '32px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="md:!flex-row md:!items-center md:!justify-between">
          <div>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Available Balance
            </p>
            <p style={{ fontSize: '48px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
              {wallet ? formatBalance(wallet.balance, wallet.currency) : '$0.00'}
            </p>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '8px' }}>
              {wallet?.currency || 'USD'} • Updated {wallet ? new Date(wallet.updatedAt).toLocaleString() : 'N/A'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link href="/wallet/deposit">
              <Button size="lg" disabled={wallet?.isLocked}>
                <Plus style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                Add Funds
              </Button>
            </Link>
            <Button variant="outline" size="lg" onClick={fetchWallet}>
              <RefreshCw style={{ width: '18px', height: '18px' }} />
            </Button>
          </div>
        </div>
      </div>

      {/* Wallet Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '32px' }} className="lg:!grid-cols-4">
        <StatCard
          icon={<ArrowDownLeft style={{ width: '20px', height: '20px' }} />}
          label="Total Deposited"
          value={wallet ? formatBalance(wallet.totalDeposited, wallet.currency) : '$0.00'}
          color="success"
        />
        <StatCard
          icon={<ArrowUpRight style={{ width: '20px', height: '20px' }} />}
          label="Total Spent"
          value={wallet ? formatBalance(wallet.totalSpent, wallet.currency) : '$0.00'}
          color="default"
        />
        <StatCard
          icon={<RefreshCw style={{ width: '20px', height: '20px' }} />}
          label="Total Refunded"
          value={wallet ? formatBalance(wallet.totalRefunded, wallet.currency) : '$0.00'}
          color="info"
        />
        <StatCard
          icon={<Gift style={{ width: '20px', height: '20px' }} />}
          label="Total Bonus"
          value={wallet ? formatBalance(wallet.totalBonus, wallet.currency) : '$0.00'}
          color="gold"
        />
      </div>

      {/* Transaction History */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '16px', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>Transaction History</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {transactionsMeta.total} total transactions
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <Filter style={{ width: '16px', height: '16px', marginRight: '8px' }} />
              Filters
            </Button>
            <Button variant="ghost" size="sm">
              <Download style={{ width: '16px', height: '16px', marginRight: '8px' }} />
              Export
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div style={{ padding: '16px 24px', backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-default)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              {/* Type Filter */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '6px' }}>Type</label>
                <select
                  value={filters.type || ''}
                  onChange={(e) => handleFilterChange('type', e.target.value as TransactionType)}
                  style={{ height: '36px', padding: '0 12px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-default)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px', minWidth: '140px' }}
                >
                  <option value="">All Types</option>
                  <option value="DEPOSIT">Deposit</option>
                  <option value="PURCHASE">Purchase</option>
                  <option value="REFUND">Refund</option>
                  <option value="BONUS">Bonus</option>
                  <option value="ADJUSTMENT">Adjustment</option>
                  <option value="WITHDRAW">Withdrawal</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '6px' }}>Status</label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value as TransactionStatus)}
                  style={{ height: '36px', padding: '0 12px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-default)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px', minWidth: '140px' }}
                >
                  <option value="">All Status</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="PENDING">Pending</option>
                  <option value="FAILED">Failed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="REVERSED">Reversed</option>
                </select>
              </div>

              {/* From Date */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '6px' }}>From Date</label>
                <div style={{ position: 'relative' }}>
                  <Calendar style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--text-muted)' }} />
                  <input
                    type="date"
                    value={filters.fromDate || ''}
                    onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                    style={{ height: '36px', padding: '0 12px 0 34px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-default)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px' }}
                  />
                </div>
              </div>

              {/* To Date */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '6px' }}>To Date</label>
                <div style={{ position: 'relative' }}>
                  <Calendar style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--text-muted)' }} />
                  <input
                    type="date"
                    value={filters.toDate || ''}
                    onChange={(e) => handleFilterChange('toDate', e.target.value)}
                    style={{ height: '36px', padding: '0 12px 0 34px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-default)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px' }}
                  />
                </div>
              </div>

              {/* Clear Filters */}
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setFilters({ page: 1, limit: 10 })}
                >
                  Clear All
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Transaction List */}
        {transactionsLoading ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ width: '32px', height: '32px', margin: '0 auto 12px', borderRadius: '50%', border: '3px solid var(--accent-gold)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: 'var(--text-muted)' }}>Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', margin: '0 auto 16px', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp style={{ width: '24px', height: '24px', color: 'var(--text-muted)' }} />
            </div>
            <p style={{ color: 'var(--text-muted)' }}>No transactions found</p>
            {(filters.type || filters.status || filters.fromDate || filters.toDate) && (
              <Button variant="ghost" size="sm" onClick={() => setFilters({ page: 1, limit: 10 })} style={{ marginTop: '12px' }}>
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div>
            {transactions.map((tx) => (
              <TransactionRow key={tx.id} transaction={tx} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {transactionsMeta.totalPages > 1 && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Showing {((transactionsMeta.page - 1) * transactionsMeta.limit) + 1} - {Math.min(transactionsMeta.page * transactionsMeta.limit, transactionsMeta.total)} of {transactionsMeta.total}
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(transactionsMeta.page - 1)}
                disabled={!transactionsMeta.hasPrevPage}
              >
                <ChevronLeft style={{ width: '16px', height: '16px' }} />
              </Button>
              <span style={{ display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                Page {transactionsMeta.page} of {transactionsMeta.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(transactionsMeta.page + 1)}
                disabled={!transactionsMeta.hasNextPage}
              >
                <ChevronRight style={{ width: '16px', height: '16px' }} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

/* ==================== COMPONENTS ==================== */

function StatCard({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  color: 'success' | 'default' | 'info' | 'gold';
}) {
  const colors = {
    success: { bg: 'rgba(34, 197, 94, 0.1)', text: 'var(--success)' },
    default: { bg: 'var(--bg-secondary)', text: 'var(--text-secondary)' },
    info: { bg: 'rgba(59, 130, 246, 0.1)', text: 'var(--info)' },
    gold: { bg: 'rgba(198, 167, 94, 0.1)', text: 'var(--accent-gold)' },
  };

  const c = colors[color];

  return (
    <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '12px', padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.text }}>
          {icon}
        </div>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{label}</span>
      </div>
      <p style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</p>
    </div>
  );
}

function TransactionRow({ transaction }: { transaction: WalletTransaction }) {
  const isPositive = isPositiveTransaction(transaction.type);
  const typeColor = getTransactionTypeColor(transaction.type);
  const statusColor = getTransactionStatusColor(transaction.status);

  const StatusIcon = {
    PENDING: Clock,
    COMPLETED: CheckCircle,
    FAILED: XCircle,
    CANCELLED: XCircle,
    REVERSED: AlertCircle,
  }[transaction.status] || Clock;

  return (
    <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', gap: '16px' }}>
      {/* Icon */}
      <div style={{ 
        width: '40px', 
        height: '40px', 
        borderRadius: '10px', 
        backgroundColor: isPositive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexShrink: 0
      }}>
        {isPositive ? (
          <ArrowDownLeft style={{ width: '20px', height: '20px', color: 'var(--success)' }} />
        ) : (
          <ArrowUpRight style={{ width: '20px', height: '20px', color: 'var(--danger)' }} />
        )}
      </div>

      {/* Details */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
            {getTransactionTypeLabel(transaction.type)}
          </span>
          <span style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '4px',
            padding: '2px 8px', 
            borderRadius: '4px', 
            fontSize: '11px', 
            fontWeight: 500,
            backgroundColor: `${statusColor}20`,
            color: statusColor
          }}>
            <StatusIcon style={{ width: '12px', height: '12px' }} />
            {transaction.status}
          </span>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {transaction.description || `Transaction ID: ${transaction.id.slice(0, 12)}...`}
        </p>
      </div>

      {/* Amount & Date */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <p style={{ fontWeight: 600, color: isPositive ? 'var(--success)' : 'var(--text-primary)' }}>
          {isPositive ? '+' : '-'}${Math.abs(parseFloat(transaction.amount)).toFixed(2)}
        </p>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
          {new Date(transaction.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

