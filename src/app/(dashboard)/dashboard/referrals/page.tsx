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
import {
  getReferralProfile,
  getReferralLink,
  getReferralStats,
  getReferrals,
  getCommissions,
  getPayouts,
  requestPayout,
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
} from '@/lib/api/referralsApi';

export default function ReferralDashboard() {
  const [copied, setCopied] = useState(false);
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API data
  const [profile, setProfile] = useState<ReferralProfile | null>(null);
  const [referralLink, setReferralLink] = useState<ReferralLinkType | null>(null);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);

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

      const [profileRes, linkRes, statsRes, referralsRes, commissionsRes, payoutsRes] =
        await Promise.allSettled([
          getReferralProfile(),
          getReferralLink(),
          getReferralStats(),
          getReferrals({ limit: 20 }),
          getCommissions({ limit: 20 }),
          getPayouts({ limit: 20 }),
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

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!profile || amount > profile.pendingEarnings) {
      toast.error('Insufficient balance');
      return;
    }
    if (amount < (profile?.minPayoutAmount || 10)) {
      toast.error(`Minimum withdrawal amount is ${formatAmount(profile?.minPayoutAmount || 10)}`);
      return;
    }

    try {
      setIsWithdrawing(true);
      const payout = await requestPayout({ amount });
      setPayouts((prev) => [payout, ...prev]);
      setWithdrawModal(false);
      setWithdrawAmount('');
      toast.success('Withdrawal request submitted!', {
        description: `${formatAmount(amount)} withdrawal is being processed.`,
      });
      // Refresh data
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to request payout');
    } finally {
      setIsWithdrawing(false);
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
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
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
  const commissionRate = stats?.currentCommissionRate || profile?.commissionRate || 10;
  const availableBalance = profile?.pendingEarnings || 0;
  const totalEarnings = stats?.totalEarnings || profile?.totalEarnings || 0;
  const pendingEarnings = stats?.pendingEarnings || 0;
  const paidEarnings = stats?.paidEarnings || profile?.paidEarnings || 0;
  const minPayoutAmount = profile?.minPayoutAmount || 10;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Referral Program</h1>
        <p className="text-muted-foreground mt-1">
          Earn lifetime commissions by referring new users
        </p>
      </div>

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
      <Card className="border-primary/30 from-primary/5 to-primary/10 bg-gradient-to-r">
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
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
            <div className="flex shrink-0 items-center gap-2">
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
            Share this link to earn {commissionRate}% commission on
            all purchases made by referred users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Referral Code */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Referral Code</label>
            <div className="flex gap-2">
              <Input
                value={referralLink?.customCode || referralLink?.code || profile?.referralCode || ''}
                readOnly
                className="bg-muted/50 font-mono text-lg font-semibold"
              />
              <Button
                variant={copied ? 'default' : 'outline'}
                onClick={() => copyToClipboard(referralLink?.customCode || referralLink?.code || profile?.referralCode || '')}
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
                value={referralLink?.customLink || referralLink?.link || profile?.referralLink || ''}
                readOnly
                className="bg-muted/50 text-sm"
              />
              <Button
                onClick={() => copyToClipboard(referralLink?.customLink || referralLink?.link || profile?.referralLink || '')}
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
                  <span>
                    Earn {commissionRate}% on all their purchases
                  </span>
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
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
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
            <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
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
                  {formatAmount(stats.totalSpending)} spent • {formatAmount(stats.spendingToNextTier || 0)} more to unlock {stats.nextTier}
                </span>
                <span className="text-primary font-semibold">
                  {stats.nextTierCommissionRate}% rate
                </span>
              </div>
              <Progress
                value={stats.spendingToNextTier ? ((stats.totalSpending / (stats.totalSpending + stats.spendingToNextTier)) * 100) : 100}
                className="h-3"
              />
              <p className="text-muted-foreground text-xs">
                Spend {formatAmount(stats.spendingToNextTier || 0)} more to increase commission to {stats.nextTierCommissionRate}%
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
                          variant={ref.status === 'QUALIFIED' ? 'default' : 'secondary'}
                          className="flex-shrink-0 text-xs"
                        >
                          {getReferralStatusLabel(ref.status)}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-xs">
                        Joined {formatDate(ref.createdAt)}
                        {ref.qualifiedAt && ` • Qualified ${formatDate(ref.qualifiedAt)}`}
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
                            variant={comm.status === 'PAID' ? 'default' : 'secondary'}
                            className="flex-shrink-0 text-xs"
                          >
                            {getCommissionStatusLabel(comm.status)}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-xs">
                          {comm.commissionRate}% of {formatAmount(comm.sourceAmount)}
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
                              variant={comm.status === 'PAID' ? 'default' : 'secondary'}
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

      {/* ===== WITHDRAWALS SECTION ===== */}
      <Card className="border-success/30">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ArrowDownToLine className="text-success h-5 w-5" />
                Withdraw Referral Earnings
              </CardTitle>
              <CardDescription>
                Transfer your referral balance to your wallet
              </CardDescription>
            </div>
            <Button
              onClick={() => setWithdrawModal(true)}
              className="bg-success hover:bg-success/90 text-success-foreground"
              disabled={availableBalance < minPayoutAmount}
            >
              <Wallet className="mr-2 h-4 w-4" />
              Withdraw Funds
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Balance Summary */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="bg-success/5 border-success/20 rounded-lg border p-4 text-center">
              <p className="text-muted-foreground mb-1 text-xs">
                Available to Withdraw
              </p>
              <p className="text-success text-2xl font-bold">
                {formatAmount(availableBalance)}
              </p>
            </div>
            <div className="bg-warning/5 border-warning/20 rounded-lg border p-4 text-center">
              <p className="text-muted-foreground mb-1 text-xs">
                Pending (not withdrawable)
              </p>
              <p className="text-warning text-2xl font-bold">
                {formatAmount(pendingEarnings)}
              </p>
            </div>
            <div className="bg-muted/50 border-border rounded-lg border p-4 text-center">
              <p className="text-muted-foreground mb-1 text-xs">
                Minimum Withdrawal
              </p>
              <p className="text-2xl font-bold">{formatAmount(minPayoutAmount)}</p>
            </div>
          </div>

          {/* Withdrawal History Table */}
          <div>
            <h4 className="mb-3 font-semibold">Withdrawal History</h4>
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
                        const statusInfo = getWithdrawalStatusBadge(payout.status);
                        const StatusIcon = statusInfo.icon;
                        return (
                          <TableRow key={payout.id} className="hover:bg-muted/50">
                            <TableCell className="text-sm">
                              {formatDate(payout.createdAt)}
                            </TableCell>
                            <TableCell className="text-sm">{payout.method}</TableCell>
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

      {/* Withdraw Modal */}
      <Dialog open={withdrawModal} onOpenChange={setWithdrawModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Withdraw Referral Balance</DialogTitle>
            <DialogDescription>
              Transfer your earnings to your wallet balance
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-success/10 border-success/20 rounded-lg border p-3">
              <p className="text-muted-foreground text-sm">Available Balance</p>
              <p className="text-success text-2xl font-bold">
                {formatAmount(availableBalance)}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Withdrawal Amount</Label>
              <div className="relative">
                <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2">
                  $
                </span>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="pl-7"
                  min={minPayoutAmount}
                  max={availableBalance}
                  step="0.01"
                />
              </div>
              <p className="text-muted-foreground text-xs">
                Minimum: {formatAmount(minPayoutAmount)} • Maximum: {formatAmount(availableBalance)}
              </p>
              <div className="flex gap-2">
                {[10, 25, 50, 100].map((amt) => (
                  <button
                    key={amt}
                    onClick={() =>
                      setWithdrawAmount(
                        Math.min(amt, availableBalance).toString(),
                      )
                    }
                    disabled={amt > availableBalance}
                    className="border-border bg-muted/50 hover:bg-muted disabled:opacity-50 rounded border px-2 py-1 text-xs transition-colors"
                  >
                    ${amt}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setWithdrawAmount(availableBalance.toString())
                  }
                  className="border-success/50 bg-success/10 text-success hover:bg-success/20 rounded border px-2 py-1 text-xs transition-colors"
                >
                  Max
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setWithdrawModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-success hover:bg-success/90 text-success-foreground flex-1"
                onClick={handleWithdraw}
                disabled={!withdrawAmount || parseFloat(withdrawAmount) < minPayoutAmount || isWithdrawing}
              >
                {isWithdrawing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowDownToLine className="mr-2 h-4 w-4" />
                )}
                Confirm Withdrawal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
