from dotenv import load_dotenv
import streamlit as st
from google import genai
from google.genai import types
import os
import datetime
import sys
from pathlib import Path

current_dir = Path(__file__).resolve()
ROOT_DIR = current_dir.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.append(str(ROOT_DIR))
from tools import weather
from tools import web_search
from tools import flights_n_hotels as fh
st.set_page_config(page_title="AI Travel Conicerge",
                   layout='wide')
# sidebar 
with st.sidebar:
    st.header("Give Your Travel Details")
    origin = st.text_input(label="Origin",placeholder='Kurnool...')
    location = st.text_input(label="Location(s)",placeholder='Paris...')
    st.header("Days")
    col1, col2 = st.columns(2)
    with col1:
        start = st.date_input("Choose Start")
    with col2:
        end = st.date_input("Choose end")
    st.subheader("Duration")
    duration = (end-start).days+1
    if duration < 0 : st.warning("End date should be later the start")
    else: st.write(f'{duration} day(s)')
    st.header("Budget")
    budget = st.select_slider('Budget', options=['Low', 'Medium', 'High'])
    button = st.button("Create Plan")
    if not start and not end and not location:
        st.warning("Fill all details")

# Main Content
## API Integration
instructions = f"""You are an expert AI Travel Concierge. Your goal is to provide the best travel advice for any budget and destination. You can check weather conditions, suggest hotels, recommend activities, and search for flights.

Your rules of operation:

Current Trip Context: Keep in mind the user's trip details:origin is {origin} destination is {location}, starting on {start}, ending on {end}, with a {budget} budget.
Weather & Recommendations: Use your weather tools to check forecasts and suggest best places/hotels suited to the user's budget.
Flight Booking Workflow: If the user asks about flights, do the following:
Get the latitude and longitude coordinates of both the departure location and destination.
Find the closest commercial airports (IATA codes) using their coordinates.
Search for flights between those IATA codes on the specified travel date.
Present a clean summary of flights, listing ticket options, layovers, and ground travel tips if the airports are far from the actual cities."""
configuration = types.GenerateContentConfig(
    system_instruction=instructions,
    temperature=0.7,
    max_output_tokens=2500,
    tools=[weather.get_coords , weather.get_weather_forecast, web_search.tavily_search]
)
load_dotenv()

api = os.getenv('GEMINI_API_KEY')
client = genai.Client(api_key=api)
chats = client.chats.create(model='gemini-3.5-flash-lite')

def content_stream(content, config):
    response = client.models.generate_content_stream(model='gemini-3.5-flash-lite',
                                                     contents=content,
                                                     config=config)
    for chunk in response:
        if chunk.text:
            yield chunk.text 
col1, col2 = st.columns([2,1],gap= 'large')
content = f"A {duration} day(s) trip/travel to {location} from {start} to {end} with {budget} budget \n"
with col2:
    if button and location and location.lower() not in st.session_state:
        st.session_state[location] = dict()
        for chunk in content_stream(content=content, config = configuration):
            content += chunk
        st.session_state[location]['summary'] = content
    if location and location in st.session_state:
        st.write(st.session_state[location]['summary'])
chat_instructions = f"""Use this summary as context for ongoing chat sesssion {content}.
Current Trip Context: Keep in mind the user's trip details: origin is {origin}, destination is {location}, starting on {start}, ending on {end}, with a {budget} budget.
Do not search for flights automatically. First, present the summary, and ask the user if they would like flight recommendations for their trip. Only call the coordinates, nearby airports, and flight search tools if the user says yes or explicitly asks for flight details.
Flight Booking Workflow: If the user asks about flights, do the following:
Get the latitude and longitude coordinates of both the departure location and destination.
Find the closest commercial airports (IATA codes) using their coordinates.
Search for flights between those IATA codes on the specified travel date.
Present a clean summary of flights, listing ticket options, layovers, and ground travel tips if the airports are far from the actual cities."""
chat_config = types.GenerateContentConfig(
system_instruction=chat_instructions,
temperature=0.7,
max_output_tokens=800,
tools=[weather.get_coords , weather.get_weather_forecast , web_search.tavily_search, fh.flights_search, fh.haversine, fh.find_nearby_airports]
)

userInput = st.chat_input(placeholder='Type Your Message Here')
if 'messages' not in st.session_state:
        st.session_state.messages = []
        st.session_state.messages.append({
            'role': 'ai',
            'content' : 'Hello user 👾, Im your Travel Companion.If you have any query ask me... '
        })
if userInput :
    st.session_state['messages'].append({
        'role': 'user',
        'content': userInput
    })
    
    response = chats.send_message(userInput, config=chat_config)
    st.session_state['messages'].append({
        'role':'ai',
        'content':response.text
    })
with col1:
    for message in st.session_state['messages']:
        with st.chat_message(name=message['role']):
            st.write(message['content'])
# st.session_state