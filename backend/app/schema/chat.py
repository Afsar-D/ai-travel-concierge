from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str
    origin: str
    destination: str
    start_date: str
    end_date: str
    budget: str = 'medium'
    guest_count: int = 1
    session_id: str | None = None
    
class ChatResponse(BaseModel):
    reply: str
    session_id: str |None = None
    status:str
