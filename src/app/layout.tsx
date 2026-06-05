import type { Metadata, Viewport } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import { StoreProvider } from '@/components/providers/StoreProvider';
import { BrandingProvider } from '@/contexts/BrandingContext';
import { MaintenanceGuard } from '@/components/providers/MaintenanceGuard';
import { Toaster } from '@/components/ui/sonner';
import { GoogleTranslate } from '@/components/google-translate';
import { AddonsLoader } from '@/components/addons-loader';
import {
  SITE_URL,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_DESCRIPTION,
  DEFAULT_KEYWORDS,
  DEFAULT_OG_IMAGE,
  TWITTER_HANDLE,
} from '@/lib/seo/site-config';
import {
  JsonLd,
  organizationSchema,
  websiteSchema,
} from '@/lib/seo/structured-data';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: DEFAULT_KEYWORDS,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: { email: false, address: false, telephone: false },
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: TWITTER_HANDLE,
    creator: TWITTER_HANDLE,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/*
          Satoshi font (Fontshare) loaded non-blocking. Was previously
          @import'd inside globals.css, which Lighthouse flagged as
          render-blocking (~300 ms). Preconnects warm DNS/TLS for both
          the CSS API and the CDN that serves the woff2 files; the
          preload tells the browser this resource is high-priority; the
          inline script below attaches the actual <link rel="stylesheet">
          after the parser is unblocked. `display=swap` in the URL means
          fallback fonts render immediately and Satoshi swaps when ready.
        */}
        <link
          rel="preconnect"
          href="https://api.fontshare.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://cdn.fontshare.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="style"
          href="https://api.fontshare.com/v2/css?f[]=satoshi@700,500,400&display=swap"
        />
        {/*
          Inject the stylesheet via inline script so the browser does not
          treat it as render-blocking. Preload above warms the cache,
          this <script> just attaches it once the parser has finished
          discovering critical resources. `display=swap` in the URL means
          fallback fonts render immediately and Satoshi swaps when ready.
        */}
        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: `(function(){var l=document.createElement('link');l.rel='stylesheet';l.href='https://api.fontshare.com/v2/css?f[]=satoshi@700,500,400&display=swap';document.head.appendChild(l);})();`,
          }}
        />
        <noscript>
          <link
            rel="stylesheet"
            href="https://api.fontshare.com/v2/css?f[]=satoshi@700,500,400&display=swap"
          />
        </noscript>
        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema()} />
        {/*
          Removed: previously this <head> ran an inline script that
          monkey-patched Node.prototype.removeChild and
          Node.prototype.insertBefore globally, plus installed window
          error listeners that swallowed "Cannot read properties of
          null" errors. The intent was to absorb Google-Translate-
          induced text-node reparenting that throws inside React's
          reconciler.

          Live tracing on the Contabo prod deployment identified the
          patches as the cause of the "first click works, subsequent
          clicks need 2 clicks" bug. Sequence:
            1. Page lands. After ~2s, third-party scripts injected by
               AddonsLoader (Tawk.to chat, Trustpilot, GA, Clarity)
               finish mutating the DOM — wrapping/inserting nodes that
               React did not create.
            2. User clicks another <Link>.
            3. React's reconciler calls
                 parent.insertBefore(newNode, refNode)
               where `refNode.parentNode !== parent` because the
               third party reparented the node. The patch silently
               returns `newNode` without inserting it.
            4. React's fiber tree believes the DOM updated; the real
               DOM did not. URL changes (router accepted the push)
               but visible content does not change.
            5. window.error swallow listener catches the
               null-property TypeError before it surfaces in DevTools
               — bug invisible in logs.
            6. Second click forces React to re-reconcile from a
               cleaner reference path and the DOM finally syncs.

          Google Translate is now lazy-loaded (only mounts when the
          user opens the language picker), so for ~all users the
          patches were pure interference. If a user does open the
          picker and GT throws, the resulting error surfacing in the
          console is acceptable — silent fiber/DOM divergence is not.
        */}
      </head>
      <body suppressHydrationWarning>
        <StoreProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <BrandingProvider>
              <MaintenanceGuard>
                {children}
                <Toaster />
                <GoogleTranslate />
                <AddonsLoader />
              </MaintenanceGuard>
            </BrandingProvider>
          </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
