'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { apiClient } from '@/config/api-client.config';
import { API_ENDPOINTS } from '@/config/server.config';

// Paths that remain reachable when maintenance is on — so admins can log in
// and turn it off.
const ALLOWED_PREFIXES = ['/admin', '/auth', '/maintenance', '/api'];

function isMaintenanceOn(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  // Handle common shape variations
  const candidates = [
    d.maintenanceMode,
    d.maintenance_mode,
    d.enabled,
    d.isEnabled,
    d.is_enabled,
    (d.data as Record<string, unknown> | undefined)?.maintenanceMode,
    (d.data as Record<string, unknown> | undefined)?.enabled,
  ];
  return candidates.some((v) => v === true || v === 'true');
}

export function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!pathname) return;
    if (ALLOWED_PREFIXES.some((p) => pathname.startsWith(p))) return;

    apiClient
      .get(API_ENDPOINTS.PUBLIC.MAINTENANCE)
      .then((res) => {
        if (isMaintenanceOn(res.data)) {
          router.replace('/maintenance');
        }
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.warn('[MaintenanceGuard] Could not check maintenance status:', err);
      });
  }, [pathname, router]);

  return <>{children}</>;
}
