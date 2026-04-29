'use client';

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  Loader2,
  Mail,
} from "lucide-react";
import {
  getGroupedSettings,
  bulkUpdateSettings,
  getMaintenanceSettings,
  updateSetting,
  type GroupedSettings,
} from "@/lib/api/settingsApi";
import { apiClient } from "@/config/api-client.config";
import { API_ENDPOINTS } from "@/config/server.config";
import { useBranding } from "@/contexts/BrandingContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Info, Save, RotateCcw, EyeOff, ChevronDown, Copy, Code } from "lucide-react";
import {
  getAllLanguages,
  toggleLanguage,
  updateLanguage,
  type Language,
} from "@/lib/api/languagesApi";
import {
  getAllEmailTemplates,
  updateEmailTemplate,
  resetEmailTemplate,
  previewEmailTemplate,
  sendTestEmail,
  groupTemplatesByCategory,
  type EmailTemplate,
  type PreviewEmailTemplateResponse,
} from "@/lib/api/emailTemplatesApi";

type TabType = "social" | "contact" | "page" | "email" | "addons" | "trial" | "logo" | "status" | "language";

const validTabs: TabType[] = ["social", "contact", "page", "email", "addons", "trial", "logo", "status", "language"];

export default function AdminSettingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refresh: refreshBranding } = useBranding();
  
  // Get initial tab from URL or default to "social"
  const tabFromUrl = searchParams.get('tab') as TabType | null;
  const initialTab: TabType = tabFromUrl && validTabs.includes(tabFromUrl) ? tabFromUrl : "social";
  
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [activePage, setActivePage] = useState("home");

  // Update URL when tab changes (without full page reload)
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    const newUrl = `/admin/settings?tab=${tab}`;
    window.history.replaceState({}, '', newUrl);
  };

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

  // Languages State (now API-driven)
  const [languages, setLanguages] = useState<Language[]>([]);
  const [isLanguagesLoading, setIsLanguagesLoading] = useState(false);

  // Branding State
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);

  // Maintenance confirmation dialog state
  const [showMaintenanceConfirm, setShowMaintenanceConfirm] = useState(false);

  // Email Templates State
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEmailTemplatesLoading, setIsEmailTemplatesLoading] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [editedSubject, setEditedSubject] = useState('');
  const [editedBody, setEditedBody] = useState('');
  const [isTemplateActive, setIsTemplateActive] = useState(true);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const [templatePreviewData, setTemplatePreviewData] = useState<PreviewEmailTemplateResponse | null>(null);
  const [showTestEmailDialog, setShowTestEmailDialog] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [showResetTemplateConfirm, setShowResetTemplateConfirm] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    Authentication: true,
    User: true,
    Payments: true,
    Orders: true,
    Membership: true,
    Referrals: true,
    Support: true,
  });

  // Fetch settings from API
  const fetchSettings = useCallback(async () => {
    try {
      setIsPageLoading(true);
      const grouped = await getGroupedSettings();
      
      // Parse social media settings
      const socialSettings = grouped['social'] || [];
      const socialMap: Record<string, string> = {};
      socialSettings.forEach((s) => {
        socialMap[s.key] = s.value;
      });
      
      if (Object.keys(socialMap).length > 0) {
        setSocialMedia({
          twitter: { 
            url: socialMap['social_twitter_url'] || '', 
            visible: socialMap['social_twitter_visible'] !== 'false' 
          },
          facebook: { 
            url: socialMap['social_facebook_url'] || '', 
            visible: socialMap['social_facebook_visible'] === 'true' 
          },
          instagram: { 
            url: socialMap['social_instagram_url'] || '', 
            visible: socialMap['social_instagram_visible'] !== 'false' 
          },
          linkedin: { 
            url: socialMap['social_linkedin_url'] || '', 
            visible: socialMap['social_linkedin_visible'] !== 'false' 
          },
          youtube: { 
            url: socialMap['social_youtube_url'] || '', 
            visible: socialMap['social_youtube_visible'] === 'true' 
          },
          tiktok: { 
            url: socialMap['social_tiktok_url'] || '', 
            visible: socialMap['social_tiktok_visible'] === 'true' 
          },
          telegram: { 
            url: socialMap['social_telegram_url'] || '', 
            visible: socialMap['social_telegram_visible'] === 'true' 
          },
        });
      }

      // Parse contact settings
      const contactSettings = grouped['contact'] || [];
      const contactMap: Record<string, string> = {};
      contactSettings.forEach((s) => {
        contactMap[s.key] = s.value;
      });
      
      if (Object.keys(contactMap).length > 0) {
        setContactInfo({
          phone: contactMap['contact_phone'] || contactInfo.phone,
          email: contactMap['contact_email'] || contactInfo.email,
          businessHours: contactMap['contact_business_hours'] || contactInfo.businessHours,
          helpMessage: contactMap['contact_help_message'] || contactInfo.helpMessage,
          buttonText: contactMap['contact_button_text'] || contactInfo.buttonText,
          successMessage: contactMap['contact_success_message'] || contactInfo.successMessage,
        });
      }

      // Parse maintenance settings
      const maintenanceSettings = grouped['maintenance'] || [];
      const maintenanceMap: Record<string, string> = {};
      maintenanceSettings.forEach((s) => {
        maintenanceMap[s.key] = s.value;
      });
      
      if (Object.keys(maintenanceMap).length > 0) {
        setSiteStatus({
          isActive: maintenanceMap['maintenance_enabled'] !== 'true',
          maintenanceMessage: maintenanceMap['maintenance_message'] || siteStatus.maintenanceMessage,
        });
      }

      // Parse addons settings
      const addonsSettings = grouped['addons'] || [];
      const addonsMap: Record<string, string> = {};
      addonsSettings.forEach((s) => {
        addonsMap[s.key] = s.value;
      });
      
      if (Object.keys(addonsMap).length > 0) {
        setAddons({
          recaptcha: {
            enabled: addonsMap['addon_recaptcha_enabled'] === 'true',
            siteKey: addonsMap['addon_recaptcha_site_key'] || addons.recaptcha.siteKey,
            secretKey: addonsMap['addon_recaptcha_secret_key'] || addons.recaptcha.secretKey,
          },
          trustpilot: { enabled: addonsMap['addon_trustpilot_enabled'] === 'true' },
          googleAnalytics: {
            enabled: addonsMap['addon_ga_enabled'] === 'true',
            measurementId: addonsMap['addon_ga_measurement_id'] || addons.googleAnalytics.measurementId,
          },
          microsoftClarity: { enabled: addonsMap['addon_clarity_enabled'] === 'true' },
          cloudflare: { enabled: addonsMap['addon_cloudflare_enabled'] === 'true' },
          getbutton: { enabled: addonsMap['addon_getbutton_enabled'] === 'true' },
          tawkto: { enabled: addonsMap['addon_tawkto_enabled'] === 'true' },
        });
      }

      // Parse content settings (page content, email content, free trial)
      const contentSettings = grouped['content'] || [];
      const generalSettings = grouped['general'] || [];
      const contentMap: Record<string, string> = {};
      
      // Combine content and general categories for backward compatibility
      contentSettings.forEach((s) => {
        contentMap[s.key] = s.value;
      });
      generalSettings.forEach((s) => {
        if ((s.key.startsWith('page_') || s.key.startsWith('email_') || s.key.startsWith('trial_')) && !contentMap[s.key]) {
          contentMap[s.key] = s.value;
        }
      });

      // Email content
      if (contentMap['email_setup_guide']) {
        setEmailContent(contentMap['email_setup_guide']);
      }

      // Free trial content
      if (contentMap['trial_main_title'] || contentMap['trial_description']) {
        setFreeTrial({
          mainTitle: contentMap['trial_main_title'] || freeTrial.mainTitle,
          description: contentMap['trial_description'] || freeTrial.description,
          sectionTitle: contentMap['trial_section_title'] || freeTrial.sectionTitle,
          items: contentMap['trial_items'] ? JSON.parse(contentMap['trial_items']) : freeTrial.items,
        });
      }

      // Page content for home page (default)
      if (contentMap['page_home_heading1'] || contentMap['page_home_description']) {
        setPageContent({
          headingPart1: contentMap['page_home_heading1'] || pageContent.headingPart1,
          headingPart2: contentMap['page_home_heading2'] || pageContent.headingPart2,
          description: contentMap['page_home_description'] || pageContent.description,
          inputPlaceholder: contentMap['page_home_input_placeholder'] || pageContent.inputPlaceholder,
          buttonText: contentMap['page_home_button_text'] || pageContent.buttonText,
          pageTitle: contentMap['page_home_meta_title'] || pageContent.pageTitle,
          metaDescription: contentMap['page_home_meta_description'] || pageContent.metaDescription,
          keywords: contentMap['page_home_keywords'] || pageContent.keywords,
          ogTitle: contentMap['page_home_og_title'] || pageContent.ogTitle,
          ogDescription: contentMap['page_home_og_description'] || pageContent.ogDescription,
        });
      }

      // Languages are now loaded from a dedicated endpoint via fetchLanguages()

    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsPageLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Load page-specific content when switching pages in Page Edit tab
  const loadPageContent = useCallback(async (pageName: string) => {
    try {
      const grouped = await getGroupedSettings();
      const contentSettings = grouped['content'] || [];
      const generalSettings = grouped['general'] || [];
      const contentMap: Record<string, string> = {};
      
      contentSettings.forEach((s) => {
        contentMap[s.key] = s.value;
      });
      generalSettings.forEach((s) => {
        if (s.key.startsWith(`page_${pageName}_`) && !contentMap[s.key]) {
          contentMap[s.key] = s.value;
        }
      });

      // Set page content if any exists
      setPageContent({
        headingPart1: contentMap[`page_${pageName}_heading1`] || '',
        headingPart2: contentMap[`page_${pageName}_heading2`] || '',
        description: contentMap[`page_${pageName}_description`] || '',
        inputPlaceholder: contentMap[`page_${pageName}_input_placeholder`] || 'Email Address',
        buttonText: contentMap[`page_${pageName}_button_text`] || 'Get Started',
        pageTitle: contentMap[`page_${pageName}_meta_title`] || '',
        metaDescription: contentMap[`page_${pageName}_meta_description`] || '',
        keywords: contentMap[`page_${pageName}_keywords`] || '',
        ogTitle: contentMap[`page_${pageName}_og_title`] || '',
        ogDescription: contentMap[`page_${pageName}_og_description`] || '',
      });
    } catch (error) {
      console.error('Failed to load page content:', error);
    }
  }, []);

  // Load page content when activePage changes
  useEffect(() => {
    if (activeTab === 'page') {
      loadPageContent(activePage);
    }
  }, [activePage, activeTab, loadPageContent]);

  const handleSave = async (type: string) => {
    setIsLoading(true);
    try {
      let settings: { key: string; value: string }[] = [];

      switch (type) {
        case "Social media links":
          settings = [
            { key: 'social_twitter_url', value: socialMedia.twitter.url },
            { key: 'social_twitter_visible', value: String(socialMedia.twitter.visible) },
            { key: 'social_facebook_url', value: socialMedia.facebook.url },
            { key: 'social_facebook_visible', value: String(socialMedia.facebook.visible) },
            { key: 'social_instagram_url', value: socialMedia.instagram.url },
            { key: 'social_instagram_visible', value: String(socialMedia.instagram.visible) },
            { key: 'social_linkedin_url', value: socialMedia.linkedin.url },
            { key: 'social_linkedin_visible', value: String(socialMedia.linkedin.visible) },
            { key: 'social_youtube_url', value: socialMedia.youtube.url },
            { key: 'social_youtube_visible', value: String(socialMedia.youtube.visible) },
            { key: 'social_tiktok_url', value: socialMedia.tiktok.url },
            { key: 'social_tiktok_visible', value: String(socialMedia.tiktok.visible) },
            { key: 'social_telegram_url', value: socialMedia.telegram.url },
            { key: 'social_telegram_visible', value: String(socialMedia.telegram.visible) },
          ];
          break;
        case "Contact information":
          settings = [
            { key: 'contact_phone', value: contactInfo.phone },
            { key: 'contact_email', value: contactInfo.email },
            { key: 'contact_business_hours', value: contactInfo.businessHours },
            { key: 'contact_help_message', value: contactInfo.helpMessage },
            { key: 'contact_button_text', value: contactInfo.buttonText },
            { key: 'contact_success_message', value: contactInfo.successMessage },
          ];
          break;
        case "Addons":
          settings = [
            { key: 'addon_recaptcha_enabled', value: String(addons.recaptcha.enabled) },
            { key: 'addon_recaptcha_site_key', value: addons.recaptcha.siteKey },
            { key: 'addon_recaptcha_secret_key', value: addons.recaptcha.secretKey },
            { key: 'addon_trustpilot_enabled', value: String(addons.trustpilot.enabled) },
            { key: 'addon_ga_enabled', value: String(addons.googleAnalytics.enabled) },
            { key: 'addon_ga_measurement_id', value: addons.googleAnalytics.measurementId },
            { key: 'addon_clarity_enabled', value: String(addons.microsoftClarity.enabled) },
            { key: 'addon_cloudflare_enabled', value: String(addons.cloudflare.enabled) },
            { key: 'addon_getbutton_enabled', value: String(addons.getbutton.enabled) },
            { key: 'addon_tawkto_enabled', value: String(addons.tawkto.enabled) },
          ];
          break;
        case "Email content":
          settings = [
            { key: 'email_setup_guide', value: emailContent },
          ];
          break;
        case "Free trial content":
          settings = [
            { key: 'trial_main_title', value: freeTrial.mainTitle },
            { key: 'trial_description', value: freeTrial.description },
            { key: 'trial_section_title', value: freeTrial.sectionTitle },
            { key: 'trial_items', value: JSON.stringify(freeTrial.items) },
          ];
          break;
        case "Page content":
          settings = [
            { key: `page_${activePage}_heading1`, value: pageContent.headingPart1 },
            { key: `page_${activePage}_heading2`, value: pageContent.headingPart2 },
            { key: `page_${activePage}_description`, value: pageContent.description },
            { key: `page_${activePage}_input_placeholder`, value: pageContent.inputPlaceholder },
            { key: `page_${activePage}_button_text`, value: pageContent.buttonText },
            { key: `page_${activePage}_meta_title`, value: pageContent.pageTitle },
            { key: `page_${activePage}_meta_description`, value: pageContent.metaDescription },
            { key: `page_${activePage}_keywords`, value: pageContent.keywords },
            { key: `page_${activePage}_og_title`, value: pageContent.ogTitle },
            { key: `page_${activePage}_og_description`, value: pageContent.ogDescription },
          ];
          break;
        default:
          break;
      }

      if (settings.length > 0) {
        await bulkUpdateSettings({ settings });
        // Re-fetch settings to confirm save and update UI
        await fetchSettings();
      }
      
      toast.success(`${type} updated successfully!`);
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error(`Failed to save ${type.toLowerCase()}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    toast.info("Refreshing settings...");
    await fetchSettings();
    toast.success("Settings refreshed!");
  };

  const fetchLanguages = useCallback(async () => {
    try {
      setIsLanguagesLoading(true);
      const list = await getAllLanguages();
      setLanguages(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to fetch languages:', err);
      toast.error('Failed to load languages');
    } finally {
      setIsLanguagesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'language') {
      fetchLanguages();
    }
  }, [activeTab, fetchLanguages]);

  // Email Templates Functions
  const fetchEmailTemplates = useCallback(async () => {
    try {
      setIsEmailTemplatesLoading(true);
      const response = await getAllEmailTemplates();
      setEmailTemplates(response.templates);

      // Select first template if none selected
      if (!selectedTemplate && response.templates.length > 0) {
        const firstTemplate = response.templates[0];
        setSelectedTemplate(firstTemplate);
        setEditedSubject(firstTemplate.subject);
        setEditedBody(firstTemplate.bodyHtml);
        setIsTemplateActive(firstTemplate.isActive);
      }
    } catch (error) {
      console.error('Failed to fetch email templates:', error);
      toast.error('Failed to load email templates');
    } finally {
      setIsEmailTemplatesLoading(false);
    }
  }, [selectedTemplate]);

  useEffect(() => {
    if (activeTab === 'email') {
      fetchEmailTemplates();
    }
  }, [activeTab, fetchEmailTemplates]);

  const handleSelectTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setEditedSubject(template.subject);
    setEditedBody(template.bodyHtml);
    setIsTemplateActive(template.isActive);
    setShowTemplatePreview(false);
    setTemplatePreviewData(null);
  };

  const handleSaveTemplate = async () => {
    if (!selectedTemplate) return;

    setIsSavingTemplate(true);
    try {
      const updated = await updateEmailTemplate(selectedTemplate.id, {
        subject: editedSubject,
        bodyHtml: editedBody,
        isActive: isTemplateActive,
      });

      setEmailTemplates((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
      setSelectedTemplate(updated);

      toast.success('Template saved successfully');
    } catch (error) {
      console.error('Failed to save template:', error);
      toast.error('Failed to save template');
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const handlePreviewTemplate = async () => {
    if (!selectedTemplate) return;

    setIsPreviewLoading(true);
    try {
      await updateEmailTemplate(selectedTemplate.id, {
        subject: editedSubject,
        bodyHtml: editedBody,
      });

      const preview = await previewEmailTemplate(selectedTemplate.id);
      setTemplatePreviewData(preview);
      setShowTemplatePreview(true);
    } catch (error) {
      console.error('Failed to generate preview:', error);
      toast.error('Failed to generate preview');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleResetTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      const reset = await resetEmailTemplate(selectedTemplate.id);

      setEmailTemplates((prev) =>
        prev.map((t) => (t.id === reset.id ? reset : t))
      );
      setSelectedTemplate(reset);
      setEditedSubject(reset.subject);
      setEditedBody(reset.bodyHtml);
      setIsTemplateActive(reset.isActive);

      toast.success('Template reset to default');
      setShowResetTemplateConfirm(false);
    } catch (error) {
      console.error('Failed to reset template:', error);
      toast.error('Failed to reset template');
    }
  };

  const handleSendTestTemplateEmail = async () => {
    if (!selectedTemplate || !testEmailAddress) return;

    setIsSendingTestEmail(true);
    try {
      await updateEmailTemplate(selectedTemplate.id, {
        subject: editedSubject,
        bodyHtml: editedBody,
      });

      const result = await sendTestEmail(selectedTemplate.id, { testEmail: testEmailAddress });

      if (result.success) {
        toast.success(`Test email sent to ${testEmailAddress}`);
        setShowTestEmailDialog(false);
        setTestEmailAddress('');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Failed to send test email:', error);
      toast.error('Failed to send test email');
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  const insertTemplateVariable = (variable: string) => {
    const textarea = document.getElementById('email-template-body-editor') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue =
        editedBody.substring(0, start) +
        `{{${variable}}}` +
        editedBody.substring(end);
      setEditedBody(newValue);

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + variable.length + 4,
          start + variable.length + 4
        );
      }, 0);
    } else {
      setEditedBody(editedBody + `{{${variable}}}`);
    }
  };

  const copyTemplateVariable = (variable: string) => {
    navigator.clipboard.writeText(`{{${variable}}}`);
    toast.success(`Copied {{${variable}}} to clipboard`);
  };

  const toggleTemplateCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const groupedEmailTemplates = groupTemplatesByCategory(emailTemplates);

  const hasTemplateChanges =
    selectedTemplate &&
    (editedSubject !== selectedTemplate.subject ||
      editedBody !== selectedTemplate.bodyHtml ||
      isTemplateActive !== selectedTemplate.isActive);

  const handleToggleLanguage = async (id: string, nextIsActive: boolean) => {
    // Guard: cannot deactivate the default language
    const target = languages.find((l) => l.id === id);
    if (target?.isDefault && !nextIsActive) {
      toast.error('The default language must stay active. Change the default first.');
      return;
    }
    // Guard: cannot deactivate the last active language
    if (!nextIsActive && languages.filter((l) => l.isActive).length <= 1) {
      toast.error('At least one language must be active');
      return;
    }
    // Optimistic update
    setLanguages((prev) =>
      prev.map((l) => (l.id === id ? { ...l, isActive: nextIsActive } : l)),
    );
    try {
      await toggleLanguage(id, nextIsActive);
      toast.success(
        nextIsActive ? 'Language activated' : 'Language deactivated',
      );
    } catch {
      // Revert on failure
      setLanguages((prev) =>
        prev.map((l) => (l.id === id ? { ...l, isActive: !nextIsActive } : l)),
      );
      toast.error('Failed to update language');
    }
  };

  const handleSetDefaultLanguage = async (id: string) => {
    const target = languages.find((l) => l.id === id);
    if (!target) return;
    if (!target.isActive) {
      toast.error('Default language must be active');
      return;
    }
    // Optimistic update: mark chosen as default, unset others
    const prev = languages;
    setLanguages((list) =>
      list.map((l) => ({ ...l, isDefault: l.id === id })),
    );
    try {
      await updateLanguage(id, { isDefault: true });
      toast.success('Default language updated');
    } catch {
      setLanguages(prev);
      toast.error('Failed to set default language');
    }
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

  const fetchSiteStatus = useCallback(async () => {
    try {
      const data = await getMaintenanceSettings();
      setSiteStatus({
        isActive: !data.maintenanceMode,
        maintenanceMessage: data.maintenanceMessage || '',
      });
    } catch {
      // ignore silently
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'status') {
      fetchSiteStatus();
    }
  }, [activeTab, fetchSiteStatus]);

  const handleToggleMaintenance = () => {
    // Turning ON maintenance requires confirmation; turning OFF is immediate.
    if (siteStatus.isActive) {
      setShowMaintenanceConfirm(true);
    } else {
      void applyMaintenanceToggle(false);
    }
  };

  const applyMaintenanceToggle = async (newMaintenanceMode: boolean) => {
    // Optimistic UI update
    setSiteStatus((prev) => ({ ...prev, isActive: !newMaintenanceMode }));
    setIsLoading(true);
    try {
      await updateSetting('maintenance_mode', { value: newMaintenanceMode ? 'true' : 'false' });
      toast.success(
        newMaintenanceMode
          ? 'Site is now under maintenance'
          : 'Site is now active',
      );
    } catch {
      // Revert on failure
      setSiteStatus((prev) => ({ ...prev, isActive: !prev.isActive }));
      toast.error('Failed to update site status');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmEnableMaintenance = async () => {
    setShowMaintenanceConfirm(false);
    await applyMaintenanceToggle(true);
  };

  const handleUpdateMaintenanceMessage = async () => {
    setIsLoading(true);
    try {
      await updateSetting('maintenance_message', { value: siteStatus.maintenanceMessage });
      toast.success('Maintenance message updated');
    } catch {
      toast.error('Failed to update maintenance message');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBranding = useCallback(async () => {
    try {
      const response = await apiClient.get<{ siteLogo: string; siteFavicon: string }>(
        API_ENDPOINTS.ADMIN.SETTINGS.BRANDING
      );
      setLogoUrl(response.data.siteLogo || null);
      setFaviconUrl(response.data.siteFavicon || null);
    } catch {
      // branding may not be set yet, silently ignore
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'logo') {
      fetchBranding();
    }
  }, [activeTab, fetchBranding]);

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/x-icon', 'image/vnd.microsoft.icon'];
  const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

  const validateImageFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Invalid format. Allowed: JPG, PNG, WebP, ICO';
    }
    if (file.size > MAX_SIZE_BYTES) {
      return `File too large. Maximum size is 5MB (current: ${(file.size / 1024 / 1024).toFixed(1)}MB)`;
    }
    return null;
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      toast.error(validationError);
      e.target.value = '';
      return;
    }

    // Show preview immediately from local file
    const localPreview = URL.createObjectURL(file);
    setLogoUrl(localPreview);
    setIsUploadingLogo(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const response = await apiClient.post<Record<string, unknown>>(
        API_ENDPOINTS.ADMIN.SETTINGS.BRANDING_LOGO,
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      // Replace local blob with the real server URL if present
      const data = response.data as Record<string, unknown>;
      const serverUrl =
        (data.siteLogo as string) ||
        (data.logoUrl as string) ||
        (data.url as string) ||
        ((data.data as Record<string, unknown>)?.siteLogo as string) ||
        ((data.data as Record<string, unknown>)?.url as string);
      if (serverUrl) {
        URL.revokeObjectURL(localPreview);
        setLogoUrl(serverUrl);
      }
      // Update global branding context so sidebars/headers refresh live
      refreshBranding();
      toast.success('Logo uploaded successfully!');
    } catch {
      URL.revokeObjectURL(localPreview);
      setLogoUrl(null);
      toast.error('Failed to upload logo');
    } finally {
      setIsUploadingLogo(false);
      e.target.value = '';
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      toast.error(validationError);
      e.target.value = '';
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setFaviconUrl(localPreview);
    setIsUploadingFavicon(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const response = await apiClient.post<Record<string, unknown>>(
        API_ENDPOINTS.ADMIN.SETTINGS.BRANDING_FAVICON,
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      const data = response.data as Record<string, unknown>;
      const serverUrl =
        (data.siteFavicon as string) ||
        (data.faviconUrl as string) ||
        (data.url as string) ||
        ((data.data as Record<string, unknown>)?.siteFavicon as string) ||
        ((data.data as Record<string, unknown>)?.url as string);
      if (serverUrl) {
        URL.revokeObjectURL(localPreview);
        setFaviconUrl(serverUrl);
      }
      // Update global branding context so the favicon link in <head> refreshes live
      refreshBranding();
      toast.success('Favicon uploaded successfully!');
    } catch {
      URL.revokeObjectURL(localPreview);
      setFaviconUrl(null);
      toast.error('Failed to upload favicon');
    } finally {
      setIsUploadingFavicon(false);
      e.target.value = '';
    }
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

  if (isPageLoading) {
    return (
      <div className="p-4 lg:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-[#3B82F6] animate-spin" />
            <p className="text-[#94A3B8] text-sm">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

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
            onClick={() => handleTabChange(tab.id as TabType)}
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
        <div className="w-full">
          <div className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl mb-6">
            <h2 className="text-white text-2xl font-semibold mb-2">Email Content Management</h2>
            <p className="text-[#94A3B8] text-sm">
              Customize all outgoing email templates with dynamic variables for personalized content
            </p>
          </div>

          {isEmailTemplatesLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-[#3B82F6] animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Sidebar - Template List */}
              <div className="lg:col-span-3">
                <div className="p-4 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl sticky top-4">
                  <h3 className="text-white text-sm font-semibold mb-4">Email Templates</h3>

                  <div className="space-y-2 max-h-[calc(100vh-350px)] overflow-y-auto pr-2">
                    {Object.entries(groupedEmailTemplates).map(([category, categoryTemplates]) => (
                      <div key={category} className="mb-3">
                        <button
                          onClick={() => toggleTemplateCategory(category)}
                          className="flex items-center justify-between w-full px-2 py-1.5 text-[#94A3B8] text-xs font-medium uppercase tracking-wide hover:text-white transition-colors"
                        >
                          <span>{category}</span>
                          <ChevronDown
                            className={`w-4 h-4 transition-transform ${
                              expandedCategories[category] ? 'rotate-180' : ''
                            }`}
                          />
                        </button>

                        {expandedCategories[category] && (
                          <div className="mt-1 space-y-1">
                            {categoryTemplates.map((template) => (
                              <button
                                key={template.id}
                                onClick={() => handleSelectTemplate(template)}
                                className={`w-full px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                                  selectedTemplate?.id === template.id
                                    ? 'bg-[#3B82F6] text-white'
                                    : 'text-white hover:bg-[rgba(255,255,255,0.08)]'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="truncate">{template.name}</span>
                                  {!template.isActive && (
                                    <span className="ml-2 px-1.5 py-0.5 bg-[#EF4444]/20 text-[#EF4444] text-[10px] rounded">
                                      OFF
                                    </span>
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Content - Editor */}
              <div className="lg:col-span-6">
                {selectedTemplate ? (
                  <div className="space-y-6">
                    {/* Template Info */}
                    <div className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h2 className="text-white text-lg font-semibold">{selectedTemplate.name}</h2>
                          <p className="text-[#94A3B8] text-sm mt-1">{selectedTemplate.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[#64748B] text-xs">Active</span>
                          <button
                            onClick={() => setIsTemplateActive(!isTemplateActive)}
                            className={`relative w-10 h-5 rounded-full transition-colors ${
                              isTemplateActive ? 'bg-[#22C55E]' : 'bg-[rgba(255,255,255,0.18)]'
                            }`}
                          >
                            <div
                              className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                                isTemplateActive ? 'translate-x-5' : 'translate-x-0.5'
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-[#64748B]">
                        <Code className="w-3.5 h-3.5" />
                        <span>Type: {selectedTemplate.type}</span>
                      </div>
                    </div>

                    {/* Subject Editor */}
                    <div className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl">
                      <label className="text-white text-sm font-medium mb-3 block">
                        Email Subject
                      </label>
                      <input
                        type="text"
                        value={editedSubject}
                        onChange={(e) => setEditedSubject(e.target.value)}
                        placeholder="Enter email subject..."
                        className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] placeholder:text-[#64748B]"
                      />
                      <p className="text-[#64748B] text-xs mt-2">
                        Use {'{{variableName}}'} syntax for dynamic content
                      </p>
                    </div>

                    {/* Body Editor */}
                    <div className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl">
                      <label className="text-white text-sm font-medium mb-3 block">
                        Email Body (HTML)
                      </label>
                      <textarea
                        id="email-template-body-editor"
                        value={editedBody}
                        onChange={(e) => setEditedBody(e.target.value)}
                        rows={18}
                        className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] font-mono resize-none"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setShowResetTemplateConfirm(true)}
                          className="px-4 py-2.5 rounded-lg bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white hover:bg-[rgba(255,255,255,0.12)] transition-colors text-sm font-medium flex items-center gap-2"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Reset to Default
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={handlePreviewTemplate}
                          disabled={isPreviewLoading}
                          className="px-4 py-2.5 rounded-lg bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white hover:bg-[rgba(255,255,255,0.12)] transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                        >
                          {isPreviewLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : showTemplatePreview ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                          {showTemplatePreview ? 'Hide Preview' : 'Preview'}
                        </button>

                        <button
                          onClick={() => setShowTestEmailDialog(true)}
                          className="px-4 py-2.5 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white transition-colors text-sm font-medium flex items-center gap-2"
                        >
                          <Send className="w-4 h-4" />
                          Send Test
                        </button>

                        <button
                          onClick={handleSaveTemplate}
                          disabled={isSavingTemplate || !hasTemplateChanges}
                          className="px-4 py-2.5 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSavingTemplate ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          Save Changes
                        </button>
                      </div>
                    </div>

                    {/* Preview Panel */}
                    {showTemplatePreview && templatePreviewData && (
                      <div className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-white text-sm font-semibold">Email Preview</h3>
                          <button
                            onClick={() => setShowTemplatePreview(false)}
                            className="text-[#64748B] hover:text-white transition-colors"
                          >
                            <EyeOff className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="mb-4">
                          <p className="text-[#64748B] text-xs mb-1">Subject:</p>
                          <p className="text-white text-sm bg-[rgba(0,0,0,0.3)] rounded-lg px-3 py-2">
                            {templatePreviewData.subject}
                          </p>
                        </div>

                        <div>
                          <p className="text-[#64748B] text-xs mb-1">Body:</p>
                          <div className="bg-white rounded-lg overflow-hidden">
                            <iframe
                              srcDoc={templatePreviewData.bodyHtml}
                              title="Email Preview"
                              className="w-full h-[400px] border-0"
                              sandbox="allow-same-origin"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl text-center">
                    <Mail className="w-12 h-12 text-[#64748B] mx-auto mb-4" />
                    <p className="text-[#94A3B8] text-sm">Select a template to edit</p>
                  </div>
                )}
              </div>

              {/* Right Sidebar - Variables */}
              <div className="lg:col-span-3">
                {selectedTemplate && (
                  <div className="p-4 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl sticky top-4">
                    <h3 className="text-white text-sm font-semibold mb-4">Available Variables</h3>
                    <p className="text-[#64748B] text-xs mb-4">
                      Click to insert or copy these variables into your template
                    </p>

                    <div className="space-y-2">
                      {selectedTemplate.variables.map((variable) => (
                        <div
                          key={variable}
                          className="flex items-center justify-between p-2 rounded-lg bg-[rgba(0,0,0,0.3)] group"
                        >
                          <button
                            onClick={() => insertTemplateVariable(variable)}
                            className="flex-1 text-left text-[#3B82F6] text-xs font-mono hover:text-[#60A5FA] transition-colors"
                          >
                            {'{{'}{variable}{'}}'}
                          </button>
                          <button
                            onClick={() => copyTemplateVariable(variable)}
                            className="p-1 text-[#64748B] hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                            title="Copy to clipboard"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {selectedTemplate.sampleData && (
                      <div className="mt-6 pt-4 border-t border-[rgba(255,255,255,0.1)]">
                        <h4 className="text-white text-xs font-semibold mb-3">Sample Values</h4>
                        <div className="space-y-1.5 text-xs">
                          {Object.entries(selectedTemplate.sampleData).map(([key, value]) => (
                            <div key={key} className="flex items-start gap-2">
                              <span className="text-[#64748B] min-w-0 truncate">{key}:</span>
                              <span className="text-[#94A3B8] break-all">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reset Template Confirmation Dialog */}
          <AlertDialog open={showResetTemplateConfirm} onOpenChange={setShowResetTemplateConfirm}>
            <AlertDialogContent className="bg-[#0F172A] border-[rgba(255,255,255,0.1)] text-white">
              <AlertDialogHeader>
                <div className="w-12 h-12 rounded-full bg-[#F59E0B]/20 flex items-center justify-center mb-2">
                  <AlertTriangle className="w-6 h-6 text-[#F59E0B]" />
                </div>
                <AlertDialogTitle className="text-white text-xl">
                  Reset to default?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-[#94A3B8] text-sm leading-relaxed">
                  This will replace your customized template with the original default
                  version. All your changes will be lost.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-transparent border-[rgba(255,255,255,0.18)] text-white hover:bg-[rgba(255,255,255,0.08)] hover:text-white">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleResetTemplate}
                  className="bg-[#F59E0B] hover:bg-[#D97706] text-white"
                >
                  Reset Template
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Send Test Email Dialog */}
          <AlertDialog open={showTestEmailDialog} onOpenChange={setShowTestEmailDialog}>
            <AlertDialogContent className="bg-[#0F172A] border-[rgba(255,255,255,0.1)] text-white">
              <AlertDialogHeader>
                <div className="w-12 h-12 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center mb-2">
                  <Send className="w-6 h-6 text-[#8B5CF6]" />
                </div>
                <AlertDialogTitle className="text-white text-xl">
                  Send Test Email
                </AlertDialogTitle>
                <AlertDialogDescription className="text-[#94A3B8] text-sm leading-relaxed">
                  Enter an email address to send a test version of this template with
                  sample data.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="my-4">
                <input
                  type="email"
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                  placeholder="Enter email address..."
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] placeholder:text-[#64748B]"
                />
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel className="bg-transparent border-[rgba(255,255,255,0.18)] text-white hover:bg-[rgba(255,255,255,0.08)] hover:text-white">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleSendTestTemplateEmail}
                  disabled={!testEmailAddress || isSendingTestEmail}
                  className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white disabled:opacity-50"
                >
                  {isSendingTestEmail ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    'Send Test'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
            <p className="text-[#94A3B8] text-sm">Upload your site logo and favicon. Changes take effect immediately.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Main Logo */}
            <div className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl">
              <h3 className="text-white text-base font-semibold mb-2">Main Logo</h3>
              <p className="text-[#64748B] text-sm mb-4">
                Used in the navbar and header (Recommended: 100x103px)
              </p>

              <div className="relative w-full h-48 rounded-lg bg-white flex items-center justify-center mb-4 border-2 border-dashed border-[rgba(255,255,255,0.2)] overflow-hidden">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoUrl}
                    alt="Main Logo"
                    className="max-h-full max-w-full object-contain p-4"
                  />
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                      <span className="text-6xl">👑</span>
                    </div>
                    <p className="text-[#3B82F6] font-semibold text-sm">No logo uploaded</p>
                  </div>
                )}
                {logoUrl && (
                  <button
                    onClick={() => setLogoUrl(null)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-[#EF4444] hover:bg-[#DC2626] flex items-center justify-center text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <input
                type="file"
                id="logo-upload"
                accept=".jpg,.jpeg,.png,.webp,.ico"
                className="hidden"
                onChange={handleLogoUpload}
              />
              <label
                htmlFor="logo-upload"
                className={`w-full px-4 py-3 rounded-lg text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                  isUploadingLogo
                    ? 'bg-[#3B82F6]/60 cursor-not-allowed'
                    : 'bg-[#3B82F6] hover:bg-[#2563EB]'
                }`}
              >
                {isUploadingLogo ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                ) : (
                  <><Upload className="w-4 h-4" /> Upload Main Logo</>
                )}
              </label>
            </div>

            {/* Favicon */}
            <div className="p-6 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl">
              <h3 className="text-white text-base font-semibold mb-2">Favicon</h3>
              <p className="text-[#64748B] text-sm mb-4">
                Browser tab icon (Recommended: 32x32px, ico or png)
              </p>

              <div className="relative w-full h-48 rounded-lg bg-white flex items-center justify-center mb-4 border-2 border-dashed border-[rgba(255,255,255,0.2)] overflow-hidden">
                {faviconUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={faviconUrl}
                    alt="Favicon"
                    className="max-h-full max-w-full object-contain p-4"
                  />
                ) : (
                  <div className="text-center">
                    <div className="text-6xl mb-2">👑</div>
                    <p className="text-[#3B82F6] font-semibold text-sm">No favicon uploaded</p>
                  </div>
                )}
                {faviconUrl && (
                  <button
                    onClick={() => setFaviconUrl(null)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-[#EF4444] hover:bg-[#DC2626] flex items-center justify-center text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <input
                type="file"
                id="favicon-upload"
                accept=".jpg,.jpeg,.png,.webp,.ico"
                className="hidden"
                onChange={handleFaviconUpload}
              />
              <label
                htmlFor="favicon-upload"
                className={`w-full px-4 py-3 rounded-lg text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                  isUploadingFavicon
                    ? 'bg-[#3B82F6]/60 cursor-not-allowed'
                    : 'bg-[#3B82F6] hover:bg-[#2563EB]'
                }`}
              >
                {isUploadingFavicon ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                ) : (
                  <><Upload className="w-4 h-4" /> Upload Favicon</>
                )}
              </label>
            </div>
          </div>

          {/* Important Notes */}
          <div className="p-6 rounded-xl bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.3)]">
            <h4 className="text-[#3B82F6] text-sm font-semibold mb-3">Important Notes:</h4>
            <ul className="text-[#3B82F6] text-sm space-y-1.5 list-disc list-inside">
              <li>Logos are stored in Cloudflare R2 under the branding/ folder</li>
              <li>Supported formats: .JPG, .PNG, .WebP, .ICO</li>
              <li>Maximum file size: 5MB</li>
              <li>Changes will reflect across the entire website immediately</li>
              <li>Use transparent backgrounds for better integration</li>
            </ul>
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
                    {siteStatus.isActive 
                      ? "Your website is currently active and accessible to all users."
                      : "Your website is under maintenance and not accessible to users."}
                  </p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                  siteStatus.isActive 
                    ? "bg-[#22C55E]/20 text-[#22C55E]" 
                    : "bg-[#EF4444]/20 text-[#EF4444]"
                }`}>
                  {siteStatus.isActive ? "Active" : "Maintenance"}
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
                  onClick={handleToggleMaintenance}
                  disabled={isLoading}
                  className={`relative w-14 h-7 rounded-full transition-colors flex-shrink-0 ml-4 disabled:opacity-50 disabled:cursor-not-allowed ${
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
                onClick={handleUpdateMaintenanceMessage}
                disabled={isLoading}
                className="mt-4 px-6 py-3 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Updating..." : "Update Message"}
              </button>
            </div>
          </div>

          {/* Confirmation dialog before enabling maintenance */}
          <AlertDialog open={showMaintenanceConfirm} onOpenChange={setShowMaintenanceConfirm}>
            <AlertDialogContent className="bg-[#0F172A] border-[rgba(255,255,255,0.1)] text-white">
              <AlertDialogHeader>
                <div className="w-12 h-12 rounded-full bg-[#EF4444]/20 flex items-center justify-center mb-2">
                  <AlertTriangle className="w-6 h-6 text-[#EF4444]" />
                </div>
                <AlertDialogTitle className="text-white text-xl">
                  Enable maintenance mode?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-[#94A3B8] text-sm leading-relaxed">
                  This will make your site inaccessible to all users. Only admins will be
                  able to sign in and reach the admin panel. You can turn it off again any
                  time from this screen.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-transparent border-[rgba(255,255,255,0.18)] text-white hover:bg-[rgba(255,255,255,0.08)] hover:text-white">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmEnableMaintenance}
                  className="bg-[#EF4444] hover:bg-[#DC2626] text-white"
                >
                  Enable Maintenance
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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

          {isLanguagesLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin" />
            </div>
          ) : (
            <>
              {/* Active Languages */}
              <div className="p-8 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl mb-6">
                <h3 className="text-white text-lg font-semibold mb-6">
                  Active Languages ({languages.filter((l) => l.isActive).length})
                </h3>

                {languages.filter((l) => l.isActive).length === 0 ? (
                  <p className="text-[#64748B] text-sm">No active languages yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {languages
                      .filter((l) => l.isActive)
                      .map((lang) => (
                        <div
                          key={lang.id}
                          className="p-4 rounded-xl bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)]"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[rgba(59,130,246,0.15)] flex items-center justify-center flex-shrink-0 text-white text-sm font-bold">
                              {lang.code}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white text-sm font-semibold truncate">
                                {lang.name}
                              </h4>
                              <p className="text-[#64748B] text-xs">{lang.langCode}</p>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => handleSetDefaultLanguage(lang.id)}
                                className="flex items-center gap-1.5 text-white text-xs"
                                title="Set as default"
                              >
                                <span
                                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    lang.isDefault
                                      ? 'border-[#3B82F6] bg-[#3B82F6]'
                                      : 'border-[rgba(255,255,255,0.3)]'
                                  }`}
                                >
                                  {lang.isDefault && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                  )}
                                </span>
                                Default
                              </button>
                              <button
                                onClick={() => handleToggleLanguage(lang.id, false)}
                                disabled={lang.isDefault}
                                className="text-[#EF4444] hover:text-[#DC2626] text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                Deactivate
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Inactive Languages */}
              <div className="p-8 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl mb-6">
                <h3 className="text-white text-lg font-semibold mb-6">
                  Inactive Languages ({languages.filter((l) => !l.isActive).length})
                </h3>

                {languages.filter((l) => !l.isActive).length === 0 ? (
                  <p className="text-[#64748B] text-sm">No inactive languages.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {languages
                      .filter((l) => !l.isActive)
                      .map((lang) => (
                        <div
                          key={lang.id}
                          className="p-4 rounded-xl bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)] opacity-75"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[rgba(148,163,184,0.15)] flex items-center justify-center flex-shrink-0 text-[#94A3B8] text-sm font-bold">
                              {lang.code}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white text-sm font-semibold truncate">
                                {lang.name}
                              </h4>
                              <p className="text-[#64748B] text-xs">{lang.langCode}</p>
                            </div>
                            <button
                              onClick={() => handleToggleLanguage(lang.id, true)}
                              className="text-[#22C55E] hover:text-[#16A34A] text-xs font-medium transition-colors"
                            >
                              Activate
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Important Notes */}
              <div className="p-6 rounded-xl bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.3)]">
                <h4 className="text-[#3B82F6] text-sm font-semibold mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Important Notes
                </h4>
                <ul className="text-[#3B82F6] text-sm space-y-1.5 list-disc list-inside">
                  <li>At least one language must be active</li>
                  <li>The default language must be active</li>
                  <li>Changes will be reflected immediately on the website</li>
                  <li>Users will only see active languages in the language selector</li>
                </ul>
              </div>
            </>
          )}
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
