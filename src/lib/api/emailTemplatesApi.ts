import { apiClient } from '@/config/api-client.config';
import { API_ENDPOINTS } from '@/config/server.config';

// ============================================
// Email Template Types
// ============================================

export interface EmailTemplate {
  id: string;
  type: string;
  name: string;
  description?: string;
  subject: string;
  bodyHtml: string;
  variables: string[];
  sampleData?: Record<string, string | number>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmailTemplateListResponse {
  templates: EmailTemplate[];
  total: number;
}

export interface UpdateEmailTemplateRequest {
  subject?: string;
  bodyHtml?: string;
  sampleData?: Record<string, string | number>;
  isActive?: boolean;
}

export interface PreviewEmailTemplateRequest {
  customData?: Record<string, string | number>;
}

export interface PreviewEmailTemplateResponse {
  subject: string;
  bodyHtml: string;
  usedData: Record<string, string | number>;
}

export interface SendTestEmailRequest {
  testEmail: string;
  customData?: Record<string, string | number>;
}

export interface SendTestEmailResponse {
  success: boolean;
  message: string;
  sentTo?: string;
}

export interface DefaultTemplateInfo {
  type: string;
  name: string;
  description: string;
}

// ============================================
// Email Templates API Functions
// ============================================

/**
 * Get all email templates
 * GET /api/v1/admin/email-templates
 */
export const getAllEmailTemplates = async (): Promise<EmailTemplateListResponse> => {
  const response = await apiClient.get<EmailTemplateListResponse>(
    API_ENDPOINTS.ADMIN.EMAIL_TEMPLATES.ROOT
  );
  return response.data;
};

/**
 * Get email template by ID
 * GET /api/v1/admin/email-templates/:id
 */
export const getEmailTemplateById = async (id: string): Promise<EmailTemplate> => {
  const response = await apiClient.get<EmailTemplate>(
    API_ENDPOINTS.ADMIN.EMAIL_TEMPLATES.DETAIL(id)
  );
  return response.data;
};

/**
 * Update email template
 * PUT /api/v1/admin/email-templates/:id
 */
export const updateEmailTemplate = async (
  id: string,
  data: UpdateEmailTemplateRequest
): Promise<EmailTemplate> => {
  const response = await apiClient.put<EmailTemplate>(
    API_ENDPOINTS.ADMIN.EMAIL_TEMPLATES.DETAIL(id),
    data
  );
  return response.data;
};

/**
 * Reset email template to default
 * POST /api/v1/admin/email-templates/:id/reset
 */
export const resetEmailTemplate = async (id: string): Promise<EmailTemplate> => {
  const response = await apiClient.post<EmailTemplate>(
    API_ENDPOINTS.ADMIN.EMAIL_TEMPLATES.RESET(id)
  );
  return response.data;
};

/**
 * Preview email template with variables replaced
 * POST /api/v1/admin/email-templates/:id/preview
 */
export const previewEmailTemplate = async (
  id: string,
  data?: PreviewEmailTemplateRequest
): Promise<PreviewEmailTemplateResponse> => {
  const response = await apiClient.post<PreviewEmailTemplateResponse>(
    API_ENDPOINTS.ADMIN.EMAIL_TEMPLATES.PREVIEW(id),
    data || {}
  );
  return response.data;
};

/**
 * Send test email
 * POST /api/v1/admin/email-templates/:id/send-test
 */
export const sendTestEmail = async (
  id: string,
  data: SendTestEmailRequest
): Promise<SendTestEmailResponse> => {
  const response = await apiClient.post<SendTestEmailResponse>(
    API_ENDPOINTS.ADMIN.EMAIL_TEMPLATES.SEND_TEST(id),
    data
  );
  return response.data;
};

/**
 * Get default templates info list
 * GET /api/v1/admin/email-templates/defaults/list
 */
export const getDefaultTemplatesList = async (): Promise<DefaultTemplateInfo[]> => {
  const response = await apiClient.get<DefaultTemplateInfo[]>(
    API_ENDPOINTS.ADMIN.EMAIL_TEMPLATES.DEFAULTS
  );
  return response.data;
};

// ============================================
// Helper Functions
// ============================================

/**
 * Get template type label from type code
 */
export const getTemplateTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    WELCOME: 'Welcome Email',
    OTP_LOGIN: 'Login OTP',
    OTP_REGISTER: 'Registration OTP',
    OTP_PASSWORD_RESET: 'Password Reset OTP',
    OTP_GUEST_LOGIN: 'Guest Login OTP',
    OTP_VERIFY_EMAIL: 'Email Verification OTP',
    PAYMENT_SUCCESS: 'Payment Success',
    PAYMENT_FAILED: 'Payment Failed',
    SMS_RECEIVED: 'SMS Received',
    MEMBERSHIP_SUBSCRIBED: 'Membership Activated',
    MEMBERSHIP_EXPIRING: 'Membership Expiring',
    MEMBERSHIP_EXPIRED: 'Membership Expired',
    REFERRAL_SIGNUP: 'Referral Signup',
    REFERRAL_COMMISSION: 'Referral Commission',
    REFERRAL_PAYOUT: 'Referral Payout',
    TICKET_REPLY: 'Ticket Reply',
    TICKET_STATUS: 'Ticket Status Update',
  };
  return labels[type] || type;
};

/**
 * Get template category from type
 */
export const getTemplateCategory = (type: string): string => {
  if (type.startsWith('OTP_')) return 'Authentication';
  if (type.startsWith('PAYMENT_')) return 'Payments';
  if (type.startsWith('MEMBERSHIP_')) return 'Membership';
  if (type.startsWith('REFERRAL_')) return 'Referrals';
  if (type.startsWith('TICKET_')) return 'Support';
  if (type === 'WELCOME') return 'User';
  if (type === 'SMS_RECEIVED') return 'Orders';
  return 'Other';
};

/**
 * Group templates by category
 */
export const groupTemplatesByCategory = (
  templates: EmailTemplate[]
): Record<string, EmailTemplate[]> => {
  const grouped: Record<string, EmailTemplate[]> = {};

  templates.forEach((template) => {
    const category = getTemplateCategory(template.type);
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(template);
  });

  return grouped;
};
