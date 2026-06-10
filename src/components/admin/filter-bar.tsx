'use client';
import { useRef } from 'react';
import { Search, Filter, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FilterBarProps {
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  filters?: Array<{
    label: string;
    options: string[];
    optionLabels?: string[];
    value?: string;
    onChange?: (value: string) => void;
    showAllOption?: boolean;
  }>;
  showFilters?: boolean;
  onToggleFilters?: () => void;
  onApplyFilters?: () => void;
  onResetFilters?: () => void;
}

export function AdminFilterBar({
  searchPlaceholder = 'Search...',
  onSearch,
  filters,
  showFilters = false,
  onToggleFilters,
  onApplyFilters,
  onResetFilters,
}: FilterBarProps) {
  const searchRef = useRef<HTMLInputElement>(null);

  const handleReset = () => {
    if (searchRef.current) {
      searchRef.current.value = '';
    }
    onSearch?.('');
    onResetFilters?.();
  };

  return (
    <div className="mb-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full flex-1 lg:max-w-md">
          <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-[#64748B]" />
          <input
            ref={searchRef}
            type="text"
            placeholder={searchPlaceholder}
            onChange={(e) => onSearch?.(e.target.value)}
            className="w-full rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] py-3 pr-4 pl-12 text-sm text-white placeholder:text-[#64748B] focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-3">
          {onToggleFilters && (
            <button
              onClick={onToggleFilters}
              className={`flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors lg:w-auto lg:justify-start ${showFilters ? 'border-[#3B82F6] bg-[#3B82F6] text-white' : 'border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] text-white hover:bg-[rgba(255,255,255,0.12)]'}`}
            >
              <Filter className="h-5 w-5" />
              <span>Filters</span>
              {showFilters && <X className="ml-1 h-4 w-4" />}
            </button>
          )}
        </div>
      </div>
      {showFilters && filters && filters.length > 0 && (
        <div className="mt-4 rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.05)] p-4 backdrop-blur-xl">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {filters.map((filter, index) => (
              <div key={index}>
                <label className="mb-2 block text-sm font-medium text-white">
                  {filter.label}
                </label>
                <Select
                  value={filter.value || '__all__'}
                  onValueChange={(v) =>
                    filter.onChange?.(v === '__all__' ? '' : v)
                  }
                >
                  <SelectTrigger className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-4 py-2.5 text-base text-white focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:outline-none data-[size=default]:h-auto data-[size=default]:min-h-11 lg:text-sm">
                    <SelectValue placeholder={`All ${filter.label}`} />
                  </SelectTrigger>
                  <SelectContent className="max-h-72 border-[rgba(255,255,255,0.18)] bg-[#1E293B] text-white">
                    {filter.showAllOption !== false && (
                      <SelectItem
                        value="__all__"
                        className="text-white focus:bg-[rgba(59,130,246,0.15)] focus:text-white"
                      >
                        All {filter.label}
                      </SelectItem>
                    )}
                    {filter.options.map((option, i) => (
                      <SelectItem
                        key={i}
                        value={option}
                        className="text-white focus:bg-[rgba(59,130,246,0.15)] focus:text-white"
                      >
                        {filter.optionLabels ? filter.optionLabels[i] : option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-3 border-t border-[rgba(255,255,255,0.18)] pt-4">
            <button
              onClick={onApplyFilters}
              className="rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2563EB]"
            >
              Apply Filters
            </button>
            <button
              onClick={handleReset}
              className="rounded-lg bg-[rgba(255,255,255,0.08)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.12)]"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
