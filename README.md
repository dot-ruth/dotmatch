# DotMatch

Remote software engineering jobs aggregated from multiple sources into one place.

## What it does

DotMatch scrapes job listings from 5 remote job boards and displays them in a clean, searchable interface. No login required — just click "Discover Jobs" and browse.

**Job Sources:**
- RemoteOK
- We Work Remotely
- Remotive
- Arbeitnow
- Jobicy

All jobs are filtered to show only software engineering roles.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.14, FastAPI, httpx |
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS |
| Background | PlasmaWave (OGL/WebGL) |

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
│   │   ├── job_store.py     # In-memory job storage
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
│       ├── components/
│       │   └── PlasmaWave/  # Animated background
│       └── lib/
│           └── api.ts       # API client
```

## Local Development

### Prerequisites

- Python 3.13+
- Node.js 20+

### Setup

```bash
# Install Python dependencies
pip install fastapi uvicorn httpx pydantic

# Install frontend dependencies
cd frontend
npm install

# Start backend (terminal 1)
cd ..
python -m uvicorn backend.main:app --port 8000

# Start frontend (terminal 2)
cd frontend
npm run dev
```

