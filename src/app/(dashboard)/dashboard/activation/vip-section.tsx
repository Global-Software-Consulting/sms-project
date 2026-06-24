'use client';
import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Search,
  ChevronDown,
  ChevronRight,
  Loader2,
  Crown,
} from 'lucide-react';
import { cn } from '@/components/ui/utils';
import { safeServiceIcon } from '@/lib/service-icon';
import {
  getVipServiceCountries,
  type UnifiedVipService,
} from '@/lib/api/smsApi';

interface VipSectionProps {
  services: UnifiedVipService[];
  isLoading: boolean;
  /**
   * Called when user picks a (service, country, providerId) triple.
   * Parent resolves the matching SmsProduct via real-time fetch and
   * launches the existing buy flow — no duplicated order code here.
   */
  onPick: (args: {
    serviceId: string;
    serviceName: string;
    serviceSlug: string;
    countryId: string;
    countryName: string;
    countryCode: string;
    providerId: string;
  }) => void;
  /** Slug → in-flight pick (disables that country card while order spinning) */
  busyKey: string | null;
}

const COUNTRIES_PER_SERVICE_INITIAL = 9;

export function VipSection({
  services,
  isLoading,
  onPick,
  busyKey,
}: VipSectionProps) {
  const [search, setSearch] = useState('');
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const [fullCountries, setFullCountries] = useState<
    Record<string, UnifiedVipService['countries']>
  >({});
  const [isExpanding, setIsExpanding] = useState<string | null>(null);

  const q = search.trim().toLowerCase();
  const filtered = q
    ? services.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.countries.some((c) => c.name.toLowerCase().includes(q)),
      )
    : services;

  const handleToggleService = useCallback(
    async (service: UnifiedVipService) => {
      if (expandedSlug === service.slug) {
        setExpandedSlug(null);
        return;
      }
      setExpandedSlug(service.slug);
      if (service.hasMore && !fullCountries[service.slug]) {
        try {
          setIsExpanding(service.slug);
          const res = await getVipServiceCountries(service.slug);
          setFullCountries((prev) => ({
            ...prev,
            [service.slug]: res.countries,
          }));
        } catch {
          // Fall back to the partial list already on the service object.
        } finally {
          setIsExpanding(null);
        }
      }
    },
    [expandedSlug, fullCountries],
  );

  useEffect(() => {
    setExpandedSlug(null);
  }, [services]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="text-primary h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (services.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <Crown className="text-muted-foreground mx-auto mb-3 h-10 w-10 opacity-30" />
          <p className="text-muted-foreground text-sm">
            No VIP services available right now.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-4 sm:p-6">
        <div className="relative">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search VIP services or countries"
            className="pl-9"
          />
        </div>

        {filtered.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            No services match your search.
          </p>
        ) : (
          <div className="space-y-2">
            {filtered.map((service) => {
              const isOpen = expandedSlug === service.slug;
              const countries =
                fullCountries[service.slug] ??
                service.countries.slice(0, COUNTRIES_PER_SERVICE_INITIAL);
              const safeIcon = safeServiceIcon(service.iconUrl, service.name);

              return (
                <div
                  key={service.slug}
                  className="border-border overflow-hidden rounded-xl border"
                >
                  <button
                    onClick={() => handleToggleService(service)}
                    className="hover:bg-muted/50 flex w-full items-center gap-3 p-3 text-left transition-colors sm:p-4"
                  >
                    <div className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-base">
                      {safeIcon ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={safeIcon}
                          alt={service.name}
                          className="h-6 w-6 object-contain"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              'none';
                          }}
                        />
                      ) : (
                        '📱'
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-1 text-sm font-semibold sm:text-base">
                        {service.name}
                      </h3>
                      <p className="text-muted-foreground text-xs">
                        {service.countryCount}{' '}
                        {service.countryCount === 1 ? 'country' : 'countries'}
                      </p>
                    </div>
                    {isOpen ? (
                      <ChevronDown className="text-muted-foreground h-4 w-4 shrink-0" />
                    ) : (
                      <ChevronRight className="text-muted-foreground h-4 w-4 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="border-border bg-muted/30 border-t p-3 sm:p-4">
                      {isExpanding === service.slug ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="text-primary h-5 w-5 animate-spin" />
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {countries.map((country) => {
                            // Pick best available provider (highest rating
                            // among those with stock). Falls back to first
                            // entry so we still show the row when stock
                            // data hasn't synced yet — buy attempt then
                            // surfaces a clean "no availability" toast.
                            const winner =
                              country.providers.find(
                                (p) => p.availableCount > 0,
                              ) ?? country.providers[0];
                            if (!winner) return null;
                            const pickKey = `${service.slug}:${country.id}`;
                            const isBusy = busyKey === pickKey;
                            const isSoldOut =
                              country.providers.every(
                                (p) => p.availableCount === 0,
                              ) && winner.availableCount === 0;
                            const priceLabel =
                              winner.price != null
                                ? `$${winner.price.toFixed(2)}`
                                : null;
                            return (
                              <Button
                                key={country.id}
                                variant="outline"
                                size="sm"
                                disabled={isBusy || isSoldOut}
                                onClick={() =>
                                  onPick({
                                    serviceId: winner.serviceId,
                                    serviceName: service.name,
                                    serviceSlug: service.slug,
                                    countryId: country.id,
                                    countryName: country.name,
                                    countryCode: country.code,
                                    providerId: winner.providerId,
                                  })
                                }
                                className={cn(
                                  'h-auto justify-start gap-2 px-3 py-2 text-left',
                                  isSoldOut && 'opacity-50',
                                )}
                              >
                                {country.iconUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={country.iconUrl}
                                    alt={country.code}
                                    className="h-4 w-4 shrink-0 rounded-sm object-cover"
                                  />
                                ) : (
                                  <span className="text-muted-foreground text-xs">
                                    {country.code}
                                  </span>
                                )}
                                <span className="min-w-0 flex-1 truncate text-xs font-medium">
                                  {country.name}
                                </span>
                                {isSoldOut ? (
                                  <span className="text-muted-foreground shrink-0 text-[10px] font-medium uppercase">
                                    Sold out
                                  </span>
                                ) : priceLabel ? (
                                  <span className="text-primary shrink-0 text-xs font-semibold">
                                    {priceLabel}
                                  </span>
                                ) : null}
                                {isBusy && (
                                  <Loader2 className="h-3 w-3 shrink-0 animate-spin" />
                                )}
                              </Button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
