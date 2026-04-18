from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
import time
from app.core.config import settings
from app.core.redis import init_redis, close_redis, redis_client
from app.ml.artifacts import ModelArtifacts
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

class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        redis = request.app.state.redis
        ip = request.client.host
        path = request.url.path

        if "/audit" in path and request.method == "POST" and "simulate" not in path:
            limit = 10
        elif "/simulate" in path:
            limit = 60
        else:
            return await call_next(request)

        key = f"rl:{ip}:{path}"
        count = await redis.incr(key)
        if count == 1:
            await redis.expire(key, 60)
        if count > limit:
            return JSONResponse(status_code=429, content={"detail": "Rate limit exceeded."})

        return await call_next(request)

app.add_middleware(RateLimitMiddleware)

app.include_router(audit.router, prefix="/api/v1/audit", tags=["audit"])
app.include_router(simulate.router, prefix="/api/v1/simulate", tags=["simulate"])
app.include_router(negotiation.router, prefix="/api/v1/negotiation-script", tags=["negotiation"])
app.include_router(balance_transfer.router, prefix="/api/v1/balance-transfer", tags=["balance-transfer"])
app.include_router(lenders.router, prefix="/api/v1/lenders", tags=["lenders"])


@app.on_event("startup")
async def startup():
    await init_redis()
    from app.core.redis import redis_client
    app.state.redis = redis_client
    ModelArtifacts.get()


@app.on_event("shutdown")
async def shutdown():
    await close_redis()


@app.get("/health")
async def health():
    return {"status": "ok", "service": "loadlens-api"}
