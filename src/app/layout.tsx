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
