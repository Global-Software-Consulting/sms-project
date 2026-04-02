import { apiClient } from '@/config/api-client.config';
import { API_ENDPOINTS } from '@/config/server.config';

// ============================================
// Types
// ============================================

export type TicketStatus =
  | 'OPEN'
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'WAITING_CUSTOMER'
  | 'RESOLVED'
  | 'CLOSED';

export type TicketCategory =
  | 'PAYMENT'
  | 'ORDER'
  | 'ACCOUNT'
  | 'TECHNICAL'
  | 'BILLING'
  | 'REFUND'
  | 'OTHER';

export type TicketPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface Ticket {
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
  user: Record<string, unknown>;
}

export interface TicketAttachment {
  key: string;
  url: string;
  originalName: string;
  size: number;
  mimeType: string;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  message: string;
  imageUrl: string | null;
  attachments?: TicketAttachment[];
  isStaff: boolean;
  senderName: string;
  staffName?: string;
  createdAt: string;
}

export interface TicketsResponse {
  tickets: Ticket[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TicketDetailResponse {
  ticket: Ticket;
  messages: TicketMessage[];
}

export interface TicketQueryParams {
  page?: number;
  limit?: number;
  status?: TicketStatus;
  category?: TicketCategory;
  priority?: TicketPriority;
}

export interface CreateTicketRequest {
  subject: string;
  priority: string;
  message: string;
}

// ============================================
// API Functions
// ============================================

/**
 * Get list of user's tickets
 * GET /api/v1/tickets
 */
export const getTickets = async (
  params?: TicketQueryParams,
): Promise<TicketsResponse> => {
  const response = await apiClient.get<TicketsResponse>(
    API_ENDPOINTS.TICKETS.ROOT,
    { params },
  );
  return response.data;
};

/**
 * Create a new support ticket (with optional image)
 * POST /api/v1/tickets
 */
export const createTicket = async (
  data: CreateTicketRequest,
  image?: File,
): Promise<Ticket> => {
  if (image) {
    const formData = new FormData();
    formData.append('subject', data.subject);
    formData.append('priority', data.priority);
    formData.append('message', data.message);
    formData.append('attachments', image);
    const response = await apiClient.post<Ticket>(
      API_ENDPOINTS.TICKETS.ROOT,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data;
  }
  const response = await apiClient.post<Ticket>(
    API_ENDPOINTS.TICKETS.ROOT,
    data,
  );
  return response.data;
};

/**
 * Get ticket detail with messages
 * GET /api/v1/tickets/:id
 */
export const getTicketDetail = async (
  id: string,
): Promise<TicketDetailResponse> => {
  const response = await apiClient.get<TicketDetailResponse>(
    API_ENDPOINTS.TICKETS.DETAIL(id),
  );
  return response.data;
};

/**
 * Send a message on a ticket
 * POST /api/v1/tickets/:id/messages
 */
export const sendTicketMessage = async (
  ticketId: string,
  message: string,
  image?: File,
): Promise<TicketMessage> => {
  if (image) {
    const formData = new FormData();
    formData.append('message', message);
    formData.append('attachments', image);
    const response = await apiClient.post<TicketMessage>(
      API_ENDPOINTS.TICKETS.MESSAGES(ticketId),
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data;
  }
  const response = await apiClient.post<TicketMessage>(
    API_ENDPOINTS.TICKETS.MESSAGES(ticketId),
    { message },
  );
  return response.data;
};

// ============================================
// Helpers
// ============================================

export const getTicketStatusLabel = (status: TicketStatus): string => {
  const labels: Record<TicketStatus, string> = {
    OPEN: 'Open',
    PENDING: 'Pending',
    IN_PROGRESS: 'In Progress',
    WAITING_CUSTOMER: 'Waiting',
    RESOLVED: 'Resolved',
    CLOSED: 'Closed',
  };
  return labels[status] || status;
};

export const getTicketStatusVariant = (
  status: TicketStatus,
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  const variants: Record<TicketStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    OPEN: 'default',
    PENDING: 'outline',
    IN_PROGRESS: 'default',
    WAITING_CUSTOMER: 'secondary',
    RESOLVED: 'secondary',
    CLOSED: 'outline',
  };
  return variants[status] || 'secondary';
};

export const getTicketPriorityVariant = (
  priority: TicketPriority,
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  const variants: Record<TicketPriority, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    LOW: 'outline',
    NORMAL: 'secondary',
    HIGH: 'destructive',
    URGENT: 'destructive',
  };
  return variants[priority] || 'secondary';
};
