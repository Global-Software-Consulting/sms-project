'use client';

import { useState } from "react";
import { AdminDataTable } from "@/components/admin/data-table";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminSlideOver } from "@/components/admin/slide-over";
import { AdminModal } from "@/components/admin/modal";
import { AdminFormInput } from "@/components/admin/form-input";
import { AdminToggleSwitch } from "@/components/admin/toggle-switch";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Award, TrendingUp, DollarSign } from "lucide-react";

const initialRanksData = [
  {
    id: "R-001",
    level: "1",
    name: "Bronze",
    spendingMin: "$0",
    spendingMax: "$100",
    discount: "1%",
    status: "active",
    users: "1,245",
  },
  {
    id: "R-002",
    level: "2",
    name: "Silver",
    spendingMin: "$100",
    spendingMax: "$500",
    discount: "2%",
    status: "active",
    users: "856",
  },
  {
    id: "R-003",
    level: "3",
    name: "Gold",
    spendingMin: "$500",
    spendingMax: "$2,000",
    discount: "3%",
    status: "active",
    users: "342",
  },
  {
    id: "R-004",
    level: "4",
    name: "Platinum",
    spendingMin: "$2,000",
    spendingMax: "$10,000",
    discount: "4%",
    status: "active",
    users: "128",
  },
  {
    id: "R-005",
    level: "5",
    name: "Diamond",
    spendingMin: "$10,000",
    spendingMax: "$50,000",
    discount: "5%",
    status: "active",
    users: "23",
  },
];

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

export default function AdminRankSystemPage() {
  const [ranksData, setRanksData] = useState(initialRanksData);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRank, setSelectedRank] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [newRank, setNewRank] = useState({
    level: "",
    name: "",
    spendingMin: "",
    spendingMax: "",
    discount: "",
    status: true,
  });

  const handleAddRank = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newRankData = {
      id: `R-${String(ranksData.length + 1).padStart(3, "0")}`,
      level: newRank.level,
      name: newRank.name,
      spendingMin: `$${newRank.spendingMin}`,
      spendingMax: `$${newRank.spendingMax}`,
      discount: `${newRank.discount}%`,
      status: newRank.status ? "active" : "inactive",
      users: "0",
    };

    setRanksData([...ranksData, newRankData]);
    setIsAddModalOpen(false);
    setNewRank({
      level: "",
      name: "",
      spendingMin: "",
      spendingMax: "",
      discount: "",
      status: true,
    });
    setIsLoading(false);
    toast.success("Rank created successfully!");
  };

  const handleEditRank = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setRanksData(
      ranksData.map((rank) =>
        rank.id === selectedRank.id ? { ...selectedRank } : rank
      )
    );

    setIsEditModalOpen(false);
    setIsLoading(false);
    toast.success("Rank updated successfully!");
  };

  const handleDeleteRank = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setRanksData(ranksData.filter((rank) => rank.id !== selectedRank.id));
    setIsDeleteModalOpen(false);
    setIsLoading(false);
    toast.success("Rank deleted successfully!");
  };

  const renderCell = (item: any, column: any) => {
    if (column.key === "level") {
      return (
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-[#F59E0B]" />
          <span className="text-white font-semibold">{item.level}</span>
        </div>
      );
    }

    if (column.key === "name") {
      const colors: Record<string, string> = {
        Bronze: "text-[#CD7F32]",
        Silver: "text-[#C0C0C0]",
        Gold: "text-[#FFD700]",
        Platinum: "text-[#E5E4E2]",
        Diamond: "text-[#B9F2FF]",
      };
      return (
        <span className={`font-semibold ${colors[item.name] || "text-white"}`}>
          {item.name}
        </span>
      );
    }

    if (column.key === "discount") {
      return (
        <span className="px-3 py-1 rounded-lg text-xs font-medium bg-[#22C55E]/20 text-[#22C55E]">
          {item.discount}
        </span>
      );
    }

    if (column.key === "status") {
      return (
        <span
          className={`px-3 py-1 rounded-lg text-xs font-medium ${
            item.status === "active"
              ? "bg-[#22C55E]/20 text-[#22C55E]"
              : "bg-[#64748B]/20 text-[#64748B]"
          }`}
        >
          {item.status}
        </span>
      );
    }

    if (column.key === "actions") {
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedRank(item);
              setIsEditModalOpen(true);
            }}
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

    return item[column.key];
  };

  return (
    <div className="p-4 lg:p-8">
      <AdminPageHeader
        title="Rank System"
        description="Manage user ranks based on spending levels and rewards"
        primaryAction={{
          label: "Create Rank",
          onClick: () => setIsAddModalOpen(true),
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
          <p className="text-white text-3xl font-semibold">{ranksData.length}</p>
        </div>
        <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.18)] backdrop-blur-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#94A3B8] text-sm">Total Users</span>
            <TrendingUp className="w-5 h-5 text-[#22C55E]" />
          </div>
          <p className="text-white text-3xl font-semibold">
            {ranksData.reduce((sum, rank) => sum + parseInt(rank.users.replace(/,/g, "")), 0).toLocaleString()}
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.18)] backdrop-blur-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#94A3B8] text-sm">Max Discount</span>
            <DollarSign className="w-5 h-5 text-[#F59E0B]" />
          </div>
          <p className="text-white text-3xl font-semibold">5%</p>
        </div>
      </div>

      <AdminDataTable columns={columns} data={ranksData} renderCell={renderCell} />

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
              disabled={
                isLoading ||
                !newRank.level ||
                !newRank.name ||
                !newRank.discount
              }
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
          {/* Basic Information */}
          <div>
            <h3 className="text-white text-base font-semibold mb-4">
              Rank Details
            </h3>
            <div className="space-y-4">
              <AdminFormInput
                label="Rank Level"
                name="level"
                type="number"
                value={newRank.level}
                onChange={(value) => setNewRank({ ...newRank, level: value })}
                placeholder="1"
                required
                error={!newRank.level ? "Level is required" : ""}
              />
              <AdminFormInput
                label="Rank Name"
                name="name"
                value={newRank.name}
                onChange={(value) => setNewRank({ ...newRank, name: value })}
                placeholder="e.g., Bronze, Silver, Gold"
                required
                error={!newRank.name ? "Rank name is required" : ""}
              />
            </div>
          </div>

          {/* Spending Range */}
          <div className="pt-6 border-t border-[rgba(255,255,255,0.18)]">
            <h3 className="text-white text-base font-semibold mb-4">
              Spending Requirements
            </h3>
            <div className="space-y-4">
              <AdminFormInput
                label="Minimum Spending ($)"
                name="spendingMin"
                type="number"
                value={newRank.spendingMin}
                onChange={(value) =>
                  setNewRank({ ...newRank, spendingMin: value })
                }
                placeholder="0"
                required
                icon={<DollarSign className="w-5 h-5" />}
              />
              <AdminFormInput
                label="Maximum Spending ($)"
                name="spendingMax"
                type="number"
                value={newRank.spendingMax}
                onChange={(value) =>
                  setNewRank({ ...newRank, spendingMax: value })
                }
                placeholder="100"
                required
                icon={<DollarSign className="w-5 h-5" />}
              />
            </div>
          </div>

          {/* Rewards */}
          <div className="pt-6 border-t border-[rgba(255,255,255,0.18)]">
            <h3 className="text-white text-base font-semibold mb-4">Rewards</h3>
            <div className="space-y-4">
              <AdminFormInput
                label="Discount Percentage"
                name="discount"
                type="number"
                value={newRank.discount}
                onChange={(value) =>
                  setNewRank({ ...newRank, discount: value })
                }
                placeholder="5"
                required
                error={!newRank.discount ? "Discount is required" : ""}
                icon={<span className="text-[#64748B] text-sm">%</span>}
              />
              <AdminToggleSwitch
                label="Active Status"
                name="status"
                checked={newRank.status}
                onChange={(checked) =>
                  setNewRank({ ...newRank, status: checked })
                }
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
              value={selectedRank.name}
              onChange={(value) =>
                setSelectedRank({ ...selectedRank, name: value })
              }
              placeholder="Enter rank name"
              required
            />
            <AdminFormInput
              label="Discount Percentage"
              name="discount"
              value={selectedRank.discount.replace("%", "")}
              onChange={(value) =>
                setSelectedRank({ ...selectedRank, discount: `${value}%` })
              }
              placeholder="5"
              icon={<span className="text-[#64748B] text-sm">%</span>}
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
