-- One current transcript per video
ALTER TABLE public.transcripts
ADD CONSTRAINT transcripts_video_id_unique UNIQUE (video_id);

-- Storage is optional because videos can initially come from external URLs
ALTER TABLE public.videos
ALTER COLUMN storage_path DROP NOT NULL;