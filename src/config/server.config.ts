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
    DETAIL: (id: string) => `/payments/${id}`,
    CANCEL: (id: string) => `/payments/${id}/cancel`,
  },

  // ========================
  // API Keys
  // ========================
  API_KEYS: {
    ROOT: '/api-keys',
    DETAIL: (id: string) => `/api-keys/${id}`,
    USAGE: (id: string) => `/api-keys/${id}/usage`,
  },

  // ========================
  // SMS (User)
  // ========================
  SMS: {
    PROVIDERS: '/sms/providers',
    SERVICES: '/sms/services',
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
    RENT_HISTORY: '/sms/rent/history',
    FAVORITES: '/sms/favorites',
    FAVORITE_DETAIL: (id: string) => `/sms/favorites/${id}`,
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
      DASHBOARD: '/admin/analytics/dashboard',
      REVENUE: '/admin/analytics/revenue',
      USERS_GROWTH: '/admin/analytics/users/growth',
      PAYMENTS_BREAKDOWN: '/admin/analytics/payments/breakdown',
      MEMBERSHIPS_BREAKDOWN: '/admin/analytics/memberships/breakdown',
      RECENT_AUDIT_LOGS: '/admin/analytics/recent/audit-logs',
      RECENT_SYSTEM_LOGS: '/admin/analytics/recent/system-logs',
    },

    // Admin Membership
    MEMBERSHIP: {
      SUBSCRIPTIONS: '/admin/membership/subscriptions',
      STATISTICS: '/admin/membership/statistics',
      GRANT: '/admin/membership/grant',
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
      SERVICES: '/admin/sms/services',
      SERVICE_DETAIL: (id: string) => `/admin/sms/services/${id}`,
      SERVICES_BULK_DISABLE: '/admin/sms/services/bulk-disable',
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
      VIP_DETAIL: (id: string) => `/admin/sms/vip/${id}`,
      VIP_AUTO_DETECT: '/admin/sms/vip/auto-detect',
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
      GENERAL: '/admin/settings/general',
      MAINTENANCE: '/admin/settings/maintenance',
      LIMITS: '/admin/settings/limits',
      FEATURES: '/admin/settings/features',
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
      STATS: '/admin/blog/stats',
      DETAIL: (id: string) => `/admin/blog/${id}`,
    },

    // Admin Reviews
    REVIEWS: {
      ROOT: '/admin/reviews',
      STATS: '/admin/reviews/stats',
      DETAIL: (id: string) => `/admin/reviews/${id}`,
      APPROVE: (id: string) => `/admin/reviews/${id}/approve`,
      REJECT: (id: string) => `/admin/reviews/${id}/reject`,
      FEATURE: (id: string) => `/admin/reviews/${id}/feature`,
    },

    // Admin Notifications
    NOTIFICATIONS: {
      ROOT: '/admin/notifications',
      STATS: '/admin/notifications/stats',
      DETAIL: (id: string) => `/admin/notifications/${id}`,
      SEND_BULK: '/admin/notifications/bulk',
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

    // Admin Contact
    CONTACT: {
      ROOT: '/admin/contact',
      STATS: '/admin/contact/stats',
      DETAIL: (id: string) => `/admin/contact/${id}`,
      REPLY: (id: string) => `/admin/contact/${id}/reply`,
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
  },
} as const;
