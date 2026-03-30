'use client';
import { useEffect } from 'react';
import { X } from 'lucide-react';

interface SlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AdminSlideOver({ isOpen, onClose, title, children, footer }: SlideOverProps) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-md lg:max-w-lg z-50 flex flex-col bg-[#111827] border-l border-[rgba(255,255,255,0.18)] shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[rgba(255,255,255,0.18)]">
          <h2 className="text-white text-xl font-semibold">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors">
            <X className="w-5 h-5 text-[#94A3B8]" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.03)]">{footer}</div>
        )}
      </div>
    </>
  );
}
