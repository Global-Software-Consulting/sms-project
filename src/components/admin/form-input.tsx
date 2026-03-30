'use client';

import { useState } from "react";
import { AlertCircle } from "lucide-react";

interface FormInputProps {
  label: string;
  name: string;
  type?: "text" | "email" | "password" | "number" | "tel";
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
  type = "text",
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
      <label className="block text-white text-sm font-medium">
        {label}
        {required && <span className="text-[#EF4444] ml-1">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]">
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
            icon ? "pl-12" : "pl-4"
          } pr-4 py-3 rounded-xl bg-[rgba(255,255,255,0.08)] border ${
            showError
              ? "border-[#EF4444] focus:ring-[#EF4444]"
              : "border-[rgba(255,255,255,0.18)] focus:ring-[#3B82F6]"
          } text-white placeholder:text-[#64748B] text-sm focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
        />
        {showError && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#EF4444]">
            <AlertCircle className="w-5 h-5" />
          </div>
        )}
      </div>
      {showError && (
        <p className="text-[#EF4444] text-xs flex items-center gap-1">
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
      <label className="block text-white text-sm font-medium">
        {label}
        {required && <span className="text-[#EF4444] ml-1">*</span>}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setTouched(true)}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={`w-full px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.08)] border ${
          showError
            ? "border-[#EF4444] focus:ring-[#EF4444]"
            : "border-[rgba(255,255,255,0.18)] focus:ring-[#3B82F6]"
        } text-white placeholder:text-[#64748B] text-sm focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed resize-none`}
      />
      {showError && (
        <p className="text-[#EF4444] text-xs flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
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
      <label className="block text-white text-sm font-medium">
        {label}
        {required && <span className="text-[#EF4444] ml-1">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setTouched(true)}
        disabled={disabled}
        className={`w-full px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.08)] border ${
          showError
            ? "border-[#EF4444] focus:ring-[#EF4444]"
            : "border-[rgba(255,255,255,0.18)] focus:ring-[#3B82F6]"
        } text-white text-sm focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {showError && (
        <p className="text-[#EF4444] text-xs flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}
