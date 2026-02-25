'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  XCircle,
  RotateCcw,
  Clock,
  User,
  CreditCard,
  Calendar,
  ExternalLink,
  Copy,
  AlertTriangle,
  X
} from 'lucide-react';
import { Button, Alert } from '@/components/ui';
import { 
  getAdminPayment,
  refundPayment,
  markPaymentCompleted,
  getPaymentStatusColor,
  getGatewayInfo,
  formatPaymentAmount,
  formatPaymentDate,
  type AdminPaymentDetail,
  type AdminRefundRequest
} from '@/lib/api';

/**
 * Admin Payment Detail Page
 * 
 * Features:
 * - Full payment details
 * - User information
 * - Gateway-specific data
 * - Refund action
 * - Mark completed action
 * - Transaction history
 */
export default function AdminPaymentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const paymentId = params.id as string;

  const [payment, setPayment] = useState<AdminPaymentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Modals
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [refundAmount, setRefundAmount] = useState<string>('');
  const [completeNote, setCompleteNote] = useState('');

  // Fetch payment
  const fetchPayment = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminPayment(paymentId);
      setPayment(data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load payment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paymentId) {
      fetchPayment();
    }
  }, [paymentId]);

  // Handle refund
  const handleRefund = async () => {
    if (!payment || !refundReason.trim()) return;
    
    try {
      setActionLoading(true);
      await refundPayment(payment.id, { 
        reason: refundReason,
        amount: refundAmount ? parseFloat(refundAmount) : undefined
      });
      setActionSuccess('Payment has been refunded successfully');
      setShowRefundModal(false);
      setRefundReason('');
      setRefundAmount('');
      await fetchPayment();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to refund payment');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle mark completed
  const handleMarkCompleted = async () => {
    if (!payment) return;
    
    try {
      setActionLoading(true);
      await markPaymentCompleted(payment.id, { note: completeNote || undefined });
      setActionSuccess('Payment has been marked as completed');
      setShowCompleteModal(false);
      setCompleteNote('');
      await fetchPayment();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to complete payment');
    } finally {
      setActionLoading(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', margin: '0 auto 16px', borderRadius: '50%', border: '4px solid var(--accent-gold)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'var(--text-muted)' }}>Loading payment...</p>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <XCircle style={{ width: '48px', height: '48px', color: 'var(--danger)', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Payment not found</p>
          <Button variant="outline" onClick={() => router.push('/admin/payments')}>
            Back to Payments
          </Button>
        </div>
      </div>
    );
  }

  const statusColor = getPaymentStatusColor(payment.status);
  const gatewayInfo = getGatewayInfo(payment.gateway);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: 'var(--bg-card)', 
        borderBottom: '1px solid var(--border-default)',
        padding: '24px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <Link href="/admin" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>
                  Admin
                </Link>
                <span style={{ color: 'var(--text-muted)' }}>/</span>
                <Link href="/admin/payments" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>
                  Payments
                </Link>
                <span style={{ color: 'var(--text-muted)' }}>/</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Detail</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Payment Details
                </h1>
                <span style={{ 
                  padding: '4px 12px', 
                  borderRadius: '6px', 
                  fontSize: '12px', 
                  fontWeight: 600,
                  backgroundColor: statusColor.bg,
                  color: statusColor.text
                }}>
                  {payment.status}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="outline" onClick={() => router.push('/admin/payments')}>
                <ArrowLeft style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                Back
              </Button>
              <Button variant="outline" onClick={fetchPayment}>
                <RefreshCw style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                Refresh
              </Button>
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

        {actionSuccess && (
          <div style={{ marginBottom: '24px' }}>
            <Alert variant="success" dismissible onDismiss={() => setActionSuccess(null)}>
              {actionSuccess}
            </Alert>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }} className="lg:!grid-cols-3">
          {/* Main Info */}
          <div style={{ gridColumn: 'span 1' }} className="lg:!col-span-2">
            {/* Payment Summary Card */}
            <div style={{ 
              backgroundColor: 'var(--bg-card)', 
              border: '1px solid var(--border-default)', 
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ 
                    width: '56px', 
                    height: '56px', 
                    borderRadius: '12px', 
                    backgroundColor: 'var(--bg-secondary)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '28px'
                  }}>
                    {gatewayInfo.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{gatewayInfo.name}</p>
                    <p style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {formatPaymentAmount(payment.amount, payment.currency)}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {payment.feeAmount && parseFloat(payment.feeAmount) > 0 && (
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      Fee: {formatPaymentAmount(payment.feeAmount, payment.currency)}
                    </p>
                  )}
                  {payment.netAmount && (
                    <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--success)' }}>
                      Net: {formatPaymentAmount(payment.netAmount, payment.currency)}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', paddingTop: '20px', borderTop: '1px solid var(--border-default)' }}>
                {payment.status === 'PENDING' && (
                  <Button variant="primary" onClick={() => setShowCompleteModal(true)}>
                    <CheckCircle style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                    Mark as Completed
                  </Button>
                )}
                {payment.status === 'COMPLETED' && (
                  <Button variant="danger" onClick={() => setShowRefundModal(true)}>
                    <RotateCcw style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                    Process Refund
                  </Button>
                )}
                <Link href={`/admin/users/${payment.userId}`}>
                  <Button variant="outline">
                    <User style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                    View User
                  </Button>
                </Link>
              </div>
            </div>

            {/* Payment Details */}
            <div style={{ 
              backgroundColor: 'var(--bg-card)', 
              border: '1px solid var(--border-default)', 
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px' }}>
                Payment Information
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <InfoRow label="Payment ID" value={payment.id} mono copyable onCopy={() => copyToClipboard(payment.id)} />
                <InfoRow label="Gateway" value={gatewayInfo.name} icon={gatewayInfo.icon} />
                <InfoRow label="Status" value={payment.status} badge={statusColor} />
                <InfoRow label="Currency" value={payment.currency} />
                <InfoRow label="Created" value={formatPaymentDate(payment.createdAt)} />
                <InfoRow label="Expires" value={formatPaymentDate(payment.expiresAt)} />
                {payment.completedAt && (
                  <InfoRow label="Completed" value={formatPaymentDate(payment.completedAt)} />
                )}
                {payment.refundedAt && (
                  <>
                    <InfoRow label="Refunded" value={formatPaymentDate(payment.refundedAt)} />
                    <InfoRow label="Refund Reason" value={payment.refundReason || '-'} fullWidth />
                  </>
                )}
              </div>
            </div>

            {/* Gateway Details */}
            {payment.gatewayPaymentId && (
              <div style={{ 
                backgroundColor: 'var(--bg-card)', 
                border: '1px solid var(--border-default)', 
                borderRadius: '16px',
                padding: '24px'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px' }}>
                  Gateway Details
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                  <InfoRow label="Gateway Payment ID" value={payment.gatewayPaymentId} mono copyable onCopy={() => copyToClipboard(payment.gatewayPaymentId!)} fullWidth />
                  {payment.checkoutUrl && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Checkout URL:</span>
                      <a 
                        href={payment.checkoutUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                          fontSize: '13px', 
                          color: 'var(--accent-gold)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px',
                          textDecoration: 'none'
                        }}
                      >
                        Open Checkout <ExternalLink style={{ width: '12px', height: '12px' }} />
                      </a>
                    </div>
                  )}
                </div>

                {/* Gateway Response (if crypto) */}
                {payment.gatewayResponse && Object.keys(payment.gatewayResponse).length > 0 && (
                  <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border-default)' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '12px' }}>
                      Additional Details
                    </h4>
                    <pre style={{ 
                      backgroundColor: 'var(--bg-secondary)', 
                      padding: '12px', 
                      borderRadius: '8px', 
                      fontSize: '12px', 
                      color: 'var(--text-secondary)',
                      overflow: 'auto',
                      maxHeight: '200px'
                    }}>
                      {JSON.stringify(payment.gatewayResponse, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ gridColumn: 'span 1' }}>
            {/* User Card */}
            <div style={{ 
              backgroundColor: 'var(--bg-card)', 
              border: '1px solid var(--border-default)', 
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px' }}>
                User Information
              </h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '50%', 
                  backgroundColor: 'rgba(198, 167, 94, 0.2)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'var(--accent-gold)',
                  fontWeight: 600,
                  fontSize: '18px'
                }}>
                  {payment.user.email[0].toUpperCase()}
                </div>
                <div>
                  <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                    {payment.user.firstName ? `${payment.user.firstName} ${payment.user.lastName || ''}` : payment.user.email.split('@')[0]}
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{payment.user.email}</p>
                </div>
              </div>

              <Link href={`/admin/users/${payment.userId}`}>
                <Button variant="outline" fullWidth>
                  <User style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                  View User Profile
                </Button>
              </Link>
            </div>

            {/* Timeline */}
            <div style={{ 
              backgroundColor: 'var(--bg-card)', 
              border: '1px solid var(--border-default)', 
              borderRadius: '16px',
              padding: '24px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px' }}>
                Timeline
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <TimelineItem 
                  icon={CreditCard}
                  title="Payment Created"
                  date={payment.createdAt}
                  color="var(--info)"
                />
                {payment.status === 'COMPLETED' && payment.completedAt && (
                  <TimelineItem 
                    icon={CheckCircle}
                    title="Payment Completed"
                    date={payment.completedAt}
                    color="var(--success)"
                  />
                )}
                {payment.status === 'FAILED' && (
                  <TimelineItem 
                    icon={XCircle}
                    title="Payment Failed"
                    date={payment.updatedAt}
                    color="var(--danger)"
                  />
                )}
                {payment.status === 'EXPIRED' && (
                  <TimelineItem 
                    icon={Clock}
                    title="Payment Expired"
                    date={payment.expiresAt}
                    color="var(--text-muted)"
                  />
                )}
                {payment.status === 'REFUNDED' && payment.refundedAt && (
                  <TimelineItem 
                    icon={RotateCcw}
                    title="Payment Refunded"
                    date={payment.refundedAt}
                    color="var(--warning)"
                    subtitle={payment.refundReason}
                  />
                )}
              </div>
            </div>

            {/* Wallet Transaction */}
            {payment.walletTransaction && (
              <div style={{ 
                backgroundColor: 'var(--bg-card)', 
                border: '1px solid var(--border-default)', 
                borderRadius: '16px',
                padding: '24px',
                marginTop: '24px'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px' }}>
                  Wallet Transaction
                </h3>
                
                <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{payment.walletTransaction.type}</span>
                    <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--success)' }}>
                      +{formatPaymentAmount(payment.walletTransaction.amount, payment.currency)}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{payment.walletTransaction.description}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
                    {formatPaymentDate(payment.walletTransaction.createdAt)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Refund Modal */}
      {showRefundModal && (
        <Modal onClose={() => setShowRefundModal(false)}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--danger)' }}>
              Process Refund
            </h3>
            <button onClick={() => setShowRefundModal(false)} style={{ padding: '8px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X style={{ width: '20px', height: '20px', color: 'var(--text-muted)' }} />
            </button>
          </div>

          <div style={{ 
            padding: '16px', 
            backgroundColor: 'var(--bg-secondary)', 
            borderRadius: '12px', 
            marginBottom: '20px' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Amount to refund</span>
              <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {formatPaymentAmount(payment.amount, payment.currency)}
              </span>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Partial Refund Amount (optional)
            </label>
            <input
              type="number"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              placeholder={`Leave empty for full refund`}
              step="0.01"
              min="0"
              max={parseFloat(payment.amount)}
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
              placeholder="e.g., Customer request, Duplicate payment"
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
              isLoading={actionLoading}
              disabled={!refundReason.trim()}
            >
              Process Refund
            </Button>
          </div>
        </Modal>
      )}

      {/* Mark Completed Modal */}
      {showCompleteModal && (
        <Modal onClose={() => setShowCompleteModal(false)}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--success)' }}>
              Mark Payment Completed
            </h3>
            <button onClick={() => setShowCompleteModal(false)} style={{ padding: '8px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X style={{ width: '20px', height: '20px', color: 'var(--text-muted)' }} />
            </button>
          </div>

          <div style={{ 
            padding: '16px', 
            backgroundColor: 'var(--bg-secondary)', 
            borderRadius: '12px', 
            marginBottom: '20px' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Amount to credit</span>
              <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--success)' }}>
                {formatPaymentAmount(payment.amount, payment.currency)}
              </span>
            </div>
          </div>

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
              This will credit the user&apos;s wallet. Only use for verified payments that didn&apos;t complete automatically.
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Note (optional)
            </label>
            <textarea
              value={completeNote}
              onChange={(e) => setCompleteNote(e.target.value)}
              placeholder="e.g., Verified via gateway dashboard"
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
              isLoading={actionLoading}
            >
              Mark as Completed
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ==================== COMPONENTS ==================== */

interface InfoRowProps {
  label: string;
  value: string;
  mono?: boolean;
  icon?: string;
  badge?: { bg: string; text: string };
  copyable?: boolean;
  onCopy?: () => void;
  fullWidth?: boolean;
}

function InfoRow({ label, value, mono, icon, badge, copyable, onCopy, fullWidth }: InfoRowProps) {
  return (
    <div style={{ gridColumn: fullWidth ? 'span 2' : 'span 1' }}>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {icon && <span style={{ fontSize: '16px' }}>{icon}</span>}
        {badge ? (
          <span style={{ 
            padding: '4px 10px', 
            borderRadius: '6px', 
            fontSize: '12px', 
            fontWeight: 600,
            backgroundColor: badge.bg,
            color: badge.text
          }}>
            {value}
          </span>
        ) : (
          <span style={{ 
            fontSize: '14px', 
            color: 'var(--text-primary)', 
            fontFamily: mono ? 'monospace' : 'inherit',
            wordBreak: 'break-all'
          }}>
            {value}
          </span>
        )}
        {copyable && onCopy && (
          <button
            onClick={onCopy}
            style={{
              padding: '4px',
              borderRadius: '4px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)'
            }}
            title="Copy to clipboard"
          >
            <Copy style={{ width: '14px', height: '14px' }} />
          </button>
        )}
      </div>
    </div>
  );
}

interface TimelineItemProps {
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  title: string;
  date: string;
  color: string;
  subtitle?: string | null;
}

function TimelineItem({ icon: Icon, title, date, color, subtitle }: TimelineItemProps) {
  return (
    <div style={{ display: 'flex', gap: '12px' }}>
      <div style={{ 
        width: '32px', 
        height: '32px', 
        borderRadius: '50%', 
        backgroundColor: `${color}20`,
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <Icon style={{ width: '16px', height: '16px', color }} />
      </div>
      <div>
        <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{title}</p>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formatPaymentDate(date)}</p>
        {subtitle && (
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{subtitle}</p>
        )}
      </div>
    </div>
  );
}

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
}

function Modal({ children, onClose }: ModalProps) {
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
        maxWidth: '450px', 
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {children}
      </div>
    </div>
  );
}

