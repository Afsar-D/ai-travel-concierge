const API_BASE = "/api/v1";

async function request(path, options) {
  const response = await fetch(`${API_BASE}${path}`, options);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.detail || "Request failed");
  }

  return data;
}

export function getItineraries() {
  return request("/travel/");
}

export function createItinerary({ destination, days }) {
  return request("/travel/itinerary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ destination, days }),
  });
}

export function sendChatMessage(payload) {
  return fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then(async (res) => {
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.detail || "Chat request failed");
    return data;
  });
}

