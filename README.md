# WayFinder — AI Travel Agent

A small React + FastAPI + PostgreSQL travel-planning prototype with a polished UI.

## Stack

- React + Vite
- React Router
- Lucide React
- Sonner
- FastAPI
- SQLAlchemy
- PostgreSQL

## Project layout

```text
Ai_Travel_Agent/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── lib/api.js
│   │   ├── pages/
│   │   ├── assets/
│   │   └── App.jsx
│   └── vite.config.js
├── backend/
│   ├── app/
│   │   ├── api/v1/
│   │   ├── core/
│   │   ├── db/
│   │   └── models/
│   ├── requirements.txt
│   └── run.py
└── README.md
```

## Run the backend

1. Create a PostgreSQL database.
2. Copy `backend/.env.example` to `backend/.env`.
3. Update `SQLALCHEMY_DATABASE_URL` with your PostgreSQL credentials.
4. Create and activate a virtual environment.
5. Install dependencies:

```bash
pip install -r requirements.txt
```

6. Start FastAPI:

```bash
python run.py
```

The API runs on `http://127.0.0.1:8000`.

## Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Vite proxies `/api` requests to FastAPI, so the React code can use relative API paths.

## API

- `GET /api/v1/travel/` — returns itineraries, newest first.
- `POST /api/v1/travel/itinerary` — creates an itinerary with `destination` and `days`.

## What was simplified

- Centralized frontend API calls in `src/lib/api.js`.
- Removed duplicated API response wrappers and fixed the frontend/backend contract.
- Added typed FastAPI response models and input validation.
- Removed generated Python/Node/Git artifacts from the project package.
- Removed excessive AI-style comments.
- Removed unused imports and unnecessary React state for static data.
- Added a Vite API proxy for local development.
- Added reusable CSS helpers for common workspace layouts.

This project intentionally stays small. It does not introduce Redux, a large component library, or unnecessary abstraction for a simple prototype.
