from datetime import date, datetime, timezone
from sqlmodel import SQLModel, Field, Relationship


class ChatSession(SQLModel, table=True):
    __tablename__ = "chat_session"
    id: str = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    origin: str
    destination: str
    start_date: str
    end_date: str
    budget: str
    guest_count: int
    messages: list["ChatMessages"] = Relationship(back_populates="session")


class ChatMessages(SQLModel, table=True):
    __tablename__ = "chat_messages"
    id: int | None = Field(default=None, primary_key=True)
    session_id: str = Field(default=None, foreign_key="chat_session.id")
    sender: str
    content: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    session: ChatSession | None = Relationship(back_populates="messages")
