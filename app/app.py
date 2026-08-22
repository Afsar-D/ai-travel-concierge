from dotenv import load_dotenv
import streamlit as st
from dotenv import load_dotenv
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
# sidebar 
with st.sidebar:
    st.header("Give Your Travel Details")
    location = st.text_input(label="Location(s)",placeholder='Paris')
    st.header("Days")
    col1, col2 = st.columns(2)
    with col1:
        start = st.date_input("Choose Start")
    with col2:
        end = st.date_input("Choose end")
    st.subheader("Duration")
    duration = (end-start).days
    if duration < 0 : st.warning("End date should be later the start")
    else: st.write(f'{duration+1} day(s)')
    st.header("Budget")
    st.select_slider('Budget', options=['Low', 'Medium', 'High'])
    button = st.button("Create Plan")

# Main Content
## API Integration
api = os.getenv('GEMINI_API_KEY')
client = genai.Client(api_key=api)
configuration = types.GenerateContentConfig(
    system_instruction=f"You are a multi travel companion who can provide best travel advice for any budget and place check weather conditions and suggest best places and hotels with in the budget range, use summary from cache data or session state",
    temperature=0.7,
    max_output_tokens=700,
    response_mime_type='application/json',
    tools=[weather.get_coords , weather.get_weather_forecast]
)

def content_stream(content,config):
    response = client.models.generate_content_stream(
        model = 'gemini-3.5-flash-lite',
        contents=content,
        config=config
    )
    for t in response:
        yield t.text


st.title("Travel Conicerge")
# st.session_state

with st.chat_message('ai'):
    st.text('Hello user 👾, Im your Travel Companion. How can i Help you? ')
if 'messages' not in st.session_state:
    st.session_state.messages = []

## Intial Plan Append
if button and location and location not in st.session_state:
    lat , lon, country = weather.get_coords(location)
    summary = f'{duration} trip/travel to {location} from {start} to {end}\n'+ weather.get_weather_forecast(lat,lon,start,end,location)
    st.session_state[location] = summary

# Input
if user_input:= st.chat_input(placeholder='Type something here'):
    st.session_state.messages.append({
        'role' : 'user',
        'content' : user_input
    })
    content = ""
    for cont in content_stream(user_input, config=configuration):
        content += cont
    st.session_state.messages.append({
        'role': 'ai',
        'content' : content
    })

for key in st.session_state.messages:
    with st.chat_message(key['role']):
        st.write(key['content'])

# with col4:
#     st.session_state