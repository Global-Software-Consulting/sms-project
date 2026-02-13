"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * Input Component - Following Design Guidelines
 * 
 * Specs:
 * - Height: 44px
 * - Padding: 12px 16px
 * - Font size: 16px
 * - Border radius: 12px
 * - Icon spacing: 16px from edge, 12px gap to text
 * - Label to input gap: 8px
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      success,
      hint,
      leftIcon,
      rightIcon,
      type = "text",
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    const getStateStyles = () => {
      if (error) {
        return "border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]";
      }
      if (success) {
        return "border-success focus:border-success focus:shadow-[0_0_0_3px_rgba(16,185,129,0.15)]";
      }
      return "border-border-default focus:border-border-focus focus:shadow-[0_0_0_3px_rgba(198,167,94,0.15)]";
    };

    return (
      <div className="w-full flex flex-col gap-2">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-text-primary"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none flex items-center justify-center w-5 h-5">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={`
              w-full h-11 
              py-3
              ${leftIcon ? "pl-12" : "pl-4"}
              ${rightIcon || isPassword ? "pr-12" : "pr-4"}
              text-base text-text-primary
              bg-bg-secondary
              border ${getStateStyles()}
              rounded-xl
              placeholder:text-text-muted
              focus:outline-none
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              ${className}
            `}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors duration-150 flex items-center justify-center w-5 h-5"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          )}
          {rightIcon && !isPassword && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none flex items-center justify-center w-5 h-5">
              {rightIcon}
            </div>
          )}
        </div>
        {(error || success || hint) && (
          <p
            className={`text-xs mt-1 ${
              error
                ? "text-danger"
                : success
                ? "text-success"
                : "text-text-muted"
            }`}
          >
            {error || success || hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
