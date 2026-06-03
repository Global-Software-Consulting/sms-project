'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Star,
  Check,
  X,
  Edit,
  Trash2,
  Loader2,
  Send,
  Users,
  ListChecks,
  Layers,
  Plus,
} from 'lucide-react';
import { AdminDataTable } from '@/components/admin/data-table';
import { AdminPageHeader } from '@/components/admin/page-header';
import { AdminFilterBar } from '@/components/admin/filter-bar';
import { AdminModal } from '@/components/admin/modal';
import {
  getAdminReviews,
  approveReview,
  rejectReview,
  updateReview,
  deleteReview,
  bulkApproveReviews,
  bulkRejectReviews,
  bulkDeleteReviews,
  scheduleBulkReviews,
  listUniqueNames,
  addUniqueNames,
  deleteUniqueName,
  type AdminReview,
  type UniqueName,
} from '@/lib/api/adminModulesApi';

type TabKey = 'reviews' | 'bulk' | 'names';

// Local row shape — we keep the API row plus a derived display name.
interface ReviewRow extends AdminReview {
  displayName: string;
  comment: string;
  isBulkGenerated?: boolean;
  reviewerName?: string | null;
  scheduledFor?: string | null;
  postedAt?: string | null;
}

const columns: { key: string; label: string; width?: string }[] = [
  { key: 'select', label: '', width: '4%' },
  { key: 'user', label: 'Reviewer', width: '14%' },
  { key: 'rating', label: 'Rating', width: '10%' },
  { key: 'comment', label: 'Comment', width: '32%' },
  { key: 'source', label: 'Source', width: '10%' },
  { key: 'status', label: 'Status', width: '10%' },
  { key: 'date', label: 'Date', width: '12%' },
  { key: 'actions', label: 'Actions', width: '8%' },
];

const STATUS_VARIANT: Record<
  string,
  'success' | 'warning' | 'error' | 'default'
> = {
  APPROVED: 'success',
  PENDING: 'warning',
  REJECTED: 'error',
};

// Helper — comparisons against backend status (uppercase enum)
function isApproved(s: string): boolean {
  return s?.toUpperCase() === 'APPROVED';
}
function isRejected(s: string): boolean {
  return s?.toUpperCase() === 'REJECTED';
}

function formatDate(s?: string | null): string {
  if (!s) return '-';
  return new Date(s).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function renderStars(n: number): string {
  return (
    '★'.repeat(Math.max(0, Math.min(5, n))) +
    '☆'.repeat(5 - Math.max(0, Math.min(5, n)))
  );
}

export default function AdminReviewsPage() {
  const [tab, setTab] = useState<TabKey>('reviews');

  // ============================================
  // Tab 1: Review Management
  // ============================================
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [scheduleFilter, setScheduleFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Per-row modals
  const [selectedReview, setSelectedReview] = useState<ReviewRow | null>(null);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');

  // Bulk action modal (confirms before destructive bulk delete / reject)
  const [bulkAction, setBulkAction] = useState<
    'approve' | 'reject' | 'delete' | null
  >(null);
  const [bulkReason, setBulkReason] = useState('');

  const fetchReviews = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter.toUpperCase();
      if (sourceFilter === 'bulk') params.isBulkGenerated = 'true';
      if (sourceFilter === 'user') params.isBulkGenerated = 'false';
      if (scheduleFilter) params.scheduleFilter = scheduleFilter;
      if (searchQuery) params.search = searchQuery;

      const response = await getAdminReviews(params);
      const data = (response as { data: AdminReview[] }).data || [];
      setReviews(
        data.map((r) => {
          const anyR = r as unknown as Record<string, unknown>;
          const reviewerName = (anyR.reviewerName as string | null) ?? null;
          const userObj = (anyR.user as Record<string, unknown> | null) ?? null;
          const displayName = reviewerName
            ? reviewerName
            : (userObj?.username as string | undefined) ||
              (userObj?.firstName as string | undefined) ||
              ((userObj?.email as string | undefined)?.split('@')[0] ??
                'Unknown');
          return {
            ...r,
            displayName,
            comment: (anyR.text as string) || (anyR.content as string) || '',
            isBulkGenerated: anyR.isBulkGenerated as boolean | undefined,
            reviewerName,
            scheduledFor: anyR.scheduledFor as string | null,
            postedAt: anyR.postedAt as string | null,
          };
        }),
      );
      setSelectedIds(new Set());
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
      toast.error('Failed to load reviews');
    }
  }, [statusFilter, sourceFilter, scheduleFilter, searchQuery]);

  useEffect(() => {
    if (tab !== 'reviews') return;
    let cancelled = false;
    (async () => {
      setIsPageLoading(true);
      await fetchReviews();
      if (!cancelled) setIsPageLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [tab, fetchReviews]);

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleSelectAll = () => {
    setSelectedIds((prev) =>
      prev.size === reviews.length
        ? new Set()
        : new Set(reviews.map((r) => r.id)),
    );
  };

  const handleApprove = async () => {
    if (!selectedReview) return;
    setIsLoading(true);
    try {
      await approveReview(selectedReview.id);
      toast.success('Review approved');
      setIsApproveOpen(false);
      await fetchReviews();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to approve');
    } finally {
      setIsLoading(false);
    }
  };
  const handleReject = async () => {
    if (!selectedReview) return;
    setIsLoading(true);
    try {
      await rejectReview(selectedReview.id, rejectReason || undefined);
      toast.success('Review rejected');
      setIsRejectOpen(false);
      setRejectReason('');
      await fetchReviews();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to reject');
    } finally {
      setIsLoading(false);
    }
  };
  const handleEdit = async () => {
    if (!selectedReview) return;
    if (!editComment.trim()) {
      toast.error('Comment is required');
      return;
    }
    setIsLoading(true);
    try {
      await updateReview(selectedReview.id, {
        rating: editRating,
        text: editComment,
      });
      toast.success('Review updated');
      setIsEditOpen(false);
      await fetchReviews();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to update');
    } finally {
      setIsLoading(false);
    }
  };
  const handleDelete = async () => {
    if (!selectedReview) return;
    setIsLoading(true);
    try {
      await deleteReview(selectedReview.id);
      toast.success('Review deleted');
      setIsDeleteOpen(false);
      await fetchReviews();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to delete');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkConfirm = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setIsLoading(true);
    try {
      if (bulkAction === 'approve') {
        const res = await bulkApproveReviews(ids);
        toast.success(`Approved ${res.updated} review(s)`);
      } else if (bulkAction === 'reject') {
        const res = await bulkRejectReviews(ids, bulkReason || undefined);
        toast.success(`Rejected ${res.updated} review(s)`);
      } else if (bulkAction === 'delete') {
        const res = await bulkDeleteReviews(ids);
        toast.success(`Deleted ${res.deleted} review(s)`);
      }
      setBulkAction(null);
      setBulkReason('');
      await fetchReviews();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Bulk action failed');
    } finally {
      setIsLoading(false);
    }
  };

  const renderCell = (item: ReviewRow, col: { key: string }) => {
    switch (col.key) {
      case 'select':
        return (
          <input
            type="checkbox"
            checked={selectedIds.has(item.id)}
            onChange={() => toggleSelected(item.id)}
            className="h-4 w-4 cursor-pointer accent-[#3B82F6]"
          />
        );
      case 'user':
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">
              {item.displayName}
            </span>
            {item.user?.email && !item.isBulkGenerated && (
              <span className="text-xs text-[#64748B]">{item.user.email}</span>
            )}
          </div>
        );
      case 'rating':
        return (
          <span className="text-amber-400">{renderStars(item.rating)}</span>
        );
      case 'comment':
        return (
          <span
            className="line-clamp-2 text-sm text-white"
            title={item.comment}
          >
            {item.comment}
          </span>
        );
      case 'source':
        return item.isBulkGenerated ? (
          <span className="rounded-full bg-[#3B82F6]/15 px-2 py-0.5 text-xs font-medium text-[#3B82F6]">
            Bulk
          </span>
        ) : (
          <span className="rounded-full bg-[rgba(255,255,255,0.08)] px-2 py-0.5 text-xs font-medium text-[#94A3B8]">
            User
          </span>
        );
      case 'status':
        return (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium uppercase ${
              STATUS_VARIANT[item.status] === 'success'
                ? 'bg-[#22C55E]/15 text-[#22C55E]'
                : STATUS_VARIANT[item.status] === 'warning'
                  ? 'bg-[#F59E0B]/15 text-[#F59E0B]'
                  : STATUS_VARIANT[item.status] === 'error'
                    ? 'bg-[#EF4444]/15 text-[#EF4444]'
                    : 'bg-[rgba(255,255,255,0.08)] text-[#94A3B8]'
            }`}
          >
            {item.status}
          </span>
        );
      case 'date':
        return (
          <div className="flex flex-col">
            <span className="text-sm text-white">
              {formatDate(item.createdAt)}
            </span>
            {item.scheduledFor &&
              new Date(item.scheduledFor).getTime() > Date.now() && (
                <span className="text-[11px] text-[#3B82F6]">
                  Scheduled {formatDate(item.scheduledFor)}
                </span>
              )}
          </div>
        );
      case 'actions':
        return (
          <div className="flex items-center gap-1.5">
            {!isApproved(item.status) && (
              <button
                onClick={() => {
                  setSelectedReview(item);
                  setIsApproveOpen(true);
                }}
                title="Approve"
                className="rounded-md bg-[#22C55E]/10 p-1.5 text-[#22C55E] hover:bg-[#22C55E]/20"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
            )}
            {!isRejected(item.status) && (
              <button
                onClick={() => {
                  setSelectedReview(item);
                  setIsRejectOpen(true);
                }}
                title="Reject"
                className="rounded-md bg-[#F59E0B]/10 p-1.5 text-[#F59E0B] hover:bg-[#F59E0B]/20"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={() => {
                setSelectedReview(item);
                setEditRating(item.rating);
                setEditComment(item.comment);
                setIsEditOpen(true);
              }}
              title="Edit"
              className="rounded-md bg-[#3B82F6]/10 p-1.5 text-[#3B82F6] hover:bg-[#3B82F6]/20"
            >
              <Edit className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => {
                setSelectedReview(item);
                setIsDeleteOpen(true);
              }}
              title="Delete"
              className="rounded-md bg-[#EF4444]/10 p-1.5 text-[#EF4444] hover:bg-[#EF4444]/20"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  // ============================================
  // Tab 2: Bulk Review Handling
  // ============================================
  const [bulkText, setBulkText] = useState('');
  const [timerMin, setTimerMin] = useState(1800); // 30 min
  const [timerMax, setTimerMax] = useState(7200); // 2 h
  const [ratingMin, setRatingMin] = useState(4);
  const [ratingMax, setRatingMax] = useState(5);
  const [startImmediately, setStartImmediately] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);

  const handleSchedule = async () => {
    const lines = bulkText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    if (lines.length === 0) {
      toast.error('Add at least one review text');
      return;
    }
    if (timerMin > timerMax) {
      toast.error('Min delay must be ≤ max delay');
      return;
    }
    if (ratingMin > ratingMax) {
      toast.error('Min rating must be ≤ max rating');
      return;
    }
    setIsScheduling(true);
    try {
      const res = await scheduleBulkReviews({
        reviews: lines,
        timerRange: { min: timerMin, max: timerMax },
        ratingRange: { min: ratingMin, max: ratingMax },
        startImmediately,
      });
      toast.success(
        `Scheduled ${res.scheduled}/${res.total} reviews. First posts ${res.nextPosting ? formatDate(res.nextPosting) : 'now'}.`,
      );
      if (res.skipped.length > 0) {
        toast.warning(
          `${res.skipped.length} skipped — not enough unique names in the pool`,
        );
      }
      setBulkText('');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to schedule');
    } finally {
      setIsScheduling(false);
    }
  };

  // ============================================
  // Tab 3: Unique Name Handle
  // ============================================
  const [names, setNames] = useState<UniqueName[]>([]);
  const [namesLoading, setNamesLoading] = useState(false);
  const [nameSearch, setNameSearch] = useState('');
  const [nameUsedFilter, setNameUsedFilter] = useState<'' | 'true' | 'false'>(
    '',
  );
  const [newNamesText, setNewNamesText] = useState('');
  const [isAddingNames, setIsAddingNames] = useState(false);

  const fetchNames = useCallback(async () => {
    setNamesLoading(true);
    try {
      const res = await listUniqueNames({
        limit: 100,
        search: nameSearch || undefined,
        used: nameUsedFilter === '' ? undefined : nameUsedFilter === 'true',
      });
      setNames(res.data);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to load names');
    } finally {
      setNamesLoading(false);
    }
  }, [nameSearch, nameUsedFilter]);

  useEffect(() => {
    if (tab !== 'names') return;
    fetchNames();
  }, [tab, fetchNames]);

  const handleAddNames = async () => {
    const list = newNamesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    if (list.length === 0) {
      toast.error('Add at least one name');
      return;
    }
    setIsAddingNames(true);
    try {
      const res = await addUniqueNames({ names: list });
      toast.success(
        `Added ${res.added} new name(s)${res.duplicates > 0 ? `, ${res.duplicates} duplicate(s) skipped` : ''}`,
      );
      setNewNamesText('');
      await fetchNames();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to add names');
    } finally {
      setIsAddingNames(false);
    }
  };

  const handleDeleteName = async (id: string) => {
    try {
      await deleteUniqueName(id);
      toast.success('Name removed');
      await fetchNames();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to delete name');
    }
  };

  // ============================================
  // Render
  // ============================================
  return (
    <div className="p-4 lg:p-8">
      <AdminPageHeader
        title="Review Management"
        description="Approve, edit, delete and bulk-schedule platform reviews."
      />

      {/* Tabs */}
      <div className="mb-6 flex items-center gap-2 border-b border-[rgba(255,255,255,0.1)]">
        {(
          [
            { id: 'reviews', label: 'Review Management', icon: ListChecks },
            { id: 'bulk', label: 'Bulk Review Handling', icon: Layers },
            { id: 'names', label: 'Unique Name Handle', icon: Users },
          ] as { id: TabKey; label: string; icon: any }[]
        ).map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'border-[#3B82F6] text-white'
                  : 'border-transparent text-[#94A3B8] hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ============================================ */}
      {/* TAB: Review Management                       */}
      {/* ============================================ */}
      {tab === 'reviews' && (
        <>
          <AdminFilterBar
            searchPlaceholder="Search title, text, or reviewer name..."
            onSearch={(v: string) => setSearchQuery(v)}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters((s) => !s)}
            filters={[
              {
                label: 'Status',
                options: ['PENDING', 'APPROVED', 'REJECTED'],
                value: statusFilter,
                onChange: (v: string) => setStatusFilter(v),
              },
              {
                label: 'Source',
                options: ['user', 'bulk'],
                optionLabels: ['User Reviews', 'Bulk Generated'],
                value: sourceFilter,
                onChange: (v: string) => setSourceFilter(v),
              },
              {
                label: 'Schedule',
                options: ['current', 'future'],
                optionLabels: ['Posted / Live', 'Scheduled Future'],
                value: scheduleFilter,
                onChange: (v: string) => setScheduleFilter(v),
              },
            ]}
            onApplyFilters={() => fetchReviews()}
            onResetFilters={() => {
              setStatusFilter('');
              setSourceFilter('');
              setScheduleFilter('');
            }}
          />

          {/* Bulk action bar */}
          {selectedIds.size > 0 && (
            <div className="mb-4 flex items-center justify-between rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(59,130,246,0.08)] p-3">
              <span className="text-sm text-white">
                {selectedIds.size} selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setBulkAction('approve')}
                  className="flex items-center gap-1.5 rounded-lg bg-[#22C55E]/10 px-3 py-1.5 text-xs font-medium text-[#22C55E] hover:bg-[#22C55E]/20"
                >
                  <Check className="h-3.5 w-3.5" />
                  Approve
                </button>
                <button
                  onClick={() => setBulkAction('reject')}
                  className="flex items-center gap-1.5 rounded-lg bg-[#F59E0B]/10 px-3 py-1.5 text-xs font-medium text-[#F59E0B] hover:bg-[#F59E0B]/20"
                >
                  <X className="h-3.5 w-3.5" />
                  Reject
                </button>
                <button
                  onClick={() => setBulkAction('delete')}
                  className="flex items-center gap-1.5 rounded-lg bg-[#EF4444]/10 px-3 py-1.5 text-xs font-medium text-[#EF4444] hover:bg-[#EF4444]/20"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="text-xs text-[#94A3B8] hover:text-white"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Header with select-all checkbox */}
          <div className="mb-2 flex items-center gap-2 px-4 text-xs text-[#94A3B8]">
            <input
              type="checkbox"
              checked={
                reviews.length > 0 && selectedIds.size === reviews.length
              }
              onChange={toggleSelectAll}
              className="h-4 w-4 cursor-pointer accent-[#3B82F6]"
            />
            <span>Select all on this page</span>
          </div>

          {isPageLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
            </div>
          ) : (
            <AdminDataTable
              columns={columns}
              data={reviews}
              renderCell={renderCell}
              emptyIcon={<Star className="h-8 w-8 text-[#64748B]" />}
              emptyTitle="No reviews found"
              emptyDescription="Adjust filters or schedule new bulk reviews."
            />
          )}

          {/* Per-row modals */}
          <AdminModal
            isOpen={isApproveOpen}
            onClose={() => setIsApproveOpen(false)}
            title="Approve Review"
            size="sm"
            primaryAction={{
              label: 'Approve',
              onClick: handleApprove,
              loading: isLoading,
            }}
            secondaryAction={{
              label: 'Cancel',
              onClick: () => setIsApproveOpen(false),
            }}
          >
            <p className="text-sm text-[#94A3B8]">
              Make this review visible to the public?
            </p>
          </AdminModal>

          <AdminModal
            isOpen={isRejectOpen}
            onClose={() => {
              setIsRejectOpen(false);
              setRejectReason('');
            }}
            title="Reject Review"
            size="sm"
            primaryAction={{
              label: 'Reject',
              onClick: handleReject,
              variant: 'danger',
              loading: isLoading,
            }}
            secondaryAction={{
              label: 'Cancel',
              onClick: () => setIsRejectOpen(false),
            }}
          >
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason (optional, visible to admins)"
              rows={3}
              className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] p-3 text-sm text-white"
            />
          </AdminModal>

          <AdminModal
            isOpen={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            title="Edit Review"
            size="md"
            primaryAction={{
              label: 'Save',
              onClick: handleEdit,
              loading: isLoading,
            }}
            secondaryAction={{
              label: 'Cancel',
              onClick: () => setIsEditOpen(false),
            }}
          >
            <div className="space-y-3">
              <label className="block text-sm font-medium text-white">
                Rating
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setEditRating(n)}
                    className={`text-2xl transition ${n <= editRating ? 'text-amber-400' : 'text-[#64748B]'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <label className="block text-sm font-medium text-white">
                Comment
              </label>
              <textarea
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                rows={5}
                className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] p-3 text-sm text-white"
              />
            </div>
          </AdminModal>

          <AdminModal
            isOpen={isDeleteOpen}
            onClose={() => setIsDeleteOpen(false)}
            title="Delete Review"
            size="sm"
            primaryAction={{
              label: 'Delete',
              onClick: handleDelete,
              variant: 'danger',
              loading: isLoading,
            }}
            secondaryAction={{
              label: 'Cancel',
              onClick: () => setIsDeleteOpen(false),
            }}
          >
            <p className="text-sm text-[#94A3B8]">
              This permanently removes the review. The user's review slot is
              returned if it was a user-submitted review.
            </p>
          </AdminModal>

          {/* Bulk action confirmation modal */}
          <AdminModal
            isOpen={bulkAction !== null}
            onClose={() => {
              setBulkAction(null);
              setBulkReason('');
            }}
            title={
              bulkAction === 'approve'
                ? `Approve ${selectedIds.size} reviews`
                : bulkAction === 'reject'
                  ? `Reject ${selectedIds.size} reviews`
                  : `Delete ${selectedIds.size} reviews`
            }
            size="sm"
            primaryAction={{
              label: 'Confirm',
              onClick: handleBulkConfirm,
              variant: bulkAction === 'approve' ? 'primary' : 'danger',
              loading: isLoading,
            }}
            secondaryAction={{
              label: 'Cancel',
              onClick: () => setBulkAction(null),
            }}
          >
            {bulkAction === 'reject' ? (
              <textarea
                value={bulkReason}
                onChange={(e) => setBulkReason(e.target.value)}
                placeholder="Reason for rejection (optional)"
                rows={3}
                className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] p-3 text-sm text-white"
              />
            ) : (
              <p className="text-sm text-[#94A3B8]">
                {bulkAction === 'delete'
                  ? 'Permanently delete these reviews. This cannot be undone.'
                  : 'Make these reviews visible to the public.'}
              </p>
            )}
          </AdminModal>
        </>
      )}

      {/* ============================================ */}
      {/* TAB: Bulk Review Handling                    */}
      {/* ============================================ */}
      {tab === 'bulk' && (
        <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-6">
          <h2 className="mb-1 text-lg font-semibold text-white">
            Schedule a Batch of Reviews
          </h2>
          <p className="mb-4 text-sm text-[#94A3B8]">
            One review text per line. Each entry gets a unique name from the
            pool, a random rating inside your range, and is scheduled at a
            random delay inside your timer range. Reviews auto-flip to APPROVED
            as their scheduled time arrives.
          </p>

          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            rows={10}
            placeholder={
              'Great service, fast delivery!\nSMS arrived in 5 seconds, perfect.\nBeen using for months — 5 stars.'
            }
            className="mb-4 w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] p-3 font-mono text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
          />

          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] p-4">
              <p className="mb-2 text-sm font-medium text-white">
                Timer Range (seconds between posts)
              </p>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min={0}
                  value={timerMin}
                  onChange={(e) => setTimerMin(parseInt(e.target.value) || 0)}
                  className="rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-3 py-2 text-sm text-white"
                  placeholder="Min"
                />
                <input
                  type="number"
                  min={0}
                  value={timerMax}
                  onChange={(e) => setTimerMax(parseInt(e.target.value) || 0)}
                  className="rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-3 py-2 text-sm text-white"
                  placeholder="Max"
                />
              </div>
              <p className="mt-1 text-[11px] text-[#64748B]">
                Default 1800s (30m) – 7200s (2h)
              </p>
            </div>

            <div className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] p-4">
              <p className="mb-2 text-sm font-medium text-white">
                Rating Range (1 – 5)
              </p>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min={1}
                  max={5}
                  step={0.5}
                  value={ratingMin}
                  onChange={(e) =>
                    setRatingMin(parseFloat(e.target.value) || 1)
                  }
                  className="rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-3 py-2 text-sm text-white"
                  placeholder="Min"
                />
                <input
                  type="number"
                  min={1}
                  max={5}
                  step={0.5}
                  value={ratingMax}
                  onChange={(e) =>
                    setRatingMax(parseFloat(e.target.value) || 5)
                  }
                  className="rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-3 py-2 text-sm text-white"
                  placeholder="Max"
                />
              </div>
              <p className="mt-1 text-[11px] text-[#64748B]">
                Rounded to whole stars on save
              </p>
            </div>
          </div>

          <label className="mb-4 flex items-center gap-2 text-sm text-white">
            <input
              type="checkbox"
              checked={startImmediately}
              onChange={(e) => setStartImmediately(e.target.checked)}
              className="h-4 w-4 accent-[#3B82F6]"
            />
            Post the first review immediately (otherwise wait the first random
            delay)
          </label>

          <button
            onClick={handleSchedule}
            disabled={isScheduling}
            className="inline-flex items-center gap-2 rounded-lg bg-[#3B82F6] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isScheduling ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Schedule Batch
          </button>

          <p className="mt-3 text-xs text-[#64748B]">
            Reviewer names are pulled from the Unique Name pool — add more in
            the third tab if you run out.
          </p>
        </div>
      )}

      {/* ============================================ */}
      {/* TAB: Unique Name Handle                      */}
      {/* ============================================ */}
      {tab === 'names' && (
        <div className="space-y-4">
          {/* Add new names */}
          <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-6">
            <h2 className="mb-1 text-lg font-semibold text-white">Add Names</h2>
            <p className="mb-3 text-sm text-[#94A3B8]">
              One name per line. Duplicates are skipped silently.
            </p>
            <textarea
              value={newNamesText}
              onChange={(e) => setNewNamesText(e.target.value)}
              rows={5}
              placeholder={'John Smith\nMaria Garcia\nDavid Lee'}
              className="mb-3 w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] p-3 text-sm text-white"
            />
            <button
              onClick={handleAddNames}
              disabled={isAddingNames}
              className="inline-flex items-center gap-2 rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-medium text-white hover:bg-[#2563EB] disabled:opacity-50"
            >
              {isAddingNames ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Add Names
            </button>
          </div>

          {/* List */}
          <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)]">
            <div className="flex flex-col items-stretch gap-2 border-b border-[rgba(255,255,255,0.1)] p-4 md:flex-row md:items-center md:justify-between">
              <input
                value={nameSearch}
                onChange={(e) => setNameSearch(e.target.value)}
                placeholder="Search names..."
                className="rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-3 py-2 text-sm text-white md:w-72"
              />
              <select
                value={nameUsedFilter}
                onChange={(e) =>
                  setNameUsedFilter(e.target.value as '' | 'true' | 'false')
                }
                className="rounded-lg border border-[rgba(255,255,255,0.18)] bg-[#1E293B] px-3 py-2 text-sm text-white"
              >
                <option value="">All names</option>
                <option value="false">Available</option>
                <option value="true">In use</option>
              </select>
            </div>

            {namesLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
              </div>
            ) : names.length === 0 ? (
              <p className="py-16 text-center text-sm text-[#64748B]">
                No names in the pool yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {names.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-white">{n.name}</p>
                      <p className="text-[11px] text-[#64748B]">
                        {n.reviewUsed ? 'In use' : 'Available'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteName(n.id)}
                      className="rounded-md bg-[#EF4444]/10 p-1.5 text-[#EF4444] hover:bg-[#EF4444]/20"
                      title="Delete name"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
