'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Wallet, 
  DollarSign, 
  Crown,
  Key,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  Server,
  Shield,
  FileText,
  LogOut,
  Home,
  Settings,
  ChevronDown,
  Star,
  Zap,
  Search,
  PenTool,
  ScrollText
} from 'lucide-react';
import { Button, Alert } from '@/components/ui';
import { useAuth } from '@/hooks';
import { 
  getDashboardOverview,
  getRecentAuditLogs,
  getRecentSystemLogs,
  formatCurrency,
  formatNumber,
  getGrowthIndicator,
  getSystemHealthColor,
  getLogLevelColor,
  type DashboardOverview,
  type AuditLog,
  type SystemLog
} from '@/lib/api';

/**
 * Admin Dashboard - Main analytics overview
 */
export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardOverview | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [dashboardData, auditData, systemData] = await Promise.all([
        getDashboardOverview(),
        getRecentAuditLogs(5),
        getRecentSystemLogs(5),
      ]);
      
      setDashboard(dashboardData);
      setAuditLogs(auditData);
      setSystemLogs(systemData);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', margin: '0 auto 16px', borderRadius: '50%', border: '4px solid var(--accent-gold)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'var(--text-muted)' }}>Loading dashboard...</p>
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
        padding: '16px 24px'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            {/* Left: Logo & Navigation */}
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
              
              {/* Navigation Links */}
              <nav style={{ display: 'flex', gap: '8px' }} className="hidden sm:!flex">
                <NavLink href="/admin" icon={Home} label="Home" active />
                <NavLink href="/admin/users" icon={Users} label="Users" />
                <NavLink href="/admin/wallets" icon={Wallet} label="Wallets" />
                <NavLink href="/admin/payments" icon={DollarSign} label="Payments" />
                <NavLink href="/admin/abuse" icon={Shield} label="Abuse" />
                <NavLink href="/admin/memberships" icon={Crown} label="Memberships" />
                <NavLink href="/admin/api-keys" icon={Key} label="API Keys" />
              </nav>
            </div>

            {/* Right: Actions & User Menu */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Button variant="secondary" onClick={fetchData} size="sm">
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
                    cursor: 'pointer',
                    transition: 'all 0.2s'
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
                      {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'A'}
                    </span>
                  </div>
                  <div style={{ textAlign: 'left' }} className="hidden sm:!block">
                    <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>
                      {user?.firstName || user?.email?.split('@')[0] || 'Admin'}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
                      {user?.role || 'Admin'}
                    </p>
                  </div>
                  <ChevronDown style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} className="hidden sm:!block" />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <>
                    <div 
                      style={{ position: 'fixed', inset: 0, zIndex: 40 }} 
                      onClick={() => setShowUserMenu(false)}
                    />
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
                      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-default)' }}>
                        <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>
                          {user?.email || 'admin@example.com'}
                        </p>
                        <p style={{ fontSize: '11px', color: 'var(--accent-gold)', margin: '2px 0 0 0', textTransform: 'capitalize' }}>
                          {user?.role?.toLowerCase() || 'Admin'}
                        </p>
                      </div>
                      <div style={{ padding: '8px' }}>
                        <Link 
                          href="/dashboard" 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '10px', 
                            padding: '10px 12px',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            color: 'var(--text-secondary)',
                            transition: 'background-color 0.15s'
                          }}
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Home style={{ width: '16px', height: '16px' }} />
                          <span style={{ fontSize: '14px' }}>User Dashboard</span>
                        </Link>
                        <Link 
                          href="/settings" 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '10px', 
                            padding: '10px 12px',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            color: 'var(--text-secondary)',
                            transition: 'background-color 0.15s'
                          }}
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Settings style={{ width: '16px', height: '16px' }} />
                          <span style={{ fontSize: '14px' }}>Settings</span>
                        </Link>
                      </div>
                      <div style={{ padding: '8px', borderTop: '1px solid var(--border-default)' }}>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            logout();
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            color: 'var(--danger)',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s',
                            fontSize: '14px'
                          }}
                        >
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
      <div style={{ 
        backgroundColor: 'var(--bg-primary)', 
        padding: '24px'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Admin Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Overview of your SMS Sort platform
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        {/* Error */}
        {error && (
          <div style={{ marginBottom: '24px' }}>
            <Alert variant="error" dismissible onDismiss={() => setError(null)}>
              {error}
            </Alert>
          </div>
        )}

        {/* Quick Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }} className="lg:!grid-cols-4">
          <QuickStatCard 
            icon={Users}
            label="Total Users"
            value={formatNumber(dashboard?.users.totalUsers || 0)}
            change={dashboard?.users.userGrowthPercent || 0}
            href="/admin/users"
          />
          <QuickStatCard 
            icon={DollarSign}
            label="Total Revenue"
            value={formatCurrency(dashboard?.revenue.totalRevenue || '0')}
            change={dashboard?.revenue.revenueGrowthPercent || 0}
            href="/admin/wallets"
          />
          <QuickStatCard 
            icon={Crown}
            label="Active Memberships"
            value={formatNumber(dashboard?.memberships.totalActive || 0)}
            subtext={`${dashboard?.memberships.newToday || 0} new today`}
            href="/admin/memberships"
          />
          <QuickStatCard 
            icon={Key}
            label="Active API Keys"
            value={formatNumber(dashboard?.api.activeKeys || 0)}
            subtext={`${formatNumber(dashboard?.api.requestsToday || 0)} requests today`}
            href="/admin/api-keys"
          />
        </div>

        {/* Main Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', marginBottom: '24px' }} className="lg:!grid-cols-3">
          {/* Revenue Overview */}
          <div style={{ gridColumn: 'span 1' }} className="lg:!col-span-2">
            <div style={{ 
              backgroundColor: 'var(--bg-card)', 
              border: '1px solid var(--border-default)', 
              borderRadius: '16px',
              padding: '24px',
              height: '100%'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px' }}>
                Revenue Overview
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }} className="sm:!grid-cols-4">
                <RevenueBox label="Today" value={formatCurrency(dashboard?.revenue.revenueToday || '0')} />
                <RevenueBox label="This Week" value={formatCurrency(dashboard?.revenue.revenueThisWeek || '0')} />
                <RevenueBox label="This Month" value={formatCurrency(dashboard?.revenue.revenueThisMonth || '0')} />
                <RevenueBox label="Avg Transaction" value={formatCurrency(dashboard?.revenue.avgTransactionValue || '0')} />
              </div>
              
              {/* Placeholder for chart */}
              <div style={{ 
                marginTop: '24px', 
                height: '200px', 
                backgroundColor: 'var(--bg-secondary)', 
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <Activity style={{ width: '32px', height: '32px', color: 'var(--text-muted)', margin: '0 auto 8px' }} />
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Revenue chart coming soon</p>
                </div>
              </div>
            </div>
          </div>

          {/* System Health */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ 
              backgroundColor: 'var(--bg-card)', 
              border: '1px solid var(--border-default)', 
              borderRadius: '16px',
              padding: '24px',
              height: '100%'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px' }}>
                System Health
              </h3>
              
              {/* Status */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                padding: '16px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '12px',
                marginBottom: '16px'
              }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '50%', 
                  backgroundColor: `${getSystemHealthColor(dashboard?.systemHealth.status || 'healthy')}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Server style={{ width: '24px', height: '24px', color: getSystemHealthColor(dashboard?.systemHealth.status || 'healthy') }} />
                </div>
                <div>
                  <p style={{ fontWeight: 600, color: getSystemHealthColor(dashboard?.systemHealth.status || 'healthy'), textTransform: 'capitalize' }}>
                    {dashboard?.systemHealth.status || 'Unknown'}
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {((dashboard?.systemHealth.uptime || 0) / 3600).toFixed(1)}h uptime
                  </p>
                </div>
              </div>

              {/* Metrics */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <HealthMetric 
                  icon={AlertTriangle} 
                  label="Errors Today" 
                  value={dashboard?.systemHealth.errorsToday || 0}
                  color={dashboard?.systemHealth.errorsToday ? 'var(--danger)' : 'var(--success)'}
                />
                <HealthMetric 
                  icon={AlertTriangle} 
                  label="Warnings Today" 
                  value={dashboard?.systemHealth.warningsToday || 0}
                  color={dashboard?.systemHealth.warningsToday ? 'var(--warning)' : 'var(--success)'}
                />
                <HealthMetric 
                  icon={Activity} 
                  label="API Error Rate" 
                  value={`${((dashboard?.api.errorRate || 0) * 100).toFixed(2)}%`}
                  color={(dashboard?.api.errorRate || 0) > 0.05 ? 'var(--danger)' : 'var(--success)'}
                />
              </div>
            </div>
          </div>
        </div>

        {/* User & Wallet Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', marginBottom: '24px' }} className="lg:!grid-cols-2">
          {/* User Stats */}
          <div style={{ 
            backgroundColor: 'var(--bg-card)', 
            border: '1px solid var(--border-default)', 
            borderRadius: '16px',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                User Statistics
              </h3>
              <Link href="/admin/users" style={{ fontSize: '14px', color: 'var(--accent-gold)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                View All <ArrowRight style={{ width: '14px', height: '14px' }} />
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }} className="sm:!grid-cols-4">
              <StatBox icon={Users} label="Total" value={dashboard?.users.totalUsers || 0} />
              <StatBox icon={CheckCircle} label="Today" value={dashboard?.users.newUsersToday || 0} color="green" />
              <StatBox icon={Clock} label="This Week" value={dashboard?.users.newUsersThisWeek || 0} color="blue" />
              <StatBox icon={Activity} label="Active Today" value={dashboard?.users.activeUsersToday || 0} color="gold" />
            </div>
          </div>

          {/* Wallet Stats */}
          <div style={{ 
            backgroundColor: 'var(--bg-card)', 
            border: '1px solid var(--border-default)', 
            borderRadius: '16px',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Wallet Statistics
              </h3>
              <Link href="/admin/wallets" style={{ fontSize: '14px', color: 'var(--accent-gold)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                View All <ArrowRight style={{ width: '14px', height: '14px' }} />
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }} className="sm:!grid-cols-4">
              <StatBox icon={Wallet} label="Total Balance" value={formatCurrency(dashboard?.wallet.totalBalance || '0')} isString />
              <StatBox icon={TrendingUp} label="Deposited" value={formatCurrency(dashboard?.wallet.totalDeposited || '0')} color="green" isString />
              <StatBox icon={TrendingDown} label="Spent" value={formatCurrency(dashboard?.wallet.totalSpent || '0')} color="red" isString />
              <StatBox icon={Shield} label="Locked" value={dashboard?.wallet.lockedWallets || 0} color="red" />
            </div>
          </div>
        </div>

        {/* Logs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }} className="lg:!grid-cols-2">
          {/* Audit Logs */}
          <div style={{ 
            backgroundColor: 'var(--bg-card)', 
            border: '1px solid var(--border-default)', 
            borderRadius: '16px',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Recent Activity
              </h3>
              <FileText style={{ width: '18px', height: '18px', color: 'var(--text-muted)' }} />
            </div>
            {auditLogs.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)' }}>No recent activity</p>
              </div>
            ) : (
              <div>
                {auditLogs.map((log) => (
                  <div key={log.id} style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-default)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      {log.user?.email || 'System'} • {log.entityType}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* System Logs */}
          <div style={{ 
            backgroundColor: 'var(--bg-card)', 
            border: '1px solid var(--border-default)', 
            borderRadius: '16px',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                System Logs
              </h3>
              <Server style={{ width: '18px', height: '18px', color: 'var(--text-muted)' }} />
            </div>
            {systemLogs.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)' }}>No system logs</p>
              </div>
            ) : (
              <div>
                {systemLogs.map((log) => {
                  const levelColor = getLogLevelColor(log.level);
                  return (
                    <div key={log.id} style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-default)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ 
                          padding: '2px 6px', 
                          borderRadius: '4px', 
                          fontSize: '10px', 
                          fontWeight: 600,
                          backgroundColor: levelColor.bg,
                          color: levelColor.text
                        }}>
                          {log.level}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.message}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick Links - Core */}
        <div style={{ 
          marginTop: '24px',
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '16px' 
        }} className="sm:!grid-cols-4 lg:!grid-cols-6">
          <QuickLink href="/admin/users" icon={Users} label="Manage Users" />
          <QuickLink href="/admin/wallets" icon={Wallet} label="Manage Wallets" />
          <QuickLink href="/admin/payments" icon={DollarSign} label="Payments" />
          <QuickLink href="/admin/abuse" icon={Shield} label="Abuse Control" />
          <QuickLink href="/admin/memberships" icon={Crown} label="Memberships" />
          <QuickLink href="/admin/api-keys" icon={Key} label="API Keys" />
        </div>

        {/* Quick Links - Content & Settings */}
        <div style={{ 
          marginTop: '16px',
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '16px' 
        }} className="sm:!grid-cols-4 lg:!grid-cols-6">
          <QuickLink href="/admin/blog" icon={PenTool} label="Blog Posts" />
          <QuickLink href="/admin/reviews" icon={Star} label="Reviews" />
          <QuickLink href="/admin/seo" icon={Search} label="SEO Settings" />
          <QuickLink href="/admin/addons" icon={Zap} label="Addons" />
          <QuickLink href="/admin/logs" icon={ScrollText} label="System Logs" />
          <QuickLink href="/admin/settings" icon={Settings} label="Settings" />
        </div>
      </div>
    </div>
  );
}

/* ==================== COMPONENTS ==================== */

interface QuickStatCardProps {
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  label: string;
  value: string;
  change?: number;
  subtext?: string;
  href: string;
}

function QuickStatCard({ icon: Icon, label, value, change, subtext, href }: QuickStatCardProps) {
  const growth = change !== undefined ? getGrowthIndicator(change) : null;

  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div style={{ 
        backgroundColor: 'var(--bg-card)', 
        border: '1px solid var(--border-default)', 
        borderRadius: '16px', 
        padding: '20px',
        transition: 'border-color 0.2s',
        cursor: 'pointer'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '10px', 
            backgroundColor: 'rgba(198, 167, 94, 0.1)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center'
          }}>
            <Icon style={{ width: '20px', height: '20px', color: 'var(--accent-gold)' }} />
          </div>
          {growth && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {growth.icon === 'up' ? (
                <TrendingUp style={{ width: '14px', height: '14px', color: growth.color }} />
              ) : growth.icon === 'down' ? (
                <TrendingDown style={{ width: '14px', height: '14px', color: growth.color }} />
              ) : null}
              <span style={{ fontSize: '12px', fontWeight: 600, color: growth.color }}>
                {change > 0 ? '+' : ''}{change?.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</p>
        <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</p>
        {subtext && (
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{subtext}</p>
        )}
      </div>
    </Link>
  );
}

interface RevenueBoxProps {
  label: string;
  value: string;
}

function RevenueBox({ label, value }: RevenueBoxProps) {
  return (
    <div style={{ 
      padding: '16px', 
      backgroundColor: 'var(--bg-secondary)', 
      borderRadius: '12px',
      textAlign: 'center'
    }}>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</p>
      <p style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</p>
    </div>
  );
}

interface HealthMetricProps {
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  label: string;
  value: number | string;
  color: string;
}

function HealthMetric({ icon: Icon, label, value, color }: HealthMetricProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Icon style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
        <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{label}</span>
      </div>
      <span style={{ fontWeight: 600, color }}>{value}</span>
    </div>
  );
}

interface StatBoxProps {
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  label: string;
  value: number | string;
  color?: 'gold' | 'green' | 'red' | 'blue';
  isString?: boolean;
}

function StatBox({ icon: Icon, label, value, color, isString }: StatBoxProps) {
  const colors = {
    gold: 'var(--accent-gold)',
    green: 'var(--success)',
    red: 'var(--danger)',
    blue: 'var(--info)',
  };

  return (
    <div style={{ 
      padding: '16px', 
      backgroundColor: 'var(--bg-secondary)', 
      borderRadius: '12px',
      textAlign: 'center'
    }}>
      <Icon style={{ width: '18px', height: '18px', color: color ? colors[color] : 'var(--accent-gold)', margin: '0 auto 8px' }} />
      <p style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
        {isString ? value : formatNumber(value as number)}
      </p>
      <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{label}</p>
    </div>
  );
}

interface QuickLinkProps {
  href: string;
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  label: string;
}

function QuickLink({ href, icon: Icon, label }: QuickLinkProps) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div style={{ 
        backgroundColor: 'var(--bg-card)', 
        border: '1px solid var(--border-default)', 
        borderRadius: '12px', 
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        transition: 'border-color 0.2s'
      }}>
        <Icon style={{ width: '20px', height: '20px', color: 'var(--accent-gold)' }} />
        <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{label}</span>
        <ArrowRight style={{ width: '16px', height: '16px', color: 'var(--text-muted)', marginLeft: 'auto' }} />
      </div>
    </Link>
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
