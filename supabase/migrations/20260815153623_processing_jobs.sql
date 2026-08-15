create table public.processing_jobs (
  id uuid primary key default gen_random_uuid(),

  video_id uuid not null references public.videos(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,

  type text not null
    check (
      type in (
        'download',
        'transcription',
        'analysis',
        'clip_generation'
      )
    ),

  status text not null default 'pending'
    check (
      status in (
        'pending',
        'processing',
        'completed',
        'failed'
      )
    ),

  progress integer not null default 0
    check (progress >= 0 and progress <= 100),

  error_message text,

  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz
);

create index processing_jobs_video_id_idx
  on public.processing_jobs(video_id);

create index processing_jobs_user_id_idx
  on public.processing_jobs(user_id);

create index processing_jobs_status_idx
  on public.processing_jobs(status);

alter table public.processing_jobs enable row level security;

create policy "Users can view their own processing jobs"
on public.processing_jobs
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can create their own processing jobs"
on public.processing_jobs
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own processing jobs"
on public.processing_jobs
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own processing jobs"
on public.processing_jobs
for delete
to authenticated
using (auth.uid() = user_id);