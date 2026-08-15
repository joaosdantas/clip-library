-- ============================================================
-- VIDEO SOURCES
-- ============================================================

alter table public.videos
  add column source_type text not null default 'upload'
    check (
      source_type in (
        'upload',
        'youtube',
        'direct_url'
      )
    );

alter table public.videos
  add column source_url text;

create index videos_source_type_idx
  on public.videos(source_type);
