from fastapi import FastAPI
from app.api import chat, health
from app.tools import weather
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="AI Travel Concierge",
    summary="Provide Guidance about travelling and your trips",
)
app.add_middleware(CORSMiddleware, 
                   allow_origins=["http://localhost:3000"],
                   allow_credentials=False,
                   allow_methods=['*'],
                   allow_headers=['*'])
app.include_router(chat.router)
app.include_router(health.router)
app.include_router(weather.router)


@app.get("/")
def hello():
    return {"status": "OK"}
