import { apiClient } from '@/config/api-client.config';
import { API_ENDPOINTS } from '@/config/server.config';

// ============================================
// Enums matching backend
// ============================================

export type PaymentGateway =
  | 'STRIPE'
  | 'PAYGATE'
  | 'PLISIO'
  | 'CRYPTOMUS'
  | 'NOWPAYMENTS'
  | 'VOLET'
  | 'BINANCE';
export type PaymentStatus =
  | 'PENDING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'REFUNDED';

// ============================================
// Types matching backend DTOs
// ============================================

/**
 * Payment record
 */
export interface Payment {
  id: string;
  userId: string;
  gateway: PaymentGateway;
  status: PaymentStatus;
  amount: string; // Decimal as string
  currency: string;
  checkoutUrl?: string | null;
  stripeSessionId?: string;
  expiresAt: string;
  createdAt: string;
  completedAt?: string;
}

/**
 * Payment initialization response
 */
export interface PaymentInitResponse {
  paymentId: string;
  checkoutUrl?: string;
  expiresAt: string;
}

/**
 * Paginated payments response
 */
export interface PaymentsListResponse {
  data: Payment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Backend gateway response structure
 */
interface BackendGatewayInfo {
  id?: string;
  gateway?: string;
  name: string;
  description?: string;
  type?: string;
  minAmount: number;
  maxAmount: number;
  currencies: string[];
  icon?: string;
  feeFixed?: number;
  feePercent?: number;
  feePassToUser?: boolean;
  enabled?: boolean;
}

/**
 * Available gateway info (normalized for frontend)
 */
export interface GatewayInfo {
  gateway: PaymentGateway;
  name: string;
  enabled: boolean;
  minAmount: number;
  maxAmount: number;
  currencies: string[];
  description?: string;
  type?: string;
  icon?: string;
}

/**
 * Gateways list response
 */
export interface GatewaysResponse {
  gateways: GatewayInfo[];
}

// ============================================
// PayGate.to Provider Types (like CheapStreamTV)
// ============================================

export type PaygateProvider =
  | 'multi'
  | 'bitnovo'
  | 'mercuryo'
  | 'unlimit'
  | 'guardarian'
  | 'wert';

export interface PaygateProviderConfig {
  id: PaygateProvider;
  name: string;
  description: string;
  minAmount: number;
  regions?: string[];
  paymentMethods?: string[];
  recommended?: boolean;
}

// Available PayGate.to providers (matching CheapStreamTV)
export const PAYGATE_PROVIDERS: PaygateProviderConfig[] = [
  {
    id: 'multi',
    name: 'Multi Provider',
    description:
      'Automatically selects the best payment provider for your region',
    minAmount: 1,
    recommended: true,
  },
  {
    id: 'bitnovo',
    name: 'Bitnovo',
    description:
      'Credit/Debit Card - Europe, Latin America (Spain, Portugal, Italy, France, Mexico)',
    minAmount: 10,
    regions: ['Europe', 'Latin America'],
  },
  {
    id: 'mercuryo',
    name: 'Mercuryo',
    description: 'Credit/Debit Card - 180+ countries, Apple Pay, Google Pay',
    minAmount: 30,
    paymentMethods: ['Card', 'Apple Pay', 'Google Pay'],
  },
  {
    id: 'unlimit',
    name: 'Unlimit',
    description: 'Credit/Debit Card - 150+ countries, local payment methods',
    minAmount: 10,
  },
  {
    id: 'guardarian',
    name: 'Guardarian',
    description:
      'Credit/Debit Card - 170+ countries, 50+ payment methods, high limits',
    minAmount: 20,
  },
  {
    id: 'wert',
    name: 'Wert',
    description: 'Credit/Debit Card via Wert - Global coverage',
    minAmount: 50,
  },
];

// ============================================
// Request DTOs
// ============================================

export interface CreatePaymentRequest {
  amount: number; // 3 - 100000 (per CLIENT_DECISIONS.md)
  gateway?: PaymentGateway; // Optional: specify gateway (default: STRIPE)
  successUrl?: string;
  cancelUrl?: string;
  // PayGate.to provider selection (like CheapStreamTV)
  paygateProvider?: PaygateProvider;
}

export interface PaymentQueryParams {
  status?: PaymentStatus;
  gateway?: PaymentGateway;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

// ============================================
// API Functions
// ============================================

/**
 * Initialize a new payment (Stripe Checkout)
 * POST /api/v1/payments
 */
export const createPayment = async (
  data: CreatePaymentRequest,
): Promise<PaymentInitResponse> => {
  const response = await apiClient.post<PaymentInitResponse>(
    API_ENDPOINTS.PAYMENTS.ROOT,
    data,
  );
  return response.data;
};

/**
 * Get user's payment history
 * GET /api/v1/payments
 */
export const getPayments = async (
  params?: PaymentQueryParams,
): Promise<PaymentsListResponse> => {
  const response = await apiClient.get<PaymentsListResponse>(
    API_ENDPOINTS.PAYMENTS.ROOT,
    { params },
  );
  return response.data;
};

/**
 * Normalize backend gateway response to frontend format
 */
const normalizeGateway = (backendGateway: BackendGatewayInfo): GatewayInfo => {
  // Backend uses 'id' field, but might also have 'gateway' field
  const gatewayId = backendGateway.id || backendGateway.gateway || '';
  
  return {
    gateway: gatewayId as PaymentGateway,
    name: backendGateway.name,
    // Backend only returns enabled gateways, but check if enabled field exists
    enabled: backendGateway.enabled !== false,
    minAmount: backendGateway.minAmount || 0,
    maxAmount: backendGateway.maxAmount || 100000,
    currencies: backendGateway.currencies || ['USD'],
    description: backendGateway.description,
    type: backendGateway.type,
    icon: backendGateway.icon,
  };
};

/**
 * Get available payment gateways
 * GET /api/v1/payments/gateways
 */
export const getGateways = async (): Promise<GatewayInfo[]> => {
  const response = await apiClient.get<BackendGatewayInfo[] | { gateways: BackendGatewayInfo[] } | { data: BackendGatewayInfo[] }>(
    API_ENDPOINTS.PAYMENTS.GATEWAYS,
  );
  
  let rawGateways: BackendGatewayInfo[] = [];
  
  // Handle different response structures
  if (Array.isArray(response.data)) {
    rawGateways = response.data;
  } else if (response.data && 'gateways' in response.data) {
    rawGateways = (response.data as { gateways: BackendGatewayInfo[] }).gateways || [];
  } else if (response.data && 'data' in response.data) {
    const data = (response.data as { data: BackendGatewayInfo[] | { gateways: BackendGatewayInfo[] } }).data;
    if (Array.isArray(data)) {
      rawGateways = data;
    } else if (data && 'gateways' in data) {
      rawGateways = data.gateways || [];
    }
  }
  
  // Normalize all gateways to frontend format
  return rawGateways.map(normalizeGateway);
};

/**
 * Get single payment details
 * GET /api/v1/payments/:id
 */
export const getPayment = async (id: string): Promise<Payment> => {
  const response = await apiClient.get<Payment>(
    API_ENDPOINTS.PAYMENTS.DETAIL(id),
  );
  return response.data;
};

/**
 * Cancel a pending payment
 * POST /api/v1/payments/:id/cancel
 */
export const cancelPayment = async (id: string): Promise<Payment> => {
  const response = await apiClient.post<Payment>(
    API_ENDPOINTS.PAYMENTS.CANCEL(id),
  );
  return response.data;
};

// ============================================
// Helper Functions
// ============================================

/**
 * Format amount for display
 */
export const formatAmount = (
  amount: string | number,
  currency: string = 'USD',
): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(num);
};

/**
 * Get status color for UI
 */
export const getPaymentStatusColor = (
  status: PaymentStatus,
): { bg: string; text: string } => {
  const colors: Record<PaymentStatus, { bg: string; text: string }> = {
    PENDING: { bg: 'rgba(245, 158, 11, 0.1)', text: 'var(--warning)' },
    COMPLETED: { bg: 'rgba(34, 197, 94, 0.1)', text: 'var(--success)' },
    FAILED: { bg: 'rgba(239, 68, 68, 0.1)', text: 'var(--danger)' },
    CANCELLED: { bg: 'rgba(107, 114, 128, 0.1)', text: 'var(--text-muted)' },
    EXPIRED: { bg: 'rgba(107, 114, 128, 0.1)', text: 'var(--text-muted)' },
    REFUNDED: { bg: 'rgba(59, 130, 246, 0.1)', text: 'var(--info)' },
  };
  return colors[status] || colors.PENDING;
};

/**
 * Get gateway display name
 */
export const getGatewayName = (gateway: PaymentGateway): string => {
  const names: Record<PaymentGateway, string> = {
    STRIPE: 'Stripe',
    PAYGATE: 'PayGate',
    PLISIO: 'Plisio (Crypto)',
    CRYPTOMUS: 'Cryptomus',
    NOWPAYMENTS: 'NOWPayments',
    VOLET: 'Volet',
    BINANCE: 'Binance',
  };
  return names[gateway] || gateway;
};

/**
 * Get gateway icon/logo (placeholder)
 */
export const getGatewayIcon = (gateway: PaymentGateway): string => {
  // Return emoji or icon name for now
  const icons: Record<PaymentGateway, string> = {
    STRIPE: '💳',
    PAYGATE: '🏦',
    PLISIO: '₿',
    CRYPTOMUS: '🪙',
    NOWPAYMENTS: '💰',
    VOLET: '💵',
    BINANCE: '🔶',
  };
  return icons[gateway] || '💳';
};

/**
 * Preset amounts for quick selection
 */
export const PRESET_AMOUNTS = [10, 25, 50, 100, 250, 500];

/**
 * Min/Max amounts (per CLIENT_DECISIONS.md)
 * - Min deposit: $3 (editable by admin)
 * - Max deposit: $100,000 per transaction (editable by admin)
 */
export const MIN_AMOUNT = 3;
export const MAX_AMOUNT = 100000;

/**
 * Payment expiry time in minutes (per CLIENT_DECISIONS.md)
 * Most gateways = 60 minutes
 */
export const PAYMENT_EXPIRY_MINUTES = 60;

/**
 * Validate amount
 */
export const isValidAmount = (amount: number): boolean => {
  return amount >= MIN_AMOUNT && amount <= MAX_AMOUNT;
};
