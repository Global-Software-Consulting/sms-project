import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SMS Activation Platform - Premium Virtual Numbers",
  description: "Premium SMS Activation & Number Rental platform. Get instant virtual numbers for verification with high success rates.",
  keywords: "SMS activation, virtual numbers, phone verification, temporary numbers, SMS rental",
  openGraph: {
    title: "SMS Activation Platform - Premium Virtual Numbers",
    description: "Premium SMS Activation & Number Rental platform with multi-provider support.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Satoshi Font - Primary font for dark mode */}
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
