'use client';

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminGlassCard } from "@/components/admin/glass-card";
import { toast } from "sonner";
import { Mail, Globe, Lock, Eye, EyeOff, Loader2, MessageSquare } from "lucide-react";
import { getGroupedSettings, bulkUpdateSettings, getLoginSettings, type LoginSettings } from "@/lib/api/settingsApi";
import { API_BASE_URL } from "@/config/api-client.config";

type TabType = "login" | "api";
const validTabs: TabType[] = ["login", "api"];

export default function AdminLoginApiPage() {
  const searchParams = useSearchParams();
  
  // Get initial tab from URL or default to "login"
  const tabFromUrl = searchParams.get('tab') as TabType | null;
  const initialTab: TabType = tabFromUrl && validTabs.includes(tabFromUrl) ? tabFromUrl : "login";
  
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Update URL when tab changes (without full page reload)
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    const newUrl = `/admin/login-api?tab=${tab}`;
    window.history.replaceState({}, '', newUrl);
  };

  // Login settings (toggles + credentials). null = not loaded yet.
  const [loginForm, setLoginForm] = useState<LoginSettings | null>(null);
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});

  // Visibility toggles for masked secrets
  const [showLoginSecrets, setShowLoginSecrets] = useState({
    googleClientSecret: false,
    twitterConsumerSecret: false,
    githubClientSecret: false,
    telegramBotToken: false,
  });

  // API Configuration State
  const [showPasswords, setShowPasswords] = useState({
    smtpPassword: false,
    deeplKey: false,
    googleKey: false,
    jwtSecret: false,
    fivesimKey: false,
    smsmanKey: false,
    herosmsKey: false,
  });

  const [apiConfig, setApiConfig] = useState({
    // SMTP Configuration
    smtpHost: "",
    smtpPort: "465",
    smtpUser: "",
    smtpPassword: "",
    useSslTls: true,

    // DeepL Translation
    deeplApiKey: "",
    deeplBaseUrl: "https://api-free.deepl.com",

    // Google Translate
    googleApiKey: "",
    googleBaseUrl: "https://translation.googleapis.com",

    // JWT Configuration
    jwtSecret: "",
    jwtExpiresIn: "7d",

    // SMS Providers
    fivesimApiKey: "",
    smsmanApiKey: "",
    herosmsApiKey: "",
  });

  // Fetch settings from API
  const fetchSettings = useCallback(async () => {
    try {
      setIsPageLoading(true);

      // Login settings: typed endpoint (returns toggles + credentials in one call).
      // Coerce nullish/undefined string fields to '' so the form renders empty
      // instead of "undefined" (and stays a controlled component).
      const login = await getLoginSettings();
      if (typeof window !== 'undefined') {
        // eslint-disable-next-line no-console
        console.debug('[login-settings] raw response:', login);
      }
      const s = (v: unknown): string => (typeof v === 'string' ? v : '');
      // Telegram bot usernames are alphanumeric/underscore only (5-32 chars,
      // must end in "Bot" or "_bot"). They can never contain '@' or '.', so a
      // value with those characters is definitely garbage (typically an email
      // leaked from the backend) and should be blanked out.
      const sanitizeBotUsername = (v: unknown): string => {
        const str = s(v);
        if (!str) return '';
        if (/[@.\s]/.test(str)) return '';
        return str;
      };
      setLoginForm({
        googleEnabled: !!login.googleEnabled,
        googleClientId: s(login.googleClientId),
        googleClientSecret: s(login.googleClientSecret),
        googleCallbackUrl: s(login.googleCallbackUrl),

        twitterEnabled: !!login.twitterEnabled,
        twitterConsumerKey: s(login.twitterConsumerKey),
        twitterConsumerSecret: s(login.twitterConsumerSecret),
        twitterCallbackUrl: s(login.twitterCallbackUrl),

        githubEnabled: !!login.githubEnabled,
        githubClientId: s(login.githubClientId),
        githubClientSecret: s(login.githubClientSecret),
        githubCallbackUrl: s(login.githubCallbackUrl),

        telegramEnabled: !!login.telegramEnabled,
        telegramBotToken: s(login.telegramBotToken),
        telegramBotUsername: sanitizeBotUsername(login.telegramBotUsername),
      });
      setLoginErrors({});

      // API tab still uses the grouped endpoint
      const grouped = await getGroupedSettings();
      const apiSettings = grouped['api'] || [];
      const apiMap: Record<string, string> = {};
      apiSettings.forEach((s) => {
        apiMap[s.key] = s.value;
      });
      
      if (Object.keys(apiMap).length > 0) {
        setApiConfig((prev) => ({
          smtpHost: apiMap['api_smtp_host'] || prev.smtpHost,
          smtpPort: apiMap['api_smtp_port'] || prev.smtpPort,
          smtpUser: apiMap['api_smtp_user'] || prev.smtpUser,
          smtpPassword: apiMap['api_smtp_password'] || prev.smtpPassword,
          useSslTls: apiMap['api_smtp_ssl'] !== 'false',
          deeplApiKey: apiMap['api_deepl_key'] || prev.deeplApiKey,
          deeplBaseUrl: apiMap['api_deepl_url'] || prev.deeplBaseUrl,
          googleApiKey: apiMap['api_google_key'] || prev.googleApiKey,
          googleBaseUrl: apiMap['api_google_url'] || prev.googleBaseUrl,
          jwtSecret: apiMap['api_jwt_secret'] || prev.jwtSecret,
          jwtExpiresIn: apiMap['api_jwt_expires'] || prev.jwtExpiresIn,
          // SMS Providers
          fivesimApiKey: apiMap['api_fivesim_key'] || prev.fivesimApiKey,
          smsmanApiKey: apiMap['api_smsman_key'] || prev.smsmanApiKey,
          herosmsApiKey: apiMap['api_herosms_key'] || prev.herosmsApiKey,
        }));
      }
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

  const validateLoginForm = (form: LoginSettings): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (form.googleEnabled) {
      if (!form.googleClientId.trim()) errs.googleClientId = "Client ID is required when Google login is enabled";
      if (!form.googleClientSecret.trim()) errs.googleClientSecret = "Client Secret is required when Google login is enabled";
    }
    if (form.twitterEnabled) {
      if (!form.twitterConsumerKey.trim()) errs.twitterConsumerKey = "Consumer Key is required when Twitter login is enabled";
      if (!form.twitterConsumerSecret.trim()) errs.twitterConsumerSecret = "Consumer Secret is required when Twitter login is enabled";
    }
    if (form.githubEnabled) {
      if (!form.githubClientId.trim()) errs.githubClientId = "Client ID is required when GitHub login is enabled";
      if (!form.githubClientSecret.trim()) errs.githubClientSecret = "Client Secret is required when GitHub login is enabled";
    }
    if (form.telegramEnabled) {
      if (!form.telegramBotToken.trim()) errs.telegramBotToken = "Bot Token is required when Telegram login is enabled";
    }
    return errs;
  };

  const handleUpdateLoginOptions = async () => {
    if (!loginForm) {
      toast.error("Login options not loaded yet");
      return;
    }

    const errs = validateLoginForm(loginForm);
    setLoginErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error("Please fix the highlighted fields before saving");
      return;
    }

    setIsLoading(true);
    try {
      await bulkUpdateSettings({
        settings: [
          // Toggles
          { key: 'login_google_enabled', value: String(loginForm.googleEnabled) },
          { key: 'login_twitter_enabled', value: String(loginForm.twitterEnabled) },
          { key: 'login_github_enabled', value: String(loginForm.githubEnabled) },
          { key: 'login_telegram_enabled', value: String(loginForm.telegramEnabled) },

          // Google credentials
          { key: 'login_google_client_id', value: loginForm.googleClientId },
          { key: 'login_google_client_secret', value: loginForm.googleClientSecret },
          { key: 'login_google_callback_url', value: loginForm.googleCallbackUrl },

          // Twitter credentials
          { key: 'login_twitter_consumer_key', value: loginForm.twitterConsumerKey },
          { key: 'login_twitter_consumer_secret', value: loginForm.twitterConsumerSecret },
          { key: 'login_twitter_callback_url', value: loginForm.twitterCallbackUrl },

          // GitHub credentials
          { key: 'login_github_client_id', value: loginForm.githubClientId },
          { key: 'login_github_client_secret', value: loginForm.githubClientSecret },
          { key: 'login_github_callback_url', value: loginForm.githubCallbackUrl },

          // Telegram credentials
          { key: 'login_telegram_bot_token', value: loginForm.telegramBotToken },
          { key: 'login_telegram_bot_username', value: loginForm.telegramBotUsername },
        ],
      });
      // Re-fetch to confirm save (invalidates the in-memory form with persisted values)
      await fetchSettings();
      toast.success("Login options updated successfully!");
    } catch (error) {
      console.error('Failed to update login options:', error);
      toast.error("Failed to update login options");
    } finally {
      setIsLoading(false);
    }
  };

  const updateLoginField = <K extends keyof LoginSettings>(field: K, value: LoginSettings[K]) => {
    setLoginForm(prev => (prev ? { ...prev, [field]: value } : prev));
    setLoginErrors(prev => {
      if (!prev[field as string]) return prev;
      const next = { ...prev };
      delete next[field as string];
      return next;
    });
  };

  const toggleLoginSecret = (field: keyof typeof showLoginSecrets) => {
    setShowLoginSecrets(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const callbackPlaceholder = (provider: 'google' | 'twitter' | 'github') =>
    `${API_BASE_URL}/auth/${provider}/callback`;

  const handleUpdateAPIKeys = async () => {
    setIsLoading(true);
    try {
      await bulkUpdateSettings({
        settings: [
          { key: 'api_smtp_host', value: apiConfig.smtpHost },
          { key: 'api_smtp_port', value: apiConfig.smtpPort },
          { key: 'api_smtp_user', value: apiConfig.smtpUser },
          { key: 'api_smtp_password', value: apiConfig.smtpPassword },
          { key: 'api_smtp_ssl', value: String(apiConfig.useSslTls) },
          { key: 'api_deepl_key', value: apiConfig.deeplApiKey },
          { key: 'api_deepl_url', value: apiConfig.deeplBaseUrl },
          { key: 'api_google_key', value: apiConfig.googleApiKey },
          { key: 'api_google_url', value: apiConfig.googleBaseUrl },
          { key: 'api_jwt_secret', value: apiConfig.jwtSecret },
          { key: 'api_jwt_expires', value: apiConfig.jwtExpiresIn },
          // SMS Providers
          { key: 'api_fivesim_key', value: apiConfig.fivesimApiKey },
          { key: 'api_smsman_key', value: apiConfig.smsmanApiKey },
          { key: 'api_herosms_key', value: apiConfig.herosmsApiKey },
        ],
      });
      // Re-fetch to confirm save
      await fetchSettings();
      toast.success("API keys updated successfully!");
    } catch (error) {
      console.error('Failed to update API keys:', error);
      toast.error("Failed to update API keys");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    toast.info("Refreshing configuration...");
    await fetchSettings();
    toast.success("Configuration refreshed!");
  };

  const togglePassword = (field: keyof typeof showPasswords) => {
    setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] });
  };

  if (isPageLoading) {
    return (
      <div className="p-4 lg:p-8">
        <AdminPageHeader
          title="Login & API Management"
          description="Manage social login options and API integrations"
        />
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
      <AdminPageHeader
        title="Login & API Management"
        description="Manage social login options and API integrations"
      />

      {/* Tabs */}
      <div className="flex items-center gap-6 mb-8 border-b border-[rgba(255,255,255,0.18)]">
        <button
          onClick={() => handleTabChange("login")}
          className={`pb-4 px-2 text-base font-medium transition-colors relative ${
            activeTab === "login"
              ? "text-[#3B82F6]"
              : "text-[#64748B] hover:text-white"
          }`}
        >
          Login Management
          {activeTab === "login" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3B82F6]" />
          )}
        </button>
        <button
          onClick={() => handleTabChange("api")}
          className={`pb-4 px-2 text-base font-medium transition-colors relative ${
            activeTab === "api"
              ? "text-[#3B82F6]"
              : "text-[#64748B] hover:text-white"
          }`}
        >
          API Key Management
          {activeTab === "api" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3B82F6]" />
          )}
        </button>
      </div>

      {/* Login Management Tab */}
      {activeTab === "login" && loginForm && (
        <div>
          <AdminGlassCard>
            <div className="text-center mb-8">
              <h2 className="text-white text-2xl font-semibold mb-2">
                Login Options Management
              </h2>
              <p className="text-[#94A3B8] text-sm">
                Enable social login providers and configure their OAuth credentials. Secrets are stored securely and only sent over HTTPS.
              </p>
            </div>

            <div className="space-y-6 mb-8">
              {/* Google Login */}
              <div className="p-6 rounded-xl bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.18)]">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[#EA4335]/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path fill="#EA4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#4285F4" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#34A853" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white text-base font-semibold mb-1">Google Login</h3>
                    <p className="text-[#64748B] text-sm">Allow users to sign in with Google accounts</p>
                  </div>
                  <button
                    onClick={() => updateLoginField('googleEnabled', !loginForm.googleEnabled)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${loginForm.googleEnabled ? "bg-[#3B82F6]" : "bg-[rgba(255,255,255,0.18)]"}`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${loginForm.googleEnabled ? "translate-x-6" : "translate-x-0.5"}`} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Client ID</label>
                    <input
                      type="text"
                      value={loginForm.googleClientId}
                      onChange={(e) => updateLoginField('googleClientId', e.target.value)}
                      placeholder="xxxxxxxxxxxx.apps.googleusercontent.com"
                      autoComplete="off"
                      className={`w-full bg-[rgba(255,255,255,0.08)] border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] ${loginErrors.googleClientId ? "border-red-500" : "border-[rgba(255,255,255,0.18)]"}`}
                    />
                    {loginErrors.googleClientId && <p className="text-red-400 text-xs mt-1">{loginErrors.googleClientId}</p>}
                  </div>

                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Client Secret</label>
                    <div className="relative">
                      <input
                        type={showLoginSecrets.googleClientSecret ? "text" : "password"}
                        value={loginForm.googleClientSecret}
                        onChange={(e) => updateLoginField('googleClientSecret', e.target.value)}
                        placeholder="Client secret from Google Cloud Console"
                        autoComplete="new-password"
                        className={`w-full bg-[rgba(255,255,255,0.08)] border rounded-xl px-4 py-3 pr-12 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] ${loginErrors.googleClientSecret ? "border-red-500" : "border-[rgba(255,255,255,0.18)]"}`}
                      />
                      <button
                        type="button"
                        onClick={() => toggleLoginSecret('googleClientSecret')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white transition-colors"
                      >
                        {showLoginSecrets.googleClientSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {loginErrors.googleClientSecret && <p className="text-red-400 text-xs mt-1">{loginErrors.googleClientSecret}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-white text-sm font-medium mb-2 block">Callback URL <span className="text-[#64748B] font-normal">(optional)</span></label>
                    <input
                      type="text"
                      value={loginForm.googleCallbackUrl}
                      onChange={(e) => updateLoginField('googleCallbackUrl', e.target.value)}
                      placeholder={callbackPlaceholder('google')}
                      autoComplete="off"
                      className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                    />
                  </div>
                </div>

                <p className="text-[#64748B] text-xs mt-3">
                  Get these from <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" className="text-[#3B82F6] hover:underline">Google Cloud Console</a> &rarr; APIs & Services &rarr; Credentials. The Authorized redirect URI must match the Callback URL.
                </p>
              </div>

              {/* Twitter Login */}
              <div className="p-6 rounded-xl bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.18)]">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[#1DA1F2]/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[#1DA1F2]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white text-base font-semibold mb-1">Twitter Login</h3>
                    <p className="text-[#64748B] text-sm">Allow users to sign in with Twitter accounts</p>
                  </div>
                  <button
                    onClick={() => updateLoginField('twitterEnabled', !loginForm.twitterEnabled)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${loginForm.twitterEnabled ? "bg-[#3B82F6]" : "bg-[rgba(255,255,255,0.18)]"}`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${loginForm.twitterEnabled ? "translate-x-6" : "translate-x-0.5"}`} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Consumer Key</label>
                    <input
                      type="text"
                      value={loginForm.twitterConsumerKey}
                      onChange={(e) => updateLoginField('twitterConsumerKey', e.target.value)}
                      placeholder="API key from Twitter Developer Portal"
                      autoComplete="off"
                      className={`w-full bg-[rgba(255,255,255,0.08)] border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] ${loginErrors.twitterConsumerKey ? "border-red-500" : "border-[rgba(255,255,255,0.18)]"}`}
                    />
                    {loginErrors.twitterConsumerKey && <p className="text-red-400 text-xs mt-1">{loginErrors.twitterConsumerKey}</p>}
                  </div>

                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Consumer Secret</label>
                    <div className="relative">
                      <input
                        type={showLoginSecrets.twitterConsumerSecret ? "text" : "password"}
                        value={loginForm.twitterConsumerSecret}
                        onChange={(e) => updateLoginField('twitterConsumerSecret', e.target.value)}
                        placeholder="API secret key"
                        autoComplete="new-password"
                        className={`w-full bg-[rgba(255,255,255,0.08)] border rounded-xl px-4 py-3 pr-12 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] ${loginErrors.twitterConsumerSecret ? "border-red-500" : "border-[rgba(255,255,255,0.18)]"}`}
                      />
                      <button
                        type="button"
                        onClick={() => toggleLoginSecret('twitterConsumerSecret')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white transition-colors"
                      >
                        {showLoginSecrets.twitterConsumerSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {loginErrors.twitterConsumerSecret && <p className="text-red-400 text-xs mt-1">{loginErrors.twitterConsumerSecret}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-white text-sm font-medium mb-2 block">Callback URL <span className="text-[#64748B] font-normal">(optional)</span></label>
                    <input
                      type="text"
                      value={loginForm.twitterCallbackUrl}
                      onChange={(e) => updateLoginField('twitterCallbackUrl', e.target.value)}
                      placeholder={callbackPlaceholder('twitter')}
                      autoComplete="off"
                      className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                    />
                  </div>
                </div>

                <p className="text-[#64748B] text-xs mt-3">
                  Get these from <a href="https://developer.twitter.com/" target="_blank" rel="noreferrer" className="text-[#3B82F6] hover:underline">Twitter Developer Portal</a> &rarr; Projects & Apps. Make sure to enable "Request email from users".
                </p>
              </div>

              {/* GitHub Login */}
              <div className="p-6 rounded-xl bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.18)]">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[#333]/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white text-base font-semibold mb-1">GitHub Login</h3>
                    <p className="text-[#64748B] text-sm">Allow users to sign in with GitHub accounts</p>
                  </div>
                  <button
                    onClick={() => updateLoginField('githubEnabled', !loginForm.githubEnabled)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${loginForm.githubEnabled ? "bg-[#3B82F6]" : "bg-[rgba(255,255,255,0.18)]"}`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${loginForm.githubEnabled ? "translate-x-6" : "translate-x-0.5"}`} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Client ID</label>
                    <input
                      type="text"
                      value={loginForm.githubClientId}
                      onChange={(e) => updateLoginField('githubClientId', e.target.value)}
                      placeholder="OAuth App Client ID"
                      autoComplete="off"
                      className={`w-full bg-[rgba(255,255,255,0.08)] border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] ${loginErrors.githubClientId ? "border-red-500" : "border-[rgba(255,255,255,0.18)]"}`}
                    />
                    {loginErrors.githubClientId && <p className="text-red-400 text-xs mt-1">{loginErrors.githubClientId}</p>}
                  </div>

                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Client Secret</label>
                    <div className="relative">
                      <input
                        type={showLoginSecrets.githubClientSecret ? "text" : "password"}
                        value={loginForm.githubClientSecret}
                        onChange={(e) => updateLoginField('githubClientSecret', e.target.value)}
                        placeholder="OAuth App Client Secret"
                        autoComplete="new-password"
                        className={`w-full bg-[rgba(255,255,255,0.08)] border rounded-xl px-4 py-3 pr-12 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] ${loginErrors.githubClientSecret ? "border-red-500" : "border-[rgba(255,255,255,0.18)]"}`}
                      />
                      <button
                        type="button"
                        onClick={() => toggleLoginSecret('githubClientSecret')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white transition-colors"
                      >
                        {showLoginSecrets.githubClientSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {loginErrors.githubClientSecret && <p className="text-red-400 text-xs mt-1">{loginErrors.githubClientSecret}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-white text-sm font-medium mb-2 block">Callback URL <span className="text-[#64748B] font-normal">(optional)</span></label>
                    <input
                      type="text"
                      value={loginForm.githubCallbackUrl}
                      onChange={(e) => updateLoginField('githubCallbackUrl', e.target.value)}
                      placeholder={callbackPlaceholder('github')}
                      autoComplete="off"
                      className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                    />
                  </div>
                </div>

                <p className="text-[#64748B] text-xs mt-3">
                  Get these from <a href="https://github.com/settings/developers" target="_blank" rel="noreferrer" className="text-[#3B82F6] hover:underline">GitHub Developer Settings</a> &rarr; OAuth Apps.
                </p>
              </div>

              {/* Telegram Login */}
              <div className="p-6 rounded-xl bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.18)]">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[#0088cc]/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[#0088cc]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white text-base font-semibold mb-1">Telegram Login</h3>
                    <p className="text-[#64748B] text-sm">Allow users to sign in with Telegram accounts</p>
                  </div>
                  <button
                    onClick={() => updateLoginField('telegramEnabled', !loginForm.telegramEnabled)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${loginForm.telegramEnabled ? "bg-[#3B82F6]" : "bg-[rgba(255,255,255,0.18)]"}`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${loginForm.telegramEnabled ? "translate-x-6" : "translate-x-0.5"}`} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Bot Token</label>
                    <div className="relative">
                      <input
                        type={showLoginSecrets.telegramBotToken ? "text" : "password"}
                        value={loginForm.telegramBotToken}
                        onChange={(e) => updateLoginField('telegramBotToken', e.target.value)}
                        placeholder="123456:ABC-DEF..."
                        autoComplete="new-password"
                        className={`w-full bg-[rgba(255,255,255,0.08)] border rounded-xl px-4 py-3 pr-12 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] ${loginErrors.telegramBotToken ? "border-red-500" : "border-[rgba(255,255,255,0.18)]"}`}
                      />
                      <button
                        type="button"
                        onClick={() => toggleLoginSecret('telegramBotToken')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white transition-colors"
                      >
                        {showLoginSecrets.telegramBotToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {loginErrors.telegramBotToken && <p className="text-red-400 text-xs mt-1">{loginErrors.telegramBotToken}</p>}
                  </div>

                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Bot Username</label>
                    <input
                      type="text"
                      value={loginForm.telegramBotUsername}
                      onChange={(e) => updateLoginField('telegramBotUsername', e.target.value.replace(/^@/, ''))}
                      placeholder="MyLoginBot"
                      autoComplete="new-password"
                      name="tg-bot-handle"
                      data-lpignore="true"
                      data-form-type="other"
                      className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                    />
                    <p className="text-[#64748B] text-xs mt-1">Without the @ prefix</p>
                  </div>
                </div>

                <p className="text-[#64748B] text-xs mt-3">
                  Create a bot with <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-[#3B82F6] hover:underline">@BotFather</a> on Telegram to get the Bot Token. The Bot Username is the @name (without the @).
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4">
              <button
                onClick={handleRefresh}
                className="px-6 py-3 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white hover:bg-[rgba(255,255,255,0.12)] transition-colors text-sm font-medium"
              >
                Refresh
              </button>
              <button
                onClick={handleUpdateLoginOptions}
                disabled={isLoading}
                className="px-6 py-3 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Updating..." : "Update Login Options"}
              </button>
            </div>
          </AdminGlassCard>
        </div>
      )}

      {/* API Key Management Tab */}
      {activeTab === "api" && (
        <div>
          <AdminGlassCard>
            <div className="text-center mb-8">
              <h2 className="text-white text-2xl font-semibold mb-2">
                API Key Management
              </h2>
              <p className="text-[#94A3B8] text-sm">
                Manage API keys and configuration for various services. All values
                are stored securely in the database.
              </p>
            </div>

            <div className="space-y-6 mb-8">
              {/* SMTP Configuration */}
              <div className="p-6 rounded-xl bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.18)]">
                <div className="flex items-start gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/20 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-[#3B82F6]" />
                  </div>
                  <div>
                    <h3 className="text-white text-base font-semibold mb-1">
                      SMTP Configuration
                    </h3>
                    <p className="text-[#64748B] text-sm">
                      Email server settings for sending emails
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">
                      SMTP Host
                    </label>
                    <input
                      type="text"
                      value={apiConfig.smtpHost}
                      onChange={(e) =>
                        setApiConfig({ ...apiConfig, smtpHost: e.target.value })
                      }
                      className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                    />
                  </div>

                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">
                      SMTP Port
                    </label>
                    <input
                      type="text"
                      value={apiConfig.smtpPort}
                      onChange={(e) =>
                        setApiConfig({ ...apiConfig, smtpPort: e.target.value })
                      }
                      className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                    />
                  </div>

                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">
                      SMTP User
                    </label>
                    <input
                      type="text"
                      value={apiConfig.smtpUser}
                      onChange={(e) =>
                        setApiConfig({ ...apiConfig, smtpUser: e.target.value })
                      }
                      className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                    />
                  </div>

                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">
                      SMTP Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.smtpPassword ? "text" : "password"}
                        value={apiConfig.smtpPassword}
                        onChange={(e) =>
                          setApiConfig({
                            ...apiConfig,
                            smtpPassword: e.target.value,
                          })
                        }
                        className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-xl px-4 py-3 pr-12 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                      />
                      <button
                        onClick={() => togglePassword("smtpPassword")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white transition-colors"
                      >
                        {showPasswords.smtpPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <input
                    type="checkbox"
                    id="useSslTls"
                    checked={apiConfig.useSslTls}
                    onChange={(e) =>
                      setApiConfig({ ...apiConfig, useSslTls: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] text-[#3B82F6] focus:ring-[#3B82F6]"
                  />
                  <label htmlFor="useSslTls" className="text-white text-sm">
                    Use SSL/TLS
                  </label>
                </div>
              </div>

              {/* SMS Providers */}
              <div className="p-6 rounded-xl bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.18)]">
                <div className="flex items-start gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-[#22C55E]/20 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-[#22C55E]" />
                  </div>
                  <div>
                    <h3 className="text-white text-base font-semibold mb-1">
                      SMS Providers
                    </h3>
                    <p className="text-[#64748B] text-sm">
                      API keys for SMS verification service providers
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 5sim */}
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">
                      5sim API Key
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.fivesimKey ? "text" : "password"}
                        value={apiConfig.fivesimApiKey}
                        onChange={(e) =>
                          setApiConfig({ ...apiConfig, fivesimApiKey: e.target.value })
                        }
                        placeholder="Enter 5sim API key"
                        className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-xl px-4 py-3 pr-12 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                      />
                      <button
                        onClick={() => togglePassword("fivesimKey")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white transition-colors"
                      >
                        {showPasswords.fivesimKey ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* SMSMan */}
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">
                      SMSMan API Key
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.smsmanKey ? "text" : "password"}
                        value={apiConfig.smsmanApiKey}
                        onChange={(e) =>
                          setApiConfig({ ...apiConfig, smsmanApiKey: e.target.value })
                        }
                        placeholder="Enter SMSMan API key"
                        className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-xl px-4 py-3 pr-12 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                      />
                      <button
                        onClick={() => togglePassword("smsmanKey")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white transition-colors"
                      >
                        {showPasswords.smsmanKey ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* HeroSMS */}
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">
                      HeroSMS API Key
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.herosmsKey ? "text" : "password"}
                        value={apiConfig.herosmsApiKey}
                        onChange={(e) =>
                          setApiConfig({ ...apiConfig, herosmsApiKey: e.target.value })
                        }
                        placeholder="Enter HeroSMS API key"
                        className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-xl px-4 py-3 pr-12 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                      />
                      <button
                        onClick={() => togglePassword("herosmsKey")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white transition-colors"
                      >
                        {showPasswords.herosmsKey ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* DeepL Translation */}
              <div className="p-6 rounded-xl bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.18)]">
                <div className="flex items-start gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/20 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5 text-[#F59E0B]" />
                  </div>
                  <div>
                    <h3 className="text-white text-base font-semibold mb-1">
                      DeepL Translation
                    </h3>
                    <p className="text-[#64748B] text-sm">
                      DeepL API for high-quality translations{" "}
                      <span className="text-[#3B82F6]">
                        (Swedish, Norwegian, Danish, Finnish, French, German, Spanish,
                        Italian, Russian, Turkish)
                      </span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">
                      DeepL API Key
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.deeplKey ? "text" : "password"}
                        value={apiConfig.deeplApiKey}
                        onChange={(e) =>
                          setApiConfig({ ...apiConfig, deeplApiKey: e.target.value })
                        }
                        className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-xl px-4 py-3 pr-12 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                      />
                      <button
                        onClick={() => togglePassword("deeplKey")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white transition-colors"
                      >
                        {showPasswords.deeplKey ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">
                      DeepL Base URL
                    </label>
                    <input
                      type="text"
                      value={apiConfig.deeplBaseUrl}
                      onChange={(e) =>
                        setApiConfig({ ...apiConfig, deeplBaseUrl: e.target.value })
                      }
                      className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                    />
                  </div>
                </div>
              </div>

              {/* Google Translate */}
              <div className="p-6 rounded-xl bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.18)]">
                <div className="flex items-start gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-[#EA4335]/20 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5 text-[#EA4335]" />
                  </div>
                  <div>
                    <h3 className="text-white text-base font-semibold mb-1">
                      Google Translate
                    </h3>
                    <p className="text-[#64748B] text-sm">
                      Google Translate API for additional languages{" "}
                      <span className="text-[#3B82F6]">
                        (Arabic, Hindi, Chinese)
                      </span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">
                      Google API Key
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.googleKey ? "text" : "password"}
                        value={apiConfig.googleApiKey}
                        onChange={(e) =>
                          setApiConfig({
                            ...apiConfig,
                            googleApiKey: e.target.value,
                          })
                        }
                        className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-xl px-4 py-3 pr-12 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                      />
                      <button
                        onClick={() => togglePassword("googleKey")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white transition-colors"
                      >
                        {showPasswords.googleKey ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">
                      Google Translate Base URL
                    </label>
                    <input
                      type="text"
                      value={apiConfig.googleBaseUrl}
                      onChange={(e) =>
                        setApiConfig({
                          ...apiConfig,
                          googleBaseUrl: e.target.value,
                        })
                      }
                      className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                    />
                  </div>
                </div>
              </div>

              {/* JWT Configuration */}
              <div className="p-6 rounded-xl bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.18)]">
                <div className="flex items-start gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-[#EF4444]/20 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-5 h-5 text-[#EF4444]" />
                  </div>
                  <div>
                    <h3 className="text-white text-base font-semibold mb-1">
                      JWT Configuration
                    </h3>
                    <p className="text-[#64748B] text-sm">
                      JSON Web Token settings
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">
                      JWT Secret
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.jwtSecret ? "text" : "password"}
                        value={apiConfig.jwtSecret}
                        onChange={(e) =>
                          setApiConfig({ ...apiConfig, jwtSecret: e.target.value })
                        }
                        className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-xl px-4 py-3 pr-12 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                      />
                      <button
                        onClick={() => togglePassword("jwtSecret")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white transition-colors"
                      >
                        {showPasswords.jwtSecret ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">
                      Expires In
                    </label>
                    <input
                      type="text"
                      value={apiConfig.jwtExpiresIn}
                      onChange={(e) =>
                        setApiConfig({
                          ...apiConfig,
                          jwtExpiresIn: e.target.value,
                        })
                      }
                      className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4">
              <button
                onClick={handleRefresh}
                className="px-6 py-3 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white hover:bg-[rgba(255,255,255,0.12)] transition-colors text-sm font-medium"
              >
                Refresh
              </button>
              <button
                onClick={handleUpdateAPIKeys}
                disabled={isLoading}
                className="px-6 py-3 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Updating..." : "Update API Keys"}
              </button>
            </div>
          </AdminGlassCard>
        </div>
      )}
    </div>
  );
}
