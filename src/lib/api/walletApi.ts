import { apiClient } from './config';

// ============================================
// Enums matching backend
// ============================================

export type TransactionType = 
  | 'DEPOSIT'      // Add funds from payment gateway
  | 'PURCHASE'     // Buy SMS/service
  | 'REFUND'       // Refund for failed service
  | 'BONUS'        // Admin promotional credit
  | 'ADJUSTMENT'   // Admin manual correction
  | 'WITHDRAW';    // User withdrawal (if allowed)

export type TransactionStatus = 
  | 'PENDING'      // Awaiting confirmation
  | 'COMPLETED'    // Successfully processed
  | 'FAILED'       // Transaction failed
  | 'CANCELLED'    // Cancelled
  | 'REVERSED';    // Reversed/refunded

// ============================================
// Types matching backend DTOs
// ============================================

/**
 * Full wallet information
 */
export interface Wallet {
  id: string;
  userId: string;
  balance: string;           // Decimal as string (e.g., "150.50")
  currency: string;          // Default: USD
  totalDeposited: string;    // Lifetime deposits
  totalSpent: string;        // Lifetime spending
  totalRefunded: string;     // Lifetime refunds
  totalBonus: string;        // Lifetime bonus received
  isLocked: boolean;         // Is wallet locked?
  lockedAt: string | null;   // When locked
  lockedReason: string | null; // Why locked
  createdAt: string;
  updatedAt: string;
}

/**
 * Lightweight balance response
 */
export interface WalletBalance {
  balance: string;
  currency: string;
  isLocked: boolean;
}

/**
 * Single transaction record
 */
export interface WalletTransaction {
  id: string;
  walletId: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: string;            // Amount (+/-)
  balanceBefore: string;     // Balance before transaction
  balanceAfter: string;      // Balance after transaction
  referenceType: string | null;  // Related entity type (e.g., "PAYMENT", "ORDER")
  referenceId: string | null;    // Related entity ID
  description: string | null;
  metadata: Record<string, unknown> | null;
  performedBy: string | null;    // Admin ID (if admin action)
  createdAt: string;
  completedAt: string | null;
}

/**
 * Paginated response for transactions
 */
export interface TransactionListResponse {
  data: WalletTransaction[];
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
 * Query parameters for transaction list
 */
export interface TransactionQueryParams {
  type?: TransactionType;
  status?: TransactionStatus;
  fromDate?: string;         // YYYY-MM-DD
  toDate?: string;           // YYYY-MM-DD
  page?: number;             // Default: 1
  limit?: number;            // Default: 20, max: 100
}

// ============================================
// API Functions
// ============================================

/**
 * Get full wallet information
 * GET /api/v1/wallet
 */
export const getWallet = async (): Promise<Wallet> => {
  const response = await apiClient.get<Wallet>('/wallet');
  return response.data;
};

/**
 * Get wallet balance only (lightweight)
 * GET /api/v1/wallet/balance
 */
export const getWalletBalance = async (): Promise<WalletBalance> => {
  const response = await apiClient.get<WalletBalance>('/wallet/balance');
  return response.data;
};

/**
 * Get transaction history with filters
 * GET /api/v1/wallet/transactions
 */
export const getTransactions = async (params?: TransactionQueryParams): Promise<TransactionListResponse> => {
  const response = await apiClient.get<TransactionListResponse>('/wallet/transactions', { params });
  return response.data;
};

/**
 * Get single transaction by ID
 * GET /api/v1/wallet/transactions/:id
 */
export const getTransaction = async (id: string): Promise<WalletTransaction> => {
  const response = await apiClient.get<WalletTransaction>(`/wallet/transactions/${id}`);
  return response.data;
};

// ============================================
// Helper Functions
// ============================================

/**
 * Format balance for display
 */
export const formatBalance = (balance: string, currency: string = 'USD'): string => {
  const num = parseFloat(balance);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(num);
};

/**
 * Get transaction type display label
 */
export const getTransactionTypeLabel = (type: TransactionType): string => {
  const labels: Record<TransactionType, string> = {
    DEPOSIT: 'Deposit',
    PURCHASE: 'Purchase',
    REFUND: 'Refund',
    BONUS: 'Bonus',
    ADJUSTMENT: 'Adjustment',
    WITHDRAW: 'Withdrawal',
  };
  return labels[type] || type;
};

/**
 * Get transaction type color
 */
export const getTransactionTypeColor = (type: TransactionType): string => {
  const colors: Record<TransactionType, string> = {
    DEPOSIT: 'var(--success)',
    PURCHASE: 'var(--text-primary)',
    REFUND: 'var(--info)',
    BONUS: 'var(--accent-gold)',
    ADJUSTMENT: 'var(--warning)',
    WITHDRAW: 'var(--danger)',
  };
  return colors[type] || 'var(--text-secondary)';
};

/**
 * Get transaction status color
 */
export const getTransactionStatusColor = (status: TransactionStatus): string => {
  const colors: Record<TransactionStatus, string> = {
    PENDING: 'var(--warning)',
    COMPLETED: 'var(--success)',
    FAILED: 'var(--danger)',
    CANCELLED: 'var(--text-muted)',
    REVERSED: 'var(--info)',
  };
  return colors[status] || 'var(--text-secondary)';
};

/**
 * Check if transaction is positive (adds to balance)
 */
export const isPositiveTransaction = (type: TransactionType): boolean => {
  return ['DEPOSIT', 'REFUND', 'BONUS'].includes(type);
};

