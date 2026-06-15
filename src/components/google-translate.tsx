'use client';

import { useEffect, useState, useRef } from 'react';
import { getActiveLanguages } from '@/lib/api/languagesApi';

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

interface LanguageOption {
  code: string; // Google Translate code (empty string = original/default)
  label: string;
}

const FALLBACK_LANGUAGES: LanguageOption[] = [
  { code: '', label: 'English (Original)' },
];

// Lazy-load Google Translate. The widget sets ~32 third-party cookies
// from translate.google.com and tanks the Best Practices Lighthouse
// score. Defer loading until either:
//   (a) the user opens the language picker (LanguagePickerDropdown
//       dispatches a "gt:activate" window event)
//   (b) a `googtrans` cookie is already present from a prior session
// First-page-load visitors who never use the picker pay zero cost.
const GOOGLE_TRANSLATE_STYLE_ID = 'google-translate-overrides';
const GOOGLE_TRANSLATE_STYLE_CSS = `
  .goog-te-banner-frame { display: none !important; }
  .skiptranslate { display: none !important; }
  body { top: 0 !important; position: static !important; }
  #goog-gt-tt, .goog-te-balloon-frame { display: none !important; }
  .goog-text-highlight { background: none !important; box-shadow: none !important; }
`;
const GOOGLE_TRANSLATE_SCRIPT_ID = 'google-translate-loader';
const GOOGLE_TRANSLATE_SRC =
  'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';

/**
 * Inject Google Translate script and CSS imperatively into document.head.
 * Kept out of the React tree so React 19 doesn't try to unmount the
 * <script>/<style> on navigation (would race with Google's own DOM
 * mutations and crash commit-phase with a removeChild null error).
 */
function ensureGoogleTranslateStyleInjected(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(GOOGLE_TRANSLATE_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = GOOGLE_TRANSLATE_STYLE_ID;
  style.textContent = GOOGLE_TRANSLATE_STYLE_CSS;
  document.head.appendChild(style);
}

function ensureGoogleTranslateScriptInjected(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(GOOGLE_TRANSLATE_SCRIPT_ID)) return;

  if (!window.googleTranslateElementInit) {
    window.googleTranslateElementInit = () => {
      if (typeof window.google?.translate?.TranslateElement === 'function') {
        new window.google.translate.TranslateElement(
          { pageLanguage: 'en', autoDisplay: false },
          'google_translate_element',
        );
      }
    };
  }

  const s = document.createElement('script');
  s.id = GOOGLE_TRANSLATE_SCRIPT_ID;
  s.async = true;
  s.src = GOOGLE_TRANSLATE_SRC;
  s.onload = () => {
    let tries = 0;
    const intv = setInterval(() => {
      if (typeof window.google?.translate?.TranslateElement === 'function') {
        clearInterval(intv);
        try {
          window.googleTranslateElementInit?.();
        } catch {
          /* ignore — best effort */
        }
      } else if (++tries > 40) {
        clearInterval(intv);
      }
    }, 100);
  };
  document.head.appendChild(s);
}

export function GoogleTranslate() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    ensureGoogleTranslateStyleInjected();
  }, []);

  useEffect(() => {
    if (
      typeof document !== 'undefined' &&
      /(^|; )googtrans=/.test(document.cookie)
    ) {
      setShouldLoad(true);
      return;
    }
    const activate = () => setShouldLoad(true);
    window.addEventListener('gt:activate', activate);
    return () => window.removeEventListener('gt:activate', activate);
  }, []);

  useEffect(() => {
    if (shouldLoad) ensureGoogleTranslateScriptInjected();
  }, [shouldLoad]);

  return (
    <div
      id="google_translate_element"
      style={{
        position: 'absolute',
        top: '-9999px',
        left: '-9999px',
        opacity: 0,
      }}
    />
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
  const select = document.querySelector<HTMLSelectElement>(
    '#google_translate_element select',
  );
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
  const [languages, setLanguages] =
    useState<LanguageOption[]>(FALLBACK_LANGUAGES);
  const ref = useRef<HTMLDivElement>(null);

  // Signal GoogleTranslate to load its third-party script. Kept out of
  // the initial bundle to protect the Best Practices Lighthouse score.
  useEffect(() => {
    if (!isOpen) return;
    window.dispatchEvent(new Event('gt:activate'));
  }, [isOpen]);

  // Fetch active languages from public API the first time the dropdown opens
  useEffect(() => {
    if (!isOpen) return;
    getActiveLanguages()
      .then((list) => {
        if (!Array.isArray(list) || list.length === 0) return;
        // Sort by sortOrder asc, put default first
        const sorted = [...list].sort((a, b) => {
          if (a.isDefault && !b.isDefault) return -1;
          if (!a.isDefault && b.isDefault) return 1;
          return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
        });
        const opts: LanguageOption[] = sorted.map((l) => ({
          // Default language uses empty code (shows original text, no translation)
          code: l.isDefault ? '' : (l.langCode || '').toLowerCase(),
          label: l.isDefault ? `${l.name} (Original)` : l.name,
        }));
        setLanguages(opts);
      })
      .catch(() => {
        // Keep fallback
      });
  }, [isOpen]);

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
      className="notranslate fixed top-14 right-2 left-2 z-[99999] overflow-hidden rounded-xl border border-[rgba(255,255,255,0.15)] bg-[#0F172A] shadow-2xl sm:absolute sm:top-full sm:right-0 sm:left-auto sm:mt-2 sm:w-64"
    >
      {/* Search */}
      <div className="border-b border-[rgba(255,255,255,0.1)] p-3">
        <input
          type="text"
          placeholder="Search language..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
          className="w-full rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.08)] px-3 py-2 text-sm text-white placeholder:text-[#64748B] focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
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
            className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${
              currentLang === lang.code
                ? 'bg-[rgba(59,130,246,0.15)] text-[#3B82F6]'
                : 'text-[#E2E8F0] hover:bg-[rgba(255,255,255,0.06)]'
            }`}
          >
            <span>{lang.label}</span>
            {currentLang === lang.code && (
              <span className="text-xs font-medium text-[#3B82F6]">Active</span>
            )}
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="px-4 py-3 text-center text-sm text-[#64748B]">
            No languages found
          </div>
        )}
      </div>
    </div>
  );
}
