from fastapi import FastAPI
from app.api import chat,health

app=FastAPI(
    title='AI Travel Concierge',
    summary='Provide Guidance about travelling and your trips'
)
app.include_router(chat.router)
app.include_router(health.router)
@app.get("/")
def hello():
    return {'status' : "OK"}

