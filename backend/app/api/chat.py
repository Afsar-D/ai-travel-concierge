from fastapi import APIRouter
from app.agent.state import AgentState
from app.agent.graph import travel_agent
from app.schema.chat import ChatRequest, ChatResponse
router = APIRouter(prefix="/api/chat", tags=["AI Chat"])


@router.post("", response_model=ChatResponse)
async def handle_chat(payload: ChatRequest) -> ChatResponse:
    inital_state :AgentState={
        "message": [payload.message],
        "origin": payload.origin,
        "destination": payload.destination,
        "start_date": payload.start_date,
        "end_date": payload.end_date,
        "budget": payload.budget,
        "guest_count": payload.guest_count,
        "session_id": payload.session_id or 'sess_12',
        'weather_info':'',
        'flight_options':''
    }
    final_state = await travel_agent.ainvoke(inital_state)
    
    return ChatResponse(reply=final_state['message'][-1],session_id='sess_123',status='success')
