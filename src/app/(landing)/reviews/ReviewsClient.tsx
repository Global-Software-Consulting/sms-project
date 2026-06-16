'use client';

import { useEffect, useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getPublicReviews,
  getAverageRating,
  PublicReview,
  AverageRating,
} from '@/lib/api/reviewsApi';

const PAGE_SIZE = 12;

function ratingFilters() {
  return [0, 5, 4, 3, 2, 1] as const;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function displayNameFor(r: PublicReview): string {
  if (r.isAnonymous) return 'Anonymous';
  const u = r.user;
  if (!u) return 'Customer';
  const first = u.firstName ?? '';
  const last = u.lastName ?? '';
  const full = `${first} ${last}`.trim();
  return full || 'Customer';
}

export default function ReviewsClient() {
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [stats, setStats] = useState<AverageRating | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [list, rating] = await Promise.allSettled([
          getPublicReviews({
            page: 1,
            limit: PAGE_SIZE,
            ...(ratingFilter > 0 ? { rating: ratingFilter } : {}),
            sortBy: 'createdAt',
            sortOrder: 'desc',
          }),
          getAverageRating(),
        ]);
        if (cancelled) return;
        if (list.status === 'fulfilled') {
          setReviews(list.value.data);
          setTotalPages(list.value.meta.totalPages);
          setPage(1);
        }
        if (rating.status === 'fulfilled') {
          setStats(rating.value);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ratingFilter]);

  const loadMore = async () => {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    try {
      const next = page + 1;
      const res = await getPublicReviews({
        page: next,
        limit: PAGE_SIZE,
        ...(ratingFilter > 0 ? { rating: ratingFilter } : {}),
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      setReviews((prev) => [...prev, ...res.data]);
      setPage(next);
      setTotalPages(res.meta.totalPages);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Rating summary */}
      {stats && stats.count > 0 && (
        <div className="border-border bg-card/40 flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5">
          <div className="flex items-center gap-3">
            <div className="text-3xl font-bold">{stats.average.toFixed(1)}</div>
            <div>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={
                      i < Math.round(stats.average)
                        ? 'fill-warning text-warning h-4 w-4'
                        : 'text-muted-foreground/30 h-4 w-4'
                    }
                  />
                ))}
              </div>
              <p className="text-muted-foreground text-xs">
                Based on {stats.count.toLocaleString()} review
                {stats.count === 1 ? '' : 's'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Rating filter */}
      <div className="flex flex-wrap gap-2">
        {ratingFilters().map((r) => (
          <Button
            key={r}
            size="sm"
            variant={ratingFilter === r ? 'default' : 'outline'}
            onClick={() => setRatingFilter(r)}
            className="h-8 gap-1 text-xs"
          >
            {r === 0 ? (
              'All'
            ) : (
              <>
                {r}
                <Star className="h-3 w-3" />
              </>
            )}
          </Button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-muted-foreground border-border rounded-2xl border py-16 text-center">
          No reviews yet.
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardHeader>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="fill-warning text-warning h-4 w-4"
                        />
                      ))}
                    </div>
                    <span className="text-muted-foreground text-xs">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                  <CardTitle className="text-base">
                    {displayNameFor(review)}
                  </CardTitle>
                  {review.title && (
                    <p className="text-muted-foreground text-sm font-medium">
                      {review.title}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{review.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {page < totalPages && (
            <div className="flex justify-center pt-4">
              <Button
                onClick={loadMore}
                disabled={loadingMore}
                variant="outline"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load more'
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
