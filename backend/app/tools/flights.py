import json
import asyncio
import os
from dotenv import load_dotenv
import serpapi

load_dotenv()
serp_api = os.getenv("SERP_API_KEY")


def get_flight_codes(origin: str, destination: str) -> tuple[str | None, str | None]:
    """Lookup IATA airport codes for given origin and destination city names.

    Reads local airplanes.json dataset using case-insensitive string matching.

    Args:
        origin (str): Name of the departure city (e.g., 'Mumbai').
        destination (str): Name of the arrival city (e.g., 'New Delhi').

    Returns:
        tuple[str | None, str | None]: A tuple containing (origin_iata, destination_iata)
        codes if both are found, otherwise returns (None, None).
    """
    with open(os.path.join(os.path.dirname(__file__), "airplanes.json")) as file:
        data = json.load(file)
    flag_origin = False
    flag_dest = False
    origin_iata, destination_iata = "", ""
    for key in data:
        if flag_dest and flag_origin:
            break
        else:
            if (
                data[key]["city"].strip().lower() == origin.strip().lower()
                and not flag_origin
            ):
                origin_iata = key
                flag_origin = True
            if (
                data[key]["city"].strip().lower() == destination.strip().lower()
                and not flag_dest
            ):
                destination_iata = key
                flag_dest = True
    return (
        (origin_iata, destination_iata)
        if origin_iata != "" and destination_iata != ""
        else (None, None)
    )


async def get_flight_recommendations(
    origin: str, destination: str, start_date: str, end_date: str, currency: str = "INR"
):
    """Fetch best flight options asynchronously between two cities using SerpApi.

    Resolves city names to IATA codes and offloads synchronous network requests
    to a background thread to prevent blocking the event loop.

    Args:
        origin (str): Departure city name.
        destination (str): Arrival city name.
        start_date (str): Outbound departure date in 'YYYY-MM-DD' format.
        end_date (str): Return departure date in 'YYYY-MM-DD' format.
        currency (str, optional): Target currency for prices. Defaults to 'INR'.

    Returns:
        list[dict] | str: A list of flight dictionaries returned by SerpApi if found,
        or a string message if city codes cannot be resolved.
    """
    origin_id, destination_id = get_flight_codes(origin=origin, destination=destination)
    if origin_id and destination_id:
        try:
            client = serpapi.Client(api_key=serp_api)
            params = {
                "engine": "google_flights",
                "departure_id": origin_id,
                "arrival_id": destination_id,
                "currency": currency,
                "type": "2",
                "outbound_date": start_date,
                "return_date": end_date,
            }
            search = await asyncio.to_thread(client.search, params=params)
            data = search.get(
                "best_flights",
                f"No flights available found for selected dates from {origin} --> {destination}",
            )
            if (
                data
                == f"No flights available found for selected dates from {origin} --> {destination}"
            ):
                return f"No flights available found for selected dates from {origin} --> {destination}"
            flight_info = ""
            for flight in data[:3]:
                dep_airport = flight["flights"][0]["departure_airport"]["name"]
                dep_time = flight["flights"][0]["departure_airport"]["time"]
                arr_airport = flight["flights"][0]["arrival_airport"]["name"]
                arr_time = flight["flights"][0]["arrival_airport"]["time"]
                price = flight["price"]
                flight_info += f"{dep_airport}[{dep_time}] --> {arr_airport}[{arr_time}], price : {price}/-\n"
            return flight_info
        except Exception as e:
            return f" Error occured {e} "
    else:
        return "Cites Not found"
