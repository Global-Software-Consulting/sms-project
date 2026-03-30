'use client';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

export function AdminGlassCard({ children, className = '' }: GlassCardProps) {
  return (
    <div className={`bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-2xl p-6 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.25)] ${className}`}>
      {children}
    </div>
  );
}
