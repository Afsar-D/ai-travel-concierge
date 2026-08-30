from ast import Import
import json
import sys
from pathlib import Path
from dotenv import load_dotenv
import os
import math
import serpapi

current_dir = Path(__file__).resolve()
ROOT_DIR = current_dir.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.append(str(ROOT_DIR))
from tools import weather

load_dotenv()
api = os.getenv("SERP_API_KEY")
client = serpapi.Client(api_key=api)

def hotels_search(query:str, check_in_date:str, check_out_date:str, country:str, adults:int=1,children:int=0)->str:
    response = client.search({
        'engine' : "google_hotels",
        "q" : query,
        'adults':adults,
        'children':children,
        'check_in_date':check_in_date,
        'check_out_date':check_out_date,
        'currency': 'INR' if country.lower()=="india" else "USD"
    })
    return response
    
    
def flights_search(departure:str, destination:str, currency:str, start_date:str)->dict:
    """Search for live flight options between two airports using SerpApi's Google Flights engine.

    Arguments:

    departure: The 3-letter IATA code of the starting airport (e.g., 'JFK', 'SFO', 'HYD').
    destination: The 3-letter IATA code of the destination airport (e.g., 'LHR', 'CDG', 'NAP').
    currency: The currency code for ticket pricing (e.g., 'USD', 'INR', 'EUR').
    start_date: The outbound travel date formatted exactly as YYYY-MM-DD (e.g., '2026-09-28').
    """
    response = client.search(
        {
            "engine": "google_flights",
            "departure_id": departure,
            "arrival_id": destination,
            "currency": currency,
            "type": 2,
            "outbound_date": start_date,
        }
    )
    if response['error'] == "Google Flights hasn't returned any results for this query.":
        return f'{departure} --> {destination} no flights available on that date/no connecting flights'
    return response


def haversine(lat1:float, lon1:float, lat2:float, lon2:float)->float:
    """Calculates the distance (in km) between two coordinate points."""
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)

    a = (
        math.sin(dLat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dLon / 2) ** 2
    )
    c = 2 * math.asin(math.sqrt(a))
    return 6371 * c


def find_nearby_airports(city:str)->str:
    """Finds airports nearby provided latitude and longitude.
    Input: Latitude and Longitude of place
    Output: Str of top three results of nearby airports with code after airport name"""
    with open(ROOT_DIR / "database" / "airplanes.json") as file:
        airports = json.load(file)
    lat, lon, _ = weather.get_coords(city)
    distances = []
    for _, info in airports.items():
        if info.get("lat") and info.get("lon"):
            dist = haversine(lat, lon, info.get("lat"), info.get("lon"))
            distances.append((info, dist))
    if not distances:
        return f"No Airports found near {city}\n"
    nearby_airports = list(sorted(distances, key=lambda x: x[1]))
    data = f"Nearby Airports from {city}\n"
    for airport in nearby_airports[:3]:
        data += f"{airport[0]['name']} ({airport[0]['iata']}) is {airport[1]:.1f} km away from {city}\n"
    return data
