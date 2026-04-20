'use client';

import { useState, useEffect, useCallback } from "react";
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
  Loader2,
  RefreshCw,
  Lock,
} from "lucide-react";
import {
  adminGetProviders,
  adminUpdateProvider,
  adminSyncProvider,
  adminGetSyncStatus,
  adminBulkAddVipNumbers,
  adminGetVipNumbers,
  adminRemoveVipNumber,
  getServices,
  getProductsRealtime,
  getCountries,
  type SmsProvider,
  type SmsService,
  type SmsProduct,
  type SmsCountry,
  type VipNumber,
} from '@/lib/api/smsApi';
import { apiClient } from '@/config/api-client.config';
import { API_ENDPOINTS } from '@/config/server.config';
import { type MembershipPlan } from '@/lib/api/membershipApi';

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
  priority?: number;
  markup?: number;
  isActive?: boolean;
  balance?: string;
  lastSyncAt?: string;
  supportsRental?: boolean;
}

interface VIPCategory {
  id: string;
  name: string;
  services: Service[];
}

interface PricingProduct {
  id: string;
  service: { id: string; name: string; slug: string };
  country: { id: string; name: string; code: string };
  provider: { id: string; name: string; slug: string };
  basePrice: string;
  finalPrice: string;
  globalMarkup: number;
  productMarkup: number;
  priceOverride: string | null;
  isPriceLocked?: boolean;
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
  const [selectedServicePrice, setSelectedServicePrice] = useState<PricingProduct | null>(null);
  const [editPriceMode, setEditPriceMode] = useState<'override' | 'markup'>('override');
  const [editPriceValue, setEditPriceValue] = useState("");
  const [pricingProducts, setPricingProducts] = useState<PricingProduct[]>([]);
  const [isPricingLoading, setIsPricingLoading] = useState(false);
  const [pricingPage, setPricingPage] = useState(1);
  const [pricingTotal, setPricingTotal] = useState(0);
  const [showLockedOnly, setShowLockedOnly] = useState(false);

  // Subscriptions State (from API)
  const [subscriptions, setSubscriptions] = useState<MembershipPlan[]>([]);
  const [isPlansLoading, setIsPlansLoading] = useState(false);
  const [showEditSubscriptionModal, setShowEditSubscriptionModal] = useState(false);
  const [showDeleteSubscriptionModal, setShowDeleteSubscriptionModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<MembershipPlan | null>(null);
  const [subscriptionFormData, setSubscriptionFormData] = useState({
    name: "",
    price: "",
    description: "",
    features: "",
    discount: 0,
    isActive: true,
  });

  // API providers
  const [apiProviders, setApiProviders] = useState<SmsProvider[]>([]);
  const [isProvidersLoading, setIsProvidersLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);

  // Services & countries for provider details modal
  const [providerServices, setProviderServices] = useState<SmsService[]>([]);
  const [isServicesLoading, setIsServicesLoading] = useState(false);
  const [serviceSearchQuery, setServiceSearchQuery] = useState("");
  const [selectedServiceForCountries, setSelectedServiceForCountries] = useState<SmsService | null>(null);
  const [serviceCountries, setServiceCountries] = useState<SmsProduct[]>([]);
  const [isCountriesLoading, setIsCountriesLoading] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState("");

  // VIP modal country selection
  const [vipCountries, setVipCountries] = useState<SmsCountry[]>([]);
  const [isVipCountriesLoading, setIsVipCountriesLoading] = useState(false);
  const [selectedVipCountryId, setSelectedVipCountryId] = useState<string>("");
  const [vipCountrySearch, setVipCountrySearch] = useState("");

  // VIP numbers from API (3 tiers by rating)
  const [vipPremium, setVipPremium] = useState<VipNumber[]>([]);
  const [vipStandard, setVipStandard] = useState<VipNumber[]>([]);
  const [vipBasic, setVipBasic] = useState<VipNumber[]>([]);
  const [isVipLoading, setIsVipLoading] = useState(false);

  const fetchVipNumbers = useCallback(async () => {
    setIsVipLoading(true);
    try {
      const [premium, standard, basic] = await Promise.all([
        adminGetVipNumbers({ limit: 200, minRating: 4 }),
        adminGetVipNumbers({ limit: 200, minRating: 2, maxRating: 3 }),
        adminGetVipNumbers({ limit: 200, maxRating: 1 }),
      ]);
      setVipPremium(premium.data || []);
      setVipStandard(standard.data || []);
      setVipBasic(basic.data || []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch VIP numbers");
    } finally {
      setIsVipLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'vip') {
      fetchVipNumbers();
    }
  }, [activeTab, fetchVipNumbers]);

  const handleRemoveVip = async (vipId: string) => {
    try {
      await adminRemoveVipNumber(vipId);
      toast.success("VIP number removed");
      fetchVipNumbers();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to remove VIP number");
    }
  };

  const fetchProviders = useCallback(async () => {
    setIsProvidersLoading(true);
    try {
      const response = await adminGetProviders();
      setApiProviders(response.providers);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch providers");
    } finally {
      setIsProvidersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  // Map API providers to local Provider type for backward compat with other tabs
  const providers: Provider[] = apiProviders.map(p => ({
    id: p.id,
    name: p.displayName || p.name,
    version: (p as any).version || "V1_STANDARD",
    countries: [],
    services: [],
    totalServices: 0,
    avgSuccessRate: 0,
    priority: p.priority,
    markup: (p as any).markup,
    isActive: p.isActive,
    balance: p.balance,
    lastSyncAt: p.lastSyncAt,
    supportsRental: p.supportsRental,
  }));

  const vipCategories: VIPCategory[] = [
    { id: "v1", name: "V1 - Premium", services: [] },
    { id: "v2", name: "V2 - Standard", services: [] },
    { id: "v3", name: "V3 - Basic", services: [] },
  ];

  const [providerFormData, setProviderFormData] = useState({
    name: "",
    version: "V1_STANDARD",
    priority: 100,
    markup: 0,
    isActive: true,
  });

  const handleEditProvider = (provider: Provider) => {
    setSelectedProvider(provider);
    setProviderFormData({
      name: provider.name,
      version: provider.version || "V1_STANDARD",
      priority: provider.priority || 100,
      markup: provider.markup || 0,
      isActive: provider.isActive ?? true,
    });
    setShowEditProviderModal(true);
  };

  const handleDeleteProvider = (provider: Provider) => {
    setSelectedProvider(provider);
    setShowDeleteModal(true);
  };

  const handleViewProvider = async (provider: Provider) => {
    setSelectedProvider(provider);
    setShowProviderModal(true);
    setProviderServices([]);
    setSelectedServiceForCountries(null);
    setServiceCountries([]);
    setServiceSearchQuery("");
    setCountrySearchQuery("");
    setIsServicesLoading(true);
    try {
      const response = await getServices({ providerId: provider.id, limit: 200 });
      setProviderServices(response.data || []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch services");
    } finally {
      setIsServicesLoading(false);
    }
  };

  const handleViewServiceCountries = async (service: SmsService) => {
    if (!selectedProvider) return;
    setSelectedServiceForCountries(service);
    setServiceCountries([]);
    setCountrySearchQuery("");
    setIsCountriesLoading(true);
    try {
      const response = await getProductsRealtime(selectedProvider.id, service.id);
      setServiceCountries(response.data || []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch countries");
    } finally {
      setIsCountriesLoading(false);
    }
  };

  const handleSaveProvider = async () => {
    if (!selectedProvider) return;
    setIsLoading(true);
    try {
      await adminUpdateProvider(selectedProvider.id, {
        displayName: providerFormData.name,
        version: providerFormData.version,
        priority: providerFormData.priority,
        markup: providerFormData.markup,
        isActive: providerFormData.isActive,
      });
      toast.success("Provider updated successfully!");
      setShowEditProviderModal(false);
      setSelectedProvider(null);
      fetchProviders();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update provider");
    } finally {
      setIsLoading(false);
    }
  };

  // Sync provider with background polling
  const handleSyncProvider = async (providerId: string) => {
    setIsSyncing(providerId);
    
    try {
      // Start the sync (returns immediately)
      const startResult = await adminSyncProvider(providerId);
      
      if (startResult.status === 'syncing') {
        toast.info("Sync started! Waiting for completion...", { duration: 3000 });
        
        // Poll for completion
        let attempts = 0;
        const maxAttempts = 60; // Max 5 minutes (60 * 5s)
        
        const pollStatus = async (): Promise<void> => {
          attempts++;
          
          try {
            const status = await adminGetSyncStatus(providerId);
            
            if (status.status === 'completed') {
              toast.success(`Sync complete! ${status.services || 0} services, ${status.countries || 0} countries, ${status.products || 0} products`);
              fetchProviders();
              setIsSyncing(null);
              return;
            } else if (status.status === 'failed') {
              toast.error(`Sync failed: ${status.error || 'Unknown error'}`);
              setIsSyncing(null);
              return;
            } else if (status.status === 'syncing' && attempts < maxAttempts) {
              // Still syncing, poll again after 5 seconds
              setTimeout(pollStatus, 5000);
            } else {
              // Max attempts reached
              toast.info("Sync is still running. Check back later or refresh the page.");
              setIsSyncing(null);
            }
          } catch (pollError) {
            console.error('Error polling sync status:', pollError);
            if (attempts < maxAttempts) {
              setTimeout(pollStatus, 5000);
            } else {
              toast.error("Could not get sync status. The sync may still be running.");
              setIsSyncing(null);
            }
          }
        };
        
        // Start polling after 3 seconds
        setTimeout(pollStatus, 3000);
      } else {
        // Sync completed immediately or already had result
        toast.success(startResult.message);
        fetchProviders();
        setIsSyncing(null);
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to start sync";
      toast.error(message);
      setIsSyncing(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedProvider) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.success("Provider deleted successfully!");

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
    const allServiceIds = providerServices.map((s) => s.id);
    setSelectedServices(allServiceIds);
  };

  const handleDeselectAll = () => {
    setSelectedServices([]);
  };

  const handleOpenAddToVIP = async () => {
    if (!selectedProvider || selectedServices.length === 0) return;
    setShowAddToVIPModal(true);
    setSelectedVipCountryId("");
    setVipCountrySearch("");
    setIsVipCountriesLoading(true);
    try {
      const response = await getCountries({ providerId: selectedProvider.id, limit: 200 });
      setVipCountries(response.data || []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch countries");
    } finally {
      setIsVipCountriesLoading(false);
    }
  };

  const vipRatingMap: Record<string, number> = { v1: 5, v2: 3, v3: 1 };

  const handleAddToVIP = async () => {
    if (selectedServices.length === 0) {
      toast.error("Please select at least one service");
      return;
    }
    if (!selectedVipCountryId) {
      toast.error("Please select a country");
      return;
    }
    if (!selectedProvider) return;

    const rating = vipRatingMap[selectedVIPCategory] ?? 5;

    setIsLoading(true);
    
    try {
      // Single bulk API call instead of multiple individual calls
      const result = await adminBulkAddVipNumbers(
        selectedServices,
        selectedVipCountryId,
        selectedProvider.id,
        rating
      );

      if (result.added > 0) {
        toast.success(`${result.added} service(s) added to VIP`);
      }
      if (result.skipped > 0) {
        toast.warning(`${result.skipped} duplicate(s) skipped`);
      }
      if (result.invalid > 0) {
        toast.error(`${result.invalid} invalid service(s)`);
      }
      
      fetchVipNumbers();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to add VIP services");
    }

    setIsLoading(false);
    setShowAddToVIPModal(false);
    setSelectedServices([]);
  };

  // Pricing Functions
  // Fetch global markup
  const fetchGlobalMarkup = useCallback(async () => {
    try {
      const response = await apiClient.get<{ markup: number }>(
        API_ENDPOINTS.ADMIN.SMS.PRICING_GLOBAL_MARKUP,
      );
      setGlobalMarkup(response.data.markup ?? 0);
    } catch {
      // silently fail
    }
  }, []);

  // Fetch pricing products
  const fetchPricingProducts = useCallback(async (page = 1, search = "") => {
    setIsPricingLoading(true);
    try {
      const params: Record<string, any> = { page, limit: 20 };
      if (search) params.search = search;
      const response = await apiClient.get<{ data: PricingProduct[]; total: number }>(
        API_ENDPOINTS.ADMIN.SMS.PRICING_PRODUCTS,
        { params },
      );
      setPricingProducts(response.data.data || []);
      setPricingTotal(response.data.total || 0);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch products");
    } finally {
      setIsPricingLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'pricing') {
      fetchGlobalMarkup();
      fetchPricingProducts(1, "");
      setPricingPage(1);
      setPricingSearchQuery("");
    }
  }, [activeTab, fetchGlobalMarkup, fetchPricingProducts]);

  const handleApplyGlobalMarkup = async () => {
    setIsLoading(true);
    try {
      await apiClient.put(API_ENDPOINTS.ADMIN.SMS.PRICING_GLOBAL_MARKUP, { markup: globalMarkup });
      toast.success(`Global markup of ${globalMarkup}% applied!`);
      fetchPricingProducts(pricingPage, pricingSearchQuery);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to apply markup");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePricingSearch = useCallback((query: string) => {
    setPricingSearchQuery(query);
    setPricingPage(1);
    fetchPricingProducts(1, query);
  }, [fetchPricingProducts]);

  const handleEditServicePrice = (product: PricingProduct) => {
    setSelectedServicePrice(product);
    setEditPriceMode(product.priceOverride ? 'override' : 'markup');
    setEditPriceValue(product.priceOverride || product.productMarkup.toString());
    setShowEditPriceModal(true);
  };

  const handleSaveServicePrice = async () => {
    if (!selectedServicePrice) return;
    setIsLoading(true);
    try {
      const body = editPriceMode === 'override'
        ? { priceOverride: editPriceValue ? parseFloat(editPriceValue) : null, isPriceLocked: selectedServicePrice.isPriceLocked }
        : { markup: parseFloat(editPriceValue) || 0, isPriceLocked: selectedServicePrice.isPriceLocked };

      await apiClient.patch(
        API_ENDPOINTS.ADMIN.SMS.PRICING_PRODUCT_DETAIL(selectedServicePrice.id),
        body,
      );
      toast.success("Product price updated!");
      setShowEditPriceModal(false);
      setSelectedServicePrice(null);
      fetchPricingProducts(pricingPage, pricingSearchQuery);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update price");
    } finally {
      setIsLoading(false);
    }
  };

  // Subscription Functions
  const fetchPlans = useCallback(async () => {
    setIsPlansLoading(true);
    try {
      const response = await apiClient.get<MembershipPlan[] | { plans: MembershipPlan[] }>(
        API_ENDPOINTS.ADMIN.MEMBERSHIP.PLANS,
      );
      const plans = Array.isArray(response.data) ? response.data : (response.data as any).plans || [];
      setSubscriptions(plans);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch plans");
    } finally {
      setIsPlansLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'subscriptions') {
      fetchPlans();
    }
  }, [activeTab, fetchPlans]);

  const handleEditSubscription = (plan: MembershipPlan) => {
    setSelectedSubscription(plan);
    setSubscriptionFormData({
      name: plan.name,
      price: plan.price,
      description: plan.description || "",
      features: plan.features.join("\n"),
      discount: plan.discount,
      isActive: plan.isActive,
    });
    setShowEditSubscriptionModal(true);
  };

  const handleDeleteSubscription = (plan: MembershipPlan) => {
    setSelectedSubscription(plan);
    setShowDeleteSubscriptionModal(true);
  };

  const handleSaveSubscription = async () => {
    if (!selectedSubscription) return;
    setIsLoading(true);
    try {
      await apiClient.patch(
        API_ENDPOINTS.ADMIN.MEMBERSHIP.PLAN_DETAIL(selectedSubscription.slug),
        {
          name: subscriptionFormData.name,
          price: parseFloat(subscriptionFormData.price) || 0,
          description: subscriptionFormData.description,
          features: subscriptionFormData.features.split("\n").filter((f: string) => f.trim()),
          discount: subscriptionFormData.discount,
          isActive: subscriptionFormData.isActive,
        },
      );
      toast.success("Plan updated successfully!");
      setShowEditSubscriptionModal(false);
      setSelectedSubscription(null);
      fetchPlans();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update plan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDeleteSubscription = async () => {
    if (!selectedSubscription) return;
    setIsLoading(true);
    try {
      await apiClient.delete(
        API_ENDPOINTS.ADMIN.MEMBERSHIP.PLAN_DETAIL(selectedSubscription.slug),
      );
      toast.success("Plan deleted successfully!");
      setShowDeleteSubscriptionModal(false);
      setSelectedSubscription(null);
      fetchPlans();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete plan");
    } finally {
      setIsLoading(false);
    }
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
          {isProvidersLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin" />
              <span className="ml-3 text-[#94A3B8]">Loading providers...</span>
            </div>
          ) : apiProviders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Globe className="w-12 h-12 text-[#64748B] mb-4" />
              <p className="text-white text-lg font-medium">No providers found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {apiProviders
                .filter(p => p.displayName.toLowerCase().includes(searchQuery.toLowerCase()) || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.slug.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((provider) => (
                <div
                  key={provider.id}
                  className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl hover:border-[rgba(59,130,246,0.5)] transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white text-lg font-semibold">{provider.displayName || provider.name}</h3>
                        <span className={`w-2.5 h-2.5 rounded-full ${provider.isActive ? 'bg-[#22C55E]' : 'bg-[#64748B]'}`} title={provider.isActive ? 'Active' : 'Inactive'} />
                      </div>
                      <span className="inline-block px-3 py-1 rounded-full bg-[#3B82F6]/20 text-[#3B82F6] text-xs font-medium">
                        {provider.slug}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          const mapped = providers.find(p => p.id === provider.id);
                          if (mapped) handleEditProvider(mapped);
                        }}
                        className="p-2 hover:bg-[rgba(59,130,246,0.2)] rounded-lg text-[#3B82F6] transition-colors"
                        title="Edit Provider"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleSyncProvider(provider.id)}
                        disabled={isSyncing === provider.id}
                        className="p-2 hover:bg-[rgba(34,197,94,0.2)] rounded-lg text-[#22C55E] transition-colors disabled:opacity-50"
                        title="Sync Provider"
                      >
                        <RefreshCw className={`w-4 h-4 ${isSyncing === provider.id ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    {provider.balance && (
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748B] text-sm flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          Balance
                        </span>
                        <span className="text-white text-sm font-medium">${provider.balance}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-[#64748B] text-sm">Priority</span>
                      <span className="text-white text-sm font-medium">{provider.priority}</span>
                    </div>
                    {provider.markup != null && (
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748B] text-sm flex items-center gap-2">
                          <Percent className="w-4 h-4" />
                          Markup
                        </span>
                        <span className="text-[#F59E0B] text-sm font-medium">{provider.markup}%</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-[#64748B] text-sm">Supports Rental</span>
                      <span className={`text-sm font-medium ${provider.supportsRental ? 'text-[#22C55E]' : 'text-[#64748B]'}`}>
                        {provider.supportsRental ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#64748B] text-sm">Status</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${provider.isActive ? 'bg-[#22C55E]/20 text-[#22C55E]' : 'bg-[#64748B]/20 text-[#64748B]'}`}>
                        {provider.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {provider.lastSyncAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748B] text-sm">Last Sync</span>
                        <span className="text-[#94A3B8] text-xs">{new Date(provider.lastSyncAt).toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const mapped = providers.find(p => p.id === provider.id);
                        if (mapped) handleViewProvider(mapped);
                      }}
                      className="flex-1 px-4 py-2.5 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      View Details
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIP Categories Tab */}
      {activeTab === "vip" && (
        <div className="space-y-6">
          {isVipLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin" />
              <span className="ml-3 text-[#94A3B8]">Loading VIP numbers...</span>
            </div>
          ) : (
            <>
              {[
                { label: "V1 - Premium", color: "#F59E0B", data: vipPremium },
                { label: "V2 - Standard", color: "#3B82F6", data: vipStandard },
                { label: "V3 - Basic", color: "#64748B", data: vipBasic },
              ].map((tier) => (
                <div
                  key={tier.label}
                  className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Star className="w-5 h-5" style={{ color: tier.color }} />
                      <h3 className="text-white text-lg font-semibold">{tier.label}</h3>
                      <span className="px-3 py-1 rounded-full bg-[rgba(255,255,255,0.1)] text-[#94A3B8] text-xs">
                        {tier.data.length} services
                      </span>
                    </div>
                  </div>

                  {tier.data.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-[rgba(255,255,255,0.1)]">
                            <th className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase">Service</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase">Country</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase">Provider</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase">Rating</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase">Orders</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                          {tier.data.map((vip) => (
                            <tr key={vip.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                              <td className="px-4 py-3 text-white text-sm font-medium">{vip.service.name}</td>
                              <td className="px-4 py-3 text-[#94A3B8] text-sm">{vip.country.name} ({vip.country.code})</td>
                              <td className="px-4 py-3 text-[#94A3B8] text-sm">{vip.provider.displayName}</td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${tier.color}20`, color: tier.color }}>
                                  {vip.rating}/5
                                </span>
                              </td>
                              <td className="px-4 py-3 text-[#94A3B8] text-sm">{vip.orderCount.toLocaleString()}</td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => handleRemoveVip(vip.id)}
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
            </>
          )}
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
                disabled={isLoading}
                className="mt-6 px-6 py-3 rounded-lg bg-[#F59E0B] hover:bg-[#D97706] text-white text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Percent className="w-4 h-4" />}
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

          {/* Search Bar + Lock Filter */}
          <div className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                <input
                  type="text"
                  value={pricingSearchQuery}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPricingSearchQuery(val);
                    handlePricingSearch(val);
                  }}
                  placeholder="Search services by name, country, or provider..."
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg pl-12 pr-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                />
              </div>
              <button
                onClick={() => setShowLockedOnly(!showLockedOnly)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  showLockedOnly
                    ? 'bg-[#3B82F6] text-white'
                    : 'bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.18)] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.08)]'
                }`}
              >
                <Lock className="w-4 h-4" />
                Locked Only
              </button>
            </div>
          </div>

          {/* Service Prices Table */}
          <div className="rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl overflow-hidden">
            <div className="p-6 border-b border-[rgba(255,255,255,0.1)]">
              <h3 className="text-white text-lg font-semibold">Service Pricing</h3>
              <p className="text-[#94A3B8] text-sm mt-1">
                {pricingTotal} products • Click Edit to modify individual prices
              </p>
            </div>

            {isPricingLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 text-[#3B82F6] animate-spin" />
                <span className="text-[#94A3B8] text-sm ml-3">Loading products...</span>
              </div>
            ) : pricingProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center mb-4">
                  <DollarSign className="w-8 h-8 text-[#64748B]" />
                </div>
                <p className="text-white text-lg font-medium">No products found</p>
                <p className="text-[#94A3B8] text-sm mt-1">Sync providers first or adjust your search</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.2)]">
                        <th className="px-6 py-4 text-left text-xs font-medium text-[#94A3B8] uppercase">Service</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-[#94A3B8] uppercase">Country</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-[#94A3B8] uppercase">Provider</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-[#94A3B8] uppercase">Base Price</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-[#94A3B8] uppercase">Markup</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-[#94A3B8] uppercase">Final Price</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-[#94A3B8] uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                      {pricingProducts.filter(p => !showLockedOnly || p.isPriceLocked).map((product) => (
                        <tr key={product.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                          <td className="px-6 py-4 text-white text-sm font-medium">
                            <span className="flex items-center gap-2">
                              {product.service.name}
                              {product.isPriceLocked && <Lock className="w-3 h-3 text-[#F59E0B]" />}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-[#94A3B8] text-sm">{product.country.name}</td>
                          <td className="px-6 py-4 text-[#94A3B8] text-sm">{product.provider.name}</td>
                          <td className="px-6 py-4 text-white text-sm">${product.basePrice}</td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-0.5">
                              {product.productMarkup !== 0 && (
                                <span className="text-[#3B82F6] text-xs">Product: +{product.productMarkup}%</span>
                              )}
                              {product.globalMarkup !== 0 && (
                                <span className="text-[#F59E0B] text-xs">Global: +{product.globalMarkup}%</span>
                              )}
                              {product.priceOverride && (
                                <span className="text-[#8B5CF6] text-xs">Override: ${product.priceOverride}</span>
                              )}
                              {product.productMarkup === 0 && product.globalMarkup === 0 && !product.priceOverride && (
                                <span className="text-[#64748B] text-xs">None</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-white text-sm font-semibold">${product.finalPrice}</td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleEditServicePrice(product)}
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

                {/* Pagination */}
                {pricingTotal > 20 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-[rgba(255,255,255,0.1)]">
                    <p className="text-[#94A3B8] text-sm">
                      Page {pricingPage} of {Math.ceil(pricingTotal / 20)}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={pricingPage <= 1}
                        onClick={() => { setPricingPage(pricingPage - 1); fetchPricingProducts(pricingPage - 1, pricingSearchQuery); }}
                        className="px-4 py-2 rounded-lg bg-[rgba(255,255,255,0.08)] text-white text-sm disabled:opacity-50 hover:bg-[rgba(255,255,255,0.12)] transition-colors"
                      >
                        Previous
                      </button>
                      <button
                        disabled={pricingPage >= Math.ceil(pricingTotal / 20)}
                        onClick={() => { setPricingPage(pricingPage + 1); fetchPricingProducts(pricingPage + 1, pricingSearchQuery); }}
                        className="px-4 py-2 rounded-lg bg-[rgba(255,255,255,0.08)] text-white text-sm disabled:opacity-50 hover:bg-[rgba(255,255,255,0.12)] transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Subscriptions Tab */}
      {activeTab === "subscriptions" && (
        <div>
          <div className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white text-xl font-semibold mb-2">Subscription Plans</h2>
                <p className="text-[#94A3B8] text-sm">Manage membership tiers and benefits</p>
              </div>
            </div>
          </div>

          {isPlansLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin" />
              <span className="ml-3 text-[#94A3B8]">Loading plans...</span>
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center mb-4">
                <Crown className="w-8 h-8 text-[#64748B]" />
              </div>
              <p className="text-white text-lg font-medium">No plans found</p>
              <p className="text-[#94A3B8] text-sm mt-1">Create membership plans from the backend</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {subscriptions.map((plan) => {
                const planColor = plan.isPopular ? "#F59E0B" : parseFloat(plan.price) === 0 ? "#64748B" : "#3B82F6";
                return (
                  <div
                    key={plan.id}
                    className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border-2 backdrop-blur-xl hover:scale-105 transition-all"
                    style={{ borderColor: `${planColor}40` }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Crown className="w-5 h-5" style={{ color: planColor }} />
                          <h3 className="text-white text-lg font-bold">{plan.name}</h3>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-white text-3xl font-bold">${plan.price}</span>
                          <span className="text-[#64748B] text-sm">/monthly</span>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                          plan.isActive
                            ? "bg-[#22C55E]/20 text-[#22C55E]"
                            : "bg-[#64748B]/20 text-[#64748B]"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${plan.isActive ? "bg-[#22C55E]" : "bg-[#64748B]"}`} />
                        {plan.isActive ? "active" : "inactive"}
                      </span>
                    </div>

                    {plan.discount > 0 && (
                      <div
                        className="px-3 py-1.5 rounded-lg mb-4 text-center"
                        style={{ backgroundColor: `${planColor}20`, color: planColor }}
                      >
                        <span className="text-sm font-semibold">{plan.discount}% Discount on Services</span>
                      </div>
                    )}

                    <div className="space-y-2 mb-6">
                      {plan.features.map((feature: string, index: number) => (
                        <div key={index} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-[#22C55E] mt-0.5 flex-shrink-0" />
                          <span className="text-[#94A3B8] text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditSubscription(plan)}
                        className="flex-1 px-4 py-2 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSubscription(plan)}
                        className="px-4 py-2 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-white text-sm font-medium transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
                    setProviderServices([]);
                    setSelectedServiceForCountries(null);
                    setServiceCountries([]);
                  }}
                  className="p-2 hover:bg-[rgba(255,255,255,0.1)] rounded-lg text-[#94A3B8] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Services List */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white text-lg font-semibold flex items-center gap-2">
                    Services ({providerServices.length})
                  </h3>
                  {providerServices.length > 0 && (
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
                        onClick={() => handleOpenAddToVIP()}
                        disabled={selectedServices.length === 0}
                        className="px-4 py-2 rounded-lg bg-[#F59E0B] hover:bg-[#D97706] text-white text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Star className="w-4 h-4" />
                        Add to VIP ({selectedServices.length})
                      </button>
                    </div>
                  )}
                </div>

                {isServicesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 text-[#3B82F6] animate-spin" />
                    <span className="text-[#94A3B8] text-sm ml-3">Loading services...</span>
                  </div>
                ) : providerServices.length === 0 ? (
                  <div className="text-center py-12 text-[#64748B]">No services found for this provider</div>
                ) : (() => {
                  const filteredServices = providerServices.filter((s) =>
                    s.name.toLowerCase().includes(serviceSearchQuery.toLowerCase()) ||
                    (s.category || "").toLowerCase().includes(serviceSearchQuery.toLowerCase())
                  );
                  return (
                    <>
                      <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                        <input
                          type="text"
                          placeholder="Search services..."
                          value={serviceSearchQuery}
                          onChange={(e) => setServiceSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white text-sm placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                        />
                        {serviceSearchQuery && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] text-xs">
                            {filteredServices.length} of {providerServices.length}
                          </span>
                        )}
                      </div>
                      <div className="rounded-lg border border-[rgba(255,255,255,0.1)] max-h-[350px] overflow-y-auto">
                        <table className="w-full">
                          <thead className="sticky top-0 z-10">
                            <tr className="border-b border-[rgba(255,255,255,0.1)] bg-[#0F172A]">
                              <th className="px-4 py-3 text-left">
                                <input
                                  type="checkbox"
                                  checked={selectedServices.length === providerServices.length && providerServices.length > 0}
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
                                Category
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase">
                                Status
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                            {filteredServices.map((service) => (
                              <tr
                                key={service.id}
                                className={`hover:bg-[rgba(255,255,255,0.02)] transition-colors cursor-pointer ${
                                  selectedServiceForCountries?.id === service.id ? "bg-[rgba(59,130,246,0.05)]" : ""
                                }`}
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
                                <td className="px-4 py-3 text-[#94A3B8] text-sm capitalize">{service.category || "—"}</td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    service.isActive !== false
                                      ? "bg-[rgba(34,197,94,0.1)] text-[#22C55E]"
                                      : "bg-[rgba(239,68,68,0.1)] text-[#EF4444]"
                                  }`}>
                                    {service.isActive !== false ? "Active" : "Inactive"}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewServiceCountries(service);
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-[rgba(59,130,246,0.15)] hover:bg-[rgba(59,130,246,0.25)] text-[#3B82F6] text-xs font-medium transition-colors flex items-center gap-1"
                                  >
                                    <Globe className="w-3 h-3" />
                                    View Countries
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Countries / Products for selected service */}
              {selectedServiceForCountries && (
                <div>
                  <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Countries for {selectedServiceForCountries.name}
                  </h3>

                  {isCountriesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 text-[#3B82F6] animate-spin" />
                      <span className="text-[#94A3B8] text-sm ml-3">Loading countries...</span>
                    </div>
                  ) : serviceCountries.length === 0 ? (
                    <div className="text-center py-8 text-[#64748B]">No countries available for this service</div>
                  ) : (() => {
                    const filteredCountries = serviceCountries.filter((p) =>
                      p.country.name.toLowerCase().includes(countrySearchQuery.toLowerCase()) ||
                      p.country.code.toLowerCase().includes(countrySearchQuery.toLowerCase())
                    );
                    return (
                      <>
                        <div className="relative mb-3">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                          <input
                            type="text"
                            placeholder="Search countries..."
                            value={countrySearchQuery}
                            onChange={(e) => setCountrySearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white text-sm placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                          />
                          {countrySearchQuery && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] text-xs">
                              {filteredCountries.length} of {serviceCountries.length}
                            </span>
                          )}
                        </div>
                        <div className="rounded-lg border border-[rgba(255,255,255,0.1)] max-h-[300px] overflow-y-auto">
                          <table className="w-full">
                            <thead className="sticky top-0 z-10">
                              <tr className="border-b border-[rgba(255,255,255,0.1)] bg-[#0F172A]">
                                <th className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase">Country</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase">Price</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase">Provider Price</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase">Available</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                              {filteredCountries.map((product) => (
                                <tr key={product.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                                  <td className="px-4 py-3 text-white text-sm font-medium">
                                    {product.country.name} ({product.country.code})
                                  </td>
                                  <td className="px-4 py-3 text-[#22C55E] text-sm font-medium">${product.price}</td>
                                  <td className="px-4 py-3 text-[#94A3B8] text-sm">{product.providerPrice ? `$${product.providerPrice}` : "—"}</td>
                                  <td className="px-4 py-3">
                                    <span className={`text-sm font-medium ${product.availableCount > 0 ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
                                      {product.availableCount.toLocaleString()}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Provider Modal */}
      {showEditProviderModal && selectedProvider && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F172A] border border-[rgba(255,255,255,0.1)] rounded-xl p-6 w-full max-w-lg">
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Version</label>
                  <select
                    value={providerFormData.version}
                    onChange={(e) => setProviderFormData({ ...providerFormData, version: e.target.value })}
                    className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  >
                    <option value="V1_STANDARD">V1 - Premium</option>
                    <option value="V2">V2 - Standard</option>
                    <option value="V3">V3 - Basic</option>
                    <option value="V4">V4</option>
                    <option value="V5">V5</option>
                  </select>
                </div>

                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Priority</label>
                  <input
                    type="number"
                    value={providerFormData.priority}
                    onChange={(e) => setProviderFormData({ ...providerFormData, priority: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                    placeholder="100"
                    min="0"
                    max="1000"
                  />
                  <p className="text-[#64748B] text-xs mt-1">Higher = shown first</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Markup (%)</label>
                  <input
                    type="number"
                    value={providerFormData.markup}
                    onChange={(e) => setProviderFormData({ ...providerFormData, markup: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                    placeholder="0"
                    min="0"
                    max="1000"
                    step="0.1"
                  />
                  <p className="text-[#64748B] text-xs mt-1">Added to all prices</p>
                </div>

                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Status</label>
                  <div className="flex items-center gap-3 h-[46px]">
                    <button
                      type="button"
                      onClick={() => setProviderFormData({ ...providerFormData, isActive: true })}
                      className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        providerFormData.isActive
                          ? "bg-[#22C55E] text-white"
                          : "bg-[rgba(255,255,255,0.05)] text-[#64748B] hover:bg-[rgba(255,255,255,0.1)]"
                      }`}
                    >
                      Active
                    </button>
                    <button
                      type="button"
                      onClick={() => setProviderFormData({ ...providerFormData, isActive: false })}
                      className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        !providerFormData.isActive
                          ? "bg-[#EF4444] text-white"
                          : "bg-[rgba(255,255,255,0.05)] text-[#64748B] hover:bg-[rgba(255,255,255,0.1)]"
                      }`}
                    >
                      Inactive
                    </button>
                  </div>
                </div>
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

            {/* Country Selection */}
            <div className="mb-6">
              <label className="text-white text-sm font-medium mb-2 block">
                Country <span className="text-[#EF4444]">*</span>
              </label>
              {isVipCountriesLoading ? (
                <div className="flex items-center gap-2 py-3">
                  <Loader2 className="w-4 h-4 text-[#3B82F6] animate-spin" />
                  <span className="text-[#94A3B8] text-sm">Loading countries...</span>
                </div>
              ) : (
                <>
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                    <input
                      type="text"
                      placeholder="Search countries..."
                      value={vipCountrySearch}
                      onChange={(e) => setVipCountrySearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white text-sm placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                    />
                  </div>
                  <div className="max-h-[180px] overflow-y-auto rounded-lg border border-[rgba(255,255,255,0.1)] divide-y divide-[rgba(255,255,255,0.05)]">
                    {vipCountries
                      .filter((c) =>
                        c.name.toLowerCase().includes(vipCountrySearch.toLowerCase()) ||
                        c.code.toLowerCase().includes(vipCountrySearch.toLowerCase())
                      )
                      .map((country) => (
                        <label
                          key={country.id}
                          className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                            selectedVipCountryId === country.id
                              ? "bg-[rgba(245,158,11,0.1)]"
                              : "hover:bg-[rgba(255,255,255,0.03)]"
                          }`}
                        >
                          <input
                            type="radio"
                            name="vipCountry"
                            value={country.id}
                            checked={selectedVipCountryId === country.id}
                            onChange={() => setSelectedVipCountryId(country.id)}
                            className="w-4 h-4"
                          />
                          <span className="text-white text-sm">{country.name}</span>
                          <span className="text-[#64748B] text-xs">({country.code})</span>
                        </label>
                      ))}
                  </div>
                </>
              )}
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
                disabled={isLoading || !selectedVipCountryId}
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
            <h2 className="text-white text-xl font-semibold mb-2">Edit Product Price</h2>
            <p className="text-[#94A3B8] text-sm mb-6">
              {selectedServicePrice.service.name} - {selectedServicePrice.country.name} ({selectedServicePrice.provider.name})
            </p>

            <div className="mb-4 p-3 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)]">
              <div className="flex justify-between text-sm">
                <span className="text-[#64748B]">Current Base Price</span>
                <span className="text-white">${selectedServicePrice.basePrice}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-[#64748B]">Current Final Price</span>
                <span className="text-white font-semibold">${selectedServicePrice.finalPrice}</span>
              </div>
            </div>

            {/* Mode selector */}
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => { setEditPriceMode('override'); setEditPriceValue(selectedServicePrice.priceOverride || ''); }}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  editPriceMode === 'override'
                    ? 'bg-[#3B82F6] text-white'
                    : 'bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.18)] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.08)]'
                }`}
              >
                Fixed Price Override
              </button>
              <button
                onClick={() => { setEditPriceMode('markup'); setEditPriceValue(selectedServicePrice.productMarkup.toString()); }}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  editPriceMode === 'markup'
                    ? 'bg-[#3B82F6] text-white'
                    : 'bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.18)] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.08)]'
                }`}
              >
                Product Markup %
              </button>
            </div>

            <div className="mb-4">
              <label className="text-white text-sm font-medium mb-2 block">
                {editPriceMode === 'override' ? 'Fixed Price ($)' : 'Markup Percentage (%)'}
              </label>
              <input
                type="number"
                step={editPriceMode === 'override' ? '0.01' : '0.1'}
                value={editPriceValue}
                onChange={(e) => setEditPriceValue(e.target.value)}
                className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                placeholder={editPriceMode === 'override' ? '2.50' : '5'}
              />
              {editPriceMode === 'override' && (
                <p className="text-[#64748B] text-xs mt-2">
                  Leave empty and save to remove override and use calculated price
                </p>
              )}
            </div>

            {editPriceMode === 'override' && selectedServicePrice.priceOverride && (
              <button
                onClick={() => { setEditPriceValue(''); }}
                className="w-full mb-4 px-4 py-2 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#EF4444] text-sm font-medium hover:bg-[rgba(239,68,68,0.2)] transition-colors"
              >
                Remove Price Override (use calculated)
              </button>
            )}

            {/* Lock Price Toggle */}
            <div className="mb-4 flex items-center justify-between p-3 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)]">
              <div>
                <span className="text-white text-sm font-medium">Lock Price</span>
                <p className="text-[#64748B] text-xs">Locked prices won&apos;t change during bulk updates</p>
              </div>
              <button
                onClick={() => setSelectedServicePrice({ ...selectedServicePrice, isPriceLocked: !selectedServicePrice.isPriceLocked })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  selectedServicePrice.isPriceLocked ? 'bg-[#3B82F6]' : 'bg-[rgba(255,255,255,0.18)]'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  selectedServicePrice.isPriceLocked ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => { setShowEditPriceModal(false); setSelectedServicePrice(null); }}
                className="px-5 py-2.5 rounded-lg bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.12)] text-white text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveServicePrice}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><Save className="w-4 h-4" />Save Price</>}
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
                    onChange={(e) => setSubscriptionFormData({ ...subscriptionFormData, price: e.target.value })}
                    className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Discount (%)</label>
                  <input
                    type="number"
                    value={subscriptionFormData.discount}
                    onChange={(e) => setSubscriptionFormData({ ...subscriptionFormData, discount: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Status</label>
                  <select
                    value={subscriptionFormData.isActive ? "active" : "inactive"}
                    onChange={(e) => setSubscriptionFormData({ ...subscriptionFormData, isActive: e.target.value === "active" })}
                    className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">Description</label>
                <input
                  type="text"
                  value={subscriptionFormData.description}
                  onChange={(e) => setSubscriptionFormData({ ...subscriptionFormData, description: e.target.value })}
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  placeholder="Plan description"
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
                onClick={() => { setShowEditSubscriptionModal(false); setSelectedSubscription(null); }}
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
            <h2 className="text-white text-xl font-semibold mb-4">Delete Plan</h2>
            <p className="text-[#94A3B8] text-sm mb-6">
              Are you sure you want to delete the &quot;{selectedSubscription.name}&quot; plan? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => { setShowDeleteSubscriptionModal(false); setSelectedSubscription(null); }}
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
