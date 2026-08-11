-- GENDER WARZ™ — ADMIN + VERIFICATION SETUP
-- Run this entire file once in Supabase SQL Editor.

create extension if not exists pgcrypto;

alter table public.profiles
  add column if not exists is_admin boolean not null default false,
  add column if not exists verified boolean not null default false,
  add column if not exists verification_status text not null default 'none',
  add column if not exists verification_badge text default null;

create or replace function public.is_gender_warz_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true);
$$;
grant execute on function public.is_gender_warz_admin() to authenticated;

create or replace function public.handle_new_gender_warz_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name, side, is_admin, verified, verification_status, verification_badge)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'username',''), split_part(new.email,'@',1)),
    coalesce(nullif(new.raw_user_meta_data->>'display_name',''), split_part(new.email,'@',1)),
    'BOTH',
    lower(coalesce(new.email,'')) = lower('Stackpackmedia@gmail.com'),
    lower(coalesce(new.email,'')) = lower('Stackpackmedia@gmail.com'),
    case when lower(coalesce(new.email,'')) = lower('Stackpackmedia@gmail.com') then 'approved' else 'none' end,
    case when lower(coalesce(new.email,'')) = lower('Stackpackmedia@gmail.com') then 'official' else null end
  )
  on conflict (id) do update set
    is_admin = public.profiles.is_admin or excluded.is_admin,
    verified = public.profiles.verified or excluded.verified,
    verification_status = case when excluded.is_admin then 'approved' else public.profiles.verification_status end,
    verification_badge = case when excluded.is_admin then 'official' else public.profiles.verification_badge end;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created_gender_warz on auth.users;
create trigger on_auth_user_created_gender_warz after insert on auth.users for each row execute function public.handle_new_gender_warz_user();

update public.profiles p
set is_admin = true, verified = true, verification_status = 'approved', verification_badge = 'official', display_name = coalesce(nullif(display_name,''), 'Stack Pack')
where exists (select 1 from auth.users u where u.id = p.id and lower(u.email) = lower('Stackpackmedia@gmail.com'));

create table if not exists public.verification_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reason text not null,
  links text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  admin_note text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists verification_applications_status_idx on public.verification_applications(status);
create index if not exists verification_applications_user_id_idx on public.verification_applications(user_id);

alter table public.profiles enable row level security;
alter table public.verification_applications enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for select to authenticated using (id = auth.uid() or public.is_gender_warz_admin());
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update to authenticated using (id = auth.uid() or public.is_gender_warz_admin()) with check (id = auth.uid() or public.is_gender_warz_admin());
drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles for all to authenticated using (public.is_gender_warz_admin()) with check (public.is_gender_warz_admin());
drop policy if exists profiles_public_verified on public.profiles;
create policy profiles_public_verified on public.profiles for select to anon using (verified = true);

drop policy if exists verification_insert_own on public.verification_applications;
create policy verification_insert_own on public.verification_applications for insert to authenticated with check (user_id = auth.uid());
drop policy if exists verification_select_own_or_admin on public.verification_applications;
create policy verification_select_own_or_admin on public.verification_applications for select to authenticated using (user_id = auth.uid() or public.is_gender_warz_admin());
drop policy if exists verification_admin_manage on public.verification_applications;
create policy verification_admin_manage on public.verification_applications for all to authenticated using (public.is_gender_warz_admin()) with check (public.is_gender_warz_admin());

create or replace function public.keep_stackpack_official()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if exists (select 1 from auth.users u where u.id = new.id and lower(u.email) = lower('Stackpackmedia@gmail.com')) then
    new.is_admin := true; new.verified := true; new.verification_status := 'approved'; new.verification_badge := 'official';
    if new.display_name is null or new.display_name = '' then new.display_name := 'Stack Pack'; end if;
  end if;
  return new;
end;
$$;
drop trigger if exists keep_stackpack_official_trigger on public.profiles;
create trigger keep_stackpack_official_trigger before insert or update on public.profiles for each row execute function public.keep_stackpack_official();
