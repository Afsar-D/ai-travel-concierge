# ✈️ AI Travel Concierge - Full Stack Application (Next.js + FastAPI)

An enterprise-grade, full-stack AI Travel Concierge application featuring a responsive **Next.js** frontend and an asynchronous **FastAPI** backend powered by **LangGraph**, **Google Gemini 2.5 Flash**, **SQLModel (PostgreSQL / Supabase)**, and **Upstash Serverless Redis**.

---

## 🌟 Project Overview

The AI Travel Concierge helps users plan personalized, realistic, weather-aligned travel itineraries and provides an interactive concierge chat assistant to answer follow-up trip questions in context.

### Key Capabilities:
* **Real-Time Token Streaming UI**: Stream itineraries and follow-up chat answers token-by-token using ReadableStream SSE (Server-Sent Events) for a ChatGPT-like user experience.
* **Weather-Aligned Itineraries**: Integrates live Open-Meteo weather forecasts to schedule indoor activities on rainy days and outdoor sightseeing on sunny days.
* **Dual Caching Layer**: Caches weather forecasts in **Upstash Redis RAM** for 24 hours with dynamic keys (`weather:origin:destination:start_date:end_date`), reducing retrieval latency to **<2ms**.
* **Cloud Database Persistence**: Stores conversation sessions and turn history in **Supabase PostgreSQL** using `SQLModel` ORM and non-blocking `asyncpg`.
* **Dual Streaming Engine**:
  * **Mode 1 (Initial Itinerary Stream)**: Uses `generate_content_stream` to stream full day-by-day itineraries token-by-token.
  * **Mode 2 (Continuous Concierge Q&A Stream)**: Uses Gemini `chats.create` with `send_message_stream` to answer follow-up questions using past PostgreSQL conversation context.

---

## 🛠️ Tech Stack & Architecture

### 🎨 Frontend (Next.js)
* **Framework**: Next.js (App Router, React 19, TypeScript)
* **Styling**: TailwindCSS & Vanilla CSS for premium, rich dark-mode design
* **Streaming Engine**: Web Streams API (`ReadableStream` & `TextDecoder`) for real-time SSE token rendering

### ⚙️ Backend (FastAPI + LangGraph)
* **API Framework**: FastAPI (Python 3.14 + Uvicorn)
* **AI Agent Engine**: LangGraph & Google GenAI SDK (Gemini 2.5 Flash)
* **Cloud Database**: PostgreSQL (Supabase Cloud) + `SQLModel` ORM (`asyncpg`)
* **In-Memory Cache**: Upstash Serverless Redis (24h TTL auto-eviction)
* **Validation**: Pydantic v2 (`@model_validator` for date range enforcement)

---

## 📂 Project Architecture

```
B/
├── frontend/                  # Next.js User Interface
│   ├── app/                   # App router pages (/chat, /dashboard)
│   ├── components/            # UI components (ChatWindow, ItineraryCard, MessageList)
│   ├── public/                # Static assets & icons
│   ├── package.json           # Frontend dependencies
│   └── tailwind.config.ts     # TailwindCSS design system
│
└── backend/                   # FastAPI Async Backend
    ├── app/
    │   ├── agent/
    │   │   ├── graph.py       # LangGraph state graph & dual streaming generators (Mode 1 & Mode 2)
    │   │   ├── state.py       # AgentState TypedDict memory schema
    │   │   └── tools.py       # Async node wrapper for weather tools
    │   ├── api/
    │   │   ├── chat.py        # POST /api/chat route handler & streaming persistence gateway
    │   │   └── health.py      # Health check endpoint
    │   ├── database/
    │   │   ├── models.py      # SQLModel table schemas (ChatSession & ChatMessages)
    │   │   └── session.py     # Production AsyncEngine & get_session dependency
    │   ├── schema/
    │   │   └── chat.py        # Pydantic DTO models (ChatRequest & ChatResponse)
    │   ├── tools/
    │   │   ├── cache.py       # Upstash Redis async caching helper functions
    │   │   └── weather.py     # Open-Meteo geocoding & forecast tool with Redis integration
    │   └── app.py             # Main FastAPI application entrypoint & CORS middleware
    ├── pyproject.toml         # Backend dependency declarations
    └── README.md              # Project documentation
```

---

## ⚙️ Environment Setup & Installation Instructions

### 1. Prerequisites
* Python 3.10+ (or Python 3.14+)
* Node.js 18+ (for Next.js frontend)

---

### 2. Backend Environment Variables (`backend/.env`)

Create a `.env` file in the `backend/` directory:

```env
GEMINI_API_KEY="your_gemini_api_key"
DATABASE_URL="postgresql+asyncpg://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
UPSTASH_REDIS_REST_URL="https://your_host.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your_upstash_token"
```

---

### 3. Backend Setup & Running

You can install and run the backend using either **`pip`** or **`uv`**:

#### Option A: Using Standard `pip` & Virtual Environment
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Linux/macOS:
source .venv/bin/activate
# On Windows:
# .venv\Scripts\activate

# Install dependencies
pip install fastapi[standard] uvicorn sqlmodel asyncpg redis aiosqlite google-genai langgraph python-dotenv httpx

# Run FastAPI dev server
uvicorn app.app:app --reload
```

#### Option B: Using `uv` (Fast Package Manager)
```bash
# Navigate to backend directory
cd backend

# Install dependencies & sync environment
uv sync

# Run FastAPI dev server
uv run uvicorn app.app:app --reload
```

*Interactive API documentation will be available at `http://127.0.0.1:8000/docs` (Swagger UI).*

---

### 4. Frontend Setup & Running

```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Run Next.js dev server
npm run dev
```

*The Web Application will be live at `http://localhost:3000`.*
