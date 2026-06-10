import { apiClient } from '@/config/api-client.config';
import { API_ENDPOINTS } from '@/config/server.config';

// ============================================
// Types
// ============================================

export type ContactStatus = 'NEW' | 'READ' | 'REPLIED' | 'ARCHIVED' | 'OPEN' | 'CLOSED';

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactStatus;
  priority: string;
  replyMessage: string | null;
  repliedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContactStats {
  total: number;
  new: number;
  read: number;
  replied: number;
  archived: number;
}

export interface ContactQueryParams {
  status?: ContactStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ContactsResponse {
  data: ContactSubmission[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ============================================
// API Functions
// ============================================

export const getAdminContacts = async (
  params?: ContactQueryParams,
): Promise<ContactsResponse> => {
  const response = await apiClient.get<ContactsResponse>(
    API_ENDPOINTS.ADMIN.CONTACT.ROOT,
    { params },
  );
  return response.data;
};

export const getAdminContactStats = async (): Promise<ContactStats> => {
  const response = await apiClient.get<ContactStats>(
    API_ENDPOINTS.ADMIN.CONTACT.STATS,
  );
  return response.data;
};

export const getAdminContactDetail = async (id: string): Promise<ContactSubmission> => {
  const response = await apiClient.get<ContactSubmission>(
    API_ENDPOINTS.ADMIN.CONTACT.DETAIL(id),
  );
  return response.data;
};

export const markContactRead = async (id: string): Promise<ContactSubmission> => {
  const response = await apiClient.post<ContactSubmission>(
    API_ENDPOINTS.ADMIN.CONTACT.READ(id),
  );
  return response.data;
};

export const replyToContact = async (
  id: string,
  replyMessage: string,
): Promise<ContactSubmission> => {
  const response = await apiClient.post<ContactSubmission>(
    API_ENDPOINTS.ADMIN.CONTACT.REPLY(id),
    { replyMessage },
  );
  return response.data;
};

export const archiveContact = async (id: string): Promise<ContactSubmission> => {
  const response = await apiClient.post<ContactSubmission>(
    API_ENDPOINTS.ADMIN.CONTACT.ARCHIVE(id),
  );
  return response.data;
};

export const deleteContact = async (id: string): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.ADMIN.CONTACT.DETAIL(id));
};