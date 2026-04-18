from fastapi import APIRouter

router = APIRouter()


@router.post("/")
async def run_simulation():
    """Placeholder — what-if simulation endpoint."""
    return {"simulation": "not implemented"}
