create extension if not exists pgcrypto;

do $$ begin
  create type public.productivity_period as enum ('morning', 'afternoon', 'evening', 'varies');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.subscription_type as enum ('free', 'pro');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.task_priority as enum ('low', 'medium', 'high', 'urgent');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.task_status as enum ('pending', 'scheduled', 'in_progress', 'completed', 'missed', 'cancelled');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.preferred_focus_period as enum ('morning', 'afternoon', 'evening', 'none');
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  timezone text not null default 'Europe/Amsterdam',
  wake_time time not null default '07:30',
  sleep_time time not null default '23:30',
  productivity_period public.productivity_period,
  subscription_type public.subscription_type not null default 'free',
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  description text,
  category text,
  estimated_minutes integer not null check (estimated_minutes > 0),
  deadline timestamptz,
  priority public.task_priority not null default 'medium',
  status public.task_status not null default 'pending',
  planned_minutes integer not null default 0 check (planned_minutes >= 0),
  completed_minutes integer not null default 0 check (completed_minutes >= 0),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  max_focus_minutes integer not null default 60 check (max_focus_minutes > 0),
  break_minutes integer not null default 10 check (break_minutes >= 0),
  minimum_free_minutes_per_day integer not null default 60 check (minimum_free_minutes_per_day >= 0),
  preferred_focus_period public.preferred_focus_period not null default 'none',
  notifications_enabled boolean not null default true,
  auto_reschedule_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists user_preferences_set_updated_at on public.user_preferences;
create trigger user_preferences_set_updated_at
before update on public.user_preferences
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name')
  on conflict (id) do nothing;

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.user_preferences enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles for select to authenticated
using ((select auth.uid()) = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "Users can read own preferences" on public.user_preferences;
create policy "Users can read own preferences"
on public.user_preferences for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can update own preferences" on public.user_preferences;
create policy "Users can update own preferences"
on public.user_preferences for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can read own tasks" on public.tasks;
create policy "Users can read own tasks"
on public.tasks for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can create own tasks" on public.tasks;
create policy "Users can create own tasks"
on public.tasks for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own tasks" on public.tasks;
create policy "Users can update own tasks"
on public.tasks for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own tasks" on public.tasks;
create policy "Users can delete own tasks"
on public.tasks for delete to authenticated
using ((select auth.uid()) = user_id);

grant select, update on public.profiles to authenticated;
grant select, update on public.user_preferences to authenticated;
grant select, insert, update, delete on public.tasks to authenticated;
