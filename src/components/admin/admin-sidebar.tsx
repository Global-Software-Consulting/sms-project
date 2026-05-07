'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useBranding } from '@/contexts/BrandingContext';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Globe,
  MessageSquare,
  Server,
  CreditCard,
  Gift,
  Bell,
  FileText,
  BookOpen,
  Code,
  Settings,
  Menu,
  X,
  BarChart3,
  ShoppingCart,
  Ticket,
  Award,
  HeadphonesIcon,
  Mail,
  HelpCircle,
  Star,
  Newspaper,
  Scale,
  Wallet,
  MonitorPlay,
  KeyRound,
  ExternalLink,
  SearchCheck,
  Cookie,
} from 'lucide-react';

const menuItems = [
  { path: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
  { path: '/admin/users', label: 'User Management', icon: Users },
  { path: '/admin/activations', label: 'Order Management', icon: ShoppingCart },
  { path: '/admin/sms-services', label: 'SMS Services', icon: MessageSquare },
  { path: '/admin/coupons', label: 'Coupon Management', icon: Ticket },
  { path: '/admin/referrals', label: 'Affiliate Management', icon: Gift },
  { path: '/admin/rank-system', label: 'Rank System', icon: Award },
  { path: '/admin/support', label: 'Support Tickets', icon: HeadphonesIcon },
  { path: '/admin/contact', label: 'Contact Form', icon: Mail },
  { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/admin/faq', label: 'FAQ Management', icon: HelpCircle },
  { path: '/admin/notifications', label: 'Bulk & Notification', icon: Bell },
  { path: '/admin/reviews', label: 'Review Management', icon: Star },
  { path: '/admin/blogs', label: 'Blogs Management', icon: Newspaper },
  { path: '/admin/legal', label: 'Legal Management', icon: Scale },
  { path: '/admin/payments', label: 'Payment Management', icon: Wallet },
  { path: '/admin/binance-session', label: 'Binance Session', icon: Cookie },
  { path: '/admin/ads', label: 'Ad Management', icon: MonitorPlay },
  { path: '/admin/login-api', label: 'Login & API Management', icon: KeyRound },
  { path: '/admin/settings', label: 'System Settings', icon: Settings },
  { path: '/admin/seo', label: 'SEO Management', icon: SearchCheck },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { siteLogo: logoUrl } = useBranding();

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] p-2 text-white lg:hidden"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-60 overflow-y-auto border-r border-[rgba(255,255,255,0.18)] bg-[#0F172A] transition-transform lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6]">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="h-full w-full object-contain"
                />
              ) : (
                <MessageSquare className="h-6 w-6 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">BestSMSHQ</h1>
              <p className="text-xs text-[#64748B]">Admin Panel</p>
            </div>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                    isActive
                      ? 'border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] text-white'
                      : 'text-[#94A3B8] hover:bg-[rgba(255,255,255,0.05)] hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
