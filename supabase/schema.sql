-- ============================================
-- 💣 FULL NUKE (SAFE RESET)
-- ============================================

-- Drop triggers
drop trigger if exists on_auth_user_created on auth.users;

-- Drop functions
drop function if exists public.handle_new_user cascade;
drop function if exists update_updated_at_column cascade;

-- Drop tables
drop table if exists public.projects cascade;
drop table if exists public.profiles cascade;

-- Drop ALL storage policies
do $$
declare
pol record;
begin
for pol in
select policyname
from pg_policies
where schemaname = 'storage'
loop
execute format('drop policy if exists %I on storage.objects;', pol.policyname);
end loop;
end $$;

-- ============================================
-- ✅ CLEAN
-- ============================================


-- ============================================
-- 🚀 VORLD FINAL CLEAN SETUP (CORRECT)
-- ============================================

-- =========================
-- PROFILES
-- =========================

create table public.profiles (
id uuid primary key references auth.users on delete cascade,
email text unique,
full_name text,
avatar_url text,
bio text,
storage_used bigint default 0,
updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select"
on public.profiles for select
using (true);

create policy "profiles_insert"
on public.profiles for insert
with check (auth.uid() = id);

create policy "profiles_update"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- =========================
-- PROJECTS
-- =========================

create table public.projects (
id uuid default gen_random_uuid() primary key,
user_id uuid references auth.users on delete cascade not null,
name text not null,
description text,
model_path text,
thumbnail_url text,
storage_size bigint default 0,
settings jsonb default '{}'::jsonb,
interactions jsonb default '[]'::jsonb,
is_public boolean default false,
created_at timestamptz default now(),
updated_at timestamptz default now()
);

alter table public.projects enable row level security;

create policy "projects_select"
on public.projects for select
using (auth.uid() = user_id OR is_public = true);

create policy "projects_insert"
on public.projects for insert
with check (auth.uid() = user_id);

create policy "projects_update"
on public.projects for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "projects_delete"
on public.projects for delete
using (auth.uid() = user_id);

create index idx_projects_user on public.projects(user_id);

-- Auto timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
new.updated_at = now();
return new;
end;
$$ language plpgsql;

create trigger update_projects_updated_at
before update on public.projects
for each row execute procedure update_updated_at_column();

-- =========================
-- STORAGE BUCKETS
-- =========================

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict do nothing;

insert into storage.buckets (id, name, public)
values ('models', 'models', false)
on conflict do nothing;

insert into storage.buckets (id, name, public)
values ('thumbnails', 'thumbnails', true)
on conflict do nothing;

-- =========================
-- STORAGE POLICIES
-- =========================

-- AVATARS
create policy "avatars_select"
on storage.objects for select
using (bucket_id = 'avatars');

create policy "avatars_insert"
on storage.objects for insert
with check (
bucket_id = 'avatars'
and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "avatars_update"
on storage.objects for update
using (
bucket_id = 'avatars'
and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "avatars_delete"
on storage.objects for delete
using (
bucket_id = 'avatars'
and (storage.foldername(name))[1] = auth.uid()::text
);

-- MODELS
create policy "models_select_owner"
on storage.objects for select
using (
bucket_id = 'models'
and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "models_select_public"
on storage.objects for select
using (
bucket_id = 'models'
and exists (
select 1 from public.projects
where model_path = name
and is_public = true
)
);

create policy "models_insert"
on storage.objects for insert
with check (
bucket_id = 'models'
and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "models_delete"
on storage.objects for delete
using (
bucket_id = 'models'
and (storage.foldername(name))[1] = auth.uid()::text
);

-- THUMBNAILS
create policy "thumbnails_select_public"
on storage.objects for select
using (bucket_id = 'thumbnails');

create policy "thumbnails_insert_auth"
on storage.objects for insert
with check (bucket_id = 'thumbnails' and auth.role() = 'authenticated');

create policy "thumbnails_update_auth"
on storage.objects for update
using (bucket_id = 'thumbnails' and auth.role() = 'authenticated');

create policy "thumbnails_delete_auth"
on storage.objects for delete
using (bucket_id = 'thumbnails' and auth.role() = 'authenticated');

-- =========================
-- AUTH TRIGGER
-- =========================

create or replace function public.handle_new_user()
returns trigger as $$
begin
insert into public.profiles (id, email, full_name)
values (
new.id,
new.email,
coalesce(new.raw_user_meta_data->>'full_name', '')
);
return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- ============================================
-- ✅ DONE CLEAN
-- ============================================
