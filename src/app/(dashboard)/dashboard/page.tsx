"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Wallet, 
  Phone, 
  TrendingUp, 
  Crown,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useWalletBalance } from "@/hooks/useWallet";
import { useOrderHistory } from "@/hooks/useSms";

export default function Dashboard() {
  const [quickCountry, setQuickCountry] = useState("");
  const [quickService, setQuickService] = useState("");
  const [quickProvider, setQuickProvider] = useState("v1");

  const { user } = useAuth();
  const { balance, loading: balanceLoading } = useWalletBalance();
  const { orders, loading: ordersLoading } = useOrderHistory({ limit: 3 });

  // Calculate stats from orders
  const activeNumbers = orders?.filter(o => o.status === 'WAITING_FOR_SMS' || o.status === 'SMS_RECEIVED').length || 0;
  const completedOrders = orders?.filter(o => o.status === 'COMPLETED').length || 0;
  const totalOrders = orders?.length || 0;
  const successRate = totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : '0';

  // Recent activity from orders
  const recentActivity = orders?.slice(0, 3).map(order => ({
    service: order.serviceName || order.serviceCode,
    country: order.countryName || order.countryCode,
    code: order.smsCode || '------',
    time: new Date(order.createdAt).toLocaleString(),
    status: order.status
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back, {user?.name || 'User'}! Here&apos;s your overview.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 stagger-fade-in">
        <Card className="card-hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary animate-count-up">
              {balanceLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                `$${balance?.toFixed(2) || '0.00'}`
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <Button asChild variant="link" className="h-auto p-0 text-xs">
                <Link href="/dashboard/wallet">Add Funds <ArrowUpRight className="ml-1 h-3 w-3" /></Link>
              </Button>
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Numbers</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold animate-count-up">
              {ordersLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                activeNumbers
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Currently active</p>
          </CardContent>
        </Card>

        <Card className="card-hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success animate-count-up">
              {ordersLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                `${successRate}%`
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card className="border-primary card-hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
            <Crown className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold animate-count-up">
              {user?.membershipTier || 'Free'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <Button asChild variant="link" className="h-auto p-0 text-xs">
                <Link href="/dashboard/pricing">Upgrade to VIP <ArrowUpRight className="ml-1 h-3 w-3" /></Link>
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
            <CardDescription>Order a new SMS activation instantly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
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
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="provider"
                    value="v1"
                    checked={quickProvider === "v1"}
                    onChange={(e) => setQuickProvider(e.target.value)}
                    className="w-4 h-4"
                  />
                  <div>
                    <Badge variant="secondary">💰 Standard V1</Badge>
                    <p className="text-xs text-muted-foreground mt-1">From $0.50</p>
                  </div>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="provider"
                    value="v2"
                    checked={quickProvider === "v2"}
                    onChange={(e) => setQuickProvider(e.target.value)}
                    className="w-4 h-4"
                  />
                  <div>
                    <Badge className="bg-gradient-to-r from-primary to-accent">💎 Premium V2</Badge>
                    <p className="text-xs text-muted-foreground mt-1">From $1.50</p>
                  </div>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="provider"
                    value="v3"
                    checked={quickProvider === "v3"}
                    onChange={(e) => setQuickProvider(e.target.value)}
                    className="w-4 h-4"
                  />
                  <div>
                    <Badge className="bg-gradient-to-r from-warning to-amber-500">👑 Elite V3</Badge>
                    <p className="text-xs text-muted-foreground mt-1">From $2.50</p>
                  </div>
                </label>
              </div>
            </div>

            <Button asChild className="w-full" size="lg">
              <Link href="/dashboard/activate">Order Now</Link>
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
            {ordersLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No recent activity</p>
                <Button asChild variant="link" className="mt-2">
                  <Link href="/dashboard/activate">Start your first activation</Link>
                </Button>
              </div>
            ) : (
              recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start space-x-3 pb-3 border-b border-border last:border-0 last:pb-0">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.service}</p>
                    <p className="text-xs text-muted-foreground">{activity.country}</p>
                    <div className="flex items-center justify-between mt-1">
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {activity.code}
                      </code>
                      <span className="text-xs text-muted-foreground flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {activity.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
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
              { number: "+1 (555) 123-4567", service: "WhatsApp", expires: "2d 5h", country: "🇺🇸" },
              { number: "+44 7700 900123", service: "Telegram", expires: "1d 12h", country: "🇬🇧" }
            ].map((rental, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg border border-border [background:var(--glass-secondary)] backdrop-blur-[var(--glass-blur-secondary)] transition-all duration-[180ms] hover:[box-shadow:var(--glass-shadow-1)] hover:-translate-y-0.5">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{rental.country}</span>
                  <div className="min-w-0">
                    <p className="font-medium text-sm sm:text-base truncate">{rental.number}</p>
                    <p className="text-sm text-muted-foreground">{rental.service}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
                  <Badge variant="secondary">
                    <Clock className="w-3 h-3 mr-1" />
                    {rental.expires}
                  </Badge>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Renew</Button>
                    <Button size="sm" variant="ghost">Details</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button asChild variant="link" className="w-full mt-4">
            <Link href="/dashboard/rent-numbers">Manage All Rentals</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
