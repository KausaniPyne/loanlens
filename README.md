# LoadLens

AI-powered home loan benchmarking engine. Reveals whether your interest rate is fair by comparing you against thousands of statistically similar borrowers using a CatBoost + TabNet stacked ensemble.

![Next.js](https://img.shields.io/badge/Next.js-14-black) ![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688) ![Python](https://img.shields.io/badge/Python-3.11-blue) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791) ![Redis](https://img.shields.io/badge/Redis-7-DC382D)

---

## Prerequisites

- **Docker Desktop** (latest)
- **8 GB RAM** minimum
- Ports `3000`, `8000`, `5432`, `6379`, `9000`, `9001` must be free

## One-Command Setup

```bash
git clone https://github.com/KausaniPyne/loanlens.git
cd loanlens
docker compose up --build
```

Wait approximately 2–3 minutes for all services to initialize and show healthy status.

## Run Training Pipeline (required before first use)

Open a **new terminal** after `docker compose up` has finished:

```bash
docker compose exec backend python training/generate_synthetic_data.py
docker compose exec backend python training/preprocess_and_cluster.py
docker compose exec backend python training/train_catboost.py
docker compose exec backend python training/train_tabnet.py
docker compose exec backend python training/evaluate.py
docker compose exec backend python training/register_model.py
```

Total training time: approximately 8–15 minutes on a standard laptop CPU.

After training completes, **restart the backend** to load models into memory:

```bash
docker compose restart backend
```

## Access the Application

| Service | URL |
|---------|-----|
| **Frontend** | [http://localhost:3000](http://localhost:3000) |
| **API Docs** | [http://localhost:8000/docs](http://localhost:8000/docs) |
| **MinIO Console** | [http://localhost:9001](http://localhost:9001) (user: `minioadmin`, pass: `minioadmin123`) |

## Demo Mode

Click **"Load Green Demo"**, **"Load Yellow Demo"**, or **"Load Red Demo"** on the audit form to instantly load pre-configured profiles and see all three verdict states without manual data entry.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  Next.js 14  │────▶│  FastAPI      │────▶│ PostgreSQL 15│
│  (React 18)  │     │  (Python 3.11)│     └──────────────┘
└─────────────┘     │              │     ┌──────────────┐
                    │  CatBoost    │────▶│  Redis 7     │
                    │  TabNet      │     └──────────────┘
                    │  K-Means     │     ┌──────────────┐
                    └──────────────┘────▶│  MinIO (S3)  │
                                        └──────────────┘
```

- **Backend**: FastAPI + Python 3.11
- **ML Engine**: CatBoost + TabNet stacked ensemble, K-Means clustering (8 clusters, 100K synthetic records)
- **Database**: PostgreSQL 15 (loan portfolio + audit logs + model registry)
- **Cache**: Redis 7 (corridor caching + rate limiting)
- **Model Storage**: MinIO (S3-compatible object store)
- **Frontend**: Next.js 14 + Tailwind CSS + Recharts + Zustand

## How It Works

1. **Data Ingestion** — Parse the borrower's loan configuration and financial profile
2. **Peer Grouping** — K-Means isolates the borrower's exact financial cohort from 100,000 records
3. **AI Benchmarking** — CatBoost predicts base rate; TabNet meta-model refines with sequential attention
4. **The Verdict** — GREEN (elite deal), YELLOW (fair market), or RED (action required) with a full negotiation playbook

## Pre-Demo Checklist

```
[ ] docker compose down -v  (full reset)
[ ] docker compose up --build  (clean build)
[ ] Wait for all services healthy (docker compose ps)
[ ] Run all 6 training scripts in order
[ ] docker compose restart backend
[ ] Load Green Demo → verify GREEN verdict
[ ] Load Yellow Demo → verify YELLOW verdict
[ ] Load Red Demo → verify RED verdict + all playbook panels
[ ] Run What-If simulation on RED result
[ ] Confirm pipeline_latency_ms < 2000
[ ] Check mobile viewport (375px) for layout
[ ] Browser console errors: 0
```

## License

MIT
