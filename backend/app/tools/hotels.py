import asyncio
import serpapi
import os
from dotenv import load_dotenv
from app.database.session import session_factory
from app.database.models import HotelBooking

load_dotenv()

client = serpapi.Client(api_key=os.getenv("SERP_API_KEY"))


async def get_hotel_recommendations(
    destination: str,
    start_date: str,
    end_date: str,
    guests: int,
    session_id: str,
    currency: str = "INR",
) -> str:
    params = {
        "engine": "google_hotels",
        "q": destination,
        "check_in_date": start_date,
        "check_out_date": end_date,
        "currency": currency,
        "adults": guests,
    }
    try:
        search = await asyncio.wait_for(
            asyncio.to_thread(client.search, params=params), timeout=3.0
        )
        data = search.get("properties", [])
        result = ""
        async with session_factory() as session:
            for hotel in data[:3]:
                name = hotel["name"]
                rate_per_night = hotel.get("rate_per_night", {}).get("lowest", "")
                rating = hotel.get("overall_rating")
                badge = hotel_badge(rating)
                amenities = ", ".join(hotel.get("amenities") or [])
                result += f"""{name}\n - Rating : {rating}\n {f"- Rate Per Night : {rate_per_night}\n " if rate_per_night != "" else ""}- Amenities : {amenities}\n"""
                hotel = HotelBooking(
                    name=name,
                    session_id=session_id,
                    rating=rating,
                    price_per_night=rate_per_night,
                    amenities=amenities,
                    neighbourhood=destination,
                    badge=badge,
                )
                session.add(hotel)
                await session.commit()
        return result if result else f"No Hotels Available in {destination}"
    except Exception:
        return f"Standard luxury and botique hotel options in {destination}"


def hotel_badge(rating):
    if rating >= 4.5:
        return "Luxury Top Rated"
    elif rating >= 4.0:
        return "Popular Choice"
    else:
        return "Boutique Charm"