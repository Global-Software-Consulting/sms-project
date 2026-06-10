'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient } from '@/config/api-client.config';
import { API_ENDPOINTS } from '@/config/server.config';

interface Branding {
  siteLogo: string | null;
  siteFavicon: string | null;
  refresh: () => Promise<void>;
}

const BrandingContext = createContext<Branding>({
  siteLogo: null,
  siteFavicon: null,
  refresh: async () => {},
});

function updateFaviconLink(faviconUrl: string) {
  if (typeof document === 'undefined') return;
  const head = document.head;
  // Remove existing favicon links so the new one takes effect
  const existing = head.querySelectorAll(
    "link[rel='icon'], link[rel='shortcut icon'], link[rel='apple-touch-icon']",
  );
  existing.forEach((el) => el.parentNode?.removeChild(el));
  // Detect mime type from extension
  const ext = faviconUrl.split('.').pop()?.toLowerCase() || '';
  const mimeMap: Record<string, string> = {
    ico: 'image/x-icon',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    svg: 'image/svg+xml',
  };
  const type = mimeMap[ext] || 'image/x-icon';
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = type;
  link.href = faviconUrl;
  head.appendChild(link);
  // Apple touch icon variant for iOS
  const appleLink = document.createElement('link');
  appleLink.rel = 'apple-touch-icon';
  appleLink.href = faviconUrl;
  head.appendChild(appleLink);
}

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [siteLogo, setSiteLogo] = useState<string | null>(null);
  const [siteFavicon, setSiteFavicon] = useState<string | null>(null);

  const refresh = async () => {
    try {
      const res = await apiClient.get<{ siteLogo: string; siteFavicon: string }>(
        API_ENDPOINTS.PUBLIC.BRANDING,
      );
      const logo = res.data.siteLogo || null;
      const favicon = res.data.siteFavicon || null;
      setSiteLogo(logo);
      setSiteFavicon(favicon);
      if (favicon) {
        updateFaviconLink(favicon);
      }
    } catch {
      // ignore - branding may not be configured yet
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <BrandingContext.Provider value={{ siteLogo, siteFavicon, refresh }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  return useContext(BrandingContext);
}
