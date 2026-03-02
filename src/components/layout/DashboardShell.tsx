'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MessageSquare,
  LogOut,
  Wallet,
  Bell,
  Search,
  History,
  Settings,
  HelpCircle,
  Shield,
  Menu,
  X,
  Smartphone,
  BarChart3,
  Package,
  Users,
  Crown,
  Star
} from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { useAuth } from '@/hooks';

interface DashboardShellProps {
  children: React.ReactNode;
}

/**
 * DashboardShell - Shared layout for all dashboard pages
 * 
 * Includes:
 * - Sidebar (240px) with navigation
 * - Header (64px) with search and user actions
 * - Main content area
 */
export function DashboardShell({ children }: DashboardShellProps) {
  const { user, isAdmin, logout } = useAuth();
  const pathname = usePathname();
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
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'linear-gradient(135deg, #C6A75E 0%, #D4AF37 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare style={{ width: '18px', height: '18px', color: 'var(--bg-primary)' }} />
            </div>
            <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
              SMS<span style={{ color: 'var(--accent-gold)' }}>Pro</span>
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
              <NavItem href="/dashboard" icon={<BarChart3 style={{ width: '18px', height: '18px' }} />} label="Dashboard" active={pathname === '/dashboard'} />
              <NavItem href="/activate" icon={<Smartphone style={{ width: '18px', height: '18px' }} />} label="SMS Activation" active={pathname === '/activate'} />
              <NavItem href="/rent" icon={<History style={{ width: '18px', height: '18px' }} />} label="Number Rental" active={pathname === '/rent'} badge="New" />
            </div>
          </div>

          {/* Account */}
          <div style={{ marginBottom: '24px' }}>
            <p style={{ padding: '0 12px', marginBottom: '8px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Account
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <NavItem href="/wallet" icon={<Wallet style={{ width: '18px', height: '18px' }} />} label="Wallet" active={pathname === '/wallet'} />
              <NavItem href="/orders" icon={<Package style={{ width: '18px', height: '18px' }} />} label="Orders" active={pathname === '/orders' || pathname.startsWith('/orders/')} />
              <NavItem href="/favorites" icon={<Star style={{ width: '18px', height: '18px' }} />} label="Favorites" active={pathname === '/favorites'} />
              <NavItem href="/pricing" icon={<Crown style={{ width: '18px', height: '18px' }} />} label="Membership" active={pathname === '/pricing'} />
              <NavItem href="/referrals" icon={<Users style={{ width: '18px', height: '18px' }} />} label="Referrals" active={pathname === '/referrals'} />
            </div>
          </div>

          {/* Support */}
          <div style={{ marginBottom: '24px' }}>
            <p style={{ padding: '0 12px', marginBottom: '8px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Support
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <NavItem href="/help" icon={<HelpCircle style={{ width: '18px', height: '18px' }} />} label="Help Center" active={pathname === '/help'} />
              <NavItem href="/settings" icon={<Settings style={{ width: '18px', height: '18px' }} />} label="Settings" active={pathname === '/settings'} />
            </div>
          </div>

          {/* Admin */}
          {isAdmin && (
            <div style={{ marginBottom: '24px' }}>
              <p style={{ padding: '0 12px', marginBottom: '8px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Admin
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <NavItem href="/admin" icon={<Shield style={{ width: '18px', height: '18px' }} />} label="Admin Panel" active={pathname.startsWith('/admin')} />
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
                  {user.name || 'User'}
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
              style={{ padding: '8px', marginLeft: '-8px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu style={{ width: '20px', height: '20px', color: 'var(--text-secondary)' }} />
            </button>

            {/* Mobile Logo */}
            <Link href="/dashboard" className="lg:hidden" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
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
              <button className="md:hidden" style={{ padding: '8px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>
                <Search style={{ width: '20px', height: '20px', color: 'var(--text-secondary)' }} />
              </button>
              <button style={{ position: 'relative', padding: '8px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>
                <Bell style={{ width: '20px', height: '20px', color: 'var(--text-secondary)' }} />
                <span style={{ position: 'absolute', top: '6px', right: '6px', width: '8px', height: '8px', backgroundColor: 'var(--danger)', borderRadius: '50%' }} />
              </button>
              <Button variant="ghost" size="sm" onClick={logout} className="hidden sm:flex" style={{ gap: '8px' }}>
                <LogOut style={{ width: '16px', height: '16px' }} />
                <span>Sign out</span>
              </Button>
              <button className="sm:hidden" style={{ padding: '8px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer' }} onClick={logout}>
                <LogOut style={{ width: '20px', height: '20px', color: 'var(--text-secondary)' }} />
              </button>
            </div>
          </div>
        </header>

        {/* Content - 24px padding */}
        <main style={{ flex: 1, padding: '24px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

// Navigation Item Component
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
        textDecoration: 'none',
        transition: 'all 150ms ease'
      }}
    >
      <span style={{ flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge && <Badge variant="v2" style={{ fontSize: '10px', padding: '2px 6px' }}>{badge}</Badge>}
    </Link>
  );
}

export default DashboardShell;

