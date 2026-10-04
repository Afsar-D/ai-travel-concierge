import type { TripState, UserProfile } from '../types';

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id?: number;
    name: string;
    email: string;
  };
}

export async function loginUser(email: string, password: string): Promise<UserProfile> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Login failed' }));
    throw new Error(errorData.detail || 'Invalid email or password');
  }

  const data: AuthResponse = await response.json();
  localStorage.setItem('odyssey_token', data.access_token);
  localStorage.setItem('odyssey_user', JSON.stringify(data.user));
  return { name: data.user.name, email: data.user.email };
}

export async function registerUser(name: string, email: string, password: string): Promise<UserProfile> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Registration failed' }));
    throw new Error(errorData.detail || 'Registration failed');
  }

  const data: AuthResponse = await response.json();
  localStorage.setItem('odyssey_token', data.access_token);
  localStorage.setItem('odyssey_user', JSON.stringify(data.user));
  return { name: data.user.name, email: data.user.email };
}

export interface ChatApiPayload {
  message: string;
  origin: string;
  destination: string;
  start_date: string;
  end_date: string;
  budget: string;
  guest_count: number;
  session_id?: string;
  currency?: string;
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
    
    const res = await fetch(`/api/health`, {
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
  trip: Partial<TripState>,
  isNewTrip: boolean = false
): Promise<{ response: ChatApiResponse; latencyMs: number }> {
  const startTime = performance.now();

  const isRealUuid = Boolean(
    trip.session_id && 
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trip.session_id)
  );

  const payload: ChatApiPayload = {
    message: messageText,
    origin: trip.origin || 'London',
    destination: trip.destination || 'Paris',
    start_date: (trip.start_date && trip.start_date.length === 10) ? trip.start_date : '2026-10-15',
    end_date: (trip.end_date && trip.end_date.length === 10) ? trip.end_date : '2026-10-22',
    budget: trip.budget || 'medium',
    guest_count: trip.guest_count || 2,
    session_id: (isNewTrip || !isRealUuid) ? undefined : trip.session_id,
    currency: 'INR',
  };

  const token = localStorage.getItem('odyssey_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`/api/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const endTime = performance.now();
  const latencyMs = Math.round(endTime - startTime);

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown network error');
    throw new Error(`Backend request failed (${response.status}): ${errorText}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('text/event-stream')) {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let replyText = '';

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        replyText += decoder.decode(value, { stream: true });
      }
    } else {
      replyText = await response.text();
    }

    return {
      response: {
        reply: replyText,
        session_id: trip.session_id,
        status: 'success',
      },
      latencyMs,
    };
  } else {
    const data: ChatApiResponse = await response.json();
    return { response: data, latencyMs };
  }
}
