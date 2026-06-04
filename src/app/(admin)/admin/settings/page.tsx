'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
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
} from 'lucide-react';
import {
  getGroupedSettings,
  bulkUpdateSettings,
  getMaintenanceSettings,
  updateSetting,
  type GroupedSettings,
} from '@/lib/api/settingsApi';
import { apiClient } from '@/config/api-client.config';
import { API_ENDPOINTS } from '@/config/server.config';
import { useBranding } from '@/contexts/BrandingContext';
import { PageEditor } from '@/components/admin/page-editor';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  AlertTriangle,
  Info,
  Save,
  RotateCcw,
  EyeOff,
  ChevronDown,
  Copy,
  Code,
} from 'lucide-react';
import {
  getAllLanguages,
  toggleLanguage,
  type Language,
} from '@/lib/api/languagesApi';
import {
  getAllEmailTemplates,
  updateEmailTemplate,
  resetEmailTemplate,
  previewEmailTemplate,
  sendTestEmail,
  groupTemplatesByCategory,
  type EmailTemplate,
  type PreviewEmailTemplateResponse,
} from '@/lib/api/emailTemplatesApi';

type TabType =
  | 'social'
  | 'contact'
  | 'page'
  | 'email'
  | 'addons'
  | 'rate-limits'
  | 'logo'
  | 'status'
  | 'language';

const validTabs: TabType[] = [
  'social',
  'contact',
  'page',
  'email',
  'addons',
  'rate-limits',
  'logo',
  'status',
  'language',
];

export default function AdminSettingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refresh: refreshBranding } = useBranding();

  // Get initial tab from URL or default to "social"
  const tabFromUrl = searchParams.get('tab') as TabType | null;
  const initialTab: TabType =
    tabFromUrl && validTabs.includes(tabFromUrl) ? tabFromUrl : 'social';

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [activePage, setActivePage] = useState('home');

  // Update URL when tab changes (without full page reload)
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    const newUrl = `/admin/settings?tab=${tab}`;
    window.history.replaceState({}, '', newUrl);
  };

  // Social Media State
  const [socialMedia, setSocialMedia] = useState({
    twitter: { url: 'https://x.com/VipStoreHQ', visible: true },
    facebook: { url: '', visible: false },
    instagram: { url: 'https://www.instagram.com/vipstorehq', visible: true },
    linkedin: {
      url: 'https://www.linkedin.com/in/alen-omer-18663519',
      visible: true,
    },
    youtube: { url: '', visible: false },
    tiktok: {
      url: 'https://www.cheapstreamtv.com/dashboard/orders',
      visible: false,
    },
    telegram: { url: '', visible: false },
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
www.cheapstreamtv.com`,
  );

  // Contact Information State
  const [contactInfo, setContactInfo] = useState({
    phone: '+447727751217',
    email: 'help@cheapstreamtv.com',
    businessHours: "We're available 24/7 full-time, every day of the week.",
    helpMessage:
      'If you have any questions about your order, please describe it and include your Order ID in the message (example: zxxxx-xxxx-xxx).',
    buttonText: 'Submit Request',
    successMessage:
      'Thank you for choosing Cheap Streamwhere great entertainment meets unbeatable value. We look forward to assisting you!',
  });

  // Site Status State
  const [siteStatus, setSiteStatus] = useState({
    isActive: true,
    maintenanceMessage:
      "We're currently performing maintenance. Please check back later.",
  });

  // Page Edit State
  const [pageContent, setPageContent] = useState({
    headingPart1: 'Best IPTV Subscription Service 2026',
    headingPart2: 'CheapStreamTV',
    description:
      'Enjoy seamless access to 22,000+ live channels and 180,000+ movies & series with CheapStreamTV. Secure IPTV subscription service with 24/7 fast, caring I.A support, and flexible refund policy compatibility. No buffering. No contracts.',
    inputPlaceholder: 'Email Address',
    buttonText: 'Get Started',
    pageTitle: 'Cheap Stream TV Premium Access to Global Digital Store',
    metaDescription: 'Experience smooth, high-speed digital access for global',
    keywords: 'best IPTV service, streaming, movies, TV shows, live channels',
    ogTitle: 'Cheap Stream - Premium IPTV Service Provider test',
    ogDescription:
      'best Stream thousands of movies, TV shows, and live channels',
  });

  // Addons State
  const [addons, setAddons] = useState({
    recaptcha: {
      enabled: true,
      siteKey: '6Lc4c7BJAAAAJCRKEkgnKJhyjtPvER__TxsMSp0H',
      secretKey: '6Lc4c7BJAAAAkkLJ7BQTh_NqverPynuSznTivEnO3',
    },
    trustpilot: { enabled: false, businessUrl: '', businessUnitId: '' },
    googleAnalytics: {
      enabled: true,
      measurementId: 'G-Y7TVVML9P',
    },
    microsoftClarity: { enabled: false, projectId: '' },
    cloudflare: { enabled: false, token: '' },
    getbutton: { enabled: false, code: '' },
    tawkto: { enabled: false, propertyId: '', widgetId: 'default' },
  });

  // API Rate Limits per tier (req/min)
  const [rateLimits, setRateLimits] = useState({
    basic: '10',
    pro: '100',
    vip: '1000',
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
  const [selectedTemplate, setSelectedTemplate] =
    useState<EmailTemplate | null>(null);
  const [isEmailTemplatesLoading, setIsEmailTemplatesLoading] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [editedSubject, setEditedSubject] = useState('');
  const [editedBody, setEditedBody] = useState('');
  const [isTemplateActive, setIsTemplateActive] = useState(true);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const [templatePreviewData, setTemplatePreviewData] =
    useState<PreviewEmailTemplateResponse | null>(null);
  const [showTestEmailDialog, setShowTestEmailDialog] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [showResetTemplateConfirm, setShowResetTemplateConfirm] =
    useState(false);
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({
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
            visible: socialMap['social_twitter_visible'] !== 'false',
          },
          facebook: {
            url: socialMap['social_facebook_url'] || '',
            visible: socialMap['social_facebook_visible'] === 'true',
          },
          instagram: {
            url: socialMap['social_instagram_url'] || '',
            visible: socialMap['social_instagram_visible'] !== 'false',
          },
          linkedin: {
            url: socialMap['social_linkedin_url'] || '',
            visible: socialMap['social_linkedin_visible'] !== 'false',
          },
          youtube: {
            url: socialMap['social_youtube_url'] || '',
            visible: socialMap['social_youtube_visible'] === 'true',
          },
          tiktok: {
            url: socialMap['social_tiktok_url'] || '',
            visible: socialMap['social_tiktok_visible'] === 'true',
          },
          telegram: {
            url: socialMap['social_telegram_url'] || '',
            visible: socialMap['social_telegram_visible'] === 'true',
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
          businessHours:
            contactMap['contact_business_hours'] || contactInfo.businessHours,
          helpMessage:
            contactMap['contact_help_message'] || contactInfo.helpMessage,
          buttonText:
            contactMap['contact_button_text'] || contactInfo.buttonText,
          successMessage:
            contactMap['contact_success_message'] || contactInfo.successMessage,
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
          maintenanceMessage:
            maintenanceMap['maintenance_message'] ||
            siteStatus.maintenanceMessage,
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
            siteKey:
              addonsMap['addon_recaptcha_site_key'] || addons.recaptcha.siteKey,
            secretKey:
              addonsMap['addon_recaptcha_secret_key'] ||
              addons.recaptcha.secretKey,
          },
          trustpilot: {
            enabled: addonsMap['addon_trustpilot_enabled'] === 'true',
            businessUrl:
              addonsMap['addon_trustpilot_business_url'] ||
              addons.trustpilot.businessUrl,
            businessUnitId:
              addonsMap['addon_trustpilot_business_unit_id'] ||
              addons.trustpilot.businessUnitId,
          },
          googleAnalytics: {
            enabled: addonsMap['addon_ga_enabled'] === 'true',
            measurementId:
              addonsMap['addon_ga_measurement_id'] ||
              addons.googleAnalytics.measurementId,
          },
          microsoftClarity: {
            enabled: addonsMap['addon_clarity_enabled'] === 'true',
            projectId:
              addonsMap['addon_clarity_project_id'] ||
              addons.microsoftClarity.projectId,
          },
          cloudflare: {
            enabled: addonsMap['addon_cloudflare_enabled'] === 'true',
            token:
              addonsMap['addon_cloudflare_token'] || addons.cloudflare.token,
          },
          getbutton: {
            enabled: addonsMap['addon_getbutton_enabled'] === 'true',
            code: addonsMap['addon_getbutton_code'] || addons.getbutton.code,
          },
          tawkto: {
            enabled: addonsMap['addon_tawkto_enabled'] === 'true',
            propertyId:
              addonsMap['addon_tawkto_property_id'] || addons.tawkto.propertyId,
            widgetId:
              addonsMap['addon_tawkto_widget_id'] || addons.tawkto.widgetId,
          },
        });
      }

      // Parse API rate limits (api category, falls back to defaults)
      const apiSettings = grouped['api'] || [];
      const apiMap: Record<string, string> = {};
      apiSettings.forEach((s) => {
        apiMap[s.key] = s.value;
      });
      setRateLimits({
        basic: apiMap['api_rate_limit_basic'] || '10',
        pro: apiMap['api_rate_limit_pro'] || '100',
        vip: apiMap['api_rate_limit_vip'] || '1000',
      });

      // Parse content settings (page content, email content)
      const contentSettings = grouped['content'] || [];
      const generalSettings = grouped['general'] || [];
      const contentMap: Record<string, string> = {};

      // Combine content and general categories for backward compatibility
      contentSettings.forEach((s) => {
        contentMap[s.key] = s.value;
      });
      generalSettings.forEach((s) => {
        if (
          (s.key.startsWith('page_') || s.key.startsWith('email_')) &&
          !contentMap[s.key]
        ) {
          contentMap[s.key] = s.value;
        }
      });

      // Email content
      if (contentMap['email_setup_guide']) {
        setEmailContent(contentMap['email_setup_guide']);
      }

      // Page content for home page (default)
      if (
        contentMap['page_home_heading1'] ||
        contentMap['page_home_description']
      ) {
        setPageContent({
          headingPart1:
            contentMap['page_home_heading1'] || pageContent.headingPart1,
          headingPart2:
            contentMap['page_home_heading2'] || pageContent.headingPart2,
          description:
            contentMap['page_home_description'] || pageContent.description,
          inputPlaceholder:
            contentMap['page_home_input_placeholder'] ||
            pageContent.inputPlaceholder,
          buttonText:
            contentMap['page_home_button_text'] || pageContent.buttonText,
          pageTitle:
            contentMap['page_home_meta_title'] || pageContent.pageTitle,
          metaDescription:
            contentMap['page_home_meta_description'] ||
            pageContent.metaDescription,
          keywords: contentMap['page_home_keywords'] || pageContent.keywords,
          ogTitle: contentMap['page_home_og_title'] || pageContent.ogTitle,
          ogDescription:
            contentMap['page_home_og_description'] || pageContent.ogDescription,
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
        inputPlaceholder:
          contentMap[`page_${pageName}_input_placeholder`] || 'Email Address',
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
        case 'Social media links':
          settings = [
            { key: 'social_twitter_url', value: socialMedia.twitter.url },
            {
              key: 'social_twitter_visible',
              value: String(socialMedia.twitter.visible),
            },
            { key: 'social_facebook_url', value: socialMedia.facebook.url },
            {
              key: 'social_facebook_visible',
              value: String(socialMedia.facebook.visible),
            },
            { key: 'social_instagram_url', value: socialMedia.instagram.url },
            {
              key: 'social_instagram_visible',
              value: String(socialMedia.instagram.visible),
            },
            { key: 'social_linkedin_url', value: socialMedia.linkedin.url },
            {
              key: 'social_linkedin_visible',
              value: String(socialMedia.linkedin.visible),
            },
            { key: 'social_youtube_url', value: socialMedia.youtube.url },
            {
              key: 'social_youtube_visible',
              value: String(socialMedia.youtube.visible),
            },
            { key: 'social_tiktok_url', value: socialMedia.tiktok.url },
            {
              key: 'social_tiktok_visible',
              value: String(socialMedia.tiktok.visible),
            },
            { key: 'social_telegram_url', value: socialMedia.telegram.url },
            {
              key: 'social_telegram_visible',
              value: String(socialMedia.telegram.visible),
            },
          ];
          break;
        case 'Contact information':
          settings = [
            { key: 'contact_phone', value: contactInfo.phone },
            { key: 'contact_email', value: contactInfo.email },
            { key: 'contact_business_hours', value: contactInfo.businessHours },
            { key: 'contact_help_message', value: contactInfo.helpMessage },
            { key: 'contact_button_text', value: contactInfo.buttonText },
            {
              key: 'contact_success_message',
              value: contactInfo.successMessage,
            },
          ];
          break;
        case 'Addons': {
          // Block save if any addon is enabled but missing its required config
          const isEmpty = (v: string | undefined): boolean => !(v ?? '').trim();
          const missing: string[] = [];
          if (addons.recaptcha.enabled) {
            if (isEmpty(addons.recaptcha.siteKey))
              missing.push('reCAPTCHA Site Key');
            if (isEmpty(addons.recaptcha.secretKey))
              missing.push('reCAPTCHA Secret Key');
          }
          if (addons.trustpilot.enabled) {
            if (isEmpty(addons.trustpilot.businessUrl))
              missing.push('Trustpilot Business URL');
            if (isEmpty(addons.trustpilot.businessUnitId))
              missing.push('Trustpilot Business Unit ID');
          }
          if (
            addons.googleAnalytics.enabled &&
            isEmpty(addons.googleAnalytics.measurementId)
          )
            missing.push('Google Analytics Measurement ID');
          if (
            addons.microsoftClarity.enabled &&
            isEmpty(addons.microsoftClarity.projectId)
          )
            missing.push('Microsoft Clarity Project ID');
          if (addons.cloudflare.enabled && isEmpty(addons.cloudflare.token))
            missing.push('Cloudflare Web Analytics Token');
          if (addons.getbutton.enabled && isEmpty(addons.getbutton.code))
            missing.push('GetButton.io Widget Code');
          if (addons.tawkto.enabled && isEmpty(addons.tawkto.propertyId))
            missing.push('Tawk.to Property ID');

          if (missing.length > 0) {
            toast.error(
              `Fill in required field${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}`,
            );
            setIsLoading(false);
            return;
          }

          const str = (v: string | undefined): string => v ?? '';
          settings = [
            {
              key: 'addon_recaptcha_enabled',
              value: String(addons.recaptcha.enabled),
            },
            {
              key: 'addon_recaptcha_site_key',
              value: str(addons.recaptcha.siteKey),
            },
            {
              key: 'addon_recaptcha_secret_key',
              value: str(addons.recaptcha.secretKey),
            },
            {
              key: 'addon_trustpilot_enabled',
              value: String(addons.trustpilot.enabled),
            },
            {
              key: 'addon_trustpilot_business_url',
              value: str(addons.trustpilot.businessUrl),
            },
            {
              key: 'addon_trustpilot_business_unit_id',
              value: str(addons.trustpilot.businessUnitId),
            },
            {
              key: 'addon_ga_enabled',
              value: String(addons.googleAnalytics.enabled),
            },
            {
              key: 'addon_ga_measurement_id',
              value: str(addons.googleAnalytics.measurementId),
            },
            {
              key: 'addon_clarity_enabled',
              value: String(addons.microsoftClarity.enabled),
            },
            {
              key: 'addon_clarity_project_id',
              value: str(addons.microsoftClarity.projectId),
            },
            {
              key: 'addon_cloudflare_enabled',
              value: String(addons.cloudflare.enabled),
            },
            {
              key: 'addon_cloudflare_token',
              value: str(addons.cloudflare.token),
            },
            {
              key: 'addon_getbutton_enabled',
              value: String(addons.getbutton.enabled),
            },
            {
              key: 'addon_getbutton_code',
              value: str(addons.getbutton.code),
            },
            {
              key: 'addon_tawkto_enabled',
              value: String(addons.tawkto.enabled),
            },
            {
              key: 'addon_tawkto_property_id',
              value: str(addons.tawkto.propertyId),
            },
            {
              key: 'addon_tawkto_widget_id',
              value: str(addons.tawkto.widgetId),
            },
          ];
          break;
        }
        case 'Rate limits': {
          const num = (v: string): string => {
            const n = parseInt((v ?? '').trim(), 10);
            return Number.isFinite(n) && n > 0 ? String(n) : '';
          };
          const b = num(rateLimits.basic);
          const p = num(rateLimits.pro);
          const v = num(rateLimits.vip);
          if (!b || !p || !v) {
            toast.error('Each rate limit must be a positive number (req/min).');
            setIsLoading(false);
            return;
          }
          settings = [
            { key: 'api_rate_limit_basic', value: b },
            { key: 'api_rate_limit_pro', value: p },
            { key: 'api_rate_limit_vip', value: v },
          ];
          break;
        }
        case 'Email content':
          settings = [{ key: 'email_setup_guide', value: emailContent }];
          break;
        case 'Page content':
          settings = [
            {
              key: `page_${activePage}_heading1`,
              value: pageContent.headingPart1,
            },
            {
              key: `page_${activePage}_heading2`,
              value: pageContent.headingPart2,
            },
            {
              key: `page_${activePage}_description`,
              value: pageContent.description,
            },
            {
              key: `page_${activePage}_input_placeholder`,
              value: pageContent.inputPlaceholder,
            },
            {
              key: `page_${activePage}_button_text`,
              value: pageContent.buttonText,
            },
            {
              key: `page_${activePage}_meta_title`,
              value: pageContent.pageTitle,
            },
            {
              key: `page_${activePage}_meta_description`,
              value: pageContent.metaDescription,
            },
            { key: `page_${activePage}_keywords`, value: pageContent.keywords },
            { key: `page_${activePage}_og_title`, value: pageContent.ogTitle },
            {
              key: `page_${activePage}_og_description`,
              value: pageContent.ogDescription,
            },
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
    toast.info('Refreshing settings...');
    await fetchSettings();
    toast.success('Settings refreshed!');
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
      console.log('Email templates response:', response);

      if (response.templates && response.templates.length > 0) {
        setEmailTemplates(response.templates);

        // Select first template automatically
        const firstTemplate = response.templates[0];
        setSelectedTemplate(firstTemplate);
        setEditedSubject(firstTemplate.subject);
        setEditedBody(firstTemplate.bodyHtml);
        setIsTemplateActive(firstTemplate.isActive);
      } else {
        console.warn('No email templates found in response');
        setEmailTemplates([]);
      }
    } catch (error) {
      console.error('Failed to fetch email templates:', error);
      toast.error('Failed to load email templates');
    } finally {
      setIsEmailTemplatesLoading(false);
    }
  }, []);

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
        prev.map((t) => (t.id === updated.id ? updated : t)),
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
        prev.map((t) => (t.id === reset.id ? reset : t)),
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

      const result = await sendTestEmail(selectedTemplate.id, {
        testEmail: testEmailAddress,
      });

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
    const textarea = document.getElementById(
      'email-template-body-editor',
    ) as HTMLTextAreaElement;
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
          start + variable.length + 4,
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
      toast.error(
        'The default language must stay active. Change the default first.',
      );
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
    setLanguages((list) => list.map((l) => ({ ...l, isDefault: l.id === id })));
    try {
      await bulkUpdateSettings({
        settings: [{ key: 'default_language', value: target.langCode }],
      });
      toast.success('Default language updated');
    } catch {
      setLanguages(prev);
      toast.error('Failed to set default language');
    }
  };

  const toggleAddon = (addon: string) => {
    setAddons({
      ...addons,
      [addon]: {
        ...addons[addon as keyof typeof addons],
        enabled: !addons[addon as keyof typeof addons].enabled,
      },
    });
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
      await updateSetting('maintenance_mode', {
        value: newMaintenanceMode ? 'true' : 'false',
      });
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
      await updateSetting('maintenance_message', {
        value: siteStatus.maintenanceMessage,
      });
      toast.success('Maintenance message updated');
    } catch {
      toast.error('Failed to update maintenance message');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBranding = useCallback(async () => {
    try {
      const response = await apiClient.get<{
        siteLogo: string;
        siteFavicon: string;
      }>(API_ENDPOINTS.ADMIN.SETTINGS.BRANDING);
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

  const ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/x-icon',
    'image/vnd.microsoft.icon',
  ];
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
        { headers: { 'Content-Type': 'multipart/form-data' } },
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

  const handleFaviconUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
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
        { headers: { 'Content-Type': 'multipart/form-data' } },
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
    { id: 'social', label: 'Social Media' },
    { id: 'contact', label: 'Contact & Support Ticket' },
    { id: 'page', label: 'Page Edit' },
    { id: 'email', label: 'Email Content Management' },
    { id: 'addons', label: 'Addons Management' },
    { id: 'rate-limits', label: 'API Rate Limits' },
    { id: 'logo', label: 'Logo Management' },
    { id: 'status', label: 'Site Status' },
    { id: 'language', label: 'Language Management' },
  ];

  const pageButtons = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'affiliate', label: 'Affiliate' },
    { id: 'blogs', label: 'Blogs' },
    { id: 'fullmenu', label: 'Fullmenu' },
    { id: 'knowledge', label: 'Knowledge Base' },
    { id: 'packages', label: 'Packages' },
    { id: 'privacy', label: 'Privacy Policy' },
    { id: 'terms', label: 'Terms of Use' },
    { id: 'legal', label: 'Legal Disclaimer' },
    { id: 'contact', label: 'Contact' },
    { id: 'faq', label: 'FAQ' },
    { id: 'pricing', label: 'Pricing' },
  ];

  if (isPageLoading) {
    return (
      <div className="p-4 lg:p-8">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-[#3B82F6]" />
            <p className="text-sm text-[#94A3B8]">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-semibold text-white">
          System Settings
        </h1>
        <p className="text-sm text-[#94A3B8]">
          Manage your system configuration, social media, content, and
          integrations
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-8 flex items-center gap-6 overflow-x-auto border-b border-[rgba(255,255,255,0.18)] pb-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id as TabType)}
            className={`relative px-2 pb-4 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'text-[#3B82F6]'
                : 'text-[#64748B] hover:text-white'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute right-0 bottom-0 left-0 h-0.5 bg-[#3B82F6]" />
            )}
          </button>
        ))}
      </div>

      {/* Social Media Tab */}
      {activeTab === 'social' && (
        <div className="max-w-5xl">
          <div className="mb-6 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-4 backdrop-blur-xl sm:p-8">
            <h2 className="mb-2 text-2xl font-semibold text-white">
              Social Media Management
            </h2>
            <p className="text-sm text-[#94A3B8]">
              Manage your social media links that will be displayed in the
              footer.
            </p>
          </div>

          <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-4 backdrop-blur-xl sm:p-8">
            <h3 className="mb-6 text-lg font-semibold text-white">
              Social Media Links
            </h3>

            <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
              {Object.entries(socialMedia).map(([key, value]) => {
                const icons = {
                  twitter: <Twitter className="h-5 w-5 text-[#1DA1F2]" />,
                  facebook: <Facebook className="h-5 w-5 text-[#1877F2]" />,
                  instagram: <Instagram className="h-5 w-5 text-[#E4405F]" />,
                  linkedin: <Linkedin className="h-5 w-5 text-[#0A66C2]" />,
                  youtube: <Youtube className="h-5 w-5 text-[#FF0000]" />,
                  tiktok: <Music className="h-5 w-5 text-[#00F2EA]" />,
                  telegram: <Send className="h-5 w-5 text-[#26A5E4]" />,
                };

                const names = {
                  twitter: 'Twitter',
                  facebook: 'Facebook',
                  instagram: 'Instagram',
                  linkedin: 'LinkedIn',
                  youtube: 'YouTube',
                  tiktok: 'TikTok',
                  telegram: 'Telegram',
                };

                return (
                  <div key={key}>
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {icons[key as keyof typeof icons]}
                        <span className="text-sm font-medium text-white">
                          {names[key as keyof typeof names]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded px-2 py-1 text-xs font-medium ${
                            value.visible
                              ? 'bg-[#22C55E]/20 text-[#22C55E]'
                              : 'bg-[#64748B]/20 text-[#64748B]'
                          }`}
                        >
                          {value.visible ? 'Visible' : 'Hidden'}
                        </span>
                        <button
                          onClick={() =>
                            setSocialMedia({
                              ...socialMedia,
                              [key]: { ...value, visible: !value.visible },
                            })
                          }
                          className={`size-icon relative h-6 !min-h-0 w-12 shrink-0 rounded-full !p-0 transition-colors ${
                            value.visible
                              ? 'bg-[#22C55E]'
                              : 'bg-[rgba(255,255,255,0.18)]'
                          }`}
                        >
                          <div
                            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                              value.visible
                                ? 'translate-x-6'
                                : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                    <p className="mb-2 text-xs text-[#64748B]">
                      Show in footer
                    </p>
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
                      className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-base text-white placeholder:text-[#64748B] focus:ring-2 focus:ring-[#3B82F6] focus:outline-none lg:text-sm"
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-start sm:gap-4">
              <button
                onClick={handleRefresh}
                className="flex w-full items-center justify-center rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.12)] sm:w-auto sm:justify-start"
              >
                Refresh
              </button>
              <button
                onClick={() => handleSave('Social media links')}
                disabled={isLoading}
                className="flex w-full items-center justify-center rounded-lg bg-[#3B82F6] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:justify-start"
              >
                {isLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact & Support Ticket Tab */}
      {activeTab === 'contact' && (
        <div className="max-w-5xl">
          <div className="mb-6 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-4 backdrop-blur-xl sm:p-8">
            <h2 className="mb-2 text-2xl font-semibold text-white">
              Contact Information Management
            </h2>
            <p className="text-sm text-[#94A3B8]">
              Manage your contact information that will be displayed in the
              footer and contact form.
            </p>
          </div>

          <div className="space-y-6">
            {/* Contact Details */}
            <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-6 backdrop-blur-xl">
              <h3 className="mb-4 text-base font-semibold text-white">
                Contact Details
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={contactInfo.phone}
                    onChange={(e) =>
                      setContactInfo({ ...contactInfo, phone: e.target.value })
                    }
                    className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-base text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none lg:text-sm"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={contactInfo.email}
                    onChange={(e) =>
                      setContactInfo({ ...contactInfo, email: e.target.value })
                    }
                    className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-base text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none lg:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-6 backdrop-blur-xl">
              <h3 className="mb-4 text-base font-semibold text-white">
                Business Hours
              </h3>
              <label className="mb-2 block text-sm font-medium text-white">
                Business Hours
              </label>
              <input
                type="text"
                value={contactInfo.businessHours}
                onChange={(e) =>
                  setContactInfo({
                    ...contactInfo,
                    businessHours: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-base text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none lg:text-sm"
              />
              <p className="mt-2 text-xs text-[#64748B]">
                This will be displayed in the footer
              </p>
            </div>

            {/* Support Message */}
            <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-6 backdrop-blur-xl">
              <h3 className="mb-4 text-base font-semibold text-white">
                Support Message
              </h3>
              <label className="mb-2 block text-sm font-medium text-white">
                Help Message
              </label>
              <textarea
                value={contactInfo.helpMessage}
                onChange={(e) =>
                  setContactInfo({
                    ...contactInfo,
                    helpMessage: e.target.value,
                  })
                }
                rows={3}
                className="w-full resize-none rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-base text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none lg:text-sm"
              />
              <p className="mt-2 text-xs text-[#64748B]">
                This message will be shown above the contact form
              </p>
            </div>

            {/* Support Ticket Settings */}
            <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-6 backdrop-blur-xl">
              <h3 className="mb-4 text-base font-semibold text-white">
                Support Ticket Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={contactInfo.buttonText}
                    onChange={(e) =>
                      setContactInfo({
                        ...contactInfo,
                        buttonText: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-base text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none lg:text-sm"
                  />
                  <p className="mt-2 text-xs text-[#64748B]">
                    Text for the submit button on contact form
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-white">
                    Success Message
                  </label>
                  <textarea
                    value={contactInfo.successMessage}
                    onChange={(e) =>
                      setContactInfo({
                        ...contactInfo,
                        successMessage: e.target.value,
                      })
                    }
                    rows={2}
                    className="w-full resize-none rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-base text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none lg:text-sm"
                  />
                  <p className="mt-2 text-xs text-[#64748B]">
                    Message shown after successful form submission
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-start sm:gap-4">
              <button
                onClick={handleRefresh}
                className="flex w-full items-center justify-center rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.12)] sm:w-auto sm:justify-start"
              >
                Refresh
              </button>
              <button
                onClick={() => handleSave('Contact information')}
                disabled={isLoading}
                className="flex w-full items-center justify-center rounded-lg bg-[#3B82F6] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:justify-start"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Content Management Tab */}
      {activeTab === 'email' && (
        <div className="w-full">
          <div className="mb-6 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-6 backdrop-blur-xl">
            <h2 className="mb-2 text-2xl font-semibold text-white">
              Email Content Management
            </h2>
            <p className="text-sm text-[#94A3B8]">
              Customize all outgoing email templates with dynamic variables for
              personalized content
            </p>
          </div>

          {isEmailTemplatesLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-[#3B82F6]" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Left Sidebar - Template List */}
              <div className="lg:col-span-3">
                <div className="sticky top-4 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-4 backdrop-blur-xl">
                  <h3 className="mb-4 text-sm font-semibold text-white">
                    Email Templates
                  </h3>

                  <div className="max-h-[calc(100vh-350px)] space-y-2 overflow-y-auto pr-2">
                    {Object.entries(groupedEmailTemplates).map(
                      ([category, categoryTemplates]) => (
                        <div key={category} className="mb-3">
                          <button
                            onClick={() => toggleTemplateCategory(category)}
                            className="flex w-full items-center justify-between px-2 py-1.5 text-xs font-medium tracking-wide text-[#94A3B8] uppercase transition-colors hover:text-white"
                          >
                            <span>{category}</span>
                            <ChevronDown
                              className={`h-4 w-4 transition-transform ${
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
                                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                                    selectedTemplate?.id === template.id
                                      ? 'bg-[#3B82F6] text-white'
                                      : 'text-white hover:bg-[rgba(255,255,255,0.08)]'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="truncate">
                                      {template.name}
                                    </span>
                                    {!template.isActive && (
                                      <span className="ml-2 rounded bg-[#EF4444]/20 px-1.5 py-0.5 text-[10px] text-[#EF4444]">
                                        OFF
                                      </span>
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>

              {/* Main Content - Editor */}
              <div className="lg:col-span-6">
                {selectedTemplate ? (
                  <div className="space-y-6">
                    {/* Template Info */}
                    <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-6 backdrop-blur-xl">
                      <div className="mb-4 flex items-start justify-between">
                        <div>
                          <h2 className="text-lg font-semibold text-white">
                            {selectedTemplate.name}
                          </h2>
                          <p className="mt-1 text-sm text-[#94A3B8]">
                            {selectedTemplate.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#64748B]">Active</span>
                          <button
                            onClick={() =>
                              setIsTemplateActive(!isTemplateActive)
                            }
                            className={`size-icon relative h-5 !min-h-0 w-10 shrink-0 rounded-full !p-0 transition-colors ${
                              isTemplateActive
                                ? 'bg-[#22C55E]'
                                : 'bg-[rgba(255,255,255,0.18)]'
                            }`}
                          >
                            <div
                              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                                isTemplateActive
                                  ? 'translate-x-5'
                                  : 'translate-x-0.5'
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-[#64748B]">
                        <Code className="h-3.5 w-3.5" />
                        <span>Type: {selectedTemplate.type}</span>
                      </div>
                    </div>

                    {/* Subject Editor */}
                    <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-6 backdrop-blur-xl">
                      <label className="mb-3 block text-sm font-medium text-white">
                        Email Subject
                      </label>
                      <input
                        type="text"
                        value={editedSubject}
                        onChange={(e) => setEditedSubject(e.target.value)}
                        placeholder="Enter email subject..."
                        className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-base text-white placeholder:text-[#64748B] focus:ring-2 focus:ring-[#3B82F6] focus:outline-none lg:text-sm"
                      />
                      <p className="mt-2 text-xs text-[#64748B]">
                        Use {'{{variableName}}'} syntax for dynamic content
                      </p>
                    </div>

                    {/* Body Editor */}
                    <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-6 backdrop-blur-xl">
                      <label className="mb-3 block text-sm font-medium text-white">
                        Email Body (HTML)
                      </label>
                      <textarea
                        id="email-template-body-editor"
                        value={editedBody}
                        onChange={(e) => setEditedBody(e.target.value)}
                        rows={18}
                        className="w-full resize-none rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 font-mono text-base text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none lg:text-sm"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
                      <button
                        onClick={() => setShowResetTemplateConfirm(true)}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.12)] sm:w-auto"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Reset to Default
                      </button>

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                        <button
                          onClick={handlePreviewTemplate}
                          disabled={isPreviewLoading}
                          className="flex w-full items-center justify-center gap-2 rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.12)] disabled:opacity-50 sm:w-auto"
                        >
                          {isPreviewLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : showTemplatePreview ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                          {showTemplatePreview ? 'Hide Preview' : 'Preview'}
                        </button>

                        <button
                          onClick={() => setShowTestEmailDialog(true)}
                          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#8B5CF6] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#7C3AED] sm:w-auto"
                        >
                          <Send className="h-4 w-4" />
                          Send Test
                        </button>

                        <button
                          onClick={handleSaveTemplate}
                          disabled={isSavingTemplate || !hasTemplateChanges}
                          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#3B82F6] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                        >
                          {isSavingTemplate ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          Save Changes
                        </button>
                      </div>
                    </div>

                    {/* Preview Panel */}
                    {showTemplatePreview && templatePreviewData && (
                      <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-6 backdrop-blur-xl">
                        <div className="mb-4 flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-white">
                            Email Preview
                          </h3>
                          <button
                            onClick={() => setShowTemplatePreview(false)}
                            className="text-[#64748B] transition-colors hover:text-white"
                          >
                            <EyeOff className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mb-4">
                          <p className="mb-1 text-xs text-[#64748B]">
                            Subject:
                          </p>
                          <p className="rounded-lg bg-[rgba(0,0,0,0.3)] px-3 py-2 text-sm text-white">
                            {templatePreviewData.subject}
                          </p>
                        </div>

                        <div>
                          <p className="mb-1 text-xs text-[#64748B]">Body:</p>
                          <div className="overflow-hidden rounded-lg bg-white">
                            <iframe
                              srcDoc={templatePreviewData.bodyHtml}
                              title="Email Preview"
                              className="h-[400px] w-full border-0"
                              sandbox="allow-same-origin"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-8 text-center backdrop-blur-xl">
                    <Mail className="mx-auto mb-4 h-12 w-12 text-[#64748B]" />
                    <p className="text-sm text-[#94A3B8]">
                      Select a template to edit
                    </p>
                  </div>
                )}
              </div>

              {/* Right Sidebar - Variables */}
              <div className="lg:col-span-3">
                {selectedTemplate && (
                  <div className="sticky top-4 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-4 backdrop-blur-xl">
                    <h3 className="mb-4 text-sm font-semibold text-white">
                      Available Variables
                    </h3>
                    <p className="mb-4 text-xs text-[#64748B]">
                      Click to insert or copy these variables into your template
                    </p>

                    <div className="space-y-2">
                      {selectedTemplate.variables.map((variable) => (
                        <div
                          key={variable}
                          className="group flex items-center justify-between rounded-lg bg-[rgba(0,0,0,0.3)] p-2"
                        >
                          <button
                            onClick={() => insertTemplateVariable(variable)}
                            className="flex-1 text-left font-mono text-xs text-[#3B82F6] transition-colors hover:text-[#60A5FA]"
                          >
                            {'{{'}
                            {variable}
                            {'}}'}
                          </button>
                          <button
                            onClick={() => copyTemplateVariable(variable)}
                            className="p-1 text-[#64748B] opacity-0 transition-all group-hover:opacity-100 hover:text-white"
                            title="Copy to clipboard"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {selectedTemplate.sampleData && (
                      <div className="mt-6 border-t border-[rgba(255,255,255,0.1)] pt-4">
                        <h4 className="mb-3 text-xs font-semibold text-white">
                          Sample Values
                        </h4>
                        <div className="space-y-1.5 text-xs">
                          {Object.entries(selectedTemplate.sampleData).map(
                            ([key, value]) => (
                              <div key={key} className="flex items-start gap-2">
                                <span className="min-w-0 truncate text-[#64748B]">
                                  {key}:
                                </span>
                                <span className="break-all text-[#94A3B8]">
                                  {String(value)}
                                </span>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reset Template Confirmation Dialog */}
          <AlertDialog
            open={showResetTemplateConfirm}
            onOpenChange={setShowResetTemplateConfirm}
          >
            <AlertDialogContent className="border-[rgba(255,255,255,0.1)] bg-[#0F172A] text-white">
              <AlertDialogHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#F59E0B]/20">
                  <AlertTriangle className="h-6 w-6 text-[#F59E0B]" />
                </div>
                <AlertDialogTitle className="text-xl text-white">
                  Reset to default?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm leading-relaxed text-[#94A3B8]">
                  This will replace your customized template with the original
                  default version. All your changes will be lost.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-[rgba(255,255,255,0.18)] bg-transparent text-white hover:bg-[rgba(255,255,255,0.08)] hover:text-white">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleResetTemplate}
                  className="bg-[#F59E0B] text-white hover:bg-[#D97706]"
                >
                  Reset Template
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Send Test Email Dialog */}
          <AlertDialog
            open={showTestEmailDialog}
            onOpenChange={setShowTestEmailDialog}
          >
            <AlertDialogContent className="border-[rgba(255,255,255,0.1)] bg-[#0F172A] text-white">
              <AlertDialogHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#8B5CF6]/20">
                  <Send className="h-6 w-6 text-[#8B5CF6]" />
                </div>
                <AlertDialogTitle className="text-xl text-white">
                  Send Test Email
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm leading-relaxed text-[#94A3B8]">
                  Enter an email address to send a test version of this template
                  with sample data.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="my-4">
                <input
                  type="email"
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                  placeholder="Enter email address..."
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white placeholder:text-[#64748B] focus:ring-2 focus:ring-[#8B5CF6] focus:outline-none"
                />
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel className="border-[rgba(255,255,255,0.18)] bg-transparent text-white hover:bg-[rgba(255,255,255,0.08)] hover:text-white">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleSendTestTemplateEmail}
                  disabled={!testEmailAddress || isSendingTestEmail}
                  className="bg-[#8B5CF6] text-white hover:bg-[#7C3AED] disabled:opacity-50"
                >
                  {isSendingTestEmail ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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

      {/* API Rate Limits Tab */}
      {activeTab === 'rate-limits' && (
        <div className="max-w-5xl">
          <div className="mb-6 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-8 backdrop-blur-xl">
            <h2 className="mb-2 text-2xl font-semibold text-white">
              API Rate Limits
            </h2>
            <p className="text-sm text-[#94A3B8]">
              Set the per-minute request limit shown for each plan tier on the
              public /api page, the knowledge-base API guide, and the user
              dashboard. Values must be positive integers.
            </p>
          </div>

          <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-6 backdrop-blur-xl">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {(
                [
                  { id: 'basic', label: 'Basic tier' },
                  { id: 'pro', label: 'Pro tier' },
                  { id: 'vip', label: 'VIP tier' },
                ] as const
              ).map((tier) => (
                <div key={tier.id}>
                  <label className="mb-2 block text-sm font-medium text-white">
                    {tier.label}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      value={rateLimits[tier.id]}
                      onChange={(e) =>
                        setRateLimits({
                          ...rateLimits,
                          [tier.id]: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-base text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none lg:text-sm"
                    />
                    <span className="text-xs text-[#64748B]">req/min</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-start sm:gap-4">
              <button
                onClick={handleRefresh}
                className="flex w-full items-center justify-center rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.12)] sm:w-auto sm:justify-start"
              >
                Refresh
              </button>
              <button
                onClick={() => handleSave('Rate limits')}
                disabled={isLoading}
                className="flex w-full items-center justify-center rounded-lg bg-[#3B82F6] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:justify-start"
              >
                {isLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logo Management Tab */}
      {activeTab === 'logo' && (
        <div className="max-w-5xl">
          <div className="mb-6 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-4 backdrop-blur-xl sm:p-8">
            <h2 className="mb-2 text-2xl font-semibold text-white">
              Logo Management
            </h2>
            <p className="text-sm text-[#94A3B8]">
              Upload your site logo and favicon. Changes take effect
              immediately.
            </p>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Main Logo */}
            <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-6 backdrop-blur-xl">
              <h3 className="mb-2 text-base font-semibold text-white">
                Main Logo
              </h3>
              <p className="mb-4 text-sm text-[#64748B]">
                Used in the navbar and header (Recommended: 100x103px)
              </p>

              <div className="relative mb-4 flex h-48 w-full items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-[rgba(255,255,255,0.2)] bg-white">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoUrl}
                    alt="Main Logo"
                    className="max-h-full max-w-full object-contain p-4"
                  />
                ) : (
                  <div className="text-center">
                    <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center">
                      <span className="text-6xl">👑</span>
                    </div>
                    <p className="text-sm font-semibold text-[#3B82F6]">
                      No logo uploaded
                    </p>
                  </div>
                )}
                {logoUrl && (
                  <button
                    onClick={() => setLogoUrl(null)}
                    className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#EF4444] text-white transition-colors hover:bg-[#DC2626]"
                  >
                    <X className="h-4 w-4" />
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
                className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white transition-colors ${
                  isUploadingLogo
                    ? 'cursor-not-allowed bg-[#3B82F6]/60'
                    : 'bg-[#3B82F6] hover:bg-[#2563EB]'
                }`}
              >
                {isUploadingLogo ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" /> Upload Main Logo
                  </>
                )}
              </label>
            </div>

            {/* Favicon */}
            <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-6 backdrop-blur-xl">
              <h3 className="mb-2 text-base font-semibold text-white">
                Favicon
              </h3>
              <p className="mb-4 text-sm text-[#64748B]">
                Browser tab icon (Recommended: 32x32px, ico or png)
              </p>

              <div className="relative mb-4 flex h-48 w-full items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-[rgba(255,255,255,0.2)] bg-white">
                {faviconUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={faviconUrl}
                    alt="Favicon"
                    className="max-h-full max-w-full object-contain p-4"
                  />
                ) : (
                  <div className="text-center">
                    <div className="mb-2 text-6xl">👑</div>
                    <p className="text-sm font-semibold text-[#3B82F6]">
                      No favicon uploaded
                    </p>
                  </div>
                )}
                {faviconUrl && (
                  <button
                    onClick={() => setFaviconUrl(null)}
                    className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#EF4444] text-white transition-colors hover:bg-[#DC2626]"
                  >
                    <X className="h-4 w-4" />
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
                className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white transition-colors ${
                  isUploadingFavicon
                    ? 'cursor-not-allowed bg-[#3B82F6]/60'
                    : 'bg-[#3B82F6] hover:bg-[#2563EB]'
                }`}
              >
                {isUploadingFavicon ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" /> Upload Favicon
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Important Notes */}
          <div className="rounded-xl border border-[rgba(59,130,246,0.3)] bg-[rgba(59,130,246,0.1)] p-6">
            <h4 className="mb-3 text-sm font-semibold text-[#3B82F6]">
              Important Notes:
            </h4>
            <ul className="list-inside list-disc space-y-1.5 text-sm text-[#3B82F6]">
              <li>
                Logos are stored in Cloudflare R2 under the branding/ folder
              </li>
              <li>Supported formats: .JPG, .PNG, .WebP, .ICO</li>
              <li>Maximum file size: 5MB</li>
              <li>
                Changes will reflect across the entire website immediately
              </li>
              <li>Use transparent backgrounds for better integration</li>
            </ul>
          </div>
        </div>
      )}

      {/* Site Status Tab */}
      {activeTab === 'status' && (
        <div className="max-w-5xl">
          <div className="mb-6 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-4 backdrop-blur-xl sm:p-8">
            <h2 className="mb-2 text-2xl font-semibold text-white">
              Site Status Management
            </h2>
          </div>

          <div className="space-y-6">
            {/* Current Status */}
            <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="mb-2 text-base font-semibold text-white">
                    Current Status
                  </h3>
                  <p className="text-sm text-[#64748B]">
                    {siteStatus.isActive
                      ? 'Your website is currently active and accessible to all users.'
                      : 'Your website is under maintenance and not accessible to users.'}
                  </p>
                </div>
                <span
                  className={`rounded-full px-4 py-2 text-sm font-medium ${
                    siteStatus.isActive
                      ? 'bg-[#22C55E]/20 text-[#22C55E]'
                      : 'bg-[#EF4444]/20 text-[#EF4444]'
                  }`}
                >
                  {siteStatus.isActive ? 'Active' : 'Maintenance'}
                </span>
              </div>
            </div>

            {/* Toggle Site Status */}
            <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-6 backdrop-blur-xl">
              <h3 className="mb-4 text-base font-semibold text-white">
                Toggle Site Status
              </h3>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="mb-1 text-sm font-medium text-white">
                    Put site under maintenance
                  </p>
                  <p className="text-sm text-[#EF4444]">
                    This will make your site inaccessible to users
                  </p>
                </div>
                <button
                  onClick={handleToggleMaintenance}
                  disabled={isLoading}
                  className={`size-icon relative ml-4 h-7 !min-h-0 w-14 shrink-0 rounded-full !p-0 transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    !siteStatus.isActive
                      ? 'bg-[#EF4444]'
                      : 'bg-[rgba(255,255,255,0.18)]'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition-transform ${
                      !siteStatus.isActive ? 'translate-x-7' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Maintenance Message */}
            <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-6 backdrop-blur-xl">
              <h3 className="mb-4 text-base font-semibold text-white">
                Maintenance Message
              </h3>
              <label className="mb-2 block text-sm font-medium text-white">
                Message to display during maintenance
              </label>
              <textarea
                value={siteStatus.maintenanceMessage}
                onChange={(e) =>
                  setSiteStatus({
                    ...siteStatus,
                    maintenanceMessage: e.target.value,
                  })
                }
                rows={3}
                className="w-full resize-none rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-base text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none lg:text-sm"
              />

              <button
                onClick={handleUpdateMaintenanceMessage}
                disabled={isLoading}
                className="mt-4 flex w-full items-center justify-center rounded-lg bg-[#3B82F6] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:justify-start"
              >
                {isLoading ? 'Updating...' : 'Update Message'}
              </button>
            </div>
          </div>

          {/* Confirmation dialog before enabling maintenance */}
          <AlertDialog
            open={showMaintenanceConfirm}
            onOpenChange={setShowMaintenanceConfirm}
          >
            <AlertDialogContent className="border-[rgba(255,255,255,0.1)] bg-[#0F172A] text-white">
              <AlertDialogHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#EF4444]/20">
                  <AlertTriangle className="h-6 w-6 text-[#EF4444]" />
                </div>
                <AlertDialogTitle className="text-xl text-white">
                  Enable maintenance mode?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm leading-relaxed text-[#94A3B8]">
                  This will make your site inaccessible to all users. Only
                  admins will be able to sign in and reach the admin panel. You
                  can turn it off again any time from this screen.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-[rgba(255,255,255,0.18)] bg-transparent text-white hover:bg-[rgba(255,255,255,0.08)] hover:text-white">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmEnableMaintenance}
                  className="bg-[#EF4444] text-white hover:bg-[#DC2626]"
                >
                  Enable Maintenance
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {/* Page Edit Tab — config-driven editor for every public page */}
      {activeTab === 'page' && <PageEditor />}

      {/* Language Management Tab */}
      {activeTab === 'language' && (
        <div className="max-w-5xl">
          <div className="mb-6 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-4 backdrop-blur-xl sm:p-8">
            <h2 className="mb-2 text-2xl font-semibold text-white">
              Language Management
            </h2>
            <p className="text-sm text-[#94A3B8]">
              Manage available languages for your website. Users will only see
              active languages in the language selector.
            </p>
          </div>

          {isLanguagesLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
            </div>
          ) : (
            <>
              {/* Active Languages */}
              <div className="mb-6 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-4 backdrop-blur-xl sm:p-8">
                <h3 className="mb-6 text-lg font-semibold text-white">
                  Active Languages ({languages.filter((l) => l.isActive).length}
                  )
                </h3>

                {languages.filter((l) => l.isActive).length === 0 ? (
                  <p className="text-sm text-[#64748B]">
                    No active languages yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {languages
                      .filter((l) => l.isActive)
                      .map((lang) => (
                        <div
                          key={lang.id}
                          className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.3)] p-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[rgba(59,130,246,0.15)] text-sm font-bold text-white">
                              {lang.code}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="truncate text-sm font-semibold text-white">
                                {lang.name}
                              </h4>
                              <p className="text-xs text-[#64748B]">
                                {lang.langCode}
                              </p>
                            </div>
                            <div className="flex flex-shrink-0 items-center gap-3">
                              <button
                                type="button"
                                onClick={() =>
                                  handleSetDefaultLanguage(lang.id)
                                }
                                className="flex items-center gap-1.5 text-xs text-white"
                                title="Set as default"
                              >
                                <span
                                  className={`flex h-4 w-4 items-center justify-center rounded-full border-2 transition-colors ${
                                    lang.isDefault
                                      ? 'border-[#3B82F6] bg-[#3B82F6]'
                                      : 'border-[rgba(255,255,255,0.3)]'
                                  }`}
                                >
                                  {lang.isDefault && (
                                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                                  )}
                                </span>
                                Default
                              </button>
                              <button
                                onClick={() =>
                                  handleToggleLanguage(lang.id, false)
                                }
                                disabled={lang.isDefault}
                                className="text-xs font-medium text-[#EF4444] transition-colors hover:text-[#DC2626] disabled:cursor-not-allowed disabled:opacity-40"
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
              <div className="mb-6 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-4 backdrop-blur-xl sm:p-8">
                <h3 className="mb-6 text-lg font-semibold text-white">
                  Inactive Languages (
                  {languages.filter((l) => !l.isActive).length})
                </h3>

                {languages.filter((l) => !l.isActive).length === 0 ? (
                  <p className="text-sm text-[#64748B]">
                    No inactive languages.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {languages
                      .filter((l) => !l.isActive)
                      .map((lang) => (
                        <div
                          key={lang.id}
                          className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.3)] p-4 opacity-75"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[rgba(148,163,184,0.15)] text-sm font-bold text-[#94A3B8]">
                              {lang.code}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="truncate text-sm font-semibold text-white">
                                {lang.name}
                              </h4>
                              <p className="text-xs text-[#64748B]">
                                {lang.langCode}
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                handleToggleLanguage(lang.id, true)
                              }
                              className="text-xs font-medium text-[#22C55E] transition-colors hover:text-[#16A34A]"
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
              <div className="rounded-xl border border-[rgba(59,130,246,0.3)] bg-[rgba(59,130,246,0.1)] p-6">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#3B82F6]">
                  <Info className="h-4 w-4" />
                  Important Notes
                </h4>
                <ul className="list-inside list-disc space-y-1.5 text-sm text-[#3B82F6]">
                  <li>At least one language must be active</li>
                  <li>The default language must be active</li>
                  <li>Changes will be reflected immediately on the website</li>
                  <li>
                    Users will only see active languages in the language
                    selector
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>
      )}

      {/* Addons Management Tab */}
      {activeTab === 'addons' && (
        <div className="max-w-5xl">
          <div className="mb-6 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-4 backdrop-blur-xl sm:p-8">
            <h2 className="mb-2 text-2xl font-semibold text-white">
              Addons Management
            </h2>
            <p className="text-sm text-[#94A3B8]">
              Enable or disable various third-party services and integrations
              for your website. Configure API keys for enabled services.
            </p>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Google reCAPTCHA */}
            <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-6 backdrop-blur-xl">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#3B82F6]/20">
                    <Shield className="h-5 w-5 text-[#3B82F6]" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-base font-semibold text-white">
                      Google reCAPTCHA
                    </h3>
                    <p className="text-sm text-[#64748B]">
                      Protect login and registration forms from bots
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleAddon('recaptcha')}
                  className={`size-icon relative h-6 !min-h-0 w-12 shrink-0 rounded-full !p-0 transition-colors ${
                    addons.recaptcha.enabled
                      ? 'bg-[#3B82F6]'
                      : 'bg-[rgba(255,255,255,0.18)]'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      addons.recaptcha.enabled
                        ? 'translate-x-6'
                        : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {addons.recaptcha.enabled && (
                <div className="space-y-3 border-t border-[rgba(255,255,255,0.1)] pt-4">
                  <div>
                    <label className="mb-2 block text-xs font-medium text-white">
                      Site Key
                    </label>
                    <input
                      type="text"
                      value={addons.recaptcha.siteKey}
                      onChange={(e) =>
                        setAddons({
                          ...addons,
                          recaptcha: {
                            ...addons.recaptcha,
                            siteKey: e.target.value,
                          },
                        })
                      }
                      className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-3 py-2 text-base text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none lg:text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-medium text-white">
                      Secret Key
                    </label>
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
                      className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-3 py-2 text-base text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none lg:text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Trust Pilot */}
            <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-6 backdrop-blur-xl">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#22C55E]/20">
                    <Star className="h-5 w-5 text-[#22C55E]" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-base font-semibold text-white">
                      Trust Pilot
                    </h3>
                    <p className="text-sm text-[#64748B]">
                      Display customer reviews and ratings
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleAddon('trustpilot')}
                  className={`size-icon relative h-6 !min-h-0 w-12 shrink-0 rounded-full !p-0 transition-colors ${
                    addons.trustpilot.enabled
                      ? 'bg-[#3B82F6]'
                      : 'bg-[rgba(255,255,255,0.18)]'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      addons.trustpilot.enabled
                        ? 'translate-x-6'
                        : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {addons.trustpilot.enabled && (
                <div className="border-t border-[rgba(255,255,255,0.1)] pt-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-medium text-white">
                        Business profile URL
                      </label>
                      <input
                        type="text"
                        value={addons.trustpilot.businessUrl}
                        placeholder="https://www.trustpilot.com/review/example.com"
                        onChange={(e) =>
                          setAddons({
                            ...addons,
                            trustpilot: {
                              ...addons.trustpilot,
                              businessUrl: e.target.value,
                            },
                          })
                        }
                        className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-3 py-2 text-base text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none lg:text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-medium text-white">
                        Business Unit ID
                      </label>
                      <input
                        type="text"
                        value={addons.trustpilot.businessUnitId}
                        placeholder="24-char ID from Trustpilot widget code"
                        onChange={(e) =>
                          setAddons({
                            ...addons,
                            trustpilot: {
                              ...addons.trustpilot,
                              businessUnitId: e.target.value,
                            },
                          })
                        }
                        className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-3 py-2 text-base text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none lg:text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Google Analytics */}
            <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-6 backdrop-blur-xl">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#F59E0B]/20">
                    <BarChart3 className="h-5 w-5 text-[#F59E0B]" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-base font-semibold text-white">
                      Google Analytics
                    </h3>
                    <p className="text-sm text-[#64748B]">
                      Track website traffic and user behavior
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleAddon('googleAnalytics')}
                  className={`size-icon relative h-6 !min-h-0 w-12 shrink-0 rounded-full !p-0 transition-colors ${
                    addons.googleAnalytics.enabled
                      ? 'bg-[#3B82F6]'
                      : 'bg-[rgba(255,255,255,0.18)]'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      addons.googleAnalytics.enabled
                        ? 'translate-x-6'
                        : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {addons.googleAnalytics.enabled && (
                <div className="border-t border-[rgba(255,255,255,0.1)] pt-4">
                  <label className="mb-2 block text-xs font-medium text-white">
                    Measurement ID
                  </label>
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
                    className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-3 py-2 text-base text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none lg:text-sm"
                  />
                </div>
              )}
            </div>

            {/* Microsoft Clarity */}
            <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-6 backdrop-blur-xl">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#8B5CF6]/20">
                    <Eye className="h-5 w-5 text-[#8B5CF6]" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-base font-semibold text-white">
                      Microsoft Clarity
                    </h3>
                    <p className="text-sm text-[#64748B]">
                      Heatmaps and user session recordings
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleAddon('microsoftClarity')}
                  className={`size-icon relative h-6 !min-h-0 w-12 shrink-0 rounded-full !p-0 transition-colors ${
                    addons.microsoftClarity.enabled
                      ? 'bg-[#3B82F6]'
                      : 'bg-[rgba(255,255,255,0.18)]'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      addons.microsoftClarity.enabled
                        ? 'translate-x-6'
                        : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {addons.microsoftClarity.enabled && (
                <div className="border-t border-[rgba(255,255,255,0.1)] pt-4">
                  <label className="mb-2 block text-xs font-medium text-white">
                    Project ID
                  </label>
                  <input
                    type="text"
                    value={addons.microsoftClarity.projectId}
                    placeholder="abcd123xyz"
                    onChange={(e) =>
                      setAddons({
                        ...addons,
                        microsoftClarity: {
                          ...addons.microsoftClarity,
                          projectId: e.target.value,
                        },
                      })
                    }
                    className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-3 py-2 text-base text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none lg:text-sm"
                  />
                </div>
              )}
            </div>

            {/* Cloudflare */}
            <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-6 backdrop-blur-xl">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#F59E0B]/20">
                    <Globe className="h-5 w-5 text-[#F59E0B]" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-base font-semibold text-white">
                      Cloudflare
                    </h3>
                    <p className="text-sm text-[#64748B]">
                      CDN, security, and performance optimization
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleAddon('cloudflare')}
                  className={`size-icon relative h-6 !min-h-0 w-12 shrink-0 rounded-full !p-0 transition-colors ${
                    addons.cloudflare.enabled
                      ? 'bg-[#3B82F6]'
                      : 'bg-[rgba(255,255,255,0.18)]'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      addons.cloudflare.enabled
                        ? 'translate-x-6'
                        : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {addons.cloudflare.enabled && (
                <div className="border-t border-[rgba(255,255,255,0.1)] pt-4">
                  <label className="mb-2 block text-xs font-medium text-white">
                    Web Analytics token
                  </label>
                  <input
                    type="text"
                    value={addons.cloudflare.token}
                    placeholder="32-character token from Cloudflare → Analytics → Web Analytics"
                    onChange={(e) =>
                      setAddons({
                        ...addons,
                        cloudflare: {
                          ...addons.cloudflare,
                          token: e.target.value,
                        },
                      })
                    }
                    className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-3 py-2 text-base text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none lg:text-sm"
                  />
                </div>
              )}
            </div>

            {/* GetButton.io */}
            <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-6 backdrop-blur-xl">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#EC4899]/20">
                    <MessageCircle className="h-5 w-5 text-[#EC4899]" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-base font-semibold text-white">
                      GetButton.io
                    </h3>
                    <p className="text-sm text-[#64748B]">
                      Live chat and customer support widget
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleAddon('getbutton')}
                  className={`size-icon relative h-6 !min-h-0 w-12 shrink-0 rounded-full !p-0 transition-colors ${
                    addons.getbutton.enabled
                      ? 'bg-[#3B82F6]'
                      : 'bg-[rgba(255,255,255,0.18)]'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      addons.getbutton.enabled
                        ? 'translate-x-6'
                        : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {addons.getbutton.enabled && (
                <div className="border-t border-[rgba(255,255,255,0.1)] pt-4">
                  <label className="mb-2 block text-xs font-medium text-white">
                    Widget code (account ID from GetButton.io)
                  </label>
                  <input
                    type="text"
                    value={addons.getbutton.code}
                    placeholder="ABC123"
                    onChange={(e) =>
                      setAddons({
                        ...addons,
                        getbutton: {
                          ...addons.getbutton,
                          code: e.target.value,
                        },
                      })
                    }
                    className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-3 py-2 text-base text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none lg:text-sm"
                  />
                </div>
              )}
            </div>

            {/* Tawk.to */}
            <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-6 backdrop-blur-xl">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#06B6D4]/20">
                    <MessageCircle className="h-5 w-5 text-[#06B6D4]" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-base font-semibold text-white">
                      Tawk.to
                    </h3>
                    <p className="text-sm text-[#64748B]">
                      Free live chat for customer support
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleAddon('tawkto')}
                  className={`size-icon relative h-6 !min-h-0 w-12 shrink-0 rounded-full !p-0 transition-colors ${
                    addons.tawkto.enabled
                      ? 'bg-[#3B82F6]'
                      : 'bg-[rgba(255,255,255,0.18)]'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      addons.tawkto.enabled
                        ? 'translate-x-6'
                        : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {addons.tawkto.enabled && (
                <div className="border-t border-[rgba(255,255,255,0.1)] pt-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-medium text-white">
                        Property ID
                      </label>
                      <input
                        type="text"
                        value={addons.tawkto.propertyId}
                        placeholder="5e4abc12345..."
                        onChange={(e) =>
                          setAddons({
                            ...addons,
                            tawkto: {
                              ...addons.tawkto,
                              propertyId: e.target.value,
                            },
                          })
                        }
                        className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-3 py-2 text-base text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none lg:text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-medium text-white">
                        Widget ID
                      </label>
                      <input
                        type="text"
                        value={addons.tawkto.widgetId}
                        placeholder="default"
                        onChange={(e) =>
                          setAddons({
                            ...addons,
                            tawkto: {
                              ...addons.tawkto,
                              widgetId: e.target.value,
                            },
                          })
                        }
                        className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-3 py-2 text-base text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none lg:text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-start sm:gap-4">
            <button
              onClick={handleRefresh}
              className="flex w-full items-center justify-center rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.12)] sm:w-auto sm:justify-start"
            >
              Refresh
            </button>
            <button
              onClick={() => handleSave('Addons')}
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-lg bg-[#3B82F6] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:justify-start"
            >
              {isLoading ? 'Updating...' : 'Update Addons'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
