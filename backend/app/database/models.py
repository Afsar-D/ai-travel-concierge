from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, Relationship
from pydantic import EmailStr


class ChatSession(SQLModel, table=True):
    __tablename__ = "chat_session"  # pyright: ignore[reportAssignmentType]
    id: str = Field(default=None, primary_key=True)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc).replace(tzinfo=None)
    )
    origin: str
    destination: str
    start_date: str
    end_date: str
    budget: str
    guest_count: int
    messages: list["ChatMessages"] = Relationship(back_populates="session")


class ChatMessages(SQLModel, table=True):
    __tablename__ = "chat_messages"  # pyright: ignore[reportAssignmentType]
    id: int | None = Field(default=None, primary_key=True)
    session_id: str = Field(default=None, foreign_key="chat_session.id")
    sender: str
    content: str
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc).replace(tzinfo=None)
    )
    session: ChatSession | None = Relationship(back_populates="messages")


class User(SQLModel, table=True):
    __tablename__ = "users"  # pyright: ignore[reportAssignmentType]
    id: int | None = Field(default=None, primary_key=True)
    name: str
    email: EmailStr = Field(unique=True, index=True)
    hashed_password: str
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc).replace(tzinfo=None)
    )


class FlightBooking(SQLModel, table=True):
    __tablename__ = "flight_booking"  # pyright: ignore[reportAssignmentType]
    id: int | None = Field(default=None, primary_key=True)
    session_id: str = Field(default=None, foreign_key="chat_session.id")
    airline: str
    flight_number: str
    departure_time: str
    arrival_time: str
    duration: str
    price: str
    stops: str
    departure_airport: str
    arrival_airport: str


class HotelBooking(SQLModel, table=True):
    __tablename__ = "hotel_booking"  # pyright: ignore[reportAssignmentType]
    id: int | None = Field(default=None, primary_key=True)
    session_id: str = Field(default=None, foreign_key="chat_session.id")
    name: str
    rating: float = Field(default=4.5)
    price_per_night: str | None = None
    amenities: str | None = Field(default="")
    neighbourhood: str
    badge: str