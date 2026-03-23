# DATABASE.md — GarageOS Schema & RLS

---

## 📊 Database Overview

**Type:** PostgreSQL (Supabase)
**Auth:** JWT (Supabase Auth)
**Multi-tenant:** Yes (via user_id + RLS)
**Location:** `supabase/migrations/`

---

## 📋 All Tables

### 1. **auth.users** (Supabase Built-in)

```sql
id (uuid, pk)
email (text, unique)
created_at (timestamp)
last_sign_in_at (timestamp)
email_confirmed_at (timestamp, nullable)
```

**RLS:** Managed by Supabase Auth
**Notes:** Created automatically by Supabase

---

### 2. **vehicles** ⭐ Core Table

```sql
CREATE TABLE vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  make text NOT NULL,                    -- e.g. "Porsche"
  model text NOT NULL,                   -- e.g. "911 Carrera"
  year integer,                          -- e.g. 2023
  color text,                            -- e.g. "DEEP SILVER"
  category text NOT NULL,                -- 'modern' | 'oldtimer' | 'youngtimer'
  current_mileage integer,               -- in km
  vin text UNIQUE,                       -- VIN for identification
  license_plate text,                    -- Registration plate
  cover_photo_url text,                  -- S3 URL (if file uploads enabled)
  purchase_date date,                    -- When purchased
  location text,                         -- Where parked
  notes text,                            -- Free text notes
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
```

**RLS Policy:**
```sql
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own vehicles" ON vehicles
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vehicles" ON vehicles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vehicles" ON vehicles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own vehicles" ON vehicles
  FOR DELETE
  USING (auth.uid() = user_id);
```

**Relationships:**
- Owns many `maintenance_tasks`
- Owns many `vehicle_shares`
- Owns many `vehicle_photos`
- Owns many `vehicle_tires`

---

### 3. **maintenance_tasks** — Termine

```sql
CREATE TABLE maintenance_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  title text NOT NULL,                   -- e.g. "Öl wechseln"
  description text,                      -- Details
  category text NOT NULL,                -- 'maintenance' | 'reminder' | 'inspection'
  due_date date NOT NULL,
  completed_at timestamp,
  status text NOT NULL,                  -- 'planned' | 'completed' | 'overdue'
  priority text DEFAULT 'normal',        -- 'low' | 'normal' | 'high'
  cost_estimated decimal(10,2),          -- Estimated cost
  cost_actual decimal(10,2),             -- Actual cost (if completed)
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
```

**RLS Policy:**
```sql
ALTER TABLE maintenance_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own vehicle maintenance" ON maintenance_tasks
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Can insert own maintenance" ON maintenance_tasks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

**Relationships:**
- Belongs to `vehicles`
- Belongs to `users`

---

### 4. **profiles** ✅ User Profiles

```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
```

**Auto-synced from auth.users via trigger:**
- Trigger on `auth.users` INSERT/UPDATE auto-populates profiles
- Used for safe email lookups (auth.users is private)

**RLS Policy:**
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);
```

---

### 5. **user_access** ✅ Granular Guest Access Control

```sql
CREATE TABLE user_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  can_view boolean DEFAULT true,        -- Can view vehicle details
  can_edit boolean DEFAULT false,       -- Can edit vehicle info
  can_upload boolean DEFAULT false,     -- Can upload photos/documents
  expires_at timestamp,                 -- NULL = never expires
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),

  UNIQUE(owner_id, guest_user_id, vehicle_id),
  CHECK (owner_id != guest_user_id)
);
```

**RLS Policy:**
```sql
ALTER TABLE user_access ENABLE ROW LEVEL SECURITY;

-- Owners see shares they created
CREATE POLICY "Owners see their guest access grants"
  ON user_access FOR SELECT
  USING (owner_id = auth.uid());

-- Guests see vehicles shared with them
CREATE POLICY "Guests see their access grants"
  ON user_access FOR SELECT
  USING (guest_user_id = auth.uid());

-- Only owners can create/update/delete their own grants
CREATE POLICY "Owners manage their guest access"
  ON user_access FOR ALL
  USING (owner_id = auth.uid());
```

**Indexes:**
```sql
CREATE INDEX idx_user_access_owner ON user_access(owner_id);
CREATE INDEX idx_user_access_guest ON user_access(guest_user_id);
CREATE INDEX idx_user_access_vehicle ON user_access(vehicle_id);
CREATE INDEX idx_user_access_expires ON user_access(expires_at);
```

**Relationships:**
- Belongs to `users` (owner)
- Belongs to `users` (guest)
- Belongs to `vehicles` (shared vehicle)

---

### 6. **invitation_tokens** ✅ Guest Invitations

```sql
CREATE TABLE invitation_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE,           -- 32-byte hex token (256 bits entropy)
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,  -- Nullable until claimed
  email text NOT NULL,                  -- Email being invited
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_ids uuid[] NOT NULL,          -- Array of vehicle UUIDs to grant access
  expires_at timestamp NOT NULL,        -- 24 hours from creation
  created_at timestamp DEFAULT now(),
  used_at timestamp                     -- When invitation was claimed
);
```

**RLS Policy:**
```sql
ALTER TABLE invitation_tokens ENABLE ROW LEVEL SECURITY;

-- Users see invitations sent to them or by them
CREATE POLICY "Users see their invitations"
  ON invitation_tokens FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR owner_id = auth.uid());

-- Service role manages invitations
CREATE POLICY "Service role manages invitations"
  ON invitation_tokens
  TO service_role
  USING (true)
  WITH CHECK (true);
```

**Indexes:**
```sql
CREATE INDEX idx_invitation_tokens_token ON invitation_tokens(token);
CREATE INDEX idx_invitation_tokens_user ON invitation_tokens(user_id);
CREATE INDEX idx_invitation_tokens_expires ON invitation_tokens(expires_at);
```

**Lifecycle:**
1. Created when inviting new user
2. User clicks email link with token
3. User sets password → auth.users created
4. user_id populated, used_at set
5. user_access records auto-created
6. Token can be deleted after 24hrs or when used

---

### 7. **vehicle_photos** — Photo Storage (PLANNED)

```sql
CREATE TABLE vehicle_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  uploaded_by_user_id uuid NOT NULL REFERENCES auth.users(id),
  photo_url text NOT NULL,               -- S3 URL
  caption text,
  is_cover_photo boolean DEFAULT false,  -- If true, sets vehicle.cover_photo_url
  created_at timestamp DEFAULT now()
);
```

**RLS Policy:**
```sql
ALTER TABLE vehicle_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see vehicle photos they have access to" ON vehicle_photos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM vehicles v
      WHERE v.id = vehicle_id AND (
        v.user_id = auth.uid() OR
        EXISTS (SELECT 1 FROM vehicle_shares vs
          WHERE vs.vehicle_id = v.id
          AND vs.shared_with_user_id = auth.uid()
          AND vs.permission_level IN ('can_edit', 'can_upload'))
      )
    )
  );

CREATE POLICY "Users can upload to their vehicles" ON vehicle_photos
  FOR INSERT
  WITH CHECK (
    uploaded_by_user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM vehicles v
      WHERE v.id = vehicle_id AND v.user_id = auth.uid()
    )
  );
```

---

### 8. **vehicle_tires** — Tire Tracking (PLANNED)

```sql
CREATE TABLE vehicle_tires (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  position text NOT NULL,                -- 'front_left' | 'front_right' | 'rear_left' | 'rear_right'
  brand text,                            -- e.g. "Michelin"
  model text,                            -- e.g. "Pilot Sport 4"
  size text,                             -- e.g. "245/40R18"
  purchase_date date,
  last_rotation_date date,
  condition text,                        -- 'new' | 'good' | 'worn' | 'replace_soon'
  tread_depth_mm decimal(3,1),          -- in millimeters
  notes text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),

  UNIQUE(vehicle_id, position)
);
```

**RLS Policy:**
```sql
ALTER TABLE vehicle_tires ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see tires of their vehicles" ON vehicle_tires
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM vehicles WHERE id = vehicle_id AND user_id = auth.uid())
  );
```

---

## 🔗 Relationships Diagram

```
auth.users (Supabase)
  ├─── profiles (synced from auth.users)
  │
  ├─── vehicles (user_id = owner)
  │     ├─── maintenance_tasks (vehicle_id)
  │     ├─── user_access (vehicle_id) ← guests can access via permissions
  │     ├─── vehicle_photos (vehicle_id)
  │     └─── vehicle_tires (vehicle_id)
  │
  ├─── user_access (owner_id)
  │     └─ guest_user_id (who gets access)
  │
  └─── invitation_tokens (owner_id)
        └─ email (who to invite)
```

---

## 🔐 RLS Summary (Phase 1 Complete)

| Table | Owner Only | Owner + Guest | Public | Service Role |
|-------|-----------|----------------|--------|--------------|
| **vehicles** | ✅ | ❌ | ❌ | — |
| **maintenance_tasks** | ✅ | ❌ | ❌ | — |
| **user_access** | ✅ (manage) | ✅ (see) | ❌ | — |
| **invitation_tokens** | ✅ (see) | — | ❌ | ✅ |
| **profiles** | ❌ | ❌ | ✅ (read) | — |
| **vehicle_photos** | ✅ | ✅ (if can_upload) | ❌ | — |
| **vehicle_tires** | ✅ | ❌ | ❌ | — |

---

## 🚀 Migrations (supabase/migrations/)

### ✅ Completed Migrations (Phase 1)
1. **20240320_init.sql** — Initial schema + auth setup
2. **20260323_create_vehicles.sql** — vehicles table + RLS
3. **20260323_create_maintenance_tasks.sql** — maintenance_tasks + RLS
4. **20260323_create_profiles_table.sql** — profiles table + sync trigger
5. **20260323_create_user_access.sql** — user_access table + RLS + indexes
6. **20260323_create_invitation_tokens.sql** — invitation_tokens + RLS + indexes

### Planned Migrations (Phase 2-3)
- `20260324_create_vehicle_photos.sql` — Photos + RLS
- `20260324_create_vehicle_tires.sql` — Tires + RLS
- `20260325_add_payment_methods.sql` — Payment integration
- `20260326_add_shared_vehicles_view.sql` — Materialized view for guest dashboard

---

## 📝 Important Notes

1. **NEVER delete migrations** — Only add new ones. Database history is immutable.
2. **RLS must be ON for every table** — Security critical, prevents data leaks
3. **Always filter by user_id in queries** — Enforced via RLS + application code
4. **Use ON DELETE CASCADE** — Automatic cleanup when user/vehicle deleted
5. **Unique constraints** — Prevent duplicate shares/access grants
6. **Timestamps** — created_at, updated_at on all tables for audit trail
7. **Service role key only in Edge Functions** — Never in frontend code
8. **Profiles table is public** — Needed for guest invitations (safe email lookup)

---

## 🧪 Testing RLS

```sql
-- Test as owner: see own vehicles
SELECT * FROM vehicles WHERE user_id = auth.uid(); -- ✅ Works

-- Test as guest: can't see owner's vehicles directly
SELECT * FROM vehicles WHERE user_id = 'owner-id'; -- ❌ Returns empty (RLS blocks)

-- Test user_access: guest sees permission grants
SELECT * FROM user_access WHERE guest_user_id = auth.uid(); -- ✅ Works

-- Test invitation: owner can see their tokens
SELECT * FROM invitation_tokens WHERE owner_id = auth.uid(); -- ✅ Works

-- Test profiles: public email lookup for invitations
SELECT * FROM profiles WHERE email = 'guest@example.com'; -- ✅ Works (safe)
```

---

## Migration Checklist

Before each migration:
```sql
-- Check syntax
SELECT * FROM pg_prepared_statements;

-- Verify RLS is enabled
SELECT tablename FROM pg_tables WHERE schemaname='public';
SELECT * FROM pg_policies WHERE tablename='your_table';

-- Test with sample data before deploying
INSERT INTO your_table VALUES (...);
```

---

**Letzte Aktualisierung:** 2026-03-23 · **Status:** Phase 1 Complete ✅ · **Next:** Phase 2 (Payments + Shared Dashboard)
