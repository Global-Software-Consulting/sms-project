'use client';

import { useState } from "react";
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
} from "lucide-react";

interface PaymentMethod {
  id: string;
  name: string;
  type: "crypto" | "card";
  status: "active" | "inactive";
  gateway: string;
  minAmount: number;
  bonusSettings: string;
  polygonWallet?: string;
  serviceFee?: string;
  extraSettings?: string;
}

interface PayGateProvider {
  id: string;
  name: string;
  code: string;
  description: string;
  order: number;
  enabled: boolean;
  provider: string;
  minAmount: number;
  maxAmount: number;
}

interface UserBalance {
  id: string;
  username: string;
  email: string;
  balance: number;
}

export default function AdminPaymentsPage() {
  const [activeTab, setActiveTab] = useState<
    "methods" | "paygate" | "card" | "guide" | "balances"
  >("methods");

  // Payment Methods State
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: "1",
      name: "Plisio - Crypto Payments BTC, USDT, ETH, LTC More",
      type: "crypto",
      status: "active",
      gateway: "plisio",
      minAmount: 1,
      bonusSettings: "$100 → 5% bonus",
      polygonWallet: "",
    },
    {
      id: "2",
      name: "HoodPay - Crypto Payments BTC, USDT, ETH, LTC More",
      type: "crypto",
      status: "inactive",
      gateway: "hoodpay",
      minAmount: 10,
      bonusSettings: "$100 → 7% bonus",
      polygonWallet: "25944",
      serviceFee: "10% fee (e.g., $100 → $110.00)",
    },
    {
      id: "3",
      name: "NOWPayments - Crypto Payments BTC, USDT, ETH, LTC More",
      type: "crypto",
      status: "active",
      gateway: "nowpayment",
      minAmount: 1,
      bonusSettings: "$100 → 6% bonus",
    },
    {
      id: "4",
      name: "ChangeNOW",
      type: "crypto",
      status: "inactive",
      gateway: "changenow",
      minAmount: 10,
      bonusSettings: "$50 → 7% bonus, $100 → 10% bonus",
      polygonWallet: "0x5E10586f92c210f6f2B6E637cE4EaE5f8D0F56D380f6",
    },
    {
      id: "5",
      name: "Cryptomus",
      type: "crypto",
      status: "inactive",
      gateway: "cryptomus",
      minAmount: 1,
      bonusSettings: "$100 → 8% bonus, $100 → 10% bonus",
      polygonWallet: "a9ea35254e69b8d11b271106e59c8711067110680126",
    },
    {
      id: "6",
      name: "Secure Card Payments (Powered by Stripe)",
      type: "card",
      status: "inactive",
      gateway: "stripe",
      minAmount: 1,
      bonusSettings: "$100 → 10% bonus",
    },
    {
      id: "7",
      name: "Volet payment",
      type: "crypto",
      status: "inactive",
      gateway: "volet",
      minAmount: 1,
      bonusSettings: "",
    },
    {
      id: "8",
      name: "Secure Payment Options Visa, MasterCard, PayPal",
      type: "card",
      status: "active",
      gateway: "paygate-multi",
      minAmount: 5,
      bonusSettings: "$50 → 5% bonus",
    },
    {
      id: "9",
      name: "Binance Internal Transfer",
      type: "crypto",
      status: "inactive",
      gateway: "binance",
      minAmount: 1,
      bonusSettings: "$100 → 5% bonus",
    },
  ]);

  const [showMethodModal, setShowMethodModal] = useState(false);
  const [showEditMethodModal, setShowEditMethodModal] = useState(false);
  const [showDeleteMethodModal, setShowDeleteMethodModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [methodFormData, setMethodFormData] = useState({
    name: "",
    type: "crypto" as "crypto" | "card",
    status: "active" as "active" | "inactive",
    gateway: "",
    minAmount: 1,
    bonusSettings: "",
    polygonWallet: "",
    serviceFee: "",
  });

  // PayGate Providers State
  const [payGateProviders, setPayGateProviders] = useState<PayGateProvider[]>([
    {
      id: "1",
      name: "Multi Provider (Recommended)",
      code: "card-multi",
      description: "Automatically selects the best payment provider for your region",
      order: 2,
      enabled: true,
      provider: "auto",
      minAmount: 1,
      maxAmount: 10000,
    },
    {
      id: "2",
      name: "Bitnovo",
      code: "card-bitnovo",
      description: "Credit/Debit Card - Europe, Latin America (Spain, Portugal, Italy, France, Mexico)",
      order: 3,
      enabled: true,
      provider: "bitnovo",
      minAmount: 10,
      maxAmount: 10000,
    },
    {
      id: "3",
      name: "Mercuryo",
      code: "card-mercuryo",
      description: "Credit/Debit Card - 180+ countries, Apple Pay, Google Pay",
      order: 4,
      enabled: true,
      provider: "mercuryo",
      minAmount: 20,
      maxAmount: 5000,
    },
    {
      id: "4",
      name: "Unlimint",
      code: "card-unlimint",
      description: "Credit/Debit Card - 150+ countries, local payment methods",
      order: 5,
      enabled: true,
      provider: "unlimint",
      minAmount: 10,
      maxAmount: 10000,
    },
    {
      id: "5",
      name: "Guardarian",
      code: "card-guardarian",
      description: "Credit/Debit Card - 170+ countries, 50+ payment methods, high limits",
      order: 6,
      enabled: true,
      provider: "guardarian",
      minAmount: 20,
      maxAmount: 500000,
    },
    {
      id: "6",
      name: "Wert",
      code: "card-wert",
      description: "Credit/Debit Card via Wert - Global coverage",
      order: 7,
      enabled: true,
      provider: "wert",
      minAmount: 30,
      maxAmount: 5000,
    },
    {
      id: "7",
      name: "Stripe Crypto.link.com (USA Only)",
      code: "card-stripe",
      description: "Credit/Debit Card via Stripe - US customers only",
      order: 8,
      enabled: true,
      provider: "stripe",
      minAmount: 5,
      maxAmount: 10000,
    },
    {
      id: "8",
      name: "Transfil",
      code: "card-transfil",
      description: "Credit/Debit Card via Transfil - Global coverage",
      order: 9,
      enabled: true,
      provider: "transfil",
      minAmount: 70,
      maxAmount: 5000,
    },
    {
      id: "9",
      name: "Ramp Network",
      code: "card-rampnetwork",
      description: "Credit/Debit Card via Ramp - EU, UK, US",
      order: 10,
      enabled: true,
      provider: "rampnetwork",
      minAmount: 5,
      maxAmount: 10000,
    },
  ]);

  // Card Payment State
  const [cardPaymentEnabled, setCardPaymentEnabled] = useState(false);

  // User Guide State
  const [guideTitle, setGuideTitle] = useState("Payment Information from backend");
  const [guideContent, setGuideContent] = useState(
    `<ul>\n<li><strong>Card:</strong> Pay Instantly with a credit/debit card via Stripe</li>\n<li><strong>Crypto:</strong> Pay with Bitcoin, Ethereum, USDT and more</li>\n<li><strong>New to Crypto?</strong> Use Coinbase or Binance to buy</li>\n<li>* Payment will show in open in a new tab</li>\n<li>from backend</li>\n</ul>`
  );

  // User Balances State
  const [userBalances, setUserBalances] = useState<UserBalance[]>([
    { id: "1", username: "Babra Latif", email: "babralalatif35@gmail.com", balance: 0 },
    { id: "2", username: "Hina Khalid", email: "gondaliahm112@gmail.com", balance: 0 },
    { id: "3", username: "Sheikh Rizwan", email: "sheikhrizwan.n3u@gmail.com", balance: 0 },
    { id: "4", username: "Mudasar Shakil", email: "mudassarshakil@gmail.com", balance: 0 },
    { id: "5", username: "Babra Lateef", email: "babra@goodfonconsulting.com", balance: 0 },
    { id: "6", username: "Azeem Rauf", email: "azeemrauf747a@gmail.com", balance: 105.92 },
    { id: "7", username: "Rimsha Shafique", email: "rimshashafique1997@gmail.com", balance: 0 },
    { id: "8", username: "Faizan Azam", email: "faizanazam6980@gmail.com", balance: 30982.18 },
    { id: "9", username: "Zeeshan Zia", email: "bighulkhulk@gmail.com", balance: 0 },
  ]);
  const [balanceSearchQuery, setBalanceSearchQuery] = useState("");
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserBalance | null>(null);
  const [newBalance, setNewBalance] = useState("");

  // Payment Method Handlers
  const handleAddMethod = () => {
    setMethodFormData({
      name: "",
      type: "crypto",
      status: "active",
      gateway: "",
      minAmount: 1,
      bonusSettings: "",
      polygonWallet: "",
      serviceFee: "",
    });
    setShowMethodModal(true);
  };

  const handleEditMethod = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setMethodFormData({
      name: method.name,
      type: method.type,
      status: method.status,
      gateway: method.gateway,
      minAmount: method.minAmount,
      bonusSettings: method.bonusSettings,
      polygonWallet: method.polygonWallet || "",
      serviceFee: method.serviceFee || "",
    });
    setShowEditMethodModal(true);
  };

  const handleDeleteMethod = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setShowDeleteMethodModal(true);
  };

  const handleSaveMethod = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (showMethodModal) {
      const newMethod: PaymentMethod = {
        id: Date.now().toString(),
        ...methodFormData,
      };
      setPaymentMethods([...paymentMethods, newMethod]);
      toast.success("Payment method added successfully!");
    } else if (showEditMethodModal && selectedMethod) {
      setPaymentMethods(
        paymentMethods.map((m) =>
          m.id === selectedMethod.id ? { ...m, ...methodFormData } : m
        )
      );
      toast.success("Payment method updated successfully!");
    }

    setIsLoading(false);
    setShowMethodModal(false);
    setShowEditMethodModal(false);
  };

  const handleConfirmDeleteMethod = async () => {
    if (!selectedMethod) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setPaymentMethods(paymentMethods.filter((m) => m.id !== selectedMethod.id));
    toast.success("Payment method deleted successfully!");

    setIsLoading(false);
    setShowDeleteMethodModal(false);
    setSelectedMethod(null);
  };

  // PayGate Provider Handlers
  const handleToggleProvider = (id: string) => {
    setPayGateProviders(
      payGateProviders.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
    toast.success("Provider status updated!");
  };

  // User Balance Handlers
  const handleUpdateBalance = (user: UserBalance) => {
    setSelectedUser(user);
    setNewBalance(user.balance.toString());
    setShowBalanceModal(true);
  };

  const handleSaveBalance = async () => {
    if (!selectedUser) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setUserBalances(
      userBalances.map((u) =>
        u.id === selectedUser.id ? { ...u, balance: parseFloat(newBalance) || 0 } : u
      )
    );

    toast.success("Balance updated successfully!");
    setIsLoading(false);
    setShowBalanceModal(false);
    setSelectedUser(null);
  };

  const filteredBalances = userBalances.filter(
    (user) =>
      user.username.toLowerCase().includes(balanceSearchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(balanceSearchQuery.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">👋</span>
          <h1 className="text-white text-3xl font-semibold">Welcome back, VIPSTORE</h1>
        </div>
        <p className="text-[#94A3B8] text-sm">Manage your account and track your orders</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab("methods")}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            activeTab === "methods"
              ? "bg-[rgba(59,130,246,0.2)] text-[#3B82F6]"
              : "text-[#94A3B8] hover:bg-[rgba(255,255,255,0.05)]"
          }`}
        >
          Payment Methods
        </button>
        <button
          onClick={() => setActiveTab("paygate")}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            activeTab === "paygate"
              ? "bg-[rgba(59,130,246,0.2)] text-[#3B82F6]"
              : "text-[#94A3B8] hover:bg-[rgba(255,255,255,0.05)]"
          }`}
        >
          PayGate Providers
        </button>
        <button
          onClick={() => setActiveTab("card")}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            activeTab === "card"
              ? "bg-[rgba(59,130,246,0.2)] text-[#3B82F6]"
              : "text-[#94A3B8] hover:bg-[rgba(255,255,255,0.05)]"
          }`}
        >
          Card Payment
        </button>
        <button
          onClick={() => setActiveTab("guide")}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            activeTab === "guide"
              ? "bg-[rgba(59,130,246,0.2)] text-[#3B82F6]"
              : "text-[#94A3B8] hover:bg-[rgba(255,255,255,0.05)]"
          }`}
        >
          User Guide
        </button>
        <button
          onClick={() => setActiveTab("balances")}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            activeTab === "balances"
              ? "bg-[rgba(59,130,246,0.2)] text-[#3B82F6]"
              : "text-[#94A3B8] hover:bg-[rgba(255,255,255,0.05)]"
          }`}
        >
          Users Balances
        </button>
      </div>

      {/* Payment Methods Tab */}
      {activeTab === "methods" && (
        <div>
          {/* Header */}
          <div className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-white text-xl font-semibold">Payment Methods Management</h2>
              <button
                onClick={handleAddMethod}
                className="px-5 py-2.5 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Payment Method
              </button>
            </div>
          </div>

          {/* Payment Method Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl hover:border-[rgba(59,130,246,0.5)] transition-all"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.3)]">
                    {method.type === "crypto" ? (
                      <Bitcoin className="w-5 h-5 text-[#F59E0B]" />
                    ) : (
                      <CreditCard className="w-5 h-5 text-[#3B82F6]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white text-sm font-semibold mb-2 line-clamp-2">
                      {method.name}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                        method.status === "active"
                          ? "bg-[#22C55E]/20 text-[#22C55E]"
                          : "bg-[#64748B]/20 text-[#64748B]"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          method.status === "active" ? "bg-[#22C55E]" : "bg-[#64748B]"
                        }`}
                      />
                      {method.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#64748B]">Gateway:</span>
                    <span className="text-[#3B82F6] font-medium">{method.gateway}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#64748B]">Min Amount:</span>
                    <span className="text-white font-medium">${method.minAmount}</span>
                  </div>
                  {method.bonusSettings && (
                    <div className="flex items-start justify-between text-xs">
                      <span className="text-[#64748B]">Bonus Settings:</span>
                      <span className="text-[#22C55E] font-medium text-right max-w-[60%]">
                        {method.bonusSettings}
                      </span>
                    </div>
                  )}
                  {method.polygonWallet && (
                    <div className="flex items-start justify-between text-xs">
                      <span className="text-[#64748B]">Polygon Wallet:</span>
                      <span className="text-white font-medium text-right max-w-[60%] truncate">
                        {method.polygonWallet}
                      </span>
                    </div>
                  )}
                  {method.serviceFee && (
                    <div className="flex items-start justify-between text-xs">
                      <span className="text-[#64748B]">Service Fee:</span>
                      <span className="text-[#F59E0B] font-medium text-right max-w-[60%]">
                        {method.serviceFee}
                      </span>
                    </div>
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
                    onClick={() => handleDeleteMethod(method)}
                    className="flex-1 px-4 py-2 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PayGate Providers Tab */}
      {activeTab === "paygate" && (
        <div>
          {/* Header */}
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
              <div className="flex items-center gap-2">
                <span>✓</span>
                <span>Click edit to customize</span>
              </div>
            </div>
          </div>

          {/* Providers List */}
          <div className="space-y-4">
            {payGateProviders
              .sort((a, b) => a.order - b.order)
              .map((provider) => (
                <div
                  key={provider.id}
                  className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl hover:border-[rgba(59,130,246,0.5)] transition-all"
                >
                  <div className="flex items-center gap-4">
                    {/* Drag Handle */}
                    <button className="p-2 text-[#64748B] hover:text-white cursor-move transition-colors">
                      <Grip className="w-5 h-5" />
                    </button>

                    {/* Icon */}
                    <div className="p-3 rounded-lg bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.3)]">
                      <CreditCard className="w-5 h-5 text-[#F59E0B]" />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-white text-base font-semibold">{provider.name}</h3>
                        {provider.name.includes("Recommended") && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-[rgba(34,197,94,0.2)] text-[#22C55E]">
                            card
                          </span>
                        )}
                      </div>
                      <p className="text-[#94A3B8] text-sm mb-2">{provider.description}</p>
                      <div className="flex items-center gap-4 text-xs text-[#64748B]">
                        <span>Code: {provider.code}</span>
                        <span>Provider: {provider.provider}</span>
                        <span>Min: ${provider.minAmount}</span>
                        {provider.maxAmount && <span>Max: ${provider.maxAmount.toLocaleString()}</span>}
                      </div>
                    </div>

                    {/* Order Badge */}
                    <div className="px-3 py-1.5 rounded-lg bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.3)]">
                      <span className="text-[#3B82F6] text-sm font-semibold">#{provider.order}</span>
                    </div>

                    {/* Toggle */}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={provider.enabled}
                        onChange={() => handleToggleProvider(provider.id)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#64748B] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3B82F6]"></div>
                    </label>

                    {/* Edit Button */}
                    <button className="p-2 hover:bg-[rgba(59,130,246,0.2)] rounded-lg text-[#3B82F6] transition-colors">
                      <Edit2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Card Payment Tab */}
      {activeTab === "card" && (
        <div>
          <div className="p-8 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-6 h-6 text-[#3B82F6]" />
              <h2 className="text-white text-xl font-semibold">Card Payment Settings</h2>
            </div>
            <p className="text-[#94A3B8] text-sm mb-8">
              Manage card payment options and settings
            </p>

            <div className="p-6 rounded-lg bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)]">
                  <CreditCard className="w-5 h-5 text-[#EF4444]" />
                </div>
                <div>
                  <h3 className="text-white text-base font-semibold mb-1">
                    Disable Card Payment
                  </h3>
                  <p className="text-[#64748B] text-sm">
                    Card payment is currently {cardPaymentEnabled ? "enabled" : "disabled"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setCardPaymentEnabled(!cardPaymentEnabled);
                  toast.success(
                    cardPaymentEnabled
                      ? "Card payment disabled"
                      : "Card payment enabled"
                  );
                }}
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
              Create and manage your user guide content with rich text editing
            </p>

            <div className="space-y-6">
              {/* Guide Title */}
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

              {/* Guide Content */}
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Guide Content</label>
                <div className="border border-[rgba(255,255,255,0.18)] rounded-lg overflow-hidden bg-[rgba(30,41,59,0.8)]">
                  {/* Toolbar */}
                  <div className="flex items-center gap-1 p-2 border-b border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.2)]">
                    <button className="p-2 hover:bg-[rgba(255,255,255,0.1)] rounded text-[#94A3B8] text-xs font-semibold">
                      B
                    </button>
                    <button className="p-2 hover:bg-[rgba(255,255,255,0.1)] rounded text-[#94A3B8] text-xs italic">
                      I
                    </button>
                    <div className="w-px h-6 bg-[rgba(255,255,255,0.1)] mx-1"></div>
                    <button className="p-2 hover:bg-[rgba(255,255,255,0.1)] rounded text-[#94A3B8]">
                      • List
                    </button>
                    <button className="p-2 hover:bg-[rgba(255,255,255,0.1)] rounded text-[#94A3B8]">
                      1. List
                    </button>
                  </div>

                  {/* Content Editor */}
                  <textarea
                    value={guideContent}
                    onChange={(e) => setGuideContent(e.target.value)}
                    className="w-full bg-transparent text-white text-sm p-4 focus:outline-none min-h-[300px] resize-none"
                    placeholder="Enter guide content..."
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-[rgba(255,255,255,0.1)]">
                <p className="text-[#64748B] text-xs">Last updated: 9/30/2025, 7:11:41 PM</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setGuideTitle("Payment Information from backend");
                      setGuideContent(
                        `<ul>\n<li><strong>Card:</strong> Pay Instantly with a credit/debit card via Stripe</li>\n<li><strong>Crypto:</strong> Pay with Bitcoin, Ethereum, USDT and more</li>\n<li><strong>New to Crypto?</strong> Use Coinbase or Binance to buy</li>\n<li>* Payment will show in open in a new tab</li>\n<li>from backend</li>\n</ul>`
                      );
                      toast.success("Guide reset to default");
                    }}
                    className="px-5 py-2.5 rounded-lg bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.12)] text-white text-sm font-medium transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => toast.success("Guide saved successfully!")}
                    className="px-5 py-2.5 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Guide
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Balances Tab */}
      {activeTab === "balances" && (
        <div>
          {/* Header */}
          <div className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl mb-6">
            <h2 className="text-white text-xl font-semibold mb-4">User Balances</h2>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                <input
                  type="text"
                  value={balanceSearchQuery}
                  onChange={(e) => setBalanceSearchQuery(e.target.value)}
                  placeholder="Search users by name, email, or username..."
                  className="w-full bg-[rgba(30,41,59,0.8)] border border-[rgba(255,255,255,0.18)] rounded-lg pl-12 pr-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                />
              </div>
              <button
                onClick={() => {
                  setBalanceSearchQuery("");
                  toast.success("Search cleared");
                }}
                className="px-5 py-3 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors"
              >
                Search
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.2)]">
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#94A3B8] uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#94A3B8] uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#94A3B8] uppercase tracking-wider">
                      Balance
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#94A3B8] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                  {filteredBalances.map((user) => (
                    <tr key={user.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-white text-sm font-medium">{user.username}</div>
                        <div className="text-[#64748B] text-xs">@{user.username.toLowerCase().replace(" ", "")}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-[#94A3B8] text-sm">{user.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white text-sm font-semibold">
                          ${user.balance.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toast.info(`Viewing history for ${user.username}`)}
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
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Payment Method Modal */}
      {(showMethodModal || showEditMethodModal) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F172A] border border-[rgba(255,255,255,0.1)] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-white text-xl font-semibold mb-6">
              {showMethodModal ? "Add Payment Method" : "Edit Payment Method"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Method Name</label>
                <input
                  type="text"
                  value={methodFormData.name}
                  onChange={(e) => setMethodFormData({ ...methodFormData, name: e.target.value })}
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  placeholder="Enter payment method name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Type</label>
                  <select
                    value={methodFormData.type}
                    onChange={(e) =>
                      setMethodFormData({ ...methodFormData, type: e.target.value as "crypto" | "card" })
                    }
                    className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  >
                    <option value="crypto">Crypto</option>
                    <option value="card">Card</option>
                  </select>
                </div>

                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Status</label>
                  <select
                    value={methodFormData.status}
                    onChange={(e) =>
                      setMethodFormData({
                        ...methodFormData,
                        status: e.target.value as "active" | "inactive",
                      })
                    }
                    className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Gateway</label>
                  <input
                    type="text"
                    value={methodFormData.gateway}
                    onChange={(e) => setMethodFormData({ ...methodFormData, gateway: e.target.value })}
                    className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                    placeholder="e.g., plisio, stripe"
                  />
                </div>

                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Min Amount ($)</label>
                  <input
                    type="number"
                    value={methodFormData.minAmount}
                    onChange={(e) =>
                      setMethodFormData({ ...methodFormData, minAmount: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                    placeholder="1"
                  />
                </div>
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">Bonus Settings</label>
                <input
                  type="text"
                  value={methodFormData.bonusSettings}
                  onChange={(e) => setMethodFormData({ ...methodFormData, bonusSettings: e.target.value })}
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  placeholder="e.g., $100 → 5% bonus"
                />
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">
                  Polygon Wallet Address (Optional)
                </label>
                <input
                  type="text"
                  value={methodFormData.polygonWallet}
                  onChange={(e) => setMethodFormData({ ...methodFormData, polygonWallet: e.target.value })}
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  placeholder="Enter wallet address"
                />
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">
                  Service Fee (Optional)
                </label>
                <input
                  type="text"
                  value={methodFormData.serviceFee}
                  onChange={(e) => setMethodFormData({ ...methodFormData, serviceFee: e.target.value })}
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  placeholder="e.g., 10% fee"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowMethodModal(false);
                  setShowEditMethodModal(false);
                }}
                className="px-5 py-2.5 rounded-lg bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.12)] text-white text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMethod}
                disabled={isLoading || !methodFormData.name || !methodFormData.gateway}
                className="px-5 py-2.5 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Saving..." : showMethodModal ? "Add Method" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Method Modal */}
      {showDeleteMethodModal && selectedMethod && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F172A] border border-[rgba(255,255,255,0.1)] rounded-xl p-6 w-full max-w-md">
            <h2 className="text-white text-xl font-semibold mb-4">Delete Payment Method</h2>
            <p className="text-[#94A3B8] text-sm mb-6">
              Are you sure you want to delete &quot;{selectedMethod.name}&quot;? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteMethodModal(false);
                  setSelectedMethod(null);
                }}
                className="px-5 py-2.5 rounded-lg bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.12)] text-white text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteMethod}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Balance Modal */}
      {showBalanceModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F172A] border border-[rgba(255,255,255,0.1)] rounded-xl p-6 w-full max-w-md">
            <h2 className="text-white text-xl font-semibold mb-4">Update Balance</h2>
            <p className="text-[#94A3B8] text-sm mb-6">
              Update balance for {selectedUser.username}
            </p>

            <div className="mb-6">
              <label className="text-white text-sm font-medium mb-2 block">New Balance ($)</label>
              <input
                type="number"
                step="0.01"
                value={newBalance}
                onChange={(e) => setNewBalance(e.target.value)}
                className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                placeholder="0.00"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowBalanceModal(false);
                  setSelectedUser(null);
                }}
                className="px-5 py-2.5 rounded-lg bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.12)] text-white text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBalance}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Updating..." : "Update Balance"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
