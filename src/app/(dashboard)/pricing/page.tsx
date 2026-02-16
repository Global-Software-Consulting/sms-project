'use client';

import { useState, useEffect } from 'react';
import { 
  Crown, 
  Check, 
  Zap, 
  Shield, 
  Clock,
  AlertCircle,
  RefreshCw,
  X,
  Sparkles,
  TrendingUp,
  Users,
  Gauge
} from 'lucide-react';
import { Button, Alert } from '@/components/ui';
import { DashboardShell } from '@/components/layout';
import { 
  getPlans, 
  getCurrentMembership,
  subscribeToPlan,
  renewSubscription,
  upgradePlan,
  cancelSubscription,
  formatPrice,
  getPlanColor,
  getQueueLabel,
  isPlanUpgrade,
  getDaysRemainingText,
  type MembershipPlan,
  type CurrentMembershipResponse,
  type PlanSlug
} from '@/lib/api';

/**
 * Pricing Page - View and manage membership plans
 * 
 * Sections:
 * 1. Header with title
 * 2. Current subscription banner (if subscribed)
 * 3. Plan cards grid
 * 4. Feature comparison table
 */
export default function PricingPage() {
  // Plans state
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);

  // Current membership state
  const [membership, setMembership] = useState<CurrentMembershipResponse | null>(null);
  const [membershipLoading, setMembershipLoading] = useState(true);

  // Action states
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Cancel modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Fetch data on mount
  useEffect(() => {
    fetchPlans();
    fetchMembership();
  }, []);

  const fetchPlans = async () => {
    try {
      setPlansLoading(true);
      setPlansError(null);
      const data = await getPlans();
      console.log('Fetched plans:', data); // Debug log
      // Sort by sortOrder, filter active plans only if isActive field exists
      const filteredPlans = data.filter(p => p.isActive !== false);
      const sortedPlans = filteredPlans.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      setPlans(sortedPlans);
    } catch (err: unknown) {
      console.error('Failed to fetch plans:', err); // Debug log
      const error = err as { response?: { data?: { message?: string } } };
      setPlansError(error.response?.data?.message || 'Failed to load plans');
    } finally {
      setPlansLoading(false);
    }
  };

  const fetchMembership = async () => {
    try {
      setMembershipLoading(true);
      const data = await getCurrentMembership();
      setMembership(data);
    } catch {
      // User might not have any subscription - that's okay
      setMembership(null);
    } finally {
      setMembershipLoading(false);
    }
  };

  const handleSubscribe = async (planSlug: PlanSlug) => {
    try {
      setActionLoading(planSlug);
      setActionError(null);
      setActionSuccess(null);

      if (membership?.hasActiveSubscription && membership.currentPlan) {
        // Upgrade existing subscription
        await upgradePlan(planSlug);
        setActionSuccess(`Successfully upgraded to ${planSlug.charAt(0).toUpperCase() + planSlug.slice(1)} plan!`);
      } else {
        // New subscription
        await subscribeToPlan(planSlug);
        setActionSuccess(`Successfully subscribed to ${planSlug.charAt(0).toUpperCase() + planSlug.slice(1)} plan!`);
      }

      // Refresh membership data
      await fetchMembership();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setActionError(error.response?.data?.message || 'Failed to process subscription');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRenew = async () => {
    try {
      setActionLoading('renew');
      setActionError(null);
      setActionSuccess(null);

      await renewSubscription();
      setActionSuccess('Successfully renewed your subscription!');

      // Refresh membership data
      await fetchMembership();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setActionError(error.response?.data?.message || 'Failed to renew subscription');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    try {
      setActionLoading('cancel');
      setActionError(null);
      setActionSuccess(null);

      await cancelSubscription(cancelReason || undefined);
      setActionSuccess('Your subscription has been cancelled. You can still use benefits until the end date.');
      setShowCancelModal(false);
      setCancelReason('');

      // Refresh membership data
      await fetchMembership();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setActionError(error.response?.data?.message || 'Failed to cancel subscription');
    } finally {
      setActionLoading(null);
    }
  };

  const currentPlanSlug = membership?.currentPlan?.slug as PlanSlug | undefined;

  // Loading state
  if (plansLoading) {
    return (
      <DashboardShell>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', margin: '0 auto 16px', borderRadius: '50%', border: '4px solid var(--accent-gold)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: 'var(--text-muted)' }}>Loading plans...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      {/* Page Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'rgba(198, 167, 94, 0.1)', borderRadius: '20px', marginBottom: '16px' }}>
          <Crown style={{ width: '16px', height: '16px', color: 'var(--accent-gold)' }} />
          <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--accent-gold)' }}>Membership Plans</span>
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
          Choose Your Plan
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
          Get more discounts on SMS purchases and unlock premium features with our membership plans.
        </p>
      </div>

      {/* Error/Success Alerts */}
      {plansError && (
        <div style={{ marginBottom: '24px' }}>
          <Alert variant="error" dismissible onDismiss={() => setPlansError(null)}>
            {plansError}
          </Alert>
        </div>
      )}

      {actionError && (
        <div style={{ marginBottom: '24px' }}>
          <Alert variant="error" dismissible onDismiss={() => setActionError(null)}>
            {actionError}
          </Alert>
        </div>
      )}

      {actionSuccess && (
        <div style={{ marginBottom: '24px' }}>
          <Alert variant="success" dismissible onDismiss={() => setActionSuccess(null)}>
            {actionSuccess}
          </Alert>
        </div>
      )}

      {/* Current Subscription Banner */}
      {membership?.hasActiveSubscription && membership.subscription && (
        <div style={{ 
          marginBottom: '32px', 
          padding: '20px 24px', 
          backgroundColor: 'var(--bg-card)', 
          border: '1px solid var(--border-default)', 
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '12px', 
              backgroundColor: getPlanColor(membership.currentPlan?.slug as PlanSlug).bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Crown style={{ width: '24px', height: '24px', color: getPlanColor(membership.currentPlan?.slug as PlanSlug).text }} />
            </div>
            <div>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Current Plan: <span style={{ color: getPlanColor(membership.currentPlan?.slug as PlanSlug).text }}>{membership.currentPlan?.name}</span>
              </p>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                {membership.subscription.status === 'CANCELLED' ? (
                  <>Cancelled • Benefits until {new Date(membership.subscription.endDate).toLocaleDateString()}</>
                ) : (
                  <>Expires {new Date(membership.subscription.endDate).toLocaleDateString()} • {getDaysRemainingText(membership.subscription.daysRemaining)}</>
                )}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {membership.subscription.isExpired && (
              <Button onClick={handleRenew} isLoading={actionLoading === 'renew'}>
                <RefreshCw style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                Renew
              </Button>
            )}
            {membership.subscription.status === 'ACTIVE' && !membership.subscription.isExpired && (
              <Button variant="outline" onClick={() => setShowCancelModal(true)}>
                Cancel Plan
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Plan Cards */}
      {plans.length === 0 ? (
        <div style={{ 
          marginBottom: '48px', 
          padding: '48px 24px', 
          backgroundColor: 'var(--bg-card)', 
          border: '1px dashed var(--border-default)', 
          borderRadius: '16px',
          textAlign: 'center'
        }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            margin: '0 auto 16px', 
            borderRadius: '16px', 
            backgroundColor: 'rgba(198, 167, 94, 0.1)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <Crown style={{ width: '32px', height: '32px', color: 'var(--accent-gold)' }} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
            No Plans Available
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Membership plans are being configured. Please check back later.
          </p>
          <Button variant="outline" onClick={fetchPlans}>
            <RefreshCw style={{ width: '16px', height: '16px', marginRight: '8px' }} />
            Refresh
          </Button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '20px', marginBottom: '48px' }} className="sm:!grid-cols-2 lg:!grid-cols-3 xl:!grid-cols-5">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={currentPlanSlug === plan.slug}
              canUpgrade={isPlanUpgrade(currentPlanSlug || null, plan.slug as PlanSlug)}
              hasActiveSubscription={membership?.hasActiveSubscription || false}
              onSubscribe={() => handleSubscribe(plan.slug as PlanSlug)}
              isLoading={actionLoading === plan.slug}
            />
          ))}
        </div>
      )}

      {/* Feature Comparison Table */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-default)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>Feature Comparison</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>Feature</th>
                {plans.map((plan) => (
                  <th key={plan.id} style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', fontWeight: 600, color: getPlanColor(plan.slug as PlanSlug).text }}>
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <FeatureRow label="Monthly Price" icon={<Sparkles style={{ width: '16px', height: '16px' }} />}>
                {plans.map((plan) => (
                  <td key={plan.id} style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {formatPrice(plan.price)}/mo
                  </td>
                ))}
              </FeatureRow>
              <FeatureRow label="SMS Discount" icon={<TrendingUp style={{ width: '16px', height: '16px' }} />}>
                {plans.map((plan) => (
                  <td key={plan.id} style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 500, color: plan.discount > 0 ? 'var(--success)' : 'var(--text-muted)' }}>
                    {plan.discount}% OFF
                  </td>
                ))}
              </FeatureRow>
              <FeatureRow label="Order Limit" icon={<Users style={{ width: '16px', height: '16px' }} />}>
                {plans.map((plan) => (
                  <td key={plan.id} style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--text-primary)' }}>
                    {plan.orderLimit} per order
                  </td>
                ))}
              </FeatureRow>
              <FeatureRow label="API Rate Limit" icon={<Gauge style={{ width: '16px', height: '16px' }} />}>
                {plans.map((plan) => (
                  <td key={plan.id} style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--text-primary)' }}>
                    {plan.apiRateLimit} req/min
                  </td>
                ))}
              </FeatureRow>
              <FeatureRow label="Queue Priority" icon={<Zap style={{ width: '16px', height: '16px' }} />}>
                {plans.map((plan) => (
                  <td key={plan.id} style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                    {getQueueLabel(plan.queuePriority)}
                  </td>
                ))}
              </FeatureRow>
            </tbody>
          </table>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '24px', maxWidth: '400px', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>Cancel Subscription</h3>
              <button onClick={() => setShowCancelModal(false)} style={{ padding: '8px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>
                <X style={{ width: '20px', height: '20px', color: 'var(--text-muted)' }} />
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', marginBottom: '20px' }}>
              <AlertCircle style={{ width: '20px', height: '20px', color: 'var(--warning)', flexShrink: 0, marginTop: '2px' }} />
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                You&apos;ll keep your benefits until the end of your billing period. After that, you&apos;ll be on the Free plan.
              </p>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Reason for cancelling (optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Tell us why you're cancelling..."
                style={{ 
                  width: '100%', 
                  minHeight: '80px', 
                  padding: '12px', 
                  backgroundColor: 'var(--bg-secondary)', 
                  border: '1px solid var(--border-default)', 
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="outline" fullWidth onClick={() => setShowCancelModal(false)}>
                Keep Plan
              </Button>
              <Button variant="danger" fullWidth onClick={handleCancel} isLoading={actionLoading === 'cancel'}>
                Cancel Plan
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

/* ==================== COMPONENTS ==================== */

interface PlanCardProps {
  plan: MembershipPlan;
  isCurrentPlan: boolean;
  canUpgrade: boolean;
  hasActiveSubscription: boolean;
  onSubscribe: () => void;
  isLoading: boolean;
}

function PlanCard({ plan, isCurrentPlan, canUpgrade, hasActiveSubscription, onSubscribe, isLoading }: PlanCardProps) {
  const colors = getPlanColor(plan.slug as PlanSlug);
  const isFree = parseFloat(plan.price) === 0;

  return (
    <div style={{ 
      position: 'relative',
      backgroundColor: 'var(--bg-card)', 
      border: `2px solid ${isCurrentPlan ? colors.text : 'var(--border-default)'}`,
      borderRadius: '16px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      transition: 'all 200ms ease'
    }}>
      {/* Popular Badge */}
      {plan.isPopular && (
        <div style={{ 
          position: 'absolute', 
          top: '-12px', 
          left: '50%', 
          transform: 'translateX(-50%)',
          padding: '4px 12px',
          backgroundColor: colors.text,
          color: 'white',
          fontSize: '11px',
          fontWeight: 600,
          borderRadius: '12px',
          textTransform: 'uppercase'
        }}>
          Most Popular
        </div>
      )}

      {/* Current Plan Badge */}
      {isCurrentPlan && (
        <div style={{ 
          position: 'absolute', 
          top: '12px', 
          right: '12px',
          padding: '4px 8px',
          backgroundColor: colors.bg,
          color: colors.text,
          fontSize: '10px',
          fontWeight: 600,
          borderRadius: '6px'
        }}>
          CURRENT
        </div>
      )}

      {/* Plan Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ 
          width: '48px', 
          height: '48px', 
          borderRadius: '12px', 
          backgroundColor: colors.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px'
        }}>
          {plan.slug === 'vip' ? (
            <Crown style={{ width: '24px', height: '24px', color: colors.text }} />
          ) : plan.slug === 'pro' ? (
            <Zap style={{ width: '24px', height: '24px', color: colors.text }} />
          ) : (
            <Shield style={{ width: '24px', height: '24px', color: colors.text }} />
          )}
        </div>
        <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
          {plan.name}
        </h3>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span style={{ fontSize: '36px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {formatPrice(plan.price)}
          </span>
          {!isFree && <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/month</span>}
        </div>
      </div>

      {/* Discount Badge */}
      {plan.discount > 0 && (
        <div style={{ 
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 12px',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <TrendingUp style={{ width: '16px', height: '16px', color: 'var(--success)' }} />
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--success)' }}>
            {plan.discount}% OFF all purchases
          </span>
        </div>
      )}

      {/* Features */}
      <div style={{ flex: 1, marginBottom: '20px' }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <FeatureItem text={`${plan.orderLimit} orders per request`} />
          <FeatureItem text={`${plan.apiRateLimit} API requests/min`} />
          <FeatureItem text={getQueueLabel(plan.queuePriority)} />
          {plan.features.slice(0, 3).map((feature, i) => (
            <FeatureItem key={i} text={feature} />
          ))}
        </ul>
      </div>

      {/* Action Button */}
      {isFree ? (
        <Button variant="outline" fullWidth disabled>
          {isCurrentPlan ? 'Current Plan' : 'Free Plan'}
        </Button>
      ) : isCurrentPlan ? (
        <Button variant="outline" fullWidth disabled>
          <Check style={{ width: '16px', height: '16px', marginRight: '8px' }} />
          Current Plan
        </Button>
      ) : canUpgrade ? (
        <Button fullWidth onClick={onSubscribe} isLoading={isLoading}>
          {hasActiveSubscription ? 'Upgrade' : 'Subscribe'}
        </Button>
      ) : (
        <Button variant="outline" fullWidth disabled>
          Downgrade N/A
        </Button>
      )}
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
      <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Check style={{ width: '12px', height: '12px', color: 'var(--success)' }} />
      </div>
      <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{text}</span>
    </li>
  );
}

function FeatureRow({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
      <td style={{ padding: '12px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: 'var(--text-muted)' }}>{icon}</span>
          <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{label}</span>
        </div>
      </td>
      {children}
    </tr>
  );
}

