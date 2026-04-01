'use client';

import { useState } from "react";
import { AdminPageHeader } from '@/components/admin/page-header';
import { AdminGlassCard } from '@/components/admin/glass-card';
import { AdminFormInput } from '@/components/admin/form-input';
import { toast } from 'sonner';
import { Send, Eye, Mail, Bell, X } from "lucide-react";
import { apiClient } from '@/config/api-client.config';
import { API_ENDPOINTS } from '@/config/server.config';

export default function AdminNotificationsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [notificationType, setNotificationType] = useState<"email" | "website">("email");

  const [emailFormData, setEmailFormData] = useState({
    targetUsers: "all",
    countries: [] as string[],
    roles: [] as string[],
    minSpent: "",
    subject: "",
    message: "",
  });

  const [websiteFormData, setWebsiteFormData] = useState({
    targetUsers: "all",
    countries: [] as string[],
    roles: [] as string[],
    minSpent: "",
    title: "",
    message: "",
  });

  const targetLabels: Record<string, string> = {
    all: "All Users",
    "logged-in": "Logged-in Users",
    purchased: "Purchased Users",
    "no-purchase": "Logged-in (No Purchase)",
  };

  const handlePreview = () => {
    const formData = notificationType === "email" ? emailFormData : websiteFormData;

    if (notificationType === "email" && (!emailFormData.subject || !emailFormData.message)) {
      toast.error("Please fill in subject and message");
      return;
    }
    if (notificationType === "website" && (!websiteFormData.title || !websiteFormData.message)) {
      toast.error("Please fill in title and message");
      return;
    }

    setShowPreview(true);
  };

  const handleSend = async () => {
    if (notificationType === "email" && (!emailFormData.subject || !emailFormData.message)) {
      toast.error("Please fill in subject and message");
      return;
    }

    if (notificationType === "website" && (!websiteFormData.title || !websiteFormData.message)) {
      toast.error("Please fill in title and message");
      return;
    }

    setIsLoading(true);
    try {
      const formData = notificationType === "email" ? emailFormData : websiteFormData;
      const isAllUsers = formData.targetUsers === "all";
      const isActiveOnly = formData.targetUsers === "logged-in" || formData.targetUsers === "no-purchase";
      const isMembersOnly = formData.targetUsers === "purchased";

      await apiClient.post(API_ENDPOINTS.ADMIN.NOTIFICATIONS.SEND_BULK, {
        title: notificationType === "email" ? emailFormData.subject : websiteFormData.title,
        message: formData.message,
        type: "SYSTEM" as const,
        sendEmail: notificationType === "email",
        activeUsersOnly: isActiveOnly || isAllUsers,
        membersOnly: isMembersOnly,
        userIds: [],
        registeredAfter: "",
        registeredBefore: "",
        minWalletBalance: formData.minSpent ? Number(formData.minSpent) : 0,
        data: {},
      });

      toast.success(`${notificationType === "email" ? "Email" : "Website notification"} sent successfully!`);

      if (notificationType === "email") {
        setEmailFormData({ targetUsers: "all", countries: [], roles: [], minSpent: "", subject: "", message: "" });
      } else {
        setWebsiteFormData({ targetUsers: "all", countries: [], roles: [], minSpent: "", title: "", message: "" });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to send notification";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const countries = [
    "United States",
    "United Kingdom",
    "Canada",
    "Australia",
    "Germany",
    "France",
    "Spain",
    "Italy",
  ];

  const roles = ["Admin", "User", "VIP", "Premium"];

  return (
    <div className="p-4 lg:p-8">
      <AdminPageHeader
        title="Bulk & Notification System"
        description="Send bulk emails and website notifications to targeted user groups"
      />

      {/* Notification Type Tabs */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setNotificationType("email")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all ${
            notificationType === "email"
              ? "bg-[#3B82F6] text-white"
              : "bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.18)] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.08)]"
          }`}
        >
          <Mail className="w-4 h-4" />
          Email Notification
        </button>
        <button
          onClick={() => setNotificationType("website")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all ${
            notificationType === "website"
              ? "bg-[#3B82F6] text-white"
              : "bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.18)] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.08)]"
          }`}
        >
          <Bell className="w-4 h-4" />
          Website Notification
        </button>
      </div>

      <AdminGlassCard>
        <div className="space-y-6">
          {/* Target Users */}
          <div>
            <label className="text-white text-sm font-medium mb-3 block">
              Target Users <span className="text-[#EF4444]">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={() => {
                  if (notificationType === "email") {
                    setEmailFormData({ ...emailFormData, targetUsers: "all" });
                  } else {
                    setWebsiteFormData({ ...websiteFormData, targetUsers: "all" });
                  }
                }}
                className={`p-4 rounded-xl border transition-all text-left ${
                  (notificationType === "email" ? emailFormData : websiteFormData).targetUsers === "all"
                    ? "bg-[rgba(59,130,246,0.1)] border-[#3B82F6] text-white"
                    : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.18)] text-[#94A3B8] hover:border-[rgba(255,255,255,0.3)]"
                }`}
              >
                <div className="font-medium mb-1">All Users</div>
                <div className="text-xs opacity-80">Send to everyone</div>
              </button>

              <button
                onClick={() => {
                  if (notificationType === "email") {
                    setEmailFormData({ ...emailFormData, targetUsers: "logged-in" });
                  } else {
                    setWebsiteFormData({ ...websiteFormData, targetUsers: "logged-in" });
                  }
                }}
                className={`p-4 rounded-xl border transition-all text-left ${
                  (notificationType === "email" ? emailFormData : websiteFormData).targetUsers === "logged-in"
                    ? "bg-[rgba(59,130,246,0.1)] border-[#3B82F6] text-white"
                    : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.18)] text-[#94A3B8] hover:border-[rgba(255,255,255,0.3)]"
                }`}
              >
                <div className="font-medium mb-1">Logged-in Users</div>
                <div className="text-xs opacity-80">Active users only</div>
              </button>

              <button
                onClick={() => {
                  if (notificationType === "email") {
                    setEmailFormData({ ...emailFormData, targetUsers: "purchased" });
                  } else {
                    setWebsiteFormData({ ...websiteFormData, targetUsers: "purchased" });
                  }
                }}
                className={`p-4 rounded-xl border transition-all text-left ${
                  (notificationType === "email" ? emailFormData : websiteFormData).targetUsers === "purchased"
                    ? "bg-[rgba(59,130,246,0.1)] border-[#3B82F6] text-white"
                    : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.18)] text-[#94A3B8] hover:border-[rgba(255,255,255,0.3)]"
                }`}
              >
                <div className="font-medium mb-1">Purchased Users</div>
                <div className="text-xs opacity-80">Users with purchases</div>
              </button>

              <button
                onClick={() => {
                  if (notificationType === "email") {
                    setEmailFormData({ ...emailFormData, targetUsers: "no-purchase" });
                  } else {
                    setWebsiteFormData({ ...websiteFormData, targetUsers: "no-purchase" });
                  }
                }}
                className={`p-4 rounded-xl border transition-all text-left ${
                  (notificationType === "email" ? emailFormData : websiteFormData).targetUsers === "no-purchase"
                    ? "bg-[rgba(59,130,246,0.1)] border-[#3B82F6] text-white"
                    : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.18)] text-[#94A3B8] hover:border-[rgba(255,255,255,0.3)]"
                }`}
              >
                <div className="font-medium mb-1">Logged-in (No Purchase)</div>
                <div className="text-xs opacity-80">Active but no purchases</div>
              </button>
            </div>
          </div>

          {/* Filters Section */}
          <div className="p-6 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.18)]">
            <h3 className="text-white text-base font-semibold mb-4">Filters (Optional)</h3>

            <div className="space-y-4">
              {/* Countries Multi-select */}
              <div>
                <label className="text-white text-sm font-medium mb-2 block">
                  Countries
                </label>
                <select
                  multiple
                  className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] min-h-[120px]"
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    if (notificationType === "email") {
                      setEmailFormData({ ...emailFormData, countries: selected });
                    } else {
                      setWebsiteFormData({ ...websiteFormData, countries: selected });
                    }
                  }}
                >
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
                <p className="text-[#64748B] text-xs mt-1">Hold Ctrl/Cmd to select multiple</p>
              </div>

              {/* Roles */}
              <div>
                <label className="text-white text-sm font-medium mb-2 block">
                  Roles
                </label>
                <select
                  multiple
                  className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] min-h-[100px]"
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    if (notificationType === "email") {
                      setEmailFormData({ ...emailFormData, roles: selected });
                    } else {
                      setWebsiteFormData({ ...websiteFormData, roles: selected });
                    }
                  }}
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              {/* Min Spent */}
              <AdminFormInput
                label="Minimum Spent ($)"
                name="minSpent"
                type="number"
                placeholder="0.00"
                value={notificationType === "email" ? emailFormData.minSpent : websiteFormData.minSpent}
                onChange={(value) => {
                  if (notificationType === "email") {
                    setEmailFormData({ ...emailFormData, minSpent: value });
                  } else {
                    setWebsiteFormData({ ...websiteFormData, minSpent: value });
                  }
                }}
              />
            </div>
          </div>

          {/* Message Content */}
          {notificationType === "email" ? (
            <>
              <AdminFormInput
                label="Email Subject"
                name="subject"
                required
                placeholder="Enter email subject"
                value={emailFormData.subject}
                onChange={(value) => setEmailFormData({ ...emailFormData, subject: value })}
              />

              <div>
                <label className="text-white text-sm font-medium mb-2 block">
                  Email Message <span className="text-[#EF4444]">*</span>
                </label>
                <textarea
                  value={emailFormData.message}
                  onChange={(e) => setEmailFormData({ ...emailFormData, message: e.target.value })}
                  rows={10}
                  className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] resize-none"
                  placeholder="Enter your email message here..."
                />
                <p className="text-[#64748B] text-xs mt-2">
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
                onChange={(value) => setWebsiteFormData({ ...websiteFormData, title: value })}
              />

              <div>
                <label className="text-white text-sm font-medium mb-2 block">
                  Notification Message <span className="text-[#EF4444]">*</span>
                </label>
                <textarea
                  value={websiteFormData.message}
                  onChange={(e) => setWebsiteFormData({ ...websiteFormData, message: e.target.value })}
                  rows={6}
                  className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] resize-none"
                  placeholder="Enter your notification message here..."
                />
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-4 pt-4">
            <button
              onClick={handlePreview}
              className="flex-1 px-6 py-3 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white hover:bg-[rgba(255,255,255,0.12)] transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Eye className="w-5 h-5" />
              Preview
            </button>
            <button
              onClick={handleSend}
              disabled={isLoading}
              className="flex-1 px-6 py-3 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Notification
                </>
              )}
            </button>
          </div>
        </div>
      </AdminGlassCard>
      {/* Preview Modal */}
      {showPreview && (() => {
        const formData = notificationType === "email" ? emailFormData : websiteFormData;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-lg mx-4 rounded-2xl bg-[#1E293B] border border-[rgba(255,255,255,0.18)] shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-[rgba(255,255,255,0.1)]">
                <h3 className="text-white text-lg font-semibold">Notification Preview</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-[#94A3B8] hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  {notificationType === "email" ? <Mail className="w-4 h-4 text-[#3B82F6]" /> : <Bell className="w-4 h-4 text-[#3B82F6]" />}
                  <span className="text-[#3B82F6] font-medium capitalize">{notificationType} Notification</span>
                </div>

                <div>
                  <span className="text-[#64748B] text-xs uppercase tracking-wider">Target</span>
                  <p className="text-white text-sm mt-1">{targetLabels[formData.targetUsers]}</p>
                </div>

                {formData.countries.length > 0 && (
                  <div>
                    <span className="text-[#64748B] text-xs uppercase tracking-wider">Countries</span>
                    <p className="text-white text-sm mt-1">{formData.countries.join(", ")}</p>
                  </div>
                )}

                {formData.roles.length > 0 && (
                  <div>
                    <span className="text-[#64748B] text-xs uppercase tracking-wider">Roles</span>
                    <p className="text-white text-sm mt-1">{formData.roles.join(", ")}</p>
                  </div>
                )}

                {formData.minSpent && (
                  <div>
                    <span className="text-[#64748B] text-xs uppercase tracking-wider">Min Spent</span>
                    <p className="text-white text-sm mt-1">${formData.minSpent}</p>
                  </div>
                )}

                <div>
                  <span className="text-[#64748B] text-xs uppercase tracking-wider">
                    {notificationType === "email" ? "Subject" : "Title"}
                  </span>
                  <p className="text-white text-sm mt-1 font-medium">
                    {notificationType === "email" ? emailFormData.subject : websiteFormData.title}
                  </p>
                </div>

                <div>
                  <span className="text-[#64748B] text-xs uppercase tracking-wider">Message</span>
                  <p className="text-white text-sm mt-1 whitespace-pre-wrap bg-[rgba(255,255,255,0.05)] rounded-xl p-4 max-h-40 overflow-y-auto">
                    {formData.message}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-6 border-t border-[rgba(255,255,255,0.1)]">
                <button
                  onClick={() => setShowPreview(false)}
                  className="flex-1 px-6 py-3 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white hover:bg-[rgba(255,255,255,0.12)] transition-colors font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    setShowPreview(false);
                    handleSend();
                  }}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
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
