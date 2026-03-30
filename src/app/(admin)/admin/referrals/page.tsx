'use client';

import { useState } from "react";
import { AdminGlassCard } from "@/components/admin/glass-card";
import { AdminStatCard } from "@/components/admin/stat-card";
import { AdminDataTable } from "@/components/admin/data-table";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminModal } from "@/components/admin/modal";
import { toast } from "sonner";
import { Gift, DollarSign, Users, TrendingUp, Check, Eye, Wallet } from "lucide-react";

const referralsData = [
  {
    id: "REF-001",
    user: "john_doe",
    referralLink: "smsportal.com/r/johndoe",
    signups: 12,
    earnings: "$42.00",
    withdrawn: "$20.00",
    pending: "$22.00",
  },
  {
    id: "REF-002",
    user: "sarah_jones",
    referralLink: "smsportal.com/r/sarahjones",
    signups: 28,
    earnings: "$98.50",
    withdrawn: "$80.00",
    pending: "$18.50",
  },
  {
    id: "REF-003",
    user: "mike_wilson",
    referralLink: "smsportal.com/r/mikewilson",
    signups: 5,
    earnings: "$17.50",
    withdrawn: "$0.00",
    pending: "$17.50",
  },
  {
    id: "REF-004",
    user: "jane_smith",
    referralLink: "smsportal.com/r/janesmith",
    signups: 15,
    earnings: "$52.50",
    withdrawn: "$40.00",
    pending: "$12.50",
  },
];

const withdrawalRequests = [
  {
    id: "W-001",
    user: "sarah_jones",
    cryptoType: "USDT TRC20",
    walletAddress: "TXYZabcd1234567890efghijk",
    amount: "$18.50",
    status: "pending",
    date: "2026-03-27 09:30",
  },
  {
    id: "W-002",
    user: "mike_wilson",
    cryptoType: "SOL",
    walletAddress: "9WZCabcd1234567890efghijk",
    amount: "$17.50",
    status: "pending",
    date: "2026-03-27 08:45",
  },
  {
    id: "W-003",
    user: "john_doe",
    cryptoType: "TRX",
    walletAddress: "TABCdefgh1234567890ijklmn",
    amount: "$42.00",
    status: "paid",
    date: "2026-03-26 14:20",
  },
  {
    id: "W-004",
    user: "jane_smith",
    cryptoType: "LTC",
    walletAddress: "LTCxyz9876543210abcdefgh",
    amount: "$35.00",
    status: "pending",
    date: "2026-03-27 11:15",
  },
];

const columns = [
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
  { key: "cryptoType", label: "Crypto Type", width: "12%" },
  { key: "walletAddress", label: "Wallet Address", width: "20%" },
  { key: "amount", label: "Amount", width: "10%" },
  { key: "status", label: "Status", width: "12%" },
  { key: "date", label: "Date", width: "14%" },
  { key: "actions", label: "Actions", width: "12%" },
];

export default function AdminReferralsPage() {
  const [withdrawals, setWithdrawals] = useState(withdrawalRequests);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
  const [isMarkPaidModalOpen, setIsMarkPaidModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleMarkAsPaid = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setWithdrawals(
      withdrawals.map((w) =>
        w.id === selectedWithdrawal.id ? { ...w, status: "paid" } : w
      )
    );

    setIsLoading(false);
    setIsMarkPaidModalOpen(false);
    toast.success(`Withdrawal ${selectedWithdrawal.id} marked as paid!`);
  };

  const renderCell = (item: any, column: any) => {
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

    return item[column.key];
  };

  const renderWithdrawalCell = (item: any, column: any) => {
    if (column.key === "cryptoType") {
      const cryptoColors: Record<string, string> = {
        "USDT TRC20": "bg-[#22C55E]/20 text-[#22C55E]",
        SOL: "bg-[#8B5CF6]/20 text-[#8B5CF6]",
        TRX: "bg-[#EF4444]/20 text-[#EF4444]",
        LTC: "bg-[#3B82F6]/20 text-[#3B82F6]",
      };
      return (
        <span
          className={`px-3 py-1 rounded-lg text-xs font-medium ${
            cryptoColors[item.cryptoType] || "bg-[#64748B]/20 text-[#64748B]"
          }`}
        >
          {item.cryptoType}
        </span>
      );
    }

    if (column.key === "walletAddress") {
      return (
        <span className="text-white font-mono text-xs">
          {item.walletAddress.slice(0, 8)}...{item.walletAddress.slice(-6)}
        </span>
      );
    }

    if (column.key === "status") {
      return (
        <span
          className={`px-3 py-1 rounded-lg text-xs font-medium capitalize ${
            item.status === "paid"
              ? "bg-[#22C55E]/20 text-[#22C55E]"
              : "bg-[#F59E0B]/20 text-[#F59E0B]"
          }`}
        >
          {item.status}
        </span>
      );
    }

    if (column.key === "actions") {
      return (
        <div className="flex items-center gap-2">
          {item.status === "pending" && (
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
          {item.status === "paid" && (
            <span className="text-[#64748B] text-xs">Completed</span>
          )}
        </div>
      );
    }

    return item[column.key];
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
          value="4"
          icon={<Users className="w-6 h-6 text-[#3B82F6]" />}
        />
        <AdminStatCard
          title="Total Signups"
          value="60"
          icon={<TrendingUp className="w-6 h-6 text-[#22C55E]" />}
        />
        <AdminStatCard
          title="Total Earnings"
          value="$210.50"
          icon={<DollarSign className="w-6 h-6 text-[#F59E0B]" />}
        />
        <AdminStatCard
          title="Pending Withdrawals"
          value="3"
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
                Manage crypto withdrawal requests from affiliates
              </p>
            </div>
          </div>
        </div>

        <AdminDataTable
          columns={withdrawalColumns}
          data={withdrawals}
          renderCell={renderWithdrawalCell}
        />
      </AdminGlassCard>

      {/* Referrals List */}
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

        <AdminDataTable
          columns={columns}
          data={referralsData}
          renderCell={renderCell}
        />
      </AdminGlassCard>

      {/* Mark as Paid Modal */}
      <AdminModal
        isOpen={isMarkPaidModalOpen}
        onClose={() => setIsMarkPaidModalOpen(false)}
        title="Mark Withdrawal as Paid"
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
              Confirm that you have sent the crypto payment to the following
              address:
            </p>

            <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.18)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8] text-sm">User:</span>
                <span className="text-white font-medium">
                  {selectedWithdrawal.user}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8] text-sm">Crypto Type:</span>
                <span className="text-white font-medium">
                  {selectedWithdrawal.cryptoType}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8] text-sm">Amount:</span>
                <span className="text-white font-medium">
                  {selectedWithdrawal.amount}
                </span>
              </div>
              <div>
                <span className="text-[#94A3B8] text-sm block mb-2">
                  Wallet Address:
                </span>
                <div className="p-2 rounded-lg bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)]">
                  <span className="text-white font-mono text-xs break-all">
                    {selectedWithdrawal.walletAddress}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[#64748B] text-sm">
              This action will mark the withdrawal as completed. Make sure you
              have sent the funds before confirming.
            </p>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
