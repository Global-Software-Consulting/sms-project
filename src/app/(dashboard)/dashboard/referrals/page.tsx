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
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Copy,
  Users,
  DollarSign,
  TrendingUp,
  Award,
  Target,
  Gift,
  ExternalLink,
  Check,
  UserPlus,
  Percent,
  Wallet,
  ArrowDownToLine,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import Link from 'next/link';
import { BadgeCheck, Pencil } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Send, PlusCircle, Ticket } from 'lucide-react';
import {
  getReferralProfile,
  getReferralLink,
  getReferralStats,
  getReferrals,
  getCommissions,
  getPayouts,
  requestPayout,
  addToMainBalance,
  formatReferralAmount as formatAmount,
  getTierInfo,
  getReferralStatusLabel,
  getCommissionStatusLabel,
  getPayoutStatusLabel,
  getPayoutStatusColor,
  maskEmail,
  type ReferralProfile,
  type ReferralLink as ReferralLinkType,
  type ReferralStats,
  type Referral,
  type Commission,
  type Payout,
  type CryptoCurrency,
} from '@/lib/api/referralsApi';
import {
  getAvailableCoupons,
  type AvailableCoupon,
} from '@/lib/api/couponsApi';

// Crypto currency options for withdrawal
const CRYPTO_OPTIONS: { value: CryptoCurrency; label: string }[] = [
  { value: 'USDT_TRC20', label: 'USDT (TRC20)' },
  { value: 'SOL', label: 'Solana (SOL)' },
  { value: 'TRX', label: 'Tron (TRX)' },
  { value: 'LTC', label: 'Litecoin (LTC)' },
];

export default function ReferralDashboard() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  // Withdraw Funds Modal (Crypto)
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawCrypto, setWithdrawCrypto] =
    useState<CryptoCurrency>('USDT_TRC20');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawMessage, setWithdrawMessage] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Add to Main Balance Modal
  const [addBalanceModal, setAddBalanceModal] = useState(false);
  const [addBalanceAmount, setAddBalanceAmount] = useState('');
  const [isAddingBalance, setIsAddingBalance] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API data
  const [profile, setProfile] = useState<ReferralProfile | null>(null);
  const [referralLink, setReferralLink] = useState<ReferralLinkType | null>(
    null,
  );
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [availableCoupons, setAvailableCoupons] = useState<AvailableCoupon[]>(
    [],
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Fetch all referral data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [
        profileRes,
        linkRes,
        statsRes,
        referralsRes,
        commissionsRes,
        payoutsRes,
        couponsRes,
      ] = await Promise.allSettled([
        getReferralProfile(),
        getReferralLink(),
        getReferralStats(),
        getReferrals({ limit: 20 }),
        getCommissions({ limit: 20 }),
        getPayouts({ limit: 20 }),
        getAvailableCoupons(),
      ]);

      if (profileRes.status === 'fulfilled') {
        setProfile(profileRes.value);
      }

      if (linkRes.status === 'fulfilled') {
        setReferralLink(linkRes.value);
      }

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value);
      }

      if (referralsRes.status === 'fulfilled') {
        setReferrals(referralsRes.value.data || []);
      }

      if (commissionsRes.status === 'fulfilled') {
        setCommissions(commissionsRes.value.data || []);
      }

      if (payoutsRes.status === 'fulfilled') {
        setPayouts(payoutsRes.value.data || []);
      }

      if (couponsRes.status === 'fulfilled') {
        setAvailableCoupons(couponsRes.value || []);
      }
    } catch (err) {
      console.error('Failed to fetch referral data:', err);
      setError('Failed to load referral data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Crypto Withdrawal
  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount < 5) {
      toast.error('Minimum withdrawal amount is $5');
      return;
    }
    if (!profile || amount > profile.pendingEarnings) {
      toast.error('Insufficient balance');
      return;
    }
    if (!withdrawAddress.trim()) {
      toast.error('Please enter your wallet address');
      return;
    }

    try {
      setIsWithdrawing(true);
      const payout = await requestPayout({
        amount,
        method: 'CRYPTO',
        cryptoCurrency: withdrawCrypto,
        walletAddress: withdrawAddress.trim(),
        message: withdrawMessage.trim() || undefined,
      });
      setPayouts((prev) => [payout, ...prev]);
      setWithdrawModal(false);
      setWithdrawAmount('');
      setWithdrawAddress('');
      setWithdrawMessage('');
      toast.success('Withdrawal request submitted!', {
        description: `${formatAmount(amount)} withdrawal to ${withdrawCrypto} is pending admin approval.`,
      });
      fetchData();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || 'Failed to request withdrawal',
      );
    } finally {
      setIsWithdrawing(false);
    }
  };

  // Handle Add to Main Balance
  const handleAddToBalance = async () => {
    const amount = parseFloat(addBalanceAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!profile || amount > profile.pendingEarnings) {
      toast.error('Insufficient referral earnings');
      return;
    }

    try {
      setIsAddingBalance(true);
      const result = await addToMainBalance({ amount });
      setAddBalanceModal(false);
      setAddBalanceAmount('');
      toast.success('Funds added to main balance!', {
        description: `${formatAmount(amount)} has been added to your wallet. New balance: ${formatAmount(result.newBalance)}`,
      });
      fetchData();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || 'Failed to add funds to balance',
      );
    } finally {
      setIsAddingBalance(false);
    }
  };

  const getWithdrawalStatusBadge = (status: string) => {
    if (status === 'COMPLETED')
      return {
        variant: 'default' as const,
        icon: CheckCircle2,
        color: 'text-success',
      };
    if (status === 'PENDING' || status === 'PROCESSING')
      return {
        variant: 'secondary' as const,
        icon: Clock,
        color: 'text-warning',
      };
    return {
      variant: 'destructive' as const,
      icon: XCircle,
      color: 'text-destructive',
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="text-primary mx-auto h-8 w-8 animate-spin" />
          <p className="text-muted-foreground mt-2">Loading referral data...</p>
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

  const tierInfo = stats ? getTierInfo(stats.currentTier) : null;
  const commissionRate =
    stats?.currentCommissionRate || profile?.commissionRate || 10;
  const availableBalance = profile?.pendingEarnings || 0;
  const totalEarnings = stats?.totalEarnings || profile?.totalEarnings || 0;
  const pendingEarnings = stats?.pendingEarnings || 0;
  const paidEarnings = stats?.paidEarnings || profile?.paidEarnings || 0;
  const minPayoutAmount = profile?.minPayoutAmount || 10;

  const displayName =
    user?.username || user?.firstName || user?.email?.split('@')[0] || 'User';
  const handle = user?.username || user?.email?.split('@')[0] || '';
  const totalReferredSales = stats?.totalSpending ?? 0;
  const totalReferralCount =
    stats?.totalReferrals ?? profile?.totalReferrals ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Referral Program</h1>
        <p className="text-muted-foreground mt-1">
          Earn lifetime commissions by referring new users
        </p>
      </div>

      {/* Your Affiliate Profile */}
      <Card className="card-hover-lift">
        <CardContent className="p-4 sm:p-6">
          <h2 className="text-muted-foreground mb-6 text-xs font-semibold tracking-[0.2em]">
            <span className="from-primary to-accent bg-gradient-to-r bg-clip-text text-transparent">
              Y
            </span>
            OUR AFFILIATE PROFILE
          </h2>

          <div className="mb-6 flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <div className="relative flex-shrink-0">
                <div className="from-primary/30 to-accent/30 h-12 w-12 overflow-hidden rounded-full bg-gradient-to-br ring-2 ring-[var(--glass-border)] sm:h-14 sm:w-14">
                  {user?.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatar}
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-white">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <Link
                  href="/dashboard/settings"
                  className="bg-background hover:bg-muted border-border absolute -right-1 -bottom-1 flex h-5 !min-h-0 w-5 items-center justify-center rounded-full border transition-colors sm:h-6 sm:w-6"
                  aria-label="Edit profile"
                >
                  <Pencil className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                </Link>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-base font-semibold">
                    {displayName}
                  </span>
                  {user?.emailVerified && (
                    <BadgeCheck className="h-4 w-4 flex-shrink-0 fill-[#3B82F6] text-white" />
                  )}
                </div>
                {handle && (
                  <p className="text-muted-foreground truncate text-sm">
                    @{handle}
                  </p>
                )}
              </div>
            </div>

            {tierInfo && (
              <Badge
                variant="outline"
                className="flex-shrink-0 rounded-full border-2 px-4 py-1.5 text-sm font-medium"
                style={{ borderColor: tierInfo.color, color: tierInfo.color }}
              >
                {tierInfo.name}
              </Badge>
            )}
          </div>

          <div className="border-border mb-6 border-t" />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">
                Total Referred Sales:
              </span>
              <span className="text-base font-semibold">
                {formatAmount(totalReferredSales)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">
                Total Referrals:
              </span>
              <span className="text-base font-semibold">
                {totalReferralCount}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">
                Current Rank:
              </span>
              <span className="text-base font-semibold">
                {tierInfo?.name || '—'}
              </span>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <Button variant="link" asChild className="text-primary">
              <Link href="/dashboard/settings">Personalize your profile</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Balance Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Earned */}
        <Card className="card-hover-lift border-primary/40">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                Total Earned
              </CardTitle>
              <div className="bg-primary/10 rounded-lg p-2">
                <DollarSign className="text-primary h-4 w-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-primary animate-count-up text-3xl font-bold">
              {formatAmount(totalEarnings)}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              All-time earnings
            </p>
          </CardContent>
        </Card>

        {/* Available Balance */}
        <Card className="card-hover-lift border-success/40">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                Available Balance
              </CardTitle>
              <div className="bg-success/10 rounded-lg p-2">
                <DollarSign className="text-success h-4 w-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-success animate-count-up text-3xl font-bold">
              {formatAmount(availableBalance)}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              Ready to withdraw
            </p>
          </CardContent>
        </Card>

        {/* Pending Balance */}
        <Card className="card-hover-lift">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                Pending
              </CardTitle>
              <div className="bg-warning/10 rounded-lg p-2">
                <DollarSign className="text-warning h-4 w-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-warning animate-count-up text-3xl font-bold">
              {formatAmount(pendingEarnings)}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              Pending clearance
            </p>
          </CardContent>
        </Card>

        {/* Paid Out */}
        <Card className="card-hover-lift">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                Paid Out
              </CardTitle>
              <div className="rounded-lg bg-blue-500/10 p-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="animate-count-up text-3xl font-bold">
              {formatAmount(paidEarnings)}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              Total withdrawn
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Commission Rate Banner */}
      <Card className="border-primary/30 from-primary/5 to-primary/10 overflow-hidden bg-gradient-to-r">
        <CardContent className="px-4 py-4 sm:px-6">
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="bg-primary/20 rounded-full p-3">
                <Percent className="text-primary h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-muted-foreground text-sm font-medium">
                  Current Commission Rate
                </p>
                <p className="text-primary text-2xl font-bold">
                  {commissionRate}%
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
              {tierInfo && (
                <Badge variant="default" className="px-3 py-1.5 text-sm">
                  <Award className="mr-1 h-3 w-3" />
                  {tierInfo.icon} {tierInfo.name} Tier
                </Badge>
              )}
              <Button variant="outline" size="sm">
                View Tier Benefits
                <ExternalLink className="ml-2 h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral Link Section */}
      <Card>
        <CardHeader>
          <CardTitle>Your Referral Link</CardTitle>
          <CardDescription>
            Share this link to earn {commissionRate}% commission on all
            purchases made by referred users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Referral Code */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Referral Code</label>
            <div className="flex gap-2">
              <Input
                value={
                  referralLink?.customCode ||
                  referralLink?.code ||
                  profile?.referralCode ||
                  ''
                }
                readOnly
                className="bg-muted/50 font-mono text-lg font-semibold"
              />
              <Button
                variant={copied ? 'default' : 'outline'}
                onClick={() =>
                  copyToClipboard(
                    referralLink?.customCode ||
                      referralLink?.code ||
                      profile?.referralCode ||
                      '',
                  )
                }
                className="min-w-[100px]"
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Referral Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Referral Link</label>
            <div className="flex gap-2">
              <Input
                value={
                  referralLink?.customLink ||
                  referralLink?.link ||
                  profile?.referralLink ||
                  ''
                }
                readOnly
                className="bg-muted/50 text-sm"
              />
              <Button
                onClick={() =>
                  copyToClipboard(
                    referralLink?.customLink ||
                      referralLink?.link ||
                      profile?.referralLink ||
                      '',
                  )
                }
                className="min-w-[120px]"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Link
              </Button>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid gap-4 pt-4 md:grid-cols-2">
            <div className="bg-primary/5 border-primary/20 rounded-lg border p-4">
              <h4 className="text-primary mb-2 flex items-center font-semibold">
                <Target className="mr-2 h-4 w-4" />
                How It Works
              </h4>
              <ul className="text-muted-foreground space-y-1.5 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Share your unique referral link</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>New users sign up using your link</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Earn {commissionRate}% on all their purchases</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Commissions credited instantly</span>
                </li>
              </ul>
            </div>

            <div className="bg-success/5 border-success/20 rounded-lg border p-4">
              <h4 className="text-success mb-2 flex items-center font-semibold">
                <Gift className="mr-2 h-4 w-4" />
                Bonus Benefits
              </h4>
              <ul className="text-muted-foreground space-y-1.5 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">•</span>
                  <span>Unlimited earning potential</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">•</span>
                  <span>Lifetime recurring commissions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">•</span>
                  <span>Unlock higher tier rates (up to 5%)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">•</span>
                  <span>Priority support for top referrers</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Referrals
            </CardTitle>
            <div className="rounded-lg bg-blue-500/10 p-2">
              <Users className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {stats?.totalReferrals || profile?.totalReferrals || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Qualified</CardTitle>
            <div className="bg-primary/10 rounded-lg p-2">
              <UserPlus className="text-primary h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-primary text-2xl font-bold">
              {stats?.qualifiedReferrals || profile?.qualifiedReferrals || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <div className="bg-warning/10 rounded-lg p-2">
              <Clock className="text-warning h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-warning text-2xl font-bold">
              {stats?.pendingReferrals || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Spending
            </CardTitle>
            <div className="bg-success/10 rounded-lg p-2">
              <DollarSign className="text-success h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-success text-2xl font-bold">
              {formatAmount(stats?.totalSpending || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Tier Progress */}
      {stats && stats.nextTier && (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <CardTitle>Referral Tier Progress</CardTitle>
                <CardDescription>
                  Unlock higher commission rates by spending more
                </CardDescription>
              </div>
              {tierInfo && (
                <Badge variant="default" className="px-3 py-1.5 text-sm">
                  <Award className="mr-1.5 h-3 w-3" />
                  {tierInfo.icon} {tierInfo.name} Tier - {commissionRate}%
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {formatAmount(stats.totalSpending)} spent •{' '}
                  {formatAmount(stats.spendingToNextTier || 0)} more to unlock{' '}
                  {stats.nextTier}
                </span>
                <span className="text-primary font-semibold">
                  {stats.nextTierCommissionRate}% rate
                </span>
              </div>
              <Progress
                value={
                  stats.spendingToNextTier
                    ? (stats.totalSpending /
                        (stats.totalSpending + stats.spendingToNextTier)) *
                      100
                    : 100
                }
                className="h-3"
              />
              <p className="text-muted-foreground text-xs">
                Spend {formatAmount(stats.spendingToNextTier || 0)} more to
                increase commission to {stats.nextTierCommissionRate}%
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Referred Users & Commission History */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Referred Users */}
        <Card>
          <CardHeader>
            <CardTitle>Referred Users ({referrals.length})</CardTitle>
            <CardDescription>
              Users who signed up through your link
            </CardDescription>
          </CardHeader>
          <CardContent>
            {referrals.length > 0 ? (
              <div className="max-h-[400px] space-y-2 overflow-y-auto pr-2">
                {referrals.map((ref) => (
                  <div
                    key={ref.id}
                    className="border-border hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <p className="truncate font-mono text-sm font-medium">
                          {maskEmail(ref.referredEmail)}
                        </p>
                        <Badge
                          variant={
                            ref.status === 'QUALIFIED' ? 'default' : 'secondary'
                          }
                          className="flex-shrink-0 text-xs"
                        >
                          {getReferralStatusLabel(ref.status)}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-xs">
                        Joined {formatDate(ref.createdAt)}
                        {ref.qualifiedAt &&
                          ` • Qualified ${formatDate(ref.qualifiedAt)}`}
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0 text-right">
                      <p className="text-success text-sm font-semibold">
                        +{formatAmount(ref.totalCommission)}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {formatAmount(ref.totalDeposits)} spent
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground py-8 text-center">
                <Users className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p className="text-sm">No referrals yet</p>
                <p className="text-xs">Share your link to start earning!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Commissions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Commissions</CardTitle>
            <CardDescription>Latest referral earnings</CardDescription>
          </CardHeader>
          <CardContent>
            {commissions.length > 0 ? (
              <div className="max-h-[400px] space-y-2 overflow-y-auto pr-2">
                {commissions.slice(0, 8).map((comm) => {
                  const dateTime = formatDateTime(comm.createdAt);
                  return (
                    <div
                      key={comm.id}
                      className="border-border hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <p className="truncate text-sm font-medium">
                            {comm.sourceType}
                          </p>
                          <Badge
                            variant={
                              comm.status === 'PAID' ? 'default' : 'secondary'
                            }
                            className="flex-shrink-0 text-xs"
                          >
                            {getCommissionStatusLabel(comm.status)}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-xs">
                          {comm.commissionRate}% of{' '}
                          {formatAmount(comm.sourceAmount)}
                        </p>
                        <p className="text-muted-foreground mt-0.5 text-xs">
                          {dateTime.date} • {dateTime.time}
                        </p>
                      </div>
                      <span className="text-success ml-4 flex-shrink-0 font-semibold">
                        +{formatAmount(comm.commissionAmount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-muted-foreground py-8 text-center">
                <DollarSign className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p className="text-sm">No commissions yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Full Earnings History Table */}
      {commissions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Complete Earnings History</CardTitle>
            <CardDescription>
              All commission transactions with detailed information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-border overflow-hidden rounded-lg border">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Earned</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commissions.map((comm) => {
                      const dateTime = formatDateTime(comm.createdAt);
                      return (
                        <TableRow key={comm.id} className="hover:bg-muted/50">
                          <TableCell className="text-sm">
                            <div>{dateTime.date}</div>
                            <div className="text-muted-foreground text-xs">
                              {dateTime.time}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            <div>{comm.sourceType}</div>
                            <div className="text-muted-foreground text-xs">
                              {formatAmount(comm.sourceAmount)}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {comm.commissionRate}%
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                comm.status === 'PAID' ? 'default' : 'secondary'
                              }
                              className="text-xs"
                            >
                              {getCommissionStatusLabel(comm.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-success text-right font-semibold">
                            +{formatAmount(comm.commissionAmount)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ===== WITHDRAW REFERRAL EARNINGS SECTION ===== */}
      <Card className="border-primary/30">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="bg-success/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                <ArrowDownToLine className="text-success h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base">
                  Withdraw Referral Earnings
                </CardTitle>
                <p className="text-muted-foreground mt-1 text-sm">
                  Transfer your referral balance to your wallet or external
                  payment method
                </p>
              </div>
            </div>
            <Button
              onClick={() => setWithdrawModal(true)}
              disabled={availableBalance < 5}
              className="shrink-0"
            >
              <ArrowDownToLine className="mr-2 h-4 w-4" />
              Withdraw Funds
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 3-stat row — Available / Pending / Minimum. Single source of
              truth for amounts; the old big Total Withdrawable / Total
              Referral Earnings cards used to live above this and just
              duplicated the same numbers. */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="border-border bg-muted/30 rounded-xl border p-4 text-center">
              <p className="text-muted-foreground text-xs tracking-wide uppercase">
                Available to Withdraw
              </p>
              <p className="text-success mt-2 text-2xl font-bold tabular-nums">
                {formatAmount(availableBalance)}
              </p>
            </div>
            <div className="border-border bg-muted/30 rounded-xl border p-4 text-center">
              <p className="text-muted-foreground text-xs tracking-wide uppercase">
                Pending (not withdrawable)
              </p>
              <p className="text-warning mt-2 text-2xl font-bold tabular-nums">
                {formatAmount(pendingEarnings)}
              </p>
            </div>
            <div className="border-border bg-muted/30 rounded-xl border p-4 text-center">
              <p className="text-muted-foreground text-xs tracking-wide uppercase">
                Minimum Withdrawal
              </p>
              <p className="mt-2 text-2xl font-bold tabular-nums">$5.00</p>
            </div>
          </div>

          {/* Secondary action — Add Funds to Main Balance is kept as a
              small inline link so the feature stays accessible without
              competing with the primary Withdraw CTA in the header. */}
          {availableBalance > 0 && (
            <div className="text-muted-foreground -mt-2 text-center text-xs">
              Or{' '}
              <button
                type="button"
                onClick={() => setAddBalanceModal(true)}
                className="text-primary hover:underline"
              >
                add funds to main balance
              </button>{' '}
              to spend them on plans.
            </div>
          )}

          {/* Withdrawal History Table */}
          <div>
            <h4 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
              Withdrawal History
            </h4>
            {payouts.length > 0 ? (
              <div className="border-border overflow-hidden rounded-lg border">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payouts.map((payout) => {
                        const statusInfo = getWithdrawalStatusBadge(
                          payout.status,
                        );
                        const StatusIcon = statusInfo.icon;
                        return (
                          <TableRow
                            key={payout.id}
                            className="hover:bg-muted/50"
                          >
                            <TableCell className="text-sm">
                              {formatDate(payout.createdAt)}
                            </TableCell>
                            <TableCell className="text-sm">
                              {payout.method}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={statusInfo.variant}
                                className="flex w-fit items-center gap-1 text-xs"
                              >
                                <StatusIcon className="h-3 w-3" />
                                {getPayoutStatusLabel(payout.status)}
                              </Badge>
                            </TableCell>
                            <TableCell
                              className={`text-right font-semibold ${payout.status === 'FAILED' || payout.status === 'CANCELLED' ? 'text-destructive line-through' : 'text-foreground'}`}
                            >
                              {formatAmount(payout.amount)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground py-8 text-center">
                <ArrowDownToLine className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p className="text-sm">No withdrawals yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ===== BUY PLANS WITH COUPONS SECTION ===== */}
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="text-muted-foreground flex items-center gap-2 text-xs font-semibold tracking-[0.2em]">
            <Ticket className="h-4 w-4" />
            BUY PLANS WITH COUPONS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {availableCoupons.length > 0 ? (
            <div className="space-y-3">
              {availableCoupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="bg-muted/30 hover:bg-muted/50 border-border flex items-center justify-between rounded-lg border p-4 transition-colors"
                >
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <Badge variant="secondary" className="font-mono text-xs">
                        {coupon.code}
                      </Badge>
                      <Badge
                        variant={
                          coupon.type === 'PERCENTAGE' ? 'default' : 'outline'
                        }
                        className="text-xs"
                      >
                        {coupon.type === 'PERCENTAGE'
                          ? `${coupon.value}% OFF`
                          : `$${coupon.value} OFF`}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium">{coupon.name}</p>
                    {coupon.description && (
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        {coupon.description}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      {coupon.minOrderAmount && (
                        <span className="text-muted-foreground">
                          Min: ${coupon.minOrderAmount}
                        </span>
                      )}
                      {coupon.maxDiscount && (
                        <span className="text-muted-foreground">
                          Max Discount: ${coupon.maxDiscount}
                        </span>
                      )}
                      {coupon.expiresAt && (
                        <span className="text-warning">
                          Expires:{' '}
                          {new Date(coupon.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                      <span className="text-muted-foreground">
                        Uses left: {coupon.usageRemaining}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary/10 ml-4 shrink-0"
                    onClick={() => {
                      navigator.clipboard.writeText(coupon.code);
                      toast.success(`Coupon code "${coupon.code}" copied!`);
                    }}
                  >
                    Copy
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground py-8 text-center">
              <Ticket className="mx-auto mb-2 h-8 w-8 opacity-50" />
              <p className="text-sm">No coupons available at the moment</p>
              <p className="mt-1 text-xs">
                Check back later for special offers!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Withdraw Funds Modal (Crypto) - Like CheapStreamTV */}
      <Dialog open={withdrawModal} onOpenChange={setWithdrawModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>WITHDRAW FUNDS</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Available Balance */}
            <div className="bg-primary/10 border-primary/20 rounded-lg border p-3">
              <p className="text-sm">
                <span className="text-primary">Available Balance:</span>{' '}
                <span className="font-semibold">
                  {formatAmount(availableBalance)}
                </span>
              </p>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label>Amount:</Label>
              <Input
                type="text"
                placeholder="Minimum: $5"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
              <p className="text-muted-foreground text-xs">
                Minimum withdrawal: $5 USD
              </p>
            </div>

            {/* Currency Selection */}
            <div className="space-y-2">
              <Label>Currency:</Label>
              <Select
                value={withdrawCrypto}
                onValueChange={(value) =>
                  setWithdrawCrypto(value as CryptoCurrency)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {CRYPTO_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Wallet Address */}
            <div className="space-y-2">
              <Label>Wallet Address:</Label>
              <Input
                type="text"
                placeholder="Enter your wallet address"
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
              />
            </div>

            {/* Message (Optional) */}
            <div className="space-y-2">
              <Label>Message (Optional):</Label>
              <Textarea
                placeholder="Please fill out this field."
                value={withdrawMessage}
                onChange={(e) => setWithdrawMessage(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setWithdrawModal(false);
                  setWithdrawAmount('');
                  setWithdrawAddress('');
                  setWithdrawMessage('');
                }}
              >
                Cancel
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90 flex-1"
                onClick={handleWithdraw}
                disabled={
                  !withdrawAmount ||
                  parseFloat(withdrawAmount) < 5 ||
                  parseFloat(withdrawAmount) > availableBalance ||
                  !withdrawAddress.trim() ||
                  isWithdrawing
                }
              >
                {isWithdrawing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Submit Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Funds to Main Balance Modal - Like CheapStreamTV */}
      <Dialog open={addBalanceModal} onOpenChange={setAddBalanceModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>ADD FUNDS TO MAIN BALANCE</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Available Referral Earnings */}
            <div className="bg-primary/10 border-primary/20 rounded-lg border p-3">
              <p className="text-sm">
                <span className="text-primary">
                  Available Referral Earnings:
                </span>{' '}
                <span className="font-semibold">
                  {formatAmount(availableBalance)}
                </span>
              </p>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label>Amount:</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={addBalanceAmount}
                onChange={(e) => setAddBalanceAmount(e.target.value)}
                min={0.01}
                max={availableBalance}
                step="0.01"
              />
              <div className="flex gap-2">
                {[10, 25, 50].map((amt) => (
                  <button
                    key={amt}
                    onClick={() =>
                      setAddBalanceAmount(
                        Math.min(amt, availableBalance).toString(),
                      )
                    }
                    disabled={amt > availableBalance}
                    className="border-border bg-muted/50 hover:bg-muted rounded border px-3 py-1 text-xs transition-colors disabled:opacity-50"
                  >
                    ${amt}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setAddBalanceAmount(availableBalance.toString())
                  }
                  disabled={availableBalance <= 0}
                  className="border-primary/50 bg-primary/10 text-primary hover:bg-primary/20 rounded border px-3 py-1 text-xs transition-colors disabled:opacity-50"
                >
                  Max
                </button>
              </div>
            </div>

            {/* Warning Notice */}
            <div className="bg-warning/10 border-warning/30 text-warning-foreground flex items-start gap-2 rounded-lg border p-3">
              <AlertTriangle className="text-warning mt-0.5 h-4 w-4 flex-shrink-0" />
              <p className="text-xs">
                <strong>Warning:</strong> Once added to your main balance, these
                funds cannot be withdrawn back to referral earnings. You can use
                your main balance to buy plans or withdraw to your preferred
                payment method.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setAddBalanceModal(false);
                  setAddBalanceAmount('');
                }}
              >
                Cancel
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90 flex-1"
                onClick={handleAddToBalance}
                disabled={
                  !addBalanceAmount ||
                  parseFloat(addBalanceAmount) <= 0 ||
                  parseFloat(addBalanceAmount) > availableBalance ||
                  isAddingBalance
                }
              >
                {isAddingBalance ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <PlusCircle className="mr-2 h-4 w-4" />
                )}
                Add Funds
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
