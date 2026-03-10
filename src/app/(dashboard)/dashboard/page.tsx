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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState, useEffect, useCallback } from 'react';
import {
  getWalletBalance,
  formatBalance,
  WalletBalance,
} from '@/lib/api/walletApi';
import {
  getCurrentMembership,
  CurrentMembershipResponse,
} from '@/lib/api/membershipApi';
import {
  getOrderHistory,
  getRentalHistory,
  SmsOrder,
  SmsRental,
} from '@/lib/api/smsApi';
import { useAuth } from '@/hooks';

// Dashboard data interface
interface DashboardData {
  wallet: WalletBalance | null;
  membership: CurrentMembershipResponse | null;
  recentOrders: SmsOrder[];
  activeRentals: SmsRental[];
  stats: {
    activeNumbers: number;
    successRate: string;
    totalOrders: number;
  };
}

export default function Dashboard() {
  const { user, isAuthenticated, isInitialized } = useAuth();
  const [quickCountry, setQuickCountry] = useState('');
  const [quickService, setQuickService] = useState('');
  const [quickProvider, setQuickProvider] = useState('v1');

  // Dashboard data state
  const [data, setData] = useState<DashboardData>({
    wallet: null,
    membership: null,
    recentOrders: [],
    activeRentals: [],
    stats: {
      activeNumbers: 0,
      successRate: '--',
      totalOrders: 0,
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [walletRes, membershipRes, ordersRes, rentalsRes] =
        await Promise.allSettled([
          getWalletBalance(),
          getCurrentMembership(),
          getOrderHistory({ limit: 5 }),
          getRentalHistory({ status: 'ACTIVE', limit: 10 }),
        ]);

      // Process wallet
      const wallet = walletRes.status === 'fulfilled' ? walletRes.value : null;

      // Process membership
      const membership =
        membershipRes.status === 'fulfilled' ? membershipRes.value : null;

      // Process orders
      const orders =
        ordersRes.status === 'fulfilled' ? ordersRes.value.data : [];

      // Process rentals
      const rentals =
        rentalsRes.status === 'fulfilled' ? rentalsRes.value.data : [];

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
      setIsLoading(false);
    }
  }, []);

  // Fetch data on mount
  useEffect(() => {
    if (isInitialized) {
      fetchDashboardData();
    }
  }, [isInitialized, fetchDashboardData]);

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

  // Get country flag emoji
  const getCountryFlag = (code: string): string => {
    const codePoints = code
      .toUpperCase()
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
          <Button onClick={fetchDashboardData}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Map recent orders to activity format
  const recentActivity = data.recentOrders.slice(0, 3).map((order) => ({
    service: order.service?.name || 'Unknown',
    country: order.country?.name || 'Unknown',
    countryCode: order.country?.code || 'US',
    code: order.smsCode || '------',
    time: formatTimeAgo(order.createdAt),
    status: order.status.toLowerCase(),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's your overview.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="stagger-fade-in grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                <Link href="/dashboard/wallet">
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
                  <Link href="/dashboard/membership">
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Order Box */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Order</CardTitle>
            <CardDescription>
              Order a new SMS activation instantly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Country</label>
                <Select value={quickCountry} onValueChange={setQuickCountry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">🇺🇸 United States</SelectItem>
                    <SelectItem value="uk">🇬🇧 United Kingdom</SelectItem>
                    <SelectItem value="ca">🇨🇦 Canada</SelectItem>
                    <SelectItem value="de">🇩🇪 Germany</SelectItem>
                    <SelectItem value="fr">🇫🇷 France</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Service</label>
                <Select value={quickService} onValueChange={setQuickService}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="telegram">Telegram</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Provider Type</label>
              <div className="flex flex-wrap gap-3">
                <label className="flex cursor-pointer items-center space-x-2">
                  <input
                    type="radio"
                    name="provider"
                    value="v1"
                    checked={quickProvider === 'v1'}
                    onChange={(e) => setQuickProvider(e.target.value)}
                    className="h-4 w-4"
                  />
                  <div>
                    <Badge variant="secondary">💰 Standard V1</Badge>
                    <p className="text-muted-foreground mt-1 text-xs">
                      From $0.50
                    </p>
                  </div>
                </label>
                <label className="flex cursor-pointer items-center space-x-2">
                  <input
                    type="radio"
                    name="provider"
                    value="v2"
                    checked={quickProvider === 'v2'}
                    onChange={(e) => setQuickProvider(e.target.value)}
                    className="h-4 w-4"
                  />
                  <div>
                    <Badge className="from-primary to-accent bg-gradient-to-r">
                      💎 Premium V2
                    </Badge>
                    <p className="text-muted-foreground mt-1 text-xs">
                      From $1.50
                    </p>
                  </div>
                </label>
                <label className="flex cursor-pointer items-center space-x-2">
                  <input
                    type="radio"
                    name="provider"
                    value="v3"
                    checked={quickProvider === 'v3'}
                    onChange={(e) => setQuickProvider(e.target.value)}
                    className="h-4 w-4"
                  />
                  <div>
                    <Badge className="from-warning bg-gradient-to-r to-amber-500">
                      👑 Elite V3
                    </Badge>
                    <p className="text-muted-foreground mt-1 text-xs">
                      From $2.50
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <Button asChild className="w-full" size="lg">
              <Link href="/dashboard/activation">Order Now</Link>
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
                    <p className="text-sm font-medium">{activity.service}</p>
                    <p className="text-muted-foreground text-xs">
                      {getCountryFlag(activity.countryCode)} {activity.country}
                    </p>
                    <div className="mt-1 flex items-center justify-between">
                      <code className="bg-muted rounded px-2 py-1 text-xs">
                        {activity.code}
                      </code>
                      <span className="text-muted-foreground flex items-center text-xs">
                        <Clock className="mr-1 h-3 w-3" />
                        {activity.time}
                      </span>
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
              <Link href="/dashboard/orders">View All Orders</Link>
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
                        {rental.provider?.displayName || 'Provider'}
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
                        <Link href={`/dashboard/rent-numbers?id=${rental.id}`}>
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
            <Link href="/dashboard/rent-numbers">Manage All Rentals</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
