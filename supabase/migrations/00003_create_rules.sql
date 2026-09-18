-- Rules table: stores per-user red-line rules that drive contract analysis
create table rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  description text not null,
  enabled boolean default true,
  is_default boolean default false,
  produces_gap boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table rules enable row level security;

create policy "Users can read own rules" on rules
  for select using (auth.uid() = user_id);
create policy "Users can insert own rules" on rules
  for insert with check (auth.uid() = user_id);
create policy "Users can update own rules" on rules
  for update using (auth.uid() = user_id);
create policy "Users can delete own rules" on rules
  for delete using (auth.uid() = user_id);
