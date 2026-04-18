from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def get_negotiation_script():
    """Placeholder — negotiation script generator."""
    return {"script": "not implemented"}
