import React, { useState } from 'react';
import { 
  Compass, 
  Sparkles, 
  MapPin, 
  Calendar as CalendarIcon, 
  Users, 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  Star,
  Globe,
  Sun,
  ChevronRight,
  ArrowLeftRight,
  Sparkle,
  Sliders,
  CheckCircle
} from 'lucide-react';
import type { TripState, BudgetTier } from '../types';

interface LandingPageProps {
  trip: TripState;
  onUpdateTrip: (updated: Partial<TripState>) => void;
  onLaunchConcierge: () => void;
  backendConnected: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  trip,
  onUpdateTrip,
  onLaunchConcierge,
  backendConnected
}) => {
  const [activeFeatureTab, setActiveFeatureTab] = useState<'weather' | 'graph' | 'budget'>('weather');

  const destinations = [
    {
      name: 'Paris',
      country: 'France',
      desc: 'Haute couture, Michelin dining & Seine vistas',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80',
      weather: '21°C • Sunny',
      rating: '4.98',
      tag: 'Signature Choice'
    },
    {
      name: 'Tokyo',
      country: 'Japan',
      desc: 'Neon-lit futuristic avenues & ancient shrines',
      image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1000&q=80',
      weather: '19°C • Clear',
      rating: '4.99',
      tag: 'Trending Destination'
    },
    {
      name: 'Amalfi Coast',
      country: 'Italy',
      desc: 'Dramatic cliffside villas & azur Mediterranean',
      image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1000&q=80',
      weather: '24°C • Sea Breeze',
      rating: '4.97',
      tag: 'Coastal Luxury'
    },
    {
      name: 'Santorini',
      country: 'Greece',
      desc: 'Whitewashed Aegean luxury & Caldera sunsets',
      image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1000&q=80',
      weather: '25°C • Blue Skies',
      rating: '4.96',
      tag: 'Islands & Vistas'
    },
    {
      name: 'Rome',
      country: 'Italy',
      desc: 'Monumental ancient history & artisan gastronomy',
      image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1000&q=80',
      weather: '22°C • Pleasant',
      rating: '4.95',
      tag: 'Cultural Capital'
    },
    {
      name: 'Kyoto',
      country: 'Japan',
      desc: 'Zen gardens, teahouses & bamboo groves',
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=80',
      weather: '18°C • Mild',
      rating: '4.99',
      tag: 'Tranquil Retreat'
    }
  ];

  const handleSwapCities = () => {
    onUpdateTrip({
      origin: trip.destination,
      destination: trip.origin
    });
  };

  const handleSelectDestination = (destName: string) => {
    onUpdateTrip({ destination: destName });
    onLaunchConcierge();
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#080B11] text-slate-900 dark:text-slate-100 flex flex-col font-sans relative overflow-hidden">
      
      {/* Ambient Floating Glow Orbs */}
      <div className="ambient-glow-gold top-[-100px] left-1/2 -translate-x-1/2" />
      <div className="ambient-glow-slate top-[600px] right-[-200px]" />

      {/* 1. Floating Capsule Navigation Header */}
      <div className="fixed top-6 inset-x-0 z-50 flex justify-center px-4">
        <header className="glass-nav rounded-full px-6 py-3 border border-slate-200/80 dark:border-white/10 shadow-2xl flex items-center justify-between gap-8 max-w-4xl w-full">
          
          {/* Logo */}
          <div 
            onClick={onLaunchConcierge}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B38E46] flex items-center justify-center text-white shadow-md shadow-[#D4AF37]/20 group-hover:rotate-45 transition-transform duration-500">
              <Compass className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-sm tracking-tight text-slate-900 dark:text-slate-100">
                SOJOURN
              </span>
              <span className="text-[8px] uppercase tracking-widest font-semibold text-[#D4AF37] -mt-1">
                Luxury AI Concierge
              </span>
            </div>
          </div>

          {/* Links */}
          <nav className="hidden sm:flex items-center space-x-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <a href="#destinations" className="hover:text-[#D4AF37] transition-colors">Curated Stays</a>
            <a href="#intelligence" className="hover:text-[#D4AF37] transition-colors">AI Intelligence</a>
            <a href="#telemetry" className="hover:text-[#D4AF37] transition-colors">Telemetry</a>
          </nav>

          {/* Action CTA */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-[10px] font-semibold text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-white/10">
              <span className={`w-2 h-2 rounded-full ${backendConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span>FastAPI {backendConnected ? 'Ready' : 'Standby'}</span>
            </div>

            <button
              onClick={onLaunchConcierge}
              className="flex items-center space-x-2 px-5 py-2 rounded-full bg-[#0F172A] dark:bg-white text-white dark:text-slate-900 font-semibold text-xs shadow-md hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-95 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Launch App</span>
            </button>
          </div>

        </header>
      </div>

      {/* 2. Hero Section */}
      <section className="relative min-h-[90vh] pt-36 pb-20 px-6 flex flex-col justify-center items-center text-center">
        
        {/* Subtle Background Hero Image Overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img 
            src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=2000&q=90" 
            alt="Hero Background"
            className="w-full h-full object-cover opacity-15 dark:opacity-10 filter blur-[2px] transform scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#FAFAFA] via-[#FAFAFA]/95 to-[#FAFAFA] dark:from-[#080B11] dark:via-[#080B11]/95 dark:to-[#080B11]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-8">
          
          {/* Champagne Pill Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-md">
            <Sparkle className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Next-Gen Multi-Agent Travel Intelligence
            </span>
          </div>

          {/* Dramatic Serif Headline */}
          <h1 className="font-serif text-5xl sm:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 leading-[1.08]">
            Travel Beyond Boundaries. <br />
            <span className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B38E46]">
              Synthesized in Seconds.
            </span>
          </h1>

          <p className="max-w-xl mx-auto text-sm sm:text-base text-slate-600 dark:text-slate-400 font-normal leading-relaxed">
            SOJOURN orchestrates your custom travel itinerary using live weather forecasts, curated dining, and luxury stays—all styled with organic luxury.
          </p>

          {/* Floating Glass Trip Planner Card */}
          <div className="glass-card rounded-3xl p-4 sm:p-6 text-left max-w-3xl mx-auto space-y-4 hover-lift">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              
              {/* Origin */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Departure</label>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <input
                    type="text"
                    value={trip.origin}
                    onChange={(e) => onUpdateTrip({ origin: e.target.value })}
                    placeholder="Origin (e.g. London)"
                    className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Destination */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 relative">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Destination</label>
                  <button onClick={handleSwapCities} className="text-slate-400 hover:text-[#D4AF37] transition-colors" title="Swap">
                    <ArrowLeftRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-emerald-500 shrink-0" />
                  <input
                    type="text"
                    value={trip.destination}
                    onChange={(e) => onUpdateTrip({ destination: e.target.value })}
                    placeholder="Destination (e.g. Paris)"
                    className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Dates</label>
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <input
                    type="date"
                    value={trip.start_date}
                    onChange={(e) => onUpdateTrip({ start_date: e.target.value })}
                    className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              {/* Guests */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Travelers</label>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <select
                    value={trip.guest_count}
                    onChange={(e) => onUpdateTrip({ guest_count: Number(e.target.value) })}
                    className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    <option value={1} className="dark:bg-[#141A26]">1 Guest (Solo)</option>
                    <option value={2} className="dark:bg-[#141A26]">2 Guests (Couple)</option>
                    <option value={4} className="dark:bg-[#141A26]">4 Guests (Family)</option>
                    <option value={6} className="dark:bg-[#141A26]">6+ Guests (Group)</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Budget Tier Selector Matrix */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/10">
              <div className="flex items-center space-x-2">
                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Budget Tier:</span>
              </div>
              <div className="flex space-x-1.5">
                {(['low', 'medium', 'high'] as BudgetTier[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => onUpdateTrip({ budget: t })}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all ${
                      trip.budget === t
                        ? 'bg-[#0F172A] dark:bg-white text-white dark:text-slate-900 shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    {t === 'high' ? 'Private Luxury' : t === 'medium' ? 'Signature' : 'Essential'}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={onLaunchConcierge}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B38E46] text-white font-serif font-bold text-base shadow-xl shadow-[#D4AF37]/25 hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center space-x-3"
            >
              <span>Craft Personalized Itinerary</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>

        </div>
      </section>

      {/* 3. Curated Destination Gallery Section */}
      <section id="destinations" className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 dark:border-white/10 pb-6">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-widest block mb-2">Curated Journeys</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100">
                Explore Iconic Stays & Cities
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
              Tap any destination to instantly populate parameters and generate an interactive 2D visual timeline.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {destinations.map((dest, i) => (
              <div
                key={i}
                onClick={() => handleSelectDestination(dest.name)}
                className="group relative rounded-3xl overflow-hidden glass-card hover-lift cursor-pointer flex flex-col justify-between"
              >
                {/* Photo Container */}
                <div className="relative h-72 overflow-hidden">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                  
                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-[10px] font-bold text-[#D4AF37] tracking-wider uppercase shadow-md">
                      {dest.tag}
                    </span>
                    <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-900 dark:text-slate-100 font-bold text-xs shadow-md">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>{dest.rating}</span>
                    </div>
                  </div>

                  {/* Bottom Photo Overlay Info */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-widest block">{dest.country}</span>
                    <h3 className="font-serif font-bold text-2xl group-hover:text-[#D4AF37] transition-colors">{dest.name}</h3>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {dest.desc}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/10 text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-semibold">{dest.weather}</span>
                    <span className="font-semibold text-[#D4AF37] group-hover:translate-x-1 transition-transform flex items-center">
                      Plan Trip <ChevronRight className="w-4 h-4 ml-0.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. AI Multi-Agent Intelligence Section */}
      <section id="intelligence" className="py-24 px-6 bg-white dark:bg-[#0E131F] border-y border-slate-200/80 dark:border-white/10 transition-colors">
        <div className="max-w-6xl mx-auto space-y-16">
          
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-widest block">System Intelligence</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100">
              Under the Hood: LangGraph & Weather Sync
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Engineered with production FastAPI microservices, Open-Meteo geocoding, and Gemini 3.5 LLMs.
            </p>
          </div>

          {/* Interactive Feature Tabs */}
          <div className="space-y-8">
            <div className="flex justify-center space-x-2">
              {[
                { id: 'weather', label: '1. Weather Alignment Engine' },
                { id: 'graph', label: '2. LangGraph Execution State' },
                { id: 'budget', label: '3. Real-Time Budget Gauge' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFeatureTab(tab.id as any)}
                  className={`px-5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                    activeFeatureTab === tab.id
                      ? 'bg-[#0F172A] dark:bg-white text-white dark:text-slate-900 shadow-md'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Feature Content Panel */}
            <div className="glass-card rounded-3xl p-8 max-w-4xl mx-auto border border-slate-200/80 dark:border-white/10">
              {activeFeatureTab === 'weather' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-4 text-left">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                      <Sun className="w-5 h-5" />
                    </div>
                    <h3 className="font-serif font-bold text-xl text-slate-900 dark:text-slate-100">
                      Live Precipitation & Sunshine Adaptation
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Queries Open-Meteo geocoding APIs dynamically for origin and destination coordinates. Automatically schedules covered markets and art galleries during rainy days.
                    </p>
                    <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span>Automatic outdoor-to-indoor event swapping</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span>Upstash Redis RAM cache (&lt; 2ms latency)</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#141A26] border border-slate-200 dark:border-slate-800 space-y-3 font-mono text-xs">
                    <div className="flex justify-between text-[10px] text-slate-400 border-b pb-2">
                      <span>Open-Meteo Live Payload</span>
                      <span className="text-emerald-500 font-bold">CACHE HIT</span>
                    </div>
                    <div className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                      <code>
                        {`{
  "location": "Paris",
  "forecast": "17°C, Scattered Rain",
  "aligned_activities": [
    "Louvre VIP Tour (Indoor)",
    "Bistro Paul Bert (Dining)"
  ]
}`}
                      </code>
                    </div>
                  </div>
                </div>
              )}

              {activeFeatureTab === 'graph' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-4 text-left">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <h3 className="font-serif font-bold text-xl text-slate-900 dark:text-slate-100">
                      StateGraph State Machine Execution
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      LangGraph orchestrates node transitions from <code className="text-[#D4AF37]">START</code> ➔ <code className="text-[#D4AF37]">weather_node</code> ➔ <code className="text-[#D4AF37]">llm_node</code> ➔ <code className="text-[#D4AF37]">END</code>.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#141A26] border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800 border">
                      <span className="font-semibold">weather_node</span>
                      <span className="text-[10px] text-emerald-500 font-mono">Completed (142ms)</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800 border">
                      <span className="font-semibold">llm_node (Gemini 3.5)</span>
                      <span className="text-[10px] text-emerald-500 font-mono">Completed (820ms)</span>
                    </div>
                  </div>
                </div>
              )}

              {activeFeatureTab === 'budget' && (
                <div className="space-y-4 text-left">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif font-bold text-xl text-slate-900 dark:text-slate-100">
                    Bespoke Cost Tiering & Expense Monitoring
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Calculates detailed daily expense estimates across Michelin dining, private chauffeurs, museum passes, and luxury stays.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* 5. Footer */}
      <footer className="mt-auto py-12 px-6 bg-slate-900 text-white transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center text-white font-bold">
              S
            </div>
            <span className="font-serif font-bold text-base text-white">SOJOURN</span>
            <span>— AI Luxury Travel Concierge</span>
          </div>

          <div className="flex items-center space-x-6">
            <span>FastAPI + LangGraph</span>
            <span>•</span>
            <span>Upstash Redis RAM Cache</span>
          </div>

        </div>
      </footer>

    </div>
  );
};
