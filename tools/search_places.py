from dotenv import load_dotenv
import os
from tavily import TavilyClient

load_dotenv()

api = os.getenv("TAVILY_API_KEY")
client = TavilyClient(api_key=api)
def tavily_search(query:str)->str:
    """Searches the live web for real-time travel information, attractions, restaurant spots, and ticket prices.
        Use this tool ONLY when you need up-to-date live web details such as specific restaurant 
        recommendations, museum entry fees, local event schedules, or live travel tips.
        Args:
            query (str): Specific search query (e.g., 'best budget restaurants in Tokyo', 'Louvre museum ticket price 2026').
        Returns:
            str: Summarized web search results with page titles, content snippets, and source URLs."""
    response = client.search(
        query=query,
        max_results=3,
        search_depth='basic'
    )
    data = ""
    for result in response['results']:
        data += f"Title : {result['title']}\nUrl : {result['url']}\nContent : {result['content']}\n"
    return data