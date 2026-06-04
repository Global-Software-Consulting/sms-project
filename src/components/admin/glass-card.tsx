'use client';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

export function AdminGlassCard({ children, className = '' }: GlassCardProps) {
  return (
    <div
      className={`rounded-2xl border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
}
