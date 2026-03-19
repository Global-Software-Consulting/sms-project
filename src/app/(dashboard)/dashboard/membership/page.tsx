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
} from 'lucide-react';
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
  // Data state
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
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

      const [plansRes, membershipRes] = await Promise.allSettled([
        getPlans(),
        getCurrentMembership(),
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
  const handleSubscribe = async (plan: MembershipPlan) => {
    const isUpgrade = membership?.currentPlan && isPlanUpgrade(membership.currentPlan.slug, plan.slug);

    try {
      if (isUpgrade) {
        setIsSubscribing(plan.id);
        const response = await upgradePlan(plan.id);
        const planData = response.subscription?.plan;
        setMembership(prev => prev ? {
          ...prev,
          currentPlan: planData || null,
          subscription: response.subscription,
          discount: planData?.discountPercent ?? planData?.discount ?? 0,
        } : null);
        toast.success('Plan upgraded successfully!', {
          description: `You are now on the ${plan.name} plan.`,
        });
      } else {
        setIsSubscribing(plan.id);
        const response = await subscribeToPlan(plan.id);
        const planData = response.subscription?.plan;
        setMembership(prev => prev ? {
          ...prev,
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
      const response = await renewSubscription(membership.subscription.id);
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

  // Get button text for plan - only upgrade allowed, no downgrade
  const getPlanButtonText = (plan: MembershipPlan): string => {
    if (!membership?.currentPlan) return 'Subscribe';
    if (membership.currentPlan.id === plan.id) return 'Current Plan';
    if (isPlanUpgrade(membership.currentPlan.slug, plan.slug)) return 'Upgrade';
    return 'Current Plan'; // Lower plans show as unavailable (no downgrade)
  };

  // Check if plan can be selected (only upgrade or new subscription)
  const canSelectPlan = (plan: MembershipPlan): boolean => {
    if (!membership?.currentPlan) return true; // No current plan, can subscribe
    if (membership.currentPlan.id === plan.id) return false; // Current plan
    return isPlanUpgrade(membership.currentPlan.slug, plan.slug); // Only upgrades allowed
  };

  // Check if plan is current
  const isCurrentPlan = (plan: MembershipPlan): boolean => {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Membership</h1>
        <p className="text-muted-foreground mt-1">
          Upgrade your plan to save more
        </p>
      </div>

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
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => {
            const isCurrent = isCurrentPlan(plan);
            const planColor = getPlanColor(plan.slug);
            const isVIP = plan.slug === 'VIP';
            const isUpgrade = membership?.currentPlan && isPlanUpgrade(membership.currentPlan.slug, plan.slug);

            return (
              <Card
                key={plan.id}
                className={`relative transition-all ${
                  isCurrent ? 'border-primary' : ''
                } ${isVIP ? 'border-primary border-2 [box-shadow:var(--glow-accent-active)]' : ''}`}
              >
                {isCurrent && (
                  <div className="bg-primary text-primary-foreground absolute top-0 right-0 rounded-tr-lg rounded-bl-lg px-3 py-1 text-xs font-semibold">
                    CURRENT
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
                        backgroundColor: isVIP ? undefined : `${planColor}20`,
                        color: isVIP ? undefined : planColor,
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
                    const isBest = plan.slug === 'VIP';
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
