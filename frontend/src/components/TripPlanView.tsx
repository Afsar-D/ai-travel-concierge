import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  CloudSun, 
  CloudRain, 
  Sun, 
  Wind, 
  Share2, 
  Trash2, 
  Plus, 
  Check, 
  Plane, 
  Feather, 
  MessageSquare, 
  X
} from 'lucide-react';
import type { TripState, ItineraryDay, Activity, FlightOption, HotelOption } from '../types';
import { getDestinationBackgroundImage, capitalizeWords, formatLocationName, getDestinationTimeInfo, getCleanSummary } from '../utils/themeUtils';
import { parseBackendReply } from '../utils/parser';

export type ActivityItem = Activity;

interface TripPlanViewProps {
  trip: TripState;
  trips?: TripState[];
  onSelectTrip?: (trip: TripState) => void;
  days: ItineraryDay[];
  selectedDayIndex?: number;
  onSelectDayIndex?: (index: number) => void;
  lastUpdatedDayNumber?: number | null;
  activeTab?: 'itinerary' | 'inventory';
  onTabChange?: (tab: 'itinerary' | 'inventory') => void;
  onBack: () => void;
  onOpenConciergeChat: () => void;
  onOpenExport: () => void;
  onDeleteTrip: (tripId: string) => void;
  onUpdateItinerary?: (updatedTrip: TripState, updatedDays: ItineraryDay[]) => void;
}

export const TripPlanView: React.FC<TripPlanViewProps> = ({
  trip,
  trips = [],
  onSelectTrip,
  days,
  selectedDayIndex: controlledDayIndex,
  onSelectDayIndex,
  activeTab: controlledActiveTab,
  onTabChange,
  onBack,
  onOpenConciergeChat,
  onOpenExport,
  onDeleteTrip,
  onUpdateItinerary,
}) => {
  const [internalDayIndex, setInternalDayIndex] = useState(0);
  const currentDayIndex = controlledDayIndex !== undefined ? controlledDayIndex : internalDayIndex;
  const setDayIndex = onSelectDayIndex || setInternalDayIndex;

  const [currentTab, setCurrentTab] = useState<'itinerary' | 'inventory' | 'packing'>('itinerary');
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);
  const [completedStops, setCompletedStops] = useState<Record<string, boolean>>({});
  const [bespokeStopText, setBespokeStopText] = useState('');

  // Dynamic real-world local time for the destination
  const [timeInfo, setTimeInfo] = useState(() => getDestinationTimeInfo(trip.destination, trip.country));

  useEffect(() => {
    const updateTime = () => {
      setTimeInfo(getDestinationTimeInfo(trip.destination, trip.country));
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, [trip.destination, trip.country]);

  // Sync controlled activeTab if passed from parent
  useEffect(() => {
    if (controlledActiveTab) {
      setCurrentTab(controlledActiveTab);
    }
  }, [controlledActiveTab]);

  const handleTabSwitch = (tab: 'itinerary' | 'inventory' | 'packing') => {
    setCurrentTab(tab);
    if (tab === 'itinerary' || tab === 'inventory') {
      if (onTabChange) onTabChange(tab);
    }
  };

  const activeDay = days[currentDayIndex] || days[0];

  // Flights & Hotels extraction
  const parsedData = parseBackendReply(trip.description || '', trip.origin, trip.destination);
  const displayFlights: FlightOption[] = (trip.flights && trip.flights.length > 0) ? trip.flights : parsedData.flights;
  const displayHotels: HotelOption[] = (trip.hotels && trip.hotels.length > 0) ? trip.hotels : parsedData.hotels;

  // Toggle completion of a timeline activity
  const toggleStopStatus = (actId: string) => {
    setCompletedStops(prev => ({ ...prev, [actId]: !prev[actId] }));
  };

  // Add bespoke stop to current day
  const handleAddBespokeStop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bespokeStopText.trim() || !activeDay) return;

    const newActivity: Activity = {
      id: `bespoke_${Date.now()}`,
      time: '04:30 PM',
      title: bespokeStopText.trim(),
      description: 'Bespoke atelier addition arranged by traveler.',
      category: 'Culture',
      location: trip.destination,
      estimatedCost: '₹800 – ₹1,500',
      isIndoor: true,
    };

    const updatedDays = days.map((d, idx) => {
      if (idx === currentDayIndex) {
        return {
          ...d,
          activities: [...d.activities, newActivity]
        };
      }
      return d;
    });

    if (onUpdateItinerary) {
      onUpdateItinerary(trip, updatedDays);
    }
    setBespokeStopText('');
  };

  // Accurate Budget calculations
  const calculateBudgetBreakdown = () => {
    let activityTotal = 0;
    let diningTotal = 0;
    let cultureTotal = 0;
    let transitActTotal = 0;

    days.forEach(day => {
      day.activities.forEach(act => {
        const costStr = (act.estimatedCost || '').toLowerCase().trim();
        // Skip items that don't have a cost or are free/complimentary/included
        const isFree = 
          costStr.includes('free') || 
          costStr.includes('complimentary') || 
          costStr.includes('included') || 
          costStr.includes('no charge') ||
          costStr === '-' || 
          costStr === 'n/a' ||
          !costStr;

        if (isFree) return;

        const numbers = act.estimatedCost.match(/\d[\d,]*/g);
        if (numbers && numbers.length > 0) {
          const parsedNums = numbers.map(n => parseInt(n.replace(/,/g, ''), 10)).filter(n => !isNaN(n));
          let cost = 0;
          if (parsedNums.length === 1) {
            cost = parsedNums[0];
          } else if (parsedNums.length >= 2) {
            cost = Math.round((parsedNums[0] + parsedNums[1]) / 2);
          }

          activityTotal += cost;
          if (act.category === 'Dining') diningTotal += cost;
          else if (act.category === 'Transit') transitActTotal += cost;
          else cultureTotal += cost;
        }
      });
    });

    // Flight total: calculate only if flights are present in dossier
    let flightTotal = 0;
    if (displayFlights && displayFlights.length > 0) {
      const flightNums = (displayFlights[0].price || '').match(/\d[\d,]*/g);
      if (flightNums && flightNums.length > 0) {
        flightTotal = parseInt(flightNums[0].replace(/,/g, ''), 10) || 0;
      }
    }

    // Hotel total: calculate only if hotels are present in dossier
    let hotelTotal = 0;
    const nightsCount = Math.max(1, days.length > 1 ? days.length - 1 : 1);
    if (displayHotels && displayHotels.length > 0) {
      const hotelNums = (displayHotels[0].pricePerNight || '').match(/\d[\d,]*/g);
      if (hotelNums && hotelNums.length > 0) {
        const nightlyRate = parseInt(hotelNums[0].replace(/,/g, ''), 10) || 0;
        hotelTotal = nightlyRate * nightsCount;
      }
    }

    const totalEst = activityTotal + flightTotal + hotelTotal;
    const daysCount = Math.max(1, days.length);
    const dailyEst = daysCount > 0 ? Math.round(totalEst / daysCount) : 0;

    // Allocation percentages (real dynamic math)
    const totalRef = totalEst > 0 ? totalEst : 1;
    const stayPercent = totalEst > 0 ? Math.round((hotelTotal / totalRef) * 100) : 0;
    const transitPercent = totalEst > 0 ? Math.round(((flightTotal + transitActTotal) / totalRef) * 100) : 0;
    const diningPercent = totalEst > 0 ? Math.round((diningTotal / totalRef) * 100) : 0;
    const culturePercent = totalEst > 0 ? Math.max(0, 100 - stayPercent - transitPercent - diningPercent) : 0;

    return { 
      activityTotal, 
      flightTotal, 
      hotelTotal, 
      totalEst, 
      dailyEst,
      stayPercent,
      transitPercent,
      diningPercent,
      culturePercent
    };
  };

  const budgetMetrics = calculateBudgetBreakdown();
  const tripBg = trip.bgImage || getDestinationBackgroundImage(trip.destination);

  // Weather icon helper
  const getWeatherIcon = (cond?: string) => {
    const c = (cond || '').toLowerCase();
    if (c.includes('rain')) return <CloudRain className="w-4 h-4 text-sky-500" />;
    if (c.includes('cloud')) return <CloudSun className="w-4 h-4 text-[#9A5B43]" />;
    if (c.includes('wind')) return <Wind className="w-4 h-4 text-slate-500" />;
    return <Sun className="w-4 h-4 text-sky-400" />;
  };

  return (
    <div className="relative min-h-screen w-screen bg-[#FAF9F6] text-[#151516] font-sans antialiased selection:bg-[#EBE7DC] selection:text-[#151516] overflow-x-hidden">
      
      {/* ================= 1. AMBIENT BACKDROP ================= */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-scale-subtle opacity-95"
          style={{ backgroundImage: `url('${tripBg}')` }}
        />
        {/* Cinematic Scrim: Gentle darkening at top for header contrast, lighter translucent linen below to maximize background visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#151516]/50 via-[#FAF9F6]/25 to-[#FAF9F6]/80" />
      </div>

      {/* ================= 2. STICKY QUICK-SWITCH FLOATING BAR ================= */}
      <div className="sticky top-3 sm:top-4 z-40 max-w-7xl mx-auto px-3 sm:px-8 mb-3 sm:mb-4 pointer-events-none">
        <div className="paper-panel rounded-full px-2.5 sm:px-3 py-1.5 sm:py-2 shadow-lg flex items-center justify-between gap-2 sm:gap-3 pointer-events-auto border border-[#E8E4DA] w-full">
          
          {/* Back to All Journeys */}
          <button 
            onClick={onBack}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-medium text-[#151516] hover:bg-[#F4F1EA] transition group cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#71717A] group-hover:-translate-x-0.5 transition" />
            <span><span className="hidden sm:inline">All </span>Journeys</span>
          </button>

          <span className="w-[1px] h-4 bg-[#E8E4DA] hidden md:block" />

          {/* Quick Switcher Between Other Trips */}
          {trips.length > 1 && (
            <div className="hidden md:flex items-center gap-1.5">
              <span className="text-[10px] font-mono tracking-editorial-mono uppercase text-[#A1A1AA] mr-1">Switch:</span>
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-md">
                {trips.slice(0, 5).map(t => {
                  const isCurrent = t.id === trip.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => onSelectTrip && onSelectTrip(t)}
                      className={`px-3 py-1 rounded-full text-[11px] font-sans transition cursor-pointer ${
                        isCurrent 
                          ? 'bg-[#151516] text-white font-medium' 
                          : 'text-[#525258] hover:text-[#151516] hover:bg-[#E8E5DD]'
                      }`}
                    >
                      {capitalizeWords(t.destination)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Right Action Icons: Status, Concierge AI, Export & Delete */}
          <div className="flex items-center gap-1.5 sm:gap-2 pl-1 sm:pl-2 shrink-0">
            <span className="text-[9px] sm:text-[10px] font-mono tracking-editorial-mono px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[#E8E5DD] text-[#38383C] font-semibold uppercase">
              <span className="hidden sm:inline">{trip.status === 'past' ? 'ARCHIVED' : 'ACTIVE RESIDENCY'}</span>
              <span className="sm:hidden">{trip.status === 'past' ? 'PAST' : 'ACTIVE'}</span>
            </span>

            <button
              onClick={onOpenConciergeChat}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#151516] hover:bg-[#232326] text-white text-[11px] font-medium transition cursor-pointer shadow-sm border border-white/10"
              title="Open Concierge AI"
            >
              <Sparkles className="w-3 h-3 text-sky-400" />
              <span className="hidden sm:inline">Concierge AI</span>
              <span className="sm:hidden">AI</span>
            </button>

            <button
              onClick={onOpenExport}
              className="p-1 sm:p-1.5 rounded-full hover:bg-[#E8E5DD] text-[#71717A] hover:text-[#151516] transition cursor-pointer"
              title="Export Dossier PDF / Calendar"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete the dossier for ${trip.destination}?`)) {
                  onDeleteTrip(trip.id);
                }
              }}
              className="p-1 sm:p-1.5 rounded-full hover:bg-rose-50 text-[#71717A] hover:text-rose-600 transition cursor-pointer"
              title="Delete Dossier"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

      {/* ================= 3. IMMERSIVE SELECTED CITY HERO SECTION ================= */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 pt-2 sm:pt-4 pb-6 sm:pb-8">
        <div className="space-y-3 sm:space-y-4">
          
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <span className="text-[10px] sm:text-[11px] font-mono tracking-editorial-mono uppercase text-white/90 bg-[#151516]/45 backdrop-blur-md px-3 sm:px-3.5 py-0.5 sm:py-1 rounded-full border border-white/15">
              Dossier #{trip.id.slice(0, 8).toUpperCase()}
            </span>
            <span className="text-[11px] sm:text-xs font-mono text-white/90 bg-[#151516]/45 backdrop-blur-md px-3 sm:px-3.5 py-0.5 sm:py-1 rounded-full border border-white/15">
              {trip.start_date || 'Upcoming'} {trip.end_date ? `— ${trip.end_date}` : ''}
            </span>
            <span className="text-xs font-serif italic text-white/80 hidden md:inline">
              — {trip.budget.toUpperCase()} Tier private residency
            </span>
          </div>

          {/* City Heading & Ambient Destination Clock */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-6">
            <div>
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-7xl font-normal text-white tracking-tight leading-none drop-shadow-sm">
                {formatLocationName(trip.destination, trip.country)}
              </h1>
              <p className="mt-2 sm:mt-3 font-sans text-xs sm:text-sm text-white/90 font-light max-w-2xl leading-relaxed drop-shadow-sm">
                {getCleanSummary(trip.description, trip.destination)}
              </p>
            </div>

            {/* Local Clock & Weather Microclimate Card */}
            <div className="paper-panel p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-[#E8E4DA] flex items-center justify-between sm:justify-start gap-4 sm:gap-6 text-[#151516] shrink-0 shadow-sm w-full sm:w-auto">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-editorial-mono text-[#71717A] block">
                  Local Time
                </span>
                <span className="font-mono text-xs sm:text-sm font-semibold text-[#151516] block mt-0.5">
                  {timeInfo.timeStr} {timeInfo.tzAbbreviation}
                </span>
                <span className="text-[10px] text-[#71717A]">{timeInfo.ianaTimezone}</span>
              </div>

              <span className="w-[1px] h-8 bg-[#E8E4DA]" />

              <div>
                <span className="text-[10px] font-mono uppercase tracking-editorial-mono text-[#71717A] block">
                  Microclimate
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {getWeatherIcon(activeDay?.weather?.condition)}
                  <span className="text-xs sm:text-sm font-medium text-[#151516]">
                    {activeDay?.weather?.temp || '24°C'}
                  </span>
                </div>
                <span className="text-[10px] text-[#71717A]">
                  {activeDay?.weather?.condition || 'Crisp Autumn'}
                </span>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* ================= 4. DOSSIER MAIN TABS & CONTENT BODY ================= */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 pb-20 sm:pb-24">
        
        {/* Dossier Navigation Tab Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 border-b border-[#E8E4DA] pb-2.5 sm:pb-3 overflow-x-auto no-scrollbar mb-6 sm:mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
          <button 
            onClick={() => handleTabSwitch('itinerary')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-medium transition cursor-pointer shrink-0 whitespace-nowrap ${
              currentTab === 'itinerary'
                ? 'bg-[#151516] text-white shadow-sm'
                : 'paper-panel text-[#525258] hover:text-[#151516]'
            }`}
          >
            <span className="sm:hidden">Itinerary</span>
            <span className="hidden sm:inline">Itinerary & Timeline</span>
          </button>

          <button 
            onClick={() => handleTabSwitch('inventory')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-medium transition cursor-pointer flex items-center space-x-1.5 shrink-0 whitespace-nowrap ${
              currentTab === 'inventory'
                ? 'bg-[#151516] text-white shadow-sm'
                : 'paper-panel text-[#525258] hover:text-[#151516]'
            }`}
          >
            <Plane className="w-3.5 h-3.5" />
            <span>Flights & Stays</span>
          </button>

          <button 
            onClick={() => handleTabSwitch('packing')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-medium transition cursor-pointer shrink-0 whitespace-nowrap ${
              currentTab === 'packing'
                ? 'bg-[#151516] text-white shadow-sm'
                : 'paper-panel text-[#525258] hover:text-[#151516]'
            }`}
          >
            <span className="sm:hidden">Packing</span>
            <span className="hidden sm:inline">Curated Packing & Notes</span>
          </button>
        </div>

        {/* ----------------- TAB PANEL 1: ITINERARY & TIMELINE ----------------- */}
        {currentTab === 'itinerary' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            
            {/* Timeline Main (8 cols) */}
            <div className="lg:col-span-8 paper-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 border border-[#E8E4DA]">
              
              {/* Day selector pills */}
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 sm:gap-4 pb-4 sm:pb-5 border-b border-[#E8E4DA]">
                <div>
                  <span className="text-[10px] font-mono tracking-editorial-mono uppercase text-[#71717A] font-semibold">
                    Chronological Dossier
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#151516] mt-0.5 sm:mt-1">
                    Day 0{activeDay ? activeDay.dayNumber : 1}: {trip.destination} Exploration
                  </h3>
                </div>

                <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0 -mx-1 px-1 sm:mx-0 sm:px-0">
                  {days.map((d, idx) => (
                    <button
                      key={d.dayNumber}
                      onClick={() => setDayIndex(idx)}
                      className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-mono transition cursor-pointer shrink-0 ${
                        currentDayIndex === idx
                          ? 'bg-[#151516] text-white font-medium shadow-sm'
                          : 'paper-inset text-[#525258] hover:text-[#151516]'
                      }`}
                    >
                      Day 0{d.dayNumber}
                    </button>
                  ))}
                </div>
              </div>

              {/* Timeline Checkpoints */}
              <div className="space-y-4 pt-2 relative">
                <div className="absolute left-3.5 top-3 bottom-6 w-[1px] bg-[#E8E4DA]" />
                
                {activeDay && activeDay.activities.length > 0 ? (
                  activeDay.activities.map((act) => {
                    const isDone = !!completedStops[act.id];
                    return (
                      <div key={act.id} className="relative pl-9 group">
                        
                        {/* Node Check Button */}
                        <button
                          onClick={() => toggleStopStatus(act.id)}
                          title="Toggle Checkpoint Completion"
                          className={`absolute left-1.5 top-3 -translate-y-1/2 w-4 h-4 rounded-full border bg-white transition-all flex items-center justify-center cursor-pointer ${
                            isDone 
                              ? 'border-[#151516] bg-[#151516] text-white' 
                              : 'border-[#A1A1AA] hover:border-[#151516] text-transparent'
                          }`}
                        >
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </button>

                        {/* Stop Card */}
                        <div 
                          onClick={() => setSelectedActivity(act)}
                          className="paper-inset p-4 rounded-2xl border border-[#E8E4DA] hover:border-[#A1A1AA] transition cursor-pointer"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-xs text-[#525258]">
                              {act.time}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono tracking-editorial-mono uppercase px-2 py-0.5 rounded bg-[#E8E5DD] text-[#38383C]">
                                {act.category}
                              </span>
                              {act.estimatedCost && (
                                <span className="text-[10px] text-[#9A5B43] font-serif italic">
                                  {act.estimatedCost}
                                </span>
                              )}
                            </div>
                          </div>

                          <h5 className={`font-serif text-lg text-[#151516] mt-1 ${isDone ? 'line-through opacity-50' : ''}`}>
                            {act.title}
                          </h5>
                          <p className={`text-xs text-[#525258] font-light mt-0.5 ${isDone ? 'opacity-50' : ''}`}>
                            {act.description}
                          </p>
                        </div>

                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center text-xs text-[#71717A] font-serif italic">
                    No stops scheduled for this day yet. Add a bespoke stop below.
                  </div>
                )}
              </div>

              {/* Add Bespoke Activity to Day */}
              <form onSubmit={handleAddBespokeStop} className="pt-4 border-t border-[#E8E4DA] flex items-center gap-3">
                <input
                  type="text"
                  value={bespokeStopText}
                  onChange={(e) => setBespokeStopText(e.target.value)}
                  placeholder="Add bespoke atelier stop or reservation..."
                  className="flex-1 bg-[#F4F1EA]/80 border border-[#E8E4DA] rounded-xl px-4 py-2.5 text-xs text-[#151516] placeholder-[#A1A1AA] focus:outline-none focus:border-[#38383C]"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-[#151516] hover:bg-[#232326] text-white text-xs font-medium transition flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Stop</span>
                </button>
              </form>

            </div>

            {/* Companion Sidebar (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Curator Note with Laugh Tale Philosophy */}
              <div className="paper-panel rounded-3xl p-6 space-y-3 border border-[#E8E4DA]">
                <div className="flex items-center gap-2 text-[#525258] text-xs font-medium">
                  <Feather className="w-3.5 h-3.5 text-[#9A5B43]" />
                  <span>Note from Master Curator</span>
                </div>
                <p className="font-serif italic text-[#232326] text-sm leading-relaxed">
                  &ldquo;In every grand adventure, there&rsquo;s one final destination &mdash; a place where every journey finds its meaning. Laugh Tale is that destination.&rdquo;
                </p>
              </div>

              {/* Estimated Budget Tracker Card */}
              <div className="paper-panel rounded-3xl p-6 space-y-4 border border-[#E8E4DA]">
                <div className="flex items-baseline justify-between pb-2 border-b border-[#E8E4DA]">
                  <span className="text-[10px] font-mono tracking-editorial-mono uppercase text-[#71717A] font-semibold">
                    Estimated Budget Tracker
                  </span>
                  <span className="text-xs font-mono text-[#525258]">
                    {budgetMetrics.totalEst > 0 ? `${days.length} Days Planned` : 'No Expenses Logged'}
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-[#A1A1AA]">Est. Daily Budget</span>
                    <p className="font-serif text-2xl font-normal text-[#151516]">
                      ₹{budgetMetrics.dailyEst.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-mono text-[#A1A1AA]">Total Est. Budget</span>
                    <p className="font-serif text-2xl font-normal text-[#71717A]">
                      ₹{budgetMetrics.totalEst.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Allocation Progress Bar */}
                <div className="w-full h-1.5 rounded-full bg-[#E8E5DD] overflow-hidden flex">
                  {budgetMetrics.totalEst > 0 ? (
                    <>
                      {budgetMetrics.stayPercent > 0 && (
                        <div className="bg-[#151516] h-full" style={{ width: `${budgetMetrics.stayPercent}%` }} title={`Sanctuary Stays: ${budgetMetrics.stayPercent}%`} />
                      )}
                      {budgetMetrics.diningPercent > 0 && (
                        <div className="bg-[#9A5B43] h-full" style={{ width: `${budgetMetrics.diningPercent}%` }} title={`Dining: ${budgetMetrics.diningPercent}%`} />
                      )}
                      {budgetMetrics.transitPercent > 0 && (
                        <div className="bg-[#3D4536] h-full" style={{ width: `${budgetMetrics.transitPercent}%` }} title={`Transit & Flights: ${budgetMetrics.transitPercent}%`} />
                      )}
                      {budgetMetrics.culturePercent > 0 && (
                        <div className="bg-[#71717A] h-full" style={{ width: `${budgetMetrics.culturePercent}%` }} title={`Culture & Ateliers: ${budgetMetrics.culturePercent}%`} />
                      )}
                    </>
                  ) : (
                    <div className="bg-[#E8E5DD] h-full w-full" />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-[#525258]">
                  <div>• Sanctuary Stay ({budgetMetrics.stayPercent}%)</div>
                  <div>• Dining ({budgetMetrics.diningPercent}%)</div>
                  <div>• Transit & Flights ({budgetMetrics.transitPercent}%)</div>
                  <div>• Ateliers & Culture ({budgetMetrics.culturePercent}%)</div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ----------------- TAB PANEL 2: FLIGHTS & STAYS ----------------- */}
        {currentTab === 'inventory' && (
          <div className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              
              {/* Transit & Boarding Pass Document */}
              <div className="paper-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 border border-[#E8E4DA]">
                <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#E8E4DA]">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#F4F1EA] flex items-center justify-center text-[#151516]">
                      <Plane className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-600" />
                    </span>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-editorial-mono text-[#A1A1AA] block">
                        Transit Document
                      </span>
                      <h4 className="font-serif text-base sm:text-lg font-normal text-[#151516]">
                        Flight Recommendations
                      </h4>
                    </div>
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-mono tracking-editorial-mono px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-[#E8E5DD] text-[#38383C] font-semibold">
                    TKT CONFIRMED
                  </span>
                </div>

                {displayFlights.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {displayFlights.slice(0, 2).map((flight, idx) => (
                      <div key={flight.id || idx} className="paper-inset rounded-xl sm:rounded-2xl p-3.5 sm:p-5 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 border border-[#E8E4DA]">
                        <div>
                          <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">Origin</span>
                          <span className="font-semibold text-xs sm:text-sm text-[#151516] block mt-0.5">{trip.origin || 'London'}</span>
                          <span className="text-xs font-mono text-[#525258]">{flight.departureTime || '09:18 AM'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">Destination</span>
                          <span className="font-semibold text-xs sm:text-sm text-[#151516] block mt-0.5">{trip.destination}</span>
                          <span className="text-xs font-mono text-[#525258]">{flight.arrivalTime || '11:32 AM'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">Airline & Seat</span>
                          <span className="font-semibold text-xs sm:text-sm text-[#151516] block mt-0.5">{flight.airline || 'First Class'}</span>
                          <span className="text-xs text-[#71717A]">{flight.price || 'Included'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">Class</span>
                          <span className="font-semibold text-xs sm:text-sm text-[#151516] block mt-0.5">{flight.class || 'Executive'}</span>
                          <span className="text-xs text-[#71717A]">{flight.duration || 'Direct'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="paper-inset rounded-xl sm:rounded-2xl p-5 sm:p-6 text-center text-xs text-[#71717A]">
                    Flight coordinates being curated for {trip.origin} ➔ {trip.destination}. Ask Concierge AI for instant live flight bookings.
                  </div>
                )}
              </div>

              {/* Sanctuary Stay Card */}
              <div className="paper-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-5 border border-[#E8E4DA]">
                <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#E8E4DA]">
                  <span className="text-[10px] font-mono uppercase tracking-editorial-mono text-[#A1A1AA]">
                    Accommodations
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-mono tracking-editorial-mono text-[#9A5B43] font-semibold">
                    SUITE GUARANTEED
                  </span>
                </div>

                <h4 className="font-serif text-base sm:text-lg font-normal text-[#151516]">
                  Hotel & Stay Recommendations
                </h4>

                {displayHotels.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {displayHotels.slice(0, 2).map((hotel, idx) => (
                      <div key={hotel.id || idx} className="flex flex-col sm:flex-row gap-3.5 sm:gap-5 items-start paper-inset p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-[#E8E4DA]">
                        <img 
                          src={hotel.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80"} 
                          alt={hotel.name} 
                          className="w-full sm:w-28 h-32 sm:h-28 rounded-xl sm:rounded-2xl object-cover border border-[#E8E4DA] shrink-0"
                        />
                        <div className="space-y-1 sm:space-y-1.5 flex-1">
                          <h5 className="font-serif text-lg sm:text-xl font-normal text-[#151516]">
                            {hotel.name}
                          </h5>
                          <p className="text-xs text-[#525258]">
                            {hotel.neighborhood || `${trip.destination} Sanctuary`}
                          </p>
                          <div className="text-xs font-mono text-[#71717A] pt-0.5 sm:pt-1">
                            {hotel.pricePerNight || '₹12,000/night'} · Courtyard Garden Suite
                          </div>
                          <div className="pt-1.5 sm:pt-2 flex flex-wrap gap-1 sm:gap-1.5">
                            {(hotel.amenities && hotel.amenities.length > 0 ? hotel.amenities : ['Breakfast Included', 'Private Spa']).map((amenity, i) => (
                              <span key={i} className="text-[9px] sm:text-[10px] px-2 sm:px-2.5 py-0.5 rounded-md bg-[#E8E5DD] text-[#38383C]">
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="paper-inset rounded-xl sm:rounded-2xl p-5 sm:p-6 text-center text-xs text-[#71717A]">
                    Sanctuary stays are being surveyed in {trip.destination}. Inquire with Concierge AI to select priority private suites.
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ----------------- TAB PANEL 3: CURATED PACKING & NOTES ----------------- */}
        {currentTab === 'packing' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Sartorial Capsule */}
            <div className="paper-panel rounded-3xl p-6 sm:p-8 space-y-4 border border-[#E8E4DA]">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DA]">
                <h4 className="font-serif text-xl font-normal text-[#151516]">
                  Sartorial Capsule & Microclimate
                </h4>
                <span className="font-mono text-xs text-[#525258]">
                  {activeDay?.weather?.temp || '22°C'} · {activeDay?.weather?.condition || 'Crisp'}
                </span>
              </div>
              <p className="text-xs text-[#525258] font-light leading-relaxed">
                Gentle breezes transitioning into pleasant evenings. We recommend unlined cashmere outerwear, fine gauge merino knitwear, and slip-on leather footwear for effortless cultural exploration.
              </p>
              <div className="pt-2 space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-editorial-mono text-[#A1A1AA] block font-semibold">
                  Recommended Essentials:
                </span>
                <div className="flex flex-wrap gap-2">
                  {['Merino Crewneck', 'Unstructured Linen Blazer', 'Slip-on Loafers', 'UV Protective Sunglasses', 'Silk Scarf'].map((tag, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-lg paper-inset border border-[#E8E4DA] text-[#38383C]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Cultural Etiquette & Quiet Addresses */}
            <div className="paper-panel rounded-3xl p-6 sm:p-8 space-y-4 border border-[#E8E4DA]">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DA]">
                <h4 className="font-serif text-xl font-normal text-[#151516]">
                  Curator Addresses & Etiquette
                </h4>
                <span className="text-[10px] font-mono uppercase tracking-editorial-mono text-[#9A5B43]">
                  CONFIDENTIAL
                </span>
              </div>
              <div className="space-y-3">
                <div className="paper-inset p-3.5 rounded-xl border border-[#E8E4DA]">
                  <span className="font-serif text-sm font-normal text-[#151516] block">
                    Sanctuary Footwear Protocols
                  </span>
                  <span className="text-xs text-[#525258] font-light">
                    Remove footwear when crossing wooden thresholds onto tatami or temple stones.
                  </span>
                </div>
                <div className="paper-inset p-3.5 rounded-xl border border-[#E8E4DA]">
                  <span className="font-serif text-sm font-normal text-[#151516] block">
                    Discreet Dining Manners
                  </span>
                  <span className="text-xs text-[#525258] font-light">
                    Photography is prohibited at chef counters; silence mobile communications upon entry.
                  </span>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Floating Concierge Chat Pill */}
      <button
        onClick={onOpenConciergeChat}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-full bg-[#151516] hover:bg-[#232326] text-white shadow-xl flex items-center space-x-2 sm:space-x-2.5 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border border-white/10"
        title="Open AI Concierge Chat"
      >
        <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400" />
        <span className="font-sans font-medium text-xs pr-0.5 sm:pr-1">Concierge AI</span>
      </button>

      {/* Activity Details Modal */}
      {selectedActivity && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#151516]/60 backdrop-blur-sm"
          onClick={() => setSelectedActivity(null)}
        >
          <div 
            className="paper-panel w-full max-w-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 sm:p-8 border border-[#E8E4DA] shadow-2xl text-[#151516] space-y-4 sm:space-y-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-[#E8E4DA] pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-editorial-mono px-2 py-0.5 rounded bg-[#E8E5DD] text-[#38383C]">
                  {selectedActivity.category}
                </span>
                <h3 className="font-serif text-2xl font-normal text-[#151516] mt-1">
                  {selectedActivity.title}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedActivity(null)}
                className="p-1 rounded-full hover:bg-[#E8E5DD] text-[#71717A] hover:text-[#151516]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#525258] font-light leading-relaxed">
              {selectedActivity.description}
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs pt-2">
              <div className="paper-inset p-3 rounded-xl border border-[#E8E4DA]">
                <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">Time Slot</span>
                <span className="font-semibold text-[#151516]">{selectedActivity.time}</span>
              </div>
              <div className="paper-inset p-3 rounded-xl border border-[#E8E4DA]">
                <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">Estimated Cost</span>
                <span className="font-semibold text-[#151516]">{selectedActivity.estimatedCost}</span>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                onClick={() => setSelectedActivity(null)}
                className="px-5 py-2.5 rounded-full bg-[#151516] text-white text-xs font-medium hover:bg-[#232326] transition"
              >
                Close Dossier Note
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
