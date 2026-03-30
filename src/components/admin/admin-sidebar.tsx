'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard, Users, Briefcase, Globe, MessageSquare, Server, CreditCard,
  Gift, Bell, FileText, BookOpen, Code, Settings, Menu, X, BarChart3,
  ShoppingCart, Ticket, Award, HeadphonesIcon, Mail, HelpCircle, Star,
  Newspaper, Scale, Wallet, MonitorPlay, KeyRound, ExternalLink,
} from 'lucide-react';

const menuItems = [
  { path: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
  { path: '/admin/users', label: 'User Management', icon: Users },
  { path: '/admin/activations', label: 'Order Management', icon: ShoppingCart },
  { path: '/admin/services', label: 'Product Management', icon: Briefcase },
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
  { path: '/admin/ads', label: 'Ad Management', icon: MonitorPlay },
  { path: '/admin/login-api', label: 'Login & API Management', icon: KeyRound },
  { path: '/admin/settings', label: 'System Settings', icon: Settings },
  { path: '/admin/url-tracking', label: 'URL Tracking', icon: ExternalLink },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-60 bg-[#0F172A] border-r border-[rgba(255,255,255,0.18)] overflow-y-auto z-40 transition-transform lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-semibold text-lg">SMS Portal</h1>
              <p className="text-[#64748B] text-xs">Admin Panel</p>
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
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white'
                      : 'text-[#94A3B8] hover:bg-[rgba(255,255,255,0.05)] hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
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
