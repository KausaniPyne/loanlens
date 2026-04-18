from fastapi import APIRouter

router = APIRouter()


@router.post("/")
async def evaluate_balance_transfer():
    """Placeholder — balance transfer analysis."""
    return {"balance_transfer": "not implemented"}
