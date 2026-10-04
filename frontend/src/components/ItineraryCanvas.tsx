import React, { useState } from 'react';
import { 
  Sun, 
  CloudRain, 
  MapPin, 
  DollarSign, 
  ExternalLink,
  ShieldCheck,
  Download,
  Sparkles
} from 'lucide-react';
import type { ItineraryDay, Activity, TripState } from '../types';

interface ItineraryCanvasProps {
  days: ItineraryDay[];
  trip: TripState;
  onOpenExport: () => void;
}

export const ItineraryCanvas: React.FC<ItineraryCanvasProps> = ({
  days,
  trip,
  onOpenExport
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const activeDay = days[selectedDayIndex] || days[0];

  const getDestinationImage = (destName: string) => {
    const d = destName.toLowerCase();
    if (d.includes('paris')) return 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80';
    if (d.includes('tokyo') || d.includes('japan')) return 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80';
    if (d.includes('rome') || d.includes('italy')) return 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80';
    if (d.includes('london')) return 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80';
    if (d.includes('amalfi')) return 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80';
    if (d.includes('santorini') || d.includes('greece')) return 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80';
    return 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80';
  };

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
    if (trip.budget === 'low') hotelRatePerNight = 1500;
    else if (trip.budget === 'high') hotelRatePerNight = 9500;
    else hotelRatePerNight = 3800;

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

  const getCategoryBadgeClass = (category: Activity['category']) => {
    switch (category) {
      case 'Dining':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'Culture':
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
      case 'Transit':
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
      case 'Outdoor':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      default:
        return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAFAFA] dark:bg-[#080B11] overflow-y-auto p-6 space-y-6">
      
      {/* 1. Destination Photo Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden min-h-[160px] border border-slate-200/80 dark:border-white/10 shadow-lg flex items-end p-6">
        <img
          src={getDestinationImage(trip.destination)}
          alt={trip.destination}
          className="absolute inset-0 w-full h-full object-cover filter brightness-[0.75]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
        
        <div className="relative z-10 w-full flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
          <div>
            <div className="flex items-center space-x-2 text-[#D4AF37] font-semibold text-xs mb-1">
              <Sparkles className="w-4 h-4" />
              <span className="uppercase tracking-widest text-[10px]">Visual Itinerary Timeline</span>
            </div>
            <h1 className="font-serif font-extrabold text-3xl sm:text-4xl text-white">
              {trip.destination}
            </h1>
            <p className="text-xs text-slate-300 font-medium">
              {trip.origin} ➔ {trip.destination} • {trip.start_date} to {trip.end_date}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenExport}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-900 dark:text-slate-100 text-xs font-bold hover:bg-white transition-all shadow-md"
            >
              <Download className="w-4 h-4 text-[#D4AF37]" />
              <span>Export iCal / PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Days Ribbon */}
      <div className="flex items-center space-x-3 overflow-x-auto pb-2 no-scrollbar">
        {days.map((day, idx) => {
          const isSelected = selectedDayIndex === idx;
          return (
            <button
              key={day.dayNumber}
              onClick={() => setSelectedDayIndex(idx)}
              className={`p-4 rounded-2xl min-w-[170px] flex flex-col justify-between border transition-all text-left duration-200 ${
                isSelected
                  ? 'glass-card border-[#D4AF37] shadow-lg scale-[1.02]'
                  : 'bg-white/60 dark:bg-white/5 border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-serif font-bold text-sm text-slate-900 dark:text-slate-100">
                  Day {day.dayNumber}
                </span>
                <span className="text-base">{day.weather.icon}</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-1">
                {day.date}
              </div>
              <div className="flex items-center justify-between text-[10px] font-semibold pt-2 border-t border-slate-100 dark:border-white/10">
                <span className="text-slate-600 dark:text-slate-300">{day.weather.temp}</span>
                <span className={day.weather.isRainy ? 'text-blue-500' : 'text-amber-500'}>
                  {day.weather.condition}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Timeline Activities (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 rounded-2xl glass-card border border-slate-200/80 dark:border-white/10 flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#B38E46] flex items-center justify-center text-white font-bold text-sm shadow-md">
                D{activeDay?.dayNumber || 1}
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">
                  Day {activeDay?.dayNumber} Agenda — {activeDay?.date}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {activeDay?.activities.length || 0} Scheduled Activities & Dining Spots
                </p>
              </div>
            </div>

            {/* Weather Alignment Badge */}
            <div className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-2 ${
              activeDay?.weather.isRainy
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
            }`}>
              {activeDay?.weather.isRainy ? <CloudRain className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              <span>{activeDay?.weather.isRainy ? '☔ Rain-Proof Indoor Plan' : '☀️ Clear Weather Outdoor Plan'}</span>
            </div>
          </div>

          {/* Activities List */}
          <div className="space-y-3">
            {activeDay?.activities.map((act) => (
              <div
                key={act.id}
                className="p-5 rounded-3xl glass-card border border-slate-200/80 dark:border-white/10 hover-lift group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-[#D4AF37] shrink-0 font-bold text-xs">
                      <MapPin className="w-4 h-4 text-[#D4AF37]" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1.5">
                        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-semibold ${getCategoryBadgeClass(act.category)}`}>
                          {act.category}
                        </span>
                        {act.isIndoor && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10">
                            🛡️ Weather Safe
                          </span>
                        )}
                      </div>
                      <h4 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100 mb-1 group-hover:text-[#D4AF37] transition-colors">
                        {act.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                        {act.description}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{act.location}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Est. {act.estimatedCost}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(act.title + ' ' + act.location)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors shrink-0"
                    title="View on Google Maps"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Budget Tracker & Trip Overview Card (1 col) */}
        <div className="space-y-4">
          
          {/* Budget Calculator Card */}
          <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
              <span className="font-serif font-bold text-sm text-slate-900 dark:text-slate-100">Estimated Budget Tracker</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#B38E46] dark:text-[#D4AF37] font-semibold uppercase">
                {trip.budget} Tier
              </span>
            </div>

            <div className="space-y-3">
              {/* Est. Daily Budget */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Est. Daily Budget (Food & Activities)</span>
                <span className="text-[#D4AF37] font-mono font-bold text-sm">
                  ₹{budgetMetrics.estimatedDailySpend.toLocaleString('en-IN')}/day
                </span>
              </div>

              {/* Breakdown Subtotals */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Activities & Dining ({budgetMetrics.daysCount} Days)</span>
                  <span className="text-slate-900 dark:text-slate-100 font-mono font-semibold">
                    ₹{budgetMetrics.activityTotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Accommodation ({budgetMetrics.nightsCount} Nights @ ₹{budgetMetrics.hotelRatePerNight.toLocaleString('en-IN')})</span>
                  <span className="text-slate-900 dark:text-slate-100 font-mono font-semibold">
                    ₹{budgetMetrics.accommodationTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Total Budget */}
              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">Total Estimated Budget</span>
                <span className="text-slate-900 dark:text-slate-100 font-mono font-extrabold text-base text-[#D4AF37]">
                  ₹{budgetMetrics.grandTotal.toLocaleString('en-IN')} INR
                </span>
              </div>

              {/* Budget progress bar */}
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#D4AF37] to-[#B38E46] transition-all duration-500"
                  style={{ width: `${Math.min(100, (budgetMetrics.grandTotal / (trip.budget === 'high' ? 75000 : trip.budget === 'medium' ? 35000 : 15000)) * 100)}%` }}
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-[11px] text-slate-600 dark:text-slate-300 space-y-1.5">
              <div className="flex items-center space-x-1.5 font-semibold text-slate-900 dark:text-slate-100">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Budget Breakdown Guide</span>
              </div>
              <p className="leading-relaxed text-slate-500 dark:text-slate-400">
                Food, dining & activity entry costs are included in the daily estimated budget. Accommodation is calculated per night based on selected tier rates.
              </p>
            </div>
          </div>

          {/* Quick Summary Card */}
          <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-white/10 space-y-3">
            <h4 className="font-serif font-bold text-sm text-slate-900 dark:text-slate-100">
              Journey Summary
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/10">
                <span className="text-slate-500 dark:text-slate-400">Origin</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{trip.origin}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/10">
                <span className="text-slate-500 dark:text-slate-400">Destination</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{trip.destination}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/10">
                <span className="text-slate-500 dark:text-slate-400">Travelers</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{trip.guest_count} Person(s)</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 dark:text-slate-400">Session ID</span>
                <span className="font-mono text-[10px] text-[#D4AF37]">{trip.session_id}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
