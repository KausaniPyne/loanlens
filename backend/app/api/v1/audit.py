from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def list_audits():
    """Placeholder — returns empty list."""
    return {"audits": []}
