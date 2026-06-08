'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Wallet,
  Phone,
  TrendingUp,
  Crown,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  MessageSquare,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getWalletBalance,
  formatBalance,
  WalletBalance,
} from '@/lib/api/walletApi';
import { useNotifications } from '@/contexts/NotificationContext';
import {
  getCurrentMembership,
  CurrentMembershipResponse,
} from '@/lib/api/membershipApi';
import {
  getOrderHistory,
  getRentalHistory,
  getServices,
  getCountries,
  SmsOrder,
  SmsRental,
  SmsService,
  SmsCountry,
} from '@/lib/api/smsApi';
import { useAuth } from '@/hooks';

// Dashboard data interface
interface DashboardData {
  wallet: WalletBalance | null;
  membership: CurrentMembershipResponse | null;
  recentOrders: SmsOrder[];
  activeRentals: SmsRental[];
  services: SmsService[];
  countries: SmsCountry[];
  stats: {
    activeNumbers: number;
    successRate: string;
    totalOrders: number;
  };
}

export default function Dashboard() {
  const { user, isAuthenticated, isInitialized } = useAuth();

  // Dashboard data state
  const [data, setData] = useState<DashboardData>({
    wallet: null,
    membership: null,
    recentOrders: [],
    activeRentals: [],
    services: [],
    countries: [],
    stats: {
      activeNumbers: 0,
      successRate: '--',
      totalOrders: 0,
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setTimerTick] = useState(0);

  // Fetch dashboard data. Pass {silent:true} for background WS refreshes.
  const fetchDashboardData = useCallback(
    async (options?: { silent?: boolean }) => {
      try {
        if (!options?.silent) setIsLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [
          walletRes,
          membershipRes,
          ordersRes,
          rentalsRes,
          servicesRes,
          countriesRes,
        ] = await Promise.allSettled([
          getWalletBalance(),
          getCurrentMembership(),
          getOrderHistory({ limit: 5 }),
          getRentalHistory({ status: 'ACTIVE', limit: 10 }),
          getServices({ limit: 100 }),
          getCountries({ limit: 100 }),
        ]);

        // Process wallet
        const wallet =
          walletRes.status === 'fulfilled' ? walletRes.value : null;

        // Process membership
        const membership =
          membershipRes.status === 'fulfilled' ? membershipRes.value : null;

        // Process orders
        const orders =
          ordersRes.status === 'fulfilled' ? ordersRes.value.data : [];

        // Process rentals
        const rentals =
          rentalsRes.status === 'fulfilled' ? rentalsRes.value.data : [];

        // Process services
        const services =
          servicesRes.status === 'fulfilled' ? servicesRes.value.data : [];

        // Process countries
        const countries =
          countriesRes.status === 'fulfilled' ? countriesRes.value.data : [];

        // Calculate stats
        const activeNumbers =
          rentals.filter((r) => r.status === 'ACTIVE').length +
          orders.filter(
            (o) => o.status === 'WAITING_SMS' || o.status === 'PENDING',
          ).length;

        // Calculate success rate from recent orders
        const completedOrders = orders.filter(
          (o) => o.status === 'COMPLETED',
        ).length;
        const totalProcessedOrders = orders.filter((o) =>
          ['COMPLETED', 'CANCELLED', 'EXPIRED'].includes(o.status),
        ).length;
        const successRate =
          totalProcessedOrders > 0
            ? `${((completedOrders / totalProcessedOrders) * 100).toFixed(1)}%`
            : '--';

        setData({
          wallet,
          membership,
          recentOrders: orders,
          activeRentals: rentals,
          services,
          countries,
          stats: {
            activeNumbers,
            successRate,
            totalOrders: orders.length,
          },
        });
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please refresh the page.');
      } finally {
        if (!options?.silent) setIsLoading(false);
      }
    },
    [],
  );

  // Fetch data on mount (only once when initialized)
  const [hasFetched, setHasFetched] = useState(false);
  useEffect(() => {
    if (isInitialized && !hasFetched) {
      setHasFetched(true);
      fetchDashboardData();
    }
  }, [isInitialized, hasFetched, fetchDashboardData]);

  // Auto-refresh on WS notifications that change wallet/membership/orders
  const { notifications } = useNotifications();
  const lastNotifIdRef = useRef<string | null>(null);
  useEffect(() => {
    const latest = notifications[0];
    if (!latest || latest.id === lastNotifIdRef.current) return;
    lastNotifIdRef.current = latest.id;
    const refreshing = new Set([
      'PAYMENT_SUCCESS',
      'PAYMENT_REFUNDED',
      'WALLET_CREDITED',
      'WALLET_DEBITED',
      'MEMBERSHIP_SUBSCRIBED',
      'MEMBERSHIP_UPGRADED',
      'MEMBERSHIP_RENEWED',
      'MEMBERSHIP_EXPIRED',
      'SMS_RECEIVED',
      'ORDER_CANCELLED',
      'ORDER_REFUNDED',
    ]);
    if (refreshing.has(latest.type)) {
      fetchDashboardData({ silent: true });
    }
  }, [notifications, fetchDashboardData]);

  // Live countdown ticker - update every second when there are waiting orders.
  // expiresAt may be null on legacy rows; we derive a fallback in the
  // activity mapper below, so the ticker only needs to know there's a
  // waiting order, not whether it has a server-provided expiry.
  useEffect(() => {
    const hasWaiting = data.recentOrders.some(
      (o) => o.status === 'PENDING' || o.status === 'WAITING_SMS',
    );
    if (!hasWaiting) return;
    const interval = setInterval(() => setTimerTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [data.recentOrders]);

  // Format countdown (e.g., "19 min 50 sec")
  const formatCountdown = (expiresAt: string): string => {
    const diffMs = new Date(expiresAt).getTime() - Date.now();
    if (diffMs <= 0) return 'Expired';
    const totalSec = Math.floor(diffMs / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    if (min >= 60) {
      const hours = Math.floor(min / 60);
      return `${hours}h ${min % 60}m`;
    }
    return `${min} min ${sec.toString().padStart(2, '0')} sec`;
  };

  // Format expiration time (e.g., "04:17 PM")
  const formatExpiryTime = (expiresAt: string): string => {
    return new Date(expiresAt).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format time ago
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  // Format time remaining
  const formatTimeRemaining = (expiresAt: string): string => {
    const expires = new Date(expiresAt);
    const now = new Date();
    const diffMs = expires.getTime() - now.getTime();

    if (diffMs <= 0) return 'Expired';

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    const remainingHours = diffHours % 24;

    if (diffDays > 0) {
      return `${diffDays}d ${remainingHours}h`;
    }
    return `${diffHours}h`;
  };

  // Get country flag emoji. Only valid ISO alpha-2 codes (2 A-Z letters)
  // map to a real flag — anything else (full country name, lowercase, digits)
  // would render as a string of orphan regional indicator letters, which
  // browsers show as boxed letters instead of a flag. Return empty in that
  // case so the UI just shows the country name on its own.
  const getCountryFlag = (code: string): string => {
    if (!code) return '';
    const trimmed = code.trim().toUpperCase();
    if (!/^[A-Z]{2}$/.test(trimmed)) return '';
    const codePoints = trimmed
      .split('')
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  // Loading state
  if (!isInitialized || isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="text-primary mx-auto mb-4 h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <AlertCircle className="text-destructive mx-auto mb-4 h-8 w-8" />
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => fetchDashboardData()}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Map recent orders to activity format. Client bug #15: waiting
  // orders must always show a live countdown + absolute expiry. Some
  // legacy rows have null expiresAt — derive a fallback from createdAt
  // using the standard 20-minute activation window so the UI never
  // falls back to a "X min ago" label for an in-flight order.
  const DEFAULT_TIMEOUT_MIN = 20;
  const recentActivity = data.recentOrders.slice(0, 3).map((order) => {
    const isWaiting =
      order.status === 'PENDING' || order.status === 'WAITING_SMS';
    let expiresAt = order.expiresAt ?? null;
    if (!expiresAt && isWaiting && order.createdAt) {
      expiresAt = new Date(
        new Date(order.createdAt).getTime() + DEFAULT_TIMEOUT_MIN * 60 * 1000,
      ).toISOString();
    }
    return {
      service: order.service?.name || 'Unknown',
      country: order.country?.name || 'Unknown',
      countryCode: order.country?.code || 'US',
      phoneNumber: order.phoneNumber,
      code: order.smsCode,
      expiresAt,
      time: formatTimeAgo(order.createdAt),
      status: order.status.toLowerCase(),
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here&apos;s your overview.
          </p>
        </div>
        {user?.rank && (
          <Badge
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm"
            style={{
              backgroundColor: `${user.rank.color}20`,
              color: user.rank.color,
              borderColor: `${user.rank.color}40`,
            }}
            variant="outline"
          >
            <span>{user.rank.name}</span>
            {user.rank.discountPercent > 0 && (
              <span className="opacity-75">
                ({user.rank.discountPercent}% off)
              </span>
            )}
          </Badge>
        )}
      </div>

      {/* Summary Cards */}
      <div className="stagger-fade-in grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Wallet Balance
            </CardTitle>
            <Wallet className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-primary animate-count-up text-2xl font-bold">
              {data.wallet
                ? formatBalance(data.wallet.balance, data.wallet.currency)
                : '$0.00'}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              <Button asChild variant="link" className="h-auto p-0 text-xs">
                <Link prefetch={false} href="/dashboard/wallet">
                  Add Funds <ArrowUpRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Numbers
            </CardTitle>
            <Phone className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="animate-count-up text-2xl font-bold">
              {data.stats.activeNumbers}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              {data.activeRentals.length} rental
              {data.activeRentals.length !== 1 ? 's' : ''},{' '}
              {
                data.recentOrders.filter((o) => o.status === 'WAITING_SMS')
                  .length
              }{' '}
              pending
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-success animate-count-up text-2xl font-bold">
              {data.stats.successRate}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              Based on recent orders
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary card-hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
            <Crown className="text-primary h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="animate-count-up text-2xl font-bold">
              {data.membership?.currentPlan?.name || 'Free'}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              {data.membership?.currentPlan?.slug !== 'vip' ? (
                <Button asChild variant="link" className="h-auto p-0 text-xs">
                  <Link prefetch={false} href="/dashboard/membership">
                    Upgrade Plan <ArrowUpRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              ) : (
                <span className="text-primary">VIP Member</span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Order SMS Now */}
        <Card className="md:col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>SMS Activation</CardTitle>
            <CardDescription>
              Get phone numbers for instant SMS verification
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 py-6">
            <div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-2xl">
              <MessageSquare className="text-primary h-8 w-8" />
            </div>
            <p className="text-muted-foreground text-center text-sm">
              Choose from 500+ services across 180+ countries with instant
              delivery
            </p>
            <Button asChild className="w-full" size="lg">
              <Link prefetch={false} href="/dashboard/activation">Order SMS Now</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Activity Section */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest SMS activations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, i) => (
                <div
                  key={i}
                  className="border-border flex items-start space-x-3 border-b pb-3 last:border-0 last:pb-0"
                >
                  <div
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                      activity.status === 'completed'
                        ? 'bg-success/10'
                        : activity.status === 'waiting_sms'
                          ? 'bg-warning/10'
                          : 'bg-muted'
                    }`}
                  >
                    {activity.status === 'completed' ? (
                      <CheckCircle2 className="text-success h-4 w-4" />
                    ) : activity.status === 'waiting_sms' ? (
                      <Clock className="text-warning h-4 w-4" />
                    ) : (
                      <MessageSquare className="text-muted-foreground h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium">
                          {activity.service}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {getCountryFlag(activity.countryCode)}{' '}
                          {activity.country}
                        </p>
                      </div>
                      {(activity.status === 'pending' ||
                        activity.status === 'waiting_sms') &&
                      activity.expiresAt ? (
                        <div className="flex shrink-0 flex-col items-end">
                          <span className="text-foreground flex items-center text-xs font-semibold">
                            <Clock className="mr-1 h-3 w-3" />
                            <span className="font-mono tabular-nums">
                              {formatCountdown(activity.expiresAt)}
                            </span>
                          </span>
                          <span className="text-muted-foreground text-[10px]">
                            Expires {formatExpiryTime(activity.expiresAt)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground flex shrink-0 items-center text-xs">
                          <Clock className="mr-1 h-3 w-3" />
                          {activity.time}
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5">
                      {activity.phoneNumber && (
                        <code className="text-foreground block font-mono text-xs font-semibold">
                          {activity.phoneNumber}
                        </code>
                      )}
                      {activity.code && (
                        <code className="text-success mt-0.5 block font-mono text-xs font-bold">
                          {activity.code}
                        </code>
                      )}
                      {!activity.phoneNumber && !activity.code && (
                        <code className="bg-muted rounded px-2 py-1 text-xs">
                          Waiting for number...
                        </code>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center">
                <MessageSquare className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
                <p className="text-muted-foreground text-sm">
                  No recent activity
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  Your SMS activations will appear here
                </p>
              </div>
            )}
            <Button asChild variant="outline" className="w-full">
              <Link prefetch={false} href="/dashboard/orders">View All Orders</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Rental Status */}
      <Card>
        <CardHeader>
          <CardTitle>Active Rentals</CardTitle>
          <CardDescription>Your currently rented numbers</CardDescription>
        </CardHeader>
        <CardContent>
          {data.activeRentals.length > 0 ? (
            <div className="space-y-3">
              {data.activeRentals.slice(0, 3).map((rental) => (
                <div
                  key={rental.id}
                  className="border-border flex flex-col gap-3 rounded-lg border p-4 backdrop-blur-[var(--glass-blur-secondary)] transition-all duration-[180ms] [background:var(--glass-secondary)] hover:-translate-y-0.5 hover:[box-shadow:var(--glass-shadow-1)] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📱</span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium sm:text-base">
                        {rental.phoneNumber || 'Pending...'}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {(() => {
                          const name = (
                            rental.provider?.displayName || ''
                          ).toLowerCase();
                          if (name.includes('premium') || name.includes('v2'))
                            return 'Premium';
                          if (
                            name.includes('elite') ||
                            name.includes('v3') ||
                            name.includes('basic')
                          )
                            return 'Elite';
                          return 'Standard';
                        })()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 sm:flex-col sm:items-end">
                    <Badge variant="secondary">
                      <Clock className="mr-1 h-3 w-3" />
                      {formatTimeRemaining(rental.expiresAt)}
                    </Badge>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link prefetch={false} href={`/dashboard/rent-numbers?id=${rental.id}`}>
                          Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <Phone className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
              <p className="text-muted-foreground text-sm">No active rentals</p>
              <p className="text-muted-foreground mt-1 text-xs">
                Rent a number to receive multiple SMS
              </p>
            </div>
          )}
          <Button asChild variant="link" className="mt-4 w-full">
            <Link prefetch={false} href="/dashboard/rent-numbers">Manage All Rentals</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
