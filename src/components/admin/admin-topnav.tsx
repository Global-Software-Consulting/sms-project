'use client';

import { Bell, User, Download, LogOut, UserCircle, Key, Globe, X, Eye, EyeOff, Loader2 } from "lucide-react";
import { AdminDropdown } from './dropdown';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { LanguagePickerDropdown } from '@/components/google-translate';
import { useState } from 'react';
import { changePassword } from '@/lib/api/usersApi';
import { toast } from 'sonner';

export function AdminTopNav() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const [showLangPicker, setShowLangPicker] = useState(false);

  // Change password state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordStep, setPasswordStep] = useState<'verify' | 'new'>('verify');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const resetPasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordStep('verify');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleVerifyCurrentPassword = async () => {
    if (!currentPassword.trim()) {
      toast.error('Please enter your current password');
      return;
    }
    // Move to new password step — actual verification happens on submit
    setPasswordStep('new');
  };

  const handleChangePassword = async () => {
    if (!newPassword.trim()) {
      toast.error('Please enter a new password');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully. Please log in again.');
      resetPasswordModal();
      await logout();
      router.push('/auth/login');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to change password';
      if (message.toLowerCase().includes('current') || message.toLowerCase().includes('incorrect') || message.toLowerCase().includes('wrong')) {
        setPasswordStep('verify');
        setCurrentPassword('');
        toast.error('Current password is incorrect');
      } else {
        toast.error(message);
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const notificationItems = [
    {
      label: "New user registered",
      icon: <User className="w-4 h-4" />,
      onClick: () => console.log("Notification clicked"),
    },
    {
      label: "SMS activation completed",
      icon: <Bell className="w-4 h-4" />,
      onClick: () => console.log("Notification clicked"),
    },
    {
      label: "Payment received",
      icon: <Download className="w-4 h-4" />,
      onClick: () => console.log("Notification clicked"),
    },
  ];

  const profileItems = [
    {
      label: "Profile Settings",
      icon: <UserCircle className="w-4 h-4" />,
      onClick: () => router.push("/admin/settings"),
    },
    {
      label: "Change Password",
      icon: <Key className="w-4 h-4" />,
      onClick: () => setShowPasswordModal(true),
    },
    {
      label: "Logout",
      icon: <LogOut className="w-4 h-4" />,
      onClick: async () => {
        await logout();
        router.push('/auth/login');
      },
      variant: "danger" as const,
    },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 lg:left-60 right-0 h-18 bg-[rgba(255,255,255,0.05)] border-b border-[rgba(255,255,255,0.18)] backdrop-blur-xl z-10">
        <div className="h-full px-4 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 lg:gap-3 ml-auto">
            {/* Notifications Dropdown */}
            <AdminDropdown
              trigger={
                <button className="relative p-2 rounded-xl hover:bg-[rgba(255,255,255,0.08)] transition-colors">
                  <Bell className="w-5 h-5 text-[#94A3B8]" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#EF4444] rounded-full text-white text-xs flex items-center justify-center font-semibold">
                    3
                  </span>
                </button>
              }
              items={notificationItems}
            />

            {/* Language Selector - Google Translate */}
            <div className="relative">
              <button
                onClick={() => setShowLangPicker(!showLangPicker)}
                className="hidden lg:flex items-center gap-2 p-2 rounded-xl hover:bg-[rgba(255,255,255,0.08)] transition-colors"
                title="Translate Page"
              >
                <Globe className="w-5 h-5 text-[#94A3B8]" />
              </button>
              <LanguagePickerDropdown
                isOpen={showLangPicker}
                onClose={() => setShowLangPicker(false)}
              />
            </div>

            {/* Profile Dropdown */}
            <AdminDropdown
              trigger={
                <div className="flex items-center gap-3 pl-2 lg:pl-4 border-l border-[rgba(255,255,255,0.18)] cursor-pointer">
                  <div className="text-right hidden lg:block">
                    <p className="text-white text-sm font-medium">{user?.name || 'Admin User'}</p>
                    <p className="text-[#64748B] text-xs">{user?.email || ''}</p>
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

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 rounded-2xl bg-[#1E293B] border border-[rgba(255,255,255,0.18)] shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[rgba(255,255,255,0.1)]">
              <div>
                <h3 className="text-white text-lg font-semibold">Change Password</h3>
                <p className="text-[#64748B] text-xs mt-1">
                  {passwordStep === 'verify' ? 'Step 1: Verify your identity' : 'Step 2: Set new password'}
                </p>
              </div>
              <button
                onClick={resetPasswordModal}
                className="text-[#94A3B8] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {passwordStep === 'verify' ? (
                <>
                  <p className="text-[#94A3B8] text-sm">
                    Enter your current password to continue.
                  </p>
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleVerifyCurrentPassword()}
                        placeholder="Enter current password"
                        autoFocus
                        autoComplete="new-password"
                        className="w-full px-4 py-3 pr-12 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white text-sm placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white transition-colors"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        autoFocus
                        className="w-full px-4 py-3 pr-12 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white text-sm placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white transition-colors"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[#64748B] text-xs mt-1">Min 8 characters with uppercase, lowercase, and number</p>
                  </div>

                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleChangePassword()}
                        placeholder="Confirm new password"
                        className="w-full px-4 py-3 pr-12 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white text-sm placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-[#EF4444] text-xs mt-1">Passwords do not match</p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 p-6 border-t border-[rgba(255,255,255,0.1)]">
              {passwordStep === 'new' && (
                <button
                  onClick={() => setPasswordStep('verify')}
                  className="px-5 py-2.5 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white text-sm font-medium hover:bg-[rgba(255,255,255,0.12)] transition-colors"
                >
                  Back
                </button>
              )}
              <div className="flex-1" />
              <button
                onClick={resetPasswordModal}
                className="px-5 py-2.5 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white text-sm font-medium hover:bg-[rgba(255,255,255,0.12)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={passwordStep === 'verify' ? handleVerifyCurrentPassword : handleChangePassword}
                disabled={isChangingPassword || (passwordStep === 'verify' && !currentPassword.trim()) || (passwordStep === 'new' && (!newPassword.trim() || !confirmPassword.trim()))}
                className="px-5 py-2.5 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Changing...
                  </>
                ) : passwordStep === 'verify' ? (
                  'Continue'
                ) : (
                  'Change Password'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
