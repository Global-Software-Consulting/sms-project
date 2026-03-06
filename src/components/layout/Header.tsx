"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing-public" },
    { name: "API", href: "/api" },
    { name: "Membership", href: "/membership" },
    { name: "Knowledge Base", href: "/knowledge-base" },
    { name: "Help", href: "/help" },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border backdrop-blur-[var(--glass-blur)] [background:var(--glass-secondary)]">
      <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-4 gap-2">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-accent">
            <span className="text-base sm:text-xl font-bold text-primary-foreground">S</span>
          </div>
          <span className="font-bold text-base sm:text-xl hidden sm:inline-block">SMSPro</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "text-sm font-medium px-3 py-2 rounded-lg transition-colors",
                isActive(item.href)
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          )}

          <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
            <Link href="/dashboard">Dashboard</Link>
          </Button>

          <Button asChild size="sm" className="hidden md:inline-flex">
            <Link href="/register">Get Started</Link>
          </Button>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden border-t border-border bg-background/98 backdrop-blur-md overflow-hidden transition-all duration-300",
          mobileMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <nav className="container mx-auto px-4 py-3 flex flex-col">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center text-sm font-medium py-3 border-b border-border/50 last:border-0 transition-colors",
                isActive(item.href) ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <div className="flex flex-col gap-2 pt-4 pb-2">
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                Dashboard
              </Link>
            </Button>
            <Button asChild className="w-full">
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                Get Started Free
              </Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}

