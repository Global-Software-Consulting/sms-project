'use client';

import { useState } from "react";
import { toast } from 'sonner';
import {
  Edit2,
  Trash2,
  Plus,
  ChevronRight,
  Check,
  X,
  TrendingUp,
  Globe,
  Star,
  Search,
  MoveRight,
  DollarSign,
  Percent,
  Save,
  Crown,
} from "lucide-react";

interface Service {
  id: string;
  name: string;
  country: string;
  successRate: number;
  orders: number;
  price?: number;
}

interface Provider {
  id: string;
  name: string;
  version: string;
  countries: string[];
  services: Service[];
  totalServices: number;
  avgSuccessRate: number;
}

interface VIPCategory {
  id: string;
  name: string;
  services: Service[];
}

interface ServicePrice {
  serviceId: string;
  serviceName: string;
  country: string;
  basePrice: number;
  finalPrice: number;
  provider: string;
}

interface Subscription {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  discount: number;
  status: "active" | "inactive";
  color: string;
}

export default function AdminSmsServicesPage() {
  const [activeTab, setActiveTab] = useState<"providers" | "vip" | "pricing" | "subscriptions">("providers");
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showEditProviderModal, setShowEditProviderModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddToVIPModal, setShowAddToVIPModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedVIPCategory, setSelectedVIPCategory] = useState<string>("v1");

  // Pricing State
  const [globalMarkup, setGlobalMarkup] = useState<number>(0);
  const [pricingSearchQuery, setPricingSearchQuery] = useState("");
  const [showEditPriceModal, setShowEditPriceModal] = useState(false);
  const [selectedServicePrice, setSelectedServicePrice] = useState<ServicePrice | null>(null);
  const [newPrice, setNewPrice] = useState("");

  // Subscriptions State
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([
    {
      id: "1",
      name: "Free",
      price: 0,
      duration: "Forever",
      features: ["Basic SMS Services", "5 Activations/month", "Email Support", "Standard Speed"],
      discount: 0,
      status: "active",
      color: "#64748B",
    },
    {
      id: "2",
      name: "Basic",
      price: 9.99,
      duration: "Monthly",
      features: ["All SMS Services", "50 Activations/month", "Priority Support", "Fast Speed", "5% Discount"],
      discount: 5,
      status: "active",
      color: "#3B82F6",
    },
    {
      id: "3",
      name: "Pro",
      price: 29.99,
      duration: "Monthly",
      features: [
        "All SMS Services",
        "200 Activations/month",
        "24/7 Priority Support",
        "Ultra Fast Speed",
        "15% Discount",
        "API Access",
      ],
      discount: 15,
      status: "active",
      color: "#F59E0B",
    },
    {
      id: "4",
      name: "Enterprise",
      price: 99.99,
      duration: "Monthly",
      features: [
        "All SMS Services",
        "Unlimited Activations",
        "Dedicated Support",
        "Instant Speed",
        "25% Discount",
        "Full API Access",
        "Custom Integration",
        "White Label Options",
      ],
      discount: 25,
      status: "active",
      color: "#8B5CF6",
    },
  ]);
  const [showEditSubscriptionModal, setShowEditSubscriptionModal] = useState(false);
  const [showDeleteSubscriptionModal, setShowDeleteSubscriptionModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [subscriptionFormData, setSubscriptionFormData] = useState({
    name: "",
    price: 0,
    duration: "Monthly",
    features: "",
    discount: 0,
    status: "active" as "active" | "inactive",
    color: "#3B82F6",
  });

  const [providers, setProviders] = useState<Provider[]>([
    {
      id: "1",
      name: "SMS-Activate",
      version: "V1 Standard",
      countries: ["USA", "UK", "Canada", "Germany", "France", "Spain", "Italy"],
      services: [
        { id: "s1", name: "Facebook", country: "USA", successRate: 95, orders: 1250, price: 2.5 },
        { id: "s2", name: "WhatsApp", country: "USA", successRate: 92, orders: 980, price: 2.0 },
        { id: "s3", name: "Telegram", country: "UK", successRate: 88, orders: 750, price: 1.8 },
        { id: "s4", name: "Instagram", country: "Canada", successRate: 90, orders: 820, price: 2.2 },
        { id: "s5", name: "Twitter", country: "Germany", successRate: 85, orders: 650, price: 1.5 },
      ],
      totalServices: 5,
      avgSuccessRate: 90,
    },
    {
      id: "2",
      name: "5SIM",
      version: "V2",
      countries: ["USA", "UK", "India", "Brazil", "Australia"],
      services: [
        { id: "s6", name: "Facebook", country: "USA", successRate: 93, orders: 1100, price: 2.3 },
        { id: "s7", name: "Google", country: "UK", successRate: 91, orders: 890, price: 2.1 },
        { id: "s8", name: "TikTok", country: "India", successRate: 87, orders: 720, price: 1.9 },
        { id: "s9", name: "Snapchat", country: "Brazil", successRate: 89, orders: 680, price: 1.7 },
      ],
      totalServices: 4,
      avgSuccessRate: 90,
    },
    {
      id: "3",
      name: "GetSMSCode",
      version: "V3",
      countries: ["USA", "Netherlands", "Poland", "Sweden"],
      services: [
        { id: "s10", name: "Discord", country: "USA", successRate: 94, orders: 950, price: 2.4 },
        { id: "s11", name: "LinkedIn", country: "Netherlands", successRate: 88, orders: 620, price: 2.0 },
        { id: "s12", name: "Amazon", country: "Poland", successRate: 86, orders: 580, price: 1.8 },
      ],
      totalServices: 3,
      avgSuccessRate: 89,
    },
  ]);

  const [vipCategories, setVipCategories] = useState<VIPCategory[]>([
    {
      id: "v1",
      name: "V1 - Premium",
      services: [
        { id: "s1", name: "Facebook", country: "USA", successRate: 95, orders: 1250, price: 2.5 },
        { id: "s10", name: "Discord", country: "USA", successRate: 94, orders: 950, price: 2.4 },
      ],
    },
    {
      id: "v2",
      name: "V2 - Standard",
      services: [],
    },
    {
      id: "v3",
      name: "V3 - Basic",
      services: [],
    },
  ]);

  const [providerFormData, setProviderFormData] = useState({
    name: "",
    version: "V1 Standard",
  });

  const handleEditProvider = (provider: Provider) => {
    setSelectedProvider(provider);
    setProviderFormData({
      name: provider.name,
      version: provider.version,
    });
    setShowEditProviderModal(true);
  };

  const handleDeleteProvider = (provider: Provider) => {
    setSelectedProvider(provider);
    setShowDeleteModal(true);
  };

  const handleViewProvider = (provider: Provider) => {
    setSelectedProvider(provider);
    setShowProviderModal(true);
  };

  const handleSaveProvider = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (selectedProvider) {
      setProviders(
        providers.map((p) =>
          p.id === selectedProvider.id
            ? { ...p, name: providerFormData.name, version: providerFormData.version }
            : p
        )
      );
      toast.success("Provider updated successfully!");
    }

    setIsLoading(false);
    setShowEditProviderModal(false);
    setSelectedProvider(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProvider) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Remove provider services from VIP categories
    const providerServiceIds = selectedProvider.services.map((s) => s.id);
    setVipCategories(
      vipCategories.map((cat) => ({
        ...cat,
        services: cat.services.filter((s) => !providerServiceIds.includes(s.id)),
      }))
    );

    setProviders(providers.filter((p) => p.id !== selectedProvider.id));
    toast.success("Provider deleted and services removed from VIP categories!");

    setIsLoading(false);
    setShowDeleteModal(false);
    setSelectedProvider(null);
  };

  const handleSelectService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
    );
  };

  const handleSelectAll = () => {
    if (!selectedProvider) return;
    const allServiceIds = selectedProvider.services.map((s) => s.id);
    setSelectedServices(allServiceIds);
  };

  const handleDeselectAll = () => {
    setSelectedServices([]);
  };

  const handleAddToVIP = async () => {
    if (selectedServices.length === 0) {
      toast.error("Please select at least one service");
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const selectedCategory = vipCategories.find((cat) => cat.id === selectedVIPCategory);
    if (!selectedCategory) return;

    // Get services to add
    const servicesToAdd = selectedProvider?.services.filter((s) => selectedServices.includes(s.id)) || [];

    // Check for duplicates
    const existingServiceIds = selectedCategory.services.map((s) => s.id);
    const newServices = servicesToAdd.filter((s) => !existingServiceIds.includes(s.id));

    if (newServices.length < servicesToAdd.length) {
      const duplicateCount = servicesToAdd.length - newServices.length;
      toast.warning(`${duplicateCount} duplicate(s) skipped`);
    }

    // Update VIP category
    setVipCategories(
      vipCategories.map((cat) =>
        cat.id === selectedVIPCategory ? { ...cat, services: [...cat.services, ...newServices] } : cat
      )
    );

    toast.success(`${newServices.length} service(s) added to ${selectedCategory.name}`);

    setIsLoading(false);
    setShowAddToVIPModal(false);
    setSelectedServices([]);
  };

  const handleRemoveFromVIP = async (categoryId: string, serviceId: string) => {
    setVipCategories(
      vipCategories.map((cat) =>
        cat.id === categoryId ? { ...cat, services: cat.services.filter((s) => s.id !== serviceId) } : cat
      )
    );
    toast.success("Service removed from VIP category");
  };

  const getTopServices = () => {
    const allServices = providers.flatMap((p) => p.services);
    return allServices.sort((a, b) => b.orders - a.orders).slice(0, 10);
  };

  // Pricing Functions
  const getAllServicePrices = (): ServicePrice[] => {
    const allPrices: ServicePrice[] = [];
    providers.forEach((provider) => {
      provider.services.forEach((service) => {
        if (service.price) {
          allPrices.push({
            serviceId: service.id,
            serviceName: service.name,
            country: service.country,
            basePrice: service.price,
            finalPrice: service.price * (1 + globalMarkup / 100),
            provider: provider.name,
          });
        }
      });
    });
    return allPrices;
  };

  const filteredServicePrices = getAllServicePrices().filter(
    (sp) =>
      sp.serviceName.toLowerCase().includes(pricingSearchQuery.toLowerCase()) ||
      sp.country.toLowerCase().includes(pricingSearchQuery.toLowerCase()) ||
      sp.provider.toLowerCase().includes(pricingSearchQuery.toLowerCase())
  );

  const handleApplyGlobalMarkup = () => {
    toast.success(`Global markup of ${globalMarkup}% applied to all services!`);
  };

  const handleEditServicePrice = (servicePrice: ServicePrice) => {
    setSelectedServicePrice(servicePrice);
    setNewPrice(servicePrice.basePrice.toString());
    setShowEditPriceModal(true);
  };

  const handleSaveServicePrice = async () => {
    if (!selectedServicePrice) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Update service price in providers
    setProviders(
      providers.map((provider) => ({
        ...provider,
        services: provider.services.map((service) =>
          service.id === selectedServicePrice.serviceId
            ? { ...service, price: parseFloat(newPrice) || 0 }
            : service
        ),
      }))
    );

    toast.success("Service price updated successfully!");
    setIsLoading(false);
    setShowEditPriceModal(false);
    setSelectedServicePrice(null);
  };

  // Subscription Functions
  const handleEditSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setSubscriptionFormData({
      name: subscription.name,
      price: subscription.price,
      duration: subscription.duration,
      features: subscription.features.join("\n"),
      discount: subscription.discount,
      status: subscription.status,
      color: subscription.color,
    });
    setShowEditSubscriptionModal(true);
  };

  const handleDeleteSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setShowDeleteSubscriptionModal(true);
  };

  const handleSaveSubscription = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (selectedSubscription) {
      setSubscriptions(
        subscriptions.map((sub) =>
          sub.id === selectedSubscription.id
            ? {
                ...sub,
                name: subscriptionFormData.name,
                price: subscriptionFormData.price,
                duration: subscriptionFormData.duration,
                features: subscriptionFormData.features.split("\n").filter((f) => f.trim()),
                discount: subscriptionFormData.discount,
                status: subscriptionFormData.status,
                color: subscriptionFormData.color,
              }
            : sub
        )
      );
      toast.success("Subscription updated successfully!");
    }

    setIsLoading(false);
    setShowEditSubscriptionModal(false);
    setSelectedSubscription(null);
  };

  const handleConfirmDeleteSubscription = async () => {
    if (!selectedSubscription) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setSubscriptions(subscriptions.filter((sub) => sub.id !== selectedSubscription.id));
    toast.success("Subscription deleted successfully!");

    setIsLoading(false);
    setShowDeleteSubscriptionModal(false);
    setSelectedSubscription(null);
  };

  const filteredProviders = providers.filter(
    (provider) =>
      provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.version.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-white text-3xl font-semibold mb-2">SMS Services Management</h1>
        <p className="text-[#94A3B8] text-sm">Manage SMS providers, services, VIP categories, pricing, and subscriptions</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab("providers")}
          className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === "providers"
              ? "bg-[#3B82F6] text-white"
              : "bg-[rgba(255,255,255,0.05)] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.08)]"
          }`}
        >
          Providers Management
        </button>
        <button
          onClick={() => setActiveTab("vip")}
          className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === "vip"
              ? "bg-[#3B82F6] text-white"
              : "bg-[rgba(255,255,255,0.05)] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.08)]"
          }`}
        >
          <Star className="w-4 h-4" />
          VIP Categories
        </button>
        <button
          onClick={() => setActiveTab("pricing")}
          className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === "pricing"
              ? "bg-[#3B82F6] text-white"
              : "bg-[rgba(255,255,255,0.05)] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.08)]"
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Service Pricing
        </button>
        <button
          onClick={() => setActiveTab("subscriptions")}
          className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === "subscriptions"
              ? "bg-[#3B82F6] text-white"
              : "bg-[rgba(255,255,255,0.05)] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.08)]"
          }`}
        >
          <Crown className="w-4 h-4" />
          Subscriptions
        </button>
      </div>

      {/* Providers Tab */}
      {activeTab === "providers" && (
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#64748B]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search providers..."
                className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg pl-12 pr-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
              />
            </div>
          </div>

          {/* Providers Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProviders.map((provider) => (
              <div
                key={provider.id}
                className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl hover:border-[rgba(59,130,246,0.5)] transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-white text-lg font-semibold mb-1">{provider.name}</h3>
                    <span className="inline-block px-3 py-1 rounded-full bg-[#3B82F6]/20 text-[#3B82F6] text-xs font-medium">
                      {provider.version}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditProvider(provider)}
                      className="p-2 hover:bg-[rgba(59,130,246,0.2)] rounded-lg text-[#3B82F6] transition-colors"
                      title="Edit Provider"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProvider(provider)}
                      className="p-2 hover:bg-[rgba(239,68,68,0.2)] rounded-lg text-[#EF4444] transition-colors"
                      title="Delete Provider"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B] text-sm flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Countries
                    </span>
                    <span className="text-white text-sm font-medium">{provider.countries.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B] text-sm">Total Services</span>
                    <span className="text-white text-sm font-medium">{provider.totalServices}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B] text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Avg. Success Rate
                    </span>
                    <span className="text-[#22C55E] text-sm font-medium">{provider.avgSuccessRate}%</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewProvider(provider)}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    View Details
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIP Categories Tab */}
      {activeTab === "vip" && (
        <div className="space-y-6">
          {/* Top Services */}
          <div className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl">
            <h3 className="text-white text-lg font-semibold mb-4">Top Ordered Services</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {getTopServices()
                .slice(0, 5)
                .map((service, index) => (
                  <div
                    key={service.id}
                    className="p-4 rounded-lg bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#3B82F6] text-xs font-medium">#{index + 1}</span>
                      <span className="text-[#22C55E] text-xs">{service.successRate}%</span>
                    </div>
                    <div className="text-white text-sm font-medium mb-1">{service.name}</div>
                    <div className="text-[#64748B] text-xs">{service.country}</div>
                    <div className="text-[#64748B] text-xs mt-1">{service.orders} orders</div>
                  </div>
                ))}
            </div>
          </div>

          {/* VIP Categories */}
          {vipCategories.map((category) => (
            <div
              key={category.id}
              className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-[#F59E0B]" />
                  <h3 className="text-white text-lg font-semibold">{category.name}</h3>
                  <span className="px-3 py-1 rounded-full bg-[rgba(255,255,255,0.1)] text-[#94A3B8] text-xs">
                    {category.services.length} services
                  </span>
                </div>
              </div>

              {category.services.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[rgba(255,255,255,0.1)]">
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase">
                          Service
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase">
                          Country
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase">
                          Success Rate
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase">
                          Orders
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                      {category.services.map((service) => (
                        <tr key={service.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                          <td className="px-4 py-3 text-white text-sm">{service.name}</td>
                          <td className="px-4 py-3 text-[#94A3B8] text-sm">{service.country}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden max-w-[100px]">
                                <div
                                  className="h-full bg-[#22C55E] rounded-full"
                                  style={{ width: `${service.successRate}%` }}
                                />
                              </div>
                              <span className="text-[#22C55E] text-xs font-medium">{service.successRate}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[#94A3B8] text-sm">{service.orders}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleRemoveFromVIP(category.id, service.id)}
                              className="p-2 hover:bg-[rgba(239,68,68,0.2)] rounded-lg text-[#EF4444] transition-colors"
                              title="Remove"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-[#64748B] text-sm">
                  No services in this category. Add services from providers.
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Service Pricing Tab */}
      {activeTab === "pricing" && (
        <div className="space-y-6">
          {/* Global Markup Control */}
          <div className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-4">
              <Percent className="w-6 h-6 text-[#F59E0B]" />
              <h3 className="text-white text-lg font-semibold">Global Markup Control</h3>
            </div>
            <p className="text-[#94A3B8] text-sm mb-6">
              Apply a percentage markup to all service prices. Positive values increase prices, negative values decrease.
            </p>

            <div className="flex items-center gap-4">
              <div className="flex-1 max-w-md">
                <label className="text-white text-sm font-medium mb-2 block">Markup Percentage (%)</label>
                <input
                  type="number"
                  value={globalMarkup}
                  onChange={(e) => setGlobalMarkup(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  placeholder="Enter markup percentage"
                  step="0.1"
                />
                <p className="text-[#64748B] text-xs mt-2">
                  Example: 10% markup on $2.00 = ${(2 * (1 + globalMarkup / 100)).toFixed(2)}
                </p>
              </div>
              <button
                onClick={handleApplyGlobalMarkup}
                className="mt-6 px-6 py-3 rounded-lg bg-[#F59E0B] hover:bg-[#D97706] text-white text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Percent className="w-4 h-4" />
                Apply Global Markup
              </button>
            </div>

            {globalMarkup !== 0 && (
              <div className="mt-4 p-4 rounded-lg bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.3)]">
                <p className="text-[#F59E0B] text-sm">
                  <strong>Active Markup:</strong> {globalMarkup > 0 ? "+" : ""}
                  {globalMarkup}% will be applied to all base prices
                </p>
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#64748B]" />
              <input
                type="text"
                value={pricingSearchQuery}
                onChange={(e) => setPricingSearchQuery(e.target.value)}
                placeholder="Search services by name, country, or provider..."
                className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg pl-12 pr-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
              />
            </div>
          </div>

          {/* Service Prices Table */}
          <div className="rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl overflow-hidden">
            <div className="p-6 border-b border-[rgba(255,255,255,0.1)]">
              <h3 className="text-white text-lg font-semibold">Service Pricing</h3>
              <p className="text-[#94A3B8] text-sm mt-1">
                {filteredServicePrices.length} services • Click Edit to modify individual prices
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.2)]">
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#94A3B8] uppercase">
                      Service
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#94A3B8] uppercase">
                      Country
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#94A3B8] uppercase">
                      Provider
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#94A3B8] uppercase">
                      Base Price
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#94A3B8] uppercase">
                      Markup
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#94A3B8] uppercase">
                      Final Price
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#94A3B8] uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                  {filteredServicePrices.map((servicePrice) => (
                    <tr
                      key={servicePrice.serviceId}
                      className="hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                    >
                      <td className="px-6 py-4 text-white text-sm font-medium">{servicePrice.serviceName}</td>
                      <td className="px-6 py-4 text-[#94A3B8] text-sm">{servicePrice.country}</td>
                      <td className="px-6 py-4 text-[#94A3B8] text-sm">{servicePrice.provider}</td>
                      <td className="px-6 py-4 text-white text-sm">${servicePrice.basePrice.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-sm font-medium ${
                            globalMarkup > 0 ? "text-[#22C55E]" : globalMarkup < 0 ? "text-[#EF4444]" : "text-[#64748B]"
                          }`}
                        >
                          {globalMarkup > 0 ? "+" : ""}
                          {globalMarkup}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white text-sm font-semibold">
                        ${servicePrice.finalPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleEditServicePrice(servicePrice)}
                          className="px-4 py-2 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-medium transition-colors flex items-center gap-1"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Subscriptions Tab */}
      {activeTab === "subscriptions" && (
        <div>
          {/* Header */}
          <div className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white text-xl font-semibold mb-2">Subscription Plans</h2>
                <p className="text-[#94A3B8] text-sm">Manage membership tiers and benefits</p>
              </div>
            </div>
          </div>

          {/* Subscription Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {subscriptions.map((subscription) => (
              <div
                key={subscription.id}
                className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border-2 backdrop-blur-xl hover:scale-105 transition-all"
                style={{ borderColor: `${subscription.color}40` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="w-5 h-5" style={{ color: subscription.color }} />
                      <h3 className="text-white text-lg font-bold">{subscription.name}</h3>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-white text-3xl font-bold">${subscription.price}</span>
                      <span className="text-[#64748B] text-sm">/{subscription.duration.toLowerCase()}</span>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                      subscription.status === "active"
                        ? "bg-[#22C55E]/20 text-[#22C55E]"
                        : "bg-[#64748B]/20 text-[#64748B]"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        subscription.status === "active" ? "bg-[#22C55E]" : "bg-[#64748B]"
                      }`}
                    />
                    {subscription.status}
                  </span>
                </div>

                {subscription.discount > 0 && (
                  <div
                    className="px-3 py-1.5 rounded-lg mb-4 text-center"
                    style={{ backgroundColor: `${subscription.color}20`, color: subscription.color }}
                  >
                    <span className="text-sm font-semibold">{subscription.discount}% Discount on Services</span>
                  </div>
                )}

                <div className="space-y-2 mb-6">
                  {subscription.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#22C55E] mt-0.5 flex-shrink-0" />
                      <span className="text-[#94A3B8] text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditSubscription(subscription)}
                    className="flex-1 px-4 py-2 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteSubscription(subscription)}
                    className="px-4 py-2 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-white text-sm font-medium transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Provider Details Modal */}
      {showProviderModal && selectedProvider && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F172A] border border-[rgba(255,255,255,0.1)] rounded-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#0F172A] border-b border-[rgba(255,255,255,0.1)] p-6 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-white text-2xl font-semibold mb-2">{selectedProvider.name}</h2>
                  <span className="inline-block px-3 py-1 rounded-full bg-[#3B82F6]/20 text-[#3B82F6] text-sm font-medium">
                    {selectedProvider.version}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setShowProviderModal(false);
                    setSelectedProvider(null);
                    setSelectedServices([]);
                  }}
                  className="p-2 hover:bg-[rgba(255,255,255,0.1)] rounded-lg text-[#94A3B8] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Countries */}
              <div>
                <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Available Countries ({selectedProvider.countries.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProvider.countries.map((country) => (
                    <span
                      key={country}
                      className="px-3 py-1.5 rounded-lg bg-[rgba(59,130,246,0.1)] text-[#3B82F6] text-sm border border-[rgba(59,130,246,0.3)]"
                    >
                      {country}
                    </span>
                  ))}
                </div>
              </div>

              {/* Services */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white text-lg font-semibold flex items-center gap-2">
                    Services ({selectedProvider.totalServices})
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSelectAll}
                      className="px-4 py-2 rounded-lg bg-[rgba(59,130,246,0.2)] hover:bg-[rgba(59,130,246,0.3)] text-[#3B82F6] text-sm font-medium transition-colors"
                    >
                      Select All
                    </button>
                    <button
                      onClick={handleDeselectAll}
                      className="px-4 py-2 rounded-lg bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-[#94A3B8] text-sm font-medium transition-colors"
                    >
                      Deselect All
                    </button>
                    <button
                      onClick={() => setShowAddToVIPModal(true)}
                      disabled={selectedServices.length === 0}
                      className="px-4 py-2 rounded-lg bg-[#F59E0B] hover:bg-[#D97706] text-white text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Star className="w-4 h-4" />
                      Add to VIP ({selectedServices.length})
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-[rgba(255,255,255,0.1)]">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.2)]">
                        <th className="px-4 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedServices.length === selectedProvider.services.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleSelectAll();
                              } else {
                                handleDeselectAll();
                              }
                            }}
                            className="w-4 h-4 rounded border-[rgba(255,255,255,0.3)] bg-[rgba(0,0,0,0.4)] checked:bg-[#3B82F6]"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase">
                          Service Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase">
                          Country
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase">
                          Success Rate
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase">
                          Total Orders
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                      {selectedProvider.services.map((service) => (
                        <tr
                          key={service.id}
                          className="hover:bg-[rgba(255,255,255,0.02)] transition-colors cursor-pointer"
                          onClick={() => handleSelectService(service.id)}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedServices.includes(service.id)}
                              onChange={() => handleSelectService(service.id)}
                              className="w-4 h-4 rounded border-[rgba(255,255,255,0.3)] bg-[rgba(0,0,0,0.4)] checked:bg-[#3B82F6]"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </td>
                          <td className="px-4 py-3 text-white text-sm font-medium">{service.name}</td>
                          <td className="px-4 py-3 text-[#94A3B8] text-sm">{service.country}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-2 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden max-w-[120px]">
                                <div
                                  className={`h-full rounded-full ${
                                    service.successRate >= 90
                                      ? "bg-[#22C55E]"
                                      : service.successRate >= 80
                                      ? "bg-[#F59E0B]"
                                      : "bg-[#EF4444]"
                                  }`}
                                  style={{ width: `${service.successRate}%` }}
                                />
                              </div>
                              <span
                                className={`text-sm font-medium ${
                                  service.successRate >= 90
                                    ? "text-[#22C55E]"
                                    : service.successRate >= 80
                                    ? "text-[#F59E0B]"
                                    : "text-[#EF4444]"
                                }`}
                              >
                                {service.successRate}%
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-[#94A3B8] text-sm">{service.orders.toLocaleString()}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Provider Modal */}
      {showEditProviderModal && selectedProvider && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F172A] border border-[rgba(255,255,255,0.1)] rounded-xl p-6 w-full max-w-md">
            <h2 className="text-white text-xl font-semibold mb-6">Edit Provider</h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Provider Name</label>
                <input
                  type="text"
                  value={providerFormData.name}
                  onChange={(e) => setProviderFormData({ ...providerFormData, name: e.target.value })}
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  placeholder="Enter provider name"
                />
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">Version</label>
                <select
                  value={providerFormData.version}
                  onChange={(e) => setProviderFormData({ ...providerFormData, version: e.target.value })}
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                >
                  <option value="V1 Standard">V1 Standard</option>
                  <option value="V2">V2</option>
                  <option value="V3">V3</option>
                  <option value="V4">V4</option>
                  <option value="V5">V5</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowEditProviderModal(false);
                  setSelectedProvider(null);
                }}
                className="px-5 py-2.5 rounded-lg bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.12)] text-white text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProvider}
                disabled={isLoading || !providerFormData.name}
                className="px-5 py-2.5 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Provider Modal */}
      {showDeleteModal && selectedProvider && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F172A] border border-[rgba(255,255,255,0.1)] rounded-xl p-6 w-full max-w-md">
            <h2 className="text-white text-xl font-semibold mb-4">Delete Provider</h2>
            <p className="text-[#94A3B8] text-sm mb-2">
              Are you sure you want to delete "{selectedProvider.name}"?
            </p>
            <p className="text-[#EF4444] text-sm mb-6">
              This will also remove all {selectedProvider.totalServices} services from VIP categories.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedProvider(null);
                }}
                className="px-5 py-2.5 rounded-lg bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.12)] text-white text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Deleting..." : "Delete Provider"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add to VIP Modal */}
      {showAddToVIPModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F172A] border border-[rgba(255,255,255,0.1)] rounded-xl p-6 w-full max-w-md">
            <h2 className="text-white text-xl font-semibold mb-4">Add to VIP Category</h2>
            <p className="text-[#94A3B8] text-sm mb-6">
              Select a VIP category for {selectedServices.length} selected service(s)
            </p>

            <div className="space-y-3 mb-6">
              {vipCategories.map((category) => (
                <label
                  key={category.id}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedVIPCategory === category.id
                      ? "border-[#F59E0B] bg-[rgba(245,158,11,0.1)]"
                      : "border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.2)] hover:border-[rgba(255,255,255,0.2)]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="vipCategory"
                      value={category.id}
                      checked={selectedVIPCategory === category.id}
                      onChange={(e) => setSelectedVIPCategory(e.target.value)}
                      className="w-4 h-4"
                    />
                    <div>
                      <div className="text-white text-sm font-medium flex items-center gap-2">
                        <Star className="w-4 h-4 text-[#F59E0B]" />
                        {category.name}
                      </div>
                      <div className="text-[#64748B] text-xs">{category.services.length} services</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddToVIPModal(false);
                }}
                className="px-5 py-2.5 rounded-lg bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.12)] text-white text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddToVIP}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-lg bg-[#F59E0B] hover:bg-[#D97706] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  "Adding..."
                ) : (
                  <>
                    <MoveRight className="w-4 h-4" />
                    Add to Category
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Service Price Modal */}
      {showEditPriceModal && selectedServicePrice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F172A] border border-[rgba(255,255,255,0.1)] rounded-xl p-6 w-full max-w-md">
            <h2 className="text-white text-xl font-semibold mb-4">Edit Service Price</h2>
            <p className="text-[#94A3B8] text-sm mb-6">
              {selectedServicePrice.serviceName} ({selectedServicePrice.country}) - {selectedServicePrice.provider}
            </p>

            <div className="mb-6">
              <label className="text-white text-sm font-medium mb-2 block">Base Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                placeholder="0.00"
              />
              <p className="text-[#64748B] text-xs mt-2">
                With {globalMarkup}% markup: ${((parseFloat(newPrice) || 0) * (1 + globalMarkup / 100)).toFixed(2)}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowEditPriceModal(false);
                  setSelectedServicePrice(null);
                }}
                className="px-5 py-2.5 rounded-lg bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.12)] text-white text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveServicePrice}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? "Saving..." : <><Save className="w-4 h-4" />Save Price</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Subscription Modal */}
      {showEditSubscriptionModal && selectedSubscription && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F172A] border border-[rgba(255,255,255,0.1)] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-white text-xl font-semibold mb-6">Edit Subscription Plan</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Plan Name</label>
                  <input
                    type="text"
                    value={subscriptionFormData.name}
                    onChange={(e) => setSubscriptionFormData({ ...subscriptionFormData, name: e.target.value })}
                    className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                    placeholder="Enter plan name"
                  />
                </div>

                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={subscriptionFormData.price}
                    onChange={(e) =>
                      setSubscriptionFormData({ ...subscriptionFormData, price: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Duration</label>
                  <select
                    value={subscriptionFormData.duration}
                    onChange={(e) => setSubscriptionFormData({ ...subscriptionFormData, duration: e.target.value })}
                    className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  >
                    <option value="Forever">Forever</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Discount (%)</label>
                  <input
                    type="number"
                    value={subscriptionFormData.discount}
                    onChange={(e) =>
                      setSubscriptionFormData({ ...subscriptionFormData, discount: parseInt(e.target.value) || 0 })
                    }
                    className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Status</label>
                  <select
                    value={subscriptionFormData.status}
                    onChange={(e) =>
                      setSubscriptionFormData({
                        ...subscriptionFormData,
                        status: e.target.value as "active" | "inactive",
                      })
                    }
                    className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">Theme Color</label>
                <input
                  type="color"
                  value={subscriptionFormData.color}
                  onChange={(e) => setSubscriptionFormData({ ...subscriptionFormData, color: e.target.value })}
                  className="w-full h-12 bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-2 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">Features (one per line)</label>
                <textarea
                  value={subscriptionFormData.features}
                  onChange={(e) => setSubscriptionFormData({ ...subscriptionFormData, features: e.target.value })}
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] min-h-[200px] resize-none"
                  placeholder="Enter features, one per line"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditSubscriptionModal(false);
                  setSelectedSubscription(null);
                }}
                className="px-5 py-2.5 rounded-lg bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.12)] text-white text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSubscription}
                disabled={isLoading || !subscriptionFormData.name}
                className="px-5 py-2.5 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Subscription Modal */}
      {showDeleteSubscriptionModal && selectedSubscription && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F172A] border border-[rgba(255,255,255,0.1)] rounded-xl p-6 w-full max-w-md">
            <h2 className="text-white text-xl font-semibold mb-4">Delete Subscription</h2>
            <p className="text-[#94A3B8] text-sm mb-6">
              Are you sure you want to delete the "{selectedSubscription.name}" subscription plan? This action cannot
              be undone.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteSubscriptionModal(false);
                  setSelectedSubscription(null);
                }}
                className="px-5 py-2.5 rounded-lg bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.12)] text-white text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteSubscription}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
