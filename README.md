# ✈️ LAUGH TALE — Full Stack AI Travel Concierge

[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Frontend](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-38BDF8?style=flat&logo=react)](https://react.dev/)
[![Deployment](https://img.shields.io/badge/Deployed%20on-OCI%20%7C%20Railway%20%7C%20Vercel-06B6D4?style=flat&logo=oracle)](https://laughtale.vercel.app/)
[![Backend Tests](https://img.shields.io/badge/Backend%20Tests-Pytest%20100%25-brightgreen?style=flat&logo=pytest)](https://docs.pytest.org/)
[![Frontend Tests](https://img.shields.io/badge/Frontend%20Tests-Vitest%2014%2F14-brightgreen?style=flat&logo=vitest)](https://vitest.dev/)

An enterprise-grade, full-stack AI Travel Concierge platform. **LAUGH TALE** empowers travelers to generate weather-aware, budget-conscious day-by-day itineraries and interact continuously with an intelligent concierge for real-time flight options, hotel accommodations, live weather forecasts, and dynamic itinerary adjustments.

---

## 🌟 Feature Highlights

- **AI-Generated Itineraries**: Powered by **Google Gemini 2.5 Flash** via the LangGraph state machine, generating structured, day-by-day plans tailored to Economy, Standard, or Luxury budget tiers.
- **Editorial Travel Journal Aesthetic**: Inspired by tactile field journals and premium editorial travel publications. Built on an organic Warm Linen background palette (`#FAF9F6`, `#FDFCF9`, `#F4F1EA`) with deep Charcoal typography (`#151516`), earthy Terracotta (`#9A5B43`) and Olive (`#4A5442`) tones, paired with Electric Sky Blue (`#38BDF8`) & Cyan (`#06B6D4`) interactive highlights, frosted-glass surfaces, and smooth Lottie micro-animations.
- **Live Flight Search**: SerpApi Google Flights integration (`flights.py`) retrieves real-time routes, schedules, and carrier fares between origin and destination airports with IATA code resolution via a local `airplanes.json` dataset.
- **Live Hotel Discovery**: SerpApi Google Hotels integration (`hotels.py`) pulls current availability, neighborhood ratings, amenities, and per-night pricing — persisted to the `hotel_booking` table in PostgreSQL.
- **Weather-Aligned Scheduling**: Open-Meteo live forecasts automatically prioritize indoor cultural activities on rainy days and outdoor sightseeing on clear days.
- **Distributed Caching Layer**: Upstash Serverless Redis caches weather reports with a 24-hour TTL, slashing repeat lookup latencies to **< 2 ms**.
- **AI Concierge Chat**: Persistent multi-turn chat with intelligent query routing — Concierge automatically redirects flight and hotel queries to the **Flights & Stays** tab without corrupting the day-by-day timeline.
- **User Authentication**: Secure JWT Bearer authentication (`python-jose`) with salted `bcrypt` password hashing, handling session-segregated trip storage.
- **Cloud Persistence**: All user profiles, chat sessions, message histories, flights, and hotel bookings are persisted to **Supabase PostgreSQL** via `SQLModel` ORM with non-blocking `asyncpg` drivers.

---

## 🛠️ Tech Stack

### 🎨 Frontend (React 19 + Vite)
| Layer | Technology |
|---|---|
| **Framework** | React 19, TypeScript, Vite 8 |
| **Design System** | Editorial Travel Journal & Tactile Paper aesthetic (`paper-panel`, `paper-inset`) |
| **Typography** | Editorial Serif (`Newsreader`), Plus Jakarta Sans, JetBrains Mono |
| **Surface Palette** | Warm Linen (`#FAF9F6`, `#FDFCF9`, `#F4F1EA`), Deep Charcoal (`#151516`) |
| **Accents & Theme** | Terracotta (`#9A5B43`), Olive (`#4A5442`), Electric Sky Blue (`#38BDF8`), Cyan (`#06B6D4`) |
| **Styling Engine** | TailwindCSS 4, Lucide Icons, Framer Motion |
| **Animations** | `lottie-web` (Vector JSON loading & minimal error screens) |
| **Confetti** | `canvas-confetti` (new trip creation celebration) |
| **Testing** | Vitest 4 + React Testing Library (14/14 pass) |
| **Linting** | Oxlint (High-speed Rust-based linter) |

### ⚙️ Backend (FastAPI + LangGraph)
| Layer | Technology |
|---|---|
| **Framework** | FastAPI (Python 3.11+ / 3.14 compatible), Uvicorn ASGI |
| **AI Engine** | LangGraph StateGraph + Google Gemini 2.5 Flash (`google-genai`) |
| **Flight Intelligence** | SerpApi Google Flights engine |
| **Hotel Intelligence** | SerpApi Google Hotels engine |
| **Weather Intelligence**| Open-Meteo Geocoding & Forecast API (`httpx` async client) |
| **Database** | PostgreSQL / Supabase Cloud via `SQLModel` (SQLAlchemy 2.0 async) + `asyncpg` |
| **Caching** | Upstash Serverless Redis (`upstash-redis`) |
| **Auth & Security** | JWT Bearer (`python-jose`, HS256), salted password hashing (`bcrypt`) |
| **Testing** | Pytest + HTTPX AsyncClient |

---

## 📂 Project Structure

```text
.
├── README.md                         # Project overview and runbook
├── Procfile                          # Platform deployment process definition
├── .gitignore                        # Git exclusion rules (ignores test/, .venv/, .env, etc.)
│
├── backend/
│   ├── Procfile                      # Backend deployment Procfile
│   ├── requirements.txt              # Production Python dependencies
│   ├── pyproject.toml                # Build configuration
│   ├── example.env                   # Template environment configuration
│   └── app/
│       ├── app.py                    # FastAPI entrypoint, CORS setup, and lifespan handlers
│       ├── agent/
│       │   ├── graph.py              # LangGraph StateGraph (Weather → Hotels → Flights Router → Gemini)
│       │   ├── state.py              # AgentState TypedDict schema
│       │   └── tools.py              # Asynchronous node execution wrappers
│       ├── api/
│       │   ├── auth.py               # POST /api/auth/register & POST /api/auth/login
│       │   ├── chat.py               # POST /api/chat, GET /api/sessions, DELETE /api/sessions/{id}
│       │   └── health.py             # GET /api/health
│       ├── config/
│       │   └── security.py           # JWT token creation/verification & bcrypt hashing
│       ├── database/
│       │   ├── models.py             # User, ChatSession, ChatMessages, FlightBooking, HotelBooking
│       │   └── session.py            # AsyncEngine connection factory (Supabase PG / SQLite fallback)
│       ├── schema/
│       │   ├── auth.py               # Pydantic validation models for user authentication
│       │   └── chat.py               # Pydantic models for chat requests and responses
│       └── tools/
│           ├── weather.py            # Open-Meteo geocoding & 7-day forecast with Redis cache
│           ├── flights.py            # SerpApi Google Flights + IATA code lookup (airplanes.json)
│           ├── hotels.py             # SerpApi Google Hotels + DB persistence
│           ├── cache.py              # Upstash Redis async helpers
│           └── airplanes.json        # IATA airport and city mapping dataset
│
└── frontend/
    ├── public/
    │   ├── loading.json              # Lottie loading animation
    │   ├── error.json                # Lottie error animation
    │   ├── favicon.svg
    │   ├── compass.svg
    │   ├── travel.svg
    │   ├── man.svg
    │   ├── woman.svg
    │   └── icons.svg
    └── src/
        ├── App.tsx                   # Main layout, router, and session lifecycle
        ├── components/
        │   ├── LoadingScreen.tsx      # Lottie-driven initial splash loader
        │   ├── LoginPage.tsx          # Authenticated JWT registration and login form
        │   ├── LandingPage.tsx        # Hero landing screen
        │   ├── TripDashboard.tsx      # Panoramic trip browser and card decks
        │   ├── TripPlanView.tsx       # Timeline agenda + Flights & Stays tab
        │   ├── ConciergeChatModal.tsx # Multi-turn AI chat with smart query routing
        │   ├── CreateTripModal.tsx    # Interactive trip creation wizard
        │   ├── ExportModal.tsx        # iCal and PDF trip exporter
        │   ├── MarkdownView.tsx       # AI Markdown content renderer
        │   ├── InventoryDeck.tsx      # Flight & hotel inventory card deck
        │   ├── ChatWorkspace.tsx      # Chat container workspace
        │   ├── Sidebar.tsx            # Navigation sidebar
        │   ├── TripContextBar.tsx     # Active trip summary status bar
        │   ├── ItineraryCanvas.tsx    # Day activity timeline canvas
        │   ├── TelemetryDrawer.tsx    # LangGraph agent telemetry drawer
        │   ├── AuthErrorPage.tsx      # 401 unauthenticated fallback page
        │   └── NotFound404Page.tsx    # 404 error page with Lottie animation
        ├── services/
        │   └── api.ts                # Axios/Fetch API client for backend endpoints
        ├── types/
        │   └── index.ts              # TripState, ChatMessage, FlightOption, HotelOption, ItineraryDay
        └── utils/
            ├── parser.ts             # Regex/NLP flight and hotel inventory parser
            ├── itineraryParser.ts    # Markdown to structured ItineraryDay[] parser
            └── themeUtils.ts         # Destination theme palettes and photo mapping
```

> 💡 **Note**: Test directories (e.g. `test/`), local virtual environments (`.venv/`), and `.env` credentials are excluded via `.gitignore` to maintain a clean production repository footprint.

---

## ⚙️ Quick Start

### Prerequisites
- **Python 3.11+**
- **Node.js 18+**
- A **GEMINI_API_KEY** from [Google AI Studio](https://aistudio.google.com/)
- A **SERP_API_KEY** from [SerpApi](https://serpapi.com/) for live flight & hotel data
- *(Optional)* A **DATABASE_URL** from [Supabase](https://supabase.com/) (defaults to local SQLite if omitted)
- *(Optional)* An **UPSTASH_REDIS_REST_URL** & token from [Upstash](https://upstash.com/) for weather caching

---

### 1. Backend Setup

```bash
cd backend

# Create and activate Python virtual environment
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cat > .env <<EOT
GEMINI_API_KEY="your_google_gemini_api_key"
SERP_API_KEY="your_serpapi_key"
JWT_SECRET_KEY="supersecretjwtkey123456789"
DATABASE_URL="sqlite+aiosqlite:///./database.db"   # Or PostgreSQL/Supabase URL
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""
EOT

# Start the development server
uvicorn app.app:app --host 0.0.0.0 --port 8000 --reload
```

> 📖 Interactive OpenAPI / Swagger documentation is available at **http://localhost:8000/docs**

---

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

> 🌐 Frontend runs at **http://localhost:5173**

---

## 🧪 Running Tests

Both suites are verified with **100% pass rates**.

### Frontend — Vitest (14 tests)
```bash
cd frontend
npm run test
```
*Validates: Login & registration flows, trip creation wizard, concierge chat, flight routing to Flights & Stays tab, direct flight rendering in TripPlanView, error page fallbacks, and budget calculations.*

### Backend — Pytest
```bash
PYTHONPATH=backend pytest test/test_backend_suite.py -v
```
*(Note: The `test/` folder is excluded by `.gitignore` to maintain clean tracking; execute this command locally when the test suite is present).*  
*Validates: User registration, JWT login issuance, duplicate user rejections, invalid password rejection, token expiration checks, date range validation, and weather endpoints.*

### Frontend — Production Build & Linting
```bash
cd frontend
npm run lint
npm run build
```

---

## 🧠 How the AI Agent Works

The backend utilizes **LangGraph** to execute a deterministic, multi-tool state machine:

```
                  ┌────────────────────────┐
                  │      User Request      │
                  └───────────┬────────────┘
                              │
                              ▼
                  ┌────────────────────────┐
                  │      weather_node      │  ← Open-Meteo geocoding & forecast
                  └───────────┬────────────┘    (checks Upstash Redis cache first)
                              │
                              ▼
                  ┌────────────────────────┐
                  │       hotel_node       │  ← SerpApi Google Hotels
                  └───────────┬────────────┘    (persisted to hotel_booking table)
                              │
                              ▼
                  ┌────────────────────────┐
                  │ fetch_flights_decision │  ← Conditional Intent Router
                  └─────┬────────────┬─────┘
           Flights      │            │   Standard Query
          Requested     ▼            │
         ┌───────────────────┐       │
         │    flight_node    │       │
         └─────────┬─────────┘       │
                   │                 │
                   └────────┬────────┘
                            │
                            ▼
                  ┌────────────────────────┐
                  │        llm_node        │  ← Google Gemini 2.5 Flash
                  └───────────┬────────────┘    (synthesizes context + instructions)
                              │
                              ▼
                  ┌────────────────────────┐
                  │ Structured Itinerary   │  ← Saved to PostgreSQL and returned
                  └────────────────────────┘
```

The frontend **ConciergeChatModal** uses intelligent intent detection:
* **Flight / Hotel queries** $\rightarrow$ Parsed via `parser.ts`, stored in `trip.flights` / `trip.hotels`, routed directly to the **Flights & Stays** tab without cluttering the day-by-day timeline.
* **Itinerary modifications** $\rightarrow$ Parsed via `itineraryParser.ts` and integrated into the active day-by-day plan.
* **General queries** $\rightarrow$ Displayed as standard conversational responses.

---

## ☁️ Deployment

### 1. Oracle Cloud Infrastructure (OCI Compute VM)

1. Provision an OCI Compute Instance:
   * **Shape**: `VM.Standard.E4.Flex` (2 OCPUs, 16 GB RAM) or `VM.Standard.A1.Flex` (4 OCPUs, 24 GB RAM).
   * **OS**: Ubuntu 24.04 LTS / Oracle Linux 9.
2. Configure VCN Security Lists / Network Security Groups:
   * Allow Ingress on Port `80` (HTTP) and `443` (HTTPS) from `0.0.0.0/0`.
   * Allow Ingress on Port `8000` from the internal Load Balancer / Nginx reverse proxy.
3. Set up the backend systemd service on the instance:
   ```ini
   [Unit]
   Description=Laugh Tale FastAPI Daemon
   After=network.target

   [Service]
   User=ubuntu
   WorkingDirectory=/opt/laughtale/backend
   ExecStart=/opt/laughtale/backend/.venv/bin/uvicorn app.app:app --host 0.0.0.0 --port 8000 --workers 4
   Restart=always
   RestartSec=5
   EnvironmentFile=/opt/laughtale/.env

   [Install]
   WantedBy=multi-user.target
   ```
4. Start and enable service:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable --now laughtale.service
   ```

### 2. Vercel (Frontend)

1. Import repository into [Vercel](https://vercel.com/).
2. Set **Framework Preset** to `Vite`.
3. Set **Root Directory** to `frontend`.
4. Configure environment variable:
   | Variable | Description |
   |---|---|
   | `VITE_API_BASE_URL` | Your OCI or Railway backend URL |

### 3. Railway (Alternative Backend Deployment)

1. Connect repository to [Railway](https://railway.app/).
2. Set **Root Directory** to `backend` (or deploy root via `Procfile`).
3. Set **Start Command**:
   ```bash
   uvicorn app.app:app --host 0.0.0.0 --port $PORT
   ```
4. Configure environment variables in Railway dashboard:
   `GEMINI_API_KEY`, `SERP_API_KEY`, `JWT_SECRET_KEY`, `DATABASE_URL`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
