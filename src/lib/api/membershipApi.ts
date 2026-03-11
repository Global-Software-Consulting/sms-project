import { apiClient } from '@/config/api-client.config';
import { API_ENDPOINTS } from '@/config/server.config';

// ============================================
// Enums matching backend (Phase 1 Updated)
// ============================================

export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING';

export type PlanSlug = 'free' | 'basic' | 'standard' | 'pro' | 'vip';

/**
 * Support tier levels (per CLIENT_DECISIONS.md)
 */
export type SupportTier = 'community' | 'standard' | 'priority' | 'whatsapp';

/**
 * Routing priority levels (0-3)
 * 0 = Standard, 1 = Faster, 2 = Priority, 3 = VIP
 */
export type RoutingPriority = 0 | 1 | 2 | 3;

// ============================================
// Types matching backend DTOs
// ============================================

/**
 * Membership plan (per CLIENT_DECISIONS.md)
 *
 * Plans: Free, Basic ($29), Standard ($59), Pro ($99), VIP ($199)
 * API Rate Limits: 30/60/120/240/600 req/min
 * Active Number Limits: 10/25/50/75/100
 */
export interface MembershipPlan {
  id: string;
  slug: PlanSlug;
  name: string;
  description: string | null;
  price: string; // Decimal as string (e.g., "99.00")
  currency?: string; // Currency code (default: USD)
  discount: number; // 0-100 percentage (0/5/10/20/40)
  discountPercent?: number; // Alias for discount (backend may use either)
  orderLimit: number; // Max orders per checkout (25 default)
  apiRateLimit: number; // Requests per minute (30/60/120/240/600)
  activeNumberLimit: number; // Max active numbers (10/25/50/75/100)
  supportTier: SupportTier; // community/standard/priority/whatsapp
  routingPriority: RoutingPriority; // 0-3 (Standard/Faster/Priority/VIP)
  bonusDepositPercent: number; // Bonus on deposits (0/0/2/5/10)
  queuePriority: string; // standard, faster, priority, vip (display name)
  features: string[]; // List of feature descriptions
  isPopular: boolean; // Show "Popular" badge
  sortOrder: number; // Display order
  isActive: boolean; // Is plan available
  autoRenew?: boolean; // Auto-renew toggle (user preference)
}

/**
 * User subscription
 */
export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  pricePaid: string; // Amount paid
  startDate: string;
  endDate: string;
  cancelledAt: string | null;
  cancelReason: string | null;
  walletTransactionId: string | null;
  createdAt: string;
  updatedAt: string;
  plan: MembershipPlan; // Nested plan details
  daysRemaining: number; // Calculated field
  isExpired: boolean; // Calculated field
}

/**
 * Current membership response
 */
export interface CurrentMembershipResponse {
  hasActiveSubscription: boolean;
  subscription: Subscription | null;
  currentPlan: MembershipPlan | null;
  discount: number; // Current discount percentage
  orderLimit: number; // Current order limit
  daysRemaining?: number; // Days until subscription expires
  totalSaved?: number; // Total amount saved with membership
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
  const response = await apiClient.get<MembershipPlan[] | PlansResponse>(
    API_ENDPOINTS.MEMBERSHIP.PLANS,
  );
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
  const response = await apiClient.get<MembershipPlan>(
    API_ENDPOINTS.MEMBERSHIP.PLAN(slug),
  );
  return response.data;
};

/**
 * Get current user's membership status
 * GET /api/v1/membership/current
 */
export const getCurrentMembership =
  async (): Promise<CurrentMembershipResponse> => {
    const response = await apiClient.get<CurrentMembershipResponse>(
      API_ENDPOINTS.MEMBERSHIP.CURRENT,
    );
    return response.data;
  };

/**
 * Subscribe to a plan
 * POST /api/v1/membership/subscribe
 */
export const subscribeToPlan = async (
  planSlug: PlanSlug,
): Promise<SubscriptionResponse> => {
  const response = await apiClient.post<SubscriptionResponse>(
    API_ENDPOINTS.MEMBERSHIP.SUBSCRIBE,
    { planSlug },
  );
  return response.data;
};

/**
 * Renew expired subscription
 * POST /api/v1/membership/renew
 */
export const renewSubscription = async (): Promise<SubscriptionResponse> => {
  const response = await apiClient.post<SubscriptionResponse>(
    API_ENDPOINTS.MEMBERSHIP.RENEW,
  );
  return response.data;
};

/**
 * Upgrade to a higher plan
 * POST /api/v1/membership/upgrade
 */
export const upgradePlan = async (
  planSlug: PlanSlug,
): Promise<SubscriptionResponse> => {
  const response = await apiClient.post<SubscriptionResponse>(
    API_ENDPOINTS.MEMBERSHIP.UPGRADE,
    { planSlug },
  );
  return response.data;
};

/**
 * Cancel subscription
 * POST /api/v1/membership/cancel
 */
export const cancelSubscription = async (
  reason?: string,
): Promise<CancelResponse> => {
  const response = await apiClient.post<CancelResponse>(
    API_ENDPOINTS.MEMBERSHIP.CANCEL,
    { reason },
  );
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
export const getPlanColor = (
  slug: PlanSlug,
): { bg: string; border: string; text: string } => {
  const colors: Record<PlanSlug, { bg: string; border: string; text: string }> =
    {
      free: {
        bg: 'var(--bg-secondary)',
        border: 'var(--border-default)',
        text: 'var(--text-secondary)',
      },
      basic: {
        bg: 'rgba(59, 130, 246, 0.1)',
        border: 'rgba(59, 130, 246, 0.3)',
        text: 'var(--info)',
      },
      standard: {
        bg: 'rgba(34, 197, 94, 0.1)',
        border: 'rgba(34, 197, 94, 0.3)',
        text: 'var(--success)',
      },
      pro: {
        bg: 'rgba(168, 85, 247, 0.1)',
        border: 'rgba(168, 85, 247, 0.3)',
        text: '#a855f7',
      },
      vip: {
        bg: 'rgba(198, 167, 94, 0.1)',
        border: 'rgba(198, 167, 94, 0.3)',
        text: 'var(--accent-gold)',
      },
    };
  return colors[slug] || colors.free;
};

/**
 * Get queue priority label
 */
export const getQueueLabel = (priority: string | number): string => {
  if (typeof priority === 'number') {
    const labels: Record<number, string> = {
      0: 'Standard Queue',
      1: 'Faster Routing',
      2: 'Priority Routing',
      3: 'VIP Queue',
    };
    return labels[priority] || 'Standard Queue';
  }
  const labels: Record<string, string> = {
    standard: 'Standard Queue',
    faster: 'Faster Routing',
    priority: 'Priority Routing',
    vip: 'VIP Queue',
  };
  return labels[priority] || priority;
};

/**
 * Get support tier label
 */
export const getSupportTierLabel = (tier: SupportTier): string => {
  const labels: Record<SupportTier, string> = {
    community: 'Community Support',
    standard: 'Standard Support',
    priority: 'Priority Support',
    whatsapp: 'WhatsApp + Dedicated',
  };
  return labels[tier] || tier;
};

/**
 * Get support tier color
 */
export const getSupportTierColor = (tier: SupportTier): string => {
  const colors: Record<SupportTier, string> = {
    community: 'var(--text-muted)',
    standard: 'var(--info)',
    priority: 'var(--success)',
    whatsapp: 'var(--accent-gold)',
  };
  return colors[tier] || 'var(--text-muted)';
};

/**
 * Check if plan is higher than current
 */
export const isPlanUpgrade = (
  currentSlug: PlanSlug | null,
  targetSlug: PlanSlug,
): boolean => {
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
