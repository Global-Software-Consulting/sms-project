/**
 * Reviews API
 *
 * Handles all review related API calls including:
 * - Public reviews listing
 * - Featured reviews
 * - User review slots
 * - Review submission
 */

import { apiClient } from '@/config/api-client.config';
import { API_ENDPOINTS } from '@/config/server.config';

// ============================================
// Types
// ============================================

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED';

export interface ReviewSlotInfo {
  totalSlots: number;
  usedSlots: number;
  availableSlots: number;
  totalSpent: number;
  dollarPerSlot: number;
  nextSlotAt: number;
}

export interface PublicReview {
  id: string;
  rating: number;
  title: string | null;
  text: string;
  displayName: string;
  isAnonymous: boolean;
  isVerifiedPurchase: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export interface UserReview {
  id: string;
  rating: number;
  title: string | null;
  text: string;
  status: ReviewStatus;
  isAnonymous: boolean;
  isFeatured: boolean;
  adminNote: string | null;
  createdAt: string;
  approvedAt: string | null;
}

export interface AverageRating {
  average: number;
  count: number;
}

export interface PaginatedReviews {
  data: PublicReview[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReviewQueryParams {
  rating?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SubmitReviewRequest {
  rating: number;
  title?: string;
  text: string;
  isAnonymous?: boolean;
}

export interface UpdateReviewRequest {
  rating?: number;
  title?: string | null;
  text?: string;
  isAnonymous?: boolean;
}

export interface SubmitReviewResponse {
  id: string;
  rating: number;
  title: string | null;
  text: string;
  status: ReviewStatus;
  isAnonymous: boolean;
  createdAt: string;
  message: string;
}

// ============================================
// API Functions
// ============================================

/**
 * Get public approved reviews
 * GET /api/v1/reviews
 */
export const getPublicReviews = async (
  params?: ReviewQueryParams,
): Promise<PaginatedReviews> => {
  const response = await apiClient.get<PaginatedReviews>(
    API_ENDPOINTS.REVIEWS.PUBLIC,
    { params },
  );
  return response.data;
};

/**
 * Get featured reviews for homepage
 * GET /api/v1/reviews/featured
 */
export const getFeaturedReviews = async (): Promise<PublicReview[]> => {
  const response = await apiClient.get<PublicReview[]>(
    API_ENDPOINTS.REVIEWS.FEATURED,
  );
  return response.data;
};

/**
 * Get average rating
 * GET /api/v1/reviews/rating
 */
export const getAverageRating = async (): Promise<AverageRating> => {
  const response = await apiClient.get<AverageRating>(
    API_ENDPOINTS.REVIEWS.RATING,
  );
  return response.data;
};

/**
 * Get user's review slots info
 * GET /api/v1/reviews/my-slots
 */
export const getMySlots = async (): Promise<ReviewSlotInfo> => {
  const response = await apiClient.get<ReviewSlotInfo>(
    API_ENDPOINTS.REVIEWS.MY_SLOTS,
  );
  return response.data;
};

/**
 * Get user's submitted reviews
 * GET /api/v1/reviews/my-reviews
 */
export const getMyReviews = async (): Promise<UserReview[]> => {
  const response = await apiClient.get<UserReview[]>(
    API_ENDPOINTS.REVIEWS.MY_REVIEWS,
  );
  return response.data;
};

/**
 * Submit a new review
 * POST /api/v1/reviews
 */
export const submitReview = async (
  data: SubmitReviewRequest,
): Promise<SubmitReviewResponse> => {
  const response = await apiClient.post<SubmitReviewResponse>(
    API_ENDPOINTS.REVIEWS.SUBMIT,
    data,
  );
  return response.data;
};

/**
 * Get a single user review by id
 * GET /api/v1/reviews/my-reviews/:id
 */
export const getMyReview = async (id: string): Promise<UserReview> => {
  const response = await apiClient.get<UserReview>(
    API_ENDPOINTS.REVIEWS.MY_REVIEW_DETAIL(id),
  );
  return response.data;
};

/**
 * Update a user review
 * PATCH /api/v1/reviews/my-reviews/:id
 */
export const updateMyReview = async (
  id: string,
  data: UpdateReviewRequest,
): Promise<UserReview> => {
  const response = await apiClient.patch<UserReview>(
    API_ENDPOINTS.REVIEWS.MY_REVIEW_DETAIL(id),
    data,
  );
  return response.data;
};

/**
 * Delete a user review
 * DELETE /api/v1/reviews/my-reviews/:id
 */
export const deleteMyReview = async (id: string): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.REVIEWS.MY_REVIEW_DETAIL(id));
};

// ============================================
// Helper Functions
// ============================================

/**
 * Get review status label
 */
export const getReviewStatusLabel = (status: ReviewStatus): string => {
  const labels: Record<ReviewStatus, string> = {
    PENDING: 'Pending Review',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    FLAGGED: 'Flagged',
  };
  return labels[status] || status;
};

/**
 * Get review status color
 */
export const getReviewStatusColor = (status: ReviewStatus): string => {
  const colors: Record<ReviewStatus, string> = {
    PENDING: '#F59E0B',
    APPROVED: '#10B981',
    REJECTED: '#EF4444',
    FLAGGED: '#F97316',
  };
  return colors[status] || '#6B7280';
};

/**
 * Format relative time
 */
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 30) {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  return 'Just now';
};

/**
 * Render star rating
 */
export const renderStars = (rating: number): string => {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
};

