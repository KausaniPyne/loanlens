# LoanLens — AI-Powered Home Loan Benchmarking Engine

LoanLens audits your home loan interest rate against a cohort of similar borrowers, tells you whether you're overpaying, and generates a personalised negotiation playbook.

## Quick Start

```bash
# 1. Clone and enter the project
cd loadlens

# 2. Copy environment variables
cp .env.example .env

# 3. Launch all services
docker compose up --build

# 4. Verify
curl http://localhost:8000/health
# → {"status": "ok", "service": "loadlens-api"}
```

## Services

| Service    | Port  | Description                    |
|------------|-------|--------------------------------|
| Backend    | 8000  | FastAPI application            |
| Frontend   | 3000  | Next.js 14 UI                  |
| PostgreSQL | 5432  | Primary database               |
| Redis      | 6379  | Caching & rate limiting        |
| MinIO      | 9000  | S3-compatible model storage    |
| MinIO UI   | 9001  | MinIO admin console            |

## Architecture

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│ Frontend │────▶│ Backend  │────▶│ Postgres │
│ Next.js  │     │ FastAPI  │     │          │
└──────────┘     └────┬─────┘     └──────────┘
                      │
                 ┌────┴─────┐
                 │  Redis   │
                 │  MinIO   │
                 └──────────┘
```

## Tech Stack

- **Backend**: FastAPI, SQLAlchemy (async), CatBoost, TabNet, scikit-learn
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Recharts, Zustand
- **Infrastructure**: PostgreSQL 15, Redis 7, MinIO, Docker Compose
