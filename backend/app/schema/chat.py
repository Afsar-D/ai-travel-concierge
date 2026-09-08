from pydantic import BaseModel
from pydantic import model_validator
from datetime import datetime
from typing import Self

class ChatRequest(BaseModel):
    message: str
    origin: str
    destination: str
    start_date: str
    end_date: str
    budget: str = "medium"
    guest_count: int = 1
    session_id: str | None = None

    @model_validator(mode="after")
    def validate_date_range(self) -> Self:
        start_date = datetime.strptime(self.start_date, "%Y-%m-%d")
        end_date = datetime.strptime(self.end_date, "%Y-%m-%d")
        if end_date < start_date:
            raise ValueError("end_date must be on or after start_date")
        return self

class ChatResponse(BaseModel):
    reply: str
    session_id: str | None = None
    status: str
