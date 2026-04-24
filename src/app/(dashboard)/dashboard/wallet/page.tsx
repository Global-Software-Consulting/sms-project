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
  Bitcoin,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { BinancePaymentDialog } from '@/components/payments/BinancePaymentDialog';
import {
  getWallet,
  getTransactions,
  formatBalance,
  getTransactionTypeLabel,
  getTransactionTypeColor,
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
  PRESET_AMOUNTS,
  MIN_AMOUNT,
  MAX_AMOUNT,
  isValidAmount,
  getGatewayName,
  getGatewayIcon,
  PAYGATE_PROVIDERS,
  PaygateProvider,
} from '@/lib/api/paymentsApi';
import { getCurrentMembership, CurrentMembershipResponse } from '@/lib/api/membershipApi';

type DepositStep = 'amount' | 'methods' | 'paygate-providers' | 'summary';

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

  // Deposit modal state
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositStep, setDepositStep] = useState<DepositStep>('amount');
  const [amount, setAmount] = useState('');
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);
  const [paygateProvider, setPaygateProvider] = useState<PaygateProvider>('multi');
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
          { gateway: 'STRIPE', name: 'Stripe', enabled: true, minAmount: 5, maxAmount: 10000, currencies: ['USD'] },
          { gateway: 'PAYGATE', name: 'PayGate', enabled: true, minAmount: 10, maxAmount: 5000, currencies: ['USD'] },
          { gateway: 'PLISIO', name: 'Plisio (Crypto)', enabled: true, minAmount: 10, maxAmount: 10000, currencies: ['USD'] },
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

  // Reset deposit modal state
  const resetDepositModal = () => {
    setDepositStep('amount');
    setAmount('');
    setSelectedGateway(null);
    setPaygateProvider('multi');
    setCouponCode('');
    setPaymentPreview(null);
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

  // Handle amount continue
  const handleAmountContinue = () => {
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || !isValidAmount(numAmount)) {
      toast.error(`Please enter a valid amount between $${MIN_AMOUNT} and $${MAX_AMOUNT.toLocaleString()}`);
      return;
    }
    setDepositStep('methods');
  };

  // Handle gateway selection
  const handleGatewaySelect = (gateway: GatewayInfo) => {
    setSelectedGateway(gateway.gateway);
    if (gateway.gateway === 'PAYGATE') {
      setDepositStep('paygate-providers');
    } else {
      setDepositStep('summary');
    }
  };

  // Handle PayGate provider selection
  const handlePaygateProviderSelect = (provider: PaygateProvider) => {
    setPaygateProvider(provider);
    setDepositStep('summary');
  };

  // Handle payment confirmation
  const handleConfirmPayment = async () => {
    if (!selectedGateway) return;
    
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || !isValidAmount(numAmount)) {
      toast.error(`Amount must be between $${MIN_AMOUNT} and $${MAX_AMOUNT.toLocaleString()}`);
      return;
    }

    try {
      setIsProcessing(true);

      const response = await createPayment({
        amount: numAmount,
        gateway: selectedGateway,
        paygateProvider: selectedGateway === 'PAYGATE' ? paygateProvider : undefined,
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

  // Get enabled gateways for current amount
  const getAvailableGateways = () => {
    const numAmount = parseFloat(amount) || 0;
    return gateways.filter(g => g.enabled && numAmount >= g.minAmount);
  };

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

      {/* Deposit Modal - CheapStreamTV Style */}
      <Dialog open={showDepositModal} onOpenChange={setShowDepositModal}>
        <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden">
          {/* Modal Header */}
          <DialogHeader className="p-6 pb-4 border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold">Add Funds</DialogTitle>
            </div>
          </DialogHeader>

          <div className="p-6">
            {/* Step: Amount Input */}
            {depositStep === 'amount' && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground">Amount ($)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-semibold text-muted-foreground">
                      $
                    </span>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-9 h-14 text-xl font-semibold border-2 focus:border-primary"
                      min={MIN_AMOUNT}
                      max={MAX_AMOUNT}
                      autoFocus
                    />
                  </div>
                  
                  {/* Preset Amounts */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {PRESET_AMOUNTS.map((value) => (
                      <Button
                        key={value}
                        variant={amount === value.toString() ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAmount(value.toString())}
                        className="flex-1 min-w-[70px]"
                      >
                        ${value}
                      </Button>
                    ))}
                  </div>

                  {/* Validation Message */}
                  {amount && parseFloat(amount) >= MIN_AMOUNT && (
                    <p className="text-sm text-success flex items-center gap-1.5 mt-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Amount is valid! Select a payment method below.
                    </p>
                  )}
                  {amount && parseFloat(amount) > 0 && parseFloat(amount) < MIN_AMOUNT && (
                    <p className="text-sm text-destructive mt-2">
                      Minimum amount is ${MIN_AMOUNT}
                    </p>
                  )}
                </div>

                {/* Coupon Code */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Coupon Code (optional)</label>
                  <Input
                    placeholder="Enter coupon code for bonus"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="h-12"
                  />
                </div>

                <Button
                  className="w-full h-12 text-base font-semibold"
                  onClick={handleAmountContinue}
                  disabled={!amount || parseFloat(amount) < MIN_AMOUNT}
                >
                  Continue
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Step: Payment Methods */}
            {depositStep === 'methods' && (
              <div className="space-y-4">
                <button
                  onClick={() => setDepositStep('amount')}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Change Amount (${parseFloat(amount).toFixed(2)})
                </button>

                <p className="text-sm font-medium text-muted-foreground">Select Payment Method</p>

                <div className="space-y-3">
                  {getAvailableGateways().length > 0 ? (
                    getAvailableGateways().map((gateway) => (
                      <button
                        key={gateway.gateway}
                        onClick={() => handleGatewaySelect(gateway)}
                        className="w-full p-4 rounded-xl border-2 border-border hover:border-primary/50 bg-card hover:bg-muted/50 transition-all text-left group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {gateway.imageUrl ? (
                              <img 
                                src={gateway.imageUrl} 
                                alt={gateway.name} 
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl">
                                {getGatewayIcon(gateway.gateway)}
                              </div>
                            )}
                            <div>
                              <p className="font-semibold group-hover:text-primary transition-colors">
                                {gateway.name || getGatewayName(gateway.gateway)}
                              </p>
                              {gateway.description && (
                                <p className="text-muted-foreground text-xs mt-0.5">{gateway.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-primary">
                              ${parseFloat(amount).toFixed(2)}
                            </p>
                            {gateway.minAmount > 0 && (
                              <p className="text-muted-foreground text-xs">
                                min ${gateway.minAmount}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-6 rounded-xl border border-dashed text-center">
                      <p className="text-muted-foreground text-sm">
                        No payment methods available for this amount.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step: PayGate Providers */}
            {depositStep === 'paygate-providers' && (
              <div className="space-y-4">
                <button
                  onClick={() => setDepositStep('methods')}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Change Payment Method
                </button>

                <p className="text-sm font-medium text-muted-foreground">Select Card Provider</p>

                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                  {PAYGATE_PROVIDERS.map((provider) => {
                    const isDisabled = parseFloat(amount) < provider.minAmount;
                    return (
                      <button
                        key={provider.id}
                        onClick={() => !isDisabled && handlePaygateProviderSelect(provider.id)}
                        disabled={isDisabled}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          isDisabled 
                            ? 'opacity-50 cursor-not-allowed border-border' 
                            : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold flex items-center gap-2 flex-wrap">
                              {provider.name}
                              {provider.recommended && (
                                <Badge variant="secondary" className="text-[10px]">
                                  Recommended
                                </Badge>
                              )}
                            </p>
                            <p className="text-muted-foreground text-xs mt-1 line-clamp-2">
                              {provider.description}
                            </p>
                            {provider.minAmount > 0 && (
                              <p className="text-muted-foreground text-xs mt-1">
                                Min ${provider.minAmount}
                              </p>
                            )}
                          </div>
                          <CreditCard className="h-6 w-6 text-primary/60 flex-shrink-0" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step: Payment Summary */}
            {depositStep === 'summary' && selectedGateway && (
              <div className="space-y-6">
                <button
                  onClick={() => setDepositStep(selectedGateway === 'PAYGATE' ? 'paygate-providers' : 'methods')}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Change Payment Method
                </button>

                <div className="space-y-4">
                  <p className="text-sm font-medium text-muted-foreground">Payment Summary</p>
                  
                  <div className="p-4 rounded-xl bg-muted/50 border space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Method</span>
                      <span className="font-medium">
                        {getGatewayName(selectedGateway)}
                        {selectedGateway === 'PAYGATE' && (
                          <span className="text-muted-foreground ml-1">
                            ({PAYGATE_PROVIDERS.find(p => p.id === paygateProvider)?.name || paygateProvider})
                          </span>
                        )}
                      </span>
                    </div>

                    {isLoadingPreview ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      </div>
                    ) : paymentPreview ? (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Deposit Amount</span>
                          <span className="font-medium">${paymentPreview.requestedAmount.toFixed(2)}</span>
                        </div>
                        {paymentPreview.fee > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Processing Fee</span>
                            <span className={paymentPreview.feePassToUser ? '' : 'text-success'}>
                              {paymentPreview.feePassToUser 
                                ? `+$${paymentPreview.fee.toFixed(2)}` 
                                : `$${paymentPreview.fee.toFixed(2)} (covered)`}
                            </span>
                          </div>
                        )}
                        <div className="border-t pt-3 flex justify-between font-semibold">
                          <span>Total to Pay</span>
                          <span className="text-lg text-primary">
                            ${paymentPreview.totalCharge.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">You'll Receive</span>
                          <span className="text-success font-medium">
                            ${paymentPreview.amountCredited.toFixed(2)}
                          </span>
                        </div>
                        {couponCode && (
                          <p className="text-xs text-muted-foreground italic pt-2 border-t">
                            Coupon "{couponCode}" will be applied during payment
                          </p>
                        )}
                      </>
                    ) : (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Deposit Amount</span>
                        <span className="font-medium text-lg text-primary">
                          ${parseFloat(amount).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  className="w-full h-12 text-base font-semibold"
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
