# DESIGN_SYSTEM.md — GarageOS Design System

---

## 🎨 Design Philosophy

**Aesthetic:** Quiet Luxury
**Mood:** Sophisticated, Calm, Professional
**Dark Mode:** Navy + Gold palette
**Approach:** Mobile-first, minimal, premium

---

## 🎯 Color Palette

### Primary Colors

| Color | Hex | Usage | CSS Class |
|-------|-----|-------|-----------|
| **Gold** | `#e9c349` | CTAs, accents, active states, FAB | `text-primary`, `bg-primary` |
| **Dark Navy** | `#0e131e` | Background (dark), headings | `bg-background` |
| **Light Text** | `#f0f0f0` | Primary text on dark bg | `text-on-surface` |

### Surface Colors

| Color | Hex | Usage |
|-------|-----|-------|
| **surface** | `#0e131e` | Base background |
| **surface-container** | `#1a202a` | Cards, elevated surfaces |
| **surface-container-low** | `#161c26` | Slightly darker cards |
| **surface-container-lowest** | `#080e18` | Darkest background |
| **surface-container-high** | `#242a35` | Hover states |

### Text Colors

| Color | Hex | Usage |
|-------|-----|-------|
| **on-surface** | `#dde2f1` | Primary text |
| **on-surface-variant** | `#c6c6cc` | Secondary text, labels |
| **on-surface/60** | `#dde2f1` (60%) | Tertiary text |

### Semantic Colors

| Color | Hex | Usage |
|-------|-----|-------|
| **Amber** | `#d4875a` | Warnings, pending, pending status |
| **Green** | `#4caf50` | Success, completed status (if needed) |
| **Red** | `#ef5350` | Errors, overdue status (if needed) |

### Border & Outline

| Color | Hex | Usage |
|-------|-----|-------|
| **outline** | `#909096` | Primary borders |
| **outline-variant** | `#45474b` | Secondary borders, dividers |

---

## 🔤 Typography

### Font Families

| Font | Type | Weights | Usage | Import |
|------|------|---------|-------|--------|
| **Newsreader** | Serif | 400, 500, 600, 700 | Headlines, titles (italic for elegance) | Google Fonts |
| **Manrope** | Sans-serif | 400, 500, 600, 700, 800 | Body text, descriptions | Google Fonts |
| **Inter** | Sans-serif | 400, 500, 600, 700 | Labels, UI text, small copy | Google Fonts |

### Font Sizes & Line Heights

| Level | Font | Size | Weight | Line Height | Usage |
|-------|------|------|--------|-------------|-------|
| **H1** | Newsreader | 56-64px | 700 | 1.2 | Page title, vehicle name |
| **H2** | Newsreader | 40-48px | 700 | 1.3 | Section heading |
| **H3** | Newsreader | 28-32px | 600 | 1.4 | Card title |
| **Body** | Manrope | 16px | 400 | 1.5 | Body text, descriptions |
| **Body Small** | Manrope | 14px | 400 | 1.5 | Secondary text |
| **Label** | Inter | 12px | 500 | 1.4 | Badges, captions, UI labels |

### Font Stack (CSS)

```css
/* Headings */
.font-serif { font-family: var(--font-newsreader); }

/* Body */
.font-sans { font-family: var(--font-manrope); }

/* Labels/UI */
.font-ui { font-family: var(--font-inter); }

/* Italic for elegance */
.italic { font-style: italic; }
```

---

## 📏 Spacing Scale

**Base Unit:** 4px (Tailwind default)

| Token | Pixels | Tailwind | Usage |
|-------|--------|---------|-------|
| xs | 4px | `p-1` | Tiny padding, minimal gaps |
| sm | 8px | `p-2` | Small padding, button padding |
| md | 12px | `p-3` | Standard padding |
| lg | 16px | `p-4` | Medium padding, card padding |
| xl | 24px | `p-6` | Large padding, section padding |
| 2xl | 32px | `p-8` | Extra large spacing |
| 3xl | 48px | `p-12` | Page margins |

**Tailwind Quick Reference:**
- `px-6` → horizontal padding 24px (page margins on mobile)
- `lg:px-12` → horizontal padding 48px (page margins on desktop)
- `gap-4` → gap between items 16px
- `gap-6` → gap between items 24px

---

## 🔲 Border Radius

| Token | Pixels | CSS | Usage |
|-------|--------|-----|-------|
| **none** | 0px | `rounded-none` | Sharp corners |
| **sm** | 2px | `rounded-sm` | Subtle rounding |
| **md** | 4px | `rounded-md` | Standard rounding (buttons, cards) |
| **lg** | 8px | `rounded-lg` | Larger elements |
| **xl** | 12px | `rounded-xl` | Full component rounding |
| **full** | 9999px | `rounded-full` | Circles, pills |

**Design System Custom Config:**
```javascript
borderRadius: {
  DEFAULT: '4px',      // 0.25rem
  sm: '2px',
  md: '4px',
  lg: '8px',
  xl: '12px',
  full: '9999px',
}
```

---

## 🌑 Shadows

| Level | CSS | Usage |
|-------|-----|-------|
| **None** | none | No elevation |
| **sm** | `shadow-sm` | Subtle elevation (inputs, small cards) |
| **md** | `shadow-md` | Standard elevation (cards, buttons) |
| **lg** | `shadow-lg` | High elevation (modals, dropdowns) |
| **xl** | `shadow-xl` | Very high elevation (floating elements) |

**Custom Tailwind Shadow:**
```javascript
boxShadow: {
  'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
}
```

---

## 🎨 CSS Classes (Global)

### glass-card
**Purpose:** Card with glassmorphism effect
```css
.glass-card {
  background: rgba(47, 53, 64, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(193, 200, 217, 0.2);
}
```

**Used In:** VehicleCard, MaintenanceCard, ShareTable cards

### champagne-gradient
**Purpose:** Gold gradient button, FAB, avatars
```css
.champagne-gradient {
  background: linear-gradient(135deg, #e9c349 0%, #d4a84a 100%);
}
```

**Used In:** FAB buttons, action buttons, user avatar

### hero-border
**Purpose:** Left border accent for descriptions
```css
.hero-border {
  border-left: 4px solid rgba(233, 195, 73, 0.3);
  padding-left: 16px;
}
```

**Used In:** Vehicle description in details page

### no-scrollbar
**Purpose:** Hide scrollbar but keep scrolling
```css
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
```

**Used In:** Horizontal scrolling sections

### material-symbols-outlined
**Purpose:** Google Material Symbols font
```css
.material-symbols-outlined {
  font-family: 'Material Symbols Outlined';
  font-weight: 400;
  font-style: normal;
  font-size: 24px;
  display: inline-block;
  line-height: 1;
  text-transform: none;
  letter-spacing: normal;
  word-wrap: normal;
  white-space: nowrap;
  direction: ltr;
}
```

**Used In:** Icons in TopAppBar, BottomNav, buttons

---

## 🎭 Component Styling Guide

### VehicleCard
```tailwind
/* Container */
rounded-lg bg-surface-container border border-outline-variant/20

/* Image */
aspect-[4/5] object-cover rounded-lg

/* Hover Effect */
hover:scale-110 transition-transform duration-300

/* Gradient Overlay */
absolute inset-0 rounded-lg from-black/0 to-black/70

/* Metadata */
mt-4 font-serif text-2xl italic text-on-surface

/* Category Badge */
inline-flex px-3 py-1 rounded-md text-sm border
```

### MaintenanceCard
```tailwind
/* Container */
rounded-lg bg-surface-container-low border border-outline-variant/20
p-4 hover:bg-primary/[0.02] transition-colors duration-300

/* Status Badge */
inline-flex px-2 py-1 rounded-md text-xs font-semibold

/* Title */
font-sans font-semibold text-on-surface text-lg

/* Metadata */
text-on-surface-variant text-sm
```

### FAB (Floating Action Button)
```tailwind
/* Container */
fixed bottom-8 right-8 h-14 w-14 rounded-full
champagne-gradient shadow-lg

/* Icon */
flex items-center justify-center text-surface-container
material-symbols-outlined
```

### TopAppBar
```tailwind
/* Container */
fixed top-0 left-0 right-0 z-50
border-b border-outline-variant/20
bg-surface-container/80 backdrop-blur-md

/* Content */
flex items-center justify-between
px-6 lg:px-12 py-4

/* Logo */
flex-1 text-center font-serif text-2xl italic text-primary
```

### BottomNav
```tailwind
/* Container */
fixed bottom-0 left-0 right-0 z-50
lg:hidden
bg-surface-container border-t border-outline-variant/20

/* Items */
flex items-center justify-around h-16
space-x-4 px-4

/* Active Item */
text-primary font-semibold
```

---

## 🎬 Animations & Transitions

| Effect | Duration | Easing | Usage |
|--------|----------|--------|-------|
| **Fade** | 300ms | ease-in-out | Element appear/disappear |
| **Scale** | 300ms | ease-in-out | Hover effects, card interactions |
| **Slide** | 500ms | ease-out | Navigation transitions |
| **Blur** | 300ms | ease-in | Focus/unfocus effects |

**Tailwind Classes:**
```tailwind
transition-all duration-300
transition-transform duration-300
transition-opacity duration-300
transition-colors duration-300

hover:scale-110
hover:bg-primary/[0.02]
hover:opacity-80

group-hover:opacity-100
```

---

## 📱 Responsive Breakpoints

| Device | Width | Grid | Padding | TopBar | BottomNav |
|--------|-------|------|---------|--------|-----------|
| **Mobile** | < 640px | 1 col | px-6 | Visible | Visible |
| **Tablet** | 640px - 1024px | 2 col | px-6 | Visible | Visible |
| **Desktop** | 1024px+ | 3-4 col | lg:px-12 | Visible | `lg:hidden` |

**Tailwind Prefixes:**
- Default (mobile first): no prefix
- Tablet: `md:` (640px+)
- Desktop: `lg:` (1024px+)
- Extra large: `xl:` (1280px+)

---

## 🎯 Design Tokens (tailwind.config.ts)

```javascript
const config = {
  theme: {
    extend: {
      colors: {
        primary: '#e9c349',
        background: '#0e131e',
        'surface': '#0e131e',
        'surface-container': '#1a202a',
        'surface-container-low': '#161c26',
        'surface-container-lowest': '#080e18',
        'surface-container-high': '#242a35',
        'on-surface': '#dde2f1',
        'on-surface-variant': '#c6c6cc',
        'outline': '#909096',
        'outline-variant': '#45474b',
      },
      fontFamily: {
        serif: ['var(--font-newsreader)', 'serif'],
        sans: ['var(--font-manrope)', 'sans-serif'],
        ui: ['var(--font-inter)', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '4px',
        sm: '2px',
        md: '4px',
        lg: '8px',
        xl: '12px',
        full: '9999px',
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
    },
  },
}
```

---

## ✅ Design Checklist

Before shipping a component, verify:

- [ ] Uses colors from palette (no inline hex)
- [ ] Typography matches hierarchy (H1/H2/Body/Label)
- [ ] Spacing follows scale (4px, 8px, 12px, 16px, 24px, 32px)
- [ ] Border radius consistent (2px, 4px, 8px, 12px, full)
- [ ] Mobile-first responsive (base mobile, md:tablet, lg:desktop)
- [ ] Hover states defined (scale, color, opacity)
- [ ] Dark mode tested (navy background, gold accents)
- [ ] Fonts loaded (Newsreader, Manrope, Inter)
- [ ] Icons using Material Symbols (not custom)
- [ ] Transitions smooth (300ms, 500ms)
- [ ] Padding respects safe area (pt-28 for TopAppBar, pb-20 for BottomNav on mobile)
- [ ] SEO accessible (semantic HTML, alt text, labels)

---

**Letzte Aktualisierung:** 2026-03-23 · **Version:** 1.0 ✅
