import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { StoreProvider } from "@/components/providers/StoreProvider";
import { AuthInitializer } from "@/components/providers/AuthInitializer";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToastProvider } from "@/contexts/ToastContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: "SMSPro - Premium SMS Activation Platform",
  description: "Premium SMS Activation & Number Rental platform. Get instant virtual numbers for verification with high success rates from 180+ countries.",
  keywords: "SMS activation, virtual numbers, phone verification, temporary numbers, SMS rental, premium SMS, number rental",
  openGraph: {
    title: "SMSPro - Premium SMS Activation Platform",
    description: "Premium SMS Activation & Number Rental platform with multi-provider support. Instant delivery, 99.7% success rate.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Satoshi Font - Primary font */}
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&display=swap"
          rel="stylesheet"
        />
      </head>
      {/* suppressHydrationWarning prevents hydration mismatch errors caused by browser extensions 
          (e.g., Grammarly) that modify the DOM before React hydrates */}
      <body className="antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <StoreProvider>
            <ToastProvider position="top-right">
              <ErrorBoundary>
                <AuthInitializer>
                  <SessionProvider>
                    {children}
                  </SessionProvider>
                </AuthInitializer>
              </ErrorBoundary>
            </ToastProvider>
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
