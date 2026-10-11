import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Sun, 
  CloudRain, 
  MapPin, 
  DollarSign, 
  ExternalLink, 
  ShieldCheck, 
  Download,
  Plane,
  Star,
  MessageSquare,
  Building2,
  Wifi,
  Trash2
} from 'lucide-react';
import type { TripState, ItineraryDay, Activity } from '../types';
import { getTripTheme, getDestinationBackgroundImage, capitalizeWords } from '../utils/themeUtils';
import { parseBackendReply } from '../utils/parser';

interface TripPlanViewProps {
  trip: TripState;
  days: ItineraryDay[];
  onBack: () => void;
  onOpenConciergeChat: () => void;
  onOpenExport: () => void;
  onDeleteTrip: (tripId: string) => void;
  selectedDayIndex?: number;
  onSelectDayIndex?: (idx: number) => void;
  lastUpdatedDayNumber?: number | null;
}

export const TripPlanView: React.FC<TripPlanViewProps> = ({
  trip,
  days,
  onBack,
  onOpenConciergeChat,
  onOpenExport,
  onDeleteTrip,
  selectedDayIndex,
  onSelectDayIndex,
  lastUpdatedDayNumber
}) => {
  const [internalDayIndex, setInternalDayIndex] = useState(0);
  const currentDayIndex = typeof selectedDayIndex === 'number' ? selectedDayIndex : internalDayIndex;
  const setDayIndex = onSelectDayIndex || setInternalDayIndex;
  const [activeTab, setActiveTab] = useState<'itinerary' | 'inventory'>('itinerary');

  const activeDay = days[currentDayIndex] || days[0];

  // Dynamic Theme Palette for this specific trip
  const tripTheme = getTripTheme(trip.destination, trip.country);

  // Parse Live Backend Flight & Hotel Data
  const parsedData = parseBackendReply(trip.description || '', trip.origin, trip.destination);

  const calculateBudgetBreakdown = () => {
    let activityTotal = 0;
    days.forEach(day => {
      day.activities.forEach(act => {
        const numbers = act.estimatedCost.match(/\d[\d,]*/g);
        if (numbers && numbers.length > 0) {
          const parsedNums = numbers.map(n => parseInt(n.replace(/,/g, ''), 10)).filter(n => !isNaN(n));
          if (parsedNums.length === 1) {
            activityTotal += parsedNums[0];
          } else if (parsedNums.length >= 2) {
            const avg = Math.round((parsedNums[0] + parsedNums[1]) / 2);
            activityTotal += avg;
          }
        }
      });
    });

    const daysCount = Math.max(1, days.length);
    const estimatedDailySpend = Math.round(activityTotal / daysCount);
    const nightsCount = days.length > 1 ? days.length - 1 : 1;

    let hotelRatePerNight = 0;
    if (parsedData.hotels && parsedData.hotels.length > 0) {
      let sumRates = 0;
      let count = 0;
      parsedData.hotels.forEach(h => {
        const numbers = h.pricePerNight.match(/\d[\d,]*/g);
        if (numbers && numbers.length > 0) {
          const val = parseInt(numbers[0].replace(/,/g, ''), 10);
          if (!isNaN(val) && val > 0) {
            sumRates += val;
            count++;
          }
        }
      });
      if (count > 0) {
        hotelRatePerNight = Math.round(sumRates / count);
      }
    }

    if (hotelRatePerNight === 0) {
      if (trip.budget === 'low') hotelRatePerNight = 1500;
      else if (trip.budget === 'high') hotelRatePerNight = 9500;
      else hotelRatePerNight = 3800;
    }

    const accommodationTotal = hotelRatePerNight * nightsCount;
    const grandTotal = activityTotal + accommodationTotal;

    return {
      activityTotal,
      estimatedDailySpend,
      daysCount,
      nightsCount,
      hotelRatePerNight,
      accommodationTotal,
      grandTotal
    };
  };

  const budgetMetrics = calculateBudgetBreakdown();

  // Neutral Translucent Glass Badges
  const getCategoryBadgeClass = (category: Activity['category']) => {
    switch (category) {
      case 'Dining':
        return tripTheme.tagColor;
      case 'Culture':
        return 'bg-white/10 text-slate-200 border-white/20';
      case 'Transit':
        return 'bg-white/5 text-slate-300 border-white/10';
      case 'Outdoor':
        return 'bg-white/10 text-slate-200 border-white/20';
      default:
        return tripTheme.tagColor;
    }
  };

  return (
    <div className="relative min-h-screen w-screen bg-[#080B11] text-white font-sans overflow-x-hidden flex flex-col justify-between selection:bg-white/20">
      
      {/* 1. Full-Screen Landscape Background with Dynamic Glow Overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none transition-all duration-700">
        <img
          src={trip.bgImage || getDestinationBackgroundImage(trip.destination)}
          alt={trip.destination}
          className="w-full h-full object-cover object-center filter brightness-[0.50] contrast-[1.05]"
          onError={(e) => {
            e.currentTarget.src = getDestinationBackgroundImage(trip.destination);
          }}
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${tripTheme.glowBg} transition-all duration-700`} />
      </div>

      {/* 2. Top Header Ribbon */}
      <header className="relative z-20 px-8 py-6 flex items-center justify-between">
        
        {/* Back Button */}
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white text-xs font-semibold transition-all duration-300 flex items-center space-x-2 shadow-lg border border-white/15 active:scale-95 hover:scale-105"
        >
          <ArrowLeft className={`w-4 h-4 ${tripTheme.iconColor}`} />
          <span>Back to Journeys</span>
        </button>

        {/* Minimalist Center Title */}
        <div className="text-center">
          <span className={`text-[10px] font-bold uppercase tracking-widest block ${tripTheme.badgeText}`}>
            {trip.country && trip.country.toLowerCase() !== trip.destination.toLowerCase() ? capitalizeWords(trip.country) : 'India'} • Full Trip Plan
          </span>
          <h1 className="font-bold text-2xl uppercase tracking-tight text-white drop-shadow-md">
            {capitalizeWords(trip.destination)}
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          <div className="bg-white/5 backdrop-blur-xl rounded-full p-1 border border-white/10 flex space-x-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('itinerary')}
              className={`px-4 py-1.5 rounded-full transition-all duration-300 ${
                activeTab === 'itinerary' ? 'bg-white/20 text-white font-bold border border-white/20 shadow-md backdrop-blur-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-4 py-1.5 rounded-full transition-all duration-300 ${
                activeTab === 'inventory' ? 'bg-white/20 text-white font-bold border border-white/20 shadow-md backdrop-blur-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              Flights & Stays
            </button>
          </div>

          <button
            onClick={onOpenExport}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white transition-all duration-300 border border-white/15 active:scale-95 hover:scale-105"
            title="Export iCal / PDF"
          >
            <Download className={`w-4 h-4 ${tripTheme.iconColor}`} />
          </button>

          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete the itinerary for ${trip.destination}?`)) {
                onDeleteTrip(trip.id);
              }
            }}
            className="p-2.5 rounded-full bg-rose-500/10 hover:bg-rose-500/30 text-rose-300 transition-all duration-300 border border-rose-500/20 active:scale-95 hover:scale-105"
            title="Delete Itinerary"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
          </button>
        </div>

      </header>

      {/* 3. Main Glass Workspace Container */}
      <main className="relative z-10 px-6 sm:px-10 py-6 flex-1 flex flex-col max-w-7xl mx-auto w-full space-y-6 animate-slide-up">
        
        {activeTab === 'itinerary' && (
          <div className="space-y-6">
            
            {/* Days Ribbon Container - Isolated Glass Bar */}
            <div className="p-3 rounded-3xl bg-white/5 border border-white/15 backdrop-blur-xl shadow-xl">
              <div className="flex items-center space-x-3 overflow-x-auto pb-1 pt-1 px-1 no-scrollbar">
                {days.map((day, idx) => {
                  const isSelected = currentDayIndex === idx;
                  const isRecentlyUpdated = lastUpdatedDayNumber === day.dayNumber;
                  return (
                    <button
                      key={day.dayNumber}
                      onClick={() => setDayIndex(idx)}
                      className={`px-5 py-3 rounded-2xl min-w-[145px] flex flex-col justify-between border transition-all duration-300 text-left relative overflow-hidden ${
                        isSelected
                          ? `${tripTheme.buttonAccent} shadow-lg scale-[1.02]`
                          : 'bg-white/5 border-white/10 text-white hover:bg-white/15 hover:border-white/25 backdrop-blur-md opacity-90'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-1.5">
                          <span className={`font-bold text-xs ${isSelected ? 'text-slate-950' : 'text-white'}`}>
                            Day {day.dayNumber}
                          </span>
                          {isRecentlyUpdated && (
                            <span className="text-[8px] bg-emerald-500/30 text-emerald-300 border border-emerald-400/50 px-1.5 py-0.2 rounded-full font-bold uppercase animate-pulse">
                              Updated
                            </span>
                          )}
                        </div>
                        <span className="text-sm">{day.weather.icon}</span>
                      </div>
                      <div className={`text-[10px] font-medium ${isSelected ? 'text-slate-900/80' : 'text-slate-300'}`}>
                        {day.date}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Split Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Timeline Activities Panel (Cols 1-8) */}
              <div className="lg:col-span-8 space-y-4">
                
                {/* Weather Alignment Banner */}
                <div className="p-4 rounded-3xl glass-panel-dark border border-white/10 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-[#D4B886] font-mono font-bold text-xs">
                      D{activeDay?.dayNumber || 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">
                        Day {activeDay?.dayNumber} Agenda — {activeDay?.date}
                      </h3>
                      <span className="text-[11px] text-slate-300">
                        {activeDay?.activities.length || 0} Scheduled Activities
                      </span>
                    </div>
                  </div>

                  <div className="px-3.5 py-1.5 rounded-xl border border-white/15 bg-white/10 text-xs font-semibold flex items-center space-x-2 text-slate-200">
                    {activeDay?.weather.isRainy ? <CloudRain className="w-4 h-4 text-[#D4B886]" /> : <Sun className="w-4 h-4 text-[#D4B886]" />}
                    <span>{activeDay?.weather.isRainy ? '☔ Weather-Safe Indoor Plan' : '☀️ Clear Outdoor Plan'}</span>
                  </div>
                </div>

                {/* Activities List */}
                <div className="space-y-3">
                  {activeDay?.activities.map((act) => (
                    <div
                      key={act.id}
                      className="p-5 rounded-3xl glass-card-neutral border border-white/10 hover:border-white/30 transition-all duration-300 group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 rounded-2xl bg-[#D4B886]/15 border border-[#D4B886]/30 flex items-center justify-center text-[#D4B886] shrink-0 font-bold text-xs shadow-md">
                            <MapPin className="w-5 h-5 text-[#D4B886]" />
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center space-x-2">
                              <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-semibold ${getCategoryBadgeClass(act.category)}`}>
                                {act.category}
                              </span>
                              {act.isIndoor && (
                                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">
                                  🛡️ Weather Safe Indoor Spot
                                </span>
                              )}
                            </div>

                            <h4 className="font-bold text-lg text-white group-hover:text-[#D4B886] transition-colors duration-300 leading-snug">
                              {act.title}
                            </h4>

                            <p className="text-xs text-slate-300 leading-relaxed pt-0.5">
                              {act.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 font-medium pt-2">
                              <span className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10">
                                <MapPin className="w-3.5 h-3.5 text-[#D4B886]" />
                                <span className="text-white font-medium">{act.location}</span>
                              </span>

                              <span className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-[#D4B886]/15 border border-[#D4B886]/30 text-[#D4B886] font-mono font-bold">
                                <DollarSign className="w-3.5 h-3.5 text-[#D4B886]" />
                                <span>Budget: {act.estimatedCost}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(act.title + ' ' + act.location)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/20 text-slate-300 hover:text-white transition-colors duration-300 shrink-0 border border-white/10"
                          title="Explore Place on Google Maps"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

              </div>

              {/* Right Panel: Budget Gauge & Trip Overview (Cols 9-12) */}
              <div className="lg:col-span-4 space-y-4">
                
                {/* Budget Calculator Card */}
                <div className="p-6 rounded-3xl glass-panel-dark border border-white/10 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-300">Estimated Budget Tracker</span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/10 text-[#D4B886] font-semibold uppercase border border-white/20">
                      {trip.budget} Tier
                    </span>
                  </div>

                  <div className="space-y-3">
                    {/* Est. Daily Budget */}
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-medium">Est. Daily Budget (Food & Activities)</span>
                      <span className="text-[#D4B886] font-mono font-bold text-sm">
                        ₹{budgetMetrics.estimatedDailySpend.toLocaleString('en-IN')}/day
                      </span>
                    </div>

                    {/* Breakdown Subtotals */}
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Activities & Dining ({budgetMetrics.daysCount} Days)</span>
                        <span className="text-white font-mono font-semibold">
                          ₹{budgetMetrics.activityTotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Accommodation ({budgetMetrics.nightsCount} Nights @ ₹{budgetMetrics.hotelRatePerNight.toLocaleString('en-IN')})</span>
                        <span className="text-white font-mono font-semibold">
                          ₹{budgetMetrics.accommodationTotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Total Budget */}
                    <div className="flex justify-between items-center text-xs pt-1">
                      <span className="text-slate-200 font-bold uppercase tracking-wider">Total Estimated Budget</span>
                      <span className="text-white font-mono font-extrabold text-base text-[#D4B886]">
                        ₹{budgetMetrics.grandTotal.toLocaleString('en-IN')} INR
                      </span>
                    </div>

                    {/* Budget progress bar */}
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-white/40 to-[#D4B886] transition-all duration-500"
                        style={{ width: `${Math.min(100, (budgetMetrics.grandTotal / (trip.budget === 'high' ? 75000 : trip.budget === 'medium' ? 35000 : 15000)) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-[11px] text-slate-300 space-y-1">
                    <div className="flex items-center space-x-1.5 font-semibold text-white">
                      <ShieldCheck className="w-4 h-4 text-[#D4B886]" />
                      <span>Budget Breakdown Guide</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Food, dining & activity entry costs are included in the daily estimated budget. Accommodation is calculated per night based on selected hotels.
                    </p>
                  </div>
                </div>

                {/* Trip Summary Card */}
                <div className="p-6 rounded-3xl glass-panel-dark border border-white/10 space-y-3 text-xs">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300">
                    Journey Details
                  </h4>
                  <div className="space-y-2 text-slate-300">
                    <div className="flex justify-between py-1 border-b border-white/10">
                      <span className="text-slate-400">Origin</span>
                      <span className="font-bold text-white">{trip.origin}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/10">
                      <span className="text-slate-400">Destination</span>
                      <span className="font-bold text-white">{trip.destination}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/10">
                      <span className="text-slate-400">Travelers</span>
                      <span className="font-bold text-white">{trip.guest_count} Person(s)</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Session ID</span>
                      <span className="font-mono text-[10px] text-[#D4B886]">{trip.session_id}</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-8 animate-fade-in">
            
            {/* 1. FLIGHT RECOMMENDATIONS SECTION */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center space-x-2">
                  <Plane className="w-5 h-5 text-[#D4B886]" />
                  <h2 className="font-bold text-lg text-white">
                    Flight Recommendations ({trip.origin} ➔ {trip.destination})
                  </h2>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-slate-300 border border-white/15">
                  SerpApi Google Flights
                </span>
              </div>

              {parsedData.flights.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {parsedData.flights.map((flight) => (
                    <div 
                      key={flight.id} 
                      className="p-5 rounded-3xl glass-panel-dark border border-white/10 hover:border-white/25 transition-all duration-300 space-y-4 shadow-lg group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-white group-hover:text-[#D4B886] transition-colors duration-300">
                          {flight.airline}
                        </span>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/10 text-[#D4B886] font-bold border border-white/20">
                          {flight.stops}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs py-3 border-y border-white/10">
                        <div>
                          <span className="font-bold block text-sm text-white">{flight.departureTime}</span>
                          <span className="text-slate-400 text-[10px] block truncate max-w-[100px]">
                            {flight.departureAirport || trip.origin}
                          </span>
                        </div>

                        <div className="text-center px-2">
                          <span className="text-[10px] text-slate-400 block">{flight.duration}</span>
                          <Plane className="w-4 h-4 text-[#D4B886] mx-auto my-1 transform rotate-90" />
                        </div>

                        <div className="text-right">
                          <span className="font-bold block text-sm text-white">{flight.arrivalTime}</span>
                          <span className="text-slate-400 text-[10px] block truncate max-w-[100px]">
                            {flight.arrivalAirport || trip.destination}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-1">
                        <span className="font-mono font-bold text-base text-[#D4B886]">{flight.price}</span>
                        <a
                          href={`https://www.google.com/travel/flights?q=flights+from+${encodeURIComponent(trip.origin)}+to+${encodeURIComponent(trip.destination)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold transition-all duration-300 flex items-center space-x-1"
                        >
                          <span>Book Flight</span>
                          <ExternalLink className="w-3 h-3 text-[#D4B886]" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-3xl glass-panel-dark border border-white/10 text-center space-y-2">
                  <Plane className="w-8 h-8 text-slate-400 mx-auto opacity-50" />
                  <p className="text-xs text-slate-300">
                    No explicit flight search keywords were detected in the prompt, or direct flight options are pending.
                  </p>
                  <span className="text-[11px] text-[#D4B886] block font-mono">
                    Ask Concierge AI: "Show me flights from {trip.origin} to {trip.destination}" to query SerpApi.
                  </span>
                </div>
              )}
            </div>

            {/* 2. HOTEL RECOMMENDATIONS SECTION */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-[#D4B886]" />
                  <h2 className="font-bold text-lg text-white">
                    Hotel & Stay Recommendations ({trip.destination})
                  </h2>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-slate-300 border border-white/15">
                  SerpApi Google Hotels
                </span>
              </div>

              {parsedData.hotels.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {parsedData.hotels.map((hotel) => (
                    <div 
                      key={hotel.id} 
                      className="p-5 rounded-3xl glass-panel-dark border border-white/10 hover:border-white/25 transition-all duration-300 space-y-3 shadow-lg flex flex-col justify-between group"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-base text-white group-hover:text-[#D4B886] transition-colors duration-300 leading-snug">
                            {hotel.name}
                          </h3>
                          <div className="flex items-center space-x-1 text-[#D4B886] font-bold text-xs bg-white/10 px-2 py-0.5 rounded-lg border border-white/15 shrink-0">
                            <Star className="w-3.5 h-3.5 fill-[#D4B886]" />
                            <span>{hotel.rating || 4.5}</span>
                          </div>
                        </div>

                        <span className="text-[10px] text-slate-300 block font-medium">
                          📍 {hotel.neighborhood}
                        </span>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {hotel.amenities.map((amenity, aIdx) => (
                            <span 
                              key={aIdx} 
                              className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 flex items-center space-x-1"
                            >
                              <Wifi className="w-2.5 h-2.5 text-[#D4B886]" />
                              <span>{amenity}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-white/10">
                        <div>
                          <span className="font-mono font-bold text-base text-[#D4B886] block">{hotel.pricePerNight}</span>
                          <span className="text-[9px] text-slate-400 block uppercase tracking-wider">Per Night</span>
                        </div>

                        <a
                          href={`https://www.google.com/travel/hotels?q=${encodeURIComponent('Hotels in ' + trip.destination + ' ' + hotel.name)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-bold transition-all duration-300 flex items-center space-x-1"
                        >
                          <span>View Hotel</span>
                          <ExternalLink className="w-3 h-3 text-[#D4B886]" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-3xl glass-panel-dark border border-white/10 text-center space-y-2">
                  <Building2 className="w-8 h-8 text-slate-400 mx-auto opacity-50" />
                  <p className="text-xs text-slate-300">
                    Live hotel properties are retrieved directly from SerpApi Google Hotels for {trip.destination}.
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

      </main>

      {/* 4. Floating Concierge Icon */}
      <button
        onClick={onOpenConciergeChat}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-slate-900/85 hover:bg-slate-900 border border-white/20 backdrop-blur-2xl text-white shadow-[0_20px_50px_rgba(0,0,0,0.8)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center space-x-2 group"
        title="Open AI Concierge Chat"
      >
        <MessageSquare className="w-5 h-5 text-[#D4B886] group-hover:scale-110 transition-transform duration-300" />
        <span className="font-bold text-xs pr-1">Concierge AI</span>
      </button>

    </div>
  );
};



