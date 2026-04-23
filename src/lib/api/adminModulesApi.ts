import { apiClient } from '@/config/api-client.config';
import { API_ENDPOINTS } from '@/config/server.config';

// ============================================
// ADS Types & Functions
// ============================================

export interface Ad {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  targetUrl?: string;
  position: string;
  isActive: boolean;
  sortOrder: number;
  startDate?: string;
  endDate?: string;
  impressions: number;
  clicks: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdRequest {
  title: string;
  description?: string;
  imageUrl?: string;
  targetUrl?: string;
  position?: string;
  isActive?: boolean;
  sortOrder?: number;
  startDate?: string;
  endDate?: string;
}

export interface UpdateAdRequest extends Partial<CreateAdRequest> {}

export interface AdStats {
  totalAds: number;
  activeAds: number;
  totalImpressions: number;
  totalClicks: number;
}

export const getAds = async (params?: { position?: string; isActive?: boolean }): Promise<Ad[]> => {
  const response = await apiClient.get<Ad[]>(API_ENDPOINTS.ADMIN.ADS.ROOT, { params });
  return response.data;
};

// Public endpoint - no auth required; used in footer etc.
export const getPublicAds = async (params?: { position?: string }): Promise<Ad[]> => {
  const response = await apiClient.get<Ad[]>(API_ENDPOINTS.ADS, { params });
  return response.data;
};

export const getAdStats = async (): Promise<AdStats> => {
  const response = await apiClient.get<AdStats>(API_ENDPOINTS.ADMIN.ADS.STATS);
  return response.data;
};

export const getAdPositions = async (): Promise<string[]> => {
  const response = await apiClient.get<string[]>(API_ENDPOINTS.ADMIN.ADS.POSITIONS);
  return response.data;
};

export const getAd = async (id: string): Promise<Ad> => {
  const response = await apiClient.get<Ad>(API_ENDPOINTS.ADMIN.ADS.DETAIL(id));
  return response.data;
};

export const createAd = async (data: CreateAdRequest): Promise<Ad> => {
  const response = await apiClient.post<Ad>(API_ENDPOINTS.ADMIN.ADS.ROOT, data);
  return response.data;
};

export const updateAd = async (id: string, data: UpdateAdRequest): Promise<Ad> => {
  const response = await apiClient.patch<Ad>(API_ENDPOINTS.ADMIN.ADS.DETAIL(id), data);
  return response.data;
};

export const deleteAd = async (id: string): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.ADMIN.ADS.DETAIL(id));
};

// ============================================
// LEGAL Types & Functions
// ============================================

export interface LegalPage {
  id: string;
  type: string;
  title: string;
  content: string;
  isPublished: boolean;
  updatedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLegalPageRequest {
  type: string;
  title: string;
  content: string;
  isPublished?: boolean;
}

export interface UpdateLegalPageRequest {
  title?: string;
  content?: string;
  isPublished?: boolean;
}

export const getLegalPages = async (): Promise<LegalPage[]> => {
  const response = await apiClient.get<LegalPage[]>(API_ENDPOINTS.ADMIN.LEGAL.ROOT);
  return response.data;
};

export const getLegalPage = async (id: string): Promise<LegalPage> => {
  const response = await apiClient.get<LegalPage>(API_ENDPOINTS.ADMIN.LEGAL.DETAIL(id));
  return response.data;
};

export const getLegalPageByType = async (type: string): Promise<LegalPage> => {
  const response = await apiClient.get<LegalPage>(API_ENDPOINTS.ADMIN.LEGAL.BY_TYPE(type));
  return response.data;
};

export const createLegalPage = async (data: CreateLegalPageRequest): Promise<LegalPage> => {
  const response = await apiClient.post<LegalPage>(API_ENDPOINTS.ADMIN.LEGAL.ROOT, data);
  return response.data;
};

export const updateLegalPage = async (id: string, data: UpdateLegalPageRequest): Promise<LegalPage> => {
  const response = await apiClient.patch<LegalPage>(API_ENDPOINTS.ADMIN.LEGAL.DETAIL(id), data);
  return response.data;
};

export const deleteLegalPage = async (id: string): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.ADMIN.LEGAL.DETAIL(id));
};

export const seedLegalPages = async (): Promise<{ created: string[]; skipped: string[] }> => {
  const response = await apiClient.post<{ created: string[]; skipped: string[] }>(`${API_ENDPOINTS.ADMIN.LEGAL.ROOT}/seed`);
  return response.data;
};

// ============================================
// BLOG Types & Functions
// ============================================

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  parentId?: string;
  parent?: { id: string; name: string; slug: string };
  children?: { id: string; name: string; slug: string }[];
  _count?: { posts: number };
  createdAt: string;
  updatedAt: string;
}

export interface BlogAuthor {
  id: string;
  name: string;
  slug: string;
  bio?: string;
  avatar?: string;
  email?: string;
  website?: string;
  isActive: boolean;
  _count?: { posts: number };
  createdAt: string;
  updatedAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  categoryId?: string;
  category?: { id: string; name: string; slug: string };
  tags: string[];
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  authorId?: string;
  author?: { id: string; name: string; slug: string; avatar?: string };
  viewCount: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlogCategoryRequest {
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
  parentId?: string;
}

export interface UpdateBlogCategoryRequest extends Partial<CreateBlogCategoryRequest> {}

export interface CreateBlogAuthorRequest {
  name: string;
  slug?: string;
  bio?: string;
  avatar?: string;
  email?: string;
  website?: string;
  isActive?: boolean;
}

export interface UpdateBlogAuthorRequest extends Partial<CreateBlogAuthorRequest> {}

export interface CreateBlogPostRequest {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  categoryId?: string;
  authorId?: string;
  tags?: string[];
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

export interface UpdateBlogPostRequest extends Partial<CreateBlogPostRequest> {}

export interface BlogStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
  totalViews: number;
}

// Blog Category API Functions
export const getBlogCategories = async (includeInactive = false): Promise<BlogCategory[]> => {
  const response = await apiClient.get<BlogCategory[]>(API_ENDPOINTS.ADMIN.BLOG_CATEGORIES.ROOT, {
    params: { includeInactive: includeInactive ? 'true' : undefined },
  });
  return response.data;
};

export const getParentBlogCategories = async (includeInactive = false): Promise<BlogCategory[]> => {
  const response = await apiClient.get<BlogCategory[]>(API_ENDPOINTS.ADMIN.BLOG_CATEGORIES.PARENTS, {
    params: { includeInactive: includeInactive ? 'true' : undefined },
  });
  return response.data;
};

export const getBlogCategory = async (id: string): Promise<BlogCategory> => {
  const response = await apiClient.get<BlogCategory>(API_ENDPOINTS.ADMIN.BLOG_CATEGORIES.DETAIL(id));
  return response.data;
};

export const createBlogCategory = async (data: CreateBlogCategoryRequest): Promise<BlogCategory> => {
  const response = await apiClient.post<BlogCategory>(API_ENDPOINTS.ADMIN.BLOG_CATEGORIES.ROOT, data);
  return response.data;
};

export const updateBlogCategory = async (id: string, data: UpdateBlogCategoryRequest): Promise<BlogCategory> => {
  const response = await apiClient.patch<BlogCategory>(API_ENDPOINTS.ADMIN.BLOG_CATEGORIES.DETAIL(id), data);
  return response.data;
};

export const toggleBlogCategory = async (id: string, isActive: boolean): Promise<BlogCategory> => {
  const response = await apiClient.patch<BlogCategory>(API_ENDPOINTS.ADMIN.BLOG_CATEGORIES.TOGGLE(id), { isActive });
  return response.data;
};

export const reorderBlogCategories = async (ids: string[]): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>(API_ENDPOINTS.ADMIN.BLOG_CATEGORIES.REORDER, { ids });
  return response.data;
};

export const deleteBlogCategory = async (id: string): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.ADMIN.BLOG_CATEGORIES.DETAIL(id));
};

// Blog Author API Functions
export const getBlogAuthors = async (includeInactive = false): Promise<BlogAuthor[]> => {
  const response = await apiClient.get<BlogAuthor[]>(API_ENDPOINTS.ADMIN.BLOG_AUTHORS.ROOT, {
    params: { includeInactive: includeInactive ? 'true' : undefined },
  });
  return response.data;
};

export const getRandomBlogAuthor = async (): Promise<BlogAuthor | null> => {
  const response = await apiClient.get<BlogAuthor | null>(API_ENDPOINTS.ADMIN.BLOG_AUTHORS.RANDOM);
  return response.data;
};

export const getBlogAuthor = async (id: string): Promise<BlogAuthor> => {
  const response = await apiClient.get<BlogAuthor>(API_ENDPOINTS.ADMIN.BLOG_AUTHORS.DETAIL(id));
  return response.data;
};

export const createBlogAuthor = async (data: CreateBlogAuthorRequest): Promise<BlogAuthor> => {
  const response = await apiClient.post<BlogAuthor>(API_ENDPOINTS.ADMIN.BLOG_AUTHORS.ROOT, data);
  return response.data;
};

export const updateBlogAuthor = async (id: string, data: UpdateBlogAuthorRequest): Promise<BlogAuthor> => {
  const response = await apiClient.patch<BlogAuthor>(API_ENDPOINTS.ADMIN.BLOG_AUTHORS.DETAIL(id), data);
  return response.data;
};

export const toggleBlogAuthor = async (id: string, isActive: boolean): Promise<BlogAuthor> => {
  const response = await apiClient.patch<BlogAuthor>(API_ENDPOINTS.ADMIN.BLOG_AUTHORS.TOGGLE(id), { isActive });
  return response.data;
};

export const deleteBlogAuthor = async (id: string): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.ADMIN.BLOG_AUTHORS.DETAIL(id));
};

// Blog Post API Functions
export const getBlogPosts = async (params?: { 
  status?: string; 
  categoryId?: string;
  authorId?: string;
  search?: string;
  tag?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: BlogPost[]; meta: { total: number; page: number; limit: number; totalPages: number } }> => {
  const response = await apiClient.get(API_ENDPOINTS.ADMIN.BLOG.ROOT, { params });
  return response.data;
};

export const getBlogStats = async (): Promise<BlogStats> => {
  const response = await apiClient.get<BlogStats>(API_ENDPOINTS.ADMIN.BLOG.STATS);
  return response.data;
};

export const getBlogTags = async (): Promise<{ tag: string; count: number }[]> => {
  const response = await apiClient.get<{ tag: string; count: number }[]>(API_ENDPOINTS.ADMIN.BLOG.TAGS);
  return response.data;
};

export const getBlogPost = async (id: string): Promise<BlogPost> => {
  const response = await apiClient.get<BlogPost>(API_ENDPOINTS.ADMIN.BLOG.DETAIL(id));
  return response.data;
};

export const createBlogPost = async (data: CreateBlogPostRequest): Promise<BlogPost> => {
  const response = await apiClient.post<BlogPost>(API_ENDPOINTS.ADMIN.BLOG.ROOT, data);
  return response.data;
};

export const updateBlogPost = async (id: string, data: UpdateBlogPostRequest): Promise<BlogPost> => {
  const response = await apiClient.patch<BlogPost>(API_ENDPOINTS.ADMIN.BLOG.DETAIL(id), data);
  return response.data;
};

export const publishBlogPost = async (id: string): Promise<BlogPost> => {
  const response = await apiClient.post<BlogPost>(API_ENDPOINTS.ADMIN.BLOG.PUBLISH(id));
  return response.data;
};

export const unpublishBlogPost = async (id: string): Promise<BlogPost> => {
  const response = await apiClient.post<BlogPost>(API_ENDPOINTS.ADMIN.BLOG.UNPUBLISH(id));
  return response.data;
};

export const archiveBlogPost = async (id: string): Promise<BlogPost> => {
  const response = await apiClient.post<BlogPost>(API_ENDPOINTS.ADMIN.BLOG.ARCHIVE(id));
  return response.data;
};

export const deleteBlogPost = async (id: string): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.ADMIN.BLOG.DETAIL(id));
};

export interface BulkCreateBlogRequest {
  categoryId: string;
  authorId?: string;
  title: string;
  content: string;
  tags?: string[];
  minHoursBetweenPosts?: number;
  maxHoursBetweenPosts?: number;
  authorRotation?: boolean;
  count?: number;
}

export interface BulkCreateBlogResponse {
  message: string;
  count: number;
  posts: BlogPost[];
}

export const bulkCreateBlogPosts = async (data: BulkCreateBlogRequest): Promise<BulkCreateBlogResponse> => {
  const response = await apiClient.post<BulkCreateBlogResponse>(API_ENDPOINTS.ADMIN.BLOG.BULK, data);
  return response.data;
};

// ============================================
// REVIEWS Types & Functions
// ============================================

export interface AdminReview {
  id: string;
  userId: string;
  user?: { id: string; username: string; email: string };
  rating: number;
  title?: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  isFeatured: boolean;
  adminResponse?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStats {
  totalReviews: number;
  pendingReviews: number;
  approvedReviews: number;
  rejectedReviews: number;
  averageRating: number;
  featuredCount: number;
}

export const getAdminReviews = async (params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: AdminReview[]; total: number }> => {
  const response = await apiClient.get(API_ENDPOINTS.ADMIN.REVIEWS.ROOT, { params });
  return response.data;
};

export const getReviewStats = async (): Promise<ReviewStats> => {
  const response = await apiClient.get<ReviewStats>(API_ENDPOINTS.ADMIN.REVIEWS.STATS);
  return response.data;
};

export const approveReview = async (id: string, response?: string): Promise<AdminReview> => {
  const res = await apiClient.post<AdminReview>(API_ENDPOINTS.ADMIN.REVIEWS.APPROVE(id), { response });
  return res.data;
};

export const rejectReview = async (id: string, reason?: string): Promise<AdminReview> => {
  const res = await apiClient.post<AdminReview>(API_ENDPOINTS.ADMIN.REVIEWS.REJECT(id), { reason });
  return res.data;
};

export const toggleReviewFeatured = async (id: string): Promise<AdminReview> => {
  const response = await apiClient.post<AdminReview>(API_ENDPOINTS.ADMIN.REVIEWS.FEATURE(id));
  return response.data;
};

export interface UpdateReviewRequest {
  rating?: number;
  title?: string;
  text?: string;
  isFeatured?: boolean;
  displayOrder?: number;
}

export const updateReview = async (id: string, data: UpdateReviewRequest): Promise<AdminReview> => {
  const response = await apiClient.patch<AdminReview>(API_ENDPOINTS.ADMIN.REVIEWS.DETAIL(id), data);
  return response.data;
};

export const deleteReview = async (id: string): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.ADMIN.REVIEWS.DETAIL(id));
};

// ============================================
// NOTIFICATIONS Types & Functions
// ============================================

export interface AdminNotification {
  id: string;
  userId?: string;
  user?: { id: string; username: string; email: string };
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: string;
  subject: string;
  body: string;
  variables: string[];
  isActive: boolean;
}

export interface BulkNotificationRequest {
  title: string;
  message: string;
  type: 'SYSTEM' | 'PROMOTION' | 'ALERT' | 'INFO';
  sendEmail?: boolean;
  activeUsersOnly?: boolean;
  membersOnly?: boolean;
  userIds?: string[];
  registeredAfter?: string;
  registeredBefore?: string;
  minWalletBalance?: number;
  data?: Record<string, unknown>;
}

export const getAdminNotifications = async (params?: {
  userId?: string;
  type?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: AdminNotification[]; total: number }> => {
  const response = await apiClient.get(API_ENDPOINTS.ADMIN.NOTIFICATIONS.ROOT, { params });
  return response.data;
};

export const sendBulkNotification = async (data: BulkNotificationRequest): Promise<{ sent: number }> => {
  const response = await apiClient.post<{ sent: number }>(API_ENDPOINTS.ADMIN.NOTIFICATIONS.SEND_BULK, data);
  return response.data;
};

export const getNotificationTemplates = async (): Promise<NotificationTemplate[]> => {
  const response = await apiClient.get<NotificationTemplate[]>(API_ENDPOINTS.ADMIN.NOTIFICATIONS.TEMPLATES);
  return response.data;
};

// ============================================
// FAQ Types & Functions
// ============================================

export interface FaqCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  faqCount?: number;
}

export interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
  viewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFaqCategoryRequest {
  name: string;
  description?: string;
}

export interface CreateFaqItemRequest {
  question: string;
  answer: string;
  category: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface FaqQueryParams {
  category?: string;
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export const getFaqCategories = async (): Promise<FaqCategory[]> => {
  const response = await apiClient.get(API_ENDPOINTS.ADMIN.FAQ.CATEGORIES);
  const data = response.data;
  return Array.isArray(data) ? data : (data?.data ?? []);
};

export const createFaqCategory = async (data: CreateFaqCategoryRequest): Promise<FaqCategory> => {
  const response = await apiClient.post<FaqCategory>(API_ENDPOINTS.ADMIN.FAQ.CATEGORIES, data);
  return response.data;
};

export const updateFaqCategory = async (id: string, data: Partial<CreateFaqCategoryRequest>): Promise<FaqCategory> => {
  const response = await apiClient.patch<FaqCategory>(API_ENDPOINTS.ADMIN.FAQ.CATEGORY_DETAIL(id), data);
  return response.data;
};

export const deleteFaqCategory = async (id: string): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.ADMIN.FAQ.CATEGORY_DETAIL(id));
};

export const getFaqItems = async (params?: FaqQueryParams): Promise<FaqItem[]> => {
  const response = await apiClient.get(API_ENDPOINTS.ADMIN.FAQ.ROOT, { params });
  const data = response.data;
  return Array.isArray(data) ? data : (data?.data ?? []);
};

export const createFaqItem = async (data: CreateFaqItemRequest): Promise<FaqItem> => {
  const response = await apiClient.post<FaqItem>(API_ENDPOINTS.ADMIN.FAQ.ROOT, data);
  return response.data;
};

export const updateFaqItem = async (id: string, data: Partial<CreateFaqItemRequest>): Promise<FaqItem> => {
  const response = await apiClient.patch<FaqItem>(API_ENDPOINTS.ADMIN.FAQ.DETAIL(id), data);
  return response.data;
};

export const deleteFaqItem = async (id: string): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.ADMIN.FAQ.DETAIL(id));
};

export const reorderFaqItems = async (items: { id: string; sortOrder: number }[]): Promise<void> => {
  await apiClient.post(API_ENDPOINTS.ADMIN.FAQ.REORDER, { items });
};

// ============================================
// CONTACT Types & Functions
// ============================================

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  adminReply?: string;
  repliedAt?: string;
  repliedBy?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface ContactStats {
  totalSubmissions: number;
  newSubmissions: number;
  repliedSubmissions: number;
  archivedSubmissions: number;
}

export const getContactSubmissions = async (params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: ContactSubmission[]; total: number }> => {
  const response = await apiClient.get(API_ENDPOINTS.ADMIN.CONTACT.ROOT, { params });
  return response.data;
};

export const getContactStats = async (): Promise<ContactStats> => {
  const response = await apiClient.get<ContactStats>(API_ENDPOINTS.ADMIN.CONTACT.STATS);
  return response.data;
};

export const getContactSubmission = async (id: string): Promise<ContactSubmission> => {
  const response = await apiClient.get<ContactSubmission>(API_ENDPOINTS.ADMIN.CONTACT.DETAIL(id));
  return response.data;
};

export const replyToContact = async (id: string, reply: string): Promise<ContactSubmission> => {
  const response = await apiClient.post<ContactSubmission>(API_ENDPOINTS.ADMIN.CONTACT.REPLY(id), { reply });
  return response.data;
};

export const deleteContactSubmission = async (id: string): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.ADMIN.CONTACT.DETAIL(id));
};

// ============================================
// TICKETS Types & Functions
// ============================================

export interface AdminTicket {
  id: string;
  userId: string;
  user?: { id: string; username: string; email: string };
  subject: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  assignedToId?: string;
  assignedTo?: { id: string; username: string };
  messagesCount: number;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  sender?: { id: string; username: string; role: string };
  message: string;
  attachments?: string[];
  isInternal: boolean;
  createdAt: string;
}

export interface TicketStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  avgResponseTime: number;
}

export const getAdminTickets = async (params?: {
  status?: string;
  priority?: string;
  assignedToId?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: AdminTicket[]; total: number }> => {
  const response = await apiClient.get(API_ENDPOINTS.ADMIN.TICKETS.ROOT, { params });
  return response.data;
};

export const getTicketStats = async (): Promise<TicketStats> => {
  const response = await apiClient.get<TicketStats>(API_ENDPOINTS.ADMIN.TICKETS.STATS);
  return response.data;
};

export const getAdminTicket = async (id: string): Promise<AdminTicket> => {
  const response = await apiClient.get<AdminTicket>(API_ENDPOINTS.ADMIN.TICKETS.DETAIL(id));
  return response.data;
};

export const getTicketMessages = async (id: string): Promise<TicketMessage[]> => {
  const response = await apiClient.get<TicketMessage[]>(API_ENDPOINTS.ADMIN.TICKETS.MESSAGES(id));
  return response.data;
};

export const assignTicket = async (id: string, assignedToId: string): Promise<AdminTicket> => {
  const response = await apiClient.post<AdminTicket>(API_ENDPOINTS.ADMIN.TICKETS.ASSIGN(id), { assignedToId });
  return response.data;
};

export const closeTicket = async (id: string, resolution?: string): Promise<AdminTicket> => {
  const response = await apiClient.post<AdminTicket>(API_ENDPOINTS.ADMIN.TICKETS.CLOSE(id), { resolution });
  return response.data;
};

export const replyToTicket = async (id: string, message: string, isInternal?: boolean): Promise<TicketMessage> => {
  const response = await apiClient.post<TicketMessage>(API_ENDPOINTS.ADMIN.TICKETS.MESSAGES(id), { message, isInternal });
  return response.data;
};

// ============================================
// RANKS Types & Functions
// ============================================

export interface Rank {
  id: string;
  name: string;
  slug: string;
  description?: string;
  minSpend: number;
  discount: number;
  benefits: string[];
  badgeColor?: string;
  badgeIcon?: string;
  sortOrder: number;
  isActive: boolean;
  usersCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRankRequest {
  name: string;
  slug?: string;
  description?: string;
  minSpend: number;
  discount: number;
  benefits?: string[];
  badgeColor?: string;
  badgeIcon?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export const getRanks = async (): Promise<Rank[]> => {
  const response = await apiClient.get<Rank[]>(API_ENDPOINTS.ADMIN.RANKS.ROOT);
  return response.data;
};

export const getRank = async (id: string): Promise<Rank> => {
  const response = await apiClient.get<Rank>(API_ENDPOINTS.ADMIN.RANKS.DETAIL(id));
  return response.data;
};

export const createRank = async (data: CreateRankRequest): Promise<Rank> => {
  const response = await apiClient.post<Rank>(API_ENDPOINTS.ADMIN.RANKS.ROOT, data);
  return response.data;
};

export const updateRank = async (id: string, data: Partial<CreateRankRequest>): Promise<Rank> => {
  const response = await apiClient.patch<Rank>(API_ENDPOINTS.ADMIN.RANKS.DETAIL(id), data);
  return response.data;
};

export const deleteRank = async (id: string): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.ADMIN.RANKS.DETAIL(id));
};

export const reorderRanks = async (items: { id: string; sortOrder: number }[]): Promise<void> => {
  await apiClient.post(API_ENDPOINTS.ADMIN.RANKS.REORDER, { items });
};

// ============================================
// REFERRALS Types & Functions
// ============================================

export interface ReferralStats {
  totalReferrers: number;
  totalReferrals: number;
  totalCommissions: number;
  pendingPayouts: number;
  paidPayouts: number;
}

export interface ReferralConfig {
  isEnabled: boolean;
  commissionRate: number;
  minPayoutAmount: number;
  cookieDuration: number;
  maxTiers: number;
}

export interface ReferralPayout {
  id: string;
  userId: string;
  user?: { id: string; username: string; email: string };
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  paymentMethod?: string;
  paymentDetails?: Record<string, unknown>;
  processedAt?: string;
  processedBy?: string;
  createdAt: string;
}

export const getReferralStats = async (): Promise<ReferralStats> => {
  const response = await apiClient.get<ReferralStats>(API_ENDPOINTS.ADMIN.REFERRALS.STATS);
  return response.data;
};

export const getReferralConfig = async (): Promise<ReferralConfig> => {
  const response = await apiClient.get<ReferralConfig>(API_ENDPOINTS.ADMIN.REFERRALS.CONFIG);
  return response.data;
};

export const updateReferralConfig = async (data: Partial<ReferralConfig>): Promise<ReferralConfig> => {
  const response = await apiClient.patch<ReferralConfig>(API_ENDPOINTS.ADMIN.REFERRALS.CONFIG, data);
  return response.data;
};

export const getReferralPayouts = async (params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: ReferralPayout[]; total: number }> => {
  const response = await apiClient.get(API_ENDPOINTS.ADMIN.REFERRALS.PAYOUTS, { params });
  return response.data;
};

export const approveReferralPayout = async (id: string): Promise<ReferralPayout> => {
  const response = await apiClient.post<ReferralPayout>(API_ENDPOINTS.ADMIN.REFERRALS.APPROVE_PAYOUT(id));
  return response.data;
};

export const rejectReferralPayout = async (id: string, reason?: string): Promise<ReferralPayout> => {
  const response = await apiClient.post<ReferralPayout>(API_ENDPOINTS.ADMIN.REFERRALS.REJECT_PAYOUT(id), { reason });
  return response.data;
};

// ============================================
// COUPONS Types & Functions
// ============================================

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  perUserLimit?: number;
  validFrom?: string;
  validUntil?: string;
  isActive: boolean;
  applicableTo?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCouponRequest {
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  perUserLimit?: number;
  validFrom?: string;
  validUntil?: string;
  isActive?: boolean;
  applicableTo?: string[];
}

export interface CouponStats {
  totalCoupons: number;
  activeCoupons: number;
  totalUsage: number;
  totalDiscountGiven: number;
}

export const getCoupons = async (params?: {
  isActive?: boolean;
  page?: number;
  limit?: number;
}): Promise<{ data: Coupon[]; total: number }> => {
  const response = await apiClient.get(API_ENDPOINTS.ADMIN.COUPONS.ROOT, { params });
  return response.data;
};

export const getCouponStats = async (): Promise<CouponStats> => {
  const response = await apiClient.get<CouponStats>(API_ENDPOINTS.ADMIN.COUPONS.STATS);
  return response.data;
};

export const getCoupon = async (id: string): Promise<Coupon> => {
  const response = await apiClient.get<Coupon>(API_ENDPOINTS.ADMIN.COUPONS.DETAIL(id));
  return response.data;
};

export const createCoupon = async (data: CreateCouponRequest): Promise<Coupon> => {
  const response = await apiClient.post<Coupon>(API_ENDPOINTS.ADMIN.COUPONS.ROOT, data);
  return response.data;
};

export const updateCoupon = async (id: string, data: Partial<CreateCouponRequest>): Promise<Coupon> => {
  const response = await apiClient.patch<Coupon>(API_ENDPOINTS.ADMIN.COUPONS.DETAIL(id), data);
  return response.data;
};

export const deleteCoupon = async (id: string): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.ADMIN.COUPONS.DETAIL(id));
};

// ============================================
// PAYMENT GATEWAYS Types & Functions
// ============================================

export type PaymentGatewayType = 'STRIPE' | 'PAYGATE' | 'PLISIO' | 'CRYPTOMUS' | 'NOWPAYMENTS' | 'VOLET' | 'BINANCE';

/**
 * Gateway-specific API settings
 * These are stored in the 'settings' JSON field and used to configure each gateway
 */
export interface GatewayApiSettings {
  // Stripe settings
  stripeSecretKey?: string;
  stripePublishableKey?: string;
  stripeWebhookSecret?: string;
  stripeAllowedIps?: string[];
  
  // Plisio settings
  plisioApiKey?: string;
  plisioApiSecret?: string;
  
  // Cryptomus settings
  cryptomusMerchantId?: string;
  cryptomusApiKey?: string;
  
  // NOWPayments settings
  nowpaymentsApiKey?: string;
  nowpaymentsIpnSecret?: string;
  
  // PayGate.to settings
  paygateWalletAddress?: string;
  paygateApiKey?: string;
  
  // Volet settings
  voletApiKey?: string;
  voletSecretKey?: string;
  voletMerchantId?: string;
  
  // Binance settings
  binanceMerchantId?: string;
  binanceApiKey?: string;
  binanceSecretKey?: string;
  binancePayId?: string;
}

export interface PaymentGatewayConfig {
  id: string;
  gateway: PaymentGatewayType;
  displayName: string;
  description?: string;
  icon?: string;
  imageUrl?: string;
  type: string; // crypto, card, multi, transfer
  isEnabled: boolean;
  feeFixed: string;
  feePercent: string;
  feePassToUser: boolean;
  serviceFeeEnabled?: boolean;
  minAmount: string;
  maxAmount: string;
  priority: number;
  currencies: string[];
  bonusSettings?: string;
  polygonWallet?: string;
  serviceFee?: string;
  settings?: GatewayApiSettings;
  createdAt?: string;
  updatedAt?: string;
  isConfigured?: boolean;
  configuredFields?: string[];
  isVirtual?: boolean;
}

export interface UpdateGatewayConfigRequest {
  displayName?: string;
  description?: string;
  icon?: string;
  imageUrl?: string;
  type?: string;
  isEnabled?: boolean;
  feeFixed?: number;
  feePercent?: number;
  feePassToUser?: boolean;
  serviceFeeEnabled?: boolean;
  minAmount?: number;
  maxAmount?: number;
  priority?: number;
  currencies?: string[];
  bonusSettings?: string;
  polygonWallet?: string;
  serviceFee?: string;
  settings?: GatewayApiSettings;
}

export interface GatewayConfigsResponse {
  data: PaymentGatewayConfig[];
  meta: {
    total: number;
    configured: number;
    enabled: number;
  };
}

export const getPaymentGateways = async (params?: { isEnabled?: boolean; gateway?: PaymentGatewayType }): Promise<GatewayConfigsResponse> => {
  const response = await apiClient.get<GatewayConfigsResponse>(API_ENDPOINTS.ADMIN.PAYMENT_GATEWAYS.ROOT, { params });
  return response.data;
};

export const getPaymentGateway = async (gateway: PaymentGatewayType): Promise<PaymentGatewayConfig> => {
  const response = await apiClient.get<PaymentGatewayConfig>(API_ENDPOINTS.ADMIN.PAYMENT_GATEWAYS.DETAIL(gateway));
  return response.data;
};

export const updatePaymentGateway = async (gateway: PaymentGatewayType, data: UpdateGatewayConfigRequest): Promise<{ message: string; data: PaymentGatewayConfig }> => {
  const response = await apiClient.patch<{ message: string; data: PaymentGatewayConfig }>(API_ENDPOINTS.ADMIN.PAYMENT_GATEWAYS.DETAIL(gateway), data);
  return response.data;
};

export const togglePaymentGateway = async (gateway: PaymentGatewayType, isEnabled: boolean): Promise<{ message: string; data: PaymentGatewayConfig }> => {
  const response = await apiClient.patch<{ message: string; data: PaymentGatewayConfig }>(API_ENDPOINTS.ADMIN.PAYMENT_GATEWAYS.TOGGLE(gateway), { isEnabled });
  return response.data;
};

export const seedPaymentGateways = async (): Promise<{ message: string; created: string[]; skipped: string[] }> => {
  const response = await apiClient.post<{ message: string; created: string[]; skipped: string[] }>(API_ENDPOINTS.ADMIN.PAYMENT_GATEWAYS.SEED);
  return response.data;
};

// ============================================
// PAYGATE PROVIDERS Types & Functions
// ============================================

export interface PaygateProvider {
  id: string;
  name: string;
  code: string;
  description?: string;
  provider: string;
  sortOrder: number;
  isEnabled: boolean;
  minAmount: string;
  maxAmount: string;
  settings?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaygateProviderRequest {
  name: string;
  code: string;
  description?: string;
  provider: string;
  sortOrder?: number;
  isEnabled?: boolean;
  minAmount?: number;
  maxAmount?: number;
  settings?: Record<string, unknown>;
}

export interface UpdatePaygateProviderRequest {
  name?: string;
  description?: string;
  provider?: string;
  sortOrder?: number;
  isEnabled?: boolean;
  minAmount?: number;
  maxAmount?: number;
  settings?: Record<string, unknown>;
}

export interface PaygateProvidersResponse {
  data: PaygateProvider[];
  meta: {
    total: number;
    enabled: number;
  };
}

export const getPaygateProviders = async (params?: { isEnabled?: boolean }): Promise<PaygateProvidersResponse> => {
  const response = await apiClient.get<PaygateProvidersResponse>(API_ENDPOINTS.ADMIN.PAYGATE_PROVIDERS.ROOT, { params });
  return response.data;
};

export const getPaygateProvider = async (id: string): Promise<PaygateProvider> => {
  const response = await apiClient.get<PaygateProvider>(API_ENDPOINTS.ADMIN.PAYGATE_PROVIDERS.DETAIL(id));
  return response.data;
};

export const createPaygateProvider = async (data: CreatePaygateProviderRequest): Promise<{ message: string; data: PaygateProvider }> => {
  const response = await apiClient.post<{ message: string; data: PaygateProvider }>(API_ENDPOINTS.ADMIN.PAYGATE_PROVIDERS.ROOT, data);
  return response.data;
};

export const updatePaygateProvider = async (id: string, data: UpdatePaygateProviderRequest): Promise<{ message: string; data: PaygateProvider }> => {
  const response = await apiClient.patch<{ message: string; data: PaygateProvider }>(API_ENDPOINTS.ADMIN.PAYGATE_PROVIDERS.DETAIL(id), data);
  return response.data;
};

export const togglePaygateProvider = async (id: string, isEnabled: boolean): Promise<{ message: string; data: PaygateProvider }> => {
  const response = await apiClient.patch<{ message: string; data: PaygateProvider }>(API_ENDPOINTS.ADMIN.PAYGATE_PROVIDERS.TOGGLE(id), { isEnabled });
  return response.data;
};

export const deletePaygateProvider = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(API_ENDPOINTS.ADMIN.PAYGATE_PROVIDERS.DETAIL(id));
  return response.data;
};

export const reorderPaygateProviders = async (orderMap: { id: string; sortOrder: number }[]): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>(API_ENDPOINTS.ADMIN.PAYGATE_PROVIDERS.REORDER, orderMap);
  return response.data;
};

export const seedPaygateProviders = async (): Promise<{ message: string; created: string[]; skipped: string[] }> => {
  const response = await apiClient.post<{ message: string; created: string[]; skipped: string[] }>(API_ENDPOINTS.ADMIN.PAYGATE_PROVIDERS.SEED);
  return response.data;
};

// ============================================
// ADMIN WALLETS Types & Functions (for User Balances)
// ============================================

export interface AdminWallet {
  id: string;
  userId: string;
  user?: {
    id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  balance: string;
  currency: string;
  totalDeposited: string;
  totalSpent: string;
  totalRefunded: string;
  totalBonus: string;
  isLocked: boolean;
  lockedReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminWalletsResponse {
  data: AdminWallet[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreditDebitRequest {
  amount: number;
  description?: string;
}

export const getAdminWallets = async (params?: {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<AdminWalletsResponse> => {
  const response = await apiClient.get<AdminWalletsResponse>(API_ENDPOINTS.ADMIN.WALLETS.ROOT, { params });
  return response.data;
};

export const creditUserWallet = async (userId: string, data: CreditDebitRequest): Promise<{ message: string; wallet: AdminWallet }> => {
  const response = await apiClient.post<{ message: string; wallet: AdminWallet }>(API_ENDPOINTS.ADMIN.WALLETS.CREDIT(userId), data);
  return response.data;
};

export const debitUserWallet = async (userId: string, data: CreditDebitRequest): Promise<{ message: string; wallet: AdminWallet }> => {
  const response = await apiClient.post<{ message: string; wallet: AdminWallet }>(API_ENDPOINTS.ADMIN.WALLETS.DEBIT(userId), data);
  return response.data;
};

// ============================================
// SETTINGS Types & Functions (for Payment Guide)
// ============================================

export interface BulkSettingUpdate {
  key: string;
  value: string;
}

export const bulkUpdateSettings = async (settings: BulkSettingUpdate[]): Promise<{ message: string; updated: number }> => {
  const response = await apiClient.post<{ message: string; updated: number }>(API_ENDPOINTS.ADMIN.SETTINGS.BULK, { settings });
  return response.data;
};

export const getPaymentGuide = async (): Promise<{ title: string; content: string; updatedAt: string }> => {
  const response = await apiClient.get<{ title: string; content: string; updatedAt: string }>(API_ENDPOINTS.PUBLIC.PAYMENT_GUIDE);
  return response.data;
};
