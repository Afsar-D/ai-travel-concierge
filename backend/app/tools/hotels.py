import serpapi
import os
from dotenv import load_dotenv

load_dotenv()

client = serpapi.Client(api_key = os.getenv("SERP_API_KEY"))
