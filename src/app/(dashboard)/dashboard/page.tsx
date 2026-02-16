"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  MessageSquare, 
  LogOut, 
  Wallet, 
  Activity, 
  TrendingUp, 
  Users,
  Bell,
  Search,
  ChevronRight,
  Plus,
  History,
  Settings,
  HelpCircle,
  Shield,
  Menu,
  X,
  Smartphone,
  CreditCard,
  BarChart3,
  Package
} from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { useAuth } from "@/hooks";

/**
 * Dashboard Page - Premium SMS Activation Platform
 * 
 * FIXED LAYOUT:
 * - Sidebar: 240px fixed on left
 * - Main content: margin-left 240px on desktop
 * - Header: 64px sticky
 * - Content padding: 24px
 */
export default function DashboardPage() {
  const { user, isAdmin, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) return null;

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

      {/* SIDEBAR - 240px fixed */}
      <aside 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '240px',
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
        {/* Logo */}
        <div style={{ height: '64px', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-default)' }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'linear-gradient(135deg, #C6A75E 0%, #D4AF37 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare style={{ width: '18px', height: '18px', color: 'var(--bg-primary)' }} />
            </div>
            <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
              SMS<span style={{ color: 'var(--accent-gold)' }}>Pro</span>
            </span>
          </Link>
          <button 
            className="lg:hidden"
            style={{ padding: '6px', borderRadius: '8px' }}
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
              <NavItem href="/dashboard" icon={<BarChart3 style={{ width: '18px', height: '18px' }} />} label="Dashboard" active />
              <NavItem href="/sms-activation" icon={<Smartphone style={{ width: '18px', height: '18px' }} />} label="SMS Activation" />
              <NavItem href="/number-rental" icon={<History style={{ width: '18px', height: '18px' }} />} label="Number Rental" badge="New" />
            </div>
          </div>

          {/* Account */}
          <div style={{ marginBottom: '24px' }}>
            <p style={{ padding: '0 12px', marginBottom: '8px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Account
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <NavItem href="/wallet" icon={<Wallet style={{ width: '18px', height: '18px' }} />} label="Wallet" />
              <NavItem href="/orders" icon={<Package style={{ width: '18px', height: '18px' }} />} label="Orders" />
              <NavItem href="/referrals" icon={<Users style={{ width: '18px', height: '18px' }} />} label="Referrals" />
            </div>
          </div>

          {/* Support */}
          <div style={{ marginBottom: '24px' }}>
            <p style={{ padding: '0 12px', marginBottom: '8px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Support
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <NavItem href="/help" icon={<HelpCircle style={{ width: '18px', height: '18px' }} />} label="Help Center" />
              <NavItem href="/settings" icon={<Settings style={{ width: '18px', height: '18px' }} />} label="Settings" />
            </div>
          </div>

          {/* Admin */}
          {isAdmin && (
            <div style={{ marginBottom: '24px' }}>
              <p style={{ padding: '0 12px', marginBottom: '8px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Admin
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <NavItem href="/admin" icon={<Shield style={{ width: '18px', height: '18px' }} />} label="Admin Panel" />
              </div>
            </div>
          )}
        </nav>

        {/* User Profile */}
        <div style={{ padding: '12px', borderTop: '1px solid var(--border-default)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '12px', backgroundColor: 'var(--bg-hover)' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(198, 167, 94, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)', fontWeight: 600, fontSize: '14px' }}>
              {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name || "User"}
                </p>
                {isAdmin && (
                  <span style={{ padding: '2px 6px', backgroundColor: 'rgba(198, 167, 94, 0.2)', color: 'var(--accent-gold)', fontSize: '10px', fontWeight: 600, borderRadius: '4px' }}>
                    ADMIN
                  </span>
                )}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT - margin-left: 240px on desktop */}
      <div 
        style={{ marginLeft: '0', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
        className="lg:!ml-[240px]"
      >
        {/* Header - 64px */}
        <header style={{ height: '64px', backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-default)', position: 'sticky', top: 0, zIndex: 30 }}>
          <div style={{ height: '100%', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Mobile Menu */}
            <button 
              className="lg:hidden"
              style={{ padding: '8px', marginLeft: '-8px', borderRadius: '8px' }}
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu style={{ width: '20px', height: '20px', color: 'var(--text-secondary)' }} />
            </button>

            {/* Mobile Logo */}
            <Link href="/dashboard" className="lg:hidden" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #C6A75E 0%, #D4AF37 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageSquare style={{ width: '16px', height: '16px', color: 'var(--bg-primary)' }} />
              </div>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>SMSPro</span>
            </Link>

            {/* Search */}
            <div className="hidden md:flex" style={{ flex: 1, maxWidth: '400px' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search services, countries..."
                  style={{ width: '100%', height: '40px', paddingLeft: '40px', paddingRight: '16px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: '12px', fontSize: '14px', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ flex: 1 }} />

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button className="md:hidden" style={{ padding: '8px', borderRadius: '8px' }}>
                <Search style={{ width: '20px', height: '20px', color: 'var(--text-secondary)' }} />
              </button>
              <button style={{ position: 'relative', padding: '8px', borderRadius: '8px' }}>
                <Bell style={{ width: '20px', height: '20px', color: 'var(--text-secondary)' }} />
                <span style={{ position: 'absolute', top: '6px', right: '6px', width: '8px', height: '8px', backgroundColor: 'var(--danger)', borderRadius: '50%' }} />
              </button>
              <Button variant="ghost" size="sm" onClick={logout} className="hidden sm:flex" style={{ gap: '8px' }}>
                <LogOut style={{ width: '16px', height: '16px' }} />
                <span>Sign out</span>
              </Button>
              <button className="sm:hidden" style={{ padding: '8px', borderRadius: '8px' }} onClick={logout}>
                <LogOut style={{ width: '20px', height: '20px', color: 'var(--text-secondary)' }} />
              </button>
            </div>
          </div>
        </header>

        {/* Content - 24px padding */}
        <main style={{ flex: 1, padding: '24px' }}>
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
              value="$0.00"
              trend="+$5.00 bonus"
              trendUp
            />
            <StatCard
              icon={<Activity style={{ width: '20px', height: '20px' }} />}
              label="Active Numbers"
              value="0"
              trend="No active orders"
            />
            <StatCard
              icon={<TrendingUp style={{ width: '20px', height: '20px' }} />}
              label="Success Rate"
              value="--"
              trend="No data yet"
            />
            <StatCard
              icon={<Package style={{ width: '20px', height: '20px' }} />}
              label="Total Orders"
              value="0"
              trend="Start ordering"
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
                href="/sms-activation"
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

          {/* Empty State */}
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>Recent Activity</h2>
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
                <Button size="lg">
                  <Plus style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                  Get Your First Number
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ==================== COMPONENTS ==================== */

function NavItem({ 
  href, 
  icon, 
  label, 
  active = false, 
  badge 
}: { 
  href: string; 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean; 
  badge?: string;
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
        transition: 'all 150ms ease'
      }}
    >
      <span style={{ flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge && <Badge variant="v2" style={{ fontSize: '10px', padding: '2px 6px' }}>{badge}</Badge>}
      {active && <ChevronRight style={{ width: '16px', height: '16px', opacity: 0.6 }} />}
    </Link>
  );
}

function StatCard({ 
  icon, 
  label, 
  value, 
  trend, 
  trendUp 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  trend: string; 
  trendUp?: boolean;
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
      <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</p>
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
