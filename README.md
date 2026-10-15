# ✈️ ODYSSEY AI — Full Stack AI Travel Concierge

[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Frontend](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61DAFB?style=flat&logo=react)](https://react.dev/)
[![Deployment](https://img.shields.io/badge/Deployed%20on-Railway%20%26%20Vercel-000000?style=flat&logo=railway)](https://ai-travel-concierge.up.railway.app/)
[![Backend Tests](https://img.shields.io/badge/Backend%20Tests-Pytest%20100%25-brightgreen?style=flat&logo=pytest)](https://docs.pytest.org/)
[![Frontend Tests](https://img.shields.io/badge/Frontend%20Tests-Vitest%2014%2F14-brightgreen?style=flat&logo=vitest)](https://vitest.dev/)

An enterprise-grade, full-stack AI Travel Concierge platform. **ODYSSEY AI** lets travelers generate weather-aware, budget-conscious day-by-day itineraries and chat continuously with an intelligent concierge for live flight options, hotel recommendations, weather forecasts, and custom itinerary adjustments.

---

## 🌟 Feature Highlights

- **AI-Generated Itineraries**: Powered by **Google Gemini 2.5 Flash** via the LangGraph agent workflow, producing structured, day-by-day activity plans with estimated costs tailored to Economy, Medium, or Luxury budgets.
- **Live Flight Search**: SerpApi Google Flights integration (`flights.py`) retrieves real-time routes and pricing between origin and destination airports using IATA codes looked up from a local `airplanes.json` dataset.
- **Live Hotel Search**: SerpApi Google Hotels integration (`hotels.py`) pulls current availability, ratings, amenities, and per-night pricing — persisted to the `hotel_booking` table in PostgreSQL.
- **Weather-Aligned Scheduling**: Open-Meteo live forecasts schedule indoor cultural activities on rainy days and outdoor sightseeing on sunny days.
- **Dual Caching Layer**: Upstash Serverless Redis caches weather results with 24-hour TTL eviction, reducing repeated API latency to **< 2 ms**.
- **AI Concierge Chat**: Persistent multi-turn chat with flight/hotel query routing — Concierge automatically sends flight and hotel queries to the **Flights & Stays** tab without corrupting the day-by-day timeline.
- **User Authentication**: Full JWT Bearer token auth (`python-jose`) with `passlib[bcrypt]` password hashing, secure registration and login.
- **Cloud Persistence**: All sessions, messages, flights, and hotel bookings stored in **Supabase PostgreSQL** via `SQLModel` ORM with `asyncpg`.
- **Cinematic UI**: Premium frosted-glass design theme (Crisp Pure White + Sunset Coral `#F43F5E`) with Lottie loading animations, panoramic destination photography, and smooth micro-animations.

---

## 🛠️ Tech Stack

### 🎨 Frontend (React 19 + Vite)
| Layer | Technology |
|---|---|
| Framework | React 19, TypeScript, Vite 8 |
| Styling | TailwindCSS 4, Lucide Icons, Framer Motion |
| Animations | `lottie-web` (Lottie JSON loading & error screens) |
| Confetti | `canvas-confetti` (new trip creation celebration) |
| Testing | Vitest 4 + React Testing Library (14/14 pass) |
| Linting | Oxlint |

### ⚙️ Backend (FastAPI + LangGraph)
| Layer | Technology |
|---|---|
| Framework | FastAPI (Python 3.11+), Uvicorn |
| AI Engine | LangGraph state graph + Google Gemini 2.5 Flash (`google-genai`) |
| Flight Data | SerpApi Google Flights (`serpapi`) |
| Hotel Data | SerpApi Google Hotels (`serpapi`) |
| Weather Data | Open-Meteo geocoding + forecast API (`httpx`) |
| Database | PostgreSQL / Supabase Cloud via `SQLModel` + `asyncpg` |
| Cache | Upstash Serverless Redis (`upstash-redis`) |
| Auth | JWT (`python-jose`), bcrypt (`passlib[bcrypt]`) |
| Testing | Pytest + HTTPX AsyncClient |

---

## 📂 Project Structure

```text
B/
├── Procfile                          # Railway root deployment entry
├── test/
│   └── test_backend_suite.py         # Pytest backend test suite
│
├── backend/
│   ├── Procfile                      # Railway subdirectory Procfile
│   ├── requirements.txt
│   ├── pyproject.toml
│   └── app/
│       ├── app.py                    # FastAPI app factory & router registration
│       ├── agent/
│       │   ├── graph.py              # LangGraph StateGraph (weather → flights → hotels → Gemini)
│       │   ├── state.py              # AgentState TypedDict schema
│       │   └── tools.py              # Async tool orchestration (weather, flights, hotels)
│       ├── api/
│       │   ├── auth.py               # POST /api/register  &  POST /api/login
│       │   ├── chat.py               # POST /api/chat  &  GET /api/sessions  &  DELETE /api/sessions/{id}
│       │   └── health.py             # GET /api/health
│       ├── config/
│       │   └── security.py           # JWT creation & verification, password hashing
│       ├── database/
│       │   ├── models.py             # User, ChatSession, ChatMessages, FlightBooking, HotelBooking
│       │   └── session.py            # AsyncEngine session factory (PostgreSQL / SQLite fallback)
│       ├── schema/
│       │   ├── auth.py               # Pydantic request/response models for auth
│       │   └── chat.py               # Pydantic request/response models for chat
│       └── tools/
│           ├── weather.py            # Open-Meteo geocoding & 7-day forecast fetcher
│           ├── flights.py            # SerpApi Google Flights + IATA code lookup (airplanes.json)
│           ├── hotels.py             # SerpApi Google Hotels + DB persistence
│           ├── cache.py              # Upstash Redis async helpers
│           └── airplanes.json        # Local IATA airport code dataset
│
└── frontend/
    ├── public/
    │   ├── loading.json              # Lottie animation (Lottie v5, used in LoadingScreen)
    │   ├── error.json                # Lottie animation (404 / error pages)
    │   ├── favicon.svg
    │   ├── compass.svg
    │   └── icons.svg
    └── src/
        ├── App.tsx                   # Root app shell, routing, trip state & inventory nav
        ├── components/
        │   ├── LoadingScreen.tsx      # Lottie-animated initial loading screen
        │   ├── LoginPage.tsx          # JWT login & registration form
        │   ├── LandingPage.tsx        # Marketing landing / hero screen
        │   ├── TripDashboard.tsx      # Panoramic trip selector with frosted-glass hero
        │   ├── TripPlanView.tsx       # Day-by-day timeline + Flights & Stays tab
        │   ├── ConciergeChatModal.tsx # Multi-turn AI chat with smart inventory routing
        │   ├── CreateTripModal.tsx    # New trip wizard (origin, destination, dates, budget)
        │   ├── ExportModal.tsx        # iCal / PDF export modal
        │   ├── MarkdownView.tsx       # Markdown renderer for AI replies
        │   ├── InventoryDeck.tsx      # Flight & hotel card deck component
        │   ├── ChatWorkspace.tsx      # Chat workspace container
        │   ├── Sidebar.tsx            # Navigation sidebar
        │   ├── TripContextBar.tsx     # Active trip context bar
        │   ├── ItineraryCanvas.tsx    # Day activity canvas
        │   ├── TelemetryDrawer.tsx    # LangGraph node telemetry panel
        │   ├── AuthErrorPage.tsx      # 401 / session expired error page
        │   └── NotFound404Page.tsx    # 404 page with Lottie animation
        ├── services/
        │   └── api.ts                # Typed API client (chat, sessions, auth)
        ├── types/
        │   └── index.ts              # TripState, ChatMessage, FlightOption, HotelOption, ItineraryDay
        └── utils/
            ├── parser.ts             # Natural language flight & hotel parser (Gemini + SerpApi formats)
            ├── itineraryParser.ts    # Markdown → ItineraryDay[] parser (flight-safe)
            └── themeUtils.ts         # Destination theme palettes & background image mapping
```

---

## ⚙️ Quick Start

### Prerequisites
- **Python 3.11+**
- **Node.js 18+**
- A **SERP_API_KEY** from [serpapi.com](https://serpapi.com/) for live flight and hotel data
- A **GEMINI_API_KEY** from [Google AI Studio](https://aistudio.google.com/)

---

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment configuration
cat > .env <<EOT
GEMINI_API_KEY="your_google_gemini_api_key"
SERP_API_KEY="your_serpapi_key"
JWT_SECRET="supersecretjwtkey123456789"
DATABASE_URL="sqlite+aiosqlite:///./database.db"   # Or a PostgreSQL/Supabase URL
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""
EOT

# Start development server
uvicorn app.app:app --host 0.0.0.0 --port 8000 --reload
```

> Interactive Swagger docs available at **http://localhost:8000/docs**

---

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

> App runs at **http://localhost:5173**

---

## 🧪 Running Tests

Both suites achieve **100% pass rates**.

### Backend — Pytest
```bash
PYTHONPATH=backend pytest test/test_backend_suite.py -v
```
*Covers: user registration, JWT login, duplicate user rejection, invalid password, token expiry, date validation, weather endpoints.*

### Frontend — Vitest (14 tests)
```bash
cd frontend
npm run test
```
*Covers: login form flow, trip creation modal, concierge chat rendering, flight query routing to Flights & Stays tab, `trip.flights` direct display in TripPlanView, error page fallbacks, budget breakdown calculations.*

### Frontend — Production Build
```bash
cd frontend
npm run build
```

---

## 🧠 How the AI Agent Works

```
User Request
     │
     ▼
 fetch_weather()          ← Open-Meteo geocoding + 7-day forecast (Redis cached)
     │
     ▼
 fetch_flights()          ← SerpApi Google Flights (IATA lookup via airplanes.json)
     │
     ▼
 fetch_hotels()           ← SerpApi Google Hotels (results persisted to DB)
     │
     ▼
 generate_itinerary()     ← Gemini 2.5 Flash with full trip context prompt
     │
     ▼
 Structured day-by-day itinerary returned via /api/chat
```

The **ConciergeChatModal** on the frontend uses keyword detection to separate follow-up queries:
- **Flight / hotel queries** → parsed via `parser.ts`, stored in `trip.flights` / `trip.hotels`, routed to the **Flights & Stays** tab — *never appended to the timeline description*.
- **Itinerary modification queries** → parsed via `itineraryParser.ts`, merged into the day-by-day timeline.
- **Weather / general queries** → displayed as a standard AI reply with no state mutation.

---

## ☁️ Deployment

### Railway (Backend)

1. Connect repo to [Railway](https://railway.app/).
2. Set **Root Directory** to `backend` (or leave as `/`).
3. Set **Start Command**:
   ```bash
   uvicorn app.app:app --host 0.0.0.0 --port $PORT
   ```
4. Set environment variables:
   | Variable | Description |
   |---|---|
   | `GEMINI_API_KEY` | Google Gemini API key |
   | `SERP_API_KEY` | SerpApi key for flights & hotels |
   | `JWT_SECRET` | Secret for JWT signing |
   | `DATABASE_URL` | PostgreSQL connection string |
   | `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL (optional) |
   | `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token (optional) |

### Vercel (Frontend)

1. Import the `frontend/` folder as a Vercel project.
2. Set **Framework Preset** to `Vite`.
3. Set **Root Directory** to `frontend`.
4. Add environment variable:
   | Variable | Description |
   |---|---|
   | `VITE_API_BASE_URL` | Your Railway backend URL |

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
