# YouTube Analytics Dashboard

A full-stack YouTube channel analytics dashboard built with React, Node.js, and PostgreSQL. Connects to the YouTube Data API v3 via OAuth 2.0 to pull real channel data, track historical performance over time, and surface content insights.

**[Live Demo](https://youtube-dashboard-client-beta.vercel.app)** · **[Public Showcase](https://youtube-dashboard-client-beta.vercel.app/showcase)**

---

## Screenshots

> Dashboard, Videos, and Insights pages — displaying real channel data for KJModsMinecraft.

---

## Features

- **Google OAuth 2.0** — secure sign-in with Google, no passwords stored
- **Live YouTube sync** — pulls channel stats and up to 50 videos from the YouTube Data API v3
- **Historical tracking** — every sync saves a snapshot, building a time-series record of subscriber and view count growth
- **Dashboard** — channel summary with subscriber count, total views, average views per video, growth chart, and top videos by engagement
- **Videos table** — all uploaded videos with search and multi-column sorting by views, likes, engagement rate, and publish date
- **Content insights** — derived analytics including best days to post, Shorts vs long-form performance comparison, and top/bottom performing titles
- **CSV export** — download all video stats as a spreadsheet
- **Scheduled auto-sync** — cron job runs daily at 9am to keep data fresh automatically
- **Public showcase** — shareable, read-only page showing channel stats and top videos, no login required

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Recharts |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma 5 |
| Auth | Google OAuth 2.0 via `googleapis` |
| Deployment | Vercel (frontend), Railway (backend) |

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                YouTube Data API v3              │
└───────────────────────┬─────────────────────────┘
                        │ OAuth 2.0
                        ▼
┌─────────────────────────────────────────────────┐
│           Node.js / Express Backend             │
│                                                 │
│  ┌─────────────┐  ┌──────────────┐              │
│  │  Auth Route │  │  Sync Service│              │
│  │  OAuth flow │  │  Cron job    │              │
│  └─────────────┘  └──────────────┘              │
│                                                 │
│  ┌──────────────────────────────────────────┐   │
│  │              Prisma ORM                  │   │
│  └──────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────┐
│         PostgreSQL Database (Supabase)          │
│                                                 │
│  Channel → ChannelSnapshot (time-series)        │
│  Video   → VideoSnapshot   (time-series)        │
└─────────────────────────────────────────────────┘
                        ▲
                        │ REST API
┌─────────────────────────────────────────────────┐
│         React Frontend (Vite + TypeScript)      │
│                                                 │
│  /           → Login page                       │
│  /dashboard  → Stats, charts, top videos        │
│  /videos     → Searchable, sortable table       │
│  /insights   → Content analytics                │
│  /showcase   → Public read-only view            │
└─────────────────────────────────────────────────┘
```

### Key Design Decision — Snapshot Pattern

The YouTube API only returns *current* statistics — it has no historical data endpoint. To enable trend charts, the app stores a `ChannelSnapshot` and `VideoSnapshot` every time a sync runs. Over time this builds a time-series database of performance data, enabling growth charts and trend analysis that the YouTube API itself cannot provide.

---

## Project Structure

```
youtube-dashboard/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Route-level page components
│   │   ├── services/        # API call functions
│   │   ├── types/           # TypeScript interfaces
│   │   └── utils/           # Formatting utilities
│   └── vercel.json          # SPA rewrite rules
├── server/                  # Node.js/Express backend
│   ├── src/
│   │   ├── routes/          # Express route handlers
│   │   └── services/        # YouTube API + sync logic
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   └── railway.json         # Railway deployment config
└── package.json             # Monorepo workspace config
```

---

## Running Locally

### Prerequisites

- Node.js v22+
- A Google Cloud project with YouTube Data API v3 enabled
- A PostgreSQL database (Supabase free tier recommended)

### Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/kjmaster1/youtube-dashboard.git
   cd youtube-dashboard
   npm install
   ```

2. **Configure the server**

   Create `server/.env`:
   ```
   DATABASE_URL=postgresql://...
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/callback
   SESSION_SECRET=your_random_secret
   PORT=3001
   ```

3. **Run database migrations**
   ```bash
   cd server
   npx prisma migrate dev
   cd ..
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   Frontend: `http://localhost:5173`
   Backend: `http://localhost:3001`

5. **Authenticate and sync**
   - Visit `http://localhost:5173` and sign in with Google
   - Click **Sync Now** to pull your YouTube data

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/auth/login` | None | Initiates Google OAuth flow |
| GET | `/api/auth/callback` | None | OAuth callback handler |
| GET | `/api/auth/status` | None | Returns authentication status |
| GET | `/api/auth/logout` | None | Destroys session and redirects |
| POST | `/api/sync/now` | Required | Triggers a manual data sync |
| GET | `/api/dashboard` | Required | Returns channel stats and top videos |
| GET | `/api/videos` | Required | Returns all videos with latest snapshots |
| GET | `/api/videos/export` | Required | Downloads video stats as CSV |
| GET | `/api/insights` | Required | Returns derived content analytics |
| GET | `/api/public/showcase` | None | Returns public channel summary |
| GET | `/health` | None | Server and database health check |

---

## Deployment

The app is deployed as two separate services:

- **Frontend** → [Vercel](https://vercel.com) — set root directory to `client`, add `VITE_API_URL` environment variable pointing to your Railway URL
- **Backend** → [Railway](https://railway.app) — add all environment variables from `server/.env`, set build command to `npm run build --workspace=server`
- **Database** → [Supabase](https://supabase.com) — use the connection pooler URL (port 6543) for Railway compatibility

---

## Future Improvements

- **Multi-user support** — currently single-user; could be extended with a `User` model scoping all data by authenticated user
- **TikTok integration** — add a second data source alongside YouTube
- **Email reports** — weekly digest of channel performance sent automatically
- **Webhook triggers** — sync on new video upload rather than on a schedule
- **Retention analytics** — integrate YouTube Analytics API for watch time and audience retention data

---

## Author

Built by **kjmaster1** as a portfolio project demonstrating full-stack TypeScript development, REST API design, OAuth 2.0 authentication, and data modelling with PostgreSQL.

[GitHub](https://github.com/kjmaster1) · [YouTube](https://youtube.com/@kjmodsminecraft)
