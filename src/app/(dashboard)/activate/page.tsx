'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Search, 
  Star, 
  StarOff,
  RefreshCw,
  ChevronDown,
  Copy,
  Check,
  Clock,
  AlertCircle,
  Smartphone,
  Globe,
  Filter,
  X,
  Loader2,
  Heart,
  Zap
} from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { DashboardShell } from '@/components/layout';
import { useAuth } from '@/hooks';
import {
  getProviders,
  getServices,
  getCountries,
  getProducts,
  activateNumber,
  checkOrderStatus,
  cancelOrder,
  addFavorite,
  removeFavorite,
  getFavorites,
  getWalletBalance,
  SmsProvider,
  SmsService,
  SmsCountry,
  SmsProduct,
  SmsOrder,
  SmsFavorite,
  formatPrice,
  getCountryFlag,
  getProviderBadge,
  getOrderStatusLabel,
  getOrderStatusColor,
  canCancelOrder,
  getTimeRemaining,
  SERVICE_CATEGORIES,
} from '@/lib/api';

type ViewMode = 'browse' | 'order';

export default function ActivatePage() {
  const { user } = useAuth();
  
  // Data states
  const [providers, setProviders] = useState<SmsProvider[]>([]);
  const [services, setServices] = useState<SmsService[]>([]);
  const [countries, setCountries] = useState<SmsCountry[]>([]);
  const [products, setProducts] = useState<SmsProduct[]>([]);
  const [favorites, setFavorites] = useState<SmsFavorite[]>([]);
  const [balance, setBalance] = useState<string>('0.00');
  
  // Selection states
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(true);
  
  // UI states
  const [viewMode, setViewMode] = useState<ViewMode>('browse');
  const [activeOrder, setActiveOrder] = useState<SmsOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  
  // Polling ref
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial data
  useEffect(() => {
    loadInitialData();
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // Load products when filters change
  useEffect(() => {
    if (selectedProvider) {
      loadProducts();
    }
  }, [selectedProvider, selectedService, selectedCountry, selectedCategory, showOnlyAvailable]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [providersRes, balanceRes, favoritesRes] = await Promise.all([
        getProviders(),
        getWalletBalance(),
        getFavorites({ limit: 100 }),
      ]);
      
      setProviders(providersRes.providers.filter(p => p.isActive));
      setBalance(balanceRes.balance);
      setFavorites(favoritesRes.data);
      
      // Select first provider by default
      if (providersRes.providers.length > 0) {
        const firstActive = providersRes.providers.find(p => p.isActive);
        if (firstActive) {
          setSelectedProvider(firstActive.id);
          // Load services and countries for this provider
          const [servicesRes, countriesRes] = await Promise.all([
            getServices({ providerId: firstActive.id, limit: 200 }),
            getCountries({ providerId: firstActive.id, limit: 200 }),
          ]);
          setServices(servicesRes.data);
          setCountries(countriesRes.data);
        }
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
      setError('Failed to load data. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadProducts = async () => {
    if (!selectedProvider) return;
    
    setIsLoadingProducts(true);
    try {
      const res = await getProducts({
        providerId: selectedProvider,
        serviceId: selectedService || undefined,
        countryId: selectedCountry || undefined,
        category: selectedCategory || undefined,
        search: searchQuery || undefined,
        limit: 100,
      });
      
      let filteredProducts = res.data;
      
      // Filter by availability if toggle is on
      if (showOnlyAvailable) {
        filteredProducts = filteredProducts.filter(p => p.availableCount > 0);
      }
      
      setProducts(filteredProducts);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleProviderChange = async (providerId: string) => {
    setSelectedProvider(providerId);
    setSelectedService('');
    setSelectedCountry('');
    setProducts([]);
    
    try {
      const [servicesRes, countriesRes] = await Promise.all([
        getServices({ providerId, limit: 200 }),
        getCountries({ providerId, limit: 200 }),
      ]);
      setServices(servicesRes.data);
      setCountries(countriesRes.data);
    } catch (err) {
      console.error('Failed to load provider data:', err);
    }
  };

  const handlePurchase = async (product: SmsProduct) => {
    if (isPurchasing) return;
    
    const balanceNum = parseFloat(balance);
    const priceNum = parseFloat(product.yourPrice);
    
    if (balanceNum < priceNum) {
      setError('Insufficient balance. Please add funds to your wallet.');
      return;
    }
    
    setIsPurchasing(true);
    setError(null);
    
    try {
      const res = await activateNumber(product.id);
      setActiveOrder(res.order);
      setViewMode('order');
      
      // Start polling for SMS
      startPolling(res.order.id);
      
      // Refresh balance
      const balanceRes = await getWalletBalance();
      setBalance(balanceRes.balance);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to purchase number. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  const startPolling = (orderId: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    
    pollingRef.current = setInterval(async () => {
      try {
        const res = await checkOrderStatus(orderId);
        setActiveOrder(res.order);
        
        // Stop polling if order is complete or cancelled
        if (['COMPLETED', 'CANCELLED', 'EXPIRED', 'REFUNDED'].includes(res.order.status)) {
          if (pollingRef.current) clearInterval(pollingRef.current);
          
          // Refresh balance if refunded
          if (['CANCELLED', 'EXPIRED', 'REFUNDED'].includes(res.order.status)) {
            const balanceRes = await getWalletBalance();
            setBalance(balanceRes.balance);
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 3000); // Poll every 3 seconds
  };

  const handleCancelOrder = async () => {
    if (!activeOrder || isCancelling) return;
    
    setIsCancelling(true);
    try {
      const res = await cancelOrder(activeOrder.id);
      setActiveOrder(res.order);
      
      if (pollingRef.current) clearInterval(pollingRef.current);
      
      // Refresh balance
      const balanceRes = await getWalletBalance();
      setBalance(balanceRes.balance);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleBackToBrowse = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    setActiveOrder(null);
    setViewMode('browse');
    loadProducts();
  };

  const handleToggleFavorite = async (product: SmsProduct) => {
    const existingFav = favorites.find(
      f => f.service.id === product.service.id && 
           f.country.id === product.country.id && 
           f.provider.id === product.provider.id
    );
    
    try {
      if (existingFav) {
        await removeFavorite(existingFav.id);
        setFavorites(favorites.filter(f => f.id !== existingFav.id));
      } else {
        const res = await addFavorite(product.service.id, product.country.id, product.provider.id);
        setFavorites([...favorites, res.favorite]);
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const isFavorite = (product: SmsProduct) => {
    return favorites.some(
      f => f.service.id === product.service.id && 
           f.country.id === product.country.id && 
           f.provider.id === product.provider.id
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) return null;

  return (
    <DashboardShell>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              SMS Activation
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Get virtual phone numbers for SMS verification
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              padding: '12px 20px', 
              backgroundColor: 'var(--bg-card)', 
              borderRadius: '12px', 
              border: '1px solid var(--border-default)' 
            }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Balance</span>
              <p style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-gold)' }}>
                {formatPrice(balance)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div style={{ 
          marginBottom: '24px', 
          padding: '16px', 
          backgroundColor: 'rgba(239, 68, 68, 0.1)', 
          border: '1px solid rgba(239, 68, 68, 0.3)', 
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <AlertCircle style={{ width: '20px', height: '20px', color: 'var(--danger)' }} />
          <span style={{ color: 'var(--danger)', flex: 1 }}>{error}</span>
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X style={{ width: '16px', height: '16px', color: 'var(--danger)' }} />
          </button>
        </div>
      )}

      {isLoading ? (
        <LoadingState />
      ) : viewMode === 'order' && activeOrder ? (
        <OrderView 
          order={activeOrder}
          onCancel={handleCancelOrder}
          onBack={handleBackToBrowse}
          isCancelling={isCancelling}
          onCopy={copyToClipboard}
          copiedCode={copiedCode}
        />
      ) : (
        <>
          {/* Provider Tabs */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ 
              display: 'flex', 
              gap: '8px', 
              padding: '4px', 
              backgroundColor: 'var(--bg-card)', 
              borderRadius: '16px', 
              border: '1px solid var(--border-default)',
              overflowX: 'auto'
            }}>
              {providers.map((provider) => {
                const badge = getProviderBadge(provider.slug);
                const isSelected = selectedProvider === provider.id;
                return (
                  <button
                    key={provider.id}
                    onClick={() => handleProviderChange(provider.id)}
                    style={{
                      flex: '1 0 auto',
                      minWidth: '180px',
                      padding: '14px 20px',
                      borderRadius: '12px',
                      border: 'none',
                      backgroundColor: isSelected ? 'rgba(198, 167, 94, 0.15)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 200ms ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px'
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>{badge.icon}</span>
                    <span style={{ 
                      fontWeight: 600, 
                      color: isSelected ? 'var(--accent-gold)' : 'var(--text-secondary)',
                      whiteSpace: 'nowrap'
                    }}>
                      {provider.displayName}
                    </span>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: isSelected ? badge.color : 'var(--bg-secondary)',
                      color: isSelected ? '#000' : 'var(--text-muted)'
                    }}>
                      {badge.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filters Row */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px', 
            marginBottom: '24px' 
          }}>
            {/* Service Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  setShowServiceDropdown(!showServiceDropdown);
                  setShowCountryDropdown(false);
                }}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  color: 'var(--text-primary)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Smartphone style={{ width: '18px', height: '18px', color: 'var(--text-muted)' }} />
                  <span>
                    {selectedService 
                      ? services.find(s => s.id === selectedService)?.name || 'Select Service'
                      : 'All Services'
                    }
                  </span>
                </div>
                <ChevronDown style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
              </button>
              
              {showServiceDropdown && (
                <DropdownMenu
                  items={[
                    { id: '', name: 'All Services', iconUrl: null },
                    ...filteredServices
                  ]}
                  selectedId={selectedService}
                  onSelect={(id) => {
                    setSelectedService(id);
                    setShowServiceDropdown(false);
                  }}
                  onClose={() => setShowServiceDropdown(false)}
                  searchPlaceholder="Search services..."
                  onSearch={setSearchQuery}
                />
              )}
            </div>

            {/* Country Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  setShowCountryDropdown(!showCountryDropdown);
                  setShowServiceDropdown(false);
                }}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  color: 'var(--text-primary)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Globe style={{ width: '18px', height: '18px', color: 'var(--text-muted)' }} />
                  <span>
                    {selectedCountry 
                      ? `${getCountryFlag(countries.find(c => c.id === selectedCountry)?.code || '')} ${countries.find(c => c.id === selectedCountry)?.name || 'Select Country'}`
                      : 'All Countries'
                    }
                  </span>
                </div>
                <ChevronDown style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
              </button>
              
              {showCountryDropdown && (
                <DropdownMenu
                  items={[
                    { id: '', name: 'All Countries', code: '', iconUrl: null },
                    ...filteredCountries.map(c => ({ ...c, name: `${getCountryFlag(c.code)} ${c.name}` }))
                  ]}
                  selectedId={selectedCountry}
                  onSelect={(id) => {
                    setSelectedCountry(id);
                    setShowCountryDropdown(false);
                  }}
                  onClose={() => setShowCountryDropdown(false)}
                  searchPlaceholder="Search countries..."
                  onSearch={setSearchQuery}
                />
              )}
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '14px 16px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: '12px',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              <option value="">All Categories</option>
              {SERVICE_CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>

            {/* Available Only Toggle */}
            <button
              onClick={() => setShowOnlyAvailable(!showOnlyAvailable)}
              style={{
                padding: '14px 16px',
                backgroundColor: showOnlyAvailable ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-card)',
                border: `1px solid ${showOnlyAvailable ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-default)'}`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                color: showOnlyAvailable ? 'var(--success)' : 'var(--text-secondary)'
              }}
            >
              <Zap style={{ width: '16px', height: '16px' }} />
              <span style={{ fontWeight: 500 }}>Available Only</span>
            </button>
          </div>

          {/* Products Grid */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              marginBottom: '16px' 
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Available Numbers
                <span style={{ 
                  marginLeft: '8px', 
                  fontSize: '14px', 
                  color: 'var(--text-muted)', 
                  fontWeight: 400 
                }}>
                  ({products.length} results)
                </span>
              </h2>
              <button
                onClick={loadProducts}
                disabled={isLoadingProducts}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)'
                }}
              >
                <RefreshCw style={{ 
                  width: '14px', 
                  height: '14px',
                  animation: isLoadingProducts ? 'spin 1s linear infinite' : 'none'
                }} />
                <span>Refresh</span>
              </button>
            </div>

            {isLoadingProducts ? (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                gap: '16px' 
              }}>
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="skeleton" style={{ height: '140px', borderRadius: '16px' }} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <EmptyState 
                message={selectedService || selectedCountry 
                  ? "No numbers available for this selection. Try different filters."
                  : "Select a service or country to see available numbers."
                }
              />
            ) : (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                gap: '16px' 
              }}>
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isFavorite={isFavorite(product)}
                    onPurchase={() => handlePurchase(product)}
                    onToggleFavorite={() => handleToggleFavorite(product)}
                    isPurchasing={isPurchasing}
                    balance={balance}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </DashboardShell>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function LoadingState() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '80px 24px' 
    }}>
      <Loader2 style={{ 
        width: '48px', 
        height: '48px', 
        color: 'var(--accent-gold)',
        animation: 'spin 1s linear infinite'
      }} />
      <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Loading providers...</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div style={{ 
      padding: '64px 24px', 
      textAlign: 'center',
      backgroundColor: 'var(--bg-card)',
      borderRadius: '16px',
      border: '1px dashed var(--border-default)'
    }}>
      <div style={{ 
        width: '64px', 
        height: '64px', 
        margin: '0 auto 16px', 
        borderRadius: '16px', 
        backgroundColor: 'rgba(198, 167, 94, 0.1)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Smartphone style={{ width: '32px', height: '32px', color: 'var(--accent-gold)' }} />
      </div>
      <p style={{ color: 'var(--text-muted)', maxWidth: '320px', margin: '0 auto' }}>
        {message}
      </p>
    </div>
  );
}

interface DropdownMenuProps {
  items: Array<{ id: string; name: string; iconUrl?: string | null; code?: string }>;
  selectedId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
  searchPlaceholder: string;
  onSearch: (query: string) => void;
}

function DropdownMenu({ items, selectedId, onSelect, onClose, searchPlaceholder, onSearch }: DropdownMenuProps) {
  const [localSearch, setLocalSearch] = useState('');
  
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(localSearch.toLowerCase())
  );

  return (
    <>
      <div 
        style={{ position: 'fixed', inset: 0, zIndex: 40 }} 
        onClick={onClose}
      />
      <div style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        marginTop: '8px',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        borderRadius: '12px',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 50,
        maxHeight: '320px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '12px', borderBottom: '1px solid var(--border-default)' }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              width: '16px', 
              height: '16px', 
              color: 'var(--text-muted)' 
            }} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                onSearch(e.target.value);
              }}
              style={{
                width: '100%',
                padding: '10px 12px 10px 40px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-default)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                outline: 'none'
              }}
              autoFocus
            />
          </div>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {filteredItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              style={{
                width: '100%',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: selectedId === item.id ? 'rgba(198, 167, 94, 0.1)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: selectedId === item.id ? 'var(--accent-gold)' : 'var(--text-primary)',
                textAlign: 'left',
                transition: 'background-color 150ms ease'
              }}
            >
              {item.iconUrl && (
                <img 
                  src={item.iconUrl} 
                  alt="" 
                  style={{ width: '20px', height: '20px', borderRadius: '4px' }} 
                />
              )}
              <span style={{ flex: 1 }}>{item.name}</span>
              {selectedId === item.id && (
                <Check style={{ width: '16px', height: '16px' }} />
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

interface ProductCardProps {
  product: SmsProduct;
  isFavorite: boolean;
  onPurchase: () => void;
  onToggleFavorite: () => void;
  isPurchasing: boolean;
  balance: string;
}

function ProductCard({ product, isFavorite, onPurchase, onToggleFavorite, isPurchasing, balance }: ProductCardProps) {
  const badge = getProviderBadge(product.provider.slug);
  const canAfford = parseFloat(balance) >= parseFloat(product.yourPrice);
  
  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-default)',
      borderRadius: '16px',
      padding: '20px',
      transition: 'all 200ms ease'
    }} className="card-lift">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {product.service.iconUrl ? (
            <img 
              src={product.service.iconUrl} 
              alt={product.service.name}
              style={{ width: '40px', height: '40px', borderRadius: '10px' }}
            />
          ) : (
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '10px', 
              backgroundColor: 'var(--bg-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px'
            }}>
              📱
            </div>
          )}
          <div>
            <h3 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
              {product.service.name}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '16px' }}>{getCountryFlag(product.country.code)}</span>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{product.country.name}</span>
            </div>
          </div>
        </div>
        <button
          onClick={onToggleFavorite}
          style={{
            padding: '8px',
            backgroundColor: isFavorite ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 150ms ease'
          }}
        >
          <Heart 
            style={{ 
              width: '18px', 
              height: '18px', 
              color: isFavorite ? 'var(--danger)' : 'var(--text-muted)',
              fill: isFavorite ? 'var(--danger)' : 'none'
            }} 
          />
        </button>
      </div>

      {/* Info Row */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '16px',
        padding: '12px',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '10px'
      }}>
        <div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Available</span>
          <p style={{ 
            fontWeight: 600, 
            color: product.availableCount > 10 ? 'var(--success)' : product.availableCount > 0 ? 'var(--warning)' : 'var(--danger)'
          }}>
            {product.availableCount} numbers
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Provider</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '14px' }}>{badge.icon}</span>
            <span style={{ 
              padding: '2px 8px', 
              backgroundColor: badge.color, 
              color: '#000', 
              borderRadius: '4px', 
              fontSize: '11px', 
              fontWeight: 700 
            }}>
              {badge.label}
            </span>
          </div>
        </div>
      </div>

      {/* Price & Action */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Price</span>
          <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--accent-gold)' }}>
            {formatPrice(product.yourPrice)}
          </p>
          {product.price !== product.yourPrice && (
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
              {formatPrice(product.price)}
            </span>
          )}
        </div>
        <Button
          onClick={onPurchase}
          disabled={isPurchasing || !canAfford || product.availableCount === 0}
          style={{ minWidth: '100px' }}
        >
          {isPurchasing ? (
            <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
          ) : !canAfford ? (
            'Low Balance'
          ) : product.availableCount === 0 ? (
            'Sold Out'
          ) : (
            'Buy Now'
          )}
        </Button>
      </div>
    </div>
  );
}

interface OrderViewProps {
  order: SmsOrder;
  onCancel: () => void;
  onBack: () => void;
  isCancelling: boolean;
  onCopy: (text: string) => void;
  copiedCode: boolean;
}

function OrderView({ order, onCancel, onBack, isCancelling, onCopy, copiedCode }: OrderViewProps) {
  const timeRemaining = getTimeRemaining(order.expiresAt);
  const isWaiting = ['PENDING', 'WAITING_SMS'].includes(order.status);
  const isCompleted = order.status === 'COMPLETED';
  const badge = getProviderBadge(order.provider.slug);

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      {/* Status Card */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        borderRadius: '20px',
        padding: '32px',
        textAlign: 'center',
        marginBottom: '24px'
      }}>
        {/* Status Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          margin: '0 auto 24px',
          borderRadius: '50%',
          backgroundColor: isCompleted 
            ? 'rgba(16, 185, 129, 0.1)' 
            : isWaiting 
              ? 'rgba(198, 167, 94, 0.1)' 
              : 'rgba(239, 68, 68, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {isCompleted ? (
            <Check style={{ width: '40px', height: '40px', color: 'var(--success)' }} />
          ) : isWaiting ? (
            <Loader2 style={{ 
              width: '40px', 
              height: '40px', 
              color: 'var(--accent-gold)',
              animation: 'spin 2s linear infinite'
            }} />
          ) : (
            <X style={{ width: '40px', height: '40px', color: 'var(--danger)' }} />
          )}
        </div>

        {/* Status Text */}
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          {isCompleted ? 'SMS Received!' : isWaiting ? 'Waiting for SMS...' : getOrderStatusLabel(order.status)}
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          {isCompleted 
            ? 'Your verification code is ready to use'
            : isWaiting 
              ? 'Use this number for verification. The SMS code will appear here automatically.'
              : 'This order has been ' + order.status.toLowerCase()
          }
        </p>

        {/* Phone Number */}
        {order.phoneNumber && (
          <div style={{
            padding: '20px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '16px',
            marginBottom: '24px'
          }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
              Phone Number
            </span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                {order.phoneNumber}
              </span>
              <button
                onClick={() => onCopy(order.phoneNumber!)}
                style={{
                  padding: '8px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                {copiedCode ? (
                  <Check style={{ width: '16px', height: '16px', color: 'var(--success)' }} />
                ) : (
                  <Copy style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
                )}
              </button>
            </div>
          </div>
        )}

        {/* SMS Code */}
        {isCompleted && order.smsCode && (
          <div style={{
            padding: '24px',
            background: 'linear-gradient(135deg, rgba(198, 167, 94, 0.1) 0%, rgba(198, 167, 94, 0.05) 100%)',
            border: '2px solid var(--accent-gold)',
            borderRadius: '16px',
            marginBottom: '24px'
          }}>
            <span style={{ fontSize: '12px', color: 'var(--accent-gold)', display: 'block', marginBottom: '8px' }}>
              Verification Code
            </span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <span style={{ 
                fontSize: '48px', 
                fontWeight: 800, 
                color: 'var(--accent-gold)', 
                fontFamily: 'monospace',
                letterSpacing: '8px'
              }}>
                {order.smsCode}
              </span>
              <button
                onClick={() => onCopy(order.smsCode!)}
                style={{
                  padding: '12px',
                  backgroundColor: 'var(--accent-gold)',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer'
                }}
              >
                {copiedCode ? (
                  <Check style={{ width: '20px', height: '20px', color: '#000' }} />
                ) : (
                  <Copy style={{ width: '20px', height: '20px', color: '#000' }} />
                )}
              </button>
            </div>
            {order.smsFullText && (
              <p style={{ 
                marginTop: '16px', 
                padding: '12px', 
                backgroundColor: 'var(--bg-secondary)', 
                borderRadius: '8px',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                fontStyle: 'italic'
              }}>
                &quot;{order.smsFullText}&quot;
              </p>
            )}
          </div>
        )}

        {/* Timer */}
        {isWaiting && !timeRemaining.expired && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '8px',
            marginBottom: '24px',
            color: timeRemaining.minutes < 5 ? 'var(--warning)' : 'var(--text-muted)'
          }}>
            <Clock style={{ width: '16px', height: '16px' }} />
            <span>
              Expires in {timeRemaining.minutes}:{timeRemaining.seconds.toString().padStart(2, '0')}
            </span>
          </div>
        )}

        {/* Order Details */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          padding: '16px',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '12px',
          marginBottom: '24px'
        }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Service</span>
            <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{order.service.name}</span>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Country</span>
            <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
              {getCountryFlag(order.country.code)} {order.country.name}
            </span>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Cost</span>
            <span style={{ fontWeight: 600, color: 'var(--accent-gold)' }}>{formatPrice(order.finalCost)}</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          {canCancelOrder(order.status) && (
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
              ) : (
                'Cancel & Refund'
              )}
            </Button>
          )}
          <Button onClick={onBack}>
            {isCompleted ? 'Get Another Number' : 'Back to Browse'}
          </Button>
        </div>
      </div>
    </div>
  );
}

