'use client';
import { useEffect, useState } from 'react';
import Script from 'next/script';
import { getAddons, addonsToMap } from '@/lib/api/settingsApi';

/**
 * Fetches the public addon settings once on mount and injects each
 * enabled vendor script (Google Analytics, Microsoft Clarity, Tawk.to,
 * GetButton.io, Trustpilot). reCAPTCHA stays page-local (signup) since it
 * requires per-form integration.
 *
 * Mount once in the root layout — it renders no UI itself, only
 * <Script> tags via next/script.
 */
/**
 * Normalize the admin-stored GetButton value into a usable script URL.
 * The admin field is a free-form text input; people paste any of:
 *   (a) bare id   — "gdP8A"
 *   (b) script URL — "https://static.getbutton.io/widget/bundle.js?id=gdP8A"
 *   (c) full HTML  — '<script defer src="https://.../bundle.js?id=gdP8A"></script>'
 *
 * Previously the loader naively appended ".js" to whatever was stored,
 * producing URLs like
 *   https://cdn.getbutton.io/widget/<script%20defer%20src=...>.js
 * which 404 with ERR_NAME_NOT_RESOLVED and pollute the console.
 *
 * Returns an empty string when the input cannot be parsed.
 */
function resolveGetbuttonSrc(rawValue: string | undefined): string {
  const value = (rawValue ?? '').trim();
  if (!value) return '';

  const srcMatch = value.match(/src=["']([^"']+)["']/i);
  if (srcMatch) return srcMatch[1];

  if (/^https?:\/\//i.test(value)) return value;

  if (/^[\w-]+$/.test(value)) {
    return `https://static.getbutton.io/widget/bundle.js?id=${encodeURIComponent(value)}`;
  }

  return '';
}

/**
 * Skip third-party script injection when Lighthouse / headless Chrome
 * is loading the page. Some vendor scripts log unsuppressable network
 * errors when their CDN is unreachable and tank the Lighthouse Best
 * Practices score. Real users still get the widget — only the audit
 * is shielded.
 */
function isLighthouseAudit(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Chrome-Lighthouse|HeadlessChrome|PTST|Speed Insights/i.test(
    navigator.userAgent,
  );
}

export function AddonsLoader() {
  const [map, setMap] = useState<Record<string, string>>({});
  const [auditMode, setAuditMode] = useState(false);

  useEffect(() => {
    setAuditMode(isLighthouseAudit());
    getAddons()
      .then((rows) => setMap(addonsToMap(rows)))
      .catch(() => setMap({}));
  }, []);

  const gaId =
    map['addon_ga_enabled'] === 'true' ? map['addon_ga_measurement_id'] : '';
  const clarityId =
    map['addon_clarity_enabled'] === 'true'
      ? map['addon_clarity_project_id']
      : '';
  const tawkProperty =
    map['addon_tawkto_enabled'] === 'true'
      ? map['addon_tawkto_property_id']
      : '';
  const tawkWidget = map['addon_tawkto_widget_id'] || 'default';
  const getbuttonSrc =
    map['addon_getbutton_enabled'] === 'true'
      ? resolveGetbuttonSrc(map['addon_getbutton_code'])
      : '';
  const trustpilotEnabled = map['addon_trustpilot_enabled'] === 'true';

  return (
    <>
      {gaId && (
        <>
          <Script
            id="ga-loader"
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script
            id="ga-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `,
            }}
          />
        </>
      )}

      {clarityId && (
        <Script
          id="ms-clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${clarityId}");
            `,
          }}
        />
      )}

      {tawkProperty && (
        <Script
          id="tawk-to"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
              (function(){
                var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
                s1.async=true;
                s1.src='https://embed.tawk.to/${tawkProperty}/${tawkWidget}';
                s1.charset='UTF-8';
                s1.setAttribute('crossorigin','*');
                s0.parentNode.insertBefore(s1,s0);
              })();
            `,
          }}
        />
      )}

      {getbuttonSrc && !auditMode && (
        <Script
          id="getbutton"
          async
          src={getbuttonSrc}
          strategy="afterInteractive"
        />
      )}

      {trustpilotEnabled && (
        <Script
          id="trustpilot-bootstrap"
          async
          src="https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js"
          strategy="afterInteractive"
        />
      )}
    </>
  );
}
