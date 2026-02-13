"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
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
  HelpCircle
} from "lucide-react";
import { Button, Card, CardContent, Badge } from "@/components/ui";

/**
 * Dashboard Page - Following Design Guidelines
 * 
 * Layout specs:
 * - Sidebar: 240px fixed width, 24px padding
 * - Header: 64px height, 24px horizontal padding
 * - Main content padding: 24px
 * - Stats row: 4 cards with 16px gap
 * - Section spacing: 24px
 * - Sidebar item: 44px height, 12px 16px padding
 */
export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full border-4 border-accent-gold border-t-transparent animate-spin" />
          <p className="text-text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* Sidebar - 240px width, 16px padding as per guidelines */}
      <aside className="hidden lg:flex flex-col w-60 bg-bg-card border-r border-border-default fixed h-screen">
        {/* Logo - 24px padding */}
        <div className="p-6 border-b border-border-default">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center shadow-gold">
              <MessageSquare className="w-5 h-5 text-bg-primary" />
            </div>
            <span className="text-xl font-bold text-text-primary">
              SMS<span className="text-gold-gradient">Pro</span>
            </span>
          </Link>
        </div>

        {/* Navigation - 16px padding, 24px section gap */}
        <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
          {/* Main Section */}
          <div>
            <p className="px-4 mb-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
              Main
            </p>
            <div className="space-y-1">
              <SidebarItem icon={<Activity />} label="Dashboard" active />
              <SidebarItem icon={<MessageSquare />} label="SMS Activation" />
              <SidebarItem icon={<History />} label="Number Rental" badge="New" />
            </div>
          </div>

          {/* Account Section */}
          <div>
            <p className="px-4 mb-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
              Account
            </p>
            <div className="space-y-1">
              <SidebarItem icon={<Wallet />} label="Wallet" />
              <SidebarItem icon={<TrendingUp />} label="Orders" />
              <SidebarItem icon={<Users />} label="Referrals" />
            </div>
          </div>

          {/* Support Section */}
          <div>
            <p className="px-4 mb-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
              Support
            </p>
            <div className="space-y-1">
              <SidebarItem icon={<HelpCircle />} label="Help Center" />
              <SidebarItem icon={<Settings />} label="Settings" />
            </div>
          </div>
        </nav>

        {/* User Section - 16px padding */}
        <div className="p-4 border-t border-border-default">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-hover">
            <div className="w-10 h-10 rounded-full bg-accent-gold/20 flex items-center justify-center text-accent-gold font-semibold flex-shrink-0">
              {session.user?.name?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">
                {session.user?.name || "User"}
              </p>
              <p className="text-xs text-text-muted truncate">
                {session.user?.email}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-60">
        {/* Header - 64px height, 24px padding as per guidelines */}
        <header className="h-16 bg-bg-card border-b border-border-default sticky top-0 z-10">
          <div className="h-full px-6 flex items-center justify-between gap-4">
            {/* Search */}
            <div className="relative hidden sm:block flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="text"
                placeholder="Search services, countries..."
                className="w-full h-10 pl-12 pr-4 bg-bg-secondary border border-border-default rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-focus transition-colors duration-200"
              />
            </div>

            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gold-gradient flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-bg-primary" />
              </div>
              <span className="font-bold text-text-primary">SMSPro</span>
            </div>

            {/* Actions - 12px gap */}
            <div className="flex items-center gap-3">
              <button className="relative p-2.5 rounded-xl hover:bg-bg-hover transition-colors duration-150">
                <Bell className="w-5 h-5 text-text-secondary" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full" />
              </button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/login" })}
                leftIcon={<LogOut className="w-4 h-4" />}
              >
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content - 24px padding as per guidelines */}
        <main className="p-6">
          {/* Welcome Section - 24px margin bottom */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              Welcome back, {session.user?.name?.split(" ")[0] || "User"}! 👋
            </h1>
            <p className="text-text-secondary">
              Here&apos;s an overview of your SMS activation account.
            </p>
          </div>

          {/* Stats Grid - 4 cards with 16px gap, 24px margin bottom */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={<Wallet className="w-6 h-6" />}
              label="Wallet Balance"
              value="$0.00"
              trend="+$5.00 bonus"
              trendUp
            />
            <StatCard
              icon={<Activity className="w-6 h-6" />}
              label="Active Numbers"
              value="0"
              trend="No active orders"
            />
            <StatCard
              icon={<TrendingUp className="w-6 h-6" />}
              label="Success Rate"
              value="--"
              trend="No data yet"
            />
            <StatCard
              icon={<Users className="w-6 h-6" />}
              label="Total Orders"
              value="0"
              trend="Start ordering"
            />
          </div>

          {/* Quick Actions - 24px margin bottom */}
          <Card className="mb-6">
            <CardContent>
              <h2 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <QuickActionCard
                  emoji="📱"
                  title="Get Number"
                  description="Activate a new number"
                  variant="primary"
                />
                <QuickActionCard
                  emoji="💰"
                  title="Add Funds"
                  description="Top up your wallet"
                  variant="gold"
                />
                <QuickActionCard
                  emoji="📊"
                  title="View History"
                  description="Check past orders"
                  variant="success"
                />
              </div>
            </CardContent>
          </Card>

          {/* Empty State */}
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent-gold/10 flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-accent-gold" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">No Recent Activity</h3>
              <p className="text-text-secondary mb-8 max-w-md mx-auto">
                You haven&apos;t made any orders yet. Start by getting your first virtual number!
              </p>
              <Button size="lg" rightIcon={<Plus className="w-5 h-5" />}>
                Get Your First Number
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

/**
 * Sidebar Item - 44px height, 12px 16px padding, 10px border radius
 */
function SidebarItem({ 
  icon, 
  label, 
  active = false,
  badge
}: { 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean;
  badge?: string;
}) {
  return (
    <button
      className={`
        w-full h-11 flex items-center gap-3 px-4 rounded-xl text-sm font-medium
        transition-all duration-150
        ${active 
          ? "bg-accent-gold/10 text-accent-gold" 
          : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
        }
      `}
    >
      <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {badge && <Badge variant="v2">{badge}</Badge>}
      {active && <ChevronRight className="w-4 h-4 flex-shrink-0" />}
    </button>
  );
}

/**
 * Stat Card - 24px padding, 16px internal gap
 */
function StatCard({
  icon,
  label,
  value,
  trend,
  trendUp,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  trendUp?: boolean;
}) {
  return (
    <Card hover>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-accent-gold/10 flex items-center justify-center text-accent-gold">
            {icon}
          </div>
        </div>
        <p className="text-sm text-text-muted mb-1">{label}</p>
        <p className="text-2xl font-bold text-text-primary mb-2">{value}</p>
        <p className={`text-xs ${trendUp ? "text-success" : "text-text-muted"}`}>
          {trend}
        </p>
      </CardContent>
    </Card>
  );
}

/**
 * Quick Action Card - 16px padding
 */
function QuickActionCard({
  emoji,
  title,
  description,
  variant,
}: {
  emoji: string;
  title: string;
  description: string;
  variant: "primary" | "gold" | "success";
}) {
  const variants = {
    primary: "bg-accent-gold/5 border-accent-gold/20 hover:bg-accent-gold/10",
    gold: "bg-accent-gold-bright/5 border-accent-gold-bright/20 hover:bg-accent-gold-bright/10",
    success: "bg-success/5 border-success/20 hover:bg-success/10",
  };

  return (
    <button
      className={`
        p-4 rounded-2xl border text-left
        transition-all duration-200
        ${variants[variant]}
      `}
    >
      <div className="text-2xl mb-3">{emoji}</div>
      <h3 className="font-semibold text-text-primary mb-1">{title}</h3>
      <p className="text-sm text-text-muted">{description}</p>
    </button>
  );
}
