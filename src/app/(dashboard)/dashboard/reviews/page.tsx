'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Star, Loader2, AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  getMySlots,
  getMyReviews,
  submitReview,
  getReviewStatusLabel,
  getReviewStatusColor,
  formatRelativeTime,
  type ReviewSlotInfo,
  type UserReview,
} from '@/lib/api/reviewsApi';

export default function ReviewsDashboard() {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API data
  const [slotInfo, setSlotInfo] = useState<ReviewSlotInfo | null>(null);
  const [myReviews, setMyReviews] = useState<UserReview[]>([]);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [slotsRes, reviewsRes] = await Promise.allSettled([
        getMySlots(),
        getMyReviews(),
      ]);

      if (slotsRes.status === 'fulfilled') {
        setSlotInfo(slotsRes.value);
      }

      if (reviewsRes.status === 'fulfilled') {
        setMyReviews(reviewsRes.value || []);
      }
    } catch (err) {
      console.error('Failed to fetch review data:', err);
      setError('Failed to load review data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    if (reviewText.length < 10) {
      toast.error('Review must be at least 10 characters long');
      return;
    }
    if (reviewText.length > 2000) {
      toast.error('Review cannot exceed 2000 characters');
      return;
    }
    if (!slotInfo || slotInfo.availableSlots <= 0) {
      toast.error('No review slots available');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await submitReview({
        rating,
        title: title.trim() || undefined,
        text: reviewText,
        isAnonymous,
      });

      toast.success('Review submitted!', {
        description: response.message || 'Your review is pending approval.',
      });

      // Reset form
      setRating(0);
      setTitle('');
      setReviewText('');
      setIsAnonymous(false);

      // Refresh data
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="text-primary mx-auto h-8 w-8 animate-spin" />
          <p className="text-muted-foreground mt-2">Loading review data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <AlertCircle className="text-destructive mx-auto h-8 w-8" />
          <p className="text-destructive mt-2">{error}</p>
          <Button onClick={fetchData} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const availableSlots = slotInfo?.availableSlots || 0;
  const totalSlots = slotInfo?.totalSlots || 0;
  const usedSlots = slotInfo?.usedSlots || 0;
  const totalSpent = slotInfo?.totalSpent || 0;
  const dollarPerSlot = slotInfo?.dollarPerSlot || 10;
  const nextSlotAt = slotInfo?.nextSlotAt || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reviews</h1>
        <p className="text-muted-foreground mt-1">
          Share your experience with our services
        </p>
      </div>

      {/* Review Slots Card */}
      <Card>
        <CardHeader>
          <CardTitle>Review Slots</CardTitle>
          <CardDescription>
            Earn review slots by spending on our platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-primary/10 rounded-lg p-4 text-center">
              <p className="text-primary text-3xl font-bold">{availableSlots}</p>
              <p className="text-muted-foreground text-sm">Available Slots</p>
            </div>
            <div className="bg-muted rounded-lg p-4 text-center">
              <p className="text-2xl font-bold">{usedSlots}</p>
              <p className="text-muted-foreground text-sm">Used Slots</p>
            </div>
            <div className="bg-muted rounded-lg p-4 text-center">
              <p className="text-2xl font-bold">{totalSlots}</p>
              <p className="text-muted-foreground text-sm">Total Earned</p>
            </div>
            <div className="bg-muted rounded-lg p-4 text-center">
              <p className="text-2xl font-bold">${totalSpent.toFixed(2)}</p>
              <p className="text-muted-foreground text-sm">Total Spent</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <Badge variant="secondary">Earn 1 slot per ${dollarPerSlot} spent</Badge>
            {nextSlotAt > 0 && (
              <p className="text-muted-foreground text-sm">
                ${nextSlotAt.toFixed(2)} more to earn next slot
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Write Review Card */}
      <Card>
        <CardHeader>
          <CardTitle>Write a Review</CardTitle>
          <CardDescription>
            Share your feedback about our service
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Rating */}
          <div className="space-y-2">
            <Label>Rating *</Label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                  type="button"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= rating
                        ? 'fill-warning text-warning'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-muted-foreground text-sm">
                {rating === 5 ? 'Excellent!' : rating === 4 ? 'Great!' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
              </p>
            )}
          </div>

          {/* Title (Optional) */}
          <div className="space-y-2">
            <Label>Title (Optional)</Label>
            <Input
              placeholder="Summarize your experience..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
            />
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <Label>Your Review *</Label>
            <Textarea
              placeholder="Share your experience... (minimum 10 characters)"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={6}
              maxLength={2000}
            />
            <p className="text-muted-foreground text-xs text-right">
              {reviewText.length}/2000 characters
            </p>
          </div>

          {/* Anonymous Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
            />
            <Label htmlFor="anonymous" className="cursor-pointer">
              Submit anonymously (hide your name)
            </Label>
          </div>

          {/* Submit Button */}
          <Button
            size="lg"
            onClick={handleSubmitReview}
            disabled={availableSlots === 0 || isSubmitting || rating === 0 || reviewText.length < 10}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Submit Review ({availableSlots} slot{availableSlots !== 1 ? 's' : ''} available)
              </>
            )}
          </Button>

          {availableSlots === 0 && (
            <p className="text-muted-foreground text-sm">
              You need to spend more to earn review slots. Spend ${dollarPerSlot} to earn 1 slot.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Your Reviews Card */}
      <Card>
        <CardHeader>
          <CardTitle>Your Reviews ({myReviews.length})</CardTitle>
          <CardDescription>Reviews you've submitted</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {myReviews.length > 0 ? (
            myReviews.map((review) => (
              <div key={review.id} className="border-border rounded-lg border p-4">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    {review.title && (
                      <h4 className="font-semibold">{review.title}</h4>
                    )}
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex space-x-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? 'fill-warning text-warning'
                                : 'text-muted-foreground'
                            }`}
                          />
                        ))}
                      </div>
                      <Badge
                        variant={review.status === 'APPROVED' ? 'default' : 'secondary'}
                        className="flex items-center gap-1"
                      >
                        {getStatusIcon(review.status)}
                        {getReviewStatusLabel(review.status)}
                      </Badge>
                      {review.isFeatured && (
                        <Badge variant="outline" className="border-warning text-warning">
                          Featured
                        </Badge>
                      )}
                    </div>
                  </div>
                  <span className="text-muted-foreground text-sm">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm">{review.text}</p>
                {review.isAnonymous && (
                  <p className="text-muted-foreground mt-2 text-xs italic">
                    Submitted anonymously
                  </p>
                )}
                {review.adminNote && (
                  <div className="mt-2 rounded bg-yellow-500/10 p-2 text-xs">
                    <span className="font-medium">Admin note:</span> {review.adminNote}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-muted-foreground py-8 text-center">
              <Star className="mx-auto mb-2 h-8 w-8 opacity-50" />
              <p className="text-sm">No reviews yet</p>
              <p className="text-xs">Submit your first review above!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
