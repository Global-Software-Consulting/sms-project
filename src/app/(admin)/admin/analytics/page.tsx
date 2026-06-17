'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { useNotifications } from '@/contexts/NotificationContext';
import { AdminGlassCard } from '@/components/admin/glass-card';
import { AdminStatCard } from '@/components/admin/stat-card';
import {
  Users,
  MessageSquare,
  DollarSign,
  Clock,
  XCircle,
  Globe,
  Briefcase,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  getDashboardOverview,
  getTopCountries,
  getTopServices,
  getRevenueTrends,
  getActivationTrends,
  getRecentActivity,
  type DashboardOverview,
  type TopCountry,
  type TopService,
  type TrendResponse,
  type RecentActivity,
} from '@/lib/api/adminApi';

const COLORS = [
  '#3B82F6',
  '#22C55E',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#84CC16',
  '#F97316',
  '#6366F1',
];

function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60)
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

function getActivityStatusStyle(status: string): string {
  switch (status.toUpperCase()) {
    case 'COMPLETED':
      return 'bg-[#22C55E]/20 text-[#22C55E]';
    case 'ACTIVE':
    case 'PENDING':
      return 'bg-[#3B82F6]/20 text-[#3B82F6]';
    case 'CANCELLED':
    case 'FAILED':
      return 'bg-[#EF4444]/20 text-[#EF4444]';
    default:
      return 'bg-[#94A3B8]/20 text-[#94A3B8]';
  }
}

export default function AdminAnalyticsPage() {
  const [dashboard, setDashboard] = useState<DashboardOverview | null>(null);
  const [topCountries, setTopCountries] = useState<TopCountry[]>([]);
  const [topServices, setTopServices] = useState<TopService[]>([]);
  const [revenueTrends, setRevenueTrends] = useState<TrendResponse | null>(
    null,
  );
  const [activationTrends, setActivationTrends] =
    useState<TrendResponse | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setIsLoading(true);
    try {
      const [
        dashboardData,
        countriesData,
        servicesData,
        revenueData,
        activationData,
        activityData,
      ] = await Promise.all([
        getDashboardOverview(),
        getTopCountries(),
        getTopServices(),
        getRevenueTrends(12),
        getActivationTrends(12),
        getRecentActivity(10),
      ]);
      setDashboard(dashboardData);
      setTopCountries(countriesData);
      setTopServices(servicesData);
      setRevenueTrends(revenueData);
      setActivationTrends(activationData);
      setRecentActivities(activityData);
    } catch (error: any) {
      if (!opts?.silent) {
        toast.error(
          error?.response?.data?.message || 'Failed to fetch analytics data',
        );
      }
    } finally {
      if (!opts?.silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh on payment-related notifications so the admin sees new
  // deposits land on the revenue / activity panels without a manual reload.
  // The backend fires:
  //   - PAYMENT_SUCCESS  → on every completed deposit (any gateway)
  //   - SYSTEM + data.paymentId → admin-side notification of a deposit
  //   - SYSTEM + data.type=BINANCE_RESET → admin reset a failed Binance verify
  const { notifications } = useNotifications();
  const lastSeenNotifIdRef = useRef<string | null>(null);
  useEffect(() => {
    const latest = notifications[0];
    if (!latest || latest.id === lastSeenNotifIdRef.current) return;
    lastSeenNotifIdRef.current = latest.id;
    const data = latest.data as { paymentId?: string } | null | undefined;
    const isPaymentEvent =
      latest.type === 'PAYMENT_SUCCESS' ||
      (latest.type === 'SYSTEM' && !!data?.paymentId);
    if (isPaymentEvent) {
      fetchData({ silent: true });
    }
  }, [notifications, fetchData]);

  const countryChartData = topCountries.map((c) => ({
    name: c.name,
    value: c.percentage,
  }));

  const serviceChartData = topServices.map((s) => ({
    service: s.name,
    count: s.orderCount,
  }));
  return (
    <div className="p-4 lg:p-8">
      <div className="mb-6 lg:mb-8">
        <h1 className="mb-2 text-2xl font-semibold text-white lg:text-3xl">
          Analytics Dashboard
        </h1>
        <p className="text-sm text-[#94A3B8] lg:text-base">
          Welcome back! Here's what's happening with your SMS activation
          platform.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:mb-8 lg:grid-cols-4 lg:gap-6">
        <AdminStatCard
          title={dashboard?.totalUsers?.label ?? 'Total Users'}
          value={dashboard?.totalUsers?.value ?? '—'}
          icon={<Users className="h-6 w-6 text-[#3B82F6]" />}
          trend={
            dashboard?.totalUsers?.changePercent != null
              ? {
                  value: dashboard.totalUsers.changePercent,
                  isPositive: dashboard.totalUsers.trend === 'up',
                }
              : undefined
          }
        />
        <AdminStatCard
          title={dashboard?.activeActivations?.label ?? 'Active Activations'}
          value={dashboard?.activeActivations?.value ?? '—'}
          icon={<MessageSquare className="h-6 w-6 text-[#22C55E]" />}
          trend={
            dashboard?.activeActivations?.changePercent != null
              ? {
                  value: dashboard.activeActivations.changePercent,
                  isPositive: dashboard.activeActivations.trend === 'up',
                }
              : undefined
          }
        />
        <AdminStatCard
          title={dashboard?.totalRevenue?.label ?? 'Total Revenue'}
          value={dashboard?.totalRevenue?.value ?? '—'}
          icon={<DollarSign className="h-6 w-6 text-[#F59E0B]" />}
          trend={
            dashboard?.totalRevenue?.changePercent != null
              ? {
                  value: dashboard.totalRevenue.changePercent,
                  isPositive: dashboard.totalRevenue.trend === 'up',
                }
              : undefined
          }
        />
        <AdminStatCard
          title={dashboard?.pendingActivations?.label ?? 'Pending Activations'}
          value={dashboard?.pendingActivations?.value ?? '—'}
          icon={<Clock className="h-6 w-6 text-[#8B5CF6]" />}
          trend={
            dashboard?.pendingActivations?.changePercent != null
              ? {
                  value: dashboard.pendingActivations.changePercent,
                  isPositive: dashboard.pendingActivations.trend === 'up',
                }
              : undefined
          }
        />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:mb-8 lg:grid-cols-4 lg:gap-6">
        <AdminStatCard
          title={dashboard?.failedActivations?.label ?? 'Failed Activations'}
          value={dashboard?.failedActivations?.value ?? '—'}
          icon={<XCircle className="h-6 w-6 text-[#EF4444]" />}
          trend={
            dashboard?.failedActivations?.changePercent != null
              ? {
                  value: dashboard.failedActivations.changePercent,
                  isPositive: dashboard.failedActivations.trend === 'up',
                }
              : undefined
          }
        />
        <AdminStatCard
          title={dashboard?.totalCountries?.label ?? 'Total Countries'}
          value={dashboard?.totalCountries?.value ?? '—'}
          icon={<Globe className="h-6 w-6 text-[#3B82F6]" />}
        />
        <AdminStatCard
          title={dashboard?.totalServices?.label ?? 'Total Services'}
          value={dashboard?.totalServices?.value ?? '—'}
          icon={<Briefcase className="h-6 w-6 text-[#22C55E]" />}
        />
        <AdminStatCard
          title={dashboard?.successRate?.label ?? 'Success Rate'}
          value={dashboard?.successRate?.value ?? '—'}
          icon={<MessageSquare className="h-6 w-6 text-[#22C55E]" />}
          trend={
            dashboard?.successRate?.trend
              ? {
                  value: dashboard.successRate.changePercent ?? 0,
                  isPositive: dashboard.successRate.trend === 'up',
                }
              : undefined
          }
        />
      </div>

      {/* Charts */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:mb-8 lg:grid-cols-2 lg:gap-6">
        <AdminGlassCard>
          <h3 className="mb-4 text-base font-semibold text-white lg:mb-6 lg:text-lg">
            Revenue Trends
            {revenueTrends?.total && (
              <span className="ml-2 text-sm font-normal text-[#94A3B8]">
                (Total: ${revenueTrends.total})
              </span>
            )}
          </h3>
          {revenueTrends?.data && revenueTrends.data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueTrends.data}>
                <defs>
                  <linearGradient
                    id="colorRevenueUnique"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis dataKey="month" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: '1px solid rgba(255,255,255,0.18)',
                    borderRadius: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fill="url(#colorRevenueUnique)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-sm text-[#94A3B8]">
              {isLoading ? 'Loading...' : 'No data available'}
            </div>
          )}
        </AdminGlassCard>

        <AdminGlassCard>
          <h3 className="mb-4 text-base font-semibold text-white lg:mb-6 lg:text-lg">
            Activation Trends
            {activationTrends?.total != null && (
              <span className="ml-2 text-sm font-normal text-[#94A3B8]">
                (Total: {activationTrends.total.toLocaleString()})
              </span>
            )}
          </h3>
          {activationTrends?.data && activationTrends.data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={activationTrends.data}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis dataKey="month" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: '1px solid rgba(255,255,255,0.18)',
                    borderRadius: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#22C55E"
                  strokeWidth={3}
                  dot={{ fill: '#22C55E', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-sm text-[#94A3B8]">
              {isLoading ? 'Loading...' : 'No data available'}
            </div>
          )}
        </AdminGlassCard>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:mb-8 lg:grid-cols-2 lg:gap-6">
        <AdminGlassCard>
          <h3 className="mb-4 text-base font-semibold text-white lg:mb-6 lg:text-lg">
            Top Countries
          </h3>
          {countryChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={countryChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {countryChartData.map(
                    (entry: { name: string; value: number }, index: number) => (
                      <Cell
                        key={`country-cell-${entry.name}-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ),
                  )}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: '1px solid rgba(255,255,255,0.18)',
                    borderRadius: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-sm text-[#94A3B8]">
              {isLoading ? 'Loading...' : 'No data available'}
            </div>
          )}
        </AdminGlassCard>

        <AdminGlassCard>
          <h3 className="mb-4 text-base font-semibold text-white lg:mb-6 lg:text-lg">
            Top Services
          </h3>
          {serviceChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={serviceChartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis dataKey="service" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: '1px solid rgba(255,255,255,0.18)',
                    borderRadius: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#F59E0B" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-sm text-[#94A3B8]">
              {isLoading ? 'Loading...' : 'No data available'}
            </div>
          )}
        </AdminGlassCard>
      </div>

      {/* Recent Activity */}
      <AdminGlassCard>
        <h3 className="mb-4 text-base font-semibold text-white lg:mb-6 lg:text-lg">
          Recent Activity
        </h3>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between rounded-xl bg-[rgba(255,255,255,0.03)] p-4 transition-colors hover:bg-[rgba(255,255,255,0.05)]"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#3B82F6]/20 to-[#8B5CF6]/20">
                  <MessageSquare className="h-5 w-5 text-[#3B82F6]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {activity.description}
                  </p>
                  <p className="text-xs text-[#64748B]">
                    by {activity.username} • {formatTimeAgo(activity.createdAt)}
                  </p>
                </div>
              </div>
              <div>
                <span
                  className={`rounded-lg px-3 py-1 text-xs font-medium ${getActivityStatusStyle(activity.status)}`}
                >
                  {activity.status.toLowerCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </AdminGlassCard>
    </div>
  );
}
