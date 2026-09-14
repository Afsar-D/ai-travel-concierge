export type BudgetTier = 'low' | 'medium' | 'high';

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
}

export interface TripState {
  id: string;
  origin: string;
  destination: string;
  country: string;
  description: string;
  bgImage: string;
  start_date: string;
  end_date: string;
  budget: BudgetTier;
  guest_count: number;
  session_id: string;
  status: 'active' | 'past';
  isBookmarked?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  status?: 'sending' | 'success' | 'error';
}

export interface Activity {
  id: string;
  time: string;
  title: string;
  description: string;
  category: 'Culture' | 'Dining' | 'Transit' | 'Leisure' | 'Outdoor';
  location: string;
  estimatedCost: string;
  isIndoor: boolean;
}

export interface ItineraryDay {
  dayNumber: number;
  date: string;
  weather: {
    temp: string;
    condition: string;
    icon: string;
    isRainy: boolean;
  };
  activities: Activity[];
}

export interface FlightOption {
  id: string;
  airline: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: string;
  stops: string;
  class: 'Economy' | 'Business' | 'First';
}

export interface HotelOption {
  id: string;
  name: string;
  rating: number;
  pricePerNight: string;
  image: string;
  amenities: string[];
  neighborhood: string;
  badge?: string;
}

export interface TelemetryNode {
  name: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  durationMs?: number;
}

export interface TelemetryState {
  nodes: TelemetryNode[];
  cacheHit: boolean;
  lastTtffMs: number;
  totalLatencyMs: number;
  activeSessionId: string;
  backendStatus: 'connected' | 'connecting' | 'offline';
}
