'use client';

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
  Legend,
  ResponsiveContainer,
} from "recharts";

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

const countryData = [
  { name: "United States", value: 35 },
  { name: "United Kingdom", value: 25 },
  { name: "Canada", value: 20 },
  { name: "Australia", value: 12 },
  { name: "Others", value: 8 },
];

const serviceData = [
  { service: "WhatsApp", count: 245 },
  { service: "Telegram", count: 198 },
  { service: "Instagram", count: 167 },
  { service: "Facebook", count: 142 },
  { service: "Twitter", count: 128 },
];

const COLORS = ["#3B82F6", "#22C55E", "#F59E0B", "#EF4444", "#8B5CF6"];

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
          value="12,458"
          icon={<Users className="w-6 h-6 text-[#3B82F6]" />}
          trend={{ value: 12.5, isPositive: true }}
        />
        <AdminStatCard
          title="Active Activations"
          value="842"
          icon={<MessageSquare className="w-6 h-6 text-[#22C55E]" />}
          trend={{ value: 8.2, isPositive: true }}
        />
        <AdminStatCard
          title="Total Revenue"
          value="$28,450"
          icon={<DollarSign className="w-6 h-6 text-[#F59E0B]" />}
          trend={{ value: 15.3, isPositive: true }}
        />
        <AdminStatCard
          title="Pending Activations"
          value="156"
          icon={<Clock className="w-6 h-6 text-[#8B5CF6]" />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <AdminStatCard
          title="Failed Activations"
          value="23"
          icon={<XCircle className="w-6 h-6 text-[#EF4444]" />}
          trend={{ value: 3.2, isPositive: false }}
        />
        <AdminStatCard
          title="Total Countries"
          value="48"
          icon={<Globe className="w-6 h-6 text-[#3B82F6]" />}
        />
        <AdminStatCard
          title="Total Services"
          value="125"
          icon={<Briefcase className="w-6 h-6 text-[#22C55E]" />}
        />
        <AdminStatCard
          title="Success Rate"
          value="97.2%"
          icon={<MessageSquare className="w-6 h-6 text-[#22C55E]" />}
          trend={{ value: 2.1, isPositive: true }}
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
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={countryData}
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
                {countryData.map((entry, index) => (
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
        </AdminGlassCard>

        <AdminGlassCard>
          <h3 className="text-white text-base lg:text-lg font-semibold mb-4 lg:mb-6">Top Services</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={serviceData}>
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
