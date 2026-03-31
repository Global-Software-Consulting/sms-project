'use client';

import { useState, useEffect, useCallback } from "react";
import { AdminGlassCard } from "@/components/admin/glass-card";
import { AdminStatCard } from "@/components/admin/stat-card";
import { AdminDataTable } from "@/components/admin/data-table";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminModal } from "@/components/admin/modal";
import { toast } from "sonner";
import { Gift, DollarSign, Users, TrendingUp, Check, Eye, Wallet, Loader2 } from "lucide-react";
import {
  getAdminReferralStats,
  getAdminAffiliateProfiles,
  type AdminReferralStats,
  type AffiliateProfile,
} from '@/lib/api/adminReferralsApi';
import {
  getAdminPayments,
  type AdminPayment,
  type AdminPaymentQueryParams,
} from '@/lib/api/adminApi';

const affiliateColumns = [
  { key: "id", label: "ID", width: "8%" },
  { key: "user", label: "User", width: "15%" },
  { key: "referralLink", label: "Referral Link", width: "22%" },
  { key: "signups", label: "Signups", width: "10%" },
  { key: "earnings", label: "Earnings", width: "10%" },
  { key: "withdrawn", label: "Withdrawn", width: "10%" },
  { key: "pending", label: "Pending", width: "10%" },
  { key: "actions", label: "Actions", width: "10%" },
];

const withdrawalColumns = [
  { key: "id", label: "ID", width: "8%" },
  { key: "user", label: "Username", width: "12%" },
  { key: "gateway", label: "Gateway", width: "12%" },
  { key: "amount", label: "Amount", width: "10%" },
  { key: "status", label: "Status", width: "12%" },
  { key: "date", label: "Date", width: "14%" },
  { key: "actions", label: "Actions", width: "12%" },
];

export default function AdminReferralsPage() {
  // Stats
  const [stats, setStats] = useState<AdminReferralStats | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  // Affiliates
  const [affiliates, setAffiliates] = useState<AffiliateProfile[]>([]);
  const [isAffiliatesLoading, setIsAffiliatesLoading] = useState(true);

  // Payments/Withdrawals
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [isPaymentsLoading, setIsPaymentsLoading] = useState(true);

  // Modal state
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<AdminPayment | null>(null);
  const [isMarkPaidModalOpen, setIsMarkPaidModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const fetchPayments = useCallback(async () => {
    setIsPaymentsLoading(true);
    try {
      const response = await getAdminPayments({ limit: 50 } as AdminPaymentQueryParams);
      setPayments(response.data || []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch payments");
    } finally {
      setIsPaymentsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchAffiliates();
    fetchPayments();
  }, [fetchStats, fetchAffiliates, fetchPayments]);

  const handleMarkAsPaid = async () => {
    if (!selectedWithdrawal) return;
    setIsLoading(true);
    // TODO: integrate mark-as-paid API when available
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setPayments(
      payments.map((p) =>
        p.id === selectedWithdrawal.id ? { ...p, status: 'COMPLETED' as any } : p
      )
    );
    setIsLoading(false);
    setIsMarkPaidModalOpen(false);
    toast.success(`Payment ${selectedWithdrawal.id.slice(0, 8)} marked as paid!`);
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

    if (column.key === "actions") {
      return (
        <button
          className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors"
          title="View Details"
        >
          <Eye className="w-4 h-4 text-[#3B82F6]" />
        </button>
      );
    }

    return (item as any)[column.key];
  };

  const renderWithdrawalCell = (item: AdminPayment, column: any) => {
    if (column.key === "id") {
      return <span className="text-[#94A3B8] text-xs">{item.id.slice(0, 8)}</span>;
    }

    if (column.key === "user") {
      return (
        <span className="text-white text-sm">
          {item.user?.username || item.user?.email || "N/A"}
        </span>
      );
    }

    if (column.key === "gateway") {
      return (
        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getGatewayColor(item.gateway)}`}>
          {item.gateway}
        </span>
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
            <button
              onClick={() => {
                setSelectedWithdrawal(item);
                setIsMarkPaidModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-[rgba(34,197,94,0.1)] hover:bg-[rgba(34,197,94,0.15)] text-[#22C55E] text-xs font-medium transition-colors flex items-center gap-1"
            >
              <Check className="w-3 h-3" />
              Mark Paid
            </button>
          )}
          {item.status === "COMPLETED" && (
            <span className="text-[#64748B] text-xs">Completed</span>
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

      {/* Affiliate Withdrawals Section */}
      <AdminGlassCard className="mb-6 lg:mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/20 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-[#F59E0B]" />
            </div>
            <div>
              <h3 className="text-white text-lg font-semibold">
                Affiliate Withdrawals
              </h3>
              <p className="text-[#64748B] text-sm">
                Manage withdrawal requests from affiliates
              </p>
            </div>
          </div>
        </div>

        {isPaymentsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-[#3B82F6] animate-spin" />
            <span className="ml-3 text-[#94A3B8]">Loading payments...</span>
          </div>
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center mb-4">
              <Wallet className="w-8 h-8 text-[#64748B]" />
            </div>
            <p className="text-white text-lg font-medium">No withdrawals found</p>
            <p className="text-[#94A3B8] text-sm mt-1">No withdrawal requests at the moment</p>
          </div>
        ) : (
          <AdminDataTable
            columns={withdrawalColumns}
            data={payments}
            renderCell={renderWithdrawalCell}
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
        onClose={() => setIsMarkPaidModalOpen(false)}
        title="Mark Payment as Paid"
        primaryAction={{
          label: "Mark as Paid",
          onClick: handleMarkAsPaid,
          loading: isLoading,
          variant: "primary",
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setIsMarkPaidModalOpen(false),
        }}
      >
        {selectedWithdrawal && (
          <div className="space-y-4">
            <p className="text-[#94A3B8]">
              Confirm that you have processed this payment:
            </p>

            <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.18)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8] text-sm">User:</span>
                <span className="text-white font-medium">
                  {selectedWithdrawal.user?.username || selectedWithdrawal.user?.email || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8] text-sm">Gateway:</span>
                <span className="text-white font-medium">
                  {selectedWithdrawal.gateway}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8] text-sm">Amount:</span>
                <span className="text-white font-medium">
                  {formatAmount(selectedWithdrawal.amount)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8] text-sm">Date:</span>
                <span className="text-white font-medium">
                  {new Date(selectedWithdrawal.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            <p className="text-[#64748B] text-sm">
              This action will mark the payment as completed. Make sure you
              have processed the payment before confirming.
            </p>
          </div>
        )}
      </AdminModal>
    </div>
  );
}