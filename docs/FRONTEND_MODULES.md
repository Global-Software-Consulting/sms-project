# SMS Sort - Frontend Modules Documentation

> This document tracks all frontend modules and their implementation status.
> All client questions have been answered — see `sms-api/docs/CLIENT_DECISIONS.md` for decisions.
> For page roadmap, see `PAGES_ROADMAP.md`. For architecture, see `ARCHITECTURE.md`.

---

## 📋 Module Overview

| # | Module | Status | Priority | Dependencies |
|---|--------|--------|----------|--------------|
| 1 | Auth (Login/Register) | ✅ Completed | High | - |
| 2 | Users (Profile/Settings) | ✅ Completed | High | Auth |
| 3 | Wallet | ✅ Completed | High | Auth |
| 4 | Membership | ✅ Completed | Medium | Wallet |
| 5 | Payments | ✅ Completed | Medium | Wallet |
| 6 | API Keys | ✅ Completed | Low | Auth |
| 7 | Admin: Users | ✅ Completed | Medium | Auth (SUPER_ADMIN) |
| 8 | Admin: Wallets | ✅ Completed | Medium | Auth (SUPER_ADMIN) |
| 9 | Admin: Analytics | ✅ Completed | Low | Auth (SUPER_ADMIN) |
| 10 | Admin: Memberships | ✅ Completed | Medium | Auth (SUPER_ADMIN) |
| 11 | Admin: API Keys | ✅ Completed | Medium | Auth (SUPER_ADMIN) |

---

## ✅ Module 1: Authentication

### Status: COMPLETED

### Features Implemented:
- [x] Login page with email/password
- [x] Registration page with validation
- [x] Social login buttons (Google, GitHub)
- [x] JWT token management (access + refresh)
- [x] Token refresh interceptor
- [x] Route protection (RouteGuard)
- [x] Role-based access control (USER vs SUPER_ADMIN)
- [x] Redirect after login based on role

### Files:
```
src/app/(auth)/login/page.tsx
src/app/(auth)/register/page.tsx
src/lib/api/authApi.ts
src/lib/api/tokenStorage.ts
src/lib/api/config.ts (interceptors)
src/lib/store/slices/authSlice.ts
src/components/auth/RouteGuard.tsx
src/hooks/useAuth.ts
```

### Client Questions:
- [ ] **Q1**: Should we implement "Remember Me" functionality? (Currently UI only)
- [ ] **Q2**: Should we add email verification flow before allowing login?
- [ ] **Q3**: Do you want password reset via email functionality?
- [ ] **Q4**: Should social login (Google/GitHub) be enabled in production?

---

## ✅ Module 2: Users (Profile/Settings)

### Status: COMPLETED

### Features Implemented:
- [x] Settings page with profile management
- [x] Edit first name, last name, country, phone
- [x] Email and username display (read-only)
- [x] Change password with validation
- [x] Password requirements indicator
- [x] Delete account with confirmation
- [x] Role badge display
- [x] OAuth accounts display (if linked)

### Files:
```
src/app/(dashboard)/settings/page.tsx
src/lib/api/usersApi.ts
```

### API Endpoints Used:
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/users/profile` | Fetch profile |
| PATCH | `/api/v1/users/profile` | Update profile |
| PATCH | `/api/v1/users/password` | Change password |
| DELETE | `/api/v1/users/account` | Delete account |

### Client Questions:
- [ ] **Q1**: Should users be able to change their email? (Currently read-only)
- [ ] **Q2**: Should users be able to change their username? (Currently read-only)
- [ ] **Q3**: Do you want avatar upload functionality? (Currently URL input only)
- [ ] **Q4**: Should we add 2FA (Two-Factor Authentication) settings?
- [ ] **Q5**: Do you want notification preferences in settings?

---

## ✅ Module 3: Wallet

### Status: COMPLETED

### Features Implemented:
- [x] Balance card with large display
- [x] Add Funds button (links to deposit page)
- [x] Wallet stats (deposited, spent, refunded, bonus)
- [x] Transaction history table
- [x] Transaction filters (type, status, date range)
- [x] Pagination for transactions
- [x] Empty state for new users
- [x] Locked wallet warning
- [x] Export button (placeholder)

### Files:
```
src/app/(dashboard)/wallet/page.tsx
src/lib/api/walletApi.ts
```

### API Endpoints Used:
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/wallet` | Get full wallet info |
| GET | `/api/v1/wallet/balance` | Get balance only |
| GET | `/api/v1/wallet/transactions` | Transaction history |
| GET | `/api/v1/wallet/transactions/:id` | Single transaction |

### Client Questions:
- [ ] **Q1**: What export formats do you need? (CSV, Excel, PDF?)
- [ ] **Q2**: Should users be able to request withdrawals?
- [ ] **Q3**: Do you want transaction detail modal or separate page?
- [ ] **Q4**: Should we show balance in header/sidebar for quick access?
- [ ] **Q5**: Do you want low balance alerts/notifications?

---

## ✅ Module 4: Membership

### Status: COMPLETED

### Features Implemented:
- [x] Pricing page showing all 5 plans (Free, Basic, Standard, Pro, VIP)
- [x] Plan cards with price, discount, features
- [x] "Most Popular" badge support
- [x] Current subscription banner
- [x] Subscribe to plan flow
- [x] Upgrade plan flow
- [x] Cancel subscription with reason modal
- [x] Renew expired subscription
- [x] Plan comparison table (price, discount, order limit, API rate, queue priority)
- [x] Color-coded plan themes
- [x] Loading and error states

### Files:
```
src/app/(dashboard)/pricing/page.tsx
src/lib/api/membershipApi.ts
```

### API Endpoints Used:
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/membership/plans` | List all plans |
| GET | `/api/v1/membership/plans/:slug` | Get plan details |
| GET | `/api/v1/membership/current` | Current subscription |
| POST | `/api/v1/membership/subscribe` | Subscribe to plan |
| POST | `/api/v1/membership/renew` | Renew subscription |
| POST | `/api/v1/membership/upgrade` | Upgrade plan |
| POST | `/api/v1/membership/cancel` | Cancel subscription |

### Client Questions:
- [ ] **Q1**: Should pricing page be public or require login? (Currently requires login)
- [ ] **Q2**: Do you want annual pricing option with discount? (Currently monthly only)
- [ ] **Q3**: Which plan should have "Most Popular" badge? (Currently from backend `isPopular` flag)
- [ ] **Q4**: Do you want a free trial period for any plan?
- [ ] **Q5**: Should we add testimonials or reviews on pricing page?
- [ ] **Q6**: Do you want a "Contact Sales" option for enterprise/custom plans?

---

## ✅ Module 5: Payments

### Status: COMPLETED

### Features Implemented:
- [x] Deposit/Add Funds page (`/wallet/deposit`)
- [x] Preset amount buttons ($10, $25, $50, $100, $250, $500)
- [x] Custom amount input with validation ($5 - $10,000)
- [x] Current balance display
- [x] Order summary card
- [x] Security info section (Stripe badge, encryption info)
- [x] Redirect to Stripe Checkout
- [x] Payment Success page (`/wallet/deposit/success`)
- [x] Payment Cancel page (`/wallet/deposit/cancel`)
- [x] Loading and error states

### Files:
```
src/app/(dashboard)/wallet/deposit/page.tsx
src/app/(dashboard)/wallet/deposit/success/page.tsx
src/app/(dashboard)/wallet/deposit/cancel/page.tsx
src/lib/api/paymentsApi.ts
```

### API Endpoints Used:
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/v1/payments` | Initialize payment |
| GET | `/api/v1/payments` | Payment history |
| GET | `/api/v1/payments/:id` | Payment details |
| GET | `/api/v1/payments/gateways` | Available gateways |
| POST | `/api/v1/payments/:id/cancel` | Cancel pending payment |

### Client Questions:
- [ ] **Q1**: Do you want to add more payment gateways? (Crypto, PayGate, etc.)
- [ ] **Q2**: Should we save payment methods for future use? (Stripe Customer)
- [ ] **Q3**: Do you want invoice/receipt generation and download?
- [ ] **Q4**: Should we add a payment history tab in the wallet page?
- [ ] **Q5**: Do you want email notifications for successful payments?

---

## ✅ Module 6: API Keys

### Status: COMPLETED

### Features Implemented:
- [x] API Keys management page (`/settings/api-keys`)
- [x] Create new API key with name
- [x] One-time full key display with copy button
- [x] Warning about storing key securely
- [x] List existing keys (prefix only, toggle visibility)
- [x] Usage count and last used display
- [x] Revoke key with optional reason
- [x] Progress bar showing keys used (max 5)
- [x] Empty state for new users
- [x] Link to API documentation
- [x] Link from Settings page to API Keys

### Files:
```
src/app/(dashboard)/settings/api-keys/page.tsx
src/lib/api/apiKeysApi.ts
```

### API Endpoints Used:
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/v1/api-keys` | Create new key |
| GET | `/api/v1/api-keys` | List user's keys |
| GET | `/api/v1/api-keys/:id` | Key details |
| PATCH | `/api/v1/api-keys/:id` | Update key name |
| DELETE | `/api/v1/api-keys/:id` | Revoke key |
| GET | `/api/v1/api-keys/:id/usage` | Usage stats |

### Client Questions:
- [ ] **Q1**: Should API keys have expiration dates?
- [ ] **Q2**: Do you want IP whitelist per key?
- [ ] **Q3**: Should we create an API documentation page?
- [ ] **Q4**: Do you want webhook configuration per key?
- [ ] **Q5**: Should there be different permission levels per key (read-only, full access)?

---

## ✅ Module 7: Admin - User Management

### Status: COMPLETED

### Features Implemented:
- [x] User list with search/filter
- [x] User statistics cards (total, active, banned, new this week)
- [x] Paginated user table with sorting
- [x] User details page with full profile
- [x] Edit user information (name, country, phone)
- [x] Ban/Unban users with reason
- [x] Suspend/Activate users with reason
- [x] Change user roles (USER ↔ SUPER_ADMIN)
- [x] Adjust abuse scores with reason
- [x] View wallet balance and subscription info
- [x] Activity stats (login count, API keys, orders, total spent)
- [x] Color-coded status and role badges
- [x] Action modals with confirmation

### Files:
```
src/app/(admin)/admin/users/page.tsx
src/app/(admin)/admin/users/[id]/page.tsx
src/lib/api/adminApi.ts
```

### API Endpoints Used:
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/admin/users` | List all users |
| GET | `/api/v1/admin/users/statistics` | User stats |
| GET | `/api/v1/admin/users/:id` | User details |
| PATCH | `/api/v1/admin/users/:id` | Update user |
| DELETE | `/api/v1/admin/users/:id` | Delete user |
| POST | `/api/v1/admin/users/:id/ban` | Ban user |
| POST | `/api/v1/admin/users/:id/unban` | Unban user |
| POST | `/api/v1/admin/users/:id/suspend` | Suspend user |
| POST | `/api/v1/admin/users/:id/activate` | Activate user |
| PATCH | `/api/v1/admin/users/:id/role` | Change role |
| PATCH | `/api/v1/admin/users/:id/limits` | Set limits |
| PATCH | `/api/v1/admin/users/:id/abuse-score` | Set abuse score |

### Client Questions:
- [ ] **Q1**: Should admins be able to impersonate users?
- [ ] **Q2**: Do you want bulk user operations (ban multiple)?
- [ ] **Q3**: Should we add user export functionality? (Export button is placeholder)
- [ ] **Q4**: Do you want email templates for ban/suspend notifications?
- [ ] **Q5**: Should there be an activity log per user?

---

## ✅ Module 8: Admin - Wallet Management

### Status: COMPLETED

### Features Implemented:
- [x] Wallet list with search/filter
- [x] Wallet statistics cards (total wallets, total balance, deposited, locked)
- [x] Paginated wallet table with sorting
- [x] Wallet detail page with full info
- [x] Credit wallet (add bonus) with description
- [x] Debit wallet (remove funds) with description
- [x] Adjust wallet (positive/negative correction)
- [x] Lock/Unlock wallet with reason
- [x] Transaction history per user
- [x] Balance breakdown (deposited, spent, refunded, bonus)
- [x] Locked wallet warning display
- [x] Action modals with confirmation

### Files:
```
src/app/(admin)/admin/wallets/page.tsx
src/app/(admin)/admin/wallets/[userId]/page.tsx
src/lib/api/adminApi.ts (wallet section)
```

### API Endpoints Used:
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/admin/wallets` | List all wallets |
| GET | `/api/v1/admin/wallets/statistics` | Wallet stats |
| GET | `/api/v1/admin/wallets/:userId` | User's wallet |
| POST | `/api/v1/admin/wallets/:userId/credit` | Credit wallet |
| POST | `/api/v1/admin/wallets/:userId/debit` | Debit wallet |
| POST | `/api/v1/admin/wallets/:userId/adjust` | Adjust wallet |
| POST | `/api/v1/admin/wallets/:userId/lock` | Lock wallet |
| POST | `/api/v1/admin/wallets/:userId/unlock` | Unlock wallet |

### Client Questions:
- [ ] **Q1**: Should credit/debit require approval from another admin?
- [ ] **Q2**: Do you want automatic bonus for new users?
- [ ] **Q3**: Should locked wallets auto-unlock after a period?
- [ ] **Q4**: Do you want wallet balance alerts for admins?

---

## ✅ Module 9: Admin - Analytics (Dashboard)

### Status: COMPLETED

### Features Implemented:
- [x] Main admin dashboard page (`/admin`)
- [x] Quick stats cards (users, revenue, memberships, API keys)
- [x] Growth percentage indicators
- [x] Revenue overview section (today, week, month, avg transaction)
- [x] System health status card (healthy/degraded/down)
- [x] Health metrics (errors, warnings, API error rate)
- [x] User statistics section
- [x] Wallet statistics section
- [x] Recent audit logs widget (last 5)
- [x] Recent system logs widget (last 5)
- [x] Quick navigation links
- [x] Refresh functionality
- [x] Chart placeholder (ready for integration)

### Files:
```
src/app/(admin)/admin/page.tsx
src/lib/api/adminApi.ts (analytics section)
```

### API Endpoints Used:
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/admin/analytics/dashboard` | Dashboard overview |
| GET | `/api/v1/admin/analytics/revenue` | Revenue chart |
| GET | `/api/v1/admin/analytics/users/growth` | User growth |
| GET | `/api/v1/admin/analytics/payments/breakdown` | Payment breakdown |
| GET | `/api/v1/admin/analytics/memberships/breakdown` | Membership breakdown |
| GET | `/api/v1/admin/analytics/recent/audit-logs` | Recent audit logs |
| GET | `/api/v1/admin/analytics/recent/system-logs` | Recent system logs |

### Client Questions:
- [ ] **Q1**: What time periods should charts support? (7d, 30d, 90d, 1y?)
- [ ] **Q2**: Do you want real-time dashboard updates (WebSocket)?
- [ ] **Q3**: Should analytics be exportable as PDF reports?
- [ ] **Q4**: Do you want email reports (daily/weekly/monthly)?
- [ ] **Q5**: Should there be custom date range selection?
- [ ] **Q6**: Do you want to integrate a charting library (Chart.js, Recharts)?

---

## ✅ Module 10: Admin - Memberships

### Status: COMPLETED

### Features Implemented:
- [x] Subscription list with search/filter
- [x] Statistics cards (total, active, expired, revenue)
- [x] Paginated subscription table
- [x] Filter by status (Active, Expired, Cancelled, Pending)
- [x] Filter by plan
- [x] User info display with avatar
- [x] Days remaining indicator with color coding
- [x] Grant subscription modal (gift to user)
- [x] Plan selection dropdown

### Files:
```
src/app/(admin)/admin/memberships/page.tsx
src/lib/api/adminApi.ts (membership section)
```

### API Endpoints Used:
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/admin/membership/subscriptions` | List all subscriptions |
| GET | `/api/v1/admin/membership/statistics` | Subscription stats |
| POST | `/api/v1/admin/membership/grant` | Grant subscription to user |

### Client Questions:
- [ ] **Q1**: Should admins be able to extend existing subscriptions?
- [ ] **Q2**: Do you want to cancel subscriptions from admin panel?
- [ ] **Q3**: Should there be subscription history per user?
- [ ] **Q4**: Do you want email notifications when subscription is granted?
- [ ] **Q5**: Should admins be able to modify plan prices from here?

---

## ✅ Module 11: Admin - API Keys

### Status: COMPLETED

### Features Implemented:
- [x] API keys list with search/filter
- [x] Statistics cards (total, active, revoked, usage today)
- [x] Paginated API keys table
- [x] Filter by status (Active, Revoked)
- [x] User info display
- [x] Key prefix display (masked)
- [x] Usage count and last used time
- [x] Revoke key with reason modal
- [x] Warning before revoke action

### Files:
```
src/app/(admin)/admin/api-keys/page.tsx
src/lib/api/adminApi.ts (api-keys section)
```

### API Endpoints Used:
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/admin/api-keys` | List all API keys |
| GET | `/api/v1/admin/api-keys/statistics` | API key stats |
| DELETE | `/api/v1/admin/api-keys/:id` | Revoke any API key |

### Client Questions:
- [ ] **Q1**: Should admins be able to create API keys for users?
- [ ] **Q2**: Do you want to see API usage logs per key?
- [ ] **Q3**: Should there be rate limit configuration per key?
- [ ] **Q4**: Do you want email notifications when key is revoked?
- [ ] **Q5**: Should admins be able to temporarily disable keys (not revoke)?

---

## 🎨 Shared Components

### Created:
- [x] `DashboardShell` - Shared sidebar + header layout
- [x] `RouteGuard` - Authentication protection
- [x] `Button` - Primary button component
- [x] `Input` - Form input with validation
- [x] `Alert` - Success/Error/Warning alerts
- [x] `Badge` - Status badges
- [x] `Divider` - Section dividers
- [x] `Checkbox` - Form checkboxes

### Pending:
- [ ] `Modal` - Reusable modal component
- [ ] `Table` - Data table with sorting
- [ ] `Dropdown` - Select dropdown
- [ ] `Tabs` - Tab navigation
- [ ] `Toast` - Toast notifications
- [ ] `Chart` - Chart components (for analytics)
- [ ] `DatePicker` - Date selection
- [ ] `Pagination` - Reusable pagination

---

## 📝 Design Guidelines Reference

All pages follow the design guidelines in:
`sms-api-app/system-docs/design-guidelines.md`

Key spacing:
- Section margin: 32px
- Card padding: 24px
- Form field gap: 20px
- Button height: 48px (lg), 40px (md), 36px (sm)

---

## 🔧 Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

---

## 📞 Contact for Questions

All questions marked with `[ ]` above need client input before implementation.

---

*Last Updated: February 16, 2026*

