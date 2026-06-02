'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  XCircle,
  Crown,
} from 'lucide-react';
import { AdminDataTable } from '@/components/admin/data-table';
import { AdminPageHeader } from '@/components/admin/page-header';
import { AdminFilterBar } from '@/components/admin/filter-bar';
import { AdminStatusBadge } from '@/components/admin/status-badge';
import { AdminModal } from '@/components/admin/modal';
import { AdminFormTextarea } from '@/components/admin/form-input';
import {
  adminGetSubscriptions,
  adminCancelSubscription,
  type AdminSubscription,
  type SubscriptionStatus,
} from '@/lib/api/membershipApi';

type SubStatus = SubscriptionStatus;

const columns = [
  { key: 'user', label: 'User', width: '20%' },
  { key: 'plan', label: 'Plan', width: '12%' },
  { key: 'pricePaid', label: 'Paid', width: '10%' },
  { key: 'status', label: 'Status', width: '12%' },
  { key: 'startDate', label: 'Started', width: '13%' },
  { key: 'endDate', label: 'Expires', width: '13%' },
  { key: 'autoRenew', label: 'Auto-renew', width: '10%' },
  { key: 'actions', label: 'Actions', width: '10%' },
];

const statusVariantMap: Record<
  string,
  'success' | 'warning' | 'error' | 'info' | 'default'
> = {
  ACTIVE: 'success',
  PENDING: 'warning',
  CANCELLED: 'default',
  EXPIRED: 'error',
};

const statusOptions: SubStatus[] = ['ACTIVE', 'CANCELLED', 'EXPIRED', 'PENDING'];
const planOptions = ['free', 'basic', 'standard', 'pro', 'vip'];

const formatDate = (s: string | null | undefined) => {
  if (!s) return '-';
  return new Date(s).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState<AdminSubscription[]>([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [isPageLoading, setIsPageLoading] = useState(true);

  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<SubStatus | ''>('');
  const [planFilter, setPlanFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [cancelTarget, setCancelTarget] = useState<AdminSubscription | null>(
    null,
  );
  const [cancelReason, setCancelReason] = useState('');
  const [refundToWallet, setRefundToWallet] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSubs = useCallback(async () => {
    setIsPageLoading(true);
    try {
      const res = await adminGetSubscriptions({
        page: currentPage,
        limit: 20,
        ...(searchValue ? { search: searchValue } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(planFilter ? { planSlug: planFilter } : {}),
      });
      setSubs(res.data);
      setMeta(res.meta);
    } catch (err: unknown) {
      const message =
        typeof err === 'object' && err && 'response' in err
          ? // @ts-expect-error runtime narrow
            err.response?.data?.message
          : null;
      toast.error(message || 'Failed to fetch subscriptions');
    } finally {
      setIsPageLoading(false);
    }
  }, [currentPage, searchValue, statusFilter, planFilter]);

  useEffect(() => {
    fetchSubs();
  }, [fetchSubs]);

  const handleSearch = (value: string) => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setSearchValue(value);
      setCurrentPage(1);
    }, 500);
  };

  const openCancelModal = (sub: AdminSubscription) => {
    setCancelTarget(sub);
    setCancelReason('');
    setRefundToWallet(false);
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    if (!cancelReason.trim()) {
      toast.error('Reason is required');
      return;
    }
    setIsCancelling(true);
    try {
      await adminCancelSubscription(cancelTarget.id, {
        reason: cancelReason.trim(),
        refundType: refundToWallet ? 'wallet' : 'none',
        skipTicketCheck: true,
      });
      toast.success('Subscription cancelled');
      setCancelTarget(null);
      fetchSubs();
    } catch (err: unknown) {
      const message =
        typeof err === 'object' && err && 'response' in err
          ? // @ts-expect-error runtime narrow
            err.response?.data?.message
          : null;
      toast.error(message || 'Failed to cancel');
    } finally {
      setIsCancelling(false);
    }
  };

  const renderCell = (item: AdminSubscription, column: { key: string }) => {
    switch (column.key) {
      case 'user':
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">
              {item.user?.username || item.user?.email?.split('@')[0] || '-'}
            </span>
            <span className="text-xs text-[#64748B]">
              {item.user?.email || ''}
            </span>
          </div>
        );
      case 'plan':
        return (
          <span className="text-sm font-medium text-white">
            {item.plan?.name || '-'}
          </span>
        );
      case 'pricePaid':
        return (
          <span className="font-mono text-sm text-white">
            ${item.pricePaid}
          </span>
        );
      case 'status':
        return (
          <AdminStatusBadge
            status={item.status}
            variant={statusVariantMap[item.status] || 'default'}
          />
        );
      case 'startDate':
        return (
          <span className="text-sm text-[#94A3B8]">
            {formatDate(item.startDate)}
          </span>
        );
      case 'endDate':
        return (
          <span className="text-sm text-[#94A3B8]">
            {formatDate(item.endDate)}
          </span>
        );
      case 'autoRenew':
        return (
          <span
            className={`text-xs font-medium ${
              item.autoRenew ? 'text-[#22C55E]' : 'text-[#64748B]'
            }`}
          >
            {item.autoRenew ? 'On' : 'Off'}
          </span>
        );
      case 'actions':
        if (item.status === 'CANCELLED' || item.status === 'EXPIRED') {
          return <span className="text-xs text-[#64748B]">—</span>;
        }
        return (
          <button
            onClick={() => openCancelModal(item)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#EF4444]/10 px-3 py-1.5 text-xs font-medium text-[#EF4444] transition-colors hover:bg-[#EF4444]/20"
          >
            <XCircle className="h-3.5 w-3.5" />
            Cancel
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="User Subscriptions"
        description="All membership subscriptions across users — filter, audit, and cancel as needed."
      />

      <AdminFilterBar
        searchPlaceholder="Search by email or username..."
        onSearch={handleSearch}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters((s) => !s)}
        filters={[
          {
            label: 'Status',
            options: statusOptions,
            value: statusFilter,
            onChange: (v) => {
              setStatusFilter(v as SubStatus | '');
              setCurrentPage(1);
            },
          },
          {
            label: 'Plan',
            options: planOptions,
            value: planFilter,
            onChange: (v) => {
              setPlanFilter(v);
              setCurrentPage(1);
            },
          },
        ]}
        onApplyFilters={() => fetchSubs()}
      />

      {isPageLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
        </div>
      ) : (
        <AdminDataTable
          columns={columns}
          data={subs}
          renderCell={renderCell}
          emptyIcon={<Crown className="h-8 w-8 text-[#64748B]" />}
          emptyTitle="No subscriptions found"
          emptyDescription="Try adjusting your search or filters"
        />
      )}

      {meta.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-[#94A3B8]">
            Page {meta.page} of {meta.totalPages} • {meta.total} total
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="flex items-center gap-1 rounded-lg bg-[rgba(255,255,255,0.08)] px-3 py-2 text-sm text-white hover:bg-[rgba(255,255,255,0.12)] disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>
            <button
              disabled={currentPage >= meta.totalPages}
              onClick={() =>
                setCurrentPage((p) => Math.min(meta.totalPages, p + 1))
              }
              className="flex items-center gap-1 rounded-lg bg-[rgba(255,255,255,0.08)] px-3 py-2 text-sm text-white hover:bg-[rgba(255,255,255,0.12)] disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <AdminModal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Cancel Subscription"
        size="md"
        primaryAction={{
          label: 'Confirm Cancel',
          onClick: handleCancel,
          variant: 'danger',
          loading: isCancelling,
        }}
        secondaryAction={{
          label: 'Back',
          onClick: () => setCancelTarget(null),
        }}
      >
        {cancelTarget && (
          <div className="space-y-4">
            <div className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-3 text-sm">
              <p className="text-white">
                {cancelTarget.user?.email || cancelTarget.user?.username} •{' '}
                <span className="text-[#94A3B8]">
                  {cancelTarget.plan?.name}
                </span>
              </p>
              <p className="mt-1 text-xs text-[#64748B]">
                Expires {formatDate(cancelTarget.endDate)}
              </p>
            </div>

            <AdminFormTextarea
              label="Reason"
              name="cancelReason"
              value={cancelReason}
              onChange={setCancelReason}
              placeholder="Why is this being cancelled?"
              rows={3}
              required
            />

            <label className="flex items-center gap-2 text-sm text-white">
              <input
                type="checkbox"
                checked={refundToWallet}
                onChange={(e) => setRefundToWallet(e.target.checked)}
                className="h-4 w-4 rounded border-[rgba(255,255,255,0.2)] bg-transparent text-[#3B82F6] focus:ring-[#3B82F6]"
              />
              Refund prorated unused days to user&apos;s wallet
            </label>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
