"use client";

import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "premium" | "elevated";
  padding?: "none" | "compact" | "default" | "large";
  hover?: boolean;
}

/**
 * Card Component - Following Design Guidelines
 * 
 * Specs:
 * - Background: bg-card
 * - Border radius: 16px
 * - Padding: 16px (compact), 24px (default), 32px (large)
 * - Border: 1px solid border-default
 * - Hover: border-hover + shadow-md + translateY(-2px)
 * - Internal gap: 16px between sections
 */
export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  variant = "default",
  padding = "default",
  hover = false,
}) => {
  const variants = {
    default: "bg-bg-card border-border-default",
    premium: `
      border-[rgba(198,167,94,0.3)]
      bg-gradient-to-br from-bg-card to-[rgba(198,167,94,0.05)]
    `,
    elevated: "bg-bg-card border-border-default shadow-lg",
  };

  const paddings = {
    none: "",
    compact: "p-4",     // 16px
    default: "p-6",     // 24px
    large: "p-8",       // 32px
  };

  const hoverStyles = hover
    ? "hover:border-border-hover hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 cursor-pointer"
    : "";

  return (
    <div
      className={`
        rounded-2xl border
        transition-all duration-200
        ${variants[variant]}
        ${paddings[padding]}
        ${hoverStyles}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = "",
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
};

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export const CardTitle: React.FC<CardTitleProps> = ({
  children,
  className = "",
  as: Component = "h3",
}) => {
  return (
    <Component
      className={`text-xl font-semibold text-text-primary ${className}`}
    >
      {children}
    </Component>
  );
};

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({
  children,
  className = "",
}) => {
  return (
    <p className={`text-sm text-text-secondary mt-2 ${className}`}>
      {children}
    </p>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = "",
}) => {
  return <div className={`space-y-4 ${className}`}>{children}</div>;
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = "",
}) => {
  return (
    <div className={`mt-6 pt-4 border-t border-border-default ${className}`}>
      {children}
    </div>
  );
};
