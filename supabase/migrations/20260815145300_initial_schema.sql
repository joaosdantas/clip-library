-- ============================================================
-- Clip Library - Initial Schema
-- ============================================================

-- ============================================================
-- PROJECTS
-- ============================================================

create table public.projects (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references auth.users(id) on delete cascade,

  name text not null,
  description text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_user_id_idx
  on public.projects(user_id);


-- ============================================================
-- VIDEOS
-- ============================================================

create table public.videos (
  id uuid primary key default gen_random_uuid(),

  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,

  title text not null,
  filename text not null,
  storage_path text not null,

  duration_seconds numeric,
  width integer,
  height integer,
  fps numeric,

  status text not null default 'uploaded'
    check (
      status in (
        'uploaded',
        'processing',
        'transcribing',
        'analyzing',
        'ready',
        'error'
      )
    ),

  processing_progress integer not null default 0
    check (processing_progress >= 0 and processing_progress <= 100),

  error_message text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index videos_project_id_idx
  on public.videos(project_id);

create index videos_user_id_idx
  on public.videos(user_id);

create index videos_status_idx
  on public.videos(status);


-- ============================================================
-- UPDATED_AT FUNCTION
-- ============================================================

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================

create trigger projects_updated_at
before update on public.projects
for each row
execute function public.handle_updated_at();

create trigger videos_updated_at
before update on public.videos
for each row
execute function public.handle_updated_at();


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.projects enable row level security;
alter table public.videos enable row level security;


-- ============================================================
-- PROJECT POLICIES
-- ============================================================

create policy "Users can view their own projects"
on public.projects
for select
to authenticated
using (auth.uid() = user_id);


create policy "Users can create their own projects"
on public.projects
for insert
to authenticated
with check (auth.uid() = user_id);


create policy "Users can update their own projects"
on public.projects
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);


create policy "Users can delete their own projects"
on public.projects
for delete
to authenticated
using (auth.uid() = user_id);


-- ============================================================
-- VIDEO POLICIES
-- ============================================================

create policy "Users can view their own videos"
on public.videos
for select
to authenticated
using (auth.uid() = user_id);


create policy "Users can create their own videos"
on public.videos
for insert
to authenticated
with check (auth.uid() = user_id);


create policy "Users can update their own videos"
on public.videos
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);


create policy "Users can delete their own videos"
on public.videos
for delete
to authenticated
using (auth.uid() = user_id);