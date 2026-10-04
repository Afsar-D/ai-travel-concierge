# ✈️ AI Travel Concierge - Full Stack Enterprise Application

[![Backend Build](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Frontend Build](https://img.shields.io/badge/Frontend-Vite%20%2B%20React%2019-61DAFB?style=flat&logo=react)](https://react.dev/)
[![Deployment](https://img.shields.io/badge/Deployed%20on-Railway%20%26%20Vercel-000000?style=flat&logo=railway)](https://ai-travel-concierge.up.railway.app/)
[![Pytest Coverage](https://img.shields.io/badge/Backend%20Tests-100%25%20Pass-brightgreen?style=flat&logo=pytest)](https://docs.pytest.org/)
[![Vitest Coverage](https://img.shields.io/badge/Frontend%20Tests-100%25%20Pass-brightgreen?style=flat&logo=vitest)](https://vitest.dev/)

An enterprise-grade, full-stack AI Travel Concierge platform featuring an interactive **React 19 + Vite** frontend and an asynchronous **FastAPI** backend powered by **LangGraph**, **Google Gemini 2.5 Flash**, **SQLModel (PostgreSQL / Supabase)**, and **Upstash Serverless Redis**.

---

## 🌟 Project Overview

The **AI Travel Concierge** empowers travelers to generate weather-aligned, budget-conscious travel itineraries and chat continuously with an intelligent AI concierge assistant for instant recommendations on flights, hotels, weather, and dining.

### 🚀 Key Capabilities:
* **Token Streaming & SSE UI**: Stream complete day-by-day itineraries and follow-up chat answers in real time using Server-Sent Events (SSE) for a fluid, instant response experience.
* **Weather-Aligned Itineraries**: Dynamically fetches live Open-Meteo forecasts to schedule indoor cultural activities on rainy days and outdoor sightseeing on clear days.
* **Dual Caching Layer**: Caches weather queries in **Upstash Redis RAM** with 24-hour TTL eviction, reducing API retrieval latencies to **<2ms**.
* **Cloud Persistence & User Authentication**: Full user authentication (JWT Bearer Tokens + `passlib[bcrypt]` password hashing) and conversation session storage in **Supabase PostgreSQL** via `SQLModel` ORM (`asyncpg`).
* **Accurate Budget Tracking**: Built-in pricing engine computing **Daily Activity Budget**, **Accommodation Nightly Rates $\times$ Nights**, and **Total Estimated Budget** tailored across Economy, Medium, and Luxury budget tiers.
* **Dynamic Destination Imagery**: Features 35+ curated global destination cover photos with dynamic string-hashing fallbacks so every itinerary gets a unique cover photo.

---

## 🛠️ Tech Stack & Architecture

### 🎨 Frontend
* **Framework**: React 19, TypeScript, Vite
* **Styling**: TailwindCSS, Lucide Icons, Framer Motion
* **Testing**: Vitest + React Testing Library (`vitest run` with 100% pass rate)

### ⚙️ Backend
* **Framework**: FastAPI (Python 3.11+ / 3.14 + Uvicorn)
* **AI Agent Engine**: LangGraph & Google GenAI SDK (`gemini-2.5-flash`)
* **Cloud Database**: PostgreSQL (Supabase Cloud / Railway Postgres) + `SQLModel` ORM (`asyncpg`)
* **In-Memory Cache**: Upstash Serverless Redis
* **Security & Auth**: JWT Tokens (`python-jose`), `bcrypt` password hashing
* **Testing**: Pytest + HTTPX AsyncClient (`pytest` with 100% pass rate)

---

## 📂 Project Architecture

```text
B/
├── Procfile                     # Railway root deployment process configuration
├── backend/                     # FastAPI Async Backend
│   ├── Procfile                 # Railway subdirectory Procfile
│   ├── requirements.txt         # Production dependencies
│   ├── pyproject.toml           # Python environment specification
│   └── app/
│       ├── agent/
│       │   ├── graph.py         # LangGraph state graph & Gemini agent workflows
│       │   ├── state.py         # AgentState TypedDict schema
│       │   └── tools.py         # Async tool wrappers for weather & search
│       ├── api/
│       │   ├── auth.py          # User registration & JWT login routes
│       │   ├── chat.py          # POST /api/chat streaming route & session persistence
│       │   └── health.py        # Health check endpoint (/api/health)
│       ├── config/
│       │   └── security.py      # Password hashing & JWT token handling
│       ├── database/
│       │   ├── models.py        # User, ChatSession, ChatMessages SQLModel schemas
│       │   └── session.py       # AsyncEngine session factory (PostgreSQL / SQLite)
│       └── tools/
│           ├── cache.py         # Upstash Redis async caching helpers
│           └── weather.py       # Open-Meteo geocoding & weather forecast tool
│
├── frontend/                    # React 19 + Vite User Interface
│   ├── src/
│   │   ├── components/          # React Components (TripPlanView, ConciergeChatModal, etc.)
│   │   ├── utils/               # Itinerary parsers, budget matrices & theme utilities
│   │   └── test/                # Vitest React UI test suite
│   ├── package.json             # Frontend dependencies & test scripts
│   └── vite.config.ts           # Vite build configuration
│
└── test/
    └── test_backend_suite.py    # Complete FastAPI Pytest suite
```

---

## ⚙️ Quick Start & Local Setup

### 1. Prerequisites
* **Python 3.11+**
* **Node.js 18+**

---

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env configuration
cat <<EOT > .env
GEMINI_API_KEY="your_google_gemini_api_key"
JWT_SECRET="supersecretjwtkey123456789"
DATABASE_URL="sqlite+aiosqlite:///./database.db"  # Or PostgreSQL connection URL
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""
EOT

# Run FastAPI development server
uvicorn app.app:app --host 0.0.0.0 --port 8000 --reload
```

*Interactive API Swagger Documentation is available at `http://localhost:8000/docs`.*

---

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Run frontend development server
npm run dev
```

*The frontend application will run at `http://localhost:5173`.*

---

## 🧪 Test Suite Execution

Both frontend and backend test suites achieve **100% pass rates**:

### Run Backend Tests (Pytest)
```bash
PYTHONPATH=backend pytest test/test_backend_suite.py
```
*Tests registration, login authentication, duplicate user checks, invalid passwords, JWT expiration, date order validators, and weather endpoints.*

### Run Frontend Tests (Vitest)
```bash
cd frontend
npm run test
```
*Tests React UI login flows, trip setup modals, concierge chat rendering, error fallbacks, and budget breakdown calculations.*

### Run Frontend Production Build
```bash
cd frontend
npm run build
```

---

## ☁️ Deployment Guide

### Railway (Backend Deployment)

1. Connect your repository to **Railway**.
2. Set **Root Directory** in Railway Service Settings to `backend` (or leave as root `/`).
3. Set **Start Command** to:
   ```bash
   uvicorn app.app:app --host 0.0.0.0 --port $PORT
   ```
4. Set Railway Environment Variables:
   - `GEMINI_API_KEY`: Your Gemini API key
   - `JWT_SECRET`: Secret JWT key
   - `DATABASE_URL`: PostgreSQL connection URL (or defaults to SQLite)
5. Set **Target Port** to `8080` (or dynamic `$PORT`).

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
