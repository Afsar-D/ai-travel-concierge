import React from 'react';
import { 
  Compass, 
  MessageSquare, 
  Calendar, 
  Plane, 
  Activity, 
  Sun, 
  Moon, 
  History, 
  Sparkles,
  ChevronDown,
  Home
} from 'lucide-react';

interface SidebarProps {
  activeTab: 'chat' | 'itinerary' | 'inventory' | 'telemetry';
  setActiveTab: (tab: 'chat' | 'itinerary' | 'inventory' | 'telemetry') => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  savedSessions: { id: string; name: string; date: string }[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onNewTrip: () => void;
  onReturnToLanding: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isDarkMode,
  toggleDarkMode,
  savedSessions,
  currentSessionId,
  onSelectSession,
  onNewTrip,
  onReturnToLanding
}) => {
  const [showHistory, setShowHistory] = React.useState(false);

  return (
    <aside className="w-64 bg-white dark:bg-[#141A26] border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0 z-30 transition-colors duration-300">
      <div>
        {/* Brand Header */}
        <div 
          onClick={onReturnToLanding}
          className="h-16 px-6 flex items-center space-x-3 border-b border-slate-100 dark:border-slate-800/60 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B38E46] flex items-center justify-center text-white shadow-md shadow-[#D4AF37]/15 shrink-0">
            <Compass className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold text-base tracking-tight text-slate-900 dark:text-slate-50">
              SOJOURN
            </span>
            <span className="text-[9px] uppercase tracking-widest font-semibold text-[#D4AF37] -mt-0.5">
              Luxury AI Concierge
            </span>
          </div>
        </div>

        {/* Action Buttons: Return Home & New Trip */}
        <div className="p-3 space-y-2">
          <button
            onClick={onReturnToLanding}
            className="w-full flex items-center justify-center px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#1E2638] text-slate-700 dark:text-slate-200 font-medium text-xs border border-slate-200/80 dark:border-slate-700/60 hover:border-[#D4AF37] transition-all"
          >
            <Home className="w-3.5 h-3.5 mr-2 text-[#D4AF37]" />
            <span>Landing & Showcase</span>
          </button>

          <button
            onClick={onNewTrip}
            className="w-full flex items-center justify-center px-4 py-2.5 rounded-xl bg-[#0F172A] dark:bg-[#F8FAFC] text-white dark:text-slate-900 font-medium text-xs shadow-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition-all duration-200 active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5 mr-2 text-[#D4AF37]" />
            <span>New Itinerary Plan</span>
          </button>
        </div>

        {/* Primary Navigation Links */}
        <nav className="px-3 py-1 space-y-1">
          <button
            onClick={() => setActiveTab('chat')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
              activeTab === 'chat'
                ? 'bg-[#F5F2EB] dark:bg-[#1E2638] text-[#B38E46] dark:text-[#D4AF37] shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span>Agent Workspace</span>
            </div>
            {activeTab === 'chat' && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('itinerary')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
              activeTab === 'itinerary'
                ? 'bg-[#F5F2EB] dark:bg-[#1E2638] text-[#B38E46] dark:text-[#D4AF37] shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Itinerary Canvas</span>
            </div>
            {activeTab === 'itinerary' && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
              activeTab === 'inventory'
                ? 'bg-[#F5F2EB] dark:bg-[#1E2638] text-[#B38E46] dark:text-[#D4AF37] shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Plane className="w-4 h-4 shrink-0" />
              <span>Flights & Lodging</span>
            </div>
            {activeTab === 'inventory' && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('telemetry')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
              activeTab === 'telemetry'
                ? 'bg-[#F5F2EB] dark:bg-[#1E2638] text-[#B38E46] dark:text-[#D4AF37] shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Activity className="w-4 h-4 shrink-0" />
              <span>System Telemetry</span>
            </div>
            {activeTab === 'telemetry' && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
            )}
          </button>
        </nav>

        {/* Saved Trips History Dropdown */}
        <div className="px-3 pt-4">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <History className="w-3.5 h-3.5" />
              <span>Saved Journeys ({savedSessions.length})</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showHistory ? 'rotate-180' : ''}`} />
          </button>

          {showHistory && (
            <div className="mt-1 space-y-1 max-h-36 overflow-y-auto pr-1">
              {savedSessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs truncate transition-all ${
                    currentSessionId === session.id
                      ? 'bg-[#F5F2EB] dark:bg-[#1E2638] text-[#B38E46] dark:text-[#D4AF37] font-medium'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="font-medium truncate">{session.name}</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500">{session.date}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Profile & Theme Controls */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/60 space-y-2">
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
        >
          <div className="flex items-center space-x-2.5">
            {isDarkMode ? <Sun className="w-4 h-4 text-[#D4AF37]" /> : <Moon className="w-4 h-4 text-slate-600" />}
            <span>{isDarkMode ? 'Light Luxury' : 'Obsidian Mode'}</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            Shift
          </span>
        </button>

        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#1E2638]/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#B38E46] dark:text-[#D4AF37] font-bold text-xs">
              M
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">Private Member</span>
              <span className="text-[9px] text-slate-400 dark:text-slate-400">Signature Tier</span>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500" title="API Connected" />
        </div>
      </div>
    </aside>
  );
};
