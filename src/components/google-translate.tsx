'use client';

import { useEffect, useState, useRef } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate: {
        TranslateElement: new (
          options: { pageLanguage: string; autoDisplay: boolean },
          elementId: string,
        ) => void;
      };
    };
  }
}

const languages = [
  { code: '', label: 'English (Original)' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'ru', label: 'Russian' },
  { code: 'zh-CN', label: 'Chinese (Simplified)' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'ar', label: 'Arabic' },
  { code: 'hi', label: 'Hindi' },
  { code: 'pa', label: 'Punjabi' },
  { code: 'tr', label: 'Turkish' },
  { code: 'it', label: 'Italian' },
  { code: 'nl', label: 'Dutch' },
  { code: 'pl', label: 'Polish' },
  { code: 'vi', label: 'Vietnamese' },
  { code: 'th', label: 'Thai' },
  { code: 'id', label: 'Indonesian' },
  { code: 'uk', label: 'Ukrainian' },
];

export function GoogleTranslate() {
  return (
    <>
      <div
        id="google_translate_element"
        style={{ position: 'absolute', top: '-9999px', left: '-9999px', opacity: 0 }}
      />
      <Script
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
        onLoad={() => {
          window.googleTranslateElementInit = () => {
            if (window.google?.translate) {
              new window.google.translate.TranslateElement(
                { pageLanguage: 'en', autoDisplay: false },
                'google_translate_element',
              );
            }
          };
          window.googleTranslateElementInit();
        }}
      />
      <style jsx global>{`
        .goog-te-banner-frame { display: none !important; }
        .skiptranslate { display: none !important; }
        body { top: 0 !important; position: static !important; }
        #goog-gt-tt, .goog-te-balloon-frame { display: none !important; }
        .goog-text-highlight { background: none !important; box-shadow: none !important; }
      `}</style>
    </>
  );
}

function setGoogleTranslateLanguage(langCode: string) {
  const domain = window.location.hostname;

  if (langCode === '') {
    // Clear cookies and reload to restore original language
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${domain}`;
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain}`;
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
    window.location.reload();
    return;
  }

  document.cookie = `googtrans=/en/${langCode}; path=/; domain=${domain}`;
  document.cookie = `googtrans=/en/${langCode}; path=/`;

  // Use the hidden select element to trigger translation without reload
  const select = document.querySelector<HTMLSelectElement>('#google_translate_element select');
  if (select) {
    select.value = langCode;
    select.dispatchEvent(new Event('change'));
  } else {
    window.location.reload();
  }
}

export function LanguagePickerDropdown({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const [currentLang, setCurrentLang] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Detect current language from cookie
    const match = document.cookie.match(/googtrans=\/en\/([^;]+)/);
    if (match) setCurrentLang(match[1]);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    setTimeout(() => document.addEventListener('click', handleClick), 50);
    return () => document.removeEventListener('click', handleClick);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = languages.filter((l) =>
    l.label.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div
      ref={ref}
      className="notranslate absolute right-0 top-full mt-2 z-[99999] w-64 rounded-xl bg-[#0F172A] border border-[rgba(255,255,255,0.15)] shadow-2xl overflow-hidden"
    >
      {/* Search */}
      <div className="p-3 border-b border-[rgba(255,255,255,0.1)]">
        <input
          type="text"
          placeholder="Search language..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
          className="w-full px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.1)] text-white text-sm placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
        />
      </div>

      {/* Language list */}
      <div className="max-h-[300px] overflow-y-auto py-1">
        {filtered.map((lang) => (
          <button
            key={lang.code}
            onClick={() => {
              setGoogleTranslateLanguage(lang.code);
              setCurrentLang(lang.code);
              onClose();
            }}
            className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
              currentLang === lang.code
                ? 'bg-[rgba(59,130,246,0.15)] text-[#3B82F6]'
                : 'text-[#E2E8F0] hover:bg-[rgba(255,255,255,0.06)]'
            }`}
          >
            <span>{lang.label}</span>
            {currentLang === lang.code && (
              <span className="text-[#3B82F6] text-xs font-medium">Active</span>
            )}
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="px-4 py-3 text-[#64748B] text-sm text-center">No languages found</div>
        )}
      </div>
    </div>
  );
}
