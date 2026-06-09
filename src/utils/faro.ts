import {
  initializeFaro,
  getWebInstrumentations,
  type Faro,
} from '@grafana/faro-web-sdk';

/**
 * Grafana Faro RUM bootstrap.
 *
 * Adapted from the obenan-dashboard pattern for Next.js App Router (no
 * react-router integration). Initializes Faro once with the collector URL +
 * app name provided by the admin "Addons Management" settings. Captures
 * uncaught errors, web vitals, console output, and basic session info.
 *
 * Safe to call multiple times — short-circuits if already initialized so
 * client-side route changes do not re-init.
 */

interface InitFaroArgs {
  url: string;
  appName: string;
  environment?: string;
  appVersion?: string;
}

let faroInstance: Faro | null = null;

export function initFaro({
  url,
  appName,
  environment,
  appVersion = '1.0.0',
}: InitFaroArgs): Faro | null {
  if (typeof window === 'undefined') return null;
  if (faroInstance) return faroInstance;
  if (!url || !appName) return null;

  try {
    faroInstance = initializeFaro({
      url,
      app: {
        name: appName,
        version: appVersion,
        environment: environment ?? process.env.NODE_ENV ?? 'production',
      },
      instrumentations: [
        ...getWebInstrumentations({ captureConsole: true }),
      ],
      consoleInstrumentation: {
        consoleErrorAsLog: true,
        disabledLevels: [],
      },
    });

    return faroInstance;
  } catch (error) {
    // Never let observability boot break the app.
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('Grafana Faro: initialization failed', error);
    }
    return null;
  }
}

export function getFaro(): Faro | null {
  return faroInstance;
}
