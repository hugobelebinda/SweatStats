-- Run in Supabase SQL Editor or via CLI. Service role bypasses RLS for server-side sync.

create extension if not exists "uuid-ossp";

create table public.users (
  id uuid primary key default gen_random_uuid(),
  strava_id bigint not null unique,
  first_name text,
  last_name text,
  profile_pic text,
  access_token text not null,
  refresh_token text not null,
  expires_at bigint not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_users_strava_id on public.users (strava_id);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  activity_id bigint not null unique,
  name text,
  type text,
  distance double precision not null default 0,
  moving_time integer not null default 0,
  start_date timestamptz not null,
  map_polyline text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_activities_user_id on public.activities (user_id);
create index idx_activities_start_date on public.activities (start_date desc);

create or replace function public.set_sweat_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger users_updated_at
  before update on public.users
  for each row execute function public.set_sweat_updated_at();

create trigger activities_updated_at
  before update on public.activities
  for each row execute function public.set_sweat_updated_at();

alter table public.users enable row level security;
alter table public.activities enable row level security;

create policy "block_anon_users"
  on public.users for all
  using (false)
  with check (false);

create policy "block_anon_activities"
  on public.activities for all
  using (false)
  with check (false);
