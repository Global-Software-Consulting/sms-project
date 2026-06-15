'use client';
import { useEffect } from 'react';
import { getAddons, addonsToMap } from '@/lib/api/settingsApi';

/**
 * Fetches public addon settings once on mount and injects each enabled
 * vendor script (Google Analytics, Microsoft Clarity, Tawk.to,
 * GetButton.io, Trustpilot) directly into the DOM via document.head.
 *
 * Why imperative, not next/script:
 *   third-party widgets (Tawk.to in particular) detach their own
 *   nodes from the DOM after injecting. When the scripts are rendered
 *   inside React's tree, React 19 treats them as hoistable and tries
 *   to unmount them on every navigation. The unmount races with the
 *   widget's own detach and throws
 *     TypeError: Cannot read properties of null (reading 'removeChild')
 *   in the commit-phase deletion walk, leaving the URL on the new
 *   route but the page stuck on the previous one.
 *
 * Imperative injection keeps the <script> tags entirely outside the
 * fiber tree, so React never touches them on navigation and the race
 * cannot happen. Scripts are injected once per pageload and intended
 * to live for the session.
 */
export function AddonsLoader() {
  useEffect(() => {
    let cancelled = false;

    getAddons()
      .then((rows) => {
        if (cancelled) return;
        const map = addonsToMap(rows);

        const gaId =
          map['addon_ga_enabled'] === 'true'
            ? map['addon_ga_measurement_id']
            : '';
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

        if (gaId) {
          injectExternalScript(
            'ga-loader',
            `https://www.googletagmanager.com/gtag/js?id=${gaId}`,
          );
          injectInlineScript(
            'ga-init',
            `window.dataLayer = window.dataLayer || [];
             function gtag(){dataLayer.push(arguments);}
             gtag('js', new Date());
             gtag('config', '${gaId}');`,
          );
        }

        if (clarityId) {
          injectInlineScript(
            'ms-clarity',
            `(function(c,l,a,r,i,t,y){
               c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
               t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
               y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
             })(window, document, "clarity", "script", "${clarityId}");`,
          );
        }

        if (tawkProperty) {
          injectInlineScript(
            'tawk-to',
            `var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
             (function(){
               var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
               s1.async=true;
               s1.src='https://embed.tawk.to/${tawkProperty}/${tawkWidget}';
               s1.charset='UTF-8';
               s1.setAttribute('crossorigin','*');
               s0.parentNode.insertBefore(s1,s0);
             })();`,
          );
        }

        if (getbuttonCode) {
          injectExternalScript(
            'getbutton',
            `https://cdn.getbutton.io/widget/${getbuttonCode}.js`,
          );
        }

        if (trustpilotEnabled) {
          injectExternalScript(
            'trustpilot-bootstrap',
            'https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js',
          );
        }
      })
      .catch(() => {
        /* settings fetch failed — leave addons uninjected */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}

function injectExternalScript(id: string, src: string): void {
  if (document.getElementById(id)) return;
  const s = document.createElement('script');
  s.id = id;
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

function injectInlineScript(id: string, code: string): void {
  if (document.getElementById(id)) return;
  const s = document.createElement('script');
  s.id = id;
  s.text = code;
  document.head.appendChild(s);
}
