from fastapi import APIRouter

from app.schema.chat import ChatRequest, ChatResponse

router = APIRouter(prefix="/api/chat", tags=["AI Chat"])


@router.post("", response_model=ChatResponse)
async def handle_chat(payload: ChatRequest) -> ChatResponse:
    return ChatResponse(reply= f'{payload.origin} to {payload.destination}',status='hola')