# GarageOS Design System — Comprehensive Styleguide

## 1. Design Philosophy

### Core Principles
Premiumness entsteht nicht durch Ornament, sondern durch:
- **Whitespace**: Großzügige Abstände zwischen Elementen
- **Eleganz**: Minimalist, präzise, wertschätzend
- **Dark/Light Rhythm**: Visueller Flow beim Scrollen (Hell ↔ Dunkel)
- **Luxury through Restraint**: Weniger ist mehr
- **Accessibility First**: Alle User, alle Devices

### Visual Language
- Navy + Gold = Premium (nicht bunt, nicht neon)
- Subtile Animations (200-300ms, smooth easing)
- Generous Padding & Gaps (nie eng, nie cramped)
- High Contrast (WCAG AA minimum)
- Smooth Transitions (nie jarring)

### Die 5 Säulen
1. **Color**: Navy, Charcoal, Gold, Beige
2. **Typography**: Inter, große Unterschiede (H1 vs Body)
3. **Spacing**: Großzügig, konsistent, rhythmisch
4. **Motion**: Smooth, subtil, purposeful
5. **Responsive**: Mobile-First, skaliert elegant

---

## 2. Color Palette

### Primary Colors (The Foundation)

| Name | Hex | RGB | Usage | Notes |
|------|-----|-----|-------|-------|
| **Navy Dark** | `#0A1A2F` | 10, 26, 47 | Main background, Hero | Tiefe, Premium-Feel |
| **Charcoal** | `#2A2D30` | 42, 45, 48 | Secondary bg, Cards (dark) | Leicht heller als Navy |
| **Accent Dark** | `#1A1A2E` | 26, 26, 46 | Footer, Subtle bg | Zwischen Navy & Charcoal |
| **Light Beige** | `#F0ECE3` | 240, 236, 227 | Light sections, Backgrounds | Warm, nicht weiß |
| **Gold** | `#E5C97B` | 229, 201, 123 | CTAs, Accents, Emphasis | Der Luxus-Akzent |

### Text Colors

| Name | Hex | Usage | Contrast |
|------|-----|-------|----------|
| **White** | `#FFFFFF` | Primary text auf dunklem BG | AAA (7:1) |
| **Light Gray** | `#E6E6E6` | Body text auf dunklem BG | AA (5.5:1) |
| **Muted Gray** | `#9B9B9B` | Secondary text, small print | AA (4.5:1) |
| **Dark Text** | `#333333` | Primary text auf hellem BG | AAA (12:1) |
| **Dark Gray** | `#666666` | Secondary text auf hellem BG | AA (6:1) |

---

## 3. Typography

### Font Stack
- Primary: Inter (sans-serif)
- Fallback: system fonts

### Type Scale (Responsive)

| Element | Desktop | Mobile | Weight | Line Height |
|---------|---------|--------|--------|-------------|
| **H1** | 3.5rem | 2rem | 700 | 1.2 |
| **H2** | 2.5rem | 1.75rem | 700 | 1.2 |
| **H3** | 1.5rem | 1.25rem | 600 | 1.3 |
| **Body** | 1rem | 1rem | 400 | 1.6 |
| **Small** | 0.875rem | 0.875rem | 400 | 1.5 |

---

## 4. Spacing System

### Padding Scale
- `py-24`: 6rem (Section padding desktop)
- `py-16`: 4rem (Section padding mobile)
- `py-8`: 2rem (Normal padding)
- `py-6`: 1.5rem (Card padding)

### Gap Scale
- `gap-8`: 2rem (Large gaps)
- `gap-6`: 1.5rem (Normal gaps)
- `gap-4`: 1rem (Small gaps)

### Max-widths
- `max-w-6xl`: 1152px (Full featured)
- `max-w-4xl`: 896px (Medium)
- `max-w-2xl`: 672px (Narrow)

---

## 5. Component Examples

### Button (Primary)
```tsx
<button className="bg-[#E5C97B] text-[#0A1A2F] px-8 py-4 rounded-lg font-semibold hover:bg-[#D4B85F] transition-all duration-200">
  Kostenlos starten
</button>
```

### Card (Dark)
```tsx
<div className="bg-[#2A2D30] border border-[#E6E6E6] rounded-lg p-8 shadow-lg">
  <h3 className="text-2xl font-bold text-white">Title</h3>
  <p className="text-[#E6E6E6]">Content</p>
</div>
```

### Navigation (Sticky)
```tsx
<nav className="sticky top-0 z-50 transition-all duration-300" 
     style={{ backgroundColor: scrolled ? 'rgba(42, 45, 48, 0.95)' : 'transparent' }}>
  {/* Nav content */}
</nav>
```

---

## 6. Animations & Transitions

### Fade-in
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### Timing Guidelines
- FAST (150-200ms): Hover effects
- NORMAL (300ms): Fade-in animations
- SLOW (500ms+): Rare, special emphasis

---

## 7. Responsive Design

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1199px
- Desktop: 1200px+

### Mobile-First Pattern
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
  {/* Start mobile (1 col), expand to tablet (2 col), desktop (3 col) */}
</div>
```

---

## 8. Design Patterns

### Dark/Light Rhythm
```
Hero (Dark) → Problem (Light) → Lösung (Dark) → Features (Light) → ...
```

Creates visual storytelling through color alternation.

---

## 9. Do's & Don'ts

### ✅ DO
- Use generous whitespace
- Limit text width (max-w-2xl)
- Use subtle shadows
- Smooth transitions (200-300ms)
- High contrast (WCAG AA)

### ❌ DON'T
- Overload with colors
- Cramped spacing
- Instant transitions
- Multiple fonts
- Neon colors

---

## 10. Real-World Example: Hero Section
```tsx
export function HeroSection() {
  return (
    <section style={{ backgroundColor: '#0A1A2F' }} className="py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <p className="text-sm text-[#9B9B9B] uppercase tracking-widest">
          Premium Fahrzeug-Management
        </p>
        <h1 className="text-5xl lg:text-6xl font-bold text-white mt-4">
          Deine <span className="text-[#E5C97B]">Sammlung</span>. Dein System.
        </h1>
        <p className="text-lg text-[#E6E6E6] mt-6 max-w-2xl">
          Verwalte alle Fahrzeuge, Dokumente und Termine an einem Ort.
        </p>
        <button className="mt-8 bg-[#E5C97B] text-[#0A1A2F] px-8 py-4 rounded-lg font-semibold hover:bg-[#D4B85F] transition-all">
          Kostenlos starten
        </button>
      </div>
    </section>
  )
}
```

---

**Version**: 1.0 | Erstellt: März 2026 | Für: GarageOS & zukünftige Projekte
