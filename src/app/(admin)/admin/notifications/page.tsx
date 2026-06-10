'use client';

import { useState, useEffect } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { AdminGlassCard } from '@/components/admin/glass-card';
import { AdminFormInput } from '@/components/admin/form-input';
import { toast } from 'sonner';
import { Send, Eye, Mail, Bell, X } from 'lucide-react';
import { apiClient } from '@/config/api-client.config';
import { API_ENDPOINTS } from '@/config/server.config';
import {
  getAdminUserCountries,
  getBulkAudienceCounts,
  type UserCountryCount,
  type BulkAudienceCounts,
} from '@/lib/api/adminApi';

export default function AdminNotificationsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [notificationType, setNotificationType] = useState<'email' | 'website'>(
    'email',
  );

  const [emailFormData, setEmailFormData] = useState({
    targetUsers: 'all',
    countries: [] as string[],
    roles: [] as string[],
    minSpent: '',
    subject: '',
    message: '',
  });

  const [websiteFormData, setWebsiteFormData] = useState({
    targetUsers: 'all',
    countries: [] as string[],
    roles: [] as string[],
    minSpent: '',
    title: '',
    message: '',
  });

  const targetLabels: Record<string, string> = {
    all: 'All Users',
    'logged-in': 'Logged-in Users',
    purchased: 'Purchased Users',
    'no-purchase': 'Logged-in (No Purchase)',
  };

  const handlePreview = () => {
    const formData =
      notificationType === 'email' ? emailFormData : websiteFormData;

    if (
      notificationType === 'email' &&
      (!emailFormData.subject || !emailFormData.message)
    ) {
      toast.error('Please fill in subject and message');
      return;
    }
    if (
      notificationType === 'website' &&
      (!websiteFormData.title || !websiteFormData.message)
    ) {
      toast.error('Please fill in title and message');
      return;
    }

    setShowPreview(true);
  };

  const handleSend = async () => {
    if (
      notificationType === 'email' &&
      (!emailFormData.subject || !emailFormData.message)
    ) {
      toast.error('Please fill in subject and message');
      return;
    }

    if (
      notificationType === 'website' &&
      (!websiteFormData.title || !websiteFormData.message)
    ) {
      toast.error('Please fill in title and message');
      return;
    }

    setIsLoading(true);
    try {
      const formData =
        notificationType === 'email' ? emailFormData : websiteFormData;
      const isAllUsers = formData.targetUsers === 'all';
      const isActiveOnly =
        formData.targetUsers === 'logged-in' ||
        formData.targetUsers === 'no-purchase';
      const isMembersOnly = formData.targetUsers === 'purchased';

      await apiClient.post(API_ENDPOINTS.ADMIN.NOTIFICATIONS.SEND_BULK, {
        title:
          notificationType === 'email'
            ? emailFormData.subject
            : websiteFormData.title,
        message: formData.message,
        type: 'SYSTEM' as const,
        sendEmail: notificationType === 'email',
        activeUsersOnly: isActiveOnly || isAllUsers,
        membersOnly: isMembersOnly,
        userIds: [],
        countries: formData.countries,
        roles: formData.roles,
        registeredAfter: '',
        registeredBefore: '',
        minWalletBalance: formData.minSpent ? Number(formData.minSpent) : 0,
        data: {},
      });

      toast.success(
        `${notificationType === 'email' ? 'Email' : 'Website notification'} sent successfully!`,
      );

      if (notificationType === 'email') {
        setEmailFormData({
          targetUsers: 'all',
          countries: [],
          roles: [],
          minSpent: '',
          subject: '',
          message: '',
        });
      } else {
        setWebsiteFormData({
          targetUsers: 'all',
          countries: [],
          roles: [],
          minSpent: '',
          title: '',
          message: '',
        });
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to send notification';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const [countries, setCountries] = useState<UserCountryCount[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  const [audience, setAudience] = useState<BulkAudienceCounts | null>(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const list = await getAdminUserCountries();
        setCountries(
          list
            .filter((c) => c.country)
            .sort((a, b) => a.country.localeCompare(b.country)),
        );
      } catch (error) {
        console.error('Failed to fetch user countries:', error);
        setCountries([]);
      } finally {
        setIsLoadingCountries(false);
      }
    };
    fetchCountries();

    // Audience counts power the "(N users)" labels on each Target Users
    // tab. Best-effort: a failure leaves the labels blank rather than
    // erroring the whole page.
    getBulkAudienceCounts()
      .then(setAudience)
      .catch(() => setAudience(null));
  }, []);

  const roles = [
    'USER',
    'VIEWER',
    'SUPPORT',
    'FINANCE',
    'MANAGER',
    'ADMIN',
    'OWNER',
  ];

  return (
    <div className="p-4 lg:p-8">
      <AdminPageHeader
        title="Bulk & Notification System"
        description="Send bulk emails and website notifications to targeted user groups"
      />

      {/* Notification Type Tabs */}
      <div className="mb-6 flex items-stretch gap-2">
        <button
          onClick={() => setNotificationType('email')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-medium whitespace-nowrap transition-all sm:flex-none sm:px-6 ${
            notificationType === 'email'
              ? 'bg-[#3B82F6] text-white'
              : 'border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.05)] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.08)]'
          }`}
        >
          <Mail className="h-4 w-4 shrink-0" />
          <span>Email</span>
          <span className="hidden sm:inline">Notification</span>
        </button>
        <button
          onClick={() => setNotificationType('website')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-medium whitespace-nowrap transition-all sm:flex-none sm:px-6 ${
            notificationType === 'website'
              ? 'bg-[#3B82F6] text-white'
              : 'border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.05)] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.08)]'
          }`}
        >
          <Bell className="h-4 w-4 shrink-0" />
          <span>Website</span>
          <span className="hidden sm:inline">Notification</span>
        </button>
      </div>

      <AdminGlassCard>
        <div className="space-y-6">
          {/* Target Users */}
          <div>
            <label className="mb-3 block text-sm font-medium text-white">
              Target Users <span className="text-[#EF4444]">*</span>
            </label>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <button
                onClick={() => {
                  if (notificationType === 'email') {
                    setEmailFormData({ ...emailFormData, targetUsers: 'all' });
                  } else {
                    setWebsiteFormData({
                      ...websiteFormData,
                      targetUsers: 'all',
                    });
                  }
                }}
                className={`rounded-xl border p-4 text-left transition-all ${
                  (notificationType === 'email'
                    ? emailFormData
                    : websiteFormData
                  ).targetUsers === 'all'
                    ? 'border-[#3B82F6] bg-[rgba(59,130,246,0.1)] text-white'
                    : 'border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.03)] text-[#94A3B8] hover:border-[rgba(255,255,255,0.3)]'
                }`}
              >
                <div className="mb-1 flex items-center justify-between font-medium">
                  <span>All Users</span>
                  {audience && (
                    <span className="rounded-full bg-[rgba(255,255,255,0.08)] px-2 py-0.5 text-xs font-semibold tabular-nums">
                      {audience.all.toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="text-xs opacity-80">Send to everyone</div>
              </button>

              <button
                onClick={() => {
                  if (notificationType === 'email') {
                    setEmailFormData({
                      ...emailFormData,
                      targetUsers: 'logged-in',
                    });
                  } else {
                    setWebsiteFormData({
                      ...websiteFormData,
                      targetUsers: 'logged-in',
                    });
                  }
                }}
                className={`rounded-xl border p-4 text-left transition-all ${
                  (notificationType === 'email'
                    ? emailFormData
                    : websiteFormData
                  ).targetUsers === 'logged-in'
                    ? 'border-[#3B82F6] bg-[rgba(59,130,246,0.1)] text-white'
                    : 'border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.03)] text-[#94A3B8] hover:border-[rgba(255,255,255,0.3)]'
                }`}
              >
                <div className="mb-1 flex items-center justify-between font-medium">
                  <span>Logged-in Users</span>
                  {audience && (
                    <span className="rounded-full bg-[rgba(255,255,255,0.08)] px-2 py-0.5 text-xs font-semibold tabular-nums">
                      {audience.loggedIn.toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="text-xs opacity-80">Active users only</div>
              </button>

              <button
                onClick={() => {
                  if (notificationType === 'email') {
                    setEmailFormData({
                      ...emailFormData,
                      targetUsers: 'purchased',
                    });
                  } else {
                    setWebsiteFormData({
                      ...websiteFormData,
                      targetUsers: 'purchased',
                    });
                  }
                }}
                className={`rounded-xl border p-4 text-left transition-all ${
                  (notificationType === 'email'
                    ? emailFormData
                    : websiteFormData
                  ).targetUsers === 'purchased'
                    ? 'border-[#3B82F6] bg-[rgba(59,130,246,0.1)] text-white'
                    : 'border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.03)] text-[#94A3B8] hover:border-[rgba(255,255,255,0.3)]'
                }`}
              >
                <div className="mb-1 flex items-center justify-between font-medium">
                  <span>Purchased Users</span>
                  {audience && (
                    <span className="rounded-full bg-[rgba(255,255,255,0.08)] px-2 py-0.5 text-xs font-semibold tabular-nums">
                      {audience.purchased.toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="text-xs opacity-80">Users with purchases</div>
              </button>

              <button
                onClick={() => {
                  if (notificationType === 'email') {
                    setEmailFormData({
                      ...emailFormData,
                      targetUsers: 'no-purchase',
                    });
                  } else {
                    setWebsiteFormData({
                      ...websiteFormData,
                      targetUsers: 'no-purchase',
                    });
                  }
                }}
                className={`rounded-xl border p-4 text-left transition-all ${
                  (notificationType === 'email'
                    ? emailFormData
                    : websiteFormData
                  ).targetUsers === 'no-purchase'
                    ? 'border-[#3B82F6] bg-[rgba(59,130,246,0.1)] text-white'
                    : 'border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.03)] text-[#94A3B8] hover:border-[rgba(255,255,255,0.3)]'
                }`}
              >
                <div className="mb-1 flex items-center justify-between font-medium">
                  <span>Logged-in (No Purchase)</span>
                  {audience && (
                    <span className="rounded-full bg-[rgba(255,255,255,0.08)] px-2 py-0.5 text-xs font-semibold tabular-nums">
                      {audience.loggedInNoPurchase.toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="text-xs opacity-80">
                  Active but no purchases
                </div>
              </button>
            </div>
          </div>

          {/* Filters Section */}
          <div className="rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.03)] p-6">
            <h3 className="mb-4 text-base font-semibold text-white">
              Filters (Optional)
            </h3>

            <div className="space-y-4">
              {/* Countries - Pill Multi-select */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-white">
                    Countries{' '}
                    {countries.length > 0 && (
                      <span className="text-[#64748B]">
                        ({countries.length})
                      </span>
                    )}
                  </label>
                  {!isLoadingCountries && countries.length > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const all = countries.map((c) => c.country);
                          if (notificationType === 'email') {
                            setEmailFormData({
                              ...emailFormData,
                              countries: all,
                            });
                          } else {
                            setWebsiteFormData({
                              ...websiteFormData,
                              countries: all,
                            });
                          }
                        }}
                        className="text-xs text-[#3B82F6] hover:underline"
                      >
                        Select all
                      </button>
                      <span className="text-xs text-[#64748B]">·</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (notificationType === 'email') {
                            setEmailFormData({
                              ...emailFormData,
                              countries: [],
                            });
                          } else {
                            setWebsiteFormData({
                              ...websiteFormData,
                              countries: [],
                            });
                          }
                        }}
                        className="text-xs text-[#64748B] hover:text-white"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>
                {isLoadingCountries ? (
                  <div className="rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.05)] p-4 text-sm text-[#64748B]">
                    Loading countries...
                  </div>
                ) : countries.length === 0 ? (
                  <div className="rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.05)] p-4 text-sm text-[#64748B]">
                    No user countries available
                  </div>
                ) : (
                  <div className="max-h-[200px] overflow-y-auto rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.05)] p-3">
                    <div className="flex flex-wrap gap-2">
                      {countries.map((c) => {
                        const selected =
                          notificationType === 'email'
                            ? emailFormData.countries
                            : websiteFormData.countries;
                        const isSelected = selected.includes(c.country);
                        return (
                          <button
                            key={c.country}
                            type="button"
                            onClick={() => {
                              const current =
                                notificationType === 'email'
                                  ? emailFormData.countries
                                  : websiteFormData.countries;
                              const next = isSelected
                                ? current.filter((x) => x !== c.country)
                                : [...current, c.country];
                              if (notificationType === 'email') {
                                setEmailFormData({
                                  ...emailFormData,
                                  countries: next,
                                });
                              } else {
                                setWebsiteFormData({
                                  ...websiteFormData,
                                  countries: next,
                                });
                              }
                            }}
                            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                              isSelected
                                ? 'border border-[#3B82F6] bg-[#3B82F6] text-white'
                                : 'border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.05)] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.1)] hover:text-white'
                            }`}
                          >
                            <span>{c.country}</span>
                            <span
                              className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${
                                isSelected
                                  ? 'bg-white/20'
                                  : 'bg-[rgba(255,255,255,0.08)]'
                              }`}
                            >
                              {c.count.toLocaleString()}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Roles - Pill Multi-select */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-white">
                    Roles
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (notificationType === 'email') {
                          setEmailFormData({
                            ...emailFormData,
                            roles: [...roles],
                          });
                        } else {
                          setWebsiteFormData({
                            ...websiteFormData,
                            roles: [...roles],
                          });
                        }
                      }}
                      className="text-xs text-[#3B82F6] hover:underline"
                    >
                      Select all
                    </button>
                    <span className="text-xs text-[#64748B]">·</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (notificationType === 'email') {
                          setEmailFormData({ ...emailFormData, roles: [] });
                        } else {
                          setWebsiteFormData({ ...websiteFormData, roles: [] });
                        }
                      }}
                      className="text-xs text-[#64748B] hover:text-white"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div className="rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.05)] p-3">
                  <div className="flex flex-wrap gap-2">
                    {roles.map((role) => {
                      const selected =
                        notificationType === 'email'
                          ? emailFormData.roles
                          : websiteFormData.roles;
                      const isSelected = selected.includes(role);
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => {
                            const current =
                              notificationType === 'email'
                                ? emailFormData.roles
                                : websiteFormData.roles;
                            const next = isSelected
                              ? current.filter((x) => x !== role)
                              : [...current, role];
                            if (notificationType === 'email') {
                              setEmailFormData({
                                ...emailFormData,
                                roles: next,
                              });
                            } else {
                              setWebsiteFormData({
                                ...websiteFormData,
                                roles: next,
                              });
                            }
                          }}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                            isSelected
                              ? 'border border-[#3B82F6] bg-[#3B82F6] text-white'
                              : 'border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.05)] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.1)] hover:text-white'
                          }`}
                        >
                          {role}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Min Spent */}
              <AdminFormInput
                label="Minimum Spent ($)"
                name="minSpent"
                type="number"
                placeholder="0.00"
                value={
                  notificationType === 'email'
                    ? emailFormData.minSpent
                    : websiteFormData.minSpent
                }
                onChange={(value) => {
                  if (notificationType === 'email') {
                    setEmailFormData({ ...emailFormData, minSpent: value });
                  } else {
                    setWebsiteFormData({ ...websiteFormData, minSpent: value });
                  }
                }}
              />
            </div>
          </div>

          {/* Message Content */}
          {notificationType === 'email' ? (
            <>
              <AdminFormInput
                label="Email Subject"
                name="subject"
                required
                placeholder="Enter email subject"
                value={emailFormData.subject}
                onChange={(value) =>
                  setEmailFormData({ ...emailFormData, subject: value })
                }
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Email Message <span className="text-[#EF4444]">*</span>
                </label>
                <textarea
                  value={emailFormData.message}
                  onChange={(e) =>
                    setEmailFormData({
                      ...emailFormData,
                      message: e.target.value,
                    })
                  }
                  rows={10}
                  className="w-full resize-none rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                  placeholder="Enter your email message here..."
                />
                <p className="mt-2 text-xs text-[#64748B]">
                  Rich text editor with HTML support
                </p>
              </div>
            </>
          ) : (
            <>
              <AdminFormInput
                label="Notification Title"
                name="title"
                required
                placeholder="Enter notification title"
                value={websiteFormData.title}
                onChange={(value) =>
                  setWebsiteFormData({ ...websiteFormData, title: value })
                }
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Notification Message <span className="text-[#EF4444]">*</span>
                </label>
                <textarea
                  value={websiteFormData.message}
                  onChange={(e) =>
                    setWebsiteFormData({
                      ...websiteFormData,
                      message: e.target.value,
                    })
                  }
                  rows={6}
                  className="w-full resize-none rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                  placeholder="Enter your notification message here..."
                />
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex items-stretch gap-3 pt-4 sm:gap-4">
            <button
              onClick={handlePreview}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-3 py-3 font-medium whitespace-nowrap text-white transition-colors hover:bg-[rgba(255,255,255,0.12)] sm:px-6"
            >
              <Eye className="h-5 w-5 shrink-0" />
              Preview
            </button>
            <button
              onClick={handleSend}
              disabled={isLoading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#3B82F6] px-3 py-3 font-medium whitespace-nowrap text-white transition-colors hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-50 sm:px-6"
            >
              {isLoading ? (
                <>
                  <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 shrink-0" />
                  <span>Send</span>
                  <span className="hidden sm:inline">Notification</span>
                </>
              )}
            </button>
          </div>
        </div>
      </AdminGlassCard>
      {/* Preview Modal */}
      {showPreview &&
        (() => {
          const formData =
            notificationType === 'email' ? emailFormData : websiteFormData;
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="mx-4 w-full max-w-lg rounded-2xl border border-[rgba(255,255,255,0.18)] bg-[#1E293B] shadow-2xl">
                <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.1)] p-6">
                  <h3 className="text-lg font-semibold text-white">
                    Notification Preview
                  </h3>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="text-[#94A3B8] transition-colors hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4 p-6">
                  <div className="flex items-center gap-2 text-sm">
                    {notificationType === 'email' ? (
                      <Mail className="h-4 w-4 text-[#3B82F6]" />
                    ) : (
                      <Bell className="h-4 w-4 text-[#3B82F6]" />
                    )}
                    <span className="font-medium text-[#3B82F6] capitalize">
                      {notificationType} Notification
                    </span>
                  </div>

                  <div>
                    <span className="text-xs tracking-wider text-[#64748B] uppercase">
                      Target
                    </span>
                    <p className="mt-1 text-sm text-white">
                      {targetLabels[formData.targetUsers]}
                    </p>
                  </div>

                  {formData.countries.length > 0 && (
                    <div>
                      <span className="text-xs tracking-wider text-[#64748B] uppercase">
                        Countries
                      </span>
                      <p className="mt-1 text-sm text-white">
                        {formData.countries.join(', ')}
                      </p>
                    </div>
                  )}

                  {formData.roles.length > 0 && (
                    <div>
                      <span className="text-xs tracking-wider text-[#64748B] uppercase">
                        Roles
                      </span>
                      <p className="mt-1 text-sm text-white">
                        {formData.roles.join(', ')}
                      </p>
                    </div>
                  )}

                  {formData.minSpent && (
                    <div>
                      <span className="text-xs tracking-wider text-[#64748B] uppercase">
                        Min Spent
                      </span>
                      <p className="mt-1 text-sm text-white">
                        ${formData.minSpent}
                      </p>
                    </div>
                  )}

                  <div>
                    <span className="text-xs tracking-wider text-[#64748B] uppercase">
                      {notificationType === 'email' ? 'Subject' : 'Title'}
                    </span>
                    <p className="mt-1 text-sm font-medium text-white">
                      {notificationType === 'email'
                        ? emailFormData.subject
                        : websiteFormData.title}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs tracking-wider text-[#64748B] uppercase">
                      Message
                    </span>
                    <p className="mt-1 max-h-40 overflow-y-auto rounded-xl bg-[rgba(255,255,255,0.05)] p-4 text-sm whitespace-pre-wrap text-white">
                      {formData.message}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-t border-[rgba(255,255,255,0.1)] p-6">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="flex-1 rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-6 py-3 font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.12)]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setShowPreview(false);
                      handleSend();
                    }}
                    disabled={isLoading}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#3B82F6] px-6 py-3 font-medium text-white transition-colors hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    Confirm & Send
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}
