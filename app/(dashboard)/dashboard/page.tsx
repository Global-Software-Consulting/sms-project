'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Wallet,
  Phone,
  TrendingUp,
  Crown,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';

export default function Dashboard() {
  const [quickCountry, setQuickCountry] = useState('');
  const [quickService, setQuickService] = useState('');
  const [quickProvider, setQuickProvider] = useState('v1');

  const recentActivity = [
    {
      service: 'WhatsApp',
      country: 'United States',
      code: '123456',
      time: '2 min ago',
      status: 'completed',
    },
    {
      service: 'Telegram',
      country: 'United Kingdom',
      code: '789012',
      time: '15 min ago',
      status: 'completed',
    },
    {
      service: 'Instagram',
      country: 'Canada',
      code: '345678',
      time: '1 hour ago',
      status: 'completed',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's your overview.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="stagger-fade-in grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Wallet Balance
            </CardTitle>
            <Wallet className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-primary animate-count-up text-2xl font-bold">
              $127.45
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              <Button asChild variant="link" className="h-auto p-0 text-xs">
                <Link href="/dashboard/wallet">
                  Add Funds <ArrowUpRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Numbers
            </CardTitle>
            <Phone className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="animate-count-up text-2xl font-bold">3</div>
            <p className="text-muted-foreground mt-1 text-xs">
              2 rentals, 1 activation
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-success animate-count-up text-2xl font-bold">
              98.5%
            </div>
            <p className="text-muted-foreground mt-1 text-xs">Last 30 days</p>
          </CardContent>
        </Card>

        <Card className="border-primary card-hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
            <Crown className="text-primary h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="animate-count-up text-2xl font-bold">Pro</div>
            <p className="text-muted-foreground mt-1 text-xs">
              <Button asChild variant="link" className="h-auto p-0 text-xs">
                <Link href="/dashboard/membership">
                  Upgrade to VIP <ArrowUpRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Order Box */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Order</CardTitle>
            <CardDescription>
              Order a new SMS activation instantly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Country</label>
                <Select value={quickCountry} onValueChange={setQuickCountry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">🇺🇸 United States</SelectItem>
                    <SelectItem value="uk">🇬🇧 United Kingdom</SelectItem>
                    <SelectItem value="ca">🇨🇦 Canada</SelectItem>
                    <SelectItem value="de">🇩🇪 Germany</SelectItem>
                    <SelectItem value="fr">🇫🇷 France</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Service</label>
                <Select value={quickService} onValueChange={setQuickService}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="telegram">Telegram</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Provider Type</label>
              <div className="flex flex-wrap gap-3">
                <label className="flex cursor-pointer items-center space-x-2">
                  <input
                    type="radio"
                    name="provider"
                    value="v1"
                    checked={quickProvider === 'v1'}
                    onChange={(e) => setQuickProvider(e.target.value)}
                    className="h-4 w-4"
                  />
                  <div>
                    <Badge variant="secondary">💰 Standard V1</Badge>
                    <p className="text-muted-foreground mt-1 text-xs">
                      From $0.50
                    </p>
                  </div>
                </label>
                <label className="flex cursor-pointer items-center space-x-2">
                  <input
                    type="radio"
                    name="provider"
                    value="v2"
                    checked={quickProvider === 'v2'}
                    onChange={(e) => setQuickProvider(e.target.value)}
                    className="h-4 w-4"
                  />
                  <div>
                    <Badge className="from-primary to-accent bg-gradient-to-r">
                      💎 Premium V2
                    </Badge>
                    <p className="text-muted-foreground mt-1 text-xs">
                      From $1.50
                    </p>
                  </div>
                </label>
                <label className="flex cursor-pointer items-center space-x-2">
                  <input
                    type="radio"
                    name="provider"
                    value="v3"
                    checked={quickProvider === 'v3'}
                    onChange={(e) => setQuickProvider(e.target.value)}
                    className="h-4 w-4"
                  />
                  <div>
                    <Badge className="from-warning bg-gradient-to-r to-amber-500">
                      👑 Elite V3
                    </Badge>
                    <p className="text-muted-foreground mt-1 text-xs">
                      From $2.50
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <Button asChild className="w-full" size="lg">
              <Link href="/dashboard/activation">Order Now</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Activity Section */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest SMS activations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity, i) => (
              <div
                key={i}
                className="border-border flex items-start space-x-3 border-b pb-3 last:border-0 last:pb-0"
              >
                <div className="bg-success/10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg">
                  <CheckCircle2 className="text-success h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{activity.service}</p>
                  <p className="text-muted-foreground text-xs">
                    {activity.country}
                  </p>
                  <div className="mt-1 flex items-center justify-between">
                    <code className="bg-muted rounded px-2 py-1 text-xs">
                      {activity.code}
                    </code>
                    <span className="text-muted-foreground flex items-center text-xs">
                      <Clock className="mr-1 h-3 w-3" />
                      {activity.time}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/orders">View All Orders</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Rental Status */}
      <Card>
        <CardHeader>
          <CardTitle>Active Rentals</CardTitle>
          <CardDescription>Your currently rented numbers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                number: '+1 (555) 123-4567',
                service: 'WhatsApp',
                expires: '2d 5h',
                country: '🇺🇸',
              },
              {
                number: '+44 7700 900123',
                service: 'Telegram',
                expires: '1d 12h',
                country: '🇬🇧',
              },
            ].map((rental, i) => (
              <div
                key={i}
                className="border-border flex flex-col gap-3 rounded-lg border p-4 backdrop-blur-[var(--glass-blur-secondary)] transition-all duration-[180ms] [background:var(--glass-secondary)] hover:-translate-y-0.5 hover:[box-shadow:var(--glass-shadow-1)] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{rental.country}</span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium sm:text-base">
                      {rental.number}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {rental.service}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 sm:flex-col sm:items-end">
                  <Badge variant="secondary">
                    <Clock className="mr-1 h-3 w-3" />
                    {rental.expires}
                  </Badge>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Renew
                    </Button>
                    <Button size="sm" variant="ghost">
                      Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button asChild variant="link" className="mt-4 w-full">
            <Link href="/dashboard/rent-numbers">Manage All Rentals</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
