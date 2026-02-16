'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/hooks';
import { Button } from '@/components/ui';
import { 
  Users, 
  Settings, 
  Shield, 
  Activity,
  LogOut,
  ArrowLeft,
  MessageSquare,
  DollarSign,
  TrendingUp,
  Database,
  FileText,
  Lock,
  BarChart3,
  Wallet,
  CreditCard,
  Menu,
  X
} from 'lucide-react';

/**
 * Admin Dashboard Page - Only accessible by SUPER_ADMIN
 * 
 * LAYOUT (Design Guidelines 7.4):
 * - Sidebar: 260px fixed
 * - Header: 64px sticky
 * - Content: 32px padding
 * - Stats grid: 4 columns, 24px gap
 * - Cards: 24px padding
 */
export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 40
          }}
          className="lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR - 260px fixed */}
      <aside 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '260px',
          backgroundColor: 'var(--bg-card)',
          borderRight: '1px solid var(--border-default)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 50,
          transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 300ms ease-out'
        }}
        className="lg:!transform-none"
      >
        {/* Logo - 64px */}
        <div style={{ height: '64px', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-default)' }}>
          <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '12px', backgroundColor: 'rgba(198, 167, 94, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield style={{ width: '20px', height: '20px', color: 'var(--accent-gold)' }} />
            </div>
            <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Admin<span style={{ color: 'var(--accent-gold)' }}>Panel</span>
            </span>
          </Link>
          <button 
            className="lg:hidden"
            style={{ padding: '6px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X style={{ width: '20px', height: '20px', color: 'var(--text-muted)' }} />
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '20px 12px', overflowY: 'auto' }}>
          {/* Main */}
          <div style={{ marginBottom: '24px' }}>
            <p style={{ padding: '0 12px', marginBottom: '8px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Main
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <AdminNavItem href="/admin" icon={<BarChart3 style={{ width: '18px', height: '18px' }} />} label="Dashboard" active />
              <AdminNavItem href="/admin/analytics" icon={<TrendingUp style={{ width: '18px', height: '18px' }} />} label="Analytics" />
            </div>
          </div>

          {/* Users */}
          <div style={{ marginBottom: '24px' }}>
            <p style={{ padding: '0 12px', marginBottom: '8px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Users
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <AdminNavItem href="/admin/users" icon={<Users style={{ width: '18px', height: '18px' }} />} label="Manage Users" />
              <AdminNavItem href="/admin/roles" icon={<Lock style={{ width: '18px', height: '18px' }} />} label="Roles & Permissions" />
            </div>
          </div>

          {/* Services */}
          <div style={{ marginBottom: '24px' }}>
            <p style={{ padding: '0 12px', marginBottom: '8px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Services
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <AdminNavItem href="/admin/providers" icon={<Database style={{ width: '18px', height: '18px' }} />} label="Providers" />
              <AdminNavItem href="/admin/services" icon={<MessageSquare style={{ width: '18px', height: '18px' }} />} label="SMS Services" />
            </div>
          </div>

          {/* Finance */}
          <div style={{ marginBottom: '24px' }}>
            <p style={{ padding: '0 12px', marginBottom: '8px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Finance
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <AdminNavItem href="/admin/transactions" icon={<Wallet style={{ width: '18px', height: '18px' }} />} label="Transactions" />
              <AdminNavItem href="/admin/payments" icon={<CreditCard style={{ width: '18px', height: '18px' }} />} label="Payment Gateways" />
            </div>
          </div>

          {/* System */}
          <div style={{ marginBottom: '24px' }}>
            <p style={{ padding: '0 12px', marginBottom: '8px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              System
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <AdminNavItem href="/admin/settings" icon={<Settings style={{ width: '18px', height: '18px' }} />} label="Settings" />
              <AdminNavItem href="/admin/logs" icon={<FileText style={{ width: '18px', height: '18px' }} />} label="System Logs" />
            </div>
          </div>
        </nav>

        {/* Back to Dashboard */}
        <div style={{ padding: '12px', borderTop: '1px solid var(--border-default)' }}>
          <Link 
            href="/dashboard"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              height: '44px', 
              padding: '0 12px', 
              borderRadius: '12px', 
              fontSize: '14px', 
              fontWeight: 500, 
              color: 'var(--text-secondary)', 
              textDecoration: 'none',
              transition: 'all 150ms ease'
            }}
          >
            <ArrowLeft style={{ width: '18px', height: '18px' }} />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT - margin-left: 260px on desktop */}
      <div 
        style={{ marginLeft: '0', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
        className="lg:!ml-[260px]"
      >
        {/* Header - 64px */}
        <header style={{ height: '64px', backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-default)', position: 'sticky', top: 0, zIndex: 30 }}>
          <div style={{ height: '100%', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '16px' }} className="lg:!px-8">
            {/* Mobile Menu */}
            <button 
              className="lg:hidden"
              style={{ padding: '8px', marginLeft: '-8px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu style={{ width: '20px', height: '20px', color: 'var(--text-secondary)' }} />
            </button>

            {/* Mobile Title */}
            <div className="lg:hidden" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield style={{ width: '24px', height: '24px', color: 'var(--accent-gold)' }} />
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Admin</span>
            </div>

            {/* Desktop Breadcrumb */}
            <div className="hidden lg:flex" style={{ alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Admin</span>
              <span style={{ color: 'var(--text-muted)' }}>/</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Dashboard</span>
            </div>

            <div style={{ flex: 1 }} />

            {/* User Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="hidden md:block" style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </span>
              <span style={{ padding: '4px 8px', backgroundColor: 'rgba(198, 167, 94, 0.2)', color: 'var(--accent-gold)', fontSize: '12px', fontWeight: 600, borderRadius: '4px' }}>
                SUPER_ADMIN
              </span>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut style={{ width: '16px', height: '16px' }} />
              </Button>
            </div>
          </div>
        </header>

        {/* Content - 32px padding */}
        <main style={{ flex: 1, padding: '16px' }} className="lg:!p-8">
          {/* Welcome */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }} className="lg:!text-[30px]">
              Admin Dashboard
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Overview of your platform&apos;s performance and management tools.
            </p>
          </div>

          {/* Stats Grid - 4 columns, 24px gap */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '32px' }} className="lg:!grid-cols-4 lg:!gap-6">
            <AdminStatCard 
              icon={<Users style={{ width: '24px', height: '24px' }} />} 
              label="Total Users" 
              value="--" 
              trend="+0 this week" 
              iconBg="rgba(198, 167, 94, 0.1)"
              iconColor="var(--accent-gold)"
            />
            <AdminStatCard 
              icon={<Activity style={{ width: '24px', height: '24px' }} />} 
              label="Active Sessions" 
              value="--" 
              trend="Real-time" 
              iconBg="rgba(34, 197, 94, 0.1)"
              iconColor="var(--success)"
            />
            <AdminStatCard 
              icon={<MessageSquare style={{ width: '24px', height: '24px' }} />} 
              label="Total Orders" 
              value="--" 
              trend="+0 today" 
              iconBg="rgba(59, 130, 246, 0.1)"
              iconColor="var(--info)"
            />
            <AdminStatCard 
              icon={<DollarSign style={{ width: '24px', height: '24px' }} />} 
              label="Revenue" 
              value="$--" 
              trend="+$0 this month" 
              iconBg="rgba(168, 85, 247, 0.1)"
              iconColor="#a855f7"
            />
          </div>

          {/* Quick Actions */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>Quick Actions</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }} className="sm:!grid-cols-2 lg:!grid-cols-3 lg:!gap-6">
              <AdminActionCard 
                icon={<Users style={{ width: '24px', height: '24px' }} />} 
                title="User Management" 
                description="View, edit, and manage user accounts" 
                href="/admin/users" 
              />
              <AdminActionCard 
                icon={<Settings style={{ width: '24px', height: '24px' }} />} 
                title="System Settings" 
                description="Configure application settings" 
                href="/admin/settings" 
              />
              <AdminActionCard 
                icon={<TrendingUp style={{ width: '24px', height: '24px' }} />} 
                title="Analytics" 
                description="View system analytics and reports" 
                href="/admin/analytics" 
              />
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>Recent Activity</h2>
            <div style={{ border: '1px dashed var(--border-default)', borderRadius: '16px', backgroundColor: 'var(--bg-card)' }}>
              <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', margin: '0 auto 16px', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Activity style={{ width: '24px', height: '24px', color: 'var(--text-muted)' }} />
                </div>
                <p style={{ color: 'var(--text-muted)' }}>No recent activity to display</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ==================== COMPONENTS ==================== */

function AdminNavItem({ 
  href, 
  icon, 
  label, 
  active = false 
}: { 
  href: string; 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        height: '44px',
        padding: '0 12px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: 500,
        color: active ? 'var(--accent-gold)' : 'var(--text-secondary)',
        backgroundColor: active ? 'rgba(198, 167, 94, 0.1)' : 'transparent',
        textDecoration: 'none',
        transition: 'all 150ms ease'
      }}
    >
      <span style={{ flexShrink: 0 }}>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

function AdminStatCard({ 
  icon, 
  label, 
  value, 
  trend,
  iconBg,
  iconColor
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  trend: string;
  iconBg: string;
  iconColor: string;
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
        width: '48px', 
        height: '48px', 
        borderRadius: '12px', 
        backgroundColor: iconBg, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        color: iconColor,
        marginBottom: '12px'
      }}>
        {icon}
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</p>
      <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</p>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{trend}</p>
    </div>
  );
}

function AdminActionCard({ 
  icon, 
  title, 
  description, 
  href 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  href: string;
}) {
  return (
    <Link 
      href={href} 
      style={{ 
        display: 'block', 
        backgroundColor: 'var(--bg-card)', 
        border: '1px solid var(--border-default)', 
        borderRadius: '16px', 
        padding: '24px',
        textDecoration: 'none',
        transition: 'all 200ms ease'
      }}
    >
      <div style={{ 
        width: '48px', 
        height: '48px', 
        borderRadius: '12px', 
        backgroundColor: 'rgba(198, 167, 94, 0.1)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        color: 'var(--accent-gold)',
        marginBottom: '16px'
      }}>
        {icon}
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{title}</h3>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{description}</p>
    </Link>
  );
}
