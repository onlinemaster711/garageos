# COMPONENT_INVENTORY.md — GarageOS Components

---

## 📦 Component Status Legend

| Status | Icon | Meaning |
|--------|------|---------|
| Done | ✅ | Implemented, tested, production-ready |
| In Progress | 🚧 | Partially implemented, testing in progress |
| TODO | ❌ | Not started or stub only |

---

## 🏗️ Layout Components

### TopAppBar.tsx ✅
**Status:** Implemented and tested
**Type:** Client Component (`"use client"`)
**Location:** `src/components/TopAppBar.tsx`

**Props:**
```typescript
interface TopAppBarProps {
  userInitials?: string      // Default: "GB"
  userName?: string          // Default: "User"
}
```

**Features:**
- Fixed position (top, z-50)
- Hamburger menu (left) with dropdown
- Logo "GarageOS" (center, serif italic, gold)
- User avatar (right, initials in circle)
- Responsive: backdrop blur, glass effect
- Links to Dashboard, Termine, Settings

**Used in:** `app/layout.tsx` (global)

**Styling:**
- `glass-card` backdrop blur
- Colors: primary (#e9c349), surface-container
- Fonts: font-serif (Newsreader)

---

### BottomNav.tsx ✅
**Status:** Implemented and tested
**Type:** Client Component (`"use client"`)
**Location:** `src/components/BottomNav.tsx`

**Props:**
```typescript
interface BottomNavProps {
  activeTab?: 'sammlung' | 'termine' | 'einstellungen'
}
```

**Features:**
- Fixed position (bottom, z-50)
- Mobile only (`lg:hidden`)
- 4 navigation items with icons
- Active state highlights in gold
- Links:
  - Sammlung → /dashboard
  - Termine → /termine
  - Einstellungen → /settings
  - (4th item for future)
- Padding for safe area

**Used in:** `app/layout.tsx` (global)

**Styling:**
- Icon color: on-surface or primary (active)
- Background: surface-container
- Border-top: outline-variant

---

## 📱 Page Components

### Dashboard Page ✅
**Status:** Implemented and tested
**Type:** Server Component (async)
**Location:** `app/dashboard/page.tsx`

**Features:**
- Fetches vehicles from Supabase (user_id filter)
- Renders Vehicle Grid with VehicleCard components
- Add Vehicle placeholder card (dashed border)
- Empty state when no vehicles
- Responsive: grid-cols-1 → md:grid-cols-2 → lg:grid-cols-3 xl:grid-cols-4
- TopAppBar + BottomNav included
- Loading state with skeletons (via `loading.tsx`)

**Data:**
```typescript
const { data: vehicles } = await supabase
  .from('vehicles')
  .select('*')
  .eq('user_id', user.id)
```

**Styling:**
- Gap between cards: gap-6
- Padding: px-6 lg:px-12, pt-28 pb-20 (space for TopAppBar/BottomNav)
- Container: max-w-7xl mx-auto

---

### Vehicle Details Page 🚧
**Status:** Partially implemented
**Type:** Server Component (async)
**Location:** `app/vehicles/[id]/page.tsx`

**Features:**
- Back button to /dashboard
- Hero section:
  - Image (right, large)
  - Title: Make + Model (left, text-7xl)
  - Category badge (top-left)
  - Description with border-left
  - Action buttons: Edit (gold), Service (outline)
  - Floating stats card (PS, 0-100)
- Specifications grid (4 cols on desktop)
  - Fields: Make, Model, Year, Color, VIN, Plate, Bought, Location
  - Hover effect: bg-primary/[0.02]
- Insurance & Assets section
  - Insurance card (Allianz, Active status)
  - "Add Document" button (dashed)
- TopAppBar + BottomNav

**Data:**
```typescript
const { data: vehicle } = await supabase
  .from('vehicles')
  .select('*')
  .eq('id', params.id)
  .single()
```

**Styling:**
- Grid: order-1/order-2 for mobile reorder
- Colors: primary, on-surface, on-surface-variant
- Fonts: headline (Newsreader italic), body
- Classes: glass-card, champagne-gradient

---

### Maintenance Tracker Page ✅
**Status:** Implemented and tested
**Type:** Server Component (async)
**Location:** `app/termine/page.tsx`

**Features:**
- Fetches maintenance_tasks from Supabase
- Filter tabs: All / Maintenance / Reminders
- List of maintenance tasks with:
  - Title
  - Due date
  - Status badge (Planned, Completed, Overdue)
  - Category badge
  - Action buttons
- FAB (gold gradient) to /termine/new
- Empty state when no tasks
- Responsive: list on mobile, grid on desktop
- TopAppBar + BottomNav

**Data:**
```typescript
const { data: tasks } = await supabase
  .from('maintenance_tasks')
  .select('*')
  .eq('user_id', user.id)
  .order('due_date', { ascending: true })
```

**Styling:**
- Status badges: colors based on status
- FAB: champagne-gradient, fixed bottom-right
- Cards: glass-card effect
- Border: outline-variant/20

---

### Settings Page ✅
**Status:** Implemented and tested
**Type:** Client Component (`"use client"`)
**Location:** `app/settings/page.tsx`

**Features:**
- User profile display (email, initials)
- Single view: "Meine Fahrzeuge & Benutzer"
- Vehicle list with grid display
- Guest users management:
  - AddUserForm to invite new guests
  - UsersTable showing guest users
  - User deletion with confirmation
- Guest invitation workflow:
  - Email + vehicle selection
  - Resend email integration
  - Token-based 24hr expiration
- User deletion:
  - Revoke all vehicle access
  - Confirmation dialog
  - Automatic data cleanup
- TopAppBar + BottomNav

**Data:**
```typescript
const { data: vehicles } = await supabase
  .from('vehicles')
  .select('*')
  .eq('user_id', user.id)

const { data: users } = await supabase
  .from('user_access')
  .select('*')
  .eq('owner_id', user.id)
```

**Styling:**
- Cards: glass-card, gap-4
- Forms: input + select components
- User list: grid layout responsive

---

## 🎨 Reusable Components

### VehicleCard.tsx ✅
**Status:** Implemented and tested
**Type:** Client Component (`"use client"`)
**Location:** `src/components/VehicleCard.tsx`

**Props:**
```typescript
interface VehicleCardProps {
  id: string
  make: string
  model: string
  year?: number
  mileage?: number
  color?: string
  category: 'modern' | 'oldtimer' | 'youngtimer'
  coverPhotoUrl?: string
}
```

**Features:**
- Card with image (4:5 aspect ratio)
- Hover: scale-110 on image, gradient overlay
- Metadata below:
  - Headline (italic)
  - Category badge with color
  - Year / KM / Color
- Link to `/vehicles/${id}`
- Fallback: gradient + icon if no photo
- Optional chaining for nullable fields

**Styling:**
- Aspect: aspect-[4/5]
- Hover: scale-110 transition-300
- Image: object-cover
- Gradient overlay: from-black/0 to-black/70
- Category badges: different colors per category
- Fonts: headline (Newsreader italic), body

---

### MaintenanceCard.tsx 🚧
**Status:** In progress
**Type:** Client Component (`"use client"`)
**Location:** `src/components/MaintenanceCard.tsx`

**Props:**
```typescript
interface MaintenanceCardProps {
  id: string
  title: string
  category: 'maintenance' | 'reminder' | 'inspection'
  dueDate: string
  status: 'planned' | 'completed' | 'overdue'
  priority?: 'low' | 'normal' | 'high'
  vehicleId?: string
}
```

**Features:**
- Card with title, category, due date
- Status badge (color-coded)
- Priority indicator (if high)
- Action buttons (Edit, Complete, Delete)
- Hover effect: bg-primary/[0.02]

**Styling:**
- Background: surface-container-low
- Border: outline-variant/20
- Status colors: green (completed), amber (pending), red (overdue)

---

### AddUserForm.tsx ✅
**Status:** Implemented and tested
**Type:** Client Component (`"use client"`)
**Location:** `src/components/AddUserForm.tsx`

**Props:**
```typescript
interface AddUserFormProps {
  vehicles: Vehicle[]
  onUserAdded?: (email: string) => void
}
```

**Features:**
- Form to invite guest via email
- Email input field
- Vehicle selection (checkboxes or multi-select)
- Permission level select (can_view, can_edit, can_upload)
- Expiry date picker (optional)
- Submit button
- Resend email integration
- Error handling + loading state
- Token-based invitation (24hr expiry)

**Styling:**
- Input: border-outline-variant
- Select: chevron-down icon
- Button: gold gradient (primary)
- Spacing: gap-4

---

### UsersTable.tsx ✅
**Status:** Implemented and tested
**Type:** Client Component (`"use client"`)
**Location:** `src/components/UsersTable.tsx`

**Props:**
```typescript
interface UsersTableProps {
  users: UserAccess[]
  onRevoke?: (userId: string) => void
}
```

**Features:**
- Table of guest users
- Columns:
  - User (email)
  - Vehicles count
  - Permissions (can_view, can_edit, can_upload)
  - Actions (Delete/Revoke)
- Mobile: stacked card layout
- Desktop: table layout
- Delete confirmation dialog
- API integration for revocation

**Styling:**
- Desktop: table with borders
- Mobile: cards with grid layout
- Permission badge: color-coded
- Hover: bg-primary/[0.02]

---

### VehiclePermissionsModal.tsx ✅
**Status:** Implemented and tested
**Type:** Client Component (`"use client"`)
**Location:** `src/components/VehiclePermissionsModal.tsx`

**Props:**
```typescript
interface VehiclePermissionsModalProps {
  vehicles: Vehicle[]
  selectedVehicles?: string[]
  onConfirm?: (vehicleIds: string[]) => void
}
```

**Features:**
- Modal to select vehicles for sharing
- Checkbox list of user's vehicles
- "Select All" / "Clear" buttons
- Confirm + Cancel buttons
- Shows vehicle make/model/year

**Styling:**
- Modal: surface-container background
- Checkbox: primary color when checked
- Buttons: primary (confirm) + outline (cancel)

---

## 🔄 Loading & Error States

### app/dashboard/loading.tsx ✅
**Status:** Implemented
**Type:** Loading Skeleton
**Location:** `app/dashboard/loading.tsx`

**Features:**
- Skeleton cards in same grid layout as dashboard
- Animated shimmer effect
- 6 placeholder cards
- Responsive grid

---

### DeleteUserDialog.tsx ✅
**Status:** Implemented and tested
**Type:** Client Component (`"use client"`)
**Location:** `src/components/DeleteUserDialog.tsx`

**Props:**
```typescript
interface DeleteUserDialogProps {
  userName: string
  onConfirm?: () => void
  onCancel?: () => void
}
```

**Features:**
- Confirmation dialog for user deletion
- Warning message: "This will revoke all access"
- Confirm + Cancel buttons
- Loading state during deletion

**Styling:**
- Modal: surface-container background
- Warning text: amber color
- Buttons: primary (confirm) + outline (cancel)

---

### SetPasswordForm.tsx ✅
**Status:** Implemented and tested
**Type:** Client Component (`"use client"`)
**Location:** `src/app/auth/set-password/[token]/page.tsx`

**Features:**
- Password setup page for new invitees
- Token validation on mount
- Password input with show/hide toggle
- Confirm password field
- Real-time validation feedback
- Password requirements: min 8 chars
- Submit button
- Success state with auto-redirect
- Error handling for expired tokens
- Fallback to login on error

**Styling:**
- Input: border-outline-variant
- Eye/EyeOff icons: toggle visibility
- Success message: green color
- Error message: red color

---

### error.tsx (Global) ❌
**Status:** TODO
**Type:** Error Boundary
**Location:** `app/error.tsx` (if needed)

**Features (Planned):**
- Catch errors in page
- Display error message
- Retry button
- Link to dashboard

---

## 🧩 shadcn/ui Components Used

| Component | Used In | Status |
|-----------|---------|--------|
| **Button** | TopAppBar, Forms, Cards | ✅ |
| **Input** | Forms (ShareForm) | ✅ |
| **Select** | Filters, Permission dropdown | ✅ |
| **Tabs** | Settings page | ✅ |
| **DropdownMenu** | TopAppBar menu | ✅ |
| **Checkbox** | Forms | ✅ |
| **DatePicker** | Expiry date in ShareForm | 🚧 |
| **Dialog** | Confirm delete shares | ❌ |
| **Badge** | Category, Status, Priority badges | ✅ |

---

## 📊 Component Summary

| Component | Type | Status | Used In |
|-----------|------|--------|---------|
| **TopAppBar** | Layout | ✅ | app/layout.tsx |
| **BottomNav** | Layout | ✅ | app/layout.tsx |
| **VehicleCard** | Reusable | ✅ | Dashboard, Settings |
| **MaintenanceCard** | Reusable | 🚧 | Termine page |
| **AddUserForm** | Reusable | ✅ | Settings page |
| **UsersTable** | Reusable | ✅ | Settings page |
| **VehiclePermissionsModal** | Reusable | ✅ | Settings page |
| **DeleteUserDialog** | Reusable | ✅ | Settings page |
| **SetPasswordForm** | Reusable | ✅ | Auth set-password page |
| **Dashboard** | Page | ✅ | app/dashboard/page.tsx |
| **Vehicle Details** | Page | 🚧 | app/vehicles/[id]/page.tsx |
| **Termine** | Page | ✅ | app/termine/page.tsx |
| **Settings** | Page | ✅ | app/settings/page.tsx |

---

## 🚀 Next Steps (Phase 2)

1. **Guest Dashboard** — /dashboard/shared route for guests to see shared vehicles
2. **Payment Integration** — Stripe billing page at /billing
3. **Photo Uploads** — Vehicle photos table + S3 integration
4. **Complete Vehicle Details Page** — Hero section styling, photo gallery
5. **Add Error Boundaries** — app/error.tsx for error handling
6. **Create Add Vehicle Page** — app/vehicles/new/page.tsx
7. **Create Edit Vehicle Page** — app/vehicles/[id]/edit/page.tsx

---

**Letzte Aktualisierung:** 2026-03-23 · **Completion:** 85% ✅ (Phase 1 Complete)
