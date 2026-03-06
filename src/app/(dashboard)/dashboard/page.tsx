"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  MessageSquare, 
  Wallet, 
  Activity, 
  TrendingUp, 
  Plus,
  Smartphone,
  CreditCard,
  BarChart3,
  Package,
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight
} from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { DashboardShell } from "@/components/layout";
import { useAuth } from "@/hooks";
import { 
  getWalletBalance, 
  getOrderHistory, 
  SmsOrder,
  formatPrice,
  getOrderStatusLabel,
  getOrderStatusColor,
  getCountryFlag,
  WalletBalance
} from "@/lib/api";

/**
 * Dashboard Page - Premium SMS Activation Platform
 * 
 * Uses DashboardShell for consistent layout across all dashboard pages
 */
export default function DashboardPage() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [recentOrders, setRecentOrders] = useState<SmsOrder[]>([]);
  const [stats, setStats] = useState({
    activeNumbers: 0,
    totalOrders: 0,
    completedOrders: 0,
    successRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [balanceRes, ordersRes] = await Promise.all([
        getWalletBalance(),
        getOrderHistory({ limit: 5 })
      ]);

      setBalance(balanceRes);
      setRecentOrders(ordersRes.data);

      // Calculate stats
      const activeCount = ordersRes.data.filter(o => 
        ['PENDING', 'WAITING_SMS'].includes(o.status)
      ).length;
      
      const completedCount = ordersRes.data.filter(o => o.status === 'COMPLETED').length;
      const totalCount = ordersRes.meta.total;
      const rate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      setStats({
        activeNumbers: activeCount,
        totalOrders: totalCount,
        completedOrders: completedCount,
        successRate: rate
      });
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <DashboardShell>
      {/* Welcome */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Welcome back, {user.name?.split(" ")[0] || "User"}! 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Here&apos;s an overview of your SMS activation account.
        </p>
      </div>

      {/* Stats Grid - 4 columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }} className="lg:!grid-cols-4">
        <StatCard
          icon={<Wallet style={{ width: '20px', height: '20px' }} />}
          label="Wallet Balance"
          value={loading ? '...' : formatPrice(balance?.balance || '0')}
          trend={balance?.isLocked ? 'Wallet locked' : 'Available'}
          trendUp={!balance?.isLocked}
          loading={loading}
        />
        <StatCard
          icon={<Activity style={{ width: '20px', height: '20px' }} />}
          label="Active Numbers"
          value={loading ? '...' : stats.activeNumbers.toString()}
          trend={stats.activeNumbers > 0 ? 'Waiting for SMS' : 'No active orders'}
          loading={loading}
        />
        <StatCard
          icon={<TrendingUp style={{ width: '20px', height: '20px' }} />}
          label="Success Rate"
          value={loading ? '...' : stats.totalOrders > 0 ? `${stats.successRate}%` : '--'}
          trend={stats.totalOrders > 0 ? `${stats.completedOrders} completed` : 'No data yet'}
          trendUp={stats.successRate > 80}
          loading={loading}
        />
        <StatCard
          icon={<Package style={{ width: '20px', height: '20px' }} />}
          label="Total Orders"
          value={loading ? '...' : stats.totalOrders.toString()}
          trend={stats.totalOrders > 0 ? 'All time' : 'Start ordering'}
          loading={loading}
        />
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }} className="sm:!grid-cols-3">
          <ActionCard
            icon={<Smartphone style={{ width: '24px', height: '24px' }} />}
            title="Get Number"
            description="Activate a new number"
            href="/activate"
            color="gold"
          />
          <ActionCard
            icon={<CreditCard style={{ width: '24px', height: '24px' }} />}
            title="Add Funds"
            description="Top up your wallet"
            href="/wallet"
            color="amber"
          />
          <ActionCard
            icon={<BarChart3 style={{ width: '24px', height: '24px' }} />}
            title="View History"
            description="Check past orders"
            href="/orders"
            color="default"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>Recent Activity</h2>
          {recentOrders.length > 0 && (
            <Link href="/orders" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px', 
              color: 'var(--accent-gold)', 
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 500
            }}>
              View All <ArrowRight style={{ width: '14px', height: '14px' }} />
            </Link>
          )}
        </div>

        {loading ? (
          <div style={{ 
            padding: '64px 24px', 
            textAlign: 'center',
            backgroundColor: 'var(--bg-card)',
            borderRadius: '16px',
            border: '1px solid var(--border-default)'
          }}>
            <Loader2 style={{ 
              width: '32px', 
              height: '32px', 
              color: 'var(--accent-gold)',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }} />
            <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Loading activity...</p>
          </div>
        ) : recentOrders.length === 0 ? (
          <div style={{ border: '1px dashed var(--border-default)', borderRadius: '16px', backgroundColor: 'var(--bg-card)' }}>
            <div style={{ padding: '64px 24px', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', margin: '0 auto 16px', borderRadius: '16px', backgroundColor: 'rgba(198, 167, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageSquare style={{ width: '32px', height: '32px', color: 'var(--accent-gold)' }} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                No Recent Activity
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px', maxWidth: '320px', margin: '0 auto 24px' }}>
                You haven&apos;t made any orders yet. Start by getting your first virtual number!
              </p>
              <Link href="/activate">
                <Button size="lg">
                  <Plus style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                  Get Your First Number
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ 
            backgroundColor: 'var(--bg-card)', 
            borderRadius: '16px', 
            border: '1px solid var(--border-default)',
            overflow: 'hidden'
          }}>
            {recentOrders.map((order, index) => (
              <OrderRow key={order.id} order={order} isLast={index === recentOrders.length - 1} />
            ))}
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
  trend, 
  trendUp,
  loading
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  trend: string; 
  trendUp?: boolean;
  loading?: boolean;
}) {
  return (
    <div style={{ 
      backgroundColor: 'var(--bg-card)', 
      border: '1px solid var(--border-default)', 
      borderRadius: '16px', 
      padding: '20px',
      transition: 'all 200ms ease'
    }}>
      <div style={{ 
        width: '40px', 
        height: '40px', 
        borderRadius: '12px', 
        backgroundColor: 'rgba(198, 167, 94, 0.1)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        color: 'var(--accent-gold)',
        marginBottom: '12px'
      }}>
        {icon}
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</p>
      {loading ? (
        <div className="skeleton" style={{ height: '28px', width: '80px', borderRadius: '6px' }} />
      ) : (
        <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</p>
      )}
      <p style={{ fontSize: '12px', color: trendUp ? 'var(--success)' : 'var(--text-muted)', marginTop: '4px' }}>{trend}</p>
    </div>
  );
}

function ActionCard({ 
  icon, 
  title, 
  description, 
  href, 
  color 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  href: string; 
  color: "gold" | "amber" | "default";
}) {
  const colors = {
    gold: { bg: 'rgba(198, 167, 94, 0.05)', border: 'rgba(198, 167, 94, 0.2)', iconBg: 'rgba(198, 167, 94, 0.1)', iconColor: 'var(--accent-gold)' },
    amber: { bg: 'rgba(245, 158, 11, 0.05)', border: 'rgba(245, 158, 11, 0.2)', iconBg: 'rgba(245, 158, 11, 0.1)', iconColor: 'var(--warning)' },
    default: { bg: 'var(--bg-card)', border: 'var(--border-default)', iconBg: 'var(--bg-secondary)', iconColor: 'var(--text-secondary)' }
  };

  const c = colors[color];

  return (
    <Link href={href} style={{ 
      display: 'block', 
      padding: '20px', 
      borderRadius: '16px', 
      backgroundColor: c.bg, 
      border: `1px solid ${c.border}`,
      textDecoration: 'none',
      transition: 'all 200ms ease'
    }}>
      <div style={{ 
        width: '48px', 
        height: '48px', 
        borderRadius: '12px', 
        backgroundColor: c.iconBg, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        color: c.iconColor,
        marginBottom: '12px'
      }}>
        {icon}
      </div>
      <h3 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{title}</h3>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{description}</p>
    </Link>
  );
}

function OrderRow({ order, isLast }: { order: SmsOrder; isLast: boolean }) {
  const statusIcon = {
    PENDING: <Clock style={{ width: '16px', height: '16px' }} />,
    WAITING_SMS: <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 2s linear infinite' }} />,
    COMPLETED: <CheckCircle style={{ width: '16px', height: '16px' }} />,
    CANCELLED: <XCircle style={{ width: '16px', height: '16px' }} />,
    EXPIRED: <XCircle style={{ width: '16px', height: '16px' }} />,
    REFUNDED: <XCircle style={{ width: '16px', height: '16px' }} />
  };

  return (
    <Link 
      href={`/orders/${order.id}`}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        padding: '16px 20px',
        borderBottom: isLast ? 'none' : '1px solid var(--border-default)',
        textDecoration: 'none',
        transition: 'background-color 150ms ease'
      }}
      className="hover:bg-bg-hover"
    >
      {/* Service Icon */}
      <div style={{ 
        width: '40px', 
        height: '40px', 
        borderRadius: '10px', 
        backgroundColor: 'var(--bg-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: '12px',
        flexShrink: 0
      }}>
        {order.service.iconUrl ? (
          <img 
            src={order.service.iconUrl} 
            alt={order.service.name}
            style={{ width: '24px', height: '24px', borderRadius: '4px' }}
          />
        ) : (
          <Smartphone style={{ width: '20px', height: '20px', color: 'var(--text-muted)' }} />
        )}
      </div>

      {/* Order Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{order.service.name}</span>
          <span style={{ fontSize: '14px' }}>{getCountryFlag(order.country.code)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {order.phoneNumber && (
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              {order.phoneNumber}
            </span>
          )}
          {order.smsCode && (
            <Badge variant="success" size="sm">
              Code: {order.smsCode}
            </Badge>
          )}
        </div>
      </div>

      {/* Status & Price */}
      <div style={{ textAlign: 'right', marginLeft: '12px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px', 
          justifyContent: 'flex-end',
          marginBottom: '4px',
          color: getOrderStatusColor(order.status)
        }}>
          {statusIcon[order.status]}
          <span style={{ fontSize: '13px', fontWeight: 500 }}>
            {getOrderStatusLabel(order.status)}
          </span>
        </div>
        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-gold)' }}>
          {formatPrice(order.finalCost)}
        </span>
      </div>
    </Link>
  );
}
