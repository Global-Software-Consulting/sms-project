'use client';
import { useRef } from 'react';
import { Upload, X } from 'lucide-react';

interface FileUploadProps {
  label: string;
  name: string;
  value: File | null;
  onChange: (value: File | null) => void;
  accept?: string;
}

export function AdminFileUpload({ label, name, value, onChange, accept = 'image/*' }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <label className="block text-white text-sm font-medium">{label}</label>
      <div
        onClick={() => inputRef.current?.click()}
        className="w-full px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] border-dashed text-sm cursor-pointer hover:bg-[rgba(255,255,255,0.12)] transition-colors flex items-center gap-3"
      >
        <Upload className="w-5 h-5 text-[#64748B]" />
        {value ? (
          <div className="flex items-center gap-2 flex-1">
            <span className="text-white truncate">{value.name}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onChange(null); }}
              className="ml-auto p-1 rounded hover:bg-[rgba(255,255,255,0.1)]"
            >
              <X className="w-4 h-4 text-[#94A3B8]" />
            </button>
          </div>
        ) : (
          <span className="text-[#64748B]">Click to upload file</span>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept={accept}
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
    </div>
  );
}
