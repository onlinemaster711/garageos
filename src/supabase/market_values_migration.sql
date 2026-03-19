-- Market Values Table for vehicle value tracking
create table if not exists market_values (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references vehicles not null,
  user_id uuid references auth.users not null,
  estimated_value numeric not null,
  source text, -- 'manual', 'mobile_de', 'autoscout24'
  notes text,
  created_at timestamptz default now()
);

create index if not exists idx_market_values_vehicle on market_values(vehicle_id);
create index if not exists idx_market_values_user on market_values(user_id);

alter table market_values enable row level security;

create policy "Users can manage own market values" on market_values
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
