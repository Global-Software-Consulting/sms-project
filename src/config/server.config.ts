/**
 * Centralized API Endpoint Configuration
 *
 * All API endpoint paths are defined here for easy maintenance.
 * Dynamic segments use functions that accept the required ID parameter.
 */

export const API_ENDPOINTS = {
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
    CANCEL: '/membership/cancel',
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
      RENTALS: '/admin/sms/rentals',
      STATISTICS: '/admin/sms/statistics',
      VIP: '/admin/sms/vip',
      VIP_DETAIL: (id: string) => `/admin/sms/vip/${id}`,
      VIP_AUTO_DETECT: '/admin/sms/vip/auto-detect',
    },
  },
} as const;
