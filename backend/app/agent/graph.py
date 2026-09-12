from langgraph.graph import StateGraph, START, END
from app.agent.state import AgentState
from app.agent.tools import fetch_weather
from google import genai
from google.genai import types
import os
from dotenv import load_dotenv
from typing import Any
from app.database.session import init_db, get_session

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)


async def generate_iternerary(state: AgentState) -> Any:
    origin = state["origin"]
    destination = state["destination"]
    budget = state["budget"]
    weather = state.get("weather_info", "No weather data available")
    message = state.get("message", [])
    guests = state["guest_count"]
    if any(
        keyword in weather.lower() for keyword in ["error", "unavailable", "not found"]
    ):
        yield f"Sorry, I could not find location data for '{destination}' or '{origin}'. Please check the city names/spelling and try again!"
    prompt = f"""You are an expert AI Travel Concierge. Your goal is to craft a customized, realistic, and memorable travel itinerary based on the user's specific trip context, budget tier, and live weather forecast.
    ### Trip Context:
    - Origin City: {origin}
    - Destination City: {destination}
    - Number of Travelers: {guests} person(s)
    - Budget Level: {budget} 
    (Note: Low = budget stays, public transit, free attractions; Medium = balanced dining, popular sights; High = luxury stays, private tours, fine dining)
    - Real-Time Weather Forecast:
    {weather}
    ### User's Specific Request / Message:
    {message}
    ### Instructions for Response Generation:
    1. **Weather Alignment**: Adapt daily activities directly to the forecast above. Schedule indoor activities (museums, art galleries, covered markets) on rainy/cloudy days, and outdoor sightseeing or walking tours on clear/sunny days.
    2. **Budget & Group Sizing**: Tailor all activity recommendations, dining spots, and accommodation tips strictly to the requested "{budget}" tier for {guests} guest(s).
    3. **Travel & Transit Tips**: Include practical ground travel advice for moving between {origin} and {destination}.
    4. **Structure & Formatting**: Present the final plan using clean Markdown headings, day-by-day bullet points, emoji icons, and estimated cost ranges.
    Provide an engaging, inspiring, and well-structured response."""

    response = await client.aio.models.generate_content_stream(
        model="gemini-3.5-flash-lite",
        contents=prompt,
        config=types.GenerateContentConfig(temperature=0.7, max_output_tokens=2500),
    )
    async for chunk in response:
        yield chunk.text


async def continuous_chat_stream(history: list):
    formatted_list = []
    for chat in history:
        if chat["sender"] == "user":
            formatted_list.append({"role": "user", "parts": [chat["content"]]})
        else:
            formatted_list.append({"role": "model", "parts": [chat["content"]]})
    return formatted_list


async def chat_stream(history: list, new_message: str):
    chat = client.aio.chats.create(
        model="gemini-3.5-flash-lite",
        history=history,
        config=types.GenerateContentConfig(temperature=0.7, max_output_tokens=1500),
    )
    response_stream = await chat.send_message_stream(new_message)
    async for chunk in response_stream:
        yield chunk.text


workflow = StateGraph(AgentState)

workflow.add_node("weather_node", fetch_weather)
workflow.add_node("llm_node", generate_iternerary)

workflow.add_edge(START, "weather_node")
workflow.add_edge("weather_node", "llm_node")
workflow.add_edge("llm_node", END)

travel_agent = workflow.compile()
