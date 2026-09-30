import asyncio
import serpapi
import os
from dotenv import load_dotenv

load_dotenv()

client = serpapi.Client(api_key=os.getenv("SERP_API_KEY"))


async def get_hotel_recommendations(
    destination: str, start_date: str, end_date: str, guests: int, currency: str = "INR"
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
        search = await asyncio.to_thread(client.search, params=params)
        data = search.get("properties", [])
        result = ""
        for hotel in data[:3]:
            name = hotel["name"]
            rate_per_night = hotel.get("rate_per_night", {}).get("lowest", "")
            rating = hotel.get("overall_rating")
            amenities = ", ".join(hotel.get("amenities") or [])
            result += f"""{name}\n - Rating : {rating}\n {f"- Rate Per Night : {rate_per_night}\n " if rate_per_night != "" else ""}- Amenities : {amenities}\n"""
        return result if result else f"No Hotels Available in {destination}"
    except Exception as e:
        return f"Unexpected Error Occured : {e}"
