'use client';
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
  MousePointerClick,
  UserPlus,
  Percent,
  Wallet,
  ArrowDownToLine,
  Clock,
  CheckCircle2,
  XCircle,
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
import { useState } from 'react';
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

export default function ReferralDashboard() {
  const [copied, setCopied] = useState(false);
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('wallet');
  const referralCode = 'JOHN2026';
  const referralLink = `https://smspro.com/ref/${referralCode}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Main stats
  const mainStats = {
    totalEarned: 387.5,
    availableBalance: 327.5,
    pendingBalance: 60.0,
    thisMonth: 45.0,
    commissionRate: 10,
  };

  // Activity stats
  const activityStats = [
    {
      label: 'Total Clicks',
      value: '1,247',
      icon: MousePointerClick,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Total Signups',
      value: '24',
      icon: UserPlus,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Conversion Rate',
      value: '1.93%',
      icon: TrendingUp,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      label: 'Active Referrals',
      value: '21',
      icon: Users,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
  ];

  const tierProgress = {
    current: 'Bronze',
    next: 'Silver',
    currentReferrals: 24,
    nextTierReferrals: 50,
    currentRate: 10,
    nextRate: 12,
    tiers: [
      { name: 'Bronze', range: '0-49', rate: 10, active: true },
      { name: 'Silver', range: '50-99', rate: 12, active: false, isNext: true },
      { name: 'Gold', range: '100-249', rate: 15, active: false },
      { name: 'Platinum', range: '250+', rate: 20, active: false },
    ],
  };

  const referrals = [
    {
      id: 1,
      user: 'user_8273',
      joined: 'Feb 12, 2026',
      status: 'Active',
      spent: '$250.00',
      earned: '$25.00',
      lastActivity: '2 hours ago',
    },
    {
      id: 2,
      user: 'user_8192',
      joined: 'Feb 10, 2026',
      status: 'Active',
      spent: '$155.00',
      earned: '$15.50',
      lastActivity: '1 day ago',
    },
    {
      id: 3,
      user: 'user_8145',
      joined: 'Feb 8, 2026',
      status: 'Active',
      spent: '$45.00',
      earned: '$4.50',
      lastActivity: '3 days ago',
    },
    {
      id: 4,
      user: 'user_8089',
      joined: 'Feb 5, 2026',
      status: 'Pending',
      spent: '$0.00',
      earned: '$0.00',
      lastActivity: 'Never',
    },
    {
      id: 5,
      user: 'user_8056',
      joined: 'Feb 3, 2026',
      status: 'Active',
      spent: '$320.00',
      earned: '$32.00',
      lastActivity: '5 hours ago',
    },
  ];

  const commissionHistory = [
    {
      date: 'Feb 13, 2026',
      time: '14:23',
      user: 'user_8273',
      transaction: 'SMS Activation - WhatsApp',
      amount: 15.0,
      status: 'Paid',
    },
    {
      date: 'Feb 13, 2026',
      time: '11:45',
      user: 'user_8056',
      transaction: 'Wallet Top-up',
      amount: 20.0,
      status: 'Paid',
    },
    {
      date: 'Feb 12, 2026',
      time: '16:30',
      user: 'user_8192',
      transaction: 'Wallet Top-up',
      amount: 10.0,
      status: 'Paid',
    },
    {
      date: 'Feb 11, 2026',
      time: '09:15',
      user: 'user_8273',
      transaction: 'Number Rental - 30 Days',
      amount: 10.0,
      status: 'Paid',
    },
    {
      date: 'Feb 10, 2026',
      time: '13:20',
      user: 'user_8192',
      transaction: 'SMS Activation - Telegram',
      amount: 5.5,
      status: 'Paid',
    },
    {
      date: 'Feb 9, 2026',
      time: '18:45',
      user: 'user_8145',
      transaction: 'Membership Upgrade',
      amount: 2.0,
      status: 'Paid',
    },
    {
      date: 'Feb 8, 2026',
      time: '10:30',
      user: 'user_8056',
      transaction: 'SMS Activation - Instagram',
      amount: 12.0,
      status: 'Paid',
    },
    {
      date: 'Feb 7, 2026',
      time: '15:10',
      user: 'user_8273',
      transaction: 'Wallet Top-up',
      amount: 5.0,
      status: 'Pending',
    },
  ];

  const withdrawalHistory = [
    {
      id: 'WD-001',
      date: 'Feb 10, 2026',
      amount: 50.0,
      method: 'Wallet Balance',
      status: 'Completed',
    },
    {
      id: 'WD-002',
      date: 'Jan 28, 2026',
      amount: 100.0,
      method: 'PayPal',
      status: 'Completed',
    },
    {
      id: 'WD-003',
      date: 'Jan 15, 2026',
      amount: 75.0,
      method: 'Wallet Balance',
      status: 'Completed',
    },
    {
      id: 'WD-004',
      date: 'Jan 5, 2026',
      amount: 200.0,
      method: 'Bank Transfer',
      status: 'Rejected',
    },
    {
      id: 'WD-005',
      date: 'Dec 20, 2025',
      amount: 25.0,
      method: 'Wallet Balance',
      status: 'Pending',
    },
    {
      id: 'WD-006',
      date: 'Dec 8, 2025',
      amount: 150.0,
      method: 'PayPal',
      status: 'Completed',
    },
  ];

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (amount > mainStats.availableBalance) {
      toast.error('Insufficient balance');
      return;
    }
    if (amount < 10) {
      toast.error('Minimum withdrawal amount is $10.00');
      return;
    }
    setWithdrawModal(false);
    setWithdrawAmount('');
    toast.success('Withdrawal request submitted!', {
      description: `$${amount.toFixed(2)} withdrawal to ${withdrawMethod === 'wallet' ? 'Wallet Balance' : withdrawMethod === 'paypal' ? 'PayPal' : 'Bank Transfer'} is being processed.`,
    });
  };

  const getWithdrawalStatusBadge = (status: string) => {
    if (status === 'Completed')
      return {
        variant: 'default' as const,
        icon: CheckCircle2,
        color: 'text-success',
      };
    if (status === 'Pending')
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Referral Program</h1>
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
              ${mainStats.totalEarned.toFixed(2)}
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
              ${mainStats.availableBalance.toFixed(2)}
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
              ${mainStats.pendingBalance.toFixed(2)}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              Pending clearance
            </p>
          </CardContent>
        </Card>

        {/* This Month */}
        <Card className="card-hover-lift">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                This Month
              </CardTitle>
              <div className="rounded-lg bg-blue-500/10 p-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="animate-count-up text-3xl font-bold">
              ${mainStats.thisMonth.toFixed(2)}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              February earnings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Commission Rate Banner */}
      <Card className="border-primary/30 from-primary/5 to-primary/10 bg-gradient-to-r">
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 rounded-full p-3">
                <Percent className="text-primary h-5 w-5" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Current Commission Rate
                </p>
                <p className="text-primary text-2xl font-bold">
                  {mainStats.commissionRate}%
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="px-3 py-1.5 text-sm">
                <Award className="mr-1 h-3 w-3" />
                {tierProgress.current} Tier
              </Badge>
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
            Share this link to earn {mainStats.commissionRate}% commission on
            all purchases made by referred users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Referral Code */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Referral Code</label>
            <div className="flex gap-2">
              <Input
                value={referralCode}
                readOnly
                className="bg-muted/50 font-mono text-lg font-semibold"
              />
              <Button
                variant={copied ? 'default' : 'outline'}
                onClick={() => copyToClipboard(referralCode)}
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
                value={referralLink}
                readOnly
                className="bg-muted/50 text-sm"
              />
              <Button
                onClick={() => copyToClipboard(referralLink)}
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
                    Earn {mainStats.commissionRate}% on all their purchases
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
                  <span>Unlock higher tier rates (up to 20%)</span>
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
        {activityStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="card-hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.label}
                </CardTitle>
                <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Referral Tier Progress */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle>Referral Tier Progress</CardTitle>
              <CardDescription>
                Unlock higher commission rates by referring more users
              </CardDescription>
            </div>
            <Badge variant="default" className="px-3 py-1.5 text-sm">
              <Award className="mr-1.5 h-3 w-3" />
              {tierProgress.current} Tier - {tierProgress.currentRate}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {tierProgress.currentReferrals} /{' '}
                {tierProgress.nextTierReferrals} referrals to unlock{' '}
                {tierProgress.next}
              </span>
              <span className="text-primary font-semibold">
                {Math.round(
                  (tierProgress.currentReferrals /
                    tierProgress.nextTierReferrals) *
                    100,
                )}
                %
              </span>
            </div>
            <Progress
              value={
                (tierProgress.currentReferrals /
                  tierProgress.nextTierReferrals) *
                100
              }
              className="h-3"
            />
            <p className="text-muted-foreground text-xs">
              {tierProgress.nextTierReferrals - tierProgress.currentReferrals}{' '}
              more referrals needed to increase commission to{' '}
              {tierProgress.nextRate}%
            </p>
          </div>

          {/* Tier Breakdown */}
          <div className="border-border grid grid-cols-2 gap-3 border-t pt-4 md:grid-cols-4">
            {tierProgress.tiers.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-lg p-4 text-center transition-all ${
                  tier.active
                    ? 'bg-primary/10 border-primary/40 border-2 shadow-sm'
                    : tier.isNext
                      ? 'bg-muted/70 border-primary/20 border-2'
                      : 'bg-muted/50 border-border border'
                }`}
              >
                <div className="mb-1 flex items-center justify-center gap-1">
                  {tier.active && <Award className="text-primary h-3 w-3" />}
                  <div
                    className={`text-xs font-medium ${tier.active ? 'text-primary' : 'text-muted-foreground'}`}
                  >
                    {tier.name}
                  </div>
                </div>
                <div className="text-muted-foreground mb-2 text-xs">
                  ({tier.range} refs)
                </div>
                <div
                  className={`text-xl font-bold ${tier.active ? 'text-primary' : ''}`}
                >
                  {tier.rate}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
            <div className="max-h-[400px] space-y-2 overflow-y-auto pr-2">
              {referrals.map((ref) => (
                <div
                  key={ref.id}
                  className="border-border hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <p className="truncate font-mono text-sm font-medium">
                        {ref.user}
                      </p>
                      <Badge
                        variant={
                          ref.status === 'Active' ? 'default' : 'secondary'
                        }
                        className="flex-shrink-0 text-xs"
                      >
                        {ref.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      Joined {ref.joined} • Last active: {ref.lastActivity}
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0 text-right">
                    <p className="text-success text-sm font-semibold">
                      +{ref.earned}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {ref.spent} spent
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Commissions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Commissions</CardTitle>
            <CardDescription>Latest referral earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[400px] space-y-2 overflow-y-auto pr-2">
              {commissionHistory.slice(0, 8).map((comm, i) => (
                <div
                  key={i}
                  className="border-border hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <p className="truncate font-mono text-sm font-medium">
                        {comm.user}
                      </p>
                      <Badge
                        variant="default"
                        className="flex-shrink-0 text-xs"
                      >
                        {comm.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground truncate text-xs">
                      {comm.transaction}
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {comm.date} • {comm.time}
                    </p>
                  </div>
                  <span className="text-success ml-4 flex-shrink-0 font-semibold">
                    +${comm.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full Earnings History Table */}
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
                    <TableHead>User</TableHead>
                    <TableHead>Transaction</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Earned</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissionHistory.map((comm, i) => (
                    <TableRow key={i} className="hover:bg-muted/50">
                      <TableCell className="text-sm">
                        <div>{comm.date}</div>
                        <div className="text-muted-foreground text-xs">
                          {comm.time}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {comm.user}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm">
                        {comm.transaction}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            comm.status === 'Paid' ? 'default' : 'secondary'
                          }
                          className="text-xs"
                        >
                          {comm.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-success text-right font-semibold">
                        +${comm.amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination Placeholder */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              Showing 1-{commissionHistory.length} of {commissionHistory.length}{' '}
              transactions
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
                Transfer your referral balance to your wallet or external
                payment method
              </CardDescription>
            </div>
            <Button
              onClick={() => setWithdrawModal(true)}
              className="bg-success hover:bg-success/90 text-success-foreground"
              disabled={mainStats.availableBalance < 10}
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
                ${mainStats.availableBalance.toFixed(2)}
              </p>
            </div>
            <div className="bg-warning/5 border-warning/20 rounded-lg border p-4 text-center">
              <p className="text-muted-foreground mb-1 text-xs">
                Pending (not withdrawable)
              </p>
              <p className="text-warning text-2xl font-bold">
                ${mainStats.pendingBalance.toFixed(2)}
              </p>
            </div>
            <div className="bg-muted/50 border-border rounded-lg border p-4 text-center">
              <p className="text-muted-foreground mb-1 text-xs">
                Minimum Withdrawal
              </p>
              <p className="text-2xl font-bold">$10.00</p>
            </div>
          </div>

          {/* Withdrawal History Table */}
          <div>
            <h4 className="mb-3 font-semibold">Withdrawal History</h4>
            <div className="border-border overflow-hidden rounded-lg border">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withdrawalHistory.map((wd) => {
                      const statusInfo = getWithdrawalStatusBadge(wd.status);
                      const StatusIcon = statusInfo.icon;
                      return (
                        <TableRow key={wd.id} className="hover:bg-muted/50">
                          <TableCell className="text-muted-foreground font-mono text-xs">
                            {wd.id}
                          </TableCell>
                          <TableCell className="text-sm">{wd.date}</TableCell>
                          <TableCell className="text-sm">{wd.method}</TableCell>
                          <TableCell>
                            <Badge
                              variant={statusInfo.variant}
                              className="flex w-fit items-center gap-1 text-xs"
                            >
                              <StatusIcon className="h-3 w-3" />
                              {wd.status}
                            </Badge>
                          </TableCell>
                          <TableCell
                            className={`text-right font-semibold ${wd.status === 'Rejected' ? 'text-destructive line-through' : 'text-foreground'}`}
                          >
                            ${wd.amount.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
            {withdrawalHistory.length === 0 && (
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
              Transfer your earnings to your preferred payment method
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-success/10 border-success/20 rounded-lg border p-3">
              <p className="text-muted-foreground text-sm">Available Balance</p>
              <p className="text-success text-2xl font-bold">
                ${mainStats.availableBalance.toFixed(2)}
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
                  min="10"
                  max={mainStats.availableBalance}
                  step="0.01"
                />
              </div>
              <p className="text-muted-foreground text-xs">
                Minimum: $10.00 • Maximum: $
                {mainStats.availableBalance.toFixed(2)}
              </p>
              <div className="flex gap-2">
                {[10, 25, 50, 100].map((amt) => (
                  <button
                    key={amt}
                    onClick={() =>
                      setWithdrawAmount(
                        Math.min(amt, mainStats.availableBalance).toString(),
                      )
                    }
                    className="border-border bg-muted/50 hover:bg-muted rounded border px-2 py-1 text-xs transition-colors"
                  >
                    ${amt}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setWithdrawAmount(mainStats.availableBalance.toString())
                  }
                  className="border-success/50 bg-success/10 text-success hover:bg-success/20 rounded border px-2 py-1 text-xs transition-colors"
                >
                  Max
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Withdrawal Method</Label>
              <Select value={withdrawMethod} onValueChange={setWithdrawMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wallet">
                    💳 Add to Wallet Balance
                  </SelectItem>
                  <SelectItem value="paypal">🅿️ PayPal</SelectItem>
                  <SelectItem value="bank">🏦 Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-muted-foreground text-xs">
                {withdrawMethod === 'wallet'
                  ? 'Instantly credited to your account wallet'
                  : 'Processing time: 1-3 business days'}
              </p>
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
                disabled={!withdrawAmount || parseFloat(withdrawAmount) < 10}
              >
                <ArrowDownToLine className="mr-2 h-4 w-4" />
                Confirm Withdrawal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
