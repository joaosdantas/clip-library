# Clip Library

## Product

Clip Library is a web application for turning long-form videos
into a searchable library of short-form social media clips.

The initial MVP flow is:

Upload video
→ Transcribe locally
→ Detect clip candidates
→ Review candidates
→ Generate vertical clips
→ Store clips in the library

## Stack

Frontend:
- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query

Backend:
- Supabase Auth
- Supabase PostgreSQL
- Supabase Storage

Processing:
- Python
- FFmpeg
- faster-whisper

## Architecture Rules

- Supabase is the primary backend.
- Do not create a separate frontend API unless explicitly required.
- Video processing must happen in the Python worker.
- Never upload large video files through a custom frontend API.
- Use Supabase Storage for video files.
- Use Supabase PostgreSQL for metadata.
- Use Row Level Security for user-owned data.
- Never expose Supabase service-role keys in frontend code.
- Do not add unnecessary dependencies.
- Keep features modular.
- Use TypeScript strict mode.
- Do not modify unrelated files.

## Database

Current tables:

- projects
- videos

Existing migration:

supabase/migrations/20260815145300_initial_schema.sql

Do not modify the existing migration.

New database changes must use new migrations.

## Current Development Goal

Implement authentication before implementing video upload.

Do not implement:
- video processing
- Whisper
- FFmpeg
- clip generation
- AI APIs

until authentication and the basic dashboard flow are working.