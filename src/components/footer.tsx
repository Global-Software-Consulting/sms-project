'use client';
import Link from 'next/link';
import { Twitter, Github, Linkedin } from 'lucide-react';
import { useBranding } from '@/contexts/BrandingContext';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { siteLogo } = useBranding();

  return (
    <footer className="border-border bg-card border-t">
      <div className="container mx-auto px-4 py-10 sm:py-12">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 sm:gap-8 md:grid-cols-4">
          {/* Brand — full width on smallest, half on sm */}
          <div className="col-span-2 space-y-4 sm:col-span-2 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="from-primary to-accent flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br sm:h-10 sm:w-10 overflow-hidden">
                {siteLogo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={siteLogo} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-primary-foreground text-base font-bold sm:text-xl">S</span>
                )}
              </div>
              <span className="text-lg font-bold sm:text-xl">BestSMSHQ</span>
            </div>
            <p className="text-muted-foreground max-w-xs text-sm">
              Premium SMS activation and number rental platform. Fast, reliable,
              and secure.
            </p>
            <div className="flex space-x-3">
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground p-1 transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground p-1 transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground p-1 transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="mb-3 text-sm font-semibold sm:mb-4 sm:text-base">
              Product
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/features"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/membership"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Membership
                </Link>
              </li>
              <li>
                <Link
                  href="/api"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  API
                </Link>
              </li>
              <li>
                <Link
                  href="/status"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Status
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="mb-3 text-sm font-semibold sm:mb-4 sm:text-base">
              Resources
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/blog"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/reviews"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Reviews
                </Link>
              </li>
              <li>
                <Link
                  href="/knowledge-base"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Knowledge Base
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-3 text-sm font-semibold sm:mb-4 sm:text-base">
              Company
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/referral"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Referral Program
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Terms of Use
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-border mt-8 border-t pt-6 sm:pt-8">
          <div className="text-muted-foreground flex flex-col items-center justify-between gap-3 text-sm sm:flex-row">
            <p className="text-center sm:text-left">
              &copy; {currentYear} BestSMSHQ. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <Link
                href="/privacy"
                className="hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="hover:text-foreground transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/payment-policy"
                className="hover:text-foreground transition-colors"
              >
                Payment Policy
              </Link>
              <Link
                href="/disclaimer"
                className="hover:text-foreground transition-colors"
              >
                Disclaimer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
