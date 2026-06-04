'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ExternalLink, ChevronRight } from 'lucide-react';
import { useBranding } from '@/contexts/BrandingContext';
import { getPublicAds, type Ad } from '@/lib/api/adminModulesApi';
import { SocialIcons } from '@/components/social-icons';
import { TrustpilotWidget } from '@/components/trustpilot-widget';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { siteLogo } = useBranding();
  const [ads, setAds] = useState<Ad[]>([]);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);

  useEffect(() => {
    getPublicAds()
      .then((data) =>
        setAds(Array.isArray(data) ? data.filter((a) => a.isActive) : []),
      )
      .catch(() => setAds([]));
  }, []);

  return (
    <footer className="border-border bg-card border-t">
      <div className="container mx-auto px-4 py-10 sm:py-12">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 sm:gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand — full width on smallest, half on sm */}
          <div className="col-span-2 space-y-4 sm:col-span-2 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="from-primary to-accent flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br sm:h-10 sm:w-10">
                {siteLogo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={siteLogo}
                    alt="Logo"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="text-primary-foreground text-base font-bold sm:text-xl">
                    S
                  </span>
                )}
              </div>
              <span className="text-lg font-bold sm:text-xl">BestSMSHQ</span>
            </div>
            <p className="text-muted-foreground max-w-xs text-sm">
              Premium SMS activation and number rental platform. Fast, reliable,
              and secure.
            </p>
            <SocialIcons />
            <TrustpilotWidget />
          </div>

          {/* Product */}
          <div>
            <h3 className="mb-3 text-sm font-semibold sm:mb-4 sm:text-base">
              Product
            </h3>
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
            <h3 className="mb-3 text-sm font-semibold sm:mb-4 sm:text-base">
              Resources
            </h3>
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
            <h3 className="mb-3 text-sm font-semibold sm:mb-4 sm:text-base">
              Company
            </h3>
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

          {/* Our Websites (Ads) */}
          {ads.length > 0 && (
            <div className="col-span-2 sm:col-span-2 md:col-span-4 lg:col-span-1">
              <h3 className="mb-3 text-sm font-semibold sm:mb-4 sm:text-base">
                Our Websites
              </h3>
              <div className="space-y-3">
                {ads.map((ad) => (
                  <div
                    key={ad.id}
                    className="group border-border hover:border-primary/40 relative flex items-center gap-3 rounded-lg border p-2 transition-colors"
                  >
                    {ad.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={ad.imageUrl}
                        alt={ad.title}
                        className="h-12 w-12 flex-shrink-0 rounded object-cover"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{ad.title}</p>
                      {/* Description hidden on hover, replaced by "View Details" */}
                      {ad.description && (
                        <p className="text-muted-foreground truncate text-xs transition-opacity group-hover:opacity-0">
                          {ad.description}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedAd(ad)}
                        className="text-primary absolute bottom-2 left-[60px] flex items-center gap-0.5 text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        View Details
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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

      {/* Ad details dialog */}
      <Dialog
        open={!!selectedAd}
        onOpenChange={(open) => !open && setSelectedAd(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedAd?.title}</DialogTitle>
            {selectedAd?.description && (
              <DialogDescription className="pt-2 text-base leading-relaxed">
                {selectedAd.description}
              </DialogDescription>
            )}
          </DialogHeader>

          {selectedAd?.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={selectedAd.imageUrl}
              alt={selectedAd.title}
              className="border-border max-h-64 w-full rounded-lg border object-cover"
            />
          )}

          {selectedAd?.targetUrl && (
            <DialogFooter>
              <Button asChild>
                <a
                  href={selectedAd.targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  Learn More
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </footer>
  );
}
