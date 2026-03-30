'use client';
import { useRouter } from 'next/navigation';
import {
  Bell, User, Plus, Download, LogOut, UserCircle, Key, Shield,
  ShoppingCart, DollarSign, Globe, Home, Package, Gift,
} from 'lucide-react';
import { AdminDropdown } from './dropdown';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function AdminTopNav() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out successfully');
  };

  const notificationItems = [
    { label: 'New user registered', icon: <User className="w-4 h-4" />, onClick: () => {} },
    { label: 'SMS activation completed', icon: <Bell className="w-4 h-4" />, onClick: () => {} },
    { label: 'Payment received', icon: <Download className="w-4 h-4" />, onClick: () => {} },
  ];

  const profileItems = [
    { label: 'Profile Settings', icon: <UserCircle className="w-4 h-4" />, onClick: () => router.push('/admin/settings') },
    { label: 'Change Password', icon: <Key className="w-4 h-4" />, onClick: () => router.push('/admin/settings') },
    { label: 'Security', icon: <Shield className="w-4 h-4" />, onClick: () => {} },
    { label: 'Logout', icon: <LogOut className="w-4 h-4" />, onClick: handleLogout, variant: 'danger' as const },
  ];

  const languageItems = [
    { label: 'English', onClick: () => {} },
    { label: 'Spanish', onClick: () => {} },
    { label: 'French', onClick: () => {} },
  ];

  return (
    <header className="fixed top-0 left-0 lg:left-60 right-0 h-16 bg-[rgba(255,255,255,0.05)] border-b border-[rgba(255,255,255,0.18)] backdrop-blur-xl z-30">
      <div className="h-full px-4 lg:px-8 flex items-center justify-between gap-4">
        {/* Nav Links */}
        <nav className="hidden xl:flex items-center gap-6">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="text-[#94A3B8] hover:text-white text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Home
          </button>
          <button className="text-[#94A3B8] hover:text-white text-sm font-medium transition-colors flex items-center gap-2">
            <Package className="w-4 h-4" />
            Features
          </button>
          <button className="text-[#94A3B8] hover:text-white text-sm font-medium transition-colors flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Packages
          </button>
          <button
            onClick={() => router.push('/admin/referrals')}
            className="text-[#94A3B8] hover:text-white text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Gift className="w-4 h-4" />
            Affiliate
          </button>
        </nav>

        <div className="flex items-center gap-2 lg:gap-3 ml-auto">
          {/* Notifications */}
          <AdminDropdown
            trigger={
              <button className="relative p-2 rounded-xl hover:bg-[rgba(255,255,255,0.08)] transition-colors">
                <Bell className="w-5 h-5 text-[#94A3B8]" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#EF4444] rounded-full text-white text-xs flex items-center justify-center font-semibold">3</span>
              </button>
            }
            items={notificationItems}
          />

          {/* Balance */}
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)]">
            <DollarSign className="w-4 h-4 text-[#22C55E]" />
            <span className="text-white text-sm font-semibold">Admin</span>
          </div>

          {/* Language */}
          <AdminDropdown
            trigger={
              <button className="hidden lg:flex items-center gap-2 p-2 rounded-xl hover:bg-[rgba(255,255,255,0.08)] transition-colors">
                <Globe className="w-5 h-5 text-[#94A3B8]" />
              </button>
            }
            items={languageItems}
          />

          {/* Profile */}
          <AdminDropdown
            trigger={
              <div className="flex items-center gap-3 pl-2 lg:pl-4 border-l border-[rgba(255,255,255,0.18)] cursor-pointer">
                <div className="text-right hidden lg:block">
                  <p className="text-white text-sm font-medium">
                    {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Admin'}
                  </p>
                  <p className="text-[#64748B] text-xs">{user?.email || 'admin@smsportal.com'}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              </div>
            }
            items={profileItems}
          />
        </div>
      </div>
    </header>
  );
}
