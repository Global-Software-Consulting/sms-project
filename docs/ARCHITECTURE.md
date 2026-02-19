# Frontend Architecture

> SMS Sort Frontend — Next.js 16 + React 19 + Redux Toolkit + Tailwind CSS v4
> Domain: bestsmshq.com

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.6 | Framework (App Router, SSR/SSG) |
| React | 19.2.3 | UI library |
| TypeScript | ^5 | Type safety |
| Tailwind CSS | v4 | Styling (with @tailwindcss/postcss) |
| Redux Toolkit | ^2.11.2 | Global state management |
| Axios | ^1.13.5 | HTTP client with interceptors |
| NextAuth | ^5.0.0-beta.30 | OAuth (Google, GitHub) |
| Zod | ^4.3.6 | Schema validation |
| Lucide React | ^0.563.0 | Icons |
| bcryptjs | ^3.0.3 | Client-side hashing (if needed) |

---

## Directory Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout (fonts, providers, globals.css)
│   ├── page.tsx                  # Root page (redirect to dashboard or landing)
│   ├── globals.css               # Design system CSS variables + base styles
│   ├── api/auth/[...nextauth]/   # NextAuth API route
│   │   └── route.ts
│   ├── auth/callback/            # OAuth callback handler
│   │   └── page.tsx
│   ├── (auth)/                   # Auth route group (no sidebar)
│   │   ├── layout.tsx            # Auth layout (centered card)
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   ├── reset-password/page.tsx
│   │   └── verify-email/page.tsx
│   ├── (dashboard)/              # Dashboard route group (with sidebar)
│   │   ├── layout.tsx            # Dashboard layout (DashboardShell)
│   │   ├── dashboard/page.tsx
│   │   ├── wallet/page.tsx
│   │   ├── wallet/deposit/page.tsx
│   │   ├── wallet/deposit/success/page.tsx
│   │   ├── wallet/deposit/cancel/page.tsx
│   │   ├── pricing/page.tsx
│   │   ├── settings/page.tsx
│   │   └── settings/api-keys/page.tsx
│   └── (admin)/                  # Admin route group (admin sidebar)
│       ├── layout.tsx            # Admin layout
│       └── admin/
│           ├── page.tsx          # Admin dashboard
│           ├── users/page.tsx
│           ├── users/[id]/page.tsx
│           ├── wallets/page.tsx
│           ├── wallets/[userId]/page.tsx
│           ├── memberships/page.tsx
│           └── api-keys/page.tsx
├── components/
│   ├── ui/                       # Reusable UI components
│   │   ├── Alert.tsx
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Checkbox.tsx
│   │   ├── Divider.tsx
│   │   ├── Input.tsx
│   │   └── index.ts
│   ├── auth/
│   │   ├── AuthLayout.tsx        # Centered auth card layout
│   │   ├── SocialButtons.tsx     # OAuth login buttons
│   │   └── RouteGuard.tsx        # Auth + role protection
│   ├── providers/
│   │   ├── StoreProvider.tsx     # Redux store provider
│   │   ├── AuthInitializer.tsx   # Auto-restore auth from tokens
│   │   └── SessionProvider.tsx   # NextAuth session provider
│   └── layout/
│       ├── DashboardShell.tsx    # Sidebar + header + content layout
│       └── index.ts
├── lib/
│   ├── auth.ts                   # NextAuth config
│   ├── api/
│   │   ├── config.ts             # Axios instance + interceptors (auto token refresh)
│   │   ├── tokenStorage.ts       # Access/refresh token localStorage helpers
│   │   ├── authApi.ts            # Login, register, refresh, OAuth
│   │   ├── usersApi.ts           # Profile CRUD
│   │   ├── walletApi.ts          # Wallet + transactions
│   │   ├── paymentsApi.ts        # Payment creation + history
│   │   ├── membershipApi.ts      # Plans + subscriptions
│   │   ├── apiKeysApi.ts         # API key management
│   │   ├── adminApi.ts           # All admin endpoints
│   │   └── index.ts
│   └── store/
│       ├── index.ts              # Redux store config
│       ├── hooks.ts              # Typed useAppDispatch + useAppSelector
│       └── slices/
│           ├── authSlice.ts      # Auth state (user, tokens, loading)
│           └── uiSlice.ts        # UI state (sidebar, theme, modals)
└── hooks/
    ├── useAuth.ts                # Auth convenience hook
    └── index.ts
```

---

## Key Patterns

### Route Groups
- `(auth)` — No sidebar, centered auth card layout
- `(dashboard)` — Full sidebar + header via DashboardShell
- `(admin)` — Admin sidebar layout, requires SUPER_ADMIN role

### Authentication Flow
1. User logs in → backend returns access + refresh tokens
2. Tokens stored in localStorage via `tokenStorage.ts`
3. Axios interceptor attaches access token to all API requests
4. On 401 → interceptor auto-refreshes using refresh token
5. If refresh fails → redirect to login
6. `RouteGuard` component protects routes based on auth state and role

### State Management
- **Redux Toolkit** for global state (auth, UI)
- **Local state** (useState) for page-specific state (forms, filters, modals)
- **API calls** via Axios (not RTK Query) — API functions in `lib/api/`

### Styling Approach
- **CSS Custom Properties** defined in `globals.css` for theming
- **Tailwind v4** with `@theme inline` to expose CSS vars as Tailwind utilities
- Dark mode = default (`:root`), Light mode via `[data-theme="light"]`
- Custom classes: `.text-gold-gradient`, `.bg-gold-gradient`, `.skeleton`, `.animate-*`
- Provider distinction: `.provider-v1` (blue), `.provider-v2` (gold)

### API Layer
- All API calls go through `lib/api/config.ts` Axios instance
- Base URL: `process.env.NEXT_PUBLIC_API_URL` (default: `http://localhost:3000/api/v1`)
- Interceptors handle: auth headers, token refresh, error formatting
- Each domain has its own API file (authApi, walletApi, etc.)

---

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=<secret>
GOOGLE_CLIENT_ID=<id>
GOOGLE_CLIENT_SECRET=<secret>
GITHUB_CLIENT_ID=<id>
GITHUB_CLIENT_SECRET=<secret>
```

**TODO (per CLIENT_DECISIONS.md):**
- Add Telegram OAuth env vars
- Add Twitter/X OAuth env vars
- Remove Facebook OAuth env vars
- Add LiveChatAI, TrustPilot, GA, Clarity script IDs

---

## What's Missing (per CLIENT_DECISIONS.md)

### Components to Build
- [ ] Modal component (reusable)
- [ ] DataTable component (sorting, pagination, search)
- [ ] Dropdown/Select component
- [ ] Tabs component
- [ ] Toast/notification system
- [ ] Chart components (Recharts or Chart.js)
- [ ] DatePicker component
- [ ] ThemeToggle component (dark/light switch)
- [ ] ServiceCard component (for SMS activation)
- [ ] CountrySelector component
- [ ] ProviderBadge component (V1/V2/V3)
- [ ] ReviewCard component
- [ ] PriceDisplay component (multi-currency)

### API Files to Create
- [ ] `smsApi.ts` — SMS activation/rent endpoints
- [ ] `reviewsApi.ts` — Review submission/display
- [ ] `affiliateApi.ts` — Referral/affiliate endpoints
- [ ] `seoApi.ts` — SEO admin endpoints
- [ ] `notificationsApi.ts` — Notification endpoints

### Store Slices to Create
- [ ] `smsSlice.ts` — SMS state (selected provider, service, country, cart)
- [ ] `notificationSlice.ts` — Toast/alert state

---

*See PAGES_ROADMAP.md for the full page build plan.*
*See DESIGN_SYSTEM.md for color, typography, and spacing reference.*
