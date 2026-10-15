# DotMatch

Software engineering jobs aggregated from 15 sources into one place.

## What it does

DotMatch scrapes job listings from 15 sources (job boards, RSS feeds, and company career pages) and displays them in a clean, searchable interface. No login required — just click "Discover Jobs" and browse.

**Job Sources:**
- RemoteOK
- We Work Remotely
- Remotive
- Arbeitnow
- Jobicy
- Findwork
- DevJobsScanner
- Himalayas
- FreeHire
- RemoteJobs.org
- JobsBase
- Lever
- Ashby
- Torre
- HN Hiring

Jobs are filtered toward software engineering roles; rare non-dev strays from source tags can slip through.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.12, FastAPI, httpx |
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS |

**Zero external dependencies** — no database, no Redis, no API keys needed.

## Project Structure

```
dotmatch/
├── backend/
│   ├── main.py              # FastAPI app, CORS, router
│   ├── adapters/            # Job source scrapers
│   │   ├── remoteok.py
│   │   ├── weworkremotely.py
│   │   ├── remotive.py
│   │   ├── arbeitnow.py
│   │   └── jobicy.py
│   ├── services/
│   │   ├── job_store.py     # Job storage with JSON snapshot persistence
│   │   └── job_discovery.py # Orchestrates all adapters
│   ├── models/
│   │   └── schemas.py       # Pydantic response models
│   └── routes/
│       └── jobs.py          # API endpoints
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   └── (dashboard)/
│       │       ├── layout.tsx
│       │       ├── dashboard/page.tsx
│       │       └── jobs/
│       │           ├── page.tsx
│       │           └── [id]/page.tsx
│   ├── components/
│   │   └── Logo, Button, Card, Badge, JobCard, MatchScore, FileUpload, Reveal
│   └── lib/
│       ├── api.ts       # API client
│       ├── fonts.ts     # Shared typeface
│       └── sources.ts   # Job board list
```

## Local Development

### Prerequisites

- Python 3.12+
- Node.js 20+

### Setup

```bash
# Install backend dependencies (runtime + dev tooling)
pip install -r backend/requirements.txt -r backend/requirements-dev.txt

# Install frontend dependencies
cd frontend
npm install
cd ..

# Start backend (terminal 1) — serves http://localhost:8001
cd backend
python -m uvicorn main:app --reload --port 8001

# Start frontend (terminal 2)
cd frontend
npm run dev
```

Or use the Makefile: `make install`, then `make dev-backend` (port 8001) and
`make dev-frontend` (port 3000). The frontend reads `NEXT_PUBLIC_API_URL` from
`frontend/.env.local` and falls back to `http://localhost:8001`.

### Checks

```bash
make test    # pytest (backend)
make lint    # ruff + frontend tsc
make typecheck
```

