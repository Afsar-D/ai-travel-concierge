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
  X
} from 'lucide-react';
import type { TripState, UserProfile } from '../types';
import { getTripTheme } from '../utils/themeUtils';

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
  onBookmarkTrip
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
  const filteredTrips = trips.filter((t) => {
    const matchesSearch = t.destination.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.country.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeFilter === 'bookmarked') return matchesSearch && t.isBookmarked;
    if (activeFilter === 'active') return matchesSearch && t.status === 'active';
    if (activeFilter === 'past') return matchesSearch && t.status === 'past';
    return matchesSearch;
  });

  const displayTrip = (activeTrip && filteredTrips.some(t => t.id === activeTrip.id))
    ? activeTrip 
    : (filteredTrips.length > 0 ? filteredTrips[0] : (trips.length > 0 ? trips[0] : null));

  // Dynamic Theme Palette for currently displayed trip
  const activeTheme = getTripTheme(displayTrip?.destination, displayTrip?.country);

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
    <div className="relative min-h-screen w-screen bg-[#080B11] text-white font-sans overflow-x-hidden flex flex-col justify-between selection:bg-white/20">
      
      {/* 1. Immersive Full-Screen Background Image with Dynamic Trip Gradient Overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none transition-all duration-700">
        {displayTrip ? (
          <img
            src={displayTrip.bgImage}
            alt={displayTrip.destination}
            className="w-full h-full object-cover object-center filter brightness-[0.55] contrast-[1.05] transition-all duration-700"
          />
        ) : (
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=90"
            alt="Default Background"
            className="w-full h-full object-cover object-center filter brightness-50"
          />
        )}
        <div className={`absolute inset-0 bg-gradient-to-t ${activeTheme.glowBg} transition-all duration-700`} />
      </div>

      {/* 2. Top Header Navigation Bar */}
      <header className="relative z-20 px-8 py-6 flex items-center justify-between">
        
        {/* Left: Brand Logo & ODYSSEY AI Title */}
        <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => displayTrip && onExploreTrip(displayTrip)}>
          <div className={`w-10 h-10 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center ${activeTheme.iconColor} shadow-lg group-hover:scale-105 transition-transform duration-300`}>
            <Globe className="w-5 h-5 animate-pulse" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white uppercase group-hover:text-white transition-colors duration-300">
            ODYSSEY <span className={activeTheme.badgeText}>AI</span>
          </span>
        </div>

        {/* Center: Interactive Nav Filter Buttons (Translucent Glass Pills) */}
        <nav className="hidden md:flex items-center space-x-1 text-xs font-semibold text-slate-300 bg-white/5 p-1 rounded-full border border-white/10 backdrop-blur-xl">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-1.5 rounded-full transition-all duration-300 ${
              activeFilter === 'all' ? 'bg-white/20 text-white font-bold border border-white/20 shadow-md backdrop-blur-md' : 'hover:text-white hover:bg-white/10'
            }`}
          >
            All Journeys
          </button>
          <button
            onClick={() => setActiveFilter('active')}
            className={`px-4 py-1.5 rounded-full transition-all duration-300 ${
              activeFilter === 'active' ? 'bg-white/20 text-white font-bold border border-white/20 shadow-md backdrop-blur-md' : 'hover:text-white hover:bg-white/10'
            }`}
          >
            Active Trips
          </button>
          <button
            onClick={() => setActiveFilter('past')}
            className={`px-4 py-1.5 rounded-full transition-all duration-300 ${
              activeFilter === 'past' ? 'bg-white/20 text-white font-bold border border-white/20 shadow-md backdrop-blur-md' : 'hover:text-white hover:bg-white/10'
            }`}
          >
            Past Trips
          </button>
          <button
            onClick={() => setActiveFilter('bookmarked')}
            className={`px-4 py-1.5 rounded-full transition-all duration-300 ${
              activeFilter === 'bookmarked' ? 'bg-white/20 text-white font-bold border border-white/20 shadow-md backdrop-blur-md' : 'hover:text-white hover:bg-white/10'
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
              <div className="flex items-center bg-white/15 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/20">
                <Search className="w-3.5 h-3.5 text-slate-300 mr-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search destination..."
                  autoFocus
                  className="bg-transparent text-xs text-white placeholder:text-slate-400 focus:outline-none w-36"
                />
                <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} className="ml-1 text-slate-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/10 hover:border-white/30 flex items-center justify-center text-white transition-all duration-300 shadow-md hover:scale-105"
                title="Search Journeys"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* User Greeting */}
          <div className="flex items-center space-x-3">
            <span className="text-xs font-semibold text-white">
              Hello, {user.name} !
            </span>
            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-slate-300 hover:text-white transition-colors duration-300"
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
              className="w-24 h-24 rounded-full bg-white/10 border-2 border-dashed border-[#D4B886] flex items-center justify-center text-[#D4B886] hover:bg-white/20 hover:scale-105 transition-all duration-300 shadow-2xl group"
            >
              <Plus className="w-10 h-10 group-hover:rotate-90 transition-transform duration-300" />
            </button>

            <div>
              <h2 className="font-bold text-3xl text-white mb-2">
                No Journeys Found
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                You have no trips matching your current filter. Click the <strong>+ icon</strong> above to create a new trip or select another filter tab.
              </p>
            </div>

            <button
              onClick={onOpenCreateModal}
              className="px-6 py-3 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-bold text-xs shadow-xl backdrop-blur-xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-[#D4B886]" />
              <span>Create New Trip</span>
            </button>
          </div>
        ) : (
          /* Active Trips Showcase */
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-slide-up">
            
            {/* Left Hero Text (Cols 1-6) */}
            <div className="lg:col-span-6 flex items-start space-x-6">
              
              {/* Vertical Step Line */}
              <div className="hidden sm:flex flex-col items-center space-y-4 text-xs font-mono text-slate-400">
                <span className="font-bold text-white">1</span>
                <div className="w-0.5 h-16 bg-white/20 relative rounded-full overflow-hidden">
                  <div className={`w-0.5 ${activeTheme.badgeBg} h-full`} />
                </div>
                <span className="text-[10px]">01/0{filteredTrips.length}</span>
              </div>

              {/* Destination Text Block */}
              <div className="space-y-6 max-w-xl">
                <div>
                  <span className={`text-xs font-bold uppercase tracking-widest block mb-1 ${activeTheme.badgeText}`}>
                    {displayTrip?.country} • {displayTrip?.start_date}
                  </span>
                  <h1 className="font-extrabold text-5xl sm:text-7xl md:text-8xl tracking-tight text-white uppercase leading-none drop-shadow-md">
                    {displayTrip?.destination}
                  </h1>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal opacity-90 max-w-md">
                  {displayTrip?.description}
                </p>

                {/* Explore CTA Button - Dynamic Theme Solid Luxury Button */}
                <button
                  onClick={() => displayTrip && onExploreTrip(displayTrip)}
                  className={`px-8 py-4 rounded-2xl ${activeTheme.buttonAccent} font-extrabold text-sm shadow-2xl hover:scale-105 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 flex items-center space-x-3 group cursor-pointer`}
                >
                  <span>Explore</span>
                  <ArrowRight className="w-4 h-4 text-inherit group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>

            </div>

            {/* Right Cards Deck with Optimized Border & Dynamic Trip Theme (Cols 7-12) */}
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
                  className="min-w-[140px] h-[360px] rounded-3xl bg-white/5 hover:bg-white/15 backdrop-blur-md border border-white/15 hover:border-white/30 flex flex-col items-center justify-center text-white cursor-pointer hover:scale-105 hover:-translate-y-1 transition-all duration-300 shrink-0 group shadow-xl"
                >
                  <div className={`w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center ${activeTheme.iconColor} mb-3 group-hover:rotate-90 transition-transform duration-500`}>
                    <Plus className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-center px-2">Add New Trip</span>
                </div>

                {/* Trip Cards (Dynamic Color Theme Per Trip) */}
                {filteredTrips.map((tripItem) => {
                  const isActive = displayTrip && tripItem.id === displayTrip.id;
                  const itemTheme = getTripTheme(tripItem.destination, tripItem.country);
                  return (
                    <div
                      key={tripItem.id}
                      onClick={() => onSelectTrip(tripItem)}
                      className={`group relative min-w-[220px] max-w-[240px] h-[360px] rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 ease-out shrink-0 border ${
                        isActive
                          ? `${itemTheme.activeBorder} scale-105 z-10 bg-white/10 backdrop-blur-md`
                          : 'border-white/10 opacity-75 hover:opacity-100 hover:-translate-y-1.5 hover:border-white/30 hover:shadow-2xl'
                      }`}
                    >
                      {/* Background Card Image with Smooth Zoom on Hover */}
                      <img
                        src={tripItem.bgImage}
                        alt={tripItem.destination}
                        className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                      />

                      {/* Smooth Dark Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                        {isActive ? (
                          <div className={`px-2.5 py-1 rounded-full ${itemTheme.badgeBg} backdrop-blur-md text-[9px] font-bold tracking-widest uppercase ${itemTheme.badgeText} flex items-center space-x-1.5 shadow-md`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${itemTheme.badgeBg} animate-pulse`} />
                            <span>ACTIVE</span>
                          </div>
                        ) : <div />}

                        {/* Bookmark Icon Button Top Right */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onBookmarkTrip(tripItem.id);
                          }}
                          className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 ${
                            tripItem.isBookmarked
                              ? 'bg-white/30 text-white border border-white/40 shadow-md'
                              : 'bg-white/10 text-white hover:bg-white/30 border border-white/10'
                          }`}
                        >
                          <Bookmark className="w-3.5 h-3.5 fill-current text-white" />
                        </button>
                      </div>

                      {/* Card Bottom Content */}
                      <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                        <div className={`flex space-x-1 ${itemTheme.badgeText} mb-1 text-[10px]`}>
                          <span>•••••</span>
                        </div>
                        <h4 className="font-bold text-lg leading-tight truncate group-hover:text-white transition-colors duration-300">
                          {tripItem.destination}, {tripItem.country}
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
                  className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/10 hover:border-white/30 flex items-center justify-center text-white transition-all duration-300 shadow-md active:scale-95"
                  title="Scroll Left"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleScrollNext}
                  className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/10 hover:border-white/30 flex items-center justify-center text-white transition-all duration-300 shadow-md active:scale-95"
                  title="Scroll Right"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* 4. Bottom Footer Ribbon + Translucent Floating Concierge Launcher */}
      <footer className="relative z-20 px-8 py-4 flex items-center justify-between text-[11px] text-slate-400 border-t border-white/10 backdrop-blur-sm">
        <div className="flex items-center space-x-4 font-mono">
          <span>01 / 04</span>
          <span>•</span>
          <span>ODYSSEY AI Concierge Engine</span>
        </div>

        {/* Floating Concierge Glass Icon Button */}
        <button
          onClick={onOpenConciergeChat}
          className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-slate-900/85 hover:bg-slate-900 border border-white/20 backdrop-blur-2xl text-white shadow-[0_20px_50px_rgba(0,0,0,0.8)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center space-x-2 group"
          title="Open AI Concierge Chat"
        >
          <MessageSquare className="w-5 h-5 text-[#D4B886] group-hover:scale-110 transition-transform duration-300" />
          <span className="font-bold text-xs pr-1">Concierge AI</span>
        </button>
      </footer>

    </div>
  );
};



