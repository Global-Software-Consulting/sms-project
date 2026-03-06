"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Bell, User, Check, X, Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useWalletBalance } from "@/hooks/useWallet";

interface Notification {
  id: string;
  type: "sms" | "deposit" | "membership" | "referral" | "cancel" | "system";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface DashboardHeaderProps {
  onMenuClick?: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const { balance } = useWalletBalance();
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "sms",
      title: "SMS Received",
      message: "Your verification code has arrived for WhatsApp",
      time: "2 minutes ago",
      read: false
    },
    {
      id: "2",
      type: "deposit",
      title: "Deposit Successful",
      message: "$50.00 added to your wallet balance",
      time: "1 hour ago",
      read: false
    },
    {
      id: "3",
      type: "referral",
      title: "Referral Earning",
      message: "You earned $5.00 from user_8273's purchase",
      time: "3 hours ago",
      read: true
    },
    {
      id: "4",
      type: "cancel",
      title: "Number Canceled",
      message: "SMS activation for Instagram was auto-canceled",
      time: "5 hours ago",
      read: true
    },
    {
      id: "5",
      type: "membership",
      title: "Membership Upgrade",
      message: "Welcome to Pro tier! Enjoy 10% discount",
      time: "1 day ago",
      read: true
    },
    {
      id: "6",
      type: "system",
      title: "System Maintenance",
      message: "Scheduled maintenance on Feb 28, 2026 at 2:00 AM EST",
      time: "2 days ago",
      read: true
    },
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const clearAll = () => {
    setNotifications([]);
    toast.success("All notifications cleared");
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    const icons = {
      sms: "💬",
      deposit: "💰",
      membership: "👑",
      referral: "🎁",
      cancel: "❌",
      system: "ℹ️"
    };
    return icons[type];
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border backdrop-blur-[var(--glass-blur)] [background:var(--glass-secondary)]">
      <div className="flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 md:px-6 gap-2">
        {/* Left side - Mobile menu button */}
        <div className="flex items-center gap-2 min-w-0">
          {onMenuClick && (
            <button
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-muted transition-colors flex-shrink-0"
              onClick={onMenuClick}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          {/* Logo shown only on mobile when sidebar is hidden */}
          <span className="lg:hidden font-bold text-sm truncate">SMSPro</span>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 sm:space-x-1 flex-shrink-0">
          {/* Wallet Balance — hidden on very small screens */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-card border border-border">
            <span className="text-xs sm:text-sm text-muted-foreground">Balance:</span>
            <span className="text-xs sm:text-sm font-semibold text-primary">
              ${balance?.toFixed(2) || '0.00'}
            </span>
          </div>

          {/* Theme Toggle */}
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

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-9 w-9">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-semibold">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] max-w-sm sm:w-80 md:w-96">
              <div className="flex items-center justify-between px-2 py-2">
                <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
                {notifications.length > 0 && (
                  <div className="flex items-center gap-1">
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={markAllAsRead}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Mark all read
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-destructive hover:text-destructive"
                      onClick={clearAll}
                    >
                      Clear all
                    </Button>
                  </div>
                )}
              </div>
              <DropdownMenuSeparator />
              
              {notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-20" />
                  <p className="text-sm text-muted-foreground">No notifications</p>
                </div>
              ) : (
                <>
                  <ScrollArea className="h-[340px] sm:h-[400px]">
                    <div className="space-y-1 p-1">
                      {notifications.slice(0, 5).map((notification) => (
                        <div
                          key={notification.id}
                          className={`group relative flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
                            !notification.read 
                              ? "bg-primary/5 hover:bg-primary/10" 
                              : "hover:bg-muted/50"
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="text-xl sm:text-2xl shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-semibold leading-tight">
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {notification.time}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <DropdownMenuSeparator />
                  <div className="p-2">
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/dashboard/notifications">View All Notifications</Link>
                    </Button>
                  </div>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-9 w-9">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground">
                  <User className="h-4 w-4" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
                  <Badge variant="secondary" className="w-fit mt-1">
                    {user?.membershipTier || 'Free'} Member
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/pricing">Upgrade Plan</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/support">Support</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/">Back to Home</Link>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

