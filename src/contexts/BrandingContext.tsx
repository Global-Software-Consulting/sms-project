'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
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

// Marker used to find/replace only the favicon links WE inject. Without
// it, the prior implementation removed the Next.js metadata-rendered
// <link> nodes directly from the DOM, which React still believed it
// owned — first user interaction triggered reconciliation and the
// reconciler hit `parentNode.removeChild` on a node that no longer had
// a parent (TypeError: Cannot read properties of null (reading
// 'removeChild')). Updating href in place avoids the whole class of
// DOM-vs-virtual-DOM bugs.
const DYNAMIC_MARKER = 'data-dynamic-favicon';

function getMimeType(faviconUrl: string): string {
  const ext = faviconUrl.split('.').pop()?.toLowerCase() ?? '';
  const mimeMap: Record<string, string> = {
    ico: 'image/x-icon',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    svg: 'image/svg+xml',
  };
  return mimeMap[ext] ?? 'image/x-icon';
}

function upsertFaviconLink(rel: string, faviconUrl: string, type?: string) {
  const head = document.head;
  let link = head.querySelector<HTMLLinkElement>(
    `link[${DYNAMIC_MARKER}][rel='${rel}']`,
  );
  if (!link) {
    link = document.createElement('link');
    link.rel = rel;
    link.setAttribute(DYNAMIC_MARKER, 'true');
    head.appendChild(link);
  }
  if (type) link.type = type;
  link.href = faviconUrl;
}

function updateFaviconLink(faviconUrl: string) {
  if (typeof document === 'undefined') return;
  const type = getMimeType(faviconUrl);
  upsertFaviconLink('icon', faviconUrl, type);
  upsertFaviconLink('apple-touch-icon', faviconUrl);
}

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [siteLogo, setSiteLogo] = useState<string | null>(null);
  const [siteFavicon, setSiteFavicon] = useState<string | null>(null);

  const refresh = async () => {
    try {
      const res = await apiClient.get<{
        siteLogo: string;
        siteFavicon: string;
      }>(API_ENDPOINTS.PUBLIC.BRANDING);
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
