'use client';

import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  ReactNode,
} from 'react';
import { ToastContainer, ToastData } from '@/components/ui/Toast';

// ============================================
// Toast Context Types
// ============================================

interface ToastContextValue {
  /** Add a toast notification */
  addToast: (toast: Omit<ToastData, 'id'>) => string;
  /** Remove a specific toast */
  removeToast: (id: string) => void;
  /** Clear all toasts */
  clearToasts: () => void;
  /** Show success toast */
  success: (message: string, title?: string) => string;
  /** Show error toast */
  error: (message: string, title?: string) => string;
  /** Show warning toast */
  warning: (message: string, title?: string) => string;
  /** Show info toast */
  info: (message: string, title?: string) => string;
}

// ============================================
// Toast Context
// ============================================

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

// ============================================
// Toast Provider
// ============================================

let toastIdCounter = 0;

interface ToastProviderProps {
  children: ReactNode;
  position?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top-center'
    | 'bottom-center';
  maxToasts?: number;
}

export function ToastProvider({
  children,
  position = 'top-right',
  maxToasts = 5,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback(
    (toast: Omit<ToastData, 'id'>) => {
      const id = `toast-${++toastIdCounter}-${Date.now()}`;
      setToasts((prev) => {
        const newToasts = [...prev, { ...toast, id }];
        // Limit number of toasts
        if (newToasts.length > maxToasts) {
          return newToasts.slice(-maxToasts);
        }
        return newToasts;
      });
      return id;
    },
    [maxToasts],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const success = useCallback(
    (message: string, title?: string) => {
      return addToast({
        type: 'success',
        message,
        title,
        duration: 4000,
      });
    },
    [addToast],
  );

  const error = useCallback(
    (message: string, title?: string) => {
      return addToast({
        type: 'error',
        message,
        title: title || 'Error',
        duration: 7000, // Errors stay longer
      });
    },
    [addToast],
  );

  const warning = useCallback(
    (message: string, title?: string) => {
      return addToast({
        type: 'warning',
        message,
        title,
        duration: 5000,
      });
    },
    [addToast],
  );

  const info = useCallback(
    (message: string, title?: string) => {
      return addToast({
        type: 'info',
        message,
        title,
        duration: 4000,
      });
    },
    [addToast],
  );

  const value: ToastContextValue = {
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer
        toasts={toasts}
        onDismiss={removeToast}
        position={position}
      />
    </ToastContext.Provider>
  );
}

// ============================================
// useToast Hook
// ============================================

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default ToastContext;
