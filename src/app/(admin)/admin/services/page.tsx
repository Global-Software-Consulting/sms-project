'use client';

import { useState } from "react";
import { AdminDataTable } from '@/components/admin/data-table';
import { AdminPageHeader } from '@/components/admin/page-header';
import { AdminFilterBar } from '@/components/admin/filter-bar';
import { AdminSlideOver } from '@/components/admin/slide-over';
import { AdminModal } from '@/components/admin/modal';
import { AdminFormInput, AdminFormSelect } from '@/components/admin/form-input';
import { AdminFileUpload } from '@/components/admin/file-upload';
import { AdminMultiSelect } from '@/components/admin/multi-select';
import { AdminToggleSwitch } from '@/components/admin/toggle-switch';
import { toast } from 'sonner';
import { Plus, Edit, Ban, Download, DollarSign } from "lucide-react";

const initialServicesData = [
  {
    id: "S-001",
    name: "WhatsApp",
    icon: "📱",
    provider: "Provider A",
    code: "WA",
    price: "$0.35",
    successRate: "98.5%",
    status: "active",
    createdDate: "2023-11-10",
    countries: ["US", "UK", "CA"],
  },
  {
    id: "S-002",
    name: "Telegram",
    icon: "✈️",
    provider: "Provider B",
    code: "TG",
    price: "$0.28",
    successRate: "97.8%",
    status: "active",
    createdDate: "2023-11-12",
    countries: ["US", "UK", "DE"],
  },
  {
    id: "S-003",
    name: "Instagram",
    icon: "📷",
    provider: "Provider A",
    code: "IG",
    price: "$0.42",
    successRate: "96.2%",
    status: "active",
    createdDate: "2023-11-15",
    countries: ["US", "UK", "FR"],
  },
  {
    id: "S-004",
    name: "Facebook",
    icon: "👍",
    provider: "Provider C",
    code: "FB",
    price: "$0.38",
    successRate: "95.1%",
    status: "disabled",
    createdDate: "2023-11-20",
    countries: ["US", "CA"],
  },
];

const columns = [
  { key: "id", label: "ID", width: "8%" },
  { key: "icon", label: "Icon", width: "8%" },
  { key: "name", label: "Service Name", width: "15%" },
  { key: "provider", label: "Provider", width: "14%" },
  { key: "price", label: "Price", width: "10%" },
  { key: "successRate", label: "Success Rate", width: "12%" },
  { key: "status", label: "Status", width: "10%" },
  { key: "createdDate", label: "Created Date", width: "13%" },
  { key: "actions", label: "Actions", width: "10%" },
];

export default function AdminServicesPage() {
  const [servicesData, setServicesData] = useState(initialServicesData);
  const [showFilters, setShowFilters] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDisableModalOpen, setIsDisableModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [newService, setNewService] = useState({
    name: "",
    code: "",
    provider: "",
    price: "",
    successRate: "",
    icon: null as File | null,
    description: "",
    category: "",
    countries: [] as string[],
    status: true,
  });

  const providerOptions = [
    { value: "Provider A", label: "Provider A" },
    { value: "Provider B", label: "Provider B" },
    { value: "Provider C", label: "Provider C" },
  ];

  const categoryOptions = [
    { value: "social", label: "Social Media" },
    { value: "messaging", label: "Messaging" },
    { value: "finance", label: "Finance" },
    { value: "gaming", label: "Gaming" },
  ];

  const countryOptions = [
    { value: "US", label: "United States" },
    { value: "UK", label: "United Kingdom" },
    { value: "CA", label: "Canada" },
    { value: "DE", label: "Germany" },
    { value: "FR", label: "France" },
    { value: "AU", label: "Australia" },
  ];

  const handleAddService = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newServiceData = {
      id: `S-${String(servicesData.length + 1).padStart(3, "0")}`,
      name: newService.name,
      icon: "🆕",
      provider: newService.provider,
      code: newService.code,
      price: `$${newService.price}`,
      successRate: `${newService.successRate}%`,
      status: newService.status ? "active" : "disabled",
      createdDate: new Date().toISOString().split("T")[0],
      countries: newService.countries,
    };

    setServicesData([...servicesData, newServiceData]);
    setIsAddModalOpen(false);
    setNewService({
      name: "",
      code: "",
      provider: "",
      price: "",
      successRate: "",
      icon: null,
      description: "",
      category: "",
      countries: [],
      status: true,
    });
    setIsLoading(false);
    toast.success("Service created successfully!");
  };

  const handleEditService = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setServicesData(
      servicesData.map((service) =>
        service.id === selectedService.id ? { ...selectedService } : service
      )
    );

    setIsEditModalOpen(false);
    setIsLoading(false);
    toast.success("Service updated successfully!");
  };

  const handleDisableService = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setServicesData(
      servicesData.map((service) =>
        service.id === selectedService.id
          ? {
              ...service,
              status: service.status === "active" ? "disabled" : "active",
            }
          : service
      )
    );

    setIsDisableModalOpen(false);
    setIsLoading(false);
    const action = selectedService.status === "active" ? "disabled" : "enabled";
    toast.success(`Service ${action} successfully!`);
  };

  const renderCell = (item: any, column: any) => {
    if (column.key === "icon") {
      return <span className="text-2xl">{item.icon}</span>;
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
              setSelectedService(item);
              setIsEditModalOpen(true);
            }}
            className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors group"
            title="Edit Service"
          >
            <Edit className="w-4 h-4 text-[#F59E0B] group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={() => {
              setSelectedService(item);
              setIsDisableModalOpen(true);
            }}
            className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors group"
            title={
              item.status === "active" ? "Disable Service" : "Enable Service"
            }
          >
            <Ban className="w-4 h-4 text-[#EF4444] group-hover:scale-110 transition-transform" />
          </button>
        </div>
      );
    }

    return item[column.key];
  };

  const filters = [
    {
      label: "Status",
      options: ["Active", "Disabled"],
    },
    {
      label: "Provider",
      options: ["Provider A", "Provider B", "Provider C"],
    },
    {
      label: "Success Rate",
      options: ["90%+", "95%+", "98%+"],
    },
  ];

  return (
    <div className="p-4 lg:p-8">
      <AdminPageHeader
        title="Services Management"
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
        onSearch={(value) => console.log("Search:", value)}
        filters={filters}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />

      <AdminDataTable columns={columns} data={servicesData} renderCell={renderCell} />

      <div className="flex flex-col lg:flex-row items-center justify-between mt-6 gap-4">
        <p className="text-[#94A3B8] text-sm">
          Showing 1 to {servicesData.length} of {servicesData.length} services
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

      {/* Add Service Modal */}
      <AdminSlideOver
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Service"
        description="Configure a new SMS service for your platform"
        footer={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white hover:bg-[rgba(255,255,255,0.12)] transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleAddService}
              disabled={isLoading || !newService.name || !newService.provider}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                "Save Service"
              )}
            </button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-white text-base font-semibold mb-4">
              Basic Information
            </h3>
            <div className="space-y-4">
              <AdminFormInput
                label="Service Name"
                name="name"
                value={newService.name}
                onChange={(value) =>
                  setNewService({ ...newService, name: value })
                }
                placeholder="Enter service name"
                required
                error={!newService.name ? "Service name is required" : ""}
              />
              <AdminFormInput
                label="Service Code / Identifier"
                name="code"
                value={newService.code}
                onChange={(value) =>
                  setNewService({ ...newService, code: value })
                }
                placeholder="e.g., WA, TG, IG"
                required
                error={!newService.code ? "Service code is required" : ""}
              />
              <AdminFileUpload
                label="Service Icon"
                name="icon"
                value={newService.icon}
                onChange={(file) => setNewService({ ...newService, icon: file })}
                accept="image/*"
              />
            </div>
          </div>

          {/* Provider & Pricing */}
          <div className="pt-6 border-t border-[rgba(255,255,255,0.18)]">
            <h3 className="text-white text-base font-semibold mb-4">
              Provider & Pricing
            </h3>
            <div className="space-y-4">
              <AdminFormSelect
                label="Provider"
                name="provider"
                value={newService.provider}
                onChange={(value) =>
                  setNewService({ ...newService, provider: value })
                }
                options={providerOptions}
                required
                error={!newService.provider ? "Provider is required" : ""}
              />
              <AdminFormInput
                label="Default Price (USD)"
                name="price"
                type="number"
                value={newService.price}
                onChange={(value) =>
                  setNewService({ ...newService, price: value })
                }
                placeholder="0.00"
                required
                icon={<DollarSign className="w-5 h-5" />}
              />
              <AdminFormInput
                label="Success Rate (%)"
                name="successRate"
                type="number"
                value={newService.successRate}
                onChange={(value) =>
                  setNewService({ ...newService, successRate: value })
                }
                placeholder="95.0"
                required
              />
            </div>
          </div>

          {/* Configuration */}
          <div className="pt-6 border-t border-[rgba(255,255,255,0.18)]">
            <h3 className="text-white text-base font-semibold mb-4">
              Configuration
            </h3>
            <div className="space-y-4">
              <AdminFormSelect
                label="Service Category"
                name="category"
                value={newService.category}
                onChange={(value) =>
                  setNewService({ ...newService, category: value })
                }
                options={categoryOptions}
              />
              <AdminMultiSelect
                label="Country Availability"
                name="countries"
                value={newService.countries}
                onChange={(value) =>
                  setNewService({ ...newService, countries: value })
                }
                options={countryOptions}
                placeholder="Select countries..."
              />
              <AdminToggleSwitch
                label="Service Status"
                name="status"
                checked={newService.status}
                onChange={(checked) =>
                  setNewService({ ...newService, status: checked })
                }
                description="Enable this service for users"
              />
            </div>
          </div>
        </div>
      </AdminSlideOver>

      {/* Edit Service Modal */}
      <AdminModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Service"
        size="lg"
        primaryAction={{
          label: "Save Changes",
          onClick: handleEditService,
          loading: isLoading,
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setIsEditModalOpen(false),
        }}
      >
        {selectedService && (
          <div className="space-y-4">
            <AdminFormInput
              label="Service Name"
              name="name"
              value={selectedService.name}
              onChange={(value) =>
                setSelectedService({ ...selectedService, name: value })
              }
              placeholder="Enter service name"
              required
            />
            <AdminFormSelect
              label="Provider"
              name="provider"
              value={selectedService.provider}
              onChange={(value) =>
                setSelectedService({ ...selectedService, provider: value })
              }
              options={providerOptions}
              required
            />
            <AdminFormInput
              label="Price (USD)"
              name="price"
              value={selectedService.price.replace("$", "")}
              onChange={(value) =>
                setSelectedService({ ...selectedService, price: `$${value}` })
              }
              placeholder="0.00"
              icon={<DollarSign className="w-5 h-5" />}
            />
          </div>
        )}
      </AdminModal>

      {/* Disable/Enable Service Modal */}
      <AdminModal
        isOpen={isDisableModalOpen}
        onClose={() => setIsDisableModalOpen(false)}
        title={
          selectedService?.status === "active"
            ? "Disable Service"
            : "Enable Service"
        }
        primaryAction={{
          label: selectedService?.status === "active" ? "Disable" : "Enable",
          onClick: handleDisableService,
          loading: isLoading,
          variant: selectedService?.status === "active" ? "danger" : "primary",
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setIsDisableModalOpen(false),
        }}
      >
        <p className="text-[#94A3B8]">
          Are you sure you want to{" "}
          {selectedService?.status === "active" ? "disable" : "enable"}{" "}
          <span className="text-white font-medium">
            {selectedService?.name}
          </span>
          ?
        </p>
        {selectedService?.status === "active" && (
          <p className="text-[#EF4444] text-sm mt-4">
            Users will not be able to activate this service until re-enabled.
          </p>
        )}
      </AdminModal>
    </div>
  );
}
