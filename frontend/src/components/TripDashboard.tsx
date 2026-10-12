import React, { useState, useRef } from 'react';
import { 
  Globe, 
  Search, 
  ArrowRight, 
  Bookmark, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  MessageSquare,
  Sparkles,
  LogOut,
  X,
  Trash2
} from 'lucide-react';
import type { TripState, UserProfile } from '../types';
import { getTripTheme, getDestinationBackgroundImage, formatLocationName, capitalizeWords } from '../utils/themeUtils';

interface TripDashboardProps {
  user: UserProfile;
  trips: TripState[];
  activeTrip: TripState | null;
  onSelectTrip: (trip: TripState) => void;
  onExploreTrip: (trip: TripState) => void;
  onOpenCreateModal: () => void;
  onOpenConciergeChat: () => void;
  onLogout: () => void;
  onBookmarkTrip: (tripId: string) => void;
  onDeleteTrip: (tripId: string) => void;
}

export const TripDashboard: React.FC<TripDashboardProps> = ({
  user,
  trips,
  activeTrip,
  onSelectTrip,
  onExploreTrip,
  onOpenCreateModal,
  onOpenConciergeChat,
  onLogout,
  onBookmarkTrip,
  onDeleteTrip
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'past' | 'bookmarked'>('all');
  
  // Drag to scroll state
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  // Filtered trips list
  const todayStr = new Date().toISOString().split('T')[0];

  const filteredTrips = trips.filter((t) => {
    const matchesSearch = t.destination.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.country.toLowerCase().includes(searchQuery.toLowerCase());
    
    const isPastByDate = Boolean(t.end_date && t.end_date < todayStr);
    const isPast = t.status === 'past' || isPastByDate;
    const isActive = t.status === 'active' && !isPastByDate;

    if (activeFilter === 'bookmarked') return matchesSearch && t.isBookmarked;
    if (activeFilter === 'active') return matchesSearch && isActive;
    if (activeFilter === 'past') return matchesSearch && isPast;
    return matchesSearch;
  });

  const displayTrip = (activeTrip && filteredTrips.some(t => t.id === activeTrip.id))
    ? activeTrip 
    : (filteredTrips.length > 0 ? filteredTrips[0] : (trips.length > 0 ? trips[0] : null));

  const getCleanSummary = (text?: string, destination?: string) => {
    if (!text) return `${destination || 'Destination'} is blessed with pristine landscapes, luxury retreats, fine dining, and curated local immersion.`;
    
    // Strip out any appended flight or hotel bullet strings
    const clean = text
      .replace(/\[?(?:Outbound|Return Flight|Flight Options|Hotels?)[\s\S]*$/i, '')
      .replace(/^#+.*$/gm, '')
      .replace(/[\*\-•#_~]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!clean || clean.length < 20 || /^(BOM|DEL|DPS|BLR)\b/i.test(clean)) {
      return `${destination || 'Destination'} is blessed with pristine landscapes, luxury retreats, fine dining, and curated local immersion.`;
    }

    if (clean.length > 220) {
      return clean.substring(0, 215) + '...';
    }
    return clean;
  };

  // Button Scroll Handlers
  const handleScrollNext = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 280, behavior: 'smooth' });
    }
  };

  const handleScrollPrev = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -280, behavior: 'smooth' });
    }
  };

  // Mouse Drag Handlers for horizontal carousel
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeftState(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeftState - walk;
  };

  // Mouse Wheel Horizontal Scroll Handler
  const handleWheelScroll = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollContainerRef.current) {
      if (e.deltaY !== 0) {
        scrollContainerRef.current.scrollLeft += e.deltaY * 1.2;
      }
    }
  };

  return (
    <div className="relative min-h-screen w-screen bg-[#F8FAFC] text-slate-900 font-sans overflow-x-hidden flex flex-col justify-between selection:bg-rose-500/20">
      
      {/* 1. Immersive Full-Screen Background Image with Light Gradient Wash */}
      <div className="fixed inset-0 z-0 pointer-events-none transition-all duration-700">
        {displayTrip ? (
          <img
            src={displayTrip.bgImage || getDestinationBackgroundImage(displayTrip.destination)}
            alt={displayTrip.destination}
            className="w-full h-full object-cover object-center filter brightness-[0.98] contrast-[1.05] opacity-90 transition-all duration-700"
            onError={(e) => {
              e.currentTarget.src = getDestinationBackgroundImage(displayTrip.destination);
            }}
          />
        ) : (
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=90"
            alt="Default Background"
            className="w-full h-full object-cover object-center filter brightness-[0.98] opacity-85"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#F8FAFC]/95 via-[#F8FAFC]/25 to-transparent transition-all duration-700" />
      </div>

      {/* 2. Top Header Navigation Bar */}
      <header className="relative z-20 px-8 py-6 flex items-center justify-between">
        
        {/* Left: Brand Logo & ODYSSEY AI Title */}
        <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => displayTrip && onExploreTrip(displayTrip)}>
          <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 shadow-sm flex items-center justify-center text-rose-500 group-hover:scale-105 transition-transform duration-300">
            <Globe className="w-5 h-5 animate-pulse text-rose-500" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900 uppercase group-hover:text-rose-600 transition-colors duration-300">
            ODYSSEY <span className="text-rose-500">AI</span>
          </span>
        </div>

        {/* Center: Interactive Nav Filter Buttons (Frosted White Pills) */}
        <nav className="hidden md:flex items-center space-x-1 text-xs font-semibold text-slate-600 bg-white/80 p-1 rounded-full border border-slate-200/90 shadow-sm backdrop-blur-xl">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-1.5 rounded-full transition-all duration-300 ${
              activeFilter === 'all' ? 'bg-rose-500 text-white font-bold shadow-md shadow-rose-500/20' : 'hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            All Journeys
          </button>
          <button
            onClick={() => setActiveFilter('active')}
            className={`px-4 py-1.5 rounded-full transition-all duration-300 ${
              activeFilter === 'active' ? 'bg-rose-500 text-white font-bold shadow-md shadow-rose-500/20' : 'hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            Active Trips
          </button>
          <button
            onClick={() => setActiveFilter('past')}
            className={`px-4 py-1.5 rounded-full transition-all duration-300 ${
              activeFilter === 'past' ? 'bg-rose-500 text-white font-bold shadow-md shadow-rose-500/20' : 'hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            Past Trips
          </button>
          <button
            onClick={() => setActiveFilter('bookmarked')}
            className={`px-4 py-1.5 rounded-full transition-all duration-300 ${
              activeFilter === 'bookmarked' ? 'bg-rose-500 text-white font-bold shadow-md shadow-rose-500/20' : 'hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            Saved Stays
          </button>
        </nav>

        {/* Right: Search & User Greeting */}
        <div className="flex items-center space-x-4">
          
          {/* Search Trigger */}
          <div className="relative">
            {isSearchOpen ? (
              <div className="flex items-center bg-white/95 shadow-sm rounded-full px-3 py-1.5 border border-slate-200/90">
                <Search className="w-3.5 h-3.5 text-slate-400 mr-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search destination..."
                  autoFocus
                  className="bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none w-36"
                />
                <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} className="ml-1 text-slate-400 hover:text-slate-700">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="w-10 h-10 rounded-full bg-white/80 hover:bg-white border border-slate-200/90 hover:border-slate-300 flex items-center justify-center text-slate-700 transition-all duration-300 shadow-sm hover:scale-105"
                title="Search Journeys"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* User Greeting */}
          <div className="flex items-center space-x-3">
            <span className="text-xs font-semibold text-slate-800">
              Hello, {user.name} !
            </span>
            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-2 rounded-xl bg-white/80 hover:bg-white border border-slate-200/90 text-slate-600 hover:text-slate-900 shadow-sm transition-colors duration-300"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </header>

      {/* 3. Main Center Layout */}
      <main className="relative z-10 px-8 py-4 flex-1 flex flex-col justify-between">
        
        {filteredTrips.length === 0 ? (
          /* Empty State: Shows Large + Icon to create a trip */
          <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6">
            <button
              onClick={onOpenCreateModal}
              className="w-24 h-24 rounded-full bg-rose-50 border-2 border-dashed border-rose-300 flex items-center justify-center text-rose-500 hover:bg-rose-100/80 hover:scale-105 transition-all duration-300 shadow-lg group"
            >
              <Plus className="w-10 h-10 group-hover:rotate-90 transition-transform duration-300" />
            </button>

            <div>
              <h2 className="font-bold text-3xl text-slate-900 mb-2">
                No Journeys Found
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                You have no trips matching your current filter. Click the <strong>+ icon</strong> above to create a new trip or select another filter tab.
              </p>
            </div>

            <button
              onClick={onOpenCreateModal}
              className="px-6 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-xl shadow-rose-500/25 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>Create New Trip</span>
            </button>
          </div>
        ) : (
          /* Active Trips Showcase */
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-slide-up">
            
            {/* Left Hero Text (Cols 1-6) */}
            <div className="lg:col-span-6 flex items-start space-x-6">
              
              {/* Vertical Step Line */}
              <div className="hidden sm:flex flex-col items-center space-y-4 text-xs font-mono text-slate-400 pt-6">
                <span className="font-bold text-slate-800">1</span>
                <div className="w-0.5 h-16 bg-slate-200 relative rounded-full overflow-hidden">
                  <div className="w-0.5 bg-rose-500 h-full" />
                </div>
                <span className="text-[10px]">01/0{filteredTrips.length}</span>
              </div>

              {/* Destination Text Block inside Frosted Card */}
              <div className="bg-white/85 backdrop-blur-2xl border border-white/90 shadow-[0_20px_50px_rgba(15,23,42,0.06)] rounded-3xl p-8 sm:p-10 space-y-6 max-w-xl transition-all duration-500">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest block mb-1 text-rose-600">
                    {displayTrip?.country && displayTrip.country.toLowerCase() !== displayTrip.destination.toLowerCase() ? capitalizeWords(displayTrip.country) : 'India'} • {displayTrip?.start_date}
                  </span>
                  <h1 className="font-extrabold text-5xl sm:text-6xl md:text-7xl tracking-tight text-slate-900 uppercase leading-none">
                    {capitalizeWords(displayTrip?.destination)}
                  </h1>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal max-w-md">
                  {getCleanSummary(displayTrip?.description, displayTrip?.destination)}
                </p>

                {/* Explore CTA Button */}
                <button
                  onClick={() => displayTrip && onExploreTrip(displayTrip)}
                  className="px-8 py-4 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-sm shadow-xl shadow-rose-500/25 hover:scale-105 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 flex items-center space-x-3 group cursor-pointer"
                >
                  <span>Explore</span>
                  <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>

            </div>

            {/* Right Cards Deck (Cols 7-12) */}
            <div className="lg:col-span-6 flex flex-col items-end space-y-4 w-full overflow-hidden">
              
              {/* Scrollable Carousel Container */}
              <div
                ref={scrollContainerRef}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onWheel={handleWheelScroll}
                className="flex items-center space-x-5 overflow-x-auto scroll-smooth no-scrollbar w-full py-4 px-2 justify-start cursor-grab active:cursor-grabbing select-none"
              >
                
                {/* Add New Trip Pill */}
                <div
                  onClick={onOpenCreateModal}
                  className="min-w-[140px] h-[360px] rounded-3xl bg-white/80 hover:bg-white backdrop-blur-md border border-slate-200/90 hover:border-rose-300 flex flex-col items-center justify-center text-slate-800 cursor-pointer hover:scale-105 hover:-translate-y-1 transition-all duration-300 shrink-0 group shadow-md hover:shadow-xl"
                >
                  <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 mb-3 group-hover:rotate-90 transition-transform duration-500">
                    <Plus className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-center px-2 text-slate-800">Add New Trip</span>
                </div>

                {/* Trip Cards */}
                {filteredTrips.map((tripItem) => {
                  const isActive = displayTrip && tripItem.id === displayTrip.id;
                  const itemTheme = getTripTheme(tripItem.destination, tripItem.country);
                  return (
                    <div
                      key={tripItem.id}
                      onClick={() => onSelectTrip(tripItem)}
                      className={`group relative min-w-[220px] max-w-[240px] h-[360px] rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 ease-out shrink-0 border ${
                        isActive
                          ? 'border-2 border-rose-500 shadow-xl shadow-rose-500/20 ring-2 ring-rose-400/30 scale-105 z-10'
                          : 'border-slate-200/80 shadow-md hover:-translate-y-1.5 hover:border-slate-300 hover:shadow-2xl'
                      }`}
                    >
                      {/* Background Card Image with Smooth Zoom on Hover */}
                      <img
                        src={tripItem.bgImage || getDestinationBackgroundImage(tripItem.destination)}
                        alt={tripItem.destination}
                        className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                        onError={(e) => {
                          e.currentTarget.src = getDestinationBackgroundImage(tripItem.destination);
                        }}
                      />

                      {/* Smooth Dark Gradient Overlay for legible card text */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                        {isActive ? (
                          <div className={`px-2.5 py-1 rounded-full ${itemTheme.badgeBg} backdrop-blur-md text-[9px] font-bold tracking-widest uppercase ${itemTheme.badgeText} flex items-center space-x-1.5 shadow-md`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                            <span>ACTIVE</span>
                          </div>
                        ) : <div />}

                        <div className="flex items-center space-x-1.5">
                          {/* Delete Trip Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Are you sure you want to delete the itinerary for ${tripItem.destination}?`)) {
                                onDeleteTrip(tripItem.id);
                              }
                            }}
                            className="w-8 h-8 rounded-full flex items-center justify-center bg-black/30 hover:bg-rose-500 text-white backdrop-blur-md transition-all duration-300"
                            title="Delete Itinerary"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-white" />
                          </button>

                          {/* Bookmark Icon Button Top Right */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onBookmarkTrip(tripItem.id);
                            }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 ${
                              tripItem.isBookmarked
                                ? 'bg-white/40 text-white border border-white/50 shadow-md'
                                : 'bg-black/30 text-white hover:bg-white/30'
                            }`}
                            title="Bookmark"
                          >
                            <Bookmark className="w-3.5 h-3.5 fill-current text-white" />
                          </button>
                        </div>
                      </div>

                      {/* Card Bottom Content */}
                      <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                        <div className="flex space-x-1 text-rose-400 mb-1 text-[10px]">
                          <span>•••••</span>
                        </div>
                        <h4 className="font-bold text-lg leading-tight truncate group-hover:text-rose-200 transition-colors duration-300">
                          {formatLocationName(tripItem.destination, tripItem.country)}
                        </h4>
                        <span className="text-[10px] text-slate-300 block">
                          {tripItem.start_date}
                        </span>
                      </div>
                    </div>
                  );
                })}

              </div>

              {/* Working Carousel Navigation Controls */}
              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={handleScrollPrev}
                  className="w-10 h-10 rounded-full bg-white/90 hover:bg-white border border-slate-200/90 hover:border-slate-300 flex items-center justify-center text-slate-700 transition-all duration-300 shadow-sm active:scale-95"
                  title="Scroll Left"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleScrollNext}
                  className="w-10 h-10 rounded-full bg-white/90 hover:bg-white border border-slate-200/90 hover:border-slate-300 flex items-center justify-center text-slate-700 transition-all duration-300 shadow-sm active:scale-95"
                  title="Scroll Right"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* 4. Bottom Footer Ribbon + Floating Concierge Launcher */}
      <footer className="relative z-20 px-8 py-4 flex items-center justify-between text-[11px] text-slate-600 bg-white/85 backdrop-blur-md border-t border-slate-200/90 shadow-sm">
        <div className="flex items-center space-x-4 font-mono font-medium">
          <span>01 / 04</span>
          <span>•</span>
          <span>ODYSSEY AI Concierge Engine</span>
        </div>

        {/* Floating Concierge Button */}
        <button
          onClick={onOpenConciergeChat}
          className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-white/95 hover:bg-white border border-slate-200/90 text-slate-900 shadow-[0_15px_35px_rgba(15,23,42,0.12)] hover:shadow-[0_20px_45px_rgba(244,63,94,0.2)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center space-x-2 group cursor-pointer"
          title="Open AI Concierge Chat"
        >
          <MessageSquare className="w-5 h-5 text-rose-500 group-hover:scale-110 transition-transform duration-300" />
          <span className="font-bold text-xs pr-1">Concierge AI</span>
        </button>
      </footer>

    </div>
  );
};



