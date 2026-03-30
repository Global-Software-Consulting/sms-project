'use client';
import { useState, useRef, useEffect } from 'react';

interface DropdownProps {
  trigger: React.ReactNode;
  items: Array<{ label: string; icon?: React.ReactNode; onClick: () => void; variant?: 'default' | 'danger' }>;
  align?: 'left' | 'right';
}

export function AdminDropdown({ trigger, items, align = 'right' }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    const handleEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setIsOpen(false); };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative">
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <div className={`absolute top-full mt-2 ${align === 'right' ? 'right-0' : 'left-0'} min-w-[200px] bg-[#1E293B] border border-[rgba(255,255,255,0.18)] rounded-xl shadow-2xl backdrop-blur-xl z-50 py-2`}>
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => { item.onClick(); setIsOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${item.variant === 'danger' ? 'text-[#EF4444] hover:bg-[rgba(239,68,68,0.1)]' : 'text-white hover:bg-[rgba(255,255,255,0.08)]'}`}
            >
              {item.icon && <span className="w-5 h-5">{item.icon}</span>}
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
