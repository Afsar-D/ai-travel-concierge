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
  Trash2,
  Sparkles
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
  activeTab?: 'itinerary' | 'inventory';
  onTabChange?: (tab: 'itinerary' | 'inventory') => void;
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
  lastUpdatedDayNumber,
  activeTab: controlledActiveTab,
  onTabChange
}) => {
  const [internalDayIndex, setInternalDayIndex] = useState(0);
  const currentDayIndex = typeof selectedDayIndex === 'number' ? selectedDayIndex : internalDayIndex;
  const setDayIndex = onSelectDayIndex || setInternalDayIndex;
  const [internalTab, setInternalTab] = useState<'itinerary' | 'inventory'>('itinerary');
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalTab;
  const setActiveTab = onTabChange || setInternalTab;

  const activeDay = days[currentDayIndex] || days[0];

  // Dynamic Theme Palette for this specific trip
  const tripTheme = getTripTheme(trip.destination, trip.country);

  // Parse Live Backend Flight & Hotel Data or use direct trip properties
  const parsedData = parseBackendReply(trip.description || '', trip.origin, trip.destination);
  const displayFlights = (trip.flights && trip.flights.length > 0) ? trip.flights : parsedData.flights;
  const displayHotels = (trip.hotels && trip.hotels.length > 0) ? trip.hotels : parsedData.hotels;

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
    if (displayHotels && displayHotels.length > 0) {
      let sumRates = 0;
      let count = 0;
      displayHotels.forEach(h => {
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
    <div className="relative min-h-screen w-screen bg-[#F8FAFC] text-slate-900 font-sans overflow-x-hidden flex flex-col justify-between selection:bg-rose-500/20">
      
      {/* 1. Full-Screen Landscape Background with Light Wash */}
      <div className="fixed inset-0 z-0 pointer-events-none transition-all duration-700">
        <img
          src={trip.bgImage || getDestinationBackgroundImage(trip.destination)}
          alt={trip.destination}
          className="w-full h-full object-cover object-center filter brightness-[0.98] contrast-[1.05] opacity-80"
          onError={(e) => {
            e.currentTarget.src = getDestinationBackgroundImage(trip.destination);
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC]/30 to-white/40 transition-all duration-700" />
      </div>

      {/* 2. Top Header Ribbon */}
      <header className="relative z-20 px-8 py-6 flex items-center justify-between">
        
        {/* Back Button */}
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-full bg-white/90 hover:bg-white backdrop-blur-xl text-slate-800 text-xs font-semibold transition-all duration-300 flex items-center space-x-2 shadow-sm border border-slate-200/90 active:scale-95 hover:scale-105 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-rose-500" />
          <span>Back to Journeys</span>
        </button>

        {/* Minimalist Center Title in Frosted Glass Pill */}
        <div className="text-center px-6 py-2 rounded-2xl bg-white/85 backdrop-blur-xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-widest block text-rose-600">
            {trip.country && trip.country.toLowerCase() !== trip.destination.toLowerCase() ? capitalizeWords(trip.country) : 'India'} • Full Trip Plan
          </span>
          <h1 className="font-bold text-2xl uppercase tracking-tight text-slate-900 drop-shadow-sm">
            {capitalizeWords(trip.destination)}
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          <div className="bg-white/80 backdrop-blur-xl rounded-full p-1 border border-slate-200/90 shadow-sm flex space-x-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('itinerary')}
              className={`px-4 py-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                activeTab === 'itinerary' ? 'bg-rose-500 text-white font-bold shadow-md shadow-rose-500/20' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-4 py-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                activeTab === 'inventory' ? 'bg-rose-500 text-white font-bold shadow-md shadow-rose-500/20' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Flights & Stays
            </button>
          </div>

          <button
            onClick={onOpenExport}
            className="p-2.5 rounded-full bg-white/90 hover:bg-white backdrop-blur-xl text-slate-700 transition-all duration-300 border border-slate-200/90 shadow-sm active:scale-95 hover:scale-105 cursor-pointer"
            title="Export iCal / PDF"
          >
            <Download className="w-4 h-4 text-rose-500" />
          </button>

          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete the itinerary for ${trip.destination}?`)) {
                onDeleteTrip(trip.id);
              }
            }}
            className="p-2.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 transition-all duration-300 border border-rose-200 active:scale-95 hover:scale-105 cursor-pointer"
            title="Delete Itinerary"
          >
            <Trash2 className="w-4 h-4 text-rose-500" />
          </button>
        </div>

      </header>

      {/* 3. Main Glass Workspace Container */}
      <main className="relative z-10 px-6 sm:px-10 py-6 flex-1 flex flex-col max-w-7xl mx-auto w-full space-y-6 animate-slide-up">
        
        {activeTab === 'itinerary' && (
          <div className="space-y-6">
            
            {/* Days Ribbon Container - Isolated Glass Bar */}
            <div className="p-3 rounded-3xl bg-white/80 border border-slate-200/90 backdrop-blur-xl shadow-sm">
              <div className="flex items-center space-x-3 overflow-x-auto pb-1 pt-1 px-1 no-scrollbar">
                {days.map((day, idx) => {
                  const isSelected = currentDayIndex === idx;
                  const isRecentlyUpdated = lastUpdatedDayNumber === day.dayNumber;
                  return (
                    <button
                      key={day.dayNumber}
                      onClick={() => setDayIndex(idx)}
                      className={`px-5 py-3 rounded-2xl min-w-[145px] flex flex-col justify-between border transition-all duration-300 text-left relative overflow-hidden cursor-pointer ${
                        isSelected
                          ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/25 scale-[1.02]'
                          : 'bg-white border-slate-200/80 text-slate-700 hover:border-slate-300 shadow-sm opacity-90'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-1.5">
                          <span className={`font-bold text-xs ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                            Day {day.dayNumber}
                          </span>
                          {isRecentlyUpdated && (
                            <span className="text-[8px] bg-emerald-50 text-emerald-700 border border-emerald-300 px-1.5 py-0.2 rounded-full font-bold uppercase animate-pulse">
                              Updated
                            </span>
                          )}
                        </div>
                        <span className="text-sm">{day.weather.icon}</span>
                      </div>
                      <div className={`text-[10px] font-medium ${isSelected ? 'text-white/90' : 'text-slate-500'}`}>
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
                <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 font-mono font-bold text-xs shadow-sm">
                      D{activeDay?.dayNumber || 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">
                        Day {activeDay?.dayNumber} Agenda — {activeDay?.date}
                      </h3>
                      <span className="text-[11px] text-slate-500">
                        {activeDay?.activities.length || 0} Scheduled Activities
                      </span>
                    </div>
                  </div>

                  <div className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold flex items-center space-x-2 text-slate-700">
                    {activeDay?.weather.isRainy ? <CloudRain className="w-4 h-4 text-rose-500" /> : <Sun className="w-4 h-4 text-amber-500" />}
                    <span>{activeDay?.weather.isRainy ? '☔ Weather-Safe Indoor Plan' : '☀️ Clear Outdoor Plan'}</span>
                  </div>
                </div>

                {/* Activities List */}
                <div className="space-y-3">
                  {activeDay?.activities.map((act) => (
                    <div
                      key={act.id}
                      className="p-5 rounded-3xl bg-white border border-slate-200/90 hover:border-rose-300 hover:shadow-lg transition-all duration-300 shadow-sm group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 shrink-0 font-bold text-xs shadow-sm">
                            <MapPin className="w-5 h-5 text-rose-500" />
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center space-x-2">
                              <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-semibold ${getCategoryBadgeClass(act.category)}`}>
                                {act.category}
                              </span>
                              {act.isIndoor && (
                                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                  🛡️ Weather Safe Indoor Spot
                                </span>
                              )}
                            </div>

                            <h4 className="font-bold text-lg text-slate-900 group-hover:text-rose-600 transition-colors duration-300 leading-snug">
                              {act.title}
                            </h4>

                            <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
                              {act.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-medium pt-2">
                              <span className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200">
                                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                                <span className="text-slate-800 font-medium">{act.location}</span>
                              </span>

                              <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 font-semibold text-xs">
                                {act.estimatedCost.includes('₹') || act.estimatedCost.includes('$') ? (
                                  <>
                                    <DollarSign className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                    <span>{act.estimatedCost}</span>
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                    <span>{act.estimatedCost}</span>
                                  </>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(act.title + ' ' + act.location)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors duration-300 shrink-0 border border-slate-200"
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
                <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-700">Estimated Budget Tracker</span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 font-semibold uppercase border border-rose-200">
                      {trip.budget} Tier
                    </span>
                  </div>

                  <div className="space-y-3">
                    {/* Est. Daily Budget */}
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">Est. Daily Budget (Food & Activities)</span>
                      <span className="text-rose-600 font-mono font-bold text-sm">
                        ₹{budgetMetrics.estimatedDailySpend.toLocaleString('en-IN')}/day
                      </span>
                    </div>

                    {/* Breakdown Subtotals */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Activities & Dining ({budgetMetrics.daysCount} Days)</span>
                        <span className="text-slate-900 font-mono font-semibold">
                          ₹{budgetMetrics.activityTotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Accommodation ({budgetMetrics.nightsCount} Nights @ ₹{budgetMetrics.hotelRatePerNight.toLocaleString('en-IN')})</span>
                        <span className="text-slate-900 font-mono font-semibold">
                          ₹{budgetMetrics.accommodationTotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Total Budget */}
                    <div className="flex justify-between items-center text-xs pt-1">
                      <span className="text-slate-700 font-bold uppercase tracking-wider">Total Estimated Budget</span>
                      <span className="font-mono font-extrabold text-base text-rose-600">
                        ₹{budgetMetrics.grandTotal.toLocaleString('en-IN')} INR
                      </span>
                    </div>

                    {/* Budget progress bar */}
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-400 to-rose-600 transition-all duration-500"
                        style={{ width: `${Math.min(100, (budgetMetrics.grandTotal / (trip.budget === 'high' ? 75000 : trip.budget === 'medium' ? 35000 : 15000)) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                    <div className="flex items-center space-x-1.5 font-semibold text-slate-800">
                      <ShieldCheck className="w-4 h-4 text-rose-500" />
                      <span>Budget Breakdown Guide</span>
                    </div>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Food, dining & activity entry costs are included in the daily estimated budget. Accommodation is calculated per night based on selected hotels.
                    </p>
                  </div>
                </div>

                {/* Trip Summary Card */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3 text-xs">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                    Journey Details
                  </h4>
                  <div className="space-y-2 text-slate-700">
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Origin</span>
                      <span className="font-bold text-slate-900">{trip.origin}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Destination</span>
                      <span className="font-bold text-slate-900">{trip.destination}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Travelers</span>
                      <span className="font-bold text-slate-900">{trip.guest_count} Person(s)</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Session ID</span>
                      <span className="font-mono text-[10px] text-rose-600">{trip.session_id}</span>
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
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center space-x-2">
                  <Plane className="w-5 h-5 text-rose-500" />
                  <h2 className="font-bold text-lg text-slate-900">
                    Flight Recommendations ({trip.origin} ➔ {trip.destination})
                  </h2>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  SerpApi Google Flights
                </span>
              </div>

              {displayFlights.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {displayFlights.map((flight) => (
                    <div 
                      key={flight.id} 
                      className="p-5 rounded-3xl bg-white border border-slate-200/90 hover:border-rose-300 hover:shadow-lg transition-all duration-300 space-y-4 shadow-sm group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900 group-hover:text-rose-600 transition-colors duration-300">
                          {flight.airline}
                        </span>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 font-bold border border-rose-200">
                          {flight.stops}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs py-3 border-y border-slate-200">
                        <div>
                          <span className="font-bold block text-sm text-slate-900">{flight.departureTime}</span>
                          <span className="text-slate-500 text-[10px] block truncate max-w-[100px]">
                            {flight.departureAirport || trip.origin}
                          </span>
                        </div>

                        <div className="text-center px-2">
                          <span className="text-[10px] text-slate-400 block">{flight.duration}</span>
                          <Plane className="w-4 h-4 text-rose-500 mx-auto my-1 transform rotate-90" />
                        </div>

                        <div className="text-right">
                          <span className="font-bold block text-sm text-slate-900">{flight.arrivalTime}</span>
                          <span className="text-slate-500 text-[10px] block truncate max-w-[100px]">
                            {flight.arrivalAirport || trip.destination}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-1">
                        <span className="font-mono font-bold text-base text-rose-600">{flight.price}</span>
                        <a
                          href={`https://www.google.com/travel/flights?q=flights+from+${encodeURIComponent(trip.origin)}+to+${encodeURIComponent(trip.destination)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all duration-300 flex items-center space-x-1 shadow-md shadow-rose-500/20"
                        >
                          <span>Book Flight</span>
                          <ExternalLink className="w-3 h-3 text-white" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-3xl bg-white/95 border border-slate-200/90 text-center space-y-3 shadow-sm backdrop-blur-md max-w-xl mx-auto">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mx-auto">
                    <Plane className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">No Flights Requested Yet</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Direct flight routes and live pricing are retrieved on-demand via your Concierge AI.
                  </p>
                  <button
                    type="button"
                    onClick={onOpenConciergeChat}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-md shadow-rose-500/20 active:scale-95 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-white" />
                    <span>Ask Concierge for Flights ({trip.origin} ➔ {trip.destination})</span>
                  </button>
                </div>
              )}
            </div>

            {/* 2. HOTEL RECOMMENDATIONS SECTION */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-rose-500" />
                  <h2 className="font-bold text-lg text-slate-900">
                    Hotel & Stay Recommendations ({trip.destination})
                  </h2>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  SerpApi Google Hotels
                </span>
              </div>

              {displayHotels.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {displayHotels.map((hotel) => (
                    <div 
                      key={hotel.id} 
                      className="p-5 rounded-3xl bg-white border border-slate-200/90 hover:border-rose-300 hover:shadow-lg transition-all duration-300 space-y-3 shadow-sm flex flex-col justify-between group"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-base text-slate-900 group-hover:text-rose-600 transition-colors duration-300 leading-snug">
                            {hotel.name}
                          </h3>
                          <div className="flex items-center space-x-1 text-rose-600 font-bold text-xs bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200 shrink-0">
                            <Star className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                            <span>{hotel.rating || 4.5}</span>
                          </div>
                        </div>

                        <span className="text-[10px] text-slate-500 block font-medium">
                          📍 {hotel.neighborhood}
                        </span>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {hotel.amenities.map((amenity, aIdx) => (
                            <span 
                              key={aIdx} 
                              className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center space-x-1"
                            >
                              <Wifi className="w-2.5 h-2.5 text-rose-500" />
                              <span>{amenity}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                        <div>
                          <span className="font-mono font-bold text-base text-rose-600 block">{hotel.pricePerNight}</span>
                          <span className="text-[9px] text-slate-400 block uppercase tracking-wider">Per Night</span>
                        </div>

                        <a
                          href={`https://www.google.com/travel/hotels?q=${encodeURIComponent('Hotels in ' + trip.destination + ' ' + hotel.name)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all duration-300 flex items-center space-x-1 shadow-md shadow-rose-500/20"
                        >
                          <span>View Hotel</span>
                          <ExternalLink className="w-3 h-3 text-white" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-3xl bg-white/95 border border-slate-200/90 text-center space-y-3 shadow-sm backdrop-blur-md max-w-xl mx-auto">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mx-auto">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">No Hotels Requested Yet</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Live hotel properties and nightly rates for {trip.destination} can be curated on-demand by your Concierge AI.
                  </p>
                  <button
                    type="button"
                    onClick={onOpenConciergeChat}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-md shadow-rose-500/20 active:scale-95 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-white" />
                    <span>Ask Concierge for Hotels in {trip.destination}</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

      </main>

      {/* 4. Floating Concierge Icon */}
      <button
        onClick={onOpenConciergeChat}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-white/95 hover:bg-white border border-slate-200/90 text-slate-900 shadow-[0_15px_35px_rgba(15,23,42,0.12)] hover:shadow-[0_20px_45px_rgba(244,63,94,0.2)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center space-x-2 group cursor-pointer"
        title="Open AI Concierge Chat"
      >
        <MessageSquare className="w-5 h-5 text-rose-500 group-hover:scale-110 transition-transform duration-300" />
        <span className="font-bold text-xs pr-1">Concierge AI</span>
      </button>

    </div>
  );
};



