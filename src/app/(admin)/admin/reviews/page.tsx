'use client';

import { useState } from "react";
import { AdminDataTable } from "@/components/admin/data-table";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminFilterBar } from "@/components/admin/filter-bar";
import { AdminModal } from "@/components/admin/modal";
import { AdminSlideOver } from "@/components/admin/slide-over";
import { AdminFormInput } from "@/components/admin/form-input";
import { toast } from "sonner";
import { Star, Check, X, Edit, Trash2 } from "lucide-react";

const reviewsData = [
  {
    id: "REV-001",
    user: "john_doe",
    rating: 5,
    comment: "Excellent service! SMS received instantly.",
    status: "approved",
    date: "2026-03-25 14:30",
  },
  {
    id: "REV-002",
    user: "jane_smith",
    rating: 4,
    comment: "Good experience overall, fast activation.",
    status: "approved",
    date: "2026-03-24 10:15",
  },
  {
    id: "REV-003",
    user: "mike_wilson",
    rating: 3,
    comment: "Service works but took longer than expected.",
    status: "pending",
    date: "2026-03-27 09:45",
  },
  {
    id: "REV-004",
    user: "sarah_jones",
    rating: 5,
    comment: "Perfect! Will use again for sure.",
    status: "approved",
    date: "2026-03-26 16:20",
  },
  {
    id: "REV-005",
    user: "alex_brown",
    rating: 2,
    comment: "Had some issues with verification code.",
    status: "pending",
    date: "2026-03-27 11:00",
  },
];

const columns = [
  { key: "id", label: "ID", width: "10%" },
  { key: "user", label: "User", width: "15%" },
  { key: "rating", label: "Rating", width: "12%" },
  { key: "comment", label: "Comment", width: "30%" },
  { key: "status", label: "Status", width: "12%" },
  { key: "date", label: "Date", width: "13%" },
  { key: "actions", label: "Actions", width: "8%" },
];

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState(reviewsData);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [editFormData, setEditFormData] = useState({
    user: "",
    rating: 5,
    comment: "",
  });

  const handleApprove = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setReviews(
      reviews.map((r) =>
        r.id === selectedReview.id ? { ...r, status: "approved" } : r
      )
    );

    setIsLoading(false);
    setIsApproveModalOpen(false);
    toast.success("Review approved successfully!");
  };

  const handleReject = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setReviews(
      reviews.map((r) =>
        r.id === selectedReview.id ? { ...r, status: "rejected" } : r
      )
    );

    setIsLoading(false);
    setIsRejectModalOpen(false);
    toast.success("Review rejected successfully!");
  };

  const handleEdit = async () => {
    if (!editFormData.comment) {
      toast.error("Please enter a comment");
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setReviews(
      reviews.map((r) =>
        r.id === selectedReview.id
          ? { ...r, rating: editFormData.rating, comment: editFormData.comment }
          : r
      )
    );

    setIsLoading(false);
    setIsEditModalOpen(false);
    toast.success("Review updated successfully!");
  };

  const handleDelete = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setReviews(reviews.filter((r) => r.id !== selectedReview.id));

    setIsLoading(false);
    setIsDeleteModalOpen(false);
    toast.success("Review deleted successfully!");
  };

  const renderCell = (item: any, column: any) => {
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
            statusColors[item.status]
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
                user: item.user,
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

    return item[column.key];
  };

  const filters = [
    {
      label: "Status",
      options: ["Approved", "Pending", "Rejected"],
    },
    {
      label: "Rating",
      options: ["5 Stars", "4 Stars", "3 Stars", "2 Stars", "1 Star"],
    },
  ];

  return (
    <div className="p-4 lg:p-8">
      <AdminPageHeader
        title="Review Management"
        description="Manage customer reviews and ratings"
      />

      <AdminFilterBar
        searchPlaceholder="Search reviews by user or comment..."
        onSearch={(value) => console.log("Search:", value)}
        filters={filters}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />

      <AdminDataTable columns={columns} data={reviews} renderCell={renderCell} />

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
          <AdminFormInput label="User" value={editFormData.user} disabled />

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
