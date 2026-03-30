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

export function AdminStatCard({ title, value, icon, trend, subtitle }: StatCardProps) {
  return (
    <AdminGlassCard>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-[#94A3B8] text-sm mb-2">{title}</p>
          <h3 className="text-white text-2xl font-semibold mb-1">{value}</h3>
          {subtitle && <p className="text-[#64748B] text-xs">{subtitle}</p>}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trend.isPositive ? (
                <TrendingUp className="w-4 h-4 text-[#22C55E]" />
              ) : (
                <TrendingDown className="w-4 h-4 text-[#EF4444]" />
              )}
              <span className={`text-xs font-medium ${trend.isPositive ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                {trend.value}%
              </span>
            </div>
          )}
        </div>
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3B82F6]/20 to-[#8B5CF6]/20 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </AdminGlassCard>
  );
}
