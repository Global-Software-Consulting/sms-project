'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
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
  canCancelOrder,
  getTimeRemaining,
  formatPrice,
} from '@/lib/api/smsApi';
import { getWalletBalance, formatBalance } from '@/lib/api/walletApi';

type CountryFilterType = 'all' | 'favorites' | 'available';
type PriceSortType = 'none' | 'low-high' | 'high-low';

export default function Activation() {
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
  const [activatingProductId, setActivatingProductId] = useState<string | null>(null);

  // Selection state
  const [selectedProvider, setSelectedProvider] = useState<SmsProvider | null>(null);
  const [selectedService, setSelectedService] = useState<SmsService | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<SmsCountry | null>(null);

  // Search & filter state
  const [serviceSearch, setServiceSearch] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [countryFilter, setCountryFilter] = useState<CountryFilterType>('all');
  const [priceSort, setPriceSort] = useState<PriceSortType>('none');

  // Active orders state
  const [activeOrders, setActiveOrders] = useState<SmsOrder[]>([]);
  const [pollingOrders, setPollingOrders] = useState<Set<string>>(new Set());

  // Fetch initial data - optimized to load essential data first
  const fetchInitialData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Load essential data first (providers, balance)
      const [providersRes, balanceRes] =
        await Promise.allSettled([
          getProviders(),
          getWalletBalance(),
        ]);

      if (providersRes.status === 'fulfilled') {
        const activeProviders = providersRes.value.providers?.filter(p => p.isActive) || [];
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
          setFavorites(favoritesRes.value.data || []);
        }
      });
    } catch (err) {
      console.error('Failed to fetch initial data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch products when service/provider changes - uses REAL-TIME API
  const fetchProducts = useCallback(async () => {
    if (!selectedService || !selectedProvider) return;

    try {
      setIsLoadingProducts(true);
      // Use real-time API to get fresh prices from provider
      const response = await getProductsRealtime(
        selectedProvider.id,
        selectedService.id,
      );
      setProducts(response.data || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      // Fallback to cached products if real-time fails
      try {
        const fallbackResponse = await getProducts({
          providerId: selectedProvider.id,
          serviceId: selectedService.id,
          limit: 100,
        });
        setProducts(fallbackResponse.data || []);
      } catch {
        setProducts([]);
      }
    } finally {
      setIsLoadingProducts(false);
    }
  }, [selectedProvider, selectedService]);

  // Initial load
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Fetch services when provider changes
  useEffect(() => {
    if (!selectedProvider) return;
    
    const fetchServicesForProvider = async () => {
      try {
        // Fetch services for the selected provider (up to 200)
        const response = await getServices({ 
          providerId: selectedProvider.id,
          limit: 200 
        });
        setServices(response.data || []);
        // Clear selected service when provider changes
        setSelectedService(null);
        setProducts([]);
      } catch (err) {
        console.error('Failed to fetch services for provider:', err);
        setServices([]);
      }
    };
    
    fetchServicesForProvider();
  }, [selectedProvider]);

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

  // Poll active orders for SMS
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      const ordersToCheck = activeOrders.filter(
        order => order.status === 'PENDING' || order.status === 'WAITING_SMS'
      );

      for (const order of ordersToCheck) {
        if (pollingOrders.has(order.id)) continue;

        try {
          setPollingOrders(prev => new Set(prev).add(order.id));
          const response = await checkOrderStatus(order.id);

          setActiveOrders(prev =>
            prev.map(o => (o.id === order.id ? response.order : o))
          );

          if (response.order.status === 'COMPLETED' && response.order.smsCode) {
            toast.success('SMS Received!', {
              description: `Code: ${response.order.smsCode}`,
            });
          }
        } catch (err) {
          console.error('Failed to check order status:', err);
        } finally {
          setPollingOrders(prev => {
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
    const iv = setInterval(() => setActiveOrders(p => [...p]), 1000);
    return () => clearInterval(iv);
  }, []);

  // Filter services by search (provider filtering is done in API call)
  const filteredServices = useMemo(() => {
    const q = serviceSearch.toLowerCase();
    if (!q) return services;
    return services.filter(s => s.name.toLowerCase().includes(q));
  }, [services, serviceSearch]);

  // Get products grouped by country
  const productsByCountry = useMemo(() => {
    const grouped = new Map<string, SmsProduct[]>();
    products.forEach(product => {
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
    let list = Array.from(productsByCountry.entries()).map(([countryId, prods]) => ({
      country: prods[0].country,
      products: prods,
      minPrice: Math.min(...prods.map(p => parseFloat(p.yourPrice))),
      totalAvailable: prods.reduce((sum, p) => sum + p.availableCount, 0),
    }));

    // Search filter
    const q = countrySearch.toLowerCase();
    if (q) {
      list = list.filter(item => item.country.name.toLowerCase().includes(q));
    }

    // Favorites filter
    if (countryFilter === 'favorites') {
      const favoriteCountryIds = new Set(favorites.map(f => f.country.id));
      list = list.filter(item => favoriteCountryIds.has(item.country.id));
    }

    // Available filter
    if (countryFilter === 'available') {
      list = list.filter(item => item.totalAvailable > 0);
    }

    // Price sorting
    if (priceSort === 'low-high') {
      list.sort((a, b) => a.minPrice - b.minPrice);
    } else if (priceSort === 'high-low') {
      list.sort((a, b) => b.minPrice - a.minPrice);
    }

    return list;
  }, [productsByCountry, countrySearch, countryFilter, priceSort, favorites]);

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

      setActiveOrders(prev => [response.order, ...prev]);
      setWalletBalance(prev => (parseFloat(prev) - price).toFixed(2));

      toast.success('Number activated!', {
        description: `${selectedService.name} / ${product.country.name} - Waiting for SMS...`,
      });
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
      setActiveOrders(prev =>
        prev.map(o => (o.id === orderId ? response.order : o))
      );
      setWalletBalance(prev =>
        (parseFloat(prev) + parseFloat(response.refundAmount)).toFixed(2)
      );
      toast.success('Order cancelled', {
        description: `Refunded: ${formatPrice(response.refundAmount)}`,
      });
    } catch (err: any) {
      toast.error('Failed to cancel order', {
        description: err.response?.data?.message || 'Please try again.',
      });
    }
  };

  // Handle toggle favorite
  const handleToggleFavorite = async (
    serviceId: string,
    countryId: string,
    providerId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    const existing = favorites.find(
      f =>
        f.service.id === serviceId &&
        f.country.id === countryId &&
        f.provider.id === providerId
    );

    try {
      if (existing) {
        await removeFavorite(existing.id);
        setFavorites(prev => prev.filter(f => f.id !== existing.id));
        toast.success('Removed from favorites');
      } else {
        const response = await addFavorite(serviceId, countryId, providerId);
        setFavorites(prev => [...prev, response.favorite]);
        toast.success('Added to favorites');
      }
    } catch (err) {
      toast.error('Failed to update favorites');
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  // Remove completed/cancelled order from list
  const removeOrder = (id: string) => {
    setActiveOrders(prev => prev.filter(o => o.id !== id));
  };

  // Check if country is favorite
  const isFavorite = (countryId: string) => {
    return favorites.some(
      f =>
        f.country.id === countryId &&
        f.service.id === selectedService?.id &&
        f.provider.id === selectedProvider?.id
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

        {/* Balance & Selection Crumbs */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-sm">
            Balance: {formatBalance(walletBalance, 'USD')}
          </Badge>

          {selectedService && (
            <div className="border-border bg-card flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium">
              {selectedService.iconUrl ? (
                <img
                  src={selectedService.iconUrl}
                  alt=""
                  className="h-4 w-4"
                />
              ) : (
                <span>📱</span>
              )}
              <span>{selectedService.name}</span>
            </div>
          )}

          {selectedService && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground h-8 px-2"
              onClick={() => {
                setSelectedService(null);
                setSelectedCountry(null);
                setProducts([]);
              }}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Provider Toggle */}
      {providers.length > 1 && (
        <div className="border-border bg-muted/50 relative flex max-w-xl items-center rounded-xl border p-1">
          <div
            className="bg-card border-border absolute h-[calc(100%-8px)] rounded-lg border shadow-md transition-all duration-300 ease-out"
            style={{
              width: `${100 / providers.length}%`,
              left: `calc(${(providers.findIndex(p => p.id === selectedProvider?.id) * 100) / providers.length}% + 0.25rem)`,
            }}
          />
          {providers.map(provider => {
            const badge = getProviderBadge(provider.slug);
            return (
              <button
                key={provider.id}
                onClick={() => setSelectedProvider(provider)}
                className={cn(
                  'relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-xs font-medium transition-colors sm:px-4 sm:text-sm',
                  selectedProvider?.id === provider.id
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <span>{badge.icon}</span>
                <span className="hidden sm:inline">{provider.displayName}</span>
                <span className="sm:hidden">{badge.label}</span>
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
            {activeOrders.map(order => {
              const timeRemaining = getTimeRemaining(order.expiresAt);
              const statusColor = getOrderStatusColor(order.status);

              return (
                <div
                  key={order.id}
                  className={cn(
                    'rounded-xl border p-3 transition-all sm:p-4',
                    order.status === 'COMPLETED'
                      ? 'bg-success/8 border-success/40 shadow-[0_0_16px_rgba(16,185,129,0.12)]'
                      : order.status === 'CANCELLED' || order.status === 'EXPIRED'
                        ? 'bg-muted/30 border-border opacity-60'
                        : 'bg-card border-border'
                  )}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    {/* Service + Country */}
                    <div className="flex min-w-0 flex-1 items-center gap-2.5">
                      <div className="bg-primary/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm">
                        {order.service?.iconUrl ? (
                          <img
                            src={order.service.iconUrl}
                            alt=""
                            className="h-5 w-5"
                          />
                        ) : (
                          '📱'
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold">
                            {order.service?.name || 'Service'}
                          </span>
                          <span className="text-base">
                            {order.country?.code
                              ? getCountryFlag(order.country.code)
                              : '🌍'}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {order.country?.name || 'Country'}
                          </span>
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
                        <code className="text-muted-foreground font-mono text-xs">
                          {order.phoneNumber || 'Waiting for number...'}
                        </code>
                      </div>
                    </div>

                    {/* Timer */}
                    {(order.status === 'PENDING' ||
                      order.status === 'WAITING_SMS') && (
                      <div className="text-muted-foreground flex shrink-0 items-center gap-1.5 text-sm">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="font-mono tabular-nums">
                          {timeRemaining.minutes}:
                          {timeRemaining.seconds.toString().padStart(2, '0')}
                        </span>
                      </div>
                    )}

                    {/* SMS Code */}
                    {order.smsCode && (
                      <div className="bg-success/15 border-success/30 flex shrink-0 items-center gap-2 rounded-lg border px-3 py-1.5">
                        <span className="text-success text-xs font-medium">
                          Code:
                        </span>
                        <code className="text-success font-mono font-bold">
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
                    order.status === 'WAITING_SMS') && (
                    <div className="mt-3">
                      <Progress
                        value={Math.max(
                          0,
                          ((new Date(order.expiresAt).getTime() - Date.now()) /
                            (15 * 60 * 1000)) *
                            100
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
      <div className="grid gap-5 lg:grid-cols-2">
        {/* STEP 1: Select a Service */}
        <Card className="flex max-h-[560px] flex-col">
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

          <CardContent className="flex min-h-0 flex-1 flex-col gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search by service"
                value={serviceSearch}
                onChange={e => setServiceSearch(e.target.value)}
                className="bg-muted/40 pl-9"
              />
            </div>

            {/* Service List */}
            <div className="scrollbar-thin min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
              {filteredServices.length === 0 && (
                <div className="text-muted-foreground py-10 text-center text-sm">
                  No services found
                </div>
              )}
              {filteredServices.map(svc => {
                const isSelected = selectedService?.id === svc.id;
                return (
                  <button
                    key={svc.id}
                    onClick={() => handleSelectService(svc)}
                    className={cn(
                      'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all',
                      isSelected
                        ? 'bg-primary/10 border-primary/30 border shadow-sm'
                        : 'hover:bg-muted/60 border border-transparent'
                    )}
                  >
                    {/* Icon */}
                    <div className="bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm">
                      {svc.iconUrl ? (
                        <img src={svc.iconUrl} alt="" className="h-5 w-5" />
                      ) : (
                        '📱'
                      )}
                    </div>

                    {/* Name */}
                    <span
                      className={cn(
                        'flex-1 truncate text-sm font-medium',
                        isSelected ? 'text-primary' : 'text-foreground'
                      )}
                    >
                      {svc.name}
                    </span>

                    {/* Category */}
                    {svc.category && (
                      <Badge variant="secondary" className="text-xs">
                        {svc.category}
                      </Badge>
                    )}

                    {isSelected && (
                      <ChevronRight className="text-primary h-4 w-4 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Count footer */}
            <div className="border-border border-t pt-2">
              <span className="text-muted-foreground text-sm">
                {filteredServices.length} services available
              </span>
            </div>
          </CardContent>
        </Card>

        {/* STEP 2: Select Country */}
        <Card className="flex max-h-[560px] flex-col">
          <CardHeader className="shrink-0 pb-3">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                  selectedService
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                2
              </div>
              <CardTitle
                className={cn(
                  'text-base sm:text-lg',
                  !selectedService && 'text-muted-foreground'
                )}
              >
                Select your country
              </CardTitle>
              {isLoadingProducts && (
                <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
              )}
            </div>
          </CardHeader>

          <CardContent className="flex min-h-0 flex-1 flex-col gap-3">
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
                      onChange={e => setCountrySearch(e.target.value)}
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
                          countryFilter === 'favorites' && 'fill-current'
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
                        setPriceSort(priceSort === 'low-high' ? 'none' : 'low-high')
                      }
                      className="h-8 text-xs"
                    >
                      <ArrowUpDown className="mr-1.5 h-3 w-3" />
                      Low → High
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
                  {filteredCountries.map(({ country, products: countryProducts, minPrice, totalAvailable }) => {
                    const isOut = totalAvailable === 0;
                    const isFav = isFavorite(country.id);
                    const bestProduct = countryProducts.reduce((best, p) =>
                      parseFloat(p.yourPrice) < parseFloat(best.yourPrice) ? p : best
                    );

                    return (
                      <div
                        key={country.id}
                        className={cn(
                          'overflow-hidden rounded-xl border transition-all',
                          isOut
                            ? 'border-border opacity-50'
                            : 'border-border hover:border-primary/30'
                        )}
                      >
                        <div className="bg-card/50 flex items-center gap-3 px-3 py-2.5">
                          {/* Favorite Star */}
                          <button
                            onClick={e =>
                              handleToggleFavorite(
                                selectedService!.id,
                                country.id,
                                selectedProvider!.id,
                                e
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
                                  : 'text-muted-foreground/40 hover:text-muted-foreground'
                              )}
                            />
                          </button>

                          {/* Flag */}
                          <span className="w-8 shrink-0 text-center text-xl">
                            {getCountryFlag(country.code)}
                          </span>

                          {/* Name + count */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {country.name}
                              </span>
                            </div>
                            <span className="text-muted-foreground text-xs tabular-nums">
                              {totalAvailable.toLocaleString()} available
                            </span>
                          </div>

                          {/* Price */}
                          <span className="shrink-0 text-sm font-bold tabular-nums">
                            {formatPrice(bestProduct.yourPrice)}
                          </span>
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
                  })}
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
