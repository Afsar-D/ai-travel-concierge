from fastapi import APIRouter

router = APIRouter(prefix="/api/health", tags=["Health"])


@router.get("/")
async def statusInfo():
    return {
        "status": "ok",
        'service': 'AI Travel Concierge'
    }
