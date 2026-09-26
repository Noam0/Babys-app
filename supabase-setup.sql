-- Gefen baby tracker schema.
-- Safe to re-run: every statement is idempotent.

-- ---------------------------------------------------------------------------
-- Family members: only these emails can read or write any data.
-- ---------------------------------------------------------------------------
create table if not exists public.family_members (
  email text primary key
);

-- No policies on purpose: the table is only readable through is_family().
alter table public.family_members enable row level security;

create or replace function public.is_family()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.family_members
    where lower(email) = lower(auth.jwt() ->> 'email')
  );
$$;

revoke execute on function public.is_family() from anon;
grant execute on function public.is_family() to authenticated;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  event_type text not null,
  details jsonb not null default '{}'::jsonb,
  timestamp timestamptz not null default now()
);

create index if not exists events_timestamp_idx on public.events (timestamp desc);
create index if not exists events_event_type_idx on public.events (event_type);

create table if not exists public.profile_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  date date,
  details text not null
);

-- Single row (id = 1) holding shared settings such as weight and photo.
create table if not exists public.baby_settings (
  id int primary key default 1 check (id = 1),
  weight_kg numeric(5, 3),
  photo_path text,
  photo_url text,
  updated_at timestamptz not null default now()
);

insert into public.baby_settings (id) values (1) on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Row level security: signed-in family members only
-- ---------------------------------------------------------------------------
alter table public.events enable row level security;
alter table public.profile_items enable row level security;
alter table public.baby_settings enable row level security;

drop policy if exists "family only" on public.events;
create policy "family only" on public.events
  for all to authenticated
  using ((select public.is_family()))
  with check ((select public.is_family()));

drop policy if exists "family only" on public.profile_items;
create policy "family only" on public.profile_items
  for all to authenticated
  using ((select public.is_family()))
  with check ((select public.is_family()));

drop policy if exists "family only" on public.baby_settings;
create policy "family only" on public.baby_settings
  for all to authenticated
  using ((select public.is_family()))
  with check ((select public.is_family()));

-- ---------------------------------------------------------------------------
-- Realtime
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array['events', 'profile_items', 'baby_settings'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Photo storage (private bucket, served through signed URLs)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('baby-photos', 'baby-photos', false)
on conflict (id) do nothing;

drop policy if exists "family photos" on storage.objects;
create policy "family photos" on storage.objects
  for all to authenticated
  using (bucket_id = 'baby-photos' and (select public.is_family()))
  with check (bucket_id = 'baby-photos' and (select public.is_family()));

-- ---------------------------------------------------------------------------
-- Allowed users: replace with your real email addresses
-- ---------------------------------------------------------------------------
insert into public.family_members (email) values
  ('YOUR_EMAIL@example.com'),
  ('WIFE_EMAIL@example.com')
on conflict (email) do nothing;
