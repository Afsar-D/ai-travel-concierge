from dotenv import load_dotenv
import os
import requests

load_dotenv()
api = os.getenv("RAPID_API_KEY")

url = "https://booking-com15.p.rapidapi.com/api/v1/hotels/getNearbyCities"
param = {"latitude":"65.9667","longitude":"-18.5333","languagecode":"en-us"}
headers = {
	"x-rapidapi-key": "api",
	"x-rapidapi-host": "booking-com15.p.rapidapi.com",
	"Content-Type": "application/json"
}
response = requests.get(url, headers=headers, params=param)
print(response.json())