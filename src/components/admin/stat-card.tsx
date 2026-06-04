'use client';
import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { AdminGlassCard } from './glass-card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: { value: number; isPositive: boolean };
  subtitle?: string;
}

export function AdminStatCard({
  title,
  value,
  icon,
  trend,
  subtitle,
}: StatCardProps) {
  return (
    <AdminGlassCard>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-xs text-[#94A3B8] sm:mb-2 sm:text-sm">
            {title}
          </p>
          <h3 className="mb-1 text-lg font-semibold break-words text-white sm:text-2xl">
            {value}
          </h3>
          {subtitle && <p className="text-xs text-[#64748B]">{subtitle}</p>}
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              {trend.isPositive ? (
                <TrendingUp className="h-4 w-4 text-[#22C55E]" />
              ) : (
                <TrendingDown className="h-4 w-4 text-[#EF4444]" />
              )}
              <span
                className={`text-xs font-medium ${trend.isPositive ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}
              >
                {trend.value}%
              </span>
            </div>
          )}
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#3B82F6]/20 to-[#8B5CF6]/20 sm:h-12 sm:w-12 [&>svg]:h-4 [&>svg]:w-4 sm:[&>svg]:h-6 sm:[&>svg]:w-6">
          {icon}
        </div>
      </div>
    </AdminGlassCard>
  );
}
