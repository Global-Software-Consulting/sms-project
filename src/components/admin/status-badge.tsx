'use client';

interface StatusBadgeProps {
  status: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
}

export function AdminStatusBadge({
  status,
  variant = 'default',
}: StatusBadgeProps) {
  const variants = {
    success: 'bg-[#22C55E]/20 text-[#22C55E]',
    warning: 'bg-[#F59E0B]/20 text-[#F59E0B]',
    error: 'bg-[#EF4444]/20 text-[#EF4444]',
    info: 'bg-[#3B82F6]/20 text-[#3B82F6]',
    default: 'bg-[#64748B]/20 text-[#64748B]',
  };

  return (
    <span
      className={`inline-block rounded-lg px-3 py-1 text-xs font-medium whitespace-nowrap ${variants[variant]}`}
    >
      {status}
    </span>
  );
}
