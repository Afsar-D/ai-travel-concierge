from langgraph.graph import StateGraph, START, END
from app.agent.state import AgentState
from app.agent.tools import fetch_weather
from app.agent.tools import fetch_flights
from app.agent.tools import fetch_hotels
from google import genai
from google.genai import types
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)


async def generate_iternerary(state: AgentState) -> dict:
    origin = state["origin"]
    destination = state["destination"]
    budget = state["budget"]
    weather = state.get("weather_info", "No weather data available")
    message = state.get("message", [])
    flights = state.get("flight_options", "No Flights data available")
    hotels = state.get("hotel_options", "No hotels Options available")
    guests = state["guest_count"]
    start_date = state["start_date"]
    end_date = state["end_date"]
    d1 = datetime.strptime(start_date, "%Y-%m-%d")
    d2 = datetime.strptime(end_date, "%Y-%m-%d")
    total_days = max(1, (d2 - d1).days + 1)
    if "not found" in weather.lower() or "error 400" in weather.lower():
        return {
            "message": [
                f"Error: City '{destination}' could not be found. Please Check spelling or enter a valid city."
            ]
        }
    prompt = f"""You are an expert AI Travel Concierge. Your goal is to craft a customized, realistic, and highly engaging travel itinerary based on the user's trip context, budget tier, and live weather forecast.### Trip Context:
    - Origin City: {origin}
    - Destination City: {destination}
    - Number of Travelers: {guests} person(s)
    - Budget Tier: {budget}
    - Travel Dates: {start_date} to {end_date} ({total_days} Days total)
    - Real-Time Weather Forecast:
    {weather}
    - Real-Time Flight Options:
    {flights}
    - Real-Time Hotel Options:
    {hotels}

    ### User's Specific Request / Message:
    {message}

    ### CRITICAL FORMATTING & STRUCTURE RULES (STRICT COMPLIANCE):
    1. **Day Headings**: You MUST generate an explicit section for ALL {total_days} days (from Day 1 up to Day {total_days}). Use exact heading format: `## Day X` (e.g. `## Day 1`, `## Day 2`).
    2. **Activity Bullet Format**: Every activity item MUST be a bullet point formatted exactly as:
    `* **[Place Name or Activity Title]**: Detailed description of the activity and experience.`
    Do NOT prefix titles with `Morning/Afternoon:`, `Date:`, `Weather:`, or `Theme:`.
    3. **NO Markdown Tables**: Do NOT use Markdown tables (e.g. `| Header | Header |`) for day-by-day itineraries. Use bullet points only.
    4. **NO Summary Bullets**: Do NOT add extra metadata bullet points for dates, weather summaries, or daily budget totals under day headers.

    ### CONTENT & INTEGRATION RULES:
    1. **Weather Adaptation**: Schedule indoor activities (museums, art galleries, covered markets, cafes) on rainy or overcast days, and outdoor sightseeing (beaches, forts, walking tours) on clear or sunny days.
    2. **Budget Alignment**: Tailor activity selections, dining recommendations, and accommodation tips strictly to the "{budget}" tier for {guests} traveler(s).
    3. **Flight Handling**: 
    - If valid flight data is present in `flight_options` OR if the user explicitly asked about flights in their message, include a concise flight recommendation section.
    - Otherwise, do NOT generate a flight section or fallback flight message when the user is asking about activities, dining, or weather.
    4. **User Request Focus**: If the user's message asks a specific question (e.g., "Weather and indoor plans"), address that request directly while preserving the clean bullet itinerary structure.
    """

    response = await client.aio.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents=prompt,
        config=types.GenerateContentConfig(temperature=0.7, max_output_tokens=6000),
    )
    # async for chunk in response:
    #     yield chunk.text
    return {"message": [response.text]}


async def continuous_chat_stream(history: list):
    formatted_list = []
    for chat in history:
        if chat["sender"] == "user":
            formatted_list.append(
                {"role": "user", "parts": [{"text": chat["content"]}]}
            )
        else:
            formatted_list.append(
                {"role": "model", "parts": [{"text": chat["content"]}]}
            )
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


def fetch_flights_decision(state: AgentState) -> str:
    message = state.get("message", [])
    combined_message = " ".join(message).lower()
    keywords = ["flights", "flight", "airfare", "airplane", "fly", "plane", "airport"]
    if any(word in combined_message for word in keywords):
        return "flight_node"
    return "llm_node"


workflow = StateGraph(AgentState)

workflow.add_node("llm_node", generate_iternerary)
workflow.add_node("weather_node", fetch_weather)
workflow.add_node("flight_node", fetch_flights)
workflow.add_node("hotel_node", fetch_hotels)

workflow.add_edge(START, "weather_node")
workflow.add_edge("weather_node", "hotel_node")
workflow.add_conditional_edges("hotel_node", fetch_flights_decision)
workflow.add_edge("flight_node", "llm_node")
workflow.add_edge("llm_node", END)

travel_agent = workflow.compile()
