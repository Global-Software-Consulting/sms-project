# SMS Activation Platform — Design Guidelines

> **Version:** 1.0  
> **Last Updated:** February 2026  
> **Purpose:** Comprehensive design implementation guide for developers

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Spacing & Layout System](#4-spacing--layout-system)
5. [Grid System](#5-grid-system)
6. [Component Specifications](#6-component-specifications)
7. [Page-Specific Guidelines](#7-page-specific-guidelines)
8. [Animation & Transitions](#8-animation--transitions)
9. [Responsive Breakpoints](#9-responsive-breakpoints)
10. [State Management UI](#10-state-management-ui)
11. [Iconography](#11-iconography)
12. [Shadows & Elevation](#12-shadows--elevation)
13. [Accessibility](#13-accessibility)

---

## 1. Design Philosophy

### Core Principles

| Principle | Description |
|-----------|-------------|
| **Premium** | Luxury feel with gold accents, refined typography, and polished interactions |
| **Professional** | Enterprise-grade appearance suitable for B2B and B2C |
| **Minimal** | No visual clutter; every element serves a purpose |
| **Trustworthy** | Security indicators, clear pricing, transparent UX |
| **Fast** | Optimized for 90+ PageSpeed score |
| **Organized** | Clear visual hierarchy and information architecture |

### Design DNA

```
┌─────────────────────────────────────────────────────────────┐
│  NOT a basic SMS reseller website                           │
│  THIS IS a premium SaaS product                             │
│                                                             │
│  Inspiration (function only, NOT design):                   │
│  • sms-man.com → Feature reference                          │
│  • 5sim.net → Flow reference                                │
│  • Stripe, Linear, Vercel → Modern SaaS aesthetic           │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Color System

### Dark Mode (Default — Premium Mode)

```css
:root[data-theme="dark"] {
  /* Backgrounds */
  --bg-primary: #0E0E0E;
  --bg-secondary: #121212;
  --bg-card: #1B1B1B;
  --bg-elevated: #242424;
  --bg-hover: #2A2A2A;
  
  /* Accent Colors */
  --accent-gold: #C6A75E;
  --accent-gold-bright: #D4AF37;
  --accent-gold-muted: #A08A4B;
  
  /* Semantic Colors */
  --success: #10B981;          /* Emerald */
  --success-muted: #059669;
  --danger: #EF4444;           /* Soft Red */
  --danger-muted: #DC2626;
  --warning: #F59E0B;
  --info: #3B82F6;
  
  /* Text Colors */
  --text-primary: #FFFFFF;
  --text-secondary: #A1A1AA;
  --text-muted: #71717A;
  --text-disabled: #52525B;
  
  /* Borders */
  --border-default: #27272A;
  --border-hover: #3F3F46;
  --border-focus: #C6A75E;
}
```

### Light Mode (Clean SaaS Mode)

```css
:root[data-theme="light"] {
  /* Backgrounds */
  --bg-primary: #F8FAFC;
  --bg-secondary: #F1F5F9;
  --bg-card: #FFFFFF;
  --bg-elevated: #FFFFFF;
  --bg-hover: #F1F5F9;
  
  /* Accent Colors */
  --accent-primary: #2563EB;   /* Royal Blue */
  --accent-primary-dark: #1D4ED8;
  --accent-primary-light: #3B82F6;
  
  /* Semantic Colors */
  --success: #10B981;
  --danger: #EF4444;
  --warning: #F59E0B;
  --info: #3B82F6;
  
  /* Text Colors */
  --text-primary: #0F172A;
  --text-secondary: #475569;
  --text-muted: #64748B;
  --text-disabled: #94A3B8;
  
  /* Borders */
  --border-default: #E2E8F0;
  --border-hover: #CBD5E1;
  --border-focus: #2563EB;
}
```

### Provider Visual Distinction

```css
/* V1 — Standard Activation (5sim) */
.provider-v1 {
  --provider-badge-bg: #1E3A5F;
  --provider-badge-text: #60A5FA;
  --provider-icon: "💰";
}

/* V2 — Premium Activation (sms-man) */
.provider-v2 {
  --provider-badge-bg: #3D2E0A;
  --provider-badge-text: #D4AF37;
  --provider-icon: "💎";
}
```

---

## 3. Typography

### Font Families

| Mode | Primary Font | Fallback |
|------|--------------|----------|
| Dark Mode | **Satoshi** | Inter, system-ui |
| Light Mode | **Montserrat** | Inter, system-ui |

### Type Scale

```css
/* Base: 16px */

--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */
--text-5xl: 3rem;        /* 48px */
--text-6xl: 3.75rem;     /* 60px */
```

### Font Weights

```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Line Heights

```css
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;
```

### Typography Hierarchy

| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|----------------|
| H1 | 48px / 60px | Bold | 1.1 | -0.02em |
| H2 | 36px | Semibold | 1.2 | -0.01em |
| H3 | 30px | Semibold | 1.25 | -0.01em |
| H4 | 24px | Semibold | 1.3 | 0 |
| H5 | 20px | Medium | 1.4 | 0 |
| H6 | 18px | Medium | 1.4 | 0 |
| Body Large | 18px | Normal | 1.6 | 0 |
| Body | 16px | Normal | 1.5 | 0 |
| Body Small | 14px | Normal | 1.5 | 0 |
| Caption | 12px | Normal | 1.4 | 0.01em |
| Overline | 12px | Semibold | 1.4 | 0.1em |

---

## 4. Spacing & Layout System

### Base Unit: 8px Grid

All spacing values are multiples of 8px for consistency.

```css
--space-0: 0;
--space-1: 0.25rem;    /* 4px  — micro spacing */
--space-2: 0.5rem;     /* 8px  — tight spacing */
--space-3: 0.75rem;    /* 12px */
--space-4: 1rem;       /* 16px — default spacing */
--space-5: 1.25rem;    /* 20px */
--space-6: 1.5rem;     /* 24px — component spacing */
--space-8: 2rem;       /* 32px — section spacing */
--space-10: 2.5rem;    /* 40px */
--space-12: 3rem;      /* 48px — large section spacing */
--space-16: 4rem;      /* 64px */
--space-20: 5rem;      /* 80px — page section spacing */
--space-24: 6rem;      /* 96px */
--space-32: 8rem;      /* 128px — hero spacing */
```

### Component Internal Spacing

| Component Type | Padding | Gap Between Elements |
|----------------|---------|---------------------|
| **Buttons** | 12px 24px (default) | — |
| **Button Small** | 8px 16px | — |
| **Button Large** | 16px 32px | — |
| **Cards** | 24px | 16px |
| **Card Compact** | 16px | 12px |
| **Modal** | 32px | 24px |
| **Form Fields** | 12px 16px | — |
| **Dropdown Items** | 12px 16px | 4px |
| **Table Cells** | 16px | — |
| **Sidebar Items** | 12px 16px | 4px |
| **Navbar** | 16px 24px | 32px |

### Section Breathing Space

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  HERO SECTION                                               │
│  Padding: 80px (top) / 64px (bottom)                        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                        ↕ 64px gap                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  FEATURE SECTION                                            │
│  Padding: 64px (vertical)                                   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                        ↕ 64px gap                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  CONTENT SECTION                                            │
│  Padding: 48px (vertical)                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Page Section Spacing Guide

| Section Type | Top Padding | Bottom Padding | Internal Gap |
|--------------|-------------|----------------|--------------|
| **Hero** | 80px | 64px | 32px |
| **Primary Feature** | 64px | 64px | 48px |
| **Secondary Feature** | 48px | 48px | 32px |
| **Content Block** | 48px | 48px | 24px |
| **CTA Section** | 64px | 64px | 24px |
| **Footer** | 48px | 32px | 32px |
| **Dashboard Section** | 24px | 24px | 16px |

### Margin Guidelines

```css
/* Between major page sections */
.section + .section {
  margin-top: var(--space-16); /* 64px */
}

/* Between cards in a grid */
.card-grid {
  gap: var(--space-6); /* 24px */
}

/* Between form elements */
.form-group + .form-group {
  margin-top: var(--space-5); /* 20px */
}

/* Between paragraphs */
p + p {
  margin-top: var(--space-4); /* 16px */
}

/* Between list items */
li + li {
  margin-top: var(--space-2); /* 8px */
}
```

---

## 5. Grid System

### Container

```css
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}

@media (min-width: 768px) {
  .container {
    padding: 0 32px;
  }
}

@media (min-width: 1024px) {
  .container {
    padding: 0 48px;
  }
}
```

### 12-Column Grid

```css
.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
}

/* Column spans */
.col-1  { grid-column: span 1; }
.col-2  { grid-column: span 2; }
.col-3  { grid-column: span 3; }  /* 25% */
.col-4  { grid-column: span 4; }  /* 33.33% */
.col-6  { grid-column: span 6; }  /* 50% */
.col-8  { grid-column: span 8; }  /* 66.67% */
.col-9  { grid-column: span 9; }  /* 75% */
.col-12 { grid-column: span 12; } /* 100% */
```

### Common Layout Patterns

```
┌─────────────────────────────────────────────────────────────┐
│ DASHBOARD LAYOUT                                            │
├──────────┬──────────────────────────────────────────────────┤
│          │                                                  │
│ SIDEBAR  │  MAIN CONTENT                                    │
│ 240px    │  flex: 1                                         │
│ fixed    │                                                  │
│          │                                                  │
└──────────┴──────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ LANDING PAGE                                                │
├─────────────────────────────────────────────────────────────┤
│                      NAVBAR (fixed)                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                      HERO (full width)                      │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                      CONTENT (contained)                    │
│                      max-width: 1280px                      │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                      FOOTER                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Component Specifications

### 6.1 Buttons

#### Sizes

| Size | Height | Padding | Font Size | Border Radius |
|------|--------|---------|-----------|---------------|
| Small | 32px | 8px 16px | 14px | 8px |
| Default | 40px | 12px 24px | 16px | 12px |
| Large | 48px | 16px 32px | 18px | 16px |

#### Variants

```css
/* Primary Button (Dark Mode) */
.btn-primary {
  background: linear-gradient(135deg, #C6A75E 0%, #D4AF37 100%);
  color: #0E0E0E;
  font-weight: 600;
  border: none;
  box-shadow: 0 4px 14px rgba(198, 167, 94, 0.25);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #D4AF37 0%, #E5C158 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(198, 167, 94, 0.35);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-default);
}

.btn-secondary:hover {
  background: var(--bg-hover);
  border-color: var(--border-hover);
}

/* Ghost Button */
.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border: none;
}

.btn-ghost:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}
```

#### Button Spacing in Groups

```css
.btn-group {
  display: flex;
  gap: 12px; /* Between buttons */
}

.btn-group-stacked {
  flex-direction: column;
  gap: 8px;
}
```

### 6.2 Cards

#### Base Card

```css
.card {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid var(--border-default);
  transition: all 200ms ease;
}

.card:hover {
  border-color: var(--border-hover);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

/* Card with gold accent (premium) */
.card-premium {
  border-color: rgba(198, 167, 94, 0.3);
  background: linear-gradient(
    135deg,
    var(--bg-card) 0%,
    rgba(198, 167, 94, 0.05) 100%
  );
}
```

#### Card Internal Structure

```
┌─────────────────────────────────────────┐
│ ┌─────────────────────────────────────┐ │
│ │ CARD HEADER                         │ │  ← padding: 24px (top, left, right)
│ │ Title + Actions                     │ │
│ └─────────────────────────────────────┘ │
│              ↕ 16px gap                 │
│ ┌─────────────────────────────────────┐ │
│ │ CARD BODY                           │ │
│ │ Main content area                   │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│              ↕ 16px gap                 │
│ ┌─────────────────────────────────────┐ │
│ │ CARD FOOTER                         │ │  ← padding: 24px (bottom, left, right)
│ │ Actions / Meta                      │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 6.3 Form Elements

#### Input Fields

```css
.input {
  height: 44px;
  padding: 12px 16px;
  font-size: 16px;
  border-radius: 12px;
  border: 1px solid var(--border-default);
  background: var(--bg-secondary);
  transition: all 200ms ease;
}

.input:focus {
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px rgba(198, 167, 94, 0.15);
  outline: none;
}

.input-error {
  border-color: var(--danger);
}

.input-error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
}
```

#### Form Layout Spacing

```css
.form {
  display: flex;
  flex-direction: column;
  gap: 20px; /* Between form groups */
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px; /* Between label and input */
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px; /* Between side-by-side fields */
}

.form-actions {
  margin-top: 8px; /* Extra space before submit */
  display: flex;
  gap: 12px;
}
```

### 6.4 Tables

```css
.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.table th {
  padding: 16px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-default);
}

.table td {
  padding: 16px;
  font-size: 14px;
  border-bottom: 1px solid var(--border-default);
}

.table tr:hover td {
  background: var(--bg-hover);
}
```

### 6.5 Modals

```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}

.modal {
  background: var(--bg-card);
  border-radius: 20px;
  padding: 32px;
  max-width: 480px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  margin-bottom: 24px;
}

.modal-body {
  margin-bottom: 24px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
```

### 6.6 Sidebar Navigation

```css
.sidebar {
  width: 240px;
  background: var(--bg-card);
  border-right: 1px solid var(--border-default);
  padding: 24px 16px;
  height: 100vh;
  position: fixed;
  overflow-y: auto;
}

.sidebar-section {
  margin-bottom: 24px;
}

.sidebar-section-title {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  padding: 0 12px;
  margin-bottom: 8px;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  transition: all 150ms ease;
}

.sidebar-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.sidebar-item.active {
  background: rgba(198, 167, 94, 0.1);
  color: var(--accent-gold);
}
```

### 6.7 Badges & Tags

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 6px;
}

.badge-v1 {
  background: rgba(96, 165, 250, 0.15);
  color: #60A5FA;
}

.badge-v2 {
  background: rgba(212, 175, 55, 0.15);
  color: #D4AF37;
}

.badge-success {
  background: rgba(16, 185, 129, 0.15);
  color: #10B981;
}

.badge-danger {
  background: rgba(239, 68, 68, 0.15);
  color: #EF4444;
}
```

---

## 7. Page-Specific Guidelines

### 7.1 Landing Page — Homepage

```
┌─────────────────────────────────────────────────────────────┐
│ NAVBAR                                                      │
│ Height: 72px | Padding: 0 48px | Position: fixed            │
│ Logo (left) | Nav Links (center) | CTA + Theme (right)      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ HERO SECTION                                                │
│ Padding: 120px 0 80px                                       │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Headline (H1): 48-60px, Bold                            │ │
│ │ ↕ 24px                                                  │ │
│ │ Subheading: 20px, Regular, text-secondary               │ │
│ │ ↕ 32px                                                  │ │
│ │ CTA Buttons: [Primary] [Secondary] gap: 16px            │ │
│ │ ↕ 48px                                                  │ │
│ │ Live Stats: 3 columns, gap: 48px                        │ │
│ │ (Active Numbers | Countries | Uptime)                   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                        ↕ 64px                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ PROVIDERS COMPARISON                                        │
│ Padding: 64px 0                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Section Title (H2): center aligned                      │ │
│ │ ↕ 48px                                                  │ │
│ │ ┌─────────────────┐    ┌─────────────────┐              │ │
│ │ │ V1 CARD         │    │ V2 CARD         │              │ │
│ │ │ Standard 💰     │    │ Premium 💎      │              │ │
│ │ │ Blue accent     │    │ Gold accent     │              │ │
│ │ └─────────────────┘    └─────────────────┘              │ │
│ │         gap: 32px between cards                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                        ↕ 64px                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ FEATURE GRID                                                │
│ Padding: 64px 0                                             │
│ Grid: 3 columns | Gap: 24px                                 │
│ Each card: padding 32px                                     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                        ↕ 64px                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ HOW IT WORKS                                                │
│ Padding: 64px 0                                             │
│ 3 Steps: horizontal layout with connecting lines            │
│ Step spacing: 48px between steps                            │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                        ↕ 64px                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ MEMBERSHIP PLANS                                            │
│ Padding: 64px 0                                             │
│ Grid: 4 columns | Gap: 24px                                 │
│ Highlight recommended plan with gold border                 │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                        ↕ 64px                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ TESTIMONIALS                                                │
│ Padding: 64px 0                                             │
│ Carousel or grid layout                                     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                        ↕ 64px                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ TRUST SECTION                                               │
│ Padding: 48px 0                                             │
│ Security badges, uptime stats, payment icons                │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ FOOTER                                                      │
│ Padding: 48px 0 32px                                        │
│ 4-5 columns: Links | Resources | Legal | Social             │
│ Column gap: 48px                                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 User Dashboard

```
┌──────────┬──────────────────────────────────────────────────┐
│          │ HEADER BAR                                       │
│          │ Height: 64px | Padding: 0 24px                   │
│          │ Search | Notifications | User Menu               │
│          ├──────────────────────────────────────────────────┤
│ SIDEBAR  │                                                  │
│ Width:   │ MAIN CONTENT                                     │
│ 240px    │ Padding: 24px                                    │
│          │                                                  │
│ Sections:│ ┌──────────────────────────────────────────────┐ │
│ • Dash   │ │ STATS ROW                                    │ │
│ • Activ  │ │ 4 cards | Gap: 16px                          │ │
│ • Rent   │ │ (Balance | Active | Success | Performance)   │ │
│ • Fav    │ └──────────────────────────────────────────────┘ │
│ • Wallet │              ↕ 24px                              │
│ • Orders │ ┌──────────────────────────────────────────────┐ │
│ • Review │ │ QUICK ORDER BOX                              │ │
│ • Member │ │ Padding: 24px                                │ │
│ • API    │ │ Country | Service | Provider | Buy Button    │ │
│ • Refer  │ └──────────────────────────────────────────────┘ │
│ • Ticket │              ↕ 24px                              │
│ • Settin │ ┌─────────────────────┐ ┌────────────────────┐  │
│ • Logout │ │ RECENT SMS          │ │ MEMBERSHIP         │  │
│          │ │ Table view          │ │ Current plan       │  │
│ Item:    │ │                     │ │ Progress bar       │  │
│ h: 44px  │ │                     │ │ Upgrade CTA        │  │
│ gap: 4px │ └─────────────────────┘ └────────────────────┘  │
│          │         gap: 24px between columns                │
└──────────┴──────────────────────────────────────────────────┘
```

### 7.3 SMS Activation Page

```
┌─────────────────────────────────────────────────────────────┐
│ FILTERS BAR                                                 │
│ Padding: 16px 24px | Background: bg-card                    │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Country ▼] [Service ▼] [Provider ▼] | Filters Toggle   │ │
│ │                                                         │ │
│ │ Filter Pills (when expanded):                           │ │
│ │ [Available Now] [Cheapest] [Popular] [By Count]         │ │
│ │ Gap between pills: 8px                                  │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                        ↕ 16px                               │
├─────────────────────────────────────────────────────────────┤
│ SERVICES LIST                                               │
│ Padding: 0 24px                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ SERVICE ITEM                                            │ │
│ │ Height: 64px | Padding: 16px                            │ │
│ │ [Icon] Service Name | Country | Price | [Buy Button]    │ │
│ │ Border-bottom: 1px                                      │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ SERVICE ITEM                                            │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ SERVICE ITEM                                            │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ ACTIVE NUMBER PANEL (when purchased)                        │
│ Position: fixed bottom or slide-in panel                    │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Number: +1 234 567 8900                                 │ │
│ │ Status: Waiting for SMS... (animated)                   │ │
│ │ Timer: 19:45 remaining                                  │ │
│ │ [Copy] [Cancel] [Report]                                │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 7.4 Admin Panel

```
┌──────────┬──────────────────────────────────────────────────┐
│          │ ADMIN HEADER                                     │
│          │ Height: 64px                                     │
│          │ Breadcrumbs | Search | Admin Profile             │
│          ├──────────────────────────────────────────────────┤
│ ADMIN    │                                                  │
│ SIDEBAR  │ ADMIN CONTENT                                    │
│ Width:   │ Padding: 32px                                    │
│ 260px    │                                                  │
│          │ ┌──────────────────────────────────────────────┐ │
│ Grouped  │ │ PAGE TITLE + ACTIONS                         │ │
│ Sections:│ │ H1 + [Export] [Add New]                      │ │
│          │ └──────────────────────────────────────────────┘ │
│ MAIN     │              ↕ 24px                              │
│ • Dash   │ ┌──────────────────────────────────────────────┐ │
│ • Analyt │ │ FILTERS / SEARCH BAR                         │ │
│          │ │ Padding: 16px                                │ │
│ USERS    │ └──────────────────────────────────────────────┘ │
│ • Manage │              ↕ 16px                              │
│ • Roles  │ ┌──────────────────────────────────────────────┐ │
│          │ │ DATA TABLE                                   │ │
│ SERVICES │ │ Full width, scrollable                       │ │
│ • Provid │ │ Row height: 56px                             │ │
│ • VIP    │ │ Actions column: right-aligned                │ │
│ • Plans  │ └──────────────────────────────────────────────┘ │
│          │              ↕ 16px                              │
│ FINANCE  │ ┌──────────────────────────────────────────────┐ │
│ • Wallet │ │ PAGINATION                                   │ │
│ • Gatewy │ │ [< Prev] Page 1 of 10 [Next >]               │ │
│ • Trans  │ └──────────────────────────────────────────────┘ │
│          │                                                  │
│ CONTENT  │                                                  │
│ • SEO    │                                                  │
│ • Blog   │                                                  │
│ • KB     │                                                  │
│          │                                                  │
│ SYSTEM   │                                                  │
│ • Logs   │                                                  │
│ • Backup │                                                  │
│ • Secur  │                                                  │
└──────────┴──────────────────────────────────────────────────┘
```

---

## 8. Animation & Transitions

### Timing Functions

```css
--ease-default: cubic-bezier(0.4, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Duration Scale

```css
--duration-fast: 150ms;
--duration-default: 200ms;
--duration-slow: 300ms;
--duration-slower: 500ms;
```

### Standard Transitions

```css
/* Buttons */
.btn {
  transition: 
    background-color 200ms ease,
    transform 150ms ease,
    box-shadow 200ms ease;
}

/* Cards */
.card {
  transition: 
    border-color 200ms ease,
    box-shadow 300ms ease,
    transform 200ms ease;
}

/* Links */
a {
  transition: color 150ms ease;
}

/* Form inputs */
.input {
  transition: 
    border-color 200ms ease,
    box-shadow 200ms ease;
}
```

### Micro-interactions

```css
/* Button press */
.btn:active {
  transform: scale(0.98);
}

/* Card hover lift */
.card:hover {
  transform: translateY(-2px);
}

/* Icon rotation */
.icon-rotate:hover {
  transform: rotate(15deg);
}

/* Pulse animation for live indicators */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.live-indicator {
  animation: pulse 2s ease-in-out infinite;
}
```

### Page Transitions

```css
/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide up */
@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

/* Staggered children */
.stagger-children > * {
  animation: slideUp 500ms ease forwards;
  opacity: 0;
}

.stagger-children > *:nth-child(1) { animation-delay: 0ms; }
.stagger-children > *:nth-child(2) { animation-delay: 100ms; }
.stagger-children > *:nth-child(3) { animation-delay: 200ms; }
.stagger-children > *:nth-child(4) { animation-delay: 300ms; }
```

---

## 9. Responsive Breakpoints

### Breakpoint Values

```css
--breakpoint-sm: 640px;   /* Mobile landscape */
--breakpoint-md: 768px;   /* Tablet */
--breakpoint-lg: 1024px;  /* Desktop */
--breakpoint-xl: 1280px;  /* Large desktop */
--breakpoint-2xl: 1536px; /* Extra large */
```

### Media Query Usage

```css
/* Mobile first approach */

/* Base styles (mobile) */
.component { ... }

/* Tablet and up */
@media (min-width: 768px) {
  .component { ... }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .component { ... }
}

/* Large desktop */
@media (min-width: 1280px) {
  .component { ... }
}
```

### Responsive Spacing Adjustments

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Container padding | 16px | 24px | 48px |
| Section padding | 48px | 64px | 80px |
| Card padding | 16px | 20px | 24px |
| Grid gap | 16px | 20px | 24px |
| Sidebar width | 0 (hidden) | 240px | 240px |

### Responsive Typography

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| H1 | 32px | 40px | 48-60px |
| H2 | 28px | 32px | 36px |
| H3 | 24px | 28px | 30px |
| Body | 16px | 16px | 16px |
| Caption | 12px | 12px | 12px |

---

## 10. State Management UI

### Loading States

```css
/* Skeleton loader */
.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-secondary) 25%,
    var(--bg-hover) 50%,
    var(--bg-secondary) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Spinner */
.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--border-default);
  border-top-color: var(--accent-gold);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### SMS Activation States

| State | Background | Border | Icon | Text Color |
|-------|------------|--------|------|------------|
| **Waiting** | `bg-card` | `border-default` | ⏳ Animated | `text-secondary` |
| **Success** | `rgba(16,185,129,0.1)` | `#10B981` | ✓ | `#10B981` |
| **Expired** | `rgba(245,158,11,0.1)` | `#F59E0B` | ⏰ | `#F59E0B` |
| **Cancelled** | `bg-secondary` | `border-default` | ✕ | `text-muted` |
| **Failed** | `rgba(239,68,68,0.1)` | `#EF4444` | ✕ | `#EF4444` |

### Empty States

```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  text-align: center;
}

.empty-state-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 24px;
  opacity: 0.5;
}

.empty-state-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.empty-state-description {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 24px;
  max-width: 320px;
}
```

### Error States

```css
.error-message {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  color: #EF4444;
}

.error-inline {
  font-size: 12px;
  color: #EF4444;
  margin-top: 4px;
}
```

---

## 11. Iconography

### Icon Sizes

| Size | Dimensions | Use Case |
|------|------------|----------|
| XS | 12px | Inline with small text |
| SM | 16px | Buttons, form elements |
| MD | 20px | Navigation, list items |
| LG | 24px | Cards, headers |
| XL | 32px | Feature highlights |
| 2XL | 48px | Empty states, heroes |

### Icon Style Guidelines

- Use outlined icons (stroke width: 1.5-2px)
- Consistent corner radius matching UI (rounded)
- Single color (inherits from text color)
- No filled icons unless indicating active state

### Provider Icons

```
V1 Standard: 💰 or custom icon with blue accent
V2 Premium:  💎 or custom icon with gold accent
```

---

## 12. Shadows & Elevation

### Shadow Scale

```css
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 8px rgba(0, 0, 0, 0.08);
--shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 16px 32px rgba(0, 0, 0, 0.12);
--shadow-2xl: 0 24px 48px rgba(0, 0, 0, 0.16);

/* Gold glow for premium elements */
--shadow-gold: 0 4px 14px rgba(198, 167, 94, 0.25);
--shadow-gold-lg: 0 8px 24px rgba(198, 167, 94, 0.35);
```

### Elevation Levels

| Level | Shadow | Use Case |
|-------|--------|----------|
| 0 | None | Flat elements, backgrounds |
| 1 | `shadow-sm` | Cards at rest |
| 2 | `shadow-md` | Cards on hover, dropdowns |
| 3 | `shadow-lg` | Modals, popovers |
| 4 | `shadow-xl` | Floating action buttons |
| 5 | `shadow-2xl` | Dialogs, overlays |

---

## 13. Accessibility

### Color Contrast

- All text must meet WCAG 2.1 AA standards
- Normal text: 4.5:1 minimum contrast ratio
- Large text (18px+): 3:1 minimum contrast ratio
- Interactive elements: clearly distinguishable focus states

### Focus States

```css
/* Visible focus ring */
:focus-visible {
  outline: 2px solid var(--accent-gold);
  outline-offset: 2px;
}

/* Remove default outline when using focus-visible */
:focus:not(:focus-visible) {
  outline: none;
}
```

### Interactive Element Sizes

- Minimum touch target: 44px × 44px
- Adequate spacing between clickable elements: 8px minimum
- Clear hover/active states for all interactive elements

### Screen Reader Support

- All images require alt text
- Form inputs require associated labels
- Use semantic HTML elements
- ARIA labels for icon-only buttons
- Skip navigation link for keyboard users

---

## Quick Reference: Spacing Cheatsheet

```
┌─────────────────────────────────────────────────────────────┐
│ SPACING QUICK REFERENCE                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Micro (4px)    → Icon to text, badge padding                │
│ Tight (8px)    → List items, compact elements               │
│ Default (16px) → Paragraphs, form groups                    │
│ Medium (24px)  → Card padding, grid gaps                    │
│ Large (32px)   → Section internal spacing                   │
│ XL (48px)      → Between major components                   │
│ 2XL (64px)     → Between page sections                      │
│ 3XL (80px)     → Hero padding, major breaks                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Notes

### CSS Variables Setup (Tailwind)

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-card': 'var(--bg-card)',
        'accent-gold': 'var(--accent-gold)',
        // ... etc
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        // ... custom values
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
      },
      fontFamily: {
        'satoshi': ['Satoshi', 'Inter', 'system-ui'],
        'montserrat': ['Montserrat', 'Inter', 'system-ui'],
      },
    },
  },
}
```

### Component File Structure

```
src/
├── components/
│   ├── ui/
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Input/
│   │   ├── Modal/
│   │   ├── Badge/
│   │   ├── Table/
│   │   └── ...
│   ├── layout/
│   │   ├── Sidebar/
│   │   ├── Navbar/
│   │   ├── Footer/
│   │   └── Container/
│   └── features/
│       ├── Activation/
│       ├── Rental/
│       ├── Wallet/
│       └── ...
├── styles/
│   ├── globals.css
│   ├── variables.css
│   └── animations.css
└── ...
```

---

**End of Design Guidelines Document**

*This document should be referenced for all UI implementation decisions. When in doubt, prioritize: clarity, consistency, and premium feel.*

