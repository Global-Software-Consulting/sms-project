'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  User, 
  Lock, 
  Trash2, 
  Save, 
  AlertTriangle,
  Check,
  X,
  Globe,
  Phone,
  Mail,
  AtSign,
  Shield,
  Key,
  ChevronRight
} from 'lucide-react';
import { Button, Input, Alert } from '@/components/ui';
import { DashboardShell } from '@/components/layout';
import { 
  getUserProfile, 
  updateUserProfile, 
  changePassword, 
  deleteAccount,
  validatePassword,
  isValidPhone,
  type UserProfile,
  type UpdateProfileRequest,
  type ChangePasswordRequest
} from '@/lib/api';
import { useAuth } from '@/hooks';
import { getErrorMessage, logError } from '@/lib/errors';
import { useToast } from '@/contexts/ToastContext';

/**
 * Settings Page - User Profile Management
 * 
 * Sections:
 * 1. Profile - Edit firstName, lastName, country, phone, avatar
 * 2. Password - Change password with validation
 * 3. Danger Zone - Delete account
 */
export default function SettingsPage() {
  const { user: authUser, isAdmin } = useAuth();
  const toast = useToast();
  
  // Profile state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  
  // Profile form
  const [profileForm, setProfileForm] = useState<UpdateProfileRequest>({
    firstName: '',
    lastName: '',
    country: '',
    phone: '',
    avatar: '',
  });
  
  // Password state
  const [passwordForm, setPasswordForm] = useState<ChangePasswordRequest & { confirmPassword: string }>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  
  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setProfileLoading(true);
      setProfileError(null);
      const data = await getUserProfile();
      setProfile(data);
      setProfileForm({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        country: data.country || '',
        phone: data.phone || '',
        avatar: data.avatar || '',
      });
    } catch (err: unknown) {
      logError(err, 'fetchProfile');
      const errorMessage = getErrorMessage(err, 'users');
      setProfileError(errorMessage);
      toast.error(errorMessage, 'Failed to Load Profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
    setProfileError(null);
    setProfileSuccess(null);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate phone if provided
    if (profileForm.phone && !isValidPhone(profileForm.phone)) {
      const errorMsg = 'Invalid phone number format. Use format: +1234567890';
      setProfileError(errorMsg);
      toast.warning(errorMsg, 'Validation Error');
      return;
    }

    try {
      setProfileSaving(true);
      setProfileError(null);
      setProfileSuccess(null);
      
      // Only send non-empty fields
      const updateData: UpdateProfileRequest = {};
      if (profileForm.firstName) updateData.firstName = profileForm.firstName;
      if (profileForm.lastName) updateData.lastName = profileForm.lastName;
      if (profileForm.country) updateData.country = profileForm.country;
      if (profileForm.phone) updateData.phone = profileForm.phone;
      if (profileForm.avatar) updateData.avatar = profileForm.avatar;
      
      const updated = await updateUserProfile(updateData);
      setProfile(prev => prev ? { ...prev, ...updated } : null);
      setProfileSuccess('Profile updated successfully!');
      toast.success('Your profile has been updated successfully!');
    } catch (err: unknown) {
      logError(err, 'updateProfile');
      const errorMessage = getErrorMessage(err, 'users');
      setProfileError(errorMessage);
      toast.error(errorMessage, 'Failed to Update Profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    setPasswordError(null);
    setPasswordSuccess(null);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate new password
    const validation = validatePassword(passwordForm.newPassword);
    if (!validation.isValid) {
      const errorMsg = 'Password must be at least 8 characters with uppercase, lowercase, and number';
      setPasswordError(errorMsg);
      toast.warning(errorMsg, 'Validation Error');
      return;
    }
    
    // Check passwords match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      const errorMsg = 'New passwords do not match';
      setPasswordError(errorMsg);
      toast.warning(errorMsg, 'Validation Error');
      return;
    }

    try {
      setPasswordSaving(true);
      setPasswordError(null);
      setPasswordSuccess(null);
      
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      
      setPasswordSuccess('Password changed successfully!');
      toast.success('Your password has been changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: unknown) {
      logError(err, 'changePassword');
      const errorMessage = getErrorMessage(err, 'login');
      setPasswordError(errorMessage);
      toast.error(errorMessage, 'Failed to Change Password');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setDeleteError('Please type DELETE to confirm');
      return;
    }

    try {
      setDeleting(true);
      setDeleteError(null);
      await deleteAccount();
      toast.success('Your account has been deleted. Redirecting...');
      // Redirect will happen automatically due to token invalidation
      window.location.href = '/login';
    } catch (err: unknown) {
      logError(err, 'deleteAccount');
      const errorMessage = getErrorMessage(err, 'users');
      setDeleteError(errorMessage);
      toast.error(errorMessage, 'Failed to Delete Account');
      setDeleting(false);
    }
  };

  const passwordValidation = validatePassword(passwordForm.newPassword);

  if (profileLoading) {
    return (
      <DashboardShell>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', margin: '0 auto 16px', borderRadius: '50%', border: '4px solid var(--accent-gold)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: 'var(--text-muted)' }}>Loading settings...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Manage your account settings and preferences
        </p>
      </div>

      {/* ==================== PROFILE SECTION ==================== */}
      <section style={{ marginBottom: '32px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(198, 167, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User style={{ width: '20px', height: '20px', color: 'var(--accent-gold)' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>Profile Information</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Update your personal details</p>
          </div>
        </div>

        {profileError && (
          <div style={{ marginBottom: '20px' }}>
            <Alert variant="error" dismissible onDismiss={() => setProfileError(null)}>
              {profileError}
            </Alert>
          </div>
        )}

        {profileSuccess && (
          <div style={{ marginBottom: '20px' }}>
            <Alert variant="success" dismissible onDismiss={() => setProfileSuccess(null)}>
              {profileSuccess}
            </Alert>
          </div>
        )}

        <form onSubmit={handleProfileSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Email & Username (Read-only) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Email
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', height: '48px', padding: '0 16px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: '12px' }}>
                  <Mail style={{ width: '18px', height: '18px', color: 'var(--text-muted)' }} />
                  <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{profile?.email}</span>
                  {profile?.emailVerified && (
                    <Check style={{ width: '16px', height: '16px', color: 'var(--success)', marginLeft: 'auto' }} />
                  )}
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Email cannot be changed</p>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Username
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', height: '48px', padding: '0 16px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: '12px' }}>
                  <AtSign style={{ width: '18px', height: '18px', color: 'var(--text-muted)' }} />
                  <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{profile?.username}</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Username cannot be changed</p>
              </div>
            </div>

            {/* First Name & Last Name */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Input
                label="First Name"
                name="firstName"
                placeholder="John"
                value={profileForm.firstName}
                onChange={handleProfileChange}
                leftIcon={<User style={{ width: '18px', height: '18px' }} />}
              />
              <Input
                label="Last Name"
                name="lastName"
                placeholder="Doe"
                value={profileForm.lastName}
                onChange={handleProfileChange}
              />
            </div>

            {/* Country */}
            <Input
              label="Country"
              name="country"
              placeholder="United States"
              value={profileForm.country}
              onChange={handleProfileChange}
              leftIcon={<Globe style={{ width: '18px', height: '18px' }} />}
            />

            {/* Phone */}
            <Input
              label="Phone Number"
              name="phone"
              placeholder="+1234567890"
              value={profileForm.phone}
              onChange={handleProfileChange}
              leftIcon={<Phone style={{ width: '18px', height: '18px' }} />}
              hint="Format: +1234567890"
            />

            {/* Role Badge */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Account Role
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: isAdmin ? 'rgba(198, 167, 94, 0.1)' : 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: '8px' }}>
                  <Shield style={{ width: '16px', height: '16px', color: isAdmin ? 'var(--accent-gold)' : 'var(--text-muted)' }} />
                  <span style={{ fontSize: '14px', fontWeight: 500, color: isAdmin ? 'var(--accent-gold)' : 'var(--text-secondary)' }}>
                    {profile?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'User'}
                  </span>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : ''}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}>
              <Button type="submit" isLoading={profileSaving}>
                <Save style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </section>

      {/* ==================== PASSWORD SECTION ==================== */}
      <section style={{ marginBottom: '32px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(198, 167, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock style={{ width: '20px', height: '20px', color: 'var(--accent-gold)' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>Change Password</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Update your password to keep your account secure</p>
          </div>
        </div>

        {passwordError && (
          <div style={{ marginBottom: '20px' }}>
            <Alert variant="error" dismissible onDismiss={() => setPasswordError(null)}>
              {passwordError}
            </Alert>
          </div>
        )}

        {passwordSuccess && (
          <div style={{ marginBottom: '20px' }}>
            <Alert variant="success" dismissible onDismiss={() => setPasswordSuccess(null)}>
              {passwordSuccess}
            </Alert>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Current Password */}
            <Input
              label="Current Password"
              type="password"
              name="currentPassword"
              placeholder="Enter your current password"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              leftIcon={<Lock style={{ width: '18px', height: '18px' }} />}
              required
            />

            {/* New Password */}
            <div>
              <Input
                label="New Password"
                type="password"
                name="newPassword"
                placeholder="Enter new password"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                leftIcon={<Lock style={{ width: '18px', height: '18px' }} />}
                required
              />
              
              {/* Password Requirements */}
              {passwordForm.newPassword && (
                <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
                  <PasswordRequirement met={passwordValidation.minLength} text="At least 8 characters" />
                  <PasswordRequirement met={passwordValidation.hasUppercase} text="One uppercase letter" />
                  <PasswordRequirement met={passwordValidation.hasLowercase} text="One lowercase letter" />
                  <PasswordRequirement met={passwordValidation.hasNumber} text="One number" />
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <Input
              label="Confirm New Password"
              type="password"
              name="confirmPassword"
              placeholder="Confirm new password"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              leftIcon={<Lock style={{ width: '18px', height: '18px' }} />}
              required
              error={passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword ? 'Passwords do not match' : undefined}
              success={passwordForm.confirmPassword && passwordForm.newPassword === passwordForm.confirmPassword ? 'Passwords match' : undefined}
            />

            {/* Submit Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}>
              <Button 
                type="submit" 
                isLoading={passwordSaving}
                disabled={!passwordValidation.isValid || passwordForm.newPassword !== passwordForm.confirmPassword}
              >
                <Lock style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                Change Password
              </Button>
            </div>
          </div>
        </form>
      </section>

      {/* ==================== API KEYS SECTION ==================== */}
      <section style={{ marginBottom: '32px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '24px' }}>
        <Link href="/settings/api-keys" style={{ textDecoration: 'none', display: 'block' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Key style={{ width: '20px', height: '20px', color: 'var(--info)' }} />
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>API Keys</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Manage your API keys for programmatic access</p>
            </div>
            <ChevronRight style={{ width: '20px', height: '20px', color: 'var(--text-muted)' }} />
          </div>
        </Link>
      </section>

      {/* ==================== DANGER ZONE ==================== */}
      <section style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--danger)', borderRadius: '16px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle style={{ width: '20px', height: '20px', color: 'var(--danger)' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--danger)' }}>Danger Zone</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Irreversible actions for your account</p>
          </div>
        </div>

        {isAdmin && (
          <div style={{ marginBottom: '20px' }}>
            <Alert variant="warning">
              As an admin, you cannot delete your own account. Please contact another admin.
            </Alert>
          </div>
        )}

        {deleteError && (
          <div style={{ marginBottom: '20px' }}>
            <Alert variant="error" dismissible onDismiss={() => setDeleteError(null)}>
              {deleteError}
            </Alert>
          </div>
        )}

        {!showDeleteConfirm ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px' }}>
            <div>
              <p style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: '4px' }}>Delete Account</p>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button 
              variant="danger" 
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isAdmin}
            >
              <Trash2 style={{ width: '16px', height: '16px', marginRight: '8px' }} />
              Delete Account
            </Button>
          </div>
        ) : (
          <div style={{ padding: '20px', backgroundColor: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px' }}>
            <p style={{ fontWeight: 500, color: 'var(--danger)', marginBottom: '12px' }}>
              ⚠️ This action cannot be undone!
            </p>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Your account will be permanently deleted. All your data, wallet balance, and transaction history will be lost.
            </p>
            <p style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '12px' }}>
              Type <strong>DELETE</strong> to confirm:
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE"
                style={{ 
                  flex: 1,
                  height: '44px', 
                  padding: '0 16px', 
                  backgroundColor: 'var(--bg-primary)', 
                  border: '1px solid var(--border-default)', 
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px'
                }}
              />
              <Button 
                variant="danger" 
                onClick={handleDeleteAccount}
                isLoading={deleting}
                disabled={deleteConfirmText !== 'DELETE'}
              >
                Confirm Delete
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText('');
                  setDeleteError(null);
                }}
              >
                <X style={{ width: '16px', height: '16px' }} />
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
    </DashboardShell>
  );
}

// Password requirement indicator component
function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ 
        width: '16px', 
        height: '16px', 
        borderRadius: '50%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: met ? 'rgba(34, 197, 94, 0.2)' : 'var(--border-default)'
      }}>
        {met && <Check style={{ width: '10px', height: '10px', color: 'var(--success)' }} />}
      </div>
      <span style={{ fontSize: '12px', color: met ? 'var(--success)' : 'var(--text-muted)' }}>
        {text}
      </span>
    </div>
  );
}

