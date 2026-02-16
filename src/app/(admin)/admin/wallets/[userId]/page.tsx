'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft,
  Wallet,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Gift,
  Lock,
  Unlock,
  Plus,
  Minus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  X
} from 'lucide-react';
import { Button, Alert } from '@/components/ui';
import { 
  getAdminWallet,
  creditWallet,
  debitWallet,
  adjustWallet,
  lockWallet,
  unlockWallet,
  formatCurrency,
  formatUserName,
  getUserInitials,
  type AdminWalletDetail
} from '@/lib/api';
import { getWalletTransactions, type WalletTransaction, type TransactionQueryParams } from '@/lib/api/walletApi';

/**
 * Admin Wallet Detail Page
 */
export default function AdminWalletDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  // State
  const [wallet, setWallet] = useState<AdminWalletDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Transactions
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [txLoading, setTxLoading] = useState(true);
  const [txMeta, setTxMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [txFilters, setTxFilters] = useState<TransactionQueryParams>({
    page: 1,
    limit: 10,
  });

  // Action states
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showActionModal, setShowActionModal] = useState<'credit' | 'debit' | 'adjust' | 'lock' | null>(null);
  const [actionAmount, setActionAmount] = useState('');
  const [actionDescription, setActionDescription] = useState('');

  // Fetch wallet
  const fetchWallet = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminWallet(userId);
      setWallet(data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load wallet');
    } finally {
      setLoading(false);
    }
  };

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    try {
      setTxLoading(true);
      // Note: This would need a backend endpoint that accepts userId filter
      // For now, we'll show the wallet's transactions
      const response = await getWalletTransactions(txFilters);
      setTransactions(response.data);
      setTxMeta(response.meta);
    } catch {
      // Ignore transaction errors
    } finally {
      setTxLoading(false);
    }
  }, [txFilters]);

  useEffect(() => {
    if (userId) {
      fetchWallet();
    }
  }, [userId]);

  useEffect(() => {
    if (wallet) {
      fetchTransactions();
    }
  }, [wallet, fetchTransactions]);

  // Handle credit
  const handleCredit = async () => {
    if (!actionAmount || !actionDescription.trim()) return;
    
    try {
      setActionLoading('credit');
      await creditWallet(userId, { 
        amount: parseFloat(actionAmount), 
        description: actionDescription 
      });
      setSuccess(`Successfully credited ${formatCurrency(actionAmount)}`);
      closeModal();
      await fetchWallet();
      await fetchTransactions();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to credit wallet');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle debit
  const handleDebit = async () => {
    if (!actionAmount || !actionDescription.trim()) return;
    
    try {
      setActionLoading('debit');
      await debitWallet(userId, { 
        amount: parseFloat(actionAmount), 
        description: actionDescription 
      });
      setSuccess(`Successfully debited ${formatCurrency(actionAmount)}`);
      closeModal();
      await fetchWallet();
      await fetchTransactions();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to debit wallet');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle adjust
  const handleAdjust = async () => {
    if (!actionAmount || !actionDescription.trim()) return;
    
    try {
      setActionLoading('adjust');
      await adjustWallet(userId, { 
        amount: parseFloat(actionAmount), 
        description: actionDescription 
      });
      setSuccess(`Successfully adjusted wallet by ${formatCurrency(actionAmount)}`);
      closeModal();
      await fetchWallet();
      await fetchTransactions();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to adjust wallet');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle lock
  const handleLock = async () => {
    if (!actionDescription.trim()) return;
    
    try {
      setActionLoading('lock');
      await lockWallet(userId, { reason: actionDescription });
      setSuccess('Wallet has been locked');
      closeModal();
      await fetchWallet();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to lock wallet');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle unlock
  const handleUnlock = async () => {
    try {
      setActionLoading('unlock');
      await unlockWallet(userId);
      setSuccess('Wallet has been unlocked');
      await fetchWallet();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to unlock wallet');
    } finally {
      setActionLoading(null);
    }
  };

  // Close modal
  const closeModal = () => {
    setShowActionModal(null);
    setActionAmount('');
    setActionDescription('');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', margin: '0 auto 16px', borderRadius: '50%', border: '4px solid var(--accent-gold)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'var(--text-muted)' }}>Loading wallet...</p>
        </div>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', padding: '24px' }}>
        <div style={{ maxWidth: '600px', margin: '64px auto', textAlign: 'center' }}>
          <Wallet style={{ width: '64px', height: '64px', color: 'var(--text-muted)', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Wallet Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>The wallet you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/admin/wallets">
            <Button>Back to Wallets</Button>
          </Link>
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
        padding: '24px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Link href="/admin/wallets" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>
              <ArrowLeft style={{ width: '16px', height: '16px' }} />
              Back to Wallets
            </Link>
          </div>

          {/* Wallet Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                width: '72px', 
                height: '72px', 
                borderRadius: '50%', 
                backgroundColor: 'rgba(198, 167, 94, 0.2)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'var(--accent-gold)',
                fontWeight: 700,
                fontSize: '24px'
              }}>
                {getUserInitials(wallet.user as unknown as Parameters<typeof getUserInitials>[0])}
              </div>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {formatUserName(wallet.user as unknown as Parameters<typeof formatUserName>[0])}&apos;s Wallet
                </h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>{wallet.user.email}</p>
                <span style={{ 
                  padding: '4px 10px', 
                  borderRadius: '6px', 
                  fontSize: '12px', 
                  fontWeight: 600,
                  backgroundColor: wallet.isLocked ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                  color: wallet.isLocked ? 'var(--danger)' : 'var(--success)'
                }}>
                  {wallet.isLocked ? '🔒 Locked' : '✓ Active'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Button variant="outline" onClick={() => setShowActionModal('credit')}>
                <Plus style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                Credit
              </Button>
              <Button variant="outline" onClick={() => setShowActionModal('debit')}>
                <Minus style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                Debit
              </Button>
              {wallet.isLocked ? (
                <Button variant="outline" onClick={handleUnlock} isLoading={actionLoading === 'unlock'}>
                  <Unlock style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                  Unlock
                </Button>
              ) : (
                <Button variant="danger" onClick={() => setShowActionModal('lock')}>
                  <Lock style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                  Lock
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
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

        {/* Balance Card */}
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(198, 167, 94, 0.15) 0%, rgba(198, 167, 94, 0.05) 100%)',
          border: '1px solid rgba(198, 167, 94, 0.3)',
          borderRadius: '20px',
          padding: '32px',
          marginBottom: '24px'
        }}>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>Current Balance</p>
          <p style={{ fontSize: '48px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '24px' }}>
            {formatCurrency(wallet.balance)}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }} className="sm:!grid-cols-4">
            <StatBox icon={TrendingUp} label="Total Deposited" value={formatCurrency(wallet.totalDeposited)} color="green" />
            <StatBox icon={TrendingDown} label="Total Spent" value={formatCurrency(wallet.totalSpent)} color="red" />
            <StatBox icon={RefreshCw} label="Total Refunded" value={formatCurrency(wallet.totalRefunded)} color="blue" />
            <StatBox icon={Gift} label="Total Bonus" value={formatCurrency(wallet.totalBonus)} color="gold" />
          </div>
        </div>

        {/* Locked Warning */}
        {wallet.isLocked && wallet.lockedReason && (
          <div style={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <Lock style={{ width: '20px', height: '20px', color: 'var(--danger)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ fontWeight: 600, color: 'var(--danger)', marginBottom: '4px' }}>Wallet Locked</p>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{wallet.lockedReason}</p>
              {wallet.lockedAt && (
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Locked on {new Date(wallet.lockedAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Transaction History */}
        <div style={{ 
          backgroundColor: 'var(--bg-card)', 
          border: '1px solid var(--border-default)', 
          borderRadius: '16px',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border-default)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Transaction History
            </h3>
          </div>

          {txLoading ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <div style={{ width: '32px', height: '32px', margin: '0 auto 12px', borderRadius: '50%', border: '3px solid var(--accent-gold)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <DollarSign style={{ width: '40px', height: '40px', color: 'var(--text-muted)', margin: '0 auto 12px' }} />
              <p style={{ color: 'var(--text-muted)' }}>No transactions yet</p>
            </div>
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Type</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Amount</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Description</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} style={{ borderBottom: '1px solid var(--border-default)' }}>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ 
                              width: '32px', 
                              height: '32px', 
                              borderRadius: '8px', 
                              backgroundColor: ['DEPOSIT', 'BONUS', 'REFUND'].includes(tx.type) ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {['DEPOSIT', 'BONUS', 'REFUND'].includes(tx.type) ? (
                                <ArrowDownRight style={{ width: '16px', height: '16px', color: 'var(--success)' }} />
                              ) : (
                                <ArrowUpRight style={{ width: '16px', height: '16px', color: 'var(--danger)' }} />
                              )}
                            </div>
                            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                              {tx.type}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '16px', textAlign: 'right' }}>
                          <span style={{ 
                            fontWeight: 600, 
                            color: ['DEPOSIT', 'BONUS', 'REFUND'].includes(tx.type) ? 'var(--success)' : 'var(--danger)'
                          }}>
                            {['DEPOSIT', 'BONUS', 'REFUND'].includes(tx.type) ? '+' : '-'}{formatCurrency(tx.amount)}
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                            {tx.description || '-'}
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                            {new Date(tx.createdAt).toLocaleString()}
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
                  Showing {((txMeta.page - 1) * txMeta.limit) + 1} to {Math.min(txMeta.page * txMeta.limit, txMeta.total)} of {txMeta.total}
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setTxFilters(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
                    disabled={!txMeta.hasPrevPage}
                  >
                    <ChevronLeft style={{ width: '16px', height: '16px' }} />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setTxFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
                    disabled={!txMeta.hasNextPage}
                  >
                    <ChevronRight style={{ width: '16px', height: '16px' }} />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Action Modal */}
      {showActionModal && (
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
                color: showActionModal === 'credit' ? 'var(--success)' : showActionModal === 'debit' ? 'var(--warning)' : showActionModal === 'adjust' ? 'var(--info)' : 'var(--danger)'
              }}>
                {showActionModal === 'credit' ? 'Credit Wallet' : showActionModal === 'debit' ? 'Debit Wallet' : showActionModal === 'adjust' ? 'Adjust Wallet' : 'Lock Wallet'}
              </h3>
              <button onClick={closeModal} style={{ padding: '8px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>
                <X style={{ width: '20px', height: '20px', color: 'var(--text-muted)' }} />
              </button>
            </div>

            {/* Amount Input */}
            {showActionModal !== 'lock' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Amount <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>$</span>
                  <input
                    type="number"
                    min={showActionModal === 'adjust' ? undefined : '0.01'}
                    step="0.01"
                    value={actionAmount}
                    onChange={(e) => setActionAmount(e.target.value)}
                    placeholder={showActionModal === 'adjust' ? 'Can be negative' : '0.00'}
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
                {showActionModal === 'adjust' && (
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Use negative values to decrease balance
                  </p>
                )}
              </div>
            )}

            {/* Description */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
                {showActionModal === 'lock' ? 'Reason' : 'Description'} <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <textarea
                value={actionDescription}
                onChange={(e) => setActionDescription(e.target.value)}
                placeholder={
                  showActionModal === 'credit' ? 'e.g., Promotional bonus' : 
                  showActionModal === 'debit' ? 'e.g., Chargeback adjustment' : 
                  showActionModal === 'adjust' ? 'e.g., Balance correction' :
                  'e.g., Suspicious activity detected'
                }
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
                variant={showActionModal === 'lock' ? 'danger' : 'primary'} 
                fullWidth 
                onClick={
                  showActionModal === 'credit' ? handleCredit : 
                  showActionModal === 'debit' ? handleDebit : 
                  showActionModal === 'adjust' ? handleAdjust :
                  handleLock
                }
                isLoading={actionLoading === showActionModal}
                disabled={!actionDescription.trim() || (showActionModal !== 'lock' && !actionAmount)}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==================== COMPONENTS ==================== */

interface StatBoxProps {
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  label: string;
  value: string;
  color: 'gold' | 'green' | 'red' | 'blue';
}

function StatBox({ icon: Icon, label, value, color }: StatBoxProps) {
  const colors = {
    gold: 'var(--accent-gold)',
    green: 'var(--success)',
    red: 'var(--danger)',
    blue: 'var(--info)',
  };

  return (
    <div style={{ 
      backgroundColor: 'rgba(255,255,255,0.05)', 
      borderRadius: '12px', 
      padding: '16px',
      textAlign: 'center'
    }}>
      <Icon style={{ width: '20px', height: '20px', color: colors[color], margin: '0 auto 8px' }} />
      <p style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{value}</p>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{label}</p>
    </div>
  );
}

