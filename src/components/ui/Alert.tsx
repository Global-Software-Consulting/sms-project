"use client";

import React from "react";
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from "lucide-react";

interface AlertProps {
  children: React.ReactNode;
  variant?: "info" | "success" | "warning" | "error";
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Alert Component - Following Design Guidelines
 * 
 * Specs:
 * - Padding: 16px
 * - Border radius: 12px
 * - Border: 1px solid with 30% opacity
 * - Background: semantic color at 10% opacity
 */
export const Alert: React.FC<AlertProps> = ({
  children,
  variant = "info",
  title,
  dismissible = false,
  onDismiss,
  className = "",
}) => {
  const variants = {
    info: {
      bg: "bg-info/10",
      border: "border-info/30",
      text: "text-info",
      icon: <Info className="w-5 h-5" />,
    },
    success: {
      bg: "bg-success/10",
      border: "border-success/30",
      text: "text-success",
      icon: <CheckCircle2 className="w-5 h-5" />,
    },
    warning: {
      bg: "bg-warning/10",
      border: "border-warning/30",
      text: "text-warning",
      icon: <AlertTriangle className="w-5 h-5" />,
    },
    error: {
      bg: "bg-danger/10",
      border: "border-danger/30",
      text: "text-danger",
      icon: <AlertCircle className="w-5 h-5" />,
    },
  };

  const style = variants[variant];

  return (
    <div
      className={`
        ${style.bg} ${style.border} border
        rounded-xl p-4
        ${className}
      `}
      role="alert"
    >
      <div className="flex gap-3">
        <div className={`flex-shrink-0 ${style.text}`}>{style.icon}</div>
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={`font-semibold ${style.text} mb-1 text-sm`}>{title}</h4>
          )}
          <div className={`text-sm ${style.text} opacity-90`}>{children}</div>
        </div>
        {dismissible && (
          <button
            onClick={onDismiss}
            className={`flex-shrink-0 ${style.text} hover:opacity-70 transition-opacity duration-150`}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
