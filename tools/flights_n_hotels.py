import json
import sys
from pathlib import Path
from dotenv import load_dotenv
import os
import math
import serpapi
from weather import get_coords

current_dir = Path(__file__).resolve()
ROOT_DIR = current_dir.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.append(str(ROOT_DIR))

load_dotenv()
api = os.getenv("SERP_API_KEY")
client = serpapi.Client(api_key=api)


def flights_search(departure, destination, currency, start_date):
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
    return response


def haversine(lat1, lon1, lat2, lon2):
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


def find_nearby_airports(city):
    """Finds airports nearby provided latitude and longitude.
    Input: Latitude and Longitude of place
    Output: Str of top three results of nearby airports with code after airport name"""
    with open(ROOT_DIR / "database" / "airplanes.json") as file:
        airports = json.load(file)
    lat , lon , _ = get_coords(city)
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

