'use client';
import { useEffect, useState } from 'react';
import { getAddons, addonsToMap } from '@/lib/api/settingsApi';

/**
 * Global Trustpilot "Mini" widget. Only renders when:
 *   - addon_trustpilot_enabled === 'true'
 *   - addon_trustpilot_business_unit_id is set
 *
 * The bootstrap script is loaded site-wide by <AddonsLoader />; this
 * component just emits the markup it scans for and then triggers a
 * rescan after mount so SPA navigations also pick it up.
 */
export function TrustpilotWidget({
  templateId = '5419b6ffb0d04a076446a9af', // Mini
  height = '24px',
  width = '100%',
  theme = 'dark',
}: {
  templateId?: string;
  height?: string;
  width?: string;
  theme?: 'light' | 'dark';
}) {
  const [config, setConfig] = useState<{ businessUnitId: string; businessUrl: string } | null>(
    null,
  );

  useEffect(() => {
    getAddons()
      .then((rows) => {
        const m = addonsToMap(rows);
        if (
          m['addon_trustpilot_enabled'] === 'true' &&
          m['addon_trustpilot_business_unit_id']
        ) {
          setConfig({
            businessUnitId: m['addon_trustpilot_business_unit_id'],
            businessUrl: m['addon_trustpilot_business_url'] || 'https://www.trustpilot.com',
          });
        }
      })
      .catch(() => setConfig(null));
  }, []);

  useEffect(() => {
    if (!config) return;
    // Trustpilot's bootstrap auto-scans, but in SPA we may mount after
    // the script already ran. Manually trigger a rescan if possible.
    const tp = (window as unknown as { Trustpilot?: { loadFromElement: (el: Element) => void } })
      .Trustpilot;
    const el = document.querySelector<HTMLElement>('.trustpilot-widget');
    if (tp && el) tp.loadFromElement(el);
  }, [config]);

  if (!config) return null;

  return (
    <div
      className="trustpilot-widget"
      data-locale="en-US"
      data-template-id={templateId}
      data-businessunit-id={config.businessUnitId}
      data-style-height={height}
      data-style-width={width}
      data-theme={theme}
    >
      <a href={config.businessUrl} target="_blank" rel="noopener noreferrer">
        Trustpilot
      </a>
    </div>
  );
}
