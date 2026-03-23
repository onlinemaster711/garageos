# CLAUDE.md — GarageOS

**Wird vor jeder Aufgabe gelesen.**

---

## 📊 Project Status

| Metrik | Status |
|--------|--------|
| **Phase** | MVP Phase 1 COMPLETE → **Phase 2 Ready** |
| **Completion** | **85%** (↑ from 70%) |
| **Launch** | Q2 2026 (on track) |
| **Tech Debt** | Low |
| **Deployment** | Ready for Staging |

**Roadmap:**
- [x] Phase 1: Auth + Dashboard + Vehicle CRUD + Details + Settings + Guest Invitations
- [ ] Phase 2: Payment (Stripe) + Guest Dashboard + Photo Uploads
- [ ] Phase 3: Shared Vehicles Display + Advanced Search + Analytics
- [ ] Phase 4: Notifications + Mobile App (React Native)

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js | 14+ (App Router) |
| **Frontend** | React | 19 |
| **Styling** | Tailwind CSS | 4 |
| **Components** | shadcn/ui | Latest |
| **Database** | Supabase PostgreSQL | Latest |
| **Auth** | Supabase Auth (JWT) | Latest |
| **Language** | TypeScript | Strict Mode |
| **Icons** | Lucide React | Latest |
| **Hosting** | Vercel | (Ready) |

---

## ✅ Current Features (Completed — Phase 1)

### 🟢 Core Features
- ✅ **Authentication** — Supabase Auth (Login/Signup) with JWT
- ✅ **Dashboard** — Vehicle Grid (responsive: 1→2→3-4 columns)
  - VehicleCard with 4:5 aspect ratio, hover zoom
  - Category badges (Modern, Oldtimer, Youngtimer)
  - Add Vehicle placeholder card
  - Empty state when no vehicles
  - RLS-filtered user vehicles only
- ✅ **Vehicle Details Page** — /vehicles/[id]
  - Hero section with image + specs
  - Specifications grid (4 columns on desktop)
  - Insurance & assets section
  - Category badge + metadata
  - Permission-based edit/delete buttons
- ✅ **Maintenance Tracker** — /termine
  - List of maintenance tasks + reminders
  - Filters: All, Maintenance, Reminders
  - Status badges (Planned, Completed, Overdue)
  - FAB for new maintenance
  - Responsive grid layout
- ✅ **Settings & User Management** — /settings
  - User profile display
  - **Guest Invitation System** (NEW)
    - Resend email integration
    - Token-based invitations (24hr expiry)
    - Password setup page for new users
    - Automatic user_access creation
  - **User Deletion** (NEW)
    - Revoke all vehicle access for guests
    - Confirmation dialog
    - Cascading deletion via RLS
  - User list with vehicle access count
- ✅ **Guest Sharing System** (NEW)
  - `user_access` table with granular permissions
  - can_view / can_edit / can_upload flags
  - Time-limited access with expiry dates
  - RLS policies for owner/guest isolation
  - AddUserForm + UsersTable components
- ✅ **Navigation**
  - TopAppBar (Desktop + Mobile)
  - BottomNav (Mobile only, 4 items)
  - Responsive padding (px-6 → lg:px-12)
- ✅ **Security & RLS**
  - Row-Level Security on all tables
  - User isolation (owner sees own vehicles only)
  - Guest isolation (guests see only shared vehicles)
  - Owner-only guest management
  - Service role key for user creation
- ✅ **Design System**
  - Dark mode (Navy #0e131e + Gold #e9c349)
  - Quiet Luxury aesthetic
  - Google Fonts (Newsreader, Manrope, Inter)
  - Material Symbols Outlined icons
  - Global CSS classes (.glass-card, .champagne-gradient)
  - Material Design 3 components

---

## 🚧 In Progress

*(None — Phase 1 complete, Phase 2 queued)*

---

## ❌ TODO (Phase 2 & Beyond)

### Phase 2 — Payment & Guest Features (Next)
- [ ] **Payment Integration (Stripe)**
  - Subscription tiers (Free / Premium / Pro)
  - Vehicle limits per tier
  - Payment page at /billing
  - Webhook handling

- [ ] **Guest Dashboard** (Shared Vehicles)
  - /dashboard/shared route
  - Display only vehicles shared with user
  - Read-only or editable based on permissions
  - Filter: "My Vehicles" vs "Shared with Me"

- [ ] **Photo & File Uploads**
  - vehicle_photos table
  - S3 integration for storage
  - Upload page at /vehicles/[id]/photos
  - Gallery view in details page
  - Permission-based visibility

### Phase 3 — Advanced Features
- [ ] **Shared Vehicles Display on Main Dashboard**
  - Merge shared + owned vehicles
  - Visual indicator for shared vehicles
  - Filter toggle: "Show Shared"

- [ ] **Advanced Search & Filters**
  - Full-text search (make/model/color/year)
  - Year range filter
  - Mileage filter
  - Category filter
  - Status filter (active/archived)

- [ ] **Analytics Dashboard**
  - Total vehicles count
  - Maintenance costs over time
  - Upcoming maintenance alerts
  - Cost trends by category
  - Guest access statistics

### Phase 4 — Mobile & Polish
- [ ] **Notifications**
  - Maintenance reminders (email + push)
  - Guest access expiry warnings
  - New shared vehicle notifications
  - Push notifications via Supabase

- [ ] **Mobile Optimization**
  - React Native app (Expo)
  - Offline sync
  - Camera integration for vehicle photos
  - Home screen widgets

- [ ] **Admin Features**
  - User management dashboard
  - Usage analytics
  - Support ticket system
  - Database backups

### Technical Debt & Quality
- [ ] Error boundary components
- [ ] Better loading states (skeleton screens)
- [ ] Form validation + real-time feedback
- [ ] Unit tests (Vitest setup)
- [ ] E2E tests (Playwright)
- [ ] Performance optimization (image compression, code splitting)
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Security audit (penetration testing)

---

## 📁 File Structure Overview

```
garageos/
├── CLAUDE.md                          ← Diese Datei
├── README.md                          ← User-facing intro
├── DATABASE.md                        ← Schema + RLS + Relationships
├── COMPONENT_INVENTORY.md             ← Component status + props
├── DESIGN_SYSTEM.md                   ← Colors, fonts, tokens, CSS classes
│
├── src/
│   ├── app/                           ← Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── layout.tsx
│   │   │   ├── login.tsx
│   │   │   └── signup.tsx
│   │   ├── dashboard/
│   │   │   ├── page.tsx               ← Vehicle Grid (Server Component)
│   │   │   └── loading.tsx            ← Skeleton Loading
│   │   ├── vehicles/
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx           ← Vehicle Details (Server Component)
│   │   │   │   └── edit/page.tsx      ← Edit Vehicle (stub)
│   │   │   └── new/
│   │   │       └── page.tsx           ← Add Vehicle (stub)
│   │   ├── termine/
│   │   │   ├── page.tsx               ← Maintenance Tracker (Server Component)
│   │   │   └── new/
│   │   │       └── page.tsx           ← Add Maintenance (stub)
│   │   ├── settings/
│   │   │   └── page.tsx               ← User Management + Shares (Server Component)
│   │   ├── layout.tsx                 ← Google Fonts + Global CSS + TopAppBar
│   │   └── error.tsx                  ← Error boundary (if exists)
│   │
│   ├── components/
│   │   ├── TopAppBar.tsx              ← Fixed desktop header
│   │   ├── BottomNav.tsx              ← Mobile navigation (lg:hidden)
│   │   ├── VehicleCard.tsx            ← Reusable vehicle card with link
│   │   ├── MaintenanceCard.tsx        ← Maintenance task card
│   │   ├── ShareForm.tsx              ← Share management form
│   │   ├── ShareTable.tsx             ← Share list table
│   │   └── ui/                        ← shadcn/ui components
│   │       ├── button.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── input.tsx
│   │       ├── select.tsx
│   │       ├── tabs.tsx
│   │       └── ... (other shadcn components)
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts              ← Browser client (createClient)
│   │   │   ├── server.ts              ← Server client
│   │   │   └── middleware.ts          ← Auth middleware
│   │   └── utils.ts                   ← Helper functions
│   │
│   └── types/
│       ├── database.ts                ← Auto-generated from Supabase
│       └── custom.ts                  ← Custom TypeScript types
│
├── supabase/
│   ├── migrations/                    ← SQL migrations (NEVER DELETE)
│   │   ├── 20240320_init.sql          ← Initial schema
│   │   ├── 20260323_create_vehicles.sql
│   │   ├── 20260323_create_maintenance_tasks.sql
│   │   └── 20260323_create_vehicle_shares.sql
│   └── functions/                     ← Edge Functions (if needed)
│
├── public/                            ← Static assets
├── tailwind.config.ts                 ← Tailwind config + custom tokens
├── tsconfig.json                      ← TypeScript strict mode
├── next.config.js                     ← Next.js config
├── .env.local                         ← Secrets (NOT in git)
├── package.json                       ← Dependencies
└── README.md                          ← User-facing documentation
```

---

## 🔐 Environment Variables (.env.local)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...    # Server-only!

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## 🚀 Key Commands

```bash
# Development
npm run dev                            # Start dev server (http://localhost:3000)
npm run build                          # Build for production
npm run lint                           # ESLint check
npx tsc --noEmit                       # TypeScript check

# Supabase (if using local Supabase)
supabase start                         # Start local Supabase
supabase stop                          # Stop local Supabase
supabase db push                       # Push migrations to remote
supabase gen types typescript --project-id $SUPABASE_PROJECT_ID > src/types/database.ts

# Database
npx supabase migration new <name>      # Create new migration
```

---

## 🎯 Key Architecture Patterns

### 1. **Server Components for Data Fetching**
```typescript
// app/dashboard/page.tsx — Server Component
export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('*')
    .eq('user_id', user?.id)

  return <VehicleGrid vehicles={vehicles} />
}
```

### 2. **Client Components for Interactivity**
```typescript
// components/VehicleCard.tsx — Client Component
"use client"
export function VehicleCard({ id, make, model }: VehicleCardProps) {
  return <Link href={`/vehicles/${id}`}>{/* Hover, Links, Forms */}</Link>
}
```

### 3. **Mobile-First Responsive Design**
```tailwind
/* Default: Mobile (1 col, px-6 padding) */
grid grid-cols-1 px-6

/* Tablet: md breakpoint (2 cols) */
md:grid-cols-2

/* Desktop: lg breakpoint (3-4 cols, px-12 padding) */
lg:grid-cols-3 lg:px-12 xl:grid-cols-4
```

### 4. **Supabase RLS for Multi-Tenant Safety**
```sql
-- Only users see their own vehicles
CREATE POLICY "Users see own vehicles" ON vehicles
  FOR ALL USING (auth.uid() = user_id);

-- Only owners can share their vehicles
CREATE POLICY "Users can only share own vehicles" ON vehicle_shares
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM vehicles WHERE id = vehicle_id AND user_id = auth.uid())
  );
```

### 5. **Global Styles in layout.tsx**
```typescript
// Google Fonts, Material Symbols, CSS Classes
// .glass-card, .champagne-gradient, .no-scrollbar
```

---

## ✅ Before Starting Any Work

1. **Check Roadmap** in CLAUDE.md (this file)
2. **Read DATABASE.md** → Table schemas + RLS policies
3. **Check COMPONENT_INVENTORY.md** → What's done/WIP/TODO
4. **Read DESIGN_SYSTEM.md** → Colors, fonts, spacing
5. **Run type check:** `npx tsc --noEmit`

---

## 📋 Golden Rules

| Rule | Why |
|------|-----|
| **Server Components for data fetching** | Faster, safer, no waterfall requests |
| **Client Components only for UI state** | Links, forms, hover effects, filters |
| **All queries filter by user_id** | RLS + security |
| **NEVER delete migrations** | Database history matters |
| **TypeScript strict mode** | No `any`, all types explicit |
| **Mobile-first CSS** | Responsive guarantees |
| **Tailwind colors from system** | No inline hex codes |
| **German UI, English code** | Consistency + internationalization ready |
| **RLS on every table** | Multi-tenant safety |

---

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| **1.1** | 2026-03-23 | ✅ Phase 1 Complete: Guest Invitations (Resend), User Deletion, Full RLS |
| **1.0** | 2026-03-23 | MVP Phase 1: Dashboard, Vehicle Details, Termine, Settings, Sharing |
| **0.9** | 2026-03-20 | Responsive Design, TopAppBar, BottomNav, Migrations |
| **0.8** | 2026-03-15 | Auth, Material Design 3, Tailwind Setup |

---

## 📞 Quick Links

| Document | Purpose |
|----------|---------|
| **README.md** | User-facing intro + Getting Started |
| **DATABASE.md** | Schema, RLS Policies, Relationships |
| **COMPONENT_INVENTORY.md** | Component Status + Props |
| **DESIGN_SYSTEM.md** | Colors, Fonts, Spacing, CSS Classes |
| **ROADMAP.md** | Phase 2-4 Features + Timeline (NEW) |
| **DEPLOYMENT.md** | Staging & Production Setup (NEW) |
| **IMPLEMENTATION_GUIDE.md** | Guest Invitation System Details |

---

**Letzte Aktualisierung:** 2026-03-23 · **Status:** Phase 1 Complete ✅ · **Next:** Phase 2 (Payment + Guest Dashboard)
