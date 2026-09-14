import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Sun, 
  CloudRain, 
  MapPin, 
  Clock, 
  DollarSign, 
  ExternalLink, 
  ShieldCheck, 
  Download,
  Plane,
  Star,
  MessageSquare
} from 'lucide-react';
import type { TripState, ItineraryDay, Activity } from '../types';
import { getTripTheme } from '../utils/themeUtils';

interface TripPlanViewProps {
  trip: TripState;
  days: ItineraryDay[];
  onBack: () => void;
  onOpenConciergeChat: () => void;
  onOpenExport: () => void;
}

export const TripPlanView: React.FC<TripPlanViewProps> = ({
  trip,
  days,
  onBack,
  onOpenConciergeChat,
  onOpenExport
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'inventory'>('itinerary');

  const activeDay = days[selectedDayIndex] || days[0];

  // Dynamic Theme Palette for this specific trip
  const tripTheme = getTripTheme(trip.destination, trip.country);

  const calculateTotalCost = () => {
    let total = 0;
    days.forEach(day => {
      day.activities.forEach(act => {
        const costNum = parseInt(act.estimatedCost.replace(/[^0-9]/g, '')) || 0;
        total += costNum;
      });
    });
    return total;
  };

  const totalCost = calculateTotalCost();

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
          src={trip.bgImage}
          alt={trip.destination}
          className="w-full h-full object-cover object-center filter brightness-[0.50] contrast-[1.05]"
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
            {trip.country} • Full Trip Plan
          </span>
          <h1 className="font-bold text-2xl uppercase tracking-tight text-white drop-shadow-md">
            {trip.destination}
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
                  const isSelected = selectedDayIndex === idx;
                  return (
                    <button
                      key={day.dayNumber}
                      onClick={() => setSelectedDayIndex(idx)}
                      className={`px-5 py-3 rounded-2xl min-w-[145px] flex flex-col justify-between border transition-all duration-300 text-left ${
                        isSelected
                          ? `${tripTheme.buttonAccent} shadow-lg scale-[1.02]`
                          : 'bg-white/5 border-white/10 text-white hover:bg-white/15 hover:border-white/25 backdrop-blur-md opacity-90'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-bold text-xs ${isSelected ? 'text-slate-950' : 'text-white'}`}>
                          Day {day.dayNumber}
                        </span>
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
                          <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#D4B886] shrink-0 font-mono font-bold text-xs">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-[#D4B886] font-mono">{act.time}</span>
                              <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-semibold ${getCategoryBadgeClass(act.category)}`}>
                                {act.category}
                              </span>
                              {act.isIndoor && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">
                                  🛡️ Weather Safe
                                </span>
                              )}
                            </div>

                            <h4 className="font-bold text-base text-white group-hover:text-[#D4B886] transition-colors duration-300">
                              {act.title}
                            </h4>

                            <p className="text-xs text-slate-300 leading-relaxed">
                              {act.description}
                            </p>

                            <div className="flex items-center space-x-4 text-xs text-slate-400 font-medium pt-1">
                              <span className="flex items-center space-x-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                <span>{act.location}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <DollarSign className="w-3.5 h-3.5 text-[#D4B886]" />
                                <span>Est. {act.estimatedCost}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(act.title + ' ' + act.location)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/20 text-slate-300 hover:text-white transition-colors duration-300 shrink-0 border border-white/10"
                          title="View on Google Maps"
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

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-400">Total Activity & Dining Est.</span>
                      <span className="text-white font-mono font-bold text-base">${totalCost} USD</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-white/40 to-[#D4B886] transition-all duration-500"
                        style={{ width: `${Math.min(100, (totalCost / 1200) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-[11px] text-slate-300 space-y-1">
                    <div className="flex items-center space-x-1.5 font-semibold text-white">
                      <ShieldCheck className="w-4 h-4 text-[#D4B886]" />
                      <span>AI Weather Adaptation</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Synced live with Open-Meteo geocoding APIs.
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
          <div className="space-y-6">
            <h2 className="font-bold text-xl text-white">
              Recommended Luxury Stays & Flight Connections
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl glass-panel-dark border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">Air France / British Airways</span>
                  <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-[#D4B886] font-bold border border-white/20">Business Class</span>
                </div>
                <div className="flex justify-between text-xs py-3 border-y border-white/10">
                  <div>
                    <span className="font-bold block text-sm">08:45 AM</span>
                    <span className="text-slate-400 text-[10px]">{trip.origin}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] text-slate-400">1h 20m Direct</span>
                    <Plane className="w-4 h-4 text-[#D4B886] mx-auto my-1" />
                  </div>
                  <div className="text-right">
                    <span className="font-bold block text-sm">11:05 AM</span>
                    <span className="text-slate-400 text-[10px]">{trip.destination}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-3xl glass-panel-dark border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">Le Grand Palace Hotel {trip.destination}</span>
                  <div className="flex items-center space-x-1 text-[#D4B886] font-bold text-xs">
                    <Star className="w-3.5 h-3.5 fill-[#D4B886]" />
                    <span>5.0</span>
                  </div>
                </div>
                <p className="text-xs text-slate-300">Central Historic Quarter • Private Spa & Michelin Dining</p>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-mono font-bold text-base text-[#D4B886]">$680 / night</span>
                  <a
                    href={`https://www.google.com/travel/hotels?q=${encodeURIComponent(trip.destination)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-bold transition-colors duration-300"
                  >
                    View Hotel
                  </a>
                </div>
              </div>
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



