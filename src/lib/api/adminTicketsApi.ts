import { apiClient } from '@/config/api-client.config';
import { API_ENDPOINTS } from '@/config/server.config';
import type { TicketStatus, TicketPriority, TicketCategory, TicketMessage } from './ticketsApi';

// ============================================
// Types
// ============================================

export interface AdminTicketStats {
  totalTickets: number;
  openTickets: number;
  pendingTickets: number;
  resolvedTickets: number;
  avgResponseTime: number;
  ticketsByPriority: Record<string, number>;
}

export interface AdminTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo: string | null;
  assignedToName: string | null;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  lastReplyAt: string | null;
  responses: number;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    username: string | null;
  };
}

export interface AdminTicketsResponse {
  data: AdminTicket[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AdminTicketQueryParams {
  page?: number;
  limit?: number;
  status?: TicketStatus;
  priority?: TicketPriority;
}

export interface AdminTicketDetailResponse {
  ticket: AdminTicket;
  messages: TicketMessage[];
}

export interface UpdateTicketRequest {
  status?: TicketStatus;
  priority?: TicketPriority;
  assignedTo?: string;
  internalNote?: string;
}

export interface ReplyTicketRequest {
  message: string;
}

// ============================================
// API Functions
// ============================================

export const getAdminTicketStats = async (): Promise<AdminTicketStats> => {
  const response = await apiClient.get<AdminTicketStats>(
    API_ENDPOINTS.ADMIN.TICKETS.STATS,
  );
  return response.data;
};

export const getAdminTickets = async (
  params?: AdminTicketQueryParams,
): Promise<AdminTicketsResponse> => {
  const response = await apiClient.get<AdminTicketsResponse>(
    API_ENDPOINTS.ADMIN.TICKETS.ROOT,
    { params },
  );
  return response.data;
};

export const getAdminTicketDetail = async (
  id: string,
): Promise<AdminTicketDetailResponse> => {
  const response = await apiClient.get<AdminTicketDetailResponse>(
    API_ENDPOINTS.ADMIN.TICKETS.DETAIL(id),
  );
  return response.data;
};

export const updateAdminTicket = async (
  id: string,
  data: UpdateTicketRequest,
): Promise<AdminTicket> => {
  const response = await apiClient.patch<AdminTicket>(
    API_ENDPOINTS.ADMIN.TICKETS.DETAIL(id),
    data,
  );
  return response.data;
};

export const replyToTicket = async (
  id: string,
  data: ReplyTicketRequest,
): Promise<TicketMessage> => {
  const response = await apiClient.post<TicketMessage>(
    API_ENDPOINTS.ADMIN.TICKETS.REPLY(id),
    data,
  );
  return response.data;
};