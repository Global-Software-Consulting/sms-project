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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Star, Loader2, AlertCircle, CheckCircle2, Clock, XCircle, Eye, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  getMySlots,
  getMyReviews,
  submitReview,
  updateMyReview,
  deleteMyReview,
  getReviewStatusLabel,
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

  // Preview / Edit / Delete dialog state
  const [selectedReview, setSelectedReview] = useState<UserReview | null>(null);
  const [dialogMode, setDialogMode] = useState<'preview' | 'edit' | 'delete' | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editTitle, setEditTitle] = useState('');
  const [editText, setEditText] = useState('');
  const [editIsAnonymous, setEditIsAnonymous] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
    if (!reviewText.trim()) {
      toast.error('Please write your review');
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

  const openPreview = (review: UserReview) => {
    setSelectedReview(review);
    setDialogMode('preview');
  };

  const openEdit = (review: UserReview) => {
    setSelectedReview(review);
    setEditRating(review.rating);
    setEditTitle(review.title || '');
    setEditText(review.text);
    setEditIsAnonymous(review.isAnonymous);
    setDialogMode('edit');
  };

  const openDelete = (review: UserReview) => {
    setSelectedReview(review);
    setDialogMode('delete');
  };

  const closeDialog = () => {
    setDialogMode(null);
    setSelectedReview(null);
  };

  const handleUpdateReview = async () => {
    if (!selectedReview) return;
    if (editRating === 0) {
      toast.error('Please select a rating');
      return;
    }
    if (!editText.trim()) {
      toast.error('Please write your review');
      return;
    }

    try {
      setIsUpdating(true);
      await updateMyReview(selectedReview.id, {
        rating: editRating,
        title: editTitle.trim() || null,
        text: editText,
        isAnonymous: editIsAnonymous,
      });
      toast.success('Review updated successfully');
      closeDialog();
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update review');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!selectedReview) return;
    try {
      setIsDeleting(true);
      await deleteMyReview(selectedReview.id);
      toast.success('Review deleted successfully');
      closeDialog();
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete review');
    } finally {
      setIsDeleting(false);
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
        <h1 className="text-2xl font-bold sm:text-3xl">Reviews</h1>
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
            disabled={availableSlots === 0 || isSubmitting || rating === 0 || !reviewText.trim()}
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
              <div key={review.id} className="border-border rounded-lg border p-4 transition-colors hover:bg-muted/30">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {review.title && (
                      <h4 className="font-semibold truncate">{review.title}</h4>
                    )}
                    <div className="mt-1 flex flex-wrap items-center gap-2">
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
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-muted-foreground text-sm">
                      {formatDate(review.createdAt)}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => openPreview(review)}
                        title="Preview"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-primary hover:text-primary"
                        onClick={() => openEdit(review)}
                        title="Edit"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => openDelete(review)}
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm line-clamp-2">{review.text}</p>
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

      {/* Preview Dialog */}
      <Dialog open={dialogMode === 'preview'} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Preview</DialogTitle>
            <DialogDescription>
              Your review as submitted
            </DialogDescription>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex space-x-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < selectedReview.rating
                          ? 'fill-warning text-warning'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
                <Badge
                  variant={selectedReview.status === 'APPROVED' ? 'default' : 'secondary'}
                  className="flex items-center gap-1"
                >
                  {getStatusIcon(selectedReview.status)}
                  {getReviewStatusLabel(selectedReview.status)}
                </Badge>
              </div>
              {selectedReview.title && (
                <div>
                  <p className="text-muted-foreground mb-1 text-xs uppercase">Title</p>
                  <h3 className="font-semibold">{selectedReview.title}</h3>
                </div>
              )}
              <div>
                <p className="text-muted-foreground mb-1 text-xs uppercase">Review</p>
                <p className="text-sm whitespace-pre-wrap">{selectedReview.text}</p>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Submitted {formatDate(selectedReview.createdAt)}</span>
                {selectedReview.isAnonymous && <span className="italic">Anonymous</span>}
              </div>
              {selectedReview.adminNote && (
                <div className="rounded bg-yellow-500/10 p-3 text-xs">
                  <span className="font-medium">Admin note:</span> {selectedReview.adminNote}
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (selectedReview) openEdit(selectedReview);
              }}
            >
              <Edit2 className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button onClick={closeDialog}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={dialogMode === 'edit'} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Review</DialogTitle>
            <DialogDescription>
              Update your review. It may need to be re-approved by our team.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Rating */}
            <div className="space-y-2">
              <Label>Rating *</Label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setEditRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-7 w-7 ${
                        star <= editRating
                          ? 'fill-warning text-warning'
                          : 'text-muted-foreground'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label>Title (Optional)</Label>
              <Input
                placeholder="Summarize your experience..."
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                maxLength={200}
              />
            </div>

            {/* Text */}
            <div className="space-y-2">
              <Label>Your Review *</Label>
              <Textarea
                placeholder="Share your experience..."
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={5}
                maxLength={2000}
              />
              <p className="text-muted-foreground text-right text-xs">
                {editText.length}/2000 characters
              </p>
            </div>

            {/* Anonymous */}
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-anonymous"
                checked={editIsAnonymous}
                onCheckedChange={setEditIsAnonymous}
              />
              <Label htmlFor="edit-anonymous" className="cursor-pointer">
                Submit anonymously
              </Label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={closeDialog} disabled={isUpdating}>
              Cancel
            </Button>
            <Button onClick={handleUpdateReview} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={dialogMode === 'delete'} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Review?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The review will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          {selectedReview && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
              <div className="flex space-x-0.5 mb-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < selectedReview.rating
                        ? 'fill-warning text-warning'
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
              {selectedReview.title && <p className="font-semibold">{selectedReview.title}</p>}
              <p className="text-muted-foreground line-clamp-2">{selectedReview.text}</p>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={closeDialog} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteReview}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Review
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
