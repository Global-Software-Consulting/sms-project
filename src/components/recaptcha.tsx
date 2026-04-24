'use client';

import { useEffect, useImperativeHandle, useRef } from 'react';

interface GrecaptchaWindow {
  grecaptcha?: {
    render: (
      container: HTMLElement,
      params: {
        sitekey: string;
        theme?: 'light' | 'dark';
        size?: 'normal' | 'compact' | 'invisible';
        callback?: (token: string) => void;
        'expired-callback'?: () => void;
        'error-callback'?: () => void;
      },
    ) => number;
    reset: (widgetId?: number) => void;
    ready: (cb: () => void) => void;
  };
  __recaptchaOnLoad?: () => void;
}

const SCRIPT_ID = 'google-recaptcha-v2';
const SCRIPT_SRC =
  'https://www.google.com/recaptcha/api.js?onload=__recaptchaOnLoad&render=explicit';

let loadPromise: Promise<void> | null = null;

const loadRecaptchaScript = (): Promise<void> => {
  if (typeof window === 'undefined') return Promise.resolve();
  const w = window as unknown as GrecaptchaWindow;
  if (w.grecaptcha?.render) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<void>((resolve) => {
    w.__recaptchaOnLoad = () => resolve();
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      if (w.grecaptcha?.render) resolve();
      return;
    }
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  });
  return loadPromise;
};

export interface RecaptchaHandle {
  reset: () => void;
}

interface RecaptchaProps {
  siteKey: string;
  onChange: (token: string | null) => void;
  theme?: 'light' | 'dark';
  ref?: React.Ref<RecaptchaHandle>;
}

export function Recaptcha({ siteKey, onChange, theme = 'light', ref }: RecaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useImperativeHandle(
    ref,
    () => ({
      reset: () => {
        const w = window as unknown as GrecaptchaWindow;
        if (widgetIdRef.current !== null && w.grecaptcha) {
          w.grecaptcha.reset(widgetIdRef.current);
          onChangeRef.current(null);
        }
      },
    }),
    [],
  );

  useEffect(() => {
    let cancelled = false;
    loadRecaptchaScript().then(() => {
      if (cancelled) return;
      if (!containerRef.current || widgetIdRef.current !== null) return;
      const w = window as unknown as GrecaptchaWindow;
      if (!w.grecaptcha?.render) return;
      widgetIdRef.current = w.grecaptcha.render(containerRef.current, {
        sitekey: siteKey,
        theme,
        callback: (token) => onChangeRef.current(token),
        'expired-callback': () => onChangeRef.current(null),
        'error-callback': () => onChangeRef.current(null),
      });
    });
    return () => {
      cancelled = true;
    };
  }, [siteKey, theme]);

  return <div ref={containerRef} />;
}
