'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';
import { cn } from './ui/utils';
import { useState } from 'react';

const primaryNav = [
  { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Activate', href: '/dashboard/activation', icon: Smartphone },
  { name: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
  { name: 'Referrals', href: '/dashboard/referrals', icon: Users },
  { name: 'More', href: '#more', icon: MoreHorizontal },
];

const moreNav = [
  { name: 'Rent Numbers', href: '/dashboard/rent-numbers', icon: Phone },
  { name: 'Orders', href: '/dashboard/orders', icon: ShoppingBag },
  { name: 'Membership', href: '/dashboard/membership', icon: Crown },
  { name: 'Reviews', href: '/dashboard/reviews', icon: MessageSquare },
  { name: 'API Access', href: '/dashboard/api', icon: Code },
  { name: 'Support', href: '/dashboard/support', icon: LifeBuoy },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
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
          className="bg-background/80 fixed inset-0 z-40 backdrop-blur-sm lg:hidden"
          onClick={() => setShowMore(false)}
        />
      )}

      {/* More Drawer */}
      <div
        className={cn(
          'fixed right-0 bottom-[64px] left-0 z-50 transition-all duration-300 lg:hidden',
          showMore
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-full opacity-0',
        )}
      >
        <div className="border-border bg-card mx-4 mb-2 overflow-hidden rounded-2xl border shadow-2xl">
          <div className="border-border flex items-center justify-between border-b px-4 py-3">
            <span className="text-sm font-semibold">More Pages</span>
            <button
              onClick={() => setShowMore(false)}
              className="bg-muted flex h-8 w-8 items-center justify-center rounded-full"
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
                    'flex flex-col items-center gap-1.5 rounded-xl p-3 transition-colors',
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-center text-[10px] leading-tight font-medium">
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Tab Bar */}
      <nav className="border-border safe-bottom fixed right-0 bottom-0 left-0 z-50 border-t backdrop-blur-[var(--glass-blur)] [background:var(--glass-secondary)] lg:hidden">
        <div className="grid h-16 grid-cols-5">
          {primaryNav.map((item) => {
            const Icon = item.icon;
            const isMore = item.href === '#more';
            const active = isMore
              ? isMoreActive || showMore
              : isActive(item.href);

            const content = (
              <>
                <div
                  className={cn(
                    'relative flex h-10 w-10 items-center justify-center rounded-xl transition-all',
                    active ? 'bg-primary/10' : '',
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 transition-colors',
                      active ? 'text-primary' : 'text-muted-foreground',
                    )}
                  />
                  {active && (
                    <span className="bg-primary absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full" />
                  )}
                </div>
                <span
                  className={cn(
                    'mt-0.5 text-[10px] font-medium transition-colors',
                    active ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
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
