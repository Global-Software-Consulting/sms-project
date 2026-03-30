'use client';

import { useState } from "react";
import { toast } from "sonner";
import {
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Send,
  Shield,
  Star,
  BarChart3,
  Eye,
  Globe,
  MessageCircle,
  Music,
  Upload,
  X,
  Plus,
} from "lucide-react";

// Mock data for languages
const languagesData = [
  { code: "GB", name: "English", langCode: "EN", isDefault: true },
  { code: "SE", name: "Swedish", langCode: "SV", isDefault: false },
  { code: "NO", name: "Norwegian", langCode: "NO", isDefault: false },
  { code: "DK", name: "Danish", langCode: "DK", isDefault: false },
  { code: "FI", name: "Finnish", langCode: "FI", isDefault: false },
  { code: "FR", name: "French", langCode: "FR", isDefault: false },
  { code: "DE", name: "German", langCode: "DE", isDefault: false },
  { code: "ES", name: "Spanish", langCode: "ES", isDefault: false },
  { code: "IT", name: "Italian", langCode: "IT", isDefault: false },
  { code: "RU", name: "Russian", langCode: "RU", isDefault: false },
  { code: "TR", name: "Turkish", langCode: "TR", isDefault: false },
  { code: "SA", name: "Arabic", langCode: "AR", isDefault: false },
  { code: "IN", name: "Hindi", langCode: "HI", isDefault: false },
  { code: "CN", name: "Chinese", langCode: "ZH", isDefault: false },
];

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<
    "social" | "contact" | "page" | "email" | "addons" | "trial" | "logo" | "status" | "language"
  >("social");
  const [isLoading, setIsLoading] = useState(false);
  const [activePage, setActivePage] = useState("home");

  // Social Media State
  const [socialMedia, setSocialMedia] = useState({
    twitter: { url: "https://x.com/VipStoreHQ", visible: true },
    facebook: { url: "", visible: false },
    instagram: { url: "https://www.instagram.com/vipstorehq", visible: true },
    linkedin: { url: "https://www.linkedin.com/in/alen-omer-18663519", visible: true },
    youtube: { url: "", visible: false },
    tiktok: { url: "https://www.cheapstreamtv.com/dashboard/orders", visible: false },
    telegram: { url: "", visible: false },
  });

  // Email Content State
  const [emailContent, setEmailContent] = useState(
    `Welcome to CheapStreamTV IPTV Setup Guide

Thank you for your order! Here a quick setup guide to get your IPTV service up and running smoothly.

Step-by-Step Setup:
Our IPTV works on:
Android (TV/Box/Phone/Tablet)
IOS/iPadOS (iPhone/iPad)
Smart TV (Samsung/LG)
Firestick / FireTV
Windows/macOS (via VLC or IPTV Players)

2. Use Our Recommended App:
We recommend using MyTvOnline+, Xtream IPTV, Vu IPTV Player, for the best experience. You can also use Smart IPTV (SIPTV) or IBO Player if you prefer.

3. Login Credentials:
You'll receive your IPTV credentials shortly. Use the following formats:

M3U URL
Username + Password + Portal URL (for Xtream Codes apps)

4. Enter Your Details:
Open your selected app and input the credentials provided. Make sure your internet is stable and VPN is off (unless instructed otherwise).

5. for MAG or Enigma2 devices No setup is needed on your side the system will connect directly once the order is processed.

✅ Need Help?
Our support team is available 24/7 to assist you.
Feel free to contact us via your dashboard ticket or Telegram.

Enjoy your streaming!
CheapStreamTV Team
www.cheapstreamtv.com`
  );

  // Contact Information State
  const [contactInfo, setContactInfo] = useState({
    phone: "+447727751217",
    email: "help@cheapstreamtv.com",
    businessHours: "We're available 24/7 full-time, every day of the week.",
    helpMessage:
      "If you have any questions about your order, please describe it and include your Order ID in the message (example: zxxxx-xxxx-xxx).",
    buttonText: "Submit Request",
    successMessage:
      "Thank you for choosing Cheap Streamwhere great entertainment meets unbeatable value. We look forward to assisting you!",
  });

  // Free Trial State
  const [freeTrial, setFreeTrial] = useState({
    mainTitle: "Start Your Free Trial",
    description:
      "Experience 4 hours of premium entertainment. Try top-tier live channels and on-demand content with no commitment.",
    sectionTitle: "What Do You Get with Your Free Trial?",
    items: [
      "Instant activation - No credit card required",
      "Full HD & 4K streams",
      "Works on all devices (Mobile, PC, Smart TV, Firestick, m3u, MAG, Enigma)",
      "27,000+ Live Channels",
      "131,000+ VOD",
      "52,000+ TV Series",
      "Friendly support via ticket or WhatsApp",
      "Get a real feel before you subscribe",
    ],
  });

  // Site Status State
  const [siteStatus, setSiteStatus] = useState({
    isActive: true,
    maintenanceMessage: "We're currently performing maintenance. Please check back later.",
  });

  // Page Edit State
  const [pageContent, setPageContent] = useState({
    headingPart1: "Best IPTV Subscription Service 2026",
    headingPart2: "CheapStreamTV",
    description:
      "Enjoy seamless access to 22,000+ live channels and 180,000+ movies & series with CheapStreamTV. Secure IPTV subscription service with 24/7 fast, caring I.A support, and flexible refund policy compatibility. No buffering. No contracts.",
    inputPlaceholder: "Email Address",
    buttonText: "Get Started",
    pageTitle: "Cheap Stream TV Premium Access to Global Digital Store",
    metaDescription: "Experience smooth, high-speed digital access for global",
    keywords: "best IPTV service, streaming, movies, TV shows, live channels",
    ogTitle: "Cheap Stream - Premium IPTV Service Provider test",
    ogDescription: "best Stream thousands of movies, TV shows, and live channels",
  });

  // Addons State
  const [addons, setAddons] = useState({
    recaptcha: {
      enabled: true,
      siteKey: "6Lc4c7BJAAAAJCRKEkgnKJhyjtPvER__TxsMSp0H",
      secretKey: "6Lc4c7BJAAAAkkLJ7BQTh_NqverPynuSznTivEnO3",
    },
    trustpilot: { enabled: false },
    googleAnalytics: {
      enabled: true,
      measurementId: "G-Y7TVVML9P",
    },
    microsoftClarity: { enabled: false },
    cloudflare: { enabled: false },
    getbutton: { enabled: false },
    tawkto: { enabled: false },
  });

  // Languages State
  const [languages, setLanguages] = useState(languagesData);

  const handleSave = async (type: string) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    toast.success(`${type} updated successfully!`);
  };

  const handleRefresh = () => {
    toast.info("Refreshing settings...");
  };

  const handleDeactivateLanguage = (langCode: string) => {
    setLanguages(languages.filter((lang) => lang.code !== langCode));
    toast.success("Language deactivated successfully!");
  };

  const handleSetDefault = (langCode: string) => {
    setLanguages(
      languages.map((lang) => ({
        ...lang,
        isDefault: lang.code === langCode,
      }))
    );
    toast.success("Default language updated!");
  };

  const toggleAddon = (addon: string) => {
    setAddons({
      ...addons,
      [addon]: { ...addons[addon as keyof typeof addons], enabled: !addons[addon as keyof typeof addons].enabled },
    });
  };

  const removeTrialItem = (index: number) => {
    setFreeTrial({
      ...freeTrial,
      items: freeTrial.items.filter((_, i) => i !== index),
    });
  };

  const addTrialItem = () => {
    setFreeTrial({
      ...freeTrial,
      items: [...freeTrial.items, ""],
    });
  };

  const updateTrialItem = (index: number, value: string) => {
    const newItems = [...freeTrial.items];
    newItems[index] = value;
    setFreeTrial({ ...freeTrial, items: newItems });
  };

  const tabs = [
    { id: "social", label: "Social Media" },
    { id: "contact", label: "Contact & Support Ticket" },
    { id: "page", label: "Page Edit" },
    { id: "email", label: "Email Content Management" },
    { id: "addons", label: "Addons Management" },
    { id: "trial", label: "Free Trial Management" },
    { id: "logo", label: "Logo Management" },
    { id: "status", label: "Site Status" },
    { id: "language", label: "Language Management" },
  ];

  const pageButtons = [
    { id: "home", label: "Home" },
    { id: "about", label: "About Us" },
    { id: "affiliate", label: "Affiliate" },
    { id: "blogs", label: "Blogs" },
    { id: "fullmenu", label: "Fullmenu" },
    { id: "knowledge", label: "Knowledge Base" },
    { id: "packages", label: "Packages" },
    { id: "privacy", label: "Privacy Policy" },
    { id: "terms", label: "Terms of Use" },
    { id: "legal", label: "Legal Disclaimer" },
    { id: "contact", label: "Contact" },
    { id: "faq", label: "FAQ" },
    { id: "pricing", label: "Pricing" },
  ];

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-white text-3xl font-semibold mb-2">
          System Settings
        </h1>
        <p className="text-[#94A3B8] text-sm">
          Manage your system configuration, social media, content, and integrations
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-6 mb-8 border-b border-[rgba(255,255,255,0.18)] overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 px-2 text-sm font-medium transition-colors whitespace-nowrap relative ${
              activeTab === tab.id ? "text-[#3B82F6]" : "text-[#64748B] hover:text-white"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3B82F6]" />}
          </button>
        ))}
      </div>

      {/* Social Media Tab */}
      {activeTab === "social" && (
        <div className="max-w-5xl">
          <div className="p-8 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl mb-6">
            <h2 className="text-white text-2xl font-semibold mb-2">Social Media Management</h2>
            <p className="text-[#94A3B8] text-sm">
              Manage your social media links that will be displayed in the footer.
            </p>
          </div>

          <div className="p-8 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl">
            <h3 className="text-white text-lg font-semibold mb-6">Social Media Links</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {Object.entries(socialMedia).map(([key, value]) => {
                const icons = {
                  twitter: <Twitter className="w-5 h-5 text-[#1DA1F2]" />,
                  facebook: <Facebook className="w-5 h-5 text-[#1877F2]" />,
                  instagram: <Instagram className="w-5 h-5 text-[#E4405F]" />,
                  linkedin: <Linkedin className="w-5 h-5 text-[#0A66C2]" />,
                  youtube: <Youtube className="w-5 h-5 text-[#FF0000]" />,
                  tiktok: <Music className="w-5 h-5 text-[#00F2EA]" />,
                  telegram: <Send className="w-5 h-5 text-[#26A5E4]" />,
                };

                const names = {
                  twitter: "Twitter",
                  facebook: "Facebook",
                  instagram: "Instagram",
                  linkedin: "LinkedIn",
                  youtube: "YouTube",
                  tiktok: "TikTok",
                  telegram: "Telegram",
                };

                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {icons[key as keyof typeof icons]}
                        <span className="text-white text-sm font-medium">
                          {names[key as keyof typeof names]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            value.visible ? "bg-[#22C55E]/20 text-[#22C55E]" : "bg-[#64748B]/20 text-[#64748B]"
                          }`}
                        >
                          {value.visible ? "Visible" : "Hidden"}
                        </span>
                        <button
                          onClick={() =>
                            setSocialMedia({
                              ...socialMedia,
                              [key]: { ...value, visible: !value.visible },
                            })
                          }
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            value.visible ? "bg-[#22C55E]" : "bg-[rgba(255,255,255,0.18)]"
                          }`}
                        >
                          <div
                            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                              value.visible ? "translate-x-6" : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                    <p className="text-[#64748B] text-xs mb-2">Show in footer</p>
                    <input
                      type="text"
                      value={value.url}
                      onChange={(e) =>
                        setSocialMedia({
                          ...socialMedia,
                          [key]: { ...value, url: e.target.value },
                        })
                      }
                      placeholder={`Enter ${names[key as keyof typeof names]} URL`}
                      className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] placeholder:text-[#64748B]"
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-start gap-4">
              <button
                onClick={handleRefresh}
                className="px-6 py-3 rounded-lg bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white hover:bg-[rgba(255,255,255,0.12)] transition-colors text-sm font-medium"
              >
                Refresh
              </button>
              <button
                onClick={() => handleSave("Social media links")}
                disabled={isLoading}
                className="px-6 py-3 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact & Support Ticket Tab */}
      {activeTab === "contact" && (
        <div className="max-w-5xl">
          <div className="p-8 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl mb-6">
            <h2 className="text-white text-2xl font-semibold mb-2">Contact Information Management</h2>
            <p className="text-[#94A3B8] text-sm">
              Manage your contact information that will be displayed in the footer and contact form.
            </p>
          </div>

          <div className="space-y-6">
            {/* Contact Details */}
            <div className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl">
              <h3 className="text-white text-base font-semibold mb-4">Contact Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                    className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  />
                </div>
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                    className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  />
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl">
              <h3 className="text-white text-base font-semibold mb-4">Business Hours</h3>
              <label className="text-white text-sm font-medium mb-2 block">
                Business Hours
              </label>
              <input
                type="text"
                value={contactInfo.businessHours}
                onChange={(e) => setContactInfo({ ...contactInfo, businessHours: e.target.value })}
                className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
              />
              <p className="text-[#64748B] text-xs mt-2">This will be displayed in the footer</p>
            </div>

            {/* Support Message */}
            <div className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl">
              <h3 className="text-white text-base font-semibold mb-4">Support Message</h3>
              <label className="text-white text-sm font-medium mb-2 block">
                Help Message
              </label>
              <textarea
                value={contactInfo.helpMessage}
                onChange={(e) => setContactInfo({ ...contactInfo, helpMessage: e.target.value })}
                rows={3}
                className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] resize-none"
              />
              <p className="text-[#64748B] text-xs mt-2">This message will be shown above the contact form</p>
            </div>

            {/* Support Ticket Settings */}
            <div className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl">
              <h3 className="text-white text-base font-semibold mb-4">Support Ticket Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Button Text</label>
                  <input
                    type="text"
                    value={contactInfo.buttonText}
                    onChange={(e) => setContactInfo({ ...contactInfo, buttonText: e.target.value })}
                    className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  />
                  <p className="text-[#64748B] text-xs mt-2">Text for the submit button on contact form</p>
                </div>

                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Success Message</label>
                  <textarea
                    value={contactInfo.successMessage}
                    onChange={(e) => setContactInfo({ ...contactInfo, successMessage: e.target.value })}
                    rows={2}
                    className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] resize-none"
                  />
                  <p className="text-[#64748B] text-xs mt-2">Message shown after successful form submission</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-start gap-4">
              <button
                onClick={handleRefresh}
                className="px-6 py-3 rounded-lg bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white hover:bg-[rgba(255,255,255,0.12)] transition-colors text-sm font-medium"
              >
                Refresh
              </button>
              <button
                onClick={() => handleSave("Contact information")}
                disabled={isLoading}
                className="px-6 py-3 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Content Management Tab */}
      {activeTab === "email" && (
        <div className="max-w-5xl">
          <div className="p-8 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl mb-6">
            <h2 className="text-white text-2xl font-semibold mb-2">Email Content Management</h2>
            <p className="text-[#94A3B8] text-sm">Manage IPTV guides and instructions for emails and dashboard</p>
          </div>

          <div className="p-8 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl">
            <h3 className="text-white text-lg font-semibold mb-4">IPTV Setup Guide Content</h3>

            <div className="mb-6">
              <div className="flex items-center gap-2 p-4 rounded-t-lg bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] border-b-0">
                <button className="p-2 hover:bg-[rgba(255,255,255,0.1)] rounded text-white transition-colors">
                  <strong>B</strong>
                </button>
                <button className="p-2 hover:bg-[rgba(255,255,255,0.1)] rounded text-white transition-colors">
                  <em>I</em>
                </button>
                <div className="w-px h-6 bg-[rgba(255,255,255,0.18)]" />
                <button className="p-2 hover:bg-[rgba(255,255,255,0.1)] rounded text-white text-sm transition-colors">
                  • List
                </button>
                <button className="p-2 hover:bg-[rgba(255,255,255,0.1)] rounded text-white text-sm transition-colors">
                  1. List
                </button>
              </div>
              <textarea
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                rows={20}
                className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-b-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] resize-none font-mono"
              />
            </div>

            <div className="flex items-center justify-end">
              <button
                onClick={() => handleSave("Email content")}
                disabled={isLoading}
                className="px-6 py-3 rounded-lg bg-[#06B6D4] hover:bg-[#0891B2] text-white transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Free Trial Management Tab */}
      {activeTab === "trial" && (
        <div className="max-w-5xl">
          <div className="p-8 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl mb-6">
            <h2 className="text-white text-2xl font-semibold mb-2">Free Trial Management</h2>
            <p className="text-[#94A3B8] text-sm">Manage your free trial content from admin panel</p>
          </div>

          <div className="space-y-6">
            {/* Main Title & Description */}
            <div className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl">
              <h3 className="text-white text-base font-semibold mb-4">Main Title</h3>
              <input
                type="text"
                value={freeTrial.mainTitle}
                onChange={(e) => setFreeTrial({ ...freeTrial, mainTitle: e.target.value })}
                className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] mb-4"
              />

              <h3 className="text-white text-base font-semibold mb-4">Description</h3>
              <textarea
                value={freeTrial.description}
                onChange={(e) => setFreeTrial({ ...freeTrial, description: e.target.value })}
                rows={3}
                className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] resize-none"
              />
            </div>

            {/* Features Section */}
            <div className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl">
              <h3 className="text-white text-base font-semibold mb-4">Features</h3>

              <div className="mb-4">
                <label className="text-white text-sm font-medium mb-2 block">Section Title</label>
                <input
                  type="text"
                  value={freeTrial.sectionTitle}
                  onChange={(e) => setFreeTrial({ ...freeTrial, sectionTitle: e.target.value })}
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                />
              </div>

              <h4 className="text-white text-sm font-medium mb-3">Feature Items</h4>
              <div className="space-y-2 mb-4">
                {freeTrial.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateTrialItem(index, e.target.value)}
                      className="flex-1 bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                    />
                    <button
                      onClick={() => removeTrialItem(index)}
                      className="px-3 py-2.5 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-white text-sm font-medium transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={addTrialItem}
                className="px-4 py-2 rounded-lg bg-[#22C55E] hover:bg-[#16A34A] text-white text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-start gap-4">
              <button
                onClick={handleRefresh}
                className="px-6 py-3 rounded-lg bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white hover:bg-[rgba(255,255,255,0.12)] transition-colors text-sm font-medium"
              >
                Refresh
              </button>
              <button
                onClick={() => handleSave("Free trial content")}
                disabled={isLoading}
                className="px-6 py-3 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Updating..." : "Update Content"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logo Management Tab */}
      {activeTab === "logo" && (
        <div className="max-w-5xl">
          <div className="p-8 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl mb-6">
            <h2 className="text-white text-2xl font-semibold mb-2">Logo Management</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Main Logo */}
            <div className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl">
              <h3 className="text-white text-base font-semibold mb-2">Main Logo</h3>
              <p className="text-[#64748B] text-sm mb-4">
                Used in the navbar and header (Recommended: 100x103px)
              </p>

              <div className="relative w-full h-48 rounded-lg bg-white flex items-center justify-center mb-4 border-2 border-dashed border-[rgba(255,255,255,0.2)]">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                    <span className="text-6xl">👑</span>
                  </div>
                  <p className="text-[#3B82F6] font-semibold">STREAM</p>
                </div>
                <button className="absolute top-2 right-2 w-8 h-8 rounded-full bg-[#EF4444] hover:bg-[#DC2626] flex items-center justify-center text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <button className="w-full px-4 py-3 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors flex items-center justify-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Main Logo
              </button>
            </div>

            {/* Favicon */}
            <div className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl">
              <h3 className="text-white text-base font-semibold mb-2">Favicon</h3>
              <p className="text-[#64748B] text-sm mb-4">
                Browser tab icon (Recommended: 32x32px, ico or png)
              </p>

              <div className="relative w-full h-48 rounded-lg bg-white flex items-center justify-center mb-4 border-2 border-dashed border-[rgba(255,255,255,0.2)]">
                <div className="text-6xl">👑</div>
                <button className="absolute top-2 right-2 w-8 h-8 rounded-full bg-[#EF4444] hover:bg-[#DC2626] flex items-center justify-center text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <button className="w-full px-4 py-3 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors flex items-center justify-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Favicon
              </button>
            </div>
          </div>

          {/* Important Notes */}
          <div className="p-6 rounded-xl bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.3)]">
            <h4 className="text-[#3B82F6] text-sm font-semibold mb-3">Important Notes:</h4>
            <ul className="text-[#3B82F6] text-sm space-y-1.5 list-disc list-inside">
              <li>Logos are stored in the VPS</li>
              <li>Supported formats: .JPG, .PNG, .WebP, .ICO</li>
              <li>Maximum file size: 5MB</li>
              <li>Changes will reflect across the entire website</li>
              <li>Use transparent backgrounds for better integration</li>
            </ul>
          </div>

          <div className="flex items-center justify-end mt-6">
            <button
              onClick={() => handleSave("Logos")}
              disabled={isLoading}
              className="px-6 py-3 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {/* Site Status Tab */}
      {activeTab === "status" && (
        <div className="max-w-5xl">
          <div className="p-8 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl mb-6">
            <h2 className="text-white text-2xl font-semibold mb-2">Site Status Management</h2>
          </div>

          <div className="space-y-6">
            {/* Current Status */}
            <div className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white text-base font-semibold mb-2">Current Status</h3>
                  <p className="text-[#64748B] text-sm">
                    Your website is currently active and accessible to all users.
                  </p>
                </div>
                <span className="px-4 py-2 rounded-full bg-[#22C55E]/20 text-[#22C55E] text-sm font-medium">
                  Active
                </span>
              </div>
            </div>

            {/* Toggle Site Status */}
            <div className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl">
              <h3 className="text-white text-base font-semibold mb-4">Toggle Site Status</h3>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-white text-sm font-medium mb-1">Put site under maintenance</p>
                  <p className="text-[#EF4444] text-sm">This will make your site inaccessible to users</p>
                </div>
                <button
                  onClick={() => setSiteStatus({ ...siteStatus, isActive: !siteStatus.isActive })}
                  className={`relative w-14 h-7 rounded-full transition-colors flex-shrink-0 ml-4 ${
                    !siteStatus.isActive ? "bg-[#EF4444]" : "bg-[rgba(255,255,255,0.18)]"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                      !siteStatus.isActive ? "translate-x-7" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Maintenance Message */}
            <div className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl">
              <h3 className="text-white text-base font-semibold mb-4">Maintenance Message</h3>
              <label className="text-white text-sm font-medium mb-2 block">
                Message to display during maintenance
              </label>
              <textarea
                value={siteStatus.maintenanceMessage}
                onChange={(e) => setSiteStatus({ ...siteStatus, maintenanceMessage: e.target.value })}
                rows={3}
                className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] resize-none"
              />

              <button
                onClick={() => handleSave("Site status")}
                disabled={isLoading}
                className="mt-4 px-6 py-3 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Updating..." : "Update Message"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Edit Tab */}
      {activeTab === "page" && (
        <div className="max-w-5xl">
          <div className="p-8 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl mb-6">
            <h2 className="text-white text-2xl font-semibold mb-2">Page Edit</h2>
            <p className="text-[#94A3B8] text-sm">
              Manage single-page front-end page: banner content, meta (SEO), and page-specific content.
            </p>
          </div>

          <div className="p-8 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl mb-6">
            <h3 className="text-white text-base font-semibold mb-4">Editing: Name</h3>
            <div className="flex flex-wrap gap-2">
              {pageButtons.map((page) => (
                <button
                  key={page.id}
                  onClick={() => setActivePage(page.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activePage === page.id
                      ? "bg-[#3B82F6] text-white"
                      : "bg-[rgba(255,255,255,0.08)] text-white hover:bg-[rgba(255,255,255,0.12)]"
                  }`}
                >
                  {page.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-8 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl mb-6">
            <h3 className="text-white text-lg font-semibold mb-6">Banner</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Heading Text 1 (Normal)</label>
                <input
                  type="text"
                  value={pageContent.headingPart1}
                  onChange={(e) => setPageContent({ ...pageContent, headingPart1: e.target.value })}
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                />
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">
                  Heading Part 2 <span className="text-[#F59E0B]">(Highlighted)</span>
                </label>
                <input
                  type="text"
                  value={pageContent.headingPart2}
                  onChange={(e) => setPageContent({ ...pageContent, headingPart2: e.target.value })}
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="text-white text-sm font-medium mb-2 block">Description</label>
              <textarea
                value={pageContent.description}
                onChange={(e) => setPageContent({ ...pageContent, description: e.target.value })}
                rows={4}
                className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] resize-none"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Input Placeholder</label>
                <input
                  type="text"
                  value={pageContent.inputPlaceholder}
                  onChange={(e) => setPageContent({ ...pageContent, inputPlaceholder: e.target.value })}
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                />
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">Button Text</label>
                <input
                  type="text"
                  value={pageContent.buttonText}
                  onChange={(e) => setPageContent({ ...pageContent, buttonText: e.target.value })}
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                />
              </div>
            </div>
          </div>

          <div className="p-8 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl mb-6">
            <h3 className="text-white text-lg font-semibold mb-6">Meta (SEO)</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Page Title</label>
                <input
                  type="text"
                  value={pageContent.pageTitle}
                  onChange={(e) => setPageContent({ ...pageContent, pageTitle: e.target.value })}
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                />
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">Meta Description</label>
                <input
                  type="text"
                  value={pageContent.metaDescription}
                  onChange={(e) => setPageContent({ ...pageContent, metaDescription: e.target.value })}
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="text-white text-sm font-medium mb-2 block">Keywords</label>
              <input
                type="text"
                value={pageContent.keywords}
                onChange={(e) => setPageContent({ ...pageContent, keywords: e.target.value })}
                className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Open Graph Title</label>
                <input
                  type="text"
                  value={pageContent.ogTitle}
                  onChange={(e) => setPageContent({ ...pageContent, ogTitle: e.target.value })}
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                />
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">Open Graph Description</label>
                <input
                  type="text"
                  value={pageContent.ogDescription}
                  onChange={(e) => setPageContent({ ...pageContent, ogDescription: e.target.value })}
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-start gap-4">
            <button
              onClick={handleRefresh}
              className="px-6 py-3 rounded-lg bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white hover:bg-[rgba(255,255,255,0.12)] transition-colors text-sm font-medium"
            >
              Refresh
            </button>
            <button
              onClick={() => handleSave("Page content")}
              disabled={isLoading}
              className="px-6 py-3 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}

      {/* Language Management Tab */}
      {activeTab === "language" && (
        <div className="max-w-5xl">
          <div className="p-8 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl mb-6">
            <h2 className="text-white text-2xl font-semibold mb-2">Language Management</h2>
            <p className="text-[#94A3B8] text-sm">
              Manage available languages for your website. Users will only see active languages in the language
              selector.
            </p>
          </div>

          <div className="p-8 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl mb-6">
            <h3 className="text-white text-lg font-semibold mb-6">Active Languages ({languages.length})</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {languages.map((lang) => (
                <div
                  key={lang.code}
                  className="p-5 rounded-xl bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[rgba(59,130,246,0.2)] flex items-center justify-center flex-shrink-0 text-white text-lg font-bold">
                      {lang.code}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white text-base font-semibold mb-1">{lang.name}</h4>
                      <p className="text-[#64748B] text-sm mb-3">{lang.langCode}</p>

                      <div className="flex items-center gap-2 mb-3">
                        <input
                          type="radio"
                          checked={lang.isDefault}
                          onChange={() => handleSetDefault(lang.code)}
                          className="w-4 h-4 text-[#3B82F6] focus:ring-[#3B82F6]"
                        />
                        <label className="text-white text-sm">Default</label>
                      </div>

                      <button
                        onClick={() => handleDeactivateLanguage(lang.code)}
                        disabled={lang.isDefault}
                        className="text-[#EF4444] hover:text-[#DC2626] text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Deactivate
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              onClick={() => handleSave("Language settings")}
              disabled={isLoading}
              className="px-6 py-3 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {/* Addons Management Tab */}
      {activeTab === "addons" && (
        <div className="max-w-5xl">
          <div className="p-8 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl mb-6">
            <h2 className="text-white text-2xl font-semibold mb-2">Addons Management</h2>
            <p className="text-[#94A3B8] text-sm">
              Enable or disable various third-party services and integrations for your website. Configure API keys for
              enabled services.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Google reCAPTCHA */}
            <div className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/20 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-[#3B82F6]" />
                  </div>
                  <div>
                    <h3 className="text-white text-base font-semibold mb-1">Google reCAPTCHA</h3>
                    <p className="text-[#64748B] text-sm">Protect login and registration forms from bots</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleAddon("recaptcha")}
                  className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
                    addons.recaptcha.enabled ? "bg-[#3B82F6]" : "bg-[rgba(255,255,255,0.18)]"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      addons.recaptcha.enabled ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {addons.recaptcha.enabled && (
                <div className="space-y-3 pt-4 border-t border-[rgba(255,255,255,0.1)]">
                  <div>
                    <label className="text-white text-xs font-medium mb-2 block">Site Key</label>
                    <input
                      type="text"
                      value={addons.recaptcha.siteKey}
                      onChange={(e) =>
                        setAddons({
                          ...addons,
                          recaptcha: { ...addons.recaptcha, siteKey: e.target.value },
                        })
                      }
                      className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                    />
                  </div>
                  <div>
                    <label className="text-white text-xs font-medium mb-2 block">Secret Key</label>
                    <input
                      type="text"
                      value={addons.recaptcha.secretKey}
                      onChange={(e) =>
                        setAddons({
                          ...addons,
                          recaptcha: {
                            ...addons.recaptcha,
                            secretKey: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Trust Pilot */}
            <div className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#22C55E]/20 flex items-center justify-center flex-shrink-0">
                    <Star className="w-5 h-5 text-[#22C55E]" />
                  </div>
                  <div>
                    <h3 className="text-white text-base font-semibold mb-1">Trust Pilot</h3>
                    <p className="text-[#64748B] text-sm">Display customer reviews and ratings</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleAddon("trustpilot")}
                  className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
                    addons.trustpilot.enabled ? "bg-[#3B82F6]" : "bg-[rgba(255,255,255,0.18)]"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      addons.trustpilot.enabled ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Google Analytics */}
            <div className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/20 flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-5 h-5 text-[#F59E0B]" />
                  </div>
                  <div>
                    <h3 className="text-white text-base font-semibold mb-1">Google Analytics</h3>
                    <p className="text-[#64748B] text-sm">Track website traffic and user behavior</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleAddon("googleAnalytics")}
                  className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
                    addons.googleAnalytics.enabled ? "bg-[#3B82F6]" : "bg-[rgba(255,255,255,0.18)]"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      addons.googleAnalytics.enabled ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {addons.googleAnalytics.enabled && (
                <div className="pt-4 border-t border-[rgba(255,255,255,0.1)]">
                  <label className="text-white text-xs font-medium mb-2 block">Measurement ID</label>
                  <input
                    type="text"
                    value={addons.googleAnalytics.measurementId}
                    onChange={(e) =>
                      setAddons({
                        ...addons,
                        googleAnalytics: {
                          ...addons.googleAnalytics,
                          measurementId: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  />
                </div>
              )}
            </div>

            {/* Microsoft Clarity */}
            <div className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#8B5CF6]/20 flex items-center justify-center flex-shrink-0">
                    <Eye className="w-5 h-5 text-[#8B5CF6]" />
                  </div>
                  <div>
                    <h3 className="text-white text-base font-semibold mb-1">Microsoft Clarity</h3>
                    <p className="text-[#64748B] text-sm">Heatmaps and user session recordings</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleAddon("microsoftClarity")}
                  className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
                    addons.microsoftClarity.enabled ? "bg-[#3B82F6]" : "bg-[rgba(255,255,255,0.18)]"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      addons.microsoftClarity.enabled ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Cloudflare */}
            <div className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/20 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5 text-[#F59E0B]" />
                  </div>
                  <div>
                    <h3 className="text-white text-base font-semibold mb-1">Cloudflare</h3>
                    <p className="text-[#64748B] text-sm">CDN, security, and performance optimization</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleAddon("cloudflare")}
                  className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
                    addons.cloudflare.enabled ? "bg-[#3B82F6]" : "bg-[rgba(255,255,255,0.18)]"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      addons.cloudflare.enabled ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* GetButton.io */}
            <div className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#EC4899]/20 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-[#EC4899]" />
                  </div>
                  <div>
                    <h3 className="text-white text-base font-semibold mb-1">GetButton.io</h3>
                    <p className="text-[#64748B] text-sm">Live chat and customer support widget</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleAddon("getbutton")}
                  className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
                    addons.getbutton.enabled ? "bg-[#3B82F6]" : "bg-[rgba(255,255,255,0.18)]"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      addons.getbutton.enabled ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Tawk.to */}
            <div className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#06B6D4]/20 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-[#06B6D4]" />
                  </div>
                  <div>
                    <h3 className="text-white text-base font-semibold mb-1">Tawk.to</h3>
                    <p className="text-[#64748B] text-sm">Free live chat for customer support</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleAddon("tawkto")}
                  className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
                    addons.tawkto.enabled ? "bg-[#3B82F6]" : "bg-[rgba(255,255,255,0.18)]"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      addons.tawkto.enabled ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-start gap-4">
            <button
              onClick={handleRefresh}
              className="px-6 py-3 rounded-lg bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white hover:bg-[rgba(255,255,255,0.12)] transition-colors text-sm font-medium"
            >
              Refresh
            </button>
            <button
              onClick={() => handleSave("Addons")}
              disabled={isLoading}
              className="px-6 py-3 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Updating..." : "Update Addons"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
