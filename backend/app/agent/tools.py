from app.agent.state import AgentState
from app.tools.weather import get_weather_forecast
from app.tools.flights import get_flight_recommendations
from app.tools.hotels import get_hotel_recommendations


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
    currency = state.get("currency", "INR")
    flight_summary = await get_flight_recommendations(
        origin=origin,
        destination=destination,
        start_date=start_date,
        end_date=end_date,
        currency=currency,
    )
    return {"flight_options": flight_summary}


async def fetch_hotels(state: AgentState) -> dict[str, str]:
    destination = state["destination"]
    start_date = state["start_date"]
    end_date = state["end_date"]
    guests = state["guest_count"]
    currency = state.get("currency", "INR")
    hotel_summary = await get_hotel_recommendations(
        destination=destination,
        start_date=start_date,
        end_date=end_date,
        currency=currency,
        guests=guests,
    )
    return {"hotel_options": hotel_summary}
