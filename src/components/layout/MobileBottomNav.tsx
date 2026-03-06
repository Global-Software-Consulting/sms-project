"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Smartphone,
  Wallet,
  Users,
  MoreHorizontal,
  Phone,
  ShoppingBag,
  Crown,
  MessageSquare,
  Code,
  LifeBuoy,
  Settings,
  X,
  Star,
} from "lucide-react";
import { cn } from "@/components/ui/utils";
import { useState } from "react";

const primaryNav = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "Activate", href: "/dashboard/activate", icon: Smartphone },
  { name: "Wallet", href: "/dashboard/wallet", icon: Wallet },
  { name: "Referrals", href: "/dashboard/referrals", icon: Users },
  { name: "More", href: "#more", icon: MoreHorizontal },
];

const moreNav = [
  { name: "Rent Numbers", href: "/dashboard/rent-numbers", icon: Phone },
  { name: "Favorites", href: "/dashboard/favorites", icon: Star },
  { name: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
  { name: "Membership", href: "/dashboard/pricing", icon: Crown },
  { name: "Reviews", href: "/dashboard/reviews", icon: MessageSquare },
  { name: "API Access", href: "/dashboard/api", icon: Code },
  { name: "Support", href: "/dashboard/support", icon: LifeBuoy },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);

  const isActive = (href: string) => pathname === href;
  const isMoreActive = moreNav.some((item) => isActive(item.href));

  return (
    <>
      {/* More Drawer Overlay */}
      {showMore && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setShowMore(false)}
        />
      )}

      {/* More Drawer */}
      <div
        className={cn(
          "fixed bottom-[64px] left-0 right-0 z-50 lg:hidden transition-all duration-300",
          showMore ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        )}
      >
        <div className="mx-4 mb-2 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="font-semibold text-sm">More Pages</span>
            <button
              onClick={() => setShowMore(false)}
              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-1 p-3">
            {moreNav.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setShowMore(false)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-3 rounded-xl transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[10px] font-medium leading-tight text-center">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-border [background:var(--glass-secondary)] backdrop-blur-[var(--glass-blur)] safe-bottom">
        <div className="grid grid-cols-5 h-16">
          {primaryNav.map((item) => {
            const Icon = item.icon;
            const isMore = item.href === "#more";
            const active = isMore ? isMoreActive || showMore : isActive(item.href);

            const content = (
              <>
                <div className={cn(
                  "relative flex items-center justify-center w-10 h-10 rounded-xl transition-all",
                  active ? "bg-primary/10" : ""
                )}>
                  <Icon className={cn("h-5 w-5 transition-colors", active ? "text-primary" : "text-muted-foreground")} />
                  {active && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                  )}
                </div>
                <span className={cn(
                  "text-[10px] font-medium transition-colors mt-0.5",
                  active ? "text-primary" : "text-muted-foreground"
                )}>
                  {item.name}
                </span>
              </>
            );

            if (isMore) {
              return (
                <button
                  key={item.name}
                  onClick={() => setShowMore(!showMore)}
                  className="flex flex-col items-center justify-center gap-0 pt-1"
                >
                  {content}
                </button>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex flex-col items-center justify-center gap-0 pt-1"
              >
                {content}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Spacer to prevent content going behind bottom nav */}
      <div className="h-16 lg:hidden" />
    </>
  );
}

