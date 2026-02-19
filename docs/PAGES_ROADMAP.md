# Frontend Pages Roadmap

> All pages required per CLIENT_DECISIONS.md + client requirement docs.
> Reference site: CheapStreamTV.com (admin panel), sms-man.com / 5sim.net (product flow)

---

## Page Inventory

### Auth Pages (5 built, 3 need updates)

| # | Page | Route | Status | Updates Needed |
|---|------|-------|--------|----------------|
| 1 | Login | `/login` | Done | Add Telegram + Twitter/X buttons, remove Facebook, add guest login option |
| 2 | Register | `/register` | Done | Password min 10 chars, add guest mode, add Telegram/Twitter/X |
| 3 | Forgot Password | `/forgot-password` | UI Only | Wire to backend email reset flow |
| 4 | Reset Password | `/reset-password` | UI Only | Wire to backend |
| 5 | Verify Email | `/verify-email` | UI Only | Wire to backend OTP verification |

### Dashboard Pages (8 built, updates needed)

| # | Page | Route | Status | Updates Needed |
|---|------|-------|--------|----------------|
| 6 | Dashboard | `/dashboard` | Done | Real data instead of hardcoded stats, add quick-access widgets |
| 7 | Wallet | `/wallet` | Done | Multi-currency display toggle, export functionality |
| 8 | Deposit | `/wallet/deposit` | Done | Multi-gateway selection (7 gateways), amount limits $2-$100k |
| 9 | Deposit Success | `/wallet/deposit/success` | Done | Minor: show gateway-specific confirmation |
| 10 | Deposit Cancel | `/wallet/deposit/cancel` | Done | OK |
| 11 | Pricing | `/pricing` | Done | Add Free tier, annual toggle, active number limits in comparison |
| 12 | Settings | `/settings` | Done | Add 2FA section, notification prefs, email change flow |
| 13 | API Keys | `/settings/api-keys` | Done | Max 3 keys, bshq_ prefix display, scopes UI, IP whitelist, expiration |

### Admin Pages (5 built, many needed)

| # | Page | Route | Status | Updates Needed |
|---|------|-------|--------|----------------|
| 14 | Admin Dashboard | `/admin` | Done | More widgets, charts, real-time data |
| 15 | Admin Users | `/admin/users` | Done | 6-role system, bulk actions |
| 16 | Admin User Detail | `/admin/users/[id]` | Done | Role permissions view, activity log |
| 17 | Admin Wallets | `/admin/wallets` | Done | Multi-currency support |
| 18 | Admin Wallet Detail | `/admin/wallets/[userId]` | Done | OK |
| 19 | Admin Memberships | `/admin/memberships` | Done | Plan editing, active number config |
| 20 | Admin API Keys | `/admin/api-keys` | Done | Scope viewing, IP whitelist display |

---

## Pages to Build

### Public/Marketing Pages (Priority: HIGH for SEO)

| # | Page | Route | Description |
|---|------|-------|-------------|
| 21 | Landing | `/` | Hero section, feature highlights, pricing preview, trust signals, CTA |
| 22 | Home | `/home` | Product overview for logged-out users, service preview |
| 23 | Features | `/features` | Detailed feature breakdown with visuals |
| 24 | About Us | `/about` | Company info, mission, team |
| 25 | Contact Us | `/contact` | Contact form, email, social links |
| 26 | Customer Reviews | `/reviews` | User reviews display (TrustPilot-style) |

### Product Pages (Priority: CRITICAL — core product)

| # | Page | Route | Description |
|---|------|-------|-------------|
| 27 | **Receive SMS (Activation)** | `/activate` | Main product page: select provider (V1/V2), country, service → buy number → receive SMS code. Filters: cheapest, popular, available. Favorites. "Only Show Available Now" toggle |
| 28 | **Rent Numbers** | `/rent` | Rent phone numbers (sms-man). Select country/duration. Receive multiple SMS during rental. Extend/cancel |
| 29 | **Order History** | `/orders` | User's SMS orders list. Status tracking. Refund requests |
| 30 | **Order Detail** | `/orders/[id]` | Single order: phone number, SMS code, provider, cost, status, timeline |

### API & Developer Pages

| # | Page | Route | Description |
|---|------|-------|-------------|
| 31 | API Documentation | `/api-docs` | Public API docs. Endpoints, auth, examples. Interactive playground |
| 32 | API Connections | `/api-connections` | Overview of API system, getting started guide |

### Content Pages

| # | Page | Route | Description |
|---|------|-------|-------------|
| 33 | Blog | `/blog` | Blog post list with pagination, categories |
| 34 | Blog Post | `/blog/[slug]` | Single blog post with SEO meta |
| 35 | Help | `/help` | Help center with search, categories |
| 36 | Knowledge Base | `/knowledge-base` | Articles organized by topic |
| 37 | KB Article | `/knowledge-base/[slug]` | Single KB article |
| 38 | FAQ | `/faq` | Accordion FAQ sections |

### User Feature Pages

| # | Page | Route | Description |
|---|------|-------|-------------|
| 39 | Referral Program | `/referral` | Referral dashboard, invite link, earnings, payout history |
| 40 | Favorites | `/favorites` | User's favorited services (V1 + V2) |
| 41 | Notifications | `/notifications` | User notification center |

### Legal Pages

| # | Page | Route | Description |
|---|------|-------|-------------|
| 42 | Privacy Policy | `/privacy` | Privacy policy (admin-editable content) |
| 43 | Terms of Use | `/terms` | Terms of service |
| 44 | Payment & Refund | `/payment-policy` | Payment and refund policy |
| 45 | Legal Disclaimer | `/disclaimer` | Legal disclaimer |

### Utility Pages

| # | Page | Route | Description |
|---|------|-------|-------------|
| 46 | 404 | `/not-found` | Custom 404 with navigation links |
| 47 | Payment Status | `/payment/status` | Payment confirmation/failure page |
| 48 | Status Page | `/status` | Provider uptime status, system health |

### Admin Pages to Build

| # | Page | Route | Description |
|---|------|-------|-------------|
| 49 | Admin Payments | `/admin/payments` | Payment list, detail, refund controls, gateway stats |
| 50 | Admin Payment Detail | `/admin/payments/[id]` | Single payment detail, gateway info, refund action |
| 51 | Admin SMS Providers | `/admin/providers` | Provider management: CRUD, priority (drag & drop), enable/disable |
| 52 | Admin Provider Detail | `/admin/providers/[id]` | Provider config: services, markup, display name |
| 53 | Admin Services | `/admin/services` | Service list: enable/disable, price overrides, icons, categories |
| 54 | Admin Orders | `/admin/orders` | SMS order list, status, refunds |
| 55 | Admin Abuse Control | `/admin/abuse` | Abuse dashboard: flagged users, score distribution, blocked entities |
| 56 | Admin Settings | `/admin/settings` | General site settings, SMTP config, login method toggles |
| 57 | Admin SEO | `/admin/seo` | Per-page meta tags, sitemap config, OG tags |
| 58 | Admin Blog | `/admin/blog` | Blog CRUD (create/edit/delete/publish posts) |
| 59 | Admin Reviews | `/admin/reviews` | Review moderation (approve/reject/feature) |
| 60 | Admin Coupons | `/admin/coupons` | Coupon CRUD (codes, discounts, limits, expiry) |
| 61 | Admin Affiliates | `/admin/affiliates` | Affiliate management, payouts, performance |
| 62 | Admin Notifications | `/admin/notifications` | Email templates, alert config, notification log |
| 63 | Admin Addons | `/admin/addons` | Integration toggles (LiveChatAI, TrustPilot, GA, Clarity, etc.) |
| 64 | Admin Roles | `/admin/roles` | Role management: 6 roles with CRUD permission toggles |
| 65 | Admin Logs | `/admin/logs` | Audit logs + system logs viewer with filters |

---

## Build Order (Recommended)

### Sprint 1: Fix Existing Pages
1. Update login/register (remove Facebook, add Telegram/Twitter/X, guest login)
2. Wire forgot-password/reset-password/verify-email to backend
3. Update deposit page (multi-gateway, $2-$100k limits)
4. Update pricing page (Free tier, annual toggle, active numbers)
5. Update API keys page (bshq_ prefix, max 3, scopes)

### Sprint 2: Core Product Pages (CRITICAL)
1. **Receive SMS (Activation)** page — the main product
2. **Rent Numbers** page
3. Order History + Order Detail pages
4. Favorites page

### Sprint 3: Admin Expansion
1. Admin Providers + Provider Detail
2. Admin Services
3. Admin Orders
4. Admin Payments + Payment Detail
5. Admin Settings (general + SMTP)
6. Admin Abuse Control

### Sprint 4: Public/Marketing Pages
1. Landing page
2. Features page
3. About Us, Contact Us
4. Blog + Blog Post
5. FAQ, Help, Knowledge Base
6. Customer Reviews

### Sprint 5: Legal + Utility
1. Privacy Policy, Terms, Payment Policy, Disclaimer
2. 404 page
3. Payment Status page
4. Status Page

### Sprint 6: Advanced Features
1. Referral Program page
2. API Documentation page
3. Notifications
4. Admin: SEO, Blog, Reviews, Coupons, Affiliates, Roles, Logs, Addons

---

## Total Page Count

| Category | Built | To Build | Total |
|----------|-------|----------|-------|
| Auth | 5 | 0 (updates only) | 5 |
| Dashboard | 8 | 4 | 12 |
| Admin | 5 | 17 | 22 |
| Public/Marketing | 0 | 6 | 6 |
| Product (SMS) | 0 | 4 | 4 |
| Content | 0 | 6 | 6 |
| Legal | 0 | 4 | 4 |
| Utility | 0 | 3 | 3 |
| User Features | 0 | 3 | 3 |
| **Total** | **18** | **47** | **65** |

---

*Reference: CLIENT_DECISIONS.md for all requirements.*
