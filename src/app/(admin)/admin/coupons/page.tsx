'use client';

import { useState, useEffect, useCallback } from "react";
import { AdminDataTable } from '@/components/admin/data-table';
import { AdminPageHeader } from '@/components/admin/page-header';
import { AdminFilterBar } from '@/components/admin/filter-bar';
import { AdminSlideOver } from '@/components/admin/slide-over';
import { AdminModal } from '@/components/admin/modal';
import { AdminFormInput, AdminFormSelect } from '@/components/admin/form-input';
import { AdminToggleSwitch } from '@/components/admin/toggle-switch';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Copy, Download, Percent, Calendar, Loader2 } from "lucide-react";
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  type Coupon,
  type CouponType,
  type CouponApplicableTo,
  type CouponQueryParams,
} from '@/lib/api/couponsApi';

const columns = [
  { key: "id", label: "ID", width: "8%" },
  { key: "code", label: "Coupon Code", width: "12%" },
  { key: "name", label: "Name", width: "12%" },
  { key: "type", label: "Type", width: "10%" },
  { key: "discount", label: "Discount", width: "10%" },
  { key: "usageLimit", label: "Limit", width: "8%" },
  { key: "usedCount", label: "Used", width: "8%" },
  { key: "applicableTo", label: "Applicable To", width: "10%" },
  { key: "expiresAt", label: "Expiry Date", width: "12%" },
  { key: "status", label: "Status", width: "8%" },
  { key: "actions", label: "Actions", width: "8%" },
];

const discountTypeOptions = [
  { value: "PERCENTAGE", label: "Percentage (%)" },
  { value: "FIXED", label: "Fixed Amount ($)" },
];

const applicableToOptions = [
  { value: "ALL", label: "All" },
  { value: "DEPOSIT", label: "Deposit" },
  { value: "SMS_ORDER", label: "SMS Order" },
  { value: "RENTAL", label: "Rental" },
  { value: "MEMBERSHIP", label: "Membership" },
];

const initialFormState = {
  code: "",
  name: "",
  description: "",
  type: "PERCENTAGE" as CouponType,
  value: "",
  maxDiscount: "",
  usageLimit: "",
  usagePerUser: "1",
  minOrderAmount: "",
  startsAt: "",
  expiresAt: "",
  applicableTo: "ALL" as CouponApplicableTo,
  firstTimeOnly: false,
  isActive: true,
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");

  // Form state
  const [formData, setFormData] = useState(initialFormState);

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    type: "PERCENTAGE" as CouponType,
    value: "",
    maxDiscount: "",
    usageLimit: "",
    usagePerUser: "1",
    minOrderAmount: "",
    startsAt: "",
    expiresAt: "",
    applicableTo: "ALL" as CouponApplicableTo,
    firstTimeOnly: false,
    isActive: true,
  });

  const fetchCoupons = useCallback(async () => {
    setIsPageLoading(true);
    try {
      const params: CouponQueryParams = {
        page,
        limit,
        search: searchQuery || undefined,
        type: (filterType as CouponType) || undefined,
        isActive: filterStatus === "active" ? true : filterStatus === "inactive" ? false : undefined,
        showExpired: filterStatus === "expired" ? true : undefined,
      };
      const response = await getCoupons(params);
      setCoupons(response.data || []);
      setTotalPages(response.meta?.totalPages || 1);
      setTotal(response.meta?.total || 0);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch coupons");
    } finally {
      setIsPageLoading(false);
    }
  }, [page, searchQuery, filterStatus, filterType]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleAddCoupon = async () => {
    if (!formData.code || !formData.name || !formData.value) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsLoading(true);
    try {
      await createCoupon({
        code: formData.code.toUpperCase(),
        name: formData.name,
        description: formData.description || undefined,
        type: formData.type,
        value: Number(formData.value),
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
        usageLimit: Number(formData.usageLimit) || 100,
        usagePerUser: Number(formData.usagePerUser) || 1,
        minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : undefined,
        startsAt: formData.startsAt ? new Date(formData.startsAt).toISOString() : undefined,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined,
        applicableTo: formData.applicableTo,
        firstTimeOnly: formData.firstTimeOnly,
        isActive: formData.isActive,
      });
      toast.success("Coupon created successfully!");
      setIsAddModalOpen(false);
      setFormData(initialFormState);
      fetchCoupons();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create coupon");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCoupon = async () => {
    if (!selectedCoupon) return;
    setIsLoading(true);
    try {
      await updateCoupon(selectedCoupon.id, {
        name: editFormData.name,
        description: editFormData.description || undefined,
        type: editFormData.type,
        value: Number(editFormData.value),
        maxDiscount: editFormData.maxDiscount ? Number(editFormData.maxDiscount) : undefined,
        usageLimit: Number(editFormData.usageLimit) || undefined,
        usagePerUser: Number(editFormData.usagePerUser) || undefined,
        minOrderAmount: editFormData.minOrderAmount ? Number(editFormData.minOrderAmount) : undefined,
        startsAt: editFormData.startsAt ? new Date(editFormData.startsAt).toISOString() : undefined,
        expiresAt: editFormData.expiresAt ? new Date(editFormData.expiresAt).toISOString() : undefined,
        applicableTo: editFormData.applicableTo,
        firstTimeOnly: editFormData.firstTimeOnly,
        isActive: editFormData.isActive,
      });
      toast.success("Coupon updated successfully!");
      setIsEditModalOpen(false);
      setSelectedCoupon(null);
      fetchCoupons();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update coupon");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCoupon = async () => {
    if (!selectedCoupon) return;
    setIsLoading(true);
    try {
      await deleteCoupon(selectedCoupon.id);
      toast.success("Coupon deleted successfully!");
      setIsDeleteModalOpen(false);
      setSelectedCoupon(null);
      fetchCoupons();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete coupon");
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setEditFormData({
      name: coupon.name,
      description: coupon.description || "",
      type: coupon.type,
      value: String(coupon.value),
      maxDiscount: coupon.maxDiscount ? String(coupon.maxDiscount) : "",
      usageLimit: String(coupon.usageLimit),
      usagePerUser: String(coupon.usagePerUser),
      minOrderAmount: coupon.minOrderAmount ? String(coupon.minOrderAmount) : "",
      startsAt: coupon.startsAt ? coupon.startsAt.split('T')[0] : "",
      expiresAt: coupon.expiresAt ? coupon.expiresAt.split('T')[0] : "",
      applicableTo: coupon.applicableTo,
      firstTimeOnly: coupon.firstTimeOnly,
      isActive: coupon.isActive,
    });
    setIsEditModalOpen(true);
  };

  const handleCopyCode = (code: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code)
        .then(() => toast.success(`Coupon code "${code}" copied!`))
        .catch(() => fallbackCopyToClipboard(code));
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
      toast.success(`Coupon code "${text}" copied!`);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
    document.body.removeChild(textArea);
  };

  const formatDiscount = (coupon: Coupon) => {
    return coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : `$${coupon.value.toFixed(2)}`;
  };

  const getCouponStatus = (coupon: Coupon): string => {
    if (!coupon.isActive) return "inactive";
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return "expired";
    return "active";
  };

  const formatApplicableTo = (value: string) => {
    const map: Record<string, string> = {
      ALL: "All",
      DEPOSIT: "Deposit",
      SMS_ORDER: "SMS Order",
      RENTAL: "Rental",
      MEMBERSHIP: "Membership",
    };
    return map[value] || value;
  };

  const renderCell = (item: Coupon, column: any) => {
    if (column.key === "id") {
      return <span className="text-[#94A3B8] text-xs">{item.id.slice(0, 8)}</span>;
    }

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

    if (column.key === "name") {
      return <span className="text-white text-sm">{item.name}</span>;
    }

    if (column.key === "type") {
      return (
        <span
          className={`px-3 py-1 rounded-lg text-xs font-medium ${
            item.type === "PERCENTAGE"
              ? "bg-[#3B82F6]/20 text-[#3B82F6]"
              : "bg-[#F59E0B]/20 text-[#F59E0B]"
          }`}
        >
          {item.type === "PERCENTAGE" ? "Percentage" : "Fixed"}
        </span>
      );
    }

    if (column.key === "discount") {
      return <span className="text-white font-medium">{formatDiscount(item)}</span>;
    }

    if (column.key === "usageLimit") {
      return <span className="text-white">{item.usageLimit}</span>;
    }

    if (column.key === "usedCount") {
      return <span className="text-white">{item.usedCount}</span>;
    }

    if (column.key === "applicableTo") {
      return (
        <span className="px-2 py-1 rounded-lg text-xs font-medium bg-[#8B5CF6]/20 text-[#8B5CF6]">
          {formatApplicableTo(item.applicableTo)}
        </span>
      );
    }

    if (column.key === "expiresAt") {
      return (
        <span className="text-white text-sm">
          {item.expiresAt ? new Date(item.expiresAt).toLocaleDateString() : "No expiry"}
        </span>
      );
    }

    if (column.key === "status") {
      const status = getCouponStatus(item);
      return (
        <span
          className={`px-3 py-1 rounded-lg text-xs font-medium ${
            status === "active"
              ? "bg-[#22C55E]/20 text-[#22C55E]"
              : status === "expired"
              ? "bg-[#EF4444]/20 text-[#EF4444]"
              : "bg-[#64748B]/20 text-[#64748B]"
          }`}
        >
          {status}
        </span>
      );
    }

    if (column.key === "actions") {
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEditModal(item)}
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

    return (item as any)[column.key];
  };

  const filters = [
    {
      label: "Status",
      options: ["active", "inactive", "expired"],
      optionLabels: ["Active", "Inactive", "Expired"],
      value: filterStatus,
      onChange: (value: string) => setFilterStatus(value),
    },
    {
      label: "Type",
      options: ["FIXED", "PERCENTAGE"],
      optionLabels: ["Fixed", "Percentage"],
      value: filterType,
      onChange: (value: string) => setFilterType(value),
    },
  ];

  const handleApplyFilters = () => {
    setPage(1);
    fetchCoupons();
  };

  const handleResetFilters = () => {
    setFilterStatus("");
    setFilterType("");
    setSearchQuery("");
    setPage(1);
  };

  return (
    <div className="p-4 lg:p-8">
      <AdminPageHeader
        title="Coupon Management"
        description="Create and manage discount coupons for your platform"
        primaryAction={{
          label: "Create Coupon",
          onClick: () => {
            setFormData(initialFormState);
            setIsAddModalOpen(true);
          },
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
        onSearch={(value) => {
          setSearchQuery(value);
          setPage(1);
        }}
        filters={filters}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
      />

      {isPageLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin" />
          <span className="ml-3 text-[#94A3B8]">Loading coupons...</span>
        </div>
      ) : coupons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center mb-4">
            <Percent className="w-8 h-8 text-[#64748B]" />
          </div>
          <p className="text-white text-lg font-medium">No coupons found</p>
          <p className="text-[#94A3B8] text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <AdminDataTable columns={columns} data={coupons} renderCell={renderCell} />

          {/* Pagination */}
          <div className="flex flex-col lg:flex-row items-center justify-between mt-6 gap-4">
        <p className="text-[#94A3B8] text-sm">
          Showing {coupons?.length > 0 ? (page - 1) * limit + 1 : 0} to{" "}
          {Math.min(page * limit, total)} of {total} coupons
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white text-sm hover:bg-[rgba(255,255,255,0.12)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`px-4 py-2 rounded-xl text-sm transition-all ${
                  page === pageNum
                    ? "bg-[#3B82F6] text-white hover:brightness-110"
                    : "bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white hover:bg-[rgba(255,255,255,0.12)]"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white text-sm hover:bg-[rgba(255,255,255,0.12)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
        </>
      )}

      {/* Create Coupon Slide-Over */}
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
              disabled={isLoading || !formData.code || !formData.name || !formData.value}
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
            <h3 className="text-white text-base font-semibold mb-4">Coupon Details</h3>
            <div className="space-y-4">
              <AdminFormInput
                label="Coupon Code"
                name="code"
                value={formData.code}
                onChange={(value) => setFormData({ ...formData, code: value.toUpperCase() })}
                placeholder="e.g., WELCOME50"
                required
                error={!formData.code ? "Coupon code is required" : ""}
              />
              <AdminFormInput
                label="Coupon Name"
                name="name"
                value={formData.name}
                onChange={(value) => setFormData({ ...formData, name: value })}
                placeholder="e.g., Welcome Discount"
                required
              />
              <AdminFormInput
                label="Description"
                name="description"
                value={formData.description}
                onChange={(value) => setFormData({ ...formData, description: value })}
                placeholder="e.g., 10% off for new users"
              />
              <AdminFormSelect
                label="Discount Type"
                name="type"
                value={formData.type}
                onChange={(value) => setFormData({ ...formData, type: value as CouponType })}
                options={discountTypeOptions}
                required
              />
              <AdminFormInput
                label={formData.type === "PERCENTAGE" ? "Discount Percentage" : "Discount Amount"}
                name="value"
                type="number"
                value={formData.value}
                onChange={(value) => setFormData({ ...formData, value })}
                placeholder={formData.type === "PERCENTAGE" ? "50" : "10.00"}
                required
                icon={
                  formData.type === "PERCENTAGE" ? (
                    <Percent className="w-5 h-5" />
                  ) : (
                    <span className="text-[#64748B] text-sm">$</span>
                  )
                }
              />
              {formData.type === "PERCENTAGE" && (
                <AdminFormInput
                  label="Max Discount Amount"
                  name="maxDiscount"
                  type="number"
                  value={formData.maxDiscount}
                  onChange={(value) => setFormData({ ...formData, maxDiscount: value })}
                  placeholder="50"
                  icon={<span className="text-[#64748B] text-sm">$</span>}
                />
              )}
              <AdminFormSelect
                label="Applicable To"
                name="applicableTo"
                value={formData.applicableTo}
                onChange={(value) => setFormData({ ...formData, applicableTo: value as CouponApplicableTo })}
                options={applicableToOptions}
              />
            </div>
          </div>

          {/* Usage & Limits */}
          <div className="pt-6 border-t border-[rgba(255,255,255,0.18)]">
            <h3 className="text-white text-base font-semibold mb-4">Usage Settings</h3>
            <div className="space-y-4">
              <AdminFormInput
                label="Usage Limit"
                name="usageLimit"
                type="number"
                value={formData.usageLimit}
                onChange={(value) => setFormData({ ...formData, usageLimit: value })}
                placeholder="100"
                required
              />
              <AdminFormInput
                label="Usage Per User"
                name="usagePerUser"
                type="number"
                value={formData.usagePerUser}
                onChange={(value) => setFormData({ ...formData, usagePerUser: value })}
                placeholder="1"
              />
              <AdminFormInput
                label="Minimum Order Amount"
                name="minOrderAmount"
                type="number"
                value={formData.minOrderAmount}
                onChange={(value) => setFormData({ ...formData, minOrderAmount: value })}
                placeholder="0.00"
                icon={<span className="text-[#64748B] text-sm">$</span>}
              />
              <AdminFormInput
                label="Start Date"
                name="startsAt"
                type="date"
                value={formData.startsAt}
                onChange={(value) => setFormData({ ...formData, startsAt: value })}
                icon={<Calendar className="w-5 h-5" />}
              />
              <AdminFormInput
                label="Expiry Date"
                name="expiresAt"
                type="date"
                value={formData.expiresAt}
                onChange={(value) => setFormData({ ...formData, expiresAt: value })}
                required
                icon={<Calendar className="w-5 h-5" />}
              />
              <AdminToggleSwitch
                label="First Time Only"
                name="firstTimeOnly"
                checked={formData.firstTimeOnly}
                onChange={(checked) => setFormData({ ...formData, firstTimeOnly: checked })}
                description="Only allow first-time users to use this coupon"
              />
              <AdminToggleSwitch
                label="Active Status"
                name="isActive"
                checked={formData.isActive}
                onChange={(checked) => setFormData({ ...formData, isActive: checked })}
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
              onChange={() => {}}
              placeholder="Coupon code"
              required
            />
            <AdminFormInput
              label="Coupon Name"
              name="name"
              value={editFormData.name}
              onChange={(value) => setEditFormData({ ...editFormData, name: value })}
              placeholder="Enter coupon name"
              required
            />
            <AdminFormInput
              label="Description"
              name="description"
              value={editFormData.description}
              onChange={(value) => setEditFormData({ ...editFormData, description: value })}
              placeholder="Enter description"
            />
            <AdminFormSelect
              label="Discount Type"
              name="type"
              value={editFormData.type}
              onChange={(value) => setEditFormData({ ...editFormData, type: value as CouponType })}
              options={discountTypeOptions}
              required
            />
            <AdminFormInput
              label={editFormData.type === "PERCENTAGE" ? "Discount Percentage" : "Discount Amount"}
              name="value"
              type="number"
              value={editFormData.value}
              onChange={(value) => setEditFormData({ ...editFormData, value })}
              placeholder={editFormData.type === "PERCENTAGE" ? "50" : "10.00"}
              required
              icon={
                editFormData.type === "PERCENTAGE" ? (
                  <Percent className="w-5 h-5" />
                ) : (
                  <span className="text-[#64748B] text-sm">$</span>
                )
              }
            />
            {editFormData.type === "PERCENTAGE" && (
              <AdminFormInput
                label="Max Discount Amount"
                name="maxDiscount"
                type="number"
                value={editFormData.maxDiscount}
                onChange={(value) => setEditFormData({ ...editFormData, maxDiscount: value })}
                placeholder="50"
                icon={<span className="text-[#64748B] text-sm">$</span>}
              />
            )}
            <AdminFormSelect
              label="Applicable To"
              name="applicableTo"
              value={editFormData.applicableTo}
              onChange={(value) => setEditFormData({ ...editFormData, applicableTo: value as CouponApplicableTo })}
              options={applicableToOptions}
            />
            <AdminFormInput
              label="Usage Limit"
              name="usageLimit"
              type="number"
              value={editFormData.usageLimit}
              onChange={(value) => setEditFormData({ ...editFormData, usageLimit: value })}
              placeholder="100"
            />
            <AdminFormInput
              label="Usage Per User"
              name="usagePerUser"
              type="number"
              value={editFormData.usagePerUser}
              onChange={(value) => setEditFormData({ ...editFormData, usagePerUser: value })}
              placeholder="1"
            />
            <AdminFormInput
              label="Minimum Order Amount"
              name="minOrderAmount"
              type="number"
              value={editFormData.minOrderAmount}
              onChange={(value) => setEditFormData({ ...editFormData, minOrderAmount: value })}
              placeholder="0.00"
              icon={<span className="text-[#64748B] text-sm">$</span>}
            />
            <AdminFormInput
              label="Start Date"
              name="startsAt"
              type="date"
              value={editFormData.startsAt}
              onChange={(value) => setEditFormData({ ...editFormData, startsAt: value })}
              icon={<Calendar className="w-5 h-5" />}
            />
            <AdminFormInput
              label="Expiry Date"
              name="expiresAt"
              type="date"
              value={editFormData.expiresAt}
              onChange={(value) => setEditFormData({ ...editFormData, expiresAt: value })}
              icon={<Calendar className="w-5 h-5" />}
            />
            <AdminToggleSwitch
              label="First Time Only"
              name="firstTimeOnly"
              checked={editFormData.firstTimeOnly}
              onChange={(checked) => setEditFormData({ ...editFormData, firstTimeOnly: checked })}
              description="Only allow first-time users"
            />
            <AdminToggleSwitch
              label="Active Status"
              name="isActive"
              checked={editFormData.isActive}
              onChange={(checked) => setEditFormData({ ...editFormData, isActive: checked })}
              description="Enable this coupon"
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
          This action cannot be undone. Users will no longer be able to use this coupon.
        </p>
      </AdminModal>
    </div>
  );
}