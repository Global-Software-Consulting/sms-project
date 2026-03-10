'use client';
import { useState, useEffect, useMemo } from 'react';
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
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/components/ui/utils';

type ProviderType = 'v1' | 'v2' | 'v3';
type NumberStatus = 'waiting' | 'received' | 'canceled';
type CountryFilterType = 'all' | 'favorites' | 'most-used';
type PriceSortType = 'none' | 'low-high' | 'high-low';

// ─── Data Model ────────────────────────────────────────────────────────────────

interface ServiceDef {
  id: string;
  name: string;
  icon: string; // emoji or brand icon letter
  color: string; // tailwind bg color class for icon bg
  totalCount: number; // total numbers across all countries
  popular: boolean;
}

interface CountryOption {
  code: string;
  name: string;
  flag: string;
  available: number;
  priceV1: number;
  priceV2: number;
  priceV3: number;
}

interface ServiceCountryEntry extends CountryOption {
  serviceId: string;
}

interface ActiveNumber {
  id: string;
  serviceName: string;
  serviceIcon: string;
  serviceColor: string;
  countryName: string;
  countryFlag: string;
  number: string;
  expiresAt: number;
  provider: ProviderType;
  status: NumberStatus;
  smsCode?: string;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const SERVICES: ServiceDef[] = [
  {
    id: 'telegram',
    name: 'Telegram',
    icon: '✈️',
    color: 'bg-sky-500',
    totalCount: 1196796,
    popular: true,
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: '💬',
    color: 'bg-green-500',
    totalCount: 701738,
    popular: true,
  },
  {
    id: 'google',
    name: 'Google, YouTube...',
    icon: '🔍',
    color: 'bg-red-500',
    totalCount: 892887,
    popular: true,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: '👥',
    color: 'bg-blue-600',
    totalCount: 1391383,
    popular: true,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: '📷',
    color: 'bg-pink-500',
    totalCount: 534210,
    popular: true,
  },
  {
    id: 'twitter',
    name: 'Twitter / X',
    icon: '🐦',
    color: 'bg-slate-800',
    totalCount: 298450,
    popular: false,
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: '🎵',
    color: 'bg-black',
    totalCount: 412600,
    popular: true,
  },
  {
    id: 'discord',
    name: 'Discord',
    icon: '🎮',
    color: 'bg-indigo-500',
    totalCount: 156300,
    popular: false,
  },
  {
    id: 'snapchat',
    name: 'Snapchat',
    icon: '👻',
    color: 'bg-yellow-400',
    totalCount: 87200,
    popular: false,
  },
  {
    id: 'uber',
    name: 'Uber',
    icon: '🚗',
    color: 'bg-neutral-900',
    totalCount: 234500,
    popular: false,
  },
  {
    id: 'amazon',
    name: 'Amazon',
    icon: '📦',
    color: 'bg-orange-500',
    totalCount: 189700,
    popular: false,
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    icon: '🪟',
    color: 'bg-blue-500',
    totalCount: 142300,
    popular: false,
  },
  {
    id: 'apple',
    name: 'Apple / iCloud',
    icon: '🍎',
    color: 'bg-gray-700',
    totalCount: 98400,
    popular: false,
  },
  {
    id: 'netflix',
    name: 'Netflix',
    icon: '🎬',
    color: 'bg-red-600',
    totalCount: 76500,
    popular: false,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: '💼',
    color: 'bg-blue-700',
    totalCount: 65200,
    popular: false,
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: '💳',
    color: 'bg-blue-400',
    totalCount: 54800,
    popular: false,
  },
  {
    id: 'airbnb',
    name: 'Airbnb',
    icon: '🏠',
    color: 'bg-rose-500',
    totalCount: 43600,
    popular: false,
  },
  {
    id: 'viber',
    name: 'Viber',
    icon: '📳',
    color: 'bg-violet-600',
    totalCount: 321400,
    popular: false,
  },
  {
    id: 'line',
    name: 'Line',
    icon: '💚',
    color: 'bg-green-600',
    totalCount: 198700,
    popular: false,
  },
  {
    id: 'wechat',
    name: 'WeChat',
    icon: '🟢',
    color: 'bg-green-700',
    totalCount: 276300,
    popular: false,
  },
];

// Countries available per service
const COUNTRY_OPTIONS: CountryOption[] = [
  {
    code: 'US',
    name: 'USA',
    flag: '🇺🇸',
    available: 200,
    priceV1: 3.76,
    priceV2: 5.64,
    priceV3: 7.52,
  },
  {
    code: 'VN',
    name: 'Vietnam',
    flag: '🇻🇳',
    available: 1522,
    priceV1: 1.6,
    priceV2: 2.4,
    priceV3: 3.2,
  },
  {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    available: 1072,
    priceV1: 1.56,
    priceV2: 2.34,
    priceV3: 3.12,
  },
  {
    code: 'MX',
    name: 'Mexico',
    flag: '🇲🇽',
    available: 481,
    priceV1: 1.95,
    priceV2: 2.92,
    priceV3: 3.9,
  },
  {
    code: 'GB',
    name: 'UK',
    flag: '🇬🇧',
    available: 347,
    priceV1: 2.2,
    priceV2: 3.3,
    priceV3: 4.4,
  },
  {
    code: 'DE',
    name: 'Germany',
    flag: '🇩🇪',
    available: 289,
    priceV1: 2.45,
    priceV2: 3.67,
    priceV3: 4.9,
  },
  {
    code: 'RU',
    name: 'Russia',
    flag: '🇷🇺',
    available: 2841,
    priceV1: 0.85,
    priceV2: 1.27,
    priceV3: 1.7,
  },
  {
    code: 'BR',
    name: 'Brazil',
    flag: '🇧🇷',
    available: 934,
    priceV1: 1.35,
    priceV2: 2.02,
    priceV3: 2.7,
  },
  {
    code: 'ID',
    name: 'Indonesia',
    flag: '🇮🇩',
    available: 1187,
    priceV1: 1.42,
    priceV2: 2.13,
    priceV3: 2.84,
  },
  {
    code: 'PH',
    name: 'Philippines',
    flag: '🇵🇭',
    available: 762,
    priceV1: 1.28,
    priceV2: 1.92,
    priceV3: 2.56,
  },
  {
    code: 'PK',
    name: 'Pakistan',
    flag: '🇵🇰',
    available: 684,
    priceV1: 0.95,
    priceV2: 1.42,
    priceV3: 1.9,
  },
  {
    code: 'NG',
    name: 'Nigeria',
    flag: '🇳🇬',
    available: 512,
    priceV1: 1.1,
    priceV2: 1.65,
    priceV3: 2.2,
  },
  {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    available: 164,
    priceV1: 3.5,
    priceV2: 5.25,
    priceV3: 7.0,
  },
  {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    available: 98,
    priceV1: 3.2,
    priceV2: 4.8,
    priceV3: 6.4,
  },
  {
    code: 'FR',
    name: 'France',
    flag: '🇫🇷',
    available: 215,
    priceV1: 2.3,
    priceV2: 3.45,
    priceV3: 4.6,
  },
  {
    code: 'TR',
    name: 'Turkey',
    flag: '🇹🇷',
    available: 876,
    priceV1: 1.2,
    priceV2: 1.8,
    priceV3: 2.4,
  },
  {
    code: 'UA',
    name: 'Ukraine',
    flag: '🇺🇦',
    available: 1456,
    priceV1: 0.9,
    priceV2: 1.35,
    priceV3: 1.8,
  },
  {
    code: 'PL',
    name: 'Poland',
    flag: '🇵🇱',
    available: 432,
    priceV1: 1.75,
    priceV2: 2.62,
    priceV3: 3.5,
  },
  {
    code: 'ES',
    name: 'Spain',
    flag: '🇪🇸',
    available: 287,
    priceV1: 2.05,
    priceV2: 3.07,
    priceV3: 4.1,
  },
  {
    code: 'KZ',
    name: 'Kazakhstan',
    flag: '🇰🇿',
    available: 643,
    priceV1: 0.95,
    priceV2: 1.42,
    priceV3: 1.9,
  },
];

// Most used countries (simulated based on user activity)
const MOST_USED_COUNTRIES = ['US', 'IN', 'VN', 'RU', 'GB', 'DE'];

// Not every service is available in every country; randomise a subset
function getCountriesForService(serviceId: string): CountryOption[] {
  // Seed-deterministic shuffle so it's consistent per service
  const seed = serviceId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const count = 8 + (seed % 8); // 8–15 countries
  const shuffled = [...COUNTRY_OPTIONS].sort(() => {
    const r =
      Math.sin(seed * COUNTRY_OPTIONS.indexOf(COUNTRY_OPTIONS[0]) + 1) * 10000;
    return r - Math.floor(r) - 0.5;
  });
  // Deterministic: use seed to pick indices
  const indices = Array.from({ length: COUNTRY_OPTIONS.length }, (_, i) => i)
    .sort(
      (a, b) =>
        ((a * 2654435761 + seed) >>> 0) - ((b * 2654435761 + seed) >>> 0),
    )
    .slice(0, count);
  return indices.map((i) => COUNTRY_OPTIONS[i]);
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function Activation() {
  const [providerType, setProviderType] = useState<ProviderType>('v1');

  // Step 1 state
  const [serviceSearch, setServiceSearch] = useState('');
  const [selectedService, setSelectedService] = useState<ServiceDef | null>(
    null,
  );

  // Step 2 state - countries
  const [countrySearch, setCountrySearch] = useState('');
  const [countryFilter, setCountryFilter] = useState<CountryFilterType>('all');
  const [priceSort, setPriceSort] = useState<PriceSortType>('none');
  const [favoriteCountries, setFavoriteCountries] = useState<string[]>([
    'US',
    'IN',
    'GB',
  ]);
  const [availableCountries, setAvailableCountries] = useState<CountryOption[]>(
    [],
  );
  const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(
    null,
  );

  // Active numbers
  const [activeNumbers, setActiveNumbers] = useState<ActiveNumber[]>([]);

  // Update countries when service changes
  useEffect(() => {
    if (selectedService) {
      setAvailableCountries(getCountriesForService(selectedService.id));
      setSelectedCountry(null);
      setCountrySearch('');
    }
  }, [selectedService]);

  // Countdown ticker
  useEffect(() => {
    const iv = setInterval(() => setActiveNumbers((p) => [...p]), 1000);
    return () => clearInterval(iv);
  }, []);

  // ── Filtered / sorted lists ──────────────────────────────────────────────────

  const filteredServices = useMemo(() => {
    const q = serviceSearch.toLowerCase();
    return SERVICES.filter((s) => !q || s.name.toLowerCase().includes(q));
  }, [serviceSearch]);

  const filteredCountries = useMemo(() => {
    const q = countrySearch.toLowerCase();
    let list = availableCountries.filter(
      (c) => !q || c.name.toLowerCase().includes(q),
    );

    // Apply filter
    if (countryFilter === 'favorites') {
      list = list.filter((c) => favoriteCountries.includes(c.code));
    } else if (countryFilter === 'most-used') {
      list = list.filter((c) => MOST_USED_COUNTRIES.includes(c.code));
    }

    // Apply price sorting
    if (priceSort === 'low-high' || priceSort === 'high-low') {
      list = [...list].sort((a, b) => {
        const pa =
          providerType === 'v1'
            ? a.priceV1
            : providerType === 'v2'
              ? a.priceV2
              : a.priceV3;
        const pb =
          providerType === 'v1'
            ? b.priceV1
            : providerType === 'v2'
              ? b.priceV2
              : b.priceV3;
        return priceSort === 'low-high' ? pa - pb : pb - pa;
      });
    }

    return list;
  }, [
    availableCountries,
    countrySearch,
    countryFilter,
    priceSort,
    favoriteCountries,
    providerType,
  ]);

  // ── Actions ──────────────────────────────────────────────────────────────────

  const toggleFavoriteCountry = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoriteCountries((prev) =>
      prev.includes(code) ? prev.filter((f) => f !== code) : [...prev, code],
    );
    toast.success(
      favoriteCountries.includes(code)
        ? 'Removed from favorites'
        : 'Added to favorites',
    );
  };

  const handleSelectService = (svc: ServiceDef) => {
    setSelectedService(svc);
  };

  const handleBuySMS = (country: CountryOption) => {
    if (!selectedService) return;
    setSelectedCountry(country);

    const price =
      providerType === 'v1'
        ? country.priceV1
        : providerType === 'v2'
          ? country.priceV2
          : country.priceV3;
    const numberId = `num-${Date.now()}`;
    const number = `+${country.code === 'US' || country.code === 'CA' ? '1' : '44'} (${Math.floor(Math.random() * 900 + 100)}) ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`;

    const newNum: ActiveNumber = {
      id: numberId,
      serviceName: selectedService.name,
      serviceIcon: selectedService.icon,
      serviceColor: selectedService.color,
      countryName: country.name,
      countryFlag: country.flag,
      number,
      expiresAt: Date.now() + 15 * 60 * 1000,
      provider: providerType,
      status: 'waiting',
    };

    setActiveNumbers((prev) => [newNum, ...prev]);
    toast.success(
      `Number activated — ${selectedService.name} / ${country.flag} ${country.name}`,
      {
        description: `Cost: $${price.toFixed(2)} · Waiting for SMS...`,
      },
    );

    // Simulate SMS arrival
    setTimeout(
      () => {
        const code = Math.floor(Math.random() * 900000 + 100000).toString();
        setActiveNumbers((prev) =>
          prev.map((n) =>
            n.id === numberId ? { ...n, status: 'received', smsCode: code } : n,
          ),
        );
        toast.success('SMS Received!', { description: `Code: ${code}` });
      },
      Math.random() * 7000 + 4000,
    );

    // Auto-cancel after 15 min
    setTimeout(
      () => {
        setActiveNumbers((prev) =>
          prev.map((n) =>
            n.id === numberId && n.status === 'waiting'
              ? { ...n, status: 'canceled' }
              : n,
          ),
        );
      },
      15 * 60 * 1000,
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const cancelNumber = (id: string) => {
    setActiveNumbers((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: 'canceled' } : n)),
    );
    toast.info('Number canceled');
  };

  const removeNumber = (id: string) => {
    setActiveNumbers((prev) => prev.filter((n) => n.id !== id));
  };

  const getTimeRemaining = (expiresAt: number) => {
    const rem = Math.max(0, expiresAt - Date.now());
    const m = Math.floor(rem / 60000);
    const s = Math.floor((rem % 60000) / 1000);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getPrice = (country: CountryOption) =>
    providerType === 'v1'
      ? country.priceV1
      : providerType === 'v2'
        ? country.priceV2
        : country.priceV3;

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">SMS Activation</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Order phone numbers for instant SMS verification
          </p>
        </div>

        {/* Dynamic selection crumbs */}
        {(selectedService || selectedCountry) && (
          <div className="flex flex-wrap items-center gap-2">
            {selectedService && (
              <div className="border-border bg-card flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium">
                <span>{selectedService.icon}</span>
                <span>{selectedService.name}</span>
              </div>
            )}
            {selectedService && selectedCountry && (
              <ChevronRight className="text-muted-foreground h-4 w-4" />
            )}
            {selectedCountry && (
              <div className="border-primary/50 bg-primary/5 text-primary flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium">
                <span>{selectedCountry.flag}</span>
                <span>{selectedCountry.name}</span>
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
                }}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* ── Provider Toggle ─────────────────────────────────────────────────── */}
      <div className="border-border bg-muted/50 relative flex max-w-xl items-center rounded-xl border p-1">
        <div
          className="bg-card border-border absolute h-[calc(100%-8px)] rounded-lg border shadow-md transition-all duration-300 ease-out"
          style={{
            width: `${100 / 3}%`,
            left:
              providerType === 'v1'
                ? '0.25rem'
                : providerType === 'v2'
                  ? `calc(${100 / 3}% + 0.25rem)`
                  : `calc(${200 / 3}% + 0.25rem)`,
          }}
        />
        {(['v1', 'v2', 'v3'] as ProviderType[]).map((p) => (
          <button
            key={p}
            onClick={() => setProviderType(p)}
            className={cn(
              'relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-xs font-medium transition-colors sm:px-4 sm:text-sm',
              providerType === p
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <span>{p === 'v1' ? '💰' : p === 'v2' ? '💎' : '👑'}</span>
            <span className="hidden sm:inline">
              {p === 'v1'
                ? 'Standard V1'
                : p === 'v2'
                  ? 'Premium V2'
                  : 'Elite V3'}
            </span>
            <span className="sm:hidden">
              {p === 'v1' ? 'V1' : p === 'v2' ? 'V2' : 'V3'}
            </span>
          </button>
        ))}
      </div>

      {/* ── Active Numbers ──────────────────────────────────────────────────── */}
      {activeNumbers.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="bg-success h-2 w-2 animate-pulse rounded-full" />
              Active Numbers ({activeNumbers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeNumbers.map((num) => (
              <div
                key={num.id}
                className={cn(
                  'rounded-xl border p-3 transition-all sm:p-4',
                  num.status === 'received'
                    ? 'bg-success/8 border-success/40 shadow-[0_0_16px_rgba(16,185,129,0.12)]'
                    : num.status === 'canceled'
                      ? 'bg-muted/30 border-border opacity-60'
                      : 'bg-card border-border',
                )}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  {/* Service + Country */}
                  <div className="flex min-w-0 flex-1 items-center gap-2.5">
                    <div
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm text-white',
                        num.serviceColor,
                      )}
                    >
                      {num.serviceIcon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold">
                          {num.serviceName}
                        </span>
                        <span className="text-base">{num.countryFlag}</span>
                        <span className="text-muted-foreground text-xs">
                          {num.countryName}
                        </span>
                        <Badge
                          variant={
                            num.status === 'received'
                              ? 'default'
                              : num.status === 'canceled'
                                ? 'destructive'
                                : 'secondary'
                          }
                          className="h-4 px-1.5 text-[10px]"
                        >
                          {num.status === 'waiting'
                            ? 'Waiting...'
                            : num.status === 'received'
                              ? '✓ Received'
                              : 'Canceled'}
                        </Badge>
                      </div>
                      <code className="text-muted-foreground font-mono text-xs">
                        {num.number}
                      </code>
                    </div>
                  </div>

                  {/* Timer */}
                  {num.status === 'waiting' && (
                    <div className="text-muted-foreground flex shrink-0 items-center gap-1.5 text-sm">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="font-mono tabular-nums">
                        {getTimeRemaining(num.expiresAt)}
                      </span>
                    </div>
                  )}

                  {/* SMS Code */}
                  {num.smsCode && (
                    <div className="bg-success/15 border-success/30 flex shrink-0 items-center gap-2 rounded-lg border px-3 py-1.5">
                      <span className="text-success text-xs font-medium">
                        Code:
                      </span>
                      <code className="text-success font-mono font-bold">
                        {num.smsCode}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 shrink-0"
                        onClick={() => copyToClipboard(num.smsCode!)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  )}

                  {/* Copy number */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => copyToClipboard(num.number)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-1">
                    {num.status === 'waiting' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive h-8"
                        onClick={() => cancelNumber(num.id)}
                      >
                        Cancel
                      </Button>
                    )}
                    {(num.status === 'received' ||
                      num.status === 'canceled') && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeNumber(num.id)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>

                {num.status === 'canceled' && (
                  <div className="border-destructive/20 text-destructive mt-2 flex items-center gap-2 border-t pt-2 text-xs">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Auto-Canceled — No SMS received
                  </div>
                )}

                {num.status === 'waiting' && (
                  <div className="mt-3">
                    <Progress
                      value={Math.max(
                        0,
                        ((num.expiresAt - Date.now()) / (15 * 60 * 1000)) * 100,
                      )}
                      className="h-1"
                    />
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ── Two-column layout: Step 1 + Step 2 ─────────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* ═══ STEP 1: Select a Service ═══ */}
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
                onChange={(e) => setServiceSearch(e.target.value)}
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
              {filteredServices.map((svc) => {
                const isSelected = selectedService?.id === svc.id;
                return (
                  <button
                    key={svc.id}
                    onClick={() => handleSelectService(svc)}
                    className={cn(
                      'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all',
                      isSelected
                        ? 'bg-primary/10 border-primary/30 border shadow-sm'
                        : 'hover:bg-muted/60 border border-transparent',
                    )}
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm',
                        svc.color,
                      )}
                    >
                      {svc.icon}
                    </div>

                    {/* Name */}
                    <span
                      className={cn(
                        'flex-1 truncate text-sm font-medium',
                        isSelected ? 'text-primary' : 'text-foreground',
                      )}
                    >
                      {svc.name}
                    </span>

                    {/* Count */}
                    <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                      {svc.totalCount.toLocaleString()}
                    </span>

                    {isSelected && (
                      <ChevronRight className="text-primary h-4 w-4 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Available count footer */}
            <div className="border-border border-t pt-2">
              <button className="text-primary flex items-center gap-1.5 text-sm font-medium">
                Available services — {filteredServices.length}
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* ═══ STEP 2: Select Country ═══ */}
        <Card className="flex max-h-[450px] flex-col">
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
                      onChange={(e) => setCountrySearch(e.target.value)}
                      className="bg-muted/40 pl-9"
                    />
                  </div>
                </div>

                {/* Filter Chips */}
                <div className="flex flex-wrap gap-2">
                  {/* Country Filter */}
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
                        countryFilter === 'most-used' ? 'default' : 'outline'
                      }
                      size="sm"
                      onClick={() => setCountryFilter('most-used')}
                      className="h-8 text-xs"
                    >
                      <TrendingUp className="mr-1.5 h-3 w-3" />
                      Most Used
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
                      {countryFilter === 'favorites'
                        ? 'No favorite countries yet'
                        : countryFilter === 'most-used'
                          ? 'No most used countries available'
                          : 'No countries found'}
                    </div>
                  )}
                  {filteredCountries.map((country) => {
                    const price = getPrice(country);
                    const isOut = country.available === 0;
                    const isFavorite = favoriteCountries.includes(country.code);
                    const isMostUsed = MOST_USED_COUNTRIES.includes(
                      country.code,
                    );
                    return (
                      <div
                        key={country.code}
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
                              toggleFavoriteCountry(country.code, e)
                            }
                            className="shrink-0 p-0.5"
                            title={
                              isFavorite
                                ? 'Remove from favorites'
                                : 'Add to favorites'
                            }
                          >
                            <Star
                              className={cn(
                                'h-4 w-4 transition-colors',
                                isFavorite
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-muted-foreground/40 hover:text-muted-foreground',
                              )}
                            />
                          </button>

                          {/* Flag */}
                          <span className="w-8 shrink-0 text-center text-xl">
                            {country.flag}
                          </span>

                          {/* Name + count */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {country.name}
                              </span>
                              {isMostUsed && (
                                <Badge
                                  variant="secondary"
                                  className="h-4 px-1.5 text-[10px]"
                                >
                                  <TrendingUp className="mr-0.5 h-2.5 w-2.5" />
                                  Popular
                                </Badge>
                              )}
                            </div>
                            <span className="text-muted-foreground text-xs tabular-nums">
                              {country.available.toLocaleString()} available
                            </span>
                          </div>

                          {/* Price */}
                          <span className="shrink-0 text-sm font-bold tabular-nums">
                            ${price.toFixed(2)}
                          </span>
                        </div>

                        {/* Buy button */}
                        <Button
                          className="h-9 w-full rounded-none rounded-b-xl text-sm font-semibold"
                          disabled={isOut}
                          onClick={() => handleBuySMS(country)}
                        >
                          {isOut ? 'Unavailable' : 'Buy SMS'}
                        </Button>
                      </div>
                    );
                  })}
                </div>

                {/* Count footer */}
                <div className="border-border flex items-center justify-between border-t pt-2 text-xs">
                  <span className="text-muted-foreground">
                    {countryFilter === 'favorites'
                      ? `${favoriteCountries.length} favorite countries`
                      : countryFilter === 'most-used'
                        ? `${MOST_USED_COUNTRIES.length} most used countries`
                        : `${filteredCountries.length} available countries`}
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
