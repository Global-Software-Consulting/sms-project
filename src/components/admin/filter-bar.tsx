'use client';
import { useRef } from 'react';
import { Search, Filter, X } from 'lucide-react';

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
                <select
                  value={filter.value}
                  onChange={(e) => filter.onChange?.(e.target.value)}
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none [&>option]:bg-[#1E293B] [&>option]:text-white"
                >
                  {filter.showAllOption !== false && (
                    <option value="" className="bg-[#1E293B] text-white">
                      All {filter.label}
                    </option>
                  )}
                  {filter.options.map((option, i) => (
                    <option
                      key={i}
                      value={option}
                      className="bg-[#1E293B] text-white"
                    >
                      {filter.optionLabels ? filter.optionLabels[i] : option}
                    </option>
                  ))}
                </select>
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
