from datetime import date
import os
import requests
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
    99: {"desc": "Thunderstorm with heavy hail", "icon": "⛈️❄️"}
}


def get_coords(location:str)->str:
    """Fetch Coordinates of location/city use this ONLY when needed to fetch coordinates of city/location
    Args:
        location(str): The name of destination ("Paris", "Goa")
    Return:
        Latitiude, longitude , country name"""
    geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={location}&count=1&language=en&format=json"
    data = requests.get(geo_url).json()
    lat = data['results'][0]['latitude']    
    lon = data['results'][0]['longitude']
    country = data['results'][0]['country']
    return lat, lon, country
    
    
def get_weather_forecast(lat:float, lon:float, start_date:str, end_date:str, location:str)->str:
        """Fetches real-time weather forecasts, daily temperatures, and rain predictions for a city/location.
        Use this tool ONLY when the user asks about weather, rain, temperature, 
        what to wear, or when planning outdoor vs. indoor activities.
        Args:
            lat(float) : latitude of location.
            lon(float) : longitude of location.
            start and end dates (date):Dates
            and location(str): Name of the city.
            
        Returns:
            str: Multi-day weather forecast summary including temperatures (°C) and rain (mm)."""
        url ="https://api.open-meteo.com/v1/forecast"
        params = {
            'latitude' : lat,
            'longitude': lon,
            'start_date': start_date,
            'end_date' : end_date,
            'daily': 'temperature_2m_min,temperature_2m_max,rain_sum,weather_code',
            'timezone': "auto"
        }
        try:
            data = requests.get(url=url, params=params)
            data.raise_for_status()
            res = data.json()
            val = len(res['daily']['time'])
            summary = f"{location} Weather Forecast Between {start_date} to {end_date}"
            for value in range(val):
                summary += f"On {res['daily']['time'][value]} the lowest temperature is {res['daily']['temperature_2m_min'][value]}, the highest temperature is {res['daily']['temperature_2m_max'][value]}, Weather Likely to be {WMO_CODES[res['daily']['weather_code'][value]]['desc']} {WMO_CODES[res['daily']['weather_code'][value]]['icon'] }\n "
            return summary
        except requests.exceptions.RequestException as e:
            return f'Error : {e}'