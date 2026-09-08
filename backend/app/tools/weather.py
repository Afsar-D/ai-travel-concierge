from fastapi import APIRouter
from typing import Any, Tuple
import httpx
import asyncio

router = APIRouter(prefix="/tools/weather")

WMO_CODES = {
    0: {"desc": "Clear sky", "icon": "☀️"},
    1: {"desc": "Mainly clear", "icon": "🌤️"},
    2: {"desc": "Partly cloudy", "icon": "⛅"},
    3: {"desc": "Overcast", "icon": "☁️"},
    45: {"desc": "Fog", "icon": "🌫️"},
    48: {"desc": "Depositing rime fog", "icon": "🌫️"},
    51: {"desc": "Light drizzle", "icon": "🌦️"},
    53: {"desc": "Moderate drizzle", "icon": "🌦️"},
    55: {"desc": "Dense drizzle", "icon": "🌧️"},
    56: {"desc": "Light freezing drizzle", "icon": "🥶🌧️"},
    57: {"desc": "Dense freezing drizzle", "icon": "🥶🌧️"},
    61: {"desc": "Slight rain", "icon": "🌦️"},
    63: {"desc": "Moderate rain", "icon": "🌧️"},
    65: {"desc": "Heavy rain", "icon": "🌧️🌧️"},
    66: {"desc": "Light freezing rain", "icon": "🥶🌧️"},
    67: {"desc": "Heavy freezing rain", "icon": "🥶🌧️"},
    71: {"desc": "Slight snowfall", "icon": "🌨️"},
    73: {"desc": "Moderate snowfall", "icon": " snowfall", "icon": "🌨️"},
    75: {"desc": "Heavy snowfall", "icon": "❄️🌨️"},
    77: {"desc": "Snow grains", "icon": "🌨️"},
    80: {"desc": "Slight rain showers", "icon": "🌦️"},
    81: {"desc": "Moderate rain showers", "icon": "🌧️"},
    82: {"desc": "Violent rain showers", "icon": "⛈️"},
    85: {"desc": "Slight snow showers", "icon": "🌨️"},
    86: {"desc": "Heavy snow showers", "icon": "❄️🌨️"},
    95: {"desc": "Thunderstorm", "icon": "⛈️"},
    96: {"desc": "Thunderstorm with slight hail", "icon": "⛈️🌨️"},
    99: {"desc": "Thunderstorm with heavy hail", "icon": "⛈️❄️"},
}


def get_coords(location: str, origin: str) -> Any:
    geo_url_location = f"https://geocoding-api.open-meteo.com/v1/search?name={location}&count=1&language=en&format=json"
    geo_url_origin = f"https://geocoding-api.open-meteo.com/v1/search?name={origin}&count=1&language=en&format=json"
    data = httpx.get(geo_url_location)
    data_origin = httpx.get(geo_url_origin)
    response = data.json()
    response_origin = data_origin.json()
    if "results" in response and "results" in response_origin:
        lat = response["results"][0]["latitude"]
        lon = response["results"][0]["longitude"]
        return {"coords": {"lat": lat, "lon": lon}, "status": 200}
    return {"status": 400}


@router.get("")
async def get_weather_forecast(
    start_date: str, end_date: str, location: str, origin: str
) -> str:
    url = "https://api.open-meteo.com/v1/forecast"
    d = get_coords(location=location, origin=origin)
    if d["status"] == 200:
        lat = d["coords"]["lat"]
        lon = d["coords"]["lon"]
        params = {
            "latitude": lat,
            "longitude": lon,
            "start_date": start_date,
            "end_date": end_date,
            "daily": "temperature_2m_min,temperature_2m_max,rain_sum,weather_code",
            "timezone": "auto",
        }
        async with httpx.AsyncClient() as client:
            response = await client.get(url=url, params=params)
        
        data = response.json()

        if "daily" not in data or not data["daily"].get("time"):
            return f"Weather forecast unavailable for {location} between {start_date} and {end_date}. (Please ensure travel dates are between today and 16 days into the future)."

        daily_report = ""
        for i in range(len(data["daily"]["time"])):
            daily_report += f"On {data['daily']['time'][i]} : Min temp {data['daily']['temperature_2m_min'][i]}°C and Max temp {data['daily']['temperature_2m_max'][i]}°C. Likely to be {WMO_CODES[data['daily']['weather_code'][i]]['icon']} {WMO_CODES[data['daily']['weather_code'][i]]['desc']}\n"

        return f"Weather Report for {location} from {start_date} to {end_date}:\n{daily_report}"
    return f"Error {d['status']} : {location} or {origin} not found"
