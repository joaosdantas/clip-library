-- ============================================================
-- TRANSCRIPTS
-- ============================================================

create table public.transcripts (
  id uuid primary key default gen_random_uuid(),

  video_id uuid not null references public.videos(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,

  language text,
  text text not null default '',
  duration_seconds numeric,
  model text,

  status text not null default 'pending'
    check (
      status in (
        'pending',
        'processing',
        'completed',
        'failed'
      )
    ),

  error_message text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index transcripts_video_id_idx
  on public.transcripts(video_id);

create index transcripts_user_id_idx
  on public.transcripts(user_id);

create index transcripts_status_idx
  on public.transcripts(status);


-- ============================================================
-- TRANSCRIPT SEGMENTS
-- ============================================================

create table public.transcript_segments (
  id uuid primary key default gen_random_uuid(),

  transcript_id uuid not null references public.transcripts(id) on delete cascade,

  sequence integer not null,
  start_seconds numeric not null,
  end_seconds numeric not null,
  text text not null,

  created_at timestamptz not null default now()
);

create unique index transcript_segments_transcript_id_sequence_idx
  on public.transcript_segments(transcript_id, sequence);

create index transcript_segments_transcript_id_idx
  on public.transcript_segments(transcript_id);


-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

create trigger transcripts_updated_at
before update on public.transcripts
for each row
execute function public.handle_updated_at();


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.transcripts enable row level security;
alter table public.transcript_segments enable row level security;


-- ============================================================
-- TRANSCRIPT POLICIES
-- ============================================================

create policy "Users can view their own transcripts"
on public.transcripts
for select
to authenticated
using (auth.uid() = user_id);


create policy "Users can create their own transcripts"
on public.transcripts
for insert
to authenticated
with check (auth.uid() = user_id);


create policy "Users can update their own transcripts"
on public.transcripts
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);


create policy "Users can delete their own transcripts"
on public.transcripts
for delete
to authenticated
using (auth.uid() = user_id);


-- ============================================================
-- TRANSCRIPT SEGMENT POLICIES
-- ============================================================

create policy "Users can view segments of their own transcripts"
on public.transcript_segments
for select
to authenticated
using (
  exists (
    select 1 from public.transcripts
    where transcripts.id = transcript_segments.transcript_id
      and transcripts.user_id = auth.uid()
  )
);


create policy "Users can create segments for their own transcripts"
on public.transcript_segments
for insert
to authenticated
with check (
  exists (
    select 1 from public.transcripts
    where transcripts.id = transcript_segments.transcript_id
      and transcripts.user_id = auth.uid()
  )
);


create policy "Users can update segments of their own transcripts"
on public.transcript_segments
for update
to authenticated
using (
  exists (
    select 1 from public.transcripts
    where transcripts.id = transcript_segments.transcript_id
      and transcripts.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.transcripts
    where transcripts.id = transcript_segments.transcript_id
      and transcripts.user_id = auth.uid()
  )
);


create policy "Users can delete segments of their own transcripts"
on public.transcript_segments
for delete
to authenticated
using (
  exists (
    select 1 from public.transcripts
    where transcripts.id = transcript_segments.transcript_id
      and transcripts.user_id = auth.uid()
  )
);
