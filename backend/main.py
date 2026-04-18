from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.redis import init_redis, close_redis
from app.api.v1 import audit, simulate, negotiation, balance_transfer, lenders

app = FastAPI(
    title="LoadLens API",
    version="1.0.0",
    description="AI-powered home loan benchmarking engine"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(audit.router, prefix="/api/v1/audit", tags=["audit"])
app.include_router(simulate.router, prefix="/api/v1/simulate", tags=["simulate"])
app.include_router(negotiation.router, prefix="/api/v1/negotiation-script", tags=["negotiation"])
app.include_router(balance_transfer.router, prefix="/api/v1/balance-transfer", tags=["balance-transfer"])
app.include_router(lenders.router, prefix="/api/v1/lenders", tags=["lenders"])


@app.on_event("startup")
async def startup():
    await init_redis()


@app.on_event("shutdown")
async def shutdown():
    await close_redis()


@app.get("/health")
async def health():
    return {"status": "ok", "service": "loadlens-api"}
