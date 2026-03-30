'use client';

import { useState } from "react";
import { toast } from 'sonner';
import { AdminDataTable } from '@/components/admin/data-table';
import { AdminPageHeader } from '@/components/admin/page-header';
import { AdminFilterBar } from '@/components/admin/filter-bar';
import { AdminSlideOver } from '@/components/admin/slide-over';
import { AdminModal } from '@/components/admin/modal';
import { AdminStatusBadge } from '@/components/admin/status-badge';
import { AdminFormInput, AdminFormSelect } from '@/components/admin/form-input';
import { AdminFileUpload } from '@/components/admin/file-upload';
import { AdminMultiSelect } from '@/components/admin/multi-select';
import { AdminToggleSwitch } from '@/components/admin/toggle-switch';
import { Plus, Edit, Ban, Eye, Download, History, DollarSign, Key, UserCheck, Mail, Phone } from "lucide-react";

const initialUsersData = [
  {
    id: "U-10234",
    username: "john_doe",
    email: "john.doe@email.com",
    balance: "$125.50",
    status: "active",
    signupDate: "2024-01-15",
    referralEarnings: "$42.00",
  },
  {
    id: "U-10235",
    username: "jane_smith",
    email: "jane.smith@email.com",
    balance: "$89.30",
    status: "active",
    signupDate: "2024-02-03",
    referralEarnings: "$18.50",
  },
  {
    id: "U-10236",
    username: "mike_wilson",
    email: "mike.wilson@email.com",
    balance: "$0.00",
    status: "suspended",
    signupDate: "2024-01-22",
    referralEarnings: "$0.00",
  },
  {
    id: "U-10237",
    username: "sarah_jones",
    email: "sarah.jones@email.com",
    balance: "$245.80",
    status: "active",
    signupDate: "2024-02-10",
    referralEarnings: "$65.20",
  },
  {
    id: "U-10238",
    username: "alex_brown",
    email: "alex.brown@email.com",
    balance: "$56.40",
    status: "active",
    signupDate: "2024-02-18",
    referralEarnings: "$12.00",
  },
];

const columns = [
  { key: "id", label: "User ID", width: "10%" },
  { key: "username", label: "Username", width: "15%" },
  { key: "email", label: "Email", width: "20%" },
  { key: "balance", label: "Balance", width: "10%" },
  { key: "status", label: "Status", width: "10%" },
  { key: "signupDate", label: "Signup Date", width: "12%" },
  { key: "referralEarnings", label: "Referral Earnings", width: "13%" },
  { key: "actions", label: "Actions", width: "10%" },
];

export default function AdminUsersPage() {
  const [usersData, setUsersData] = useState(initialUsersData);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    balance: "",
    role: "",
    avatar: null as File | null,
    permissions: [] as string[],
    notificationsEnabled: true,
    accountStatus: true,
  });

  const roleOptions = [
    { value: "user", label: "Standard User" },
    { value: "vip", label: "VIP User" },
    { value: "admin", label: "Administrator" },
    { value: "moderator", label: "Moderator" },
  ];

  const permissionOptions = [
    { value: "sms_activation", label: "SMS Activation" },
    { value: "api_access", label: "API Access" },
    { value: "bulk_operations", label: "Bulk Operations" },
    { value: "priority_support", label: "Priority Support" },
  ];

  const [balanceAdjustment, setBalanceAdjustment] = useState({
    amount: "",
    type: "add",
  });

  // Add user handler
  const handleAddUser = async () => {
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newUserData = {
      id: `U-${10239 + usersData.length}`,
      username: newUser.username,
      email: newUser.email,
      balance: `$${newUser.balance || "0.00"}`,
      status: newUser.accountStatus ? "active" : "suspended",
      signupDate: new Date().toISOString().split("T")[0],
      referralEarnings: "$0.00",
    };

    setUsersData([...usersData, newUserData]);
    setIsAddModalOpen(false);
    setNewUser({
      username: "",
      email: "",
      phone: "",
      password: "",
      balance: "",
      role: "",
      avatar: null,
      permissions: [],
      notificationsEnabled: true,
      accountStatus: true,
    });
    setIsLoading(false);
    toast.success("User created successfully!");
  };

  // Edit user handler
  const handleEditUser = async () => {
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    setUsersData(
      usersData.map((user) =>
        user.id === selectedUser.id ? { ...selectedUser } : user
      )
    );

    setIsEditModalOpen(false);
    setIsLoading(false);
    toast.success("User updated successfully!");
  };

  // Suspend user handler
  const handleSuspendUser = async () => {
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    setUsersData(
      usersData.map((user) =>
        user.id === selectedUser.id
          ? { ...user, status: user.status === "active" ? "suspended" : "active" }
          : user
      )
    );

    setIsSuspendModalOpen(false);
    setIsLoading(false);
    const action = selectedUser.status === "active" ? "suspended" : "activated";
    toast.success(`User ${action} successfully!`);
  };

  // Adjust balance handler
  const handleAdjustBalance = async () => {
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const currentBalance = parseFloat(selectedUser.balance.replace("$", ""));
    const adjustAmount = parseFloat(balanceAdjustment.amount);
    const newBalance =
      balanceAdjustment.type === "add"
        ? currentBalance + adjustAmount
        : currentBalance - adjustAmount;

    setUsersData(
      usersData.map((user) =>
        user.id === selectedUser.id
          ? { ...user, balance: `$${newBalance.toFixed(2)}` }
          : user
      )
    );

    setIsBalanceModalOpen(false);
    setBalanceAdjustment({ amount: "", type: "add" });
    setIsLoading(false);
    toast.success("Balance adjusted successfully!");
  };

  const renderCell = (item: any, column: any) => {
    if (column.key === "status") {
      return <AdminStatusBadge status={item.status} />;
    }

    if (column.key === "actions") {
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedUser(item);
              setIsSlideOverOpen(true);
            }}
            className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors group"
            title="View User"
          >
            <Eye className="w-4 h-4 text-[#3B82F6] group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={() => {
              setSelectedUser(item);
              setIsEditModalOpen(true);
            }}
            className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors group"
            title="Edit User"
          >
            <Edit className="w-4 h-4 text-[#F59E0B] group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={() => {
              setSelectedUser(item);
              setIsSuspendModalOpen(true);
            }}
            className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors group"
            title={item.status === "active" ? "Suspend User" : "Activate User"}
          >
            {item.status === "active" ? (
              <Ban className="w-4 h-4 text-[#EF4444] group-hover:scale-110 transition-transform" />
            ) : (
              <UserCheck className="w-4 h-4 text-[#22C55E] group-hover:scale-110 transition-transform" />
            )}
          </button>
        </div>
      );
    }

    return item[column.key];
  };

  const filters = [
    {
      label: "Status",
      options: ["Active", "Suspended", "Inactive"],
    },
    {
      label: "Date Range",
      options: ["Last 7 days", "Last 30 days", "Last 90 days", "All time"],
    },
    {
      label: "Balance",
      options: ["$0 - $50", "$50 - $100", "$100 - $200", "$200+"],
    },
  ];

  return (
    <div className="p-4 lg:p-8">
      <AdminPageHeader
        title="User Management"
        description="Manage users, balances, and account permissions"
        primaryAction={{
          label: "Add User",
          onClick: () => setIsAddModalOpen(true),
          icon: <Plus className="w-5 h-5" />,
        }}
        secondaryActions={[
          {
            label: "Export",
            onClick: () => toast.info("Exporting users data..."),
            icon: <Download className="w-5 h-5" />,
          },
        ]}
      />

      <AdminFilterBar
        searchPlaceholder="Search users by name, email, or ID..."
        onSearch={(value) => console.log("Search:", value)}
        filters={filters}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />

      <AdminDataTable columns={columns} data={usersData} renderCell={renderCell} />

      <div className="flex flex-col lg:flex-row items-center justify-between mt-6 gap-4">
        <p className="text-[#94A3B8] text-sm">
          Showing 1 to {usersData.length} of {usersData.length} users
        </p>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white text-sm hover:bg-[rgba(255,255,255,0.12)] transition-colors">
            Previous
          </button>
          <button className="px-4 py-2 rounded-xl bg-[#3B82F6] text-white text-sm hover:brightness-110 transition-all">
            1
          </button>
          <button className="px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white text-sm hover:bg-[rgba(255,255,255,0.12)] transition-colors">
            2
          </button>
          <button className="px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white text-sm hover:bg-[rgba(255,255,255,0.12)] transition-colors">
            3
          </button>
          <button className="px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white text-sm hover:bg-[rgba(255,255,255,0.12)] transition-colors">
            Next
          </button>
        </div>
      </div>

      {/* User Details Slide-Over */}
      <AdminSlideOver
        isOpen={isSlideOverOpen}
        onClose={() => setIsSlideOverOpen(false)}
        title="User Details"
        footer={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSlideOverOpen(false)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white hover:bg-[rgba(255,255,255,0.12)] transition-colors text-sm font-medium"
            >
              Close
            </button>
            <button
              onClick={() => {
                setIsSlideOverOpen(false);
                setIsEditModalOpen(true);
              }}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors"
            >
              Edit User
            </button>
          </div>
        }
      >
        {selectedUser && (
          <div className="space-y-6">
            {/* User Info */}
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">
                Account Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[#94A3B8] text-sm">User ID</label>
                  <p className="text-white mt-1">{selectedUser.id}</p>
                </div>
                <div>
                  <label className="text-[#94A3B8] text-sm">Username</label>
                  <p className="text-white mt-1">{selectedUser.username}</p>
                </div>
                <div>
                  <label className="text-[#94A3B8] text-sm">Email</label>
                  <p className="text-white mt-1">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-[#94A3B8] text-sm">Status</label>
                  <div className="mt-1">
                    <AdminStatusBadge status={selectedUser.status} />
                  </div>
                </div>
                <div>
                  <label className="text-[#94A3B8] text-sm">Signup Date</label>
                  <p className="text-white mt-1">{selectedUser.signupDate}</p>
                </div>
              </div>
            </div>

            {/* Financial Info */}
            <div className="pt-6 border-t border-[rgba(255,255,255,0.18)]">
              <h3 className="text-white text-lg font-semibold mb-4">
                Financial Information
              </h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.2)]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8] text-sm">
                      Current Balance
                    </span>
                    <DollarSign className="w-5 h-5 text-[#3B82F6]" />
                  </div>
                  <p className="text-white text-2xl font-semibold mt-2">
                    {selectedUser.balance}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8] text-sm">
                      Referral Earnings
                    </span>
                    <History className="w-5 h-5 text-[#22C55E]" />
                  </div>
                  <p className="text-white text-2xl font-semibold mt-2">
                    {selectedUser.referralEarnings}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-6 border-t border-[rgba(255,255,255,0.18)]">
              <h3 className="text-white text-lg font-semibold mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setIsSlideOverOpen(false);
                    setIsBalanceModalOpen(true);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white transition-colors"
                >
                  <DollarSign className="w-5 h-5 text-[#3B82F6]" />
                  <span className="text-sm font-medium">Adjust Balance</span>
                </button>
                <button
                  onClick={() => toast.info("Password reset email sent!")}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white transition-colors"
                >
                  <Key className="w-5 h-5 text-[#F59E0B]" />
                  <span className="text-sm font-medium">Reset Password</span>
                </button>
                <button
                  onClick={() => toast.info("Viewing activation history...")}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white transition-colors"
                >
                  <History className="w-5 h-5 text-[#8B5CF6]" />
                  <span className="text-sm font-medium">
                    View Activation History
                  </span>
                </button>
                <button
                  onClick={() => {
                    setIsSlideOverOpen(false);
                    setIsSuspendModalOpen(true);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-[rgba(239,68,68,0.1)] hover:bg-[rgba(239,68,68,0.15)] border border-[rgba(239,68,68,0.2)] text-[#EF4444] transition-colors"
                >
                  <Ban className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    {selectedUser.status === "active"
                      ? "Suspend Account"
                      : "Activate Account"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminSlideOver>

      {/* Add User Modal */}
      <AdminModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New User"
        primaryAction={{
          label: "Create User",
          onClick: handleAddUser,
          loading: isLoading,
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setIsAddModalOpen(false),
        }}
      >
        <div className="space-y-4">
          <AdminFormInput
            label="Username"
            name="username"
            value={newUser.username}
            onChange={(value) => setNewUser({ ...newUser, username: value })}
            placeholder="Enter username"
            required
            error={!newUser.username ? "Username is required" : ""}
          />
          <AdminFormInput
            label="Email"
            name="email"
            type="email"
            value={newUser.email}
            onChange={(value) => setNewUser({ ...newUser, email: value })}
            placeholder="user@example.com"
            required
            error={!newUser.email ? "Email is required" : ""}
          />
          <AdminFormInput
            label="Phone"
            name="phone"
            type="tel"
            value={newUser.phone}
            onChange={(value) => setNewUser({ ...newUser, phone: value })}
            placeholder="123-456-7890"
          />
          <AdminFormInput
            label="Password"
            name="password"
            type="password"
            value={newUser.password}
            onChange={(value) => setNewUser({ ...newUser, password: value })}
            placeholder="Enter password"
            required
            error={!newUser.password ? "Password is required" : ""}
          />
          <AdminFormInput
            label="Initial Balance"
            name="balance"
            type="number"
            value={newUser.balance}
            onChange={(value) => setNewUser({ ...newUser, balance: value })}
            placeholder="0.00"
            required
            icon={<DollarSign className="w-5 h-5" />}
          />
          <AdminFormSelect
            label="Role"
            name="role"
            value={newUser.role}
            onChange={(value) => setNewUser({ ...newUser, role: value })}
            options={roleOptions}
            required
          />
          <AdminFileUpload
            label="Avatar"
            name="avatar"
            value={newUser.avatar}
            onChange={(value) => setNewUser({ ...newUser, avatar: value })}
          />
          <AdminMultiSelect
            label="Permissions"
            name="permissions"
            value={newUser.permissions}
            onChange={(value) => setNewUser({ ...newUser, permissions: value })}
            options={permissionOptions}
          />
          <AdminToggleSwitch
            label="Notifications Enabled"
            name="notificationsEnabled"
            checked={newUser.notificationsEnabled}
            onChange={(value) => setNewUser({ ...newUser, notificationsEnabled: value })}
            description="Send email notifications to user"
          />
          <AdminToggleSwitch
            label="Account Status"
            name="accountStatus"
            checked={newUser.accountStatus}
            onChange={(value) => setNewUser({ ...newUser, accountStatus: value })}
            description="Active accounts can access the platform"
          />
        </div>
      </AdminModal>

      {/* Edit User Modal */}
      <AdminModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit User"
        primaryAction={{
          label: "Save Changes",
          onClick: handleEditUser,
          loading: isLoading,
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setIsEditModalOpen(false),
        }}
      >
        {selectedUser && (
          <div className="space-y-4">
            <AdminFormInput
              label="Username"
              name="username"
              value={selectedUser.username}
              onChange={(value) =>
                setSelectedUser({ ...selectedUser, username: value })
              }
              placeholder="Enter username"
              required
            />
            <AdminFormInput
              label="Email"
              name="email"
              type="email"
              value={selectedUser.email}
              onChange={(value) =>
                setSelectedUser({ ...selectedUser, email: value })
              }
              placeholder="user@example.com"
              required
            />
          </div>
        )}
      </AdminModal>

      {/* Suspend/Activate User Modal */}
      <AdminModal
        isOpen={isSuspendModalOpen}
        onClose={() => setIsSuspendModalOpen(false)}
        title={
          selectedUser?.status === "active" ? "Suspend User" : "Activate User"
        }
        primaryAction={{
          label: selectedUser?.status === "active" ? "Suspend" : "Activate",
          onClick: handleSuspendUser,
          loading: isLoading,
          variant: selectedUser?.status === "active" ? "danger" : "primary",
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setIsSuspendModalOpen(false),
        }}
      >
        <p className="text-[#94A3B8]">
          Are you sure you want to{" "}
          {selectedUser?.status === "active" ? "suspend" : "activate"}{" "}
          <span className="text-white font-medium">
            {selectedUser?.username}
          </span>
          ?
        </p>
        {selectedUser?.status === "active" && (
          <p className="text-[#EF4444] text-sm mt-4">
            This user will not be able to access their account until reactivated.
          </p>
        )}
      </AdminModal>

      {/* Adjust Balance Modal */}
      <AdminModal
        isOpen={isBalanceModalOpen}
        onClose={() => setIsBalanceModalOpen(false)}
        title="Adjust User Balance"
        primaryAction={{
          label: "Adjust Balance",
          onClick: handleAdjustBalance,
          loading: isLoading,
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setIsBalanceModalOpen(false),
        }}
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.18)]">
            <p className="text-[#94A3B8] text-sm">Current Balance</p>
            <p className="text-white text-2xl font-semibold mt-1">
              {selectedUser?.balance}
            </p>
          </div>
          <AdminFormSelect
            label="Action"
            name="type"
            value={balanceAdjustment.type}
            onChange={(value) =>
              setBalanceAdjustment({ ...balanceAdjustment, type: value })
            }
            options={[
              { value: "add", label: "Add to Balance" },
              { value: "subtract", label: "Subtract from Balance" },
            ]}
            required
          />
          <AdminFormInput
            label="Amount"
            name="amount"
            type="number"
            value={balanceAdjustment.amount}
            onChange={(value) =>
              setBalanceAdjustment({ ...balanceAdjustment, amount: value })
            }
            placeholder="0.00"
            required
            icon={<DollarSign className="w-5 h-5" />}
          />
        </div>
      </AdminModal>
    </div>
  );
}
