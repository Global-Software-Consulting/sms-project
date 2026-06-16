'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Star, Trash2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getFavorites,
  removeFavorite,
  getCountryFlag,
  formatPrice,
  SmsFavorite,
} from '@/lib/api/smsApi';
import { getWalletBalance, formatBalance } from '@/lib/api/walletApi';
import { safeServiceIcon } from '@/lib/service-icon';
import { useAppDispatch } from '@/store/hooks';
import { initializeAuth } from '@/store/slices/authSlice';

export default function FavoritesPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [favorites, setFavorites] = useState<SmsFavorite[]>([]);
  const [walletBalance, setWalletBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [buyingId, setBuyingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [favsRes, balRes] = await Promise.allSettled([
          getFavorites({ limit: 100 }),
          getWalletBalance(),
        ]);
        if (cancelled) return;
        if (favsRes.status === 'fulfilled') {
          // Drop malformed legacy rows so the render path is safe.
          const clean = (favsRes.value.data || []).filter(
            (f) => f.service && f.country && f.provider,
          );
          setFavorites(clean);
        }
        if (balRes.status === 'fulfilled') {
          setWalletBalance(balRes.value.balance);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleRemove = async (id: string) => {
    setRemovingId(id);
    try {
      await removeFavorite(id);
      setFavorites((prev) => prev.filter((f) => f.id !== id));
      toast.success('Removed from favorites');
    } catch (err: any) {
      toast.error('Failed to remove favorite', {
        description: err.response?.data?.message || 'Please try again.',
      });
    } finally {
      setRemovingId(null);
    }
  };

  const handleBuy = async (fav: SmsFavorite) => {
    if (!fav.product || fav.product.availableCount <= 0) {
      toast.error('Out of stock');
      return;
    }
    const price = parseFloat(fav.product.yourPrice);
    const balance = parseFloat(walletBalance);
    if (price > balance) {
      toast.error('Insufficient balance', {
        description: `You need ${formatPrice(fav.product.yourPrice)} but have ${formatBalance(walletBalance, 'USD')}`,
      });
      return;
    }

    setBuyingId(fav.id);
    try {
      // We need a product id for activateNumber. Favorites use (service,
      // country, provider) keys, so route the user to the activation
      // page with a deep link instead of calling activate here. Keeps
      // the legacy buy path as the single source of truth.
      router.push(
        `/dashboard/activation?serviceId=${fav.service!.id}&countryId=${fav.country!.id}&providerId=${fav.provider!.id}`,
      );
      // refresh auth in background so rank updates on next visit
      dispatch(initializeAuth());
    } finally {
      setBuyingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="text-primary mx-auto mb-4 h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 md:px-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Favorites</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Your saved service + country combos. Tap Buy to activate one.
          </p>
        </div>
        <div className="text-right">
          <p className="text-muted-foreground text-xs tracking-wide uppercase">
            Wallet Balance
          </p>
          <p className="text-lg font-bold tabular-nums">
            {formatBalance(walletBalance, 'USD')}
          </p>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="border-border bg-card/30 rounded-2xl border p-10 text-center">
          <Star className="text-muted-foreground mx-auto mb-3 h-10 w-10" />
          <p className="text-muted-foreground text-sm">
            No favorites yet. Star a service+country pair on the activation page
            to save it here for one-tap reordering.
          </p>
          <Button asChild className="mt-4">
            <a href="/dashboard/activation">Browse services</a>
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {favorites.map((fav) => {
            const out = !fav.product || fav.product.availableCount <= 0;
            const iconSrc = safeServiceIcon(
              fav.service?.iconUrl ?? null,
              fav.service?.name || fav.service?.slug || null,
            );
            return (
              <div
                key={fav.id}
                className="border-border hover:border-primary/40 bg-card/40 flex items-center gap-3 rounded-xl border px-3 py-3 transition-colors"
              >
                <div className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg text-sm">
                  {iconSrc ? (
                    <img
                      src={iconSrc}
                      alt=""
                      className="h-6 w-6"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    '📱'
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="truncate text-sm font-semibold">
                      {fav.service?.name ?? '—'}
                    </span>
                    <span className="text-muted-foreground text-xs">·</span>
                    <span className="flex items-center gap-1 text-xs">
                      <span>{getCountryFlag(fav.country?.code ?? '')}</span>
                      <span className="capitalize">
                        {fav.country?.name ?? '—'}
                      </span>
                    </span>
                  </div>
                  <div className="text-muted-foreground mt-0.5 text-xs tabular-nums">
                    {fav.product
                      ? `${fav.product.availableCount.toLocaleString()} available`
                      : 'Currently unavailable'}
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  {fav.product ? (
                    <span className="text-sm font-bold tabular-nums">
                      {formatPrice(fav.product.yourPrice)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </div>

                <div className="ml-1 flex shrink-0 items-center gap-1">
                  <Button
                    size="sm"
                    disabled={out || buyingId === fav.id}
                    onClick={() => handleBuy(fav)}
                    className="h-8 gap-1 text-xs"
                  >
                    {buyingId === fav.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <ShoppingCart className="h-3.5 w-3.5" />
                    )}
                    Buy
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={removingId === fav.id}
                    onClick={() => handleRemove(fav.id)}
                    className="text-muted-foreground hover:text-destructive h-8 w-8 p-0"
                    title="Remove from favorites"
                  >
                    {removingId === fav.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
