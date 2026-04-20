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
  DialogDescription,
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
} from 'lucide-react';
import { toast } from 'sonner';
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
  GatewayInfo,
  PaymentGateway,
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

  // Add funds state
  const [amount, setAmount] = useState('');
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway>('STRIPE');
  const [paygateProvider, setPaygateProvider] = useState<PaygateProvider>('multi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');

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
        // Set default gateway to first enabled one
        const enabledGateway = gatewaysRes.value.find(g => g.enabled);
        if (enabledGateway) {
          setSelectedGateway(enabledGateway.gateway);
        }
      } else {
        // Fallback to default gateways if API returns empty
        const defaultGateways: GatewayInfo[] = [
          { gateway: 'STRIPE', name: 'Stripe', enabled: true, minAmount: 5, maxAmount: 10000, currencies: ['USD'] },
          { gateway: 'PAYGATE', name: 'PayGate', enabled: true, minAmount: 10, maxAmount: 5000, currencies: ['USD'] },
          { gateway: 'PLISIO', name: 'Plisio (Crypto)', enabled: true, minAmount: 10, maxAmount: 10000, currencies: ['USD'] },
          { gateway: 'CRYPTOMUS', name: 'Cryptomus', enabled: true, minAmount: 10, maxAmount: 10000, currencies: ['USD'] },
          { gateway: 'NOWPAYMENTS', name: 'NOWPayments', enabled: true, minAmount: 10, maxAmount: 10000, currencies: ['USD'] },
        ];
        setGateways(defaultGateways);
        setSelectedGateway('STRIPE');
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

  // Refetch when filters change
  useEffect(() => {
    if (!isLoading) {
      fetchTransactions(1, false);
    }
  }, [typeFilter, statusFilter]);

  // Handle add funds
  const handleAddFunds = async () => {
    const numAmount = parseFloat(amount);

    if (!amount || isNaN(numAmount)) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!isValidAmount(numAmount)) {
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

      if (response.checkoutUrl) {
        setCheckoutUrl(response.checkoutUrl);
        setShowPaymentDialog(true);
        // Open in new tab
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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Wallet</h1>
          <p className="text-muted-foreground mt-1">
            Manage your balance and transactions
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchWalletData}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Add Funds Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Add Funds</CardTitle>
            <CardDescription>Top up your wallet balance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount (USD)</label>
              <div className="relative">
                <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2">
                  $
                </span>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-7"
                  min={MIN_AMOUNT}
                  max={MAX_AMOUNT}
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {PRESET_AMOUNTS.map((value) => (
                  <Button
                    key={value}
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(value.toString())}
                  >
                    ${value}
                  </Button>
                ))}
              </div>
              <p className="text-muted-foreground text-xs">
                Min: ${MIN_AMOUNT} • Max: ${MAX_AMOUNT.toLocaleString()}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Method</label>
              <Select
                value={selectedGateway}
                onValueChange={(v) => setSelectedGateway(v as PaymentGateway)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {gateways.length > 0 ? (
                    gateways.map((gateway) => (
                      <SelectItem 
                        key={gateway.gateway} 
                        value={gateway.gateway}
                        disabled={!gateway.enabled}
                      >
                        <span className="flex items-center gap-2">
                          <span>{getGatewayIcon(gateway.gateway)}</span>
                          <span>{gateway.name || getGatewayName(gateway.gateway)}</span>
                          {gateway.minAmount > 0 && (
                            <span className="text-muted-foreground text-xs">
                              (min ${gateway.minAmount})
                            </span>
                          )}
                          {!gateway.enabled && (
                            <span className="text-muted-foreground text-xs">(unavailable)</span>
                          )}
                        </span>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="STRIPE">
                      <span className="flex items-center gap-2">
                        <span>{getGatewayIcon('STRIPE')}</span>
                        <span>Stripe</span>
                      </span>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* PayGate Provider Selection */}
            {selectedGateway === 'PAYGATE' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Provider</label>
                <Select
                  value={paygateProvider}
                  onValueChange={(v) => setPaygateProvider(v as PaygateProvider)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYGATE_PROVIDERS.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        <div className="flex flex-col">
                          <span className="flex items-center gap-2">
                            {provider.name}
                            {provider.recommended && (
                              <Badge variant="secondary" className="text-xs">
                                Recommended
                              </Badge>
                            )}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {provider.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Coupon Code (optional)</label>
              <Input
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={handleAddFunds}
              disabled={isProcessing || wallet?.isLocked}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : wallet?.isLocked ? (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Wallet Locked
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Funds
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Balance Card */}
        <Card>
          <CardHeader>
            <CardTitle>Current Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <p className="text-primary text-4xl font-bold">
                  {wallet ? formatBalance(wallet.balance, wallet.currency) : '$0.00'}
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  {wallet?.isLocked ? (
                    <span className="text-destructive flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      Wallet locked: {wallet.lockedReason}
                    </span>
                  ) : (
                    'Available balance'
                  )}
                </p>
              </div>

              <div className="border-border space-y-3 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Spent</span>
                  <span className="font-medium">
                    {wallet ? formatBalance(wallet.totalSpent, wallet.currency) : '$0.00'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Deposited</span>
                  <span className="font-medium">
                    {wallet ? formatBalance(wallet.totalDeposited, wallet.currency) : '$0.00'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Refunded</span>
                  <span className="font-medium">
                    {wallet ? formatBalance(wallet.totalRefunded, wallet.currency) : '$0.00'}
                  </span>
                </div>
                {membership?.currentPlan && membership.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Savings ({membership.currentPlan.name} {membership.discount}%)
                    </span>
                    <span className="text-success font-medium">
                      {wallet ? formatBalance(wallet.totalBonus, wallet.currency) : '$0.00'}
                    </span>
                  </div>
                )}
              </div>
            </div>
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

              {/* Load More */}
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

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Your Payment</DialogTitle>
            <DialogDescription>
              A new window has been opened for you to complete the payment.
              Once completed, your balance will be updated automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted rounded-lg p-4 text-center">
              <p className="text-muted-foreground text-sm">Amount</p>
              <p className="text-2xl font-bold">${amount}</p>
              <p className="text-muted-foreground text-sm">
                via {getGatewayName(selectedGateway)}
              </p>
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
                setAmount('');
                fetchWalletData();
              }}
            >
              I've Completed Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
