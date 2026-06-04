'use client';

import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FormInputProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'date';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export function AdminFormInput({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  icon,
  disabled = false,
}: FormInputProps) {
  const [touched, setTouched] = useState(false);

  const showError = touched && error;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white">
        {label}
        {required && <span className="ml-1 text-[#EF4444]">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute top-1/2 left-4 -translate-y-1/2 text-[#64748B]">
            {icon}
          </div>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full ${
            icon ? 'pl-12' : 'pl-4'
          } rounded-xl border bg-[rgba(255,255,255,0.08)] py-3 pr-4 ${
            showError
              ? 'border-[#EF4444] focus:ring-[#EF4444]'
              : 'border-[rgba(255,255,255,0.18)] focus:ring-[#3B82F6]'
          } text-sm text-white transition-all placeholder:text-[#64748B] focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50`}
        />
        {showError && (
          <div className="absolute top-1/2 right-4 -translate-y-1/2 text-[#EF4444]">
            <AlertCircle className="h-5 w-5" />
          </div>
        )}
      </div>
      {showError && (
        <p className="flex items-center gap-1 text-xs text-[#EF4444]">
          {error}
        </p>
      )}
    </div>
  );
}

interface FormTextareaProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  rows?: number;
  disabled?: boolean;
}

export function AdminFormTextarea({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  rows = 4,
  disabled = false,
}: FormTextareaProps) {
  const [touched, setTouched] = useState(false);
  const showError = touched && error;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white">
        {label}
        {required && <span className="ml-1 text-[#EF4444]">*</span>}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setTouched(true)}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={`w-full rounded-xl border bg-[rgba(255,255,255,0.08)] px-4 py-3 ${
          showError
            ? 'border-[#EF4444] focus:ring-[#EF4444]'
            : 'border-[rgba(255,255,255,0.18)] focus:ring-[#3B82F6]'
        } resize-none text-sm text-white transition-all placeholder:text-[#64748B] focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50`}
      />
      {showError && (
        <p className="flex items-center gap-1 text-xs text-[#EF4444]">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}

interface FormSelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

export function AdminFormSelect({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  error,
  disabled = false,
}: FormSelectProps) {
  const [touched, setTouched] = useState(false);
  const showError = touched && error;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white">
        {label}
        {required && <span className="ml-1 text-[#EF4444]">*</span>}
      </label>
      <Select
        value={value || '__placeholder__'}
        onValueChange={(v) => {
          onChange(v === '__placeholder__' ? '' : v);
          setTouched(true);
        }}
        disabled={disabled}
      >
        <SelectTrigger
          className={`w-full rounded-xl border bg-[rgba(255,255,255,0.08)] px-4 py-3 ${
            showError
              ? 'border-[#EF4444] focus-visible:ring-[#EF4444]'
              : 'border-[rgba(255,255,255,0.18)] focus-visible:ring-[#3B82F6]'
          } text-base text-white transition-all focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-auto data-[size=default]:min-h-12 lg:text-sm`}
        >
          <SelectValue placeholder={`Select ${label}`} />
        </SelectTrigger>
        <SelectContent className="max-h-72 border-[rgba(255,255,255,0.18)] bg-[#1E293B] text-white">
          <SelectItem
            value="__placeholder__"
            className="text-white focus:bg-[rgba(59,130,246,0.15)] focus:text-white"
          >
            Select {label}
          </SelectItem>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="text-white focus:bg-[rgba(59,130,246,0.15)] focus:text-white"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {showError && (
        <p className="flex items-center gap-1 text-xs text-[#EF4444]">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}
