create table documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  plain_text text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table documents enable row level security;

create policy "Users can read own documents" on documents
  for select using (auth.uid() = user_id);
create policy "Users can insert own documents" on documents
  for insert with check (auth.uid() = user_id);
create policy "Users can delete own documents" on documents
  for delete using (auth.uid() = user_id);
