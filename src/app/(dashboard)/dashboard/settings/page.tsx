'use client';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  User,
  Bell,
  Shield,
  Loader2,
  AlertCircle,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteAccount,
  UserProfile,
  UpdateProfileRequest,
  ChangePasswordRequest,
  validatePassword,
  isValidPhone,
} from '@/lib/api/usersApi';
import { useAuth } from '@/hooks/useAuth';

export default function Settings() {
  // Auth
  const { user, logout } = useAuth();

  // Profile state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Delete account state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch profile
  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getUserProfile();
      setProfile(response);
      // Combine firstName and lastName into fullName for display
      const displayName = [response.firstName, response.lastName].filter(Boolean).join(' ');
      setFullName(displayName || '');
      setEmail(response.email);
      setPhone(response.phone || '');
      // Note: Notification preferences are not yet supported by backend
      // Using default values for now
      setEmailNotifications(true);
      setSmsNotifications(true);
      setMarketingEmails(false);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Handle save profile
  const handleSaveProfile = async () => {
    // Validate phone if provided
    if (phone && !isValidPhone(phone)) {
      toast.error('Please enter a valid phone number (e.g., +1234567890)');
      return;
    }

    try {
      setIsSavingProfile(true);

      // Split fullName into firstName and lastName
      const nameParts = fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || undefined;
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined;

      const updateData: UpdateProfileRequest = {
        firstName,
        lastName,
        phone: phone || undefined,
      };

      const response = await updateUserProfile(updateData);
      setProfile(response);
      toast.success('Profile updated successfully');
    } catch (err: any) {
      console.error('Update profile error:', err);
      toast.error('Failed to update profile', {
        description: err.response?.data?.message || 'Please try again.',
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle change password
  const handleChangePassword = async () => {
    // Validate new password
    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      toast.error('Invalid password', {
        description: validation.errors.join(', '),
      });
      return;
    }

    // Check passwords match
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setIsChangingPassword(true);

      const passwordData: ChangePasswordRequest = {
        currentPassword,
        newPassword,
      };

      await changePassword(passwordData);
      toast.success('Password changed successfully');

      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Change password error:', err);
      toast.error('Failed to change password', {
        description: err.response?.data?.message || 'Please check your current password.',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle delete account
  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    try {
      setIsDeleting(true);
      await deleteAccount();
      toast.success('Account deleted');
      logout();
    } catch (err: any) {
      console.error('Delete account error:', err);
      toast.error('Failed to delete account', {
        description: err.response?.data?.message || 'Please try again.',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="text-primary mx-auto mb-4 h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account preferences
        </p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <CardTitle>Profile Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                disabled
                className="bg-muted"
              />
              <p className="text-muted-foreground text-xs">
                Email cannot be changed
              </p>
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1234567890"
              />
              <p className="text-muted-foreground text-xs">
                Format: +1234567890 (7-15 digits)
              </p>
            </div>
            <div className="space-y-2">
              <Label>Account Status</Label>
              <div className="bg-muted flex h-10 items-center rounded-lg px-3">
                <span className="text-success flex items-center gap-2 text-sm font-medium">
                  <Check className="h-4 w-4" />
                  {profile?.emailVerified ? 'Verified' : 'Unverified'}
                </span>
              </div>
            </div>
          </div>
          <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
            {isSavingProfile ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notifications</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Email Notifications</Label>
              <p className="text-muted-foreground text-sm">
                Receive updates via email
              </p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>SMS Notifications</Label>
              <p className="text-muted-foreground text-sm">
                Get SMS alerts for activations
              </p>
            </div>
            <Switch
              checked={smsNotifications}
              onCheckedChange={setSmsNotifications}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Marketing Emails</Label>
              <p className="text-muted-foreground text-sm">
                Receive promotional offers
              </p>
            </div>
            <Switch
              checked={marketingEmails}
              onCheckedChange={setMarketingEmails}
            />
          </div>
          <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
            {isSavingProfile ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Preferences'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Security</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Current Password</Label>
            <div className="relative">
              <Input
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>New Password</Label>
            <div className="relative">
              <Input
                type={showNewPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-muted-foreground text-xs">
              Min 8 characters, include uppercase, lowercase, and number
            </p>
          </div>
          <div className="space-y-2">
            <Label>Confirm New Password</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <Button
            onClick={handleChangePassword}
            disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
          >
            {isChangingPassword ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Password'
            )}
          </Button>

          <Separator className="my-6" />

          <div className="flex items-center justify-between">
            <div>
              <Label>Two-Factor Authentication</Label>
              <p className="text-muted-foreground text-sm">
                Add an extra layer of security
              </p>
            </div>
            <Button variant="outline" disabled>
              Coming Soon
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Delete Account</Label>
              <p className="text-muted-foreground text-sm">
                Permanently delete your account and all data
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Account</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove all your data from our servers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-destructive/10 border-destructive/20 flex items-start space-x-2 rounded-lg border p-4">
              <AlertCircle className="text-destructive mt-0.5 h-4 w-4 shrink-0" />
              <div className="text-sm">
                <p className="text-destructive font-medium">Warning:</p>
                <ul className="text-muted-foreground mt-1 list-inside list-disc space-y-1">
                  <li>All your data will be permanently deleted</li>
                  <li>Any remaining wallet balance will be forfeited</li>
                  <li>Active subscriptions will be cancelled</li>
                  <li>This action cannot be reversed</li>
                </ul>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Type DELETE to confirm</Label>
              <Input
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="DELETE"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setDeleteConfirmation('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isDeleting || deleteConfirmation !== 'DELETE'}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Account'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
