import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import { StoreProvider } from '@/components/providers/StoreProvider';
import { BrandingProvider } from '@/contexts/BrandingContext';
import { MaintenanceGuard } from '@/components/providers/MaintenanceGuard';
import { Toaster } from '@/components/ui/sonner';
import { GoogleTranslate } from '@/components/google-translate';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'BestSMSHQ',
    template: '%s | BestSMSHQ',
  },
  description:
    'Premium SMS activation and number rental platform. Fast, reliable, and secure.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <StoreProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <BrandingProvider>
              <MaintenanceGuard>
                {children}
                <Toaster />
                <GoogleTranslate />
              </MaintenanceGuard>
            </BrandingProvider>
          </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
