'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft,
  Clock,
  Check,
  X,
  Copy,
  RefreshCw,
  Loader2,
  Smartphone,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui';
import { DashboardShell } from '@/components/layout';
import { useAuth } from '@/hooks';
import {
  checkOrderStatus,
  cancelOrder,
  SmsOrder,
  formatPrice,
  getCountryFlag,
  getProviderBadge,
  getOrderStatusLabel,
  getOrderStatusColor,
  canCancelOrder,
  getTimeRemaining,
} from '@/lib/api';

export default function OrderDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<SmsOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadOrder();
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [orderId]);

  const loadOrder = async () => {
    setIsLoading(true);
    try {
      const res = await checkOrderStatus(orderId);
      setOrder(res.order);
      
      // Start polling if order is pending
      if (['PENDING', 'WAITING_SMS'].includes(res.order.status)) {
        startPolling();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Order not found');
    } finally {
      setIsLoading(false);
    }
  };

  const startPolling = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    
    pollingRef.current = setInterval(async () => {
      try {
        const res = await checkOrderStatus(orderId);
        setOrder(res.order);
        
        if (['COMPLETED', 'CANCELLED', 'EXPIRED', 'REFUNDED'].includes(res.order.status)) {
          if (pollingRef.current) clearInterval(pollingRef.current);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 3000);
  };

  const handleCancel = async () => {
    if (!order || isCancelling) return;
    
    setIsCancelling(true);
    try {
      const res = await cancelOrder(order.id);
      setOrder(res.order);
      if (pollingRef.current) clearInterval(pollingRef.current);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setIsCancelling(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!user) return null;

  if (isLoading) {
    return (
      <DashboardShell>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '80px 24px' 
        }}>
          <Loader2 style={{ 
            width: '48px', 
            height: '48px', 
            color: 'var(--accent-gold)',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Loading order...</p>
        </div>
      </DashboardShell>
    );
  }

  if (error || !order) {
    return (
      <DashboardShell>
        <div style={{ 
          padding: '64px 24px', 
          textAlign: 'center',
          backgroundColor: 'var(--bg-card)',
          borderRadius: '16px',
          border: '1px solid var(--border-default)'
        }}>
          <AlertCircle style={{ width: '48px', height: '48px', color: 'var(--danger)', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
            {error || 'Order not found'}
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
            The order you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
          </p>
          <Link href="/orders">
            <Button>Back to Orders</Button>
          </Link>
        </div>
      </DashboardShell>
    );
  }

  const badge = getProviderBadge(order.provider.slug);
  const statusColor = getOrderStatusColor(order.status);
  const isWaiting = ['PENDING', 'WAITING_SMS'].includes(order.status);
  const isCompleted = order.status === 'COMPLETED';
  const timeRemaining = getTimeRemaining(order.expiresAt);

  return (
    <DashboardShell>
      {/* Back Button */}
      <Link 
        href="/orders" 
        style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '8px', 
          color: 'var(--text-muted)', 
          textDecoration: 'none',
          marginBottom: '24px',
          fontSize: '14px'
        }}
      >
        <ArrowLeft style={{ width: '16px', height: '16px' }} />
        Back to Orders
      </Link>

      <div style={{ maxWidth: '800px' }}>
        {/* Main Card */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          borderRadius: '20px',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '24px',
            borderBottom: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                width: '56px', 
                height: '56px', 
                borderRadius: '14px', 
                backgroundColor: 'var(--bg-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {order.service.iconUrl ? (
                  <img src={order.service.iconUrl} alt="" style={{ width: '36px', height: '36px', borderRadius: '8px' }} />
                ) : (
                  <Smartphone style={{ width: '28px', height: '28px', color: 'var(--text-muted)' }} />
                )}
              </div>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {order.service.name}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>{getCountryFlag(order.country.code)}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{order.country.name}</span>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    backgroundColor: badge.color,
                    color: '#000'
                  }}>
                    {badge.label}
                  </span>
                </div>
              </div>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '10px',
              backgroundColor: `${statusColor}15`
            }}>
              {isCompleted && <Check style={{ width: '18px', height: '18px', color: statusColor }} />}
              {isWaiting && <Loader2 style={{ width: '18px', height: '18px', color: statusColor, animation: 'spin 2s linear infinite' }} />}
              {['CANCELLED', 'EXPIRED', 'REFUNDED'].includes(order.status) && <X style={{ width: '18px', height: '18px', color: statusColor }} />}
              <span style={{ fontSize: '14px', fontWeight: 600, color: statusColor }}>
                {getOrderStatusLabel(order.status)}
              </span>
            </div>
          </div>

          {/* Phone Number Section */}
          {order.phoneNumber && (
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-default)' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                Phone Number
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ 
                  fontSize: '28px', 
                  fontWeight: 700, 
                  color: 'var(--text-primary)', 
                  fontFamily: 'monospace',
                  letterSpacing: '1px'
                }}>
                  {order.phoneNumber}
                </span>
                <button
                  onClick={() => copyToClipboard(order.phoneNumber!, 'phone')}
                  style={{
                    padding: '10px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {copiedField === 'phone' ? (
                    <>
                      <Check style={{ width: '16px', height: '16px', color: 'var(--success)' }} />
                      <span style={{ fontSize: '13px', color: 'var(--success)' }}>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* SMS Code Section */}
          {isCompleted && order.smsCode && (
            <div style={{ 
              padding: '32px 24px', 
              background: 'linear-gradient(135deg, rgba(198, 167, 94, 0.08) 0%, rgba(198, 167, 94, 0.02) 100%)',
              borderBottom: '1px solid var(--border-default)'
            }}>
              <label style={{ fontSize: '12px', color: 'var(--accent-gold)', display: 'block', marginBottom: '12px' }}>
                Verification Code
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ 
                  fontSize: '48px', 
                  fontWeight: 800, 
                  color: 'var(--accent-gold)', 
                  fontFamily: 'monospace',
                  letterSpacing: '8px'
                }}>
                  {order.smsCode}
                </span>
                <button
                  onClick={() => copyToClipboard(order.smsCode!, 'code')}
                  style={{
                    padding: '14px 20px',
                    backgroundColor: 'var(--accent-gold)',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {copiedField === 'code' ? (
                    <>
                      <Check style={{ width: '18px', height: '18px', color: '#000' }} />
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#000' }}>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy style={{ width: '18px', height: '18px', color: '#000' }} />
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#000' }}>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
              {order.smsFullText && (
                <div style={{ 
                  marginTop: '20px', 
                  padding: '16px', 
                  backgroundColor: 'var(--bg-card)', 
                  borderRadius: '10px',
                  border: '1px solid var(--border-default)'
                }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                    Full Message
                  </label>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    &quot;{order.smsFullText}&quot;
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Waiting State */}
          {isWaiting && (
            <div style={{ 
              padding: '32px 24px', 
              textAlign: 'center',
              borderBottom: '1px solid var(--border-default)'
            }}>
              <Loader2 style={{ 
                width: '48px', 
                height: '48px', 
                color: 'var(--accent-gold)',
                animation: 'spin 2s linear infinite',
                margin: '0 auto 16px'
              }} />
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Waiting for SMS...
              </h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
                Use the phone number above for verification. The code will appear here automatically.
              </p>
              {!timeRemaining.expired && (
                <div style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  padding: '8px 16px',
                  backgroundColor: timeRemaining.minutes < 5 ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-secondary)',
                  borderRadius: '8px',
                  color: timeRemaining.minutes < 5 ? 'var(--warning)' : 'var(--text-muted)'
                }}>
                  <Clock style={{ width: '16px', height: '16px' }} />
                  <span>
                    Expires in {timeRemaining.minutes}:{timeRemaining.seconds.toString().padStart(2, '0')}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Order Details */}
          <div style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '16px' }}>
              Order Details
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
              gap: '16px' 
            }}>
              <DetailItem label="Order ID" value={order.id.slice(0, 12) + '...'} />
              <DetailItem label="Provider" value={order.provider.displayName} />
              <DetailItem label="Service" value={order.service.name} />
              <DetailItem label="Country" value={`${getCountryFlag(order.country.code)} ${order.country.name}`} />
              <DetailItem label="Original Price" value={formatPrice(order.cost)} />
              {parseFloat(order.discount) > 0 && (
                <DetailItem label="Discount" value={`-${formatPrice(order.discount)} (${order.membershipDiscount}%)`} highlight />
              )}
              <DetailItem label="Final Cost" value={formatPrice(order.finalCost)} highlight />
              <DetailItem 
                label="Created" 
                value={new Date(order.createdAt).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })} 
              />
              {order.completedAt && (
                <DetailItem 
                  label="Completed" 
                  value={new Date(order.completedAt).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })} 
                />
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{ 
            padding: '20px 24px', 
            borderTop: '1px solid var(--border-default)',
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            {canCancelOrder(order.status) && (
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <>
                    <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite', marginRight: '8px' }} />
                    Cancelling...
                  </>
                ) : (
                  'Cancel & Refund'
                )}
              </Button>
            )}
            <Link href="/activate">
              <Button>
                {isCompleted ? 'Get Another Number' : 'Back to Activation'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function DetailItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
        {label}
      </span>
      <span style={{ 
        fontSize: '14px', 
        fontWeight: highlight ? 600 : 500, 
        color: highlight ? 'var(--accent-gold)' : 'var(--text-primary)' 
      }}>
        {value}
      </span>
    </div>
  );
}

