# Frontend Pages Roadmap

> All pages required per CLIENT_DECISIONS.md + client requirement docs.
> Reference site: CheapStreamTV.com (admin panel), sms-man.com / 5sim.net (product flow)
> Last Updated: February 26, 2026

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

### Admin Pages (7 built, many needed)

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

## Public/Marketing Pages - ✅ PHASE 4 COMPLETE

> Location: `src/app/(public)/`
> Components: `src/components/layout/PublicHeader.tsx`, `PublicFooter.tsx`

### Implemented ✅

| # | Page | Route | Status | Description |
|---|------|-------|--------|-------------|
| 21 | Landing | `/` | ✅ Done | Hero, features, pricing preview, testimonials, CTA |
| 22 | Features | `/features` | ✅ Done | Detailed feature breakdown with visuals |
| 23 | About Us | `/about` | ✅ Done | Company info, values, timeline, mission |
| 24 | Contact Us | `/contact` | ✅ Done | Contact form, support info, quick links |
| 25 | FAQ | `/faq` | ✅ Done | Searchable accordion FAQ by category |
| 26 | Pricing (Public) | `/pricing-public` | ✅ Done | Public pricing with plan comparison |
| 27 | Privacy Policy | `/privacy` | ✅ Done | Full privacy policy document |
| 28 | Terms of Use | `/terms` | ✅ Done | Full terms of service document |
| 29 | Status Page | `/status` | ✅ Done | System status, incidents, uptime stats |
| 30 | Blog List | `/blog` | ✅ Done | Paginated posts with categories, search |
| 31 | Blog Post | `/blog/[slug]` | ✅ Done | Single post with sharing, related articles |
| 32 | 404 Page | `not-found.tsx` | ✅ Done | Custom 404 with navigation links |

### Pending (Require Other Phases)

| # | Page | Route | Dependency | Description |
|---|------|-------|------------|-------------|
| 33 | Customer Reviews | `/reviews` | Phase 7 | User reviews display (TrustPilot-style) |
| 34 | Help Center | `/help` | Content | Help center with search, categories |
| 35 | Knowledge Base | `/knowledge-base` | Content | Articles organized by topic |
| 36 | Payment & Refund | `/payment-policy` | Content | Payment and refund policy |
| 37 | Legal Disclaimer | `/disclaimer` | Content | Legal disclaimer |
| 38 | Payment Status | `/payment/status` | Integration | Payment confirmation/failure page |
| 39 | Referral Program | `/referral` | Phase 7 | Referral dashboard, invite link, earnings |

---

## Product Pages (Priority: CRITICAL — Backend API Ready ✅)

> Phase 2 backend is complete (32 API endpoints). These pages can now be built.

| # | Page | Route | Status | Backend API | Description |
|---|------|-------|--------|-------------|-------------|
| 40 | **Receive SMS (Activation)** | `/activate` | ⏳ Pending | ✅ Ready | Main product page: select provider, country, service → buy number → receive SMS |
| 41 | **Rent Numbers** | `/rent` | ⏳ Pending | ✅ Ready | Rent phone numbers, select country/duration, receive multiple SMS |
| 42 | **Order History** | `/orders` | ⏳ Pending | ✅ Ready | User's SMS orders list, status tracking, refund requests |
| 43 | **Order Detail** | `/orders/[id]` | ⏳ Pending | ✅ Ready | Single order: phone number, SMS code, provider, cost, status |
| 44 | **Favorites** | `/favorites` | ⏳ Pending | ✅ Ready | User's favorited services (V1 + V2) |

---

## API & Developer Pages

| # | Page | Route | Status | Description |
|---|------|-------|--------|-------------|
| 45 | API Documentation | `/api-docs` | ⏳ Pending | Public API docs, endpoints, auth, examples |
| 46 | API Connections | `/api-connections` | ⏳ Pending | Overview of API system, getting started guide |

---

## User Feature Pages

| # | Page | Route | Status | Description |
|---|------|-------|--------|-------------|
| 47 | Notifications | `/notifications` | ⏳ Pending | User notification center |

---

## Admin Pages to Build (Phase 5)

### Core Admin Pages

| # | Page | Route | Priority | Description |
|---|------|-------|----------|-------------|
| 48 | Admin Payments | `/admin/payments` | HIGH | Payment list, detail, refund controls, gateway stats |
| 49 | Admin Payment Detail | `/admin/payments/[id]` | HIGH | Single payment detail, gateway info, refund action |
| 50 | Admin Abuse Control | `/admin/abuse` | MEDIUM | Abuse dashboard: flagged users, score distribution |
| 51 | Admin Settings | `/admin/settings` | MEDIUM | General site settings, SMTP config, login methods |

### SMS Admin Pages (Backend API Ready ✅)

| # | Page | Route | Priority | Backend API | Description |
|---|------|-------|----------|-------------|-------------|
| 52 | Admin SMS Providers | `/admin/providers` | HIGH | ✅ Ready | Provider CRUD, priority, balance, enable/disable |
| 53 | Admin Provider Detail | `/admin/providers/[id]` | HIGH | ✅ Ready | Provider config: services, markup, display name, sync |
| 54 | Admin Services | `/admin/services` | HIGH | ✅ Ready | Service list: enable/disable, bulk-disable, icons |
| 55 | Admin Orders | `/admin/orders` | HIGH | ✅ Ready | SMS order list, status, manual refunds |

### Content Admin Pages

| # | Page | Route | Priority | Description |
|---|------|-------|----------|-------------|
| 56 | Admin SEO | `/admin/seo` | MEDIUM | Per-page meta tags, sitemap config, OG tags |
| 57 | Admin Blog | `/admin/blog` | LOW | Blog CRUD (create/edit/delete/publish posts) |
| 58 | Admin Reviews | `/admin/reviews` | LOW | Review moderation (approve/reject/feature) |

### Business Admin Pages

| # | Page | Route | Priority | Description |
|---|------|-------|----------|-------------|
| 59 | Admin Coupons | `/admin/coupons` | LOW | Coupon CRUD (codes, discounts, limits, expiry) |
| 60 | Admin Affiliates | `/admin/affiliates` | LOW | Affiliate management, payouts, performance |
| 61 | Admin Notifications | `/admin/notifications` | LOW | Email templates, alert config, notification log |
| 62 | Admin Addons | `/admin/addons` | LOW | Integration toggles (LiveChatAI, TrustPilot, etc.) |
| 63 | Admin Roles | `/admin/roles` | LOW | Role management: 6 roles with CRUD permission toggles |
| 64 | Admin Logs | `/admin/logs` | LOW | Audit logs + system logs viewer with filters |

---

## Build Order (Updated)

### ✅ Sprint 4: Public/Marketing Pages - COMPLETE
1. ✅ Landing page
2. ✅ Features page
3. ✅ About Us, Contact Us
4. ✅ Blog + Blog Post
5. ✅ FAQ
6. ✅ Pricing (Public)
7. ✅ Privacy Policy, Terms of Use
8. ✅ 404 page
9. ✅ Status Page

### Sprint 1: Fix Existing Pages
1. Update login/register (remove Facebook, add Telegram/Twitter/X, guest login)
2. Wire forgot-password/reset-password/verify-email to backend
3. Update deposit page (multi-gateway, $2-$100k limits)
4. Update pricing page (Free tier, annual toggle, active numbers)
5. Update API keys page (bshq_ prefix, max 3, scopes)

### Sprint 2: Core Product Pages (CRITICAL - Requires Phase 2)
1. **Receive SMS (Activation)** page — the main product
2. **Rent Numbers** page
3. Order History + Order Detail pages
4. Favorites page

### Sprint 3: Admin Expansion (Phase 5)
1. Admin Payments + Payment Detail
2. Admin Settings (general + SMTP)
3. Admin Abuse Control
4. Admin Providers + Provider Detail (Phase 2)
5. Admin Services (Phase 2)
6. Admin Orders (Phase 2)

### Sprint 5: Remaining Content
1. Help Center, Knowledge Base
2. Payment & Refund Policy, Legal Disclaimer
3. Customer Reviews
4. Payment Status page

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
| Admin | 7 | 17 | 24 |
| Public/Marketing | **12** | 7 | 19 |
| Product (SMS) | 0 | 5 | 5 |
| API/Developer | 0 | 2 | 2 |
| User Features | 0 | 1 | 1 |
| **Total** | **32** | **36** | **68** |

---

## Components Created (Phase 4)

| Component | Location | Description |
|-----------|----------|-------------|
| `PublicHeader` | `components/layout/PublicHeader.tsx` | Responsive nav with dropdowns, mobile menu |
| `PublicFooter` | `components/layout/PublicFooter.tsx` | Links, newsletter, social icons |
| Public Layout | `app/(public)/layout.tsx` | Wrapper with header/footer |

---

*Reference: CLIENT_DECISIONS.md for all requirements.*
*See IMPLEMENTATION_ROADMAP.md for phase details.*
