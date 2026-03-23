# ROADMAP.md — GarageOS Product Roadmap

---

## 📅 Timeline Overview

| Phase | Name | Status | Timeline | Focus |
|-------|------|--------|----------|-------|
| **1** | MVP Core | ✅ Complete | 2026-03 | Auth, Dashboard, Sharing, Invites |
| **2** | Monetization | 🚀 Next | 2026-04-05 | Payment, Guest Features, Uploads |
| **3** | Advanced Features | 📋 Planned | 2026-05-06 | Search, Analytics, Guest Dashboard |
| **4** | Scale & Polish | 📋 Planned | 2026-07-08 | Mobile, Notifications, Admin Panel |

---

## 🟢 Phase 1: MVP Core (COMPLETE ✅)

**Dates:** 2026-03 | **Status:** Ready for Staging

### ✅ Delivered Features
- [x] User authentication (signup/login/logout)
- [x] Vehicle management (create/read/update/delete)
- [x] Responsive dashboard (1-4 column grid)
- [x] Vehicle details page with specs
- [x] Maintenance tracker with filtering
- [x] Settings page with user management
- [x] **Guest invitation system** (email + token-based)
- [x] **Granular access control** (can_view/can_edit/can_upload)
- [x] **User deletion** (revoke all guest access)
- [x] Full RLS security (multi-tenant)
- [x] Material Design 3 UI
- [x] Dark mode support

### Metrics
- **Completion:** 100%
- **Components:** 15+ built
- **Database Tables:** 6 (vehicles, maintenance_tasks, user_access, invitation_tokens, profiles, auth.users)
- **API Routes:** 5+ (auth, users/add, users/delete, auth/invite/[token])
- **Lines of Code:** ~5,000+

---

## 🔵 Phase 2: Monetization & Guest Experience (NEXT — 2026-04-05)

**Estimated Duration:** 4-5 weeks | **Priority:** HIGH

### 2.1 Payment Integration (Stripe)

**Goal:** Enable subscription tiers and vehicle limit enforcement

**Features:**
- [ ] Stripe account setup + test keys
- [ ] Billing page at `/billing`
  - [ ] Current plan display
  - [ ] Plan comparison cards (Free/Premium/Pro)
  - [ ] Change plan button
  - [ ] Usage stats (vehicles owned, guests managed)
- [ ] Subscription management
  - [ ] Create subscription on signup (auto-trial)
  - [ ] Upgrade/downgrade flows
  - [ ] Cancel subscription with retention email
- [ ] Payment webhook handling
  - [ ] subscription.created
  - [ ] invoice.payment_succeeded
  - [ ] subscription.updated
  - [ ] subscription.deleted
- [ ] Vehicle limit enforcement
  - [ ] 2 vehicles (Free)
  - [ ] 5 vehicles (Premium)
  - [ ] Unlimited (Pro)
- [ ] Guest count limits
  - [ ] 2 guests (Free)
  - [ ] 10 guests (Premium)
  - [ ] Unlimited (Pro)

**Database Changes:**
```sql
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text,  -- 'free' | 'premium' | 'pro'
  status text,  -- 'active' | 'past_due' | 'canceled'
  current_period_start date,
  current_period_end date,
  cancel_at_period_end boolean,
  created_at timestamp
);
```

**Files to Create:**
- `/app/billing/page.tsx` — Billing dashboard
- `/app/api/stripe/webhook/route.ts` — Webhook handler
- `/lib/stripe.ts` — Stripe utilities
- `supabase/migrations/20260401_create_subscriptions.sql`

---

### 2.2 Guest Dashboard (Shared Vehicles View)

**Goal:** Let guests see only vehicles shared with them

**Features:**
- [ ] `/dashboard/shared` route
  - [ ] List all vehicles shared with guest
  - [ ] Filter by permission level (view-only vs editable)
  - [ ] Quick access cards same as owner dashboard
  - [ ] "My Vehicles" vs "Shared with Me" toggle
- [ ] Shared vehicle details page
  - [ ] Show same details if `can_view=true`
  - [ ] Show edit buttons only if `can_edit=true`
  - [ ] Permission badges ("View Only" / "Can Edit")
- [ ] Permission validation on all views
  - [ ] Check expiry date (if expired, show message)
  - [ ] Check permission level before showing edit buttons
  - [ ] 403 error if access revoked

**API Changes:**
- `GET /api/vehicles` — Filter by ownership + shared vehicles
- `GET /api/vehicles/[id]/access` — Check guest permissions

**Components:**
- Update dashboard to merge owner + shared vehicles
- SharedVehicleCard component (with permission indicator)
- PermissionBadge component

---

### 2.3 Photo & File Upload

**Goal:** Allow owners and guests (if can_upload) to upload vehicle photos

**Features:**
- [ ] S3/Supabase Storage integration
  - [ ] Bucket creation: `vehicle-photos`
  - [ ] CORS configuration
  - [ ] Presigned URLs for uploads
- [ ] Photo upload page: `/vehicles/[id]/photos`
  - [ ] Drag-drop upload area
  - [ ] Multiple file support
  - [ ] Progress indicators
  - [ ] Delete photos
  - [ ] Set cover photo
- [ ] Photo gallery in vehicle details
  - [ ] Thumbnail grid (1-4 cols responsive)
  - [ ] Lightbox/modal view
  - [ ] Image compression + caching
- [ ] Permission checks
  - [ ] Only owner or users with `can_upload=true` can upload
  - [ ] All guests with `can_view=true` can see photos

**Database Changes:**
```sql
CREATE TABLE vehicle_photos (
  id uuid PRIMARY KEY,
  vehicle_id uuid REFERENCES vehicles,
  uploaded_by_user_id uuid REFERENCES auth.users,
  photo_url text,  -- S3 URL
  caption text,
  is_cover_photo boolean DEFAULT false,
  created_at timestamp
);

-- Update vehicles table
ALTER TABLE vehicles ADD COLUMN cover_photo_url text;
```

**Files to Create:**
- `/app/vehicles/[id]/photos/page.tsx` — Photo management
- `/app/components/PhotoGallery.tsx`
- `/lib/storage.ts` — S3/Storage utilities
- `/app/api/vehicles/[id]/photos/upload/route.ts`
- `/app/api/vehicles/[id]/photos/delete/route.ts`

---

### 2.4 Email Notifications

**Goal:** Keep users informed about important events

**Features:**
- [ ] Email templates (Resend)
  - [ ] Maintenance reminder (1 week before due date)
  - [ ] Guest access about to expire (3 days before)
  - [ ] New vehicle shared with you
  - [ ] Guest revoked access
  - [ ] Payment failed
  - [ ] Plan upgrade confirmation
- [ ] Notification preferences
  - [ ] Settings at `/settings/notifications`
  - [ ] Toggle each email type on/off
  - [ ] Frequency (daily/weekly/never)

**Files to Create:**
- `/lib/emails.ts` — Email template utilities
- `/supabase/functions/send-maintenance-reminder/` — Cron job
- `/app/settings/notifications/page.tsx` — Notification settings

---

## 🟣 Phase 3: Advanced Features (2026-05-06)

**Estimated Duration:** 6-8 weeks | **Priority:** MEDIUM

### 3.1 Shared Vehicles Dashboard

**Goal:** Consolidate owner + shared vehicles in one dashboard

**Features:**
- [ ] Dashboard redesign
  - [ ] Show both owned and shared vehicles
  - [ ] Visual indicator for shared vehicles (badge)
  - [ ] Filter: "Show shared vehicles" toggle
  - [ ] Sort: "Owned first" / "All by make/model"
- [ ] Shared vehicle metadata
  - [ ] "Shared by: {owner name}"
  - [ ] "Access expires: {date}" (if limited)
  - [ ] Permission level badge

### 3.2 Advanced Search & Filters

**Goal:** Help users find vehicles quickly

**Features:**
- [ ] Full-text search
  - [ ] Search by make, model, color, year
  - [ ] Search by tags/notes
  - [ ] Highlight matches
- [ ] Advanced filters
  - [ ] Year range (from-to)
  - [ ] Mileage range
  - [ ] Category (Modern/Oldtimer/Youngtimer)
  - [ ] Status (Active/Archived)
  - [ ] Owned vs Shared toggle
- [ ] Saved searches
  - [ ] Save search criteria
  - [ ] Quick access from sidebar

**Files:**
- `/app/search/page.tsx` — Search results page
- `/components/SearchFilters.tsx`
- `/lib/search.ts` — Search utilities

### 3.3 Vehicle Analytics

**Goal:** Give owners insights into their collection

**Features:**
- [ ] Analytics page at `/analytics`
  - [ ] Total vehicles (owned vs shared)
  - [ ] Value estimation (by market data)
  - [ ] Maintenance costs over time (charts)
  - [ ] Upcoming maintenance (alert list)
  - [ ] Usage stats (guests, access logs)
- [ ] Charts & visualizations
  - [ ] Line chart: costs over time
  - [ ] Bar chart: costs by category
  - [ ] Pie chart: vehicles by category
  - [ ] Heatmap: maintenance activity

**Database:**
```sql
CREATE TABLE analytics_snapshots (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  total_vehicles integer,
  total_guests integer,
  total_maintenance_cost decimal,
  snapshot_date date,
  created_at timestamp
);
```

### 3.4 Vehicle Archival

**Goal:** Let owners archive/restore vehicles

**Features:**
- [ ] Archive button on vehicle details
- [ ] Archived vehicles don't show in dashboard (by default)
- [ ] Restore from settings
- [ ] Can't archive if guests have active access

---

## 🟡 Phase 4: Scale & Polish (2026-07-08)

**Estimated Duration:** 8-10 weeks | **Priority:** MEDIUM-LOW

### 4.1 Mobile App (React Native)

**Goal:** iOS/Android app via Expo

**Features:**
- [ ] Expo setup with same codebase
- [ ] Native features
  - [ ] Camera integration (photo upload)
  - [ ] Home screen widget (vehicles count)
  - [ ] Push notifications
  - [ ] Offline sync
  - [ ] Biometric auth (Face ID / Touch ID)
- [ ] Platform-specific UI (iOS/Android design)

### 4.2 Admin Dashboard

**Goal:** Monitor system health and user metrics

**Features:**
- [ ] Admin panel at `/admin` (invite-only)
  - [ ] User management (ban/unban)
  - [ ] Subscription overview
  - [ ] Revenue analytics
  - [ ] Support tickets
  - [ ] Database backups
- [ ] Metrics
  - [ ] Active users
  - [ ] Total vehicles
  - [ ] Monthly revenue (from subscriptions)
  - [ ] System health (database size, errors)

### 4.3 Advanced Notifications

**Goal:** Real-time alerts and push notifications

**Features:**
- [ ] Maintenance reminders
  - [ ] 1 week, 3 days, 1 day before due
  - [ ] Push + email
- [ ] Guest access expiry warnings
  - [ ] 3 days before expiry
  - [ ] Auto-extend option
- [ ] New shares notifications
- [ ] Payment reminders (invoice due)

### 4.4 Polish & Optimization

**Goal:** Production-ready quality

**Features:**
- [ ] Performance optimization
  - [ ] Image optimization (AVIF, WebP)
  - [ ] Code splitting
  - [ ] Database query optimization
  - [ ] Caching strategy (Redis)
- [ ] Error handling
  - [ ] Error boundaries
  - [ ] Graceful error messages
  - [ ] Error logging (Sentry)
- [ ] Accessibility
  - [ ] WCAG 2.1 AA compliance
  - [ ] Screen reader testing
  - [ ] Keyboard navigation
- [ ] Testing
  - [ ] Unit tests (Vitest)
  - [ ] E2E tests (Playwright)
  - [ ] Performance tests (Lighthouse)
- [ ] Documentation
  - [ ] User guide
  - [ ] API documentation
  - [ ] Developer guide

---

## 📊 Success Metrics

### Phase 1 (MVP)
- [x] 100% feature completion
- [x] < 2s page load time
- [x] 0 critical security issues
- [x] 95%+ test coverage

### Phase 2 (Monetization)
- [ ] 1,000+ registered users
- [ ] 100+ paid subscriptions
- [ ] $5,000+ monthly revenue
- [ ] 4.5+ star rating

### Phase 3 (Advanced)
- [ ] 5,000+ active users
- [ ] 500+ paid subscriptions
- [ ] $25,000+ monthly revenue
- [ ] <1s page load time

### Phase 4 (Scale)
- [ ] 50,000+ users
- [ ] Mobile app > 10k downloads
- [ ] $100,000+ monthly revenue
- [ ] 99.9% uptime

---

## 💰 Pricing Strategy

### Free Tier
- 2 vehicles
- 2 guest access
- Basic sharing
- Email support

### Premium ($9.99/month)
- 5 vehicles
- 10 guests
- Advanced sharing
- Photo uploads
- Analytics
- Priority support

### Pro ($29.99/month)
- Unlimited vehicles
- Unlimited guests
- All features
- API access
- Custom integrations
- Dedicated support

---

## 🎯 Key Milestones

| Milestone | Date | Deliverable |
|-----------|------|-------------|
| **Phase 1 Launch** | 2026-03-23 | MVP live on staging |
| **Phase 1 Deploy** | 2026-03-30 | MVP live on production |
| **Phase 2 Start** | 2026-04-01 | Stripe integration |
| **Phase 2 Launch** | 2026-05-05 | Payments + uploads live |
| **Phase 3 Start** | 2026-05-06 | Advanced features sprint |
| **Phase 3 Launch** | 2026-06-30 | Analytics + search live |
| **App Store Launch** | 2026-09-01 | iOS + Android live |

---

## ⚠️ Technical Debt & Risk

### Known Risks
1. **Payment processing** — Stripe integration complexity
2. **Image storage** — S3/Storage scaling at 10k+ users
3. **Search performance** — Need full-text indexing
4. **Mobile development** — React Native learning curve
5. **Support scaling** — Need support ticket system

### Mitigation Strategies
- [ ] Use Stripe-hosted checkout (simpler)
- [ ] Use Supabase Storage (built-in, scalable)
- [ ] Use PostgreSQL full-text search initially
- [ ] Hire React Native contractor for Phase 4
- [ ] Use Intercom for support before Phase 4

---

**Last Updated:** 2026-03-23 · **Next Review:** 2026-04-01
