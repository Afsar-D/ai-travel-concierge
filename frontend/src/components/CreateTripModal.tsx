import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  MapPin, 
  Globe, 
  Calendar, 
  Users, 
  ArrowRight, 
  AlertCircle,
  Plus,
  Minus
} from 'lucide-react';
import type { TripState, BudgetTier } from '../types';

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTrip: (newTrip: TripState) => void;
}

export const CreateTripModal: React.FC<CreateTripModalProps> = ({
  isOpen,
  onClose,
  onCreateTrip
}) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState<BudgetTier>('high');
  const [guestCount, setGuestCount] = useState<number>(2);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const calculateNights = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    return Math.ceil((end - start) / (1000 * 3600 * 24));
  };

  const nightsCount = calculateNights();

  const getBgImage = (dest: string) => {
    const d = dest.toLowerCase();
    if (d.includes('indonesia') || d.includes('bali')) return 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80';
    if (d.includes('thailand')) return 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1600&q=80';
    if (d.includes('kerala') || d.includes('india')) return 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1600&q=80';
    if (d.includes('paris') || d.includes('france')) return 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=80';
    if (d.includes('tokyo') || d.includes('japan')) return 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1600&q=80';
    return 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1600&q=80';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      setError('Start date cannot be after end date!');
      return;
    }

    if (isNaN(guestCount) || guestCount < 1) {
      setError('Travelers must be a valid number of at least 1 person!');
      return;
    }

    setIsLoading(true);

    const newTrip: TripState = {
      id: `trip_${Date.now()}`,
      origin,
      destination,
      country: destination,
      description: `${destination} is blessed with pristine landscapes, luxury retreats, fine dining, and curated local immersion.`,
      bgImage: getBgImage(destination),
      start_date: startDate,
      end_date: endDate,
      budget,
      guest_count: guestCount,
      session_id: `sess_${Date.now()}`,
      status: 'active',
      isBookmarked: true
    };

    setTimeout(() => {
      setIsLoading(false);
      onCreateTrip(newTrip);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#04060A]/80 backdrop-blur-xl animate-fade-in">
      
      {/* Sleek Minimalist Modal Surface */}
      <div className="relative w-full max-w-lg bg-[#0C1019] border border-white/15 rounded-3xl p-7 sm:p-9 shadow-2xl space-y-6 text-white overflow-hidden">
        
        {/* Header Ribbon */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="space-y-0.5">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#D4B886] block">
              ODYSSEY AI
            </span>
            <h3 className="font-bold text-xl text-white tracking-tight">
              Create New Journey
            </h3>
          </div>

          <button 
            onClick={onClose} 
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/5 active:scale-95 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center space-x-3 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Minimal Form */}
        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          
          {/* Origin & Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Departure</label>
              <div className="flex items-center space-x-3 px-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 focus-within:border-[#D4B886] transition-colors">
                <MapPin className="w-4 h-4 text-[#D4B886] shrink-0" />
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  required
                  className="w-full bg-transparent font-medium focus:outline-none text-white placeholder-slate-500"
                  placeholder="e.g. London"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Destination</label>
              <div className="flex items-center space-x-3 px-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 focus-within:border-[#D4B886] transition-colors">
                <Globe className="w-4 h-4 text-[#D4B886] shrink-0" />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  required
                  className="w-full bg-transparent font-medium focus:outline-none text-white placeholder-slate-500"
                  placeholder="e.g. Bali / Tokyo"
                />
              </div>
            </div>
          </div>

          {/* Start & End Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Start Date</label>
              <div className="flex items-center space-x-3 px-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 focus-within:border-[#D4B886] transition-colors">
                <Calendar className="w-4 h-4 text-[#D4B886] shrink-0" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (error) setError(null);
                  }}
                  required
                  className="w-full bg-transparent font-medium focus:outline-none text-white cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">End Date</label>
              <div className="flex items-center space-x-3 px-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 focus-within:border-[#D4B886] transition-colors">
                <Calendar className="w-4 h-4 text-[#D4B886] shrink-0" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    if (error) setError(null);
                  }}
                  required
                  className="w-full bg-transparent font-medium focus:outline-none text-white cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Nights Duration Line */}
          {nightsCount > 0 && (
            <div className="text-[11px] text-slate-400 font-medium px-1 flex items-center justify-between py-1 bg-white/5 rounded-xl border border-white/5 px-3">
              <span>Estimated Duration</span>
              <span className="text-[#D4B886] font-bold">{nightsCount} Nights Stay</span>
            </div>
          )}

          {/* Travelers & Experience Tier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            
            {/* Travelers Count */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Travelers</label>
              <div className="flex items-center justify-between px-3 py-2.5 rounded-2xl bg-white/5 border border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setGuestCount(prev => Math.max(1, prev - 1));
                    if (error) setError(null);
                  }}
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white active:scale-95 transition-transform cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5 text-[#D4B886]" />
                </button>

                <div className="flex items-center space-x-2 px-2">
                  <Users className="w-3.5 h-3.5 text-[#D4B886]" />
                  <span className="font-bold text-sm text-white">{guestCount}</span>
                  <span className="text-[10px] text-slate-400 font-medium">Guests</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setGuestCount(prev => Math.min(99, prev + 1));
                    if (error) setError(null);
                  }}
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white active:scale-95 transition-transform cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#D4B886]" />
                </button>
              </div>
            </div>

            {/* Experience Tier Pill Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Experience Tier</label>
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10">
                <button
                  type="button"
                  onClick={() => setBudget('low')}
                  className={`py-2.5 rounded-xl text-[10px] font-semibold transition-all cursor-pointer ${
                    budget === 'low'
                      ? 'bg-[#D4B886] text-slate-950 shadow-md font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Essential
                </button>

                <button
                  type="button"
                  onClick={() => setBudget('medium')}
                  className={`py-2.5 rounded-xl text-[10px] font-semibold transition-all cursor-pointer ${
                    budget === 'medium'
                      ? 'bg-[#D4B886] text-slate-950 shadow-md font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Signature
                </button>

                <button
                  type="button"
                  onClick={() => setBudget('high')}
                  className={`py-2.5 rounded-xl text-[10px] font-semibold transition-all cursor-pointer ${
                    budget === 'high'
                      ? 'bg-[#D4B886] text-slate-950 shadow-md font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Luxury
                </button>
              </div>
            </div>

          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-2xl bg-[#D4B886] hover:bg-[#E2CB9F] text-slate-950 font-extrabold text-xs shadow-lg shadow-[#D4B886]/20 active:scale-95 transition-all flex items-center justify-center space-x-2 mt-6 cursor-pointer"
          >
            {isLoading ? (
              <span className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 animate-spin text-slate-950" />
                <span>Creating Journey...</span>
              </span>
            ) : (
              <>
                <span>Create & Explore Journey</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  );
};
