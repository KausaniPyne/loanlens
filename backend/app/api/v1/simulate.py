from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.redis import get_redis
from app.schemas.borrower import BorrowerProfile
from app.ml.pipeline import run_inference

router = APIRouter()

@router.post("")
async def simulate(
    profile: BorrowerProfile,
    scenario_overrides: dict = {},
    db: AsyncSession = Depends(get_db),
    redis = Depends(get_redis)
):
    # Merge overrides into profile
    modified = profile.model_copy(update=scenario_overrides)
    result = await run_inference(modified, db, redis)
    result["is_simulation"] = True
    return result
