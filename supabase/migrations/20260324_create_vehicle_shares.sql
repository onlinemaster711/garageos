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

alter table public.vehicles enable row level security;

drop policy if exists "users_see_own_vehicles" on public.vehicles;
create policy "users_see_own_vehicles" on public.vehicles
  for select using (user_id = auth.uid());

drop policy if exists "users_modify_own_vehicles" on public.vehicles;
create policy "users_modify_own_vehicles" on public.vehicles
  for update using (user_id = auth.uid());

create index if not exists idx_vehicles_user_id on public.vehicles(user_id);

-- Create vehicle_shares table
create table if not exists public.vehicle_shares (
  id uuid default gen_random_uuid() primary key,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  shared_with_user_id uuid not null references auth.users(id) on delete cascade,
  permission_level text not null check (permission_level in ('none', 'view_only', 'can_edit', 'can_upload_photos')),
  expires_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  created_by uuid not null references auth.users(id),
  constraint unique_vehicle_share unique(vehicle_id, shared_with_user_id)
);

alter table public.vehicle_shares enable row level security;

drop policy if exists "vehicle_owner_manage_shares" on public.vehicle_shares;
create policy "vehicle_owner_manage_shares" on public.vehicle_shares
  for all using (exists (select 1 from public.vehicles v where v.id = vehicle_shares.vehicle_id and v.user_id = auth.uid()));

drop policy if exists "shared_users_view_shares" on public.vehicle_shares;
create policy "shared_users_view_shares" on public.vehicle_shares
  for select using (shared_with_user_id = auth.uid() or exists (select 1 from public.vehicles v where v.id = vehicle_shares.vehicle_id and v.user_id = auth.uid()));

create index if not exists idx_vehicle_shares_vehicle_id on public.vehicle_shares(vehicle_id);
create index if not exists idx_vehicle_shares_shared_with_user_id on public.vehicle_shares(shared_with_user_id);
