'use client';

import { useState, useEffect, useCallback } from "react";
import { AdminGlassCard } from "@/components/admin/glass-card";
import { AdminStatCard } from "@/components/admin/stat-card";
import { AdminDataTable } from "@/components/admin/data-table";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminModal } from "@/components/admin/modal";
import { toast } from "sonner";
import { Gift, DollarSign, Users, TrendingUp, Check, Eye, Wallet, Loader2, X, Copy, Bitcoin, RefreshCw, Save, Settings } from "lucide-react";
import {
  getAdminReferralStats,
  getAdminAffiliateProfiles,
  getAdminPayouts,
  markPayoutAsPaid,
  rejectPayout,
  getReferralSettings,
  updateReferralSettings,
  type AdminReferralStats,
  type AffiliateProfile,
  type AdminPayout,
  type AdminPayoutQueryParams,
  type ReferralSettings,
} from '@/lib/api/adminReferralsApi';

const affiliateColumns = [
  { key: "id", label: "ID", width: "6%" },
  { key: "user", label: "User", width: "14%" },
  { key: "referralLink", label: "Referral Link", width: "14%" },
  { key: "signups", label: "Signups", width: "8%" },
  { key: "earnings", label: "Earnings", width: "9%" },
  { key: "withdrawn", label: "Withdrawn", width: "9%" },
  { key: "pending", label: "Pending", width: "9%" },
  { key: "cryptoAddresses", label: "Crypto Addresses", width: "18%" },
  { key: "actions", label: "Actions", width: "8%" },
];

const payoutColumns = [
  { key: "id", label: "ID", width: "8%" },
  { key: "user", label: "User", width: "12%" },
  { key: "method", label: "Method", width: "12%" },
  { key: "cryptoDetails", label: "Crypto Details", width: "20%" },
  { key: "amount", label: "Amount", width: "10%" },
  { key: "status", label: "Status", width: "10%" },
  { key: "date", label: "Date", width: "12%" },
  { key: "actions", label: "Actions", width: "12%" },
];

export default function AdminReferralsPage() {
  // Settings
  const [settings, setSettings] = useState<ReferralSettings | null>(null);
  const [commissionRate, setCommissionRate] = useState('10');
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Stats
  const [stats, setStats] = useState<AdminReferralStats | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  // Affiliates
  const [affiliates, setAffiliates] = useState<AffiliateProfile[]>([]);
  const [isAffiliatesLoading, setIsAffiliatesLoading] = useState(true);

  // Payouts (referral payouts, not general payments)
  const [payouts, setPayouts] = useState<AdminPayout[]>([]);
  const [isPayoutsLoading, setIsPayoutsLoading] = useState(true);

  // Modal state
  const [selectedPayout, setSelectedPayout] = useState<AdminPayout | null>(null);
  const [selectedAffiliate, setSelectedAffiliate] = useState<AffiliateProfile | null>(null);
  const [isMarkPaidModalOpen, setIsMarkPaidModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isAffiliateDetailModalOpen, setIsAffiliateDetailModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [externalReference, setExternalReference] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchSettings = useCallback(async () => {
    setIsSettingsLoading(true);
    try {
      const data = await getReferralSettings();
      setSettings(data);
      setCommissionRate(String(data.defaultCommissionRate || 10));
    } catch (error: any) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setIsSettingsLoading(false);
    }
  }, []);

  const handleSaveSettings = async () => {
    const rate = parseFloat(commissionRate);
    if (isNaN(rate) || rate < 1 || rate > 50) {
      toast.error("Commission rate must be between 1 and 50");
      return;
    }
    setIsSavingSettings(true);
    try {
      const updated = await updateReferralSettings({ defaultCommissionRate: rate });
      setSettings(updated);
      toast.success("Settings saved successfully!");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save settings");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleRefreshSettings = () => {
    fetchSettings();
    toast.success("Settings refreshed!");
  };

  const fetchStats = useCallback(async () => {
    setIsStatsLoading(true);
    try {
      const data = await getAdminReferralStats();
      setStats(data);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch referral stats");
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  const fetchAffiliates = useCallback(async () => {
    setIsAffiliatesLoading(true);
    try {
      const response = await getAdminAffiliateProfiles({ limit: 50 });
      setAffiliates(response.data || []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch affiliates");
    } finally {
      setIsAffiliatesLoading(false);
    }
  }, []);

  const fetchPayouts = useCallback(async () => {
    setIsPayoutsLoading(true);
    try {
      const response = await getAdminPayouts({ limit: 50 } as AdminPayoutQueryParams);
      setPayouts(response.data || []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch payouts");
    } finally {
      setIsPayoutsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    fetchStats();
    fetchAffiliates();
    fetchPayouts();
  }, [fetchSettings, fetchStats, fetchAffiliates, fetchPayouts]);

  const handleMarkAsPaid = async () => {
    if (!selectedPayout) return;
    setIsLoading(true);
    try {
      await markPayoutAsPaid(selectedPayout.id, externalReference || undefined);
      setPayouts(
        payouts.map((p) =>
          p.id === selectedPayout.id ? { ...p, status: 'COMPLETED' } : p
        )
      );
      setIsMarkPaidModalOpen(false);
      setExternalReference('');
      toast.success(`Payout ${selectedPayout.id.slice(0, 8)} marked as paid!`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to mark as paid");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectPayout = async () => {
    if (!selectedPayout || !rejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    setIsLoading(true);
    try {
      await rejectPayout(selectedPayout.id, rejectReason);
      setPayouts(
        payouts.map((p) =>
          p.id === selectedPayout.id ? { ...p, status: 'CANCELLED' } : p
        )
      );
      setIsRejectModalOpen(false);
      setRejectReason('');
      toast.success(`Payout ${selectedPayout.id.slice(0, 8)} rejected!`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to reject payout");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const formatAmount = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `$${num.toFixed(2)}`;
  };

const getGatewayColor = (gateway: string) => {
    const colors: Record<string, string> = {
      STRIPE: "bg-[#6366F1]/20 text-[#6366F1]",
      PAYGATE: "bg-[#22C55E]/20 text-[#22C55E]",
      PLISIO: "bg-[#F59E0B]/20 text-[#F59E0B]",
      CRYPTOMUS: "bg-[#8B5CF6]/20 text-[#8B5CF6]",
      NOWPAYMENTS: "bg-[#3B82F6]/20 text-[#3B82F6]",
      VOLET: "bg-[#EC4899]/20 text-[#EC4899]",
      BINANCE: "bg-[#F59E0B]/20 text-[#F59E0B]",
    };
    return colors[gateway] || "bg-[#64748B]/20 text-[#64748B]";
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-[#F59E0B]/20 text-[#F59E0B]",
      PROCESSING: "bg-[#3B82F6]/20 text-[#3B82F6]",
      COMPLETED: "bg-[#22C55E]/20 text-[#22C55E]",
      FAILED: "bg-[#EF4444]/20 text-[#EF4444]",
      EXPIRED: "bg-[#64748B]/20 text-[#64748B]",
      REFUNDED: "bg-[#8B5CF6]/20 text-[#8B5CF6]",
      CANCELLED: "bg-[#64748B]/20 text-[#64748B]",
    };
    return colors[status] || "bg-[#64748B]/20 text-[#64748B]";
  };

  const renderAffiliateCell = (item: AffiliateProfile, column: any) => {
    if (column.key === "id") {
      return <span className="text-[#94A3B8] text-xs">{item.referralCode || item.id.slice(0, 8)}</span>;
    }

    if (column.key === "user") {
      return <span className="text-white text-sm">{item.userName || item.userEmail || "N/A"}</span>;
    }

    if (column.key === "referralLink") {
      return <span className="text-white text-sm">smsportal.com/r/{item.referralCode}</span>;
    }

    if (column.key === "signups") {
      return <span className="text-white">{item.totalReferrals}</span>;
    }

    if (column.key === "earnings") {
      return <span className="text-white">{formatAmount(item.totalEarnings)}</span>;
    }

    if (column.key === "withdrawn") {
      return <span className="text-white">{formatAmount(item.paidEarnings)}</span>;
    }

    if (column.key === "pending") {
      return <span className="text-white">{formatAmount(item.pendingEarnings)}</span>;
    }

    if (column.key === "cryptoAddresses") {
      const addresses = [
        { label: 'USDT', value: item.cryptoAddressUsdt },
        { label: 'SOL', value: item.cryptoAddressSol },
        { label: 'TRX', value: item.cryptoAddressTrx },
        { label: 'LTC', value: item.cryptoAddressLtc },
      ].filter(a => a.value);
      
      if (addresses.length === 0) {
        return <span className="text-[#64748B] text-xs">No addresses</span>;
      }
      
      return (
        <div className="flex flex-col gap-1">
          {addresses.map((addr, idx) => (
            <div key={idx} className="flex items-center gap-1">
              <span className="text-[#8B5CF6] text-xs font-medium">{addr.label}:</span>
              <span className="text-white text-xs truncate max-w-[100px]" title={addr.value!}>
                {addr.value!.slice(0, 6)}...{addr.value!.slice(-4)}
              </span>
              <button
                onClick={() => copyToClipboard(addr.value!)}
                className="p-0.5 hover:bg-[rgba(255,255,255,0.08)] rounded"
                title="Copy address"
              >
                <Copy className="w-3 h-3 text-[#3B82F6]" />
              </button>
            </div>
          ))}
        </div>
      );
    }

    if (column.key === "actions") {
      return (
        <button
          onClick={() => {
            setSelectedAffiliate(item);
            setIsAffiliateDetailModalOpen(true);
          }}
          className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors"
          title="View Details"
        >
          <Eye className="w-4 h-4 text-[#3B82F6]" />
        </button>
      );
    }

    return (item as any)[column.key];
  };

  const renderPayoutCell = (item: AdminPayout, column: any) => {
    if (column.key === "id") {
      return <span className="text-[#94A3B8] text-xs">{item.id.slice(0, 8)}</span>;
    }

    if (column.key === "user") {
      return (
        <span className="text-white text-sm">
          {item.userName || item.userEmail || "N/A"}
        </span>
      );
    }

    if (column.key === "method") {
      const methodColor = item.method === 'CRYPTO' 
        ? "bg-[#8B5CF6]/20 text-[#8B5CF6]"
        : "bg-[#3B82F6]/20 text-[#3B82F6]";
      return (
        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${methodColor}`}>
          {item.method}
        </span>
      );
    }

    if (column.key === "cryptoDetails") {
      if (item.method !== 'CRYPTO' || !item.walletAddress) {
        return <span className="text-[#64748B] text-xs">N/A</span>;
      }
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <span className="text-[#8B5CF6] text-xs font-medium">{item.cryptoCurrency || 'CRYPTO'}:</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-white text-xs truncate max-w-[120px]" title={item.walletAddress}>
              {item.walletAddress.slice(0, 8)}...{item.walletAddress.slice(-6)}
            </span>
            <button
              onClick={() => copyToClipboard(item.walletAddress!)}
              className="p-0.5 hover:bg-[rgba(255,255,255,0.08)] rounded"
              title="Copy address"
            >
              <Copy className="w-3 h-3 text-[#3B82F6]" />
            </button>
          </div>
        </div>
      );
    }

    if (column.key === "amount") {
      return <span className="text-white font-medium">{formatAmount(item.amount)}</span>;
    }

    if (column.key === "status") {
      return (
        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getStatusColor(item.status)}`}>
          {item.status}
        </span>
      );
    }

    if (column.key === "date") {
      return (
        <span className="text-white text-sm">
          {new Date(item.createdAt).toLocaleDateString()}
        </span>
      );
    }

    if (column.key === "actions") {
      return (
        <div className="flex items-center gap-2">
          {item.status === "PENDING" && (
            <>
              <button
                onClick={() => {
                  setSelectedPayout(item);
                  setIsMarkPaidModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-[rgba(34,197,94,0.1)] hover:bg-[rgba(34,197,94,0.15)] text-[#22C55E] text-xs font-medium transition-colors flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                Mark Paid
              </button>
              <button
                onClick={() => {
                  setSelectedPayout(item);
                  setIsRejectModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-[rgba(239,68,68,0.1)] hover:bg-[rgba(239,68,68,0.15)] text-[#EF4444] text-xs font-medium transition-colors flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Reject
              </button>
            </>
          )}
          {item.status === "COMPLETED" && (
            <span className="text-[#22C55E] text-xs">Paid</span>
          )}
          {item.status === "CANCELLED" && (
            <span className="text-[#64748B] text-xs">Rejected</span>
          )}
        </div>
      );
    }

    return (item as any)[column.key];
  };

  return (
    <div className="p-4 lg:p-8">
      <AdminPageHeader
        title="Affiliate Management"
        description="Manage affiliate program, referrals, and crypto withdrawals"
      />

      {/* Commission Percentage Settings - Like CheapStreamTV */}
      <AdminGlassCard className="mb-6 lg:mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center">
            <Settings className="w-5 h-5 text-[#3B82F6]" />
          </div>
          <div>
            <h3 className="text-white text-lg font-semibold">Affiliate Management</h3>
            <p className="text-[#64748B] text-sm">
              Set the commission percentage that referrers earn on a referred user's first completed order.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <label className="text-[#94A3B8] text-sm whitespace-nowrap">Commission Percentage</label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="50"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                disabled={isSettingsLoading}
                className="w-24 px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.18)] text-white text-center focus:outline-none focus:border-[#3B82F6] disabled:opacity-50"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] text-sm pointer-events-none">%</span>
            </div>
            <span className="text-[#64748B] text-sm">of order total</span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleRefreshSettings}
              disabled={isSettingsLoading}
              className="px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.18)] text-white hover:bg-[rgba(255,255,255,0.1)] transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSettingsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleSaveSettings}
              disabled={isSavingSettings || isSettingsLoading}
              className="px-4 py-2.5 rounded-xl bg-[#3B82F6] text-white hover:bg-[#2563EB] transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isSavingSettings ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save
            </button>
          </div>
        </div>
      </AdminGlassCard>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <AdminStatCard
          title="Total Affiliates"
          value={isStatsLoading ? "..." : String(stats?.totalAffiliates ?? 0)}
          icon={<Users className="w-6 h-6 text-[#3B82F6]" />}
        />
        <AdminStatCard
          title="Total Referrals"
          value={isStatsLoading ? "..." : String(stats?.totalReferrals ?? 0)}
          icon={<TrendingUp className="w-6 h-6 text-[#22C55E]" />}
        />
        <AdminStatCard
          title="Total Commissions Paid"
          value={isStatsLoading ? "..." : formatAmount(stats?.totalCommissionsPaid ?? 0)}
          icon={<DollarSign className="w-6 h-6 text-[#F59E0B]" />}
        />
        <AdminStatCard
          title="Pending Commissions"
          value={isStatsLoading ? "..." : formatAmount(stats?.pendingCommissions ?? 0)}
          icon={<Wallet className="w-6 h-6 text-[#8B5CF6]" />}
        />
      </div>

      {/* Crypto Payout Requests Section */}
      <AdminGlassCard className="mb-6 lg:mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#8B5CF6]/20 flex items-center justify-center">
              <Bitcoin className="w-6 h-6 text-[#8B5CF6]" />
            </div>
            <div>
              <h3 className="text-white text-lg font-semibold">
                Crypto Payout Requests
              </h3>
              <p className="text-[#64748B] text-sm">
                View and process crypto withdrawal requests from affiliates
              </p>
            </div>
          </div>
        </div>

        {isPayoutsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-[#3B82F6] animate-spin" />
            <span className="ml-3 text-[#94A3B8]">Loading payouts...</span>
          </div>
        ) : payouts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center mb-4">
              <Bitcoin className="w-8 h-8 text-[#64748B]" />
            </div>
            <p className="text-white text-lg font-medium">No payout requests</p>
            <p className="text-[#94A3B8] text-sm mt-1">No crypto withdrawal requests at the moment</p>
          </div>
        ) : (
          <AdminDataTable
            columns={payoutColumns}
            data={payouts}
            renderCell={renderPayoutCell}
          />
        )}
      </AdminGlassCard>

      {/* Active Affiliates */}
      <AdminGlassCard>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center">
              <Gift className="w-6 h-6 text-[#3B82F6]" />
            </div>
            <div>
              <h3 className="text-white text-lg font-semibold">
                Active Affiliates
              </h3>
              <p className="text-[#64748B] text-sm">
                View all affiliate performance
              </p>
            </div>
          </div>
        </div>

        {isAffiliatesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-[#3B82F6] animate-spin" />
            <span className="ml-3 text-[#94A3B8]">Loading affiliates...</span>
          </div>
        ) : affiliates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center mb-4">
              <Gift className="w-8 h-8 text-[#64748B]" />
            </div>
            <p className="text-white text-lg font-medium">No affiliates found</p>
            <p className="text-[#94A3B8] text-sm mt-1">No active affiliates at the moment</p>
          </div>
        ) : (
          <AdminDataTable
            columns={affiliateColumns}
            data={affiliates}
            renderCell={renderAffiliateCell}
          />
        )}
      </AdminGlassCard>

      {/* Mark as Paid Modal */}
      <AdminModal
        isOpen={isMarkPaidModalOpen}
        onClose={() => {
          setIsMarkPaidModalOpen(false);
          setExternalReference('');
        }}
        title="Mark Payout as Paid"
        primaryAction={{
          label: "Mark as Paid",
          onClick: handleMarkAsPaid,
          loading: isLoading,
          variant: "primary",
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => {
            setIsMarkPaidModalOpen(false);
            setExternalReference('');
          },
        }}
      >
        {selectedPayout && (
          <div className="space-y-4">
            <p className="text-[#94A3B8]">
              Confirm that you have processed this crypto payout:
            </p>

            <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.18)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8] text-sm">User:</span>
                <span className="text-white font-medium">
                  {selectedPayout.userName || selectedPayout.userEmail || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8] text-sm">Method:</span>
                <span className="text-white font-medium">
                  {selectedPayout.method} {selectedPayout.cryptoCurrency && `(${selectedPayout.cryptoCurrency})`}
                </span>
              </div>
              {selectedPayout.walletAddress && (
                <div className="flex items-center justify-between">
                  <span className="text-[#94A3B8] text-sm">Wallet Address:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium text-xs">
                      {selectedPayout.walletAddress.slice(0, 10)}...{selectedPayout.walletAddress.slice(-8)}
                    </span>
                    <button
                      onClick={() => copyToClipboard(selectedPayout.walletAddress!)}
                      className="p-1 hover:bg-[rgba(255,255,255,0.08)] rounded"
                    >
                      <Copy className="w-3.5 h-3.5 text-[#3B82F6]" />
                    </button>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8] text-sm">Amount:</span>
                <span className="text-white font-medium">
                  {formatAmount(selectedPayout.amount)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8] text-sm">Date:</span>
                <span className="text-white font-medium">
                  {new Date(selectedPayout.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[#94A3B8] text-sm mb-2">
                Transaction ID / Reference (optional)
              </label>
              <input
                type="text"
                value={externalReference}
                onChange={(e) => setExternalReference(e.target.value)}
                placeholder="Enter transaction hash or reference"
                className="w-full px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.18)] text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#3B82F6]"
              />
            </div>

            <p className="text-[#64748B] text-sm">
              This action will mark the payout as completed. Make sure you
              have sent the crypto to the wallet address above.
            </p>
          </div>
        )}
      </AdminModal>

      {/* Reject Payout Modal */}
      <AdminModal
        isOpen={isRejectModalOpen}
        onClose={() => {
          setIsRejectModalOpen(false);
          setRejectReason('');
        }}
        title="Reject Payout Request"
        primaryAction={{
          label: "Reject Payout",
          onClick: handleRejectPayout,
          loading: isLoading,
          variant: "danger",
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => {
            setIsRejectModalOpen(false);
            setRejectReason('');
          },
        }}
      >
        {selectedPayout && (
          <div className="space-y-4">
            <p className="text-[#94A3B8]">
              Are you sure you want to reject this payout request?
            </p>

            <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.18)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8] text-sm">User:</span>
                <span className="text-white font-medium">
                  {selectedPayout.userName || selectedPayout.userEmail || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8] text-sm">Amount:</span>
                <span className="text-white font-medium">
                  {formatAmount(selectedPayout.amount)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[#94A3B8] text-sm mb-2">
                Rejection Reason <span className="text-red-400">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason for rejection"
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.18)] text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#3B82F6] resize-none"
              />
            </div>

            <p className="text-[#F59E0B] text-sm">
              The funds will be returned to the user's referral earnings balance.
            </p>
          </div>
        )}
      </AdminModal>

      {/* Affiliate Details Modal */}
      <AdminModal
        isOpen={isAffiliateDetailModalOpen}
        onClose={() => setIsAffiliateDetailModalOpen(false)}
        title="Affiliate Details"
        secondaryAction={{
          label: "Close",
          onClick: () => setIsAffiliateDetailModalOpen(false),
        }}
      >
        {selectedAffiliate && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.18)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8] text-sm">User:</span>
                <span className="text-white font-medium">
                  {selectedAffiliate.userName || selectedAffiliate.userEmail}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8] text-sm">Email:</span>
                <span className="text-white font-medium">
                  {selectedAffiliate.userEmail}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8] text-sm">Referral Code:</span>
                <span className="text-white font-medium">
                  {selectedAffiliate.referralCode}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8] text-sm">Tier:</span>
                <span className="text-white font-medium">
                  {selectedAffiliate.tier}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8] text-sm">Commission Rate:</span>
                <span className="text-white font-medium">
                  {selectedAffiliate.commissionRate}%
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.18)]">
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <Bitcoin className="w-4 h-4 text-[#8B5CF6]" />
                Crypto Addresses
              </h4>
              <div className="space-y-2">
                {selectedAffiliate.cryptoAddressUsdt && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#8B5CF6] text-sm font-medium">USDT TRC20:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white text-xs font-mono">
                        {selectedAffiliate.cryptoAddressUsdt.slice(0, 8)}...{selectedAffiliate.cryptoAddressUsdt.slice(-6)}
                      </span>
                      <button
                        onClick={() => copyToClipboard(selectedAffiliate.cryptoAddressUsdt!)}
                        className="p-1 hover:bg-[rgba(255,255,255,0.08)] rounded"
                      >
                        <Copy className="w-3.5 h-3.5 text-[#3B82F6]" />
                      </button>
                    </div>
                  </div>
                )}
                {selectedAffiliate.cryptoAddressSol && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#8B5CF6] text-sm font-medium">SOL:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white text-xs font-mono">
                        {selectedAffiliate.cryptoAddressSol.slice(0, 8)}...{selectedAffiliate.cryptoAddressSol.slice(-6)}
                      </span>
                      <button
                        onClick={() => copyToClipboard(selectedAffiliate.cryptoAddressSol!)}
                        className="p-1 hover:bg-[rgba(255,255,255,0.08)] rounded"
                      >
                        <Copy className="w-3.5 h-3.5 text-[#3B82F6]" />
                      </button>
                    </div>
                  </div>
                )}
                {selectedAffiliate.cryptoAddressTrx && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#8B5CF6] text-sm font-medium">TRX:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white text-xs font-mono">
                        {selectedAffiliate.cryptoAddressTrx.slice(0, 8)}...{selectedAffiliate.cryptoAddressTrx.slice(-6)}
                      </span>
                      <button
                        onClick={() => copyToClipboard(selectedAffiliate.cryptoAddressTrx!)}
                        className="p-1 hover:bg-[rgba(255,255,255,0.08)] rounded"
                      >
                        <Copy className="w-3.5 h-3.5 text-[#3B82F6]" />
                      </button>
                    </div>
                  </div>
                )}
                {selectedAffiliate.cryptoAddressLtc && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#8B5CF6] text-sm font-medium">LTC:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white text-xs font-mono">
                        {selectedAffiliate.cryptoAddressLtc.slice(0, 8)}...{selectedAffiliate.cryptoAddressLtc.slice(-6)}
                      </span>
                      <button
                        onClick={() => copyToClipboard(selectedAffiliate.cryptoAddressLtc!)}
                        className="p-1 hover:bg-[rgba(255,255,255,0.08)] rounded"
                      >
                        <Copy className="w-3.5 h-3.5 text-[#3B82F6]" />
                      </button>
                    </div>
                  </div>
                )}
                {!selectedAffiliate.cryptoAddressUsdt && !selectedAffiliate.cryptoAddressSol && 
                 !selectedAffiliate.cryptoAddressTrx && !selectedAffiliate.cryptoAddressLtc && (
                  <p className="text-[#64748B] text-sm">No crypto addresses configured</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-[rgba(34,197,94,0.1)] text-center">
                <p className="text-[#22C55E] text-lg font-bold">{formatAmount(selectedAffiliate.totalEarnings)}</p>
                <p className="text-[#64748B] text-xs">Total Earnings</p>
              </div>
              <div className="p-3 rounded-xl bg-[rgba(245,158,11,0.1)] text-center">
                <p className="text-[#F59E0B] text-lg font-bold">{formatAmount(selectedAffiliate.pendingEarnings)}</p>
                <p className="text-[#64748B] text-xs">Pending</p>
              </div>
              <div className="p-3 rounded-xl bg-[rgba(59,130,246,0.1)] text-center">
                <p className="text-[#3B82F6] text-lg font-bold">{formatAmount(selectedAffiliate.paidEarnings)}</p>
                <p className="text-[#64748B] text-xs">Paid</p>
              </div>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}