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
import { Plus, Edit, ToggleLeft, Star, Download, DollarSign } from "lucide-react";

const initialCountriesData = [
  {
    id: "C-001",
    name: "United States",
    code: "US",
    flag: "🇺🇸",
    price: "$2.50",
    successRate: "98.2%",
    featured: true,
    status: "active",
    services: ["WhatsApp", "Telegram", "Instagram"],
  },
  {
    id: "C-002",
    name: "United Kingdom",
    code: "GB",
    flag: "🇬🇧",
    price: "$2.20",
    successRate: "97.8%",
    featured: true,
    status: "active",
    services: ["WhatsApp", "Telegram"],
  },
  {
    id: "C-003",
    name: "Canada",
    code: "CA",
    flag: "🇨🇦",
    price: "$2.30",
    successRate: "96.5%",
    featured: false,
    status: "active",
    services: ["WhatsApp", "Instagram"],
  },
  {
    id: "C-004",
    name: "Australia",
    code: "AU",
    flag: "🇦🇺",
    price: "$2.80",
    successRate: "97.1%",
    featured: false,
    status: "active",
    services: ["Telegram", "Instagram"],
  },
  {
    id: "C-005",
    name: "Germany",
    code: "DE",
    flag: "🇩🇪",
    price: "$2.40",
    successRate: "95.8%",
    featured: false,
    status: "disabled",
    services: ["WhatsApp"],
  },
];

const columns = [
  { key: "id", label: "ID", width: "8%" },
  { key: "flag", label: "Flag", width: "8%" },
  { key: "name", label: "Country", width: "18%" },
  { key: "code", label: "Code", width: "10%" },
  { key: "price", label: "SMS Price", width: "12%" },
  { key: "successRate", label: "Success Rate", width: "12%" },
  { key: "featured", label: "Featured", width: "10%" },
  { key: "status", label: "Status", width: "12%" },
  { key: "actions", label: "Actions", width: "10%" },
];

export default function AdminCountriesPage() {
  const [countriesData, setCountriesData] = useState(initialCountriesData);
  const [showFilters, setShowFilters] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDisableModalOpen, setIsDisableModalOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [newCountry, setNewCountry] = useState({
    name: "",
    code: "",
    price: "",
    successRate: "",
    flag: null as File | null,
    services: [] as string[],
    featured: false,
    status: true,
  });

  const serviceOptions = [
    { value: "WhatsApp", label: "WhatsApp" },
    { value: "Telegram", label: "Telegram" },
    { value: "Instagram", label: "Instagram" },
    { value: "Facebook", label: "Facebook" },
    { value: "Twitter", label: "Twitter" },
  ];

  const handleAddCountry = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newCountryData = {
      id: `C-${String(countriesData.length + 1).padStart(3, "0")}`,
      name: newCountry.name,
      code: newCountry.code,
      flag: "🌍",
      price: `$${newCountry.price}`,
      successRate: `${newCountry.successRate}%`,
      featured: newCountry.featured,
      status: newCountry.status ? "active" : "disabled",
      services: newCountry.services,
    };

    setCountriesData([...countriesData, newCountryData]);
    setIsAddModalOpen(false);
    setNewCountry({
      name: "",
      code: "",
      price: "",
      successRate: "",
      flag: null,
      services: [],
      featured: false,
      status: true,
    });
    setIsLoading(false);
    toast.success("Country added successfully!");
  };

  const handleEditCountry = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setCountriesData(
      countriesData.map((country) =>
        country.id === selectedCountry.id ? { ...selectedCountry } : country
      )
    );

    setIsEditModalOpen(false);
    setIsLoading(false);
    toast.success("Country updated successfully!");
  };

  const handleDisableCountry = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setCountriesData(
      countriesData.map((country) =>
        country.id === selectedCountry.id
          ? {
              ...country,
              status: country.status === "active" ? "disabled" : "active",
            }
          : country
      )
    );

    setIsDisableModalOpen(false);
    setIsLoading(false);
    const action = selectedCountry.status === "active" ? "disabled" : "enabled";
    toast.success(`Country ${action} successfully!`);
  };

  const renderCell = (item: any, column: any) => {
    if (column.key === "flag") {
      return <span className="text-2xl">{item.flag}</span>;
    }

    if (column.key === "featured") {
      return item.featured ? (
        <Star className="w-5 h-5 text-[#F59E0B] fill-[#F59E0B]" />
      ) : (
        <span className="text-[#64748B] text-sm">-</span>
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
              setSelectedCountry(item);
              setIsEditModalOpen(true);
            }}
            className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors group"
            title="Edit Country"
          >
            <Edit className="w-4 h-4 text-[#F59E0B] group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={() => {
              setSelectedCountry(item);
              setIsDisableModalOpen(true);
            }}
            className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors group"
            title={
              item.status === "active" ? "Disable Country" : "Enable Country"
            }
          >
            <ToggleLeft className="w-4 h-4 text-[#EF4444] group-hover:scale-110 transition-transform" />
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
      label: "Featured",
      options: ["Featured", "Not Featured"],
    },
    {
      label: "Price Range",
      options: ["$0-$2", "$2-$3", "$3+"],
    },
  ];

  return (
    <div className="p-4 lg:p-8">
      <AdminPageHeader
        title="Countries Management"
        description="Manage available countries, pricing, and service availability"
        primaryAction={{
          label: "Add Country",
          onClick: () => setIsAddModalOpen(true),
          icon: <Plus className="w-5 h-5" />,
        }}
        secondaryActions={[
          {
            label: "Export",
            onClick: () => toast.info("Exporting countries data..."),
            icon: <Download className="w-5 h-5" />,
          },
        ]}
      />

      <AdminFilterBar
        searchPlaceholder="Search countries..."
        onSearch={(value) => console.log("Search:", value)}
        filters={filters}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />

      <AdminDataTable columns={columns} data={countriesData} renderCell={renderCell} />

      <div className="flex flex-col lg:flex-row items-center justify-between mt-6 gap-4">
        <p className="text-[#94A3B8] text-sm">
          Showing 1 to {countriesData.length} of {countriesData.length} countries
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

      {/* Add Country Slide-Over */}
      <AdminSlideOver
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Country"
        description="Configure SMS activation availability for a new country"
        footer={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white hover:bg-[rgba(255,255,255,0.12)] transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleAddCountry}
              disabled={isLoading || !newCountry.name || !newCountry.code}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                "Save Country"
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
                label="Country Name"
                name="name"
                value={newCountry.name}
                onChange={(value) =>
                  setNewCountry({ ...newCountry, name: value })
                }
                placeholder="Enter country name"
                required
                error={!newCountry.name ? "Country name is required" : ""}
              />
              <AdminFormInput
                label="Country Code"
                name="code"
                value={newCountry.code}
                onChange={(value) =>
                  setNewCountry({ ...newCountry, code: value.toUpperCase() })
                }
                placeholder="e.g., US, UK, CA"
                required
                error={!newCountry.code ? "Country code is required" : ""}
              />
              <AdminFileUpload
                label="Country Flag"
                name="flag"
                value={newCountry.flag}
                onChange={(file) => setNewCountry({ ...newCountry, flag: file })}
                accept="image/*"
              />
            </div>
          </div>

          {/* Pricing & Performance */}
          <div className="pt-6 border-t border-[rgba(255,255,255,0.18)]">
            <h3 className="text-white text-base font-semibold mb-4">
              Pricing & Performance
            </h3>
            <div className="space-y-4">
              <AdminFormInput
                label="Default SMS Price (USD)"
                name="price"
                type="number"
                value={newCountry.price}
                onChange={(value) =>
                  setNewCountry({ ...newCountry, price: value })
                }
                placeholder="0.00"
                required
                icon={<DollarSign className="w-5 h-5" />}
              />
              <AdminFormInput
                label="Success Rate Indicator (%)"
                name="successRate"
                type="number"
                value={newCountry.successRate}
                onChange={(value) =>
                  setNewCountry({ ...newCountry, successRate: value })
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
              <AdminMultiSelect
                label="Supported Services"
                name="services"
                value={newCountry.services}
                onChange={(value) =>
                  setNewCountry({ ...newCountry, services: value })
                }
                options={serviceOptions}
                placeholder="Select supported services..."
                required
              />
              <AdminToggleSwitch
                label="Featured Country"
                name="featured"
                checked={newCountry.featured}
                onChange={(checked) =>
                  setNewCountry({ ...newCountry, featured: checked })
                }
                description="Show this country prominently to users"
              />
              <AdminToggleSwitch
                label="Country Status"
                name="status"
                checked={newCountry.status}
                onChange={(checked) =>
                  setNewCountry({ ...newCountry, status: checked })
                }
                description="Enable this country for activations"
              />
            </div>
          </div>
        </div>
      </AdminSlideOver>

      {/* Edit Country Modal */}
      <AdminModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Country"
        size="lg"
        primaryAction={{
          label: "Save Changes",
          onClick: handleEditCountry,
          loading: isLoading,
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setIsEditModalOpen(false),
        }}
      >
        {selectedCountry && (
          <div className="space-y-4">
            <AdminFormInput
              label="Country Name"
              name="name"
              value={selectedCountry.name}
              onChange={(value) =>
                setSelectedCountry({ ...selectedCountry, name: value })
              }
              placeholder="Enter country name"
              required
            />
            <AdminFormInput
              label="SMS Price (USD)"
              name="price"
              value={selectedCountry.price.replace("$", "")}
              onChange={(value) =>
                setSelectedCountry({ ...selectedCountry, price: `$${value}` })
              }
              placeholder="0.00"
              icon={<DollarSign className="w-5 h-5" />}
            />
            <AdminFormInput
              label="Success Rate (%)"
              name="successRate"
              value={selectedCountry.successRate.replace("%", "")}
              onChange={(value) =>
                setSelectedCountry({
                  ...selectedCountry,
                  successRate: `${value}%`,
                })
              }
              placeholder="95.0"
            />
          </div>
        )}
      </AdminModal>

      {/* Disable/Enable Country Modal */}
      <AdminModal
        isOpen={isDisableModalOpen}
        onClose={() => setIsDisableModalOpen(false)}
        title={
          selectedCountry?.status === "active"
            ? "Disable Country"
            : "Enable Country"
        }
        primaryAction={{
          label: selectedCountry?.status === "active" ? "Disable" : "Enable",
          onClick: handleDisableCountry,
          loading: isLoading,
          variant: selectedCountry?.status === "active" ? "danger" : "primary",
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setIsDisableModalOpen(false),
        }}
      >
        <p className="text-[#94A3B8]">
          Are you sure you want to{" "}
          {selectedCountry?.status === "active" ? "disable" : "enable"}{" "}
          <span className="text-white font-medium">
            {selectedCountry?.name}
          </span>
          ?
        </p>
        {selectedCountry?.status === "active" && (
          <p className="text-[#EF4444] text-sm mt-4">
            Users will not be able to use this country for activations until
            re-enabled.
          </p>
        )}
      </AdminModal>
    </div>
  );
}
