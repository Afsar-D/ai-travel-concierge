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
import { parseBackendReply } from '../utils/parser';
import { getDestinationBackgroundImage, resolveDestinationCountry } from '../utils/themeUtils';

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

    const { city: cleanDestination, country: resolvedCountry } = resolveDestinationCountry(destination);

    const initialTrip: TripState = {
      id: `trip_${Date.now()}`,
      origin,
      destination: cleanDestination || destination,
      country: resolvedCountry || '',
      description: `${cleanDestination || destination} is blessed with pristine landscapes, luxury retreats, fine dining, and curated local immersion.`,
      bgImage: getDestinationBackgroundImage(cleanDestination || destination),
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
        setError('Could not parse day-by-day activities. Please try a major destination.');
        return;
      }

      const parsedData = parseBackendReply(response.reply, origin, destination);
      const createdTrip: TripState = {
        ...initialTrip,
        description: response.reply,
        flights: parsedData.flights.length > 0 ? parsedData.flights : undefined,
        hotels: parsedData.hotels.length > 0 ? parsedData.hotels : undefined
      };

      setIsLoading(false);
      onCreateTrip(createdTrip);
      onClose();
    } catch (err: any) {
      console.warn('Backend generation failed, building offline itinerary fallback:', err);
      
      const fallbackTrip: TripState = {
        ...initialTrip,
        description: `Bespoke curated journey through ${destination}. Enjoy private architectural sanctuaries, chef tasting counters, and secluded historical landmarks.`
      };

      setIsLoading(false);
      onCreateTrip(fallbackTrip);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-[#151516]/65 backdrop-blur-sm animate-fade-in">
      
      {/* Commission Archive Modal Surface from demo.html */}
      <div className="paper-panel relative w-full max-w-lg bg-[#FAF9F6] border border-[#E8E4DA] rounded-t-3xl sm:rounded-3xl p-4 sm:p-6 sm:p-8 shadow-2xl space-y-4 sm:space-y-6 text-[#151516] max-h-[92vh] overflow-y-auto">
        
        {/* Header Ribbon */}
        <div className="flex items-baseline justify-between border-b border-[#E8E4DA] pb-3">
          <div>
            <span className="text-[10px] font-mono tracking-editorial-mono uppercase text-[#71717A] font-semibold block">
              Commission Archive
            </span>
            <h3 className="font-serif text-2xl font-normal text-[#151516] mt-0.5">
              Plan a New Expedition
            </h3>
          </div>

          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-[#E8E5DD] text-[#71717A] hover:text-[#151516] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center space-x-3">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Origin & Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-editorial-mono text-[#71717A] block">Departure</label>
              <div className="flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl bg-[#F4F1EA]/80 border border-[#E8E4DA] focus-within:border-[#38383C] transition-colors">
                <MapPin className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  required
                  className="w-full bg-transparent font-medium focus:outline-none text-[#151516] placeholder-[#A1A1AA]"
                  placeholder="e.g. London"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-editorial-mono text-[#71717A] block">Destination Focus</label>
              <div className="flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl bg-[#F4F1EA]/80 border border-[#E8E4DA] focus-within:border-[#38383C] transition-colors">
                <Globe className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  required
                  className="w-full bg-transparent font-medium focus:outline-none text-[#151516] placeholder-[#A1A1AA]"
                  placeholder="e.g. Bali / Tokyo"
                />
              </div>
            </div>
          </div>

          {/* Start & End Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-editorial-mono text-[#71717A] block">Start Date</label>
              <div className="flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl bg-[#F4F1EA]/80 border border-[#E8E4DA] focus-within:border-[#38383C] transition-colors">
                <Calendar className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (error) setError(null);
                  }}
                  required
                  className="w-full bg-transparent font-medium focus:outline-none text-[#151516] cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-editorial-mono text-[#71717A] block">End Date</label>
              <div className="flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl bg-[#F4F1EA]/80 border border-[#E8E4DA] focus-within:border-[#38383C] transition-colors">
                <Calendar className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    if (error) setError(null);
                  }}
                  required
                  className="w-full bg-transparent font-medium focus:outline-none text-[#151516] cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Nights Duration Line */}
          {nightsCount > 0 && (
            <div className="text-[11px] text-[#525258] font-mono px-3.5 py-1.5 bg-[#F4F1EA] rounded-xl border border-[#E8E4DA] flex items-center justify-between">
              <span>Estimated Duration</span>
              <span className="font-semibold text-[#151516]">{nightsCount} Nights Stay</span>
            </div>
          )}

          {/* Travelers & Experience Tier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            
            {/* Travelers Count */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-editorial-mono text-[#71717A] block">Travelers</label>
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#F4F1EA]/80 border border-[#E8E4DA]">
                <button
                  type="button"
                  onClick={() => {
                    setGuestCount(prev => Math.max(1, prev - 1));
                    if (error) setError(null);
                  }}
                  className="w-7 h-7 rounded-lg bg-white hover:bg-[#E8E5DD] flex items-center justify-center text-[#151516] transition cursor-pointer border border-[#E8E4DA]"
                >
                  <Minus className="w-3 h-3 text-[#151516]" />
                </button>

                <div className="flex items-center space-x-2 px-2">
                  <Users className="w-3.5 h-3.5 text-[#71717A]" />
                  <span className="font-semibold text-sm text-[#151516]">{guestCount}</span>
                  <span className="text-[10px] text-[#71717A]">Guests</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setGuestCount(prev => Math.min(99, prev + 1));
                    if (error) setError(null);
                  }}
                  className="w-7 h-7 rounded-lg bg-white hover:bg-[#E8E5DD] flex items-center justify-center text-[#151516] transition cursor-pointer border border-[#E8E4DA]"
                >
                  <Plus className="w-3 h-3 text-[#151516]" />
                </button>
              </div>
            </div>

            {/* Experience Tier Selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-editorial-mono text-[#71717A] block">Expedition Budget</label>
              <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#F4F1EA] border border-[#E8E4DA]">
                <button
                  type="button"
                  onClick={() => setBudget('low')}
                  className={`py-2 rounded-lg text-[10px] font-mono transition-all cursor-pointer ${
                    budget === 'low'
                      ? 'bg-white text-[#151516] shadow-sm font-semibold border border-[#E8E4DA]'
                      : 'text-[#71717A] hover:text-[#151516]'
                  }`}
                >
                  Essential
                </button>

                <button
                  type="button"
                  onClick={() => setBudget('medium')}
                  className={`py-2 rounded-lg text-[10px] font-mono transition-all cursor-pointer ${
                    budget === 'medium'
                      ? 'bg-white text-[#151516] shadow-sm font-semibold border border-[#E8E4DA]'
                      : 'text-[#71717A] hover:text-[#151516]'
                  }`}
                >
                  Signature
                </button>

                <button
                  type="button"
                  onClick={() => setBudget('high')}
                  className={`py-2 rounded-lg text-[10px] font-mono transition-all cursor-pointer ${
                    budget === 'high'
                      ? 'bg-white text-[#151516] shadow-sm font-semibold border border-[#E8E4DA]'
                      : 'text-[#71717A] hover:text-[#151516]'
                  }`}
                >
                  Luxury
                </button>
              </div>
            </div>

          </div>

          {/* Modal Actions */}
          <div className="pt-3 flex justify-end gap-3 border-t border-[#E8E4DA]">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 text-[#71717A] hover:text-[#151516] transition cursor-pointer"
            >
              Dismiss
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-[#151516] hover:bg-[#232326] text-white font-medium transition flex items-center space-x-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center space-x-2">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Curating Dossier...</span>
                </span>
              ) : (
                <>
                  <span>Commission Archive</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
