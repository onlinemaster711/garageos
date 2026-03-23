-- Create vehicles table if not exists
create table if not exists public.vehicles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  make text not null,
  model text not null,
  year integer,
  current_mileage integer,
  color text,
  category text check (category in ('modern', 'oldtimer', 'youngtimer')),
  cover_photo_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create user_access table
create table if not exists public.user_access (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  guest_user_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  can_view boolean default true,
  can_edit boolean default false,
  can_upload boolean default false,
  created_at timestamp default now(),
  updated_at timestamp default now(),
  expires_at timestamp,
  constraint no_self_access check (owner_id != guest_user_id),
  unique(owner_id, guest_user_id, vehicle_id)
);

-- Enable RLS
alter table if exists public.user_access enable row level security;

-- RLS Policies
drop policy if exists "owner_can_manage_access" on public.user_access;
create policy "owner_can_manage_access" on public.user_access
  for all using (owner_id = auth.uid());

drop policy if exists "guest_can_view_access" on public.user_access;
create policy "guest_can_view_access" on public.user_access
  for select using (guest_user_id = auth.uid() or owner_id = auth.uid());

-- Indexes
create index if not exists idx_user_access_owner_id on public.user_access(owner_id);
create index if not exists idx_user_access_guest_user_id on public.user_access(guest_user_id);
create index if not exists idx_user_access_vehicle_id on public.user_access(vehicle_id);
