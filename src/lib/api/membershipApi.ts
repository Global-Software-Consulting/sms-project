import { apiClient } from './config';

// ============================================
// Enums matching backend
// ============================================

export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

export type PlanSlug = 'free' | 'basic' | 'standard' | 'pro' | 'vip';

// ============================================
// Types matching backend DTOs
// ============================================

/**
 * Membership plan
 */
export interface MembershipPlan {
  id: string;
  slug: PlanSlug;
  name: string;
  description: string | null;
  price: string;              // Decimal as string (e.g., "99.00")
  discount: number;           // 0-100 percentage
  orderLimit: number;         // Max orders per request
  apiRateLimit: number;       // Requests per minute
  queuePriority: string;      // standard, faster, priority, vip
  features: string[];         // List of feature descriptions
  isPopular: boolean;         // Show "Popular" badge
  sortOrder: number;          // Display order
  isActive: boolean;          // Is plan available
}

/**
 * User subscription
 */
export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  pricePaid: string;          // Amount paid
  startDate: string;
  endDate: string;
  cancelledAt: string | null;
  cancelReason: string | null;
  walletTransactionId: string | null;
  createdAt: string;
  updatedAt: string;
  plan: MembershipPlan;       // Nested plan details
  daysRemaining: number;      // Calculated field
  isExpired: boolean;         // Calculated field
}

/**
 * Current membership response
 */
export interface CurrentMembershipResponse {
  hasActiveSubscription: boolean;
  subscription: Subscription | null;
  currentPlan: MembershipPlan | null;
  discount: number;           // Current discount percentage
  orderLimit: number;         // Current order limit
}

/**
 * Plans list response
 */
export interface PlansResponse {
  plans: MembershipPlan[];
}

/**
 * Subscribe request
 */
export interface SubscribeRequest {
  planSlug: PlanSlug;
}

/**
 * Subscribe/Upgrade response
 */
export interface SubscriptionResponse {
  message: string;
  subscription: Subscription;
}

/**
 * Cancel response
 */
export interface CancelResponse {
  message: string;
  subscription: Subscription;
}

// ============================================
// API Functions
// ============================================

/**
 * Get all available membership plans
 * GET /api/v1/membership/plans (Public)
 */
export const getPlans = async (): Promise<MembershipPlan[]> => {
  const response = await apiClient.get<MembershipPlan[] | PlansResponse>('/membership/plans');
  // Handle both array response and { plans: [...] } response
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return response.data.plans || [];
};

/**
 * Get single plan by slug
 * GET /api/v1/membership/plans/:slug
 */
export const getPlan = async (slug: PlanSlug): Promise<MembershipPlan> => {
  const response = await apiClient.get<MembershipPlan>(`/membership/plans/${slug}`);
  return response.data;
};

/**
 * Get current user's membership status
 * GET /api/v1/membership/current
 */
export const getCurrentMembership = async (): Promise<CurrentMembershipResponse> => {
  const response = await apiClient.get<CurrentMembershipResponse>('/membership/current');
  return response.data;
};

/**
 * Subscribe to a plan
 * POST /api/v1/membership/subscribe
 */
export const subscribeToPlan = async (planSlug: PlanSlug): Promise<SubscriptionResponse> => {
  const response = await apiClient.post<SubscriptionResponse>('/membership/subscribe', { planSlug });
  return response.data;
};

/**
 * Renew expired subscription
 * POST /api/v1/membership/renew
 */
export const renewSubscription = async (): Promise<SubscriptionResponse> => {
  const response = await apiClient.post<SubscriptionResponse>('/membership/renew');
  return response.data;
};

/**
 * Upgrade to a higher plan
 * POST /api/v1/membership/upgrade
 */
export const upgradePlan = async (planSlug: PlanSlug): Promise<SubscriptionResponse> => {
  const response = await apiClient.post<SubscriptionResponse>('/membership/upgrade', { planSlug });
  return response.data;
};

/**
 * Cancel subscription
 * POST /api/v1/membership/cancel
 */
export const cancelSubscription = async (reason?: string): Promise<CancelResponse> => {
  const response = await apiClient.post<CancelResponse>('/membership/cancel', { reason });
  return response.data;
};

// ============================================
// Helper Functions
// ============================================

/**
 * Format price for display
 */
export const formatPrice = (price: string): string => {
  const num = parseFloat(price);
  if (num === 0) return 'Free';
  return `$${num.toFixed(0)}`;
};

/**
 * Get plan color theme
 */
export const getPlanColor = (slug: PlanSlug): { bg: string; border: string; text: string } => {
  const colors: Record<PlanSlug, { bg: string; border: string; text: string }> = {
    free: { bg: 'var(--bg-secondary)', border: 'var(--border-default)', text: 'var(--text-secondary)' },
    basic: { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.3)', text: 'var(--info)' },
    standard: { bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.3)', text: 'var(--success)' },
    pro: { bg: 'rgba(168, 85, 247, 0.1)', border: 'rgba(168, 85, 247, 0.3)', text: '#a855f7' },
    vip: { bg: 'rgba(198, 167, 94, 0.1)', border: 'rgba(198, 167, 94, 0.3)', text: 'var(--accent-gold)' },
  };
  return colors[slug] || colors.free;
};

/**
 * Get queue priority label
 */
export const getQueueLabel = (priority: string): string => {
  const labels: Record<string, string> = {
    standard: 'Standard Queue',
    faster: 'Faster Routing',
    priority: 'Priority Routing',
    vip: 'VIP Queue',
  };
  return labels[priority] || priority;
};

/**
 * Check if plan is higher than current
 */
export const isPlanUpgrade = (currentSlug: PlanSlug | null, targetSlug: PlanSlug): boolean => {
  const order: PlanSlug[] = ['free', 'basic', 'standard', 'pro', 'vip'];
  if (!currentSlug) return true;
  return order.indexOf(targetSlug) > order.indexOf(currentSlug);
};

/**
 * Get days remaining text
 */
export const getDaysRemainingText = (days: number): string => {
  if (days <= 0) return 'Expired';
  if (days === 1) return '1 day left';
  return `${days} days left`;
};

