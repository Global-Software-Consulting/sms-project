'use client';

import { Bell, User, LogOut, UserCircle, Key, Globe, X, Eye, EyeOff, Loader2, Check } from "lucide-react";
import { AdminDropdown } from './dropdown';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { LanguagePickerDropdown } from '@/components/google-translate';
import { useState, useEffect, useCallback, useRef } from 'react';
import { changePassword } from '@/lib/api/usersApi';
import { apiClient } from '@/config/api-client.config';
import { API_ENDPOINTS } from '@/config/server.config';
import { getNotificationIcon, type AppNotification } from '@/lib/api/notificationsApi';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { getTokens } from '@/lib/api/tokenStorage';
import { io, Socket } from 'socket.io-client';

export function AdminTopNav() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const [showLangPicker, setShowLangPicker] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifLoading, setIsNotifLoading] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsNotifLoading(true);
      const response = await apiClient.get<{ notifications: AppNotification[]; total: number }>(
        API_ENDPOINTS.ADMIN.NOTIFICATIONS.MY,
        { params: { limit: 10 } },
      );
      setNotifications(response.data.notifications || []);
      setUnreadCount((response.data.notifications || []).filter((n) => !n.read).length);
    } catch {
      // silently fail
    } finally {
      setIsNotifLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // WebSocket for real-time notifications
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const tokens = getTokens();
    if (!tokens?.accessToken) return;

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const SOCKET_URL = API_URL.replace(/\/api(\/v\d+)?\/?$/, '');

    console.log('[Admin Socket] Connecting to:', SOCKET_URL);

    const socket = io(`${SOCKET_URL}/notifications`, {
  auth: { token: tokens.accessToken },
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 3000,
  reconnectionDelayMax: 10000,
});
    socket.on('connect', () => {
      console.log('[Admin Socket] Connected! Socket ID:', socket.id);
    });

    socket.on('notification', (notification: AppNotification) => {
      console.log('[Admin Socket] Received notification:', notification);
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      toast(notification.title, { description: notification.message });
    });

    socket.on('unreadCount', (data: { count: number }) => {
      setUnreadCount(data.count);
    });

    socket.on('connect_error', (err) => {
      console.warn('[Admin Socket] Connection error:', err.message);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    if (!showNotifDropdown) return;
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifDropdown(false);
      }
    };
    setTimeout(() => document.addEventListener('click', handleClick), 50);
    return () => document.removeEventListener('click', handleClick);
  }, [showNotifDropdown]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await apiClient.post(`${API_ENDPOINTS.ADMIN.NOTIFICATIONS.MY}/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiClient.post(`${API_ENDPOINTS.ADMIN.NOTIFICATIONS.MY}/read-all`);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const handleRemoveNotification = async (id: string) => {
    try {
      const notification = notifications.find((n) => n.id === id);
      await apiClient.delete(`${API_ENDPOINTS.ADMIN.NOTIFICATIONS.MY}/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (notification && !notification.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch {
      toast.error('Failed to delete notification');
    }
  };

  const handleClearAll = async () => {
    try {
      await apiClient.delete(`${API_ENDPOINTS.ADMIN.NOTIFICATIONS.MY}/all`);
      setNotifications([]);
      setUnreadCount(0);
    } catch {
      toast.error('Failed to clear notifications');
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return '';
    }
  };

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
            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="relative p-2 rounded-xl hover:bg-[rgba(255,255,255,0.08)] transition-colors"
              >
                <Bell className="w-5 h-5 text-[#94A3B8]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#EF4444] rounded-full text-white text-xs flex items-center justify-center font-semibold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifDropdown && (
                <div className="absolute right-0 top-full mt-2 w-[380px] rounded-xl bg-[#0F172A] border border-[rgba(255,255,255,0.15)] shadow-2xl z-50 overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(255,255,255,0.1)]">
                    <h3 className="text-white text-sm font-semibold">Notifications</h3>
                    {notifications.length > 0 && (
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-[#3B82F6] text-xs font-medium hover:text-[#60A5FA] transition-colors flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            Mark all read
                          </button>
                        )}
                        <button
                          onClick={handleClearAll}
                          className="text-[#64748B] text-xs font-medium hover:text-[#94A3B8] transition-colors"
                        >
                          Clear all
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  {isNotifLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-5 h-5 text-[#3B82F6] animate-spin" />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="py-12 text-center">
                      <Bell className="w-12 h-12 text-[#64748B] opacity-20 mx-auto mb-3" />
                      <p className="text-[#64748B] text-sm">No notifications</p>
                    </div>
                  ) : (
                    <div className="max-h-[400px] overflow-y-auto">
                      <div className="py-1">
                        {notifications.slice(0, 10).map((notification) => (
                          <div
                            key={notification.id}
                            className={`group relative flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${
                              !notification.read
                                ? 'bg-[rgba(59,130,246,0.05)] hover:bg-[rgba(59,130,246,0.1)]'
                                : 'hover:bg-[rgba(255,255,255,0.03)]'
                            }`}
                            onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                          >
                            <div className="mt-0.5 shrink-0 text-xl">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-white text-sm font-medium leading-tight">
                                  {notification.title}
                                </p>
                                {!notification.read && (
                                  <div className="w-2 h-2 shrink-0 rounded-full bg-[#3B82F6] mt-1" />
                                )}
                              </div>
                              <p className="text-[#94A3B8] text-xs line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-[#64748B] text-xs">
                                {formatTime(notification.createdAt)}
                              </p>
                            </div>
                            <button
                              className="shrink-0 p-1 rounded-lg text-[#64748B] hover:text-white hover:bg-[rgba(255,255,255,0.1)] opacity-0 group-hover:opacity-100 transition-all"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveNotification(notification.id);
                              }}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>

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
            <div className="flex items-center justify-between p-6 border-b border-[rgba(255,255,255,0.1)]">
              <div>
                <h3 className="text-white text-lg font-semibold">Change Password</h3>
                <p className="text-[#64748B] text-xs mt-1">
                  {passwordStep === 'verify' ? 'Step 1: Verify your identity' : 'Step 2: Set new password'}
                </p>
              </div>
              <button onClick={resetPasswordModal} className="text-[#94A3B8] hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {passwordStep === 'verify' ? (
                <>
                  <p className="text-[#94A3B8] text-sm">Enter your current password to continue.</p>
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Current Password</label>
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
                      <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white transition-colors">
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        autoFocus
                        className="w-full px-4 py-3 pr-12 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white text-sm placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                      />
                      <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white transition-colors">
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[#64748B] text-xs mt-1">Min 8 characters with uppercase, lowercase, and number</p>
                  </div>
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleChangePassword()}
                        placeholder="Confirm new password"
                        className="w-full px-4 py-3 pr-12 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white text-sm placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white transition-colors">
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

            <div className="flex items-center gap-3 p-6 border-t border-[rgba(255,255,255,0.1)]">
              {passwordStep === 'new' && (
                <button onClick={() => setPasswordStep('verify')} className="px-5 py-2.5 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white text-sm font-medium hover:bg-[rgba(255,255,255,0.12)] transition-colors">
                  Back
                </button>
              )}
              <div className="flex-1" />
              <button onClick={resetPasswordModal} className="px-5 py-2.5 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white text-sm font-medium hover:bg-[rgba(255,255,255,0.12)] transition-colors">
                Cancel
              </button>
              <button
                onClick={passwordStep === 'verify' ? handleVerifyCurrentPassword : handleChangePassword}
                disabled={isChangingPassword || (passwordStep === 'verify' && !currentPassword.trim()) || (passwordStep === 'new' && (!newPassword.trim() || !confirmPassword.trim()))}
                className="px-5 py-2.5 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isChangingPassword ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Changing...</>
                ) : passwordStep === 'verify' ? 'Continue' : 'Change Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
