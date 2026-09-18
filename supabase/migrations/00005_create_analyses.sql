create table analyses (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete cascade not null,
  user_id uuid references auth.users not null,
  result jsonb not null,
  created_at timestamptz default now()
);

alter table analyses enable row level security;

create policy "Users can read own analyses" on analyses
  for select using (auth.uid() = user_id);
create policy "Users can insert own analyses" on analyses
  for insert with check (auth.uid() = user_id);
