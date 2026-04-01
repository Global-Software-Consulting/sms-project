import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import { StoreProvider } from '@/components/providers/StoreProvider';
import { Toaster } from '@/components/ui/sonner';
import { GoogleTranslate } from '@/components/google-translate';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'SMSPro',
    template: '%s | SMSPro',
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
            {children}
            <Toaster />
            <GoogleTranslate />
          </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
