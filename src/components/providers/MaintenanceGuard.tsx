'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { apiClient } from '@/config/api-client.config';
import { API_ENDPOINTS } from '@/config/server.config';

// Paths that remain reachable when maintenance is on — so admins can log in
// and turn it off.
const ALLOWED_PREFIXES = ['/admin', '/auth', '/maintenance', '/api'];

function isMaintenanceOn(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
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

// Session-scoped cache so we hit /maintenance once per page load, not per
// navigation. Polled every 60s as a background refresh — if maintenance
// flips on while the user is browsing, the next poll catches it.
let cachedStatus: boolean | null = null;
let inflightCheck: Promise<boolean> | null = null;
let lastChecked = 0;
const POLL_INTERVAL_MS = 60_000;

async function checkMaintenance(): Promise<boolean> {
  const now = Date.now();
  if (cachedStatus !== null && now - lastChecked < POLL_INTERVAL_MS) {
    return cachedStatus;
  }
  if (inflightCheck) return inflightCheck;
  inflightCheck = apiClient
    .get(API_ENDPOINTS.PUBLIC.MAINTENANCE)
    .then((res) => {
      cachedStatus = isMaintenanceOn(res.data);
      lastChecked = Date.now();
      return cachedStatus;
    })
    .catch(() => {
      // Treat errors as "off" — fail open rather than locking users out
      // of the site if the maintenance endpoint is unreachable.
      cachedStatus = false;
      lastChecked = Date.now();
      return false;
    })
    .finally(() => {
      inflightCheck = null;
    });
  return inflightCheck;
}

export function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  // Track whether this component is still mounted so we don't router.replace
  // after unmount (which would interrupt a navigation that is already in
  // progress to somewhere else).
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!pathname) return;
    if (ALLOWED_PREFIXES.some((p) => pathname.startsWith(p))) return;

    // Hit the cached/inflight check — no new request per navigation.
    let cancelled = false;
    checkMaintenance().then((on) => {
      if (cancelled || !mountedRef.current) return;
      if (on) router.replace('/maintenance');
    });
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  return <>{children}</>;
}
