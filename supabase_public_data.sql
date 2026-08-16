-- RELEASE TRACKER: public read-only archive
-- Run this once in Supabase SQL Editor.
-- IMPORTANT: disable public sign-ups in Supabase Auth and keep only your editor account.

create table if not exists public.public_data (
  id text primary key,
  owner_id uuid not null references auth.users(id),
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.public_data enable row level security;

drop policy if exists "Public can read release archive" on public.public_data;
create policy "Public can read release archive"
on public.public_data
for select
to anon, authenticated
using (true);

drop policy if exists "Owner can create public archive" on public.public_data;
create policy "Owner can create public archive"
on public.public_data
for insert
to authenticated
with check (auth.uid() = owner_id);

drop policy if exists "Owner can update public archive" on public.public_data;
create policy "Owner can update public archive"
on public.public_data
for update
to authenticated
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

-- Optional: verify your editor account UUID before first login:
-- select id, email from auth.users;

-- The first successful editor save will create the row with id = 'public'.
-- Visitors can then read it without logging in.
