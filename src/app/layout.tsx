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
