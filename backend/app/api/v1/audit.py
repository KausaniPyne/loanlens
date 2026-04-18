from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.redis import get_redis
from app.schemas.borrower import BorrowerProfile
from app.services.audit_service import create_audit

router = APIRouter()

@router.post("")
async def run_audit(
    profile: BorrowerProfile,
    db: AsyncSession = Depends(get_db),
    redis = Depends(get_redis)
):
    return await create_audit(profile, db, redis)

@router.get("/{audit_id}")
async def get_audit(audit_id: str, db: AsyncSession = Depends(get_db)):
    from app.services.audit_service import fetch_audit
    return await fetch_audit(audit_id, db)
