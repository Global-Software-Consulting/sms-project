'use client';

import {
  Bell,
  User,
  LogOut,
  UserCircle,
  Key,
  Globe,
  X,
  Eye,
  EyeOff,
  Loader2,
  Check,
} from 'lucide-react';
import { AdminDropdown } from './dropdown';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { LanguagePickerDropdown } from '@/components/google-translate';
import { useState, useEffect, useCallback, useRef } from 'react';
import { changePassword } from '@/lib/api/usersApi';
import { apiClient } from '@/config/api-client.config';
import { API_ENDPOINTS } from '@/config/server.config';
import {
  getNotificationIcon,
  type AppNotification,
} from '@/lib/api/notificationsApi';
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
      const response = await apiClient.get<{
        notifications: AppNotification[];
        total: number;
      }>(API_ENDPOINTS.ADMIN.NOTIFICATIONS.MY, { params: { limit: 10 } });
      setNotifications(response.data.notifications || []);
      setUnreadCount(
        (response.data.notifications || []).filter((n) => !n.read).length,
      );
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
      await apiClient.post(
        `${API_ENDPOINTS.ADMIN.NOTIFICATIONS.MY}/${id}/read`,
      );
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
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
      const raw = error?.response?.data?.message;
      const message = Array.isArray(raw)
        ? raw.join('. ')
        : typeof raw === 'string'
          ? raw
          : 'Failed to change password';
      const lower = message.toLowerCase();
      if (
        lower.includes('current') ||
        lower.includes('incorrect') ||
        lower.includes('wrong')
      ) {
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
      label: 'Profile Settings',
      icon: <UserCircle className="h-4 w-4" />,
      onClick: () => router.push('/admin/settings'),
    },
    {
      label: 'Change Password',
      icon: <Key className="h-4 w-4" />,
      onClick: () => setShowPasswordModal(true),
    },
    {
      label: 'Logout',
      icon: <LogOut className="h-4 w-4" />,
      onClick: async () => {
        await logout();
        router.push('/auth/login');
      },
      variant: 'danger' as const,
    },
  ];

  return (
    <>
      <header className="fixed top-0 right-0 left-0 z-10 h-18 border-b border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.05)] backdrop-blur-xl lg:left-60">
        <div className="flex h-full items-center justify-between gap-4 px-4 lg:px-8">
          <div className="ml-auto flex items-center gap-2 lg:gap-3">
            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="relative rounded-xl p-2 transition-colors hover:bg-[rgba(255,255,255,0.08)]"
              >
                <Bell className="h-5 w-5 text-[#94A3B8]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#EF4444] text-xs font-semibold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifDropdown && (
                <div className="fixed inset-x-4 top-[4.5rem] z-50 overflow-hidden rounded-xl border border-[rgba(255,255,255,0.15)] bg-[#0F172A] shadow-2xl sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:mt-2 sm:w-[380px]">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.1)] px-4 py-3">
                    <h3 className="text-sm font-semibold text-white">
                      Notifications
                    </h3>
                    {notifications.length > 0 && (
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="flex items-center gap-1 text-xs font-medium text-[#3B82F6] transition-colors hover:text-[#60A5FA]"
                          >
                            <Check className="h-3 w-3" />
                            Mark all read
                          </button>
                        )}
                        <button
                          onClick={handleClearAll}
                          className="text-xs font-medium text-[#64748B] transition-colors hover:text-[#94A3B8]"
                        >
                          Clear all
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  {isNotifLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-5 w-5 animate-spin text-[#3B82F6]" />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="py-12 text-center">
                      <Bell className="mx-auto mb-3 h-12 w-12 text-[#64748B] opacity-20" />
                      <p className="text-sm text-[#64748B]">No notifications</p>
                    </div>
                  ) : (
                    <div className="max-h-[400px] overflow-y-auto">
                      <div className="py-1">
                        {notifications.slice(0, 10).map((notification) => (
                          <div
                            key={notification.id}
                            className={`group relative flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors ${
                              !notification.read
                                ? 'bg-[rgba(59,130,246,0.05)] hover:bg-[rgba(59,130,246,0.1)]'
                                : 'hover:bg-[rgba(255,255,255,0.03)]'
                            }`}
                            onClick={() =>
                              !notification.read &&
                              handleMarkAsRead(notification.id)
                            }
                          >
                            <div className="mt-0.5 shrink-0 text-xl">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm leading-tight font-medium text-white">
                                  {notification.title}
                                </p>
                                {!notification.read && (
                                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#3B82F6]" />
                                )}
                              </div>
                              <p className="line-clamp-2 text-xs text-[#94A3B8]">
                                {notification.message}
                              </p>
                              <p className="text-xs text-[#64748B]">
                                {formatTime(notification.createdAt)}
                              </p>
                            </div>
                            <button
                              className="shrink-0 rounded-lg p-1 text-[#64748B] opacity-0 transition-all group-hover:opacity-100 hover:bg-[rgba(255,255,255,0.1)] hover:text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveNotification(notification.id);
                              }}
                            >
                              <X className="h-3 w-3" />
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
                className="hidden items-center gap-2 rounded-xl p-2 transition-colors hover:bg-[rgba(255,255,255,0.08)] lg:flex"
                title="Translate Page"
              >
                <Globe className="h-5 w-5 text-[#94A3B8]" />
              </button>
              <LanguagePickerDropdown
                isOpen={showLangPicker}
                onClose={() => setShowLangPicker(false)}
              />
            </div>

            {/* Profile Dropdown */}
            <AdminDropdown
              trigger={
                <div className="flex cursor-pointer items-center gap-3 border-l border-[rgba(255,255,255,0.18)] pl-2 lg:pl-4">
                  <div className="hidden text-right lg:block">
                    <p className="text-sm font-medium text-white">
                      {(user as any)?.name ||
                        user?.email?.split('@')[0] ||
                        'Admin User'}
                    </p>
                    <p className="text-xs text-[#64748B]">
                      {user?.email || ''}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6]">
                    <User className="h-5 w-5 text-white" />
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
          <div className="mx-4 w-full max-w-md rounded-2xl border border-[rgba(255,255,255,0.18)] bg-[#1E293B] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.1)] p-6">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Change Password
                </h3>
                <p className="mt-1 text-xs text-[#64748B]">
                  {passwordStep === 'verify'
                    ? 'Step 1: Verify your identity'
                    : 'Step 2: Set new password'}
                </p>
              </div>
              <button
                onClick={resetPasswordModal}
                className="text-[#94A3B8] transition-colors hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-6">
              {passwordStep === 'verify' ? (
                <>
                  <p className="text-sm text-[#94A3B8]">
                    Enter your current password to continue.
                  </p>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === 'Enter' && handleVerifyCurrentPassword()
                        }
                        placeholder="Enter current password"
                        autoFocus
                        autoComplete="new-password"
                        className="w-full rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-4 py-3 pr-12 text-sm text-white placeholder:text-[#64748B] focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="absolute top-1/2 right-4 -translate-y-1/2 text-[#64748B] transition-colors hover:text-white"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        autoFocus
                        className="w-full rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-4 py-3 pr-12 text-sm text-white placeholder:text-[#64748B] focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute top-1/2 right-4 -translate-y-1/2 text-[#64748B] transition-colors hover:text-white"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-[#64748B]">
                      Min 8 characters with uppercase, lowercase, and number
                    </p>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === 'Enter' && handleChangePassword()
                        }
                        placeholder="Confirm new password"
                        className="w-full rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-4 py-3 pr-12 text-sm text-white placeholder:text-[#64748B] focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute top-1/2 right-4 -translate-y-1/2 text-[#64748B] transition-colors hover:text-white"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="mt-1 text-xs text-[#EF4444]">
                        Passwords do not match
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-3 border-t border-[rgba(255,255,255,0.1)] p-6">
              {passwordStep === 'new' && (
                <button
                  onClick={() => setPasswordStep('verify')}
                  className="rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.12)]"
                >
                  Back
                </button>
              )}
              <div className="flex-1" />
              <button
                onClick={resetPasswordModal}
                className="rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.12)]"
              >
                Cancel
              </button>
              <button
                onClick={
                  passwordStep === 'verify'
                    ? handleVerifyCurrentPassword
                    : handleChangePassword
                }
                disabled={
                  isChangingPassword ||
                  (passwordStep === 'verify' && !currentPassword.trim()) ||
                  (passwordStep === 'new' &&
                    (!newPassword.trim() || !confirmPassword.trim()))
                }
                className="flex items-center gap-2 rounded-xl bg-[#3B82F6] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
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
