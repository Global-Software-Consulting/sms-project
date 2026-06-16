'use client';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { initializeAuth } from '@/store/slices/authSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Search,
  Star,
  Copy,
  Clock,
  AlertCircle,
  X,
  ChevronRight,
  ArrowUpDown,
  TrendingUp,
  Globe,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/components/ui/utils';
import {
  getProviders,
  getServices,
  getCountries,
  getProducts,
  getProductsRealtime,
  activateNumber,
  checkOrderStatus,
  cancelOrder,
  getFavorites,
  addFavorite,
  removeFavorite,
  getUnifiedVipCategories,
  getOrderHistory,
  UnifiedVipService,
  SmsProvider,
  SmsService,
  SmsCountry,
  SmsProduct,
  SmsOrder,
  SmsFavorite,
  getOrderStatusLabel,
  getOrderStatusColor,
  getCountryFlag,
  getProviderBadge,
  getServiceTypeLabel,
  canCancelOrder,
  getTimeRemaining,
  formatPrice,
} from '@/lib/api/smsApi';
import { getWalletBalance, formatBalance } from '@/lib/api/walletApi';
import { safeServiceIcon } from '@/lib/service-icon';

type CountryFilterType = 'all' | 'favorites' | 'available';
type PriceSortType = 'none' | 'low-high' | 'high-low';

export default function Activation() {
  const dispatch = useAppDispatch();
  // Data state
  const [providers, setProviders] = useState<SmsProvider[]>([]);
  const [services, setServices] = useState<SmsService[]>([]);
  const [countries, setCountries] = useState<SmsCountry[]>([]);
  const [products, setProducts] = useState<SmsProduct[]>([]);
  const [favorites, setFavorites] = useState<SmsFavorite[]>([]);
  const [walletBalance, setWalletBalance] = useState<string>('0');

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingMoreServices, setIsLoadingMoreServices] = useState(false);
  // Default to true so the very first render shows the skeleton, not the
  // "No services available" empty state, before the fetch effect kicks in.
  const [isLoadingServices, setIsLoadingServices] = useState(true);

  // Paginated services state — fetched 100 at a time on scroll.
  const SERVICES_PAGE_SIZE = 100;
  const [servicesPage, setServicesPage] = useState(1);
  const [hasMoreServices, setHasMoreServices] = useState(false);
  // Full count from backend meta.total — separate from loaded length so
  // the footer always shows the true total, not just what's paginated in.
  const [servicesTotal, setServicesTotal] = useState(0);
  const servicesRequestId = useRef(0);
  const loadMoreSentinelRef = useRef<HTMLDivElement | null>(null);
  // Server-side search — debounced so we don't fire on every keystroke.
  const [debouncedServiceSearch, setDebouncedServiceSearch] = useState('');
  const [activatingProductId, setActivatingProductId] = useState<string | null>(
    null,
  );

  // Selection state
  const [selectedProvider, setSelectedProvider] = useState<SmsProvider | null>(
    null,
  );
  const [selectedService, setSelectedService] = useState<SmsService | null>(
    null,
  );
  const [selectedCountry, setSelectedCountry] = useState<SmsCountry | null>(
    null,
  );

  // Search & filter state
  const [serviceSearch, setServiceSearch] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [countryFilter, setCountryFilter] = useState<CountryFilterType>('all');
  const [priceSort, setPriceSort] = useState<PriceSortType>('none');

  // VIP state — user-facing VIP section is deferred per client. We still
  // load the unified list (one shot) so we can decorate Step 1 service
  // rows with a "VIP" badge for services flagged by admin.
  const [vipServices, setVipServices] = useState<UnifiedVipService[]>([]);
  const [vipEnabled, setVipEnabled] = useState(true);

  // Active orders state
  const [activeOrders, setActiveOrders] = useState<SmsOrder[]>([]);
  const [pollingOrders, setPollingOrders] = useState<Set<string>>(new Set());

  // Timer tick state for real-time countdown (updates every second)
  const [, setTimerTick] = useState(0);

  // Fetch initial data - optimized to load essential data first
  const fetchInitialData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Load essential data first (providers, balance)
      const [providersRes, balanceRes] = await Promise.allSettled([
        getProviders(),
        getWalletBalance(),
      ]);

      if (providersRes.status === 'fulfilled') {
        const activeProviders =
          providersRes.value.providers?.filter((p) => p.isActive) || [];
        setProviders(activeProviders);
        if (activeProviders.length > 0) {
          setSelectedProvider(activeProviders[0]);
        }
      }

      if (balanceRes.status === 'fulfilled') {
        setWalletBalance(balanceRes.value.balance);
      }

      // Load secondary data in background (don't block UI)
      Promise.allSettled([
        getCountries({ limit: 100 }),
        getFavorites({ limit: 50 }),
      ]).then(([countriesRes, favoritesRes]) => {
        if (countriesRes.status === 'fulfilled') {
          setCountries(countriesRes.value.data || []);
        }
        if (favoritesRes.status === 'fulfilled') {
          // Drop any favorites whose service/country/provider relation
          // came back null — protects every downstream consumer
          // (filters, isFavorite, render) from a single bad row.
          const clean = (favoritesRes.value.data || []).filter(
            (f) => f?.country?.id && f?.service?.id && f?.provider?.id,
          );
          setFavorites(clean);
        }
      });

      // Load unified VIP — only used to decorate Step 1 services with a
      // "VIP" badge. The full VIP card is deferred per client direction.
      // Request topCountriesPerService=1 to keep the payload tiny since we
      // only need the service slugs.
      getUnifiedVipCategories({ topCountriesPerService: 1 })
        .then((res) => {
          setVipEnabled(res.enabled !== false);
          setVipServices(res.enabled === false ? [] : res.services || []);
        })
        .catch(() => {});

      // Repopulate active orders on mount/reload. Without this, the
      // "Active Numbers" card disappears on reload because state resets
      // to []. Fetch the latest 20 and keep only in-flight statuses
      // whose expiry is still in the future — orders whose expiresAt
      // has already passed are stale (backend never transitioned them
      // to EXPIRED) and would render as "0 min 00 sec" which confuses
      // users.
      getOrderHistory({ limit: 20 })
        .then((res) => {
          const now = Date.now();
          const inFlight = (res.data || []).filter(
            (o) =>
              (o.status === 'PENDING' || o.status === 'WAITING_SMS') &&
              o.expiresAt &&
              new Date(o.expiresAt).getTime() > now,
          );
          setActiveOrders(inFlight);
        })
        .catch(() => {});
    } catch (err) {
      console.error('Failed to fetch initial data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch products when service/provider changes - uses REAL-TIME API
  // Request-ID guard for fetchProducts. Rapid service/provider switches +
  // 300ms debounce can cause an old fetch to resolve after a newer one,
  // overwriting state with stale prices. Each call bumps the ID; only the
  // latest response is allowed to write.
  const productsRequestId = useRef(0);

  // Hover-prefetch bookkeeping. We fire getProductsRealtime on mouse-enter
  // (debounced 200ms) so when the user actually clicks a service, the
  // backend's 60s price cache is already warm and fetchProducts() comes
  // back in tens of ms instead of 1-5s spent talking to the upstream
  // provider API.
  //
  // - prefetchedServicesRef: services we've already fired a prefetch for
  //   in the current provider scope. Avoids repeat fires when the user
  //   scrubs over the same service multiple times.
  // - hoverDebounceRef: pending setTimeout so leaving the row before
  //   200ms cancels the prefetch (no wasted call on accidental brushes).
  const prefetchedServicesRef = useRef<Set<string>>(new Set());
  const hoverDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const prefetchService = useCallback(
    (svc: SmsService) => {
      if (!selectedProvider) return;
      if (selectedService?.id === svc.id) return; // already loaded
      if (prefetchedServicesRef.current.has(svc.id)) return;

      if (hoverDebounceRef.current) clearTimeout(hoverDebounceRef.current);
      hoverDebounceRef.current = setTimeout(() => {
        prefetchedServicesRef.current.add(svc.id);
        // Fire and forget — we just want the backend's price cache warm.
        // Errors swallowed: the real fetch on click will surface them.
        getProductsRealtime(selectedProvider.id, svc.id).catch(() => {});
      }, 200);
    },
    [selectedProvider, selectedService],
  );

  const cancelPrefetch = useCallback(() => {
    if (hoverDebounceRef.current) {
      clearTimeout(hoverDebounceRef.current);
      hoverDebounceRef.current = null;
    }
  }, []);

  // Clear the prefetched set whenever the provider changes — prefetch
  // results are keyed by provider on the backend, and switching providers
  // makes the previous warm cache irrelevant.
  useEffect(() => {
    prefetchedServicesRef.current = new Set();
    cancelPrefetch();
  }, [selectedProvider, cancelPrefetch]);

  const fetchProducts = useCallback(async () => {
    if (!selectedService || !selectedProvider) return;

    const requestId = ++productsRequestId.current;
    const isStale = () => requestId !== productsRequestId.current;

    try {
      setIsLoadingProducts(true);
      // Use real-time API to get fresh prices from provider
      const response = await getProductsRealtime(
        selectedProvider.id,
        selectedService.id,
      );
      if (isStale()) return;
      setProducts(response.data || []);
    } catch (err) {
      if (isStale()) return;
      console.error('Failed to fetch products:', err);
      // Fallback to cached products if real-time fails
      try {
        const fallbackResponse = await getProducts({
          providerId: selectedProvider.id,
          serviceId: selectedService.id,
          limit: 100,
        });
        if (isStale()) return;
        setProducts(fallbackResponse.data || []);
      } catch {
        if (isStale()) return;
        setProducts([]);
      }
    } finally {
      if (!isStale()) setIsLoadingProducts(false);
    }
  }, [selectedProvider, selectedService]);

  // Initial load
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Real-time countdown timer - update every second when there are active orders
  useEffect(() => {
    const hasActiveTimers = activeOrders.some(
      (order) =>
        order.expiresAt &&
        (order.status === 'PENDING' || order.status === 'WAITING_SMS'),
    );

    if (!hasActiveTimers) return;

    const interval = setInterval(() => {
      setTimerTick((tick) => tick + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeOrders]);

  // Fetch services when provider changes (with pagination to get all services)
  useEffect(() => {
    if (!selectedProvider) return;

    // Cancellation: rapid provider switches OR rapid search changes must
    // not let an old fetch overwrite state.
    const requestId = ++servicesRequestId.current;
    const isStale = () => requestId !== servicesRequestId.current;

    // Synchronous loading flip so the skeleton replaces stale content
    // immediately (no "No services available" flash).
    setIsLoadingServices(true);
    setServices([]);
    setHasMoreServices(false);

    const fetchFirstPage = async () => {
      try {
        const response = await getServices({
          providerId: selectedProvider.id,
          limit: SERVICES_PAGE_SIZE,
          page: 1,
          ...(debouncedServiceSearch ? { search: debouncedServiceSearch } : {}),
        });
        if (isStale()) return;

        setServices(response.data || []);
        setServicesPage(1);
        setHasMoreServices(response.meta?.hasNextPage ?? false);
        setServicesTotal(response.meta?.total ?? response.data?.length ?? 0);
        // Clear current selection on provider change only — keep it when
        // user is just searching within the same provider.
      } catch (err) {
        if (isStale()) return;
        console.error('Failed to fetch services for provider:', err);
        setServices([]);
        setHasMoreServices(false);
        setServicesTotal(0);
      } finally {
        if (!isStale()) setIsLoadingServices(false);
      }
    };

    fetchFirstPage();
  }, [selectedProvider, debouncedServiceSearch]);

  // Load next page of services (infinite scroll). Skip if already loading,
  // no more pages, or no provider selected. Guarded against stale provider
  // switches via the same request-ID ref.
  const loadMoreServices = useCallback(async () => {
    if (!selectedProvider || !hasMoreServices || isLoadingMoreServices) {
      return;
    }
    const requestId = servicesRequestId.current;
    const isStale = () => requestId !== servicesRequestId.current;

    setIsLoadingMoreServices(true);
    try {
      const nextPage = servicesPage + 1;
      const response = await getServices({
        providerId: selectedProvider.id,
        limit: SERVICES_PAGE_SIZE,
        page: nextPage,
        // Carry the active search term into paginated requests so the
        // loaded list stays consistent with what the user is filtering on.
        ...(debouncedServiceSearch ? { search: debouncedServiceSearch } : {}),
      });
      if (isStale()) return;
      setServices((prev) => [...prev, ...(response.data || [])]);
      setServicesPage(nextPage);
      setHasMoreServices(response.meta?.hasNextPage ?? false);
      if (response.meta?.total != null) {
        setServicesTotal(response.meta.total);
      }
    } catch (err) {
      if (isStale()) return;
      console.error('Failed to load more services:', err);
      setHasMoreServices(false);
    } finally {
      if (!isStale()) setIsLoadingMoreServices(false);
    }
  }, [
    selectedProvider,
    hasMoreServices,
    isLoadingMoreServices,
    servicesPage,
    debouncedServiceSearch,
  ]);

  // IntersectionObserver: trigger loadMoreServices when sentinel scrolls
  // into view. Attached to the bottom of the services list.
  useEffect(() => {
    const node = loadMoreSentinelRef.current;
    if (!node || !hasMoreServices) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMoreServices();
        }
      },
      { root: null, rootMargin: '100px', threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMoreServices, loadMoreServices]);

  // Fetch products when service/provider changes (with debounce)
  // Real-time API fetches all countries at once, so no need for countryId
  useEffect(() => {
    if (!selectedService || !selectedProvider) return;

    // Debounce to prevent rapid API calls during navigation
    const timeoutId = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [selectedService, selectedProvider, fetchProducts]);

  // Set of VIP service slugs (lowercase). Used to badge Step 1 service
  // rows so users can still see which services are in VIP without a
  // dedicated VIP section.
  const vipServiceSlugs = useMemo(
    () =>
      new Set(vipEnabled ? vipServices.map((s) => s.slug.toLowerCase()) : []),
    [vipServices, vipEnabled],
  );

  // Live price updates: backend broadcasts `sms:price-updated` via socket
  // (forwarded by NotificationContext) whenever admin changes global markup,
  // per-product markup, provider markup, or a sync finishes. Refetch
  // immediately so the user sees new prices without manual reload.
  useEffect(() => {
    const handler = () => {
      if (!selectedService || !selectedProvider) return;
      fetchProducts();
    };
    window.addEventListener('sms:price-updated', handler);
    return () => window.removeEventListener('sms:price-updated', handler);
  }, [selectedService, selectedProvider, fetchProducts]);

  // Poll for fresh availability while the user is viewing countries.
  // Client bug #11: the "available" count shown in Step 2 should reflect
  // real provider stock, not a 5-minute-old cached value. We refetch
  // every 30s only when a service+provider is selected, so the count
  // ticks down as other users consume numbers.
  useEffect(() => {
    if (!selectedService || !selectedProvider) return;
    const id = setInterval(() => fetchProducts(), 30_000);
    return () => clearInterval(id);
  }, [selectedService, selectedProvider, fetchProducts]);

  // Poll active orders for SMS
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      const ordersToCheck = activeOrders.filter(
        (order) => order.status === 'PENDING' || order.status === 'WAITING_SMS',
      );

      for (const order of ordersToCheck) {
        if (pollingOrders.has(order.id)) continue;

        try {
          setPollingOrders((prev) => new Set(prev).add(order.id));
          const response = await checkOrderStatus(order.id);

          setActiveOrders((prev) =>
            prev.map((o) => (o.id === order.id ? response.order : o)),
          );

          if (response.order.status === 'COMPLETED' && response.order.smsCode) {
            toast.success('SMS Received!', {
              description: `Code: ${response.order.smsCode}`,
            });
          }
        } catch (err) {
          console.error('Failed to check order status:', err);
        } finally {
          setPollingOrders((prev) => {
            const next = new Set(prev);
            next.delete(order.id);
            return next;
          });
        }
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [activeOrders, pollingOrders]);

  // Countdown ticker for UI
  useEffect(() => {
    const iv = setInterval(() => setActiveOrders((p) => [...p]), 1000);
    return () => clearInterval(iv);
  }, []);

  // Debounce search input so we don't spam the backend on every keystroke.
  // 300ms feels responsive without being chatty.
  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedServiceSearch(serviceSearch.trim());
    }, 300);
    return () => clearTimeout(id);
  }, [serviceSearch]);

  // Get products grouped by country
  const productsByCountry = useMemo(() => {
    const grouped = new Map<string, SmsProduct[]>();
    products.forEach((product) => {
      const countryId = product.country.id;
      if (!grouped.has(countryId)) {
        grouped.set(countryId, []);
      }
      grouped.get(countryId)!.push(product);
    });
    return grouped;
  }, [products]);

  // Filter and sort countries with products
  const filteredCountries = useMemo(() => {
    // NaN-safe min: parseFloat returning NaN would poison Math.min and
    // make the price sort comparator return NaN, leaving the list in
    // its original order (which is why "High → Low" appeared broken).
    const safeMin = (prods: SmsProduct[]) => {
      let min = Number.POSITIVE_INFINITY;
      for (const p of prods) {
        const v = parseFloat(p.yourPrice);
        if (Number.isFinite(v) && v < min) min = v;
      }
      return Number.isFinite(min) ? min : 0;
    };

    let list = Array.from(productsByCountry.entries()).map(
      ([_countryId, prods]) => ({
        country: prods[0].country,
        products: prods,
        minPrice: safeMin(prods),
        totalAvailable: prods.reduce((sum, p) => sum + p.availableCount, 0),
      }),
    );

    // Search filter
    const q = countrySearch.toLowerCase();
    if (q) {
      list = list.filter((item) => item.country.name.toLowerCase().includes(q));
    }

    // Favorites filter. Scope by the currently selected service +
    // provider so favorites from OTHER services don't bleed into the
    // current view. Without this scope, favoriting (WhatsApp, US) then
    // switching to Telegram would surface US under Telegram with an
    // empty star — the source of "random items show as favorites" and
    // "star icon not always displayed correctly".
    if (countryFilter === 'favorites') {
      const currentServiceId = selectedService?.id;
      const currentProviderId = selectedProvider?.id;
      if (!currentServiceId || !currentProviderId) {
        list = [];
      } else {
        const favoriteCountryIds = new Set(
          favorites
            .filter(
              (f) =>
                f.service?.id === currentServiceId &&
                f.provider?.id === currentProviderId,
            )
            .map((f) => f.country?.id)
            .filter((id): id is string => typeof id === 'string'),
        );
        list = list.filter((item) => favoriteCountryIds.has(item.country.id));
      }
    }

    // Available filter
    if (countryFilter === 'available') {
      list = list.filter((item) => item.totalAvailable > 0);
    }

    // Price sorting
    if (priceSort === 'low-high') {
      list.sort((a, b) => a.minPrice - b.minPrice);
    } else if (priceSort === 'high-low') {
      list.sort((a, b) => b.minPrice - a.minPrice);
    }

    return list;
  }, [
    productsByCountry,
    countrySearch,
    countryFilter,
    priceSort,
    favorites,
    selectedService?.id,
    selectedProvider?.id,
  ]);

  // Handle service selection
  const handleSelectService = (service: SmsService) => {
    setSelectedService(service);
    setSelectedCountry(null);
  };

  // Handle buy SMS
  const handleBuySMS = async (product: SmsProduct) => {
    if (!selectedService || !selectedProvider) return;
    if (activatingProductId) return; // Prevent double-click

    const price = parseFloat(product.yourPrice);
    const balance = parseFloat(walletBalance);

    if (price > balance) {
      toast.error('Insufficient balance', {
        description: `You need ${formatPrice(product.yourPrice)} but only have ${formatBalance(walletBalance, 'USD')}`,
      });
      return;
    }

    try {
      setActivatingProductId(product.id); // Track which specific product is being activated
      const response = await activateNumber(product.id);

      if (response.order && response.order.id) {
        setActiveOrders((prev) => [response.order, ...prev]);
        setWalletBalance((prev) => (parseFloat(prev) - price).toFixed(2));

        toast.success('Number activated!', {
          description: `${selectedService.name} / ${product.country.name} - Waiting for SMS...`,
        });

        // Refetch user profile so rank updates instantly if the user crossed a threshold
        dispatch(initializeAuth());
      } else {
        console.error('Unexpected response:', response);
        toast.error('Activation failed', {
          description: 'Invalid response from server',
        });
      }
    } catch (err: any) {
      console.error('Activation error:', err);
      toast.error('Failed to activate number', {
        description: err.response?.data?.message || 'Please try again.',
      });
    } finally {
      setActivatingProductId(null);
    }
  };

  // Handle cancel order
  const handleCancelOrder = async (orderId: string) => {
    try {
      const response = await cancelOrder(orderId);
      setActiveOrders((prev) =>
        prev.map((o) => (o.id === orderId ? response.order : o)),
      );
      if (parseFloat(response.refundAmount) > 0) {
        setWalletBalance((prev) =>
          (parseFloat(prev) + parseFloat(response.refundAmount)).toFixed(2),
        );
      }
      toast.success('Order cancelled', {
        description:
          response.refundAmount !== '0'
            ? `Refunded: ${formatPrice(response.refundAmount)}`
            : 'Order has been cancelled',
      });
    } catch (err: any) {
      toast.error('Failed to cancel order', {
        description: err.response?.data?.message || 'Please try again.',
      });
    }
  };

  // Handle toggle favorite (with defensive null checks)
  const handleToggleFavorite = async (
    serviceId: string,
    countryId: string,
    providerId: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();

    const existing = favorites.find(
      (f) =>
        f.service?.id === serviceId &&
        f.country?.id === countryId &&
        f.provider?.id === providerId,
    );

    try {
      if (existing) {
        await removeFavorite(existing.id);
        setFavorites((prev) => prev.filter((f) => f.id !== existing.id));
        toast.success('Removed from favorites');
      } else {
        const response = await addFavorite(serviceId, countryId, providerId);
        const fav = response.favorite;
        // Only commit to state if the returned row has all relations.
        // Without this, a partial response could push a malformed entry
        // and crash the next render that hits the favorites filter.
        if (
          fav?.id &&
          fav?.country?.id &&
          fav?.service?.id &&
          fav?.provider?.id
        ) {
          setFavorites((prev) => [...prev, fav]);
          toast.success('Added to favorites');
        } else {
          toast.success('Added to favorites');
        }
      }
    } catch (err: any) {
      toast.error('Failed to update favorites', {
        description: err.response?.data?.message || 'Please try again.',
      });
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  // Remove completed/cancelled order from list
  const removeOrder = (id: string) => {
    setActiveOrders((prev) => prev.filter((o) => o.id !== id));
  };

  // Check if country is favorite (with defensive null checks)
  const isFavorite = (countryId: string) => {
    if (!selectedService?.id || !selectedProvider?.id) return false;
    return favorites.some(
      (f) =>
        f.country?.id === countryId &&
        f.service?.id === selectedService.id &&
        f.provider?.id === selectedProvider.id,
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="text-primary mx-auto mb-4 h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">SMS Activation</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Order phone numbers for instant SMS verification
          </p>
        </div>
      </div>

      {/* Provider Toggle */}
      {providers.length > 1 && (
        <div className="border-border bg-muted/50 relative flex max-w-xl items-center rounded-xl border p-1">
          <div
            className="bg-card border-border absolute h-[calc(100%-8px)] rounded-lg border shadow-md transition-all duration-300 ease-out"
            style={{
              width: `${100 / providers.length}%`,
              left: `calc(${(providers.findIndex((p) => p.id === selectedProvider?.id) * 100) / providers.length}% + 0.25rem)`,
            }}
          />
          {providers.map((provider) => {
            const tabLabel = provider.displayName;
            return (
              <button
                key={provider.id}
                onClick={() => setSelectedProvider(provider)}
                className={cn(
                  'relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-xs font-medium transition-colors sm:px-4 sm:text-sm',
                  selectedProvider?.id === provider.id
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {tabLabel}
              </button>
            );
          })}
        </div>
      )}

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="bg-success h-2 w-2 animate-pulse rounded-full" />
              Active Numbers ({activeOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeOrders
              .filter((order) => order && order.id)
              .map((order) => {
                const timeRemaining = order.expiresAt
                  ? getTimeRemaining(order.expiresAt)
                  : null;
                const statusColor = getOrderStatusColor(order.status);

                return (
                  <div
                    key={order.id}
                    className={cn(
                      'rounded-xl border p-3 transition-all sm:p-4',
                      order.status === 'COMPLETED'
                        ? 'bg-success/8 border-success/40 shadow-[0_0_16px_rgba(16,185,129,0.12)]'
                        : order.status === 'CANCELLED' ||
                            order.status === 'EXPIRED'
                          ? 'bg-muted/30 border-border opacity-60'
                          : 'bg-card border-border',
                    )}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      {/* Service + Country */}
                      <div className="flex min-w-0 flex-1 items-center gap-2.5">
                        <div className="bg-primary/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm">
                          {(() => {
                            const safe = safeServiceIcon(
                              order.service?.iconUrl,
                              order.service?.name,
                            );
                            return safe ? (
                              <img
                                src={safe}
                                alt=""
                                className="h-5 w-5"
                                loading="lazy"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display =
                                    'none';
                                }}
                              />
                            ) : (
                              '📱'
                            );
                          })()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold">
                              {order.service?.name || 'Service'}
                            </span>
                            <span className="text-base">
                              {getCountryFlag(
                                order.country?.code ?? '',
                                order.country?.name,
                              )}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              {order.country?.name || 'Country'}
                            </span>
                            {/* Service Type Badge (Premium/Standard/Economy) */}
                            {order.provider?.slug && (
                              <span
                                className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                                style={{
                                  backgroundColor: `${getServiceTypeLabel(order.provider.slug).color}20`,
                                  color: getServiceTypeLabel(
                                    order.provider.slug,
                                  ).color,
                                }}
                              >
                                {getServiceTypeLabel(order.provider.slug).label}
                              </span>
                            )}
                            <Badge
                              variant={
                                order.status === 'COMPLETED'
                                  ? 'default'
                                  : order.status === 'CANCELLED' ||
                                      order.status === 'EXPIRED'
                                    ? 'destructive'
                                    : 'secondary'
                              }
                              className="h-4 px-1.5 text-[10px]"
                            >
                              {getOrderStatusLabel(order.status)}
                            </Badge>
                          </div>
                          <code className="text-foreground font-mono text-sm font-semibold">
                            {order.phoneNumber || 'Waiting for number...'}
                          </code>
                          {order.smsCode && (
                            <div className="mt-1 flex items-center gap-2">
                              <code className="text-success font-mono text-sm font-bold">
                                {order.smsCode}
                              </code>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 shrink-0"
                                onClick={() => copyToClipboard(order.smsCode!)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Timer + Expiration */}
                      {(order.status === 'PENDING' ||
                        order.status === 'WAITING_SMS') &&
                        timeRemaining && (
                          <div className="flex shrink-0 flex-col items-end gap-1">
                            <div
                              className={cn(
                                'flex items-center gap-1.5 text-sm font-bold',
                                timeRemaining.minutes < 2
                                  ? 'text-destructive'
                                  : timeRemaining.minutes < 5
                                    ? 'text-warning'
                                    : 'text-foreground',
                              )}
                            >
                              <Clock
                                className={cn(
                                  'h-4 w-4',
                                  timeRemaining.minutes < 2 && 'animate-pulse',
                                )}
                              />
                              <span className="font-mono tabular-nums">
                                {timeRemaining.minutes} min{' '}
                                {timeRemaining.seconds
                                  .toString()
                                  .padStart(2, '0')}{' '}
                                sec
                              </span>
                            </div>
                            {order.expiresAt && (
                              <span className="text-muted-foreground text-xs">
                                Expires at{' '}
                                {new Date(order.expiresAt).toLocaleTimeString(
                                  [],
                                  { hour: '2-digit', minute: '2-digit' },
                                )}
                              </span>
                            )}
                          </div>
                        )}

                      {/* Copy number */}
                      {order.phoneNumber && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={() => copyToClipboard(order.phoneNumber!)}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      )}

                      {/* Actions */}
                      <div className="flex shrink-0 items-center gap-1">
                        {canCancelOrder(order.status) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive h-8"
                            onClick={() => handleCancelOrder(order.id)}
                          >
                            Cancel
                          </Button>
                        )}
                        {(order.status === 'COMPLETED' ||
                          order.status === 'CANCELLED' ||
                          order.status === 'EXPIRED') && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => removeOrder(order.id)}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {order.status === 'CANCELLED' && (
                      <div className="border-destructive/20 text-destructive mt-2 flex items-center gap-2 border-t pt-2 text-xs">
                        <AlertCircle className="h-3.5 w-3.5" />
                        Order cancelled - Refunded to wallet
                      </div>
                    )}

                    {(order.status === 'PENDING' ||
                      order.status === 'WAITING_SMS') &&
                      order.expiresAt && (
                        <div className="mt-3">
                          <Progress
                            value={Math.max(
                              0,
                              ((new Date(order.expiresAt).getTime() -
                                Date.now()) /
                                (15 * 60 * 1000)) *
                                100,
                            )}
                            className="h-1"
                          />
                        </div>
                      )}
                  </div>
                );
              })}
          </CardContent>
        </Card>
      )}

      {/* Two-column layout: Step 1 + Step 2 */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* STEP 1: Select a Service */}
        <Card className="flex max-h-[560px] flex-col overflow-hidden">
          <CardHeader className="shrink-0 pb-3">
            <div className="flex items-center gap-3">
              <div className="bg-primary text-primary-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                1
              </div>
              <CardTitle className="text-base sm:text-lg">
                Select a service
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="flex min-h-0 flex-1 flex-col gap-3 px-3 sm:px-6">
            {/* Search */}
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search by service"
                value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
                className="bg-muted/40 pl-9"
              />
            </div>

            {/* Service List - All services for selected provider.
                Search is server-side (debounced), so `services` already
                reflects the active query. Only dedupe locally to guard
                against any duplicate rows from the API. */}
            <div className="scrollbar-thin min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
              {(() => {
                const q = serviceSearch.toLowerCase();
                const filtered = services.filter(
                  (svc, idx, self) =>
                    self.findIndex((s) => s.name === svc.name) === idx,
                );

                if (!selectedProvider) {
                  return (
                    <div className="text-muted-foreground py-10 text-center text-sm">
                      Select a provider to see available services
                    </div>
                  );
                }

                // Show skeleton placeholders while the first page is loading
                // so the user doesn't see "No services available" flash.
                if (isLoadingServices && services.length === 0) {
                  return (
                    <div className="space-y-1">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                        >
                          <div className="bg-muted/60 h-8 w-8 shrink-0 animate-pulse rounded-lg" />
                          <div className="bg-muted/60 h-3 flex-1 animate-pulse rounded" />
                        </div>
                      ))}
                    </div>
                  );
                }

                if (filtered.length === 0) {
                  return (
                    <div className="text-muted-foreground py-10 text-center text-sm">
                      {q ? 'No services found' : 'No services available'}
                    </div>
                  );
                }

                return filtered.map((svc) => {
                  const isSelected = selectedService?.id === svc.id;
                  return (
                    <button
                      key={svc.id}
                      onClick={() => handleSelectService(svc)}
                      onMouseEnter={() => prefetchService(svc)}
                      onMouseLeave={cancelPrefetch}
                      onFocus={() => prefetchService(svc)}
                      onBlur={cancelPrefetch}
                      className={cn(
                        'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all',
                        isSelected
                          ? 'bg-primary/10 border-primary/30 border shadow-sm'
                          : 'hover:bg-muted/60 border border-transparent',
                      )}
                    >
                      <div className="bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm">
                        {(() => {
                          const safe = safeServiceIcon(
                            svc.iconUrl,
                            svc.name || svc.slug,
                          );
                          return safe ? (
                            <img
                              src={safe}
                              alt=""
                              className="h-5 w-5"
                              loading="lazy"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                // Google's favicon CDN redirects to
                                // t[1-3].gstatic.com which 404s for
                                // niche brands. Hide the broken img;
                                // the parent's emoji shows through.
                                (e.target as HTMLImageElement).style.display =
                                  'none';
                              }}
                            />
                          ) : (
                            '📱'
                          );
                        })()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <span
                          className={cn(
                            'block truncate text-sm font-medium',
                            isSelected ? 'text-primary' : 'text-foreground',
                          )}
                        >
                          {svc.name}
                        </span>
                      </div>

                      {isSelected && (
                        <ChevronRight className="text-primary h-4 w-4 shrink-0" />
                      )}
                    </button>
                  );
                });
              })()}

              {/* Infinite-scroll sentinel + loading indicator. Works for
                  both unfiltered list and search results since search is
                  server-side and paginated. */}
              {hasMoreServices && (
                <div
                  ref={loadMoreSentinelRef}
                  className="text-muted-foreground py-3 text-center text-xs"
                >
                  {isLoadingMoreServices ? 'Loading more…' : ' '}
                </div>
              )}
            </div>

            {/* Count footer — backend meta.total reflects full filtered
                count (provider + active search), not just what's loaded. */}
            <div className="border-border border-t pt-2">
              <span className="text-muted-foreground text-sm">
                {servicesTotal} {servicesTotal === 1 ? 'service' : 'services'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* STEP 2: Select Country */}
        <Card className="flex max-h-[560px] flex-col overflow-hidden">
          <CardHeader className="shrink-0 pb-3">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                  selectedService
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                2
              </div>
              <CardTitle
                className={cn(
                  'text-base sm:text-lg',
                  !selectedService && 'text-muted-foreground',
                )}
              >
                Select your country
              </CardTitle>
              {isLoadingProducts && (
                <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
              )}
            </div>
          </CardHeader>

          <CardContent className="flex min-h-0 flex-1 flex-col gap-3 px-3 sm:px-6">
            {!selectedService ? (
              /* Empty state */
              <div className="flex flex-1 flex-col items-center justify-center gap-3 py-12 text-center">
                <div className="bg-muted flex h-14 w-14 items-center justify-center rounded-2xl text-2xl">
                  📱
                </div>
                <div>
                  <p className="text-sm font-medium">Pick a service first</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Select a service from step 1 to see available countries
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Search + Filters */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                      placeholder="Search by country"
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      className="bg-muted/40 pl-9"
                    />
                  </div>
                </div>

                {/* Filter Chips */}
                <div className="flex flex-wrap gap-2">
                  <div className="flex gap-1.5">
                    <Button
                      variant={countryFilter === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCountryFilter('all')}
                      className="h-8 text-xs"
                    >
                      <Globe className="mr-1.5 h-3 w-3" />
                      All
                    </Button>
                    <Button
                      variant={
                        countryFilter === 'available' ? 'default' : 'outline'
                      }
                      size="sm"
                      onClick={() => setCountryFilter('available')}
                      className="h-8 text-xs"
                    >
                      <TrendingUp className="mr-1.5 h-3 w-3" />
                      Available
                    </Button>
                    <Button
                      variant={
                        countryFilter === 'favorites' ? 'default' : 'outline'
                      }
                      size="sm"
                      onClick={() => setCountryFilter('favorites')}
                      className="h-8 text-xs"
                    >
                      <Star
                        className={cn(
                          'mr-1.5 h-3 w-3',
                          countryFilter === 'favorites' && 'fill-current',
                        )}
                      />
                      Favorites
                    </Button>
                  </div>

                  {/* Price Sort */}
                  <div className="ml-auto flex gap-1.5">
                    <Button
                      variant={priceSort === 'low-high' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() =>
                        setPriceSort(
                          priceSort === 'low-high' ? 'none' : 'low-high',
                        )
                      }
                      className="h-8 text-xs"
                    >
                      <ArrowUpDown className="mr-1.5 h-3 w-3" />
                      Low → High
                    </Button>
                    <Button
                      variant={priceSort === 'high-low' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() =>
                        setPriceSort(
                          priceSort === 'high-low' ? 'none' : 'high-low',
                        )
                      }
                      className="h-8 text-xs"
                    >
                      <ArrowUpDown className="mr-1.5 h-3 w-3" />
                      High → Low
                    </Button>
                  </div>
                </div>

                {/* Country list */}
                <div className="scrollbar-thin min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
                  {filteredCountries.length === 0 && (
                    <div className="text-muted-foreground py-10 text-center text-sm">
                      {isLoadingProducts
                        ? 'Loading prices...'
                        : countryFilter === 'favorites'
                          ? 'No favorite countries yet'
                          : 'No countries available for this service'}
                    </div>
                  )}
                  {filteredCountries.map(
                    ({
                      country,
                      products: countryProducts,
                      minPrice,
                      totalAvailable,
                    }) => {
                      const isOut = totalAvailable === 0;
                      const isFav = isFavorite(country.id);
                      const bestProduct = countryProducts.reduce((best, p) =>
                        parseFloat(p.yourPrice) < parseFloat(best.yourPrice)
                          ? p
                          : best,
                      );

                      return (
                        <div
                          key={country.id}
                          className={cn(
                            'overflow-hidden rounded-xl border transition-all',
                            isOut
                              ? 'border-border opacity-50'
                              : 'border-border hover:border-primary/30',
                          )}
                        >
                          <div className="bg-card/50 flex items-center gap-3 px-3 py-2.5">
                            {/* Favorite Star */}
                            <button
                              onClick={(e) =>
                                handleToggleFavorite(
                                  selectedService!.id,
                                  country.id,
                                  selectedProvider!.id,
                                  e,
                                )
                              }
                              className="shrink-0 p-0.5"
                              title={
                                isFav
                                  ? 'Remove from favorites'
                                  : 'Add to favorites'
                              }
                            >
                              <Star
                                className={cn(
                                  'h-4 w-4 transition-colors',
                                  isFav
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-muted-foreground/40 hover:text-muted-foreground',
                                )}
                              />
                            </button>

                            {/* Flag */}
                            <span className="w-8 shrink-0 text-center text-xl">
                              {getCountryFlag(country.code, country.name)}
                            </span>

                            {/* Name + count */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="truncate text-sm font-medium capitalize">
                                  {country.name}
                                </span>
                              </div>
                              <span className="text-muted-foreground text-xs tabular-nums">
                                {totalAvailable.toLocaleString()} available
                              </span>
                            </div>

                            <div className="flex shrink-0 flex-col items-end text-right">
                              <span className="text-sm font-bold tabular-nums">
                                {formatPrice(bestProduct.yourPrice)}
                              </span>
                            </div>
                          </div>

                          {/* Buy button */}
                          <Button
                            className="h-9 w-full rounded-none rounded-b-xl text-sm font-semibold"
                            disabled={isOut || activatingProductId !== null}
                            onClick={() => handleBuySMS(bestProduct)}
                          >
                            {activatingProductId === bestProduct.id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Activating...
                              </>
                            ) : isOut ? (
                              'Unavailable'
                            ) : (
                              'Buy SMS'
                            )}
                          </Button>
                        </div>
                      );
                    },
                  )}
                </div>

                {/* Count footer */}
                <div className="border-border flex items-center justify-between border-t pt-2 text-xs">
                  <span className="text-muted-foreground">
                    {filteredCountries.length} countries available
                  </span>
                  {(countryFilter !== 'all' || priceSort !== 'none') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground h-6 text-xs"
                      onClick={() => {
                        setCountryFilter('all');
                        setPriceSort('none');
                      }}
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
