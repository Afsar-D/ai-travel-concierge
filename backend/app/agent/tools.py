from app.agent.state import AgentState
from app.tools.weather import get_weather_forecast
from app.tools.flights import get_flight_recommendations


async def fetch_weather(state: AgentState) -> dict:
    location = state["destination"]
    start_date = state["start_date"]
    end_date = state["end_date"]
    origin = state["origin"]
    weather_report = await get_weather_forecast(
        start_date=start_date, end_date=end_date, location=location, origin=origin
    )
    return {"weather_info": weather_report}


async def fetch_flights(state: AgentState) -> dict[str, str]:
    origin = state["origin"]
    destination = state["destination"]
    start_date = state["start_date"]
    end_date = state["end_date"]
    flight_summary = await get_flight_recommendations(
        origin=origin, destination=destination, start_date=start_date, end_date=end_date
    )
    return {"flight_options": flight_summary}
