'use client';

/**
 * Rent Numbers — redesigned June 2026 to mirror SMS-Man's simplicity.
 *
 * Flow:
 *   1. Pick rental TYPE  — Full Number  /  Per App
 *   2. Pick DURATION     — Hour / Day / Week / Month + amount
 *   3. (Per-App only) pick a SERVICE
 *   4. Pick a COUNTRY    — list shows live availability + price
 *   5. Done — number appears in Active Rentals
 *
 * Backend powers steps 1-4 via the new `GET /sms/rent/options` endpoint
 * (one call returns every country slot with stock + USD price for the
 * current duration). Active rentals stay polled for incoming SMS
 * exactly as before.
 *
 * Mobile-first layout (single column on mobile, side-by-side on
 * desktop). No multi-step modal: everything visible on one page so a
 * new user can complete a rental in a handful of taps.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Clock,
  Globe,
  Loader2,
  X,
  Copy,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  MessageSquare,
  Search,
  Plus,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/components/ui/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  cancelRental,
  checkRentalStatus,
  extendRental,
  getRentalHistory,
  getRentalOptions,
  getServices,
  rentNumber,
  RentalOption,
  RentDurationUnit,
  SmsRental,
  SmsService,
} from '@/lib/api/smsApi';

type RentalKind = 'full' | 'app';

interface UnitChoice {
  unit: RentDurationUnit;
  label: string;
  short: string;
  /** Suggested amounts shown as quick-pick chips. */
  suggestions: number[];
}

const UNIT_CHOICES: UnitChoice[] = [
  { unit: 'hour', label: 'Hour', short: 'h', suggestions: [1, 4, 12] },
  { unit: 'day', label: 'Day', short: 'd', suggestions: [1, 3, 7] },
  { unit: 'week', label: 'Week', short: 'w', suggestions: [1, 2, 4] },
  { unit: 'month', label: 'Month', short: 'mo', suggestions: [1, 3, 6] },
];

const DEFAULT_AMOUNT_BY_UNIT: Record<RentDurationUnit, number> = {
  hour: 4,
  day: 1,
  week: 1,
  month: 1,
};

// Used by the per-app service picker to bubble familiar names to the top.
const POPULAR_APPS = new Set([
  'whatsapp',
  'telegram',
  'facebook',
  'instagram',
  'twitter',
  'x',
  'tiktok',
  'google',
  'gmail',
  'discord',
  'tinder',
  'snapchat',
  'linkedin',
  'youtube',
  'apple',
  'microsoft',
]);

function flagEmoji(code: string): string {
  // Convert ISO-3166 alpha-2 to flag emoji. Fallback to globe.
  if (!code || code.length !== 2) return '🌐';
  const A = 0x1f1e6;
  return String.fromCodePoint(
    A + code.toUpperCase().charCodeAt(0) - 65,
    A + code.toUpperCase().charCodeAt(1) - 65,
  );
}

function formatRemaining(expiresAt: string | null | undefined): string {
  if (!expiresAt) return '—';
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return 'Expired';
  const totalMin = Math.floor(ms / 60_000);
  const d = Math.floor(totalMin / (60 * 24));
  const h = Math.floor((totalMin % (60 * 24)) / 60);
  const m = totalMin % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function RentNumbersPage() {
  // ----- Static / session-level state -----
  const [activeRentals, setActiveRentals] = useState<SmsRental[]>([]);
  const [rentalHistory, setRentalHistory] = useState<SmsRental[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // ----- Rental form state -----
  const [rentalKind, setRentalKind] = useState<RentalKind>('full');
  const [unit, setUnit] = useState<RentDurationUnit>('day');
  const [amount, setAmount] = useState<number>(DEFAULT_AMOUNT_BY_UNIT.day);
  // Debounced copy of `amount` used for the actual /options fetch.
  // Without this, typing "12" fires /options for "1" then again for
  // "12" — each call probes SMS-Man and is wasteful. 300ms is enough
  // to wait for typing to settle without feeling sluggish.
  const [debouncedAmount, setDebouncedAmount] = useState<number>(amount);

  // Per-app rental: service picker
  const [services, setServices] = useState<SmsService[]>([]);
  const [serviceSearch, setServiceSearch] = useState('');
  const [debouncedServiceSearch, setDebouncedServiceSearch] = useState('');
  const [selectedService, setSelectedService] = useState<SmsService | null>(
    null,
  );
  const [isServicesLoading, setIsServicesLoading] = useState(false);

  // Country list with live availability + price
  const [options, setOptions] = useState<RentalOption[]>([]);
  const [isOptionsLoading, setIsOptionsLoading] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const optionsRequestId = useRef(0);

  // Buying state — which countryId we're currently submitting
  const [buyingCountryId, setBuyingCountryId] = useState<string | null>(null);

  // Extend dialog
  const [extendingRental, setExtendingRental] = useState<SmsRental | null>(
    null,
  );
  const [extendUnit, setExtendUnit] = useState<RentDurationUnit>('day');
  const [extendAmount, setExtendAmount] = useState<number>(1);
  const [isExtending, setIsExtending] = useState(false);

  // Messages dialog
  const [viewingRental, setViewingRental] = useState<SmsRental | null>(null);

  // ----- Initial load: wallet + active rentals + history -----
  const refreshActiveAndHistory = useCallback(async () => {
    try {
      const [active, history] = await Promise.all([
        getRentalHistory({ status: 'ACTIVE', limit: 50 }),
        getRentalHistory({ limit: 20 }),
      ]);
      setActiveRentals(
        (active.data || []).filter((r) => r.status === 'ACTIVE'),
      );
      setRentalHistory(
        (history.data || []).filter((r) => r.status !== 'ACTIVE'),
      );
    } catch (err) {
      console.error('Failed to fetch rentals:', err);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await refreshActiveAndHistory();
      setIsInitialLoading(false);
    })();
  }, [refreshActiveAndHistory]);

  // ----- Poll active rentals for incoming SMS -----
  useEffect(() => {
    if (activeRentals.length === 0) return;
    const poll = setInterval(async () => {
      for (const rental of activeRentals) {
        try {
          const res = await checkRentalStatus(rental.id);
          const newMsgs = res.rental?.messages?.length ?? 0;
          const oldMsgs = rental.messages?.length ?? 0;
          if (newMsgs > oldMsgs) {
            const incoming = (res.rental?.messages ?? []).slice(oldMsgs);
            incoming.forEach((m) =>
              toast.success('New SMS received', {
                description:
                  m.text.length > 60 ? m.text.slice(0, 60) + '...' : m.text,
              }),
            );
          }
          setActiveRentals((prev) =>
            prev.map((r) => (r.id === rental.id ? res.rental : r)),
          );
        } catch {
          /* ignore poll errors */
        }
      }
    }, 10_000);
    return () => clearInterval(poll);
  }, [activeRentals]);

  // ----- Service search (only fires in per-app mode) -----
  useEffect(() => {
    const id = setTimeout(
      () => setDebouncedServiceSearch(serviceSearch.trim()),
      250,
    );
    return () => clearTimeout(id);
  }, [serviceSearch]);

  useEffect(() => {
    if (rentalKind !== 'app') return;
    let cancelled = false;
    setIsServicesLoading(true);
    getServices({
      limit: 100,
      rentalCapable: true,
      ...(debouncedServiceSearch ? { search: debouncedServiceSearch } : {}),
    })
      .then((res) => {
        if (cancelled) return;
        setServices(res.data || []);
      })
      .catch(() => {
        if (!cancelled) setServices([]);
      })
      .finally(() => {
        if (!cancelled) setIsServicesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [rentalKind, debouncedServiceSearch]);

  // ----- Sort: popular apps first -----
  const sortedServices = useMemo(() => {
    return [...services].sort((a, b) => {
      const aPop = POPULAR_APPS.has(a.slug?.toLowerCase() ?? '') ? 0 : 1;
      const bPop = POPULAR_APPS.has(b.slug?.toLowerCase() ?? '') ? 0 : 1;
      if (aPop !== bPop) return aPop - bPop;
      return a.name.localeCompare(b.name);
    });
  }, [services]);

  // Debounce raw `amount` -> `debouncedAmount`. Typing a multi-digit
  // value or rapidly clicking suggestion chips no longer fans out a
  // /options request per keystroke.
  useEffect(() => {
    const id = setTimeout(() => setDebouncedAmount(amount), 300);
    return () => clearTimeout(id);
  }, [amount]);

  // ----- Country options: fetch whenever the duration combo changes -----
  const fetchOptions = useCallback(async () => {
    if (debouncedAmount < 1) return;
    if (rentalKind === 'app' && !selectedService) {
      // Per-app mode needs a service before we can fetch options
      setOptions([]);
      setOptionsError(null);
      return;
    }
    const requestId = ++optionsRequestId.current;
    const isStale = () => requestId !== optionsRequestId.current;
    setIsOptionsLoading(true);
    setOptionsError(null);
    try {
      const res = await getRentalOptions({
        duration: debouncedAmount,
        unit,
        applicationId:
          rentalKind === 'app' && selectedService
            ? selectedService.id
            : undefined,
      });
      if (isStale()) return;
      setOptions(res.data || []);
    } catch (err) {
      if (isStale()) return;
      console.error('Failed to fetch rental options:', err);
      setOptions([]);
      setOptionsError(
        'Could not load rental options right now. Please try again.',
      );
    } finally {
      if (!isStale()) setIsOptionsLoading(false);
    }
  }, [debouncedAmount, unit, rentalKind, selectedService]);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  // ----- Filter country rows by search box -----
  const visibleOptions = useMemo(() => {
    const q = countrySearch.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.country.name.toLowerCase().includes(q) ||
        o.country.code.toLowerCase().includes(q),
    );
  }, [options, countrySearch]);

  // ----- Rent a number -----
  const handleRent = async (option: RentalOption) => {
    if (buyingCountryId) return;
    setBuyingCountryId(option.country.id);
    try {
      const res = await rentNumber({
        countryId: option.country.id,
        duration: amount,
        unit,
        applicationId:
          rentalKind === 'app' && selectedService
            ? selectedService.id
            : undefined,
      });
      const rental = (res.rental ?? res) as SmsRental;
      setActiveRentals((prev) => [rental, ...prev]);
      toast.success('Number rented', {
        description: `${rental.phoneNumber ?? 'Number assigned'} · ${option.country.name}`,
      });
    } catch (err: any) {
      const msg = err?.response?.data?.message || '';
      toast.error('Could not rent number', {
        description: msg || 'Please try a different country or duration.',
      });
    } finally {
      setBuyingCountryId(null);
    }
  };

  // ----- Cancel rental -----
  const handleCancel = async (rental: SmsRental) => {
    if (!confirm('Cancel this rental? Refund depends on remaining time.'))
      return;
    try {
      const res = await cancelRental(rental.id);
      setActiveRentals((prev) => prev.filter((r) => r.id !== rental.id));
      toast.success('Rental cancelled', { description: (res as any)?.message });
      refreshActiveAndHistory();
    } catch (err: any) {
      toast.error('Could not cancel rental', {
        description: err?.response?.data?.message || 'Please try again.',
      });
    }
  };

  // ----- Extend rental -----
  const handleOpenExtend = (rental: SmsRental) => {
    setExtendingRental(rental);
    setExtendUnit('day');
    setExtendAmount(1);
  };

  const handleConfirmExtend = async () => {
    if (!extendingRental) return;
    setIsExtending(true);
    try {
      const res = await extendRental(extendingRental.id, {
        duration: extendAmount,
        unit: extendUnit,
      });
      setActiveRentals((prev) =>
        prev.map((r) => (r.id === extendingRental.id ? res.rental : r)),
      );
      toast.success(res.message || 'Rental extended');
      setExtendingRental(null);
    } catch (err: any) {
      toast.error('Could not extend rental', {
        description:
          err?.response?.data?.message || 'Please try again in a few seconds.',
      });
    } finally {
      setIsExtending(false);
    }
  };

  // ----- UI -----
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Rent Numbers</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Rent a phone number to receive SMS for hours, days, weeks, or
            months.
          </p>
        </div>
      </div>

      {/* Active rentals (only if any) */}
      {activeRentals.length > 0 && (
        <section>
          <h2 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
            Active rentals ({activeRentals.length})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {activeRentals.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(15,23,42,0.6)] p-4 backdrop-blur"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-lg font-semibold tracking-tight">
                      {r.phoneNumber || '—'}
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {r.service?.name ?? 'Full number'} ·{' '}
                      {r.country?.name ?? '—'}
                    </p>
                  </div>
                  {r.phoneNumber && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(r.phoneNumber!);
                        toast.success('Copied');
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-4 text-xs">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {formatRemaining(r.expiresAt)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5" />
                    {r.messages?.length ?? 0} SMS
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewingRental(r)}
                  >
                    View SMS
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenExtend(r)}
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Extend
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCancel(r)}
                  >
                    <X className="mr-1 h-3.5 w-3.5" />
                    Cancel
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Rental Type toggle */}
      <section className="space-y-3">
        <h2 className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
          1. Choose rental type
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setRentalKind('full');
              setSelectedService(null);
            }}
            className={cn(
              'rounded-xl border p-4 text-left transition',
              rentalKind === 'full'
                ? 'border-primary bg-primary/5 ring-primary/30 ring-2'
                : 'border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.25)]',
            )}
          >
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="font-medium">Full Number</span>
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              Receive all SMS sent to the line.
            </p>
          </button>
          <button
            type="button"
            onClick={() => setRentalKind('app')}
            className={cn(
              'rounded-xl border p-4 text-left transition',
              rentalKind === 'app'
                ? 'border-primary bg-primary/5 ring-primary/30 ring-2'
                : 'border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.25)]',
            )}
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="font-medium">Per App</span>
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              Receive SMS for one specific service only.
            </p>
          </button>
        </div>
      </section>

      {/* Per-app: service picker */}
      {rentalKind === 'app' && (
        <section className="space-y-3">
          <h2 className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
            2. Choose service
          </h2>
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              value={serviceSearch}
              onChange={(e) => setServiceSearch(e.target.value)}
              placeholder="Search services (WhatsApp, Telegram, Google...)"
              className="pl-9"
            />
          </div>
          {selectedService && (
            <div className="border-primary/30 bg-primary/5 flex items-center justify-between rounded-xl border px-3 py-2">
              <span className="text-sm">
                Selected: <strong>{selectedService.name}</strong>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedService(null)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
          {!selectedService && (
            <div className="grid max-h-60 grid-cols-2 gap-2 overflow-y-auto rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(15,23,42,0.4)] p-2 sm:grid-cols-3 md:grid-cols-4">
              {isServicesLoading ? (
                <div className="col-span-full flex items-center justify-center py-6">
                  <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
                </div>
              ) : sortedServices.length === 0 ? (
                <div className="text-muted-foreground col-span-full py-6 text-center text-sm">
                  No services found.
                </div>
              ) : (
                sortedServices.map((svc) => (
                  <button
                    key={svc.id}
                    onClick={() => setSelectedService(svc)}
                    className="hover:border-primary/30 hover:bg-primary/5 flex items-center gap-2 rounded-lg border border-transparent px-2 py-2 text-left text-sm transition"
                  >
                    {svc.iconUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={svc.iconUrl}
                        alt=""
                        className="h-5 w-5 flex-shrink-0"
                        loading="lazy"
                      />
                    ) : (
                      <span className="bg-muted flex h-5 w-5 flex-shrink-0 items-center justify-center rounded text-[10px]">
                        📱
                      </span>
                    )}
                    <span className="truncate">{svc.name}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </section>
      )}

      {/* Duration */}
      <section className="space-y-3">
        <h2 className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
          {rentalKind === 'app' ? '3.' : '2.'} Choose duration
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {UNIT_CHOICES.map((u) => (
            <button
              key={u.unit}
              onClick={() => {
                setUnit(u.unit);
                setAmount(DEFAULT_AMOUNT_BY_UNIT[u.unit]);
              }}
              className={cn(
                'rounded-xl border py-3 text-sm font-medium transition',
                unit === u.unit
                  ? 'border-primary bg-primary/5 ring-primary/30 ring-2'
                  : 'border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.25)]',
              )}
            >
              {u.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Input
            type="number"
            min={1}
            max={720}
            value={amount}
            onChange={(e) => {
              const v = parseInt(e.target.value);
              if (Number.isFinite(v) && v > 0) setAmount(v);
            }}
            className="w-28"
          />
          <span className="text-muted-foreground text-sm">
            × {UNIT_CHOICES.find((u) => u.unit === unit)?.label.toLowerCase()}
            {amount > 1 ? 's' : ''}
          </span>
          <div className="ml-auto flex flex-wrap gap-1">
            {UNIT_CHOICES.find((u) => u.unit === unit)?.suggestions.map((s) => (
              <button
                key={s}
                onClick={() => setAmount(s)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs transition',
                  amount === s
                    ? 'border-primary bg-primary/10'
                    : 'border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.25)]',
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Countries */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
            {rentalKind === 'app' ? '4.' : '3.'} Pick a country
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchOptions}
            disabled={isOptionsLoading}
          >
            <RefreshCw
              className={cn('h-3.5 w-3.5', isOptionsLoading && 'animate-spin')}
            />
          </Button>
        </div>

        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            value={countrySearch}
            onChange={(e) => setCountrySearch(e.target.value)}
            placeholder="Search country"
            className="pl-9"
          />
        </div>

        {rentalKind === 'app' && !selectedService ? (
          <div className="text-muted-foreground rounded-xl border border-dashed border-[rgba(255,255,255,0.1)] py-10 text-center text-sm">
            Pick a service above to see available countries.
          </div>
        ) : isOptionsLoading ? (
          // Shimmer skeletons matching the country row layout. Better
          // than a centered spinner because the user can see the
          // shape of what's about to load and doesn't lose context.
          <div className="grid gap-2 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 rounded-xl border border-[rgba(255,255,255,0.06)] p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="bg-muted/60 h-7 w-7 flex-shrink-0 animate-pulse rounded" />
                  <div className="min-w-0 space-y-1.5">
                    <div className="bg-muted/60 h-3 w-24 animate-pulse rounded" />
                    <div className="bg-muted/40 h-2.5 w-16 animate-pulse rounded" />
                  </div>
                </div>
                <div className="space-y-1.5 text-right">
                  <div className="bg-muted/60 h-3 w-12 animate-pulse rounded" />
                  <div className="bg-muted/40 h-2.5 w-10 animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : optionsError ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 py-6 text-sm">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            {optionsError}
          </div>
        ) : visibleOptions.length === 0 ? (
          <div className="text-muted-foreground rounded-xl border border-dashed border-[rgba(255,255,255,0.1)] py-10 text-center text-sm">
            No countries available for this duration. Try a different unit.
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {visibleOptions.map((o) => {
              const busy = buyingCountryId === o.country.id;
              const lowStock = o.available > 0 && o.available <= 5;
              return (
                <button
                  key={o.country.id}
                  onClick={() => handleRent(o)}
                  disabled={busy || !!buyingCountryId}
                  className={cn(
                    'group flex items-center justify-between gap-3 rounded-xl border p-3 text-left transition',
                    'hover:border-primary/40 hover:bg-primary/5 border-[rgba(255,255,255,0.08)]',
                    busy && 'opacity-50',
                    !!buyingCountryId &&
                      !busy &&
                      'cursor-not-allowed opacity-40',
                  )}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="text-2xl leading-none">
                      {flagEmoji(o.country.code)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {o.country.name}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {o.available.toLocaleString()} available
                        {lowStock && (
                          <span className="ml-1 text-amber-500">
                            · low stock
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">${o.price}</p>
                    <p className="text-muted-foreground text-xs">
                      {busy ? (
                        <span className="inline-flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Renting…
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          Rent <ChevronRight className="h-3 w-3" />
                        </span>
                      )}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* History (collapsed by default) */}
      {!isInitialLoading && rentalHistory.length > 0 && (
        <section>
          <details className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(15,23,42,0.4)] p-4">
            <summary className="text-muted-foreground cursor-pointer text-sm font-semibold tracking-wide uppercase">
              History ({rentalHistory.length})
            </summary>
            <div className="mt-3 space-y-2">
              {rentalHistory.slice(0, 20).map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-lg border border-[rgba(255,255,255,0.05)] px-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-mono">{r.phoneNumber || '—'}</p>
                    <p className="text-muted-foreground text-xs">
                      {r.service?.name ?? 'Full number'} ·{' '}
                      {r.country?.name ?? '—'}
                    </p>
                  </div>
                  <Badge variant="outline">{r.status}</Badge>
                </div>
              ))}
            </div>
          </details>
        </section>
      )}

      {/* SMS dialog */}
      <Dialog
        open={viewingRental != null}
        onOpenChange={(o) => !o && setViewingRental(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              SMS messages — {viewingRental?.phoneNumber || '—'}
            </DialogTitle>
            <DialogDescription>
              {viewingRental?.country?.name ?? '—'} ·{' '}
              {viewingRental?.service?.name ?? 'Full number'}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] space-y-2 overflow-y-auto">
            {(viewingRental?.messages?.length ?? 0) === 0 ? (
              <p className="text-muted-foreground py-6 text-center text-sm">
                No SMS received yet. We'll notify you when one arrives.
              </p>
            ) : (
              viewingRental?.messages?.map((m, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(15,23,42,0.4)] p-3 text-sm"
                >
                  <p className="text-muted-foreground mb-1 text-xs">
                    {m.from || 'unknown'} ·{' '}
                    {new Date(m.receivedAt).toLocaleTimeString()}
                  </p>
                  <p>{m.text}</p>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Extend dialog */}
      <Dialog
        open={extendingRental != null}
        onOpenChange={(o) => !o && setExtendingRental(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extend rental</DialogTitle>
            <DialogDescription>
              Add more time to {extendingRental?.phoneNumber || 'this number'}.
              You'll be charged at the current rate.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2">
              {UNIT_CHOICES.map((u) => (
                <button
                  key={u.unit}
                  onClick={() => {
                    setExtendUnit(u.unit);
                    setExtendAmount(DEFAULT_AMOUNT_BY_UNIT[u.unit]);
                  }}
                  className={cn(
                    'rounded-xl border py-2 text-sm font-medium transition',
                    extendUnit === u.unit
                      ? 'border-primary bg-primary/5 ring-primary/30 ring-2'
                      : 'border-[rgba(255,255,255,0.1)]',
                  )}
                >
                  {u.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min={1}
                max={720}
                value={extendAmount}
                onChange={(e) => {
                  const v = parseInt(e.target.value);
                  if (Number.isFinite(v) && v > 0) setExtendAmount(v);
                }}
                className="w-28"
              />
              <span className="text-muted-foreground text-sm">
                ×{' '}
                {UNIT_CHOICES.find(
                  (u) => u.unit === extendUnit,
                )?.label.toLowerCase()}
                {extendAmount > 1 ? 's' : ''}
              </span>
            </div>
            <Button
              className="w-full"
              onClick={handleConfirmExtend}
              disabled={isExtending}
            >
              {isExtending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Extending…
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Confirm extension
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
