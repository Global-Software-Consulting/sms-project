'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { AdminDataTable } from '@/components/admin/data-table';
import { AdminSlideOver } from '@/components/admin/slide-over';
import { AdminModal } from '@/components/admin/modal';
import { AdminStatusBadge } from '@/components/admin/status-badge';
import { AdminFormInput } from '@/components/admin/form-input';
import {
  Eye,
  Download,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Phone,
  Clock,
  User,
  X,
  Calendar,
  Shield,
  MessageSquare,
  Copy,
  Hash,
  Search,
  Filter,
} from 'lucide-react';
import {
  adminGetOrders,
  adminGetOrder,
  adminRefundOrder,
  adminCancelOrder,
  adminExtendOrder,
  getOrderStatusLabel,
  getCountryFlag,
  formatPrice,
  canCancelOrder,
  type SmsOrder,
  type SmsOrderStatus,
  type AdminOrderQueryParams,
  type PaginatedResponse,
} from '@/lib/api/smsApi';

const columns = [
  { key: 'id', label: 'Activation ID', width: '10%' },
  { key: 'user', label: 'User', width: '10%' },
  { key: 'country', label: 'Country', width: '14%' },
  { key: 'service', label: 'Service', width: '10%' },
  { key: 'phoneNumber', label: 'Phone Number', width: '14%' },
  { key: 'status', label: 'Status', width: '12%' },
  { key: 'createdAt', label: 'Created', width: '12%' },
  { key: 'expiresAt', label: 'Expires', width: '10%' },
  { key: 'actions', label: 'Actions', width: '8%' },
];

const statusVariantMap: Record<
  string,
  'success' | 'warning' | 'error' | 'info' | 'default'
> = {
  PENDING: 'warning',
  WAITING_SMS: 'info',
  COMPLETED: 'success',
  CANCELLED: 'default',
  EXPIRED: 'error',
  REFUNDED: 'info',
};

const statusFilterOptions = [
  'PENDING',
  'WAITING_SMS',
  'COMPLETED',
  'CANCELLED',
  'EXPIRED',
  'REFUNDED',
];

export default function AdminActivationsPage() {
  // Data state
  const [orders, setOrders] = useState<SmsOrder[]>([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  // Filters
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Detail/modal state
  const [selectedOrder, setSelectedOrder] = useState<SmsOrder | null>(null);
  const [orderDetail, setOrderDetail] = useState<SmsOrder | null>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundReason, setRefundReason] = useState('');

  // Search debounce
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    setIsPageLoading(true);
    try {
      const params: AdminOrderQueryParams = {
        page: currentPage,
        limit: 20,
      };
      if (searchValue) params.search = searchValue;
      if (statusFilter) params.status = statusFilter as SmsOrderStatus;
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      if (userIdFilter) params.userId = userIdFilter;

      const response: PaginatedResponse<SmsOrder> =
        await adminGetOrders(params);
      setOrders(response.data);
      setMeta(response.meta);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setIsPageLoading(false);
    }
  }, [currentPage, searchValue, statusFilter, fromDate, toDate, userIdFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Debounced search
  const handleSearch = (value: string) => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setSearchValue(value);
      setCurrentPage(1);
    }, 500);
  };

  // View order detail
  const handleViewOrder = async (order: SmsOrder) => {
    setSelectedOrder(order);
    setIsSlideOverOpen(true);
    setIsDetailLoading(true);
    try {
      const response = await adminGetOrder(order.id);
      setOrderDetail(response.order);
    } catch {
      toast.error('Failed to fetch order details');
      setOrderDetail(order);
    } finally {
      setIsDetailLoading(false);
    }
  };

  // Refund order
  const handleRefundOrder = async () => {
    if (!selectedOrder) return;
    setIsActionLoading(true);
    try {
      const result = await adminRefundOrder(
        selectedOrder.id,
        refundReason || undefined,
      );
      toast.success(`Order refunded! Amount: ${result.refundAmount}`);
      setIsRefundModalOpen(false);
      setRefundReason('');
      fetchOrders();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to refund order');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Cancel order
  const handleCancelOrder = async (order: SmsOrder) => {
    try {
      const result = await adminCancelOrder(order.id);
      toast.success(
        `Order cancelled & refunded! Amount: ${result.refundAmount}`,
      );
      fetchOrders();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to cancel order');
    }
  };

  // Extend order expiry by 10 minutes
  const handleExtendTime = async (order: SmsOrder) => {
    try {
      await adminExtendOrder(order.id);
      toast.success('Order expiry extended by 10 minutes!');
      fetchOrders();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Order cannot be extended');
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  // Format dates
  const formatDateTime = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-';
    return new Date(dateStr)
      .toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
      .replace(',', '');
  };

  const formatDateShort = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Render cell
  const renderCell = (item: SmsOrder, column: any) => {
    switch (column.key) {
      case 'id':
        return (
          <span className="text-sm font-medium text-white">{item.id}</span>
        );

      case 'user':
        return (
          <span className="text-sm text-white">
            {item.user?.username || item.user?.email?.split('@')[0] || '-'}
          </span>
        );

      case 'country':
        return item.country ? (
          <div className="flex items-center gap-2">
            <span className="text-sm">{getCountryFlag(item.country.code)}</span>
            <span className="text-sm text-white">{item.country.name}</span>
          </div>
        ) : (
          <span className="text-sm text-[#64748B]">-</span>
        );

      case 'service':
        return (
          <span className="text-sm text-white">
            {item.service?.name || '-'}
          </span>
        );

      case 'phoneNumber':
        return (
          <span className="font-mono text-sm text-white">
            {item.phoneNumber || '-'}
          </span>
        );

      case 'status':
        return (
          <AdminStatusBadge
            status={getOrderStatusLabel(item.status)}
            variant={statusVariantMap[item.status] || 'default'}
          />
        );

      case 'createdAt':
        return (
          <span className="text-sm text-[#94A3B8]">
            {formatDateTime(item.createdAt)}
          </span>
        );

      case 'expiresAt':
        return (
          <span className="text-sm text-[#94A3B8]">
            {formatDateTime(item.expiresAt)}
          </span>
        );

      case 'actions':
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleViewOrder(item)}
              className="rounded-lg p-2 transition-colors hover:bg-[rgba(255,255,255,0.08)]"
              title="View Details"
            >
              <Eye className="h-4 w-4 text-[#3B82F6]" />
            </button>
            <button
              onClick={() => handleExtendTime(item)}
              className="rounded-lg p-2 transition-colors hover:bg-[rgba(255,255,255,0.08)]"
              title="Extend Time"
            >
              <Clock className="h-4 w-4 text-[#F59E0B]" />
            </button>
            <button
              onClick={() => {
                if (canCancelOrder(item.status)) {
                  handleCancelOrder(item);
                } else {
                  toast.error('This order cannot be cancelled');
                }
              }}
              className="rounded-lg p-2 transition-colors hover:bg-[rgba(255,255,255,0.08)]"
              title="Cancel"
            >
              <X className="h-4 w-4 text-[#EF4444]" />
            </button>
          </div>
        );

      default:
        return (item as any)[column.key] ?? '-';
    }
  };

  // Pagination
  const getPageNumbers = () => {
    const pages: number[] = [];
    const total = meta.totalPages;
    const current = meta.page;
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push(-1);
      for (
        let i = Math.max(2, current - 1);
        i <= Math.min(total - 1, current + 1);
        i++
      ) {
        pages.push(i);
      }
      if (current < total - 2) pages.push(-1);
      pages.push(total);
    }
    return pages;
  };

  const filteredOrders = orders;

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-semibold text-white">
              Order Management
            </h1>
            <p className="text-[#94A3B8]">
              Monitor and manage all SMS activations in real-time.
            </p>
          </div>
          <button
            onClick={() => toast.info('Exporting orders data...')}
            className="flex items-center gap-2 rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.12)]"
          >
            <Download className="h-5 w-5" />
            Export
          </button>
        </div>
      </div>

      {/* Search + Filters + Status dropdown (matching Figma layout) */}
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-4">
          <div className="relative w-full lg:w-80">
            <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search activations..."
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] py-3 pr-4 pl-12 text-base text-white placeholder:text-[#64748B] focus:ring-2 focus:ring-[#3B82F6] focus:outline-none lg:text-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-base font-medium transition-colors lg:w-auto lg:justify-start lg:text-sm ${
              showFilters
                ? 'border-[#3B82F6] bg-[#3B82F6] text-white'
                : 'border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] text-white hover:bg-[rgba(255,255,255,0.12)]'
            }`}
          >
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-4 py-3 text-base text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none lg:w-auto lg:text-sm [&>option]:bg-[#1E293B] [&>option]:text-white"
          >
            <option value="" className="bg-[#1E293B] text-white">
              All Status
            </option>
            {statusFilterOptions.map((status) => (
              <option
                key={status}
                value={status}
                className="bg-[#1E293B] text-white"
              >
                {getOrderStatusLabel(status as SmsOrderStatus)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expandable Filters */}
      {showFilters && (
        <div className="mb-6 rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.05)] p-4 backdrop-blur-xl">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-4 py-2.5 text-sm text-white [color-scheme:dark] focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-4 py-2.5 text-sm text-white [color-scheme:dark] focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                User ID
              </label>
              <input
                type="text"
                value={userIdFilter}
                onChange={(e) => {
                  setUserIdFilter(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Filter by user ID..."
                className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-4 py-2.5 text-sm text-white placeholder:text-[#64748B] focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3 border-t border-[rgba(255,255,255,0.18)] pt-4">
            <button
              onClick={() => {
                setCurrentPage(1);
                fetchOrders();
              }}
              className="rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2563EB]"
            >
              Apply Filters
            </button>
            <button
              onClick={() => {
                setStatusFilter('');
                setFromDate('');
                setToDate('');
                setUserIdFilter('');
                setCurrentPage(1);
              }}
              className="rounded-lg bg-[rgba(255,255,255,0.08)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.12)]"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Loading / Empty / Table */}
      {isPageLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
          <span className="ml-3 text-[#94A3B8]">Loading orders...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(255,255,255,0.05)]">
            <Phone className="h-8 w-8 text-[#64748B]" />
          </div>
          <p className="text-lg font-medium text-white">No orders found</p>
          <p className="mt-1 text-sm text-[#94A3B8]">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <>
          <AdminDataTable
            columns={columns}
            data={filteredOrders}
            renderCell={renderCell}
          />

          {/* Pagination */}
          <div className="mt-6 flex flex-col items-center justify-between gap-4 lg:flex-row">
            <p className="text-sm text-[#94A3B8]">
              Showing {(meta.page - 1) * meta.limit + 1} to{' '}
              {Math.min(meta.page * meta.limit, meta.total)} of {meta.total}{' '}
              orders
            </p>
            {meta.totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={!meta.hasPrevPage}
                  className="flex items-center gap-1 rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-3 py-2 text-sm text-white transition-colors hover:bg-[rgba(255,255,255,0.12)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>
                {getPageNumbers().map((page, index) =>
                  page === -1 ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-2 text-[#94A3B8]"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`rounded-xl px-4 py-2 text-sm transition-all ${
                        page === meta.page
                          ? 'bg-[#3B82F6] text-white hover:brightness-110'
                          : 'border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] text-white hover:bg-[rgba(255,255,255,0.12)]'
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={!meta.hasNextPage}
                  className="flex items-center gap-1 rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-3 py-2 text-sm text-white transition-colors hover:bg-[rgba(255,255,255,0.12)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* ========== Order Details Slide-Over ========== */}
      <AdminSlideOver
        isOpen={isSlideOverOpen}
        onClose={() => {
          setIsSlideOverOpen(false);
          setOrderDetail(null);
        }}
        title="Order Details"
        footer={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSlideOverOpen(false)}
              className="flex-1 rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.12)]"
            >
              Close
            </button>
            {selectedOrder && canCancelOrder(selectedOrder.status) && (
              <button
                onClick={() => {
                  setIsSlideOverOpen(false);
                  setRefundReason('');
                  setIsRefundModalOpen(true);
                }}
                className="flex-1 rounded-xl bg-[#F59E0B] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#D97706]"
              >
                Refund Order
              </button>
            )}
          </div>
        }
      >
        {isDetailLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-[#3B82F6]" />
            <span className="ml-2 text-sm text-[#94A3B8]">
              Loading details...
            </span>
          </div>
        ) : (
          (orderDetail || selectedOrder) &&
          (() => {
            const order = orderDetail || selectedOrder!;
            return (
              <div className="space-y-6">
                {/* Order Status Header */}
                <div className="flex items-center justify-between">
                  <AdminStatusBadge
                    status={getOrderStatusLabel(order.status)}
                    variant={statusVariantMap[order.status] || 'default'}
                  />
                  <button
                    onClick={() => copyToClipboard(order.id)}
                    className="flex items-center gap-1 font-mono text-xs text-[#94A3B8] transition-colors hover:text-white"
                  >
                    {order.id} <Copy className="h-3 w-3" />
                  </button>
                </div>

                {/* User Info */}
                {order.user && (
                  <div className="rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.05)] p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(59,130,246,0.2)]">
                        <User className="h-5 w-5 text-[#3B82F6]" />
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {order.user.username ||
                            order.user.email.split('@')[0]}
                        </p>
                        <p className="text-sm text-[#94A3B8]">
                          {order.user.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(order.user!.id)}
                      className="mt-2 flex items-center gap-1 font-mono text-xs text-[#64748B] transition-colors hover:text-white"
                    >
                      ID: {order.user.id} <Copy className="h-3 w-3" />
                    </button>
                  </div>
                )}

                {/* Service & Country */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold tracking-wider text-white uppercase">
                    Service Details
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {order.service && (
                      <div className="rounded-lg bg-[rgba(255,255,255,0.05)] p-3">
                        <p className="text-xs text-[#94A3B8]">Service</p>
                        <div className="mt-1 flex items-center gap-2">
                          {order.service.iconUrl && (
                            <img
                              src={order.service.iconUrl}
                              alt=""
                              className="h-5 w-5 rounded"
                            />
                          )}
                          <p className="text-sm font-medium text-white">
                            {order.service.name}
                          </p>
                        </div>
                      </div>
                    )}
                    {order.country && (
                      <div className="rounded-lg bg-[rgba(255,255,255,0.05)] p-3">
                        <p className="text-xs text-[#94A3B8]">Country</p>
                        <div className="mt-1 flex items-center gap-2">
                          <span>{getCountryFlag(order.country.code)}</span>
                          <p className="text-sm font-medium text-white">
                            {order.country.name}
                          </p>
                        </div>
                      </div>
                    )}
                    {order.provider && (
                      <div className="rounded-lg bg-[rgba(255,255,255,0.05)] p-3">
                        <p className="text-xs text-[#94A3B8]">Provider</p>
                        <p className="mt-1 text-sm font-medium text-white">
                          {order.provider.displayName ||
                            order.provider.name ||
                            order.provider.slug}
                        </p>
                      </div>
                    )}
                    <div className="rounded-lg bg-[rgba(255,255,255,0.05)] p-3">
                      <p className="text-xs text-[#94A3B8]">Phone Number</p>
                      {order.phoneNumber ? (
                        <button
                          onClick={() => copyToClipboard(order.phoneNumber!)}
                          className="mt-1 flex items-center gap-1 font-mono text-sm font-medium text-white transition-colors hover:text-[#3B82F6]"
                        >
                          {order.phoneNumber}{' '}
                          <Copy className="h-3 w-3 opacity-50" />
                        </button>
                      ) : (
                        <p className="mt-1 text-sm text-[#64748B] italic">
                          Awaiting assignment...
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* SMS Code */}
                {(order.smsCode || order.smsFullText) && (
                  <div className="border-t border-[rgba(255,255,255,0.18)] pt-4">
                    <h3 className="mb-3 text-sm font-semibold tracking-wider text-white uppercase">
                      SMS Received
                    </h3>
                    {order.smsCode && (
                      <div className="mb-3 rounded-xl border border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.1)] p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Hash className="h-4 w-4 text-[#22C55E]" />
                            <span className="text-sm text-[#94A3B8]">Code</span>
                          </div>
                          <button
                            onClick={() => copyToClipboard(order.smsCode!)}
                            className="text-[#22C55E] hover:brightness-110"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="mt-2 font-mono text-2xl font-bold text-white">
                          {order.smsCode}
                        </p>
                      </div>
                    )}
                    {order.smsFullText && (
                      <div className="rounded-lg bg-[rgba(255,255,255,0.05)] p-3">
                        <div className="mb-2 flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-[#64748B]" />
                          <span className="text-xs text-[#94A3B8]">
                            Full Message
                          </span>
                        </div>
                        <p className="text-sm text-white">
                          {order.smsFullText}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Pricing */}
                <div className="border-t border-[rgba(255,255,255,0.18)] pt-4">
                  <h3 className="mb-3 text-sm font-semibold tracking-wider text-white uppercase">
                    Pricing
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#94A3B8]">Cost</span>
                      <span className="text-sm text-white">
                        {formatPrice(order.cost)}
                      </span>
                    </div>
                    {parseFloat(order.discount) > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#94A3B8]">Discount</span>
                        <span className="text-sm text-[#22C55E]">
                          -{formatPrice(order.discount)}
                        </span>
                      </div>
                    )}
                    {order.membershipDiscount > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#94A3B8]">
                          Membership Discount
                        </span>
                        <span className="text-sm text-[#8B5CF6]">
                          {order.membershipDiscount}%
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between border-t border-[rgba(255,255,255,0.1)] pt-2">
                      <span className="text-sm font-semibold text-white">
                        Final Cost
                      </span>
                      <span className="text-lg font-bold text-white">
                        {formatPrice(order.finalCost)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="border-t border-[rgba(255,255,255,0.18)] pt-4">
                  <h3 className="mb-3 text-sm font-semibold tracking-wider text-white uppercase">
                    Timeline
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-[#64748B]" />
                      <span className="text-[#94A3B8]">Created:</span>
                      <span className="text-white">
                        {formatDateShort(order.createdAt)}
                      </span>
                    </div>
                    {order.expiresAt && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-[#64748B]" />
                        <span className="text-[#94A3B8]">Expires:</span>
                        <span className="text-white">
                          {formatDateShort(order.expiresAt)}
                        </span>
                      </div>
                    )}
                    {order.completedAt && (
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="h-4 w-4 text-[#22C55E]" />
                        <span className="text-[#94A3B8]">Completed:</span>
                        <span className="text-white">
                          {formatDateShort(order.completedAt)}
                        </span>
                      </div>
                    )}
                    {order.cancelledAt && (
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="h-4 w-4 text-[#EF4444]" />
                        <span className="text-[#94A3B8]">Cancelled:</span>
                        <span className="text-white">
                          {formatDateShort(order.cancelledAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Admin Info */}
                {(orderDetail?.providerOrderId || orderDetail?.ipAddress) && (
                  <div className="border-t border-[rgba(255,255,255,0.18)] pt-4">
                    <h3 className="mb-3 text-sm font-semibold tracking-wider text-white uppercase">
                      Admin Info
                    </h3>
                    <div className="space-y-2">
                      {orderDetail.providerOrderId && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#94A3B8]">
                            Provider Order ID
                          </span>
                          <button
                            onClick={() =>
                              copyToClipboard(orderDetail.providerOrderId!)
                            }
                            className="flex items-center gap-1 font-mono text-xs text-white transition-colors hover:text-[#3B82F6]"
                          >
                            {orderDetail.providerOrderId}{' '}
                            <Copy className="h-3 w-3 opacity-50" />
                          </button>
                        </div>
                      )}
                      {orderDetail.ipAddress && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#94A3B8]">
                            IP Address
                          </span>
                          <span className="font-mono text-xs text-white">
                            {orderDetail.ipAddress}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })()
        )}
      </AdminSlideOver>

      {/* ========== Refund Modal ========== */}
      <AdminModal
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        title="Refund Order"
        primaryAction={{
          label: 'Confirm Refund',
          onClick: handleRefundOrder,
          loading: isActionLoading,
          variant: 'danger',
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: () => setIsRefundModalOpen(false),
        }}
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.05)] p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#94A3B8]">Order ID</span>
              <span className="font-mono text-sm text-white">
                {selectedOrder?.id}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-[#94A3B8]">Amount</span>
              <span className="text-sm font-semibold text-white">
                {selectedOrder ? formatPrice(selectedOrder.finalCost) : '-'}
              </span>
            </div>
            {selectedOrder?.user && (
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-[#94A3B8]">User</span>
                <span className="text-sm text-white">
                  {selectedOrder.user.username || selectedOrder.user.email}
                </span>
              </div>
            )}
          </div>
          <AdminFormInput
            label="Reason (optional)"
            name="refundReason"
            value={refundReason}
            onChange={(value) => setRefundReason(value)}
            placeholder="Reason for refund..."
          />
          <p className="text-sm text-[#F59E0B]">
            This will refund the order amount to the user&apos;s wallet balance.
          </p>
        </div>
      </AdminModal>
    </div>
  );
}
