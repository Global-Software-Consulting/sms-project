"use client";

import React, { useId } from "react";
import { Check } from "lucide-react";

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string | React.ReactNode;
  error?: string;
}

/**
 * Checkbox Component - Following Design Guidelines
 * 
 * Specs:
 * - Size: 20px × 20px
 * - Border radius: 6px
 * - Checked: accent-gold background
 * - Focus: 2px gold outline
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    // Use React's useId hook to generate stable IDs that match between server and client
    const generatedId = useId();
    const checkboxId = id || `checkbox-${generatedId}`;

    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={checkboxId}
          className={`flex items-start gap-3 cursor-pointer group ${className}`}
        >
          <div className="relative flex-shrink-0 mt-0.5">
            <input
              ref={ref}
              type="checkbox"
              id={checkboxId}
              className="peer sr-only"
              {...props}
            />
            <div
              className={`
                w-5 h-5 rounded-md border-2
                ${error ? "border-danger" : "border-border-default"}
                bg-bg-secondary
                peer-checked:bg-accent-gold peer-checked:border-accent-gold
                peer-focus-visible:ring-2 peer-focus-visible:ring-accent-gold peer-focus-visible:ring-offset-2
                peer-focus-visible:ring-offset-bg-primary
                transition-all duration-150
                group-hover:border-border-hover
              `}
            />
            <Check
              className={`
                absolute top-0.5 left-0.5 w-4 h-4
                text-bg-primary opacity-0
                peer-checked:opacity-100
                transition-opacity duration-150
              `}
              strokeWidth={3}
            />
          </div>
          {label && (
            <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors duration-150">
              {label}
            </span>
          )}
        </label>
        {error && (
          <p className="text-xs text-danger pl-8">{error}</p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
