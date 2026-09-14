import React from 'react';
import { 
  MapPin, 
  Calendar as CalendarIcon, 
  Users, 
  ArrowLeftRight, 
  Crown, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import type { TripState, BudgetTier } from '../types';

interface TripContextBarProps {
  trip: TripState;
  onUpdateTrip: (updated: Partial<TripState>) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export const TripContextBar: React.FC<TripContextBarProps> = ({
  trip,
  onUpdateTrip,
  onGenerate,
  isLoading
}) => {
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [showGuestsPopover, setShowGuestsPopover] = React.useState(false);

  const handleSwap = () => {
    onUpdateTrip({
      origin: trip.destination,
      destination: trip.origin
    });
  };

  const getDuration = () => {
    try {
      const start = new Date(trip.start_date);
      const end = new Date(trip.end_date);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return isNaN(diffDays) ? 1 : diffDays;
    } catch {
      return 1;
    }
  };

  const durationDays = getDuration();

  return (
    <div className="bg-white dark:bg-[#141A26] border-b border-slate-200 dark:border-slate-800 p-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        
        {/* Origin & Destination Controls */}
        <div className="flex items-center space-x-2 bg-slate-50 dark:bg-[#1E2638] p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-inner flex-1 min-w-[280px]">
          {/* Origin */}
          <div className="flex items-center space-x-2 px-3 py-1.5 flex-1">
            <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0" />
            <div className="flex flex-col flex-1">
              <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-400 tracking-wider">Origin</span>
              <input
                type="text"
                value={trip.origin}
                onChange={(e) => onUpdateTrip({ origin: e.target.value })}
                placeholder="City or Airport (e.g. London)"
                className="bg-transparent text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            title="Swap Origin and Destination"
            className="w-8 h-8 rounded-xl bg-white dark:bg-[#141A26] hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-sm transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>

          {/* Destination */}
          <div className="flex items-center space-x-2 px-3 py-1.5 flex-1">
            <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="flex flex-col flex-1">
              <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-400 tracking-wider">Destination</span>
              <input
                type="text"
                value={trip.destination}
                onChange={(e) => onUpdateTrip({ destination: e.target.value })}
                placeholder="City (e.g. Paris)"
                className="bg-transparent text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Date Selector & Duration */}
        <div className="relative">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center space-x-3 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#1E2638] border border-slate-200/80 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 transition-all text-xs font-semibold text-slate-900 dark:text-slate-100"
          >
            <CalendarIcon className="w-4 h-4 text-[#D4AF37]" />
            <div className="flex flex-col text-left">
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Dates & Duration</span>
              <span className="text-xs font-semibold">
                {trip.start_date} to {trip.end_date} ({durationDays} {durationDays === 1 ? 'Day' : 'Days'})
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {showDatePicker && (
            <div className="absolute top-full mt-2 left-0 z-50 p-4 rounded-2xl bg-white dark:bg-[#141A26] border border-slate-200 dark:border-slate-700 shadow-xl w-72 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-serif font-bold text-slate-900 dark:text-slate-100">Select Travel Dates</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#B38E46] dark:text-[#D4AF37] font-semibold">
                  {durationDays} Days Total
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-[10px] uppercase text-slate-400 font-semibold block mb-1">Departure Date</label>
                  <input
                    type="date"
                    value={trip.start_date}
                    onChange={(e) => onUpdateTrip({ start_date: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#1E2638] border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-slate-400 font-semibold block mb-1">Return Date</label>
                  <input
                    type="date"
                    value={trip.end_date}
                    onChange={(e) => onUpdateTrip({ end_date: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#1E2638] border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>
              <button
                onClick={() => setShowDatePicker(false)}
                className="w-full py-1.5 rounded-xl bg-[#0F172A] dark:bg-[#F8FAFC] text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                Done
              </button>
            </div>
          )}
        </div>

        {/* Guest Count Stepper */}
        <div className="relative">
          <button
            onClick={() => setShowGuestsPopover(!showGuestsPopover)}
            className="flex items-center space-x-3 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#1E2638] border border-slate-200/80 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 transition-all text-xs font-semibold text-slate-900 dark:text-slate-100"
          >
            <Users className="w-4 h-4 text-[#D4AF37]" />
            <div className="flex flex-col text-left">
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Travelers</span>
              <span className="text-xs font-semibold">{trip.guest_count} {trip.guest_count === 1 ? 'Guest' : 'Guests'}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {showGuestsPopover && (
            <div className="absolute top-full mt-2 left-0 z-50 p-4 rounded-2xl bg-white dark:bg-[#141A26] border border-slate-200 dark:border-slate-700 shadow-xl w-64 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-serif font-bold text-slate-900 dark:text-slate-100">Number of Guests</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onUpdateTrip({ guest_count: Math.max(1, trip.guest_count - 1) })}
                    className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="text-xs font-bold w-4 text-center">{trip.guest_count}</span>
                  <button
                    onClick={() => onUpdateTrip({ guest_count: trip.guest_count + 1 })}
                    className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                {[
                  { label: 'Solo', count: 1 },
                  { label: 'Couple', count: 2 },
                  { label: 'Family (4)', count: 4 },
                  { label: 'Group (6+)', count: 6 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      onUpdateTrip({ guest_count: preset.count });
                      setShowGuestsPopover(false);
                    }}
                    className={`py-1.5 px-2 rounded-xl text-xs font-medium border text-center transition-all ${
                      trip.guest_count === preset.count
                        ? 'bg-[#F5F2EB] dark:bg-[#1E2638] border-[#D4AF37] text-[#B38E46] dark:text-[#D4AF37]'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Budget Tier Segmented Control */}
        <div className="flex items-center bg-slate-50 dark:bg-[#1E2638] p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
          {(['low', 'medium', 'high'] as BudgetTier[]).map((tier) => {
            const labels: Record<BudgetTier, string> = {
              low: 'Essential',
              medium: 'Signature',
              high: 'Private Luxury'
            };
            const isSelected = trip.budget === tier;

            return (
              <button
                key={tier}
                onClick={() => onUpdateTrip({ budget: tier })}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-white dark:bg-[#141A26] text-[#B38E46] dark:text-[#D4AF37] shadow-sm border border-slate-200/60 dark:border-slate-700/60'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tier === 'high' && <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />}
                <span>{labels[tier]}</span>
              </button>
            );
          })}
        </div>

        {/* Generate Trigger */}
        <button
          onClick={onGenerate}
          disabled={isLoading}
          className="flex items-center justify-center space-x-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#B38E46] text-white font-semibold text-xs shadow-md shadow-[#D4AF37]/20 hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-50 shrink-0"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Orchestrating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Itinerary</span>
            </>
          )}
        </button>

      </div>
    </div>
  );
};
