'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

// ============================================
// Toast Types
// ============================================

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number; // ms, 0 = no auto-dismiss
  dismissible?: boolean;
}

interface ToastProps extends ToastData {
  onDismiss: (id: string) => void;
}

// ============================================
// Toast Component
// ============================================

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  dismissible = true,
  onDismiss,
}) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onDismiss(id), 200); // Wait for exit animation
  }, [id, onDismiss]);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(handleDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, handleDismiss]);

  const icons = {
    success: <CheckCircle className="text-success h-5 w-5" />,
    error: <AlertCircle className="text-danger h-5 w-5" />,
    warning: <AlertTriangle className="text-warning h-5 w-5" />,
    info: <Info className="text-info h-5 w-5" />,
  };

  const bgColors = {
    success: 'bg-success/10 border-success/20',
    error: 'bg-danger/10 border-danger/20',
    warning: 'bg-warning/10 border-warning/20',
    info: 'bg-info/10 border-info/20',
  };

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border p-4 shadow-lg backdrop-blur-sm ${bgColors[type]} ${isExiting ? 'animate-slide-out-right' : 'animate-slide-in-right'} transition-all duration-200`}
      role="alert"
      style={{ minWidth: '320px', maxWidth: '420px' }}
    >
      <div className="mt-0.5 flex-shrink-0">{icons[type]}</div>
      <div className="min-w-0 flex-1">
        {title && (
          <p className="text-text-primary mb-1 text-sm font-semibold">
            {title}
          </p>
        )}
        <p className="text-text-secondary text-sm">{message}</p>
      </div>
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="hover:bg-bg-hover flex-shrink-0 rounded-lg p-1 transition-colors"
          aria-label="Dismiss"
        >
          <X className="text-text-muted h-4 w-4" />
        </button>
      )}
    </div>
  );
};

// ============================================
// Toast Container Component
// ============================================

interface ToastContainerProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
  position?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top-center'
    | 'bottom-center';
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss,
  position = 'top-right',
}) => {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  };

  if (toasts.length === 0) return null;

  return (
    <div
      className={`fixed z-50 flex flex-col gap-3 ${positionClasses[position]}`}
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

export default Toast;
