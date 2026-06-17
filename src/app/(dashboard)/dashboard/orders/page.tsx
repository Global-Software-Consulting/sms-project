'use client';
import { useState, useEffect, useCallback } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Loader2,
  Copy,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Phone,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getOrderHistory,
  SmsOrder,
  SmsOrderStatus,
  getOrderStatusLabel,
  getOrderStatusColor,
  getCountryFlag,
  formatPrice,
} from '@/lib/api/smsApi';

// Title-case the country name (backend sometimes returns "HONDURAS" or
// "honduras"). Preserves intra-word punctuation but normalises case.
const formatCountryName = (name?: string | null): string => {
  if (!name) return 'Unknown';
  return name
    .toLowerCase()
    .split(/(\s|-)/)
    .map((part) =>
      /\s|-/.test(part) ? part : part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join('');
};

// Map provider tier to a customer-friendly label. Prefer the explicit
// `version` enum from the backend (V1_STANDARD / V2 / V3); fall back to
// name keyword matching for older orders that don't yet carry version.
const getServiceType = (provider?: {
  displayName?: string;
  slug?: string;
  name?: string;
  version?: string;
}) => {
  const v = (provider?.version || '').toUpperCase();
  if (v === 'V3') return 'Elite';
  if (v === 'V2') return 'Premium';
  if (v === 'V1_STANDARD' || v === 'V1') return 'Standard';
  const name = (
    provider?.displayName ||
    provider?.name ||
    provider?.slug ||
    ''
  ).toLowerCase();
  if (name.includes('premium') || name.includes('v2')) return 'Premium';
  if (name.includes('elite') || name.includes('v3') || name.includes('basic'))
    return 'Elite';
  return 'Standard';
};

export default function Orders() {
  // Data state
  const [orders, setOrders] = useState<SmsOrder[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  // Filters
  const [statusFilter, setStatusFilter] = useState<SmsOrderStatus | 'all'>(
    'all',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Order details dialog
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SmsOrder | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch orders
  const fetchOrders = useCallback(
    async (pageNum: number) => {
      try {
        setIsRefetching(true);

        const params: any = {
          page: pageNum,
          limit: 20,
        };

        if (statusFilter !== 'all') {
          params.status = statusFilter;
        }

        if (debouncedSearch) {
          params.search = debouncedSearch;
        }

        const response = await getOrderHistory(params);

        setOrders(response.data);
        setTotalPages(response.meta.totalPages);
        setTotalOrders(response.meta.total);
        setPage(pageNum);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        toast.error('Failed to load orders');
      } finally {
        setIsInitialLoading(false);
        setIsRefetching(false);
      }
    },
    [statusFilter, debouncedSearch],
  );

  // Initial load and filter changes
  useEffect(() => {
    fetchOrders(1);
  }, [fetchOrders]);

  // Get status icon
  const getStatusIcon = (status: SmsOrderStatus) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="text-success h-5 w-5" />;
      case 'CANCELLED':
      case 'EXPIRED':
      case 'REFUNDED':
        return <XCircle className="text-destructive h-5 w-5" />;
      case 'PENDING':
      case 'WAITING_SMS':
        return <Clock className="text-warning h-5 w-5" />;
      default:
        return <Clock className="text-muted-foreground h-5 w-5" />;
    }
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  // View order details
  const viewOrderDetails = (order: SmsOrder) => {
    setSelectedOrder(order);
    setShowDetailsDialog(true);
  };

  // Loading state — only on first ever load. Subsequent refetches
  // keep the UI mounted and show an inline indicator instead.
  if (isInitialLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="text-primary mx-auto mb-4 h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Orders</h1>
          <p className="text-muted-foreground mt-1">
            View your order history and details
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchOrders(page)}
          disabled={isRefetching}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search by service, country, or phone number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) =>
                setStatusFilter(v as SmsOrderStatus | 'all')
              }
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="WAITING_SMS">Waiting SMS</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Phone className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <p className="text-muted-foreground">No orders found</p>
            <p className="text-muted-foreground mt-1 text-sm">
              {statusFilter !== 'all' || searchQuery
                ? 'Try adjusting your filters'
                : 'Your order history will appear here'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="text-muted-foreground mb-2 flex items-center gap-2 text-sm">
            <span>
              Showing {orders.length} of {totalOrders} orders
            </span>
            {isRefetching && (
              <Loader2 className="h-3.5 w-3.5 animate-spin opacity-70" />
            )}
          </div>

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
                          <h3 className="font-semibold">
                            {order.service?.name || 'Unknown Service'}
                          </h3>
                          <Badge variant="secondary">
                            {getServiceType(order.provider)}
                          </Badge>
                          <Badge
                            variant="secondary"
                            style={{
                              backgroundColor: `color-mix(in srgb, ${getOrderStatusColor(order.status)} 15%, transparent)`,
                              color: getOrderStatusColor(order.status),
                            }}
                          >
                            {getOrderStatusLabel(order.status)}
                          </Badge>
                        </div>
                        <div className="text-muted-foreground space-y-1 text-sm">
                          <p className="text-xs">
                            Order ID: {order.id.slice(0, 8)}...
                          </p>
                          <p className="flex flex-wrap items-center gap-1">
                            <span>
                              {getCountryFlag(
                                order.country?.code ?? '',
                                order.country?.name,
                              )}{' '}
                              {formatCountryName(order.country?.name)}
                            </span>
                            <span>•</span>
                            <span className="truncate font-mono text-xs">
                              {order.phoneNumber || 'No number assigned'}
                            </span>
                            {order.phoneNumber && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5"
                                onClick={() =>
                                  copyToClipboard(order.phoneNumber!)
                                }
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            )}
                          </p>
                          {order.smsCode && (
                            <p className="flex items-center gap-1">
                              Code:{' '}
                              <code className="bg-success/10 text-success rounded px-2 py-0.5 text-xs font-bold">
                                {order.smsCode}
                              </code>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5"
                                onClick={() => copyToClipboard(order.smsCode!)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </p>
                          )}
                          <p className="text-xs">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 items-center justify-between gap-2 sm:flex-col sm:items-end">
                      <p className="text-lg font-bold">
                        {formatPrice(order.finalCost)}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewOrderDetails(order)}
                      >
                        Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchOrders(page - 1)}
                disabled={page === 1 || isRefetching}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
              <span className="text-muted-foreground text-sm">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchOrders(page + 1)}
                disabled={page === totalPages || isRefetching}
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Order Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="w-[calc(100vw-1rem)] max-w-lg sm:w-full">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>Order ID: {selectedOrder?.id}</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Status</span>
                <Badge
                  style={{
                    backgroundColor: `color-mix(in srgb, ${getOrderStatusColor(selectedOrder.status)} 15%, transparent)`,
                    color: getOrderStatusColor(selectedOrder.status),
                  }}
                >
                  {getOrderStatusLabel(selectedOrder.status)}
                </Badge>
              </div>

              {/* Service */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Service</span>
                <span className="font-medium">
                  {selectedOrder.service?.name || 'Unknown'}
                </span>
              </div>

              {/* Service Type */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Type</span>
                <span className="font-medium">
                  {getServiceType(selectedOrder.provider)}
                </span>
              </div>

              {/* Country */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Country</span>
                <span className="font-medium">
                  {getCountryFlag(
                    selectedOrder.country?.code ?? '',
                    selectedOrder.country?.name,
                  )}{' '}
                  {formatCountryName(selectedOrder.country?.name)}
                </span>
              </div>

              {/* Phone Number */}
              {selectedOrder.phoneNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    Phone Number
                  </span>
                  <div className="flex items-center gap-2">
                    <code className="font-mono text-sm">
                      {selectedOrder.phoneNumber}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() =>
                        copyToClipboard(selectedOrder.phoneNumber!)
                      }
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}

              {/* SMS Code */}
              {selectedOrder.smsCode && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    SMS Code
                  </span>
                  <div className="flex items-center gap-2">
                    <code className="bg-success/10 text-success rounded px-2 py-1 font-mono font-bold">
                      {selectedOrder.smsCode}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(selectedOrder.smsCode!)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Full SMS Text */}
              {selectedOrder.fullSms && (
                <div className="space-y-1">
                  <span className="text-muted-foreground text-sm">
                    Full SMS
                  </span>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm">{selectedOrder.fullSms}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 h-7 text-xs"
                      onClick={() => copyToClipboard(selectedOrder.fullSms!)}
                    >
                      <Copy className="mr-1 h-3 w-3" />
                      Copy
                    </Button>
                  </div>
                </div>
              )}

              {/* Pricing */}
              <div className="border-border space-y-2 border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    Base Price
                  </span>
                  <span>
                    {formatPrice(selectedOrder.basePrice || selectedOrder.cost)}
                  </span>
                </div>
                {parseFloat(selectedOrder.discount) > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      Discount
                    </span>
                    <span className="text-success">
                      -{formatPrice(selectedOrder.discount)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between font-bold">
                  <span>Final Cost</span>
                  <span>{formatPrice(selectedOrder.finalCost)}</span>
                </div>
              </div>

              {/* Timestamps */}
              <div className="border-border space-y-2 border-t pt-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{formatDate(selectedOrder.createdAt)}</span>
                </div>
                {selectedOrder.completedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Completed</span>
                    <span>{formatDate(selectedOrder.completedAt)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Expires</span>
                  <span>{formatDate(selectedOrder.expiresAt || '')}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
