/**
 * Centralized Error Handling Utilities
 *
 * This module provides consistent error handling across the application:
 * - Error message extraction from various error types
 * - User-friendly error messages for HTTP status codes
 * - Network error handling
 * - API error type definitions
 */

import { AxiosError } from 'axios';

// ============================================
// Error Types
// ============================================

/**
 * Standard API error response from backend
 */
export interface ApiError {
  message: string | string[];
  error?: string;
  statusCode: number;
}

/**
 * Application error with additional context
 */
export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
  field?: string; // For form field-specific errors
  details?: Record<string, unknown>;
}

// ============================================
// Error Code Constants
// ============================================

export const ErrorCodes = {
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',

  // Auth errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  UNAUTHORIZED: 'UNAUTHORIZED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',

  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',

  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',

  // Rate limiting
  RATE_LIMITED: 'RATE_LIMITED',

  // Server errors
  SERVER_ERROR: 'SERVER_ERROR',

  // Unknown
  UNKNOWN: 'UNKNOWN',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

// ============================================
// User-Friendly Error Messages
// ============================================

/**
 * Default user-friendly messages for HTTP status codes
 */
const HTTP_STATUS_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your input and try again.',
  401: 'Your session has expired. Please log in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'This action conflicts with existing data. Please refresh and try again.',
  422: 'The provided data is invalid. Please check your input.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'An unexpected server error occurred. Please try again later.',
  502: 'The server is temporarily unavailable. Please try again later.',
  503: 'The service is currently unavailable. Please try again later.',
  504: 'The request timed out. Please try again.',
};

/**
 * Context-specific error messages for different operations
 */
export const ErrorMessages = {
  // Auth
  login: {
    401: 'Invalid email or password. Please check your credentials.',
    403: 'Your account has been suspended. Please contact support.',
    429: 'Too many login attempts. Please wait a few minutes and try again.',
  },
  register: {
    409: 'This email is already registered. Please use a different email or try logging in.',
    422: 'Please check your registration details and try again.',
  },

  // Wallet
  wallet: {
    400: 'Invalid transaction. Please check the amount and try again.',
    402: 'Insufficient balance for this transaction.',
    404: 'Wallet not found. Please contact support.',
  },

  // Payments
  payment: {
    400: 'Invalid payment details. Please check and try again.',
    402: 'Payment failed. Please try a different payment method.',
    409: 'This payment has already been processed.',
  },

  // API Keys
  apiKeys: {
    400: 'Invalid API key configuration.',
    403: 'You have reached the maximum number of API keys (3).',
    404: 'API key not found.',
  },

  // Membership
  membership: {
    400: 'Invalid membership operation.',
    402: 'Insufficient balance to purchase this plan.',
    409: 'You already have an active subscription to this plan.',
  },

  // Users
  users: {
    404: 'User not found.',
    409: 'This username or email is already taken.',
  },

  // Network
  network: {
    offline: 'You appear to be offline. Please check your internet connection.',
    timeout: 'The request timed out. Please try again.',
    serverDown: 'Unable to connect to the server. Please try again later.',
  },

  // Generic
  generic: {
    unknown: 'An unexpected error occurred. Please try again.',
    retry: 'Something went wrong. Please try again.',
  },
} as const;

// ============================================
// Error Extraction Functions
// ============================================

/**
 * Extract error message from various error types
 * @param error - The error object
 * @param context - Optional context for more specific error messages (e.g., 'login', 'payment')
 */
export function getErrorMessage(
  error: unknown,
  context?: keyof typeof ErrorMessages,
): string {
  // Handle Axios errors (API responses)
  if (error instanceof AxiosError) {
    return extractAxiosError(error, context);
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return error.message || ErrorMessages.generic.unknown;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Handle AppError objects
  if (isAppError(error)) {
    return error.message;
  }

  return ErrorMessages.generic.unknown;
}

/**
 * Extract error from Axios error response
 */
function extractAxiosError(
  error: AxiosError,
  context?: keyof typeof ErrorMessages,
): string {
  const status = error.response?.status;
  const apiError = error.response?.data as ApiError | undefined;

  // First, try to get the message from the API response
  if (apiError?.message) {
    const message = Array.isArray(apiError.message)
      ? apiError.message[0]
      : apiError.message;
    return message;
  }

  // Check for context-specific messages
  if (context && status) {
    const contextMessages = ErrorMessages[context] as
      | Record<number, string>
      | undefined;
    if (contextMessages && contextMessages[status]) {
      return contextMessages[status];
    }
  }

  // Fall back to generic HTTP status messages
  if (status && HTTP_STATUS_MESSAGES[status]) {
    return HTTP_STATUS_MESSAGES[status];
  }

  // Handle network errors
  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    return ErrorMessages.network.serverDown;
  }

  if (error.code === 'ECONNABORTED') {
    return ErrorMessages.network.timeout;
  }

  return error.message || ErrorMessages.generic.unknown;
}

/**
 * Get error code from error
 */
export function getErrorCode(error: unknown): ErrorCode {
  if (error instanceof AxiosError) {
    const status = error.response?.status;

    if (error.code === 'ERR_NETWORK') return ErrorCodes.NETWORK_ERROR;
    if (error.code === 'ECONNABORTED') return ErrorCodes.TIMEOUT;

    switch (status) {
      case 400:
        return ErrorCodes.VALIDATION_ERROR;
      case 401:
        return ErrorCodes.UNAUTHORIZED;
      case 403:
        return ErrorCodes.UNAUTHORIZED;
      case 404:
        return ErrorCodes.NOT_FOUND;
      case 409:
        return ErrorCodes.CONFLICT;
      case 422:
        return ErrorCodes.VALIDATION_ERROR;
      case 429:
        return ErrorCodes.RATE_LIMITED;
      case 500:
      case 502:
      case 503:
      case 504:
        return ErrorCodes.SERVER_ERROR;
      default:
        return ErrorCodes.UNKNOWN;
    }
  }

  return ErrorCodes.UNKNOWN;
}

/**
 * Check if error is an AppError
 */
function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as AppError).message === 'string'
  );
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return (
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNABORTED' ||
      error.message === 'Network Error' ||
      !error.response
    );
  }
  return false;
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return error.response?.status === 401 || error.response?.status === 403;
  }
  return false;
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return error.response?.status === 400 || error.response?.status === 422;
  }
  return false;
}

/**
 * Check if error is a rate limit error
 */
export function isRateLimitError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return error.response?.status === 429;
  }
  return false;
}

/**
 * Check if error is a server error
 */
export function isServerError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    return status !== undefined && status >= 500;
  }
  return false;
}

/**
 * Extract validation errors from API response
 * Returns a map of field names to error messages
 */
export function extractValidationErrors(
  error: unknown,
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiError | undefined;

    if (apiError?.message) {
      if (Array.isArray(apiError.message)) {
        // Parse validation messages like "email must be an email"
        apiError.message.forEach((msg) => {
          const match = msg.match(/^(\w+)\s+(.+)$/);
          if (match) {
            errors[match[1]] = msg;
          } else {
            errors['_general'] = msg;
          }
        });
      } else {
        errors['_general'] = apiError.message;
      }
    }
  }

  return errors;
}

/**
 * Create a user-friendly error message for display
 */
export function createUserFriendlyError(
  error: unknown,
  context?: keyof typeof ErrorMessages,
): AppError {
  const message = getErrorMessage(error, context);
  const code = getErrorCode(error);

  let statusCode: number | undefined;
  if (error instanceof AxiosError) {
    statusCode = error.response?.status;
  }

  return {
    message,
    code,
    statusCode,
  };
}

// ============================================
// Error Logging (for development/debugging)
// ============================================

/**
 * Log error details for debugging (only in development)
 */
export function logError(error: unknown, context?: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🔴 Error${context ? ` [${context}]` : ''}`);

    if (error instanceof AxiosError) {
      console.log('Status:', error.response?.status);
      console.log('URL:', error.config?.url);
      console.log('Method:', error.config?.method?.toUpperCase());
      console.log('Response:', error.response?.data);
    } else if (error instanceof Error) {
      console.log('Message:', error.message);
      console.log('Stack:', error.stack);
    } else {
      console.log('Error:', error);
    }

    console.groupEnd();
  }
}
