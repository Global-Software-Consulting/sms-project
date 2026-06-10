'use client';

import { useState } from "react";
import { Upload, X, Image } from "lucide-react";

interface FileUploadProps {
  label: string;
  name: string;
  value: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  required?: boolean;
  error?: string;
}

export function AdminFileUpload({
  label,
  name,
  value,
  onChange,
  accept = "image/*",
  required = false,
  error,
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange(file);
    setTouched(true);

    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleRemove = () => {
    onChange(null);
    setPreview(null);
  };

  const showError = touched && error;

  return (
    <div className="space-y-2">
      <label className="block text-white text-sm font-medium">
        {label}
        {required && <span className="text-[#EF4444] ml-1">*</span>}
      </label>

      {!value && !preview ? (
        <label className="block cursor-pointer">
          <input
            type="file"
            name={name}
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />
          <div
            className={`p-6 rounded-xl border-2 border-dashed ${
              showError
                ? "border-[#EF4444] bg-[rgba(239,68,68,0.05)]"
                : "border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.05)]"
            } hover:bg-[rgba(255,255,255,0.08)] transition-colors`}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[rgba(59,130,246,0.1)] flex items-center justify-center">
                <Upload className="w-6 h-6 text-[#3B82F6]" />
              </div>
              <div className="text-center">
                <p className="text-white text-sm font-medium">
                  Click to upload or drag and drop
                </p>
                <p className="text-[#64748B] text-xs mt-1">
                  PNG, JPG, SVG up to 10MB
                </p>
              </div>
            </div>
          </div>
        </label>
      ) : (
        <div className="relative p-4 rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.05)]">
          <div className="flex items-center gap-4">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-[rgba(59,130,246,0.1)] flex items-center justify-center">
                <Image className="w-8 h-8 text-[#3B82F6]" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {value?.name || "File uploaded"}
              </p>
              <p className="text-[#64748B] text-xs">
                {value?.size ? `${(value.size / 1024).toFixed(2)} KB` : ""}
              </p>
            </div>
            <button
              onClick={handleRemove}
              className="p-2 rounded-lg hover:bg-[rgba(239,68,68,0.1)] transition-colors"
            >
              <X className="w-5 h-5 text-[#EF4444]" />
            </button>
          </div>
        </div>
      )}

      {showError && (
        <p className="text-[#EF4444] text-xs flex items-center gap-1">
          {error}
        </p>
      )}
    </div>
  );
}
