'use client';

import { useState, useEffect, useCallback } from "react";
import { AdminDataTable } from '@/components/admin/data-table';
import { AdminPageHeader } from '@/components/admin/page-header';
import { AdminFilterBar } from '@/components/admin/filter-bar';
import { AdminModal } from '@/components/admin/modal';
import { AdminSlideOver } from '@/components/admin/slide-over';
import { toast } from 'sonner';
import { Star, Check, X, Edit, Trash2, Loader2 } from "lucide-react";
import {
  getAdminReviews,
  approveReview,
  rejectReview,
  updateReview,
  deleteReview,
  type AdminReview,
} from '@/lib/api/adminModulesApi';

interface ReviewDisplay {
  id: string;
  user: string;
  rating: number;
  comment: string;
  status: string;
  date: string;
  originalData: AdminReview;
}

const columns: { key: string; label: string; width?: string }[] = [
  { key: "id", label: "ID", width: "10%" },
  { key: "user", label: "User", width: "15%" },
  { key: "rating", label: "Rating", width: "12%" },
  { key: "comment", label: "Comment", width: "30%" },
  { key: "status", label: "Status", width: "12%" },
  { key: "date", label: "Date", width: "13%" },
  { key: "actions", label: "Actions", width: "8%" },
];

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewDisplay[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ReviewDisplay | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const [editFormData, setEditFormData] = useState({
    rating: 5,
    comment: "",
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).replace(',', '');
  };

  const fetchReviews = useCallback(async () => {
    try {
      const params: { status?: string } = {};
      if (statusFilter) {
        params.status = statusFilter.toUpperCase();
      }
      const response = await getAdminReviews(params);
      const formattedReviews: ReviewDisplay[] = response.data.map((review: any, index: number) => ({
        id: `REV-${String(index + 1).padStart(3, '0')}`,
        user: review.user?.username || review.user?.firstName || review.user?.email?.split('@')[0] || 'Unknown',
        rating: review.rating,
        comment: review.text || review.content || review.title || '',
        status: review.status.toLowerCase(),
        date: formatDate(review.createdAt),
        originalData: review,
      }));
      setReviews(formattedReviews);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      toast.error('Failed to load reviews');
    }
  }, [statusFilter]);

  useEffect(() => {
    const loadData = async () => {
      setIsPageLoading(true);
      await fetchReviews();
      setIsPageLoading(false);
    };
    loadData();
  }, [fetchReviews]);

  const handleApprove = async () => {
    if (!selectedReview) return;
    setIsLoading(true);
    try {
      await approveReview(selectedReview.originalData.id);
      toast.success("Review approved successfully!");
      setIsApproveModalOpen(false);
      await fetchReviews();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to approve review");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedReview) return;
    setIsLoading(true);
    try {
      await rejectReview(selectedReview.originalData.id);
      toast.success("Review rejected successfully!");
      setIsRejectModalOpen(false);
      await fetchReviews();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reject review");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedReview) return;
    if (!editFormData.comment.trim()) {
      toast.error("Please enter a comment");
      return;
    }
    setIsLoading(true);
    try {
      await updateReview(selectedReview.originalData.id, {
        rating: editFormData.rating,
        text: editFormData.comment,
      });
      toast.success("Review updated successfully!");
      setIsEditModalOpen(false);
      await fetchReviews();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update review");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedReview) return;
    setIsLoading(true);
    try {
      await deleteReview(selectedReview.originalData.id);
      toast.success("Review deleted successfully!");
      setIsDeleteModalOpen(false);
      await fetchReviews();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete review");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReviews = reviews.filter((review) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      review.user.toLowerCase().includes(query) ||
      review.comment.toLowerCase().includes(query)
    );
  });

  const renderCell = (item: ReviewDisplay, column: { key: string; label: string; width: string }) => {
    if (column.key === "rating") {
      return (
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, index) => (
            <Star
              key={index}
              className={`w-4 h-4 ${
                index < item.rating
                  ? "fill-[#F59E0B] text-[#F59E0B]"
                  : "text-[#64748B]"
              }`}
            />
          ))}
          <span className="text-white text-sm ml-2">{item.rating}.0</span>
        </div>
      );
    }

    if (column.key === "comment") {
      return (
        <span className="text-white text-sm line-clamp-2">{item.comment}</span>
      );
    }

    if (column.key === "status") {
      const statusColors: Record<string, string> = {
        approved: "bg-[#22C55E]/20 text-[#22C55E]",
        pending: "bg-[#F59E0B]/20 text-[#F59E0B]",
        rejected: "bg-[#EF4444]/20 text-[#EF4444]",
      };
      return (
        <span
          className={`px-3 py-1 rounded-lg text-xs font-medium capitalize ${
            statusColors[item.status] || statusColors.pending
          }`}
        >
          {item.status}
        </span>
      );
    }

    if (column.key === "actions") {
      return (
        <div className="flex items-center gap-1">
          {item.status === "pending" && (
            <>
              <button
                onClick={() => {
                  setSelectedReview(item);
                  setIsApproveModalOpen(true);
                }}
                className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors group"
                title="Approve"
              >
                <Check className="w-4 h-4 text-[#22C55E] group-hover:scale-110 transition-transform" />
              </button>
              <button
                onClick={() => {
                  setSelectedReview(item);
                  setIsRejectModalOpen(true);
                }}
                className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors group"
                title="Reject"
              >
                <X className="w-4 h-4 text-[#EF4444] group-hover:scale-110 transition-transform" />
              </button>
            </>
          )}
          <button
            onClick={() => {
              setSelectedReview(item);
              setEditFormData({
                rating: item.rating,
                comment: item.comment,
              });
              setIsEditModalOpen(true);
            }}
            className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors group"
            title="Edit"
          >
            <Edit className="w-4 h-4 text-[#3B82F6] group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={() => {
              setSelectedReview(item);
              setIsDeleteModalOpen(true);
            }}
            className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors group"
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-[#EF4444] group-hover:scale-110 transition-transform" />
          </button>
        </div>
      );
    }

    return item[column.key as keyof ReviewDisplay];
  };

  const filters = [
    {
      label: "Status",
      options: ["All", "Approved", "Pending", "Rejected"],
      onChange: (value: string) => {
        setStatusFilter(value === "All" ? "" : value.toLowerCase());
      },
    },
  ];

  if (isPageLoading) {
    return (
      <div className="p-4 lg:p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#3B82F6]" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      <AdminPageHeader
        title="Review Management"
        description="Manage customer reviews and ratings"
      />

      <AdminFilterBar
        searchPlaceholder="Search reviews by user or comment..."
        onSearch={(value) => setSearchQuery(value)}
        filters={filters}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />

      <AdminDataTable columns={columns} data={filteredReviews} renderCell={renderCell} />

      {/* Approve Modal */}
      <AdminModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        title="Approve Review"
        primaryAction={{
          label: "Approve",
          onClick: handleApprove,
          loading: isLoading,
          variant: "primary",
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setIsApproveModalOpen(false),
        }}
      >
        <p className="text-[#94A3B8]">
          Are you sure you want to approve this review from{" "}
          <span className="text-white font-medium">{selectedReview?.user}</span>
          ?
        </p>
        {selectedReview && (
          <div className="mt-4 p-4 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.18)]">
            <div className="flex items-center gap-2 mb-2">
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  className={`w-4 h-4 ${
                    index < selectedReview.rating
                      ? "fill-[#F59E0B] text-[#F59E0B]"
                      : "text-[#64748B]"
                  }`}
                />
              ))}
            </div>
            <p className="text-white text-sm">{selectedReview.comment}</p>
          </div>
        )}
      </AdminModal>

      {/* Reject Modal */}
      <AdminModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Review"
        primaryAction={{
          label: "Reject",
          onClick: handleReject,
          loading: isLoading,
          variant: "danger",
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setIsRejectModalOpen(false),
        }}
      >
        <p className="text-[#94A3B8]">
          Are you sure you want to reject this review from{" "}
          <span className="text-white font-medium">{selectedReview?.user}</span>
          ?
        </p>
        <p className="text-[#64748B] text-sm mt-4">
          The review will not be displayed publicly.
        </p>
      </AdminModal>

      {/* Edit Review Slide-Over */}
      <AdminSlideOver
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Review: ${selectedReview?.id}`}
        footer={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white hover:bg-[rgba(255,255,255,0.12)] transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleEdit}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-white text-sm font-medium mb-2 block">User</label>
            <input
              type="text"
              value={selectedReview?.user || ''}
              disabled
              className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.18)] rounded-xl px-4 py-3 text-[#64748B] text-sm cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-white text-sm font-medium mb-2 block">
              Rating
            </label>
            <select
              value={editFormData.rating}
              onChange={(e) =>
                setEditFormData({ ...editFormData, rating: parseInt(e.target.value) })
              }
              className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
            >
              <option value={5}>5 Stars</option>
              <option value={4}>4 Stars</option>
              <option value={3}>3 Stars</option>
              <option value={2}>2 Stars</option>
              <option value={1}>1 Star</option>
            </select>
          </div>

          <div>
            <label className="text-white text-sm font-medium mb-2 block">
              Comment <span className="text-[#EF4444]">*</span>
            </label>
            <textarea
              value={editFormData.comment}
              onChange={(e) =>
                setEditFormData({ ...editFormData, comment: e.target.value })
              }
              rows={6}
              className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] resize-none"
              placeholder="Enter review comment..."
            />
          </div>
        </div>
      </AdminSlideOver>

      {/* Delete Modal */}
      <AdminModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Review"
        primaryAction={{
          label: "Delete",
          onClick: handleDelete,
          loading: isLoading,
          variant: "danger",
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setIsDeleteModalOpen(false),
        }}
      >
        <p className="text-[#94A3B8]">
          Are you sure you want to delete this review from{" "}
          <span className="text-white font-medium">{selectedReview?.user}</span>
          ?
        </p>
        <p className="text-[#64748B] text-sm mt-4">
          This action cannot be undone.
        </p>
      </AdminModal>
    </div>
  );
}
