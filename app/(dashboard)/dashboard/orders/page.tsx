'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle2, XCircle, Clock, Search } from 'lucide-react';
import { useState } from 'react';

export default function Orders() {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const orders = [
    {
      id: 'ORD-1234',
      service: 'WhatsApp',
      country: '🇺🇸 United States',
      number: '+1 (555) 123-4567',
      code: '123456',
      status: 'completed',
      provider: 'V1',
      date: 'Feb 13, 2026 14:32',
      price: '$0.50',
    },
    {
      id: 'ORD-1233',
      service: 'Telegram',
      country: '🇬🇧 United Kingdom',
      number: '+44 7700 900123',
      code: '789012',
      status: 'completed',
      provider: 'V2',
      date: 'Feb 13, 2026 12:15',
      price: '$1.50',
    },
    {
      id: 'ORD-1232',
      service: 'Instagram',
      country: '🇨🇦 Canada',
      number: '+1 (604) 555-0123',
      code: null,
      status: 'pending',
      provider: 'V1',
      date: 'Feb 13, 2026 14:35',
      price: '$0.60',
    },
    {
      id: 'ORD-1231',
      service: 'Google',
      country: '🇺🇸 United States',
      number: '+1 (555) 987-6543',
      code: null,
      status: 'cancelled',
      provider: 'V1',
      date: 'Feb 13, 2026 10:20',
      price: '$0.65',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="text-success h-5 w-5" />;
      case 'cancelled':
        return <XCircle className="text-destructive h-5 w-5" />;
      case 'pending':
        return <Clock className="text-warning h-5 w-5" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-success text-success-foreground">
            Completed
          </Badge>
        );
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'pending':
        return (
          <Badge className="bg-warning text-warning-foreground">Pending</Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground mt-1">
          View your order history and details
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 flex-1 items-start space-x-3">
                  <div className="mt-0.5 flex-shrink-0">
                    {getStatusIcon(order.status)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{order.service}</h3>
                      <Badge variant="secondary">{order.provider}</Badge>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="text-muted-foreground space-y-1 text-sm">
                      <p className="text-xs">Order ID: {order.id}</p>
                      <p className="flex flex-wrap items-center gap-1">
                        <span>{order.country}</span>
                        <span>•</span>
                        <span className="truncate font-mono text-xs">
                          {order.number}
                        </span>
                      </p>
                      {order.code && (
                        <p>
                          Code:{' '}
                          <code className="bg-muted rounded px-2 py-0.5 text-xs">
                            {order.code}
                          </code>
                        </p>
                      )}
                      <p className="text-xs">{order.date}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-shrink-0 items-center justify-between gap-2 sm:flex-col sm:items-end">
                  <p className="text-lg font-bold">{order.price}</p>
                  <Button variant="outline" size="sm">
                    Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
