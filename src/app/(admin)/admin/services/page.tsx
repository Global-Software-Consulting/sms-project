'use client';

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from 'sonner';
import { AdminDataTable } from '@/components/admin/data-table';
import { AdminPageHeader } from '@/components/admin/page-header';
import { AdminFilterBar } from '@/components/admin/filter-bar';
import { AdminModal } from '@/components/admin/modal';
import { AdminStatusBadge } from '@/components/admin/status-badge';
import { AdminFormInput, AdminFormSelect } from '@/components/admin/form-input';
import { AdminToggleSwitch } from '@/components/admin/toggle-switch';
import {
  Edit, Ban, Download, Plus, Loader2, ChevronLeft, ChevronRight,
  Eye, XCircle
} from "lucide-react";
import {
  adminGetServices,
  adminCreateService,
  adminUpdateService,
  adminBulkDisableServices,
  type SmsService,
  type AdminServiceQueryParams,
  type PaginatedResponse,
} from '@/lib/api/smsApi';

const columns = [
  { key: "id", label: "ID", width: "7%" },
  { key: "icon", label: "Icon", width: "6%" },
  { key: "name", label: "Service Name", width: "15%" },
  { key: "provider", label: "Provider", width: "12%" },
  { key: "price", label: "Price", width: "8%" },
  { key: "successRate", label: "Success Rate", width: "10%" },
  { key: "status", label: "Status", width: "10%" },
  { key: "createdDate", label: "Created Date", width: "12%" },
  { key: "actions", label: "Actions", width: "10%" },
];

const categoryOptions = [
  { value: "social", label: "Social Media" },
  { value: "messaging", label: "Messaging" },
  { value: "finance", label: "Finance" },
  { value: "gaming", label: "Gaming" },
  { value: "shopping", label: "Shopping" },
  { value: "other", label: "Other" },
];

export default function AdminServicesPage() {
  // Data state
  const [services, setServices] = useState<SmsService[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 50, totalPages: 0, hasNextPage: false, hasPrevPage: false });
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Filters
  const [searchValue, setSearchValue] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Modal state
  const [selectedService, setSelectedService] = useState<SmsService | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDisableModalOpen, setIsDisableModalOpen] = useState(false);
  const [isBulkDisableModalOpen, setIsBulkDisableModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Add form
  const [addForm, setAddForm] = useState({
    name: "", serviceCode: "", providerId: "", defaultPrice: "",
    successRate: "", iconUrl: "", category: "", isActive: true,
  });

  // Edit form
  const [editForm, setEditForm] = useState({ name: "", category: "", iconUrl: "", isActive: true });

  // Search debounce
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch services
  const fetchServices = useCallback(async () => {
    setIsPageLoading(true);
    try {
      const params: AdminServiceQueryParams = {
        page: currentPage,
        limit: 50,
      };
      if (searchValue) params.search = searchValue;
      if (categoryFilter) params.category = categoryFilter;
      if (isActiveFilter === "true") params.isActive = true;
      if (isActiveFilter === "false") params.isActive = false;

      const response: PaginatedResponse<SmsService> = await adminGetServices(params);
      setServices(response.data);
      setMeta(response.meta);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch services");
    } finally {
      setIsPageLoading(false);
    }
  }, [currentPage, searchValue, isActiveFilter, categoryFilter]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Debounced search
  const handleSearch = (value: string) => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setSearchValue(value);
      setCurrentPage(1);
    }, 500);
  };

  // Create service
  const handleCreateService = async () => {
    setIsActionLoading(true);
    try {
      await adminCreateService({
        name: addForm.name,
        serviceCode: addForm.serviceCode,
        providerId: addForm.providerId,
        defaultPrice: parseFloat(addForm.defaultPrice),
        successRate: addForm.successRate ? parseFloat(addForm.successRate) : undefined,
        iconUrl: addForm.iconUrl || undefined,
        category: addForm.category || undefined,
        isActive: addForm.isActive,
      });
      toast.success("Service created successfully!");
      setIsAddModalOpen(false);
      setAddForm({ name: "", serviceCode: "", providerId: "", defaultPrice: "", successRate: "", iconUrl: "", category: "", isActive: true });
      fetchServices();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create service");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Open edit modal
  const handleOpenEdit = (service: SmsService) => {
    setSelectedService(service);
    setEditForm({
      name: service.name,
      category: service.category || "",
      iconUrl: service.iconUrl || "",
      isActive: service.isActive !== false,
    });
    setIsEditModalOpen(true);
  };

  // Update service
  const handleUpdateService = async () => {
    if (!selectedService) return;
    setIsActionLoading(true);
    try {
      const data: { name?: string; category?: string; iconUrl?: string; isActive?: boolean } = {};
      if (editForm.name !== selectedService.name) data.name = editForm.name;
      if (editForm.category !== (selectedService.category || "")) data.category = editForm.category;
      if (editForm.iconUrl !== (selectedService.iconUrl || "")) data.iconUrl = editForm.iconUrl;
      if (editForm.isActive !== (selectedService.isActive !== false)) data.isActive = editForm.isActive;

      await adminUpdateService(selectedService.id, data);
      toast.success("Service updated successfully!");
      setIsEditModalOpen(false);
      fetchServices();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update service");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Toggle service active/disabled
  const handleToggleService = async () => {
    if (!selectedService) return;
    setIsActionLoading(true);
    try {
      const newStatus = selectedService.isActive === false ? true : false;
      await adminUpdateService(selectedService.id, { isActive: newStatus });
      toast.success(`Service ${newStatus ? 'enabled' : 'disabled'} successfully!`);
      setIsDisableModalOpen(false);
      fetchServices();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update service");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Bulk disable
  const handleBulkDisable = async () => {
    if (selectedIds.length === 0) return;
    setIsActionLoading(true);
    try {
      const result = await adminBulkDisableServices(selectedIds);
      toast.success(`${result.count} services disabled successfully!`);
      setIsBulkDisableModalOpen(false);
      setSelectedIds([]);
      fetchServices();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to bulk disable services");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Toggle select for bulk
  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === services.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(services.map(s => s.id));
    }
  };

  // Format date
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toISOString().split('T')[0];
  };

  // Render cell
  const renderCell = (item: SmsService, column: any) => {
    switch (column.key) {
      case "id":
        return <span className="text-white text-sm">{item.id}</span>;

      case "icon":
        return item.iconUrl ? (
          <img src={item.iconUrl} alt={item.name} className="w-8 h-8 rounded-lg object-cover" />
        ) : (
          <div className="w-8 h-8 rounded-lg bg-[rgba(59,130,246,0.2)] flex items-center justify-center text-[#3B82F6] text-xs font-bold">
            {item.name.slice(0, 2).toUpperCase()}
          </div>
        );

      case "name":
        return (
          <div>
            <p className="text-white text-sm font-medium">{item.name}</p>
            <p className="text-[#64748B] text-xs">{item.slug}</p>
          </div>
        );

      case "provider":
        return (
          <span className="text-white text-sm">
            {item.provider?.name || item.provider?.slug || '-'}
          </span>
        );

      case "price":
        return (
          <span className="text-white text-sm font-medium">
            {item.defaultPrice != null ? `$${parseFloat(String(item.defaultPrice)).toFixed(2)}` : '-'}
          </span>
        );

      case "successRate":
        return (
          <span className="text-white text-sm">
            {item.successRate != null ? `${item.successRate}%` : '-'}
          </span>
        );

      case "createdDate":
        return (
          <span className="text-[#94A3B8] text-sm">{formatDate(item.createdAt)}</span>
        );

      case "status":
        return (
          <AdminStatusBadge
            status={item.isActive !== false ? "active" : "disabled"}
            variant={item.isActive !== false ? "success" : "default"}
          />
        );

      case "actions":
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenEdit(item)}
              className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors group"
              title="Edit Service"
            >
              <Edit className="w-4 h-4 text-[#F59E0B] group-hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={() => { setSelectedService(item); setIsDisableModalOpen(true); }}
              className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors group"
              title={item.isActive !== false ? "Disable Service" : "Enable Service"}
            >
              <Ban className="w-4 h-4 text-[#EF4444] group-hover:scale-110 transition-transform" />
            </button>
          </div>
        );

      default:
        return (item as any)[column.key] ?? '-';
    }
  };

  // Filters config
  const filters = [
    {
      label: "Status",
      options: ["true", "false"],
      optionLabels: ["Active", "Disabled"],
      value: isActiveFilter,
      onChange: (val: string) => { setIsActiveFilter(val); setCurrentPage(1); },
    },
    {
      label: "Category",
      options: categoryOptions.map(c => c.value),
      optionLabels: categoryOptions.map(c => c.label),
      value: categoryFilter,
      onChange: (val: string) => { setCategoryFilter(val); setCurrentPage(1); },
    },
  ];

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
      for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
      if (current < total - 2) pages.push(-1);
      pages.push(total);
    }
    return pages;
  };

  return (
    <div className="p-4 lg:p-8">
      <AdminPageHeader
        title="Product Management"
        description="Manage SMS services, configure providers, and monitor success rates"
        primaryAction={{
          label: "Add Service",
          onClick: () => setIsAddModalOpen(true),
          icon: <Plus className="w-5 h-5" />,
        }}
        secondaryActions={[
          {
            label: "Export",
            onClick: () => toast.info("Exporting services data..."),
            icon: <Download className="w-5 h-5" />,
          },
        ]}
      />

      <AdminFilterBar
        searchPlaceholder="Search services..."
        onSearch={handleSearch}
        filters={filters}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onApplyFilters={() => { setCurrentPage(1); fetchServices(); }}
        onResetFilters={() => {
          setSearchValue("");
          setIsActiveFilter("");
          setCategoryFilter("");
          setCurrentPage(1);
        }}
      />

      {/* Bulk actions bar */}
      {selectedIds.length > 0 && (
        <div className="mb-4 p-3 rounded-xl bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.2)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedIds.length === services.length}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded accent-[#3B82F6]"
            />
            <span className="text-white text-sm font-medium">{selectedIds.length} service(s) selected</span>
          </div>
          <button
            onClick={() => setIsBulkDisableModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-white text-sm font-medium transition-colors"
          >
            <XCircle className="w-4 h-4" />
            Bulk Disable
          </button>
        </div>
      )}

      {/* Loading / Empty / Table */}
      {isPageLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin" />
          <span className="ml-3 text-[#94A3B8]">Loading services...</span>
        </div>
      ) : services.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center mb-4">
            <Eye className="w-8 h-8 text-[#64748B]" />
          </div>
          <p className="text-white text-lg font-medium">No services found</p>
          <p className="text-[#94A3B8] text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <AdminDataTable columns={columns} data={services} renderCell={renderCell} />

          {/* Pagination */}
          <div className="flex flex-col lg:flex-row items-center justify-between mt-6 gap-4">
            <p className="text-[#94A3B8] text-sm">
              Showing {((meta.page - 1) * meta.limit) + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} services
            </p>
            {meta.totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={!meta.hasPrevPage}
                  className="px-3 py-2 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white text-sm hover:bg-[rgba(255,255,255,0.12)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                {getPageNumbers().map((page, index) =>
                  page === -1 ? (
                    <span key={`ellipsis-${index}`} className="px-2 text-[#94A3B8]">...</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-xl text-sm transition-all ${
                        page === meta.page
                          ? 'bg-[#3B82F6] text-white hover:brightness-110'
                          : 'bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white hover:bg-[rgba(255,255,255,0.12)]'
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={!meta.hasNextPage}
                  className="px-3 py-2 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white text-sm hover:bg-[rgba(255,255,255,0.12)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* ========== Edit Service Modal ========== */}
      <AdminModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Service"
        size="lg"
        primaryAction={{
          label: "Save Changes",
          onClick: handleUpdateService,
          loading: isActionLoading,
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setIsEditModalOpen(false),
        }}
      >
        {selectedService && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-[rgba(255,255,255,0.05)] mb-2">
              <p className="text-[#94A3B8] text-xs">Service ID</p>
              <p className="text-white text-sm font-mono">{selectedService.id}</p>
            </div>
            <AdminFormInput
              label="Service Name"
              name="name"
              value={editForm.name}
              onChange={(value) => setEditForm({ ...editForm, name: value })}
              placeholder="Enter service name"
              required
            />
            <AdminFormSelect
              label="Category"
              name="category"
              value={editForm.category}
              onChange={(value) => setEditForm({ ...editForm, category: value })}
              options={categoryOptions}
            />
            <AdminFormInput
              label="Icon URL"
              name="iconUrl"
              value={editForm.iconUrl}
              onChange={(value) => setEditForm({ ...editForm, iconUrl: value })}
              placeholder="https://example.com/icon.png"
            />
            <AdminToggleSwitch
              label="Active"
              name="isActive"
              checked={editForm.isActive}
              onChange={(checked) => setEditForm({ ...editForm, isActive: checked })}
              description="Enable this service for users"
            />
          </div>
        )}
      </AdminModal>

      {/* ========== Disable/Enable Service Modal ========== */}
      <AdminModal
        isOpen={isDisableModalOpen}
        onClose={() => setIsDisableModalOpen(false)}
        title={selectedService?.isActive !== false ? "Disable Service" : "Enable Service"}
        primaryAction={{
          label: selectedService?.isActive !== false ? "Disable" : "Enable",
          onClick: handleToggleService,
          loading: isActionLoading,
          variant: selectedService?.isActive !== false ? "danger" : "primary",
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setIsDisableModalOpen(false),
        }}
      >
        <p className="text-[#94A3B8]">
          Are you sure you want to {selectedService?.isActive !== false ? "disable" : "enable"}{" "}
          <span className="text-white font-medium">{selectedService?.name}</span>?
        </p>
        {selectedService?.isActive !== false && (
          <p className="text-[#EF4444] text-sm mt-4">
            Users will not be able to activate this service until re-enabled.
          </p>
        )}
      </AdminModal>

      {/* ========== Bulk Disable Modal ========== */}
      <AdminModal
        isOpen={isBulkDisableModalOpen}
        onClose={() => setIsBulkDisableModalOpen(false)}
        title="Bulk Disable Services"
        primaryAction={{
          label: `Disable ${selectedIds.length} Service(s)`,
          onClick: handleBulkDisable,
          loading: isActionLoading,
          variant: "danger",
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setIsBulkDisableModalOpen(false),
        }}
      >
        <p className="text-[#94A3B8]">
          Are you sure you want to disable <span className="text-white font-medium">{selectedIds.length}</span> selected service(s)?
        </p>
        <p className="text-[#EF4444] text-sm mt-4">
          These services will be disabled and unavailable to users.
        </p>
      </AdminModal>

      {/* ========== Add Service Modal ========== */}
      <AdminModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New Service"
        size="lg"
        primaryAction={{
          label: "Create Service",
          onClick: handleCreateService,
          loading: isActionLoading,
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setIsAddModalOpen(false),
        }}
      >
        <div className="space-y-4">
          <AdminFormInput
            label="Service Name"
            name="name"
            value={addForm.name}
            onChange={(value) => setAddForm({ ...addForm, name: value })}
            placeholder="e.g., WhatsApp"
            required
          />
          <AdminFormInput
            label="Service Code"
            name="serviceCode"
            value={addForm.serviceCode}
            onChange={(value) => setAddForm({ ...addForm, serviceCode: value })}
            placeholder="e.g., WA"
            required
          />
          <AdminFormInput
            label="Provider ID"
            name="providerId"
            value={addForm.providerId}
            onChange={(value) => setAddForm({ ...addForm, providerId: value })}
            placeholder="Provider ID"
            required
          />
          <AdminFormInput
            label="Default Price (USD)"
            name="defaultPrice"
            type="number"
            value={addForm.defaultPrice}
            onChange={(value) => setAddForm({ ...addForm, defaultPrice: value })}
            placeholder="1.50"
            required
          />
          <AdminFormInput
            label="Success Rate (%)"
            name="successRate"
            type="number"
            value={addForm.successRate}
            onChange={(value) => setAddForm({ ...addForm, successRate: value })}
            placeholder="95"
          />
          <AdminFormInput
            label="Icon URL"
            name="iconUrl"
            value={addForm.iconUrl}
            onChange={(value) => setAddForm({ ...addForm, iconUrl: value })}
            placeholder="https://example.com/icon.png"
          />
          <AdminFormSelect
            label="Category"
            name="category"
            value={addForm.category}
            onChange={(value) => setAddForm({ ...addForm, category: value })}
            options={categoryOptions}
          />
          <AdminToggleSwitch
            label="Active"
            name="isActive"
            checked={addForm.isActive}
            onChange={(checked) => setAddForm({ ...addForm, isActive: checked })}
            description="Enable this service for users"
          />
        </div>
      </AdminModal>
    </div>
  );
}
