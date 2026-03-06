"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  X
} from "lucide-react";
import { cn } from "@/components/ui/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Activation", href: "/dashboard/activate", icon: Smartphone },
    { name: "Rent Numbers", href: "/dashboard/rent-numbers", icon: Phone },
    { name: "Favorites", href: "/dashboard/favorites", icon: Star },
    { name: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
    { name: "Wallet", href: "/dashboard/wallet", icon: Wallet },
    { name: "Membership", href: "/dashboard/pricing", icon: Crown },
    { name: "Reviews", href: "/dashboard/reviews", icon: MessageSquare },
    { name: "API Access", href: "/dashboard/api", icon: Code },
    { name: "Referrals", href: "/dashboard/referrals", icon: Users },
    { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
    { name: "Support", href: "/dashboard/support", icon: LifeBuoy },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-screen border-r border-sidebar-border transition-all duration-300 flex-shrink-0",
          "[background:var(--glass-secondary)] backdrop-blur-[var(--glass-blur-secondary)]",
          // Mobile: slide in/out from left, always w-64 when open
          "lg:translate-x-0",
          isOpen
            ? "translate-x-0 w-72 lg:w-64"          // open on all screens
            : "-translate-x-full w-72 lg:translate-x-0 lg:w-16" // hidden mobile, icon-only desktop
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border flex-shrink-0">
            {(isOpen) && (
              <Link href="/dashboard" className="flex items-center space-x-2 flex-1 min-w-0">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-sidebar-primary to-accent flex-shrink-0">
                  <span className="text-sm font-bold text-sidebar-primary-foreground">S</span>
                </div>
                <span className="font-bold truncate">SMSPro</span>
              </Link>
            )}
            {/* Desktop collapse toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className={cn("hidden lg:flex flex-shrink-0", !isOpen && "w-full")}
              title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
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
              className="lg:hidden flex-shrink-0"
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
                    <Link
                      href={item.href}
                      onClick={() => {
                        // Auto-close sidebar on mobile after navigation
                        if (typeof window !== 'undefined' && window.innerWidth < 1024 && isOpen) onToggle();
                      }}
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-[180ms]",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground [box-shadow:var(--glow-accent)]"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      )}
                      title={!isOpen ? item.name : undefined}
                    >
                      <Icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-sidebar-primary")} />
                      {isOpen && <span className="text-sm font-medium truncate">{item.name}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
}

