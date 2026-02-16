'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Wallet, 
  Search, 
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Lock,
  Unlock,
  Plus,
  Minus,
  RefreshCw,
  Download,
  Eye,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  X
} from 'lucide-react';
import { Button, Alert } from '@/components/ui';
import { 
  getAdminWallets,
  getWalletStatistics,
  creditWallet,
  debitWallet,
  lockWallet,
  unlockWallet,
  formatCurrency,
  formatUserName,
  getUserInitials,
  type AdminWallet,
  type AdminWalletQueryParams,
  type WalletStatistics
} from '@/lib/api';

/**
 * Admin Wallets Page - Manage all user wallets
 */
export default function AdminWalletsPage() {
  // Wallets state
  const [wallets, setWallets] = useState<AdminWallet[]>([]);
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
  const [stats, setStats] = useState<WalletStatistics | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Filters
  const [filters, setFilters] = useState<AdminWalletQueryParams>({
    page: 1,
    limit: 20,
  });
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Action states
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Modals
  const [selectedWallet, setSelectedWallet] = useState<AdminWallet | null>(null);
  const [showActionModal, setShowActionModal] = useState<'credit' | 'debit' | 'lock' | null>(null);
  const [actionAmount, setActionAmount] = useState('');
  const [actionDescription, setActionDescription] = useState('');

  // Fetch wallets
  const fetchWallets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAdminWallets(filters);
      setWallets(response.data);
      setMeta(response.meta);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load wallets');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch statistics
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const data = await getWalletStatistics();
      setStats(data);
    } catch {
      // Ignore stats errors
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  useEffect(() => {
    fetchStats();
  }, []);

  // Handle search
  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchInput || undefined, page: 1 }));
  };

  // Handle filter change
  const handleFilterChange = (key: keyof AdminWalletQueryParams, value: string | number | boolean | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  // Handle credit wallet
  const handleCredit = async () => {
    if (!selectedWallet || !actionAmount || !actionDescription.trim()) return;
    
    try {
      setActionLoading(selectedWallet.userId);
      await creditWallet(selectedWallet.userId, { 
        amount: parseFloat(actionAmount), 
        description: actionDescription 
      });
      setActionSuccess(`Successfully credited $${actionAmount} to wallet`);
      closeModal();
      await fetchWallets();
      await fetchStats();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to credit wallet');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle debit wallet
  const handleDebit = async () => {
    if (!selectedWallet || !actionAmount || !actionDescription.trim()) return;
    
    try {
      setActionLoading(selectedWallet.userId);
      await debitWallet(selectedWallet.userId, { 
        amount: parseFloat(actionAmount), 
        description: actionDescription 
      });
      setActionSuccess(`Successfully debited $${actionAmount} from wallet`);
      closeModal();
      await fetchWallets();
      await fetchStats();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to debit wallet');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle lock wallet
  const handleLock = async () => {
    if (!selectedWallet || !actionDescription.trim()) return;
    
    try {
      setActionLoading(selectedWallet.userId);
      await lockWallet(selectedWallet.userId, { reason: actionDescription });
      setActionSuccess('Wallet has been locked');
      closeModal();
      await fetchWallets();
      await fetchStats();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to lock wallet');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle unlock wallet
  const handleUnlock = async (wallet: AdminWallet) => {
    try {
      setActionLoading(wallet.userId);
      await unlockWallet(wallet.userId);
      setActionSuccess('Wallet has been unlocked');
      await fetchWallets();
      await fetchStats();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to unlock wallet');
    } finally {
      setActionLoading(null);
    }
  };

  // Open action modal
  const openModal = (wallet: AdminWallet, action: 'credit' | 'debit' | 'lock') => {
    setSelectedWallet(wallet);
    setShowActionModal(action);
    setActionAmount('');
    setActionDescription('');
  };

  // Close modal
  const closeModal = () => {
    setShowActionModal(null);
    setSelectedWallet(null);
    setActionAmount('');
    setActionDescription('');
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
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Wallets</span>
              </div>
              <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Wallet Management
              </h1>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="outline" onClick={fetchWallets}>
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
            icon={Wallet} 
            label="Total Wallets" 
            value={statsLoading ? '...' : String(stats?.totalWallets ?? 0)} 
            color="gold" 
          />
          <StatCard 
            icon={DollarSign} 
            label="Total Balance" 
            value={statsLoading ? '...' : formatCurrency(stats?.totalBalance || '0')} 
            color="green" 
          />
          <StatCard 
            icon={TrendingUp} 
            label="Total Deposited" 
            value={statsLoading ? '...' : formatCurrency(stats?.totalDeposited || '0')} 
            color="blue" 
          />
          <StatCard 
            icon={Lock} 
            label="Locked Wallets" 
            value={statsLoading ? '...' : String(stats?.lockedWallets ?? 0)} 
            color="red" 
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
                  value={filters.isLocked === undefined ? '' : filters.isLocked.toString()}
                  onChange={(e) => handleFilterChange('isLocked', e.target.value === '' ? undefined : e.target.value === 'true')}
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
                  <option value="">All Wallets</option>
                  <option value="false">Active</option>
                  <option value="true">Locked</option>
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

        {/* Wallets Table */}
        <div style={{ 
          backgroundColor: 'var(--bg-card)', 
          border: '1px solid var(--border-default)', 
          borderRadius: '16px',
          overflow: 'hidden'
        }}>
          {loading ? (
            <div style={{ padding: '64px', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', margin: '0 auto 16px', borderRadius: '50%', border: '4px solid var(--accent-gold)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
              <p style={{ color: 'var(--text-muted)' }}>Loading wallets...</p>
            </div>
          ) : wallets.length === 0 ? (
            <div style={{ padding: '64px', textAlign: 'center' }}>
              <Wallet style={{ width: '48px', height: '48px', color: 'var(--text-muted)', margin: '0 auto 16px' }} />
              <p style={{ color: 'var(--text-muted)' }}>No wallets found</p>
            </div>
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>User</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Balance</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Created</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wallets.map((wallet) => (
                      <WalletRow 
                        key={wallet.id} 
                        wallet={wallet}
                        onCredit={() => openModal(wallet, 'credit')}
                        onDebit={() => openModal(wallet, 'debit')}
                        onLock={() => openModal(wallet, 'lock')}
                        onUnlock={() => handleUnlock(wallet)}
                        isLoading={actionLoading === wallet.userId}
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
                  Showing {((meta.page - 1) * meta.limit) + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} wallets
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

      {/* Credit/Debit/Lock Modal */}
      {showActionModal && selectedWallet && (
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
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: 600, 
                color: showActionModal === 'credit' ? 'var(--success)' : showActionModal === 'debit' ? 'var(--warning)' : 'var(--danger)'
              }}>
                {showActionModal === 'credit' ? 'Credit Wallet' : showActionModal === 'debit' ? 'Debit Wallet' : 'Lock Wallet'}
              </h3>
              <button onClick={closeModal} style={{ padding: '8px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>
                <X style={{ width: '20px', height: '20px', color: 'var(--text-muted)' }} />
              </button>
            </div>

            {/* User Info */}
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
                {getUserInitials(selectedWallet.user as unknown as Parameters<typeof getUserInitials>[0])}
              </div>
              <div>
                <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                  {formatUserName(selectedWallet.user as unknown as Parameters<typeof formatUserName>[0])}
                </p>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                  Balance: {formatCurrency(selectedWallet.balance)}
                </p>
              </div>
            </div>

            {/* Amount Input (for credit/debit) */}
            {(showActionModal === 'credit' || showActionModal === 'debit') && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Amount <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>$</span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={actionAmount}
                    onChange={(e) => setActionAmount(e.target.value)}
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      height: '44px',
                      paddingLeft: '28px',
                      paddingRight: '12px',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-default)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Description/Reason */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
                {showActionModal === 'lock' ? 'Reason' : 'Description'} <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <textarea
                value={actionDescription}
                onChange={(e) => setActionDescription(e.target.value)}
                placeholder={showActionModal === 'credit' ? 'e.g., Promotional bonus' : showActionModal === 'debit' ? 'e.g., Chargeback adjustment' : 'e.g., Suspicious activity'}
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
              <Button variant="outline" fullWidth onClick={closeModal}>
                Cancel
              </Button>
              <Button 
                variant={showActionModal === 'credit' ? 'primary' : showActionModal === 'debit' ? 'primary' : 'danger'} 
                fullWidth 
                onClick={showActionModal === 'credit' ? handleCredit : showActionModal === 'debit' ? handleDebit : handleLock}
                isLoading={actionLoading === selectedWallet.userId}
                disabled={!actionDescription.trim() || ((showActionModal === 'credit' || showActionModal === 'debit') && (!actionAmount || parseFloat(actionAmount) <= 0))}
              >
                {showActionModal === 'credit' ? 'Credit' : showActionModal === 'debit' ? 'Debit' : 'Lock'}
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

interface WalletRowProps {
  wallet: AdminWallet;
  onCredit: () => void;
  onDebit: () => void;
  onLock: () => void;
  onUnlock: () => void;
  isLoading: boolean;
}

function WalletRow({ wallet, onCredit, onDebit, onLock, onUnlock, isLoading }: WalletRowProps) {
  const [showMenu, setShowMenu] = useState(false);

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
            {getUserInitials(wallet.user as unknown as Parameters<typeof getUserInitials>[0])}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {formatUserName(wallet.user as unknown as Parameters<typeof formatUserName>[0])}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {wallet.user.email}
            </p>
          </div>
        </div>
      </td>

      {/* Balance */}
      <td style={{ padding: '16px', textAlign: 'right' }}>
        <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
          {formatCurrency(wallet.balance)}
        </span>
      </td>

      {/* Status */}
      <td style={{ padding: '16px', textAlign: 'center' }}>
        <span style={{ 
          padding: '4px 10px', 
          borderRadius: '6px', 
          fontSize: '12px', 
          fontWeight: 600,
          backgroundColor: wallet.isLocked ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
          color: wallet.isLocked ? 'var(--danger)' : 'var(--success)'
        }}>
          {wallet.isLocked ? 'Locked' : 'Active'}
        </span>
      </td>

      {/* Created */}
      <td style={{ padding: '16px' }}>
        <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          {new Date(wallet.createdAt).toLocaleDateString()}
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
                  href={`/admin/wallets/${wallet.userId}`}
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

                <button
                  onClick={() => { setShowMenu(false); onCredit(); }}
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
                  <Plus style={{ width: '16px', height: '16px' }} />
                  Credit
                </button>

                <button
                  onClick={() => { setShowMenu(false); onDebit(); }}
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
                  <Minus style={{ width: '16px', height: '16px' }} />
                  Debit
                </button>

                {wallet.isLocked ? (
                  <button
                    onClick={() => { setShowMenu(false); onUnlock(); }}
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
                    <Unlock style={{ width: '16px', height: '16px' }} />
                    Unlock
                  </button>
                ) : (
                  <button
                    onClick={() => { setShowMenu(false); onLock(); }}
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
                    <Lock style={{ width: '16px', height: '16px' }} />
                    Lock
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

