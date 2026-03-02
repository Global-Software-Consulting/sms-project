'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Activity,
  RefreshCw,
  Search,
  Filter,
  Check,
  X,
  Loader2,
  ChevronDown,
  Home,
  Server,
  Users,
  LogOut,
  Eye,
  RotateCcw,
  Smartphone,
  Clock,
  DollarSign,
  Copy,
  Calendar
} from 'lucide-react';
import { Button, Alert, Badge } from '@/components/ui';
import { useAuth } from '@/hooks';
import {
  adminGetOrders,
  adminGetOrder,
  adminRefundOrder,
  adminGetRentals,
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
} from '@/lib/api';

type TabType = 'orders' | 'rentals';

export default function AdminSmsOrdersPage() {
  const { user, logout } = useAuth();
  
  // Data states
  const [orders, setOrders] = useState<SmsOrder[]>([]);
  const [rentals, setRentals] = useState<SmsRental[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRentals, setTotalRentals] = useState(0);
  
  // Filter states
  const [activeTab, setActiveTab] = useState<TabType>('orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<SmsOrder | null>(null);
  const [isRefunding, setIsRefunding] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab, searchQuery, statusFilter, dateFrom, dateTo, currentPage]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'orders') {
        const res = await adminGetOrders({
          search: searchQuery || undefined,
          status: statusFilter as SmsOrderStatus || undefined,
          fromDate: dateFrom || undefined,
          toDate: dateTo || undefined,
          page: currentPage,
          limit: 20,
        });
        setOrders(res.data);
        setTotalOrders(res.meta.total);
      } else {
        const res = await adminGetRentals({
          status: statusFilter as SmsRentalStatus || undefined,
          page: currentPage,
          limit: 20,
        });
        setRentals(res.data);
        setTotalRentals(res.meta.total);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewOrder = async (orderId: string) => {
    try {
      const res = await adminGetOrder(orderId);
      setSelectedOrder(res.order);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load order');
    }
  };

  const handleRefund = async () => {
    if (!selectedOrder || isRefunding) return;
    
    setIsRefunding(true);
    try {
      const res = await adminRefundOrder(selectedOrder.id, refundReason || undefined);
      setOrders(orders.map(o => 
        o.id === selectedOrder.id ? res.order : o
      ));
      setSelectedOrder(res.order);
      setSuccess(`Order refunded: ${formatPrice(res.refundAmount)}`);
      setRefundReason('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to refund order');
    } finally {
      setIsRefunding(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  const orderStatuses: SmsOrderStatus[] = ['PENDING', 'WAITING_SMS', 'COMPLETED', 'CANCELLED', 'EXPIRED', 'REFUNDED'];
  const rentalStatuses: SmsRentalStatus[] = ['ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED'];
  const totalPages = Math.ceil((activeTab === 'orders' ? totalOrders : totalRentals) / 20);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: 'var(--bg-card)', 
        borderBottom: '1px solid var(--border-default)',
        padding: '16px 24px'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
              <Link href="/admin" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '10px', 
                  background: 'linear-gradient(135deg, var(--accent-gold) 0%, #D4AF37 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--bg-primary)' }}>S</span>
                </div>
                <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  SMS<span style={{ color: 'var(--accent-gold)' }}>Pro</span>
                </span>
              </Link>
              
              <nav style={{ display: 'flex', gap: '8px' }} className="hidden sm:!flex">
                <NavLink href="/admin" icon={Home} label="Home" />
                <NavLink href="/admin/providers" icon={Server} label="Providers" />
                <NavLink href="/admin/services" icon={Smartphone} label="Services" />
                <NavLink href="/admin/sms-orders" icon={Activity} label="Orders" active />
                <NavLink href="/admin/users" icon={Users} label="Users" />
              </nav>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Button variant="secondary" onClick={loadData} size="sm">
                <RefreshCw style={{ width: '14px', height: '14px', marginRight: '6px' }} />
                Refresh
              </Button>
              
              {/* User Menu */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '10px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--accent-gold) 0%, #D4AF37 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--bg-primary)' }}>
                      {user?.firstName?.[0] || 'A'}
                    </span>
                  </div>
                  <ChevronDown style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
                </button>

                {showUserMenu && (
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setShowUserMenu(false)} />
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '8px',
                      width: '200px',
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-default)',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                      overflow: 'hidden',
                      zIndex: 50
                    }}>
                      <div style={{ padding: '8px' }}>
                        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', textDecoration: 'none', color: 'var(--text-secondary)' }}>
                          <Home style={{ width: '16px', height: '16px' }} />
                          <span style={{ fontSize: '14px' }}>User Dashboard</span>
                        </Link>
                      </div>
                      <div style={{ padding: '8px', borderTop: '1px solid var(--border-default)' }}>
                        <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 12px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', color: 'var(--danger)', cursor: 'pointer', fontSize: '14px' }}>
                          <LogOut style={{ width: '16px', height: '16px' }} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page Title */}
      <div style={{ backgroundColor: 'var(--bg-primary)', padding: '24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            SMS Orders
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            View and manage all SMS activation orders and rentals
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px 24px' }}>
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
            onClick={() => { setActiveTab('orders'); setStatusFilter(''); setCurrentPage(1); }}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'orders' ? 'rgba(198, 167, 94, 0.15)' : 'transparent',
              color: activeTab === 'orders' ? 'var(--accent-gold)' : 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Smartphone style={{ width: '16px', height: '16px' }} />
            Activations ({totalOrders})
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
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Clock style={{ width: '16px', height: '16px' }} />
            Rentals ({totalRentals})
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
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 250px', maxWidth: '350px' }}>
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
              placeholder="Search by user, phone, order ID..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              style={{
                width: '100%',
                padding: '10px 12px 10px 40px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px'
              }}
            />
          </div>

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
              cursor: 'pointer'
            }}
          >
            <option value="">All Statuses</option>
            {(activeTab === 'orders' ? orderStatuses : rentalStatuses).map(status => (
              <option key={status} value={status}>
                {activeTab === 'orders' ? getOrderStatusLabel(status as SmsOrderStatus) : getRentalStatusLabel(status as SmsRentalStatus)}
              </option>
            ))}
          </select>

          {/* Date Filters */}
          {activeTab === 'orders' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
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
          {(searchQuery || statusFilter || dateFrom || dateTo) && (
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
        </div>

        {/* Content */}
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="skeleton" style={{ height: '80px', borderRadius: '12px' }} />
            ))}
          </div>
        ) : activeTab === 'orders' ? (
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: '16px',
            overflow: 'hidden'
          }}>
            {/* Table Header */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 150px 150px 120px 100px 100px 80px',
              gap: '12px',
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-secondary)'
            }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Order
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                User
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Phone
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Status
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Cost
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Date
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Actions
              </div>
            </div>

            {/* Table Body */}
            {orders.map((order) => {
              const badge = getProviderBadge(order.provider.slug);
              const statusColor = getOrderStatusColor(order.status);
              
              return (
                <div 
                  key={order.id}
                  style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 150px 150px 120px 100px 100px 80px',
                    gap: '12px',
                    padding: '16px 20px',
                    borderBottom: '1px solid var(--border-default)',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      {order.service.iconUrl ? (
                        <img src={order.service.iconUrl} alt="" style={{ width: '24px', height: '24px', borderRadius: '6px' }} />
                      ) : (
                        <Smartphone style={{ width: '18px', height: '18px', color: 'var(--text-muted)' }} />
                      )}
                      <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{order.service.name}</span>
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 700,
                        backgroundColor: badge.color,
                        color: '#000'
                      }}>
                        {badge.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '14px' }}>{getCountryFlag(order.country.code)}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{order.country.name}</span>
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '2px' }}>
                      {order.user?.email?.split('@')[0] || '—'}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {order.user?.email || '—'}
                    </p>
                  </div>
                  <div>
                    {order.phoneNumber ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                          {order.phoneNumber}
                        </span>
                        <button
                          onClick={() => copyToClipboard(order.phoneNumber!, order.id)}
                          style={{ padding: '2px', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          {copiedId === order.id ? (
                            <Check style={{ width: '12px', height: '12px', color: 'var(--success)' }} />
                          ) : (
                            <Copy style={{ width: '12px', height: '12px', color: 'var(--text-muted)' }} />
                          )}
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>—</span>
                    )}
                  </div>
                  <div>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 600,
                      backgroundColor: `${statusColor}15`,
                      color: statusColor
                    }}>
                      {getOrderStatusLabel(order.status)}
                    </span>
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--accent-gold)' }}>
                    {formatPrice(order.finalCost)}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                  <div>
                    <button
                      onClick={() => handleViewOrder(order.id)}
                      style={{
                        padding: '6px',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-default)',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      <Eye style={{ width: '14px', height: '14px', color: 'var(--text-muted)' }} />
                    </button>
                  </div>
                </div>
              );
            })}

            {orders.length === 0 && (
              <div style={{ padding: '48px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)' }}>No orders found</p>
              </div>
            )}
          </div>
        ) : (
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: '16px',
            overflow: 'hidden'
          }}>
            {/* Rentals Table Header */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 150px 150px 100px 100px 100px',
              gap: '12px',
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-secondary)'
            }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Rental
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                User
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Phone
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Status
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Cost
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Messages
              </div>
            </div>

            {/* Rentals Table Body */}
            {rentals.map((rental) => {
              const badge = getProviderBadge(rental.provider.slug);
              const statusColor = getRentalStatusColor(rental.status);
              
              return (
                <div 
                  key={rental.id}
                  style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 150px 150px 100px 100px 100px',
                    gap: '12px',
                    padding: '16px 20px',
                    borderBottom: '1px solid var(--border-default)',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <Clock style={{ width: '18px', height: '18px', color: 'var(--accent-gold)' }} />
                      <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                        {rental.rentalDuration}h Rental
                      </span>
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 700,
                        backgroundColor: badge.color,
                        color: '#000'
                      }}>
                        {badge.label}
                      </span>
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {new Date(rental.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '2px' }}>
                      {rental.user?.email?.split('@')[0] || '—'}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {rental.user?.email || '—'}
                    </p>
                  </div>
                  <div>
                    {rental.phoneNumber ? (
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                        {rental.phoneNumber}
                      </span>
                    ) : (
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>—</span>
                    )}
                  </div>
                  <div>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 600,
                      backgroundColor: `${statusColor}15`,
                      color: statusColor
                    }}>
                      {getRentalStatusLabel(rental.status)}
                    </span>
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--accent-gold)' }}>
                    {formatPrice(rental.finalCost)}
                  </div>
                  <div style={{ 
                    fontSize: '13px', 
                    color: rental.messages?.length > 0 ? 'var(--success)' : 'var(--text-muted)' 
                  }}>
                    {rental.messages?.length || 0} msgs
                  </div>
                </div>
              );
            })}

            {rentals.length === 0 && (
              <div style={{ padding: '48px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)' }}>No rentals found</p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            gap: '8px',
            marginTop: '24px'
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
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <>
          <div 
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 50 }}
            onClick={() => setSelectedOrder(null)}
          />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: '20px',
            zIndex: 51
          }}>
            {/* Modal Header */}
            <div style={{ 
              padding: '20px 24px', 
              borderBottom: '1px solid var(--border-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Order Details
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X style={{ width: '20px', height: '20px', color: 'var(--text-muted)' }} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '24px' }}>
              {/* Service Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                {selectedOrder.service.iconUrl ? (
                  <img src={selectedOrder.service.iconUrl} alt="" style={{ width: '48px', height: '48px', borderRadius: '12px' }} />
                ) : (
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Smartphone style={{ width: '24px', height: '24px', color: 'var(--text-muted)' }} />
                  </div>
                )}
                <div>
                  <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {selectedOrder.service.name}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>{getCountryFlag(selectedOrder.country.code)}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{selectedOrder.country.name}</span>
                  </div>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <span style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 600,
                    backgroundColor: `${getOrderStatusColor(selectedOrder.status)}15`,
                    color: getOrderStatusColor(selectedOrder.status)
                  }}>
                    {getOrderStatusLabel(selectedOrder.status)}
                  </span>
                </div>
              </div>

              {/* Details Grid */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: '16px',
                marginBottom: '24px'
              }}>
                <DetailItem label="Order ID" value={selectedOrder.id} />
                <DetailItem label="User" value={selectedOrder.user?.email || '—'} />
                <DetailItem label="Phone Number" value={selectedOrder.phoneNumber || '—'} />
                <DetailItem label="SMS Code" value={selectedOrder.smsCode || '—'} highlight />
                <DetailItem label="Provider" value={selectedOrder.provider.displayName} />
                <DetailItem label="Cost" value={formatPrice(selectedOrder.finalCost)} highlight />
                <DetailItem label="Created" value={new Date(selectedOrder.createdAt).toLocaleString()} />
                <DetailItem label="IP Address" value={selectedOrder.ipAddress || '—'} />
              </div>

              {/* Full SMS Text */}
              {selectedOrder.smsFullText && (
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                    Full SMS Message
                  </label>
                  <div style={{ 
                    padding: '16px', 
                    backgroundColor: 'var(--bg-secondary)', 
                    borderRadius: '12px',
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    fontStyle: 'italic'
                  }}>
                    &quot;{selectedOrder.smsFullText}&quot;
                  </div>
                </div>
              )}

              {/* Refund Section */}
              {selectedOrder.status !== 'REFUNDED' && selectedOrder.status !== 'CANCELLED' && (
                <div style={{ 
                  padding: '20px', 
                  backgroundColor: 'rgba(239, 68, 68, 0.05)', 
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '12px'
                }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--danger)', marginBottom: '12px' }}>
                    Issue Refund
                  </h4>
                  <input
                    type="text"
                    placeholder="Reason for refund (optional)"
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-default)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      marginBottom: '12px'
                    }}
                  />
                  <Button 
                    variant="outline" 
                    onClick={handleRefund}
                    disabled={isRefunding}
                    style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
                  >
                    {isRefunding ? (
                      <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite', marginRight: '8px' }} />
                    ) : (
                      <RotateCcw style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                    )}
                    Refund {formatPrice(selectedOrder.finalCost)}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function DetailItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
        {label}
      </span>
      <span style={{ 
        fontSize: '14px', 
        fontWeight: highlight ? 600 : 500, 
        color: highlight ? 'var(--accent-gold)' : 'var(--text-primary)',
        wordBreak: 'break-all'
      }}>
        {value}
      </span>
    </div>
  );
}

interface NavLinkProps {
  href: string;
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  label: string;
  active?: boolean;
}

function NavLink({ href, icon: Icon, label, active }: NavLinkProps) {
  return (
    <Link 
      href={href} 
      style={{ 
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 12px',
        borderRadius: '8px',
        textDecoration: 'none',
        backgroundColor: active ? 'rgba(198, 167, 94, 0.1)' : 'transparent',
        color: active ? 'var(--accent-gold)' : 'var(--text-secondary)',
        fontSize: '13px',
        fontWeight: 500,
        transition: 'all 0.15s'
      }}
    >
      <Icon style={{ width: '16px', height: '16px' }} />
      {label}
    </Link>
  );
}

