'use client';
import { useTheme } from 'next-themes';
import { Moon, Sun, Bell, User, Check, X, Menu, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import Link from 'next/link';
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks';
import { getWalletBalance, formatBalance, WalletBalance } from '@/lib/api/walletApi';
import { getCurrentMembership, CurrentMembershipResponse } from '@/lib/api/membershipApi';
import { useNotifications } from '@/contexts/NotificationContext';
import { getNotificationIcon } from '@/lib/api/notificationsApi';
import { formatDistanceToNow } from 'date-fns';

interface DashboardHeaderProps {
  onMenuClick?: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps = {}) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
  const [membership, setMembership] = useState<CurrentMembershipResponse | null>(null);

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllRead,
    removeNotification,
    clearAll,
  } = useNotifications();

  // Fetch wallet balance and membership on mount
  const fetchHeaderData = useCallback(async () => {
    try {
      const [walletRes, membershipRes] = await Promise.allSettled([
        getWalletBalance(),
        getCurrentMembership(),
      ]);

      if (walletRes.status === 'fulfilled') {
        setWalletBalance(walletRes.value);
      }
      if (membershipRes.status === 'fulfilled') {
        setMembership(membershipRes.value);
      }
    } catch (error) {
      console.error('Failed to fetch header data:', error);
    }
  }, []);

  const hasFetchedRef = useRef(false);
  useEffect(() => {
    setMounted(true);
    if (isAuthenticated && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchHeaderData();
    }
  }, [isAuthenticated, fetchHeaderData]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      toast.success('Signed out successfully');
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Failed to sign out. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const formatTime = (dateString: string): string => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  return (
    <header className="border-border sticky top-0 z-40 w-full border-b backdrop-blur-[var(--glass-blur)] [background:var(--glass-secondary)]">
      <div className="flex h-14 items-center justify-between gap-2 px-3 sm:h-16 sm:px-4 md:px-6">
        {/* Left side - Mobile menu button */}
        <div className="flex min-w-0 items-center gap-2">
          {onMenuClick && (
            <button
              className="hover:bg-muted flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition-colors lg:hidden"
              onClick={onMenuClick}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          {/* Logo shown only on mobile when sidebar is hidden */}
          <span className="truncate text-sm font-bold lg:hidden">SMSPro</span>
        </div>

        {/* Right side - Actions */}
        <div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-2 sm:space-x-1">
          {/* Wallet Balance */}
          <div className="bg-card border-border flex items-center space-x-1 rounded-lg border px-2 py-1.5 sm:space-x-2 sm:px-3">
            <span className="text-muted-foreground hidden text-xs sm:inline sm:text-sm">
              Balance:
            </span>
            <span className="text-primary text-xs font-semibold sm:text-sm">
              {walletBalance
                ? formatBalance(walletBalance.balance, walletBalance.currency)
                : '$0.00'}
            </span>
          </div>

          {/* Theme Toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
            >
              <Sun className="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
              <Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          )}

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-9 w-9" aria-label="Notifications">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="bg-destructive text-destructive-foreground absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-semibold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-[calc(100vw-2rem)] max-w-sm sm:w-80 md:w-96"
            >
              <div className="flex items-center justify-between px-2 py-2">
                <DropdownMenuLabel className="p-0">
                  Notifications
                </DropdownMenuLabel>
                {notifications.length > 0 && (
                  <div className="flex items-center gap-1">
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={markAllRead}
                      >
                        <Check className="mr-1 h-3 w-3" />
                        Mark all read
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive h-7 text-xs"
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
                  <Bell className="text-muted-foreground mx-auto mb-3 h-12 w-12 opacity-20" />
                  <p className="text-muted-foreground text-sm">
                    No notifications
                  </p>
                </div>
              ) : (
                <>
                  <ScrollArea className="h-[340px] sm:h-[400px]">
                    <div className="space-y-1 p-1">
                      {notifications.slice(0, 5).map((notification) => (
                        <div
                          key={notification.id}
                          className={`group relative flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-colors ${
                            !notification.read
                              ? 'bg-primary/5 hover:bg-primary/10'
                              : 'hover:bg-muted/50'
                          }`}
                          onClick={() => !notification.read && markAsRead(notification.id)}
                        >
                          <div className="mt-0.5 shrink-0 text-xl sm:text-2xl">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm leading-tight font-semibold">
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <div className="bg-primary mt-1 h-2 w-2 shrink-0 rounded-full" />
                              )}
                            </div>
                            <p className="text-muted-foreground line-clamp-2 text-xs">
                              {notification.message}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {formatTime(notification.createdAt)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
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
                      <Link href="/dashboard/notifications">
                        View All Notifications
                      </Link>
                    </Button>
                  </div>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-9 w-9" aria-label="User menu">
                <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full">
                  <User className="h-4 w-4" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">
                    {user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {user?.email || 'No email'}
                  </p>
                  <Badge variant="secondary" className="mt-1 w-fit">
                    {membership?.currentPlan?.name || 'Free'} Member
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/membership">Upgrade Plan</Link>
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
                onClick={handleSignOut}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing out...
                  </>
                ) : (
                  'Sign Out'
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
