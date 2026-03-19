-- GarageOS Database Schema Migration
-- Complete database setup with RLS policies and storage

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Standorte (Locations)
create table locations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  address text,
  type text,
  climate_controlled boolean default false,
  contact_name text,
  contact_phone text,
  notes text,
  created_at timestamptz default now()
);

-- Fahrzeuge (Vehicles)
create table vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  make text not null,
  model text not null,
  year integer,
  plate text,
  vin text,
  color text,
  country_code text default 'DE',
  category text default 'modern',
  purchase_date date,
  purchase_price numeric,
  current_mileage integer,
  last_driven_date date,
  max_standzeit_weeks integer default 4,
  location_id uuid references locations,
  cover_photo_url text,
  notes text,
  created_at timestamptz default now()
);

-- Dokumente (Documents)
create table documents (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references vehicles on delete cascade not null,
  user_id uuid references auth.users not null,
  type text,
  file_url text not null,
  file_name text,
  expires_at date,
  notes text,
  uploaded_at timestamptz default now()
);

-- Erinnerungen (Reminders)
create table reminders (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references vehicles on delete cascade not null,
  user_id uuid references auth.users not null,
  type text not null,
  title text not null,
  due_date date not null,
  repeat_months integer,
  status text default 'open',
  notified_30 boolean default false,
  notified_7 boolean default false,
  notified_1 boolean default false,
  notes text,
  created_at timestamptz default now()
);

-- Wartung (Maintenance)
create table maintenance (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references vehicles on delete cascade not null,
  user_id uuid references auth.users not null,
  date date not null,
  title text not null,
  description text,
  workshop text,
  cost numeric,
  mileage integer,
  created_at timestamptz default now()
);

-- Reifen (Tires)
create table tires (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references vehicles on delete cascade not null,
  user_id uuid references auth.users not null,
  type text not null,
  brand text,
  size text,
  purchase_date date,
  mileage_km integer default 0,
  tread_depth_mm numeric,
  condition text,
  storage_location text,
  last_mounted_date date,
  notes text,
  created_at timestamptz default now()
);

-- Fahrten (Drives)
create table drives (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references vehicles on delete cascade not null,
  user_id uuid references auth.users not null,
  date date not null,
  km_driven integer,
  mileage_after integer,
  notes text,
  created_at timestamptz default now()
);

-- Rollen (User Roles)
create table user_roles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users not null,
  member_email text not null,
  member_id uuid references auth.users,
  role text not null,
  created_at timestamptz default now()
);

-- ============================================
-- INDEXES
-- ============================================

-- Locations indexes
create index idx_locations_user_id on locations(user_id);

-- Vehicles indexes
create index idx_vehicles_user_id on vehicles(user_id);
create index idx_vehicles_location_id on vehicles(location_id);

-- Documents indexes
create index idx_documents_vehicle_id on documents(vehicle_id);
create index idx_documents_user_id on documents(user_id);

-- Reminders indexes
create index idx_reminders_vehicle_id on reminders(vehicle_id);
create index idx_reminders_user_id on reminders(user_id);
create index idx_reminders_due_date on reminders(due_date);

-- Maintenance indexes
create index idx_maintenance_vehicle_id on maintenance(vehicle_id);
create index idx_maintenance_user_id on maintenance(user_id);
create index idx_maintenance_date on maintenance(date);

-- Tires indexes
create index idx_tires_vehicle_id on tires(vehicle_id);
create index idx_tires_user_id on tires(user_id);

-- Drives indexes
create index idx_drives_vehicle_id on drives(vehicle_id);
create index idx_drives_user_id on drives(user_id);
create index idx_drives_date on drives(date);

-- User roles indexes
create index idx_user_roles_owner_id on user_roles(owner_id);
create index idx_user_roles_member_id on user_roles(member_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
alter table locations enable row level security;
alter table vehicles enable row level security;
alter table documents enable row level security;
alter table reminders enable row level security;
alter table maintenance enable row level security;
alter table tires enable row level security;
alter table drives enable row level security;
alter table user_roles enable row level security;

-- Locations RLS Policies
create policy "Users can view their own locations"
  on locations for select
  using (auth.uid() = user_id);

create policy "Users can insert their own locations"
  on locations for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own locations"
  on locations for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own locations"
  on locations for delete
  using (auth.uid() = user_id);

-- Vehicles RLS Policies
create policy "Users can view their own vehicles"
  on vehicles for select
  using (auth.uid() = user_id);

create policy "Users can insert their own vehicles"
  on vehicles for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own vehicles"
  on vehicles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own vehicles"
  on vehicles for delete
  using (auth.uid() = user_id);

-- Documents RLS Policies
create policy "Users can view their own documents"
  on documents for select
  using (auth.uid() = user_id);

create policy "Users can insert their own documents"
  on documents for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own documents"
  on documents for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own documents"
  on documents for delete
  using (auth.uid() = user_id);

-- Reminders RLS Policies
create policy "Users can view their own reminders"
  on reminders for select
  using (auth.uid() = user_id);

create policy "Users can insert their own reminders"
  on reminders for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own reminders"
  on reminders for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own reminders"
  on reminders for delete
  using (auth.uid() = user_id);

-- Maintenance RLS Policies
create policy "Users can view their own maintenance records"
  on maintenance for select
  using (auth.uid() = user_id);

create policy "Users can insert their own maintenance records"
  on maintenance for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own maintenance records"
  on maintenance for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own maintenance records"
  on maintenance for delete
  using (auth.uid() = user_id);

-- Tires RLS Policies
create policy "Users can view their own tire records"
  on tires for select
  using (auth.uid() = user_id);

create policy "Users can insert their own tire records"
  on tires for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own tire records"
  on tires for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own tire records"
  on tires for delete
  using (auth.uid() = user_id);

-- Drives RLS Policies
create policy "Users can view their own drives"
  on drives for select
  using (auth.uid() = user_id);

create policy "Users can insert their own drives"
  on drives for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own drives"
  on drives for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own drives"
  on drives for delete
  using (auth.uid() = user_id);

-- User Roles RLS Policies
create policy "Users can view their own roles"
  on user_roles for select
  using (auth.uid() = owner_id or auth.uid() = member_id);

create policy "Users can insert roles for their vehicles"
  on user_roles for insert
  with check (auth.uid() = owner_id);

create policy "Users can update their own roles"
  on user_roles for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Users can delete their own roles"
  on user_roles for delete
  using (auth.uid() = owner_id);

-- ============================================
-- STORAGE
-- ============================================

-- Create storage bucket for vehicle files
insert into storage.buckets (id, name, public)
values ('vehicle-files', 'vehicle-files', false)
on conflict (id) do nothing;

-- Storage bucket RLS Policies - Users can upload files
create policy "Users can upload files to their vehicle folder"
  on storage.objects for insert
  with check (
    bucket_id = 'vehicle-files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage bucket RLS Policies - Users can read their own files
create policy "Users can read their own vehicle files"
  on storage.objects for select
  using (
    bucket_id = 'vehicle-files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage bucket RLS Policies - Users can update their own files
create policy "Users can update their own vehicle files"
  on storage.objects for update
  using (
    bucket_id = 'vehicle-files'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'vehicle-files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage bucket RLS Policies - Users can delete their own files
create policy "Users can delete their own vehicle files"
  on storage.objects for delete
  using (
    bucket_id = 'vehicle-files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
