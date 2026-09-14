import type { TripState } from '../types';

const API_BASE_URL = 'http://127.0.0.1:8000';

export interface ChatApiPayload {
  message: string;
  origin: string;
  destination: string;
  start_date: string;
  end_date: string;
  budget: string;
  guest_count: number;
  session_id?: string;
}

export interface ChatApiResponse {
  reply: string;
  session_id?: string;
  status: string;
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const res = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return res.ok;
  } catch (err) {
    return false;
  }
}

export async function sendChatMessage(
  messageText: string,
  trip: TripState
): Promise<{ response: ChatApiResponse; latencyMs: number }> {
  const startTime = performance.now();

  const payload: ChatApiPayload = {
    message: messageText,
    origin: trip.origin,
    destination: trip.destination,
    start_date: trip.start_date,
    end_date: trip.end_date,
    budget: trip.budget,
    guest_count: trip.guest_count,
    session_id: trip.session_id || `sess_${Math.random().toString(36).substring(2, 9)}`,
  };

  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const endTime = performance.now();
  const latencyMs = Math.round(endTime - startTime);

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown network error');
    throw new Error(`Backend request failed (${response.status}): ${errorText}`);
  }

  const data: ChatApiResponse = await response.json();
  return { response: data, latencyMs };
}
