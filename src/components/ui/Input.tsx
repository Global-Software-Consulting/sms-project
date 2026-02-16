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
 * Specs from design-guidelines.md:
 * - Height: 48px (increased for better touch target)
 * - Padding: 12px 16px
 * - Left icon: 16px from edge, 20px size, 12px gap to text
 * - Right icon: 16px from edge, 20px size, 12px gap to text
 * - Total left padding with icon: 48px (16px + 20px + 12px)
 * - Total right padding with icon: 48px (16px + 20px + 12px)
 * - Font size: 16px
 * - Border radius: 12px
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
          {/* Left Icon - 16px from edge, centered vertically */}
          {leftIcon && (
            <div 
              className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ width: '20px', height: '20px' }}
            >
              <div className="w-5 h-5 text-text-muted flex items-center justify-center">
                {leftIcon}
              </div>
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={`
              w-full h-12
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
            style={{
              paddingTop: '12px',
              paddingBottom: '12px',
              paddingLeft: leftIcon ? '48px' : '16px',      // 16px + 20px icon + 12px gap = 48px
              paddingRight: (rightIcon || isPassword) ? '48px' : '16px',
            }}
            {...props}
          />
          {/* Password Toggle Icon */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted hover:text-text-primary transition-colors duration-150 flex items-center justify-center"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          )}
          {/* Right Icon (non-password) - 16px from edge */}
          {rightIcon && !isPassword && (
            <div 
              className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ width: '20px', height: '20px' }}
            >
              <div className="w-5 h-5 text-text-muted flex items-center justify-center">
                {rightIcon}
              </div>
            </div>
          )}
        </div>
        {/* Helper text - error, success, or hint */}
        {(error || success || hint) && (
          <p
            className={`text-xs ${
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
