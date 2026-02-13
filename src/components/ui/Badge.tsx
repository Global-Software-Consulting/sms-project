"use client";

import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "v1" | "v2" | "success" | "danger" | "warning";
  className?: string;
}

/**
 * Badge Component - Following Design Guidelines
 * 
 * Specs:
 * - Padding: 4px 10px
 * - Font size: 12px
 * - Font weight: 600
 * - Border radius: 6px
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  className = "",
}) => {
  const variants = {
    default: "bg-bg-hover text-text-secondary",
    v1: "bg-[rgba(96,165,250,0.15)] text-[#60A5FA]",      // Standard - Blue
    v2: "bg-[rgba(212,175,55,0.15)] text-[#D4AF37]",      // Premium - Gold
    success: "bg-[rgba(16,185,129,0.15)] text-success",
    danger: "bg-[rgba(239,68,68,0.15)] text-danger",
    warning: "bg-[rgba(245,158,11,0.15)] text-warning",
  };

  return (
    <span
      className={`
        inline-flex items-center
        px-2.5 py-1
        text-xs font-semibold
        rounded-md
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

