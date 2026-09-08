from typing import TypedDict


class AgentState(TypedDict):
    message: list[str]
    origin: str
    destination: str
    start_date: str
    end_date: str
    budget: str
    guest_count: int
    session_id: str
    weather_info: str
    flight_options: str
