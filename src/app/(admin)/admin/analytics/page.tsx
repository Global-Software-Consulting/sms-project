'use client';

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
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
} from "lucide-react";
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
} from "recharts";
import {
  getDashboardOverview,
  getTopCountries,
  getTopServices,
  type DashboardOverview,
  type TopCountry,
  type TopService,
} from "@/lib/api/adminApi";

const revenueData = [
  { month: "Jan", revenue: 4200 },
  { month: "Feb", revenue: 5800 },
  { month: "Mar", revenue: 7200 },
  { month: "Apr", revenue: 6500 },
  { month: "May", revenue: 8900 },
  { month: "Jun", revenue: 10200 },
];

const activationData = [
  { month: "Jan", activations: 320 },
  { month: "Feb", activations: 450 },
  { month: "Mar", activations: 580 },
  { month: "Apr", activations: 520 },
  { month: "May", activations: 690 },
  { month: "Jun", activations: 820 },
];

const COLORS = ["#3B82F6", "#22C55E", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6366F1"];

const recentActivities = [
  {
    id: 1,
    user: "john_doe",
    action: "New SMS activation for WhatsApp",
    time: "2 minutes ago",
    status: "active",
  },
  {
    id: 2,
    user: "jane_smith",
    action: "Completed activation for Telegram",
    time: "5 minutes ago",
    status: "completed",
  },
  {
    id: 3,
    user: "mike_wilson",
    action: "Cancelled activation for Instagram",
    time: "8 minutes ago",
    status: "cancelled",
  },
  {
    id: 4,
    user: "sarah_jones",
    action: "New SMS activation for Facebook",
    time: "12 minutes ago",
    status: "active",
  },
];

export default function AdminAnalyticsPage() {
  const [dashboard, setDashboard] = useState<DashboardOverview | null>(null);
  const [topCountries, setTopCountries] = useState<TopCountry[]>([]);
  const [topServices, setTopServices] = useState<TopService[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [dashboardData, countriesData, servicesData] = await Promise.all([
        getDashboardOverview(),
        getTopCountries(),
        getTopServices(),
      ]);
      setDashboard(dashboardData);
      setTopCountries(countriesData);
      setTopServices(servicesData);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch analytics data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
        <h1 className="text-white text-2xl lg:text-3xl font-semibold mb-2">Analytics Dashboard</h1>
        <p className="text-[#94A3B8] text-sm lg:text-base">
          Welcome back! Here's what's happening with your SMS activation platform.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <AdminStatCard
          title="Total Users"
          value={dashboard?.users?.totalUsers?.toLocaleString() ?? "—"}
          icon={<Users className="w-6 h-6 text-[#3B82F6]" />}
          trend={dashboard?.users ? { value: dashboard.users.userGrowthPercent, isPositive: dashboard.users.userGrowthPercent >= 0 } : undefined}
        />
        <AdminStatCard
          title="New Users Today"
          value={dashboard?.users?.newUsersToday?.toLocaleString() ?? "—"}
          icon={<MessageSquare className="w-6 h-6 text-[#22C55E]" />}
        />
        <AdminStatCard
          title="Total Revenue"
          value={dashboard?.revenue?.totalRevenue ? `$${dashboard.revenue.totalRevenue}` : "—"}
          icon={<DollarSign className="w-6 h-6 text-[#F59E0B]" />}
          trend={dashboard?.revenue ? { value: dashboard.revenue.revenueGrowthPercent, isPositive: dashboard.revenue.revenueGrowthPercent >= 0 } : undefined}
        />
        <AdminStatCard
          title="Active Memberships"
          value={dashboard?.memberships?.totalActive?.toLocaleString() ?? "—"}
          icon={<Clock className="w-6 h-6 text-[#8B5CF6]" />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <AdminStatCard
          title="Active Users Today"
          value={dashboard?.users?.activeUsersToday?.toLocaleString() ?? "—"}
          icon={<XCircle className="w-6 h-6 text-[#EF4444]" />}
        />
        <AdminStatCard
          title="Top Countries"
          value={topCountries.length > 0 ? topCountries.length.toString() : "—"}
          icon={<Globe className="w-6 h-6 text-[#3B82F6]" />}
        />
        <AdminStatCard
          title="Top Services"
          value={topServices.length > 0 ? topServices.length.toString() : "—"}
          icon={<Briefcase className="w-6 h-6 text-[#22C55E]" />}
        />
        <AdminStatCard
          title="Avg Transaction"
          value={dashboard?.revenue?.avgTransactionValue ? `$${dashboard.revenue.avgTransactionValue}` : "—"}
          icon={<MessageSquare className="w-6 h-6 text-[#22C55E]" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <AdminGlassCard>
          <h3 className="text-white text-base lg:text-lg font-semibold mb-4 lg:mb-6">Revenue Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenueUnique" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111827",
                  border: "1px solid rgba(255,255,255,0.18)",
                  borderRadius: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3B82F6"
                strokeWidth={2}
                fill="url(#colorRevenueUnique)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </AdminGlassCard>

        <AdminGlassCard>
          <h3 className="text-white text-base lg:text-lg font-semibold mb-4 lg:mb-6">Activation Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={activationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111827",
                  border: "1px solid rgba(255,255,255,0.18)",
                  borderRadius: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="activations"
                stroke="#22C55E"
                strokeWidth={3}
                dot={{ fill: "#22C55E", r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </AdminGlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <AdminGlassCard>
          <h3 className="text-white text-base lg:text-lg font-semibold mb-4 lg:mb-6">Top Countries</h3>
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
                  {countryChartData.map((entry: { name: string; value: number }, index: number) => (
                    <Cell key={`country-cell-${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111827",
                    border: "1px solid rgba(255,255,255,0.18)",
                    borderRadius: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-[#94A3B8] text-sm">
              {isLoading ? "Loading..." : "No data available"}
            </div>
          )}
        </AdminGlassCard>

        <AdminGlassCard>
          <h3 className="text-white text-base lg:text-lg font-semibold mb-4 lg:mb-6">Top Services</h3>
          {serviceChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={serviceChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="service" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111827",
                    border: "1px solid rgba(255,255,255,0.18)",
                    borderRadius: "12px",
                  }}
                />
                <Bar dataKey="count" fill="#F59E0B" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-[#94A3B8] text-sm">
              {isLoading ? "Loading..." : "No data available"}
            </div>
          )}
        </AdminGlassCard>
      </div>

      {/* Recent Activity */}
      <AdminGlassCard>
        <h3 className="text-white text-base lg:text-lg font-semibold mb-4 lg:mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-4 rounded-xl bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3B82F6]/20 to-[#8B5CF6]/20 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-[#3B82F6]" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{activity.action}</p>
                  <p className="text-[#64748B] text-xs">
                    by {activity.user} • {activity.time}
                  </p>
                </div>
              </div>
              <div>
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-medium ${
                    activity.status === "active"
                      ? "bg-[#3B82F6]/20 text-[#3B82F6]"
                      : activity.status === "completed"
                      ? "bg-[#22C55E]/20 text-[#22C55E]"
                      : "bg-[#EF4444]/20 text-[#EF4444]"
                  }`}
                >
                  {activity.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </AdminGlassCard>
    </div>
  );
}
