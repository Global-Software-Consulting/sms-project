'use client';

import { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";
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
} from '@/lib/api/adminModulesApi';

export default function AdminPaymentsPage() {
  const [activeTab, setActiveTab] = useState<
    "methods" | "paygate" | "card" | "guide" | "balances"
  >("methods");

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Payment Methods State
  const [paymentMethods, setPaymentMethods] = useState<PaymentGatewayConfig[]>([]);
  const [showEditMethodModal, setShowEditMethodModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentGatewayConfig | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [bonusRules, setBonusRules] = useState<{minAmount: number; bonusPercent: number}[]>([]);
  const [methodFormData, setMethodFormData] = useState({
    displayName: "",
    description: "",
    type: "crypto",
    isEnabled: true,
    minAmount: 1,
    bonusSettings: "",
    polygonWallet: "",
    serviceFee: "",
    feeFixed: 0,
    feePercent: 0,
    serviceFeeEnabled: false,
    serviceFeeType: "percentage" as "percentage" | "fixed",
    imageUrl: "",
    // Gateway-specific API settings
    settings: {
      // Stripe
      stripeSecretKey: "",
      stripePublishableKey: "",
      stripeWebhookSecret: "",
      stripeAllowedIps: [] as string[],
      // Plisio
      plisioApiKey: "",
      plisioApiSecret: "",
      // Cryptomus
      cryptomusMerchantId: "",
      cryptomusApiKey: "",
      // NOWPayments
      nowpaymentsApiKey: "",
      nowpaymentsIpnSecret: "",
      // PayGate
      paygateWalletAddress: "",
      paygateApiKey: "",
      // Volet
      voletApiKey: "",
      voletSecretKey: "",
      voletMerchantId: "",
      // Binance
      binanceMerchantId: "",
      binanceApiKey: "",
      binanceSecretKey: "",
      binancePayId: "",
    },
  });

  // PayGate Providers State
  const [payGateProviders, setPayGateProviders] = useState<PaygateProvider[]>([]);
  const [showEditProviderModal, setShowEditProviderModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<PaygateProvider | null>(null);
  const [providerFormData, setProviderFormData] = useState({
    name: "",
    description: "",
    provider: "",
    minAmount: 0,
    maxAmount: 10000,
    sortOrder: 0,
    isEnabled: true,
  });

  // Card Payment State (STRIPE toggle)
  const [cardPaymentEnabled, setCardPaymentEnabled] = useState(false);

  // User Guide State
  const [guideTitle, setGuideTitle] = useState("Payment Information");
  const [guideContent, setGuideContent] = useState("");
  const [guideUpdatedAt, setGuideUpdatedAt] = useState("");

  // User Balances State
  const [userBalances, setUserBalances] = useState<AdminWallet[]>([]);
  const [balanceSearchQuery, setBalanceSearchQuery] = useState("");
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminWallet | null>(null);
  const [balanceFormData, setBalanceFormData] = useState({
    transactionType: "add" as "add" | "deduct",
    amount: "",
    description: "",
  });
  const [balancePage, setBalancePage] = useState(1);
  const [balanceTotal, setBalanceTotal] = useState(0);

  // Fetch Payment Gateways
  const fetchPaymentGateways = useCallback(async () => {
    try {
      const response = await getPaymentGateways();
      setPaymentMethods(response.data);
      
      // Set card payment enabled based on STRIPE gateway
      const stripeGateway = response.data.find(g => g.gateway === 'STRIPE');
      if (stripeGateway) {
        setCardPaymentEnabled(stripeGateway.isEnabled);
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
  const fetchUserBalances = useCallback(async (search?: string, page: number = 1) => {
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
  }, []);

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

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      setIsInitialLoading(true);
      await Promise.all([
        fetchPaymentGateways(),
        fetchPaygateProviders(),
        fetchUserBalances(),
        fetchPaymentGuide(),
      ]);
      setIsInitialLoading(false);
    };
    loadInitialData();
  }, [fetchPaymentGateways, fetchPaygateProviders, fetchUserBalances, fetchPaymentGuide]);

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
    const parsedBonusRules: {minAmount: number; bonusPercent: number}[] = [];
    if (method.bonusSettings) {
      try {
        const parsed = JSON.parse(method.bonusSettings);
        if (Array.isArray(parsed)) {
          parsedBonusRules.push(...parsed);
        }
      } catch {
        // If not JSON, try to parse text format like "$100 → 5%"
        const matches = method.bonusSettings.match(/\$?(\d+)\s*[→→:]\s*(\d+)%/g);
        if (matches) {
          matches.forEach(match => {
            const [, amt, pct] = match.match(/\$?(\d+)\s*[→→:]\s*(\d+)%/) || [];
            if (amt && pct) {
              parsedBonusRules.push({ minAmount: parseInt(amt), bonusPercent: parseInt(pct) });
            }
          });
        }
      }
    }
    setBonusRules(parsedBonusRules.length > 0 ? parsedBonusRules : [{ minAmount: 0, bonusPercent: 0 }]);
    setImagePreview(method.imageUrl || null);
    
    setMethodFormData({
      displayName: method.displayName,
      description: method.description || "",
      type: method.type || "crypto",
      isEnabled: method.isEnabled,
      minAmount: parseFloat(method.minAmount) || 1,
      bonusSettings: method.bonusSettings || "",
      polygonWallet: method.polygonWallet || "",
      serviceFee: method.serviceFee || "",
      feeFixed: parseFloat(method.feeFixed) || 0,
      feePercent: parseFloat(method.feePercent) || 0,
      serviceFeeEnabled: method.serviceFeeEnabled || false,
      serviceFeeType: parseFloat(method.feeFixed) > 0 ? "fixed" : "percentage",
      imageUrl: method.imageUrl || "",
      settings: {
        // Stripe
        stripeSecretKey: settings.stripeSecretKey || "",
        stripePublishableKey: settings.stripePublishableKey || "",
        stripeWebhookSecret: settings.stripeWebhookSecret || "",
        stripeAllowedIps: settings.stripeAllowedIps || [],
        // Plisio
        plisioApiKey: settings.plisioApiKey || "",
        plisioApiSecret: settings.plisioApiSecret || "",
        // Cryptomus
        cryptomusMerchantId: settings.cryptomusMerchantId || "",
        cryptomusApiKey: settings.cryptomusApiKey || "",
        // NOWPayments
        nowpaymentsApiKey: settings.nowpaymentsApiKey || "",
        nowpaymentsIpnSecret: settings.nowpaymentsIpnSecret || "",
        // PayGate
        paygateWalletAddress: settings.paygateWalletAddress || "",
        paygateApiKey: settings.paygateApiKey || "",
        // Volet
        voletApiKey: settings.voletApiKey || "",
        voletSecretKey: settings.voletSecretKey || "",
        voletMerchantId: settings.voletMerchantId || "",
        // Binance
        binanceMerchantId: settings.binanceMerchantId || "",
        binanceApiKey: settings.binanceApiKey || "",
        binanceSecretKey: settings.binanceSecretKey || "",
        binancePayId: settings.binancePayId || "",
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
      const settingsKeys = Object.keys(methodFormData.settings) as (keyof typeof methodFormData.settings)[];
      for (const key of settingsKeys) {
        const value = methodFormData.settings[key];
        if (value && (typeof value === 'string' ? value.trim() !== '' : Array.isArray(value) ? value.length > 0 : true)) {
          cleanSettings[key] = value;
        }
      }

      // Serialize bonus rules to JSON string
      const validBonusRules = bonusRules.filter(r => r.minAmount > 0 || r.bonusPercent > 0);
      const bonusSettingsJson = validBonusRules.length > 0 ? JSON.stringify(validBonusRules) : undefined;

      // Calculate fee based on fee type
      const feeFixed = methodFormData.serviceFeeType === "fixed" ? methodFormData.feeFixed : 0;
      const feePercent = methodFormData.serviceFeeType === "percentage" ? methodFormData.feePercent : 0;

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
        imageUrl: methodFormData.imageUrl || undefined,
        settings: Object.keys(cleanSettings).length > 0 ? cleanSettings : undefined,
      });
      
      toast.success("Payment method updated successfully!");
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
      toast.success(`${method.displayName} ${!method.isEnabled ? 'enabled' : 'disabled'}`);
      await fetchPaymentGateways();
    } catch (error: any) {
      console.error('Failed to toggle payment method:', error);
      toast.error(error.response?.data?.message || 'Failed to toggle payment method');
    }
  };

  // PayGate Provider Handlers
  const handleToggleProvider = async (provider: PaygateProvider) => {
    try {
      await togglePaygateProvider(provider.id, !provider.isEnabled);
      toast.success(`${provider.name} ${!provider.isEnabled ? 'enabled' : 'disabled'}`);
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
      description: provider.description || "",
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
      toast.success(cardPaymentEnabled ? "Card payment disabled" : "Card payment enabled");
    } catch (error: any) {
      console.error('Failed to toggle card payment:', error);
      toast.error(error.response?.data?.message || 'Failed to toggle card payment');
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
      toast.success("Guide saved successfully!");
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
      transactionType: "add",
      amount: "",
      description: "",
    });
    setShowBalanceModal(true);
  };

  const handleSaveBalance = async () => {
    if (!selectedUser || !balanceFormData.amount) return;

    setIsLoading(true);
    try {
      const amount = parseFloat(balanceFormData.amount);
      
      if (balanceFormData.transactionType === "add") {
        await creditUserWallet(selectedUser.userId, {
          amount,
          description: balanceFormData.description || `Admin credit: $${amount}`,
        });
      } else {
        await debitUserWallet(selectedUser.userId, {
          amount,
          description: balanceFormData.description || `Admin debit: $${amount}`,
        });
      }

      const action = balanceFormData.transactionType === "add" ? "added to" : "deducted from";
      toast.success(`$${amount.toFixed(2)} ${action} ${selectedUser.user?.username || 'user'}'s balance`);
      
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
    if (type === "crypto" || type === "transfer") {
      return <Bitcoin className="w-5 h-5 text-[#F59E0B]" />;
    }
    return <CreditCard className="w-5 h-5 text-[#3B82F6]" />;
  };

  if (isInitialLoading) {
    return (
      <div className="p-4 lg:p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#3B82F6] mx-auto mb-4" />
          <p className="text-[#94A3B8]">Loading payment settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="text-4xl">💳</span>
            <h1 className="text-white text-3xl font-semibold">Payment Management</h1>
          </div>
          <button
            onClick={handleSeedDefaults}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.12)] text-white text-sm font-medium transition-colors flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Seed Defaults
          </button>
        </div>
        <p className="text-[#94A3B8] text-sm">Manage payment gateways, providers, and user balances</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2">
        {[
          { id: "methods", label: "Payment Methods" },
          { id: "paygate", label: "PayGate Providers" },
          { id: "card", label: "Card Payment" },
          { id: "guide", label: "User Guide" },
          { id: "balances", label: "Users Balances" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "bg-[rgba(59,130,246,0.2)] text-[#3B82F6]"
                : "text-[#94A3B8] hover:bg-[rgba(255,255,255,0.05)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Payment Methods Tab */}
      {activeTab === "methods" && (
        <div>
          <div className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-white text-xl font-semibold">Payment Methods Management</h2>
              <span className="text-[#94A3B8] text-sm">
                {paymentMethods.filter(m => m.isEnabled).length} of {paymentMethods.length} enabled
              </span>
            </div>
          </div>

          {paymentMethods.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center mb-4">
                <CreditCard className="w-8 h-8 text-[#64748B]" />
              </div>
              <p className="text-white text-lg font-medium">No payment methods found</p>
              <p className="text-[#94A3B8] text-sm mt-1">Seed default gateways to get started</p>
            </div>
          ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {paymentMethods.map((method) => (
              <div
                key={method.id || method.gateway}
                className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl hover:border-[rgba(59,130,246,0.5)] transition-all"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.3)]">
                    {getGatewayIcon(method.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white text-sm font-semibold mb-2 line-clamp-2">
                      {method.displayName}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                        method.isEnabled
                          ? "bg-[#22C55E]/20 text-[#22C55E]"
                          : "bg-[#64748B]/20 text-[#64748B]"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          method.isEnabled ? "bg-[#22C55E]" : "bg-[#64748B]"
                        }`}
                      />
                      {method.isEnabled ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#64748B]">Gateway:</span>
                    <span className="text-[#3B82F6] font-medium">{method.gateway}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#64748B]">Type:</span>
                    <span className="text-white font-medium capitalize">{method.type}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#64748B]">Min Amount:</span>
                    <span className="text-white font-medium">${method.minAmount}</span>
                  </div>
                  {method.bonusSettings && (
                    <div className="flex items-start justify-between text-xs">
                      <span className="text-[#64748B]">Bonus:</span>
                      <span className="text-[#22C55E] font-medium text-right max-w-[60%]">
                        {method.bonusSettings}
                      </span>
                    </div>
                  )}
                  {!method.isConfigured && (
                    <div className="text-xs text-[#F59E0B]">⚠️ Not configured in environment</div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditMethod(method)}
                    className="flex-1 px-4 py-2 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleMethod(method)}
                    disabled={!method.isConfigured && !method.isEnabled}
                    className={`flex-1 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                      method.isEnabled
                        ? "bg-[#EF4444] hover:bg-[#DC2626]"
                        : "bg-[#22C55E] hover:bg-[#16A34A]"
                    }`}
                  >
                    {method.isEnabled ? "Disable" : "Enable"}
                  </button>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      )}

      {/* PayGate Providers Tab */}
      {activeTab === "paygate" && (
        <div>
          <div className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl mb-6">
            <h2 className="text-white text-xl font-semibold mb-2">PayGate Provider Configuration</h2>
            <div className="flex items-center gap-4 text-xs text-[#94A3B8]">
              <div className="flex items-center gap-2">
                <Grip className="w-4 h-4" />
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
              <div className="w-16 h-16 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center mb-4">
                <Grip className="w-8 h-8 text-[#64748B]" />
              </div>
              <p className="text-white text-lg font-medium">No PayGate providers found</p>
              <p className="text-[#94A3B8] text-sm mt-1">Configure payment gateway providers to get started</p>
            </div>
          ) : (
          <div className="space-y-4">
            {payGateProviders
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((provider) => (
                <div
                  key={provider.id}
                  className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl hover:border-[rgba(59,130,246,0.5)] transition-all"
                >
                  <div className="flex items-center gap-4">
                    <button className="p-2 text-[#64748B] hover:text-white cursor-move transition-colors">
                      <Grip className="w-5 h-5" />
                    </button>

                    <div className="p-3 rounded-lg bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.3)]">
                      <CreditCard className="w-5 h-5 text-[#F59E0B]" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-white text-base font-semibold">{provider.name}</h3>
                        {provider.name.includes("Recommended") && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-[rgba(34,197,94,0.2)] text-[#22C55E]">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-[#94A3B8] text-sm mb-2">{provider.description}</p>
                      <div className="flex items-center gap-4 text-xs text-[#64748B]">
                        <span>Code: {provider.code}</span>
                        <span>Provider: {provider.provider}</span>
                        <span>Min: ${provider.minAmount}</span>
                        <span>Max: ${provider.maxAmount}</span>
                      </div>
                    </div>

                    <div className="px-3 py-1.5 rounded-lg bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.3)]">
                      <span className="text-[#3B82F6] text-sm font-semibold">#{provider.sortOrder}</span>
                    </div>

                    <button
                      onClick={() => handleEditProvider(provider)}
                      className="p-2 rounded-lg bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.3)] text-[#3B82F6] hover:bg-[rgba(59,130,246,0.2)] transition-colors"
                      title="Edit provider"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={provider.isEnabled}
                        onChange={() => handleToggleProvider(provider)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#64748B] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3B82F6]"></div>
                    </label>
                  </div>
                </div>
              ))}
          </div>
          )}
        </div>
      )}

      {/* Card Payment Tab */}
      {activeTab === "card" && (
        <div>
          <div className="p-8 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-6 h-6 text-[#3B82F6]" />
              <h2 className="text-white text-xl font-semibold">Card Payment Settings (Stripe)</h2>
            </div>
            <p className="text-[#94A3B8] text-sm mb-8">
              Enable or disable Stripe card payments globally
            </p>

            <div className="p-6 rounded-lg bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${cardPaymentEnabled ? 'bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.3)]' : 'bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)]'}`}>
                  <CreditCard className={`w-5 h-5 ${cardPaymentEnabled ? 'text-[#22C55E]' : 'text-[#EF4444]'}`} />
                </div>
                <div>
                  <h3 className="text-white text-base font-semibold mb-1">
                    Stripe Card Payment
                  </h3>
                  <p className="text-[#64748B] text-sm">
                    Card payment is currently {cardPaymentEnabled ? "enabled" : "disabled"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleToggleCardPayment}
                className={`px-6 py-2.5 rounded-lg text-white text-sm font-medium transition-colors ${
                  cardPaymentEnabled
                    ? "bg-[#EF4444] hover:bg-[#DC2626]"
                    : "bg-[#22C55E] hover:bg-[#16A34A]"
                }`}
              >
                {cardPaymentEnabled ? "Disable" : "Enable"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Guide Tab */}
      {activeTab === "guide" && (
        <div>
          <div className="p-8 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl">
            <h2 className="text-white text-xl font-semibold mb-2">User Guide Management</h2>
            <p className="text-[#94A3B8] text-sm mb-8">
              Create and manage your payment guide content
            </p>

            <div className="space-y-6">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Guide Title</label>
                <input
                  type="text"
                  value={guideTitle}
                  onChange={(e) => setGuideTitle(e.target.value)}
                  className="w-full bg-[rgba(30,41,59,0.8)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  placeholder="Enter guide title"
                />
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">Guide Content (HTML)</label>
                <textarea
                  value={guideContent}
                  onChange={(e) => setGuideContent(e.target.value)}
                  className="w-full bg-[rgba(30,41,59,0.8)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] min-h-[300px] resize-none font-mono"
                  placeholder="Enter guide content (HTML supported)..."
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[rgba(255,255,255,0.1)]">
                <p className="text-[#64748B] text-xs">
                  Last updated: {guideUpdatedAt ? new Date(guideUpdatedAt).toLocaleString() : 'Never'}
                </p>
                <button
                  onClick={handleSaveGuide}
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Guide
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Balances Tab */}
      {activeTab === "balances" && (
        <div>
          <div className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl mb-6">
            <h2 className="text-white text-xl font-semibold mb-4">User Balances</h2>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                <input
                  type="text"
                  value={balanceSearchQuery}
                  onChange={(e) => setBalanceSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleBalanceSearch()}
                  placeholder="Search users by name or email..."
                  className="w-full bg-[rgba(30,41,59,0.8)] border border-[rgba(255,255,255,0.18)] rounded-lg pl-12 pr-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                />
              </div>
              <button
                onClick={handleBalanceSearch}
                className="px-5 py-3 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors"
              >
                Search
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.2)]">
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#94A3B8] uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Balance</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                  {userBalances.map((user) => (
                    <tr key={user.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-white text-sm font-medium">{user.user?.username || 'Unknown'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-[#94A3B8] text-sm">{user.user?.email || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white text-sm font-semibold">
                          ${parseFloat(user.balance).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toast.info(`View history for ${user.user?.username}`)}
                            className="px-4 py-2 rounded-lg bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-medium transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View History
                          </button>
                          <button
                            onClick={() => handleUpdateBalance(user)}
                            className="px-4 py-2 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-medium transition-colors flex items-center gap-1"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
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
                          <div className="w-16 h-16 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center mb-4">
                            <Wallet className="w-8 h-8 text-[#64748B]" />
                          </div>
                          <p className="text-white text-lg font-medium">No users found</p>
                          <p className="text-[#94A3B8] text-sm mt-1">Try adjusting your search or filters</p>
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F172A] border border-[rgba(255,255,255,0.1)] rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-white text-xl font-semibold">
                  Edit {selectedMethod.displayName}
                </h2>
                <p className="text-[#64748B] text-sm mt-1">
                  Gateway: {selectedMethod.gateway} • {selectedMethod.isConfigured ? '✓ Configured' : '⚠️ Not configured'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowEditMethodModal(false);
                  setSelectedMethod(null);
                }}
                className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.08)] text-[#64748B] hover:text-white transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="p-4 rounded-lg bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)]">
                <h3 className="text-white text-sm font-semibold mb-4 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#3B82F6]" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Display Name *</label>
                    <input
                      type="text"
                      value={methodFormData.displayName}
                      onChange={(e) => setMethodFormData({ ...methodFormData, displayName: e.target.value })}
                      className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                    />
                  </div>
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Upload Image</label>
                    <div className="flex items-start gap-3">
                      {/* Image Preview */}
                      <div className="relative w-16 h-16 rounded-lg bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] flex items-center justify-center overflow-hidden">
                        {imagePreview ? (
                          <>
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            <button
                              onClick={() => {
                                setImagePreview(null);
                                setMethodFormData({ ...methodFormData, imageUrl: "" });
                              }}
                              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#EF4444] flex items-center justify-center"
                            >
                              <X className="w-3 h-3 text-white" />
                            </button>
                          </>
                        ) : (
                          <ImageIcon className="w-6 h-6 text-[#64748B]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium cursor-pointer transition-colors">
                          <Upload className="w-4 h-4" />
                          Select Image File
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                  const dataUrl = ev.target?.result as string;
                                  setImagePreview(dataUrl);
                                  setMethodFormData({ ...methodFormData, imageUrl: dataUrl });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                        <p className="text-[#64748B] text-xs mt-1">Supported formats: JPEG, PNG, WebP. Max size: 5MB</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="text-white text-sm font-medium mb-2 block">Description</label>
                  <input
                    type="text"
                    value={methodFormData.description}
                    onChange={(e) => setMethodFormData({ ...methodFormData, description: e.target.value })}
                    className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  />
                </div>
              </div>

              {/* Gateway API Configuration - Stripe */}
              {selectedMethod.gateway === 'STRIPE' && (
                <div className="p-4 rounded-lg bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.3)]">
                  <h3 className="text-white text-sm font-semibold mb-4 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#3B82F6]" />
                    Stripe API Configuration
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">Secret Key *</label>
                      <input
                        type="password"
                        value={methodFormData.settings.stripeSecretKey}
                        onChange={(e) => setMethodFormData({ 
                          ...methodFormData, 
                          settings: { ...methodFormData.settings, stripeSecretKey: e.target.value }
                        })}
                        className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                        placeholder="sk_test_51... or sk_live_51..."
                      />
                      <p className="text-[#64748B] text-xs mt-1">Server-side API calls. Starts with sk_test_ or sk_live_</p>
                    </div>
                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">Publishable Key *</label>
                      <input
                        type="text"
                        value={methodFormData.settings.stripePublishableKey}
                        onChange={(e) => setMethodFormData({ 
                          ...methodFormData, 
                          settings: { ...methodFormData.settings, stripePublishableKey: e.target.value }
                        })}
                        className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                        placeholder="pk_test_51... or pk_live_51..."
                      />
                      <p className="text-[#64748B] text-xs mt-1">Frontend checkout. Starts with pk_test_ or pk_live_</p>
                    </div>
                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">Webhook Secret (Optional)</label>
                      <input
                        type="password"
                        value={methodFormData.settings.stripeWebhookSecret}
                        onChange={(e) => setMethodFormData({ 
                          ...methodFormData, 
                          settings: { ...methodFormData.settings, stripeWebhookSecret: e.target.value }
                        })}
                        className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                        placeholder="whsec_..."
                      />
                      <p className="text-[#64748B] text-xs mt-1">Get from Stripe Dashboard → Developers → Webhooks</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Gateway API Configuration - Plisio */}
              {selectedMethod.gateway === 'PLISIO' && (
                <div className="p-4 rounded-lg bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.3)]">
                  <h3 className="text-white text-sm font-semibold mb-4 flex items-center gap-2">
                    <Bitcoin className="w-4 h-4 text-[#F59E0B]" />
                    Plisio API Configuration
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">API Key *</label>
                      <input
                        type="password"
                        value={methodFormData.settings.plisioApiKey}
                        onChange={(e) => setMethodFormData({ 
                          ...methodFormData, 
                          settings: { ...methodFormData.settings, plisioApiKey: e.target.value }
                        })}
                        className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                        placeholder="Enter your Plisio API Key"
                      />
                    </div>
                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">API Secret (Optional)</label>
                      <input
                        type="password"
                        value={methodFormData.settings.plisioApiSecret}
                        onChange={(e) => setMethodFormData({ 
                          ...methodFormData, 
                          settings: { ...methodFormData.settings, plisioApiSecret: e.target.value }
                        })}
                        className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                        placeholder="Enter your Plisio API Secret"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Gateway API Configuration - Cryptomus */}
              {selectedMethod.gateway === 'CRYPTOMUS' && (
                <div className="p-4 rounded-lg bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.3)]">
                  <h3 className="text-white text-sm font-semibold mb-4 flex items-center gap-2">
                    <Bitcoin className="w-4 h-4 text-[#F59E0B]" />
                    Cryptomus API Configuration
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">Merchant ID *</label>
                      <input
                        type="text"
                        value={methodFormData.settings.cryptomusMerchantId}
                        onChange={(e) => setMethodFormData({ 
                          ...methodFormData, 
                          settings: { ...methodFormData.settings, cryptomusMerchantId: e.target.value }
                        })}
                        className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                        placeholder="Enter your Cryptomus Merchant ID"
                      />
                    </div>
                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">API Key *</label>
                      <input
                        type="password"
                        value={methodFormData.settings.cryptomusApiKey}
                        onChange={(e) => setMethodFormData({ 
                          ...methodFormData, 
                          settings: { ...methodFormData.settings, cryptomusApiKey: e.target.value }
                        })}
                        className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                        placeholder="Enter your Cryptomus API Key"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Gateway API Configuration - NOWPayments */}
              {selectedMethod.gateway === 'NOWPAYMENTS' && (
                <div className="p-4 rounded-lg bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.3)]">
                  <h3 className="text-white text-sm font-semibold mb-4 flex items-center gap-2">
                    <Bitcoin className="w-4 h-4 text-[#F59E0B]" />
                    NOWPayments API Configuration
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">API Key *</label>
                      <input
                        type="password"
                        value={methodFormData.settings.nowpaymentsApiKey}
                        onChange={(e) => setMethodFormData({ 
                          ...methodFormData, 
                          settings: { ...methodFormData.settings, nowpaymentsApiKey: e.target.value }
                        })}
                        className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                        placeholder="Enter your NOWPayments API Key"
                      />
                    </div>
                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">IPN Secret Key *</label>
                      <input
                        type="password"
                        value={methodFormData.settings.nowpaymentsIpnSecret}
                        onChange={(e) => setMethodFormData({ 
                          ...methodFormData, 
                          settings: { ...methodFormData.settings, nowpaymentsIpnSecret: e.target.value }
                        })}
                        className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                        placeholder="Enter your NOWPayments IPN Secret"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Gateway API Configuration - PayGate */}
              {selectedMethod.gateway === 'PAYGATE' && (
                <div className="p-4 rounded-lg bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.3)]">
                  <h3 className="text-white text-sm font-semibold mb-4 flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-[#22C55E]" />
                    PayGate.to Configuration
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">USDC Wallet Address *</label>
                      <input
                        type="text"
                        value={methodFormData.settings.paygateWalletAddress}
                        onChange={(e) => setMethodFormData({ 
                          ...methodFormData, 
                          settings: { ...methodFormData.settings, paygateWalletAddress: e.target.value }
                        })}
                        className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                        placeholder="0x..."
                      />
                    </div>
                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">API Key (Optional)</label>
                      <input
                        type="password"
                        value={methodFormData.settings.paygateApiKey}
                        onChange={(e) => setMethodFormData({ 
                          ...methodFormData, 
                          settings: { ...methodFormData.settings, paygateApiKey: e.target.value }
                        })}
                        className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                        placeholder="Enter your PayGate API Key"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Gateway API Configuration - Volet */}
              {selectedMethod.gateway === 'VOLET' && (
                <div className="p-4 rounded-lg bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.3)]">
                  <h3 className="text-white text-sm font-semibold mb-4 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#3B82F6]" />
                    Volet API Configuration
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">API Key *</label>
                      <input
                        type="password"
                        value={methodFormData.settings.voletApiKey}
                        onChange={(e) => setMethodFormData({ 
                          ...methodFormData, 
                          settings: { ...methodFormData.settings, voletApiKey: e.target.value }
                        })}
                        className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                        placeholder="Enter your Volet API Key"
                      />
                    </div>
                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">Secret Key *</label>
                      <input
                        type="password"
                        value={methodFormData.settings.voletSecretKey}
                        onChange={(e) => setMethodFormData({ 
                          ...methodFormData, 
                          settings: { ...methodFormData.settings, voletSecretKey: e.target.value }
                        })}
                        className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                        placeholder="Enter your Volet Secret Key"
                      />
                    </div>
                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">Merchant ID *</label>
                      <input
                        type="text"
                        value={methodFormData.settings.voletMerchantId}
                        onChange={(e) => setMethodFormData({ 
                          ...methodFormData, 
                          settings: { ...methodFormData.settings, voletMerchantId: e.target.value }
                        })}
                        className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                        placeholder="Enter your Volet Merchant ID"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Gateway API Configuration - Binance */}
              {selectedMethod.gateway === 'BINANCE' && (
                <div className="p-4 rounded-lg bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.3)]">
                  <h3 className="text-white text-sm font-semibold mb-4 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#F59E0B]" />
                    Binance Internal Transfer Configuration
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">Pay ID *</label>
                      <input
                        type="text"
                        value={methodFormData.settings.binancePayId}
                        onChange={(e) => setMethodFormData({ 
                          ...methodFormData, 
                          settings: { ...methodFormData.settings, binancePayId: e.target.value }
                        })}
                        className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                        placeholder="Enter your Binance Pay ID"
                      />
                      <p className="text-[#64748B] text-xs mt-1">Users will transfer to this Pay ID</p>
                    </div>
                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">Merchant ID (Optional)</label>
                      <input
                        type="text"
                        value={methodFormData.settings.binanceMerchantId}
                        onChange={(e) => setMethodFormData({ 
                          ...methodFormData, 
                          settings: { ...methodFormData.settings, binanceMerchantId: e.target.value }
                        })}
                        className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                        placeholder="Enter your Binance Merchant ID"
                      />
                    </div>
                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">API Key (Optional)</label>
                      <input
                        type="password"
                        value={methodFormData.settings.binanceApiKey}
                        onChange={(e) => setMethodFormData({ 
                          ...methodFormData, 
                          settings: { ...methodFormData.settings, binanceApiKey: e.target.value }
                        })}
                        className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                        placeholder="Enter your Binance API Key"
                      />
                    </div>
                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">Secret Key (Optional)</label>
                      <input
                        type="password"
                        value={methodFormData.settings.binanceSecretKey}
                        onChange={(e) => setMethodFormData({ 
                          ...methodFormData, 
                          settings: { ...methodFormData.settings, binanceSecretKey: e.target.value }
                        })}
                        className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                        placeholder="Enter your Binance Secret Key"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Min Amount */}
              <div className="p-4 rounded-lg bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)]">
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Min Amount *</label>
                  <input
                    type="number"
                    value={methodFormData.minAmount}
                    onChange={(e) => setMethodFormData({ ...methodFormData, minAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  />
                </div>
              </div>

              {/* Bonus Settings - Like CheapStreamTV */}
              <div className="p-4 rounded-lg bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white text-sm font-semibold">Bonus Settings</h3>
                  <button
                    onClick={() => setBonusRules([...bonusRules, { minAmount: 0, bonusPercent: 0 }])}
                    className="text-[#3B82F6] hover:text-[#60A5FA] text-sm font-medium flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Bonus
                  </button>
                </div>
                <div className="space-y-3">
                  {bonusRules.map((rule, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="text-[#94A3B8] text-xs mb-1 block">Min Amount ($)</label>
                        <input
                          type="number"
                          value={rule.minAmount}
                          onChange={(e) => {
                            const newRules = [...bonusRules];
                            newRules[index].minAmount = parseFloat(e.target.value) || 0;
                            setBonusRules(newRules);
                          }}
                          className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                          placeholder="0"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-[#94A3B8] text-xs mb-1 block">Bonus (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={rule.bonusPercent}
                          onChange={(e) => {
                            const newRules = [...bonusRules];
                            newRules[index].bonusPercent = parseFloat(e.target.value) || 0;
                            setBonusRules(newRules);
                          }}
                          className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                          placeholder="0"
                        />
                      </div>
                      <button
                        onClick={() => {
                          if (bonusRules.length > 1) {
                            setBonusRules(bonusRules.filter((_, i) => i !== index));
                          }
                        }}
                        className="mt-5 p-2 text-[#EF4444] hover:bg-[rgba(239,68,68,0.1)] rounded-lg transition-colors"
                        disabled={bonusRules.length <= 1}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Enable Service Fee - Like CheapStreamTV */}
              <div className="p-4 rounded-lg bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)]">
                <div className="flex items-center gap-3 mb-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={methodFormData.serviceFeeEnabled}
                      onChange={(e) => setMethodFormData({ ...methodFormData, serviceFeeEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-5 h-5 border-2 border-[rgba(255,255,255,0.3)] rounded bg-transparent peer-checked:bg-[#3B82F6] peer-checked:border-[#3B82F6] flex items-center justify-center">
                      {methodFormData.serviceFeeEnabled && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </label>
                  <span className="text-white text-sm font-medium">Enable Service Fee</span>
                </div>

                {methodFormData.serviceFeeEnabled && (
                  <div className="space-y-4 mt-4 pt-4 border-t border-[rgba(255,255,255,0.1)]">
                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">Fee Type</label>
                      <select
                        value={methodFormData.serviceFeeType}
                        onChange={(e) => setMethodFormData({ ...methodFormData, serviceFeeType: e.target.value as "percentage" | "fixed" })}
                        className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed ($)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">
                        {methodFormData.serviceFeeType === "percentage" ? "Fee Percentage (%)" : "Fee Amount ($)"}
                      </label>
                      <input
                        type="number"
                        step={methodFormData.serviceFeeType === "percentage" ? "0.1" : "0.01"}
                        value={methodFormData.serviceFeeType === "percentage" ? methodFormData.feePercent : methodFormData.feeFixed}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          if (methodFormData.serviceFeeType === "percentage") {
                            setMethodFormData({ ...methodFormData, feePercent: value });
                          } else {
                            setMethodFormData({ ...methodFormData, feeFixed: value });
                          }
                        }}
                        className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                        placeholder="0"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Active Toggle - Like CheapStreamTV */}
              <div className="flex items-center gap-3 mt-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={methodFormData.isEnabled}
                    onChange={(e) => setMethodFormData({ ...methodFormData, isEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 border-2 border-[rgba(255,255,255,0.3)] rounded bg-transparent peer-checked:bg-[#3B82F6] peer-checked:border-[#3B82F6] flex items-center justify-center">
                    {methodFormData.isEnabled && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </label>
                <span className="text-white text-sm font-medium">Active</span>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[rgba(255,255,255,0.1)]">
              <button
                onClick={handleSaveMethod}
                disabled={isLoading}
                className="flex-1 px-5 py-2.5 rounded-lg bg-[#22C55E] hover:bg-[#16A34A] text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Update
              </button>
              <button
                onClick={() => {
                  setShowEditMethodModal(false);
                  setSelectedMethod(null);
                }}
                className="flex-1 px-5 py-2.5 rounded-lg bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.12)] text-white text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Balance Modal */}
      {showBalanceModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F172A] border border-[rgba(255,255,255,0.1)] rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-xl font-semibold">
                Update Balance - {selectedUser.user?.username || 'User'}
              </h2>
              <button
                onClick={() => {
                  setShowBalanceModal(false);
                  setSelectedUser(null);
                }}
                className="p-2 hover:bg-[rgba(255,255,255,0.1)] rounded-lg text-[#64748B] hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Transaction Type</label>
                <select
                  value={balanceFormData.transactionType}
                  onChange={(e) => setBalanceFormData({ ...balanceFormData, transactionType: e.target.value as "add" | "deduct" })}
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                >
                  <option value="add">Add Balance</option>
                  <option value="deduct">Deduct Balance</option>
                </select>
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={balanceFormData.amount}
                  onChange={(e) => setBalanceFormData({ ...balanceFormData, amount: e.target.value })}
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">Description</label>
                <textarea
                  value={balanceFormData.description}
                  onChange={(e) => setBalanceFormData({ ...balanceFormData, description: e.target.value })}
                  rows={3}
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] resize-none"
                  placeholder="Enter description (optional)"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleSaveBalance}
                disabled={isLoading || !balanceFormData.amount}
                className="flex-1 px-5 py-2.5 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Update Balance
              </button>
              <button
                onClick={() => {
                  setShowBalanceModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 px-5 py-2.5 rounded-lg bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.12)] text-white text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit PayGate Provider Modal */}
      {showEditProviderModal && selectedProvider && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F172A] border border-[rgba(255,255,255,0.1)] rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-xl font-semibold">
                Edit Provider
              </h2>
              <button
                onClick={() => {
                  setShowEditProviderModal(false);
                  setSelectedProvider(null);
                }}
                className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.08)] text-[#64748B] hover:text-white transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Provider Name</label>
                <input
                  type="text"
                  value={providerFormData.name}
                  onChange={(e) => setProviderFormData({ ...providerFormData, name: e.target.value })}
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  placeholder="Enter provider name"
                />
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">Description</label>
                <textarea
                  value={providerFormData.description}
                  onChange={(e) => setProviderFormData({ ...providerFormData, description: e.target.value })}
                  rows={3}
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] resize-none"
                  placeholder="Enter description"
                />
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">Provider Type</label>
                <input
                  type="text"
                  value={providerFormData.provider}
                  onChange={(e) => setProviderFormData({ ...providerFormData, provider: e.target.value })}
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  placeholder="e.g., PAYGATE, STRIPE"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Min Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={providerFormData.minAmount}
                    onChange={(e) => setProviderFormData({ ...providerFormData, minAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Max Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={providerFormData.maxAmount}
                    onChange={(e) => setProviderFormData({ ...providerFormData, maxAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                    placeholder="10000"
                  />
                </div>
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">Sort Order</label>
                <input
                  type="number"
                  min="0"
                  value={providerFormData.sortOrder}
                  onChange={(e) => setProviderFormData({ ...providerFormData, sortOrder: parseInt(e.target.value) || 0 })}
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  placeholder="0"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)]">
                <div>
                  <span className="text-white text-sm font-medium">Enabled</span>
                  <p className="text-[#64748B] text-xs mt-1">Allow users to use this provider</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={providerFormData.isEnabled}
                    onChange={(e) => setProviderFormData({ ...providerFormData, isEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#64748B] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3B82F6]"></div>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleSaveProvider}
                disabled={isLoading || !providerFormData.name}
                className="flex-1 px-5 py-2.5 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </button>
              <button
                onClick={() => {
                  setShowEditProviderModal(false);
                  setSelectedProvider(null);
                }}
                className="flex-1 px-5 py-2.5 rounded-lg bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.12)] text-white text-sm font-medium transition-colors"
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
