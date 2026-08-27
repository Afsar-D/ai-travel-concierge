# Ai Travel Concierge

An AI-powered travel assistant that creates custom travel itineraries and plans based on destination, dates, budget, and live weather forecasts. 

This project is currently in active development. Below is a summary of what has been built and what is coming next.

---

## 🚀 Current Project Progress

Right now, the core backend integration and basic user interface are fully functional. The app can take user inputs, look up real coordinates, fetch live weather, and stream custom travel itineraries from Gemini.
Deployed in Streamlit cloud.

### What is working:
* **Interactive UI**: Sidebar with inputs for destination city, start/end dates, trip duration calculation, budget slider, and a trigger button.
* **Location Geocoding**: Automatically converts city names (e.g., "Paris", "Tokyo") into exact latitude and longitude coordinates.
* **Weather Tool**: Integrates Open-Meteo API to fetch multi-day temperatures and rainfall data to help plan around rainy days.
* **Flight Tools**: Get Coordinates from weather tool, get IATA codes from database and search for nearby flights. Using Haversine formula if finds distance between coordinates
* **Web Search**: Used Tavily API for websearch (like recommendations of hotels , restaurants and places etc)
* **AI Agent Setup**: Connected to Google's official new SDK (`google-genai`) running the `gemini-2.5-flash-lite` model.
* **Live Streaming**: The travel itinerary streams live on screen word-by-word as Gemini generates it.
* **Session Memory**: Uses a custom dictionary structure in Streamlit session state to remember generated plans and chat history per city.

---

## 🛠️ The Tech Stack (So far)

* **Language**: Python 3.11+
* **Frontend**: Streamlit
* **AI Orchestration**: Google GenAI SDK (`google-genai`)
* **APIs**: Open-Meteo (Geocoding & Weather Forecasts)
* **Libraries**: `requests` (API calls), `python-dotenv` (secure API keys)

---

## 📁 Project Structure

```text
ai-travel-agent/
├── app/
│   └── app.py              # Streamlit UI & main application logic
├── tools/
│   ├── __init__.py
│   └── flights_n_hotels.py # Flight recommendation tools added(searches Nearby Flights)
│   └── weather.py          # Geocoding & weather API integrations
│   └── web_search.py       # Web search integration for recommendations(places, restaurants, etc)
├── .env                    # Private API keys (ignored by git)
├── .env.example            # Template for required environment variables
├── requirements.txt        # Project dependencies
└── README.md               # This progress file
```
---

 ## ⚙️ Quick Start 
 Clone the repo and navigate to the project directory.

**Set up a virtual environment:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```
**Install dependencies:**
```bash
pip install -r requirements.txt
```
**Configure your API keys: Create a .env file in the root folder and add your key:**
```env
GEMINI_API_KEY=your_gemini_api_key_here
TAVILY_API_KEY=you_tavily_api_key_here
OPEN_API_KEY=your_open_api_key_here
SERP_API_KEY=you_serp_api_key_here
```
**Run the application:**
```bash
python -m streamlit run app/app.py
```