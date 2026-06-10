import { apiClient } from '@/config/api-client.config';
import { API_ENDPOINTS } from '@/config/server.config';
import { uploadFile, uploadMultipleFiles, UploadResult } from './storageApi';

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
  message: string;
  category?: string;
  priority?: string;
  attachments?: UploadResult[];
}

export interface AddMessageRequest {
  message: string;
  attachments?: UploadResult[];
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
 * Create a new support ticket (with optional attachments)
 * 
 * Flow:
 * 1. If files provided, upload them first via /storage/upload
 * 2. Then create ticket with the uploaded attachment URLs
 * 
 * POST /api/v1/tickets
 */
export const createTicket = async (
  data: CreateTicketRequest,
  files?: File[],
): Promise<Ticket> => {
  let attachments: UploadResult[] | undefined;

  // Upload files first if provided
  if (files && files.length > 0) {
    attachments = await uploadMultipleFiles(files, 'tickets/pending');
  }

  // Create ticket with JSON payload
  const response = await apiClient.post<Ticket>(
    API_ENDPOINTS.TICKETS.ROOT,
    {
      subject: data.subject,
      message: data.message,
      category: data.category,
      priority: data.priority,
      attachments,
    },
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
 * Send a message on a ticket (with optional attachment)
 * 
 * Flow:
 * 1. If file provided, upload it first via /storage/upload
 * 2. Then send message with the uploaded attachment URL
 * 
 * POST /api/v1/tickets/:id/messages
 */
export const sendTicketMessage = async (
  ticketId: string,
  message: string,
  file?: File,
): Promise<TicketMessage> => {
  let attachments: UploadResult[] | undefined;

  // Upload file first if provided
  if (file) {
    const uploaded = await uploadFile(file, `tickets/${ticketId}`);
    attachments = [uploaded];
  }

  // Send message with JSON payload
  const response = await apiClient.post<TicketMessage>(
    API_ENDPOINTS.TICKETS.MESSAGES(ticketId),
    {
      message,
      attachments,
    },
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
