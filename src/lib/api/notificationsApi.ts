import { apiClient } from '@/config/api-client.config';
import { API_ENDPOINTS } from '@/config/server.config';

// ============================================
// Types
// ============================================

export type NotificationType =
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_PENDING'
  | 'ORDER_PURCHASED'
  | 'ORDER_COMPLETED'
  | 'ORDER_CANCELLED'
  | 'ORDER_REFUNDED'
  | 'SMS_RECEIVED'
  | 'MEMBERSHIP_SUBSCRIBED'
  | 'MEMBERSHIP_RENEWED'
  | 'MEMBERSHIP_UPGRADED'
  | 'MEMBERSHIP_EXPIRED'
  | 'MEMBERSHIP_EXPIRING'
  | 'REFERRAL_SIGNUP'
  | 'REFERRAL_COMMISSION'
  | 'REFERRAL_PAYOUT'
  | 'WELCOME'
  | 'SECURITY_ALERT'
  | 'ACCOUNT_WARNING'
  | 'PROMO'
  | 'SYSTEM';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}

export interface NotificationsResponse {
  notifications: AppNotification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UnreadCountResponse {
  count: number;
}

export interface NotificationQueryParams {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: NotificationType;
}

// ============================================
// API Functions
// ============================================

/**
 * Get user notifications
 * GET /api/v1/notifications
 */
export const getNotifications = async (
  params?: NotificationQueryParams,
): Promise<NotificationsResponse> => {
  const response = await apiClient.get<NotificationsResponse>(
    API_ENDPOINTS.NOTIFICATIONS.ROOT,
    { params },
  );
  return response.data;
};

/**
 * Get unread notification count
 * GET /api/v1/notifications/unread-count
 */
export const getUnreadCount = async (): Promise<UnreadCountResponse> => {
  const response = await apiClient.get<UnreadCountResponse>(
    API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT,
  );
  return response.data;
};

/**
 * Mark notification as read
 * POST /api/v1/notifications/{id}/read
 */
export const markNotificationRead = async (id: string): Promise<void> => {
  await apiClient.post(API_ENDPOINTS.NOTIFICATIONS.READ(id));
};

/**
 * Mark all notifications as read
 * POST /api/v1/notifications/read-all
 */
export const markAllNotificationsRead = async (): Promise<void> => {
  await apiClient.post(API_ENDPOINTS.NOTIFICATIONS.READ_ALL);
};

/**
 * Delete a notification
 * DELETE /api/v1/notifications/{id}
 */
export const deleteNotification = async (id: string): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE(id));
};

/**
 * Delete all notifications
 * DELETE /api/v1/notifications
 */
export const deleteAllNotifications = async (): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE_ALL);
};

// ============================================
// Helpers
// ============================================

export const getNotificationIcon = (type: NotificationType): string => {
  const icons: Record<string, string> = {
    PAYMENT_SUCCESS: '💰',
    PAYMENT_FAILED: '❌',
    PAYMENT_PENDING: '⏳',
    ORDER_PURCHASED: '🛒',
    ORDER_COMPLETED: '✅',
    ORDER_CANCELLED: '🚫',
    ORDER_REFUNDED: '💸',
    SMS_RECEIVED: '💬',
    MEMBERSHIP_SUBSCRIBED: '👑',
    MEMBERSHIP_RENEWED: '🔄',
    MEMBERSHIP_UPGRADED: '⬆️',
    MEMBERSHIP_EXPIRED: '⏰',
    MEMBERSHIP_EXPIRING: '⚠️',
    REFERRAL_SIGNUP: '🎁',
    REFERRAL_COMMISSION: '💵',
    REFERRAL_PAYOUT: '🏦',
    WELCOME: '👋',
    SECURITY_ALERT: '🔒',
    ACCOUNT_WARNING: '⚠️',
    PROMO: '🎉',
    SYSTEM: 'ℹ️',
  };
  return icons[type] || 'ℹ️';
};

export const getNotificationColor = (type: NotificationType): string => {
  if (type.startsWith('PAYMENT_') || type === 'ORDER_REFUNDED') return 'text-green-400';
  if (type.startsWith('ORDER_')) return 'text-blue-400';
  if (type === 'SMS_RECEIVED') return 'text-cyan-400';
  if (type.startsWith('MEMBERSHIP_')) return 'text-yellow-400';
  if (type.startsWith('REFERRAL_')) return 'text-purple-400';
  if (type === 'SECURITY_ALERT' || type === 'ACCOUNT_WARNING') return 'text-red-400';
  if (type === 'PROMO' || type === 'WELCOME') return 'text-pink-400';
  return 'text-gray-400';
};
