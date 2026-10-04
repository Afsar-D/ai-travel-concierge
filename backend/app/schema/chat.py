from pydantic import BaseModel
from pydantic import model_validator
from datetime import datetime
from typing import Any, Self


class ChatRequest(BaseModel):
    message: str
    origin: str
    destination: str
    start_date: str
    end_date: str
    budget: str = "medium"
    guest_count: int = 1
    session_id: str | None = None
    currency: str = "INR"

    @model_validator(mode="before")
    @classmethod
    def check_data(cls, data: Any) -> Any:
        if isinstance(data, str):
            return {
                "message": data,
                "origin": 'Delhi',
                "destination": 'Goa',
                "start_date": '2026-10-04',
                "end_date":'2026-10-10',
                "budget":'medium',
                "guest_count": 4,
            }
        return data

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