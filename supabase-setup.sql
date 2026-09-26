-- Baby tracker schema: each family is an isolated space, joined by invite code.
-- Run on a fresh Supabase project (SQL Editor) to recreate the database.

-- ---------------------------------------------------------------------------
-- Families and membership
-- ---------------------------------------------------------------------------
create table public.families (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  invite_code text not null unique,
  baby_name text not null,
  birth_datetime timestamptz not null,
  weight_kg numeric(5, 3),
  photo_path text,
  photo_url text
);
create index families_created_by_idx on public.families (created_by);

create table public.family_members (
  family_id uuid not null references public.families (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (family_id, user_id)
);
create index family_members_user_id_idx on public.family_members (user_id);

-- Security definer so policies on family_members can use it without recursion.
create or replace function public.my_family_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select family_id from public.family_members where user_id = auth.uid();
$$;

-- ---------------------------------------------------------------------------
-- Family data
-- ---------------------------------------------------------------------------
create table public.events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  family_id uuid not null references public.families (id) on delete cascade,
  event_type text not null,
  details jsonb not null default '{}'::jsonb,
  timestamp timestamptz not null default now()
);
create index events_family_timestamp_idx on public.events (family_id, timestamp desc);
create index events_event_type_idx on public.events (event_type);
create index events_created_by_idx on public.events (created_by);

create table public.profile_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  family_id uuid not null references public.families (id) on delete cascade,
  title text not null,
  date date,
  details text not null
);
create index profile_items_family_idx on public.profile_items (family_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Row level security: members see only their own family
-- ---------------------------------------------------------------------------
alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.events enable row level security;
alter table public.profile_items enable row level security;

-- Families are created and joined only through the functions below.
create policy "members read family" on public.families
  for select to authenticated
  using (id in (select public.my_family_ids()));

create policy "members update family" on public.families
  for update to authenticated
  using (id in (select public.my_family_ids()))
  with check (id in (select public.my_family_ids()));

create policy "members read membership" on public.family_members
  for select to authenticated
  using (family_id in (select public.my_family_ids()));

create policy "family data" on public.events
  for all to authenticated
  using (family_id in (select public.my_family_ids()))
  with check (family_id in (select public.my_family_ids()));

create policy "family data" on public.profile_items
  for all to authenticated
  using (family_id in (select public.my_family_ids()))
  with check (family_id in (select public.my_family_ids()));

-- ---------------------------------------------------------------------------
-- Create / join family
-- ---------------------------------------------------------------------------
create or replace function public.create_family(p_baby_name text, p_birth_datetime timestamptz)
returns public.families
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_code text;
  v_family public.families;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  -- 6 chars without look-alikes (no 0/O, 1/I)
  loop
    select string_agg(substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 1 + floor(random() * 32)::int, 1), '')
      into v_code
      from generate_series(1, 6);
    exit when not exists (select 1 from public.families where invite_code = v_code);
  end loop;

  insert into public.families (baby_name, birth_datetime, invite_code, created_by)
  values (trim(p_baby_name), p_birth_datetime, v_code, auth.uid())
  returning * into v_family;

  insert into public.family_members (family_id, user_id) values (v_family.id, auth.uid());

  return v_family;
end;
$$;

create or replace function public.join_family(p_invite_code text)
returns public.families
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_family public.families;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  select * into v_family
    from public.families
    where invite_code = upper(trim(p_invite_code));

  if v_family.id is null then
    raise exception 'invalid_invite_code';
  end if;

  insert into public.family_members (family_id, user_id)
  values (v_family.id, auth.uid())
  on conflict do nothing;

  return v_family;
end;
$$;

revoke execute on function public.my_family_ids() from public, anon;
revoke execute on function public.create_family(text, timestamptz) from public, anon;
revoke execute on function public.join_family(text) from public, anon;
grant execute on function public.my_family_ids() to authenticated;
grant execute on function public.create_family(text, timestamptz) to authenticated;
grant execute on function public.join_family(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Realtime
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table public.families, public.events, public.profile_items;

-- ---------------------------------------------------------------------------
-- Photo storage: private bucket, one folder per family (<family_id>/...)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('baby-photos', 'baby-photos', false)
on conflict (id) do nothing;

create policy "family photos" on storage.objects
  for all to authenticated
  using (
    bucket_id = 'baby-photos'
    and (storage.foldername(name))[1] in (select id::text from public.my_family_ids() as id)
  )
  with check (
    bucket_id = 'baby-photos'
    and (storage.foldername(name))[1] in (select id::text from public.my_family_ids() as id)
  );
