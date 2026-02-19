# Design System Reference

> Based on globals.css and CLIENT_DECISIONS.md
> Dark + Gold (premium) | Light + Blue (clean)
> Fonts: Satoshi, Montserrat

---

## Theme Modes

### Dark Mode (Default — Premium)
Gold accent on dark backgrounds. Luxury feel.

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#0E0E0E` | Page background |
| `--bg-secondary` | `#121212` | Section background |
| `--bg-card` | `#1B1B1B` | Card background |
| `--bg-elevated` | `#242424` | Elevated surfaces (modals, dropdowns) |
| `--bg-hover` | `#2A2A2A` | Hover states |
| `--accent-gold` | `#C6A75E` | Primary accent (buttons, links, focus) |
| `--accent-gold-bright` | `#D4AF37` | Bright gold (CTAs, highlights) |
| `--accent-gold-muted` | `#A08A4B` | Muted gold (secondary actions) |
| `--text-primary` | `#FFFFFF` | Main text |
| `--text-secondary` | `#A1A1AA` | Supporting text |
| `--text-muted` | `#71717A` | Tertiary text |
| `--text-disabled` | `#52525B` | Disabled text |
| `--border-default` | `#27272A` | Default borders |
| `--border-hover` | `#3F3F46` | Hover borders |
| `--border-focus` | `#C6A75E` | Focus ring (gold) |

### Light Mode (`[data-theme="light"]`)
Blue accent on white backgrounds. Clean SaaS feel.

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#F8FAFC` | Page background |
| `--bg-secondary` | `#F1F5F9` | Section background |
| `--bg-card` | `#FFFFFF` | Card background |
| `--bg-elevated` | `#FFFFFF` | Elevated surfaces |
| `--bg-hover` | `#F1F5F9` | Hover states |
| `--accent-gold` | `#2563EB` | Primary accent (blue in light mode) |
| `--accent-gold-bright` | `#1D4ED8` | Bright blue |
| `--accent-gold-muted` | `#3B82F6` | Muted blue |
| `--text-primary` | `#0F172A` | Main text |
| `--text-secondary` | `#475569` | Supporting text |
| `--text-muted` | `#64748B` | Tertiary text |
| `--text-disabled` | `#94A3B8` | Disabled text |
| `--border-default` | `#E2E8F0` | Default borders |
| `--border-hover` | `#CBD5E1` | Hover borders |
| `--border-focus` | `#2563EB` | Focus ring (blue) |

**Note:** The CSS variable names stay the same (`--accent-gold`), but in light mode the value is blue. This allows all components to use the same class names regardless of theme.

---

## Semantic Colors (Same in both themes)

| Token | Value | Usage |
|-------|-------|-------|
| `--success` | `#10B981` | Success states (green) |
| `--success-muted` | `#059669` | Success background |
| `--danger` | `#EF4444` | Error/danger states (red) |
| `--danger-muted` | `#DC2626` | Danger background |
| `--warning` | `#F59E0B` | Warning states (amber) |
| `--info` | `#3B82F6` | Info states (blue) |

---

## Typography

### Fonts
- **Primary:** Satoshi (headings + body)
- **Fallbacks:** Inter, system-ui, sans-serif
- **Secondary:** Montserrat (feature text, marketing pages)
- CSS: `font-family: 'Satoshi', 'Inter', system-ui, sans-serif`

### Scale
| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|----------------|
| h1 | 48px (3rem) | 700 | 1.1 | -0.02em |
| h2 | 36px (2.25rem) | 600 | 1.2 | -0.01em |
| h3 | 30px (1.875rem) | 600 | 1.25 | -0.01em |
| h4 | 24px (1.5rem) | 600 | 1.3 | — |
| h5 | 20px (1.25rem) | 500 | 1.4 | — |
| h6 | 18px (1.125rem) | 500 | 1.4 | — |
| body | 16px (1rem) | 400 | 1.5 | — |

---

## Spacing (8px base grid)

| Token | Value | Pixels |
|-------|-------|--------|
| `--space-1` | 0.25rem | 4px |
| `--space-2` | 0.5rem | 8px |
| `--space-3` | 0.75rem | 12px |
| `--space-4` | 1rem | 16px |
| `--space-5` | 1.25rem | 20px |
| `--space-6` | 1.5rem | 24px |
| `--space-8` | 2rem | 32px |
| `--space-10` | 2.5rem | 40px |
| `--space-12` | 3rem | 48px |
| `--space-16` | 4rem | 64px |
| `--space-20` | 5rem | 80px |

### Common Spacing Patterns
- Section margin: 32px (`--space-8`)
- Card padding: 24px (`--space-6`)
- Form field gap: 20px (`--space-5`)
- Inline element gap: 8-12px (`--space-2` to `--space-3`)

---

## Border Radius

| Token | Value |
|-------|-------|
| `--radius-sm` | 8px |
| `--radius-md` | 12px |
| `--radius-lg` | 16px |
| `--radius-xl` | 20px |

---

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-xs` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle elevation |
| `--shadow-sm` | `0 2px 4px rgba(0,0,0,0.06)` | Cards |
| `--shadow-md` | `0 4px 8px rgba(0,0,0,0.08)` | Dropdowns |
| `--shadow-lg` | `0 8px 16px rgba(0,0,0,0.1)` | Modals |
| `--shadow-xl` | `0 16px 32px rgba(0,0,0,0.12)` | Popovers |
| `--shadow-2xl` | `0 24px 48px rgba(0,0,0,0.16)` | Full-screen overlays |
| `--shadow-gold` | `0 4px 14px rgba(198,167,94,0.25)` | Gold accent shadow |
| `--shadow-gold-lg` | `0 8px 24px rgba(198,167,94,0.35)` | Gold CTA shadow |

---

## Transitions

| Token | Value |
|-------|-------|
| `--ease-default` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| `--ease-bounce` | `cubic-bezier(0.68, -0.55, 0.265, 1.55)` |
| `--duration-fast` | 150ms |
| `--duration-default` | 200ms |
| `--duration-slow` | 300ms |

---

## Animations

| Class | Animation | Duration |
|-------|-----------|----------|
| `.animate-fade-in` | Opacity 0→1 | 300ms |
| `.animate-slide-up` | Translate Y 20px→0 + fade | 500ms |
| `.animate-spin` | Rotation 360deg | 800ms (infinite) |
| `.animate-pulse` | Opacity 1→0.5→1 | 2s (infinite) |
| `.skeleton` | Shimmer gradient | 1.5s (infinite) |
| `.stagger-children > *` | Staggered slide-up (100ms delay per child) | 500ms each |

---

## Existing UI Components

| Component | File | Props |
|-----------|------|-------|
| Button | `components/ui/Button.tsx` | variant, size, disabled, loading |
| Input | `components/ui/Input.tsx` | label, error, type, validation |
| Alert | `components/ui/Alert.tsx` | type (success/error/warning/info), message |
| Badge | `components/ui/Badge.tsx` | variant, color |
| Card | `components/ui/Card.tsx` | padding, hover |
| Checkbox | `components/ui/Checkbox.tsx` | checked, label |
| Divider | `components/ui/Divider.tsx` | — |

### Button Sizes
- Large: 48px height
- Medium: 40px height
- Small: 36px height

---

## Provider Visual Distinction

Used for differentiating SMS providers in the UI:

| Class | Badge BG | Badge Text | Provider |
|-------|----------|------------|----------|
| `.provider-v1` | `#1E3A5F` | `#60A5FA` | Standard Activation V1 (5sim) |
| `.provider-v2` | `#3D2E0A` | `#D4AF37` | Premium Activation V2 (sms-man) |

**TODO:** Add `.provider-v3` for hero-sms (Backup).

---

## Utility Classes

| Class | Purpose |
|-------|---------|
| `.text-gold-gradient` | Gold gradient text (headings, CTAs) |
| `.bg-gold-gradient` | Gold gradient background (buttons) |
| `.shadow-gold` | Gold glow shadow |
| `.shadow-gold-lg` | Large gold glow |
| `.container` | Max-width 1280px, responsive padding |

---

## Responsive Breakpoints (Tailwind v4 defaults)

| Breakpoint | Width | Usage |
|------------|-------|-------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Wide desktop |
| `2xl` | 1536px | Ultra-wide |

Container padding:
- Mobile: 24px (`--space-6`)
- Tablet (768px+): 32px (`--space-8`)
- Desktop (1024px+): 48px (`--space-12`)

---

## Theme Toggle (TODO)

Currently, CSS variables exist for both dark and light themes, but there is no UI toggle. Implementation plan:
1. Add theme state to `uiSlice.ts` (dark/light, persist to localStorage)
2. Create `ThemeToggle` component (sun/moon icon button)
3. Apply `data-theme="light"` attribute to `<html>` element
4. Place toggle in header/sidebar
5. Respect system preference on first visit (`prefers-color-scheme`)

---

*All new pages and components should follow these design tokens for consistency.*
