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
} from '@/lib/api/paymentsApi';
import { getCurrentMembership, CurrentMembershipResponse } from '@/lib/api/membershipApi';
import { validateCoupon, CouponValidationResult } from '@/lib/api/couponsApi';

export default function WalletPage() {
  // Wallet state
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [membership, setMembership] = useState<CurrentMembershipResponse | null>(null);
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
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'all'>('all');

  // Coupon validation state
  const [couponValidation, setCouponValidation] = useState<CouponValidationResult | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Deposit modal state
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);
  const [selectedPaygateProvider, setSelectedPaygateProvider] = useState<PaygateProvider | null>(null);
  const [showPaygateProviders, setShowPaygateProviders] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [paymentPreview, setPaymentPreview] = useState<PaymentPreviewResponse | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  
  // Payment completion state
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  
  // Binance payment state
  const [showBinanceDialog, setShowBinanceDialog] = useState(false);
  const [binancePaymentId, setBinancePaymentId] = useState<string | null>(null);

  // Fetch wallet data
  const fetchWalletData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [walletRes, transactionsRes, membershipRes, gatewaysRes] = await Promise.allSettled([
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

      if (gatewaysRes.status === 'fulfilled' && gatewaysRes.value.length > 0) {
        setGateways(gatewaysRes.value);
      } else {
        const defaultGateways: GatewayInfo[] = [
          { gateway: 'STRIPE', name: 'Stripe', enabled: true, minAmount: 1, maxAmount: 10000, currencies: ['USD'] },
          { gateway: 'PAYGATE', name: 'PayGate Card Getaways', enabled: true, minAmount: 1, maxAmount: 5000, currencies: ['USD'] },
          { gateway: 'PLISIO', name: 'Crypto Plisio', enabled: true, minAmount: 1, maxAmount: 10000, currencies: ['USD'] },
          { gateway: 'CRYPTOMUS', name: 'Cryptomus', enabled: true, minAmount: 10, maxAmount: 10000, currencies: ['USD'] },
          { gateway: 'NOWPAYMENTS', name: 'NOWPayments', enabled: true, minAmount: 10, maxAmount: 10000, currencies: ['USD'] },
        ];
        setGateways(defaultGateways);
      }
    } catch (err) {
      console.error('Failed to fetch wallet data:', err);
      setError('Failed to load wallet data. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch transactions with filters
  const fetchTransactions = useCallback(async (pageNum: number, append: boolean = false) => {
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
        setTransactions(prev => [...prev, ...response.data]);
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
  }, [typeFilter, statusFilter]);

  // Initial load
  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

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
    if (!couponCode || couponCode.length < 3 || !numAmount || numAmount < MIN_AMOUNT) {
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
    const providerInfo = PAYGATE_PROVIDERS.find(p => p.id === provider);
    
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
      toast.error(`Amount must be between $${MIN_AMOUNT} and $${MAX_AMOUNT.toLocaleString()}`);
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
        paygateProvider: selectedGateway === 'PAYGATE' ? selectedPaygateProvider! : undefined,
        successUrl: `${window.location.origin}/dashboard/wallet?payment=success`,
        cancelUrl: `${window.location.origin}/dashboard/wallet?payment=cancelled`,
        ...(couponCode ? { couponCode } : {}),
      });

      // Close deposit modal
      closeDepositModal();

      // Handle Binance payments differently
      if (selectedGateway === 'BINANCE') {
        setBinancePaymentId(response.paymentId);
        setShowBinanceDialog(true);
        toast.info('Please complete the Binance transfer and enter your Order ID');
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
  const showPaymentSummary = selectedGateway && (
    (selectedGateway !== 'PAYGATE') || 
    (selectedGateway === 'PAYGATE' && selectedPaygateProvider)
  );

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
          <Button onClick={fetchWalletData}>Try Again</Button>
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
          <Button variant="outline" size="sm" onClick={fetchWalletData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Balance and Quick Actions */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Balance Card */}
        <Card className="md:col-span-2 bg-gradient-to-br from-primary/10 via-background to-background border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <p className="text-muted-foreground text-sm font-medium mb-1">Available Balance</p>
                <p className="text-4xl md:text-5xl font-bold text-primary">
                  {wallet ? formatBalance(wallet.balance, wallet.currency) : '$0.00'}
                </p>
                {wallet?.isLocked && (
                  <p className="text-destructive flex items-center gap-1 mt-2 text-sm">
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
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Total Deposited</span>
              <span className="font-semibold text-success">
                {wallet ? formatBalance(wallet.totalDeposited, wallet.currency) : '$0.00'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Total Spent</span>
              <span className="font-semibold">
                {wallet ? formatBalance(wallet.totalSpent, wallet.currency) : '$0.00'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Total Refunded</span>
              <span className="font-semibold">
                {wallet ? formatBalance(wallet.totalRefunded, wallet.currency) : '$0.00'}
              </span>
            </div>
            {membership?.currentPlan && membership.discount > 0 && (
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-muted-foreground text-sm">
                  {membership.currentPlan.name} Savings
                </span>
                <span className="font-semibold text-success">
                  {wallet ? formatBalance(wallet.totalBonus, wallet.currency) : '$0.00'}
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
                onValueChange={(v) => setTypeFilter(v as TransactionType | 'all')}
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
                onValueChange={(v) => setStatusFilter(v as TransactionStatus | 'all')}
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
          {transactions.length === 0 ? (
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
                      <TableHead className="table-hide-mobile">Description</TableHead>
                      <TableHead className="table-hide-tablet">Date</TableHead>
                      <TableHead className="table-hide-mobile">Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((txn) => (
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
                                'USD'
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
                    ))}
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
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-0 gap-0">
          {/* Modal Header */}
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-xl font-bold">Add Funds</DialogTitle>
            <p className="text-muted-foreground text-sm mt-1">
              Enter amount and select your preferred payment method
            </p>
          </DialogHeader>

          <div className="p-6 space-y-6">
            {/* Amount Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Amount ($)</label>
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
                <p className="text-sm text-success flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  Amount is valid! Select a payment method below.
                </p>
              ) : numAmount > 0 ? (
                <p className="text-sm text-muted-foreground">
                  Enter amount above to enable payment methods
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Enter amount above to enable payment methods
                </p>
              )}
            </div>

            {/* Coupon Code - Always visible, right after amount like CheapStreamTV */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Coupon Code (optional)</label>
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
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
                {!isValidatingCoupon && couponValidation?.valid && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-success" />
                )}
                {!isValidatingCoupon && couponValidation && !couponValidation.valid && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
                )}
              </div>
              {/* Coupon validation message */}
              {couponValidation && (
                <p className={`text-sm ${couponValidation.valid ? 'text-success' : 'text-destructive'}`}>
                  {couponValidation.valid 
                    ? `Coupon valid! You'll get +$${couponValidation.discount.toFixed(2)} bonus (${couponValidation.coupon?.type === 'PERCENTAGE' ? `${couponValidation.coupon.value}%` : `$${couponValidation.coupon?.value}`})`
                    : couponValidation.message || 'Invalid coupon code'
                  }
                </p>
              )}
            </div>

            {/* Payment Methods Grid - Always Visible */}
            {!showPaygateProviders && (
              <div className="grid grid-cols-3 gap-3">
                {gateways.filter(g => g.enabled).map((gateway) => {
                  const isDisabled = numAmount < gateway.minAmount;
                  const needsMore = gateway.minAmount - numAmount;
                  
                  return (
                    <button
                      key={gateway.gateway}
                      onClick={() => handleGatewaySelect(gateway)}
                      disabled={isDisabled}
                      className={`relative p-4 rounded-xl border-2 transition-all text-center flex flex-col items-center justify-center min-h-[120px] ${
                        selectedGateway === gateway.gateway && !showPaygateProviders
                          ? 'border-primary bg-primary/5'
                          : isDisabled
                            ? 'border-border/50 opacity-60 cursor-not-allowed'
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
                          <div className="h-10 flex items-center justify-center">
                            <svg viewBox="0 0 60 25" className="h-6 w-auto fill-current">
                              <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.02 1.04-.06 1.48zm-6.3-5.63c-1.03 0-2.07.73-2.27 2.59h4.46c-.03-1.67-.82-2.59-2.19-2.59zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02c.58-.68 1.8-1.34 3.45-1.34 3.38 0 5.47 3.03 5.47 7.43 0 5.2-2.54 7.62-5.72 7.62zm-.8-11.23c-1.03 0-1.76.55-2.12 1.05l-.02 5.44c.32.45 1.06 1.01 2.1 1.01 1.59 0 2.59-1.72 2.59-3.79 0-2.04-.95-3.71-2.55-3.71zm-8.24-3.57v14.79h-4.14V5.5h4.14zm0-4.65L27.77.92v3.26l4.14-.87v-.43zM18.69 7.27c-.4-.11-.89-.17-1.45-.17-1.67 0-2.82.77-3.47 1.68v-3.21h-4.14v14.72h4.14v-7.77c.6-.97 1.71-1.66 3.07-1.66.51 0 .96.06 1.41.17l.44-3.76zM5.92 14.99c0 .75.45.97 1.32.97.52 0 1.05-.08 1.42-.21v3.11c-.79.4-1.85.64-3.08.64-3.04 0-3.8-1.58-3.8-3.79V8.87H0V5.57h1.78V2.32l4.14-.87v4.12h2.76v3.3H5.92v6.12z" />
                            </svg>
                          </div>
                        ) : (
                          <span className="text-3xl">{getGatewayIcon(gateway.gateway)}</span>
                        )}
                      </div>
                      
                      {/* Gateway Name */}
                      <p className="font-medium text-sm">
                        {gateway.name || getGatewayName(gateway.gateway)}
                      </p>
                      
                      {/* Price or "Need more" message */}
                      {isDisabled ? (
                        <p className="text-xs text-destructive mt-1">
                          Need ${needsMore.toFixed(2)} more
                        </p>
                      ) : numAmount > 0 ? (
                        <p className="text-sm font-semibold text-primary mt-1">
                          ${numAmount.toFixed(2)}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-1">
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
                  className="flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Change Payment Method
                </button>

                <div>
                  <h3 className="text-lg font-semibold mb-1">Select Payment Provider</h3>
                  <p className="text-muted-foreground text-sm">Choose how you want to pay with PayGate</p>
                </div>

                {/* Card Payments Header */}
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <CreditCard className="h-4 w-4 text-yellow-500" />
                  Card Payments
                </div>

                {/* Providers Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PAYGATE_PROVIDERS.map((provider) => {
                    const isDisabled = numAmount < provider.minAmount;
                    const needsMore = provider.minAmount - numAmount;
                    const isSelected = selectedPaygateProvider === provider.id;
                    
                    return (
                      <button
                        key={provider.id}
                        onClick={() => handlePaygateProviderSelect(provider.id)}
                        disabled={isDisabled}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : isDisabled
                              ? 'border-border/50 opacity-60 cursor-not-allowed'
                              : 'border-border hover:border-primary/50 hover:bg-muted/30'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold flex items-center gap-2 flex-wrap">
                              {provider.name}
                              {provider.recommended && (
                                <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">
                                  Recommended
                                </Badge>
                              )}
                            </p>
                            <p className="text-muted-foreground text-xs mt-1 line-clamp-2">
                              {provider.description}
                            </p>
                            
                            {/* Min amount / Need more */}
                            {isDisabled ? (
                              <p className="text-xs text-destructive mt-2">
                                You need ${needsMore.toFixed(2)} more for
                              </p>
                            ) : (
                              <p className="text-xs text-primary mt-2">
                                Min:: ${provider.minAmount}
                              </p>
                            )}
                          </div>
                          
                          {/* Icon */}
                          {provider.id === 'multi' ? (
                            <Globe className="h-8 w-8 text-primary/60 flex-shrink-0" />
                          ) : (
                            <CreditCard className="h-8 w-8 text-yellow-500/60 flex-shrink-0" />
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
              <div className="border-t pt-4 mt-4">
                <div className="bg-muted/30 rounded-xl p-4 space-y-3">
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
                    
                    {selectedGateway === 'PAYGATE' && selectedPaygateProvider && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Provider:</span>
                        <span className="font-medium text-primary">
                          {PAYGATE_PROVIDERS.find(p => p.id === selectedPaygateProvider)?.name}
                          {PAYGATE_PROVIDERS.find(p => p.id === selectedPaygateProvider)?.recommended && (
                            <span className="text-muted-foreground ml-1">(Recommended)</span>
                          )}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Deposit Amount:</span>
                      <span className="font-medium">${numAmount.toFixed(2)}</span>
                    </div>

                    {/* Coupon Bonus - Show if valid coupon applied */}
                    {couponValidation?.valid && couponValidation.discount > 0 && (
                      <div className="flex justify-between text-success">
                        <span>Coupon Bonus ({couponCode}):</span>
                        <span className="font-medium">+${couponValidation.discount.toFixed(2)}</span>
                      </div>
                    )}

                    {/* Total to receive */}
                    <div className="flex justify-between pt-2 border-t border-border/50">
                      <span className="text-muted-foreground">You'll Receive:</span>
                      <span className="font-semibold text-lg text-primary">
                        ${(numAmount + (couponValidation?.valid ? couponValidation.discount : 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Confirm Button */}
                  <Button
                    className="w-full h-12 text-base font-semibold mt-2"
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
                    className="w-full text-center text-sm text-muted-foreground hover:text-foreground py-2"
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
              A new window has been opened for you to complete the payment.
              Once completed, your balance will be updated automatically.
            </p>
            <div className="p-4 rounded-xl bg-muted/50 text-center">
              <p className="text-muted-foreground text-sm">Amount</p>
              <p className="text-3xl font-bold text-primary">${amount}</p>
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
                fetchWalletData();
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
        onOpenChange={setShowBinanceDialog}
        paymentId={binancePaymentId || ''}
        amount={parseFloat(amount) || 0}
        onSuccess={() => {
          setShowBinanceDialog(false);
          setBinancePaymentId(null);
          setAmount('');
          fetchWalletData();
          toast.success('Payment verified! Your balance has been credited.');
        }}
      />
    </div>
  );
}
