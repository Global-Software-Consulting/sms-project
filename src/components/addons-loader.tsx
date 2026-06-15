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
export function AddonsLoader() {
  const [map, setMap] = useState<Record<string, string>>({});

  useEffect(() => {
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
  const getbuttonCode =
    map['addon_getbutton_enabled'] === 'true'
      ? map['addon_getbutton_code']
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

      {getbuttonCode && (
        <Script
          id="getbutton"
          async
          src={`https://cdn.getbutton.io/widget/${getbuttonCode}.js`}
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
