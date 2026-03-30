'use client';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';

interface MultiSelectProps {
  label: string;
  name: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
  error?: string;
  placeholder?: string;
}

export function AdminMultiSelect({ label, name, value, onChange, options, required = false, error, placeholder = 'Select options...' }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [touched, setTouched] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const toggleOption = (optionValue: string) => {
    setTouched(true);
    onChange(value.includes(optionValue) ? value.filter((v) => v !== optionValue) : [...value, optionValue]);
  };

  const removeOption = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== optionValue));
  };

  const showError = touched && error;

  return (
    <div className="space-y-2 relative" ref={dropdownRef}>
      <label className="block text-white text-sm font-medium">
        {label}{required && <span className="text-[#EF4444] ml-1">*</span>}
      </label>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-full px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.08)] border ${showError ? 'border-[#EF4444]' : 'border-[rgba(255,255,255,0.18)]'} cursor-pointer`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2 flex-1 min-w-0">
            {value.length === 0 ? (
              <span className="text-[#64748B] text-sm">{placeholder}</span>
            ) : (
              value.map((v) => {
                const option = options.find((o) => o.value === v);
                return (
                  <span key={v} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#3B82F6] text-white text-xs font-medium">
                    {option?.label || v}
                    <button onClick={(e) => removeOption(v, e)} className="hover:bg-[rgba(255,255,255,0.2)] rounded p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })
            )}
          </div>
          <ChevronDown className={`w-5 h-5 text-[#64748B] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-[#1E293B] border border-[rgba(255,255,255,0.18)] rounded-xl shadow-2xl backdrop-blur-xl max-h-60 overflow-y-auto">
          {options.map((option) => {
            const isSelected = value.includes(option.value);
            return (
              <button
                key={option.value}
                onClick={() => toggleOption(option.value)}
                className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${isSelected ? 'bg-[rgba(59,130,246,0.1)] text-[#3B82F6]' : 'text-white hover:bg-[rgba(255,255,255,0.08)]'}`}
              >
                <span className="text-sm font-medium">{option.label}</span>
                {isSelected && <Check className="w-4 h-4" />}
              </button>
            );
          })}
        </div>
      )}
      {showError && <p className="text-[#EF4444] text-xs">{error}</p>}
    </div>
  );
}
