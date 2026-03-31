import { apiClient } from '@/config/api-client.config';
import { API_ENDPOINTS } from '@/config/server.config';

// ============================================
// Enums matching backend Prisma schema
// ============================================

export type SmsOrderStatus =
  | 'PENDING' // Order created, waiting for provider confirmation
  | 'WAITING_SMS' // Number assigned, waiting for SMS to arrive
  | 'COMPLETED' // SMS received successfully
  | 'CANCELLED' // User cancelled before SMS arrived
  | 'EXPIRED' // Timed out without receiving SMS
  | 'REFUNDED'; // Admin issued manual refund

export type SmsRentalStatus =
  | 'ACTIVE' // Rental is active, receiving messages
  | 'COMPLETED' // Rental period ended normally
  | 'CANCELLED' // User cancelled early
  | 'EXPIRED'; // Rental period ended

// ============================================
// Types matching backend DTOs
// ============================================

/**
 * SMS Provider (5sim, sms-man, hero-sms)
 */
export interface SmsProvider {
  id: string;
  name: string;
  slug: string;
  displayName: string;
  isActive: boolean;
  priority: number;
  supportsRental: boolean;
  balance?: string; // Admin only
  markup?: number; // Admin only
  lastSyncAt?: string; // Admin only
}

/**
 * SMS Service (Telegram, WhatsApp, Google, etc.)
 */
export interface SmsService {
  id: string;
  providerId?: string;
  externalServiceId?: string;
  name: string;
  slug: string;
  iconUrl: string | null;
  category: string | null;
  isActive?: boolean;
  defaultPrice?: string | number | null;
  successRate?: number | null;
  createdAt?: string;
  provider?: {
    name: string;
    slug: string;
  };
}

/**
 * SMS Country
 */
export interface SmsCountry {
  id: string;
  providerId: string;
  externalCountryId: string;
  name: string;
  code: string; // ISO 3166-1 alpha-2 (US, RU, IN)
  iconUrl: string | null;
  isActive: boolean;
  provider?: {
    id: string;
    displayName: string;
    slug: string;
  };
}

/**
 * SMS Product (Service + Country + Provider combo with pricing)
 */
export interface SmsProduct {
  id: string;
  service: {
    id: string;
    name: string;
    slug: string;
    iconUrl: string | null;
    category: string | null;
  };
  country: {
    id: string;
    name: string;
    code: string;
    iconUrl: string | null;
  };
  provider: {
    id: string;
    name?: string;
    displayName?: string;
    slug: string;
  };
  price: string; // Our price (before membership discount)
  yourPrice: string; // Price after membership discount
  providerPrice?: string; // Original provider price (optional for real-time)
  discount?: string; // Discount amount
  discountPercent?: number; // Discount percentage
  availableCount: number;
  lastSyncAt?: string | null;
  isRealtime?: boolean; // Flag for real-time data
}

/**
 * SMS Activation Order
 */
export interface SmsOrder {
  id: string;
  userId?: string;
  provider?: {
    id?: string;
    name?: string;
    displayName?: string;
    slug: string;
  };
  service?: {
    id?: string;
    name: string;
    slug?: string;
    iconUrl?: string | null;
  };
  country?: {
    id?: string;
    name: string;
    code: string;
    iconUrl?: string | null;
  };
  phoneNumber: string | null;
  status: SmsOrderStatus;
  smsCode: string | null;
  smsFullText: string | null;
  cost: string;
  discount: string;
  finalCost: string;
  membershipDiscount: number;
  expiresAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  // Admin fields
  user?: {
    id: string;
    email: string;
    username: string | null;
  };
  providerOrderId?: string;
  ipAddress?: string;
}

/**
 * SMS Rental
 */
export interface SmsRental {
  id: string;
  userId?: string;
  provider?: {
    name?: string;
    displayName?: string;
    slug: string;
  };
  phoneNumber: string | null;
  status: SmsRentalStatus;
  rentalDuration: number; // Hours
  cost: string;
  discount?: string;
  finalCost: string;
  membershipDiscount?: number;
  messages: Array<{
    text: string;
    sender?: string;
    from?: string;
    receivedAt: string;
  }>;
  startedAt: string;
  expiresAt: string;
  cancelledAt?: string | null;
  createdAt: string;
  // Admin fields
  user?: {
    id: string;
    email: string;
    username: string | null;
  };
}

/**
 * User Favorite
 */
export interface SmsFavorite {
  id: string;
  userId: string;
  service: {
    id: string;
    name: string;
    slug: string;
    iconUrl: string | null;
  };
  country: {
    id: string;
    name: string;
    code: string;
    iconUrl: string | null;
  };
  provider: {
    id: string;
    displayName: string;
    slug: string;
  };
  createdAt: string;
}

/**
 * VIP Number
 */
export interface VipNumber {
  id: string;
  service: {
    id: string;
    name: string;
    slug: string;
    iconUrl: string | null;
  };
  country: {
    id: string;
    name: string;
    code: string;
    iconUrl: string | null;
  };
  provider: {
    id: string;
    displayName: string;
    slug: string;
  };
  rating: number;
  orderCount: number;
  addedBy: string;
  createdAt: string;
}

/**
 * SMS Statistics (Admin)
 */
export interface SmsStatistics {
  orders: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    byStatus: {
      pending: number;
      waitingSms: number;
      completed: number;
      cancelled: number;
      expired: number;
      refunded: number;
    };
  };
  revenue: {
    total: string;
    today: string;
    thisWeek: string;
    thisMonth: string;
  };
  providers: Array<{
    id: string;
    name: string;
    displayName: string;
    totalOrders: number;
    successRate: number;
    revenue: string;
    isActive: boolean;
  }>;
  topServices: Array<{
    serviceId: string;
    serviceName: string;
    orderCount: number;
    revenue: string;
  }>;
  topCountries: Array<{
    countryId: string;
    countryName: string;
    orderCount: number;
    revenue: string;
  }>;
  rentals: {
    total: number;
    active: number;
    revenue: string;
  };
}

// ============================================
// Query Parameters
// ============================================

export interface ProductQueryParams {
  providerId?: string;
  serviceId?: string;
  countryId?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ServiceQueryParams {
  providerId?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CountryQueryParams {
  providerId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface OrderQueryParams {
  status?: SmsOrderStatus;
  fromDate?: string; // YYYY-MM-DD
  toDate?: string; // YYYY-MM-DD
  page?: number;
  limit?: number;
}

export interface RentalQueryParams {
  status?: SmsRentalStatus;
  page?: number;
  limit?: number;
}

export interface AdminOrderQueryParams extends OrderQueryParams {
  userId?: string;
  search?: string;
}

export interface AdminRentalQueryParams extends RentalQueryParams {
  userId?: string;
}

export interface AdminServiceQueryParams extends ServiceQueryParams {
  isActive?: boolean;
}

export interface AdminCountryQueryParams extends CountryQueryParams {
  isActive?: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

// ============================================
// Response Types
// ============================================

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ProvidersResponse {
  providers: SmsProvider[];
}

export interface ActivateResponse {
  order: SmsOrder;
  message: string;
}

export interface CancelResponse {
  order: SmsOrder;
  refundAmount: string;
  message: string;
}

export interface RentResponse {
  rental: SmsRental;
  message: string;
}

export interface SyncResponse {
  message: string;
  services: number;
  countries: number;
  products: number;
}

// ============================================
// USER API FUNCTIONS
// ============================================

// --- Catalog ---

/**
 * Get list of active SMS providers
 * GET /api/v1/sms/providers
 */
export const getProviders = async (): Promise<ProvidersResponse> => {
  const response = await apiClient.get<ProvidersResponse>(
    API_ENDPOINTS.SMS.PROVIDERS,
  );
  return response.data;
};

/**
 * Get list of services (filterable)
 * GET /api/v1/sms/services
 */
export const getServices = async (
  params?: ServiceQueryParams,
): Promise<PaginatedResponse<SmsService>> => {
  const response = await apiClient.get<PaginatedResponse<SmsService>>(
    API_ENDPOINTS.SMS.SERVICES,
    { params },
  );
  return response.data;
};

/**
 * Get list of countries (filterable)
 * GET /api/v1/sms/countries
 */
export const getCountries = async (
  params?: CountryQueryParams,
): Promise<PaginatedResponse<SmsCountry>> => {
  const response = await apiClient.get<PaginatedResponse<SmsCountry>>(
    API_ENDPOINTS.SMS.COUNTRIES,
    { params },
  );
  return response.data;
};

/**
 * Get products with prices (filterable)
 * GET /api/v1/sms/products
 */
export const getProducts = async (
  params?: ProductQueryParams,
): Promise<PaginatedResponse<SmsProduct>> => {
  const response = await apiClient.get<PaginatedResponse<SmsProduct>>(
    API_ENDPOINTS.SMS.PRODUCTS,
    { params },
  );
  return response.data;
};

/**
 * Get products with REAL-TIME prices from provider API
 * GET /api/v1/sms/products/realtime
 * Fetches fresh prices directly from provider, cached for 5 minutes
 */
export const getProductsRealtime = async (
  providerId: string,
  serviceId: string,
): Promise<PaginatedResponse<SmsProduct>> => {
  const response = await apiClient.get<PaginatedResponse<SmsProduct>>(
    API_ENDPOINTS.SMS.PRODUCTS_REALTIME,
    { params: { providerId, serviceId } },
  );
  return response.data;
};

// --- Activation ---

/**
 * Buy a number for SMS activation
 * POST /api/v1/sms/activate
 */
export const activateNumber = async (
  productId: string,
): Promise<ActivateResponse> => {
  const response = await apiClient.post<ActivateResponse>(
    API_ENDPOINTS.SMS.ACTIVATE,
    { productId },
  );
  return response.data;
};

/**
 * Check SMS status for an order
 * GET /api/v1/sms/activate/:orderId
 */
export const checkOrderStatus = async (
  orderId: string,
): Promise<{ order: SmsOrder }> => {
  const response = await apiClient.get<{ order: SmsOrder }>(
    API_ENDPOINTS.SMS.ACTIVATE_ORDER(orderId),
  );
  return response.data;
};

/**
 * Cancel order and refund wallet
 * POST /api/v1/sms/activate/:orderId/cancel
 */
export const cancelOrder = async (orderId: string): Promise<CancelResponse> => {
  const response = await apiClient.post<CancelResponse>(
    API_ENDPOINTS.SMS.ACTIVATE_CANCEL(orderId),
  );
  return response.data;
};

/**
 * Get user's activation order history
 * GET /api/v1/sms/activate/history
 */
export const getOrderHistory = async (
  params?: OrderQueryParams,
): Promise<PaginatedResponse<SmsOrder>> => {
  const response = await apiClient.get<PaginatedResponse<SmsOrder>>(
    API_ENDPOINTS.SMS.ACTIVATE_HISTORY,
    { params },
  );
  return response.data;
};

// --- Rental ---

/**
 * Rent a number (sms-man only)
 * POST /api/v1/sms/rent
 */
export const rentNumber = async (
  serviceId: string,
  countryId: string,
  duration: 1 | 4 | 12 | 24 | 48 | 72,
): Promise<RentResponse> => {
  const response = await apiClient.post<RentResponse>(API_ENDPOINTS.SMS.RENT, {
    serviceId,
    countryId,
    duration,
  });
  return response.data;
};

/**
 * Check rental status and messages
 * GET /api/v1/sms/rent/:rentalId
 */
export const checkRentalStatus = async (
  rentalId: string,
): Promise<{ rental: SmsRental }> => {
  const response = await apiClient.get<{ rental: SmsRental }>(
    API_ENDPOINTS.SMS.RENT_DETAIL(rentalId),
  );
  return response.data;
};

/**
 * Cancel rental (partial refund)
 * POST /api/v1/sms/rent/:rentalId/cancel
 */
export const cancelRental = async (
  rentalId: string,
): Promise<CancelResponse> => {
  const response = await apiClient.post<CancelResponse>(
    API_ENDPOINTS.SMS.RENT_CANCEL(rentalId),
  );
  return response.data;
};

/**
 * Get user's rental history
 * GET /api/v1/sms/rent/history
 */
export const getRentalHistory = async (
  params?: RentalQueryParams,
): Promise<PaginatedResponse<SmsRental>> => {
  const response = await apiClient.get<PaginatedResponse<SmsRental>>(
    API_ENDPOINTS.SMS.RENT_HISTORY,
    { params },
  );
  return response.data;
};

// --- Favorites ---

/**
 * Get user's favorites
 * GET /api/v1/sms/favorites
 */
export const getFavorites = async (
  params?: PaginationParams,
): Promise<PaginatedResponse<SmsFavorite>> => {
  const response = await apiClient.get<PaginatedResponse<SmsFavorite>>(
    API_ENDPOINTS.SMS.FAVORITES,
    { params },
  );
  return response.data;
};

/**
 * Add to favorites
 * POST /api/v1/sms/favorites
 */
export const addFavorite = async (
  serviceId: string,
  countryId: string,
  providerId: string,
): Promise<{ favorite: SmsFavorite; message: string }> => {
  const response = await apiClient.post<{
    favorite: SmsFavorite;
    message: string;
  }>(API_ENDPOINTS.SMS.FAVORITES, {
    serviceId,
    countryId,
    providerId,
  });
  return response.data;
};

/**
 * Remove from favorites
 * DELETE /api/v1/sms/favorites/:id
 */
export const removeFavorite = async (
  id: string,
): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(
    API_ENDPOINTS.SMS.FAVORITE_DETAIL(id),
  );
  return response.data;
};

// ============================================
// ADMIN API FUNCTIONS
// ============================================

// --- Admin Providers ---

/**
 * Get all providers (admin view with balance)
 * GET /api/v1/admin/sms/providers
 */
export const adminGetProviders = async (): Promise<ProvidersResponse> => {
  const response = await apiClient.get<ProvidersResponse>(
    API_ENDPOINTS.ADMIN.SMS.PROVIDERS,
  );
  return response.data;
};

/**
 * Update provider settings
 * PATCH /api/v1/admin/sms/providers/:id
 */
export const adminUpdateProvider = async (
  id: string,
  data: {
    displayName?: string;
    isActive?: boolean;
    priority?: number;
    markup?: number;
    settings?: Record<string, unknown>;
  },
): Promise<{ provider: SmsProvider; message: string }> => {
  const response = await apiClient.patch<{
    provider: SmsProvider;
    message: string;
  }>(API_ENDPOINTS.ADMIN.SMS.PROVIDER_DETAIL(id), data);
  return response.data;
};

/**
 * Force sync provider catalog
 * POST /api/v1/admin/sms/providers/:id/sync
 */
export const adminSyncProvider = async (id: string): Promise<SyncResponse> => {
  const response = await apiClient.post<SyncResponse>(
    API_ENDPOINTS.ADMIN.SMS.PROVIDER_SYNC(id),
  );
  return response.data;
};

// --- Admin Services ---

/**
 * Get all services (admin view)
 * GET /api/v1/admin/sms/services
 */
export const adminGetServices = async (
  params?: AdminServiceQueryParams,
): Promise<PaginatedResponse<SmsService>> => {
  const response = await apiClient.get<PaginatedResponse<SmsService>>(
    API_ENDPOINTS.ADMIN.SMS.SERVICES,
    { params },
  );
  return response.data;
};

/**
 * Create new service (admin)
 * POST /api/v1/admin/sms/services
 */
export const adminCreateService = async (
  data: {
    name: string;
    serviceCode: string;
    providerId: string;
    defaultPrice: number;
    successRate?: number;
    iconUrl?: string;
    category?: string;
    countryIds?: string[];
    isActive?: boolean;
  },
): Promise<{ service: SmsService; message: string }> => {
  const response = await apiClient.post<{
    service: SmsService;
    message: string;
  }>(API_ENDPOINTS.ADMIN.SMS.SERVICES, data);
  return response.data;
};

/**
 * Update service
 * PATCH /api/v1/admin/sms/services/:id
 */
export const adminUpdateService = async (
  id: string,
  data: {
    name?: string;
    category?: string;
    iconUrl?: string;
    isActive?: boolean;
  },
): Promise<{ service: SmsService; message: string }> => {
  const response = await apiClient.patch<{
    service: SmsService;
    message: string;
  }>(API_ENDPOINTS.ADMIN.SMS.SERVICE_DETAIL(id), data);
  return response.data;
};

/**
 * Bulk disable services
 * POST /api/v1/admin/sms/services/bulk-disable
 */
export const adminBulkDisableServices = async (
  serviceIds: string[],
): Promise<{ count: number; message: string }> => {
  const response = await apiClient.post<{ count: number; message: string }>(
    API_ENDPOINTS.ADMIN.SMS.SERVICES_BULK_DISABLE,
    { serviceIds },
  );
  return response.data;
};

// --- Admin Countries ---

/**
 * Get all countries (admin view)
 * GET /api/v1/admin/sms/countries
 */
export const adminGetCountries = async (
  params?: AdminCountryQueryParams,
): Promise<PaginatedResponse<SmsCountry>> => {
  const response = await apiClient.get<PaginatedResponse<SmsCountry>>(
    API_ENDPOINTS.ADMIN.SMS.COUNTRIES,
    { params },
  );
  return response.data;
};

/**
 * Update country
 * PATCH /api/v1/admin/sms/countries/:id
 */
export const adminUpdateCountry = async (
  id: string,
  data: {
    name?: string;
    code?: string;
    iconUrl?: string;
    isActive?: boolean;
  },
): Promise<{ country: SmsCountry; message: string }> => {
  const response = await apiClient.patch<{
    country: SmsCountry;
    message: string;
  }>(API_ENDPOINTS.ADMIN.SMS.COUNTRY_DETAIL(id), data);
  return response.data;
};

// --- Admin Orders ---

/**
 * Get all orders (admin view)
 * GET /api/v1/admin/sms/orders
 */
export const adminGetOrders = async (
  params?: AdminOrderQueryParams,
): Promise<PaginatedResponse<SmsOrder>> => {
  const response = await apiClient.get<PaginatedResponse<SmsOrder>>(
    API_ENDPOINTS.ADMIN.SMS.ORDERS,
    { params },
  );
  return response.data;
};

/**
 * Get order detail (admin)
 * GET /api/v1/admin/sms/orders/:id
 */
export const adminGetOrder = async (
  id: string,
): Promise<{ order: SmsOrder }> => {
  const response = await apiClient.get<{ order: SmsOrder }>(
    API_ENDPOINTS.ADMIN.SMS.ORDER_DETAIL(id),
  );
  return response.data;
};

/**
 * Refund order (admin)
 * POST /api/v1/admin/sms/orders/:id/refund
 */
export const adminRefundOrder = async (
  id: string,
  reason?: string,
): Promise<{ order: SmsOrder; refundAmount: string; message: string }> => {
  const response = await apiClient.post<{
    order: SmsOrder;
    refundAmount: string;
    message: string;
  }>(API_ENDPOINTS.ADMIN.SMS.ORDER_REFUND(id), { reason });
  return response.data;
};

/**
 * Extend order expiry (admin) - extends by 10 minutes
 * POST /api/v1/admin/sms/orders/:id/extend
 */
export const adminExtendOrder = async (
  id: string,
): Promise<{ order: SmsOrder; message: string }> => {
  const response = await apiClient.post<{
    order: SmsOrder;
    message: string;
  }>(API_ENDPOINTS.ADMIN.SMS.ORDER_EXTEND(id));
  return response.data;
};

/**
 * Cancel order (admin) - cancels on provider and refunds wallet
 * POST /api/v1/admin/sms/orders/:id/cancel
 */
export const adminCancelOrder = async (
  id: string,
): Promise<{ order: SmsOrder; refundAmount: string; message: string }> => {
  const response = await apiClient.post<{
    order: SmsOrder;
    refundAmount: string;
    message: string;
  }>(API_ENDPOINTS.ADMIN.SMS.ORDER_CANCEL(id));
  return response.data;
};

// --- Admin Rentals ---

/**
 * Get all rentals (admin view)
 * GET /api/v1/admin/sms/rentals
 */
export const adminGetRentals = async (
  params?: AdminRentalQueryParams,
): Promise<PaginatedResponse<SmsRental>> => {
  const response = await apiClient.get<PaginatedResponse<SmsRental>>(
    API_ENDPOINTS.ADMIN.SMS.RENTALS,
    { params },
  );
  return response.data;
};

// --- Admin Statistics ---

/**
 * Get SMS statistics
 * GET /api/v1/admin/sms/statistics
 */
export const adminGetStatistics = async (): Promise<SmsStatistics> => {
  const response = await apiClient.get<SmsStatistics>(
    API_ENDPOINTS.ADMIN.SMS.STATISTICS,
  );
  return response.data;
};

// --- Admin VIP Numbers ---

/**
 * Get VIP numbers list
 * GET /api/v1/admin/sms/vip
 */
export const adminGetVipNumbers = async (
  params?: PaginationParams,
): Promise<PaginatedResponse<VipNumber>> => {
  const response = await apiClient.get<PaginatedResponse<VipNumber>>(
    API_ENDPOINTS.ADMIN.SMS.VIP,
    { params },
  );
  return response.data;
};

/**
 * Add VIP number
 * POST /api/v1/admin/sms/vip
 */
export const adminAddVipNumber = async (
  serviceId: string,
  countryId: string,
  providerId: string,
  rating?: number,
): Promise<{ vipNumber: VipNumber; message: string }> => {
  const response = await apiClient.post<{
    vipNumber: VipNumber;
    message: string;
  }>(API_ENDPOINTS.ADMIN.SMS.VIP, {
    serviceId,
    countryId,
    providerId,
    rating,
  });
  return response.data;
};

/**
 * Remove VIP number
 * DELETE /api/v1/admin/sms/vip/:id
 */
export const adminRemoveVipNumber = async (
  id: string,
): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(
    API_ENDPOINTS.ADMIN.SMS.VIP_DETAIL(id),
  );
  return response.data;
};

/**
 * Auto-detect top services for VIP
 * POST /api/v1/admin/sms/vip/auto-detect
 */
export const adminAutoDetectVip = async (): Promise<{
  suggestions: Array<{
    serviceId: string;
    serviceName: string;
    countryId: string;
    countryName: string;
    providerId: string;
    providerName: string;
    orderCount: number;
  }>;
  message: string;
}> => {
  const response = await apiClient.post(
    API_ENDPOINTS.ADMIN.SMS.VIP_AUTO_DETECT,
  );
  return response.data;
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get status display label
 */
export const getOrderStatusLabel = (status: SmsOrderStatus): string => {
  const labels: Record<SmsOrderStatus, string> = {
    PENDING: 'Pending',
    WAITING_SMS: 'Waiting for SMS',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
    EXPIRED: 'Expired',
    REFUNDED: 'Refunded',
  };
  return labels[status] || status;
};

/**
 * Get status color
 */
export const getOrderStatusColor = (status: SmsOrderStatus): string => {
  const colors: Record<SmsOrderStatus, string> = {
    PENDING: 'var(--warning)',
    WAITING_SMS: 'var(--info)',
    COMPLETED: 'var(--success)',
    CANCELLED: 'var(--text-muted)',
    EXPIRED: 'var(--danger)',
    REFUNDED: 'var(--info)',
  };
  return colors[status] || 'var(--text-secondary)';
};

/**
 * Get rental status label
 */
export const getRentalStatusLabel = (status: SmsRentalStatus): string => {
  const labels: Record<SmsRentalStatus, string> = {
    ACTIVE: 'Active',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
    EXPIRED: 'Expired',
  };
  return labels[status] || status;
};

/**
 * Get rental status color
 */
export const getRentalStatusColor = (status: SmsRentalStatus): string => {
  const colors: Record<SmsRentalStatus, string> = {
    ACTIVE: 'var(--success)',
    COMPLETED: 'var(--text-muted)',
    CANCELLED: 'var(--warning)',
    EXPIRED: 'var(--danger)',
  };
  return colors[status] || 'var(--text-secondary)';
};

/**
 * Format price for display
 */
export const formatPrice = (
  price: string,
  currency: string = 'USD',
): string => {
  const num = parseFloat(price);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(num);
};

/**
 * Get country flag emoji from ISO code
 */
export const getCountryFlag = (code: string): string => {
  if (!code || code.length !== 2) return '🌍';
  const codePoints = code
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

/**
 * Get provider display badge
 */
export const getProviderBadge = (
  slug: string,
): { label: string; color: string; icon: string } => {
  const badges: Record<string, { label: string; color: string; icon: string }> =
    {
      fivesim: { label: 'V1', color: '#C6A75E', icon: '💰' },
      smsman: { label: 'V2', color: '#00D4FF', icon: '💎' },
      herosms: { label: 'V3', color: '#10B981', icon: '🛡️' },
    };
  return badges[slug] || { label: 'V?', color: '#666', icon: '📱' };
};

/**
 * Check if order can be cancelled
 */
export const canCancelOrder = (status: SmsOrderStatus): boolean => {
  return ['PENDING', 'WAITING_SMS'].includes(status);
};

/**
 * Check if rental can be cancelled
 */
export const canCancelRental = (status: SmsRentalStatus): boolean => {
  return status === 'ACTIVE';
};

/**
 * Calculate time remaining for order/rental
 */
export const getTimeRemaining = (
  expiresAt: string,
): { minutes: number; seconds: number; expired: boolean } => {
  const now = new Date().getTime();
  const expiry = new Date(expiresAt).getTime();
  const diff = expiry - now;

  if (diff <= 0) {
    return { minutes: 0, seconds: 0, expired: true };
  }

  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  return { minutes, seconds, expired: false };
};

/**
 * Format duration for display
 */
export const formatDuration = (hours: number): string => {
  if (hours < 24) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  if (remainingHours === 0) {
    return `${days} day${days > 1 ? 's' : ''}`;
  }
  return `${days} day${days > 1 ? 's' : ''} ${remainingHours}h`;
};

/**
 * Service categories
 */
export const SERVICE_CATEGORIES = [
  { value: 'social', label: 'Social Media', icon: '💬' },
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'shopping', label: 'Shopping', icon: '🛒' },
  { value: 'finance', label: 'Finance', icon: '💳' },
  { value: 'gaming', label: 'Gaming', icon: '🎮' },
  { value: 'dating', label: 'Dating', icon: '💕' },
  { value: 'delivery', label: 'Delivery', icon: '📦' },
  { value: 'transport', label: 'Transport', icon: '🚗' },
  { value: 'other', label: 'Other', icon: '📱' },
] as const;

/**
 * Rental duration options
 */
export const RENTAL_DURATIONS = [
  { value: 1, label: '1 Hour', price: 'lowest' },
  { value: 4, label: '4 Hours', price: 'low' },
  { value: 12, label: '12 Hours', price: 'medium' },
  { value: 24, label: '1 Day', price: 'medium' },
  { value: 48, label: '2 Days', price: 'high' },
  { value: 72, label: '3 Days', price: 'highest' },
] as const;
