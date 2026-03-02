"use client";

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
  Package
} from "lucide-react";
import { Button } from "@/components/ui";
import { DashboardShell } from "@/components/layout";
import { useAuth } from "@/hooks";

/**
 * Dashboard Page - Premium SMS Activation Platform
 * 
 * Uses DashboardShell for consistent layout across all dashboard pages
 */
export default function DashboardPage() {
  const { user } = useAuth();

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
    </DashboardShell>
  );
}

/* ==================== COMPONENTS ==================== */

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
