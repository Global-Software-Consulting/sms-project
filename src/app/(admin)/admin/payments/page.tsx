'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Edit2,
  Trash2,
  Plus,
  Grip,
  CreditCard,
  Bitcoin,
  Search,
  Eye,
  DollarSign,
  Save,
  Loader2,
  RefreshCw,
  Wallet,
  Upload,
  X,
  Image as ImageIcon,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Clock,
  Shield,
  Activity,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getPaymentGateways,
  updatePaymentGateway,
  togglePaymentGateway,
  seedPaymentGateways,
  getPaygateProviders,
  togglePaygateProvider,
  updatePaygateProvider,
  reorderPaygateProviders,
  seedPaygateProviders,
  getAdminWallets,
  creditUserWallet,
  debitUserWallet,
  bulkUpdateSettings,
  getPaymentGuide,
  PaymentGatewayConfig,
  PaygateProvider,
  AdminWallet,
  PaymentGatewayType,
  getBinanceSessionStatus,
  getBinanceStatistics,
  getBinancePendingVerifications,
  getBinanceVerificationHistory,
  getBinanceAuditLogs,
  adminVerifyBinancePayment,
  adminRejectBinanceVerification,
  invalidateBinanceSession,
  getBinanceFailedVerifications,
  adminResetBinanceVerification,
  BinanceSessionStatus,
  BinanceStatistics,
  BinancePendingVerification,
  BinanceVerificationHistory,
  BinanceAuditLog,
  BinanceFailedVerification,
} from '@/lib/api/adminModulesApi';
import { uploadFile } from '@/lib/api/storageApi';
import { GatewayWebhookUrls } from '@/components/admin/gateway-webhook-urls';

export default function AdminPaymentsPage() {
  const [activeTab, setActiveTab] = useState<
    'methods' | 'paygate' | 'card' | 'guide' | 'balances' | 'binance'
  >('methods');

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Payment Methods State
  const [paymentMethods, setPaymentMethods] = useState<PaymentGatewayConfig[]>(
    [],
  );
  const [showEditMethodModal, setShowEditMethodModal] = useState(false);
  const [selectedMethod, setSelectedMethod] =
    useState<PaymentGatewayConfig | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [bonusRules, setBonusRules] = useState<
    { minAmount: number; bonusPercent: number }[]
  >([]);
  const [methodFormData, setMethodFormData] = useState({
    displayName: '',
    description: '',
    type: 'crypto',
    isEnabled: true,
    minAmount: 1,
    bonusSettings: '',
    polygonWallet: '',
    serviceFee: '',
    feeFixed: 0,
    feePercent: 0,
    serviceFeeEnabled: false,
    serviceFeeType: 'percentage' as 'percentage' | 'fixed',
    imageUrl: '',
    // Gateway-specific API settings
    settings: {
      // Stripe
      stripeSecretKey: '',
      stripePublishableKey: '',
      stripeWebhookSecret: '',
      stripeAllowedIps: [] as string[],
      // Plisio
      plisioApiKey: '',
      plisioApiSecret: '',
      // Cryptomus
      cryptomusMerchantId: '',
      cryptomusApiKey: '',
      // NOWPayments
      nowpaymentsApiKey: '',
      nowpaymentsIpnSecret: '',
      // PayGate
      paygateWalletAddress: '',
      paygateApiKey: '',
      // Volet
      voletApiKey: '',
      voletSecretKey: '',
      voletMerchantId: '',
      // Binance
      binanceMerchantId: '',
      binanceApiKey: '',
      binanceSecretKey: '',
      binancePayId: '',
    },
  });

  // PayGate Providers State
  const [payGateProviders, setPayGateProviders] = useState<PaygateProvider[]>(
    [],
  );
  const [showEditProviderModal, setShowEditProviderModal] = useState(false);
  const [selectedProvider, setSelectedProvider] =
    useState<PaygateProvider | null>(null);
  const [providerFormData, setProviderFormData] = useState({
    name: '',
    description: '',
    provider: '',
    minAmount: 0,
    maxAmount: 10000,
    sortOrder: 0,
    isEnabled: true,
  });

  // Card Payment State (STRIPE toggle + configuration)
  const [cardPaymentEnabled, setCardPaymentEnabled] = useState(false);
  const [cardPaymentConfig, setCardPaymentConfig] = useState({
    minAmount: 1,
    maxAmount: 1000,
    description: 'Pay securely with your credit or debit card',
  });

  // User Guide State
  const [guideTitle, setGuideTitle] = useState('Payment Information');
  const [guideContent, setGuideContent] = useState('');
  const [guideUpdatedAt, setGuideUpdatedAt] = useState('');

  // User Balances State
  const [userBalances, setUserBalances] = useState<AdminWallet[]>([]);
  const [balanceSearchQuery, setBalanceSearchQuery] = useState('');
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminWallet | null>(null);
  const [balanceFormData, setBalanceFormData] = useState({
    transactionType: 'add' as 'add' | 'deduct',
    amount: '',
    description: '',
  });
  const [balancePage, setBalancePage] = useState(1);
  const [balanceTotal, setBalanceTotal] = useState(0);

  // Binance Admin State
  const [binanceSession, setBinanceSession] =
    useState<BinanceSessionStatus | null>(null);
  const [binanceStats, setBinanceStats] = useState<BinanceStatistics | null>(
    null,
  );
  const [binancePending, setBinancePending] = useState<
    BinancePendingVerification[]
  >([]);
  const [binanceHistory, setBinanceHistory] = useState<
    BinanceVerificationHistory[]
  >([]);
  const [binanceAuditLogs, setBinanceAuditLogs] = useState<BinanceAuditLog[]>(
    [],
  );
  const [binanceFailed, setBinanceFailed] = useState<
    BinanceFailedVerification[]
  >([]);
  const [binanceActiveSubTab, setBinanceActiveSubTab] = useState<
    'session' | 'pending' | 'failed' | 'history' | 'logs'
  >('session');
  const [selectedVerification, setSelectedVerification] =
    useState<BinancePendingVerification | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [verifyTxHash, setVerifyTxHash] = useState('');
  const [verifyNotes, setVerifyNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  // Fetch Payment Gateways
  const fetchPaymentGateways = useCallback(async () => {
    try {
      const response = await getPaymentGateways();
      setPaymentMethods(response.data);

      // Set card payment enabled and config based on STRIPE gateway
      const stripeGateway = response.data.find((g) => g.gateway === 'STRIPE');
      if (stripeGateway) {
        setCardPaymentEnabled(stripeGateway.isEnabled);
        setCardPaymentConfig({
          minAmount: parseFloat(stripeGateway.minAmount) || 1,
          maxAmount: parseFloat(stripeGateway.maxAmount) || 1000,
          description:
            stripeGateway.description ||
            'Pay securely with your credit or debit card',
        });
      }
    } catch (error) {
      console.error('Failed to fetch payment gateways:', error);
      toast.error('Failed to load payment gateways');
    }
  }, []);

  // Fetch PayGate Providers
  const fetchPaygateProviders = useCallback(async () => {
    try {
      const response = await getPaygateProviders();
      setPayGateProviders(response.data);
    } catch (error) {
      console.error('Failed to fetch PayGate providers:', error);
      toast.error('Failed to load PayGate providers');
    }
  }, []);

  // Fetch User Balances
  const fetchUserBalances = useCallback(
    async (search?: string, page: number = 1) => {
      try {
        const response = await getAdminWallets({
          search: search || undefined,
          page,
          limit: 20,
        });
        setUserBalances(response.data);
        setBalanceTotal(response.meta.total);
        setBalancePage(page);
      } catch (error) {
        console.error('Failed to fetch user balances:', error);
        toast.error('Failed to load user balances');
      }
    },
    [],
  );

  // Fetch Payment Guide
  const fetchPaymentGuide = useCallback(async () => {
    try {
      const response = await getPaymentGuide();
      setGuideTitle(response.title);
      setGuideContent(response.content);
      setGuideUpdatedAt(response.updatedAt);
    } catch (error) {
      console.error('Failed to fetch payment guide:', error);
    }
  }, []);

  // Fetch Binance Admin Data
  const fetchBinanceData = useCallback(async () => {
    try {
      const [sessionRes, statsRes, pendingRes, failedRes, historyRes, logsRes] =
        await Promise.all([
          getBinanceSessionStatus(),
          getBinanceStatistics(),
          getBinancePendingVerifications(),
          getBinanceFailedVerifications(),
          getBinanceVerificationHistory(),
          getBinanceAuditLogs(),
        ]);
      setBinanceSession(sessionRes);
      setBinanceStats(statsRes);
      setBinancePending(pendingRes.data);
      setBinanceFailed(failedRes.data);
      setBinanceHistory(historyRes.data);
      setBinanceAuditLogs(logsRes.data);
    } catch (error) {
      console.error('Failed to fetch Binance data:', error);
    }
  }, []);

  // Handle Binance reset (FAILED → PENDING)
  const handleBinanceReset = async (verificationId: string) => {
    try {
      const result = await adminResetBinanceVerification({
        verificationId,
        reason: 'Admin reset for retry',
      });
      if (result.success) {
        toast.success('Verification reset to PENDING. User can retry.');
        await fetchBinanceData();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to reset verification');
    }
  };

  // Handle Binance verify
  const handleBinanceVerify = async () => {
    if (!selectedVerification) return;
    setIsLoading(true);
    try {
      const result = await adminVerifyBinancePayment({
        verificationId: selectedVerification.id,
        txHash: verifyTxHash || undefined,
        notes: verifyNotes || undefined,
      });
      if (result.success) {
        toast.success('Payment verified and balance credited');
        setShowVerifyModal(false);
        setSelectedVerification(null);
        setVerifyTxHash('');
        setVerifyNotes('');
        await fetchBinanceData();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to verify payment');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Binance reject
  const handleBinanceReject = async () => {
    if (!selectedVerification || !rejectReason) return;
    setIsLoading(true);
    try {
      const result = await adminRejectBinanceVerification({
        verificationId: selectedVerification.id,
        reason: rejectReason,
      });
      if (result.success) {
        toast.success('Verification rejected');
        setShowRejectModal(false);
        setSelectedVerification(null);
        setRejectReason('');
        await fetchBinanceData();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to reject verification');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle invalidate Binance session
  const handleInvalidateSession = async () => {
    if (
      !confirm(
        'Are you sure you want to invalidate the Binance session? This will require re-running the bootstrap script.',
      )
    )
      return;
    setIsLoading(true);
    try {
      const result = await invalidateBinanceSession();
      if (result.success) {
        toast.success(result.message);
        await fetchBinanceData();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to invalidate session');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      setIsInitialLoading(true);
      await Promise.all([
        fetchPaymentGateways(),
        fetchPaygateProviders(),
        fetchUserBalances(),
        fetchPaymentGuide(),
        fetchBinanceData(),
      ]);
      setIsInitialLoading(false);
    };
    loadInitialData();
  }, [
    fetchPaymentGateways,
    fetchPaygateProviders,
    fetchUserBalances,
    fetchPaymentGuide,
    fetchBinanceData,
  ]);

  // Seed defaults if no data
  const handleSeedDefaults = async () => {
    setIsLoading(true);
    try {
      await seedPaymentGateways();
      await seedPaygateProviders();
      await fetchPaymentGateways();
      await fetchPaygateProviders();
      toast.success('Default configurations seeded successfully');
    } catch (error) {
      console.error('Failed to seed defaults:', error);
      toast.error('Failed to seed defaults');
    } finally {
      setIsLoading(false);
    }
  };

  // Payment Method Handlers
  const handleEditMethod = (method: PaymentGatewayConfig) => {
    setSelectedMethod(method);
    const settings = method.settings || {};

    // Parse bonus settings into rules array
    const parsedBonusRules: { minAmount: number; bonusPercent: number }[] = [];
    if (method.bonusSettings) {
      try {
        const parsed = JSON.parse(method.bonusSettings);
        if (Array.isArray(parsed)) {
          parsedBonusRules.push(...parsed);
        }
      } catch {
        // If not JSON, try to parse text format like "$100 → 5%"
        const matches = method.bonusSettings.match(
          /\$?(\d+)\s*[→→:]\s*(\d+)%/g,
        );
        if (matches) {
          matches.forEach((match) => {
            const [, amt, pct] = match.match(/\$?(\d+)\s*[→→:]\s*(\d+)%/) || [];
            if (amt && pct) {
              parsedBonusRules.push({
                minAmount: parseInt(amt),
                bonusPercent: parseInt(pct),
              });
            }
          });
        }
      }
    }
    setBonusRules(
      parsedBonusRules.length > 0
        ? parsedBonusRules
        : [{ minAmount: 0, bonusPercent: 0 }],
    );
    setImagePreview(method.imageUrl || null);

    setMethodFormData({
      displayName: method.displayName,
      description: method.description || '',
      type: method.type || 'crypto',
      isEnabled: method.isEnabled,
      minAmount: parseFloat(method.minAmount) || 1,
      bonusSettings: method.bonusSettings || '',
      polygonWallet: method.polygonWallet || '',
      serviceFee: method.serviceFee || '',
      feeFixed: parseFloat(method.feeFixed) || 0,
      feePercent: parseFloat(method.feePercent) || 0,
      serviceFeeEnabled: method.serviceFeeEnabled || false,
      serviceFeeType: parseFloat(method.feeFixed) > 0 ? 'fixed' : 'percentage',
      imageUrl: method.imageUrl || '',
      settings: {
        // Stripe
        stripeSecretKey: settings.stripeSecretKey || '',
        stripePublishableKey: settings.stripePublishableKey || '',
        stripeWebhookSecret: settings.stripeWebhookSecret || '',
        stripeAllowedIps: settings.stripeAllowedIps || [],
        // Plisio
        plisioApiKey: settings.plisioApiKey || '',
        plisioApiSecret: settings.plisioApiSecret || '',
        // Cryptomus
        cryptomusMerchantId: settings.cryptomusMerchantId || '',
        cryptomusApiKey: settings.cryptomusApiKey || '',
        // NOWPayments
        nowpaymentsApiKey: settings.nowpaymentsApiKey || '',
        nowpaymentsIpnSecret: settings.nowpaymentsIpnSecret || '',
        // PayGate
        paygateWalletAddress: settings.paygateWalletAddress || '',
        paygateApiKey: settings.paygateApiKey || '',
        // Volet
        voletApiKey: settings.voletApiKey || '',
        voletSecretKey: settings.voletSecretKey || '',
        voletMerchantId: settings.voletMerchantId || '',
        // Binance
        binanceMerchantId: settings.binanceMerchantId || '',
        binanceApiKey: settings.binanceApiKey || '',
        binanceSecretKey: settings.binanceSecretKey || '',
        binancePayId: settings.binancePayId || '',
      },
    });
    setShowEditMethodModal(true);
  };

  const handleSaveMethod = async () => {
    if (!selectedMethod) return;

    setIsLoading(true);
    try {
      // Build settings object with only non-empty values
      const cleanSettings: Record<string, unknown> = {};
      const settingsKeys = Object.keys(
        methodFormData.settings,
      ) as (keyof typeof methodFormData.settings)[];
      for (const key of settingsKeys) {
        const value = methodFormData.settings[key];
        if (
          value &&
          (typeof value === 'string'
            ? value.trim() !== ''
            : Array.isArray(value)
              ? value.length > 0
              : true)
        ) {
          cleanSettings[key] = value;
        }
      }

      // Serialize bonus rules to JSON string
      const validBonusRules = bonusRules.filter(
        (r) => r.minAmount > 0 || r.bonusPercent > 0,
      );
      const bonusSettingsJson =
        validBonusRules.length > 0
          ? JSON.stringify(validBonusRules)
          : undefined;

      // Calculate fee based on fee type
      const feeFixed =
        methodFormData.serviceFeeType === 'fixed' ? methodFormData.feeFixed : 0;
      const feePercent =
        methodFormData.serviceFeeType === 'percentage'
          ? methodFormData.feePercent
          : 0;

      await updatePaymentGateway(selectedMethod.gateway, {
        displayName: methodFormData.displayName,
        description: methodFormData.description,
        type: methodFormData.type,
        isEnabled: methodFormData.isEnabled,
        minAmount: methodFormData.minAmount,
        bonusSettings: bonusSettingsJson,
        polygonWallet: methodFormData.polygonWallet,
        serviceFee: methodFormData.serviceFee,
        feeFixed: feeFixed,
        feePercent: feePercent,
        serviceFeeEnabled: methodFormData.serviceFeeEnabled,
        imageUrl: methodFormData.imageUrl,
        settings:
          Object.keys(cleanSettings).length > 0 ? cleanSettings : undefined,
      });

      toast.success('Payment method updated successfully!');
      await fetchPaymentGateways();
      setShowEditMethodModal(false);
      setSelectedMethod(null);
    } catch (error) {
      console.error('Failed to update payment method:', error);
      toast.error('Failed to update payment method');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMethod = async (method: PaymentGatewayConfig) => {
    try {
      await togglePaymentGateway(method.gateway, !method.isEnabled);
      toast.success(
        `${method.displayName} ${!method.isEnabled ? 'enabled' : 'disabled'}`,
      );
      await fetchPaymentGateways();
    } catch (error: any) {
      console.error('Failed to toggle payment method:', error);
      toast.error(
        error.response?.data?.message || 'Failed to toggle payment method',
      );
    }
  };

  // PayGate Provider Handlers
  const handleToggleProvider = async (provider: PaygateProvider) => {
    try {
      await togglePaygateProvider(provider.id, !provider.isEnabled);
      toast.success(
        `${provider.name} ${!provider.isEnabled ? 'enabled' : 'disabled'}`,
      );
      await fetchPaygateProviders();
    } catch (error) {
      console.error('Failed to toggle provider:', error);
      toast.error('Failed to toggle provider');
    }
  };

  const handleEditProvider = (provider: PaygateProvider) => {
    setSelectedProvider(provider);
    setProviderFormData({
      name: provider.name,
      description: provider.description || '',
      provider: provider.provider,
      minAmount: Number(provider.minAmount) || 0,
      maxAmount: Number(provider.maxAmount) || 10000,
      sortOrder: Number(provider.sortOrder) || 0,
      isEnabled: provider.isEnabled,
    });
    setShowEditProviderModal(true);
  };

  const handleSaveProvider = async () => {
    if (!selectedProvider) return;

    setIsLoading(true);
    try {
      await updatePaygateProvider(selectedProvider.id, {
        name: providerFormData.name,
        description: providerFormData.description,
        provider: providerFormData.provider,
        minAmount: providerFormData.minAmount,
        maxAmount: providerFormData.maxAmount,
        sortOrder: providerFormData.sortOrder,
        isEnabled: providerFormData.isEnabled,
      });
      toast.success('Provider updated successfully');
      await fetchPaygateProviders();
      setShowEditProviderModal(false);
      setSelectedProvider(null);
    } catch (error) {
      console.error('Failed to update provider:', error);
      toast.error('Failed to update provider');
    } finally {
      setIsLoading(false);
    }
  };

  // Card Payment Toggle (STRIPE)
  const handleToggleCardPayment = async () => {
    try {
      await togglePaymentGateway('STRIPE', !cardPaymentEnabled);
      setCardPaymentEnabled(!cardPaymentEnabled);
      toast.success(
        cardPaymentEnabled ? 'Card payment disabled' : 'Card payment enabled',
      );
    } catch (error: any) {
      console.error('Failed to toggle card payment:', error);
      toast.error(
        error.response?.data?.message || 'Failed to toggle card payment',
      );
    }
  };

  // User Guide Save
  const handleSaveGuide = async () => {
    setIsLoading(true);
    try {
      await bulkUpdateSettings([
        { key: 'payment_guide_title', value: guideTitle },
        { key: 'payment_guide_content', value: guideContent },
        { key: 'payment_guide_updated_at', value: new Date().toISOString() },
      ]);
      toast.success('Guide saved successfully!');
      await fetchPaymentGuide();
    } catch (error) {
      console.error('Failed to save guide:', error);
      toast.error('Failed to save guide');
    } finally {
      setIsLoading(false);
    }
  };

  // User Balance Handlers
  const handleUpdateBalance = (user: AdminWallet) => {
    setSelectedUser(user);
    setBalanceFormData({
      transactionType: 'add',
      amount: '',
      description: '',
    });
    setShowBalanceModal(true);
  };

  const handleSaveBalance = async () => {
    if (!selectedUser || !balanceFormData.amount) return;

    setIsLoading(true);
    try {
      const amount = parseFloat(balanceFormData.amount);

      if (balanceFormData.transactionType === 'add') {
        await creditUserWallet(selectedUser.userId, {
          amount,
          description:
            balanceFormData.description || `Admin credit: $${amount}`,
        });
      } else {
        await debitUserWallet(selectedUser.userId, {
          amount,
          description: balanceFormData.description || `Admin debit: $${amount}`,
        });
      }

      const action =
        balanceFormData.transactionType === 'add'
          ? 'added to'
          : 'deducted from';
      const userName =
        selectedUser.user?.username ||
        selectedUser.user?.firstName ||
        selectedUser.user?.email?.split('@')[0] ||
        'user';
      toast.success(`$${amount.toFixed(2)} ${action} ${userName}'s balance`);

      await fetchUserBalances(balanceSearchQuery, balancePage);
      setShowBalanceModal(false);
      setSelectedUser(null);
    } catch (error: any) {
      console.error('Failed to update balance:', error);
      toast.error(error.response?.data?.message || 'Failed to update balance');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBalanceSearch = () => {
    fetchUserBalances(balanceSearchQuery, 1);
  };

  // Get gateway icon
  const getGatewayIcon = (type: string) => {
    if (type === 'crypto' || type === 'transfer') {
      return <Bitcoin className="h-5 w-5 text-[#F59E0B]" />;
    }
    return <CreditCard className="h-5 w-5 text-[#3B82F6]" />;
  };

  if (isInitialLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-4 lg:p-8">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-[#3B82F6]" />
          <p className="text-[#94A3B8]">Loading payment settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="shrink-0 text-4xl">💳</span>
            <h1 className="text-2xl font-semibold text-white sm:text-3xl">
              Payment Management
            </h1>
          </div>
          <button
            onClick={handleSeedDefaults}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[rgba(255,255,255,0.08)] px-4 py-2 text-base font-medium whitespace-nowrap text-white transition-colors hover:bg-[rgba(255,255,255,0.12)] sm:w-auto sm:text-sm"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Seed Defaults
          </button>
        </div>
        <p className="text-sm text-[#94A3B8]">
          Manage payment gateways, providers, and user balances
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex items-center gap-1 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {[
          { id: 'methods', label: 'Payment Methods' },
          { id: 'paygate', label: 'PayGate Providers' },
          { id: 'card', label: 'Card Payment' },
          { id: 'binance', label: 'Binance' },
          { id: 'guide', label: 'User Guide' },
          { id: 'balances', label: 'Users Balances' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`rounded-lg px-5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-[rgba(59,130,246,0.2)] text-[#3B82F6]'
                : 'text-[#94A3B8] hover:bg-[rgba(255,255,255,0.05)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Payment Methods Tab */}
      {activeTab === 'methods' && (
        <div>
          <div className="mb-6 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                Payment Methods Management
              </h2>
              <span className="text-sm text-[#94A3B8]">
                {paymentMethods.filter((m) => m.isEnabled).length} of{' '}
                {paymentMethods.length} enabled
              </span>
            </div>
          </div>

          {paymentMethods.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(255,255,255,0.05)]">
                <CreditCard className="h-8 w-8 text-[#64748B]" />
              </div>
              <p className="text-lg font-medium text-white">
                No payment methods found
              </p>
              <p className="mt-1 text-sm text-[#94A3B8]">
                Seed default gateways to get started
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id || method.gateway}
                  className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-6 backdrop-blur-xl transition-all hover:border-[rgba(59,130,246,0.5)]"
                >
                  <div className="mb-4 flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[rgba(59,130,246,0.3)] bg-[rgba(59,130,246,0.1)] p-1">
                      {method.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={method.imageUrl}
                          alt={method.displayName}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        getGatewayIcon(method.type)
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-white">
                        {method.displayName}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                          method.isEnabled
                            ? 'bg-[#22C55E]/20 text-[#22C55E]'
                            : 'bg-[#64748B]/20 text-[#64748B]'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            method.isEnabled ? 'bg-[#22C55E]' : 'bg-[#64748B]'
                          }`}
                        />
                        {method.isEnabled ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#64748B]">Gateway:</span>
                      <span className="font-medium text-[#3B82F6]">
                        {method.gateway}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#64748B]">Type:</span>
                      <span className="font-medium text-white capitalize">
                        {method.type}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#64748B]">Min Amount:</span>
                      <span className="font-medium text-white">
                        ${method.minAmount}
                      </span>
                    </div>
                    {method.bonusSettings && (
                      <div className="flex items-start justify-between text-xs">
                        <span className="text-[#64748B]">Bonus:</span>
                        <span className="max-w-[60%] text-right font-medium text-[#22C55E]">
                          {method.bonusSettings}
                        </span>
                      </div>
                    )}
                    {!method.isConfigured && (
                      <div className="text-xs text-[#F59E0B]">
                        ⚠️ Not configured in environment
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditMethod(method)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2563EB]"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleMethod(method)}
                      disabled={!method.isConfigured && !method.isEnabled}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                        method.isEnabled
                          ? 'bg-[#EF4444] hover:bg-[#DC2626]'
                          : 'bg-[#22C55E] hover:bg-[#16A34A]'
                      }`}
                    >
                      {method.isEnabled ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PayGate Providers Tab */}
      {activeTab === 'paygate' && (
        <div>
          <div className="mb-6 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-6 backdrop-blur-xl">
            <h2 className="mb-2 text-xl font-semibold text-white">
              PayGate Provider Configuration
            </h2>
            <div className="flex items-center gap-4 text-xs text-[#94A3B8]">
              <div className="flex items-center gap-2">
                <Grip className="h-4 w-4" />
                <span>Drag and drop to reorder</span>
              </div>
              <div className="flex items-center gap-2">
                <span>•</span>
                <span>Toggle to enable/disable</span>
              </div>
            </div>
          </div>

          {payGateProviders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(255,255,255,0.05)]">
                <Grip className="h-8 w-8 text-[#64748B]" />
              </div>
              <p className="text-lg font-medium text-white">
                No PayGate providers found
              </p>
              <p className="mt-1 text-sm text-[#94A3B8]">
                Configure payment gateway providers to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {payGateProviders
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((provider) => (
                  <div
                    key={provider.id}
                    className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-6 backdrop-blur-xl transition-all hover:border-[rgba(59,130,246,0.5)]"
                  >
                    <div className="flex items-center gap-4">
                      <button className="cursor-move p-2 text-[#64748B] transition-colors hover:text-white">
                        <Grip className="h-5 w-5" />
                      </button>

                      <div className="rounded-lg border border-[rgba(245,158,11,0.3)] bg-[rgba(245,158,11,0.1)] p-3">
                        <CreditCard className="h-5 w-5 text-[#F59E0B]" />
                      </div>

                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-3">
                          <h3 className="text-base font-semibold text-white">
                            {provider.name}
                          </h3>
                          {provider.name.includes('Recommended') && (
                            <span className="rounded bg-[rgba(34,197,94,0.2)] px-2 py-0.5 text-xs font-medium text-[#22C55E]">
                              Recommended
                            </span>
                          )}
                        </div>
                        <p className="mb-2 text-sm text-[#94A3B8]">
                          {provider.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-[#64748B]">
                          <span>Code: {provider.code}</span>
                          <span>Provider: {provider.provider}</span>
                          <span>Min: ${provider.minAmount}</span>
                          <span>Max: ${provider.maxAmount}</span>
                        </div>
                      </div>

                      <div className="rounded-lg border border-[rgba(59,130,246,0.3)] bg-[rgba(59,130,246,0.1)] px-3 py-1.5">
                        <span className="text-sm font-semibold text-[#3B82F6]">
                          #{provider.sortOrder}
                        </span>
                      </div>

                      <button
                        onClick={() => handleEditProvider(provider)}
                        className="rounded-lg border border-[rgba(59,130,246,0.3)] bg-[rgba(59,130,246,0.1)] p-2 text-[#3B82F6] transition-colors hover:bg-[rgba(59,130,246,0.2)]"
                        title="Edit provider"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>

                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={provider.isEnabled}
                          onChange={() => handleToggleProvider(provider)}
                          className="peer sr-only"
                        />
                        <div className="peer h-6 w-11 rounded-full bg-[#64748B] peer-checked:bg-[#3B82F6] peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                      </label>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Card Payment Tab */}
      {activeTab === 'card' && (
        <div className="space-y-6">
          {/* Card Payment Settings Header */}
          <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-6 backdrop-blur-xl">
            <div className="mb-2 flex items-center gap-3">
              <CreditCard className="h-6 w-6 text-[#22C55E]" />
              <h2 className="text-xl font-semibold text-white">
                Card Payment Settings
              </h2>
            </div>
            <p className="text-sm text-[#94A3B8]">
              Manage card payment options and settings
            </p>
          </div>

          {/* Enable Card Payment Toggle */}
          <div className="flex items-center justify-between rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-6 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div
                className={`rounded-full p-3 ${cardPaymentEnabled ? 'bg-[rgba(34,197,94,0.2)]' : 'bg-[rgba(100,116,139,0.2)]'}`}
              >
                <CreditCard
                  className={`h-5 w-5 ${cardPaymentEnabled ? 'text-[#22C55E]' : 'text-[#64748B]'}`}
                />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  Enable Card Payment
                </h3>
                <p className="text-sm text-[#64748B]">
                  Card payment is currently{' '}
                  {cardPaymentEnabled ? 'enabled' : 'disabled'}
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleCardPayment}
              className={`rounded-lg px-6 py-2.5 text-sm font-medium text-white transition-colors ${
                cardPaymentEnabled
                  ? 'bg-[#EF4444] hover:bg-[#DC2626]'
                  : 'bg-[#22C55E] hover:bg-[#16A34A]'
              }`}
            >
              {cardPaymentEnabled ? 'Disable' : 'Enable'}
            </button>
          </div>

          {/* Card Payment Configuration */}
          <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-6 backdrop-blur-xl">
            <h3 className="mb-6 text-lg font-semibold text-white">
              Card Payment Configuration
            </h3>

            <div className="mb-6 grid grid-cols-2 gap-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Minimum Amount
                </label>
                <input
                  type="number"
                  value={cardPaymentConfig.minAmount}
                  onChange={(e) =>
                    setCardPaymentConfig({
                      ...cardPaymentConfig,
                      minAmount: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Maximum Amount
                </label>
                <input
                  type="number"
                  value={cardPaymentConfig.maxAmount}
                  onChange={(e) =>
                    setCardPaymentConfig({
                      ...cardPaymentConfig,
                      maxAmount: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-white">
                Description
              </label>
              <textarea
                value={cardPaymentConfig.description}
                onChange={(e) =>
                  setCardPaymentConfig({
                    ...cardPaymentConfig,
                    description: e.target.value,
                  })
                }
                className="min-h-[100px] w-full resize-none rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                placeholder="Pay securely with your credit or debit card"
              />
            </div>

            <button
              onClick={async () => {
                try {
                  const stripeMethod = paymentMethods.find(
                    (m) => m.gateway === 'STRIPE',
                  );
                  if (stripeMethod) {
                    await updatePaymentGateway('STRIPE', {
                      minAmount: cardPaymentConfig.minAmount,
                      maxAmount: cardPaymentConfig.maxAmount,
                      description: cardPaymentConfig.description,
                    });
                    toast.success('Card payment settings saved');
                    await fetchPaymentGateways();
                  }
                } catch (error) {
                  toast.error('Failed to save settings');
                }
              }}
              className="flex items-center gap-2 rounded-lg bg-[#3B82F6] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2563EB]"
            >
              <Save className="h-4 w-4" />
              Save Settings
            </button>
          </div>
        </div>
      )}

      {/* User Guide Tab */}
      {activeTab === 'guide' && (
        <div>
          <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-8 backdrop-blur-xl">
            <h2 className="mb-2 text-xl font-semibold text-white">
              User Guide Management
            </h2>
            <p className="mb-8 text-sm text-[#94A3B8]">
              Create and manage your payment guide content
            </p>

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Guide Title
                </label>
                <input
                  type="text"
                  value={guideTitle}
                  onChange={(e) => setGuideTitle(e.target.value)}
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(30,41,59,0.8)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                  placeholder="Enter guide title"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Guide Content (HTML)
                </label>
                <textarea
                  value={guideContent}
                  onChange={(e) => setGuideContent(e.target.value)}
                  className="min-h-[300px] w-full resize-none rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(30,41,59,0.8)] px-4 py-3 font-mono text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                  placeholder="Enter guide content (HTML supported)..."
                />
              </div>

              <div className="flex items-center justify-between border-t border-[rgba(255,255,255,0.1)] pt-4">
                <p className="text-xs text-[#64748B]">
                  Last updated:{' '}
                  {guideUpdatedAt
                    ? new Date(guideUpdatedAt).toLocaleString()
                    : 'Never'}
                </p>
                <button
                  onClick={handleSaveGuide}
                  disabled={isLoading}
                  className="flex items-center gap-2 rounded-lg bg-[#3B82F6] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2563EB] disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Guide
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Binance Tab */}
      {activeTab === 'binance' && (
        <div className="space-y-6">
          {/* Binance Payment Settings Header */}
          <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-6 backdrop-blur-xl">
            <div className="mb-2 flex items-center gap-3">
              <span className="text-2xl">🔶</span>
              <h2 className="text-xl font-semibold text-white">
                Binance Payment Settings
              </h2>
            </div>
            <p className="text-sm text-[#94A3B8]">
              Manage Binance internal transfer verification and session settings
            </p>
          </div>

          {/* Sub-tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {[
              { id: 'session', label: 'Session Status', icon: Shield },
              {
                id: 'pending',
                label: `Pending (${binancePending.length})`,
                icon: Clock,
              },
              {
                id: 'failed',
                label: `Failed (${binanceFailed.length})`,
                icon: AlertCircle,
              },
              { id: 'history', label: 'History', icon: Activity },
              { id: 'logs', label: 'Audit Logs', icon: Eye },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() =>
                  setBinanceActiveSubTab(tab.id as typeof binanceActiveSubTab)
                }
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  binanceActiveSubTab === tab.id
                    ? 'bg-[rgba(245,158,11,0.2)] text-[#F59E0B]'
                    : 'text-[#94A3B8] hover:bg-[rgba(255,255,255,0.05)]'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Session Status Sub-tab */}
          {binanceActiveSubTab === 'session' && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Session Status Card */}
              <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-6">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                  <Shield className="h-5 w-5 text-[#F59E0B]" />
                  Session Status
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#94A3B8]">Status</span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        binanceSession?.session?.isValid
                          ? 'bg-[#22C55E]/20 text-[#22C55E]'
                          : 'bg-[#EF4444]/20 text-[#EF4444]'
                      }`}
                    >
                      {binanceSession?.session?.isValid
                        ? '✓ Active'
                        : '✗ Expired'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#94A3B8]">
                      Session Email
                    </span>
                    <span className="text-sm text-white">
                      {binanceSession?.session?.email || 'Not configured'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#94A3B8]">Last Used</span>
                    <span className="text-sm text-white">
                      {binanceSession?.session?.lastUsedAt
                        ? new Date(
                            binanceSession.session.lastUsedAt,
                          ).toLocaleString()
                        : 'Never'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#94A3B8]">
                      Expires (Approx)
                    </span>
                    <span className="text-sm text-white">
                      {binanceSession?.session?.expiresApprox
                        ? new Date(
                            binanceSession.session.expiresApprox,
                          ).toLocaleString()
                        : 'N/A'}
                    </span>
                  </div>
                </div>
                {binanceSession?.bootstrapRequired && (
                  <div className="mt-4 rounded-lg border border-[#F59E0B]/30 bg-[#F59E0B]/10 p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-4 w-4 text-[#F59E0B]" />
                      <div>
                        <p className="text-sm font-medium text-[#F59E0B]">
                          Bootstrap Login Required
                        </p>
                        <p className="mt-1 text-xs text-[#94A3B8]">
                          Run:{' '}
                          <code className="rounded bg-[rgba(0,0,0,0.4)] px-2 py-0.5">
                            npm run binance:bootstrap
                          </code>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <button
                  onClick={handleInvalidateSession}
                  disabled={isLoading || !binanceSession?.session?.isValid}
                  className="mt-4 w-full rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 px-4 py-2 text-sm font-medium text-[#EF4444] transition-colors hover:bg-[#EF4444]/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Invalidate Session
                </button>
              </div>

              {/* Verification Statistics Card */}
              <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-6">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                  <Activity className="h-5 w-5 text-[#3B82F6]" />
                  Verification Statistics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-[rgba(0,0,0,0.3)] p-4">
                    <p className="text-xs text-[#64748B]">Total</p>
                    <p className="text-2xl font-bold text-white">
                      {binanceStats?.total || 0}
                    </p>
                  </div>
                  <div className="rounded-lg border border-[rgba(34,197,94,0.3)] bg-[rgba(34,197,94,0.1)] p-4">
                    <p className="text-xs text-[#22C55E]">Verified</p>
                    <p className="text-2xl font-bold text-[#22C55E]">
                      {binanceStats?.verified || 0}
                    </p>
                  </div>
                  <div className="rounded-lg border border-[rgba(245,158,11,0.3)] bg-[rgba(245,158,11,0.1)] p-4">
                    <p className="text-xs text-[#F59E0B]">Pending</p>
                    <p className="text-2xl font-bold text-[#F59E0B]">
                      {binanceStats?.pending || 0}
                    </p>
                  </div>
                  <div className="rounded-lg border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.1)] p-4">
                    <p className="text-xs text-[#EF4444]">Failed</p>
                    <p className="text-2xl font-bold text-[#EF4444]">
                      {binanceStats?.failed || 0}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-[#94A3B8]">Success Rate</span>
                  <span className="font-medium text-[#22C55E]">
                    {binanceStats?.successRate || 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#94A3B8]">Total Verified Amount</span>
                  <span className="font-medium text-white">
                    ${Number(binanceStats?.totalVerifiedAmount || 0).toFixed(2)}{' '}
                    USDT
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#94A3B8]">Last 24 Hours</span>
                  <span className="font-medium text-white">
                    {binanceStats?.last24Hours || 0} verifications
                  </span>
                </div>
              </div>

              {/* Pay ID Configuration Card */}
              <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-6 lg:col-span-2">
                <h3 className="mb-4 text-lg font-semibold text-white">
                  Current Configuration
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="flex items-center justify-between rounded-lg bg-[rgba(0,0,0,0.3)] p-4">
                    <span className="text-sm text-[#94A3B8]">Pay ID</span>
                    <span className="font-mono text-white">
                      {binanceSession?.payId || 'Not set'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-[rgba(0,0,0,0.3)] p-4">
                    <span className="text-sm text-[#94A3B8]">
                      Auto-Verification
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        binanceSession?.autoVerificationAvailable
                          ? 'bg-[#22C55E]/20 text-[#22C55E]'
                          : 'bg-[#64748B]/20 text-[#64748B]'
                      }`}
                    >
                      {binanceSession?.autoVerificationAvailable
                        ? 'Available'
                        : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-[rgba(0,0,0,0.3)] p-4">
                    <span className="text-sm text-[#94A3B8]">
                      Gateway Configured
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        binanceSession?.isConfigured
                          ? 'bg-[#22C55E]/20 text-[#22C55E]'
                          : 'bg-[#EF4444]/20 text-[#EF4444]'
                      }`}
                    >
                      {binanceSession?.isConfigured ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pending Verifications Sub-tab */}
          {binanceActiveSubTab === 'pending' && (
            <div className="overflow-hidden rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)]">
              <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.1)] p-4">
                <h3 className="font-semibold text-white">
                  Pending Verifications
                </h3>
                <button
                  onClick={fetchBinanceData}
                  className="flex items-center gap-2 rounded-lg bg-[rgba(255,255,255,0.08)] px-3 py-1.5 text-sm text-white transition-colors hover:bg-[rgba(255,255,255,0.12)]"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>
              </div>
              {binancePending.length === 0 ? (
                <div className="p-16 text-center">
                  <CheckCircle className="mx-auto mb-4 h-12 w-12 text-[#22C55E]" />
                  <p className="text-lg font-medium text-white">
                    All caught up!
                  </p>
                  <p className="text-sm text-[#94A3B8]">
                    No pending verifications
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.2)]">
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase">
                          Order ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase">
                          User
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase">
                          Attempts
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase">
                          Created
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                      {binancePending.map((v) => (
                        <tr
                          key={v.id}
                          className="hover:bg-[rgba(255,255,255,0.02)]"
                        >
                          <td className="px-4 py-3 font-mono text-sm text-white">
                            <div>{v.orderId}</div>
                            {v.scraperVerdict && (
                              <div
                                className={`mt-1 text-[10px] font-normal ${
                                  v.scraperVerdict.includes('NOT_FOUND')
                                    ? 'text-[#F87171]'
                                    : v.scraperVerdict.includes('WRONG_AMOUNT')
                                      ? 'text-[#FBBF24]'
                                      : v.scraperVerdict.includes(
                                            'WRONG_CURRENCY',
                                          )
                                        ? 'text-[#FBBF24]'
                                        : v.scraperVerdict.includes(
                                              'WRONG_TYPE',
                                            )
                                          ? 'text-[#F87171]'
                                          : v.scraperVerdict.includes(
                                                'NOT_SUCCESS',
                                              )
                                            ? 'text-[#FBBF24]'
                                            : v.scraperVerdict.includes(
                                                  'NO_SESSION',
                                                )
                                              ? 'text-[#94A3B8]'
                                              : v.scraperVerdict.includes(
                                                    'ERROR',
                                                  )
                                                ? 'text-[#94A3B8]'
                                                : 'text-[#22C55E]'
                                }`}
                              >
                                {v.scraperVerdict}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 font-medium text-white">
                            ${v.amount} {v.currency}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-white">
                              {v.user?.name || 'Unknown'}
                            </div>
                            <div className="text-xs text-[#64748B]">
                              {v.user?.email}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[#94A3B8]">
                            {v.attempts}
                          </td>
                          <td className="px-4 py-3 text-sm text-[#94A3B8]">
                            {new Date(v.createdAt).toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedVerification(v);
                                  setShowVerifyModal(true);
                                }}
                                className="rounded-lg bg-[#22C55E] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#16A34A]"
                              >
                                Verify
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedVerification(v);
                                  setShowRejectModal(true);
                                }}
                                className="rounded-lg bg-[#EF4444] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#DC2626]"
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Failed Sub-tab */}
          {binanceActiveSubTab === 'failed' && (
            <div className="overflow-hidden rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)]">
              <div className="border-b border-[rgba(255,255,255,0.1)] p-4">
                <h3 className="font-semibold text-white">
                  Failed Verifications
                </h3>
                <p className="mt-1 text-sm text-[#94A3B8]">
                  Hit max attempts. Click Reset to let user retry.
                </p>
              </div>
              {binanceFailed.length === 0 ? (
                <div className="p-12 text-center">
                  <CheckCircle className="mx-auto mb-3 h-12 w-12 text-[#10B981]" />
                  <p className="text-white">No failed verifications</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[rgba(15,23,42,0.8)]">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8]">
                          User
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8]">
                          Order ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8]">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8]">
                          Attempts
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8]">
                          Reason
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8]">
                          Updated
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-[#94A3B8]">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                      {binanceFailed.map((v) => (
                        <tr
                          key={v.id}
                          className="hover:bg-[rgba(255,255,255,0.03)]"
                        >
                          <td className="px-4 py-3 text-sm text-white">
                            {v.user?.email || '—'}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-[#94A3B8]">
                            {v.orderId.startsWith('PENDING_') ? '—' : v.orderId}
                          </td>
                          <td className="px-4 py-3 text-sm text-white">
                            ${Number(v.amount).toFixed(2)} {v.currency}
                          </td>
                          <td className="px-4 py-3 text-sm text-[#F87171]">
                            {v.attempts}
                          </td>
                          <td className="px-4 py-3 text-xs text-[#94A3B8]">
                            {v.errorMessage || '—'}
                          </td>
                          <td className="px-4 py-3 text-xs text-[#94A3B8]">
                            {new Date(v.updatedAt).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleBinanceReset(v.id)}
                              className="inline-flex items-center gap-1 rounded-lg bg-[rgba(245,158,11,0.2)] px-3 py-1.5 text-xs font-medium text-[#F59E0B] hover:bg-[rgba(245,158,11,0.3)]"
                            >
                              <RotateCcw className="h-3 w-3" />
                              Reset
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* History Sub-tab */}
          {binanceActiveSubTab === 'history' && (
            <div className="overflow-hidden rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)]">
              <div className="border-b border-[rgba(255,255,255,0.1)] p-4">
                <h3 className="font-semibold text-white">
                  Verification History
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.2)]">
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase">
                        Order ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase">
                        User
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                    {binanceHistory.map((v) => (
                      <tr
                        key={v.id}
                        className="hover:bg-[rgba(255,255,255,0.02)]"
                      >
                        <td className="px-4 py-3 font-mono text-sm text-white">
                          {v.orderId}
                        </td>
                        <td className="px-4 py-3 font-medium text-white">
                          ${v.amount} {v.currency}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-white">
                            {v.user?.name || 'Unknown'}
                          </div>
                          <div className="text-xs text-[#64748B]">
                            {v.user?.email}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                              v.status === 'VERIFIED'
                                ? 'bg-[#22C55E]/20 text-[#22C55E]'
                                : v.status === 'PENDING'
                                  ? 'bg-[#F59E0B]/20 text-[#F59E0B]'
                                  : 'bg-[#EF4444]/20 text-[#EF4444]'
                            }`}
                          >
                            {v.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#94A3B8]">
                          {new Date(v.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {binanceHistory.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-16 text-center">
                          <p className="text-[#94A3B8]">
                            No verification history
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Audit Logs Sub-tab — admin manual actions only */}
          {binanceActiveSubTab === 'logs' && (
            <div className="overflow-hidden rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)]">
              <div className="border-b border-[rgba(255,255,255,0.1)] p-4">
                <h3 className="font-semibold text-white">Audit Logs</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.2)]">
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase">
                        Action
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase">
                        User
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                    {binanceAuditLogs.map((log) => (
                      <tr
                        key={log.id}
                        className="hover:bg-[rgba(255,255,255,0.02)]"
                      >
                        <td className="px-4 py-3 text-sm text-[#94A3B8]">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded px-2 py-1 text-xs font-medium ${
                              log.action.includes('VERIFY')
                                ? 'bg-[#22C55E]/20 text-[#22C55E]'
                                : log.action.includes('REJECT')
                                  ? 'bg-[#EF4444]/20 text-[#EF4444]'
                                  : 'bg-[#F59E0B]/20 text-[#F59E0B]'
                            }`}
                          >
                            {log.action
                              .replace('BINANCE_', '')
                              .replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-white">
                          {log.user?.email || 'System'}
                        </td>
                        <td className="max-w-xs truncate px-4 py-3 font-mono text-xs text-[#94A3B8]">
                          {JSON.stringify(log.details)}
                        </td>
                      </tr>
                    ))}
                    {binanceAuditLogs.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-16 text-center">
                          <p className="text-[#94A3B8]">No audit logs</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Verify Modal */}
      {showVerifyModal && selectedVerification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#0F172A] p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">
              Verify Payment
            </h2>
            <div className="space-y-4">
              <div className="rounded-lg bg-[rgba(0,0,0,0.3)] p-3">
                <p className="text-xs text-[#94A3B8]">Order ID</p>
                <p className="font-mono text-white">
                  {selectedVerification.orderId}
                </p>
              </div>
              <div className="rounded-lg bg-[rgba(0,0,0,0.3)] p-3">
                <p className="text-xs text-[#94A3B8]">Amount</p>
                <p className="font-bold text-white">
                  ${selectedVerification.amount} {selectedVerification.currency}
                </p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Transaction Hash (Optional)
                </label>
                <input
                  type="text"
                  value={verifyTxHash}
                  onChange={(e) => setVerifyTxHash(e.target.value)}
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                  placeholder="Enter tx hash if available"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Notes (Optional)
                </label>
                <textarea
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
                  className="w-full resize-none rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                  rows={2}
                  placeholder="Add any notes..."
                />
              </div>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={handleBinanceVerify}
                disabled={isLoading}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#22C55E] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#16A34A] disabled:opacity-50"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Verify & Credit Balance
              </button>
              <button
                onClick={() => {
                  setShowVerifyModal(false);
                  setSelectedVerification(null);
                  setVerifyTxHash('');
                  setVerifyNotes('');
                }}
                className="flex-1 rounded-lg bg-[rgba(255,255,255,0.08)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.12)]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedVerification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#0F172A] p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">
              Reject Verification
            </h2>
            <div className="space-y-4">
              <div className="rounded-lg bg-[rgba(0,0,0,0.3)] p-3">
                <p className="text-xs text-[#94A3B8]">Order ID</p>
                <p className="font-mono text-white">
                  {selectedVerification.orderId}
                </p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full resize-none rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                  rows={3}
                  placeholder="Enter reason for rejection..."
                />
              </div>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={handleBinanceReject}
                disabled={isLoading || !rejectReason}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#EF4444] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#DC2626] disabled:opacity-50"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Reject
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedVerification(null);
                  setRejectReason('');
                }}
                className="flex-1 rounded-lg bg-[rgba(255,255,255,0.08)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.12)]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Balances Tab */}
      {activeTab === 'balances' && (
        <div>
          <div className="mb-6 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-4 backdrop-blur-xl sm:p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">
              User Balances
            </h2>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full sm:max-w-md sm:flex-1">
                <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform text-[#64748B]" />
                <input
                  type="text"
                  value={balanceSearchQuery}
                  onChange={(e) => setBalanceSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleBalanceSearch()}
                  placeholder="Search users by name or email..."
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(30,41,59,0.8)] py-3 pr-4 pl-12 text-base text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none sm:text-sm"
                />
              </div>
              <button
                onClick={handleBalanceSearch}
                className="w-full rounded-lg bg-[#3B82F6] px-5 py-3 text-base font-medium whitespace-nowrap text-white transition-colors hover:bg-[#2563EB] sm:w-auto sm:text-sm"
              >
                Search
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] backdrop-blur-xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.2)]">
                    <th className="px-6 py-4 text-left text-xs font-medium tracking-wider text-[#94A3B8] uppercase">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium tracking-wider text-[#94A3B8] uppercase">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium tracking-wider text-[#94A3B8] uppercase">
                      Balance
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium tracking-wider text-[#94A3B8] uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                  {userBalances.map((user) => (
                    <tr
                      key={user.id}
                      className="transition-colors hover:bg-[rgba(255,255,255,0.02)]"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-white">
                          {user.user?.username ||
                            user.user?.firstName ||
                            user.user?.email?.split('@')[0] ||
                            'Unknown'}
                        </div>
                        {user.user?.firstName && user.user?.lastName && (
                          <div className="text-xs text-[#64748B]">
                            {user.user.firstName} {user.user.lastName}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-[#94A3B8]">
                          {user.user?.email || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-white">
                          ${parseFloat(user.balance).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              toast.info(
                                `View history for ${user.user?.username || user.user?.firstName || user.user?.email?.split('@')[0] || 'user'}`,
                              )
                            }
                            className="flex items-center gap-1 rounded-lg bg-[#22C55E] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#16A34A]"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View History
                          </button>
                          <button
                            onClick={() => handleUpdateBalance(user)}
                            className="flex items-center gap-1 rounded-lg bg-[#3B82F6] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#2563EB]"
                          >
                            <DollarSign className="h-3.5 w-3.5" />
                            Update Balance
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {userBalances.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-16">
                        <div className="flex flex-col items-center justify-center text-center">
                          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(255,255,255,0.05)]">
                            <Wallet className="h-8 w-8 text-[#64748B]" />
                          </div>
                          <p className="text-lg font-medium text-white">
                            No users found
                          </p>
                          <p className="mt-1 text-sm text-[#94A3B8]">
                            Try adjusting your search or filters
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Edit Payment Method Modal */}
      {showEditMethodModal && selectedMethod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#0F172A] p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Edit {selectedMethod.displayName}
                </h2>
                <p className="mt-1 text-sm text-[#64748B]">
                  Gateway: {selectedMethod.gateway} •{' '}
                  {selectedMethod.isConfigured
                    ? '✓ Configured'
                    : '⚠️ Not configured'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowEditMethodModal(false);
                  setSelectedMethod(null);
                }}
                className="rounded-lg p-2 text-[#64748B] transition-colors hover:bg-[rgba(255,255,255,0.08)] hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.3)] p-4">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                  <CreditCard className="h-4 w-4 text-[#3B82F6]" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">
                      Display Name *
                    </label>
                    <input
                      type="text"
                      value={methodFormData.displayName}
                      onChange={(e) =>
                        setMethodFormData({
                          ...methodFormData,
                          displayName: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">
                      Upload Image
                    </label>
                    <div className="flex items-start gap-3">
                      {/* Image Preview */}
                      <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)]">
                        {imagePreview ? (
                          <>
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="h-full w-full object-cover"
                            />
                            <button
                              onClick={() => {
                                setImagePreview(null);
                                setMethodFormData({
                                  ...methodFormData,
                                  imageUrl: '',
                                });
                              }}
                              className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#EF4444]"
                            >
                              <X className="h-3 w-3 text-white" />
                            </button>
                          </>
                        ) : (
                          <ImageIcon className="h-6 w-6 text-[#64748B]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <label
                          className={`flex items-center gap-2 rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2563EB] ${isUploadingImage ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                        >
                          {isUploadingImage ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                          {isUploadingImage
                            ? 'Uploading...'
                            : 'Select Image File'}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            disabled={isUploadingImage}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setIsUploadingImage(true);
                                try {
                                  const result = await uploadFile(
                                    file,
                                    'payment-icons',
                                  );
                                  setImagePreview(result.url);
                                  setMethodFormData({
                                    ...methodFormData,
                                    imageUrl: result.url,
                                  });
                                  toast.success('Image uploaded successfully');
                                } catch (error) {
                                  console.error(
                                    'Failed to upload image:',
                                    error,
                                  );
                                  toast.error('Failed to upload image');
                                } finally {
                                  setIsUploadingImage(false);
                                }
                              }
                            }}
                          />
                        </label>
                        <p className="mt-1 text-xs text-[#64748B]">
                          Supported formats: JPEG, PNG, WebP. Max size: 5MB
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="mb-2 block text-sm font-medium text-white">
                    Description
                  </label>
                  <input
                    type="text"
                    value={methodFormData.description}
                    onChange={(e) =>
                      setMethodFormData({
                        ...methodFormData,
                        description: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                  />
                </div>
              </div>

              {/* Webhook + Redirect URLs (read-only, copy buttons) */}
              <GatewayWebhookUrls gateway={selectedMethod.gateway} />

              {/* Gateway API Configuration - Stripe */}
              {selectedMethod.gateway === 'STRIPE' && (
                <div className="rounded-lg border border-[rgba(59,130,246,0.3)] bg-[rgba(59,130,246,0.1)] p-4">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                    <CreditCard className="h-4 w-4 text-[#3B82F6]" />
                    Stripe API Configuration
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-white">
                        Secret Key *
                      </label>
                      <input
                        type="password"
                        value={methodFormData.settings.stripeSecretKey}
                        onChange={(e) =>
                          setMethodFormData({
                            ...methodFormData,
                            settings: {
                              ...methodFormData.settings,
                              stripeSecretKey: e.target.value,
                            },
                          })
                        }
                        className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                        placeholder="sk_test_51... or sk_live_51..."
                      />
                      <p className="mt-1 text-xs text-[#64748B]">
                        Server-side API calls. Starts with sk_test_ or sk_live_
                      </p>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-white">
                        Publishable Key *
                      </label>
                      <input
                        type="text"
                        value={methodFormData.settings.stripePublishableKey}
                        onChange={(e) =>
                          setMethodFormData({
                            ...methodFormData,
                            settings: {
                              ...methodFormData.settings,
                              stripePublishableKey: e.target.value,
                            },
                          })
                        }
                        className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                        placeholder="pk_test_51... or pk_live_51..."
                      />
                      <p className="mt-1 text-xs text-[#64748B]">
                        Frontend checkout. Starts with pk_test_ or pk_live_
                      </p>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-white">
                        Webhook Secret (Optional)
                      </label>
                      <input
                        type="password"
                        value={methodFormData.settings.stripeWebhookSecret}
                        onChange={(e) =>
                          setMethodFormData({
                            ...methodFormData,
                            settings: {
                              ...methodFormData.settings,
                              stripeWebhookSecret: e.target.value,
                            },
                          })
                        }
                        className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                        placeholder="whsec_..."
                      />
                      <p className="mt-1 text-xs text-[#64748B]">
                        Get from Stripe Dashboard → Developers → Webhooks
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Gateway API Configuration - Plisio */}
              {selectedMethod.gateway === 'PLISIO' && (
                <div className="rounded-lg border border-[rgba(245,158,11,0.3)] bg-[rgba(245,158,11,0.1)] p-4">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                    <Bitcoin className="h-4 w-4 text-[#F59E0B]" />
                    Plisio API Configuration
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-white">
                        API Key *
                      </label>
                      <input
                        type="password"
                        value={methodFormData.settings.plisioApiKey}
                        onChange={(e) =>
                          setMethodFormData({
                            ...methodFormData,
                            settings: {
                              ...methodFormData.settings,
                              plisioApiKey: e.target.value,
                            },
                          })
                        }
                        className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                        placeholder="Enter your Plisio API Key"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-white">
                        API Secret (Optional)
                      </label>
                      <input
                        type="password"
                        value={methodFormData.settings.plisioApiSecret}
                        onChange={(e) =>
                          setMethodFormData({
                            ...methodFormData,
                            settings: {
                              ...methodFormData.settings,
                              plisioApiSecret: e.target.value,
                            },
                          })
                        }
                        className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                        placeholder="Enter your Plisio API Secret"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Gateway API Configuration - Cryptomus */}
              {selectedMethod.gateway === 'CRYPTOMUS' && (
                <div className="rounded-lg border border-[rgba(245,158,11,0.3)] bg-[rgba(245,158,11,0.1)] p-4">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                    <Bitcoin className="h-4 w-4 text-[#F59E0B]" />
                    Cryptomus API Configuration
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-white">
                        Merchant ID *
                      </label>
                      <input
                        type="text"
                        value={methodFormData.settings.cryptomusMerchantId}
                        onChange={(e) =>
                          setMethodFormData({
                            ...methodFormData,
                            settings: {
                              ...methodFormData.settings,
                              cryptomusMerchantId: e.target.value,
                            },
                          })
                        }
                        className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                        placeholder="Enter your Cryptomus Merchant ID"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-white">
                        API Key *
                      </label>
                      <input
                        type="password"
                        value={methodFormData.settings.cryptomusApiKey}
                        onChange={(e) =>
                          setMethodFormData({
                            ...methodFormData,
                            settings: {
                              ...methodFormData.settings,
                              cryptomusApiKey: e.target.value,
                            },
                          })
                        }
                        className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                        placeholder="Enter your Cryptomus API Key"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Gateway API Configuration - NOWPayments */}
              {selectedMethod.gateway === 'NOWPAYMENTS' && (
                <div className="rounded-lg border border-[rgba(245,158,11,0.3)] bg-[rgba(245,158,11,0.1)] p-4">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                    <Bitcoin className="h-4 w-4 text-[#F59E0B]" />
                    NOWPayments API Configuration
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-white">
                        API Key *
                      </label>
                      <input
                        type="password"
                        value={methodFormData.settings.nowpaymentsApiKey}
                        onChange={(e) =>
                          setMethodFormData({
                            ...methodFormData,
                            settings: {
                              ...methodFormData.settings,
                              nowpaymentsApiKey: e.target.value,
                            },
                          })
                        }
                        className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                        placeholder="Enter your NOWPayments API Key"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-white">
                        IPN Secret Key *
                      </label>
                      <input
                        type="password"
                        value={methodFormData.settings.nowpaymentsIpnSecret}
                        onChange={(e) =>
                          setMethodFormData({
                            ...methodFormData,
                            settings: {
                              ...methodFormData.settings,
                              nowpaymentsIpnSecret: e.target.value,
                            },
                          })
                        }
                        className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                        placeholder="Enter your NOWPayments IPN Secret"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Gateway API Configuration - PayGate */}
              {selectedMethod.gateway === 'PAYGATE' && (
                <div className="rounded-lg border border-[rgba(34,197,94,0.3)] bg-[rgba(34,197,94,0.1)] p-4">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                    <Wallet className="h-4 w-4 text-[#22C55E]" />
                    PayGate.to Configuration
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-white">
                        USDC Wallet Address *
                      </label>
                      <input
                        type="text"
                        value={methodFormData.settings.paygateWalletAddress}
                        onChange={(e) =>
                          setMethodFormData({
                            ...methodFormData,
                            settings: {
                              ...methodFormData.settings,
                              paygateWalletAddress: e.target.value,
                            },
                          })
                        }
                        className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                        placeholder="0x..."
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-white">
                        API Key (Optional)
                      </label>
                      <input
                        type="password"
                        value={methodFormData.settings.paygateApiKey}
                        onChange={(e) =>
                          setMethodFormData({
                            ...methodFormData,
                            settings: {
                              ...methodFormData.settings,
                              paygateApiKey: e.target.value,
                            },
                          })
                        }
                        className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                        placeholder="Enter your PayGate API Key"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Gateway API Configuration - Volet */}
              {selectedMethod.gateway === 'VOLET' && (
                <div className="rounded-lg border border-[rgba(59,130,246,0.3)] bg-[rgba(59,130,246,0.1)] p-4">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                    <CreditCard className="h-4 w-4 text-[#3B82F6]" />
                    Volet API Configuration
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-white">
                        API Key *
                      </label>
                      <input
                        type="password"
                        value={methodFormData.settings.voletApiKey}
                        onChange={(e) =>
                          setMethodFormData({
                            ...methodFormData,
                            settings: {
                              ...methodFormData.settings,
                              voletApiKey: e.target.value,
                            },
                          })
                        }
                        className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                        placeholder="Enter your Volet API Key"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-white">
                        Secret Key *
                      </label>
                      <input
                        type="password"
                        value={methodFormData.settings.voletSecretKey}
                        onChange={(e) =>
                          setMethodFormData({
                            ...methodFormData,
                            settings: {
                              ...methodFormData.settings,
                              voletSecretKey: e.target.value,
                            },
                          })
                        }
                        className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                        placeholder="Enter your Volet Secret Key"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-white">
                        Merchant ID *
                      </label>
                      <input
                        type="text"
                        value={methodFormData.settings.voletMerchantId}
                        onChange={(e) =>
                          setMethodFormData({
                            ...methodFormData,
                            settings: {
                              ...methodFormData.settings,
                              voletMerchantId: e.target.value,
                            },
                          })
                        }
                        className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                        placeholder="Enter your Volet Merchant ID"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Gateway API Configuration - Binance */}
              {selectedMethod.gateway === 'BINANCE' && (
                <div className="rounded-lg border border-[rgba(245,158,11,0.3)] bg-[rgba(245,158,11,0.1)] p-4">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                    <DollarSign className="h-4 w-4 text-[#F59E0B]" />
                    Binance Internal Transfer Configuration
                  </h3>
                  <div className="space-y-4">
                    <div className="rounded-md border border-[rgba(59,130,246,0.3)] bg-[rgba(59,130,246,0.08)] p-3 text-xs text-[#94A3B8]">
                      Active Pay ID and QR are auto-detected from the live
                      scraper session. The fallback Pay ID below is only used
                      when no scraper session is configured.
                      <Link
                        href="/admin/binance-session"
                        className="mt-2 inline-flex items-center gap-1 font-medium text-[#3B82F6] hover:underline"
                      >
                        Manage Binance session
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-white">
                        Fallback Pay ID
                      </label>
                      <input
                        type="text"
                        value={methodFormData.settings.binancePayId}
                        onChange={(e) =>
                          setMethodFormData({
                            ...methodFormData,
                            settings: {
                              ...methodFormData.settings,
                              binancePayId: e.target.value,
                            },
                          })
                        }
                        className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                        placeholder="Enter fallback Binance Pay ID"
                      />
                      <p className="mt-1 text-xs text-[#64748B]">
                        Used only when no active scraper session exists
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Min Amount */}
              <div className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.3)] p-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">
                    Min Amount *
                  </label>
                  <input
                    type="number"
                    value={methodFormData.minAmount}
                    onChange={(e) =>
                      setMethodFormData({
                        ...methodFormData,
                        minAmount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                  />
                </div>
              </div>

              {/* Bonus Settings - Like CheapStreamTV */}
              <div className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.3)] p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">
                    Bonus Settings
                  </h3>
                  <button
                    onClick={() =>
                      setBonusRules([
                        ...bonusRules,
                        { minAmount: 0, bonusPercent: 0 },
                      ])
                    }
                    className="flex items-center gap-1 text-sm font-medium text-[#3B82F6] hover:text-[#60A5FA]"
                  >
                    <Plus className="h-4 w-4" />
                    Add Bonus
                  </button>
                </div>
                <div className="space-y-3">
                  {bonusRules.map((rule, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="mb-1 block text-xs text-[#94A3B8]">
                          Min Amount ($)
                        </label>
                        <input
                          type="number"
                          value={rule.minAmount}
                          onChange={(e) => {
                            const newRules = [...bonusRules];
                            newRules[index].minAmount =
                              parseFloat(e.target.value) || 0;
                            setBonusRules(newRules);
                          }}
                          className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-2 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                          placeholder="0"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="mb-1 block text-xs text-[#94A3B8]">
                          Bonus (%)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={rule.bonusPercent}
                          onChange={(e) => {
                            const newRules = [...bonusRules];
                            newRules[index].bonusPercent =
                              parseFloat(e.target.value) || 0;
                            setBonusRules(newRules);
                          }}
                          className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-2 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                          placeholder="0"
                        />
                      </div>
                      <button
                        onClick={() => {
                          if (bonusRules.length > 1) {
                            setBonusRules(
                              bonusRules.filter((_, i) => i !== index),
                            );
                          }
                        }}
                        className="mt-5 rounded-lg p-2 text-[#EF4444] transition-colors hover:bg-[rgba(239,68,68,0.1)]"
                        disabled={bonusRules.length <= 1}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Enable Service Fee - Like CheapStreamTV */}
              <div className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.3)] p-4">
                <div className="mb-4 flex items-center gap-3">
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={methodFormData.serviceFeeEnabled}
                      onChange={(e) =>
                        setMethodFormData({
                          ...methodFormData,
                          serviceFeeEnabled: e.target.checked,
                        })
                      }
                      className="peer sr-only"
                    />
                    <div className="flex h-5 w-5 items-center justify-center rounded border-2 border-[rgba(255,255,255,0.3)] bg-transparent peer-checked:border-[#3B82F6] peer-checked:bg-[#3B82F6]">
                      {methodFormData.serviceFeeEnabled && (
                        <svg
                          className="h-3 w-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  </label>
                  <span className="text-sm font-medium text-white">
                    Enable Service Fee
                  </span>
                </div>

                {methodFormData.serviceFeeEnabled && (
                  <div className="mt-4 space-y-4 border-t border-[rgba(255,255,255,0.1)] pt-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-white">
                        Fee Type
                      </label>
                      <Select
                        value={methodFormData.serviceFeeType}
                        onValueChange={(v) =>
                          setMethodFormData({
                            ...methodFormData,
                            serviceFeeType: v as 'percentage' | 'fixed',
                          })
                        }
                      >
                        <SelectTrigger className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:outline-none data-[size=default]:h-auto data-[size=default]:min-h-12">
                          <SelectValue placeholder="Select fee type" />
                        </SelectTrigger>
                        <SelectContent className="max-h-72 border-[rgba(255,255,255,0.18)] bg-[#1E293B] text-white">
                          <SelectItem
                            value="percentage"
                            className="text-white focus:bg-[rgba(59,130,246,0.15)] focus:text-white"
                          >
                            Percentage (%)
                          </SelectItem>
                          <SelectItem
                            value="fixed"
                            className="text-white focus:bg-[rgba(59,130,246,0.15)] focus:text-white"
                          >
                            Fixed ($)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-white">
                        {methodFormData.serviceFeeType === 'percentage'
                          ? 'Fee Percentage (%)'
                          : 'Fee Amount ($)'}
                      </label>
                      <input
                        type="number"
                        step={
                          methodFormData.serviceFeeType === 'percentage'
                            ? '0.1'
                            : '0.01'
                        }
                        value={
                          methodFormData.serviceFeeType === 'percentage'
                            ? methodFormData.feePercent
                            : methodFormData.feeFixed
                        }
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          if (methodFormData.serviceFeeType === 'percentage') {
                            setMethodFormData({
                              ...methodFormData,
                              feePercent: value,
                            });
                          } else {
                            setMethodFormData({
                              ...methodFormData,
                              feeFixed: value,
                            });
                          }
                        }}
                        className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                        placeholder="0"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Active Toggle - Like CheapStreamTV */}
              <div className="mt-2 flex items-center gap-3">
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={methodFormData.isEnabled}
                    onChange={(e) =>
                      setMethodFormData({
                        ...methodFormData,
                        isEnabled: e.target.checked,
                      })
                    }
                    className="peer sr-only"
                  />
                  <div className="flex h-5 w-5 items-center justify-center rounded border-2 border-[rgba(255,255,255,0.3)] bg-transparent peer-checked:border-[#3B82F6] peer-checked:bg-[#3B82F6]">
                    {methodFormData.isEnabled && (
                      <svg
                        className="h-3 w-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                </label>
                <span className="text-sm font-medium text-white">Active</span>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3 border-t border-[rgba(255,255,255,0.1)] pt-4">
              <button
                onClick={handleSaveMethod}
                disabled={isLoading}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#22C55E] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#16A34A] disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Update
              </button>
              <button
                onClick={() => {
                  setShowEditMethodModal(false);
                  setSelectedMethod(null);
                }}
                className="flex-1 rounded-lg bg-[rgba(255,255,255,0.08)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.12)]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Balance Modal */}
      {showBalanceModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#0F172A] p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                Update Balance -{' '}
                {selectedUser.user?.username ||
                  selectedUser.user?.firstName ||
                  selectedUser.user?.email?.split('@')[0] ||
                  'User'}
              </h2>
              <button
                onClick={() => {
                  setShowBalanceModal(false);
                  setSelectedUser(null);
                }}
                className="rounded-lg p-2 text-[#64748B] transition-colors hover:bg-[rgba(255,255,255,0.1)] hover:text-white"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Transaction Type
                </label>
                <Select
                  value={balanceFormData.transactionType}
                  onValueChange={(v) =>
                    setBalanceFormData({
                      ...balanceFormData,
                      transactionType: v as 'add' | 'deduct',
                    })
                  }
                >
                  <SelectTrigger className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:outline-none data-[size=default]:h-auto data-[size=default]:min-h-12">
                    <SelectValue placeholder="Select transaction type" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72 border-[rgba(255,255,255,0.18)] bg-[#1E293B] text-white">
                    <SelectItem
                      value="add"
                      className="text-white focus:bg-[rgba(59,130,246,0.15)] focus:text-white"
                    >
                      Add Balance
                    </SelectItem>
                    <SelectItem
                      value="deduct"
                      className="text-white focus:bg-[rgba(59,130,246,0.15)] focus:text-white"
                    >
                      Deduct Balance
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={balanceFormData.amount}
                  onChange={(e) =>
                    setBalanceFormData({
                      ...balanceFormData,
                      amount: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Description
                </label>
                <textarea
                  value={balanceFormData.description}
                  onChange={(e) =>
                    setBalanceFormData({
                      ...balanceFormData,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full resize-none rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                  placeholder="Enter description (optional)"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={handleSaveBalance}
                disabled={isLoading || !balanceFormData.amount}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#3B82F6] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2563EB] disabled:opacity-50"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Update Balance
              </button>
              <button
                onClick={() => {
                  setShowBalanceModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 rounded-lg bg-[rgba(255,255,255,0.08)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.12)]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit PayGate Provider Modal */}
      {showEditProviderModal && selectedProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#0F172A] p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                Edit Provider
              </h2>
              <button
                onClick={() => {
                  setShowEditProviderModal(false);
                  setSelectedProvider(null);
                }}
                className="rounded-lg p-2 text-[#64748B] transition-colors hover:bg-[rgba(255,255,255,0.08)] hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Provider Name
                </label>
                <input
                  type="text"
                  value={providerFormData.name}
                  onChange={(e) =>
                    setProviderFormData({
                      ...providerFormData,
                      name: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                  placeholder="Enter provider name"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Description
                </label>
                <textarea
                  value={providerFormData.description}
                  onChange={(e) =>
                    setProviderFormData({
                      ...providerFormData,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full resize-none rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                  placeholder="Enter description"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Provider Type
                </label>
                <input
                  type="text"
                  value={providerFormData.provider}
                  onChange={(e) =>
                    setProviderFormData({
                      ...providerFormData,
                      provider: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                  placeholder="e.g., PAYGATE, STRIPE"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">
                    Min Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={providerFormData.minAmount}
                    onChange={(e) =>
                      setProviderFormData({
                        ...providerFormData,
                        minAmount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">
                    Max Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={providerFormData.maxAmount}
                    onChange={(e) =>
                      setProviderFormData({
                        ...providerFormData,
                        maxAmount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                    placeholder="10000"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Sort Order
                </label>
                <input
                  type="number"
                  min="0"
                  value={providerFormData.sortOrder}
                  onChange={(e) =>
                    setProviderFormData({
                      ...providerFormData,
                      sortOrder: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                  placeholder="0"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.3)] p-4">
                <div>
                  <span className="text-sm font-medium text-white">
                    Enabled
                  </span>
                  <p className="mt-1 text-xs text-[#64748B]">
                    Allow users to use this provider
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={providerFormData.isEnabled}
                    onChange={(e) =>
                      setProviderFormData({
                        ...providerFormData,
                        isEnabled: e.target.checked,
                      })
                    }
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-[#64748B] peer-checked:bg-[#3B82F6] peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                </label>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={handleSaveProvider}
                disabled={isLoading || !providerFormData.name}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#3B82F6] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2563EB] disabled:opacity-50"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Changes
              </button>
              <button
                onClick={() => {
                  setShowEditProviderModal(false);
                  setSelectedProvider(null);
                }}
                className="flex-1 rounded-lg bg-[rgba(255,255,255,0.08)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.12)]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
