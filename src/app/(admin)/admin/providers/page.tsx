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
import { Plus, Edit, Ban, Download, Zap, CheckCircle, XCircle } from "lucide-react";

const initialProvidersData = [
  {
    id: "P-001",
    name: "Provider A",
    apiEndpoint: "https://api.providera.com/v1",
    apiStatus: "connected",
    servicesAvailable: 45,
    successRate: "98.5%",
    rateLimit: "1000/hour",
    priority: "High",
    status: "active",
    services: ["WhatsApp", "Telegram", "Instagram"],
  },
  {
    id: "P-002",
    name: "Provider B",
    apiEndpoint: "https://api.providerb.com/sms",
    apiStatus: "connected",
    servicesAvailable: 38,
    successRate: "97.2%",
    rateLimit: "800/hour",
    priority: "Medium",
    status: "active",
    services: ["WhatsApp", "Facebook"],
  },
  {
    id: "P-003",
    name: "Provider C",
    apiEndpoint: "https://api.providerc.com",
    apiStatus: "disconnected",
    servicesAvailable: 28,
    successRate: "95.8%",
    rateLimit: "500/hour",
    priority: "Low",
    status: "disabled",
    services: ["Telegram"],
  },
  {
    id: "P-004",
    name: "Provider D",
    apiEndpoint: "https://api.providerd.io/api",
    apiStatus: "connected",
    servicesAvailable: 52,
    successRate: "96.9%",
    rateLimit: "1200/hour",
    priority: "High",
    status: "active",
    services: ["WhatsApp", "Instagram", "Twitter"],
  },
];

const columns = [
  { key: "id", label: "ID", width: "8%" },
  { key: "name", label: "Provider Name", width: "15%" },
  { key: "apiStatus", label: "API Status", width: "12%" },
  { key: "servicesAvailable", label: "Services", width: "10%" },
  { key: "successRate", label: "Success Rate", width: "12%" },
  { key: "rateLimit", label: "Rate Limit", width: "12%" },
  { key: "priority", label: "Priority", width: "10%" },
  { key: "status", label: "Status", width: "11%" },
  { key: "actions", label: "Actions", width: "10%" },
];

export default function AdminProvidersPage() {
  const [providersData, setProvidersData] = useState(initialProvidersData);
  const [showFilters, setShowFilters] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDisableModalOpen, setIsDisableModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingAPI, setIsTestingAPI] = useState(false);

  const [newProvider, setNewProvider] = useState({
    name: "",
    logo: null as File | null,
    apiEndpoint: "",
    apiKey: "",
    rateLimit: "",
    priority: "",
    services: [] as string[],
    status: true,
  });

  const priorityOptions = [
    { value: "High", label: "High Priority" },
    { value: "Medium", label: "Medium Priority" },
    { value: "Low", label: "Low Priority" },
  ];

  const serviceOptions = [
    { value: "WhatsApp", label: "WhatsApp" },
    { value: "Telegram", label: "Telegram" },
    { value: "Instagram", label: "Instagram" },
    { value: "Facebook", label: "Facebook" },
    { value: "Twitter", label: "Twitter" },
  ];

  const handleTestAPI = async () => {
    setIsTestingAPI(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsTestingAPI(false);
    toast.success("API connection successful!");
  };

  const handleAddProvider = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newProviderData = {
      id: `P-${String(providersData.length + 1).padStart(3, "0")}`,
      name: newProvider.name,
      apiEndpoint: newProvider.apiEndpoint,
      apiStatus: "connected",
      servicesAvailable: newProvider.services.length,
      successRate: "95.0%",
      rateLimit: newProvider.rateLimit,
      priority: newProvider.priority,
      status: newProvider.status ? "active" : "disabled",
      services: newProvider.services,
    };

    setProvidersData([...providersData, newProviderData]);
    setIsAddModalOpen(false);
    setNewProvider({
      name: "",
      logo: null,
      apiEndpoint: "",
      apiKey: "",
      rateLimit: "",
      priority: "",
      services: [],
      status: true,
    });
    setIsLoading(false);
    toast.success("Provider added successfully!");
  };

  const handleEditProvider = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setProvidersData(
      providersData.map((provider) =>
        provider.id === selectedProvider.id ? { ...selectedProvider } : provider
      )
    );

    setIsEditModalOpen(false);
    setIsLoading(false);
    toast.success("Provider updated successfully!");
  };

  const handleDisableProvider = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setProvidersData(
      providersData.map((provider) =>
        provider.id === selectedProvider.id
          ? {
              ...provider,
              status: provider.status === "active" ? "disabled" : "active",
            }
          : provider
      )
    );

    setIsDisableModalOpen(false);
    setIsLoading(false);
    const action = selectedProvider.status === "active" ? "disabled" : "enabled";
    toast.success(`Provider ${action} successfully!`);
  };

  const renderCell = (item: any, column: any) => {
    if (column.key === "apiStatus") {
      return (
        <div className="flex items-center gap-2">
          {item.apiStatus === "connected" ? (
            <CheckCircle className="w-4 h-4 text-[#22C55E]" />
          ) : (
            <XCircle className="w-4 h-4 text-[#EF4444]" />
          )}
          <span
            className={`text-sm ${
              item.apiStatus === "connected"
                ? "text-[#22C55E]"
                : "text-[#EF4444]"
            }`}
          >
            {item.apiStatus}
          </span>
        </div>
      );
    }

    if (column.key === "priority") {
      const colors = {
        High: "bg-[#EF4444]/20 text-[#EF4444]",
        Medium: "bg-[#F59E0B]/20 text-[#F59E0B]",
        Low: "bg-[#64748B]/20 text-[#64748B]",
      };
      return (
        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${colors[item.priority as keyof typeof colors]}`}>
          {item.priority}
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
              setSelectedProvider(item);
              setIsEditModalOpen(true);
            }}
            className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors group"
            title="Edit Provider"
          >
            <Edit className="w-4 h-4 text-[#F59E0B] group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={() => {
              setSelectedProvider(item);
              setIsDisableModalOpen(true);
            }}
            className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors group"
            title={
              item.status === "active" ? "Disable Provider" : "Enable Provider"
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
      label: "API Status",
      options: ["Connected", "Disconnected"],
    },
    {
      label: "Priority",
      options: ["High", "Medium", "Low"],
    },
  ];

  return (
    <div className="p-4 lg:p-8">
      <AdminPageHeader
        title="Providers Management"
        description="Manage SMS providers, API connections, and service availability"
        primaryAction={{
          label: "Add Provider",
          onClick: () => setIsAddModalOpen(true),
          icon: <Plus className="w-5 h-5" />,
        }}
        secondaryActions={[
          {
            label: "Export",
            onClick: () => toast.info("Exporting providers data..."),
            icon: <Download className="w-5 h-5" />,
          },
        ]}
      />

      <AdminFilterBar
        searchPlaceholder="Search providers..."
        onSearch={(value) => console.log("Search:", value)}
        filters={filters}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />

      <AdminDataTable columns={columns} data={providersData} renderCell={renderCell} />

      <div className="flex flex-col lg:flex-row items-center justify-between mt-6 gap-4">
        <p className="text-[#94A3B8] text-sm">
          Showing 1 to {providersData.length} of {providersData.length} providers
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

      {/* Add Provider Slide-Over */}
      <AdminSlideOver
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Provider"
        description="Configure a new SMS provider with API integration"
        footer={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white hover:bg-[rgba(255,255,255,0.12)] transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleAddProvider}
              disabled={isLoading || !newProvider.name || !newProvider.apiEndpoint}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                "Save Provider"
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
                label="Provider Name"
                name="name"
                value={newProvider.name}
                onChange={(value) =>
                  setNewProvider({ ...newProvider, name: value })
                }
                placeholder="Enter provider name"
                required
                error={!newProvider.name ? "Provider name is required" : ""}
              />
              <AdminFileUpload
                label="Provider Logo"
                name="logo"
                value={newProvider.logo}
                onChange={(file) => setNewProvider({ ...newProvider, logo: file })}
                accept="image/*"
              />
            </div>
          </div>

          {/* API Configuration */}
          <div className="pt-6 border-t border-[rgba(255,255,255,0.18)]">
            <h3 className="text-white text-base font-semibold mb-4">
              API Configuration
            </h3>
            <div className="space-y-4">
              <AdminFormInput
                label="API Endpoint URL"
                name="apiEndpoint"
                value={newProvider.apiEndpoint}
                onChange={(value) =>
                  setNewProvider({ ...newProvider, apiEndpoint: value })
                }
                placeholder="https://api.provider.com/v1"
                required
                error={
                  !newProvider.apiEndpoint ? "API endpoint is required" : ""
                }
              />
              <AdminFormInput
                label="API Key / Authentication Token"
                name="apiKey"
                type="password"
                value={newProvider.apiKey}
                onChange={(value) =>
                  setNewProvider({ ...newProvider, apiKey: value })
                }
                placeholder="Enter API key or token"
                required
              />
              <AdminFormInput
                label="Rate Limit"
                name="rateLimit"
                value={newProvider.rateLimit}
                onChange={(value) =>
                  setNewProvider({ ...newProvider, rateLimit: value })
                }
                placeholder="e.g., 1000/hour"
                required
              />

              {/* Test API Connection */}
              <button
                onClick={handleTestAPI}
                disabled={!newProvider.apiEndpoint || isTestingAPI}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.2)] text-[#F59E0B] hover:bg-[rgba(245,158,11,0.15)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTestingAPI ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#F59E0B]/30 border-t-[#F59E0B] rounded-full animate-spin" />
                    Testing Connection...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Test API Connection
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Services & Priority */}
          <div className="pt-6 border-t border-[rgba(255,255,255,0.18)]">
            <h3 className="text-white text-base font-semibold mb-4">
              Services & Priority
            </h3>
            <div className="space-y-4">
              <AdminMultiSelect
                label="Services Supported"
                name="services"
                value={newProvider.services}
                onChange={(value) =>
                  setNewProvider({ ...newProvider, services: value })
                }
                options={serviceOptions}
                placeholder="Select supported services..."
                required
              />
              <AdminFormSelect
                label="Provider Priority Level"
                name="priority"
                value={newProvider.priority}
                onChange={(value) =>
                  setNewProvider({ ...newProvider, priority: value })
                }
                options={priorityOptions}
                required
              />
              <AdminToggleSwitch
                label="Provider Status"
                name="status"
                checked={newProvider.status}
                onChange={(checked) =>
                  setNewProvider({ ...newProvider, status: checked })
                }
                description="Enable this provider for activations"
              />
            </div>
          </div>
        </div>
      </AdminSlideOver>

      {/* Edit Provider Modal */}
      <AdminModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Provider"
        size="lg"
        primaryAction={{
          label: "Save Changes",
          onClick: handleEditProvider,
          loading: isLoading,
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setIsEditModalOpen(false),
        }}
      >
        {selectedProvider && (
          <div className="space-y-4">
            <AdminFormInput
              label="Provider Name"
              name="name"
              value={selectedProvider.name}
              onChange={(value) =>
                setSelectedProvider({ ...selectedProvider, name: value })
              }
              placeholder="Enter provider name"
              required
            />
            <AdminFormInput
              label="API Endpoint"
              name="apiEndpoint"
              value={selectedProvider.apiEndpoint}
              onChange={(value) =>
                setSelectedProvider({ ...selectedProvider, apiEndpoint: value })
              }
              placeholder="https://api.provider.com/v1"
              required
            />
            <AdminFormInput
              label="Rate Limit"
              name="rateLimit"
              value={selectedProvider.rateLimit}
              onChange={(value) =>
                setSelectedProvider({ ...selectedProvider, rateLimit: value })
              }
              placeholder="e.g., 1000/hour"
            />
          </div>
        )}
      </AdminModal>

      {/* Disable/Enable Provider Modal */}
      <AdminModal
        isOpen={isDisableModalOpen}
        onClose={() => setIsDisableModalOpen(false)}
        title={
          selectedProvider?.status === "active"
            ? "Disable Provider"
            : "Enable Provider"
        }
        primaryAction={{
          label: selectedProvider?.status === "active" ? "Disable" : "Enable",
          onClick: handleDisableProvider,
          loading: isLoading,
          variant: selectedProvider?.status === "active" ? "danger" : "primary",
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setIsDisableModalOpen(false),
        }}
      >
        <p className="text-[#94A3B8]">
          Are you sure you want to{" "}
          {selectedProvider?.status === "active" ? "disable" : "enable"}{" "}
          <span className="text-white font-medium">
            {selectedProvider?.name}
          </span>
          ?
        </p>
        {selectedProvider?.status === "active" && (
          <p className="text-[#EF4444] text-sm mt-4">
            All services from this provider will become unavailable until
            re-enabled.
          </p>
        )}
      </AdminModal>
    </div>
  );
}
