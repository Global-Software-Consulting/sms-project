'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Smartphone,
  Phone,
  Star,
  ShoppingBag,
  Wallet,
  Crown,
  MessageSquare,
  Code,
  Users,
  Bell,
  LifeBuoy,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { cn } from './ui/utils';
import { Button } from './ui/button';
import { useBranding } from '@/contexts/BrandingContext';
import { SocialIcons } from '@/components/social-icons';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { siteLogo } = useBranding();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Activation', href: '/dashboard/activation', icon: Smartphone },
    { name: 'Rent Numbers', href: '/dashboard/rent-numbers', icon: Phone },
    { name: 'Orders', href: '/dashboard/orders', icon: ShoppingBag },
    { name: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
    { name: 'Membership', href: '/dashboard/membership', icon: Crown },
    { name: 'Reviews', href: '/dashboard/reviews', icon: MessageSquare },
    { name: 'API Access', href: '/dashboard/api', icon: Code },
    { name: 'Referrals', href: '/dashboard/referrals', icon: Users },
    { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
    { name: 'Support', href: '/dashboard/support', icon: LifeBuoy },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="bg-background/80 fixed inset-0 z-40 backdrop-blur-sm lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'border-sidebar-border fixed top-0 left-0 z-50 h-screen flex-shrink-0 border-r transition-all duration-300 lg:sticky',
          'backdrop-blur-[var(--glass-blur-secondary)] [background:var(--glass-secondary)]',
          'lg:translate-x-0',
          isOpen
            ? 'w-72 translate-x-0 lg:w-64'
            : 'w-72 -translate-x-full lg:w-16 lg:translate-x-0',
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="border-sidebar-border flex h-16 flex-shrink-0 items-center justify-between border-b px-4">
            {isOpen && (
              <Link prefetch={false}
                href="/dashboard"
                className="flex min-w-0 flex-1 items-center space-x-2"
              >
                <div className="from-sidebar-primary to-accent flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br">
                  {siteLogo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={siteLogo}
                      alt="Logo"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="text-sidebar-primary-foreground text-sm font-bold">
                      S
                    </span>
                  )}
                </div>
                <span className="truncate font-bold">BestSMSHQ</span>
              </Link>
            )}
            {/* Desktop collapse toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className={cn(
                'hidden flex-shrink-0 lg:flex',
                !isOpen && 'w-full',
              )}
              title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {isOpen ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            {/* Mobile close button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="flex-shrink-0 lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-0.5 px-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <li key={item.name}>
                    <Link prefetch={false}
                      href={item.href}
                      onClick={() => {
                        if (window.innerWidth < 1024 && isOpen) onToggle();
                      }}
                      className={cn(
                        'flex items-center space-x-3 rounded-lg px-3 py-2.5 transition-all duration-[180ms]',
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground [box-shadow:var(--glow-accent)]'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                      )}
                      title={!isOpen ? item.name : undefined}
                    >
                      <Icon
                        className={cn(
                          'h-5 w-5 flex-shrink-0',
                          isActive && 'text-sidebar-primary',
                        )}
                      />
                      {isOpen && (
                        <span className="truncate text-sm font-medium">
                          {item.name}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {isOpen && (
            <div className="border-sidebar-border/40 border-t px-4 py-3">
              <SocialIcons
                className="flex flex-wrap items-center gap-2"
                iconClassName="h-4 w-4"
              />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
