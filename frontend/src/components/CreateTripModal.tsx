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
import { sendChatMessage } from '../services/api';
import { parseMarkdownToItinerary } from '../utils/itineraryParser';
import { getDestinationBackgroundImage } from '../utils/themeUtils';

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



  const handleSubmit = async (e: React.FormEvent) => {
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

    const initialTrip: TripState = {
      id: `trip_${Date.now()}`,
      origin,
      destination,
      country: destination,
      description: `${destination} is blessed with pristine landscapes, luxury retreats, fine dining, and curated local immersion.`,
      bgImage: getDestinationBackgroundImage(destination),
      start_date: startDate,
      end_date: endDate,
      budget,
      guest_count: guestCount,
      session_id: `sess_${Date.now()}`,
      status: 'active',
      isBookmarked: true
    };

    try {
      const messageText = `Create an itinerary from ${origin} to ${destination} from ${startDate} to ${endDate} for ${guestCount} travelers with ${budget} budget.`;
      const { response } = await sendChatMessage(messageText, initialTrip, true);
      
      const lowerReply = (response.reply || '').toLowerCase();
      if (!response.reply || lowerReply.includes('error:') || lowerReply.includes('not found') || lowerReply.includes('could not be found') || lowerReply.includes('invalid city')) {
        setIsLoading(false);
        setError(response.reply || `Destination "${destination}" could not be found. Please check spelling or enter a valid city.`);
        return;
      }

      const parsedDays = parseMarkdownToItinerary(response.reply, destination, startDate);
      if (parsedDays.length === 0) {
        setIsLoading(false);
        setError(`Unable to generate plan for "${destination}". Please ensure the destination city name is correct.`);
        return;
      }

      const newTrip: TripState = {
        ...initialTrip,
        id: response.session_id || initialTrip.id,
        session_id: response.session_id || initialTrip.session_id,
        description: response.reply || initialTrip.description,
        bgImage: initialTrip.bgImage || getDestinationBackgroundImage(destination)
      };

      setIsLoading(false);
      onCreateTrip(newTrip);
      onClose();
    } catch (err: any) {
      // Resilient Fallback: If backend returns 500 or times out, fallback to creating initialTrip cleanly so user is never blocked
      const fallbackReply = `## Day 1\n* **[Arrival & ${destination} Exploration]**: Arrive in ${destination}, check into your accommodation, and explore local highlights, culture, and dining.`;
      const fallbackTrip: TripState = {
        ...initialTrip,
        description: fallbackReply,
        bgImage: initialTrip.bgImage || getDestinationBackgroundImage(destination)
      };
      setIsLoading(false);
      onCreateTrip(fallbackTrip);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-md animate-fade-in">
      
      {/* Sleek Minimalist Modal Surface */}
      <div className="relative w-full max-w-lg bg-white border border-slate-200/90 rounded-3xl p-7 sm:p-9 shadow-2xl space-y-6 text-slate-900 overflow-hidden">
        
        {/* Header Ribbon */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="space-y-0.5">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-500 block">
              ODYSSEY AI
            </span>
            <h3 className="font-bold text-xl text-slate-900 tracking-tight">
              Create New Journey
            </h3>
          </div>

          <button 
            onClick={onClose} 
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all active:scale-95 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center space-x-3 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Minimal Form */}
        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          
          {/* Origin & Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Departure</label>
              <div className="flex items-center space-x-3 px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus-within:border-rose-400 focus-within:bg-white transition-colors">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  required
                  className="w-full bg-transparent font-medium focus:outline-none text-slate-900 placeholder-slate-400"
                  placeholder="e.g. London"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Destination</label>
              <div className="flex items-center space-x-3 px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus-within:border-rose-400 focus-within:bg-white transition-colors">
                <Globe className="w-4 h-4 text-rose-500 shrink-0" />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  required
                  className="w-full bg-transparent font-medium focus:outline-none text-slate-900 placeholder-slate-400"
                  placeholder="e.g. Bali / Tokyo"
                />
              </div>
            </div>
          </div>

          {/* Start & End Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Start Date</label>
              <div className="flex items-center space-x-3 px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus-within:border-rose-400 focus-within:bg-white transition-colors">
                <Calendar className="w-4 h-4 text-rose-500 shrink-0" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (error) setError(null);
                  }}
                  required
                  className="w-full bg-transparent font-medium focus:outline-none text-slate-900 cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">End Date</label>
              <div className="flex items-center space-x-3 px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus-within:border-rose-400 focus-within:bg-white transition-colors">
                <Calendar className="w-4 h-4 text-rose-500 shrink-0" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    if (error) setError(null);
                  }}
                  required
                  className="w-full bg-transparent font-medium focus:outline-none text-slate-900 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Nights Duration Line */}
          {nightsCount > 0 && (
            <div className="text-[11px] text-slate-600 font-medium px-3 flex items-center justify-between py-1.5 bg-slate-50 rounded-xl border border-slate-200">
              <span>Estimated Duration</span>
              <span className="text-rose-600 font-bold">{nightsCount} Nights Stay</span>
            </div>
          )}

          {/* Travelers & Experience Tier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            
            {/* Travelers Count */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Travelers</label>
              <div className="flex items-center justify-between px-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setGuestCount(prev => Math.max(1, prev - 1));
                    if (error) setError(null);
                  }}
                  className="w-8 h-8 rounded-xl bg-slate-200/70 hover:bg-slate-300 flex items-center justify-center text-slate-700 active:scale-95 transition-transform cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5 text-slate-700" />
                </button>

                <div className="flex items-center space-x-2 px-2">
                  <Users className="w-3.5 h-3.5 text-rose-500" />
                  <span className="font-bold text-sm text-slate-900">{guestCount}</span>
                  <span className="text-[10px] text-slate-500 font-medium">Guests</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setGuestCount(prev => Math.min(99, prev + 1));
                    if (error) setError(null);
                  }}
                  className="w-8 h-8 rounded-xl bg-slate-200/70 hover:bg-slate-300 flex items-center justify-center text-slate-700 active:scale-95 transition-transform cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-slate-700" />
                </button>
              </div>
            </div>

            {/* Experience Tier Pill Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Experience Tier</label>
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setBudget('low')}
                  className={`py-2.5 rounded-xl text-[10px] font-semibold transition-all cursor-pointer ${
                    budget === 'low'
                      ? 'bg-rose-500 text-white shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Essential
                </button>

                <button
                  type="button"
                  onClick={() => setBudget('medium')}
                  className={`py-2.5 rounded-xl text-[10px] font-semibold transition-all cursor-pointer ${
                    budget === 'medium'
                      ? 'bg-rose-500 text-white shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Signature
                </button>

                <button
                  type="button"
                  onClick={() => setBudget('high')}
                  className={`py-2.5 rounded-xl text-[10px] font-semibold transition-all cursor-pointer ${
                    budget === 'high'
                      ? 'bg-rose-500 text-white shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900'
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
            className="w-full py-4 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs shadow-lg shadow-rose-500/25 active:scale-95 transition-all flex items-center justify-center space-x-2 mt-6 cursor-pointer"
          >
            {isLoading ? (
              <span className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 animate-spin text-white" />
                <span>Creating Journey...</span>
              </span>
            ) : (
              <>
                <span>Create & Explore Journey</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  );
};
