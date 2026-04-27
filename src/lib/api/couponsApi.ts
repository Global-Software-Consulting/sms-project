import { apiClient } from '@/config/api-client.config';
import { API_ENDPOINTS } from '@/config/server.config';

// ============================================
// Types
// ============================================

export type CouponType = 'FIXED' | 'PERCENTAGE';
export type CouponApplicableTo = 'ALL' | 'DEPOSIT' | 'SMS_ORDER' | 'RENTAL' | 'MEMBERSHIP';

export interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: CouponType;
  value: number;
  maxDiscount?: number;
  usageLimit: number;
  usagePerUser: number;
  usedCount: number;
  minOrderAmount?: number;
  startsAt?: string;
  expiresAt?: string;
  applicableTo: CouponApplicableTo;
  serviceIds: string[];
  countryIds: string[];
  planIds: string[];
  userIds: string[];
  firstTimeOnly: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CouponQueryParams {
  search?: string;
  type?: CouponType;
  applicableTo?: CouponApplicableTo;
  isActive?: boolean;
  showExpired?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
}

export interface CouponsResponse {
  data: Coupon[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateCouponRequest {
  code: string;
  name: string;
  description?: string;
  type: CouponType;
  value: number;
  maxDiscount?: number;
  usageLimit: number;
  usagePerUser?: number;
  minOrderAmount?: number;
  startsAt?: string;
  expiresAt?: string;
  applicableTo: CouponApplicableTo;
  serviceIds?: string[];
  countryIds?: string[];
  planIds?: string[];
  userIds?: string[];
  firstTimeOnly?: boolean;
  isActive?: boolean;
}

export interface UpdateCouponRequest {
  name?: string;
  description?: string;
  type?: CouponType;
  value?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usagePerUser?: number;
  minOrderAmount?: number;
  startsAt?: string;
  expiresAt?: string;
  applicableTo?: CouponApplicableTo;
  serviceIds?: string[];
  countryIds?: string[];
  planIds?: string[];
  userIds?: string[];
  firstTimeOnly?: boolean;
  isActive?: boolean;
}

// ============================================
// API Functions
// ============================================

export const getCoupons = async (params?: CouponQueryParams): Promise<CouponsResponse> => {
  const response = await apiClient.get<CouponsResponse>(
    API_ENDPOINTS.ADMIN.COUPONS.ROOT,
    { params },
  );
  return response.data;
};

export const getCouponById = async (id: string): Promise<Coupon> => {
  const response = await apiClient.get<Coupon>(
    API_ENDPOINTS.ADMIN.COUPONS.DETAIL(id),
  );
  return response.data;
};

export const createCoupon = async (data: CreateCouponRequest): Promise<Coupon> => {
  const response = await apiClient.post<Coupon>(
    API_ENDPOINTS.ADMIN.COUPONS.ROOT,
    data,
  );
  return response.data;
};

export const updateCoupon = async (id: string, data: UpdateCouponRequest): Promise<Coupon> => {
  const response = await apiClient.patch<Coupon>(
    API_ENDPOINTS.ADMIN.COUPONS.DETAIL(id),
    data,
  );
  return response.data;
};

export const deleteCoupon = async (id: string): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.ADMIN.COUPONS.DETAIL(id));
};

// ============================================
// User-facing Coupon Validation
// ============================================

export interface ValidateCouponRequest {
  code: string;
  orderType: 'DEPOSIT' | 'SMS_ORDER' | 'RENTAL' | 'MEMBERSHIP';
  orderAmount: number;
}

export interface CouponValidationResult {
  valid: boolean;
  coupon?: {
    id: string;
    code: string;
    name: string;
    type: CouponType;
    value: number;
    maxDiscount?: number;
  };
  discount: number;
  finalAmount: number;
  message?: string;
}

/**
 * Validate a coupon code for a specific order type and amount
 * Returns discount information if valid
 */
export const validateCoupon = async (data: ValidateCouponRequest): Promise<CouponValidationResult> => {
  const response = await apiClient.post<CouponValidationResult>(
    '/coupons/validate',
    data,
  );
  return response.data;
};