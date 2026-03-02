'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Package, 
  Search, 
  Filter,
  ChevronDown,
  ChevronRight,
  Clock,
  Check,
  X,
  AlertCircle,
  RefreshCw,
  Copy,
  Loader2,
  Calendar,
  Smartphone
} from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { DashboardShell } from '@/components/layout';
import { useAuth } from '@/hooks';
import {
  getOrderHistory,
  getRentalHistory,
  SmsOrder,
  SmsRental,
  SmsOrderStatus,
  SmsRentalStatus,
  formatPrice,
  getCountryFlag,
  getProviderBadge,
  getOrderStatusLabel,
  getOrderStatusColor,
  getRentalStatusLabel,
  getRentalStatusColor,
  formatDuration,
} from '@/lib/api';

type TabType = 'activations' | 'rentals';

export default function OrdersPage() {
  const { user } = useAuth();
  
  // Data states
  const [orders, setOrders] = useState<SmsOrder[]>([]);
  const [rentals, setRentals] = useState<SmsRental[]>([]);
  
  // Filter states
  const [activeTab, setActiveTab] = useState<TabType>('activations');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab, statusFilter, dateFrom, dateTo, currentPage]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'activations') {
        const res = await getOrderHistory({
          status: statusFilter as SmsOrderStatus || undefined,
          fromDate: dateFrom || undefined,
          toDate: dateTo || undefined,
          page: currentPage,
          limit: 20,
        });
        setOrders(res.data);
        setTotalPages(res.meta.totalPages);
      } else {
        const res = await getRentalHistory({
          status: statusFilter as SmsRentalStatus || undefined,
          page: currentPage,
          limit: 20,
        });
        setRentals(res.data);
        setTotalPages(res.meta.totalPages);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearFilters = () => {
    setStatusFilter('');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  if (!user) return null;

  const orderStatuses: SmsOrderStatus[] = ['PENDING', 'WAITING_SMS', 'COMPLETED', 'CANCELLED', 'EXPIRED', 'REFUNDED'];
  const rentalStatuses: SmsRentalStatus[] = ['ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED'];

  return (
    <DashboardShell>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Order History
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          View and manage your SMS activation and rental orders
        </p>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '4px', 
        padding: '4px', 
        backgroundColor: 'var(--bg-card)', 
        borderRadius: '12px', 
        border: '1px solid var(--border-default)',
        marginBottom: '24px',
        width: 'fit-content'
      }}>
        <button
          onClick={() => { setActiveTab('activations'); setStatusFilter(''); setCurrentPage(1); }}
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'activations' ? 'rgba(198, 167, 94, 0.15)' : 'transparent',
            color: activeTab === 'activations' ? 'var(--accent-gold)' : 'var(--text-secondary)',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 150ms ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Smartphone style={{ width: '16px', height: '16px' }} />
          Activations
        </button>
        <button
          onClick={() => { setActiveTab('rentals'); setStatusFilter(''); setCurrentPage(1); }}
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'rentals' ? 'rgba(198, 167, 94, 0.15)' : 'transparent',
            color: activeTab === 'rentals' ? 'var(--accent-gold)' : 'var(--text-secondary)',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 150ms ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Clock style={{ width: '16px', height: '16px' }} />
          Rentals
        </button>
      </div>

      {/* Filters */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap',
        gap: '12px', 
        marginBottom: '24px',
        alignItems: 'center'
      }}>
        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          style={{
            padding: '10px 16px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            fontSize: '14px',
            cursor: 'pointer',
            minWidth: '150px'
          }}
        >
          <option value="">All Statuses</option>
          {(activeTab === 'activations' ? orderStatuses : rentalStatuses).map(status => (
            <option key={status} value={status}>
              {activeTab === 'activations' ? getOrderStatusLabel(status as SmsOrderStatus) : getRentalStatusLabel(status as SmsRentalStatus)}
            </option>
          ))}
        </select>

        {/* Date Filters (only for activations) */}
        {activeTab === 'activations' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
                placeholder="From"
                style={{
                  padding: '10px 12px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px'
                }}
              />
              <span style={{ color: 'var(--text-muted)' }}>to</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
                placeholder="To"
                style={{
                  padding: '10px 12px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px'
                }}
              />
            </div>
          </>
        )}

        {/* Clear Filters */}
        {(statusFilter || dateFrom || dateTo) && (
          <button
            onClick={clearFilters}
            style={{
              padding: '10px 16px',
              backgroundColor: 'transparent',
              border: '1px solid var(--border-default)',
              borderRadius: '8px',
              color: 'var(--text-muted)',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <X style={{ width: '14px', height: '14px' }} />
            Clear
          </button>
        )}

        <div style={{ flex: 1 }} />

        {/* Refresh */}
        <button
          onClick={loadData}
          disabled={isLoading}
          style={{
            padding: '10px 16px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: '8px',
            color: 'var(--text-secondary)',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <RefreshCw style={{ 
            width: '14px', 
            height: '14px',
            animation: isLoading ? 'spin 1s linear infinite' : 'none'
          }} />
          Refresh
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingState />
      ) : activeTab === 'activations' ? (
        orders.length === 0 ? (
          <EmptyState 
            title="No activation orders"
            message="You haven't made any SMS activation orders yet."
            actionLabel="Get a Number"
            actionHref="/activate"
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {orders.map((order) => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onCopy={(text) => copyToClipboard(text, order.id)}
                copiedId={copiedId}
              />
            ))}
          </div>
        )
      ) : (
        rentals.length === 0 ? (
          <EmptyState 
            title="No rental orders"
            message="You haven't rented any numbers yet."
            actionLabel="Rent a Number"
            actionHref="/rent"
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {rentals.map((rental) => (
              <RentalCard 
                key={rental.id} 
                rental={rental}
                onCopy={(text) => copyToClipboard(text, rental.id)}
                copiedId={copiedId}
              />
            ))}
          </div>
        )
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          gap: '8px',
          marginTop: '32px'
        }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span style={{ 
            padding: '8px 16px', 
            color: 'var(--text-secondary)',
            fontSize: '14px'
          }}>
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </DashboardShell>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function LoadingState() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="skeleton" style={{ height: '120px', borderRadius: '16px' }} />
      ))}
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel: string;
  actionHref: string;
}

function EmptyState({ title, message, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div style={{ 
      padding: '64px 24px', 
      textAlign: 'center',
      backgroundColor: 'var(--bg-card)',
      borderRadius: '16px',
      border: '1px dashed var(--border-default)'
    }}>
      <div style={{ 
        width: '64px', 
        height: '64px', 
        margin: '0 auto 16px', 
        borderRadius: '16px', 
        backgroundColor: 'rgba(198, 167, 94, 0.1)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Package style={{ width: '32px', height: '32px', color: 'var(--accent-gold)' }} />
      </div>
      <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
        {title}
      </h3>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px', maxWidth: '320px', margin: '0 auto 24px' }}>
        {message}
      </p>
      <Link href={actionHref}>
        <Button>{actionLabel}</Button>
      </Link>
    </div>
  );
}

interface OrderCardProps {
  order: SmsOrder;
  onCopy: (text: string) => void;
  copiedId: string | null;
}

function OrderCard({ order, onCopy, copiedId }: OrderCardProps) {
  const badge = getProviderBadge(order.provider.slug);
  const statusColor = getOrderStatusColor(order.status);
  const isCompleted = order.status === 'COMPLETED';
  const isCopied = copiedId === order.id;

  return (
    <Link href={`/orders/${order.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        borderRadius: '16px',
        padding: '20px',
        transition: 'all 200ms ease',
        cursor: 'pointer'
      }} className="card-lift">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          {/* Service Icon */}
          <div style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '12px', 
            backgroundColor: 'var(--bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {order.service.iconUrl ? (
              <img src={order.service.iconUrl} alt="" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
            ) : (
              <Smartphone style={{ width: '24px', height: '24px', color: 'var(--text-muted)' }} />
            )}
          </div>

          {/* Main Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h3 style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {order.service.name}
                </h3>
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
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: `${statusColor}20`
              }}>
                {order.status === 'COMPLETED' && <Check style={{ width: '12px', height: '12px', color: statusColor }} />}
                {order.status === 'WAITING_SMS' && <Clock style={{ width: '12px', height: '12px', color: statusColor }} />}
                {order.status === 'CANCELLED' && <X style={{ width: '12px', height: '12px', color: statusColor }} />}
                <span style={{ fontSize: '12px', fontWeight: 600, color: statusColor }}>
                  {getOrderStatusLabel(order.status)}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              {/* Country */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '16px' }}>{getCountryFlag(order.country.code)}</span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{order.country.name}</span>
              </div>

              {/* Phone Number */}
              {order.phoneNumber && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                    {order.phoneNumber}
                  </span>
                  <button
                    onClick={(e) => { e.preventDefault(); onCopy(order.phoneNumber!); }}
                    style={{
                      padding: '4px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {isCopied ? (
                      <Check style={{ width: '12px', height: '12px', color: 'var(--success)' }} />
                    ) : (
                      <Copy style={{ width: '12px', height: '12px', color: 'var(--text-muted)' }} />
                    )}
                  </button>
                </div>
              )}

              {/* SMS Code */}
              {isCompleted && order.smsCode && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  padding: '4px 10px',
                  backgroundColor: 'rgba(198, 167, 94, 0.1)',
                  borderRadius: '6px'
                }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-gold)', fontFamily: 'monospace' }}>
                    {order.smsCode}
                  </span>
                  <button
                    onClick={(e) => { e.preventDefault(); onCopy(order.smsCode!); }}
                    style={{
                      padding: '4px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <Copy style={{ width: '12px', height: '12px', color: 'var(--accent-gold)' }} />
                  </button>
                </div>
              )}

              <div style={{ flex: 1 }} />

              {/* Price */}
              <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--accent-gold)' }}>
                {formatPrice(order.finalCost)}
              </span>

              {/* Date */}
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {new Date(order.createdAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>

              <ChevronRight style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

interface RentalCardProps {
  rental: SmsRental;
  onCopy: (text: string) => void;
  copiedId: string | null;
}

function RentalCard({ rental, onCopy, copiedId }: RentalCardProps) {
  const badge = getProviderBadge(rental.provider.slug);
  const statusColor = getRentalStatusColor(rental.status);
  const isCopied = copiedId === rental.id;
  const messageCount = rental.messages?.length || 0;

  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-default)',
      borderRadius: '16px',
      padding: '20px',
      transition: 'all 200ms ease'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        {/* Icon */}
        <div style={{ 
          width: '48px', 
          height: '48px', 
          borderRadius: '12px', 
          backgroundColor: 'var(--bg-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Clock style={{ width: '24px', height: '24px', color: 'var(--accent-gold)' }} />
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h3 style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                Number Rental
              </h3>
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
              <span style={{
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-muted)'
              }}>
                {formatDuration(rental.rentalDuration)}
              </span>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '6px',
              backgroundColor: `${statusColor}20`
            }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: statusColor }}>
                {getRentalStatusLabel(rental.status)}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {/* Phone Number */}
            {rental.phoneNumber && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                  {rental.phoneNumber}
                </span>
                <button
                  onClick={() => onCopy(rental.phoneNumber!)}
                  style={{
                    padding: '4px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {isCopied ? (
                    <Check style={{ width: '12px', height: '12px', color: 'var(--success)' }} />
                  ) : (
                    <Copy style={{ width: '12px', height: '12px', color: 'var(--text-muted)' }} />
                  )}
                </button>
              </div>
            )}

            {/* Messages Count */}
            <span style={{ 
              fontSize: '13px', 
              color: messageCount > 0 ? 'var(--success)' : 'var(--text-muted)' 
            }}>
              {messageCount} message{messageCount !== 1 ? 's' : ''} received
            </span>

            <div style={{ flex: 1 }} />

            {/* Price */}
            <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--accent-gold)' }}>
              {formatPrice(rental.finalCost)}
            </span>

            {/* Date */}
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {new Date(rental.createdAt).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>

          {/* Messages Preview */}
          {messageCount > 0 && (
            <div style={{ 
              marginTop: '12px', 
              padding: '12px', 
              backgroundColor: 'var(--bg-secondary)', 
              borderRadius: '8px' 
            }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                Latest Messages
              </span>
              {rental.messages.slice(0, 3).map((msg, idx) => (
                <div key={idx} style={{ 
                  padding: '8px', 
                  backgroundColor: 'var(--bg-card)', 
                  borderRadius: '6px',
                  marginBottom: idx < 2 ? '6px' : 0,
                  fontSize: '13px',
                  color: 'var(--text-secondary)'
                }}>
                  {msg.text}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

