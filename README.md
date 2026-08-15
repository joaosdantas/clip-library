# Clip Library

> Turn long-form videos into a searchable library of social media clips.

> 🚧 **Early MVP / In Development**
>
> Clip Library is an early-stage MVP. Authentication, project management, and
> video-source handling are implemented. The video processing pipeline (download,
> transcription, clip detection, and generation) is being built.

---

## What is Clip Library?

Clip Library is a platform for turning long-form video content into short-form
social media clips.

Long videos are hard to search, clip, and repurpose. Clip Library intends to
solve that by ingesting a video, transcribing it locally, analyzing the
transcript to find clip-worthy moments, and turning them into ready-to-publish
vertical clips — all stored in a personal, searchable library.

The processing pipeline is planned to run on your own infrastructure (Python
worker, FFmpeg, faster-whisper), so your video and transcript data never have to
leave your machine to a third-party AI service.

---

## How it works

```text
Video URL
   │
   ▼
Processing Queue ──► Python Worker
   │                     │
   │                     ▼
   │                Video Download
   │                     │
   │                     ▼
   │                    FFmpeg
   │                     │
   │                     ▼
   │            Local Transcription
   │            (faster-whisper)
   │                     │
   │                     ▼
   │             Transcript Analysis
   │                     │
   │                     ▼
   │              Clip Candidates
   │                     │
   │                     ▼
   │              User Review
   │                     │
   │                     ▼
   │         Vertical Clip Generation
   │                     │
   │                     ▼
   │           Subtitle Generation
   │                     │
   │                     ▼
   │               Clip Library
```

> **Note:** Today the pipeline runs up to *enqueueing a processing job*. Video
> download, FFmpeg, transcription, and analysis are planned, not yet working.

---

## ✨ Current Features

**Implemented:**

- React + Vite + TypeScript single-page application
- Supabase integration (PostgreSQL, Auth)
- User registration, login, and logout
- Protected routes (unauthenticated users are redirected to login)
- Project creation and management
- Project detail pages
- Adding videos to a project via URL
- YouTube vs. direct URL source detection
- Row Level Security on user-owned data
- Processing jobs table (`download` jobs are enqueued when a video is added)
- Initial Python worker architecture (polling loop scaffolded and importable)

**Planned (not implemented yet):**

- Automatic video downloading
- FFmpeg processing
- faster-whisper transcription
- Automatic clip detection
- AI-powered analysis
- Vertical video generation
- Automatic subtitle generation
- Social media publishing
- Instagram / TikTok / YouTube integrations
- Supabase Storage

---

## 🗺️ Roadmap

- [x] Authentication and user accounts
- [x] Protected routes
- [x] Project creation and management
- [x] Project detail pages
- [x] Add videos via URL
- [x] YouTube / direct URL source detection
- [x] Processing jobs infrastructure
- [x] Initial Python worker architecture
- [ ] Automatic video downloading
- [ ] FFmpeg processing
- [ ] Local transcription (faster-whisper)
- [ ] Transcript analysis
- [ ] Clip candidate detection
- [ ] User review flow
- [ ] Vertical clip generation
- [ ] Subtitle generation
- [ ] Searchable clip library
- [ ] Social media publishing
- [ ] Instagram / TikTok / YouTube integrations

---

## 🧱 Tech Stack

**Frontend**

- [React](https://react.dev)
- [Vite](https://vite.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [TanStack Query](https://tanstack.com/query)

**Backend**

- [Supabase](https://supabase.com)
- PostgreSQL
- Supabase Auth
- Supabase Storage _(planned)_

**Processing**

- Python
- FFmpeg
- faster-whisper

---

## 🏗️ Architecture

- **React frontend** — the browser app. Users authenticate with Supabase Auth,
  manage projects and videos, and later review clip candidates. It talks
  directly to Supabase (PostgREST + Realtime) and never handles video files
  itself.
- **Supabase** — the primary backend. Stores metadata (projects, videos,
  processing jobs) in PostgreSQL, handles authentication, and enforces Row
  Level Security so users only access their own data. Video files will live in
  Supabase Storage.
- **Python worker** — a background service that polls the processing jobs
  queue. It uses the service role key (server-side only) to read pending jobs
  and update their progress, so it can process jobs for all users.
- **FFmpeg** — invoked by the worker to normalize, probe, and later generate
  vertical clips.
- **faster-whisper** — runs locally in the worker to transcribe videos; no
  third-party transcription service is required.

```text
┌──────────────┐    ┌────────────────────┐    ┌──────────────────┐
│  React app   │───►│      Supabase      │◄───│  Python worker   │
│  (frontend)  │    │ Auth · Postgres    │    │  (polls jobs)    │
└──────────────┘    │ RLS · Storage      │    └────────┬─────────┘
                    └────────────────────┘             │
                                              ┌────────▼─────────┐
                                              │ FFmpeg           │
                                              │ faster-whisper   │
                                              └──────────────────┘
```

---

## 📁 Project Structure

```text
clip-library/
├── src/                     # React frontend
│   ├── components/
│   │   ├── auth/            # Auth loading screen, protected route
│   │   ├── layout/          # App header
│   │   ├── projects/        # Project dialog, project card
│   │   ├── ui/              # Button, card, dialog, input, label, textarea
│   │   └── videos/          # Add-video dialog, video card
│   ├── hooks/               # use-projects, use-videos
│   ├── lib/                 # Supabase client, auth, API helpers, types
│   ├── pages/               # Login, signup, dashboard, project detail
│   ├── App.tsx              # Routes
│   ├── index.css            # Tailwind entry
│   └── main.tsx             # App entry
├── supabase/
│   ├── config.toml          # Local Supabase config
│   └── migrations/          # Database migrations (RLS-enabled)
└── worker/                  # Python processing worker (in development)
    ├── app/
    │   ├── jobs/            # download_video job handler
    │   ├── services/        # downloader service
    │   ├── config.py        # Env config
    │   ├── main.py          # Polling loop
    │   └── supabase_client.py
    ├── downloads/           # Downloaded videos (gitignored)
    ├── Dockerfile
    └── requirements.txt
```

---

## 🚀 Local Development

Prerequisites: Node.js (LTS) and npm. The frontend requires a Supabase project
to connect to.

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open `http://localhost:5173`.

Useful commands:

```bash
npm run build     # Type-check and production build
npm run lint      # Run oxlint
```

---

## 🔐 Environment Variables

Create a `.env.local` file at the project root with your Supabase project
credentials (these are public, safe to expose to the browser):

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

The Python worker (when enabled) reads its own `.env` from `worker/` and needs
the service role key — **server-side only, never in the frontend**:

```bash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

> Never commit real credentials. Copy `.env.example` files and fill in your own
> values.

---

## 🗓️ Development Roadmap

- **Phase 1 — Authentication and projects:** registration, login, protected
  routes, project CRUD. *(done)*
- **Phase 2 — Video sources:** add videos via URL, source detection. *(done)*
- **Phase 3 — Processing worker:** worker polls the queue and downloads
  videos. *(in development)*
- **Phase 4 — Transcription:** local transcription with faster-whisper.
- **Phase 5 — Clip detection:** transcript analysis to find clip candidates.
- **Phase 6 — Clip generation:** vertical clip + subtitle generation with
  FFmpeg.
- **Phase 7 — Library and search:** searchable clip library.
- **Phase 8 — Social publishing:** publishing to social platforms.

---

## 🤝 Contributing

Clip Library is a public, early-stage project, but external contributions are
not open yet.

If you are part of the project team, keep changes small and focused, follow the
architecture rules (Supabase as the primary backend, processing only in the
Python worker, no service-role keys in the frontend), and avoid touching
unrelated files.

---

## 📄 License

No open-source license has been defined yet. The repository is public for
viewing, but without a license file the code remains **all rights reserved** —
you may look, but not copy, modify, or reuse it. A license will be chosen as the
project matures.
