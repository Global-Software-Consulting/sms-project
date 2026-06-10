'use client';

import { useState } from "react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image,
  Heading1,
  Heading2,
} from "lucide-react";

interface RichTextEditorProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  minHeight?: string;
}

export function AdminRichTextEditor({
  label,
  name,
  value,
  onChange,
  required = false,
  error,
  minHeight = "300px",
}: RichTextEditorProps) {
  const [touched, setTouched] = useState(false);
  const showError = touched && error;

  const toolbarButtons = [
    { icon: <Heading1 className="w-4 h-4" />, label: "Heading 1" },
    { icon: <Heading2 className="w-4 h-4" />, label: "Heading 2" },
    { icon: <Bold className="w-4 h-4" />, label: "Bold" },
    { icon: <Italic className="w-4 h-4" />, label: "Italic" },
    { icon: <List className="w-4 h-4" />, label: "Bullet List" },
    { icon: <ListOrdered className="w-4 h-4" />, label: "Numbered List" },
    { icon: <LinkIcon className="w-4 h-4" />, label: "Insert Link" },
    { icon: <Image className="w-4 h-4" />, label: "Insert Image" },
  ];

  return (
    <div className="space-y-2">
      <label className="block text-white text-sm font-medium">
        {label}
        {required && <span className="text-[#EF4444] ml-1">*</span>}
      </label>

      <div
        className={`rounded-xl border ${
          showError
            ? "border-[#EF4444]"
            : "border-[rgba(255,255,255,0.18)]"
        } bg-[rgba(255,255,255,0.08)] overflow-hidden`}
      >
        {/* Toolbar */}
        <div className="flex items-center gap-1 p-2 border-b border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.03)]">
          {toolbarButtons.map((button, index) => (
            <button
              key={index}
              type="button"
              title={button.label}
              className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.08)] text-[#94A3B8] hover:text-white transition-colors"
              onClick={(e) => e.preventDefault()}
            >
              {button.icon}
            </button>
          ))}
        </div>

        {/* Editor Area */}
        <textarea
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setTouched(true)}
          className="w-full px-4 py-3 bg-transparent text-white placeholder:text-[#64748B] text-sm focus:outline-none resize-none"
          style={{ minHeight }}
          placeholder="Start writing your content..."
        />
      </div>

      {showError && (
        <p className="text-[#EF4444] text-xs flex items-center gap-1">
          {error}
        </p>
      )}

      <p className="text-[#64748B] text-xs">
        {value.length} characters
      </p>
    </div>
  );
}
