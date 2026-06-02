'use client';

import { useState, useEffect, useCallback, useRef, memo } from 'react';
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
  Image as ImageIcon,
} from 'lucide-react';
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
  adminUpdateService,
  adminBulkAddVipAllCountries,
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

// Memoized row for the unified services list. With hundreds of items loaded,
// the parent re-renders on every keystroke in the search box — memoizing the
// row means React skips rows whose props haven't changed, keeping typing fast.
const UnifiedServiceRow = memo(function UnifiedServiceRow({
  service,
  isSelected,
  onSelect,
}: {
  service: UnifiedService;
  isSelected: boolean;
  onSelect: (s: UnifiedService) => void;
}) {
  return (
    <div
      onClick={() => onSelect(service)}
      className={`cursor-pointer rounded-lg border p-4 transition-all ${
        isSelected
          ? 'border-[#3B82F6] bg-[rgba(59,130,246,0.1)]'
          : 'border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(255,255,255,0.15)]'
      }`}
    >
      <div className="flex items-center gap-3">
        {service.iconUrl ? (
          <img
            src={service.iconUrl}
            alt={service.name}
            className="h-8 w-8 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(255,255,255,0.1)]">
            <Globe className="h-4 w-4 text-[#64748B]" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-white">
              {service.name}
            </span>
            {service.isPopular && (
              <span className="rounded bg-[#F59E0B]/20 px-1.5 py-0.5 text-xs text-[#F59E0B]">
                Popular
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xs text-[#64748B]">{service.category}</span>
            <span className="text-xs text-[#64748B]">•</span>
            <span className="text-xs text-[#64748B]">
              {service.providers.length} providers
            </span>
            <span className="text-xs text-[#64748B]">•</span>
            <span className="text-xs text-[#64748B]">
              {service.totalCountries} countries
            </span>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-[#64748B]" />
      </div>
    </div>
  );
});

// Memoized row for the Icon Management grid. Re-renders only when the
// row's specific props change — keeps typing/scrolling fast even with
// hundreds of items loaded.
const IconServiceRow = memo(function IconServiceRow({
  service,
  onEdit,
}: {
  service: UnifiedService;
  onEdit: (s: UnifiedService) => void;
}) {
  return (
    <div className="rounded-lg border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] p-4 transition-all hover:border-[rgba(139,92,246,0.3)]">
      <div className="flex items-start gap-3">
        <div className="relative">
          {service.iconUrl ? (
            <img
              src={service.iconUrl}
              alt={service.name}
              className="h-12 w-12 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.1)]">
              <X className="h-5 w-5 text-[#EF4444]" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-sm font-medium text-white">
            {service.name}
          </h4>
          <p className="mt-0.5 text-xs text-[#64748B]">
            {service.category || 'Uncategorized'}
          </p>
          <p className="mt-0.5 text-xs text-[#3B82F6]">
            {service.providers.length} provider(s)
          </p>
          <button
            onClick={() => onEdit(service)}
            className="mt-2 rounded-lg bg-[#8B5CF6]/20 px-3 py-1.5 text-xs font-medium text-[#8B5CF6] transition-colors hover:bg-[#8B5CF6]/30"
          >
            {service.iconUrl ? 'Change Icon' : 'Add Icon'}
          </button>
        </div>
      </div>
    </div>
  );
});

export default function AdminSmsServicesPage() {
  const [activeTab, setActiveTab] = useState<
    'providers' | 'vip' | 'pricing' | 'subscriptions'
  >('providers');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null,
  );
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showEditProviderModal, setShowEditProviderModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddToVIPModal, setShowAddToVIPModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedVIPCategory, setSelectedVIPCategory] = useState<string>('v1');

  // Pricing State
  const [globalMarkup, setGlobalMarkup] = useState<number>(0);
  const [pricingSearchQuery, setPricingSearchQuery] = useState('');
  const [showEditPriceModal, setShowEditPriceModal] = useState(false);
  const [selectedServicePrice, setSelectedServicePrice] =
    useState<PricingProduct | null>(null);
  const [editPriceMode, setEditPriceMode] = useState<'override' | 'markup'>(
    'override',
  );
  const [editPriceValue, setEditPriceValue] = useState('');
  const [pricingProducts, setPricingProducts] = useState<PricingProduct[]>([]);
  const [isPricingLoading, setIsPricingLoading] = useState(false);
  const [pricingPage, setPricingPage] = useState(1);
  const [pricingLimit, setPricingLimit] = useState(50);
  const [pricingTotal, setPricingTotal] = useState(0);
  const [pricingTotalPages, setPricingTotalPages] = useState(0);
  const [debouncedPricingSearch, setDebouncedPricingSearch] = useState('');
  const [showLockedOnly, setShowLockedOnly] = useState(false);

  // Subscriptions State (from API)
  const [subscriptions, setSubscriptions] = useState<MembershipPlan[]>([]);
  const [isPlansLoading, setIsPlansLoading] = useState(false);
  const [showEditSubscriptionModal, setShowEditSubscriptionModal] =
    useState(false);
  const [showDeleteSubscriptionModal, setShowDeleteSubscriptionModal] =
    useState(false);
  const [selectedSubscription, setSelectedSubscription] =
    useState<MembershipPlan | null>(null);
  const [subscriptionFormData, setSubscriptionFormData] = useState({
    name: '',
    price: '',
    description: '',
    features: '',
    discount: 0,
    isActive: true,
    apiRateLimit: 60,
    activeNumberLimit: 25,
  });

  // API providers
  const [apiProviders, setApiProviders] = useState<SmsProvider[]>([]);
  const [isProvidersLoading, setIsProvidersLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);

  // Track sync status per provider for UI display
  const [syncStatusMap, setSyncStatusMap] = useState<
    Record<
      string,
      {
        status: 'syncing' | 'completed' | 'failed';
        message?: string;
        services?: number;
        countries?: number;
        products?: number;
        error?: string;
      }
    >
  >({});

  // Services & countries for provider details modal — uses classic
  // numbered pagination (Previous/Next/First/Last). Infinite scroll here
  // re-introduced typing lag once hundreds of rows accumulated.
  const [providerServices, setProviderServices] = useState<SmsService[]>([]);
  const [isServicesLoading, setIsServicesLoading] = useState(false);
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [debouncedServiceSearch, setDebouncedServiceSearch] = useState('');
  const [servicesPage, setServicesPage] = useState(1);
  const [servicesLimit, setServicesLimit] = useState(50);
  const [servicesTotalCount, setServicesTotalCount] = useState(0);
  const [servicesTotalPages, setServicesTotalPages] = useState(0);
  // Category filter for the per-provider services modal. Empty string = all.
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState('');
  const [selectedServiceForCountries, setSelectedServiceForCountries] =
    useState<SmsService | null>(null);
  const [serviceCountries, setServiceCountries] = useState<SmsProduct[]>([]);
  const [isCountriesLoading, setIsCountriesLoading] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');

  // Unified Services view (no duplicates across providers).
  // Paginated server-side: load 50 per page on scroll, server-side search.
  const [showUnifiedServicesModal, setShowUnifiedServicesModal] =
    useState(false);
  const [unifiedServices, setUnifiedServices] = useState<UnifiedService[]>([]);
  const [isUnifiedServicesLoading, setIsUnifiedServicesLoading] =
    useState(true);
  const [isLoadingMoreUnified, setIsLoadingMoreUnified] = useState(false);
  const [unifiedServiceSearchQuery, setUnifiedServiceSearchQuery] =
    useState('');
  const [debouncedUnifiedServiceSearch, setDebouncedUnifiedServiceSearch] =
    useState('');
  const [unifiedServicesPage, setUnifiedServicesPage] = useState(1);
  const [hasMoreUnifiedServices, setHasMoreUnifiedServices] = useState(false);
  const [unifiedServicesTotal, setUnifiedServicesTotal] = useState(0);
  const unifiedServicesRequestId = useRef(0);
  const unifiedLoadMoreSentinelRef = useRef<HTMLDivElement | null>(null);
  const UNIFIED_PAGE_SIZE = 50;
  const [selectedUnifiedService, setSelectedUnifiedService] =
    useState<UnifiedService | null>(null);
  const [unifiedServiceCountries, setUnifiedServiceCountries] = useState<
    UnifiedServiceCountry[]
  >([]);
  const [isUnifiedCountriesLoading, setIsUnifiedCountriesLoading] =
    useState(false);
  const [unifiedCountrySearchQuery, setUnifiedCountrySearchQuery] =
    useState('');

  // Icon Management (using unified services - no duplicates)
  const [showIconManagementModal, setShowIconManagementModal] = useState(false);
  const [servicesForIcons, setServicesForIcons] = useState<UnifiedService[]>(
    [],
  );
  // Default to true so the first render shows skeleton, not empty state.
  const [isIconServicesLoading, setIsIconServicesLoading] = useState(true);
  const [isLoadingMoreIcons, setIsLoadingMoreIcons] = useState(false);
  const [iconFilterMissing, setIconFilterMissing] = useState(false);
  const [iconSearchQuery, setIconSearchQuery] = useState('');
  const [debouncedIconSearch, setDebouncedIconSearch] = useState('');
  const [iconsPage, setIconsPage] = useState(1);
  const [hasMoreIcons, setHasMoreIcons] = useState(false);
  const [iconsTotal, setIconsTotal] = useState(0);
  const iconsRequestId = useRef(0);
  const iconLoadMoreSentinelRef = useRef<HTMLDivElement | null>(null);
  // Sync flag (ref, not state) — set true while a first-page fetch is in
  // flight. loadMoreIcons checks this synchronously to avoid the race
  // where the sentinel fires page-2-of-new-query and the response gets
  // appended to the stale page-1 still on screen.
  const isFetchingFirstPageRef = useRef(false);
  // Track the filter the displayed list was fetched with. If the next
  // first-page fetch uses a different filter, we clear the list
  // synchronously — the dataset is fundamentally different so blinking
  // through a skeleton is the right UX (the alternative is showing stale
  // missing-icon items at the top while new ones append below).
  const lastFetchedFilterRef = useRef<{ search: string; missingOnly: boolean }>(
    { search: '', missingOnly: false },
  );
  const ICONS_PAGE_SIZE = 50;
  const [editingIconService, setEditingIconService] =
    useState<UnifiedService | null>(null);
  const [iconUrlInput, setIconUrlInput] = useState('');
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);

  // VIP modal country selection
  const [vipCountries, setVipCountries] = useState<SmsCountry[]>([]);
  const [isVipCountriesLoading, setIsVipCountriesLoading] = useState(false);
  const [selectedVipCountryId, setSelectedVipCountryId] = useState<string>('');
  const [vipCountrySearch, setVipCountrySearch] = useState('');

  // VIP numbers from API (3 tiers by rating) - Legacy
  const [vipPremium, setVipPremium] = useState<VipNumber[]>([]);
  const [vipStandard, setVipStandard] = useState<VipNumber[]>([]);
  const [vipBasic, setVipBasic] = useState<VipNumber[]>([]);
  const [isVipLoading, setIsVipLoading] = useState(false);

  // Unified VIP (new - no duplicates)
  const [unifiedVipServices, setUnifiedVipServices] = useState<
    UnifiedVipService[]
  >([]);
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
      toast.error(
        error?.response?.data?.message || 'Failed to fetch VIP categories',
      );
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
      toast.error(
        error?.response?.data?.message || 'Failed to fetch VIP numbers',
      );
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
      toast.error(error?.response?.data?.message || 'Failed to toggle VIP');
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
      toast.error(
        error?.response?.data?.message || 'Failed to auto-populate VIP',
      );
    } finally {
      setIsAutoPopulating(false);
    }
  };

  const handleBulkLockProducts = async (lock: boolean) => {
    if (selectedProductIds.length === 0) {
      toast.error('Please select products to lock/unlock');
      return;
    }
    setIsBulkLocking(true);
    try {
      const result = await adminBulkLockProducts(selectedProductIds, lock);
      toast.success(
        `${result.updated} products ${lock ? 'locked' : 'unlocked'}`,
      );
      setSelectedProductIds([]);
      fetchPricingProducts(
        pricingPage,
        pricingLimit,
        debouncedPricingSearch,
        showLockedOnly,
      );
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to bulk update');
    } finally {
      setIsBulkLocking(false);
    }
  };

  // Fetch first page of unified services on modal open or search change.
  // Backend supports `search`, `page`, `limit`. Subsequent pages load on
  // scroll via loadMoreUnifiedServices.
  const fetchUnifiedServicesFirstPage = useCallback(async (search: string) => {
    const requestId = ++unifiedServicesRequestId.current;
    const isStale = () => requestId !== unifiedServicesRequestId.current;

    // Keep the existing list visible during refetch — replace atomically
    // when results arrive. Avoids the blink the user reported, while the
    // memoized rows keep typing fast even with hundreds of items loaded.
    setIsUnifiedServicesLoading(true);

    try {
      const response = await getUnifiedServices({
        limit: UNIFIED_PAGE_SIZE,
        page: 1,
        ...(search ? { search } : {}),
      });
      if (isStale()) return;
      setUnifiedServices(response.data || []);
      setUnifiedServicesPage(1);
      setHasMoreUnifiedServices(response.meta?.hasNextPage ?? false);
      setUnifiedServicesTotal(
        response.meta?.total ?? response.data?.length ?? 0,
      );
    } catch (error: any) {
      if (isStale()) return;
      toast.error(error?.response?.data?.message || 'Failed to fetch services');
      setUnifiedServices([]);
      setHasMoreUnifiedServices(false);
      setUnifiedServicesTotal(0);
    } finally {
      if (!isStale()) setIsUnifiedServicesLoading(false);
    }
  }, []);

  // Lazy-load the next page on scroll. Guarded by hasMore + already-loading.
  const loadMoreUnifiedServices = useCallback(async () => {
    if (
      !showUnifiedServicesModal ||
      !hasMoreUnifiedServices ||
      isLoadingMoreUnified
    ) {
      return;
    }
    const requestId = unifiedServicesRequestId.current;
    const isStale = () => requestId !== unifiedServicesRequestId.current;

    setIsLoadingMoreUnified(true);
    try {
      const nextPage = unifiedServicesPage + 1;
      const response = await getUnifiedServices({
        limit: UNIFIED_PAGE_SIZE,
        page: nextPage,
        ...(debouncedUnifiedServiceSearch
          ? { search: debouncedUnifiedServiceSearch }
          : {}),
      });
      if (isStale()) return;
      setUnifiedServices((prev) => [...prev, ...(response.data || [])]);
      setUnifiedServicesPage(nextPage);
      setHasMoreUnifiedServices(response.meta?.hasNextPage ?? false);
      if (response.meta?.total != null)
        setUnifiedServicesTotal(response.meta.total);
    } catch (error: any) {
      if (isStale()) return;
      toast.error(error?.response?.data?.message || 'Failed to load more');
      setHasMoreUnifiedServices(false);
    } finally {
      if (!isStale()) setIsLoadingMoreUnified(false);
    }
  }, [
    showUnifiedServicesModal,
    hasMoreUnifiedServices,
    isLoadingMoreUnified,
    unifiedServicesPage,
    debouncedUnifiedServiceSearch,
  ]);

  // Debounce search input — 300ms.
  // Rows are memoized (see UnifiedServiceRow above) so typing doesn't
  // re-render hundreds of items. The previous "clear list on keystroke"
  // workaround caused a jarring blink; now we keep the current list visible
  // and just show a thin spinner near the search box while the new query
  // is in flight.
  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedUnifiedServiceSearch(unifiedServiceSearchQuery.trim());
    }, 300);
    return () => clearTimeout(id);
  }, [unifiedServiceSearchQuery]);

  // Fire first-page fetch on modal open OR when search changes.
  useEffect(() => {
    if (!showUnifiedServicesModal) return;
    void fetchUnifiedServicesFirstPage(debouncedUnifiedServiceSearch);
  }, [
    showUnifiedServicesModal,
    debouncedUnifiedServiceSearch,
    fetchUnifiedServicesFirstPage,
  ]);

  // IntersectionObserver: trigger loadMore when sentinel scrolls into view.
  useEffect(() => {
    if (!showUnifiedServicesModal) return;
    const node = unifiedLoadMoreSentinelRef.current;
    if (!node || !hasMoreUnifiedServices) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMoreUnifiedServices();
      },
      { root: null, rootMargin: '100px', threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [
    showUnifiedServicesModal,
    hasMoreUnifiedServices,
    loadMoreUnifiedServices,
  ]);

  // useCallback so the reference is stable across renders, keeping the
  // memoized UnifiedServiceRow from re-rendering on every parent update.
  const handleViewUnifiedServiceCountries = useCallback(
    async (service: UnifiedService) => {
      setSelectedUnifiedService(service);
      setUnifiedServiceCountries([]);
      setUnifiedCountrySearchQuery('');
      setIsUnifiedCountriesLoading(true);
      try {
        let allCountries: UnifiedServiceCountry[] = [];
        let page = 1;
        const limit = 200;
        let hasMore = true;

        while (hasMore) {
          const response = await getCountriesForUnifiedService(service.name, {
            limit,
            page,
          });
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
        toast.error(
          error?.response?.data?.message || 'Failed to fetch countries',
        );
      } finally {
        setIsUnifiedCountriesLoading(false);
      }
    },
    [],
  );

  const handleOpenUnifiedServicesModal = () => {
    setShowUnifiedServicesModal(true);
    setSelectedUnifiedService(null);
    setUnifiedServiceCountries([]);
    setUnifiedServiceSearchQuery('');
    setDebouncedUnifiedServiceSearch('');
    setUnifiedServicesPage(1);
    // Fetch is triggered by the useEffect that watches showUnifiedServicesModal
    // + debouncedUnifiedServiceSearch — no manual call needed.
  };

  // Icon Management — server-paginated first page. Backend handles
  // search + missing-only filter so the UI doesn't burn cycles loading
  // 5000+ rows and filtering client-side.
  const fetchIconsFirstPage = useCallback(
    async (search: string, missingOnly: boolean) => {
      const requestId = ++iconsRequestId.current;
      const isStale = () => requestId !== iconsRequestId.current;

      // Sync gate — set true BEFORE the async fetch so any sentinel
      // intersection event that fires during this fetch is dropped.
      isFetchingFirstPageRef.current = true;
      // Stop the sentinel from being "intersecting" → also prevents
      // load-more from queuing fresh data into the stale list.
      setHasMoreIcons(false);

      // If the FILTER changed (missingOnly toggle), clear the list NOW so
      // there's no chance of stale rows lingering on screen during the
      // fetch. Search refetches keep the list visible (similar dataset).
      const filterChanged =
        lastFetchedFilterRef.current.missingOnly !== missingOnly;
      lastFetchedFilterRef.current = { search, missingOnly };
      if (filterChanged) {
        setServicesForIcons([]);
        setIconsTotal(0);
      }

      // Loading flag stays true while we refetch — list visible underneath
      // (no blink). Skeleton only shown when no items at all.
      setIsIconServicesLoading(true);

      try {
        const response = await getUnifiedServices({
          limit: ICONS_PAGE_SIZE,
          page: 1,
          ...(search ? { search } : {}),
          ...(missingOnly ? { missingIconOnly: true } : {}),
        } as any);
        if (isStale()) return;
        setServicesForIcons(response.data || []);
        setIconsPage(1);
        setHasMoreIcons(response.meta?.hasNextPage ?? false);
        setIconsTotal(response.meta?.total ?? response.data?.length ?? 0);
      } catch (error: any) {
        if (isStale()) return;
        toast.error(
          error?.response?.data?.message || 'Failed to fetch services',
        );
        setServicesForIcons([]);
        setHasMoreIcons(false);
        setIconsTotal(0);
      } finally {
        if (!isStale()) setIsIconServicesLoading(false);
        isFetchingFirstPageRef.current = false;
      }
    },
    [],
  );

  const loadMoreIcons = useCallback(async () => {
    if (
      !showIconManagementModal ||
      !hasMoreIcons ||
      isLoadingMoreIcons ||
      // Sync guard — drop sentinel events that fire while a first-page
      // fetch is in flight. Without this, page-2 of the new query gets
      // appended to the stale page-1 still on screen.
      isFetchingFirstPageRef.current
    )
      return;
    const requestId = iconsRequestId.current;
    const isStale = () => requestId !== iconsRequestId.current;

    setIsLoadingMoreIcons(true);
    try {
      const nextPage = iconsPage + 1;
      const response = await getUnifiedServices({
        limit: ICONS_PAGE_SIZE,
        page: nextPage,
        ...(debouncedIconSearch ? { search: debouncedIconSearch } : {}),
        ...(iconFilterMissing ? { missingIconOnly: true } : {}),
      } as any);
      if (isStale()) return;
      setServicesForIcons((prev) => [...prev, ...(response.data || [])]);
      setIconsPage(nextPage);
      setHasMoreIcons(response.meta?.hasNextPage ?? false);
      if (response.meta?.total != null) setIconsTotal(response.meta.total);
    } catch (error: any) {
      if (isStale()) return;
      toast.error(
        error?.response?.data?.message || 'Failed to load more services',
      );
      setHasMoreIcons(false);
    } finally {
      if (!isStale()) setIsLoadingMoreIcons(false);
    }
  }, [
    showIconManagementModal,
    hasMoreIcons,
    isLoadingMoreIcons,
    iconsPage,
    debouncedIconSearch,
    iconFilterMissing,
  ]);

  // Debounce search 300ms.
  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedIconSearch(iconSearchQuery.trim());
    }, 300);
    return () => clearTimeout(id);
  }, [iconSearchQuery]);

  // Fire first-page fetch when modal open OR search / filter changes.
  useEffect(() => {
    if (!showIconManagementModal) return;
    void fetchIconsFirstPage(debouncedIconSearch, iconFilterMissing);
  }, [
    showIconManagementModal,
    debouncedIconSearch,
    iconFilterMissing,
    fetchIconsFirstPage,
  ]);

  // IntersectionObserver — trigger loadMore when sentinel scrolls into view.
  useEffect(() => {
    if (!showIconManagementModal) return;
    const node = iconLoadMoreSentinelRef.current;
    if (!node || !hasMoreIcons) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMoreIcons();
      },
      { root: null, rootMargin: '100px', threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [showIconManagementModal, hasMoreIcons, loadMoreIcons]);

  // Back-compat helper used by other call sites (e.g. after upload).
  // Re-runs the first-page fetch with current search + filter.
  const fetchServicesForIcons = useCallback(
    (missingOnly: boolean = iconFilterMissing) => {
      void fetchIconsFirstPage(debouncedIconSearch, missingOnly);
    },
    [fetchIconsFirstPage, debouncedIconSearch, iconFilterMissing],
  );

  const handleOpenIconManagement = () => {
    setShowIconManagementModal(true);
    setIconFilterMissing(false);
    setIconSearchQuery('');
    setDebouncedIconSearch('');
    setEditingIconService(null);
    setIconUrlInput('');
    // Initial fetch handled by useEffect watching showIconManagementModal.
  };

  const handleIconFilterChange = (missingOnly: boolean) => {
    setIconFilterMissing(missingOnly);
    // Refetch handled by useEffect watching iconFilterMissing.
  };

  // Edit Icon panel ref retained for the now-modal version (kept harmless).
  const editIconPanelRef = useRef<HTMLDivElement | null>(null);

  // useCallback so memoized IconServiceRow can skip re-renders on
  // parent re-renders (search typing, scroll, etc).
  const handleEditIcon = useCallback((service: UnifiedService) => {
    setEditingIconService(service);
    setIconUrlInput(service.iconUrl || '');
  }, []);

  // Trigger the backend backfill.
  // - force=false: fills iconUrl=null rows only (preserves everything else)
  // - force=true: also re-resolves CDN-served icons (replaces broken
  //   simpleicons URLs etc); admin storage uploads are still preserved.
  const [isBackfillingIcons, setIsBackfillingIcons] = useState(false);
  const handleBackfillIcons = async (force = false) => {
    if (force) {
      if (
        !confirm(
          'Re-resolve ALL public CDN icons? This will replace existing simpleicons/favicons URLs with fresh ones. Admin manual uploads in our storage are NOT touched.',
        )
      )
        return;
    }
    setIsBackfillingIcons(true);
    try {
      const response = await apiClient.post<{
        message: string;
        scanned: number;
        backfilled: number;
        fromMetadata: number;
        fromCdn: number;
        skipped: number;
      }>(
        API_ENDPOINTS.ADMIN.SMS.SERVICES_BACKFILL_ICONS,
        force ? { force: true } : undefined,
      );
      toast.success(response.data.message);
      fetchServicesForIcons(iconFilterMissing);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to backfill icons');
    } finally {
      setIsBackfillingIcons(false);
    }
  };

  const handleSaveIcon = async () => {
    if (!editingIconService) return;
    setIsUploadingIcon(true);
    try {
      // Update icon for ALL providers that have this service (using bulk update)
      const updates = editingIconService.providers.map((p) => ({
        serviceId: p.serviceId,
        iconUrl: iconUrlInput || null,
      }));

      await apiClient.post(API_ENDPOINTS.ADMIN.SMS.SERVICES_BULK_UPDATE_ICONS, {
        updates,
      });
      toast.success(`Icon updated for ${updates.length} provider(s)`);
      setEditingIconService(null);
      setIconUrlInput('');
      fetchServicesForIcons(iconFilterMissing);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update icon');
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
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      const uploadedUrl = uploadResponse.data.url;

      // Update icon for ALL providers that have this service (using bulk update)
      const updates = editingIconService.providers.map((p) => ({
        serviceId: p.serviceId,
        iconUrl: uploadedUrl,
      }));

      await apiClient.post(API_ENDPOINTS.ADMIN.SMS.SERVICES_BULK_UPDATE_ICONS, {
        updates,
      });
      toast.success(
        `Icon uploaded and applied to ${updates.length} provider(s)`,
      );
      setEditingIconService(null);
      setIconUrlInput('');
      fetchServicesForIcons(iconFilterMissing);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to upload icon');
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
      toast.success('VIP number removed');
      fetchVipNumbers();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || 'Failed to remove VIP number',
      );
    }
  };

  const fetchProviders = useCallback(async () => {
    setIsProvidersLoading(true);
    try {
      const response = await adminGetProviders();
      setApiProviders(response.providers);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || 'Failed to fetch providers',
      );
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

  // Fetch services when pagination/search/category changes.
  useEffect(() => {
    if (selectedProvider && showProviderModal) {
      void fetchProviderServices(
        selectedProvider.id,
        servicesPage,
        servicesLimit,
        debouncedServiceSearch,
        serviceCategoryFilter,
      );
    }
  }, [
    selectedProvider,
    showProviderModal,
    servicesPage,
    servicesLimit,
    debouncedServiceSearch,
    serviceCategoryFilter,
  ]);

  // Reset to page 1 when search or category changes.
  useEffect(() => {
    setServicesPage(1);
  }, [debouncedServiceSearch, serviceCategoryFilter]);

  // Map API providers to local Provider type for backward compat with other tabs
  const providers: Provider[] = apiProviders.map((p) => ({
    id: p.id,
    name: p.displayName || p.name,
    version: (p as any).version || 'V1_STANDARD',
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
    { id: 'v1', name: 'V1 - Premium', services: [] },
    { id: 'v2', name: 'V2 - Standard', services: [] },
    { id: 'v3', name: 'V3 - Basic', services: [] },
  ];

  const [providerFormData, setProviderFormData] = useState({
    name: '',
    version: 'V1_STANDARD',
    priority: 100,
    markup: 0,
    isActive: true,
  });

  const handleEditProvider = (provider: Provider) => {
    setSelectedProvider(provider);
    setProviderFormData({
      name: provider.name,
      version: provider.version || 'V1_STANDARD',
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
    setServiceSearchQuery('');
    setDebouncedServiceSearch('');
    setCountrySearchQuery('');
    setServicesPage(1);
    setServicesLimit(50);
    setServicesTotalCount(0);
    setServicesTotalPages(0);
  };

  // Classic page-based fetch — restored after infinite-scroll variant
  // caused typing lag once many pages accumulated.
  const fetchProviderServices = async (
    providerId: string,
    page: number,
    limit: number,
    search: string,
    category?: string,
  ) => {
    setIsServicesLoading(true);
    try {
      const response = await getServices({
        providerId,
        page,
        limit,
        search: search || undefined,
        category: category || undefined,
      });
      setProviderServices(response.data || []);
      setServicesTotalCount(response.meta?.total || 0);
      setServicesTotalPages(response.meta?.totalPages || 0);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to fetch services');
    } finally {
      setIsServicesLoading(false);
    }
  };

  const handleViewServiceCountries = async (service: SmsService) => {
    if (!selectedProvider) return;
    setSelectedServiceForCountries(service);
    setServiceCountries([]);
    setCountrySearchQuery('');
    setIsCountriesLoading(true);
    try {
      const response = await getProductsRealtime(
        selectedProvider.id,
        service.id,
      );
      setServiceCountries(response.data || []);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || 'Failed to fetch countries',
      );
    } finally {
      setIsCountriesLoading(false);
    }
  };

  // Toggle service active status. Optimistically update the row, revert on error.
  const handleToggleServiceActive = async (service: SmsService) => {
    const next = !(service.isActive !== false);
    setProviderServices((prev) =>
      prev.map((s) => (s.id === service.id ? { ...s, isActive: next } : s)),
    );
    try {
      await adminUpdateService(service.id, { isActive: next });
      toast.success(`${service.name} ${next ? 'activated' : 'deactivated'}`);
    } catch (error: any) {
      // Revert on failure
      setProviderServices((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, isActive: !next } : s)),
      );
      toast.error(
        error?.response?.data?.message || 'Failed to update service status',
      );
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
      toast.success('Provider updated successfully!');
      setShowEditProviderModal(false);
      setSelectedProvider(null);
      fetchProviders();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || 'Failed to update provider',
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Clear sync status for a provider after a delay
  const clearSyncStatus = (providerId: string, delayMs = 10000) => {
    setTimeout(() => {
      setSyncStatusMap((prev) => {
        const updated = { ...prev };
        delete updated[providerId];
        return updated;
      });
    }, delayMs);
  };

  // Sync provider with background polling
  const handleSyncProvider = async (providerId: string) => {
    setIsSyncing(providerId);
    setSyncStatusMap((prev) => ({
      ...prev,
      [providerId]: { status: 'syncing', message: 'Sync in progress...' },
    }));

    try {
      // Start the sync (returns immediately)
      const startResult = await adminSyncProvider(providerId);

      if (startResult.status === 'syncing') {
        toast.info('Sync started! Waiting for completion...', {
          duration: 3000,
        });

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
              setSyncStatusMap((prev) => ({
                ...prev,
                [providerId]: {
                  status: 'completed',
                  message: successMsg,
                  services: status.services,
                  countries: status.countries,
                  products: status.products,
                },
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
                setSyncStatusMap((prev) => ({
                  ...prev,
                  [providerId]: {
                    status: 'completed',
                    message: successMsg,
                  },
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
                toast.info('Sync status unknown. Refreshing data...');
                fetchProviders();
                setIsSyncing(null);
                return;
              }
            } else if (status.status === 'failed') {
              const errorMsg = status.error || 'Unknown error';
              toast.error(`Sync failed: ${errorMsg}`, { duration: 8000 });
              setSyncStatusMap((prev) => ({
                ...prev,
                [providerId]: {
                  status: 'failed',
                  error: errorMsg,
                },
              }));
              setIsSyncing(null);
              clearSyncStatus(providerId, 30000); // Keep error visible for 30s
              return;
            } else if (status.status === 'syncing' && attempts < maxAttempts) {
              // Still syncing, update progress message
              setSyncStatusMap((prev) => ({
                ...prev,
                [providerId]: {
                  status: 'syncing',
                  message: `Syncing... (${attempts * 5}s elapsed)`,
                },
              }));
              // Poll again after 5 seconds
              setTimeout(pollStatus, 5000);
            } else {
              // Max attempts reached
              toast.info(
                'Sync is still running. Check back later or refresh the page.',
              );
              setSyncStatusMap((prev) => ({
                ...prev,
                [providerId]: {
                  status: 'syncing',
                  message:
                    'Sync taking longer than expected. Refresh page to check status.',
                },
              }));
              setIsSyncing(null);
            }
          } catch (pollError) {
            console.error('Error polling sync status:', pollError);
            if (attempts < maxAttempts) {
              setTimeout(pollStatus, 5000);
            } else {
              toast.error(
                'Could not get sync status. The sync may still be running.',
              );
              setSyncStatusMap((prev) => ({
                ...prev,
                [providerId]: {
                  status: 'failed',
                  error: 'Could not get sync status',
                },
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
        setSyncStatusMap((prev) => ({
          ...prev,
          [providerId]: {
            status: 'completed',
            message: startResult.message,
          },
        }));
        fetchProviders();
        setIsSyncing(null);
        clearSyncStatus(providerId, 15000);
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to start sync';
      toast.error(message, { duration: 8000 });
      setSyncStatusMap((prev) => ({
        ...prev,
        [providerId]: {
          status: 'failed',
          error: message,
        },
      }));
      setIsSyncing(null);
      clearSyncStatus(providerId, 30000);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedProvider) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.success('Provider deleted successfully!');

    setIsLoading(false);
    setShowDeleteModal(false);
    setSelectedProvider(null);
  };

  const handleSelectService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId],
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
    setSelectedVipCountryId('');
    setVipCountrySearch('');
    setIsVipCountriesLoading(true);
    try {
      let allCountries: SmsCountry[] = [];
      let page = 1;
      const limit = 200;
      let hasMore = true;

      while (hasMore) {
        const response = await getCountries({
          providerId: selectedProvider.id,
          limit,
          page,
        });
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
      toast.error(
        error?.response?.data?.message || 'Failed to fetch countries',
      );
    } finally {
      setIsVipCountriesLoading(false);
    }
  };

  // Per client decision: provider is already in context, and VIP entries are
  // created for ALL countries the provider supports — no manual picker.
  const handleAddToVIP = async () => {
    if (selectedServices.length === 0) {
      toast.error('Please select at least one service');
      return;
    }
    if (!selectedProvider) return;

    setIsLoading(true);
    try {
      const result = await adminBulkAddVipAllCountries(
        selectedServices,
        selectedProvider.id,
      );

      if (result.added > 0) {
        toast.success(
          `${result.added} VIP entr${result.added === 1 ? 'y' : 'ies'} added across ${result.countryCount} countries`,
        );
      } else if (result.countryCount === 0) {
        toast.warning('Provider has no active countries');
      } else {
        toast.info('All combinations already exist as VIP');
      }
      if (result.skipped > 0) {
        toast.warning(`${result.skipped} duplicate(s) skipped`);
      }
      if (result.invalid > 0) {
        toast.error(`${result.invalid} invalid service(s)`);
      }

      fetchVipNumbers();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || 'Failed to add VIP services',
      );
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
  const fetchPricingProducts = useCallback(
    async (page = 1, limit = 50, search = '', lockedOnly = false) => {
      setIsPricingLoading(true);
      try {
        const params: Record<string, any> = { page, limit };
        if (search) params.search = search;
        if (lockedOnly) params.isPriceLocked = true;
        const response = await apiClient.get<{
          data: PricingProduct[];
          meta: { total: number; totalPages: number };
        }>(API_ENDPOINTS.ADMIN.SMS.PRICING_PRODUCTS, { params });
        setPricingProducts(response.data.data || []);
        setPricingTotal(response.data.meta?.total || 0);
        setPricingTotalPages(response.data.meta?.totalPages || 0);
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || 'Failed to fetch products',
        );
      } finally {
        setIsPricingLoading(false);
      }
    },
    [],
  );

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
      fetchPricingProducts(
        pricingPage,
        pricingLimit,
        debouncedPricingSearch,
        showLockedOnly,
      );
    }
  }, [
    activeTab,
    pricingPage,
    pricingLimit,
    debouncedPricingSearch,
    showLockedOnly,
    fetchPricingProducts,
  ]);

  // Initial load for pricing tab
  useEffect(() => {
    if (activeTab === 'pricing') {
      fetchGlobalMarkup();
      setPricingPage(1);
      setPricingSearchQuery('');
      setDebouncedPricingSearch('');
    }
  }, [activeTab, fetchGlobalMarkup]);

  const handleApplyGlobalMarkup = async () => {
    setIsLoading(true);
    try {
      await apiClient.put(API_ENDPOINTS.ADMIN.SMS.PRICING_GLOBAL_MARKUP, {
        markup: globalMarkup,
      });
      toast.success(`Global markup of ${globalMarkup}% applied!`);
      fetchPricingProducts(
        pricingPage,
        pricingLimit,
        debouncedPricingSearch,
        showLockedOnly,
      );
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to apply markup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditServicePrice = (product: PricingProduct) => {
    setSelectedServicePrice(product);
    setEditPriceMode(product.priceOverride ? 'override' : 'markup');
    setEditPriceValue(
      product.priceOverride || product.productMarkup.toString(),
    );
    setShowEditPriceModal(true);
  };

  const handleSaveServicePrice = async () => {
    if (!selectedServicePrice) return;
    setIsLoading(true);
    try {
      const body =
        editPriceMode === 'override'
          ? {
              priceOverride: editPriceValue ? parseFloat(editPriceValue) : null,
              isPriceLocked: selectedServicePrice.isPriceLocked,
            }
          : {
              markup: parseFloat(editPriceValue) || 0,
              isPriceLocked: selectedServicePrice.isPriceLocked,
            };

      await apiClient.patch(
        API_ENDPOINTS.ADMIN.SMS.PRICING_PRODUCT_DETAIL(selectedServicePrice.id),
        body,
      );
      toast.success('Product price updated!');
      setShowEditPriceModal(false);
      setSelectedServicePrice(null);
      fetchPricingProducts(
        pricingPage,
        pricingLimit,
        debouncedPricingSearch,
        showLockedOnly,
      );
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update price');
    } finally {
      setIsLoading(false);
    }
  };

  // Subscription Functions
  const fetchPlans = useCallback(async () => {
    setIsPlansLoading(true);
    try {
      const response = await apiClient.get<
        MembershipPlan[] | { plans: MembershipPlan[] }
      >(API_ENDPOINTS.ADMIN.MEMBERSHIP.PLANS);
      const plans = Array.isArray(response.data)
        ? response.data
        : (response.data as any).plans || [];
      setSubscriptions(plans);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to fetch plans');
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
      description: plan.description || '',
      features: plan.features.join('\n'),
      discount: plan.discount,
      isActive: plan.isActive,
      apiRateLimit: plan.apiRateLimit ?? 60,
      activeNumberLimit: plan.activeNumberLimit ?? 25,
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
          features: subscriptionFormData.features
            .split('\n')
            .filter((f: string) => f.trim()),
          discount: subscriptionFormData.discount,
          isActive: subscriptionFormData.isActive,
          apiRateLimit: subscriptionFormData.apiRateLimit,
          activeNumberLimit: subscriptionFormData.activeNumberLimit,
        },
      );
      toast.success('Plan updated successfully!');
      setShowEditSubscriptionModal(false);
      setSelectedSubscription(null);
      fetchPlans();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update plan');
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
      toast.success('Plan deleted successfully!');
      setShowDeleteSubscriptionModal(false);
      setSelectedSubscription(null);
      fetchPlans();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete plan');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProviders = providers.filter(
    (provider) =>
      provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.version.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-semibold text-white">
          SMS Services Management
        </h1>
        <p className="text-sm text-[#94A3B8]">
          Manage SMS providers, services, VIP categories, pricing, and
          subscriptions
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('providers')}
          className={`rounded-lg px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
            activeTab === 'providers'
              ? 'bg-[#3B82F6] text-white'
              : 'bg-[rgba(255,255,255,0.05)] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.08)]'
          }`}
        >
          Providers Management
        </button>
        <button
          onClick={() => setActiveTab('vip')}
          className={`flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
            activeTab === 'vip'
              ? 'bg-[#3B82F6] text-white'
              : 'bg-[rgba(255,255,255,0.05)] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.08)]'
          }`}
        >
          <Star className="h-4 w-4" />
          VIP Categories
        </button>
        <button
          onClick={() => setActiveTab('pricing')}
          className={`flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
            activeTab === 'pricing'
              ? 'bg-[#3B82F6] text-white'
              : 'bg-[rgba(255,255,255,0.05)] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.08)]'
          }`}
        >
          <DollarSign className="h-4 w-4" />
          Service Pricing
        </button>
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
            activeTab === 'subscriptions'
              ? 'bg-[#3B82F6] text-white'
              : 'bg-[rgba(255,255,255,0.05)] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.08)]'
          }`}
        >
          <Crown className="h-4 w-4" />
          Subscriptions
        </button>
      </div>

      {/* Providers Tab */}
      {activeTab === 'providers' && (
        <div className="space-y-6">
          {/* Search Bar + Actions */}
          <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-6 backdrop-blur-xl">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[250px] flex-1">
                <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform text-[#64748B]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search providers..."
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] py-3 pr-4 pl-12 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                />
              </div>
              <button
                onClick={handleOpenUnifiedServicesModal}
                className="flex items-center gap-2 rounded-lg bg-[#3B82F6] px-4 py-3 text-sm font-medium whitespace-nowrap text-white transition-colors hover:bg-[#2563EB]"
              >
                <Globe className="h-4 w-4" />
                All Services
              </button>
              <button
                onClick={handleOpenIconManagement}
                className="flex items-center gap-2 rounded-lg bg-[#8B5CF6] px-4 py-3 text-sm font-medium whitespace-nowrap text-white transition-colors hover:bg-[#7C3AED]"
              >
                <Edit2 className="h-4 w-4" />
                Manage Icons
              </button>
            </div>
          </div>

          {/* Providers Grid */}
          {isProvidersLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
              <span className="ml-3 text-[#94A3B8]">Loading providers...</span>
            </div>
          ) : apiProviders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Globe className="mb-4 h-12 w-12 text-[#64748B]" />
              <p className="text-lg font-medium text-white">
                No providers found
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {apiProviders
                .filter(
                  (p) =>
                    p.displayName
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.slug.toLowerCase().includes(searchQuery.toLowerCase()),
                )
                .map((provider) => (
                  <div
                    key={provider.id}
                    className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-6 backdrop-blur-xl transition-all hover:border-[rgba(59,130,246,0.5)]"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-white">
                            {provider.displayName || provider.name}
                          </h3>
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${provider.isActive ? 'bg-[#22C55E]' : 'bg-[#64748B]'}`}
                            title={provider.isActive ? 'Active' : 'Inactive'}
                          />
                        </div>
                        <span className="inline-block rounded-full bg-[#3B82F6]/20 px-3 py-1 text-xs font-medium text-[#3B82F6]">
                          {provider.slug}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            const mapped = providers.find(
                              (p) => p.id === provider.id,
                            );
                            if (mapped) handleEditProvider(mapped);
                          }}
                          className="rounded-lg p-2 text-[#3B82F6] transition-colors hover:bg-[rgba(59,130,246,0.2)]"
                          title="Edit Provider"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleSyncProvider(provider.id)}
                          disabled={isSyncing === provider.id}
                          className="rounded-lg p-2 text-[#22C55E] transition-colors hover:bg-[rgba(34,197,94,0.2)] disabled:opacity-50"
                          title="Sync Catalog (Services & Countries)"
                        >
                          <RefreshCw
                            className={`h-4 w-4 ${isSyncing === provider.id ? 'animate-spin' : ''}`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Sync Status Banner */}
                    {syncStatusMap[provider.id] && (
                      <div
                        className={`mb-4 rounded-lg border p-3 ${
                          syncStatusMap[provider.id].status === 'syncing'
                            ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                            : syncStatusMap[provider.id].status === 'completed'
                              ? 'border-green-500/30 bg-green-500/10 text-green-400'
                              : 'border-red-500/30 bg-red-500/10 text-red-400'
                        }`}
                      >
                        <div className="flex items-center gap-2 text-sm font-medium">
                          {syncStatusMap[provider.id].status === 'syncing' && (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              <span>{syncStatusMap[provider.id].message}</span>
                            </>
                          )}
                          {syncStatusMap[provider.id].status ===
                            'completed' && (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              <span>Sync Completed!</span>
                            </>
                          )}
                          {syncStatusMap[provider.id].status === 'failed' && (
                            <>
                              <XCircle className="h-4 w-4" />
                              <span>Sync Failed</span>
                            </>
                          )}
                        </div>
                        {syncStatusMap[provider.id].status === 'completed' &&
                          syncStatusMap[provider.id].services != null && (
                            <div className="mt-1 text-xs opacity-80">
                              {syncStatusMap[provider.id].services} services,{' '}
                              {syncStatusMap[provider.id].countries} countries,{' '}
                              {syncStatusMap[provider.id].products} products
                            </div>
                          )}
                        {syncStatusMap[provider.id].status === 'failed' &&
                          syncStatusMap[provider.id].error && (
                            <div className="mt-1 text-xs break-words opacity-80">
                              {syncStatusMap[provider.id].error}
                            </div>
                          )}
                      </div>
                    )}

                    <div className="mb-4 space-y-3">
                      {provider.balance && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-sm text-[#64748B]">
                            <DollarSign className="h-4 w-4" />
                            Balance
                          </span>
                          <span className="text-sm font-medium text-white">
                            ${provider.balance}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#64748B]">Priority</span>
                        <span className="text-sm font-medium text-white">
                          {provider.priority}
                        </span>
                      </div>
                      {provider.markup != null && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-sm text-[#64748B]">
                            <Percent className="h-4 w-4" />
                            Markup
                          </span>
                          <span className="text-sm font-medium text-[#F59E0B]">
                            {provider.markup}%
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#64748B]">
                          Supports Rental
                        </span>
                        <span
                          className={`text-sm font-medium ${provider.supportsRental ? 'text-[#22C55E]' : 'text-[#64748B]'}`}
                        >
                          {provider.supportsRental ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#64748B]">Status</span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${provider.isActive ? 'bg-[#22C55E]/20 text-[#22C55E]' : 'bg-[#64748B]/20 text-[#64748B]'}`}
                        >
                          {provider.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {provider.lastSyncAt && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#64748B]">
                            Last Sync
                          </span>
                          <span className="text-xs text-[#94A3B8]">
                            {new Date(provider.lastSyncAt).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const mapped = providers.find(
                            (p) => p.id === provider.id,
                          );
                          if (mapped) handleViewProvider(mapped);
                        }}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#3B82F6] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2563EB]"
                      >
                        View Details
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* VIP Categories Tab */}
      {activeTab === 'vip' && (
        <div className="space-y-6">
          {/* VIP Controls */}
          <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="mb-1 text-lg font-semibold text-white">
                  VIP Categories
                </h3>
                <p className="text-sm text-[#94A3B8]">
                  Unified view - each service appears once with all available
                  providers
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Toggle VIP On/Off */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#94A3B8]">
                    VIP {isVipEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                  <button
                    onClick={handleToggleVip}
                    disabled={isTogglingVip}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isVipEnabled
                        ? 'bg-[#22C55E]'
                        : 'bg-[rgba(255,255,255,0.18)]'
                    }`}
                  >
                    {isTogglingVip ? (
                      <Loader2 className="mx-auto h-4 w-4 animate-spin text-white" />
                    ) : (
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isVipEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    )}
                  </button>
                </div>
                {/* Auto-populate from usage */}
                <button
                  onClick={handleAutoPopulateVip}
                  disabled={isAutoPopulating}
                  className="flex items-center gap-2 rounded-lg bg-[#F59E0B] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#D97706] disabled:opacity-50"
                >
                  {isAutoPopulating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <TrendingUp className="h-4 w-4" />
                  )}
                  Auto-Populate from Usage
                </button>
                <button
                  onClick={fetchUnifiedVip}
                  disabled={isVipLoading}
                  className="rounded-lg bg-[rgba(255,255,255,0.05)] p-2 text-[#94A3B8] transition-colors hover:bg-[rgba(255,255,255,0.1)]"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isVipLoading ? 'animate-spin' : ''}`}
                  />
                </button>
              </div>
            </div>
          </div>

          {isVipLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
              <span className="ml-3 text-[#94A3B8]">
                Loading VIP categories...
              </span>
            </div>
          ) : !isVipEnabled ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Star className="mb-4 h-12 w-12 text-[#64748B]" />
              <p className="text-lg font-medium text-white">
                VIP Categories Disabled
              </p>
              <p className="mt-1 text-sm text-[#94A3B8]">
                Enable VIP to show premium services to users
              </p>
            </div>
          ) : unifiedVipServices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Star className="mb-4 h-12 w-12 text-[#64748B]" />
              <p className="text-lg font-medium text-white">No VIP Services</p>
              <p className="mt-1 text-sm text-[#94A3B8]">
                Add services from providers or use auto-populate
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {unifiedVipServices.map((service) => (
                <div
                  key={service.slug}
                  className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-6 backdrop-blur-xl"
                >
                  <div className="mb-4 flex items-center gap-4">
                    {service.iconUrl ? (
                      <img
                        src={service.iconUrl}
                        alt={service.name}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[rgba(255,255,255,0.1)]">
                        <Star className="h-5 w-5 text-[#F59E0B]" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-lg font-semibold text-white">
                        {service.name}
                      </h4>
                      <p className="text-sm text-[#94A3B8]">
                        {service.category} • {service.countryCount} countries
                      </p>
                    </div>
                  </div>

                  {/* Countries accordion */}
                  <div className="space-y-2">
                    {service.countries.map((country) => (
                      <div
                        key={country.id}
                        className="rounded-lg border border-[rgba(255,255,255,0.05)] bg-[rgba(0,0,0,0.2)] p-4"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {country.iconUrl && (
                              <img
                                src={country.iconUrl}
                                alt={country.name}
                                className="h-5 w-5 rounded"
                              />
                            )}
                            <span className="text-sm font-medium text-white">
                              {country.name}
                            </span>
                            <span className="text-xs text-[#64748B]">
                              ({country.code})
                            </span>
                          </div>
                          <span className="rounded-full bg-[#F59E0B]/20 px-2 py-1 text-xs font-medium text-[#F59E0B]">
                            Best Rating: {country.bestRating}/5
                          </span>
                        </div>
                        {/* Providers for this country */}
                        <div className="mt-2 flex flex-wrap gap-2">
                          {country.providers.map((provider) => (
                            <div
                              key={provider.vipId}
                              className="flex items-center gap-2 rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-1.5"
                            >
                              <span className="text-xs text-[#94A3B8]">
                                {provider.providerName}
                              </span>
                              <span className="text-xs font-medium text-[#3B82F6]">
                                {provider.rating}/5
                              </span>
                              <span className="text-xs text-[#64748B]">
                                ({provider.orderCount} orders)
                              </span>
                              <button
                                onClick={() => handleRemoveVip(provider.vipId)}
                                className="rounded p-1 text-[#EF4444] transition-colors hover:bg-[rgba(239,68,68,0.2)]"
                                title="Remove"
                              >
                                <X className="h-3 w-3" />
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
      {activeTab === 'pricing' && (
        <div className="space-y-6">
          {/* Global Markup Control */}
          <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-6 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <Percent className="h-6 w-6 text-[#F59E0B]" />
              <h3 className="text-lg font-semibold text-white">
                Global Markup Control
              </h3>
            </div>
            <p className="mb-6 text-sm text-[#94A3B8]">
              Apply a percentage markup to all service prices. Positive values
              increase prices, negative values decrease.
            </p>

            <div className="flex items-center gap-4">
              <div className="max-w-md flex-1">
                <label className="mb-2 block text-sm font-medium text-white">
                  Markup Percentage (%)
                </label>
                <input
                  type="number"
                  value={globalMarkup}
                  onChange={(e) =>
                    setGlobalMarkup(parseFloat(e.target.value) || 0)
                  }
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                  placeholder="Enter markup percentage"
                  step="0.1"
                />
                <p className="mt-2 text-xs text-[#64748B]">
                  Example: 10% markup on $2.00 = $
                  {(2 * (1 + globalMarkup / 100)).toFixed(2)}
                </p>
              </div>
              <button
                onClick={handleApplyGlobalMarkup}
                disabled={isLoading}
                className="mt-6 flex items-center gap-2 rounded-lg bg-[#F59E0B] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#D97706] disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Percent className="h-4 w-4" />
                )}
                Apply Global Markup
              </button>
            </div>

            {globalMarkup !== 0 && (
              <div className="mt-4 rounded-lg border border-[rgba(245,158,11,0.3)] bg-[rgba(245,158,11,0.1)] p-4">
                <p className="text-sm text-[#F59E0B]">
                  <strong>Active Markup:</strong> {globalMarkup > 0 ? '+' : ''}
                  {globalMarkup}% will be applied to all base prices
                </p>
              </div>
            )}
          </div>

          {/* Search Bar + Lock Filter + Bulk Actions */}
          <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-6 backdrop-blur-xl">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[250px] flex-1">
                <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform text-[#64748B]" />
                <input
                  type="text"
                  value={pricingSearchQuery}
                  onChange={(e) => {
                    setPricingSearchQuery(e.target.value);
                    setPricingPage(1);
                  }}
                  placeholder="Search services by name, country, or provider..."
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] py-3 pr-4 pl-12 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                />
                {isPricingLoading && (
                  <Loader2 className="absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 animate-spin text-[#3B82F6]" />
                )}
              </div>

              {/* Per page dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-sm whitespace-nowrap text-[#94A3B8]">
                  Per page:
                </span>
                <select
                  value={pricingLimit}
                  onChange={(e) => {
                    setPricingLimit(Number(e.target.value));
                    setPricingPage(1);
                  }}
                  className="cursor-pointer rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#1E293B] px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none [&>option]:bg-[#1E293B] [&>option]:text-white"
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
                className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium whitespace-nowrap transition-all ${
                  showLockedOnly
                    ? 'bg-[#3B82F6] text-white'
                    : 'border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.05)] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.08)]'
                }`}
              >
                <Lock className="h-4 w-4" />
                Locked Only
              </button>

              {/* Bulk Lock/Unlock Actions */}
              {selectedProductIds.length > 0 && (
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-sm text-[#94A3B8]">
                    {selectedProductIds.length} selected
                  </span>
                  <button
                    onClick={() => handleBulkLockProducts(true)}
                    disabled={isBulkLocking}
                    className="flex items-center gap-2 rounded-lg bg-[#F59E0B] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#D97706] disabled:opacity-50"
                  >
                    {isBulkLocking ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Lock className="h-4 w-4" />
                    )}
                    Lock Selected
                  </button>
                  <button
                    onClick={() => handleBulkLockProducts(false)}
                    disabled={isBulkLocking}
                    className="flex items-center gap-2 rounded-lg bg-[rgba(255,255,255,0.1)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.15)] disabled:opacity-50"
                  >
                    Unlock Selected
                  </button>
                  <button
                    onClick={() => setSelectedProductIds([])}
                    className="rounded-lg p-2 text-[#94A3B8] transition-colors hover:bg-[rgba(255,255,255,0.1)]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Service Prices Table */}
          <div className="overflow-hidden rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] backdrop-blur-xl">
            <div className="border-b border-[rgba(255,255,255,0.1)] p-6">
              <h3 className="text-lg font-semibold text-white">
                Service Pricing
              </h3>
              <p className="mt-1 text-sm text-[#94A3B8]">
                {pricingTotal} products • Click Edit to modify individual prices
              </p>
            </div>

            {isPricingLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-[#3B82F6]" />
                <span className="ml-3 text-sm text-[#94A3B8]">
                  Loading products...
                </span>
              </div>
            ) : pricingProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(255,255,255,0.05)]">
                  <DollarSign className="h-8 w-8 text-[#64748B]" />
                </div>
                <p className="text-lg font-medium text-white">
                  No products found
                </p>
                <p className="mt-1 text-sm text-[#94A3B8]">
                  Sync providers first or adjust your search
                </p>
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
                            checked={
                              selectedProductIds.length ===
                                pricingProducts.length &&
                              pricingProducts.length > 0
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedProductIds(
                                  pricingProducts.map((p) => p.id),
                                );
                              } else {
                                setSelectedProductIds([]);
                              }
                            }}
                            className="h-4 w-4 rounded border-[rgba(255,255,255,0.3)] bg-[rgba(0,0,0,0.4)] checked:bg-[#3B82F6]"
                          />
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-medium text-[#94A3B8] uppercase">
                          Service
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-medium text-[#94A3B8] uppercase">
                          Country
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-medium text-[#94A3B8] uppercase">
                          Provider
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-medium text-[#94A3B8] uppercase">
                          Base Price
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-medium text-[#94A3B8] uppercase">
                          Markup
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-medium text-[#94A3B8] uppercase">
                          Final Price
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-medium text-[#94A3B8] uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                      {pricingProducts.map((product) => (
                        <tr
                          key={product.id}
                          className={`transition-colors hover:bg-[rgba(255,255,255,0.02)] ${
                            selectedProductIds.includes(product.id)
                              ? 'bg-[rgba(59,130,246,0.05)]'
                              : ''
                          }`}
                        >
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              checked={selectedProductIds.includes(product.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedProductIds([
                                    ...selectedProductIds,
                                    product.id,
                                  ]);
                                } else {
                                  setSelectedProductIds(
                                    selectedProductIds.filter(
                                      (id) => id !== product.id,
                                    ),
                                  );
                                }
                              }}
                              className="h-4 w-4 rounded border-[rgba(255,255,255,0.3)] bg-[rgba(0,0,0,0.4)] checked:bg-[#3B82F6]"
                            />
                          </td>
                          <td className="px-4 py-4 text-sm font-medium text-white">
                            <span className="flex items-center gap-2">
                              {product.service.name}
                              {product.isPriceLocked && (
                                <Lock className="h-3 w-3 text-[#F59E0B]" />
                              )}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-[#94A3B8]">
                            {product.country.name}
                          </td>
                          <td className="px-4 py-4 text-sm text-[#94A3B8]">
                            {product.provider.name}
                          </td>
                          <td className="px-4 py-4 text-sm text-white">
                            ${product.basePrice}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-col gap-0.5">
                              {product.productMarkup !== 0 && (
                                <span className="text-xs text-[#3B82F6]">
                                  Product: +{product.productMarkup}%
                                </span>
                              )}
                              {product.globalMarkup !== 0 && (
                                <span className="text-xs text-[#F59E0B]">
                                  Global: +{product.globalMarkup}%
                                </span>
                              )}
                              {product.priceOverride && (
                                <span className="text-xs text-[#8B5CF6]">
                                  Override: ${product.priceOverride}
                                </span>
                              )}
                              {product.productMarkup === 0 &&
                                product.globalMarkup === 0 &&
                                !product.priceOverride && (
                                  <span className="text-xs text-[#64748B]">
                                    None
                                  </span>
                                )}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm font-semibold text-white">
                            ${product.finalPrice}
                          </td>
                          <td className="px-4 py-4">
                            <button
                              onClick={() => handleEditServicePrice(product)}
                              className="flex items-center gap-1 rounded-lg bg-[#3B82F6] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#2563EB]"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
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
                  <div className="flex items-center justify-between border-t border-[rgba(255,255,255,0.1)] px-6 py-4">
                    <div className="text-sm text-[#94A3B8]">
                      Showing {(pricingPage - 1) * pricingLimit + 1}-
                      {Math.min(pricingPage * pricingLimit, pricingTotal)} of{' '}
                      {pricingTotal}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPricingPage(1)}
                        disabled={pricingPage === 1 || isPricingLoading}
                        className="rounded-lg bg-[rgba(255,255,255,0.05)] px-3 py-1.5 text-sm font-medium text-[#94A3B8] transition-colors hover:bg-[rgba(255,255,255,0.1)] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        First
                      </button>
                      <button
                        onClick={() =>
                          setPricingPage((p) => Math.max(1, p - 1))
                        }
                        disabled={pricingPage === 1 || isPricingLoading}
                        className="rounded-lg bg-[rgba(255,255,255,0.05)] px-3 py-1.5 text-sm font-medium text-[#94A3B8] transition-colors hover:bg-[rgba(255,255,255,0.1)] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from(
                          { length: Math.min(5, pricingTotalPages) },
                          (_, i) => {
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
                                className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
                                  pricingPage === pageNum
                                    ? 'bg-[#3B82F6] text-white'
                                    : 'bg-[rgba(255,255,255,0.05)] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.1)]'
                                } disabled:opacity-50`}
                              >
                                {pageNum}
                              </button>
                            );
                          },
                        )}
                      </div>
                      <button
                        onClick={() =>
                          setPricingPage((p) =>
                            Math.min(pricingTotalPages, p + 1),
                          )
                        }
                        disabled={
                          pricingPage === pricingTotalPages || isPricingLoading
                        }
                        className="rounded-lg bg-[rgba(255,255,255,0.05)] px-3 py-1.5 text-sm font-medium text-[#94A3B8] transition-colors hover:bg-[rgba(255,255,255,0.1)] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Next
                      </button>
                      <button
                        onClick={() => setPricingPage(pricingTotalPages)}
                        disabled={
                          pricingPage === pricingTotalPages || isPricingLoading
                        }
                        className="rounded-lg bg-[rgba(255,255,255,0.05)] px-3 py-1.5 text-sm font-medium text-[#94A3B8] transition-colors hover:bg-[rgba(255,255,255,0.1)] disabled:cursor-not-allowed disabled:opacity-50"
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
      {activeTab === 'subscriptions' && (
        <div>
          <div className="mb-6 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="mb-2 text-xl font-semibold text-white">
                  Subscription Plans
                </h2>
                <p className="text-sm text-[#94A3B8]">
                  Manage membership tiers and benefits
                </p>
              </div>
            </div>
          </div>

          {isPlansLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
              <span className="ml-3 text-[#94A3B8]">Loading plans...</span>
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(255,255,255,0.05)]">
                <Crown className="h-8 w-8 text-[#64748B]" />
              </div>
              <p className="text-lg font-medium text-white">No plans found</p>
              <p className="mt-1 text-sm text-[#94A3B8]">
                Create membership plans from the backend
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {subscriptions.map((plan) => {
                const planColor = plan.isPopular
                  ? '#F59E0B'
                  : parseFloat(plan.price) === 0
                    ? '#64748B'
                    : '#3B82F6';
                return (
                  <div
                    key={plan.id}
                    className="rounded-xl border-2 bg-[rgba(15,23,42,0.6)] p-6 backdrop-blur-xl transition-all hover:scale-105"
                    style={{ borderColor: `${planColor}40` }}
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <div className="mb-2 flex items-center gap-2">
                          <Crown
                            className="h-5 w-5"
                            style={{ color: planColor }}
                          />
                          <h3 className="text-lg font-bold text-white">
                            {plan.name}
                          </h3>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-white">
                            ${plan.price}
                          </span>
                          <span className="text-sm text-[#64748B]">
                            /monthly
                          </span>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                          plan.isActive
                            ? 'bg-[#22C55E]/20 text-[#22C55E]'
                            : 'bg-[#64748B]/20 text-[#64748B]'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${plan.isActive ? 'bg-[#22C55E]' : 'bg-[#64748B]'}`}
                        />
                        {plan.isActive ? 'active' : 'inactive'}
                      </span>
                    </div>

                    {plan.discount > 0 && (
                      <div
                        className="mb-4 rounded-lg px-3 py-1.5 text-center"
                        style={{
                          backgroundColor: `${planColor}20`,
                          color: planColor,
                        }}
                      >
                        <span className="text-sm font-semibold">
                          {plan.discount}% Discount on Services
                        </span>
                      </div>
                    )}

                    <div className="mb-6 space-y-2">
                      {plan.features.map((feature: string, index: number) => (
                        <div key={index} className="flex items-start gap-2">
                          <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#22C55E]" />
                          <span className="text-sm text-[#94A3B8]">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditSubscription(plan)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2563EB]"
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSubscription(plan)}
                        className="rounded-lg bg-[#EF4444] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#DC2626]"
                      >
                        <Trash2 className="h-4 w-4" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#0F172A]">
            <div className="sticky top-0 z-10 border-b border-[rgba(255,255,255,0.1)] bg-[#0F172A] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="mb-2 text-2xl font-semibold text-white">
                    {selectedProvider.name}
                  </h2>
                  <span className="inline-block rounded-full bg-[#3B82F6]/20 px-3 py-1 text-sm font-medium text-[#3B82F6]">
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
                    setServiceSearchQuery('');
                    setDebouncedServiceSearch('');
                    setServiceCategoryFilter('');
                    setServicesPage(1);
                    setServicesLimit(50);
                    setServicesTotalCount(0);
                    setServicesTotalPages(0);
                  }}
                  className="rounded-lg p-2 text-[#94A3B8] transition-colors hover:bg-[rgba(255,255,255,0.1)]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-6 p-6">
              {/* Services List */}
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                    Services ({servicesTotalCount})
                  </h3>
                  <div className="flex items-center gap-2">
                    {providerServices.length > 0 && (
                      <>
                        <button
                          onClick={handleSelectAll}
                          className="rounded-lg bg-[rgba(59,130,246,0.2)] px-4 py-2 text-sm font-medium text-[#3B82F6] transition-colors hover:bg-[rgba(59,130,246,0.3)]"
                        >
                          Select All
                        </button>
                        <button
                          onClick={handleDeselectAll}
                          className="rounded-lg bg-[rgba(255,255,255,0.05)] px-4 py-2 text-sm font-medium text-[#94A3B8] transition-colors hover:bg-[rgba(255,255,255,0.1)]"
                        >
                          Deselect All
                        </button>
                        <button
                          onClick={() => handleOpenAddToVIP()}
                          disabled={selectedServices.length === 0}
                          className="flex items-center gap-2 rounded-lg bg-[#F59E0B] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#D97706] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Star className="h-4 w-4" />
                          Add to VIP ({selectedServices.length})
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Search + Category filter + Per page */}
                <div className="mb-3 flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                    <input
                      type="text"
                      placeholder="Search services..."
                      value={serviceSearchQuery}
                      onChange={(e) => setServiceSearchQuery(e.target.value)}
                      className="w-full rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] py-2.5 pr-4 pl-10 text-sm text-white placeholder:text-[#64748B] focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                    />
                    {isServicesLoading && (
                      <Loader2 className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-[#3B82F6]" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm whitespace-nowrap text-[#94A3B8]">
                      Category:
                    </span>
                    <select
                      value={serviceCategoryFilter}
                      onChange={(e) => setServiceCategoryFilter(e.target.value)}
                      className="cursor-pointer rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#1E293B] px-3 py-2 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none [&>option]:bg-[#1E293B] [&>option]:text-white"
                    >
                      <option value="">All</option>
                      <option value="social">Social Media</option>
                      <option value="messaging">Messaging</option>
                      <option value="finance">Finance</option>
                      <option value="gaming">Gaming</option>
                      <option value="shopping">Shopping</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm whitespace-nowrap text-[#94A3B8]">
                      Per page:
                    </span>
                    <select
                      value={servicesLimit}
                      onChange={(e) => {
                        setServicesLimit(Number(e.target.value));
                        setServicesPage(1);
                      }}
                      className="cursor-pointer rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#1E293B] px-3 py-2 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none [&>option]:bg-[#1E293B] [&>option]:text-white"
                    >
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={150}>150</option>
                      <option value={200}>200</option>
                    </select>
                  </div>
                </div>

                {isServicesLoading && providerServices.length === 0 ? (
                  // Skeleton row placeholders for the first-page fetch.
                  <div className="space-y-2 rounded-lg border border-[rgba(255,255,255,0.1)] p-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 py-2">
                        <div className="h-8 w-8 shrink-0 animate-pulse rounded-lg bg-[rgba(255,255,255,0.05)]" />
                        <div className="h-3 w-1/3 animate-pulse rounded bg-[rgba(255,255,255,0.05)]" />
                        <div className="h-3 w-1/5 animate-pulse rounded bg-[rgba(255,255,255,0.05)]" />
                        <div className="ml-auto h-6 w-24 animate-pulse rounded bg-[rgba(255,255,255,0.05)]" />
                      </div>
                    ))}
                  </div>
                ) : providerServices.length === 0 ? (
                  <div className="py-12 text-center text-[#64748B]">
                    {serviceSearchQuery
                      ? 'No services found matching your search'
                      : 'No services found for this provider'}
                  </div>
                ) : (
                  <>
                    <div className="max-h-[350px] overflow-y-auto rounded-lg border border-[rgba(255,255,255,0.1)]">
                      <table className="w-full">
                        <thead className="sticky top-0 z-10">
                          <tr className="border-b border-[rgba(255,255,255,0.1)] bg-[#0F172A]">
                            <th className="px-4 py-3 text-left">
                              <input
                                type="checkbox"
                                checked={
                                  selectedServices.length ===
                                    providerServices.length &&
                                  providerServices.length > 0
                                }
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    handleSelectAll();
                                  } else {
                                    handleDeselectAll();
                                  }
                                }}
                                className="h-4 w-4 rounded border-[rgba(255,255,255,0.3)] bg-[rgba(0,0,0,0.4)] checked:bg-[#3B82F6]"
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
                              className={`cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.02)] ${
                                selectedServiceForCountries?.id === service.id
                                  ? 'bg-[rgba(59,130,246,0.05)]'
                                  : ''
                              }`}
                              onClick={() => handleSelectService(service.id)}
                            >
                              <td className="px-4 py-3">
                                <input
                                  type="checkbox"
                                  checked={selectedServices.includes(
                                    service.id,
                                  )}
                                  onChange={() =>
                                    handleSelectService(service.id)
                                  }
                                  className="h-4 w-4 rounded border-[rgba(255,255,255,0.3)] bg-[rgba(0,0,0,0.4)] checked:bg-[#3B82F6]"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  {service.iconUrl ? (
                                    <img
                                      src={service.iconUrl}
                                      alt={service.name}
                                      className="h-8 w-8 rounded-lg object-cover"
                                      onError={(e) => {
                                        (
                                          e.target as HTMLImageElement
                                        ).style.display = 'none';
                                      }}
                                    />
                                  ) : (
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)]">
                                      <Globe className="h-4 w-4 text-[#64748B]" />
                                    </div>
                                  )}
                                  <span className="text-sm font-medium text-white">
                                    {service.name}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-[#94A3B8] capitalize">
                                {service.category || '—'}
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleServiceActive(service);
                                  }}
                                  title={`Click to ${service.isActive !== false ? 'deactivate' : 'activate'}`}
                                  className={`cursor-pointer rounded-full px-2 py-1 text-xs font-medium transition-colors ${
                                    service.isActive !== false
                                      ? 'bg-[rgba(34,197,94,0.1)] text-[#22C55E] hover:bg-[rgba(34,197,94,0.2)]'
                                      : 'bg-[rgba(239,68,68,0.1)] text-[#EF4444] hover:bg-[rgba(239,68,68,0.2)]'
                                  }`}
                                >
                                  {service.isActive !== false
                                    ? 'Active'
                                    : 'Inactive'}
                                </button>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewServiceCountries(service);
                                    }}
                                    className="flex items-center gap-1 rounded-lg bg-[rgba(59,130,246,0.15)] px-3 py-1.5 text-xs font-medium text-[#3B82F6] transition-colors hover:bg-[rgba(59,130,246,0.25)]"
                                  >
                                    <Globe className="h-3 w-3" />
                                    View Countries
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Hand-off to the existing Icon
                                      // Management modal with this single
                                      // service pre-selected for editing.
                                      if (!selectedProvider) return;
                                      const wrapper: UnifiedService = {
                                        slug: service.slug,
                                        name: service.name,
                                        category:
                                          (service as any).category || 'other',
                                        iconUrl: service.iconUrl || null,
                                        description: null,
                                        isPopular: false,
                                        providers: [
                                          {
                                            id: selectedProvider.id,
                                            name: selectedProvider.name,
                                            slug:
                                              (selectedProvider as any).slug ||
                                              '',
                                            version:
                                              selectedProvider.version || '',
                                            serviceId: service.id,
                                          },
                                        ],
                                        totalCountries: 0,
                                      };
                                      setShowProviderModal(false);
                                      setShowIconManagementModal(true);
                                      setEditingIconService(wrapper);
                                      setIconUrlInput(service.iconUrl || '');
                                    }}
                                    title="Edit icon (file upload or URL)"
                                    className="flex items-center gap-1 rounded-lg bg-[rgba(139,92,246,0.15)] px-3 py-1.5 text-xs font-medium text-[#8B5CF6] transition-colors hover:bg-[rgba(139,92,246,0.25)]"
                                  >
                                    <ImageIcon className="h-3 w-3" />
                                    Icon
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Controls — classic numbered. Keeps the
                        DOM bounded so search typing stays fast even with
                        large catalogs. */}
                    {servicesTotalPages > 1 && (
                      <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm text-[#94A3B8]">
                          Showing {(servicesPage - 1) * servicesLimit + 1}-
                          {Math.min(
                            servicesPage * servicesLimit,
                            servicesTotalCount,
                          )}{' '}
                          of {servicesTotalCount}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setServicesPage(1)}
                            disabled={servicesPage === 1 || isServicesLoading}
                            className="rounded-lg bg-[rgba(255,255,255,0.05)] px-3 py-1.5 text-sm font-medium text-[#94A3B8] transition-colors hover:bg-[rgba(255,255,255,0.1)] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            First
                          </button>
                          <button
                            onClick={() =>
                              setServicesPage((p) => Math.max(1, p - 1))
                            }
                            disabled={servicesPage === 1 || isServicesLoading}
                            className="rounded-lg bg-[rgba(255,255,255,0.05)] px-3 py-1.5 text-sm font-medium text-[#94A3B8] transition-colors hover:bg-[rgba(255,255,255,0.1)] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Previous
                          </button>
                          <div className="flex items-center gap-1">
                            {Array.from(
                              { length: Math.min(5, servicesTotalPages) },
                              (_, i) => {
                                let pageNum: number;
                                if (servicesTotalPages <= 5) {
                                  pageNum = i + 1;
                                } else if (servicesPage <= 3) {
                                  pageNum = i + 1;
                                } else if (
                                  servicesPage >=
                                  servicesTotalPages - 2
                                ) {
                                  pageNum = servicesTotalPages - 4 + i;
                                } else {
                                  pageNum = servicesPage - 2 + i;
                                }
                                return (
                                  <button
                                    key={pageNum}
                                    onClick={() => setServicesPage(pageNum)}
                                    disabled={isServicesLoading}
                                    className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
                                      servicesPage === pageNum
                                        ? 'bg-[#3B82F6] text-white'
                                        : 'bg-[rgba(255,255,255,0.05)] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.1)]'
                                    } disabled:opacity-50`}
                                  >
                                    {pageNum}
                                  </button>
                                );
                              },
                            )}
                          </div>
                          <button
                            onClick={() =>
                              setServicesPage((p) =>
                                Math.min(servicesTotalPages, p + 1),
                              )
                            }
                            disabled={
                              servicesPage === servicesTotalPages ||
                              isServicesLoading
                            }
                            className="rounded-lg bg-[rgba(255,255,255,0.05)] px-3 py-1.5 text-sm font-medium text-[#94A3B8] transition-colors hover:bg-[rgba(255,255,255,0.1)] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Next
                          </button>
                          <button
                            onClick={() => setServicesPage(servicesTotalPages)}
                            disabled={
                              servicesPage === servicesTotalPages ||
                              isServicesLoading
                            }
                            className="rounded-lg bg-[rgba(255,255,255,0.05)] px-3 py-1.5 text-sm font-medium text-[#94A3B8] transition-colors hover:bg-[rgba(255,255,255,0.1)] disabled:cursor-not-allowed disabled:opacity-50"
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
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                    <Globe className="h-5 w-5" />
                    Countries for {selectedServiceForCountries.name}
                  </h3>

                  {isCountriesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-[#3B82F6]" />
                      <span className="ml-3 text-sm text-[#94A3B8]">
                        Loading countries...
                      </span>
                    </div>
                  ) : serviceCountries.length === 0 ? (
                    <div className="py-8 text-center text-[#64748B]">
                      No countries available for this service
                    </div>
                  ) : (
                    (() => {
                      const filteredCountries = serviceCountries.filter(
                        (p) =>
                          p.country.name
                            .toLowerCase()
                            .includes(countrySearchQuery.toLowerCase()) ||
                          p.country.code
                            .toLowerCase()
                            .includes(countrySearchQuery.toLowerCase()),
                      );
                      return (
                        <>
                          <div className="relative mb-3">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                            <input
                              type="text"
                              placeholder="Search countries..."
                              value={countrySearchQuery}
                              onChange={(e) =>
                                setCountrySearchQuery(e.target.value)
                              }
                              className="w-full rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] py-2.5 pr-4 pl-10 text-sm text-white placeholder:text-[#64748B] focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                            />
                            {countrySearchQuery && (
                              <span className="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-[#64748B]">
                                {filteredCountries.length} of{' '}
                                {serviceCountries.length}
                              </span>
                            )}
                          </div>
                          <div className="max-h-[300px] overflow-y-auto rounded-lg border border-[rgba(255,255,255,0.1)]">
                            <table className="w-full">
                              <thead className="sticky top-0 z-10">
                                <tr className="border-b border-[rgba(255,255,255,0.1)] bg-[#0F172A]">
                                  <th className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase">
                                    Country
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase">
                                    Price
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase">
                                    Provider Price
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase">
                                    Available
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                                {filteredCountries.length === 0 ? (
                                  <tr>
                                    <td
                                      colSpan={4}
                                      className="px-4 py-10 text-center text-sm text-[#64748B]"
                                    >
                                      {countrySearchQuery
                                        ? `No countries match "${countrySearchQuery}"`
                                        : 'No countries found'}
                                    </td>
                                  </tr>
                                ) : (
                                  filteredCountries.map((product) => (
                                    <tr
                                      key={product.id}
                                      className="transition-colors hover:bg-[rgba(255,255,255,0.02)]"
                                    >
                                      <td className="px-4 py-3 text-sm font-medium text-white">
                                        {product.country.name} (
                                        {product.country.code})
                                      </td>
                                      <td className="px-4 py-3 text-sm font-medium text-[#22C55E]">
                                        ${product.price}
                                      </td>
                                      <td className="px-4 py-3 text-sm text-[#94A3B8]">
                                        {product.providerPrice
                                          ? `$${product.providerPrice}`
                                          : '—'}
                                      </td>
                                      <td className="px-4 py-3">
                                        <span
                                          className={`text-sm font-medium ${product.availableCount > 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}
                                        >
                                          {product.availableCount.toLocaleString()}
                                        </span>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </>
                      );
                    })()
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Provider Modal */}
      {showEditProviderModal && selectedProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#0F172A] p-6">
            <h2 className="mb-6 text-xl font-semibold text-white">
              Edit Provider
            </h2>

            <div className="mb-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Provider Name
                </label>
                <input
                  type="text"
                  value={providerFormData.name}
                  onChange={(e) =>
                    setProviderFormData({
                      ...providerFormData,
                      name: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                  placeholder="Enter provider name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">
                    Version
                  </label>
                  <select
                    value={providerFormData.version}
                    onChange={(e) =>
                      setProviderFormData({
                        ...providerFormData,
                        version: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                  >
                    <option value="V1_STANDARD">V1 - Premium</option>
                    <option value="V2">V2 - Standard</option>
                    <option value="V3">V3 - Basic</option>
                    <option value="V4">V4</option>
                    <option value="V5">V5</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-white">
                    Priority
                  </label>
                  <input
                    type="number"
                    value={providerFormData.priority}
                    onChange={(e) =>
                      setProviderFormData({
                        ...providerFormData,
                        priority: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                    placeholder="100"
                    min="0"
                    max="1000"
                  />
                  <p className="mt-1 text-xs text-[#64748B]">
                    Higher = shown first
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">
                    Markup (%)
                  </label>
                  <input
                    type="number"
                    value={providerFormData.markup}
                    onChange={(e) =>
                      setProviderFormData({
                        ...providerFormData,
                        markup: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                    placeholder="0"
                    min="0"
                    max="1000"
                    step="0.1"
                  />
                  <p className="mt-1 text-xs text-[#64748B]">
                    Added to all prices
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-white">
                    Status
                  </label>
                  <div className="flex h-[46px] items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setProviderFormData({
                          ...providerFormData,
                          isActive: true,
                        })
                      }
                      className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                        providerFormData.isActive
                          ? 'bg-[#22C55E] text-white'
                          : 'bg-[rgba(255,255,255,0.05)] text-[#64748B] hover:bg-[rgba(255,255,255,0.1)]'
                      }`}
                    >
                      Active
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setProviderFormData({
                          ...providerFormData,
                          isActive: false,
                        })
                      }
                      className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                        !providerFormData.isActive
                          ? 'bg-[#EF4444] text-white'
                          : 'bg-[rgba(255,255,255,0.05)] text-[#64748B] hover:bg-[rgba(255,255,255,0.1)]'
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
                className="rounded-lg bg-[rgba(255,255,255,0.08)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.12)]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProvider}
                disabled={isLoading || !providerFormData.name}
                className="rounded-lg bg-[#3B82F6] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Provider Modal */}
      {showDeleteModal && selectedProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#0F172A] p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">
              Delete Provider
            </h2>
            <p className="mb-2 text-sm text-[#94A3B8]">
              Are you sure you want to delete "{selectedProvider.name}"?
            </p>
            <p className="mb-6 text-sm text-[#EF4444]">
              This will also remove all {selectedProvider.totalServices}{' '}
              services from VIP categories.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedProvider(null);
                }}
                className="rounded-lg bg-[rgba(255,255,255,0.08)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.12)]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isLoading}
                className="rounded-lg bg-[#EF4444] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#DC2626] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? 'Deleting...' : 'Delete Provider'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add to VIP Modal — provider is in-context, all countries auto-included */}
      {showAddToVIPModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#0F172A] p-6">
            <h2 className="mb-2 text-xl font-semibold text-white">
              Add to VIP
            </h2>
            <p className="mb-6 text-sm text-[#94A3B8]">
              {selectedServices.length} selected service(s) will be added as VIP
              for every country this provider supports.
            </p>

            {/* Provider context (read-only) */}
            <div className="mb-4 rounded-lg border border-[rgba(245,158,11,0.3)] bg-[rgba(245,158,11,0.08)] p-4">
              <div className="mb-1 text-xs tracking-wide text-[#94A3B8] uppercase">
                Provider
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-white">
                <Star className="h-4 w-4 text-[#F59E0B]" />
                {selectedProvider?.name || '—'}
                {selectedProvider?.version && (
                  <span className="text-xs text-[#64748B]">
                    ({selectedProvider.version})
                  </span>
                )}
              </div>
            </div>

            {/* Countries info (read-only) */}
            <div className="mb-6 rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] p-4">
              <div className="mb-1 text-xs tracking-wide text-[#94A3B8] uppercase">
                Countries
              </div>
              <div className="flex items-center gap-2 text-sm text-white">
                <Globe className="h-4 w-4 text-[#3B82F6]" />
                All active countries from this provider will be included
                automatically.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowAddToVIPModal(false)}
                className="rounded-lg bg-[rgba(255,255,255,0.08)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.12)]"
              >
                Cancel
              </button>
              <button
                onClick={handleAddToVIP}
                disabled={isLoading || !selectedProvider}
                className="flex items-center gap-2 rounded-lg bg-[#F59E0B] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#D97706] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  'Adding...'
                ) : (
                  <>
                    <MoveRight className="h-4 w-4" />
                    Add to VIP
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Service Price Modal */}
      {showEditPriceModal && selectedServicePrice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#0F172A] p-6">
            <h2 className="mb-2 text-xl font-semibold text-white">
              Edit Product Price
            </h2>
            <p className="mb-6 text-sm text-[#94A3B8]">
              {selectedServicePrice.service.name} -{' '}
              {selectedServicePrice.country.name} (
              {selectedServicePrice.provider.name})
            </p>

            <div className="mb-4 rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] p-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#64748B]">Current Base Price</span>
                <span className="text-white">
                  ${selectedServicePrice.basePrice}
                </span>
              </div>
              <div className="mt-1 flex justify-between text-sm">
                <span className="text-[#64748B]">Current Final Price</span>
                <span className="font-semibold text-white">
                  ${selectedServicePrice.finalPrice}
                </span>
              </div>
            </div>

            {/* Mode selector */}
            <div className="mb-4 flex items-center gap-2">
              <button
                onClick={() => {
                  setEditPriceMode('override');
                  setEditPriceValue(selectedServicePrice.priceOverride || '');
                }}
                className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                  editPriceMode === 'override'
                    ? 'bg-[#3B82F6] text-white'
                    : 'border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.05)] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.08)]'
                }`}
              >
                Fixed Price Override
              </button>
              <button
                onClick={() => {
                  setEditPriceMode('markup');
                  setEditPriceValue(
                    selectedServicePrice.productMarkup.toString(),
                  );
                }}
                className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                  editPriceMode === 'markup'
                    ? 'bg-[#3B82F6] text-white'
                    : 'border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.05)] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.08)]'
                }`}
              >
                Product Markup %
              </button>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-white">
                {editPriceMode === 'override'
                  ? 'Fixed Price ($)'
                  : 'Markup Percentage (%)'}
              </label>
              <input
                type="number"
                step={editPriceMode === 'override' ? '0.01' : '0.1'}
                value={editPriceValue}
                onChange={(e) => setEditPriceValue(e.target.value)}
                className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                placeholder={editPriceMode === 'override' ? '2.50' : '5'}
              />
              {editPriceMode === 'override' && (
                <p className="mt-2 text-xs text-[#64748B]">
                  Leave empty and save to remove override and use calculated
                  price
                </p>
              )}
            </div>

            {editPriceMode === 'override' &&
              selectedServicePrice.priceOverride && (
                <button
                  onClick={() => {
                    setEditPriceValue('');
                  }}
                  className="mb-4 w-full rounded-lg border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.1)] px-4 py-2 text-sm font-medium text-[#EF4444] transition-colors hover:bg-[rgba(239,68,68,0.2)]"
                >
                  Remove Price Override (use calculated)
                </button>
              )}

            {/* Lock Price Toggle */}
            <div className="mb-4 flex items-center justify-between rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] p-3">
              <div>
                <span className="text-sm font-medium text-white">
                  Lock Price
                </span>
                <p className="text-xs text-[#64748B]">
                  Locked prices won&apos;t change during bulk updates
                </p>
              </div>
              <button
                onClick={() =>
                  setSelectedServicePrice({
                    ...selectedServicePrice,
                    isPriceLocked: !selectedServicePrice.isPriceLocked,
                  })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  selectedServicePrice.isPriceLocked
                    ? 'bg-[#3B82F6]'
                    : 'bg-[rgba(255,255,255,0.18)]'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    selectedServicePrice.isPriceLocked
                      ? 'translate-x-6'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowEditPriceModal(false);
                  setSelectedServicePrice(null);
                }}
                className="rounded-lg bg-[rgba(255,255,255,0.08)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.12)]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveServicePrice}
                disabled={isLoading}
                className="flex items-center gap-2 rounded-lg bg-[#3B82F6] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Price
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Subscription Modal */}
      {showEditSubscriptionModal && selectedSubscription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#0F172A] p-6">
            <h2 className="mb-6 text-xl font-semibold text-white">
              Edit Subscription Plan
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">
                    Plan Name
                  </label>
                  <input
                    type="text"
                    value={subscriptionFormData.name}
                    onChange={(e) =>
                      setSubscriptionFormData({
                        ...subscriptionFormData,
                        name: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                    placeholder="Enter plan name"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={subscriptionFormData.price}
                    onChange={(e) =>
                      setSubscriptionFormData({
                        ...subscriptionFormData,
                        price: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    value={subscriptionFormData.discount}
                    onChange={(e) =>
                      setSubscriptionFormData({
                        ...subscriptionFormData,
                        discount: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">
                    Status
                  </label>
                  <select
                    value={
                      subscriptionFormData.isActive ? 'active' : 'inactive'
                    }
                    onChange={(e) =>
                      setSubscriptionFormData({
                        ...subscriptionFormData,
                        isActive: e.target.value === 'active',
                      })
                    }
                    className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">
                    API Rate Limit (req/min)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={subscriptionFormData.apiRateLimit}
                    onChange={(e) =>
                      setSubscriptionFormData({
                        ...subscriptionFormData,
                        apiRateLimit: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                    placeholder="60"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">
                    Active Numbers Limit
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={subscriptionFormData.activeNumberLimit}
                    onChange={(e) =>
                      setSubscriptionFormData({
                        ...subscriptionFormData,
                        activeNumberLimit: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                    placeholder="25"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Description
                </label>
                <input
                  type="text"
                  value={subscriptionFormData.description}
                  onChange={(e) =>
                    setSubscriptionFormData({
                      ...subscriptionFormData,
                      description: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                  placeholder="Plan description"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Features (one per line)
                </label>
                <textarea
                  value={subscriptionFormData.features}
                  onChange={(e) =>
                    setSubscriptionFormData({
                      ...subscriptionFormData,
                      features: e.target.value,
                    })
                  }
                  className="min-h-[200px] w-full resize-none rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                  placeholder="Enter features, one per line"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowEditSubscriptionModal(false);
                  setSelectedSubscription(null);
                }}
                className="rounded-lg bg-[rgba(255,255,255,0.08)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.12)]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSubscription}
                disabled={isLoading || !subscriptionFormData.name}
                className="rounded-lg bg-[#3B82F6] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Subscription Modal */}
      {showDeleteSubscriptionModal && selectedSubscription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#0F172A] p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">
              Delete Plan
            </h2>
            <p className="mb-6 text-sm text-[#94A3B8]">
              Are you sure you want to delete the &quot;
              {selectedSubscription.name}&quot; plan? This action cannot be
              undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteSubscriptionModal(false);
                  setSelectedSubscription(null);
                }}
                className="rounded-lg bg-[rgba(255,255,255,0.08)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.12)]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteSubscription}
                disabled={isLoading}
                className="rounded-lg bg-[#EF4444] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#DC2626] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unified Services Modal (No Duplicates) */}
      {showUnifiedServicesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#0F172A]">
            <div className="sticky top-0 z-10 border-b border-[rgba(255,255,255,0.1)] bg-[#0F172A] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="mb-1 text-2xl font-semibold text-white">
                    All Services
                  </h2>
                  <p className="text-sm text-[#94A3B8]">
                    Unified view - each service appears once across all
                    providers
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowUnifiedServicesModal(false);
                    setSelectedUnifiedService(null);
                    setUnifiedServices([]);
                    setUnifiedServiceCountries([]);
                  }}
                  className="rounded-lg p-2 text-[#94A3B8] transition-colors hover:bg-[rgba(255,255,255,0.1)]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={unifiedServiceSearchQuery}
                  onChange={(e) => setUnifiedServiceSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] py-2.5 pr-10 pl-10 text-sm text-white placeholder:text-[#64748B] focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                />
                {/* Thin spinner in the search bar signals an in-flight refetch
                    without disturbing the list below. */}
                {isUnifiedServicesLoading && unifiedServices.length > 0 && (
                  <Loader2 className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-[#64748B]" />
                )}
              </div>

              {/* Fixed-height wrapper keeps the modal from shrinking/growing
                  between skeleton, empty, and loaded states. */}
              <div className="min-h-[500px]">
                {isUnifiedServicesLoading && unifiedServices.length === 0 ? (
                  // Skeleton placeholders for the first-page load. Avoids the
                  // empty-state flash and gives a clear loading signal.
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div className="space-y-2">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 rounded-lg border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] p-4"
                        >
                          <div className="h-8 w-8 shrink-0 animate-pulse rounded-lg bg-[rgba(255,255,255,0.05)]" />
                          <div className="flex-1 space-y-2">
                            <div className="h-3 w-1/2 animate-pulse rounded bg-[rgba(255,255,255,0.05)]" />
                            <div className="h-2 w-1/3 animate-pulse rounded bg-[rgba(255,255,255,0.05)]" />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-l border-[rgba(255,255,255,0.1)] pl-2">
                      <div className="flex h-full items-center justify-center text-sm text-[#64748B]">
                        Loading…
                      </div>
                    </div>
                  </div>
                ) : unifiedServices.length === 0 ? (
                  <div className="flex h-[500px] items-center justify-center text-center text-[#64748B]">
                    {debouncedUnifiedServiceSearch
                      ? 'No services match your search.'
                      : 'No services found. Sync providers first.'}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {/* Services List — server paginated, server search.
                      No frontend .filter() needed; backend already scoped. */}
                    <div className="max-h-[500px] space-y-2 overflow-y-auto pr-2">
                      <h3 className="sticky top-0 mb-2 bg-[#0F172A] py-2 text-sm font-medium text-white">
                        Services ({unifiedServicesTotal})
                      </h3>
                      {unifiedServices.map((service) => (
                        <UnifiedServiceRow
                          key={service.slug}
                          service={service}
                          isSelected={
                            selectedUnifiedService?.slug === service.slug
                          }
                          onSelect={handleViewUnifiedServiceCountries}
                        />
                      ))}

                      {/* Infinite-scroll sentinel. Triggers loadMore when it
                        enters the viewport. */}
                      {hasMoreUnifiedServices && (
                        <div
                          ref={unifiedLoadMoreSentinelRef}
                          className="py-3 text-center text-xs text-[#64748B]"
                        >
                          {isLoadingMoreUnified ? 'Loading more…' : ' '}
                        </div>
                      )}
                    </div>

                    {/* Countries for selected service */}
                    <div className="max-h-[500px] overflow-y-auto border-l border-[rgba(255,255,255,0.1)] pl-2">
                      {selectedUnifiedService ? (
                        <>
                          <h3 className="sticky top-0 mb-2 bg-[#0F172A] py-2 text-sm font-medium text-white">
                            Countries for {selectedUnifiedService.name}
                          </h3>
                          {isUnifiedCountriesLoading ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="h-5 w-5 animate-spin text-[#3B82F6]" />
                            </div>
                          ) : unifiedServiceCountries.length === 0 ? (
                            <div className="py-8 text-center text-sm text-[#64748B]">
                              No countries available
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {unifiedServiceCountries
                                .filter((c) =>
                                  c.name
                                    .toLowerCase()
                                    .includes(
                                      unifiedCountrySearchQuery.toLowerCase(),
                                    ),
                                )
                                .map((country) => (
                                  <div
                                    key={country.id}
                                    className="rounded-lg border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] p-3"
                                  >
                                    <div className="mb-2 flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        {country.iconUrl && (
                                          <img
                                            src={country.iconUrl}
                                            alt=""
                                            className="h-5 w-5 rounded"
                                          />
                                        )}
                                        <span className="text-sm font-medium text-white">
                                          {country.name}
                                        </span>
                                        <span className="text-xs text-[#64748B]">
                                          ({country.code})
                                        </span>
                                      </div>
                                      <span className="text-sm font-medium text-[#22C55E]">
                                        ${country.bestPrice}
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                      {country.providers.map((p) => (
                                        <span
                                          key={p.productId}
                                          className="rounded bg-[rgba(255,255,255,0.05)] px-2 py-1 text-xs text-[#94A3B8]"
                                        >
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
                        <div className="flex h-full items-center justify-center text-sm text-[#64748B]">
                          Select a service to view countries
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Icon Management Modal */}
      {showIconManagementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#0F172A]">
            <div className="sticky top-0 z-10 border-b border-[rgba(255,255,255,0.1)] bg-[#0F172A] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="mb-1 text-2xl font-semibold text-white">
                    Manage Service Icons
                  </h2>
                  <p className="text-sm text-[#94A3B8]">
                    Upload or set icon URLs for services
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowIconManagementModal(false);
                    setEditingIconService(null);
                    setServicesForIcons([]);
                  }}
                  className="rounded-lg p-2 text-[#94A3B8] transition-colors hover:bg-[rgba(255,255,255,0.1)]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Filters — sticky to the top of the scroll container so
                  search/filter buttons stay reachable while admin scrolls
                  through the grid below. */}
              <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-[rgba(255,255,255,0.05)] bg-[#0F172A] px-6 py-4">
                <div className="relative flex-1">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                  <input
                    type="text"
                    placeholder="Search services..."
                    value={iconSearchQuery}
                    onChange={(e) => setIconSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] py-2.5 pr-4 pl-10 text-sm text-white placeholder:text-[#64748B] focus:ring-2 focus:ring-[#8B5CF6] focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => handleIconFilterChange(!iconFilterMissing)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all ${
                    iconFilterMissing
                      ? 'bg-[#EF4444] text-white'
                      : 'border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.05)] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.08)]'
                  }`}
                >
                  Missing Icons Only
                </button>
                <button
                  onClick={() => handleBackfillIcons(false)}
                  disabled={isBackfillingIcons}
                  title="Fill in icons for services that don't have one. Doesn't touch existing icons."
                  className="flex items-center gap-2 rounded-lg bg-[#22C55E] px-4 py-2.5 text-sm font-medium whitespace-nowrap text-white transition-colors hover:bg-[#16A34A] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isBackfillingIcons ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Backfill Icons
                </button>
                <button
                  onClick={() => handleBackfillIcons(true)}
                  disabled={isBackfillingIcons}
                  title="Re-resolve ALL public CDN icons (fixes broken simpleicons URLs). Admin storage uploads are preserved."
                  className="flex items-center gap-2 rounded-lg bg-[#F59E0B] px-4 py-2.5 text-sm font-medium whitespace-nowrap text-white transition-colors hover:bg-[#D97706] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isBackfillingIcons ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Re-resolve All
                </button>
              </div>

              {/* Fixed-height wrapper prevents the modal from blinking
                  between loading / empty / loaded states. */}
              <div className="min-h-[500px] px-6 py-4">
                {/* Total count row */}
                <div className="mb-3 flex items-center justify-between text-xs text-[#94A3B8]">
                  <span>
                    {iconsTotal}{' '}
                    {iconFilterMissing ? 'missing icons' : 'services'}
                  </span>
                  {isIconServicesLoading && servicesForIcons.length > 0 && (
                    <Loader2 className="h-3 w-3 animate-spin text-[#8B5CF6]" />
                  )}
                </div>

                {isIconServicesLoading && servicesForIcons.length === 0 ? (
                  // Skeleton placeholders for the first-page load.
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 rounded-lg border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] p-4"
                      >
                        <div className="h-12 w-12 shrink-0 animate-pulse rounded-lg bg-[rgba(255,255,255,0.05)]" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-1/2 animate-pulse rounded bg-[rgba(255,255,255,0.05)]" />
                          <div className="h-2 w-1/3 animate-pulse rounded bg-[rgba(255,255,255,0.05)]" />
                          <div className="h-2 w-1/4 animate-pulse rounded bg-[rgba(255,255,255,0.05)]" />
                          <div className="mt-2 h-6 w-20 animate-pulse rounded-lg bg-[rgba(255,255,255,0.05)]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : servicesForIcons.length === 0 ? (
                  <div className="flex h-[500px] items-center justify-center text-center text-[#64748B]">
                    {iconFilterMissing
                      ? 'All services have icons!'
                      : debouncedIconSearch
                        ? 'No services match your search.'
                        : 'No services found'}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {servicesForIcons.map((service) => (
                        <IconServiceRow
                          key={service.slug}
                          service={service}
                          onEdit={handleEditIcon}
                        />
                      ))}
                    </div>

                    {/* Infinite-scroll sentinel */}
                    {hasMoreIcons && (
                      <div
                        ref={iconLoadMoreSentinelRef}
                        className="py-4 text-center text-xs text-[#64748B]"
                      >
                        {isLoadingMoreIcons ? 'Loading more…' : ' '}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Icon Modal — stacks on top of the Icon Management modal so
          admin doesn't have to scroll to find the editor. Closes on backdrop
          click or Cancel. Higher z-index than the parent modal. */}
      {editingIconService && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => {
            setEditingIconService(null);
            setIconUrlInput('');
          }}
        >
          <div
            ref={editIconPanelRef}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-xl border border-[rgba(139,92,246,0.3)] bg-[#0F172A] p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h4 className="text-lg font-semibold text-white">
                  Edit Icon: {editingIconService.name}
                </h4>
                <p className="mt-1 text-xs text-[#94A3B8]">
                  Will update icon for:{' '}
                  {editingIconService.providers.map((p) => p.name).join(', ')}
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingIconService(null);
                  setIconUrlInput('');
                }}
                className="rounded-lg p-1 text-[#94A3B8] transition-colors hover:bg-[rgba(255,255,255,0.05)] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 flex items-center gap-3">
              {editingIconService.iconUrl || iconUrlInput ? (
                <img
                  src={iconUrlInput || editingIconService.iconUrl || ''}
                  alt="Preview"
                  className="h-16 w-16 rounded-lg border border-[rgba(255,255,255,0.1)] object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)]">
                  <Globe className="h-6 w-6 text-[#64748B]" />
                </div>
              )}
              <div className="flex-1">
                <label className="mb-1 block text-xs text-[#94A3B8]">
                  Icon URL
                </label>
                <input
                  type="text"
                  value={iconUrlInput}
                  onChange={(e) => setIconUrlInput(e.target.value)}
                  placeholder="https://example.com/icon.png"
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-3 py-2 text-sm text-white focus:ring-2 focus:ring-[#8B5CF6] focus:outline-none"
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
                <span className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[rgba(255,255,255,0.08)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.12)]">
                  <Plus className="h-4 w-4" />
                  Upload File
                </span>
              </label>
              <button
                onClick={handleSaveIcon}
                disabled={isUploadingIcon}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#8B5CF6] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7C3AED] disabled:opacity-50"
              >
                {isUploadingIcon ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Icon
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
