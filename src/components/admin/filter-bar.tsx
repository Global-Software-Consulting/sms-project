'use client';
import { useRef } from 'react';
import { Search, Filter, X } from 'lucide-react';

interface FilterBarProps {
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  filters?: Array<{ label: string; options: string[]; optionLabels?: string[]; value?: string; onChange?: (value: string) => void; showAllOption?: boolean }>;
  showFilters?: boolean;
  onToggleFilters?: () => void;
  onApplyFilters?: () => void;
  onResetFilters?: () => void;
}

export function AdminFilterBar({ searchPlaceholder = 'Search...', onSearch, filters, showFilters = false, onToggleFilters, onApplyFilters, onResetFilters }: FilterBarProps) {
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
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
          <input
            ref={searchRef}
            type="text"
            placeholder={searchPlaceholder}
            onChange={(e) => onSearch?.(e.target.value)}
            className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-[#64748B] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
          />
        </div>
        <div className="flex items-center gap-3">
          {onToggleFilters && (
            <button
              onClick={onToggleFilters}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${showFilters ? 'bg-[#3B82F6] border-[#3B82F6] text-white' : 'bg-[rgba(255,255,255,0.08)] border-[rgba(255,255,255,0.18)] text-white hover:bg-[rgba(255,255,255,0.12)]'}`}
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
              {showFilters && <X className="w-4 h-4 ml-1" />}
            </button>
          )}
        </div>
      </div>
      {showFilters && filters && filters.length > 0 && (
        <div className="mt-4 p-4 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.18)] backdrop-blur-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filters.map((filter, index) => (
              <div key={index}>
                <label className="block text-white text-sm font-medium mb-2">{filter.label}</label>
                <select
                  value={filter.value}
                  onChange={(e) => filter.onChange?.(e.target.value)}
                  className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] [&>option]:bg-[#1E293B] [&>option]:text-white"
                >
                  {(filter.showAllOption !== false) && <option value="" className="bg-[#1E293B] text-white">All {filter.label}</option>}
                  {filter.options.map((option, i) => (
                    <option key={i} value={option} className="bg-[#1E293B] text-white">
                      {filter.optionLabels ? filter.optionLabels[i] : option}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[rgba(255,255,255,0.18)]">
            <button onClick={onApplyFilters} className="px-4 py-2 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors">Apply Filters</button>
            <button onClick={handleReset} className="px-4 py-2 rounded-lg bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.12)] text-white text-sm font-medium transition-colors">Reset</button>
          </div>
        </div>
      )}
    </div>
  );
}
