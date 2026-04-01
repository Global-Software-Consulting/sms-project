'use client';

import { useRouter } from 'next/navigation';
import {
  Users,
  MessageSquare,
  ShoppingCart,
  Briefcase,
  Ticket,
  Gift,
  Award,
  HeadphonesIcon,
  Mail,
  BarChart3,
  HelpCircle,
  Bell,
  Star,
  Newspaper,
  Scale,
  Wallet,
  MonitorPlay,
  KeyRound,
  Settings,
  ExternalLink,
} from "lucide-react";

interface DashboardCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  bgColor: string;
}

const dashboardCards: DashboardCard[] = [
  {
    id: "users",
    title: "User Management",
    description: "Manage system users and their roles",
    icon: <Users className="w-6 h-6" />,
    path: "/users",
    color: "#3B82F6",
    bgColor: "rgba(59, 130, 246, 0.1)",
  },
  {
    id: "orders",
    title: "Order Management",
    description: "View and manage customer orders",
    icon: <ShoppingCart className="w-6 h-6" />,
    path: "/activations",
    color: "#F59E0B",
    bgColor: "rgba(245, 158, 11, 0.1)",
  },
  {
    id: "products",
    title: "Product Management",
    description: "Manage products and packages",
    icon: <Briefcase className="w-6 h-6" />,
    path: "/services",
    color: "#22C55E",
    bgColor: "rgba(34, 197, 94, 0.1)",
  },
  {
    id: "sms-services",
    title: "SMS Services",
    description: "Manage SMS sort and non-sort services",
    icon: <MessageSquare className="w-6 h-6" />,
    path: "/sms-services",
    color: "#06B6D4",
    bgColor: "rgba(6, 182, 212, 0.1)",
  },
  {
    id: "coupons",
    title: "Coupon Management",
    description: "Create and manage discount coupons",
    icon: <Ticket className="w-6 h-6" />,
    path: "/coupons",
    color: "#EC4899",
    bgColor: "rgba(236, 72, 153, 0.1)",
  },
  {
    id: "affiliate",
    title: "Affiliate Management",
    description: "Manage affiliates, commissions, and referrals",
    icon: <Gift className="w-6 h-6" />,
    path: "/referrals",
    color: "#14B8A6",
    bgColor: "rgba(20, 184, 166, 0.1)",
  },
  {
    id: "rank",
    title: "Rank System",
    description: "Configure rank rules and user tiers",
    icon: <Award className="w-6 h-6" />,
    path: "/rank-system",
    color: "#8B5CF6",
    bgColor: "rgba(139, 92, 246, 0.1)",
  },
  {
    id: "support",
    title: "Support Tickets",
    description: "Handle customer support requests",
    icon: <HeadphonesIcon className="w-6 h-6" />,
    path: "/support",
    color: "#EF4444",
    bgColor: "rgba(239, 68, 68, 0.1)",
  },
  {
    id: "contact",
    title: "Contact Form",
    description: "View and respond to contact form submissions",
    icon: <Mail className="w-6 h-6" />,
    path: "/contact",
    color: "#06B6D4",
    bgColor: "rgba(6, 182, 212, 0.1)",
  },
  {
    id: "analytics",
    title: "Analytics",
    description: "View system analytics and reports",
    icon: <BarChart3 className="w-6 h-6" />,
    path: "/analytics",
    color: "#8B5CF6",
    bgColor: "rgba(139, 92, 246, 0.1)",
  },
  {
    id: "faq",
    title: "FAQ Management",
    description: "Create and manage FAQ content",
    icon: <HelpCircle className="w-6 h-6" />,
    path: "/faq",
    color: "#3B82F6",
    bgColor: "rgba(59, 130, 246, 0.1)",
  },
  {
    id: "notifications",
    title: "Bulk & Notification",
    description: "Send announcements and manage notifications",
    icon: <Bell className="w-6 h-6" />,
    path: "/notifications",
    color: "#F59E0B",
    bgColor: "rgba(245, 158, 11, 0.1)",
  },
  {
    id: "reviews",
    title: "Review Management",
    description: "Manage customer reviews and feedback",
    icon: <Star className="w-6 h-6" />,
    path: "/reviews",
    color: "#EC4899",
    bgColor: "rgba(236, 72, 153, 0.1)",
  },
  {
    id: "blogs",
    title: "Blogs Management",
    description: "Manage blog posts, categories, and authors",
    icon: <Newspaper className="w-6 h-6" />,
    path: "/blogs",
    color: "#14B8A6",
    bgColor: "rgba(20, 184, 166, 0.1)",
  },
  {
    id: "legal",
    title: "Legal Management",
    description: "Manage legal pages and guides",
    icon: <Scale className="w-6 h-6" />,
    path: "/legal",
    color: "#64748B",
    bgColor: "rgba(100, 116, 139, 0.1)",
  },
  {
    id: "payments",
    title: "Payment Management",
    description: "Configure payment methods and gateways",
    icon: <Wallet className="w-6 h-6" />,
    path: "/payments",
    color: "#84CC16",
    bgColor: "rgba(132, 204, 22, 0.1)",
  },
  {
    id: "ads",
    title: "Ad Management",
    description: "Manage ads and promotional placements",
    icon: <MonitorPlay className="w-6 h-6" />,
    path: "/ads",
    color: "#F97316",
    bgColor: "rgba(249, 115, 22, 0.1)",
  },
  {
    id: "login-api",
    title: "Login & API Management",
    description: "Manage login options and API keys",
    icon: <KeyRound className="w-6 h-6" />,
    path: "/login-api",
    color: "#F43F5E",
    bgColor: "rgba(244, 63, 94, 0.1)",
  },
  {
    id: "settings",
    title: "System Settings",
    description: "Configure system-wide settings",
    icon: <Settings className="w-6 h-6" />,
    path: "/settings",
    color: "#94A3B8",
    bgColor: "rgba(148, 163, 184, 0.1)",
  },
  {
    id: "seo",
    title: "SEO Management",
    description: "Manage SEO settings and meta tags",
    icon: <ExternalLink className="w-6 h-6" />,
    path: "/seo",
    color: "#64748B",
    bgColor: "rgba(100, 116, 139, 0.1)",
  },
];

export default function AdminDashboardPage() {
  const router = useRouter();

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-white text-3xl lg:text-4xl font-semibold mb-2">
          Admin Dashboard
        </h1>
        <p className="text-[#64748B] text-sm lg:text-base">
          Manage your system, users, and business operations
        </p>
      </div>

      {/* Dashboard Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {dashboardCards.map((card) => (
          <button
            key={card.id}
            onClick={() => router.push('/admin' + card.path)}
            className="group relative p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)] backdrop-blur-xl transition-all duration-300 text-left"
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                style={{
                  backgroundColor: card.bgColor,
                  color: card.color,
                }}
              >
                {card.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-white text-base font-semibold mb-1">
                  {card.title}
                </h3>
                <p className="text-[#64748B] text-sm leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
