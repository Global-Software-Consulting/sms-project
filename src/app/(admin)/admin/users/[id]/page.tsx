'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft,
  User,
  Mail,
  Phone,
  Globe,
  Calendar,
  Clock,
  Shield,
  Wallet,
  Crown,
  Key,
  Package,
  AlertTriangle,
  Ban,
  CheckCircle,
  Edit,
  Save,
  X,
  RefreshCw,
  UserCheck,
  UserX
} from 'lucide-react';
import { Button, Alert, Input } from '@/components/ui';
import { 
  getAdminUser,
  updateAdminUser,
  banUser,
  unbanUser,
  suspendUser,
  activateUser,
  changeUserRole,
  setUserAbuseScore,
  getUserStatusColor,
  getUserRoleColor,
  formatUserName,
  getUserInitials,
  formatLastLogin,
  type AdminUserDetail,
  type AdminUpdateUserRequest
} from '@/lib/api';
import { UserRole, UserStatus } from '@/lib/api/authApi';

/**
 * Admin User Detail Page
 * 
 * Features:
 * - View complete user profile
 * - Edit user details
 * - Manage user status (ban, suspend, activate)
 * - Change user role
 * - View wallet, subscription, and activity
 */
export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  // State
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<AdminUpdateUserRequest>({});
  const [saving, setSaving] = useState(false);

  // Action states
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showActionModal, setShowActionModal] = useState<'ban' | 'suspend' | 'role' | 'abuse' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('USER');
  const [newAbuseScore, setNewAbuseScore] = useState(0);

  // Fetch user
  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminUser(userId);
      setUser(data);
      setEditData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        country: data.country || '',
        phone: data.phone || '',
      });
      setNewRole(data.role);
      setNewAbuseScore(data.abuseScore);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  // Handle save
  const handleSave = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      await updateAdminUser(user.id, editData);
      setSuccess('User updated successfully');
      setIsEditing(false);
      await fetchUser();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  // Handle ban
  const handleBan = async () => {
    if (!user || !actionReason.trim()) return;
    
    try {
      setActionLoading('ban');
      await banUser(user.id, { reason: actionReason });
      setSuccess('User has been banned');
      setShowActionModal(null);
      setActionReason('');
      await fetchUser();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to ban user');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle suspend
  const handleSuspend = async () => {
    if (!user || !actionReason.trim()) return;
    
    try {
      setActionLoading('suspend');
      await suspendUser(user.id, { reason: actionReason });
      setSuccess('User has been suspended');
      setShowActionModal(null);
      setActionReason('');
      await fetchUser();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to suspend user');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle unban
  const handleUnban = async () => {
    if (!user) return;
    
    try {
      setActionLoading('unban');
      await unbanUser(user.id);
      setSuccess('User has been unbanned');
      await fetchUser();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to unban user');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle activate
  const handleActivate = async () => {
    if (!user) return;
    
    try {
      setActionLoading('activate');
      await activateUser(user.id);
      setSuccess('User has been activated');
      await fetchUser();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to activate user');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle role change
  const handleRoleChange = async () => {
    if (!user) return;
    
    try {
      setActionLoading('role');
      await changeUserRole(user.id, { role: newRole });
      setSuccess(`User role changed to ${newRole}`);
      setShowActionModal(null);
      await fetchUser();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to change role');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle abuse score change
  const handleAbuseScoreChange = async () => {
    if (!user) return;
    
    try {
      setActionLoading('abuse');
      await setUserAbuseScore(user.id, { abuseScore: newAbuseScore, reason: actionReason || undefined });
      setSuccess('Abuse score updated');
      setShowActionModal(null);
      setActionReason('');
      await fetchUser();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to update abuse score');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', margin: '0 auto 16px', borderRadius: '50%', border: '4px solid var(--accent-gold)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'var(--text-muted)' }}>Loading user...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', padding: '24px' }}>
        <div style={{ maxWidth: '600px', margin: '64px auto', textAlign: 'center' }}>
          <User style={{ width: '64px', height: '64px', color: 'var(--text-muted)', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>User Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>The user you&apos;re looking for doesn&apos;t exist or has been deleted.</p>
          <Link href="/admin/users">
            <Button>Back to Users</Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusColor = getUserStatusColor(user.status);
  const roleColor = getUserRoleColor(user.role);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: 'var(--bg-card)', 
        borderBottom: '1px solid var(--border-default)',
        padding: '24px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Link href="/admin/users" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>
              <ArrowLeft style={{ width: '16px', height: '16px' }} />
              Back to Users
            </Link>
          </div>

          {/* User Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                width: '72px', 
                height: '72px', 
                borderRadius: '50%', 
                backgroundColor: 'rgba(198, 167, 94, 0.2)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'var(--accent-gold)',
                fontWeight: 700,
                fontSize: '24px'
              }}>
                {getUserInitials(user)}
              </div>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {formatUserName(user)}
                </h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>{user.email}</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: '6px', 
                    fontSize: '12px', 
                    fontWeight: 600,
                    backgroundColor: roleColor.bg,
                    color: roleColor.text
                  }}>
                    {user.role}
                  </span>
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: '6px', 
                    fontSize: '12px', 
                    fontWeight: 600,
                    backgroundColor: statusColor.bg,
                    color: statusColor.text
                  }}>
                    {user.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    <X style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                    Cancel
                  </Button>
                  <Button onClick={handleSave} isLoading={saving}>
                    <Save style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                    Save Changes
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                    Edit
                  </Button>
                  {user.status === 'BANNED' ? (
                    <Button variant="outline" onClick={handleUnban} isLoading={actionLoading === 'unban'}>
                      <UserCheck style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                      Unban
                    </Button>
                  ) : user.status === 'SUSPENDED' ? (
                    <Button variant="outline" onClick={handleActivate} isLoading={actionLoading === 'activate'}>
                      <UserCheck style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                      Activate
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" onClick={() => setShowActionModal('suspend')}>
                        <AlertTriangle style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                        Suspend
                      </Button>
                      <Button variant="danger" onClick={() => setShowActionModal('ban')}>
                        <Ban style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                        Ban
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        {/* Alerts */}
        {error && (
          <div style={{ marginBottom: '24px' }}>
            <Alert variant="error" dismissible onDismiss={() => setError(null)}>
              {error}
            </Alert>
          </div>
        )}

        {success && (
          <div style={{ marginBottom: '24px' }}>
            <Alert variant="success" dismissible onDismiss={() => setSuccess(null)}>
              {success}
            </Alert>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }} className="lg:!grid-cols-3">
          {/* Main Info */}
          <div style={{ gridColumn: 'span 1' }} className="lg:!col-span-2">
            {/* Profile Card */}
            <div style={{ 
              backgroundColor: 'var(--bg-card)', 
              border: '1px solid var(--border-default)', 
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px' }}>
                Profile Information
              </h3>

              {isEditing ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
                      First Name
                    </label>
                    <Input
                      value={editData.firstName || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
                      Last Name
                    </label>
                    <Input
                      value={editData.lastName || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Last name"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
                      Country
                    </label>
                    <Input
                      value={editData.country || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, country: e.target.value }))}
                      placeholder="Country"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
                      Phone
                    </label>
                    <Input
                      value={editData.phone || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Phone number"
                    />
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <InfoItem icon={User} label="Full Name" value={formatUserName(user)} />
                  <InfoItem icon={Mail} label="Email" value={user.email} />
                  <InfoItem icon={Phone} label="Phone" value={user.phone || 'Not set'} />
                  <InfoItem icon={Globe} label="Country" value={user.country || 'Not set'} />
                  <InfoItem icon={Calendar} label="Joined" value={new Date(user.createdAt).toLocaleDateString()} />
                  <InfoItem icon={Clock} label="Last Login" value={formatLastLogin(user.lastLoginAt)} />
                </div>
              )}
            </div>

            {/* Activity Stats */}
            <div style={{ 
              backgroundColor: 'var(--bg-card)', 
              border: '1px solid var(--border-default)', 
              borderRadius: '16px',
              padding: '24px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px' }}>
                Activity & Statistics
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }} className="sm:!grid-cols-4">
                <StatBox label="Login Count" value={user.loginCount.toString()} icon={User} />
                <StatBox label="API Keys" value={String(user.apiKeysCount ?? 0)} icon={Key} />
                <StatBox label="Orders" value={String(user.ordersCount ?? 0)} icon={Package} />
                <StatBox label="Total Spent" value={`$${user.totalSpent || '0.00'}`} icon={Wallet} />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ gridColumn: 'span 1' }}>
            {/* Wallet Card */}
            {user.wallet && (
              <div style={{ 
                backgroundColor: 'var(--bg-card)', 
                border: '1px solid var(--border-default)', 
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <Wallet style={{ width: '18px', height: '18px', color: 'var(--accent-gold)' }} />
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Wallet</h4>
                </div>
                <p style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  ${parseFloat(user.wallet.balance).toFixed(2)}
                </p>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  {user.wallet.isLocked ? '🔒 Locked' : '✓ Active'}
                </p>
              </div>
            )}

            {/* Subscription Card */}
            {user.subscription && (
              <div style={{ 
                backgroundColor: 'var(--bg-card)', 
                border: '1px solid var(--border-default)', 
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <Crown style={{ width: '18px', height: '18px', color: 'var(--accent-gold)' }} />
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Subscription</h4>
                </div>
                <p style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {user.subscription.planName}
                </p>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Expires: {new Date(user.subscription.endDate).toLocaleDateString()}
                </p>
              </div>
            )}

            {/* Abuse Score Card */}
            <div style={{ 
              backgroundColor: 'var(--bg-card)', 
              border: '1px solid var(--border-default)', 
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <AlertTriangle style={{ width: '18px', height: '18px', color: user.abuseScore > 50 ? 'var(--danger)' : user.abuseScore > 20 ? 'var(--warning)' : 'var(--success)' }} />
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Abuse Score</h4>
                </div>
                <button 
                  onClick={() => setShowActionModal('abuse')}
                  style={{ padding: '4px 8px', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)', border: 'none', cursor: 'pointer', fontSize: '12px', color: 'var(--text-muted)' }}
                >
                  Edit
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '56px', 
                  height: '56px', 
                  borderRadius: '50%', 
                  backgroundColor: user.abuseScore > 50 ? 'rgba(239, 68, 68, 0.1)' : user.abuseScore > 20 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ 
                    fontSize: '20px', 
                    fontWeight: 700, 
                    color: user.abuseScore > 50 ? 'var(--danger)' : user.abuseScore > 20 ? 'var(--warning)' : 'var(--success)'
                  }}>
                    {user.abuseScore}
                  </span>
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {user.abuseScore > 50 ? 'High Risk' : user.abuseScore > 20 ? 'Medium Risk' : 'Low Risk'}
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {user.abuseScore > 50 ? 'Consider banning' : user.abuseScore > 20 ? 'Monitor activity' : 'Good standing'}
                  </p>
                </div>
              </div>
            </div>

            {/* Role Card */}
            <div style={{ 
              backgroundColor: 'var(--bg-card)', 
              border: '1px solid var(--border-default)', 
              borderRadius: '16px',
              padding: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Shield style={{ width: '18px', height: '18px', color: 'var(--accent-gold)' }} />
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Role</h4>
                </div>
                <button 
                  onClick={() => setShowActionModal('role')}
                  style={{ padding: '4px 8px', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)', border: 'none', cursor: 'pointer', fontSize: '12px', color: 'var(--text-muted)' }}
                >
                  Change
                </button>
              </div>
              <span style={{ 
                padding: '6px 12px', 
                borderRadius: '8px', 
                fontSize: '14px', 
                fontWeight: 600,
                backgroundColor: roleColor.bg,
                color: roleColor.text
              }}>
                {user.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Ban/Suspend Modal */}
      {(showActionModal === 'ban' || showActionModal === 'suspend') && (
        <ActionModal
          title={showActionModal === 'ban' ? 'Ban User' : 'Suspend User'}
          description={showActionModal === 'ban' 
            ? 'This will prevent the user from accessing their account.' 
            : 'This will temporarily restrict the user\'s access.'}
          color={showActionModal === 'ban' ? 'var(--danger)' : 'var(--warning)'}
          onClose={() => { setShowActionModal(null); setActionReason(''); }}
          onConfirm={showActionModal === 'ban' ? handleBan : handleSuspend}
          isLoading={actionLoading === showActionModal}
          disabled={!actionReason.trim()}
        >
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Reason <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <textarea
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              placeholder="Provide a reason for this action..."
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '12px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-default)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
          </div>
        </ActionModal>
      )}

      {/* Role Change Modal */}
      {showActionModal === 'role' && (
        <ActionModal
          title="Change User Role"
          description="Select the new role for this user."
          color="var(--accent-gold)"
          onClose={() => setShowActionModal(null)}
          onConfirm={handleRoleChange}
          isLoading={actionLoading === 'role'}
          disabled={newRole === user.role}
        >
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
              New Role
            </label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as UserRole)}
              style={{
                width: '100%',
                height: '44px',
                padding: '0 12px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-default)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px'
              }}
            >
              <option value="USER">User</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>
        </ActionModal>
      )}

      {/* Abuse Score Modal */}
      {showActionModal === 'abuse' && (
        <ActionModal
          title="Update Abuse Score"
          description="Adjust the user's abuse score (0-100)."
          color="var(--warning)"
          onClose={() => { setShowActionModal(null); setActionReason(''); }}
          onConfirm={handleAbuseScoreChange}
          isLoading={actionLoading === 'abuse'}
        >
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Abuse Score
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={newAbuseScore}
              onChange={(e) => setNewAbuseScore(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
              style={{
                width: '100%',
                height: '44px',
                padding: '0 12px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-default)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Reason (optional)
            </label>
            <textarea
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              placeholder="Reason for changing the score..."
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '12px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-default)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
          </div>
        </ActionModal>
      )}
    </div>
  );
}

/* ==================== COMPONENTS ==================== */

interface InfoItemProps {
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  label: string;
  value: string;
}

function InfoItem({ icon: Icon, label, value }: InfoItemProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
      <div style={{ 
        width: '36px', 
        height: '36px', 
        borderRadius: '8px', 
        backgroundColor: 'var(--bg-secondary)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <Icon style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
      </div>
      <div>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '2px' }}>{label}</p>
        <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{value}</p>
      </div>
    </div>
  );
}

interface StatBoxProps {
  label: string;
  value: string;
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
}

function StatBox({ label, value, icon: Icon }: StatBoxProps) {
  return (
    <div style={{ 
      padding: '16px', 
      backgroundColor: 'var(--bg-secondary)', 
      borderRadius: '12px',
      textAlign: 'center'
    }}>
      <Icon style={{ width: '20px', height: '20px', color: 'var(--accent-gold)', margin: '0 auto 8px' }} />
      <p style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{value}</p>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{label}</p>
    </div>
  );
}

interface ActionModalProps {
  title: string;
  description: string;
  color: string;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

function ActionModal({ title, description, color, onClose, onConfirm, isLoading, disabled, children }: ActionModalProps) {
  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0, 
      backgroundColor: 'rgba(0,0,0,0.6)', 
      backdropFilter: 'blur(4px)', 
      zIndex: 100, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '24px' 
    }}>
      <div style={{ 
        backgroundColor: 'var(--bg-card)', 
        borderRadius: '16px', 
        padding: '24px', 
        maxWidth: '450px', 
        width: '100%' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color }}>{title}</h3>
          <button onClick={onClose} style={{ padding: '8px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X style={{ width: '20px', height: '20px', color: 'var(--text-muted)' }} />
          </button>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>{description}</p>

        {children}

        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <Button variant="outline" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button 
            fullWidth 
            onClick={onConfirm}
            isLoading={isLoading}
            disabled={disabled}
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}

