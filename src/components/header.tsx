'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Moon, Sun, Menu, X, Globe } from 'lucide-react';
import { Button } from './ui/button';
import { useState, useEffect } from 'react';
import { cn } from './ui/utils';
import { useBranding } from '@/contexts/BrandingContext';
import { LanguagePickerDropdown } from './google-translate';

export function Header() {
  const { theme, setTheme } = useTheme();
  const { siteLogo } = useBranding();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { name: 'Features', href: '/features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'API', href: '/api' },
    { name: 'Membership', href: '/membership' },
    { name: 'Knowledge Base', href: '/knowledge-base' },
    { name: 'Help', href: '/help' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header className="border-border sticky top-0 z-50 w-full border-b backdrop-blur-[var(--glass-blur)] [background:var(--glass-secondary)]">
      <div className="container mx-auto flex h-14 items-center justify-between gap-2 px-4 sm:h-16">
        {/* Logo */}
        <Link href="/" className="flex flex-shrink-0 items-center space-x-2">
          <div className="from-primary to-accent flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br sm:h-10 sm:w-10 overflow-hidden">
            {siteLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={siteLogo} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <span className="text-primary-foreground text-base font-bold sm:text-xl">S</span>
            )}
          </div>
          <span className="hidden text-base font-bold sm:inline-block sm:text-xl">
            BestSMSHQ
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center space-x-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive(item.href)
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-2">
          {/* Language Picker */}
          <div className="relative notranslate">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={(e) => {
                e.stopPropagation();
                setLangOpen((v) => !v);
              }}
              aria-label="Change language"
            >
              <Globe className="h-4 w-4" />
            </Button>
            <LanguagePickerDropdown isOpen={langOpen} onClose={() => setLangOpen(false)} />
          </div>

          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <Sun className="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
              <Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          )}

          <Button
            asChild
            variant="ghost"
            size="sm"
            className="hidden md:inline-flex"
          >
            <Link href="/auth/login">Sign In</Link>
          </Button>

          <Button asChild size="sm" className="hidden md:inline-flex">
            <Link href="/auth/signup">Get Started</Link>
          </Button>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          'border-border bg-background/98 overflow-hidden border-t backdrop-blur-md transition-all duration-300 md:hidden',
          mobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <nav className="container mx-auto flex flex-col px-4 py-3">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'border-border/50 flex items-center border-b py-3 text-sm font-medium transition-colors last:border-0',
                isActive(item.href)
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <div className="flex flex-col gap-2 pt-4 pb-2">
            <Button asChild variant="outline" className="w-full">
              <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                Sign In
              </Link>
            </Button>
            <Button asChild className="w-full">
              <Link
                href="/auth/signup"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
