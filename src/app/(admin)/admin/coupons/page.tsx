'use client';

import { useState } from "react";
import { AdminDataTable } from '@/components/admin/data-table';
import { AdminPageHeader } from '@/components/admin/page-header';
import { AdminFilterBar } from '@/components/admin/filter-bar';
import { AdminSlideOver } from '@/components/admin/slide-over';
import { AdminModal } from '@/components/admin/modal';
import { AdminFormInput, AdminFormSelect } from '@/components/admin/form-input';
import { AdminToggleSwitch } from '@/components/admin/toggle-switch';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Copy, Download, Percent, Calendar } from "lucide-react";

const initialCouponsData = [
  {
    id: "CP-001",
    code: "WELCOME50",
    discountType: "percentage",
    discountValue: "50%",
    usageLimit: "100",
    usedCount: "45",
    expiryDate: "2024-12-31",
    status: "active",
  },
  {
    id: "CP-002",
    code: "SAVE20",
    discountType: "percentage",
    discountValue: "20%",
    usageLimit: "500",
    usedCount: "312",
    expiryDate: "2024-06-30",
    status: "active",
  },
  {
    id: "CP-003",
    code: "FIXED10",
    discountType: "fixed",
    discountValue: "$10.00",
    usageLimit: "200",
    usedCount: "200",
    expiryDate: "2024-03-15",
    status: "expired",
  },
  {
    id: "CP-004",
    code: "VIP30",
    discountType: "percentage",
    discountValue: "30%",
    usageLimit: "50",
    usedCount: "12",
    expiryDate: "2025-12-31",
    status: "active",
  },
];

const columns = [
  { key: "id", label: "ID", width: "8%" },
  { key: "code", label: "Coupon Code", width: "15%" },
  { key: "discountType", label: "Type", width: "12%" },
  { key: "discountValue", label: "Discount", width: "12%" },
  { key: "usageLimit", label: "Limit", width: "10%" },
  { key: "usedCount", label: "Used", width: "10%" },
  { key: "expiryDate", label: "Expiry Date", width: "13%" },
  { key: "status", label: "Status", width: "10%" },
  { key: "actions", label: "Actions", width: "10%" },
];

export default function AdminCouponsPage() {
  const [couponsData, setCouponsData] = useState(initialCouponsData);
  const [showFilters, setShowFilters] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    usageLimit: "",
    expiryDate: "",
    minPurchase: "",
    status: true,
  });

  const discountTypeOptions = [
    { value: "percentage", label: "Percentage (%)" },
    { value: "fixed", label: "Fixed Amount ($)" },
  ];

  const handleAddCoupon = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newCouponData = {
      id: `CP-${String(couponsData.length + 1).padStart(3, "0")}`,
      code: newCoupon.code.toUpperCase(),
      discountType: newCoupon.discountType,
      discountValue:
        newCoupon.discountType === "percentage"
          ? `${newCoupon.discountValue}%`
          : `$${newCoupon.discountValue}`,
      usageLimit: newCoupon.usageLimit,
      usedCount: "0",
      expiryDate: newCoupon.expiryDate,
      status: newCoupon.status ? "active" : "inactive",
    };

    setCouponsData([...couponsData, newCouponData]);
    setIsAddModalOpen(false);
    setNewCoupon({
      code: "",
      discountType: "percentage",
      discountValue: "",
      usageLimit: "",
      expiryDate: "",
      minPurchase: "",
      status: true,
    });
    setIsLoading(false);
    toast.success("Coupon created successfully!");
  };

  const handleEditCoupon = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setCouponsData(
      couponsData.map((coupon) =>
        coupon.id === selectedCoupon.id ? { ...selectedCoupon } : coupon
      )
    );

    setIsEditModalOpen(false);
    setIsLoading(false);
    toast.success("Coupon updated successfully!");
  };

  const handleDeleteCoupon = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setCouponsData(couponsData.filter((coupon) => coupon.id !== selectedCoupon.id));
    setIsDeleteModalOpen(false);
    setIsLoading(false);
    toast.success("Coupon deleted successfully!");
  };

  const handleCopyCode = (code: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code)
        .then(() => {
          toast.success(`Coupon code "${code}" copied to clipboard!`);
        })
        .catch(() => {
          fallbackCopyToClipboard(code);
        });
    } else {
      fallbackCopyToClipboard(code);
    }
  };

  const fallbackCopyToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
      toast.success(`Coupon code "${text}" copied to clipboard!`);
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
    document.body.removeChild(textArea);
  };

  const renderCell = (item: any, column: any) => {
    if (column.key === "code") {
      return (
        <div className="flex items-center gap-2">
          <span className="text-white font-mono font-semibold">{item.code}</span>
          <button
            onClick={() => handleCopyCode(item.code)}
            className="p-1 rounded hover:bg-[rgba(255,255,255,0.08)] transition-colors"
            title="Copy code"
          >
            <Copy className="w-3 h-3 text-[#64748B]" />
          </button>
        </div>
      );
    }

    if (column.key === "discountType") {
      return (
        <span
          className={`px-3 py-1 rounded-lg text-xs font-medium ${
            item.discountType === "percentage"
              ? "bg-[#3B82F6]/20 text-[#3B82F6]"
              : "bg-[#F59E0B]/20 text-[#F59E0B]"
          }`}
        >
          {item.discountType === "percentage" ? "Percentage" : "Fixed"}
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
              setSelectedCoupon(item);
              setIsEditModalOpen(true);
            }}
            className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors group"
            title="Edit Coupon"
          >
            <Edit className="w-4 h-4 text-[#F59E0B] group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={() => {
              setSelectedCoupon(item);
              setIsDeleteModalOpen(true);
            }}
            className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors group"
            title="Delete Coupon"
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
      options: ["Active", "Inactive", "Expired"],
    },
    {
      label: "Type",
      options: ["Percentage", "Fixed"],
    },
  ];

  return (
    <div className="p-4 lg:p-8">
      <AdminPageHeader
        title="Coupon Management"
        description="Create and manage discount coupons for your platform"
        primaryAction={{
          label: "Create Coupon",
          onClick: () => setIsAddModalOpen(true),
          icon: <Plus className="w-5 h-5" />,
        }}
        secondaryActions={[
          {
            label: "Export",
            onClick: () => toast.info("Exporting coupons data..."),
            icon: <Download className="w-5 h-5" />,
          },
        ]}
      />

      <AdminFilterBar
        searchPlaceholder="Search coupons..."
        onSearch={(value) => console.log("Search:", value)}
        filters={filters}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />

      <AdminDataTable columns={columns} data={couponsData} renderCell={renderCell} />

      <div className="flex flex-col lg:flex-row items-center justify-between mt-6 gap-4">
        <p className="text-[#94A3B8] text-sm">
          Showing 1 to {couponsData.length} of {couponsData.length} coupons
        </p>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white text-sm hover:bg-[rgba(255,255,255,0.12)] transition-colors">
            Previous
          </button>
          <button className="px-4 py-2 rounded-xl bg-[#3B82F6] text-white text-sm hover:brightness-110 transition-all">
            1
          </button>
          <button className="px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white text-sm hover:bg-[rgba(255,255,255,0.12)] transition-colors">
            Next
          </button>
        </div>
      </div>

      {/* Add Coupon Slide-Over */}
      <AdminSlideOver
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New Coupon"
        description="Set up a new discount coupon for your users"
        footer={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white hover:bg-[rgba(255,255,255,0.12)] transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleAddCoupon}
              disabled={isLoading || !newCoupon.code || !newCoupon.discountValue}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </span>
              ) : (
                "Create Coupon"
              )}
            </button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-white text-base font-semibold mb-4">
              Coupon Details
            </h3>
            <div className="space-y-4">
              <AdminFormInput
                label="Coupon Code"
                name="code"
                value={newCoupon.code}
                onChange={(value) =>
                  setNewCoupon({ ...newCoupon, code: value.toUpperCase() })
                }
                placeholder="e.g., WELCOME50"
                required
                error={!newCoupon.code ? "Coupon code is required" : ""}
              />
              <AdminFormSelect
                label="Discount Type"
                name="discountType"
                value={newCoupon.discountType}
                onChange={(value) =>
                  setNewCoupon({ ...newCoupon, discountType: value })
                }
                options={discountTypeOptions}
                required
              />
              <AdminFormInput
                label={
                  newCoupon.discountType === "percentage"
                    ? "Discount Percentage"
                    : "Discount Amount"
                }
                name="discountValue"
                type="number"
                value={newCoupon.discountValue}
                onChange={(value) =>
                  setNewCoupon({ ...newCoupon, discountValue: value })
                }
                placeholder={
                  newCoupon.discountType === "percentage" ? "50" : "10.00"
                }
                required
                icon={
                  newCoupon.discountType === "percentage" ? (
                    <Percent className="w-5 h-5" />
                  ) : (
                    <span className="text-[#64748B] text-sm">$</span>
                  )
                }
              />
            </div>
          </div>

          {/* Usage & Limits */}
          <div className="pt-6 border-t border-[rgba(255,255,255,0.18)]">
            <h3 className="text-white text-base font-semibold mb-4">
              Usage Settings
            </h3>
            <div className="space-y-4">
              <AdminFormInput
                label="Usage Limit"
                name="usageLimit"
                type="number"
                value={newCoupon.usageLimit}
                onChange={(value) =>
                  setNewCoupon({ ...newCoupon, usageLimit: value })
                }
                placeholder="100"
                required
              />
              <AdminFormInput
                label="Minimum Purchase Amount (Optional)"
                name="minPurchase"
                type="number"
                value={newCoupon.minPurchase}
                onChange={(value) =>
                  setNewCoupon({ ...newCoupon, minPurchase: value })
                }
                placeholder="0.00"
                icon={<span className="text-[#64748B] text-sm">$</span>}
              />
              <AdminFormInput
                label="Expiry Date"
                name="expiryDate"
                type="date"
                value={newCoupon.expiryDate}
                onChange={(value) =>
                  setNewCoupon({ ...newCoupon, expiryDate: value })
                }
                required
                icon={<Calendar className="w-5 h-5" />}
              />
              <AdminToggleSwitch
                label="Active Status"
                name="status"
                checked={newCoupon.status}
                onChange={(checked) =>
                  setNewCoupon({ ...newCoupon, status: checked })
                }
                description="Enable this coupon for users"
              />
            </div>
          </div>
        </div>
      </AdminSlideOver>

      {/* Edit Coupon Modal */}
      <AdminModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Coupon"
        size="lg"
        primaryAction={{
          label: "Save Changes",
          onClick: handleEditCoupon,
          loading: isLoading,
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setIsEditModalOpen(false),
        }}
      >
        {selectedCoupon && (
          <div className="space-y-4">
            <AdminFormInput
              label="Coupon Code"
              name="code"
              value={selectedCoupon.code}
              onChange={(value) =>
                setSelectedCoupon({ ...selectedCoupon, code: value })
              }
              placeholder="Enter coupon code"
              required
            />
            <AdminFormInput
              label="Usage Limit"
              name="usageLimit"
              type="number"
              value={selectedCoupon.usageLimit}
              onChange={(value) =>
                setSelectedCoupon({ ...selectedCoupon, usageLimit: value })
              }
              placeholder="100"
            />
            <AdminFormInput
              label="Expiry Date"
              name="expiryDate"
              type="date"
              value={selectedCoupon.expiryDate}
              onChange={(value) =>
                setSelectedCoupon({ ...selectedCoupon, expiryDate: value })
              }
            />
          </div>
        )}
      </AdminModal>

      {/* Delete Coupon Modal */}
      <AdminModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Coupon"
        primaryAction={{
          label: "Delete",
          onClick: handleDeleteCoupon,
          loading: isLoading,
          variant: "danger",
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setIsDeleteModalOpen(false),
        }}
      >
        <p className="text-[#94A3B8]">
          Are you sure you want to delete coupon{" "}
          <span className="text-white font-medium font-mono">
            {selectedCoupon?.code}
          </span>
          ?
        </p>
        <p className="text-[#EF4444] text-sm mt-4">
          This action cannot be undone. Users will no longer be able to use this
          coupon.
        </p>
      </AdminModal>
    </div>
  );
}
