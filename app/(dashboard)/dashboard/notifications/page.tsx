'use client';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Check, X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'sms' | 'deposit' | 'membership' | 'referral' | 'cancel' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'sms',
      title: 'SMS Received',
      message: 'Your verification code has arrived for WhatsApp activation',
      time: '2 minutes ago',
      read: false,
    },
    {
      id: '2',
      type: 'deposit',
      title: 'Deposit Successful',
      message: '$50.00 has been added to your wallet balance',
      time: '1 hour ago',
      read: false,
    },
    {
      id: '3',
      type: 'referral',
      title: 'Referral Earning',
      message: "You earned $5.00 commission from user_8273's purchase",
      time: '3 hours ago',
      read: true,
    },
    {
      id: '4',
      type: 'cancel',
      title: 'Number Canceled',
      message: 'SMS activation for Instagram was auto-canceled due to timeout',
      time: '5 hours ago',
      read: true,
    },
    {
      id: '5',
      type: 'membership',
      title: 'Membership Upgrade',
      message: 'Welcome to Pro tier! Enjoy 25% discount on all services',
      time: '1 day ago',
      read: true,
    },
    {
      id: '6',
      type: 'sms',
      title: 'SMS Received',
      message: 'Verification code received for Telegram activation',
      time: '1 day ago',
      read: true,
    },
    {
      id: '7',
      type: 'system',
      title: 'System Maintenance',
      message: 'Scheduled maintenance on Feb 28, 2026 at 2:00 AM EST',
      time: '2 days ago',
      read: true,
    },
    {
      id: '8',
      type: 'referral',
      title: 'New Referral Signup',
      message: 'user_8456 signed up using your referral link',
      time: '2 days ago',
      read: true,
    },
    {
      id: '9',
      type: 'deposit',
      title: 'Withdrawal Processed',
      message: '$100.00 withdrawal to your PayPal account has been completed',
      time: '3 days ago',
      read: true,
    },
    {
      id: '10',
      type: 'system',
      title: 'New Feature Available',
      message:
        'Elite V3 provider is now available! Experience the highest success rates',
      time: '4 days ago',
      read: true,
    },
  ]);

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success('Notification deleted');
  };

  const clearAll = () => {
    setNotifications([]);
    toast.success('All notifications cleared');
  };

  const getNotificationIcon = (type: Notification['type']) => {
    const icons = {
      sms: '💬',
      deposit: '💰',
      membership: '👑',
      referral: '🎁',
      cancel: '❌',
      system: 'ℹ️',
    };
    return icons[type];
  };

  const getNotificationColor = (type: Notification['type']) => {
    const colors = {
      sms: 'bg-blue-500/10 border-blue-500/20',
      deposit: 'bg-green-500/10 border-green-500/20',
      membership: 'bg-purple-500/10 border-purple-500/20',
      referral: 'bg-orange-500/10 border-orange-500/20',
      cancel: 'bg-red-500/10 border-red-500/20',
      system: 'bg-gray-500/10 border-gray-500/20',
    };
    return colors[type];
  };

  const filteredNotifications =
    filter === 'all' ? notifications : notifications.filter((n) => !n.read);

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
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
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
            onValueChange={(v) => setFilter(v as 'all' | 'unread')}
            className="w-full"
          >
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="all">
                All ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {filteredNotifications.length === 0 ? (
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
              {filteredNotifications.map((notification) => (
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
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border text-2xl ${getNotificationColor(notification.type)}`}
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
                      {notification.time}
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
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
