'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { AdminDataTable } from '@/components/admin/data-table';
import { AdminPageHeader } from '@/components/admin/page-header';
import { AdminFilterBar } from '@/components/admin/filter-bar';
import { AdminSlideOver } from '@/components/admin/slide-over';
import { AdminModal } from '@/components/admin/modal';
import { AdminStatusBadge } from '@/components/admin/status-badge';
import { AdminFormInput, AdminFormSelect } from '@/components/admin/form-input';
import {
  Edit,
  Ban,
  Eye,
  Download,
  DollarSign,
  Key,
  UserCheck,
  Shield,
  AlertTriangle,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mail,
  Phone,
  Globe,
  Calendar,
  LogIn,
  ShieldAlert,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  getAdminUsers,
  getAdminUser,
  updateAdminUser,
  deleteAdminUser,
  banUser,
  unbanUser,
  suspendUser,
  activateUser,
  changeUserRole,
  setUserLimits,
  setUserAbuseScore,
  type AdminUser,
  type AdminUserDetail,
  type AdminUserQueryParams,
  type AdminUsersResponse,
} from '@/lib/api/adminApi';
import { type UserRole, type UserStatus } from '@/lib/api/authApi';

const columns = [
  { key: 'id', label: 'User ID', width: '7%' },
  { key: 'username', label: 'Username', width: '11%' },
  { key: 'email', label: 'Email', width: '16%' },
  { key: 'role', label: 'Role', width: '7%' },
  { key: 'rank', label: 'Rank', width: '9%' },
  { key: 'status', label: 'Status', width: '8%' },
  { key: 'abuseScore', label: 'Abuse', width: '6%' },
  { key: 'lastLoginAt', label: 'Last Login', width: '11%' },
  { key: 'createdAt', label: 'Signup', width: '10%' },
  { key: 'actions', label: 'Actions', width: '15%' },
];

const statusVariantMap: Record<
  string,
  'success' | 'warning' | 'error' | 'info' | 'default'
> = {
  ACTIVE: 'success',
  INACTIVE: 'default',
  BANNED: 'error',
  SUSPENDED: 'warning',
  PENDING: 'info',
};

const roleColorMap: Record<string, string> = {
  OWNER: 'text-[#EF4444]',
  ADMIN: 'text-[#F59E0B]',
  MANAGER: 'text-[#8B5CF6]',
  FINANCE: 'text-[#22C55E]',
  SUPPORT: 'text-[#3B82F6]',
  VIEWER: 'text-[#94A3B8]',
  USER: 'text-white',
};

const roleOptions = [
  { value: 'USER', label: 'User' },
  { value: 'VIEWER', label: 'Viewer' },
  { value: 'SUPPORT', label: 'Support' },
  { value: 'FINANCE', label: 'Finance' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'OWNER', label: 'Owner' },
];

const statusFilterOptions = [
  'ACTIVE',
  'INACTIVE',
  'BANNED',
  'SUSPENDED',
  'PENDING',
];
const roleFilterOptions = [
  'USER',
  'VIEWER',
  'SUPPORT',
  'FINANCE',
  'MANAGER',
  'ADMIN',
  'OWNER',
];
const sortByOptions = [
  { value: 'createdAt', label: 'Signup Date' },
  { value: 'updatedAt', label: 'Updated At' },
  { value: 'email', label: 'Email' },
  { value: 'name', label: 'Name' },
  { value: 'lastLoginAt', label: 'Last Login' },
  { value: 'abuseScore', label: 'Abuse Score' },
];

export default function AdminUsersPage() {
  // Data state
  const [usersData, setUsersData] = useState<AdminUser[]>([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Filter/search state
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Modal/slide-over state
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userDetail, setUserDetail] = useState<AdminUserDetail | null>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isAbuseScoreModalOpen, setIsAbuseScoreModalOpen] = useState(false);
  const [isLimitsModalOpen, setIsLimitsModalOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // Form states
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    country: '',
    phone: '',
    avatar: '',
  });
  const [suspendForm, setSuspendForm] = useState({ reason: '', duration: '' });
  const [banForm, setBanForm] = useState({ reason: '' });
  const [roleForm, setRoleForm] = useState({ role: '' });
  const [abuseScoreForm, setAbuseScoreForm] = useState({
    abuseScore: '',
    reason: '',
  });
  const [limitsForm, setLimitsForm] = useState({
    orderLimit: '',
    apiRateLimit: '',
  });

  // Search debounce
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setIsPageLoading(true);
    try {
      const params: AdminUserQueryParams = {
        page: currentPage,
        limit: 20,
        sortBy: (sortBy || 'createdAt') as AdminUserQueryParams['sortBy'],
        sortOrder: (sortOrder || 'desc') as 'asc' | 'desc',
      };
      if (searchValue) params.search = searchValue;
      if (statusFilter) params.status = statusFilter as UserStatus;
      if (roleFilter) params.role = roleFilter as UserRole;

      const response: AdminUsersResponse = await getAdminUsers(params);
      setUsersData(response.data);
      setMeta(response.meta);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to fetch users');
    } finally {
      setIsPageLoading(false);
    }
  }, [currentPage, searchValue, statusFilter, roleFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounced search
  const handleSearch = (value: string) => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setSearchValue(value);
      setCurrentPage(1);
    }, 500);
  };

  // View user detail
  const handleViewUser = async (user: AdminUser) => {
    setSelectedUser(user);
    setIsSlideOverOpen(true);
    setIsDetailLoading(true);
    try {
      const detail = await getAdminUser(user.id);
      setUserDetail(detail);
    } catch (error: any) {
      toast.error('Failed to fetch user details');
      setUserDetail(null);
    } finally {
      setIsDetailLoading(false);
    }
  };

  // Open edit modal
  const handleOpenEdit = (user: AdminUser) => {
    setSelectedUser(user);
    setEditForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      country: user.country || '',
      phone: user.phone || '',
      avatar: user.avatar || '',
    });
    setIsEditModalOpen(true);
  };

  // Edit user
  const handleEditUser = async () => {
    if (!selectedUser) return;
    setIsActionLoading(true);
    try {
      const data: any = {};
      if (editForm.firstName) data.firstName = editForm.firstName;
      if (editForm.lastName) data.lastName = editForm.lastName;
      if (editForm.country) data.country = editForm.country;
      if (editForm.phone) data.phone = editForm.phone;
      if (editForm.avatar) data.avatar = editForm.avatar;

      await updateAdminUser(selectedUser.id, data);
      toast.success('User updated successfully!');
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update user');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Suspend user
  const handleSuspendUser = async () => {
    if (!selectedUser) return;
    setIsActionLoading(true);
    try {
      await suspendUser(selectedUser.id, {
        reason: suspendForm.reason,
        duration: suspendForm.duration
          ? parseInt(suspendForm.duration)
          : undefined,
      });
      toast.success('User suspended successfully!');
      setIsSuspendModalOpen(false);
      setSuspendForm({ reason: '', duration: '' });
      fetchUsers();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to suspend user');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Ban user
  const handleBanUser = async () => {
    if (!selectedUser) return;
    setIsActionLoading(true);
    try {
      await banUser(selectedUser.id, { reason: banForm.reason });
      toast.success('User banned successfully!');
      setIsBanModalOpen(false);
      setBanForm({ reason: '' });
      fetchUsers();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to ban user');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Unban user
  const handleUnbanUser = async (user: AdminUser) => {
    setIsActionLoading(true);
    try {
      await unbanUser(user.id);
      toast.success('User unbanned successfully!');
      fetchUsers();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to unban user');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Activate user
  const handleActivateUser = async (user: AdminUser) => {
    setIsActionLoading(true);
    try {
      await activateUser(user.id);
      toast.success('User activated successfully!');
      fetchUsers();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to activate user');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setIsActionLoading(true);
    try {
      await deleteAdminUser(selectedUser.id);
      toast.success('User deleted successfully!');
      setIsDeleteModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete user');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Change role
  const handleChangeRole = async () => {
    if (!selectedUser || !roleForm.role) return;
    setIsActionLoading(true);
    try {
      await changeUserRole(selectedUser.id, {
        role: roleForm.role as UserRole,
      });
      toast.success('User role changed successfully!');
      setIsRoleModalOpen(false);
      setRoleForm({ role: '' });
      fetchUsers();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to change role');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Set abuse score
  const handleSetAbuseScore = async () => {
    if (!selectedUser) return;
    setIsActionLoading(true);
    try {
      await setUserAbuseScore(selectedUser.id, {
        abuseScore: parseInt(abuseScoreForm.abuseScore),
        reason: abuseScoreForm.reason || undefined,
      });
      toast.success('Abuse score updated successfully!');
      setIsAbuseScoreModalOpen(false);
      setAbuseScoreForm({ abuseScore: '', reason: '' });
      fetchUsers();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || 'Failed to update abuse score',
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  // Set limits — empty string clears the override, blank-init means "leave unchanged"
  const handleSetLimits = async () => {
    if (!selectedUser) return;
    setIsActionLoading(true);
    try {
      const parseLimit = (raw: string): number | null | undefined => {
        if (raw === '') return null; // clear override
        const n = parseInt(raw);
        return Number.isFinite(n) ? n : undefined;
      };

      await setUserLimits(selectedUser.id, {
        orderLimit: parseLimit(limitsForm.orderLimit),
        apiRateLimit: parseLimit(limitsForm.apiRateLimit),
      });
      toast.success('User limits updated successfully!');
      setIsLimitsModalOpen(false);
      setLimitsForm({ orderLimit: '', apiRateLimit: '' });
      fetchUsers();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update limits');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Format date helper
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Render cell
  const renderCell = (item: AdminUser, column: any) => {
    switch (column.key) {
      case 'id':
        return (
          <span className="font-mono text-xs text-[#94A3B8]">
            {item.id.slice(0, 8)}...
          </span>
        );

      case 'username':
        return (
          <div className="flex items-center gap-2">
            {item.avatar ? (
              <img
                src={item.avatar}
                alt=""
                className="h-7 w-7 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[rgba(59,130,246,0.2)] text-xs font-bold text-[#3B82F6]">
                {(item.firstName?.[0] || item.email[0]).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-white">
                {item.username ||
                  `${item.firstName || ''} ${item.lastName || ''}`.trim() ||
                  '-'}
              </p>
            </div>
          </div>
        );

      case 'email':
        return (
          <div className="flex items-center gap-1.5">
            <span className="max-w-[180px] truncate text-sm text-white">
              {item.email}
            </span>
            {item.emailVerified && (
              <span className="text-[#22C55E]" title="Email verified">
                <UserCheck className="h-3.5 w-3.5" />
              </span>
            )}
          </div>
        );

      case 'role':
        return (
          <span
            className={`text-xs font-semibold ${roleColorMap[item.role] || 'text-white'}`}
          >
            {item.role}
          </span>
        );

      case 'rank':
        if (!item.rank) {
          return <span className="text-xs text-[#64748B]">—</span>;
        }
        return (
          <span
            className="text-sm text-white"
            title={`${item.rank.discountPercent}% off`}
          >
            {item.rank.name}
          </span>
        );

      case 'status':
        return (
          <AdminStatusBadge
            status={item.status.toLowerCase()}
            variant={statusVariantMap[item.status] || 'default'}
          />
        );

      case 'abuseScore':
        return (
          <span
            className={`text-sm font-medium ${
              item.abuseScore >= 75
                ? 'text-[#EF4444]'
                : item.abuseScore >= 50
                  ? 'text-[#F59E0B]'
                  : item.abuseScore >= 25
                    ? 'text-[#3B82F6]'
                    : 'text-[#22C55E]'
            }`}
          >
            {item.abuseScore}
          </span>
        );

      case 'lastLoginAt':
        return (
          <span className="text-sm text-[#94A3B8]">
            {formatDate(item.lastLoginAt)}
          </span>
        );

      case 'createdAt':
        return (
          <span className="text-sm text-[#94A3B8]">
            {formatDate(item.createdAt)}
          </span>
        );

      case 'actions':
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Open user actions"
                className="size-icon inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.05)] !p-0 text-white transition-colors hover:bg-[rgba(255,255,255,0.12)]"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="min-w-[180px] border-[rgba(255,255,255,0.1)] bg-[#1E293B] p-1 text-white"
            >
              <DropdownMenuItem
                onSelect={() => handleViewUser(item)}
                className="cursor-pointer text-white focus:bg-[rgba(59,130,246,0.15)] focus:text-white"
              >
                <Eye className="mr-2 h-4 w-4 text-[#3B82F6]" />
                View user
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => handleOpenEdit(item)}
                className="cursor-pointer text-white focus:bg-[rgba(245,158,11,0.15)] focus:text-white"
              >
                <Edit className="mr-2 h-4 w-4 text-[#F59E0B]" />
                Edit user
              </DropdownMenuItem>
              {item.status === 'ACTIVE' && (
                <>
                  <DropdownMenuSeparator className="bg-[rgba(255,255,255,0.06)]" />
                  <DropdownMenuItem
                    onSelect={() => {
                      setSelectedUser(item);
                      setIsSuspendModalOpen(true);
                    }}
                    className="cursor-pointer text-white focus:bg-[rgba(245,158,11,0.15)] focus:text-white"
                  >
                    <Ban className="mr-2 h-4 w-4 text-[#F59E0B]" />
                    Suspend user
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      setSelectedUser(item);
                      setBanForm({ reason: '' });
                      setIsBanModalOpen(true);
                    }}
                    className="cursor-pointer text-[#EF4444] focus:bg-[rgba(239,68,68,0.12)] focus:text-[#EF4444]"
                  >
                    <ShieldAlert className="mr-2 h-4 w-4" />
                    Ban user
                  </DropdownMenuItem>
                </>
              )}
              {item.status === 'BANNED' && (
                <>
                  <DropdownMenuSeparator className="bg-[rgba(255,255,255,0.06)]" />
                  <DropdownMenuItem
                    onSelect={() => handleUnbanUser(item)}
                    className="cursor-pointer text-white focus:bg-[rgba(34,197,94,0.15)] focus:text-white"
                  >
                    <UserCheck className="mr-2 h-4 w-4 text-[#22C55E]" />
                    Unban user
                  </DropdownMenuItem>
                </>
              )}
              {(item.status === 'SUSPENDED' ||
                item.status === 'PENDING' ||
                item.status === 'INACTIVE') && (
                <>
                  <DropdownMenuSeparator className="bg-[rgba(255,255,255,0.06)]" />
                  <DropdownMenuItem
                    onSelect={() => handleActivateUser(item)}
                    className="cursor-pointer text-white focus:bg-[rgba(34,197,94,0.15)] focus:text-white"
                  >
                    <UserCheck className="mr-2 h-4 w-4 text-[#22C55E]" />
                    Activate user
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator className="bg-[rgba(255,255,255,0.06)]" />
              <DropdownMenuItem
                onSelect={() => {
                  setSelectedUser(item);
                  setIsDeleteModalOpen(true);
                }}
                className="cursor-pointer text-[#EF4444] focus:bg-[rgba(239,68,68,0.12)] focus:text-[#EF4444]"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete user
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );

      default:
        return (item as any)[column.key] ?? '-';
    }
  };

  // Filter config
  const filters = [
    {
      label: 'Status',
      options: statusFilterOptions,
      value: statusFilter,
      onChange: (val: string) => {
        setStatusFilter(val);
        setCurrentPage(1);
      },
    },
    {
      label: 'Role',
      options: roleFilterOptions,
      value: roleFilter,
      onChange: (val: string) => {
        setRoleFilter(val);
        setCurrentPage(1);
      },
    },
    {
      label: 'Sort By',
      options: sortByOptions.map((o) => o.value),
      value: sortBy,
      onChange: (val: string) => {
        setSortBy(val);
        setCurrentPage(1);
      },
    },
    {
      label: 'Order',
      options: ['asc', 'desc'],
      value: sortOrder,
      onChange: (val: string) => {
        setSortOrder(val);
        setCurrentPage(1);
      },
    },
  ];

  // Pagination helpers
  const getPageNumbers = () => {
    const pages: number[] = [];
    const total = meta.totalPages;
    const current = meta.page;

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push(-1); // ellipsis
      for (
        let i = Math.max(2, current - 1);
        i <= Math.min(total - 1, current + 1);
        i++
      ) {
        pages.push(i);
      }
      if (current < total - 2) pages.push(-1); // ellipsis
      pages.push(total);
    }
    return pages;
  };

  return (
    <div className="p-4 lg:p-8">
      <AdminPageHeader
        title="User Management"
        description="Manage users, balances, and account permissions"
        secondaryActions={[
          {
            label: 'Export',
            onClick: () => toast.info('Exporting users data...'),
            icon: <Download className="h-5 w-5" />,
          },
        ]}
      />

      <AdminFilterBar
        searchPlaceholder="Search users by name, email, or ID..."
        onSearch={handleSearch}
        filters={filters}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onApplyFilters={() => {
          setCurrentPage(1);
          fetchUsers();
        }}
        onResetFilters={() => {
          setSearchValue('');
          setStatusFilter('');
          setRoleFilter('');
          setSortBy('');
          setSortOrder('');
          setCurrentPage(1);
        }}
      />

      {/* Loading state */}
      {isPageLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
          <span className="ml-3 text-[#94A3B8]">Loading users...</span>
        </div>
      ) : usersData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(255,255,255,0.05)]">
            <Eye className="h-8 w-8 text-[#64748B]" />
          </div>
          <p className="text-lg font-medium text-white">No users found</p>
          <p className="mt-1 text-sm text-[#94A3B8]">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <>
          <AdminDataTable
            columns={columns}
            data={usersData}
            renderCell={renderCell}
          />

          {/* Pagination */}
          <div className="mt-6 flex flex-col items-center justify-between gap-4 lg:flex-row">
            <p className="text-sm text-[#94A3B8]">
              Showing {(meta.page - 1) * meta.limit + 1} to{' '}
              {Math.min(meta.page * meta.limit, meta.total)} of {meta.total}{' '}
              users
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={!meta.hasPrevPage}
                className="flex items-center gap-1 rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-3 py-2 text-sm text-white transition-colors hover:bg-[rgba(255,255,255,0.12)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
              {getPageNumbers().map((page, index) =>
                page === -1 ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-2 text-[#94A3B8]"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`rounded-xl px-4 py-2 text-sm transition-all ${
                      page === meta.page
                        ? 'bg-[#3B82F6] text-white hover:brightness-110'
                        : 'border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] text-white hover:bg-[rgba(255,255,255,0.12)]'
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={!meta.hasNextPage}
                className="flex items-center gap-1 rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-3 py-2 text-sm text-white transition-colors hover:bg-[rgba(255,255,255,0.12)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* ========== User Details Slide-Over ========== */}
      <AdminSlideOver
        isOpen={isSlideOverOpen}
        onClose={() => {
          setIsSlideOverOpen(false);
          setUserDetail(null);
        }}
        title="User Details"
        footer={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSlideOverOpen(false)}
              className="flex-1 rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.12)]"
            >
              Close
            </button>
            <button
              onClick={() => {
                setIsSlideOverOpen(false);
                if (selectedUser) handleOpenEdit(selectedUser);
              }}
              className="flex-1 rounded-xl bg-[#3B82F6] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2563EB]"
            >
              Edit User
            </button>
          </div>
        }
      >
        {isDetailLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-[#3B82F6]" />
            <span className="ml-2 text-sm text-[#94A3B8]">
              Loading details...
            </span>
          </div>
        ) : (
          selectedUser && (
            <div className="space-y-6">
              {/* Account Info */}
              <div>
                <h3 className="mb-4 text-lg font-semibold text-white">
                  Account Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {selectedUser.avatar ? (
                      <img
                        src={selectedUser.avatar}
                        alt=""
                        className="h-14 w-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(59,130,246,0.2)] text-xl font-bold text-[#3B82F6]">
                        {(
                          selectedUser.firstName?.[0] || selectedUser.email[0]
                        ).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-white">
                        {selectedUser.firstName || selectedUser.lastName
                          ? `${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`.trim()
                          : selectedUser.username || selectedUser.email}
                      </p>
                      <p className="text-sm text-[#94A3B8]">
                        {selectedUser.email}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-[rgba(255,255,255,0.05)] p-3">
                      <p className="text-xs text-[#94A3B8]">User ID</p>
                      <p className="mt-0.5 font-mono text-sm text-white">
                        {selectedUser.id}
                      </p>
                    </div>
                    <div className="rounded-lg bg-[rgba(255,255,255,0.05)] p-3">
                      <p className="text-xs text-[#94A3B8]">Status</p>
                      <div className="mt-1">
                        <AdminStatusBadge
                          status={selectedUser.status.toLowerCase()}
                          variant={statusVariantMap[selectedUser.status]}
                        />
                      </div>
                    </div>
                    <div className="rounded-lg bg-[rgba(255,255,255,0.05)] p-3">
                      <p className="text-xs text-[#94A3B8]">Role</p>
                      <p
                        className={`mt-0.5 text-sm font-semibold ${roleColorMap[selectedUser.role]}`}
                      >
                        {selectedUser.role}
                      </p>
                    </div>
                    <div className="rounded-lg bg-[rgba(255,255,255,0.05)] p-3">
                      <p className="text-xs text-[#94A3B8]">Abuse Score</p>
                      <p
                        className={`mt-0.5 text-sm font-semibold ${
                          selectedUser.abuseScore >= 75
                            ? 'text-[#EF4444]'
                            : selectedUser.abuseScore >= 50
                              ? 'text-[#F59E0B]'
                              : 'text-[#22C55E]'
                        }`}
                      >
                        {selectedUser.abuseScore}/100
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    {selectedUser.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-[#64748B]" />
                        <span className="text-white">{selectedUser.phone}</span>
                        {selectedUser.phoneVerified && (
                          <UserCheck className="h-3.5 w-3.5 text-[#22C55E]" />
                        )}
                      </div>
                    )}
                    {selectedUser.country && (
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="h-4 w-4 text-[#64748B]" />
                        <span className="text-white">
                          {selectedUser.country}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-[#64748B]" />
                      <span className="text-white">{selectedUser.email}</span>
                      {selectedUser.emailVerified && (
                        <UserCheck className="h-3.5 w-3.5 text-[#22C55E]" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-[#64748B]" />
                      <span className="text-[#94A3B8]">
                        Joined {formatDate(selectedUser.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <LogIn className="h-4 w-4 text-[#64748B]" />
                      <span className="text-[#94A3B8]">
                        Last login {formatDateTime(selectedUser.lastLoginAt)} (
                        {selectedUser.loginCount} total)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Wallet & Subscription (from detail API) */}
              {userDetail && (
                <div className="border-t border-[rgba(255,255,255,0.18)] pt-6">
                  <h3 className="mb-4 text-lg font-semibold text-white">
                    Financial Information
                  </h3>
                  <div className="space-y-3">
                    {userDetail.wallet && (
                      <div className="rounded-xl border border-[rgba(59,130,246,0.2)] bg-[rgba(59,130,246,0.1)] p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#94A3B8]">
                            Wallet Balance
                          </span>
                          <DollarSign className="h-5 w-5 text-[#3B82F6]" />
                        </div>
                        <p className="mt-2 text-2xl font-semibold text-white">
                          {userDetail.wallet.currency}{' '}
                          {userDetail.wallet.balance}
                        </p>
                        {userDetail.wallet.isLocked && (
                          <span className="mt-1 inline-block text-xs text-[#EF4444]">
                            Wallet Locked
                          </span>
                        )}
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-[rgba(255,255,255,0.05)] p-3">
                        <p className="text-xs text-[#94A3B8]">Total Orders</p>
                        <p className="mt-0.5 text-lg font-semibold text-white">
                          {userDetail.ordersCount}
                        </p>
                      </div>
                      <div className="rounded-lg bg-[rgba(255,255,255,0.05)] p-3">
                        <p className="text-xs text-[#94A3B8]">Total Spent</p>
                        <p className="mt-0.5 text-lg font-semibold text-white">
                          ${userDetail.totalSpent}
                        </p>
                      </div>
                    </div>
                    {userDetail.subscription && (
                      <div className="rounded-lg border border-[rgba(139,92,246,0.2)] bg-[rgba(139,92,246,0.1)] p-3">
                        <p className="text-xs text-[#94A3B8]">Subscription</p>
                        <p className="mt-0.5 text-sm font-medium text-white">
                          {userDetail.subscription.planName}
                        </p>
                        <p className="mt-1 text-xs text-[#94A3B8]">
                          {userDetail.subscription.status} &middot; Expires{' '}
                          {formatDate(userDetail.subscription.endDate)}
                        </p>
                      </div>
                    )}
                    {selectedUser.orderLimit && (
                      <div className="rounded-lg bg-[rgba(255,255,255,0.05)] p-3">
                        <p className="text-xs text-[#94A3B8]">Order Limit</p>
                        <p className="mt-0.5 text-sm font-semibold text-white">
                          {selectedUser.orderLimit}
                        </p>
                      </div>
                    )}
                    {selectedUser.apiRateLimit && (
                      <div className="rounded-lg bg-[rgba(255,255,255,0.05)] p-3">
                        <p className="text-xs text-[#94A3B8]">
                          API Rate Limit (override)
                        </p>
                        <p className="mt-0.5 text-sm font-semibold text-white">
                          {selectedUser.apiRateLimit}/min
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="border-t border-[rgba(255,255,255,0.18)] pt-6">
                <h3 className="mb-4 text-lg font-semibold text-white">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setIsSlideOverOpen(false);
                      if (selectedUser) {
                        setRoleForm({ role: selectedUser.role });
                        setIsRoleModalOpen(true);
                      }
                    }}
                    className="flex w-full items-center gap-3 rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.05)] p-3 text-white transition-colors hover:bg-[rgba(255,255,255,0.08)]"
                  >
                    <Shield className="h-5 w-5 text-[#8B5CF6]" />
                    <span className="text-sm font-medium">Change Role</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsSlideOverOpen(false);
                      if (selectedUser) {
                        setAbuseScoreForm({
                          abuseScore: String(selectedUser.abuseScore),
                          reason: '',
                        });
                        setIsAbuseScoreModalOpen(true);
                      }
                    }}
                    className="flex w-full items-center gap-3 rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.05)] p-3 text-white transition-colors hover:bg-[rgba(255,255,255,0.08)]"
                  >
                    <AlertTriangle className="h-5 w-5 text-[#F59E0B]" />
                    <span className="text-sm font-medium">Set Abuse Score</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsSlideOverOpen(false);
                      if (selectedUser) {
                        setLimitsForm({
                          orderLimit: String(selectedUser.orderLimit || ''),
                          apiRateLimit: String(selectedUser.apiRateLimit || ''),
                        });
                        setIsLimitsModalOpen(true);
                      }
                    }}
                    className="flex w-full items-center gap-3 rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.05)] p-3 text-white transition-colors hover:bg-[rgba(255,255,255,0.08)]"
                  >
                    <Key className="h-5 w-5 text-[#3B82F6]" />
                    <span className="text-sm font-medium">
                      Set Order Limits
                    </span>
                  </button>
                  {selectedUser.status === 'ACTIVE' && (
                    <>
                      <button
                        onClick={() => {
                          setIsSlideOverOpen(false);
                          setSuspendForm({ reason: '', duration: '' });
                          setIsSuspendModalOpen(true);
                        }}
                        className="flex w-full items-center gap-3 rounded-xl border border-[rgba(245,158,11,0.2)] bg-[rgba(245,158,11,0.1)] p-3 text-[#F59E0B] transition-colors hover:bg-[rgba(245,158,11,0.15)]"
                      >
                        <Ban className="h-5 w-5" />
                        <span className="text-sm font-medium">
                          Suspend Account
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          setIsSlideOverOpen(false);
                          setBanForm({ reason: '' });
                          setIsBanModalOpen(true);
                        }}
                        className="flex w-full items-center gap-3 rounded-xl border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.1)] p-3 text-[#EF4444] transition-colors hover:bg-[rgba(239,68,68,0.15)]"
                      >
                        <ShieldAlert className="h-5 w-5" />
                        <span className="text-sm font-medium">Ban Account</span>
                      </button>
                    </>
                  )}
                  {selectedUser.status === 'BANNED' && (
                    <button
                      onClick={() => {
                        setIsSlideOverOpen(false);
                        handleUnbanUser(selectedUser);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl border border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.1)] p-3 text-[#22C55E] transition-colors hover:bg-[rgba(34,197,94,0.15)]"
                    >
                      <UserCheck className="h-5 w-5" />
                      <span className="text-sm font-medium">Unban Account</span>
                    </button>
                  )}
                  {(selectedUser.status === 'SUSPENDED' ||
                    selectedUser.status === 'PENDING' ||
                    selectedUser.status === 'INACTIVE') && (
                    <button
                      onClick={() => {
                        setIsSlideOverOpen(false);
                        handleActivateUser(selectedUser);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl border border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.1)] p-3 text-[#22C55E] transition-colors hover:bg-[rgba(34,197,94,0.15)]"
                    >
                      <UserCheck className="h-5 w-5" />
                      <span className="text-sm font-medium">
                        Activate Account
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        )}
      </AdminSlideOver>

      {/* ========== Edit User Modal ========== */}
      <AdminModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit User"
        primaryAction={{
          label: 'Save Changes',
          onClick: handleEditUser,
          loading: isActionLoading,
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: () => setIsEditModalOpen(false),
        }}
      >
        <div className="space-y-4">
          <div className="mb-2 rounded-lg bg-[rgba(255,255,255,0.05)] p-3">
            <p className="text-xs text-[#94A3B8]">Editing user</p>
            <p className="text-sm font-medium text-white">
              {selectedUser?.email}
            </p>
          </div>
          <AdminFormInput
            label="First Name"
            name="firstName"
            value={editForm.firstName}
            onChange={(value) => setEditForm({ ...editForm, firstName: value })}
            placeholder="John"
          />
          <AdminFormInput
            label="Last Name"
            name="lastName"
            value={editForm.lastName}
            onChange={(value) => setEditForm({ ...editForm, lastName: value })}
            placeholder="Doe"
          />
          <AdminFormInput
            label="Country"
            name="country"
            value={editForm.country}
            onChange={(value) => setEditForm({ ...editForm, country: value })}
            placeholder="United States"
          />
          <AdminFormInput
            label="Phone"
            name="phone"
            type="tel"
            value={editForm.phone}
            onChange={(value) => setEditForm({ ...editForm, phone: value })}
            placeholder="+1234567890"
          />
          <AdminFormInput
            label="Avatar URL"
            name="avatar"
            value={editForm.avatar}
            onChange={(value) => setEditForm({ ...editForm, avatar: value })}
            placeholder="https://example.com/avatar.jpg"
          />
        </div>
      </AdminModal>

      {/* ========== Suspend User Modal ========== */}
      <AdminModal
        isOpen={isSuspendModalOpen}
        onClose={() => setIsSuspendModalOpen(false)}
        title="Suspend User"
        primaryAction={{
          label: 'Suspend',
          onClick: handleSuspendUser,
          loading: isActionLoading,
          variant: 'danger',
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: () => setIsSuspendModalOpen(false),
        }}
      >
        <div className="space-y-4">
          <p className="text-[#94A3B8]">
            Temporarily suspend{' '}
            <span className="font-medium text-white">
              {selectedUser?.email}
            </span>
            ?
          </p>
          <AdminFormInput
            label="Reason"
            name="reason"
            value={suspendForm.reason}
            onChange={(value) =>
              setSuspendForm({ ...suspendForm, reason: value })
            }
            placeholder="Suspicious activity detected"
            required
          />
          <AdminFormInput
            label="Duration (days, optional)"
            name="duration"
            type="number"
            value={suspendForm.duration}
            onChange={(value) =>
              setSuspendForm({ ...suspendForm, duration: value })
            }
            placeholder="Leave empty for indefinite"
          />
          <p className="text-sm text-[#F59E0B]">
            This user will not be able to access their account until activated.
          </p>
        </div>
      </AdminModal>

      {/* ========== Ban User Modal ========== */}
      <AdminModal
        isOpen={isBanModalOpen}
        onClose={() => setIsBanModalOpen(false)}
        title="Ban User"
        primaryAction={{
          label: 'Ban User',
          onClick: handleBanUser,
          loading: isActionLoading,
          variant: 'danger',
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: () => setIsBanModalOpen(false),
        }}
      >
        <div className="space-y-4">
          <p className="text-[#94A3B8]">
            Ban{' '}
            <span className="font-medium text-white">
              {selectedUser?.email}
            </span>{' '}
            and revoke all tokens?
          </p>
          <AdminFormInput
            label="Reason"
            name="banReason"
            value={banForm.reason}
            onChange={(value) => setBanForm({ ...banForm, reason: value })}
            placeholder="Violation of terms of service"
            required
          />
          <p className="text-sm text-[#EF4444]">
            This action will ban the user and revoke all active sessions. The
            user cannot access the platform until unbanned.
          </p>
        </div>
      </AdminModal>

      {/* ========== Delete User Modal ========== */}
      <AdminModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete User"
        primaryAction={{
          label: 'Delete',
          onClick: handleDeleteUser,
          loading: isActionLoading,
          variant: 'danger',
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: () => setIsDeleteModalOpen(false),
        }}
      >
        <p className="text-[#94A3B8]">
          Are you sure you want to delete{' '}
          <span className="font-medium text-white">{selectedUser?.email}</span>?
        </p>
        <p className="mt-4 text-sm text-[#EF4444]">
          This is a soft delete. The user data will be retained but the account
          will be deactivated.
        </p>
      </AdminModal>

      {/* ========== Change Role Modal ========== */}
      <AdminModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        title="Change User Role"
        primaryAction={{
          label: 'Change Role',
          onClick: handleChangeRole,
          loading: isActionLoading,
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: () => setIsRoleModalOpen(false),
        }}
      >
        <div className="space-y-4">
          <p className="text-[#94A3B8]">
            Change role for{' '}
            <span className="font-medium text-white">
              {selectedUser?.email}
            </span>
          </p>
          <div className="rounded-lg bg-[rgba(255,255,255,0.05)] p-3">
            <p className="text-xs text-[#94A3B8]">Current Role</p>
            <p
              className={`mt-0.5 text-sm font-semibold ${roleColorMap[selectedUser?.role || 'USER']}`}
            >
              {selectedUser?.role}
            </p>
          </div>
          <AdminFormSelect
            label="New Role"
            name="role"
            value={roleForm.role}
            onChange={(value) => setRoleForm({ role: value })}
            options={roleOptions}
            required
          />
        </div>
      </AdminModal>

      {/* ========== Abuse Score Modal ========== */}
      <AdminModal
        isOpen={isAbuseScoreModalOpen}
        onClose={() => setIsAbuseScoreModalOpen(false)}
        title="Set Abuse Score"
        primaryAction={{
          label: 'Update Score',
          onClick: handleSetAbuseScore,
          loading: isActionLoading,
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: () => setIsAbuseScoreModalOpen(false),
        }}
      >
        <div className="space-y-4">
          <p className="text-[#94A3B8]">
            Set abuse score for{' '}
            <span className="font-medium text-white">
              {selectedUser?.email}
            </span>
          </p>
          <AdminFormInput
            label="Abuse Score (0-100)"
            name="abuseScore"
            type="number"
            value={abuseScoreForm.abuseScore}
            onChange={(value) =>
              setAbuseScoreForm({ ...abuseScoreForm, abuseScore: value })
            }
            placeholder="0"
            required
          />
          <AdminFormInput
            label="Reason (optional)"
            name="abuseReason"
            value={abuseScoreForm.reason}
            onChange={(value) =>
              setAbuseScoreForm({ ...abuseScoreForm, reason: value })
            }
            placeholder="Manual review"
          />
        </div>
      </AdminModal>

      {/* ========== Set Limits Modal ========== */}
      <AdminModal
        isOpen={isLimitsModalOpen}
        onClose={() => setIsLimitsModalOpen(false)}
        title="Set Custom Limits"
        primaryAction={{
          label: 'Update Limits',
          onClick: handleSetLimits,
          loading: isActionLoading,
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: () => setIsLimitsModalOpen(false),
        }}
      >
        <div className="space-y-4">
          <p className="text-[#94A3B8]">
            Set custom limits for{' '}
            <span className="font-medium text-white">
              {selectedUser?.email}
            </span>
            . Leave a field blank to clear the override and fall back to the
            user&apos;s plan default.
          </p>
          <AdminFormInput
            label="Order Limit"
            name="orderLimit"
            type="number"
            value={limitsForm.orderLimit}
            onChange={(value) =>
              setLimitsForm({ ...limitsForm, orderLimit: value })
            }
            placeholder="50"
          />
          <AdminFormInput
            label="API Rate Limit (requests/min)"
            name="apiRateLimit"
            type="number"
            value={limitsForm.apiRateLimit}
            onChange={(value) =>
              setLimitsForm({ ...limitsForm, apiRateLimit: value })
            }
            placeholder="60"
          />
        </div>
      </AdminModal>
    </div>
  );
}
