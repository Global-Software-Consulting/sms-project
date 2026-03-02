'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  Search, 
  ChevronDown,
  Copy,
  Check,
  AlertCircle,
  Globe,
  X,
  Loader2,
  RefreshCw,
  MessageSquare,
  Smartphone
} from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { DashboardShell } from '@/components/layout';
import { useAuth } from '@/hooks';
import {
  getServices,
  getCountries,
  rentNumber,
  checkRentalStatus,
  cancelRental,
  getWalletBalance,
  SmsService,
  SmsCountry,
  SmsRental,
  formatPrice,
  getCountryFlag,
  getRentalStatusLabel,
  getRentalStatusColor,
  canCancelRental,
  getTimeRemaining,
  formatDuration,
  RENTAL_DURATIONS,
} from '@/lib/api';

type ViewMode = 'browse' | 'rental';

// sms-man provider ID - rentals only work with sms-man
const SMSMAN_PROVIDER_ID = 'smsman';

export default function RentPage() {
  const { user } = useAuth();
  
  // Data states
  const [services, setServices] = useState<SmsService[]>([]);
  const [countries, setCountries] = useState<SmsCountry[]>([]);
  const [balance, setBalance] = useState<string>('0.00');
  
  // Selection states
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<1 | 4 | 12 | 24 | 48 | 72>(24);
  const [searchQuery, setSearchQuery] = useState('');
  
  // UI states
  const [viewMode, setViewMode] = useState<ViewMode>('browse');
  const [activeRental, setActiveRental] = useState<SmsRental | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRenting, setIsRenting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  
  // Polling ref
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadInitialData();
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      // Load services and countries for sms-man (the only provider that supports rentals)
      const [servicesRes, countriesRes, balanceRes] = await Promise.all([
        getServices({ limit: 200 }),
        getCountries({ limit: 200 }),
        getWalletBalance(),
      ]);
      
      // Filter to only show sms-man services/countries (rental provider)
      const smsmanServices = servicesRes.data.filter(s => s.provider?.slug === 'smsman');
      const smsmanCountries = countriesRes.data.filter(c => c.provider?.slug === 'smsman');
      
      setServices(smsmanServices.length > 0 ? smsmanServices : servicesRes.data);
      setCountries(smsmanCountries.length > 0 ? smsmanCountries : countriesRes.data);
      setBalance(balanceRes.balance);
    } catch (err) {
      console.error('Failed to load initial data:', err);
      setError('Failed to load data. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRent = async () => {
    if (!selectedService || !selectedCountry || isRenting) return;
    
    setIsRenting(true);
    setError(null);
    
    try {
      const res = await rentNumber(selectedService, selectedCountry, selectedDuration);
      setActiveRental(res.rental);
      setViewMode('rental');
      
      // Start polling for messages
      startPolling(res.rental.id);
      
      // Refresh balance
      const balanceRes = await getWalletBalance();
      setBalance(balanceRes.balance);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to rent number. Please try again.');
    } finally {
      setIsRenting(false);
    }
  };

  const startPolling = (rentalId: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    
    pollingRef.current = setInterval(async () => {
      try {
        const res = await checkRentalStatus(rentalId);
        setActiveRental(res.rental);
        
        // Stop polling if rental is complete or cancelled
        if (['COMPLETED', 'CANCELLED', 'EXPIRED'].includes(res.rental.status)) {
          if (pollingRef.current) clearInterval(pollingRef.current);
          
          // Refresh balance if cancelled
          if (res.rental.status === 'CANCELLED') {
            const balanceRes = await getWalletBalance();
            setBalance(balanceRes.balance);
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 5000); // Poll every 5 seconds for rentals
  };

  const handleCancelRental = async () => {
    if (!activeRental || isCancelling) return;
    
    setIsCancelling(true);
    try {
      const res = await cancelRental(activeRental.id);
      setActiveRental(res.order as unknown as SmsRental);
      
      if (pollingRef.current) clearInterval(pollingRef.current);
      
      // Refresh balance
      const balanceRes = await getWalletBalance();
      setBalance(balanceRes.balance);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel rental.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleBackToBrowse = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    setActiveRental(null);
    setViewMode('browse');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Estimate price (this would ideally come from the API)
  const estimatedPrice = selectedService && selectedCountry ? 
    (selectedDuration * 0.5).toFixed(2) : '0.00';

  if (!user) return null;

  return (
    <DashboardShell>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Number Rental
              </h1>
              <Badge variant="v2">Premium V2</Badge>
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>
              Rent phone numbers for extended periods and receive multiple SMS messages
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

      {/* Info Banner */}
      <div style={{
        padding: '16px 20px',
        backgroundColor: 'rgba(0, 212, 255, 0.05)',
        border: '1px solid rgba(0, 212, 255, 0.2)',
        borderRadius: '12px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <Clock style={{ width: '20px', height: '20px', color: '#00D4FF' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          <strong style={{ color: '#00D4FF' }}>Number Rental</strong> allows you to receive multiple SMS messages 
          over an extended period. Perfect for services that send multiple verification codes.
        </p>
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
      ) : viewMode === 'rental' && activeRental ? (
        <RentalView 
          rental={activeRental}
          onCancel={handleCancelRental}
          onBack={handleBackToBrowse}
          isCancelling={isCancelling}
          onCopy={copyToClipboard}
          copiedText={copiedText}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }} className="lg:!grid-cols-3">
          {/* Selection Panel */}
          <div style={{ gridColumn: 'span 2' }} className="lg:!col-span-2">
            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: '20px',
              padding: '24px'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '24px' }}>
                Configure Your Rental
              </h2>

              {/* Service Selection */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                  Select Service
                </label>
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => {
                      setShowServiceDropdown(!showServiceDropdown);
                      setShowCountryDropdown(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '16px',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-default)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Smartphone style={{ width: '20px', height: '20px', color: 'var(--text-muted)' }} />
                      <span style={{ fontWeight: selectedService ? 500 : 400 }}>
                        {selectedService 
                          ? services.find(s => s.id === selectedService)?.name || 'Select Service'
                          : 'Choose a service...'
                        }
                      </span>
                    </div>
                    <ChevronDown style={{ width: '18px', height: '18px', color: 'var(--text-muted)' }} />
                  </button>
                  
                  {showServiceDropdown && (
                    <DropdownMenu
                      items={filteredServices}
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
              </div>

              {/* Country Selection */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                  Select Country
                </label>
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => {
                      setShowCountryDropdown(!showCountryDropdown);
                      setShowServiceDropdown(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '16px',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-default)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Globe style={{ width: '20px', height: '20px', color: 'var(--text-muted)' }} />
                      <span style={{ fontWeight: selectedCountry ? 500 : 400 }}>
                        {selectedCountry 
                          ? `${getCountryFlag(countries.find(c => c.id === selectedCountry)?.code || '')} ${countries.find(c => c.id === selectedCountry)?.name || 'Select Country'}`
                          : 'Choose a country...'
                        }
                      </span>
                    </div>
                    <ChevronDown style={{ width: '18px', height: '18px', color: 'var(--text-muted)' }} />
                  </button>
                  
                  {showCountryDropdown && (
                    <DropdownMenu
                      items={filteredCountries.map(c => ({ ...c, name: `${getCountryFlag(c.code)} ${c.name}` }))}
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
              </div>

              {/* Duration Selection */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: '12px' }}>
                  Rental Duration
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }} className="sm:!grid-cols-6">
                  {RENTAL_DURATIONS.map((duration) => (
                    <button
                      key={duration.value}
                      onClick={() => setSelectedDuration(duration.value as 1 | 4 | 12 | 24 | 48 | 72)}
                      style={{
                        padding: '16px 12px',
                        borderRadius: '12px',
                        border: selectedDuration === duration.value 
                          ? '2px solid var(--accent-gold)' 
                          : '1px solid var(--border-default)',
                        backgroundColor: selectedDuration === duration.value 
                          ? 'rgba(198, 167, 94, 0.1)' 
                          : 'var(--bg-secondary)',
                        cursor: 'pointer',
                        transition: 'all 150ms ease'
                      }}
                    >
                      <Clock style={{ 
                        width: '20px', 
                        height: '20px', 
                        color: selectedDuration === duration.value ? 'var(--accent-gold)' : 'var(--text-muted)',
                        margin: '0 auto 8px'
                      }} />
                      <p style={{ 
                        fontWeight: 600, 
                        color: selectedDuration === duration.value ? 'var(--accent-gold)' : 'var(--text-primary)',
                        fontSize: '14px'
                      }}>
                        {duration.label}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Summary Panel */}
          <div>
            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: '20px',
              padding: '24px',
              position: 'sticky',
              top: '88px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px' }}>
                Rental Summary
              </h3>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Service</span>
                  <span style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 500 }}>
                    {selectedService ? services.find(s => s.id === selectedService)?.name : '—'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Country</span>
                  <span style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 500 }}>
                    {selectedCountry ? countries.find(c => c.id === selectedCountry)?.name : '—'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Duration</span>
                  <span style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 500 }}>
                    {formatDuration(selectedDuration)}
                  </span>
                </div>
              </div>

              <div style={{ 
                padding: '16px', 
                backgroundColor: 'var(--bg-secondary)', 
                borderRadius: '12px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Estimated Price</span>
                  <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--accent-gold)' }}>
                    ~{formatPrice(estimatedPrice)}
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  * Final price may vary based on availability
                </p>
              </div>

              <Button
                onClick={handleRent}
                disabled={!selectedService || !selectedCountry || isRenting}
                style={{ width: '100%' }}
                size="lg"
              >
                {isRenting ? (
                  <>
                    <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite', marginRight: '8px' }} />
                    Renting...
                  </>
                ) : (
                  <>
                    <Clock style={{ width: '18px', height: '18px', marginRight: '8px' }} />
                    Rent Number
                  </>
                )}
              </Button>

              <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '12px' }}>
                Rental will be charged from your wallet
              </p>
            </div>
          </div>
        </div>
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
      <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Loading rental options...</p>
    </div>
  );
}

interface DropdownMenuProps {
  items: Array<{ id: string; name: string; iconUrl?: string | null }>;
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

interface RentalViewProps {
  rental: SmsRental;
  onCancel: () => void;
  onBack: () => void;
  isCancelling: boolean;
  onCopy: (text: string) => void;
  copiedText: string | null;
}

function RentalView({ rental, onCancel, onBack, isCancelling, onCopy, copiedText }: RentalViewProps) {
  const timeRemaining = getTimeRemaining(rental.expiresAt);
  const isActive = rental.status === 'ACTIVE';
  const statusColor = getRentalStatusColor(rental.status);
  const messageCount = rental.messages?.length || 0;

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      {/* Status Card */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        borderRadius: '20px',
        overflow: 'hidden',
        marginBottom: '24px'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Number Rental
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              {formatDuration(rental.rentalDuration)} rental
            </p>
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '10px',
            backgroundColor: `${statusColor}15`
          }}>
            {isActive && <Loader2 style={{ width: '16px', height: '16px', color: statusColor, animation: 'spin 2s linear infinite' }} />}
            <span style={{ fontSize: '14px', fontWeight: 600, color: statusColor }}>
              {getRentalStatusLabel(rental.status)}
            </span>
          </div>
        </div>

        {/* Phone Number */}
        {rental.phoneNumber && (
          <div style={{ padding: '24px', borderBottom: '1px solid var(--border-default)' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
              Rental Phone Number
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ 
                fontSize: '28px', 
                fontWeight: 700, 
                color: 'var(--text-primary)', 
                fontFamily: 'monospace',
                letterSpacing: '1px'
              }}>
                {rental.phoneNumber}
              </span>
              <button
                onClick={() => onCopy(rental.phoneNumber!)}
                style={{
                  padding: '10px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {copiedText === rental.phoneNumber ? (
                  <Check style={{ width: '16px', height: '16px', color: 'var(--success)' }} />
                ) : (
                  <Copy style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Timer */}
        {isActive && !timeRemaining.expired && (
          <div style={{ 
            padding: '16px 24px', 
            backgroundColor: 'var(--bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            borderBottom: '1px solid var(--border-default)'
          }}>
            <Clock style={{ width: '16px', height: '16px', color: 'var(--accent-gold)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>
              Time remaining: <strong style={{ color: 'var(--accent-gold)' }}>
                {timeRemaining.minutes > 60 
                  ? `${Math.floor(timeRemaining.minutes / 60)}h ${timeRemaining.minutes % 60}m`
                  : `${timeRemaining.minutes}m ${timeRemaining.seconds}s`
                }
              </strong>
            </span>
          </div>
        )}

        {/* Messages */}
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Received Messages
            </h3>
            <span style={{ 
              padding: '4px 12px', 
              backgroundColor: messageCount > 0 ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-secondary)',
              color: messageCount > 0 ? 'var(--success)' : 'var(--text-muted)',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 600
            }}>
              {messageCount} message{messageCount !== 1 ? 's' : ''}
            </span>
          </div>

          {messageCount === 0 ? (
            <div style={{ 
              padding: '40px 24px', 
              textAlign: 'center',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '12px'
            }}>
              <MessageSquare style={{ width: '32px', height: '32px', color: 'var(--text-muted)', margin: '0 auto 12px' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                No messages received yet. Messages will appear here automatically.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {rental.messages.map((msg, idx) => (
                <div 
                  key={idx}
                  style={{
                    padding: '16px',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-default)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      From: {msg.sender || 'Unknown'}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {new Date(msg.receivedAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-primary)', fontSize: '14px', lineHeight: 1.5 }}>
                    {msg.text}
                  </p>
                  <button
                    onClick={() => onCopy(msg.text)}
                    style={{
                      marginTop: '8px',
                      padding: '6px 12px',
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-default)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      color: 'var(--text-muted)'
                    }}
                  >
                    {copiedText === msg.text ? (
                      <>
                        <Check style={{ width: '12px', height: '12px', color: 'var(--success)' }} />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy style={{ width: '12px', height: '12px' }} />
                        Copy message
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ 
          padding: '20px 24px', 
          borderTop: '1px solid var(--border-default)',
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          {canCancelRental(rental.status) && (
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <>
                  <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite', marginRight: '8px' }} />
                  Cancelling...
                </>
              ) : (
                'Cancel Rental'
              )}
            </Button>
          )}
          <Button onClick={onBack}>
            Back to Rentals
          </Button>
        </div>
      </div>

      {/* Rental Details */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        borderRadius: '16px',
        padding: '20px'
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '16px' }}>
          Rental Details
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
          gap: '16px' 
        }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Duration
            </span>
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
              {formatDuration(rental.rentalDuration)}
            </span>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Cost
            </span>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-gold)' }}>
              {formatPrice(rental.finalCost)}
            </span>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Started
            </span>
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
              {new Date(rental.startedAt).toLocaleString()}
            </span>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Expires
            </span>
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
              {new Date(rental.expiresAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

