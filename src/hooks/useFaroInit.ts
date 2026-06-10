'use client';

import { useEffect } from 'react';
import { getAddons, addonsToMap } from '@/lib/api/settingsApi';
import { initFaro } from '@/utils/faro';

/**
 * Initialize Grafana Faro on the client once admin settings are available.
 *
 * Reads the unified Grafana addon settings:
 *   - addon_grafana_enabled  (master toggle for the whole Grafana addon)
 *   - addon_faro_collector_url
 *   - addon_faro_app_name    (optional, defaults to "sms-frontend")
 *
 * Boots Faro only when the Grafana addon is enabled AND a collector URL is
 * present. Failure is swallowed inside initFaro so observability
 * misconfiguration cannot crash the app.
 */
export function useFaroInit(): void {
  useEffect(() => {
    let cancelled = false;
    getAddons()
      .then((addons) => {
        if (cancelled) return;
        const map = addonsToMap(addons);
        if (map['addon_grafana_enabled'] !== 'true') return;
        const url = map['addon_faro_collector_url'];
        if (!url) return;
        const appName = map['addon_faro_app_name'] || 'sms-frontend';
        initFaro({ url, appName });
      })
      .catch(() => {
        /* settings unavailable — skip Faro, app continues normally */
      });
    return () => {
      cancelled = true;
    };
  }, []);
}
