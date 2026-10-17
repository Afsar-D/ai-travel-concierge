from fastapi import FastAPI
from app.api import chat, health, auth
from app.tools import weather
from fastapi.middleware.cors import CORSMiddleware
from app.database.session import init_db
from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="AI Travel Concierge",
    summary="Provide Guidance about travelling and your trips",
    lifespan=lifespan,
)
origins = ["http://localhost", "http://127.0.0.1", "http://129.225.84.235"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(health.router)
app.include_router(weather.router)


@app.get("/")
def hello():
    return {"status": "OK"}
