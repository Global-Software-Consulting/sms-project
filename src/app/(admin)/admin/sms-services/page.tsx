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
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  adminGetProviders,
  adminUpdateProvider,
  adminSyncProvider,
  adminGetSyncStatus,
  adminBulkAddVipNumbers,
  adminGetVipNumbers,
  adminRemoveVipNumber,
  adminGetUnifiedVipCategories,
  adminToggleVip,
  adminAutoPopulateVip,
  adminRecalculatePopularity,
  adminBulkLockProducts,
  adminGetServices,
  getServices,
  getUnifiedServices,
  getCountriesForUnifiedService,
  getProductsRealtime,
  getCountries,
  type SmsProvider,
  type SmsService,
  type SmsProduct,
  type SmsCountry,
  type VipNumber,
  type UnifiedVipService,
  type UnifiedService,
  type UnifiedServiceCountry,
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
  const [pricingLimit, setPricingLimit] = useState(50);
  const [pricingTotal, setPricingTotal] = useState(0);
  const [pricingTotalPages, setPricingTotalPages] = useState(0);
  const [debouncedPricingSearch, setDebouncedPricingSearch] = useState("");
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
  
  // Track sync status per provider for UI display
  const [syncStatusMap, setSyncStatusMap] = useState<Record<string, {
    status: 'syncing' | 'completed' | 'failed';
    message?: string;
    services?: number;
    countries?: number;
    products?: number;
    error?: string;
  }>>({});

  // Services & countries for provider details modal
  const [providerServices, setProviderServices] = useState<SmsService[]>([]);
  const [isServicesLoading, setIsServicesLoading] = useState(false);
  const [serviceSearchQuery, setServiceSearchQuery] = useState("");
  const [debouncedServiceSearch, setDebouncedServiceSearch] = useState("");
  const [servicesPage, setServicesPage] = useState(1);
  const [servicesLimit, setServicesLimit] = useState(50);
  const [servicesTotalCount, setServicesTotalCount] = useState(0);
  const [servicesTotalPages, setServicesTotalPages] = useState(0);
  const [selectedServiceForCountries, setSelectedServiceForCountries] = useState<SmsService | null>(null);
  const [serviceCountries, setServiceCountries] = useState<SmsProduct[]>([]);
  const [isCountriesLoading, setIsCountriesLoading] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState("");

  // Unified Services view (no duplicates across providers)
  const [showUnifiedServicesModal, setShowUnifiedServicesModal] = useState(false);
  const [unifiedServices, setUnifiedServices] = useState<UnifiedService[]>([]);
  const [isUnifiedServicesLoading, setIsUnifiedServicesLoading] = useState(false);
  const [unifiedServiceSearchQuery, setUnifiedServiceSearchQuery] = useState("");
  const [selectedUnifiedService, setSelectedUnifiedService] = useState<UnifiedService | null>(null);
  const [unifiedServiceCountries, setUnifiedServiceCountries] = useState<UnifiedServiceCountry[]>([]);
  const [isUnifiedCountriesLoading, setIsUnifiedCountriesLoading] = useState(false);
  const [unifiedCountrySearchQuery, setUnifiedCountrySearchQuery] = useState("");

  // Icon Management (using unified services - no duplicates)
  const [showIconManagementModal, setShowIconManagementModal] = useState(false);
  const [servicesForIcons, setServicesForIcons] = useState<UnifiedService[]>([]);
  const [isIconServicesLoading, setIsIconServicesLoading] = useState(false);
  const [iconFilterMissing, setIconFilterMissing] = useState(false);
  const [iconSearchQuery, setIconSearchQuery] = useState("");
  const [editingIconService, setEditingIconService] = useState<UnifiedService | null>(null);
  const [iconUrlInput, setIconUrlInput] = useState("");
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);

  // VIP modal country selection
  const [vipCountries, setVipCountries] = useState<SmsCountry[]>([]);
  const [isVipCountriesLoading, setIsVipCountriesLoading] = useState(false);
  const [selectedVipCountryId, setSelectedVipCountryId] = useState<string>("");
  const [vipCountrySearch, setVipCountrySearch] = useState("");

  // VIP numbers from API (3 tiers by rating) - Legacy
  const [vipPremium, setVipPremium] = useState<VipNumber[]>([]);
  const [vipStandard, setVipStandard] = useState<VipNumber[]>([]);
  const [vipBasic, setVipBasic] = useState<VipNumber[]>([]);
  const [isVipLoading, setIsVipLoading] = useState(false);

  // Unified VIP (new - no duplicates)
  const [unifiedVipServices, setUnifiedVipServices] = useState<UnifiedVipService[]>([]);
  const [isVipEnabled, setIsVipEnabled] = useState(true);
  const [isTogglingVip, setIsTogglingVip] = useState(false);
  const [isAutoPopulating, setIsAutoPopulating] = useState(false);

  // Bulk pricing selection
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isBulkLocking, setIsBulkLocking] = useState(false);

  const fetchUnifiedVip = useCallback(async () => {
    setIsVipLoading(true);
    try {
      const response = await adminGetUnifiedVipCategories();
      setUnifiedVipServices(response.services || []);
      setIsVipEnabled(response.enabled);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch VIP categories");
    } finally {
      setIsVipLoading(false);
    }
  }, []);

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

  const handleToggleVip = async () => {
    setIsTogglingVip(true);
    try {
      const result = await adminToggleVip(!isVipEnabled);
      setIsVipEnabled(result.enabled);
      toast.success(result.message);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to toggle VIP");
    } finally {
      setIsTogglingVip(false);
    }
  };

  const handleAutoPopulateVip = async () => {
    setIsAutoPopulating(true);
    try {
      const result = await adminAutoPopulateVip({ minOrders: 10, limit: 20 });
      toast.success(`${result.added} services added to VIP based on usage`);
      fetchUnifiedVip();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to auto-populate VIP");
    } finally {
      setIsAutoPopulating(false);
    }
  };

  const handleBulkLockProducts = async (lock: boolean) => {
    if (selectedProductIds.length === 0) {
      toast.error("Please select products to lock/unlock");
      return;
    }
    setIsBulkLocking(true);
    try {
      const result = await adminBulkLockProducts(selectedProductIds, lock);
      toast.success(`${result.updated} products ${lock ? 'locked' : 'unlocked'}`);
      setSelectedProductIds([]);
      fetchPricingProducts(pricingPage, pricingLimit, debouncedPricingSearch, showLockedOnly);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to bulk update");
    } finally {
      setIsBulkLocking(false);
    }
  };

  // Fetch unified services (no duplicates across providers) with pagination
  const fetchUnifiedServices = useCallback(async () => {
    setIsUnifiedServicesLoading(true);
    try {
      let allServices: UnifiedService[] = [];
      let page = 1;
      const limit = 200;
      let hasMore = true;
      
      while (hasMore) {
        const response = await getUnifiedServices({ limit, page });
        const services = response.data || [];
        allServices = [...allServices, ...services];
        
        if (services.length < limit) {
          hasMore = false;
        } else {
          page++;
        }
      }
      
      setUnifiedServices(allServices);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch services");
    } finally {
      setIsUnifiedServicesLoading(false);
    }
  }, []);

  const handleViewUnifiedServiceCountries = async (service: UnifiedService) => {
    setSelectedUnifiedService(service);
    setUnifiedServiceCountries([]);
    setUnifiedCountrySearchQuery("");
    setIsUnifiedCountriesLoading(true);
    try {
      let allCountries: UnifiedServiceCountry[] = [];
      let page = 1;
      const limit = 200;
      let hasMore = true;
      
      while (hasMore) {
        const response = await getCountriesForUnifiedService(service.name, { limit, page });
        const countries = response.data || [];
        allCountries = [...allCountries, ...countries];
        
        if (countries.length < limit) {
          hasMore = false;
        } else {
          page++;
        }
      }
      
      setUnifiedServiceCountries(allCountries);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch countries");
    } finally {
      setIsUnifiedCountriesLoading(false);
    }
  };

  const handleOpenUnifiedServicesModal = () => {
    setShowUnifiedServicesModal(true);
    setSelectedUnifiedService(null);
    setUnifiedServiceCountries([]);
    setUnifiedServiceSearchQuery("");
    fetchUnifiedServices();
  };

  // Icon Management functions - uses unified services (no duplicates across providers) with pagination
  const fetchServicesForIcons = useCallback(async (missingOnly: boolean = false) => {
    setIsIconServicesLoading(true);
    try {
      let allServices: UnifiedService[] = [];
      let page = 1;
      const limit = 200;
      let hasMore = true;
      
      while (hasMore) {
        const response = await getUnifiedServices({ limit, page });
        const services = response.data || [];
        allServices = [...allServices, ...services];
        
        if (services.length < limit) {
          hasMore = false;
        } else {
          page++;
        }
      }
      
      // Filter to missing icons only if requested
      if (missingOnly) {
        allServices = allServices.filter(s => !s.iconUrl);
      }
      
      setServicesForIcons(allServices);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch services");
    } finally {
      setIsIconServicesLoading(false);
    }
  }, []);

  const handleOpenIconManagement = () => {
    setShowIconManagementModal(true);
    setIconFilterMissing(false);
    setIconSearchQuery("");
    setEditingIconService(null);
    setIconUrlInput("");
    fetchServicesForIcons(false);
  };

  const handleIconFilterChange = (missingOnly: boolean) => {
    setIconFilterMissing(missingOnly);
    fetchServicesForIcons(missingOnly);
  };

  const handleEditIcon = (service: UnifiedService) => {
    setEditingIconService(service);
    setIconUrlInput(service.iconUrl || "");
  };

  const handleSaveIcon = async () => {
    if (!editingIconService) return;
    setIsUploadingIcon(true);
    try {
      // Update icon for ALL providers that have this service (using bulk update)
      const updates = editingIconService.providers.map(p => ({
        serviceId: p.serviceId,
        iconUrl: iconUrlInput || null,
      }));
      
      await apiClient.post(
        API_ENDPOINTS.ADMIN.SMS.SERVICES_BULK_UPDATE_ICONS,
        { updates }
      );
      toast.success(`Icon updated for ${updates.length} provider(s)`);
      setEditingIconService(null);
      setIconUrlInput("");
      fetchServicesForIcons(iconFilterMissing);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update icon");
    } finally {
      setIsUploadingIcon(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!editingIconService) return;
    setIsUploadingIcon(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadResponse = await apiClient.post<{ url: string }>(
        `${API_ENDPOINTS.STORAGE.UPLOAD}?folder=icons`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      const uploadedUrl = uploadResponse.data.url;
      
      // Update icon for ALL providers that have this service (using bulk update)
      const updates = editingIconService.providers.map(p => ({
        serviceId: p.serviceId,
        iconUrl: uploadedUrl,
      }));
      
      await apiClient.post(
        API_ENDPOINTS.ADMIN.SMS.SERVICES_BULK_UPDATE_ICONS,
        { updates }
      );
      toast.success(`Icon uploaded and applied to ${updates.length} provider(s)`);
      setEditingIconService(null);
      setIconUrlInput("");
      fetchServicesForIcons(iconFilterMissing);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to upload icon");
    } finally {
      setIsUploadingIcon(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'vip') {
      fetchUnifiedVip();
    }
  }, [activeTab, fetchUnifiedVip]);

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

  // Debounce search for services modal
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedServiceSearch(serviceSearchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [serviceSearchQuery]);

  // Fetch services when pagination/search changes
  useEffect(() => {
    if (selectedProvider && showProviderModal) {
      fetchProviderServices(
        selectedProvider.id,
        servicesPage,
        servicesLimit,
        debouncedServiceSearch
      );
    }
  }, [selectedProvider, showProviderModal, servicesPage, servicesLimit, debouncedServiceSearch]);

  // Reset to page 1 when search changes
  useEffect(() => {
    if (debouncedServiceSearch !== "") {
      setServicesPage(1);
    }
  }, [debouncedServiceSearch]);

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

  const handleViewProvider = (provider: Provider) => {
    setSelectedProvider(provider);
    setShowProviderModal(true);
    setProviderServices([]);
    setSelectedServiceForCountries(null);
    setServiceCountries([]);
    setServiceSearchQuery("");
    setDebouncedServiceSearch("");
    setCountrySearchQuery("");
    setServicesPage(1);
    setServicesLimit(50);
    setServicesTotalCount(0);
    setServicesTotalPages(0);
  };

  const fetchProviderServices = async (
    providerId: string,
    page: number,
    limit: number,
    search: string
  ) => {
    setIsServicesLoading(true);
    try {
      const response = await getServices({
        providerId,
        page,
        limit,
        search: search || undefined,
      });
      setProviderServices(response.data || []);
      setServicesTotalCount(response.meta?.total || 0);
      setServicesTotalPages(response.meta?.totalPages || 0);
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

  // Clear sync status for a provider after a delay
  const clearSyncStatus = (providerId: string, delayMs = 10000) => {
    setTimeout(() => {
      setSyncStatusMap(prev => {
        const updated = { ...prev };
        delete updated[providerId];
        return updated;
      });
    }, delayMs);
  };

  // Sync provider with background polling
  const handleSyncProvider = async (providerId: string) => {
    setIsSyncing(providerId);
    setSyncStatusMap(prev => ({
      ...prev,
      [providerId]: { status: 'syncing', message: 'Sync in progress...' }
    }));
    
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
              const successMsg = `Sync complete! ${status.services || 0} services, ${status.countries || 0} countries, ${status.products || 0} products`;
              toast.success(successMsg, { duration: 5000 });
              setSyncStatusMap(prev => ({
                ...prev,
                [providerId]: {
                  status: 'completed',
                  message: successMsg,
                  services: status.services,
                  countries: status.countries,
                  products: status.products
                }
              }));
              fetchProviders();
              setIsSyncing(null);
              clearSyncStatus(providerId, 15000); // Keep success visible for 15s
              return;
            } else if (status.status === 'idle' && status.completedAt) {
              // Server restarted or sync finished - check if completedAt is recent (within last 2 minutes)
              const completedTime = new Date(status.completedAt).getTime();
              const now = Date.now();
              const twoMinutesAgo = now - 2 * 60 * 1000;
              
              if (completedTime > twoMinutesAgo) {
                // Sync likely completed recently, treat as success
                const successMsg = `Sync completed! Refresh the page to see updated data.`;
                toast.success(successMsg, { duration: 5000 });
                setSyncStatusMap(prev => ({
                  ...prev,
                  [providerId]: {
                    status: 'completed',
                    message: successMsg
                  }
                }));
                fetchProviders();
                setIsSyncing(null);
                clearSyncStatus(providerId, 15000);
                return;
              } else {
                // Old completedAt, sync might still be running or failed silently
                // Continue polling for a bit more
                if (attempts < 10) {
                  setTimeout(pollStatus, 5000);
                  return;
                }
                // Give up, assume completed
                toast.info("Sync status unknown. Refreshing data...");
                fetchProviders();
                setIsSyncing(null);
                return;
              }
            } else if (status.status === 'failed') {
              const errorMsg = status.error || 'Unknown error';
              toast.error(`Sync failed: ${errorMsg}`, { duration: 8000 });
              setSyncStatusMap(prev => ({
                ...prev,
                [providerId]: {
                  status: 'failed',
                  error: errorMsg
                }
              }));
              setIsSyncing(null);
              clearSyncStatus(providerId, 30000); // Keep error visible for 30s
              return;
            } else if (status.status === 'syncing' && attempts < maxAttempts) {
              // Still syncing, update progress message
              setSyncStatusMap(prev => ({
                ...prev,
                [providerId]: {
                  status: 'syncing',
                  message: `Syncing... (${attempts * 5}s elapsed)`
                }
              }));
              // Poll again after 5 seconds
              setTimeout(pollStatus, 5000);
            } else {
              // Max attempts reached
              toast.info("Sync is still running. Check back later or refresh the page.");
              setSyncStatusMap(prev => ({
                ...prev,
                [providerId]: {
                  status: 'syncing',
                  message: 'Sync taking longer than expected. Refresh page to check status.'
                }
              }));
              setIsSyncing(null);
            }
          } catch (pollError) {
            console.error('Error polling sync status:', pollError);
            if (attempts < maxAttempts) {
              setTimeout(pollStatus, 5000);
            } else {
              toast.error("Could not get sync status. The sync may still be running.");
              setSyncStatusMap(prev => ({
                ...prev,
                [providerId]: {
                  status: 'failed',
                  error: 'Could not get sync status'
                }
              }));
              setIsSyncing(null);
              clearSyncStatus(providerId, 30000);
            }
          }
        };
        
        // Start polling after 3 seconds
        setTimeout(pollStatus, 3000);
      } else {
        // Sync completed immediately or already had result
        toast.success(startResult.message);
        setSyncStatusMap(prev => ({
          ...prev,
          [providerId]: {
            status: 'completed',
            message: startResult.message
          }
        }));
        fetchProviders();
        setIsSyncing(null);
        clearSyncStatus(providerId, 15000);
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to start sync";
      toast.error(message, { duration: 8000 });
      setSyncStatusMap(prev => ({
        ...prev,
        [providerId]: {
          status: 'failed',
          error: message
        }
      }));
      setIsSyncing(null);
      clearSyncStatus(providerId, 30000);
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
      let allCountries: SmsCountry[] = [];
      let page = 1;
      const limit = 200;
      let hasMore = true;
      
      while (hasMore) {
        const response = await getCountries({ providerId: selectedProvider.id, limit, page });
        const countries = response.data || [];
        allCountries = [...allCountries, ...countries];
        
        if (countries.length < limit) {
          hasMore = false;
        } else {
          page++;
        }
      }
      
      setVipCountries(allCountries);
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
  const fetchPricingProducts = useCallback(async (page = 1, limit = 50, search = "", lockedOnly = false) => {
    setIsPricingLoading(true);
    try {
      const params: Record<string, any> = { page, limit };
      if (search) params.search = search;
      if (lockedOnly) params.isPriceLocked = true;
      const response = await apiClient.get<{ data: PricingProduct[]; meta: { total: number; totalPages: number } }>(
        API_ENDPOINTS.ADMIN.SMS.PRICING_PRODUCTS,
        { params },
      );
      setPricingProducts(response.data.data || []);
      setPricingTotal(response.data.meta?.total || 0);
      setPricingTotalPages(response.data.meta?.totalPages || 0);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch products");
    } finally {
      setIsPricingLoading(false);
    }
  }, []);

  // Debounce pricing search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPricingSearch(pricingSearchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [pricingSearchQuery]);

  // Fetch when pagination/search/filter changes
  useEffect(() => {
    if (activeTab === 'pricing') {
      fetchPricingProducts(pricingPage, pricingLimit, debouncedPricingSearch, showLockedOnly);
    }
  }, [activeTab, pricingPage, pricingLimit, debouncedPricingSearch, showLockedOnly, fetchPricingProducts]);

  // Initial load for pricing tab
  useEffect(() => {
    if (activeTab === 'pricing') {
      fetchGlobalMarkup();
      setPricingPage(1);
      setPricingSearchQuery("");
      setDebouncedPricingSearch("");
    }
  }, [activeTab, fetchGlobalMarkup]);

  const handleApplyGlobalMarkup = async () => {
    setIsLoading(true);
    try {
      await apiClient.put(API_ENDPOINTS.ADMIN.SMS.PRICING_GLOBAL_MARKUP, { markup: globalMarkup });
      toast.success(`Global markup of ${globalMarkup}% applied!`);
      fetchPricingProducts(pricingPage, pricingLimit, debouncedPricingSearch, showLockedOnly);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to apply markup");
    } finally {
      setIsLoading(false);
    }
  };

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
      fetchPricingProducts(pricingPage, pricingLimit, debouncedPricingSearch, showLockedOnly);
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
          {/* Search Bar + Actions */}
          <div className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[250px]">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search providers..."
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg pl-12 pr-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                />
              </div>
              <button
                onClick={handleOpenUnifiedServicesModal}
                className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors whitespace-nowrap"
              >
                <Globe className="w-4 h-4" />
                All Services
              </button>
              <button
                onClick={handleOpenIconManagement}
                className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm font-medium transition-colors whitespace-nowrap"
              >
                <Edit2 className="w-4 h-4" />
                Manage Icons
              </button>
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

                  {/* Sync Status Banner */}
                  {syncStatusMap[provider.id] && (
                    <div className={`mb-4 p-3 rounded-lg border ${
                      syncStatusMap[provider.id].status === 'syncing' 
                        ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' 
                        : syncStatusMap[provider.id].status === 'completed'
                        ? 'bg-green-500/10 border-green-500/30 text-green-400'
                        : 'bg-red-500/10 border-red-500/30 text-red-400'
                    }`}>
                      <div className="flex items-center gap-2 text-sm font-medium">
                        {syncStatusMap[provider.id].status === 'syncing' && (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>{syncStatusMap[provider.id].message}</span>
                          </>
                        )}
                        {syncStatusMap[provider.id].status === 'completed' && (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            <span>Sync Completed!</span>
                          </>
                        )}
                        {syncStatusMap[provider.id].status === 'failed' && (
                          <>
                            <XCircle className="w-4 h-4" />
                            <span>Sync Failed</span>
                          </>
                        )}
                      </div>
                      {syncStatusMap[provider.id].status === 'completed' && syncStatusMap[provider.id].services != null && (
                        <div className="text-xs mt-1 opacity-80">
                          {syncStatusMap[provider.id].services} services, {syncStatusMap[provider.id].countries} countries, {syncStatusMap[provider.id].products} products
                        </div>
                      )}
                      {syncStatusMap[provider.id].status === 'failed' && syncStatusMap[provider.id].error && (
                        <div className="text-xs mt-1 opacity-80 break-words">
                          {syncStatusMap[provider.id].error}
                        </div>
                      )}
                    </div>
                  )}

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
          {/* VIP Controls */}
          <div className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white text-lg font-semibold mb-1">VIP Categories</h3>
                <p className="text-[#94A3B8] text-sm">
                  Unified view - each service appears once with all available providers
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Toggle VIP On/Off */}
                <div className="flex items-center gap-2">
                  <span className="text-[#94A3B8] text-sm">VIP {isVipEnabled ? 'Enabled' : 'Disabled'}</span>
                  <button
                    onClick={handleToggleVip}
                    disabled={isTogglingVip}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isVipEnabled ? 'bg-[#22C55E]' : 'bg-[rgba(255,255,255,0.18)]'
                    }`}
                  >
                    {isTogglingVip ? (
                      <Loader2 className="w-4 h-4 text-white animate-spin mx-auto" />
                    ) : (
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isVipEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    )}
                  </button>
                </div>
                {/* Auto-populate from usage */}
                <button
                  onClick={handleAutoPopulateVip}
                  disabled={isAutoPopulating}
                  className="px-4 py-2 rounded-lg bg-[#F59E0B] hover:bg-[#D97706] text-white text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isAutoPopulating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <TrendingUp className="w-4 h-4" />
                  )}
                  Auto-Populate from Usage
                </button>
                <button
                  onClick={fetchUnifiedVip}
                  disabled={isVipLoading}
                  className="p-2 rounded-lg bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-[#94A3B8] transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${isVipLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {isVipLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin" />
              <span className="ml-3 text-[#94A3B8]">Loading VIP categories...</span>
            </div>
          ) : !isVipEnabled ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Star className="w-12 h-12 text-[#64748B] mb-4" />
              <p className="text-white text-lg font-medium">VIP Categories Disabled</p>
              <p className="text-[#94A3B8] text-sm mt-1">Enable VIP to show premium services to users</p>
            </div>
          ) : unifiedVipServices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Star className="w-12 h-12 text-[#64748B] mb-4" />
              <p className="text-white text-lg font-medium">No VIP Services</p>
              <p className="text-[#94A3B8] text-sm mt-1">Add services from providers or use auto-populate</p>
            </div>
          ) : (
            <div className="space-y-4">
              {unifiedVipServices.map((service) => (
                <div
                  key={service.slug}
                  className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl"
                >
                  <div className="flex items-center gap-4 mb-4">
                    {service.iconUrl ? (
                      <img src={service.iconUrl} alt={service.name} className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.1)] flex items-center justify-center">
                        <Star className="w-5 h-5 text-[#F59E0B]" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-white text-lg font-semibold">{service.name}</h4>
                      <p className="text-[#94A3B8] text-sm">{service.category} • {service.countryCount} countries</p>
                    </div>
                  </div>

                  {/* Countries accordion */}
                  <div className="space-y-2">
                    {service.countries.map((country) => (
                      <div key={country.id} className="p-4 rounded-lg bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.05)]">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {country.iconUrl && (
                              <img src={country.iconUrl} alt={country.name} className="w-5 h-5 rounded" />
                            )}
                            <span className="text-white text-sm font-medium">{country.name}</span>
                            <span className="text-[#64748B] text-xs">({country.code})</span>
                          </div>
                          <span className="px-2 py-1 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] text-xs font-medium">
                            Best Rating: {country.bestRating}/5
                          </span>
                        </div>
                        {/* Providers for this country */}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {country.providers.map((provider) => (
                            <div
                              key={provider.vipId}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)]"
                            >
                              <span className="text-[#94A3B8] text-xs">{provider.providerName}</span>
                              <span className="text-[#3B82F6] text-xs font-medium">{provider.rating}/5</span>
                              <span className="text-[#64748B] text-xs">({provider.orderCount} orders)</span>
                              <button
                                onClick={() => handleRemoveVip(provider.vipId)}
                                className="p-1 hover:bg-[rgba(239,68,68,0.2)] rounded text-[#EF4444] transition-colors"
                                title="Remove"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
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

          {/* Search Bar + Lock Filter + Bulk Actions */}
          <div className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[250px]">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                <input
                  type="text"
                  value={pricingSearchQuery}
                  onChange={(e) => {
                    setPricingSearchQuery(e.target.value);
                    setPricingPage(1);
                  }}
                  placeholder="Search services by name, country, or provider..."
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg pl-12 pr-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                />
                {isPricingLoading && (
                  <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3B82F6] animate-spin" />
                )}
              </div>
              
              {/* Per page dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-[#94A3B8] text-sm whitespace-nowrap">Per page:</span>
                <select
                  value={pricingLimit}
                  onChange={(e) => {
                    setPricingLimit(Number(e.target.value));
                    setPricingPage(1);
                  }}
                  className="px-3 py-2.5 rounded-lg bg-[#1E293B] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] cursor-pointer [&>option]:bg-[#1E293B] [&>option]:text-white"
                >
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={150}>150</option>
                  <option value={200}>200</option>
                </select>
              </div>
              <button
                onClick={() => {
                  setShowLockedOnly(!showLockedOnly);
                  setPricingPage(1);
                }}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  showLockedOnly
                    ? 'bg-[#3B82F6] text-white'
                    : 'bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.18)] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.08)]'
                }`}
              >
                <Lock className="w-4 h-4" />
                Locked Only
              </button>
              
              {/* Bulk Lock/Unlock Actions */}
              {selectedProductIds.length > 0 && (
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-[#94A3B8] text-sm">{selectedProductIds.length} selected</span>
                  <button
                    onClick={() => handleBulkLockProducts(true)}
                    disabled={isBulkLocking}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F59E0B] hover:bg-[#D97706] text-white text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {isBulkLocking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                    Lock Selected
                  </button>
                  <button
                    onClick={() => handleBulkLockProducts(false)}
                    disabled={isBulkLocking}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.15)] text-white text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    Unlock Selected
                  </button>
                  <button
                    onClick={() => setSelectedProductIds([])}
                    className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.1)] text-[#94A3B8] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
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
                        <th className="px-4 py-4 text-left">
                          <input
                            type="checkbox"
                            checked={selectedProductIds.length === pricingProducts.length && pricingProducts.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedProductIds(pricingProducts.map(p => p.id));
                              } else {
                                setSelectedProductIds([]);
                              }
                            }}
                            className="w-4 h-4 rounded border-[rgba(255,255,255,0.3)] bg-[rgba(0,0,0,0.4)] checked:bg-[#3B82F6]"
                          />
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-medium text-[#94A3B8] uppercase">Service</th>
                        <th className="px-4 py-4 text-left text-xs font-medium text-[#94A3B8] uppercase">Country</th>
                        <th className="px-4 py-4 text-left text-xs font-medium text-[#94A3B8] uppercase">Provider</th>
                        <th className="px-4 py-4 text-left text-xs font-medium text-[#94A3B8] uppercase">Base Price</th>
                        <th className="px-4 py-4 text-left text-xs font-medium text-[#94A3B8] uppercase">Markup</th>
                        <th className="px-4 py-4 text-left text-xs font-medium text-[#94A3B8] uppercase">Final Price</th>
                        <th className="px-4 py-4 text-left text-xs font-medium text-[#94A3B8] uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                      {pricingProducts.map((product) => (
                        <tr 
                          key={product.id} 
                          className={`hover:bg-[rgba(255,255,255,0.02)] transition-colors ${
                            selectedProductIds.includes(product.id) ? 'bg-[rgba(59,130,246,0.05)]' : ''
                          }`}
                        >
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              checked={selectedProductIds.includes(product.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedProductIds([...selectedProductIds, product.id]);
                                } else {
                                  setSelectedProductIds(selectedProductIds.filter(id => id !== product.id));
                                }
                              }}
                              className="w-4 h-4 rounded border-[rgba(255,255,255,0.3)] bg-[rgba(0,0,0,0.4)] checked:bg-[#3B82F6]"
                            />
                          </td>
                          <td className="px-4 py-4 text-white text-sm font-medium">
                            <span className="flex items-center gap-2">
                              {product.service.name}
                              {product.isPriceLocked && <Lock className="w-3 h-3 text-[#F59E0B]" />}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-[#94A3B8] text-sm">{product.country.name}</td>
                          <td className="px-4 py-4 text-[#94A3B8] text-sm">{product.provider.name}</td>
                          <td className="px-4 py-4 text-white text-sm">${product.basePrice}</td>
                          <td className="px-4 py-4">
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
                          <td className="px-4 py-4 text-white text-sm font-semibold">${product.finalPrice}</td>
                          <td className="px-4 py-4">
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
                {pricingTotalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-[rgba(255,255,255,0.1)]">
                    <div className="text-[#94A3B8] text-sm">
                      Showing {((pricingPage - 1) * pricingLimit) + 1}-{Math.min(pricingPage * pricingLimit, pricingTotal)} of {pricingTotal}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPricingPage(1)}
                        disabled={pricingPage === 1 || isPricingLoading}
                        className="px-3 py-1.5 rounded-lg bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-[#94A3B8] text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        First
                      </button>
                      <button
                        onClick={() => setPricingPage(p => Math.max(1, p - 1))}
                        disabled={pricingPage === 1 || isPricingLoading}
                        className="px-3 py-1.5 rounded-lg bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-[#94A3B8] text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, pricingTotalPages) }, (_, i) => {
                          let pageNum: number;
                          if (pricingTotalPages <= 5) {
                            pageNum = i + 1;
                          } else if (pricingPage <= 3) {
                            pageNum = i + 1;
                          } else if (pricingPage >= pricingTotalPages - 2) {
                            pageNum = pricingTotalPages - 4 + i;
                          } else {
                            pageNum = pricingPage - 2 + i;
                          }
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setPricingPage(pageNum)}
                              disabled={isPricingLoading}
                              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                                pricingPage === pageNum
                                  ? "bg-[#3B82F6] text-white"
                                  : "bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-[#94A3B8]"
                              } disabled:opacity-50`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => setPricingPage(p => Math.min(pricingTotalPages, p + 1))}
                        disabled={pricingPage === pricingTotalPages || isPricingLoading}
                        className="px-3 py-1.5 rounded-lg bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-[#94A3B8] text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                      <button
                        onClick={() => setPricingPage(pricingTotalPages)}
                        disabled={pricingPage === pricingTotalPages || isPricingLoading}
                        className="px-3 py-1.5 rounded-lg bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-[#94A3B8] text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Last
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
                    setServiceSearchQuery("");
                    setDebouncedServiceSearch("");
                    setServicesPage(1);
                    setServicesLimit(50);
                    setServicesTotalCount(0);
                    setServicesTotalPages(0);
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
                    Services ({servicesTotalCount})
                  </h3>
                  <div className="flex items-center gap-2">
                    {providerServices.length > 0 && (
                      <>
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
                      </>
                    )}
                  </div>
                </div>

                {/* Search and Listings per page controls */}
                <div className="flex items-center gap-4 mb-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                    <input
                      type="text"
                      placeholder="Search services..."
                      value={serviceSearchQuery}
                      onChange={(e) => setServiceSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white text-sm placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                    />
                    {isServicesLoading && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3B82F6] animate-spin" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#94A3B8] text-sm whitespace-nowrap">Per page:</span>
                    <select
                      value={servicesLimit}
                      onChange={(e) => {
                        setServicesLimit(Number(e.target.value));
                        setServicesPage(1);
                      }}
                      className="px-3 py-2 rounded-lg bg-[#1E293B] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] cursor-pointer [&>option]:bg-[#1E293B] [&>option]:text-white"
                    >
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={150}>150</option>
                      <option value={200}>200</option>
                    </select>
                  </div>
                </div>

                {providerServices.length === 0 && !isServicesLoading ? (
                  <div className="text-center py-12 text-[#64748B]">
                    {serviceSearchQuery ? "No services found matching your search" : "No services found for this provider"}
                  </div>
                ) : (
                  <>
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
                          {providerServices.map((service) => (
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
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  {service.iconUrl ? (
                                    <img 
                                      src={service.iconUrl} 
                                      alt={service.name} 
                                      className="w-8 h-8 rounded-lg object-cover"
                                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                  ) : (
                                    <div className="w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center">
                                      <Globe className="w-4 h-4 text-[#64748B]" />
                                    </div>
                                  )}
                                  <span className="text-white text-sm font-medium">{service.name}</span>
                                </div>
                              </td>
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

                    {/* Pagination Controls */}
                    {servicesTotalPages > 1 && (
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-[#94A3B8] text-sm">
                          Showing {((servicesPage - 1) * servicesLimit) + 1}-{Math.min(servicesPage * servicesLimit, servicesTotalCount)} of {servicesTotalCount}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setServicesPage(1)}
                            disabled={servicesPage === 1 || isServicesLoading}
                            className="px-3 py-1.5 rounded-lg bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-[#94A3B8] text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            First
                          </button>
                          <button
                            onClick={() => setServicesPage(p => Math.max(1, p - 1))}
                            disabled={servicesPage === 1 || isServicesLoading}
                            className="px-3 py-1.5 rounded-lg bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-[#94A3B8] text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Previous
                          </button>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, servicesTotalPages) }, (_, i) => {
                              let pageNum: number;
                              if (servicesTotalPages <= 5) {
                                pageNum = i + 1;
                              } else if (servicesPage <= 3) {
                                pageNum = i + 1;
                              } else if (servicesPage >= servicesTotalPages - 2) {
                                pageNum = servicesTotalPages - 4 + i;
                              } else {
                                pageNum = servicesPage - 2 + i;
                              }
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setServicesPage(pageNum)}
                                  disabled={isServicesLoading}
                                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                                    servicesPage === pageNum
                                      ? "bg-[#3B82F6] text-white"
                                      : "bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-[#94A3B8]"
                                  } disabled:opacity-50`}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}
                          </div>
                          <button
                            onClick={() => setServicesPage(p => Math.min(servicesTotalPages, p + 1))}
                            disabled={servicesPage === servicesTotalPages || isServicesLoading}
                            className="px-3 py-1.5 rounded-lg bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-[#94A3B8] text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next
                          </button>
                          <button
                            onClick={() => setServicesPage(servicesTotalPages)}
                            disabled={servicesPage === servicesTotalPages || isServicesLoading}
                            className="px-3 py-1.5 rounded-lg bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-[#94A3B8] text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Last
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
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

      {/* Unified Services Modal (No Duplicates) */}
      {showUnifiedServicesModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F172A] border border-[rgba(255,255,255,0.1)] rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="sticky top-0 bg-[#0F172A] border-b border-[rgba(255,255,255,0.1)] p-6 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-white text-2xl font-semibold mb-1">All Services</h2>
                  <p className="text-[#94A3B8] text-sm">Unified view - each service appears once across all providers</p>
                </div>
                <button
                  onClick={() => {
                    setShowUnifiedServicesModal(false);
                    setSelectedUnifiedService(null);
                    setUnifiedServices([]);
                    setUnifiedServiceCountries([]);
                  }}
                  className="p-2 hover:bg-[rgba(255,255,255,0.1)] rounded-lg text-[#94A3B8] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={unifiedServiceSearchQuery}
                  onChange={(e) => setUnifiedServiceSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white text-sm placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                />
              </div>

              {isUnifiedServicesLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-6 h-6 text-[#3B82F6] animate-spin" />
                  <span className="text-[#94A3B8] text-sm ml-3">Loading services...</span>
                </div>
              ) : unifiedServices.length === 0 ? (
                <div className="text-center py-16 text-[#64748B]">No services found. Sync providers first.</div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Services List */}
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                    <h3 className="text-white text-sm font-medium mb-2 sticky top-0 bg-[#0F172A] py-2">
                      Services ({unifiedServices.filter(s => s.name.toLowerCase().includes(unifiedServiceSearchQuery.toLowerCase())).length})
                    </h3>
                    {unifiedServices
                      .filter(s => s.name.toLowerCase().includes(unifiedServiceSearchQuery.toLowerCase()))
                      .map((service) => (
                        <div
                          key={service.slug}
                          onClick={() => handleViewUnifiedServiceCountries(service)}
                          className={`p-4 rounded-lg border cursor-pointer transition-all ${
                            selectedUnifiedService?.slug === service.slug
                              ? 'bg-[rgba(59,130,246,0.1)] border-[#3B82F6]'
                              : 'bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.15)]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {service.iconUrl ? (
                              <img src={service.iconUrl} alt={service.name} className="w-8 h-8 rounded-lg object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.1)] flex items-center justify-center">
                                <Globe className="w-4 h-4 text-[#64748B]" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-white text-sm font-medium truncate">{service.name}</span>
                                {service.isPopular && (
                                  <span className="px-1.5 py-0.5 rounded bg-[#F59E0B]/20 text-[#F59E0B] text-xs">Popular</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[#64748B] text-xs">{service.category}</span>
                                <span className="text-[#64748B] text-xs">•</span>
                                <span className="text-[#64748B] text-xs">{service.providers.length} providers</span>
                                <span className="text-[#64748B] text-xs">•</span>
                                <span className="text-[#64748B] text-xs">{service.totalCountries} countries</span>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-[#64748B]" />
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Countries for selected service */}
                  <div className="max-h-[500px] overflow-y-auto pl-2 border-l border-[rgba(255,255,255,0.1)]">
                    {selectedUnifiedService ? (
                      <>
                        <h3 className="text-white text-sm font-medium mb-2 sticky top-0 bg-[#0F172A] py-2">
                          Countries for {selectedUnifiedService.name}
                        </h3>
                        {isUnifiedCountriesLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-5 h-5 text-[#3B82F6] animate-spin" />
                          </div>
                        ) : unifiedServiceCountries.length === 0 ? (
                          <div className="text-center py-8 text-[#64748B] text-sm">No countries available</div>
                        ) : (
                          <div className="space-y-2">
                            {unifiedServiceCountries
                              .filter(c => c.name.toLowerCase().includes(unifiedCountrySearchQuery.toLowerCase()))
                              .map((country) => (
                                <div key={country.id} className="p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      {country.iconUrl && <img src={country.iconUrl} alt="" className="w-5 h-5 rounded" />}
                                      <span className="text-white text-sm font-medium">{country.name}</span>
                                      <span className="text-[#64748B] text-xs">({country.code})</span>
                                    </div>
                                    <span className="text-[#22C55E] text-sm font-medium">${country.bestPrice}</span>
                                  </div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {country.providers.map((p) => (
                                      <span key={p.productId} className="px-2 py-1 rounded bg-[rgba(255,255,255,0.05)] text-[#94A3B8] text-xs">
                                        {p.name} - ${p.price} ({p.available})
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full text-[#64748B] text-sm">
                        Select a service to view countries
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Icon Management Modal */}
      {showIconManagementModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F172A] border border-[rgba(255,255,255,0.1)] rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="sticky top-0 bg-[#0F172A] border-b border-[rgba(255,255,255,0.1)] p-6 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-white text-2xl font-semibold mb-1">Manage Service Icons</h2>
                  <p className="text-[#94A3B8] text-sm">Upload or set icon URLs for services</p>
                </div>
                <button
                  onClick={() => {
                    setShowIconManagementModal(false);
                    setEditingIconService(null);
                    setServicesForIcons([]);
                  }}
                  className="p-2 hover:bg-[rgba(255,255,255,0.1)] rounded-lg text-[#94A3B8] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {/* Filters */}
              <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                  <input
                    type="text"
                    placeholder="Search services..."
                    value={iconSearchQuery}
                    onChange={(e) => setIconSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white text-sm placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
                  />
                </div>
                <button
                  onClick={() => handleIconFilterChange(!iconFilterMissing)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    iconFilterMissing
                      ? 'bg-[#EF4444] text-white'
                      : 'bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.18)] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.08)]'
                  }`}
                >
                  Missing Icons Only
                </button>
              </div>

              {isIconServicesLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-6 h-6 text-[#8B5CF6] animate-spin" />
                  <span className="text-[#94A3B8] text-sm ml-3">Loading services...</span>
                </div>
              ) : servicesForIcons.length === 0 ? (
                <div className="text-center py-16 text-[#64748B]">
                  {iconFilterMissing ? 'All services have icons!' : 'No services found'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {servicesForIcons
                    .filter(s => s.name.toLowerCase().includes(iconSearchQuery.toLowerCase()))
                    .map((service) => (
                      <div
                        key={service.slug}
                        className="p-4 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(139,92,246,0.3)] transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative">
                            {service.iconUrl ? (
                              <img src={service.iconUrl} alt={service.name} className="w-12 h-12 rounded-lg object-cover" />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] flex items-center justify-center">
                                <X className="w-5 h-5 text-[#EF4444]" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white text-sm font-medium truncate">{service.name}</h4>
                            <p className="text-[#64748B] text-xs mt-0.5">{service.category || 'Uncategorized'}</p>
                            <p className="text-[#3B82F6] text-xs mt-0.5">{service.providers.length} provider(s)</p>
                            <button
                              onClick={() => handleEditIcon(service)}
                              className="mt-2 px-3 py-1.5 rounded-lg bg-[#8B5CF6]/20 hover:bg-[#8B5CF6]/30 text-[#8B5CF6] text-xs font-medium transition-colors"
                            >
                              {service.iconUrl ? 'Change Icon' : 'Add Icon'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* Edit Icon Panel */}
              {editingIconService && (
                <div className="mt-6 p-4 rounded-lg bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.3)]">
                  <h4 className="text-white text-sm font-medium mb-1">
                    Edit Icon: {editingIconService.name}
                  </h4>
                  <p className="text-[#94A3B8] text-xs mb-3">
                    Will update icon for: {editingIconService.providers.map(p => p.name).join(', ')}
                  </p>
                  <div className="flex items-center gap-3 mb-4">
                    {editingIconService.iconUrl || iconUrlInput ? (
                      <img 
                        src={iconUrlInput || editingIconService.iconUrl || ''} 
                        alt="Preview" 
                        className="w-16 h-16 rounded-lg object-cover border border-[rgba(255,255,255,0.1)]"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center">
                        <Globe className="w-6 h-6 text-[#64748B]" />
                      </div>
                    )}
                    <div className="flex-1">
                      <label className="text-[#94A3B8] text-xs mb-1 block">Icon URL</label>
                      <input
                        type="text"
                        value={iconUrlInput}
                        onChange={(e) => setIconUrlInput(e.target.value)}
                        placeholder="https://example.com/icon.png"
                        className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                      />
                      <span className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.12)] text-white text-sm font-medium transition-colors cursor-pointer">
                        <Plus className="w-4 h-4" />
                        Upload File
                      </span>
                    </label>
                    <button
                      onClick={handleSaveIcon}
                      disabled={isUploadingIcon}
                      className="flex-1 px-4 py-2 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isUploadingIcon ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Icon
                    </button>
                    <button
                      onClick={() => { setEditingIconService(null); setIconUrlInput(""); }}
                      className="px-4 py-2 rounded-lg bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.12)] text-white text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
