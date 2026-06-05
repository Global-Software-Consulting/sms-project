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
          Google Translate (and a few browser extensions) wrap text nodes
          in <font> tags, which makes React throw
          "Cannot read properties of null (reading 'removeChild')"
          on the first navigation that unmounts touched text. Patch
          Node.prototype.removeChild / insertBefore so they no-op when
          the reference node has been re-parented by a third party.
          Loaded inline in <head> so it runs before React commits any DOM.
        */}
        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                if (typeof Node !== 'undefined') {
                  var origRemove = Node.prototype.removeChild;
                  Node.prototype.removeChild = function (child) {
                    if (child && child.parentNode !== this) {
                      return child;
                    }
                    return origRemove.apply(this, arguments);
                  };
                  var origInsert = Node.prototype.insertBefore;
                  Node.prototype.insertBefore = function (newNode, refNode) {
                    if (refNode && refNode.parentNode !== this) {
                      return newNode;
                    }
                    return origInsert.apply(this, arguments);
                  };
                }
                // The prototype patch above covers \`parent.removeChild(orphan)\`,
                // but React's commit-phase also does \`stateNode.parentNode.removeChild(stateNode)\`
                // where \`stateNode.parentNode\` is null after Google Translate has
                // detached the node — that throws on the property access itself,
                // before we ever reach the prototype method. React's own
                // try/catch absorbs the fiber-level error and keeps rendering,
                // but the throw still surfaces as an Uncaught TypeError in the
                // console. Swallow exactly that pattern so logs stay clean.
                if (typeof window !== 'undefined') {
                  var swallow = function (msg) {
                    return (
                      typeof msg === 'string' &&
                      msg.indexOf('Cannot read properties of null') !== -1 &&
                      (msg.indexOf('removeChild') !== -1 ||
                        msg.indexOf('insertBefore') !== -1)
                    );
                  };
                  window.addEventListener(
                    'error',
                    function (ev) {
                      var m = ev && ev.error && ev.error.message;
                      if (swallow(m)) {
                        ev.preventDefault();
                        ev.stopImmediatePropagation();
                      }
                    },
                    true,
                  );
                  window.addEventListener('unhandledrejection', function (ev) {
                    var reason = ev && ev.reason;
                    var m = reason && reason.message;
                    if (swallow(m)) {
                      ev.preventDefault();
                    }
                  });

                  // Previously this script also installed a pre-hydration
                  // anchor-click fallback that hard-navigated to the href
                  // if the URL hadn't moved within 220ms. Live diagnostic
                  // on the Contabo deployment (where RSC roundtrips are
                  // ~300ms, not the <50ms of local dev) showed the 220ms
                  // timeout was firing BEFORE the in-flight RSC fetch
                  // returned — triggering location.href and aborting every
                  // in-flight request (mass ERR_ABORTED). That presented as
                  // "URL changed, page didn't render" because providers
                  // (Branding/Maintenance/Addons) aborted mid-flight. The
                  // post-hydration <LinkClickRecovery /> component is the
                  // proper place for this — it sees the actual router
                  // state, not just window.location.
                }
              })();
            `,
          }}
        />
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
