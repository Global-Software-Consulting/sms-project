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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Wallet as WalletIcon,
  Loader2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Lock,
  X,
  CreditCard,
  ArrowLeft,
  CheckCircle2,
  Globe,
} from 'lucide-react';
import { toast } from 'sonner';
import { BinancePaymentDialog } from '@/components/payments/BinancePaymentDialog';
import {
  getWallet,
  getTransactions,
  formatBalance,
  getTransactionTypeLabel,
  getTransactionStatusColor,
  isPositiveTransaction,
  Wallet,
  WalletTransaction,
  TransactionType,
  TransactionStatus,
  TransactionQueryParams,
} from '@/lib/api/walletApi';
import {
  createPayment,
  getGateways,
  getPaymentPreview,
  GatewayInfo,
  PaymentGateway,
  PaymentPreviewResponse,
  MIN_AMOUNT,
  MAX_AMOUNT,
  isValidAmount,
  getGatewayName,
  getGatewayIcon,
  PAYGATE_PROVIDERS,
  PaygateProvider,
  getMyBinanceVerifications,
  MyBinanceVerification,
} from '@/lib/api/paymentsApi';
import {
  getCurrentMembership,
  CurrentMembershipResponse,
} from '@/lib/api/membershipApi';
import { validateCoupon, CouponValidationResult } from '@/lib/api/couponsApi';
import { useNotifications } from '@/contexts/NotificationContext';

export default function WalletPage() {
  const { notifications } = useNotifications();
  // Wallet state
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [membership, setMembership] =
    useState<CurrentMembershipResponse | null>(null);
  const [gateways, setGateways] = useState<GatewayInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalTransactions, setTotalTransactions] = useState(0);

  // Filters
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'all'>(
    'all',
  );

  // Coupon validation state
  const [couponValidation, setCouponValidation] =
    useState<CouponValidationResult | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Deposit modal state
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(
    null,
  );
  const [selectedPaygateProvider, setSelectedPaygateProvider] =
    useState<PaygateProvider | null>(null);
  const [showPaygateProviders, setShowPaygateProviders] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [paymentPreview, setPaymentPreview] =
    useState<PaymentPreviewResponse | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // Payment completion state
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  // Binance payment state
  const [showBinanceDialog, setShowBinanceDialog] = useState(false);
  const [binancePaymentId, setBinancePaymentId] = useState<string | null>(null);
  const [binanceAmount, setBinanceAmount] = useState<number>(0);
  const [binanceDialogMode, setBinanceDialogMode] = useState<
    'initial' | 'resume'
  >('initial');
  const [binanceExistingOrderId, setBinanceExistingOrderId] = useState<
    string | null
  >(null);
  const [pendingBinance, setPendingBinance] = useState<MyBinanceVerification[]>(
    [],
  );

  const fetchPendingBinance = useCallback(async () => {
    try {
      const list = await getMyBinanceVerifications();
      // Show PENDING (resumable) + FAILED (rate-limited, contact support)
      setPendingBinance(
        list.filter((v) => v.status === 'PENDING' || v.status === 'FAILED'),
      );
    } catch (err) {
      console.error('Failed to fetch pending Binance verifications:', err);
    }
  }, []);

  // Fetch wallet data. Pass {silent:true} for background refreshes
  // (WS events, modal close) so full-page loader doesn't blank the screen.
  const fetchWalletData = useCallback(
    async (options?: { silent?: boolean }) => {
      try {
        if (!options?.silent) setIsLoading(true);
        setError(null);

        const [walletRes, transactionsRes, membershipRes, gatewaysRes] =
          await Promise.allSettled([
            getWallet(),
            getTransactions({ page: 1, limit: 20 }),
            getCurrentMembership(),
            getGateways(),
          ]);

        if (walletRes.status === 'fulfilled') {
          setWallet(walletRes.value);
        }

        if (transactionsRes.status === 'fulfilled') {
          setTransactions(transactionsRes.value.data);
          setTotalTransactions(transactionsRes.value.meta.total);
          setHasMore(transactionsRes.value.meta.hasNextPage);
        }

        if (membershipRes.status === 'fulfilled') {
          setMembership(membershipRes.value);
        }

        if (
          gatewaysRes.status === 'fulfilled' &&
          gatewaysRes.value.length > 0
        ) {
          setGateways(gatewaysRes.value);
        } else {
          const defaultGateways: GatewayInfo[] = [
            {
              gateway: 'STRIPE',
              name: 'Stripe',
              enabled: true,
              minAmount: 1,
              maxAmount: 10000,
              currencies: ['USD'],
            },
            {
              gateway: 'PAYGATE',
              name: 'PayGate Card Getaways',
              enabled: true,
              minAmount: 1,
              maxAmount: 5000,
              currencies: ['USD'],
            },
            {
              gateway: 'PLISIO',
              name: 'Crypto Plisio',
              enabled: true,
              minAmount: 1,
              maxAmount: 10000,
              currencies: ['USD'],
            },
            {
              gateway: 'CRYPTOMUS',
              name: 'Cryptomus',
              enabled: true,
              minAmount: 10,
              maxAmount: 10000,
              currencies: ['USD'],
            },
            {
              gateway: 'NOWPAYMENTS',
              name: 'NOWPayments',
              enabled: true,
              minAmount: 10,
              maxAmount: 10000,
              currencies: ['USD'],
            },
            {
              gateway: 'VOLET',
              name: 'Volet',
              enabled: true,
              minAmount: 1,
              maxAmount: 10000,
              currencies: ['USD'],
            },
          ];
          setGateways(defaultGateways);
        }
      } catch (err) {
        console.error('Failed to fetch wallet data:', err);
        setError('Failed to load wallet data. Please refresh the page.');
      } finally {
        if (!options?.silent) setIsLoading(false);
      }
    },
    [],
  );

  // Fetch transactions with filters
  const fetchTransactions = useCallback(
    async (pageNum: number, append: boolean = false) => {
      try {
        if (append) {
          setIsLoadingMore(true);
        }

        const params: TransactionQueryParams = {
          page: pageNum,
          limit: 20,
        };

        if (typeFilter !== 'all') {
          params.type = typeFilter;
        }

        if (statusFilter !== 'all') {
          params.status = statusFilter;
        }

        const response = await getTransactions(params);

        if (append) {
          setTransactions((prev) => [...prev, ...response.data]);
        } else {
          setTransactions(response.data);
        }

        setTotalTransactions(response.meta.total);
        setHasMore(response.meta.hasNextPage);
        setPage(pageNum);
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
        toast.error('Failed to load transactions');
      } finally {
        setIsLoadingMore(false);
      }
    },
    [typeFilter, statusFilter],
  );

  // Initial load
  useEffect(() => {
    fetchWalletData();
    fetchPendingBinance();
  }, [fetchWalletData, fetchPendingBinance]);

  // Handle payment-return query string. The gateway redirects the user
  // back to `/dashboard/wallet?payment=success` or `?payment=cancelled`
  // after they finish (or cancel) checkout on the gateway's hosted page.
  // The actual wallet credit happens server-side when the gateway fires
  // its webhook, not from this redirect — but the redirect is what tells
  // the user "you're done, look at your balance". We surface a toast and
  // refetch the wallet so any newly-credited balance shows immediately
  // without the user having to refresh manually. Query is stripped after
  // handling so refreshing the page doesn't re-fire the toast.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    const status = url.searchParams.get('payment');
    if (status !== 'success' && status !== 'cancelled') return;

    if (status === 'success') {
      toast.success('Payment received', {
        description:
          'Your wallet will update once the gateway confirms (usually within a few seconds).',
      });
      // Pull fresh balance + transactions silently; the server-side
      // webhook may have already credited.
      fetchWalletData({ silent: true });
    } else {
      toast.info('Payment cancelled', {
        description: 'No charge was made.',
      });
    }

    url.searchParams.delete('payment');
    window.history.replaceState({}, '', url.toString());
  }, [fetchWalletData]);

  // Auto-refresh on relevant WS notifications.
  // PAYMENT_SUCCESS = admin verified Binance → wallet credited.
  // SYSTEM with data.type=BINANCE_RESET = admin reset failed verification → user can retry.
  useEffect(() => {
    const latest = notifications[0];
    if (!latest) return;
    const data = latest.data as { paymentId?: string; type?: string } | null;

    if (latest.type === 'PAYMENT_SUCCESS') {
      fetchWalletData({ silent: true });
      fetchPendingBinance();
      // Auto-close dialog if open and it matches the verified payment
      if (
        showBinanceDialog &&
        binancePaymentId &&
        data?.paymentId === binancePaymentId
      ) {
        setShowBinanceDialog(false);
        setBinancePaymentId(null);
        setBinanceAmount(0);
        toast.success('Payment verified! Balance credited.');
      }
    } else if (latest.type === 'SYSTEM' && data?.type === 'BINANCE_RESET') {
      // Admin reset — refresh pending list so red FAILED row turns amber PENDING
      fetchPendingBinance();
    }
  }, [
    notifications,
    fetchWalletData,
    fetchPendingBinance,
    showBinanceDialog,
    binancePaymentId,
  ]);

  // Fetch payment preview when amount or gateway changes
  useEffect(() => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount < MIN_AMOUNT || !selectedGateway) {
      setPaymentPreview(null);
      return;
    }

    const fetchPreview = async () => {
      setIsLoadingPreview(true);
      try {
        const preview = await getPaymentPreview(numAmount, selectedGateway);
        setPaymentPreview(preview);
      } catch (err) {
        console.error('Failed to fetch payment preview:', err);
        setPaymentPreview(null);
      } finally {
        setIsLoadingPreview(false);
      }
    };

    const debounceTimeout = setTimeout(fetchPreview, 300);
    return () => clearTimeout(debounceTimeout);
  }, [amount, selectedGateway]);

  // Refetch when filters change
  useEffect(() => {
    if (!isLoading) {
      fetchTransactions(1, false);
    }
  }, [typeFilter, statusFilter]);

  // Validate coupon when code or amount changes
  useEffect(() => {
    const numAmount = parseFloat(amount);
    if (
      !couponCode ||
      couponCode.length < 3 ||
      !numAmount ||
      numAmount < MIN_AMOUNT
    ) {
      setCouponValidation(null);
      return;
    }

    const validateCouponCode = async () => {
      setIsValidatingCoupon(true);
      try {
        const result = await validateCoupon({
          code: couponCode,
          orderType: 'DEPOSIT',
          orderAmount: numAmount,
        });
        setCouponValidation(result);
      } catch (err) {
        console.error('Failed to validate coupon:', err);
        setCouponValidation({
          valid: false,
          discount: 0,
          finalAmount: numAmount,
          message: 'Failed to validate coupon',
        });
      } finally {
        setIsValidatingCoupon(false);
      }
    };

    const debounceTimeout = setTimeout(validateCouponCode, 500);
    return () => clearTimeout(debounceTimeout);
  }, [couponCode, amount]);

  // Reset deposit modal state
  const resetDepositModal = () => {
    setAmount('');
    setSelectedGateway(null);
    setSelectedPaygateProvider(null);
    setShowPaygateProviders(false);
    setCouponCode('');
    setPaymentPreview(null);
    setCouponValidation(null);
  };

  // Open deposit modal
  const openDepositModal = () => {
    resetDepositModal();
    setShowDepositModal(true);
  };

  // Close deposit modal
  const closeDepositModal = () => {
    setShowDepositModal(false);
    resetDepositModal();
  };

  // Handle gateway selection
  const handleGatewaySelect = (gateway: GatewayInfo) => {
    const numAmount = parseFloat(amount) || 0;

    // Check if amount meets minimum
    if (numAmount < gateway.minAmount) {
      return; // Card is disabled, do nothing
    }

    if (gateway.gateway === 'PAYGATE') {
      setSelectedGateway('PAYGATE');
      setShowPaygateProviders(true);
      setSelectedPaygateProvider(null);
    } else {
      setSelectedGateway(gateway.gateway);
      setShowPaygateProviders(false);
      setSelectedPaygateProvider(null);
    }
  };

  // Handle PayGate provider selection
  const handlePaygateProviderSelect = (provider: PaygateProvider) => {
    const numAmount = parseFloat(amount) || 0;
    const providerInfo = PAYGATE_PROVIDERS.find((p) => p.id === provider);

    if (providerInfo && numAmount < providerInfo.minAmount) {
      return; // Card is disabled
    }

    setSelectedPaygateProvider(provider);
  };

  // Handle back from PayGate providers
  const handleBackFromProviders = () => {
    setShowPaygateProviders(false);
    setSelectedGateway(null);
    setSelectedPaygateProvider(null);
  };

  // Handle payment confirmation
  const handleConfirmPayment = async () => {
    if (!selectedGateway) return;

    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || !isValidAmount(numAmount)) {
      toast.error(
        `Amount must be between $${MIN_AMOUNT} and $${MAX_AMOUNT.toLocaleString()}`,
      );
      return;
    }

    // For PayGate, require provider selection
    if (selectedGateway === 'PAYGATE' && !selectedPaygateProvider) {
      toast.error('Please select a card provider');
      return;
    }

    try {
      setIsProcessing(true);

      const response = await createPayment({
        amount: numAmount,
        gateway: selectedGateway,
        paygateProvider:
          selectedGateway === 'PAYGATE' ? selectedPaygateProvider! : undefined,
        successUrl: `${window.location.origin}/dashboard/wallet?payment=success`,
        cancelUrl: `${window.location.origin}/dashboard/wallet?payment=cancelled`,
        ...(couponCode ? { couponCode } : {}),
      });

      // Snapshot amount BEFORE closing modal (resetDepositModal clears it)
      const snapshotAmount = numAmount;

      // Close deposit modal
      closeDepositModal();

      // Handle Binance payments differently
      if (selectedGateway === 'BINANCE') {
        setBinancePaymentId(response.paymentId);
        setBinanceAmount(snapshotAmount);
        setBinanceDialogMode('initial');
        setBinanceExistingOrderId(null);
        setShowBinanceDialog(true);
        toast.info(
          'Please complete the Binance transfer and enter your Order ID',
        );
        return;
      }

      if (response.checkoutUrl) {
        setCheckoutUrl(response.checkoutUrl);
        setShowPaymentDialog(true);
        window.open(response.checkoutUrl, '_blank');
      } else {
        toast.success('Payment initiated', {
          description: 'Please complete the payment in the opened window.',
        });
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      toast.error('Failed to initiate payment', {
        description: err.response?.data?.message || 'Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Close payment summary
  const closePaymentSummary = () => {
    if (showPaygateProviders) {
      setSelectedPaygateProvider(null);
    } else {
      setSelectedGateway(null);
    }
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get transaction icon
  const getTransactionIcon = (type: TransactionType) => {
    if (isPositiveTransaction(type)) {
      return (
        <div className="bg-success/10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
          <ArrowDownRight className="text-success h-4 w-4" />
        </div>
      );
    }
    return (
      <div className="bg-destructive/10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
        <ArrowUpRight className="text-destructive h-4 w-4" />
      </div>
    );
  };

  // Check if payment summary should show
  const showPaymentSummary =
    selectedGateway &&
    (selectedGateway !== 'PAYGATE' ||
      (selectedGateway === 'PAYGATE' && selectedPaygateProvider));

  // Get current amount
  const numAmount = parseFloat(amount) || 0;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="text-primary mx-auto mb-4 h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading wallet...</p>
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
          <Button onClick={() => fetchWalletData()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Wallet</h1>
          <p className="text-muted-foreground mt-1">
            Manage your balance and transactions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchWalletData()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Balance and Quick Actions */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Balance Card */}
        <Card className="from-primary/10 via-background to-background border-primary/20 bg-gradient-to-br md:col-span-2">
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-muted-foreground mb-1 text-sm font-medium">
                  Available Balance
                </p>
                <p className="text-primary text-4xl font-bold md:text-5xl">
                  {wallet
                    ? formatBalance(wallet.balance, wallet.currency)
                    : '$0.00'}
                </p>
                {wallet?.isLocked && (
                  <p className="text-destructive mt-2 flex items-center gap-1 text-sm">
                    <Lock className="h-3 w-3" />
                    Wallet locked: {wallet.lockedReason}
                  </p>
                )}
              </div>
              <Button
                size="lg"
                onClick={openDepositModal}
                disabled={wallet?.isLocked}
                className="h-14 px-8 text-lg font-semibold"
              >
                <Plus className="mr-2 h-5 w-5" />
                Add Funds
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">
                Total Deposited
              </span>
              <span className="text-success font-semibold">
                {wallet
                  ? formatBalance(wallet.totalDeposited, wallet.currency)
                  : '$0.00'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Total Spent</span>
              <span className="font-semibold">
                {wallet
                  ? formatBalance(wallet.totalSpent, wallet.currency)
                  : '$0.00'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">
                Total Refunded
              </span>
              <span className="font-semibold">
                {wallet
                  ? formatBalance(wallet.totalRefunded, wallet.currency)
                  : '$0.00'}
              </span>
            </div>
            {membership?.currentPlan && membership.discount > 0 && (
              <div className="flex items-center justify-between border-t pt-2">
                <span className="text-muted-foreground text-sm">
                  {membership.currentPlan.name} Savings
                </span>
                <span className="text-success font-semibold">
                  {wallet
                    ? formatBalance(wallet.totalBonus, wallet.currency)
                    : '$0.00'}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                {totalTransactions} total transactions
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Select
                value={typeFilter}
                onValueChange={(v) =>
                  setTypeFilter(v as TransactionType | 'all')
                }
              >
                <SelectTrigger className="w-[130px] sm:w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="DEPOSIT">Deposit</SelectItem>
                  <SelectItem value="PURCHASE">Purchase</SelectItem>
                  <SelectItem value="REFUND">Refund</SelectItem>
                  <SelectItem value="BONUS">Bonus</SelectItem>
                  <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                  <SelectItem value="WITHDRAW">Withdrawal</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={statusFilter}
                onValueChange={(v) =>
                  setStatusFilter(v as TransactionStatus | 'all')
                }
              >
                <SelectTrigger className="w-[130px] sm:w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="REVERSED">Reversed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {(() => {
            // PENDING Binance verifications stay pinned at the top because
            // they need user action (resume the order). FAILED ones now
            // flow inline with regular transactions, sorted by date, so
            // they don't visually outrank newer activity (see the merged
            // rows below).
            const visiblePending =
              typeFilter === 'all' || typeFilter === 'DEPOSIT'
                ? pendingBinance.filter((v) => {
                    if (v.status !== 'PENDING') return false;
                    if (statusFilter === 'all') return true;
                    return statusFilter === 'PENDING';
                  }).length
                : 0;
            const visibleFailedBinance =
              typeFilter === 'all' || typeFilter === 'DEPOSIT'
                ? pendingBinance.filter((v) => {
                    if (v.status !== 'FAILED') return false;
                    if (statusFilter === 'all') return true;
                    return statusFilter === 'FAILED';
                  }).length
                : 0;
            return (
              transactions.length === 0 &&
              visiblePending === 0 &&
              visibleFailedBinance === 0
            );
          })() ? (
            <div className="py-12 text-center">
              <WalletIcon className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <p className="text-muted-foreground">No transactions found</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Add funds to get started
              </p>
              <Button className="mt-4" onClick={openDepositModal}>
                <Plus className="mr-2 h-4 w-4" />
                Add Funds
              </Button>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction</TableHead>
                      <TableHead className="table-hide-mobile">
                        Description
                      </TableHead>
                      <TableHead className="table-hide-tablet">Date</TableHead>
                      <TableHead className="table-hide-mobile">
                        Status
                      </TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Pinned-on-top: only PENDING Binance verifications.
                        These need user action (resume the order via the
                        modal), so they stay above all other rows. FAILED
                        verifications used to live here too but were
                        outranking newer normal transactions purely because
                        they were in this block — now they flow inline with
                        regular transactions below, sorted by date. */}
                    {(typeFilter === 'all' || typeFilter === 'DEPOSIT') &&
                      pendingBinance
                        .filter((v) => {
                          if (v.status !== 'PENDING') return false;
                          if (statusFilter === 'all') return true;
                          return statusFilter === 'PENDING';
                        })
                        .map((v) => {
                          const isFailed = v.status === 'FAILED';
                          return (
                            <TableRow
                              key={`binance-${v.id}`}
                              className={
                                isFailed
                                  ? 'cursor-pointer bg-red-500/5 hover:bg-red-500/10'
                                  : 'cursor-pointer bg-amber-500/5 hover:bg-amber-500/10'
                              }
                              onClick={() => {
                                if (isFailed) {
                                  toast.info(
                                    v.errorMessage
                                      ? `${v.errorMessage} — please contact support.`
                                      : 'Verification failed — please contact support.',
                                  );
                                  return;
                                }
                                setBinancePaymentId(v.paymentId);
                                setBinanceAmount(v.amount);
                                setBinanceDialogMode('resume');
                                setBinanceExistingOrderId(v.orderId);
                                setShowBinanceDialog(true);
                              }}
                            >
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <span className="text-lg">🔶</span>
                                  <div className="min-w-0">
                                    <p className="truncate font-medium">
                                      Binance Deposit
                                    </p>
                                    <p className="text-muted-foreground truncate text-xs">
                                      {v.orderId
                                        ? `Order: ${v.orderId.slice(0, 12)}…`
                                        : 'No Order ID yet'}
                                    </p>
                                    <p className="text-muted-foreground mt-0.5 text-xs sm:hidden">
                                      {formatDate(v.createdAt)}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="table-hide-mobile">
                                <p className="max-w-[200px] truncate text-sm">
                                  {isFailed
                                    ? `${v.errorMessage ?? 'Failed'} — contact support`
                                    : 'Awaiting admin verification — click to view'}
                                </p>
                              </TableCell>
                              <TableCell className="text-muted-foreground table-hide-tablet text-sm">
                                {formatDate(v.createdAt)}
                              </TableCell>
                              <TableCell className="table-hide-mobile">
                                <Badge
                                  variant="secondary"
                                  className={
                                    isFailed
                                      ? 'bg-red-500/15 text-red-500 capitalize'
                                      : 'bg-amber-500/15 text-amber-500 capitalize'
                                  }
                                >
                                  {isFailed ? 'failed' : 'pending'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex flex-col items-end gap-1">
                                  <span className="text-foreground font-semibold">
                                    +{formatBalance(v.amount.toString(), 'USD')}
                                  </span>
                                  <Badge
                                    variant="secondary"
                                    className={
                                      isFailed
                                        ? 'bg-red-500/15 text-xs text-red-500 capitalize sm:hidden'
                                        : 'bg-amber-500/15 text-xs text-amber-500 capitalize sm:hidden'
                                    }
                                  >
                                    {isFailed ? 'failed' : 'pending'}
                                  </Badge>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    {/* Merged + sorted-by-date: regular wallet transactions
                        interleaved with FAILED Binance verifications. PENDING
                        Binance rows are rendered in the pinned block above
                        and excluded here. Apply the same type/status filters
                        the user picked. */}
                    {(() => {
                      const failedBinanceRows =
                        typeFilter === 'all' || typeFilter === 'DEPOSIT'
                          ? pendingBinance
                              .filter((v) => {
                                if (v.status !== 'FAILED') return false;
                                if (statusFilter === 'all') return true;
                                return statusFilter === 'FAILED';
                              })
                              .map((v) => ({
                                kind: 'binance-failed' as const,
                                dateMs: new Date(v.createdAt).getTime(),
                                data: v,
                              }))
                          : [];
                      const txRows = transactions.map((t) => ({
                        kind: 'tx' as const,
                        dateMs: new Date(t.createdAt).getTime(),
                        data: t,
                      }));
                      return [...txRows, ...failedBinanceRows].sort(
                        (a, b) => b.dateMs - a.dateMs,
                      );
                    })().map((row) => {
                      if (row.kind === 'binance-failed') {
                        const v = row.data;
                        return (
                          <TableRow
                            key={`binance-${v.id}`}
                            className="cursor-pointer bg-red-500/5 hover:bg-red-500/10"
                            onClick={() => {
                              toast.info(
                                v.errorMessage
                                  ? `${v.errorMessage} — please contact support.`
                                  : 'Verification failed — please contact support.',
                              );
                            }}
                          >
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">🔶</span>
                                <div className="min-w-0">
                                  <p className="truncate font-medium">
                                    Binance Deposit
                                  </p>
                                  <p className="text-muted-foreground truncate text-xs">
                                    {v.orderId
                                      ? `Order: ${v.orderId.slice(0, 12)}…`
                                      : 'No Order ID yet'}
                                  </p>
                                  <p className="text-muted-foreground mt-0.5 text-xs sm:hidden">
                                    {formatDate(v.createdAt)}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="table-hide-mobile">
                              <p className="max-w-[200px] truncate text-sm">
                                {`${v.errorMessage ?? 'Failed'} — contact support`}
                              </p>
                            </TableCell>
                            <TableCell className="text-muted-foreground table-hide-tablet text-sm">
                              {formatDate(v.createdAt)}
                            </TableCell>
                            <TableCell className="table-hide-mobile">
                              <Badge
                                variant="secondary"
                                className="bg-red-500/15 text-red-500 capitalize"
                              >
                                failed
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex flex-col items-end gap-1">
                                <span className="text-foreground font-semibold">
                                  +{formatBalance(v.amount.toString(), 'USD')}
                                </span>
                                <Badge
                                  variant="secondary"
                                  className="bg-red-500/15 text-xs text-red-500 capitalize sm:hidden"
                                >
                                  failed
                                </Badge>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      }
                      const txn = row.data;
                      return (
                        <TableRow key={txn.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getTransactionIcon(txn.type)}
                              <div className="min-w-0">
                                <p className="truncate font-medium">
                                  {getTransactionTypeLabel(txn.type)}
                                </p>
                                <p className="text-muted-foreground truncate text-xs">
                                  {txn.id.slice(0, 8)}...
                                </p>
                                <p className="text-muted-foreground mt-0.5 text-xs sm:hidden">
                                  {formatDate(txn.createdAt)}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="table-hide-mobile">
                            <p className="max-w-[200px] truncate text-sm">
                              {txn.description || '-'}
                            </p>
                          </TableCell>
                          <TableCell className="text-muted-foreground table-hide-tablet text-sm">
                            {formatDate(txn.createdAt)}
                          </TableCell>
                          <TableCell className="table-hide-mobile">
                            <Badge
                              variant="secondary"
                              className="capitalize"
                              style={{
                                backgroundColor: `color-mix(in srgb, ${getTransactionStatusColor(txn.status)} 15%, transparent)`,
                                color: getTransactionStatusColor(txn.status),
                              }}
                            >
                              {txn.status.toLowerCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-col items-end gap-1">
                              <span
                                className={`font-semibold ${
                                  isPositiveTransaction(txn.type)
                                    ? 'text-success'
                                    : 'text-foreground'
                                }`}
                              >
                                {isPositiveTransaction(txn.type) ? '+' : '-'}
                                {formatBalance(
                                  Math.abs(parseFloat(txn.amount)).toString(),
                                  'USD',
                                )}
                              </span>
                              <Badge
                                variant="secondary"
                                className="text-xs capitalize sm:hidden"
                              >
                                {txn.status.toLowerCase()}
                              </Badge>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {hasMore && (
                <div className="flex justify-center p-4">
                  <Button
                    variant="outline"
                    onClick={() => fetchTransactions(page + 1, true)}
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load More'
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Deposit Modal - CheapStreamTV Style (Single Page) */}
      <Dialog open={showDepositModal} onOpenChange={setShowDepositModal}>
        <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto p-0 sm:max-w-[600px]">
          {/* Modal Header */}
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-xl font-bold">Add Funds</DialogTitle>
            <p className="text-muted-foreground mt-1 text-sm">
              Enter amount and select your preferred payment method
            </p>
          </DialogHeader>

          <div className="space-y-6 p-6">
            {/* Amount Input */}
            <div className="space-y-2">
              <label className="text-muted-foreground text-sm font-medium">
                Amount ($)
              </label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-14 text-xl font-semibold"
                min={MIN_AMOUNT}
                max={MAX_AMOUNT}
                autoFocus
              />

              {/* Validation Message */}
              {numAmount > 0 && numAmount >= MIN_AMOUNT ? (
                <p className="text-success flex items-center gap-1.5 text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  Amount is valid! Select a payment method below.
                </p>
              ) : numAmount > 0 ? (
                <p className="text-muted-foreground text-sm">
                  Enter amount above to enable payment methods
                </p>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Enter amount above to enable payment methods
                </p>
              )}

              {/* Gateway tier bonus preview */}
              {paymentPreview &&
                paymentPreview.gatewayBonus !== undefined &&
                paymentPreview.gatewayBonus > 0 && (
                  <p className="text-success flex items-center gap-1.5 text-sm">
                    <CheckCircle2 className="h-4 w-4" />
                    {`Gateway bonus: +$${paymentPreview.gatewayBonus.toFixed(2)} — you'll receive $${paymentPreview.amountCredited.toFixed(2)}`}
                  </p>
                )}
            </div>

            {/* Coupon Code - Always visible, right after amount like CheapStreamTV */}
            <div className="space-y-2">
              <label className="text-muted-foreground text-sm font-medium">
                Coupon Code (optional)
              </label>
              <div className="relative">
                <Input
                  placeholder="Enter coupon code for bonus"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className={`h-12 pr-10 ${
                    couponValidation?.valid
                      ? 'border-success focus:border-success'
                      : couponValidation && !couponValidation.valid
                        ? 'border-destructive focus:border-destructive'
                        : ''
                  }`}
                />
                {isValidatingCoupon && (
                  <Loader2 className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin" />
                )}
                {!isValidatingCoupon && couponValidation?.valid && (
                  <CheckCircle2 className="text-success absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
                )}
                {!isValidatingCoupon &&
                  couponValidation &&
                  !couponValidation.valid && (
                    <AlertCircle className="text-destructive absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
                  )}
              </div>
              {/* Coupon validation message */}
              {couponValidation && (
                <p
                  className={`text-sm ${couponValidation.valid ? 'text-success' : 'text-destructive'}`}
                >
                  {couponValidation.valid
                    ? `Coupon valid! You'll get +$${couponValidation.discount.toFixed(2)} bonus (${couponValidation.coupon?.type === 'PERCENTAGE' ? `${couponValidation.coupon.value}%` : `$${couponValidation.coupon?.value}`})`
                    : couponValidation.message || 'Invalid coupon code'}
                </p>
              )}
            </div>

            {/* Payment Methods Grid - Always Visible */}
            {!showPaygateProviders && (
              <div className="grid grid-cols-3 gap-3">
                {gateways
                  .filter((g) => g.enabled)
                  .map((gateway) => {
                    const isDisabled = numAmount < gateway.minAmount;
                    const needsMore = gateway.minAmount - numAmount;

                    return (
                      <button
                        key={gateway.gateway}
                        onClick={() => handleGatewaySelect(gateway)}
                        disabled={isDisabled}
                        className={`relative flex min-h-[120px] flex-col items-center justify-center rounded-xl border-2 p-4 text-center transition-all ${
                          selectedGateway === gateway.gateway &&
                          !showPaygateProviders
                            ? 'border-primary bg-primary/5'
                            : isDisabled
                              ? 'border-border/50 cursor-not-allowed opacity-60'
                              : 'border-border hover:border-primary/50 hover:bg-muted/30'
                        }`}
                      >
                        {/* Gateway Icon/Image */}
                        <div className="mb-2">
                          {gateway.imageUrl ? (
                            <img
                              src={gateway.imageUrl}
                              alt={gateway.name}
                              className="h-10 w-auto max-w-[80px] object-contain"
                            />
                          ) : gateway.gateway === 'STRIPE' ? (
                            <div className="flex h-10 items-center justify-center">
                              <svg
                                viewBox="0 0 60 25"
                                className="h-6 w-auto fill-current"
                              >
                                <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.02 1.04-.06 1.48zm-6.3-5.63c-1.03 0-2.07.73-2.27 2.59h4.46c-.03-1.67-.82-2.59-2.19-2.59zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02c.58-.68 1.8-1.34 3.45-1.34 3.38 0 5.47 3.03 5.47 7.43 0 5.2-2.54 7.62-5.72 7.62zm-.8-11.23c-1.03 0-1.76.55-2.12 1.05l-.02 5.44c.32.45 1.06 1.01 2.1 1.01 1.59 0 2.59-1.72 2.59-3.79 0-2.04-.95-3.71-2.55-3.71zm-8.24-3.57v14.79h-4.14V5.5h4.14zm0-4.65L27.77.92v3.26l4.14-.87v-.43zM18.69 7.27c-.4-.11-.89-.17-1.45-.17-1.67 0-2.82.77-3.47 1.68v-3.21h-4.14v14.72h4.14v-7.77c.6-.97 1.71-1.66 3.07-1.66.51 0 .96.06 1.41.17l.44-3.76zM5.92 14.99c0 .75.45.97 1.32.97.52 0 1.05-.08 1.42-.21v3.11c-.79.4-1.85.64-3.08.64-3.04 0-3.8-1.58-3.8-3.79V8.87H0V5.57h1.78V2.32l4.14-.87v4.12h2.76v3.3H5.92v6.12z" />
                              </svg>
                            </div>
                          ) : (
                            <span className="text-3xl">
                              {getGatewayIcon(gateway.gateway)}
                            </span>
                          )}
                        </div>

                        {/* Gateway Name */}
                        <p className="text-sm font-medium">
                          {gateway.name || getGatewayName(gateway.gateway)}
                        </p>

                        {/* Price or "Need more" message */}
                        {isDisabled ? (
                          <p className="text-destructive mt-1 text-xs">
                            Need ${needsMore.toFixed(2)} more
                          </p>
                        ) : numAmount > 0 ? (
                          <p className="text-primary mt-1 text-sm font-semibold">
                            ${numAmount.toFixed(2)}
                          </p>
                        ) : (
                          <p className="text-muted-foreground mt-1 text-xs">
                            Min: ${gateway.minAmount}
                          </p>
                        )}
                      </button>
                    );
                  })}
              </div>
            )}

            {/* PayGate Providers Section */}
            {showPaygateProviders && (
              <div className="space-y-4">
                {/* Back Button */}
                <button
                  onClick={handleBackFromProviders}
                  className="text-primary flex items-center gap-1 text-sm hover:underline"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Change Payment Method
                </button>

                <div>
                  <h3 className="mb-1 text-lg font-semibold">
                    Select Payment Provider
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Choose how you want to pay with PayGate
                  </p>
                </div>

                {/* Card Payments Header */}
                <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                  <CreditCard className="h-4 w-4 text-yellow-500" />
                  Card Payments
                </div>

                {/* Providers Grid */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {PAYGATE_PROVIDERS.map((provider) => {
                    const isDisabled = numAmount < provider.minAmount;
                    const needsMore = provider.minAmount - numAmount;
                    const isSelected = selectedPaygateProvider === provider.id;

                    return (
                      <button
                        key={provider.id}
                        onClick={() => handlePaygateProviderSelect(provider.id)}
                        disabled={isDisabled}
                        className={`rounded-xl border-2 p-4 text-left transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : isDisabled
                              ? 'border-border/50 cursor-not-allowed opacity-60'
                              : 'border-border hover:border-primary/50 hover:bg-muted/30'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="flex flex-wrap items-center gap-2 font-semibold">
                              {provider.name}
                              {provider.recommended && (
                                <Badge
                                  variant="secondary"
                                  className="bg-primary/10 text-primary text-[10px]"
                                >
                                  Recommended
                                </Badge>
                              )}
                            </p>
                            <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                              {provider.description}
                            </p>

                            {/* Min amount / Need more */}
                            {isDisabled ? (
                              <p className="text-destructive mt-2 text-xs">
                                You need ${needsMore.toFixed(2)} more for
                              </p>
                            ) : (
                              <p className="text-primary mt-2 text-xs">
                                Min:: ${provider.minAmount}
                              </p>
                            )}
                          </div>

                          {/* Icon */}
                          {provider.id === 'multi' ? (
                            <Globe className="text-primary/60 h-8 w-8 flex-shrink-0" />
                          ) : (
                            <CreditCard className="h-8 w-8 flex-shrink-0 text-yellow-500/60" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Payment Summary - Shows at bottom when method is selected */}
            {showPaymentSummary && (
              <div className="mt-4 border-t pt-4">
                <div className="bg-muted/30 space-y-3 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Payment Summary</h4>
                    <button
                      onClick={closePaymentSummary}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Method:</span>
                      <span className="font-medium">
                        {selectedGateway === 'PAYGATE'
                          ? 'Paygate Card Getaways'
                          : getGatewayName(selectedGateway!)}
                      </span>
                    </div>

                    {selectedGateway === 'PAYGATE' &&
                      selectedPaygateProvider && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Provider:
                          </span>
                          <span className="text-primary font-medium">
                            {
                              PAYGATE_PROVIDERS.find(
                                (p) => p.id === selectedPaygateProvider,
                              )?.name
                            }
                            {PAYGATE_PROVIDERS.find(
                              (p) => p.id === selectedPaygateProvider,
                            )?.recommended && (
                              <span className="text-muted-foreground ml-1">
                                (Recommended)
                              </span>
                            )}
                          </span>
                        </div>
                      )}

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Deposit Amount:
                      </span>
                      <span className="font-medium">
                        ${numAmount.toFixed(2)}
                      </span>
                    </div>

                    {/* Coupon Bonus - Show if valid coupon applied */}
                    {couponValidation?.valid &&
                      couponValidation.discount > 0 && (
                        <div className="text-success flex justify-between">
                          <span>Coupon Bonus ({couponCode}):</span>
                          <span className="font-medium">
                            +${couponValidation.discount.toFixed(2)}
                          </span>
                        </div>
                      )}

                    {/* Total to receive */}
                    <div className="border-border/50 flex justify-between border-t pt-2">
                      <span className="text-muted-foreground">
                        You'll Receive:
                      </span>
                      <span className="text-primary text-lg font-semibold">
                        $
                        {(
                          numAmount +
                          (couponValidation?.valid
                            ? couponValidation.discount
                            : 0)
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Confirm Button */}
                  <Button
                    className="mt-2 h-12 w-full text-base font-semibold"
                    onClick={handleConfirmPayment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Confirm Payment'
                    )}
                  </Button>

                  {/* Change Payment Method Link */}
                  <button
                    onClick={closePaymentSummary}
                    className="text-muted-foreground hover:text-foreground w-full py-2 text-center text-sm"
                  >
                    ← Change Payment Method
                  </button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Completion Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Complete Your Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">
              A new window has been opened for you to complete the payment. Once
              completed, your balance will be updated automatically.
            </p>
            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <p className="text-muted-foreground text-sm">Amount</p>
              <p className="text-primary text-3xl font-bold">${amount}</p>
            </div>
            {checkoutUrl && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open(checkoutUrl, '_blank')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Payment Page
              </Button>
            )}
            <Button
              className="w-full"
              onClick={() => {
                setShowPaymentDialog(false);
                setCheckoutUrl(null);
                fetchWalletData({ silent: true });
              }}
            >
              I've Completed Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Binance Payment Dialog */}
      <BinancePaymentDialog
        open={showBinanceDialog}
        onOpenChange={(open) => {
          setShowBinanceDialog(open);
          if (!open) fetchPendingBinance();
        }}
        paymentId={binancePaymentId || ''}
        amount={binanceAmount}
        mode={binanceDialogMode}
        existingOrderId={binanceExistingOrderId}
        onSuccess={() => {
          setShowBinanceDialog(false);
          setBinancePaymentId(null);
          setBinanceAmount(0);
          setAmount('');
          fetchWalletData({ silent: true });
          fetchPendingBinance();
          toast.success('Payment verified! Your balance has been credited.');
        }}
      />
    </div>
  );
}
