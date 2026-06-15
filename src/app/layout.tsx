import type { Metadata, Viewport } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import { StoreProvider } from '@/components/providers/StoreProvider';
import { BrandingProvider } from '@/contexts/BrandingContext';
import { MaintenanceGuard } from '@/components/providers/MaintenanceGuard';
import { Toaster } from '@/components/ui/sonner';
import { GoogleTranslate } from '@/components/google-translate';
import { AddonsLoader } from '@/components/addons-loader';
import { FaroInit } from '@/components/faro-init';
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
import { ForceFullNavigation } from '@/components/force-full-navigation';

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
          Targeted removeChild guard.

          Background: third-party scripts injected by AddonsLoader
          (Tawk.to chat widget, Microsoft Clarity, Google Analytics,
          Trustpilot, etc.) detach DOM nodes that React still tracks
          in its fiber tree. When React next tries to commit a
          re-render that involves removing one of those nodes,
            parent.removeChild(child)
          throws "Cannot read properties of null (reading
          'removeChild')" because child.parentNode is already null —
          the third party detached it. The commit aborts; the new
          route's RSC payload arrives but never visually applies.
          User sees: URL bar moves, sidebar/nav active state moves,
          but main content stays on the previous page.

          Prior history (read before changing this):
          - We had a broader patch that also wrapped insertBefore and
            no-op'd whenever `refNode.parentNode !== this`. That
            version caused a "first click works, second click needs
            two clicks" bug because it ALSO silently no-op'd
            legitimate React reconciliations of nodes a third party
            had reparented (insertBefore case) — see PR #43 commit
            for the full trace.
          - We then removed the patch entirely. That made the silent
            no-op gone, but exposed the original removeChild race:
            navigation now actually breaks instead of being a silent
            corruption. Live console traces show the TypeError firing
            inside the framework chunk on transitions like / -> /api
            -> /pricing.

          This narrower version:
          - Only intercepts removeChild, NOT insertBefore (the
            insertBefore case was the source of the 2-click bug).
          - Only no-ops when child.parentNode === null (already fully
            detached by a third party — React's intent was to remove
            it, the third party beat us to it, no-op is correct).
          - Calls the original removeChild in every other case,
            including the dangerous "child reparented to a different
            parent" case which SHOULD throw so we notice.

          Trade-off accepted: if the underlying React-vs-third-party
          conflict mutates to a different shape, this patch won't
          cover it. The real fix is to identify which AddonsLoader
          script is doing the detachment and either guard it or
          remove it. Until then this prevents the commit abort.
        */}
        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: `(function(){if(typeof Node==='undefined')return;var o=Node.prototype.removeChild;Node.prototype.removeChild=function(c){if(c&&c.parentNode===null)return c;return o.apply(this,arguments);};})();`,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <FaroInit />
        <ForceFullNavigation />
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
