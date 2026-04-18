from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import time, logging, traceback
from app.core.config import settings
from app.core.redis import init_redis, close_redis, redis_client
from app.ml.artifacts import ModelArtifacts
from app.api.v1 import audit, simulate, negotiation, balance_transfer, lenders

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("loadlens")

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


# --- Global Exception Handlers (Step 4) ---

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {traceback.format_exc()}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Request has been logged."}
    )

@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    return JSONResponse(status_code=422, content={"detail": str(exc)})


# --- Lifecycle Events ---

@app.on_event("startup")
async def startup():
    await init_redis()
    from app.core.redis import redis_client
    app.state.redis = redis_client
    logger.info("Redis initialized.")
    ModelArtifacts.get()
    logger.info("Models loaded - application ready.")


@app.on_event("shutdown")
async def shutdown():
    await close_redis()


@app.get("/health")
async def health():
    return {"status": "ok", "service": "loadlens-api"}
