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
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Crown,
  Check,
  ArrowRight,
  Loader2,
  AlertCircle,
  Calendar,
  RefreshCw,
  HelpCircle,
  Star,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getPublicRanks, type Rank } from '@/lib/api/ranksApi';
import { toast } from 'sonner';
import {
  getPlans,
  getCurrentMembership,
  subscribeToPlan,
  renewSubscription,
  upgradePlan,
  MembershipPlan,
  CurrentMembershipResponse,
  formatPrice,
  getPlanColor,
  getDaysRemainingText,
  isPlanUpgrade,
} from '@/lib/api/membershipApi';
import Link from 'next/link';

export default function MembershipDashboard() {
  const { user } = useAuth();
  // Data state
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [membership, setMembership] = useState<CurrentMembershipResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Action states
  const [isSubscribing, setIsSubscribing] = useState<string | null>(null);
  const [isRenewing, setIsRenewing] = useState(false);

  // Dialog states
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'subscribe' | 'upgrade' | 'renew';
    plan?: MembershipPlan;
  } | null>(null);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [plansRes, membershipRes, ranksRes] = await Promise.allSettled([
        getPlans(),
        getCurrentMembership(),
        getPublicRanks(),
      ]);

      if (plansRes.status === 'fulfilled') {
        // getPlans returns MembershipPlan[] directly
        setPlans(plansRes.value || []);
      } else {
        throw new Error('Failed to load plans');
      }

      if (membershipRes.status === 'fulfilled') {
        setMembership(membershipRes.value);
      }

      if (ranksRes.status === 'fulfilled') {
        setRanks(ranksRes.value || []);
      }
    } catch (err) {
      console.error('Failed to fetch membership data:', err);
      setError('Failed to load membership data. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle subscribe/upgrade
  // IMPORTANT: Use hasActiveSubscription to determine if user has a PAID subscription
  // FREE users have hasActiveSubscription=false, so they should use subscribeToPlan
  // Only users with an active PAID subscription should use upgradePlan
  const handleSubscribe = async (plan: MembershipPlan) => {
    const hasActivePaidSubscription = membership?.hasActiveSubscription === true;
    const isUpgrade = hasActivePaidSubscription && 
      membership?.currentPlan && 
      isPlanUpgrade(membership.currentPlan.slug, plan.slug);

    try {
      setIsSubscribing(plan.id);
      
      if (isUpgrade) {
        const response = await upgradePlan(plan.slug);
        const planData = response.subscription?.plan;
        setMembership(prev => prev ? {
          ...prev,
          hasActiveSubscription: true,
          currentPlan: planData || null,
          subscription: response.subscription,
          discount: planData?.discountPercent ?? planData?.discount ?? 0,
        } : null);
        toast.success('Plan upgraded successfully!', {
          description: `You are now on the ${plan.name} plan.`,
        });
      } else {
        const response = await subscribeToPlan(plan.slug);
        const planData = response.subscription?.plan;
        setMembership(prev => prev ? {
          ...prev,
          hasActiveSubscription: true,
          currentPlan: planData || null,
          subscription: response.subscription,
          discount: planData?.discountPercent ?? planData?.discount ?? 0,
        } : null);
        toast.success('Subscribed successfully!', {
          description: `You are now on the ${plan.name} plan.`,
        });
      }
    } catch (err: any) {
      console.error('Subscription error:', err);
      toast.error('Failed to subscribe', {
        description: err.response?.data?.message || 'Please try again.',
      });
    } finally {
      setIsSubscribing(null);
      setShowConfirmDialog(false);
    }
  };

  // Handle renew
  const handleRenew = async () => {
    if (!membership?.subscription) return;

    try {
      setIsRenewing(true);
      const response = await renewSubscription();
      setMembership(prev => prev ? {
        ...prev,
        subscription: response.subscription,
      } : null);
      toast.success('Subscription renewed!', {
        description: `Extended until ${new Date(response.subscription.endDate).toLocaleDateString()}`,
      });
    } catch (err: any) {
      console.error('Renewal error:', err);
      toast.error('Failed to renew', {
        description: err.response?.data?.message || 'Please try again.',
      });
    } finally {
      setIsRenewing(false);
      setShowConfirmDialog(false);
    }
  };

  // Open confirm dialog
  const openConfirmDialog = (
    type: 'subscribe' | 'upgrade' | 'renew',
    plan?: MembershipPlan
  ) => {
    setConfirmAction({ type, plan });
    setShowConfirmDialog(true);
  };

  // A user has a *paid* subscription only when hasActiveSubscription is true.
  // Free users have currentPlan=Free but no real subscription record.
  const hasActivePaidSubscription = membership?.hasActiveSubscription === true;

  // Get button text for plan - only upgrade allowed, no downgrade
  const getPlanButtonText = (plan: MembershipPlan): string => {
    // No paid subscription: Free is the implicit current plan, others are subscribable
    if (!hasActivePaidSubscription) {
      if (plan.slug === 'free') return 'Current Plan';
      return 'Subscribe';
    }
    // Paid subscription: distinguish current / upgrade / lower
    if (membership?.currentPlan?.id === plan.id) return 'Current Plan';
    if (membership?.currentPlan && isPlanUpgrade(membership.currentPlan.slug, plan.slug)) {
      return 'Upgrade';
    }
    return 'Lower Plan';
  };

  // Check if plan can be selected (only upgrade or new subscription)
  const canSelectPlan = (plan: MembershipPlan): boolean => {
    if (!hasActivePaidSubscription) return plan.slug !== 'free';
    if (membership?.currentPlan?.id === plan.id) return false;
    return membership?.currentPlan
      ? isPlanUpgrade(membership.currentPlan.slug, plan.slug)
      : false;
  };

  // Check if plan is current
  const isCurrentPlan = (plan: MembershipPlan): boolean => {
    if (!hasActivePaidSubscription) return plan.slug === 'free';
    return membership?.currentPlan?.id === plan.id;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="text-primary mx-auto mb-4 h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading membership...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <AlertCircle className="text-destructive mx-auto mb-4 h-8 w-8" />
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchData}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Resolve user's rank from the public ranks API (fresh data).
  // Match by name (case-insensitive) since user.rank only carries name/badge/color/discountPercent.
  const userRankName = user?.rank?.name?.toLowerCase().trim();
  const apiRank = userRankName
    ? ranks.find(
        (r) =>
          r.name.toLowerCase().trim() === userRankName ||
          r.slug.toLowerCase().trim() === userRankName,
      )
    : undefined;

  // Use API rank when found, otherwise fall back to the rank embedded on the user object.
  const rank = apiRank || user?.rank || null;
  const rankName = apiRank?.name || user?.rank?.name || '';
  const rankColor = apiRank?.color || user?.rank?.color || '#3B82F6';
  const discountPercent = apiRank?.discountPercent ?? user?.rank?.discountPercent ?? 0;
  const rankDescription = apiRank?.description || '';
  const hasRank = !!rank && discountPercent > 0;

  // Price summary based on current plan
  const currentPlanPriceRaw = membership?.currentPlan?.price;
  const basePrice =
    typeof currentPlanPriceRaw === 'string'
      ? parseFloat(currentPlanPriceRaw)
      : typeof currentPlanPriceRaw === 'number'
        ? currentPlanPriceRaw
        : 0;
  const discountAmount = (basePrice * discountPercent) / 100;
  const finalTotal = Math.max(basePrice - discountAmount, 0);
  const currencySymbol = '$';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Membership</h1>
        <p className="text-muted-foreground mt-1">
          Upgrade your plan to save more
        </p>
      </div>

      {/* Rank Discount banner — only when user has a rank with discount */}
      {hasRank && (
        <Card className="border-2" style={{ borderColor: `${rankColor}55` }}>
          <CardContent className="p-6 text-center">
            <div className="mb-3 flex items-center justify-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{ backgroundColor: `${rankColor}33`, color: rankColor }}
              >
                <Star className="h-4 w-4 fill-current" />
              </div>
              <h3 className="text-lg font-semibold">{rankName} Rank Discount</h3>
            </div>
            <p className="text-muted-foreground mb-4 text-sm">
              {rankDescription ||
                `Congratulations! You've earned a ${discountPercent}% discount on all purchases.`}
            </p>
            <div
              className="rounded-lg py-3 text-center text-2xl font-bold"
              style={{
                background: `${rankColor}1a`,
                color: rankColor,
              }}
            >
              {discountPercent}% OFF
            </div>
          </CardContent>
        </Card>
      )}

      {/* Price Summary — only when user has a rank and an active plan */}
      {hasRank && membership?.currentPlan && basePrice > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-5 text-center text-lg font-semibold">Price Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Base Price:</span>
                <span>
                  {currencySymbol}
                  {basePrice.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Plan:</span>
                <span>{membership.currentPlan.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>
                  {currencySymbol}
                  {basePrice.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-success">
                  Rank Discount ({rankName} - {discountPercent}% OFF):
                </span>
                <span className="text-success">
                  -{currencySymbol}
                  {discountAmount.toFixed(2)}
                </span>
              </div>
              <div className="border-border mt-4 flex items-center justify-between border-t pt-4 text-base">
                <span className="text-success font-semibold">Final Total:</span>
                <span className="text-success font-bold">
                  {currencySymbol}
                  {finalTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Plan */}
      {membership?.currentPlan && membership.subscription && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>Your active membership</CardDescription>
              </div>
              <Crown className="text-primary h-8 w-8" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h3 className="text-2xl font-bold">{membership.currentPlan.name}</h3>
                <p className="text-muted-foreground">
                  {formatPrice(membership.currentPlan.price, membership.currentPlan.currency || 'USD')}/month •{' '}
                  {membership.currentPlan.discountPercent ?? membership.currentPlan.discount ?? 0}% discount
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge
                    variant={
                      membership.subscription.status === 'ACTIVE'
                        ? 'default'
                        : membership.subscription.status === 'CANCELLED'
                          ? 'destructive'
                          : 'secondary'
                    }
                  >
                    {membership.subscription.status}
                  </Badge>
                  {membership.subscription.autoRenew && (
                    <Badge variant="outline">
                      <RefreshCw className="mr-1 h-3 w-3" />
                      Auto-renew
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground mt-2 text-sm">
                  <Calendar className="mr-1 inline h-4 w-4" />
                  {membership.subscription.status === 'CANCELLED'
                    ? `Ends: ${new Date(membership.subscription.endDate).toLocaleDateString()}`
                    : `Next billing: ${new Date(membership.subscription.endDate).toLocaleDateString()}`}
                  {membership.daysRemaining !== undefined && (
                    <span className="ml-2">
                      ({getDaysRemainingText(membership.daysRemaining)})
                    </span>
                  )}
                </p>
              </div>
              <div className="space-y-2">
                {membership.totalSaved !== undefined && membership.totalSaved > 0 && (
                  <div className="bg-success/10 text-success rounded-lg px-4 py-2 text-center">
                    <p className="text-2xl font-bold">
                      {formatPrice(membership.totalSaved.toString(), 'USD')}
                    </p>
                    <p className="text-xs">Total saved</p>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  {membership.subscription.status === 'ACTIVE' && (
                    <Button
                      variant="outline"
                      onClick={() => openConfirmDialog('renew')}
                      disabled={isRenewing}
                    >
                      {isRenewing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                      )}
                      Renew Early
                    </Button>
                  )}
                  <Link href="/dashboard/support" className="w-full">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground w-full"
                    >
                      <HelpCircle className="mr-2 h-4 w-4" />
                      Need to cancel? Contact Support
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      <div>
        <h2 className="mb-4 text-2xl font-semibold">Available Plans</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 [&>*:last-child:nth-child(2n+1)]:sm:col-span-2 [&>*:last-child:nth-child(2n+1)]:lg:col-span-1">
          {plans.map((plan) => {
            const isCurrent = isCurrentPlan(plan);
            const planColor = getPlanColor(plan.slug);
            const isVIP = plan.slug === 'vip';
            const isPopular = plan.isPopular && !isCurrent && !isVIP;
            // Mirror handleSubscribe: only call upgrade API when there's an active paid sub
            const isUpgrade = hasActivePaidSubscription &&
              membership?.currentPlan &&
              isPlanUpgrade(membership.currentPlan.slug, plan.slug);

            return (
              <Card
                key={plan.id}
                className={`relative transition-all ${
                  isCurrent ? 'border-primary' : ''
                } ${isVIP ? 'border-primary border-2 [box-shadow:var(--glow-accent-active)]' : ''}
                ${isPopular ? 'border-success border-2' : ''}`}
              >
                {isCurrent && (
                  <div className="bg-primary text-primary-foreground absolute top-0 right-0 rounded-tr-lg rounded-bl-lg px-3 py-1 text-xs font-semibold">
                    CURRENT
                  </div>
                )}
                {isPopular && (
                  <div className="bg-success text-success-foreground absolute top-0 right-0 rounded-tr-lg rounded-bl-lg px-3 py-1 text-xs font-semibold">
                    POPULAR
                  </div>
                )}
                {isVIP && !isCurrent && (
                  <div className="from-primary to-accent text-primary-foreground absolute top-0 right-0 rounded-tr-lg rounded-bl-lg bg-gradient-to-r px-3 py-1 text-xs font-semibold">
                    BEST VALUE
                  </div>
                )}

                <CardHeader>
                  <div className="space-y-2">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <div>
                      <p className="text-3xl font-bold">
                        {formatPrice(plan.price, plan.currency)}
                      </p>
                      <p className="text-muted-foreground text-sm">per month</p>
                    </div>
                    <Badge
                      variant={isVIP ? 'default' : 'secondary'}
                      className="w-fit"
                      style={{
                        backgroundColor: isVIP ? undefined : planColor.bg,
                        color: isVIP ? undefined : planColor.text,
                      }}
                    >
                      {plan.discountPercent ?? plan.discount ?? 0}% Discount
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {(plan.features || []).map((feature, i) => (
                      <li key={i} className="flex items-start space-x-2 text-sm">
                        <Check className="text-success mt-0.5 h-4 w-4 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <Button className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : canSelectPlan(plan) ? (
                    <Button
                      className="w-full"
                      variant={isVIP ? 'default' : 'outline'}
                      onClick={() =>
                        openConfirmDialog(isUpgrade ? 'upgrade' : 'subscribe', plan)
                      }
                      disabled={isSubscribing === plan.id}
                    >
                      {isSubscribing === plan.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          {getPlanButtonText(plan)}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button className="w-full" variant="outline" disabled>
                      {getPlanButtonText(plan)}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Savings Calculator */}
      <Card>
        <CardHeader>
          <CardTitle>Membership Benefits</CardTitle>
          <CardDescription>See how much you can save</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {[200, 500, 1000].map((spend) => (
              <div key={spend} className="bg-muted rounded-lg p-4">
                <h4 className="mb-2 font-semibold">Monthly Spend: ${spend}</h4>
                <div className="space-y-1 text-sm">
                  {plans.map((plan) => {
                    const discountValue = plan.discountPercent ?? plan.discount ?? 0;
                    const savings = (spend * discountValue) / 100;
                    const afterDiscount = spend - savings;
                    const isBest = plan.slug === 'vip';
                    const isCurrent = isCurrentPlan(plan);

                    return (
                      <p
                        key={plan.id}
                        className={`${
                          isCurrent
                            ? 'text-success font-semibold'
                            : isBest
                              ? 'text-primary font-semibold'
                              : 'text-muted-foreground'
                        }`}
                      >
                        {plan.name}: ${afterDiscount.toFixed(0)}
                        {savings > 0 && ` (save $${savings.toFixed(0)})`}
                        {isCurrent && ' ✓'}
                      </p>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction?.type === 'subscribe' && 'Subscribe to Plan'}
              {confirmAction?.type === 'upgrade' && 'Upgrade Plan'}
              {confirmAction?.type === 'renew' && 'Renew Subscription'}
            </DialogTitle>
            <DialogDescription>
              {confirmAction?.type === 'subscribe' && (
                <>
                  You are about to subscribe to the{' '}
                  <strong>{confirmAction.plan?.name}</strong> plan for{' '}
                  <strong>
                    {confirmAction.plan &&
                      formatPrice(confirmAction.plan.price, confirmAction.plan.currency)}
                    /month
                  </strong>
                  . The amount will be deducted from your wallet.
                </>
              )}
              {confirmAction?.type === 'upgrade' && (
                <>
                  You are about to upgrade to the{' '}
                  <strong>{confirmAction.plan?.name}</strong> plan. The price
                  difference will be prorated based on your remaining days.
                </>
              )}
              {confirmAction?.type === 'renew' && (
                <>
                  You are about to renew your{' '}
                  <strong>{membership?.currentPlan?.name}</strong> subscription for
                  another month. The amount will be deducted from your wallet.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Go Back
            </Button>
            <Button
              onClick={() => {
                if (confirmAction?.type === 'subscribe' && confirmAction.plan) {
                  handleSubscribe(confirmAction.plan);
                } else if (confirmAction?.type === 'upgrade' && confirmAction.plan) {
                  handleSubscribe(confirmAction.plan);
                } else if (confirmAction?.type === 'renew') {
                  handleRenew();
                }
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
