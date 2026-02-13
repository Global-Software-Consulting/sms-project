"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

/**
 * Button Component - Following Design Guidelines
 * 
 * Sizes:
 * - Small: 32px height, 8px 16px padding, 14px font, 8px radius
 * - Default: 40px height, 12px 24px padding, 16px font, 12px radius
 * - Large: 48px height, 16px 32px padding, 18px font, 16px radius
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center justify-center
      font-semibold
      transition-all
      focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-gold
      disabled:opacity-50 disabled:cursor-not-allowed
      active:scale-[0.98]
    `;

    const variants = {
      primary: `
        bg-gold-gradient
        text-bg-primary
        border-none
        shadow-gold
        hover:shadow-gold-lg
        hover:-translate-y-[1px]
      `,
      secondary: `
        bg-transparent
        text-text-primary
        border border-border-default
        hover:bg-bg-hover
        hover:border-border-hover
      `,
      ghost: `
        bg-transparent
        text-text-secondary
        border-none
        hover:text-text-primary
        hover:bg-bg-hover
      `,
      danger: `
        bg-danger
        text-white
        border-none
        hover:bg-danger-muted
        shadow-md
        hover:shadow-lg
      `,
    };

    const sizes = {
      sm: "h-8 px-4 text-sm gap-1.5 rounded-lg",           // 32px, 8px 16px, 14px, 8px
      md: "h-10 px-6 text-base gap-2 rounded-xl",          // 40px, 12px 24px, 16px, 12px
      lg: "h-12 px-8 text-lg gap-2.5 rounded-2xl",         // 48px, 16px 32px, 18px, 16px
    };

    return (
      <button
        ref={ref}
        className={`
          ${baseStyles}
          ${variants[variant]}
          ${sizes[size]}
          ${fullWidth ? "w-full" : ""}
          ${className}
        `}
        disabled={disabled || isLoading}
        style={{
          transitionProperty: 'background-color, transform, box-shadow',
          transitionDuration: '200ms',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        {...props}
      >
        {isLoading ? (
          <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
