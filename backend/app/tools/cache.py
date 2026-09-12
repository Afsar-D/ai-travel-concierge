import json
import os
from dotenv import load_dotenv
from upstash_redis.asyncio import Redis

load_dotenv()

client = Redis(url=os.getenv("UPSTASH_REDIS_REST_URL"), token=os.getenv("UPSTASH_REDIS_REST_TOKEN"))  # type: ignore


async def get_cached_weather(cache_key):
    return await client.get(cache_key)


async def set_cached_weather(cache_key, data):
    await client.set(key=cache_key, value=data, ex=86400)
