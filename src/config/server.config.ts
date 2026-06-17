/**
 * Centralized API Endpoint Configuration
 *
 * All API endpoint paths are defined here for easy maintenance.
 * Dynamic segments use functions that accept the required ID parameter.
 */

export const API_ENDPOINTS = {
  // ========================
  // Public Settings (no auth required)
  // ========================
  PUBLIC: {
    LOGIN_OPTIONS: '/settings/login-options',
    SITE_INFO: '/settings/site-info',
    PAYMENT_GUIDE: '/settings/payment-guide',
    BRANDING: '/settings/branding',
    MAINTENANCE: '/settings/maintenance',
    SOCIAL_LINKS: '/settings/social-links',
    ADDONS: '/settings/addons',
    RATE_LIMITS: '/settings/rate-limits',
  },

  // ========================
  // Auth
  // ========================
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    REQUEST_EMAIL_VERIFICATION: '/auth/request-email-verification',
    VERIFY_EMAIL: '/auth/verify-email',
    GUEST: '/auth/guest',
    VERIFY_OTP: '/auth/verify-otp',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    // OAuth paths (appended to baseURL)
    GOOGLE: '/auth/google',
    GITHUB: '/auth/github',
    TELEGRAM: '/auth/telegram',
    TWITTER: '/auth/twitter',
  },

  // ========================
  // Users
  // ========================
  USERS: {
    PROFILE: '/users/profile',
    PASSWORD: '/users/password',
    ACCOUNT: '/users/account',
  },

  // ========================
  // Wallet
  // ========================
  WALLET: {
    ROOT: '/wallet',
    BALANCE: '/wallet/balance',
    TRANSACTIONS: '/wallet/transactions',
    TRANSACTION: (id: string) => `/wallet/transactions/${id}`,
  },

  // ========================
  // Membership
  // ========================
  MEMBERSHIP: {
    PLANS: '/membership/plans',
    PLAN: (slug: string) => `/membership/plans/${slug}`,
    CURRENT: '/membership/current',
    SUBSCRIBE: '/membership/subscribe',
    RENEW: '/membership/renew',
    UPGRADE: '/membership/upgrade',
    AUTO_RENEW: '/membership/auto-renew',
    // NOTE: CANCEL removed - users must open support ticket to cancel
  },

  // ========================
  // Payments
  // ========================
  PAYMENTS: {
    ROOT: '/payments',
    GATEWAYS: '/payments/gateways',
    PAYGATE_PROVIDERS: '/payments/paygate-providers',
    PREVIEW: '/payments/preview',
    DETAIL: (id: string) => `/payments/${id}`,
    CANCEL: (id: string) => `/payments/${id}/cancel`,
  },

  // ========================
  // Ranks (Public)
  // ========================
  RANKS: '/ranks',

  // ========================
  // Ads (Public)
  // ========================
  ADS: '/ads',

  // ========================
  // Languages (Public)
  // ========================
  LANGUAGES: '/languages',

  // ========================
  // API Keys
  // ========================
  API_KEYS: {
    ROOT: '/api-keys',
    DETAIL: (id: string) => `/api-keys/${id}`,
    USAGE: (id: string) => `/api-keys/${id}/usage`,
    TIER_LIST: '/api-keys/tier',
    TIER_CREATE: (version: 'V1' | 'V2' | 'V3') => `/api-keys/tier/${version}`,
    TIER_REGENERATE: (version: 'V1' | 'V2' | 'V3') =>
      `/api-keys/tier/${version}/regenerate`,
  },

  // ========================
  // SMS (User)
  // ========================
  SMS: {
    PROVIDERS: '/sms/providers',
    SERVICES: '/sms/services',
    SERVICES_UNIFIED: '/sms/services/unified',
    SERVICES_UNIFIED_COUNTRIES: (serviceName: string) =>
      `/sms/services/unified/${encodeURIComponent(serviceName)}/countries`,
    COUNTRIES: '/sms/countries',
    PRODUCTS: '/sms/products',
    PRODUCTS_REALTIME: '/sms/products/realtime',
    ACTIVATE: '/sms/activate',
    ACTIVATE_ORDER: (orderId: string) => `/sms/activate/${orderId}`,
    ACTIVATE_CANCEL: (orderId: string) => `/sms/activate/${orderId}/cancel`,
    ACTIVATE_HISTORY: '/sms/activate/history',
    RENT: '/sms/rent',
    RENT_DETAIL: (rentalId: string) => `/sms/rent/${rentalId}`,
    RENT_CANCEL: (rentalId: string) => `/sms/rent/${rentalId}/cancel`,
    RENT_EXTEND: (rentalId: string) => `/sms/rent/${rentalId}/extend`,
    RENT_HISTORY: '/sms/rent/history',
    RENT_OPTIONS: '/sms/rent/options',
    FAVORITES: '/sms/favorites',
    FAVORITE_DETAIL: (id: string) => `/sms/favorites/${id}`,
    VIP_CATEGORIES: '/sms/vip/categories',
    VIP_UNIFIED: '/sms/vip/unified',
  },

  // ========================
  // Storage (File Uploads)
  // ========================
  STORAGE: {
    UPLOAD: '/storage/upload',
  },

  // ========================
  // Tickets (Support)
  // ========================
  TICKETS: {
    ROOT: '/tickets',
    DETAIL: (id: string) => `/tickets/${id}`,
    MESSAGES: (id: string) => `/tickets/${id}/messages`,
  },

  // ========================
  // Contact
  // ========================
  CONTACT: {
    SUBMIT: '/contact',
  },

  // ========================
  // FAQ (Public)
  // ========================
  FAQ: {
    ROOT: '/faq',
    CATEGORIES: '/faq/categories',
  },

  // ========================
  // Blog (Public)
  // ========================
  BLOG: {
    ROOT: '/blog',
    DETAIL: (slug: string) => `/blog/${slug}`,
  },

  // ========================
  // Notifications
  // ========================
  NOTIFICATIONS: {
    ROOT: '/notifications',
    UNREAD_COUNT: '/notifications/unread-count',
    READ: (id: string) => `/notifications/${id}/read`,
    READ_ALL: '/notifications/read-all',
    DELETE: (id: string) => `/notifications/${id}`,
    DELETE_ALL: '/notifications',
  },

  // ========================
  // Referrals
  // ========================
  REFERRALS: {
    PROFILE: '/referrals/profile',
    LINK: '/referrals/link',
    STATS: '/referrals/stats',
    LIST: '/referrals/list',
    COMMISSIONS: '/referrals/commissions',
    PAYOUTS: '/referrals/payouts',
    REQUEST_PAYOUT: '/referrals/payouts/request',
    VALIDATE: (code: string) => `/referrals/validate/${code}`,
  },

  // ========================
  // Reviews
  // ========================
  REVIEWS: {
    PUBLIC: '/reviews',
    FEATURED: '/reviews/featured',
    RATING: '/reviews/rating',
    MY_SLOTS: '/reviews/my-slots',
    MY_REVIEWS: '/reviews/my-reviews',
    MY_REVIEW_DETAIL: (id: string) => `/reviews/my-reviews/${id}`,
    SUBMIT: '/reviews',
  },

  // ========================
  // Admin
  // ========================
  ADMIN: {
    // Admin Users
    USERS: {
      ROOT: '/admin/users',
      STATISTICS: '/admin/users/statistics',
      COUNTRIES: '/admin/users/countries',
      DETAIL: (id: string) => `/admin/users/${id}`,
      BAN: (id: string) => `/admin/users/${id}/ban`,
      UNBAN: (id: string) => `/admin/users/${id}/unban`,
      SUSPEND: (id: string) => `/admin/users/${id}/suspend`,
      ACTIVATE: (id: string) => `/admin/users/${id}/activate`,
      ROLE: (id: string) => `/admin/users/${id}/role`,
      LIMITS: (id: string) => `/admin/users/${id}/limits`,
      ABUSE_SCORE: (id: string) => `/admin/users/${id}/abuse-score`,
    },

    // Admin Wallets
    WALLETS: {
      ROOT: '/admin/wallets',
      STATISTICS: '/admin/wallets/statistics',
      DETAIL: (userId: string) => `/admin/wallets/${userId}`,
      CREDIT: (userId: string) => `/admin/wallets/${userId}/credit`,
      DEBIT: (userId: string) => `/admin/wallets/${userId}/debit`,
      ADJUST: (userId: string) => `/admin/wallets/${userId}/adjust`,
      LOCK: (userId: string) => `/admin/wallets/${userId}/lock`,
      UNLOCK: (userId: string) => `/admin/wallets/${userId}/unlock`,
    },

    // Admin Analytics
    ANALYTICS: {
      DASHBOARD: '/admin/analytics/dashboard/stats',
      REVENUE: '/admin/analytics/revenue',
      USERS_GROWTH: '/admin/analytics/users/growth',
      PAYMENTS_BREAKDOWN: '/admin/analytics/payments/breakdown',
      MEMBERSHIPS_BREAKDOWN: '/admin/analytics/memberships/breakdown',
      RECENT_AUDIT_LOGS: '/admin/analytics/recent/audit-logs',
      RECENT_SYSTEM_LOGS: '/admin/analytics/recent/system-logs',
      TOP_COUNTRIES: '/admin/analytics/top-countries',
      TOP_SERVICES: '/admin/analytics/top-services',
      REVENUE_TRENDS: '/admin/analytics/revenue-trends',
      ACTIVATION_TRENDS: '/admin/analytics/activation-trends',
      RECENT_ACTIVITY: '/admin/analytics/recent-activity',
    },

    // Admin Membership
    MEMBERSHIP: {
      SUBSCRIPTIONS: '/admin/membership/subscriptions',
      SUBSCRIPTION_CANCEL: (id: string) =>
        `/admin/membership/subscriptions/${id}/cancel`,
      STATISTICS: '/admin/membership/statistics',
      GRANT: '/admin/membership/grant',
      PLANS: '/admin/membership/plans',
      PLAN_DETAIL: (slug: string) => `/admin/membership/plans/${slug}`,
    },

    // Admin API Keys
    API_KEYS: {
      ROOT: '/admin/api-keys',
      STATISTICS: '/admin/api-keys/statistics',
      DETAIL: (keyId: string) => `/admin/api-keys/${keyId}`,
    },

    // Admin Payments
    PAYMENTS: {
      ROOT: '/admin/payments',
      STATISTICS: '/admin/payments/statistics',
      DETAIL: (id: string) => `/admin/payments/${id}`,
      REFUND: (id: string) => `/admin/payments/${id}/refund`,
      MARK_COMPLETED: (id: string) => `/admin/payments/${id}/mark-completed`,
      SYNC: (id: string) => `/admin/payments/${id}/sync`,
      SYNC_STUCK_STRIPE: '/admin/payments/stripe/sync-stuck',
    },

    // Admin Payment Gateways
    PAYMENT_GATEWAYS: {
      ROOT: '/admin/payment-gateways',
      DETAIL: (gateway: string) => `/admin/payment-gateways/${gateway}`,
      TOGGLE: (gateway: string) => `/admin/payment-gateways/${gateway}/toggle`,
      SEED: '/admin/payment-gateways/seed-defaults',
    },

    // Admin PayGate Providers
    PAYGATE_PROVIDERS: {
      ROOT: '/admin/paygate-providers',
      DETAIL: (id: string) => `/admin/paygate-providers/${id}`,
      TOGGLE: (id: string) => `/admin/paygate-providers/${id}/toggle`,
      REORDER: '/admin/paygate-providers/reorder',
      SEED: '/admin/paygate-providers/seed-defaults',
    },

    // Admin Abuse Control
    ABUSE: {
      CONFIG: '/admin/abuse/config',
      STATISTICS: '/admin/abuse/statistics',
      BLOCKED: '/admin/abuse/blocked',
      BLOCKED_DETAIL: (blockId: string) => `/admin/abuse/blocked/${blockId}`,
      USERS_AT_RISK: '/admin/abuse/users/at-risk',
      USER_INFO: (userId: string) => `/admin/abuse/users/${userId}`,
      USER_ADJUST_SCORE: (userId: string) =>
        `/admin/abuse/users/${userId}/adjust-score`,
      USER_HISTORY: (userId: string) => `/admin/abuse/users/${userId}/history`,
    },

    // Admin SMS
    SMS: {
      PROVIDERS: '/admin/sms/providers',
      PROVIDER_DETAIL: (id: string) => `/admin/sms/providers/${id}`,
      PROVIDER_SYNC: (id: string) => `/admin/sms/providers/${id}/sync`,
      PROVIDER_SYNC_STATUS: (id: string) =>
        `/admin/sms/providers/${id}/sync-status`,
      SERVICES: '/admin/sms/services',
      SERVICE_DETAIL: (id: string) => `/admin/sms/services/${id}`,
      SERVICES_BULK_DISABLE: '/admin/sms/services/bulk-disable',
      SERVICES_BULK_UPDATE_ICONS: '/admin/sms/services/bulk-update-icons',
      SERVICES_BACKFILL_ICONS: '/admin/sms/services/backfill-icons',
      SERVICES_RECALCULATE_POPULARITY:
        '/admin/sms/services/recalculate-popularity',
      SERVICES_USAGE_STATS: '/admin/sms/services/usage-stats',
      COUNTRIES: '/admin/sms/countries',
      COUNTRY_DETAIL: (id: string) => `/admin/sms/countries/${id}`,
      ORDERS: '/admin/sms/orders',
      ORDER_DETAIL: (id: string) => `/admin/sms/orders/${id}`,
      ORDER_REFUND: (id: string) => `/admin/sms/orders/${id}/refund`,
      ORDER_CANCEL: (id: string) => `/admin/sms/orders/${id}/cancel`,
      ORDER_EXTEND: (id: string) => `/admin/sms/orders/${id}/extend`,
      RENTALS: '/admin/sms/rentals',
      STATISTICS: '/admin/sms/statistics',
      VIP: '/admin/sms/vip',
      VIP_BULK: '/admin/sms/vip/bulk',
      VIP_BULK_ALL_COUNTRIES: '/admin/sms/vip/bulk-all-countries',
      VIP_SYNC_COUNTRIES: '/admin/sms/vip/sync-countries',
      VIP_DETAIL: (id: string) => `/admin/sms/vip/${id}`,
      VIP_AUTO_DETECT: '/admin/sms/vip/auto-detect',
      VIP_CATEGORIES: '/admin/sms/vip/categories',
      VIP_UNIFIED: '/admin/sms/vip/unified',
      VIP_TOGGLE: '/admin/sms/vip/toggle',
      VIP_AUTO_POPULATE: '/admin/sms/vip/auto-populate',
      VIP_TOP_ORDERED: '/admin/sms/vip/top-ordered',
      PRICING_GLOBAL_MARKUP: '/admin/sms/pricing/global-markup',
      PRICING_PRODUCTS: '/admin/sms/pricing/products',
      PRICING_PRODUCT_DETAIL: (id: string) =>
        `/admin/sms/pricing/products/${id}`,
      PRICING_BULK_LOCK: '/admin/sms/pricing/products/bulk-lock',
      PRICING_LOCKED_STATS: '/admin/sms/pricing/locked-stats',
    },

    // Admin SEO
    SEO: {
      ROOT: '/admin/seo',
      DETAIL: (id: string) => `/admin/seo/${id}`,
      BY_PATH: (path: string) => `/admin/seo/path/${encodeURIComponent(path)}`,
      UPSERT: '/admin/seo/upsert',
      SEED: '/admin/seo/seed',
    },

    // Admin Settings
    SETTINGS: {
      ROOT: '/admin/settings',
      GROUPED: '/admin/settings/grouped',
      BY_KEY: (key: string) => `/admin/settings/key/${key}`,
      BULK: '/admin/settings/bulk',
      SEED: '/admin/settings/seed',
      LOGIN: '/admin/settings/login',
      GENERAL: '/admin/settings/general',
      MAINTENANCE: '/admin/settings/maintenance',
      LIMITS: '/admin/settings/limits',
      FEATURES: '/admin/settings/features',
      BRANDING: '/admin/settings/branding',
      BRANDING_LOGO: '/admin/settings/branding/logo',
      BRANDING_FAVICON: '/admin/settings/branding/favicon',
    },

    // Admin Languages
    LANGUAGES: {
      ROOT: '/admin/languages',
      DETAIL: (id: string) => `/admin/languages/${id}`,
      TOGGLE: (id: string) => `/admin/languages/${id}/toggle`,
    },

    // Admin Ads
    ADS: {
      ROOT: '/admin/ads',
      STATS: '/admin/ads/stats',
      POSITIONS: '/admin/ads/positions',
      DETAIL: (id: string) => `/admin/ads/${id}`,
    },

    // Admin Legal
    LEGAL: {
      ROOT: '/admin/legal',
      DETAIL: (id: string) => `/admin/legal/${id}`,
      BY_TYPE: (type: string) => `/admin/legal/type/${type}`,
    },

    // Admin Blog
    BLOG: {
      ROOT: '/admin/blog',
      BULK: '/admin/blog/bulk',
      STATS: '/admin/blog/stats',
      TAGS: '/admin/blog/tags',
      DETAIL: (id: string) => `/admin/blog/${id}`,
      PUBLISH: (id: string) => `/admin/blog/${id}/publish`,
      UNPUBLISH: (id: string) => `/admin/blog/${id}/unpublish`,
      ARCHIVE: (id: string) => `/admin/blog/${id}/archive`,
    },

    // Admin Blog Categories
    BLOG_CATEGORIES: {
      ROOT: '/admin/blog/categories',
      PARENTS: '/admin/blog/categories/parents',
      REORDER: '/admin/blog/categories/reorder',
      DETAIL: (id: string) => `/admin/blog/categories/${id}`,
      TOGGLE: (id: string) => `/admin/blog/categories/${id}/toggle`,
    },

    // Admin Blog Authors
    BLOG_AUTHORS: {
      ROOT: '/admin/blog/authors',
      RANDOM: '/admin/blog/authors/random',
      DETAIL: (id: string) => `/admin/blog/authors/${id}`,
      TOGGLE: (id: string) => `/admin/blog/authors/${id}/toggle`,
    },

    // Admin Reviews
    REVIEWS: {
      ROOT: '/admin/reviews',
      STATS: '/admin/reviews/stats',
      DETAIL: (id: string) => `/admin/reviews/${id}`,
      APPROVE: (id: string) => `/admin/reviews/${id}/approve`,
      REJECT: (id: string) => `/admin/reviews/${id}/reject`,
      FEATURE: (id: string) => `/admin/reviews/${id}/feature`,
      BULK_APPROVE: '/admin/reviews/bulk/approve',
      BULK_REJECT: '/admin/reviews/bulk/reject',
      BULK_DELETE: '/admin/reviews/bulk/delete',
      BULK_SCHEDULE: '/admin/reviews/bulk/schedule',
      BULK_SCHEDULED: '/admin/reviews/bulk/scheduled',
      UNIQUE_NAMES: '/admin/reviews/unique-names',
      UNIQUE_NAME_DETAIL: (id: string) => `/admin/reviews/unique-names/${id}`,
    },

    // Admin Notifications
    NOTIFICATIONS: {
      ROOT: '/admin/notifications',
      MY: '/admin/notifications/my',
      STATS: '/admin/notifications/stats',
      DETAIL: (id: string) => `/admin/notifications/${id}`,
      SEND_BULK: '/admin/notifications/bulk',
      AUDIENCE_COUNTS: '/admin/notifications/audience-counts',
      TEMPLATES: '/admin/notifications/templates',
    },

    // Admin FAQ
    FAQ: {
      ROOT: '/admin/faq',
      CATEGORIES: '/admin/faq/categories',
      DETAIL: (id: string) => `/admin/faq/${id}`,
      CATEGORY_DETAIL: (id: string) => `/admin/faq/categories/${id}`,
      REORDER: '/admin/faq/reorder',
    },

    // Admin Referrals
    REFERRALS: {
      ROOT: '/admin/referrals',
      STATS: '/admin/referrals/stats',
      PROFILES: '/admin/referrals/profiles',
      CONFIG: '/admin/referrals/config',
      PAYOUTS: '/admin/referrals/payouts',
      PAYOUT_DETAIL: (id: string) => `/admin/referrals/payouts/${id}`,
      APPROVE_PAYOUT: (id: string) => `/admin/referrals/payouts/${id}/approve`,
      REJECT_PAYOUT: (id: string) => `/admin/referrals/payouts/${id}/reject`,
    },

    // Admin Coupons
    COUPONS: {
      ROOT: '/admin/coupons',
      STATS: '/admin/coupons/stats',
      DETAIL: (id: string) => `/admin/coupons/${id}`,
    },

    // Admin Ranks
    RANKS: {
      ROOT: '/admin/ranks',
      DETAIL: (id: string) => `/admin/ranks/${id}`,
      REORDER: '/admin/ranks/reorder',
      RECOMPUTE: '/admin/ranks/recompute',
      RECOMPUTE_USER: (userId: string) => `/admin/ranks/recompute/${userId}`,
    },

    // Admin Tickets
    TICKETS: {
      ROOT: '/admin/tickets',
      STATS: '/admin/tickets/stats',
      DETAIL: (id: string) => `/admin/tickets/${id}`,
      ASSIGN: (id: string) => `/admin/tickets/${id}/assign`,
      CLOSE: (id: string) => `/admin/tickets/${id}/close`,
      MESSAGES: (id: string) => `/admin/tickets/${id}/messages`,
      REPLY: (id: string) => `/admin/tickets/${id}/reply`,
    },

    // Admin Contact
    CONTACT: {
      ROOT: '/admin/contact',
      STATS: '/admin/contact/stats',
      DETAIL: (id: string) => `/admin/contact/${id}`,
      READ: (id: string) => `/admin/contact/${id}/read`,
      REPLY: (id: string) => `/admin/contact/${id}/reply`,
      ARCHIVE: (id: string) => `/admin/contact/${id}/archive`,
    },

    // Admin Email Templates
    EMAIL_TEMPLATES: {
      ROOT: '/admin/email-templates',
      DETAIL: (id: string) => `/admin/email-templates/${id}`,
      RESET: (id: string) => `/admin/email-templates/${id}/reset`,
      PREVIEW: (id: string) => `/admin/email-templates/${id}/preview`,
      SEND_TEST: (id: string) => `/admin/email-templates/${id}/send-test`,
      DEFAULTS: '/admin/email-templates/defaults/list',
    },
  },
} as const;
