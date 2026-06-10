'use client';
import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  primaryAction?: { label: string; onClick: () => void; variant?: 'primary' | 'danger'; loading?: boolean };
  secondaryAction?: { label: string; onClick: () => void };
  size?: 'sm' | 'md' | 'lg';
}

export function AdminModal({ isOpen, onClose, title, children, primaryAction, secondaryAction, size = 'md' }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizeClasses[size]} bg-[#1E293B] border border-[rgba(255,255,255,0.18)] rounded-2xl shadow-2xl`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-[rgba(255,255,255,0.18)]">
          <h2 className="text-white text-xl font-semibold">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors">
            <X className="w-5 h-5 text-[#94A3B8]" />
          </button>
        </div>
        <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">{children}</div>
        {(primaryAction || secondaryAction) && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.03)]">
            {secondaryAction && (
              <button onClick={secondaryAction.onClick} className="px-5 py-2.5 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white hover:bg-[rgba(255,255,255,0.12)] transition-colors text-sm font-medium">
                {secondaryAction.label}
              </button>
            )}
            {primaryAction && (
              <button
                onClick={primaryAction.onClick}
                disabled={primaryAction.loading}
                className={`px-5 py-2.5 rounded-xl text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${primaryAction.variant === 'danger' ? 'bg-[#EF4444] hover:bg-[#DC2626]' : 'bg-[#3B82F6] hover:bg-[#2563EB]'}`}
              >
                {primaryAction.loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Loading...
                  </span>
                ) : primaryAction.label}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
