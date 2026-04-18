from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def list_lenders():
    """Placeholder — lender catalog."""
    return {"lenders": []}
