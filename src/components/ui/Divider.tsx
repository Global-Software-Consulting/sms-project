"use client";

import React from "react";

interface DividerProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * Divider Component - Following Design Guidelines
 * 
 * Specs from design-guidelines.md:
 * - Vertical margin: 24px top and bottom (my-6)
 * - Text padding: 16px horizontal
 * - Line color: border-default
 * - Text: 12px, uppercase, text-muted, letter-spacing
 */
export const Divider: React.FC<DividerProps> = ({ children, className = "" }) => {
  if (children) {
    return (
      <div className={`relative my-6 ${className}`}>
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border-default" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 text-xs font-medium text-text-muted uppercase tracking-wider bg-bg-primary">
            {children}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`my-6 border-t border-border-default ${className}`} />
  );
};
