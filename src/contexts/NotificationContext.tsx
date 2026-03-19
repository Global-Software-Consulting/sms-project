'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { getTokens } from '@/lib/api/tokenStorage';
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification as deleteNotificationApi,
  deleteAllNotifications,
  AppNotification,
  NotificationQueryParams,
} from '@/lib/api/notificationsApi';
import { toast } from 'sonner';

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  isSocketConnected: boolean;
  fetchNotifications: (params?: NotificationQueryParams) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  setCurrentPage: (page: number) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return ctx;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
// Socket URL is the base server URL (without /api path)
const SOCKET_URL = API_URL.replace(/\/api\/?$/, '');

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const mountedRef = useRef(true);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await getUnreadCount();
      if (mountedRef.current) setUnreadCount(res.count);
    } catch {
      // silently fail
    }
  }, []);

  // Fetch notifications list
  const fetchNotifications = useCallback(async (params?: NotificationQueryParams) => {
    try {
      setIsLoading(true);
      const res = await getNotifications({
        page: params?.page ?? currentPage,
        limit: params?.limit ?? 20,
        ...params,
      });
      if (mountedRef.current) {
        setNotifications(res.notifications);
        setTotalPages(res.totalPages);
      }
    } catch {
      // silently fail
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, [currentPage]);

  // Mark single as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      toast.error('Failed to mark notification as read');
    }
  }, []);

  // Mark all as read
  const markAllRead = useCallback(async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  }, []);

  // Remove single notification
  const removeNotification = useCallback(async (id: string) => {
    try {
      const notification = notifications.find((n) => n.id === id);
      await deleteNotificationApi(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (notification && !notification.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch {
      toast.error('Failed to delete notification');
    }
  }, [notifications]);

  // Clear all notifications
  const clearAll = useCallback(async () => {
    try {
      await deleteAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
      toast.success('All notifications cleared');
    } catch {
      toast.error('Failed to clear notifications');
    }
  }, []);

  // Socket.io connection for real-time notifications
  useEffect(() => {
    const tokens = getTokens();
    if (!tokens?.accessToken) return;

    console.log('[Socket] Connecting to:', SOCKET_URL);
    console.log('[Socket] Token:', tokens.accessToken.substring(0, 20) + '...');

    const socket = io(SOCKET_URL, {
      auth: { token: tokens.accessToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 3000,
      reconnectionDelayMax: 10000,
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected! Socket ID:', socket.id);
      if (mountedRef.current) setIsSocketConnected(true);
    });

    // Listen to ALL events for debugging
    socket.onAny((eventName, ...args) => {
      console.log('[Socket] Event received:', eventName, args);
    });

    // New notification pushed from server
    socket.on('notification', (notification: AppNotification) => {
      console.log('[Socket] notification event:', notification);
      if (!mountedRef.current) return;
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      toast(notification.title, {
        description: notification.message,
      });
    });

    // Server can push updated unread count
    socket.on('unreadCount', (data: { count: number }) => {
      console.log('[Socket] unreadCount event:', data);
      if (mountedRef.current) setUnreadCount(data.count);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected. Reason:', reason);
      if (mountedRef.current) setIsSocketConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message);
      if (mountedRef.current) setIsSocketConnected(false);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Initial fetch on mount (one-time, no polling)
  useEffect(() => {
    mountedRef.current = true;
    fetchUnreadCount();
    fetchNotifications({ page: 1, limit: 20 });

    return () => {
      mountedRef.current = false;
    };
  }, [fetchUnreadCount, fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        totalPages,
        currentPage,
        isLoading,
        isSocketConnected,
        fetchNotifications,
        markAsRead,
        markAllRead,
        removeNotification,
        clearAll,
        setCurrentPage,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
