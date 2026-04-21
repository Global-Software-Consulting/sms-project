'use client';

import { useState, useEffect, useCallback } from "react";
import { AdminDataTable } from "@/components/admin/data-table";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminSlideOver } from "@/components/admin/slide-over";
import { AdminModal } from "@/components/admin/modal";
import { AdminFormInput } from "@/components/admin/form-input";
import { AdminToggleSwitch } from "@/components/admin/toggle-switch";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Award, TrendingUp, DollarSign, Loader2, RefreshCw } from "lucide-react";
import {
  getRanks,
  createRank,
  updateRank,
  deleteRank,
  recomputeAllRanks,
  type Rank,
} from '@/lib/api/ranksApi';

const columns = [
  { key: "level", label: "Level", width: "8%" },
  { key: "name", label: "Rank Name", width: "15%" },
  { key: "spendingMin", label: "Min Spending", width: "15%" },
  { key: "spendingMax", label: "Max Spending", width: "15%" },
  { key: "discount", label: "Discount", width: "12%" },
  { key: "users", label: "Users", width: "12%" },
  { key: "status", label: "Status", width: "13%" },
  { key: "actions", label: "Actions", width: "10%" },
];

const initialFormState = {
  name: "",
  slug: "",
  description: "",
  minSpending: "",
  discountPercent: "",
  orderLimitBonus: "0",
  prioritySupport: false,
  badge: "",
  color: "#FFD700",
  sortOrder: "",
  isActive: true,
};

export default function AdminRankSystemPage() {
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRank, setSelectedRank] = useState<Rank | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecomputing, setIsRecomputing] = useState(false);

  const [formData, setFormData] = useState(initialFormState);
  const [editFormData, setEditFormData] = useState(initialFormState);

  const fetchRanks = useCallback(async () => {
    setIsPageLoading(true);
    try {
      const data = await getRanks();
      const ranksArray = Array.isArray(data) ? data : [];
      setRanks(ranksArray.sort((a, b) => a.sortOrder - b.sortOrder));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch ranks");
      setRanks([]);
    } finally {
      setIsPageLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRanks();
  }, [fetchRanks]);

  const handleAddRank = async () => {
    if (!formData.name || !formData.discountPercent) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsLoading(true);
    try {
      await createRank({
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
        description: formData.description,
        minSpending: Number(formData.minSpending) || 0,
        discountPercent: Number(formData.discountPercent),
        orderLimitBonus: Number(formData.orderLimitBonus) || 0,
        prioritySupport: formData.prioritySupport,
        badge: formData.badge,
        color: formData.color,
        sortOrder: Number(formData.sortOrder) || 0,
        isActive: formData.isActive,
      });
      toast.success("Rank created successfully!");
      setIsAddModalOpen(false);
      setFormData(initialFormState);
      fetchRanks();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create rank");
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (rank: Rank) => {
    setSelectedRank(rank);
    setEditFormData({
      name: rank.name,
      slug: rank.slug,
      description: rank.description || "",
      minSpending: String(rank.minSpending),
      discountPercent: String(rank.discountPercent),
      orderLimitBonus: String(rank.orderLimitBonus),
      prioritySupport: rank.prioritySupport,
      badge: rank.badge || "",
      color: rank.color || "#FFD700",
      sortOrder: String(rank.sortOrder),
      isActive: rank.isActive,
    });
    setIsEditModalOpen(true);
  };

  const handleEditRank = async () => {
    if (!selectedRank) return;
    setIsLoading(true);
    try {
      await updateRank(selectedRank.id, {
        name: editFormData.name,
        description: editFormData.description,
        minSpending: Number(editFormData.minSpending) || 0,
        discountPercent: Number(editFormData.discountPercent),
        orderLimitBonus: Number(editFormData.orderLimitBonus) || 0,
        prioritySupport: editFormData.prioritySupport,
        badge: editFormData.badge,
        color: editFormData.color,
        sortOrder: Number(editFormData.sortOrder) || 0,
        isActive: editFormData.isActive,
      });
      toast.success("Rank updated successfully!");
      setIsEditModalOpen(false);
      setSelectedRank(null);
      fetchRanks();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update rank");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecomputeAll = async () => {
    if (!confirm('This will recompute ranks for all users based on their spending. Continue?')) return;
    setIsRecomputing(true);
    try {
      const res = await recomputeAllRanks();
      toast.success(`Recomputed ranks for ${res.updated} users`);
      fetchRanks();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to recompute ranks');
    } finally {
      setIsRecomputing(false);
    }
  };

  const handleDeleteRank = async () => {
    if (!selectedRank) return;
    setIsLoading(true);
    try {
      await deleteRank(selectedRank.id);
      toast.success("Rank deleted successfully!");
      setIsDeleteModalOpen(false);
      setSelectedRank(null);
      fetchRanks();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete rank");
    } finally {
      setIsLoading(false);
    }
  };

  const getNextRankSpending = (rank: Rank): string => {
    const sorted = [...ranks].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex(r => r.id === rank.id);
    if (idx < sorted.length - 1) {
      return `$${sorted[idx + 1].minSpending.toLocaleString()}`;
    }
    return "∞";
  };

  const rankColors: Record<string, string> = {
    Bronze: "text-[#CD7F32]",
    Silver: "text-[#C0C0C0]",
    Gold: "text-[#FFD700]",
    Platinum: "text-[#E5E4E2]",
    Diamond: "text-[#B9F2FF]",
  };

  const totalUsers = ranks.reduce((sum, r) => sum + (r._count?.users || 0), 0);
  const maxDiscount = ranks.length > 0 ? Math.max(...ranks.map(r => r.discountPercent)) : 0;

  const renderCell = (item: Rank, column: any) => {
    if (column.key === "level") {
      return (
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-[#F59E0B]" />
          <span className="text-white font-semibold">{item.sortOrder}</span>
        </div>
      );
    }

    if (column.key === "name") {
      return (
        <span className={`font-semibold ${rankColors[item.name] || "text-white"}`} style={!rankColors[item.name] && item.color ? { color: item.color } : {}}>
          {item.name}
        </span>
      );
    }

    if (column.key === "spendingMin") {
      return <span className="text-white">${item.minSpending.toLocaleString()}</span>;
    }

    if (column.key === "spendingMax") {
      return <span className="text-white">{getNextRankSpending(item)}</span>;
    }

    if (column.key === "discount") {
      return (
        <span className="px-3 py-1 rounded-lg text-xs font-medium bg-[#22C55E]/20 text-[#22C55E]">
          {item.discountPercent}%
        </span>
      );
    }

    if (column.key === "users") {
      return <span className="text-white">{(item._count?.users || 0).toLocaleString()}</span>;
    }

    if (column.key === "status") {
      return (
        <span
          className={`px-3 py-1 rounded-lg text-xs font-medium ${
            item.isActive
              ? "bg-[#22C55E]/20 text-[#22C55E]"
              : "bg-[#64748B]/20 text-[#64748B]"
          }`}
        >
          {item.isActive ? "active" : "inactive"}
        </span>
      );
    }

    if (column.key === "actions") {
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEditModal(item)}
            className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors group"
            title="Edit Rank"
          >
            <Edit className="w-4 h-4 text-[#F59E0B] group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={() => {
              setSelectedRank(item);
              setIsDeleteModalOpen(true);
            }}
            className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors group"
            title="Delete Rank"
          >
            <Trash2 className="w-4 h-4 text-[#EF4444] group-hover:scale-110 transition-transform" />
          </button>
        </div>
      );
    }

    return (item as any)[column.key];
  };

  return (
    <div className="p-4 lg:p-8">
      <AdminPageHeader
        title="Rank System"
        description="Manage user ranks based on spending levels and rewards"
        secondaryActions={[
          {
            label: isRecomputing ? 'Recomputing...' : 'Recompute All',
            onClick: handleRecomputeAll,
            icon: <RefreshCw className={`w-5 h-5 ${isRecomputing ? 'animate-spin' : ''}`} />,
          },
        ]}
        primaryAction={{
          label: "Create Rank",
          onClick: () => {
            setFormData(initialFormState);
            setIsAddModalOpen(true);
          },
          icon: <Plus className="w-5 h-5" />,
        }}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.18)] backdrop-blur-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#94A3B8] text-sm">Total Ranks</span>
            <Award className="w-5 h-5 text-[#3B82F6]" />
          </div>
          <p className="text-white text-3xl font-semibold">{isPageLoading ? "..." : ranks.length}</p>
        </div>
        <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.18)] backdrop-blur-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#94A3B8] text-sm">Total Users</span>
            <TrendingUp className="w-5 h-5 text-[#22C55E]" />
          </div>
          <p className="text-white text-3xl font-semibold">{isPageLoading ? "..." : totalUsers.toLocaleString()}</p>
        </div>
        <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.18)] backdrop-blur-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#94A3B8] text-sm">Max Discount</span>
            <DollarSign className="w-5 h-5 text-[#F59E0B]" />
          </div>
          <p className="text-white text-3xl font-semibold">{isPageLoading ? "..." : `${maxDiscount}%`}</p>
        </div>
      </div>

      {isPageLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin" />
          <span className="ml-3 text-[#94A3B8]">Loading ranks...</span>
        </div>
      ) : ranks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center mb-4">
            <Award className="w-8 h-8 text-[#64748B]" />
          </div>
          <p className="text-white text-lg font-medium">No ranks found</p>
          <p className="text-[#94A3B8] text-sm mt-1">Create your first rank to get started</p>
        </div>
      ) : (
        <AdminDataTable columns={columns} data={ranks} renderCell={renderCell} />
      )}

      {/* Add Rank Slide-Over */}
      <AdminSlideOver
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New Rank"
        description="Define a new rank level with spending requirements and rewards"
        footer={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white hover:bg-[rgba(255,255,255,0.12)] transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleAddRank}
              disabled={isLoading || !formData.name || !formData.discountPercent}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </span>
              ) : (
                "Create Rank"
              )}
            </button>
          </div>
        }
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-white text-base font-semibold mb-4">Rank Details</h3>
            <div className="space-y-4">
              <AdminFormInput
                label="Rank Name"
                name="name"
                value={formData.name}
                onChange={(value) => setFormData({ ...formData, name: value })}
                placeholder="e.g., Gold"
                required
                error={!formData.name ? "Rank name is required" : ""}
              />
              <AdminFormInput
                label="Slug"
                name="slug"
                value={formData.slug}
                onChange={(value) => setFormData({ ...formData, slug: value })}
                placeholder="e.g., gold"
              />
              <AdminFormInput
                label="Description"
                name="description"
                value={formData.description}
                onChange={(value) => setFormData({ ...formData, description: value })}
                placeholder="Premium tier with exclusive benefits"
              />
              <AdminFormInput
                label="Sort Order"
                name="sortOrder"
                type="number"
                value={formData.sortOrder}
                onChange={(value) => setFormData({ ...formData, sortOrder: value })}
                placeholder="0"
              />
              <AdminFormInput
                label="Color"
                name="color"
                value={formData.color}
                onChange={(value) => setFormData({ ...formData, color: value })}
                placeholder="#FFD700"
              />
              <AdminFormInput
                label="Badge URL"
                name="badge"
                value={formData.badge}
                onChange={(value) => setFormData({ ...formData, badge: value })}
                placeholder="https://example.com/badge.png"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-[rgba(255,255,255,0.18)]">
            <h3 className="text-white text-base font-semibold mb-4">Spending Requirements</h3>
            <div className="space-y-4">
              <AdminFormInput
                label="Minimum Spending ($)"
                name="minSpending"
                type="number"
                value={formData.minSpending}
                onChange={(value) => setFormData({ ...formData, minSpending: value })}
                placeholder="100"
                required
                icon={<DollarSign className="w-5 h-5" />}
              />
            </div>
          </div>

          <div className="pt-6 border-t border-[rgba(255,255,255,0.18)]">
            <h3 className="text-white text-base font-semibold mb-4">Rewards</h3>
            <div className="space-y-4">
              <AdminFormInput
                label="Discount Percentage"
                name="discountPercent"
                type="number"
                value={formData.discountPercent}
                onChange={(value) => setFormData({ ...formData, discountPercent: value })}
                placeholder="5"
                required
                error={!formData.discountPercent ? "Discount is required" : ""}
                icon={<span className="text-[#64748B] text-sm">%</span>}
              />
              <AdminFormInput
                label="Order Limit Bonus"
                name="orderLimitBonus"
                type="number"
                value={formData.orderLimitBonus}
                onChange={(value) => setFormData({ ...formData, orderLimitBonus: value })}
                placeholder="10"
              />
              <AdminToggleSwitch
                label="Priority Support"
                name="prioritySupport"
                checked={formData.prioritySupport}
                onChange={(checked) => setFormData({ ...formData, prioritySupport: checked })}
                description="Enable priority support for this rank"
              />
              <AdminToggleSwitch
                label="Active Status"
                name="isActive"
                checked={formData.isActive}
                onChange={(checked) => setFormData({ ...formData, isActive: checked })}
                description="Enable this rank for users"
              />
            </div>
          </div>
        </div>
      </AdminSlideOver>

      {/* Edit Rank Modal */}
      <AdminModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Rank"
        size="lg"
        primaryAction={{
          label: "Save Changes",
          onClick: handleEditRank,
          loading: isLoading,
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setIsEditModalOpen(false),
        }}
      >
        {selectedRank && (
          <div className="space-y-4">
            <AdminFormInput
              label="Rank Name"
              name="name"
              value={editFormData.name}
              onChange={(value) => setEditFormData({ ...editFormData, name: value })}
              placeholder="Enter rank name"
              required
            />
            <AdminFormInput
              label="Description"
              name="description"
              value={editFormData.description}
              onChange={(value) => setEditFormData({ ...editFormData, description: value })}
              placeholder="Enter description"
            />
            <AdminFormInput
              label="Minimum Spending ($)"
              name="minSpending"
              type="number"
              value={editFormData.minSpending}
              onChange={(value) => setEditFormData({ ...editFormData, minSpending: value })}
              placeholder="100"
              icon={<DollarSign className="w-5 h-5" />}
            />
            <AdminFormInput
              label="Discount Percentage"
              name="discountPercent"
              type="number"
              value={editFormData.discountPercent}
              onChange={(value) => setEditFormData({ ...editFormData, discountPercent: value })}
              placeholder="5"
              icon={<span className="text-[#64748B] text-sm">%</span>}
            />
            <AdminFormInput
              label="Order Limit Bonus"
              name="orderLimitBonus"
              type="number"
              value={editFormData.orderLimitBonus}
              onChange={(value) => setEditFormData({ ...editFormData, orderLimitBonus: value })}
              placeholder="10"
            />
            <AdminFormInput
              label="Sort Order"
              name="sortOrder"
              type="number"
              value={editFormData.sortOrder}
              onChange={(value) => setEditFormData({ ...editFormData, sortOrder: value })}
              placeholder="0"
            />
            <AdminFormInput
              label="Color"
              name="color"
              value={editFormData.color}
              onChange={(value) => setEditFormData({ ...editFormData, color: value })}
              placeholder="#FFD700"
            />
            <AdminFormInput
              label="Badge URL"
              name="badge"
              value={editFormData.badge}
              onChange={(value) => setEditFormData({ ...editFormData, badge: value })}
              placeholder="https://example.com/badge.png"
            />
            <AdminToggleSwitch
              label="Priority Support"
              name="prioritySupport"
              checked={editFormData.prioritySupport}
              onChange={(checked) => setEditFormData({ ...editFormData, prioritySupport: checked })}
              description="Enable priority support"
            />
            <AdminToggleSwitch
              label="Active Status"
              name="isActive"
              checked={editFormData.isActive}
              onChange={(checked) => setEditFormData({ ...editFormData, isActive: checked })}
              description="Enable this rank"
            />
          </div>
        )}
      </AdminModal>

      {/* Delete Rank Modal */}
      <AdminModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Rank"
        primaryAction={{
          label: "Delete",
          onClick: handleDeleteRank,
          loading: isLoading,
          variant: "danger",
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setIsDeleteModalOpen(false),
        }}
      >
        <p className="text-[#94A3B8]">
          Are you sure you want to delete rank{" "}
          <span className="text-white font-medium">{selectedRank?.name}</span>?
        </p>
        <p className="text-[#EF4444] text-sm mt-4">
          Users in this rank will need to be reassigned. This action cannot be
          undone.
        </p>
      </AdminModal>
    </div>
  );
}