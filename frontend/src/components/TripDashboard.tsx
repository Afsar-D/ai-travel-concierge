import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Plus, 
  Trash2, 
  Bookmark, 
  LogOut, 
  Search, 
  X,
  Compass,
  MessageSquare
} from 'lucide-react';
import type { TripState, UserProfile } from '../types';
import { getDestinationBackgroundImage, resolveDestinationCountry, getWelcomeMessage } from '../utils/themeUtils';

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
  onDeleteTrip,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'upcoming' | 'bookmarked'>(() => {
    try {
      const saved = localStorage.getItem('laughtale_filter_status');
      if (saved && ['all', 'active', 'upcoming', 'bookmarked'].includes(saved)) {
        return saved as any;
      }
    } catch {}
    return 'all';
  });

  const handleFilterChange = (status: 'all' | 'active' | 'upcoming' | 'bookmarked') => {
    setFilterStatus(status);
    try {
      localStorage.setItem('laughtale_filter_status', status);
    } catch {}
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [systemTimeStr, setSystemTimeStr] = useState<string>('');

  // Live system clock from demo.html
  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const formatted = new Intl.DateTimeFormat([], {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).format(now);
        setSystemTimeStr(`${formatted} · Global JST`);
      } catch {
        setSystemTimeStr('Live Travel Dispatch');
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 15000);
    return () => clearInterval(interval);
  }, []);

  // Filter calculations
  // User Avatar preference: man.svg or woman.svg
  const [currentAvatar, setCurrentAvatar] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(`laughtale_avatar_${user.email}`);
      if (saved) return saved;
      if (user.avatar && (user.avatar.includes('man') || user.avatar.includes('woman'))) return user.avatar;
    } catch {}
    return '/man.svg';
  });

  const toggleAvatar = () => {
    const next = currentAvatar === '/man.svg' ? '/woman.svg' : '/man.svg';
    setCurrentAvatar(next);
    try {
      localStorage.setItem(`laughtale_avatar_${user.email}`, next);
      const storedUser = localStorage.getItem('laughtale_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        parsed.avatar = next;
        localStorage.setItem('laughtale_user', JSON.stringify(parsed));
      }
    } catch {}
  };
  const filteredTrips = trips.filter(trip => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        trip.destination.toLowerCase().includes(q) ||
        (trip.country && trip.country.toLowerCase().includes(q)) ||
        (trip.description && trip.description.toLowerCase().includes(q));
      if (!match) return false;
    }

    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return trip.status === 'active';
    if (filterStatus === 'upcoming') {
      const isPast = trip.end_date ? new Date(trip.end_date) < new Date() : false;
      return !isPast && trip.status !== 'past';
    }
    if (filterStatus === 'bookmarked') return !!trip.isBookmarked;
    return true;
  });

  const activeCount = trips.filter(t => t.status === 'active').length;
  const upcomingCount = trips.filter(t => t.status !== 'past').length;
  const bookmarkedCount = trips.filter(t => !!t.isBookmarked).length;

  const activeBg = activeTrip?.bgImage || (trips[0] ? (trips[0].bgImage || getDestinationBackgroundImage(trips[0].destination)) : "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=2600&q=85");

  return (
    <div className="relative min-h-screen w-screen bg-[#FAF9F6] text-[#151516] font-sans antialiased selection:bg-[#EBE7DC] selection:text-[#151516] overflow-x-hidden">
      
      {/* ================= 1. AMBIENT PHOTOGRAPHY BACKDROP (SHARED CROSSFADE) ================= */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeBg}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 bg-cover bg-center bg-scale-subtle"
            style={{ backgroundImage: `url('${activeBg}')` }}
          />
        </AnimatePresence>

        {/* Cinematic Scrim: Gentle darkening at top for header contrast, lighter translucent linen below to maximize background visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#151516]/50 via-[#FAF9F6]/25 to-[#FAF9F6]/80" />
      </div>

      {/* ================= 2. TOP EDITORIAL NAVIGATION BAR ================= */}
      <header className="relative z-30 w-full px-4 sm:px-8 pt-5 pb-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Brand Monogram & Moniker */}
          <div className="flex items-center gap-6">
            <div className="flex items-center space-x-2.5 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center p-1.5 shadow-sm">
                <img src="/travel.svg" alt="Laugh Tale" className="w-full h-full object-contain" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-sans text-xs font-bold tracking-[0.28em] uppercase text-white drop-shadow-sm">
                  Laugh Tale
                </span>
                <span className="font-serif italic text-white/75 text-xs hidden sm:inline tracking-normal">
                  // private dossier
                </span>
              </div>
            </div>

            <span className="w-[1px] h-4 bg-white/25 hidden md:block" />

            {/* Primary Top Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1 text-xs">
              <button 
                onClick={() => setFilterStatus('all')}
                className="px-3.5 py-1.5 rounded-full text-white font-medium bg-white/20 backdrop-blur-md transition shadow-sm cursor-pointer"
              >
                Journeys
              </button>
              <button 
                onClick={onOpenConciergeChat}
                className="px-3.5 py-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer flex items-center space-x-1.5"
              >
                <Compass className="w-3.5 h-3.5 text-sky-300" />
                <span>Concierge AI</span>
              </button>
            </nav>
          </div>

          {/* Right: Ambient Time, Commission CTA & Member Profile */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Live System Date/Time Pill */}
            <div className="hidden lg:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#151516]/40 backdrop-blur-md border border-white/20 text-white text-[11px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{systemTimeStr}</span>
            </div>

            {/* Mobile Concierge AI Trigger */}
            <button
              onClick={onOpenConciergeChat}
              className="md:hidden w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 border border-white/25 flex items-center justify-center text-white transition cursor-pointer"
              title="Concierge AI"
              aria-label="Open Concierge AI"
            >
              <Compass className="w-3.5 h-3.5 text-sky-300" />
            </button>

            {/* Search Input Toggle */}
            <div className="relative">
              {isSearchOpen ? (
                <motion.div 
                  initial={{ opacity: 0, width: 110 }}
                  animate={{ opacity: 1, width: 170 }}
                  className="flex items-center px-3 py-1.5 rounded-full bg-white text-[#151516] shadow-sm border border-[#E8E4DA]"
                >
                  <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full bg-transparent text-xs text-[#151516] placeholder:text-slate-400 focus:outline-none"
                    autoFocus
                  />
                  <button 
                    onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                    className="ml-1 text-slate-400 hover:text-[#151516]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 border border-white/25 flex items-center justify-center text-white transition cursor-pointer"
                  title="Search Journeys"
                  aria-label="Search Journeys"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Commission New Journey Button */}
            <button 
              onClick={onOpenCreateModal} 
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white text-[#151516] hover:bg-[#F4F1EA] text-[11px] sm:text-xs font-medium shadow-sm transition duration-200 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-sky-600" />
              <span className="hidden sm:inline">Commission Journey</span>
              <span className="sm:hidden">New</span>
            </button>

            {/* User Profile Avatar & Sign Out */}
            <div className="flex items-center space-x-2 pl-1 border-l border-white/20">
              <button 
                type="button"
                onClick={toggleAvatar}
                className="w-8 h-8 rounded-full border border-white/40 overflow-hidden ring-1 ring-black/5 flex items-center justify-center bg-white/20 hover:bg-white/30 hover:border-white/70 transition-all duration-200 cursor-pointer shadow-sm relative group p-0.5"
                title={`Member: ${user.name} (${currentAvatar.includes('woman') ? 'Lady' : 'Gentleman'} · Click to switch avatar)`}
                aria-label="Toggle profile avatar"
              >
                <img 
                  src={currentAvatar} 
                  alt={user.name} 
                  className="w-full h-full object-cover rounded-full" 
                />
              </button>

              <button
                onClick={onLogout}
                title="Sign Out"
                aria-label="Sign Out"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-rose-500/20 border border-white/20 hover:border-rose-400/30 text-white hover:text-rose-200 flex items-center justify-center transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>
      </header>

      {/* ================= 3. EDITORIAL HERO & DOSSIER FILTER SECTION ================= */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 pt-4 pb-20">
        
        {/* Editorial Heading Strip */}
        <div className="pt-4 sm:pt-8 pb-8 sm:pb-12 border-b border-[#E8E4DA]/80">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-mono tracking-editorial-mono uppercase text-white/90 bg-[#151516]/45 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/15">
                  Personal Archive // 2026–2027
                </span>
                <span className="text-xs font-serif italic text-white/80 hidden sm:inline">
                  — {trips.length} bespoke {trips.length === 1 ? 'dossier' : 'dossiers'} cataloged
                </span>
              </div>
              <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl text-white font-normal tracking-tight leading-none drop-shadow-sm">
                Curated Journeys
              </h1>
              <p className="mt-3 text-xs sm:text-sm text-white/90 font-light max-w-xl leading-relaxed drop-shadow-sm">
                Select an active or upcoming expedition to inspect the day-by-day chronology, private atelier reservations, transit boarding documents, and on-ground AI concierge.
              </p>
            </div>

            {/* Filter Chips Strip from demo.html with mobile horizontal scroll */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
              <button 
                onClick={() => handleFilterChange('all')}
                className={`px-3 sm:px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-medium transition cursor-pointer shrink-0 whitespace-nowrap ${
                  filterStatus === 'all'
                    ? 'bg-[#151516] text-white shadow-sm'
                    : 'paper-panel text-[#525258] hover:text-[#151516]'
                }`}
              >
                All Journeys ({trips.length})
              </button>
              <button 
                onClick={() => handleFilterChange('active')}
                className={`px-3 sm:px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-medium transition cursor-pointer shrink-0 whitespace-nowrap ${
                  filterStatus === 'active'
                    ? 'bg-[#151516] text-white shadow-sm'
                    : 'paper-panel text-[#525258] hover:text-[#151516]'
                }`}
              >
                Active Now ({activeCount})
              </button>
              <button 
                onClick={() => handleFilterChange('upcoming')}
                className={`px-3 sm:px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-medium transition cursor-pointer shrink-0 whitespace-nowrap ${
                  filterStatus === 'upcoming'
                    ? 'bg-[#151516] text-white shadow-sm'
                    : 'paper-panel text-[#525258] hover:text-[#151516]'
                }`}
              >
                Upcoming ({upcomingCount})
              </button>
              <button 
                onClick={() => handleFilterChange('bookmarked')}
                className={`px-3 sm:px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-medium transition cursor-pointer shrink-0 whitespace-nowrap ${
                  filterStatus === 'bookmarked'
                    ? 'bg-[#151516] text-white shadow-sm'
                    : 'paper-panel text-[#525258] hover:text-[#151516]'
                }`}
              >
                Saved Stays ({bookmarkedCount})
              </button>
            </div>
          </div>
        </div>

        {/* ================= 4. PORTFOLIO ARCHIVES GRID ================= */}
        <div className="pt-6 sm:pt-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <span className="text-[10px] sm:text-[11px] font-mono tracking-editorial-mono uppercase text-[#71717A] font-semibold">
              Active Portfolio Archives
            </span>
            <span className="text-xs font-serif italic text-[#71717A] hidden sm:inline">
              Click any journey to preview ambient atmosphere
            </span>
          </div>

          {filteredTrips.length === 0 ? (
            /* Empty State */
            <div className="py-20 text-center paper-panel rounded-3xl border border-[#E8E4DA] space-y-4 max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-full bg-[#F4F1EA] border border-[#E8E4DA] flex items-center justify-center mx-auto text-[#71717A]">
                <Plus className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl font-normal text-[#151516]">
                No Journeys Found
              </h3>
              <p className="text-xs text-[#71717A] max-w-xs mx-auto leading-relaxed font-light">
                No active journeys match your current filter. Commission your next bespoke expedition to start exploring.
              </p>
              <button
                onClick={onOpenCreateModal}
                className="px-5 py-2.5 rounded-full bg-[#151516] hover:bg-[#232326] text-white text-xs font-medium transition shadow-sm cursor-pointer"
              >
                Commission New Journey
              </button>
            </div>
          ) : (
            /* Grid of Editorial Trip Cards (2-column layout from demo.html) */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5 sm:gap-8">
              {filteredTrips.map((trip) => {
                const isSelected = activeTrip && activeTrip.id === trip.id;
                const tripBg = trip.bgImage || getDestinationBackgroundImage(trip.destination);

                let badgeColor = "bg-emerald-50 text-emerald-800 border-emerald-200/60";
                let statusLabel = "Active Residency";
                if (trip.status === 'past') {
                  badgeColor = "bg-[#E8E5DD] text-[#71717A] border-[#E8E4DA]";
                  statusLabel = "Completed Archive";
                } else if (trip.status !== 'active') {
                  badgeColor = "bg-[#F4F1EA] text-[#38383C] border-[#E8E4DA]";
                  statusLabel = "Upcoming Voyage";
                }

                return (
                  <div
                    key={trip.id}
                    onClick={() => onSelectTrip(trip)}
                    className={`group paper-panel rounded-2xl sm:rounded-3xl overflow-hidden border transition-all duration-300 hover:shadow-xl flex flex-col justify-between cursor-pointer ${
                      isSelected ? 'border-sky-500 ring-2 ring-sky-500/20 shadow-md' : 'border-[#E8E4DA]'
                    }`}
                  >
                    {/* Full bleed image viewport with hover zoom */}
                    <div 
                      className="relative h-52 sm:h-64 lg:h-72 overflow-hidden bg-[#E8E5DD] cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onExploreTrip(trip);
                      }}
                    >
                      <img 
                        src={tripBg} 
                        alt={trip.destination} 
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      
                      {/* Dark film vignette */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#151516]/85 via-[#151516]/25 to-transparent" />

                      {/* Top status badges */}
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-10">
                        <span className={`text-[10px] font-mono tracking-editorial-mono uppercase px-2.5 sm:px-3 py-1 rounded-full ${badgeColor} backdrop-blur-md border font-semibold`}>
                          {statusLabel}
                        </span>
                        <span className="text-[10px] sm:text-[11px] font-mono text-white/90 bg-[#151516]/40 backdrop-blur-md px-2.5 sm:px-3 py-1 rounded-full border border-white/15">
                          Dossier #{trip.id.slice(0, 8).toUpperCase()}
                        </span>
                      </div>

                      {/* Floating bottom city & destination on image */}
                      <div className="absolute bottom-4 left-4 right-4 text-white z-10">
                        {(() => {
                          const { city, country: resolvedCountry } = resolveDestinationCountry(trip.destination, trip.country);
                          return (
                            <>
                              <span className="text-[10px] sm:text-[11px] font-mono tracking-editorial-mono uppercase text-white/75 block">
                                {resolvedCountry || 'EXPEDITION'}
                              </span>
                              <h3 className="font-serif text-2xl sm:text-3xl text-white font-normal drop-shadow-sm leading-tight">
                                {city}
                              </h3>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Card Editorial Details & Metadata */}
                    <div className="p-4 sm:p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-4 sm:space-y-6">
                      
                      <div className="space-y-2.5 sm:space-y-3">
                        <p className="text-xs text-[#525258] font-light leading-relaxed line-clamp-3">
                          {getWelcomeMessage(trip.destination, trip.country, trip.budget)}
                        </p>

                        {/* Companion & logistics tags */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[10px] font-mono tracking-editorial-mono px-2.5 py-1 rounded-md paper-inset text-[#525258]">
                            {trip.guest_count || 2} {trip.guest_count === 1 ? 'Guest' : 'Guests'}
                          </span>
                          <span className="text-[10px] font-mono tracking-editorial-mono px-2.5 py-1 rounded-md paper-inset text-[#525258] uppercase">
                            {trip.budget === 'high' ? '$$$ High Tier' : trip.budget === 'medium' ? '$$ Medium Tier' : '$ Essential Tier'}
                          </span>
                          {trip.isBookmarked && (
                            <span className="text-[10px] font-mono tracking-editorial-mono px-2.5 py-1 rounded-md paper-inset text-sky-700 bg-sky-50 border border-sky-200">
                              ★ Saved Dossier
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Dates & Primary Action Buttons */}
                      <div className="pt-4 border-t border-[#E8E4DA] flex items-center justify-between gap-4">
                        <div>
                          <span className="text-[10px] font-mono uppercase text-[#71717A] block tracking-editorial-mono">
                            Duration
                          </span>
                          <span className="text-xs font-semibold text-[#151516]">
                            {trip.start_date || 'Upcoming'}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onBookmarkTrip(trip.id);
                            }}
                            className="p-2 rounded-full paper-inset hover:bg-white text-[#71717A] hover:text-[#151516] transition cursor-pointer"
                            title={trip.isBookmarked ? "Remove Bookmark" : "Bookmark Dossier"}
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${trip.isBookmarked ? 'fill-sky-500 text-sky-500' : ''}`} />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Are you sure you want to delete the dossier for ${trip.destination}?`)) {
                                onDeleteTrip(trip.id);
                              }
                            }}
                            className="p-2 rounded-full paper-inset hover:bg-rose-50 text-[#71717A] hover:text-rose-600 transition cursor-pointer"
                            title="Delete Dossier"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onExploreTrip(trip);
                            }}
                            className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#151516] hover:bg-[#232326] text-white text-[11px] sm:text-xs font-medium transition duration-200 flex items-center gap-1.5 sm:gap-2 group-hover:bg-[#3D4536] cursor-pointer"
                          >
                            <span>Open Dossier</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}

              {/* Commission New Expedition Card from demo.html */}
              <div
                onClick={onOpenCreateModal}
                className="paper-panel rounded-3xl border-2 border-dashed border-[#E8E4DA] hover:border-[#A1A1AA] p-8 flex flex-col items-center justify-center text-center space-y-4 cursor-pointer transition-colors duration-300 min-h-[360px] group"
              >
                <div className="w-14 h-14 rounded-full bg-[#F4F1EA] border border-[#E8E4DA] flex items-center justify-center text-[#71717A] group-hover:text-[#151516] group-hover:scale-105 transition-all duration-300">
                  <Plus className="w-6 h-6 stroke-[1.5]" />
                </div>
                <div>
                  <h4 className="font-serif text-2xl font-normal text-[#151516]">
                    Commission New Journey
                  </h4>
                  <p className="text-xs text-[#71717A] max-w-xs mx-auto mt-1 font-light leading-relaxed">
                    Set destination parameters, duration, and tailored budget to let Laugh Tale craft your bespoke private dossier.
                  </p>
                </div>
                <span className="text-xs font-semibold text-sky-600 tracking-wide uppercase font-mono">
                  + Create Archive
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ================= 5. CURATED DISPATCH FOOTER NOTE ================= */}
        <div className="mt-16 p-6 rounded-3xl paper-panel border border-[#E8E4DA] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#525258]">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>Laugh Tale Travel Intelligence is operating on ground across 14 global architectural regions.</span>
          </div>
          <span className="font-mono text-[11px] text-[#A1A1AA]">
            Curator Edition No. 28 // One Piece Philosophy
          </span>
        </div>

      </section>

      {/* Floating Concierge Chat Trigger Pill */}
      <button
        onClick={onOpenConciergeChat}
        className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-full bg-[#151516] hover:bg-[#232326] text-white shadow-xl flex items-center space-x-2.5 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border border-white/10"
        title="Open AI Concierge Chat"
      >
        <MessageSquare className="w-4 h-4 text-sky-400" />
        <span className="font-sans font-medium text-xs pr-1">Concierge AI</span>
      </button>

    </div>
  );
};
