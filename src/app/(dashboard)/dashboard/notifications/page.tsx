'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Check, X, Trash2, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { getNotificationIcon } from '@/lib/api/notificationsApi';
import { formatDistanceToNow } from 'date-fns';

export default function Notifications() {
  const {
    notifications,
    unreadCount,
    totalPages,
    currentPage,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllRead,
    removeNotification,
    clearAll,
    setCurrentPage,
  } = useNotifications();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const handleFilterChange = (value: string) => {
    const newFilter = value as 'all' | 'unread';
    setFilter(newFilter);
    setCurrentPage(1);
    fetchNotifications({
      page: 1,
      limit: 20,
      isRead: newFilter === 'unread' ? false : undefined,
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchNotifications({
      page,
      limit: 20,
      isRead: filter === 'unread' ? false : undefined,
    });
  };

  const getNotificationBgColor = (type: string): string => {
    if (type.startsWith('PAYMENT_') || type === 'ORDER_REFUNDED') return 'bg-green-500/10 border-green-500/20';
    if (type.startsWith('ORDER_')) return 'bg-blue-500/10 border-blue-500/20';
    if (type === 'SMS_RECEIVED') return 'bg-cyan-500/10 border-cyan-500/20';
    if (type.startsWith('MEMBERSHIP_')) return 'bg-purple-500/10 border-purple-500/20';
    if (type.startsWith('REFERRAL_')) return 'bg-orange-500/10 border-orange-500/20';
    if (type === 'SECURITY_ALERT' || type === 'ACCOUNT_WARNING' || type === 'ORDER_CANCELLED') return 'bg-red-500/10 border-red-500/20';
    if (type === 'PROMO' || type === 'WELCOME') return 'bg-pink-500/10 border-pink-500/20';
    return 'bg-gray-500/10 border-gray-500/20';
  };

  const formatTime = (dateString: string): string => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            Stay updated with all your activities
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead}>
              <Check className="mr-2 h-4 w-4" />
              Mark all read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAll}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Notifications
            </CardTitle>
            <Bell className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <Badge variant="destructive">{unreadCount}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-destructive text-2xl font-bold">
              {unreadCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Read</CardTitle>
            <Check className="text-success h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-success text-2xl font-bold">
              {notifications.length - unreadCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <Tabs
            value={filter}
            onValueChange={handleFilterChange}
            className="w-full"
          >
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center">
              <Bell className="text-muted-foreground mx-auto mb-4 h-16 w-16 opacity-20" />
              <h3 className="mb-2 text-lg font-semibold">No notifications</h3>
              <p className="text-muted-foreground text-sm">
                {filter === 'unread'
                  ? "You've read all your notifications"
                  : "You don't have any notifications yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`group relative flex items-start gap-4 rounded-lg border p-4 transition-all ${
                    !notification.read
                      ? 'bg-primary/5 border-primary/20 hover:bg-primary/10'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border text-2xl ${getNotificationBgColor(notification.type)}`}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="flex items-center gap-2 leading-tight font-semibold">
                        {notification.title}
                        {!notification.read && (
                          <div className="bg-primary h-2 w-2 shrink-0 rounded-full" />
                        )}
                      </h4>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {notification.message}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {formatTime(notification.createdAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-1">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => removeNotification(notification.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
