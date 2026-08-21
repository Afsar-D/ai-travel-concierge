
import requests
import os
from dotenv import load_dotenv

load_dotenv()
weather_api = os.getenv('OPENWEATHER_API_KEY')

def get_weather_forecast(city):
    url = f'https://api.openweathermap.org/data/2.5/weather?q={city}&appid={weather_api}&units=metric'
    data = requests.get(url)
    response = data.json()
    if response['cod'] == 200:
        return f'''Temperature in {city} is {response['main']['temp']}\nWeather likely to be {response['weather'][0]['description']}'''
    else:
        return response['message']

print(get_weather_forecast('new york'))