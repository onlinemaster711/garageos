create table if not exists insurance_policies (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references vehicles not null,
  user_id uuid references auth.users not null,
  provider text not null,
  policy_number text,
  type text not null, -- 'haftpflicht', 'teilkasko', 'vollkasko'
  insured_value numeric,
  annual_premium numeric,
  start_date date,
  end_date date,
  notes text,
  created_at timestamptz default now()
);

create index if not exists idx_insurance_vehicle on insurance_policies(vehicle_id);
alter table insurance_policies enable row level security;
create policy "Users can manage own insurance" on insurance_policies for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
