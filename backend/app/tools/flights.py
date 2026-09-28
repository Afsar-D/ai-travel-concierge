import json
from fastapi import APIRouter
import httpx
import asyncio
import os
from dotenv import load_dotenv
import serpapi

load_dotenv()
serp_api = os.getenv("SERP_API_KEY")


def get_flight_codes(origin: str, destination: str):
    with open(os.path.join(os.path.dirname(__file__), "airplanes.json")) as file:
        data = json.load(file)
    flag_origin = False
    flag_dest = False
    origin_iata, destination_iata = "", ""
    if not flag_dest and not flag_origin:
        for key in data:
            if data[key]["city"] == origin and not flag_origin:
                origin_iata = key
                flag_origin = True
            if data[key]["city"] == destination and not flag_dest:
                destination_iata = key
                flag_dest = True
    return (origin_iata, destination_iata) if origin_iata != ""  and  destination_iata != ""  else  (None,None)


async def get_flight_recommendations(
    origin: str, destination: str, start_date: str, end_date: str, currency: str = "INR"
):
    origin_id,  destination_id = get_flight_codes(origin=origin,destination=destination)
    if  origin_id and  destination_id:
        client = serpapi.Client(api_key=serp_api)
        params = {
            "engine": "google_flights",
            "departure_id": origin_id,
            "arrival_id": destination_id,
            "currency": currency,
            "type": "2",
            "outbound_date": start_date,
            "return_date": end_date
        }
        search = client.search(params=params)
        return search.get('best_flights',[])
    else:
        return "Cites Not found"
