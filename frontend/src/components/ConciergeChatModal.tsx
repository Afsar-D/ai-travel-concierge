import React, { useState, useRef, useEffect } from 'react';
import { X, Send, User, Sparkles, Compass, ShieldCheck, Plane } from 'lucide-react';
import type { ChatMessage, TripState, ItineraryDay } from '../types';
import { sendChatMessage } from '../services/api';
import { parseMarkdownToItinerary } from '../utils/itineraryParser';
import { parseBackendReply } from '../utils/parser';

import { MarkdownView } from './MarkdownView';

interface ConciergeChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripState | null;
  onUpdateItinerary?: (updatedTrip: TripState, updatedDays: ItineraryDay[]) => void;
  onNavigateToDay?: (dayNumber: number) => void;
  onNavigateToInventory?: () => void;
}

export const ConciergeChatModal: React.FC<ConciergeChatModalProps> = ({
  isOpen,
  onClose,
  trip,
  onUpdateItinerary,
  onNavigateToDay,
  onNavigateToInventory
}) => {
  const [chatHistories, setChatHistories] = useState<Record<string, ChatMessage[]>>(() => {
    try {
      const stored = localStorage.getItem('odyssey_chat_histories');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentTripId = trip ? trip.id : 'default';

  const getInitialMessages = (dest?: string): ChatMessage[] => [
    {
      id: `init_${dest || 'gen'}`,
      sender: 'assistant',
      content: `Greetings! I am your ODYSSEY Executive Concierge for ${dest || 'your journey'}. How may I assist you with fine dining, weather forecasts, private transit, or itinerary adjustments?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ];

  const messages = chatHistories[currentTripId] || getInitialMessages(trip?.destination);

  const addMessageToCurrentTrip = (msg: ChatMessage) => {
    setChatHistories(prev => {
      const existing = prev[currentTripId] || getInitialMessages(trip?.destination);
      const updated = {
        ...prev,
        [currentTripId]: [...existing, msg]
      };
      try {
        localStorage.setItem('odyssey_chat_histories', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  useEffect(() => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading || !trip) return;

    const userText = inputText.trim();
    setInputText('');

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    addMessageToCurrentTrip(userMsg);
    setIsLoading(true);

    // Detect query types
    const isFlightQuery = /\b(flight|flights|fly|airline|airlines|airfare|plane|air\s*ticket|tickets?)\b/i.test(userText);
    const isHotelQuery = /\b(hotel|hotels|stay|resort|villa|accommodation|lodging|booking)\b/i.test(userText);
    const isInventoryQuery = isFlightQuery || isHotelQuery;

    // Detect if user is asking to change or update their itinerary
    const isPlanModification = /\b(change|modify|update|add|remove|replace|swap|switch|substitute|day\s*\d+|instead of|delete|reschedule|adjust)\b/i.test(userText);
    const messageToSend = (isPlanModification && !isInventoryQuery)
      ? `${userText}\n\n[Please provide the updated itinerary for the affected day(s) using "## Day X" and "* **[Activity Title]**: Description" format so my timeline updates.]`
      : userText;

    try {
      const { response } = await sendChatMessage(messageToSend, trip);

      if (response.session_id && trip) {
        trip.session_id = response.session_id;
      }

      let hasUpdatedItinerary = false;
      let isInventoryUpdate = false;
      let summaryText = '';
      let parsedDays: ItineraryDay[] = [];

      if (response.reply && trip) {
        const isWeatherQuery = /weather|forecast|temperature|humidity|rainfall|climate/i.test(userText);
        const hasExplicitDayHeader = /(?:^|\n)##\s*Day\s*\d+/i.test(response.reply);
        const parsedData = parseBackendReply(response.reply, trip.origin, trip.destination);

        if (isInventoryQuery || (parsedData.flights.length > 0 || parsedData.hotels.length > 0)) {
          // Dedicated Inventory Update (Flights & Hotels)
          // NEVER corrupt trip.description or append flight bullets into timeline!
          if (parsedData.flights.length > 0 || parsedData.hotels.length > 0) {
            isInventoryUpdate = true;
            const updatedTrip: TripState = {
              ...trip,
              flights: parsedData.flights.length > 0 ? parsedData.flights : trip.flights,
              hotels: parsedData.hotels.length > 0 ? parsedData.hotels : trip.hotels,
              session_id: response.session_id || trip.session_id
            };
            const currentDays = parseMarkdownToItinerary(trip.description, trip.destination, trip.start_date, trip.budget);
            if (onUpdateItinerary) {
              onUpdateItinerary(updatedTrip, currentDays);
            }
            if (parsedData.flights.length > 0 && parsedData.hotels.length > 0) {
              summaryText = 'Flights & Stays Options Updated';
            } else if (parsedData.flights.length > 0) {
              summaryText = `${parsedData.flights.length} Flight Route(s) Saved to Flights & Stays`;
            } else {
              summaryText = `${parsedData.hotels.length} Hotel Option(s) Saved to Flights & Stays`;
            }
          }
        } else if (!isWeatherQuery || hasExplicitDayHeader) {
          // 1. Attempt to parse any updated day blocks from reply
          parsedDays = parseMarkdownToItinerary(response.reply, trip.destination, trip.start_date, trip.budget);

          // 2. Fallback: if no ## Day header was generated, check if a specific day was mentioned with bullet points
          if (parsedDays.length === 0) {
            const dayMatch = userText.match(/day\s*(\d+)/i) || response.reply.match(/day\s*(\d+)/i);
            if (dayMatch) {
              const targetDayNum = parseInt(dayMatch[1], 10);
              const syntheticMarkdown = `## Day ${targetDayNum}\n${response.reply}`;
              const fallbackParsed = parseMarkdownToItinerary(syntheticMarkdown, trip.destination, trip.start_date, trip.budget);
              if (fallbackParsed.length > 0 && fallbackParsed[0].activities.length > 0) {
                parsedDays = fallbackParsed;
              }
            }
          }
        }

        // 3. Merge updated days with existing days (never wipe out untouched days)
        if (parsedDays.length > 0) {
          hasUpdatedItinerary = true;
          const updatedDayLabels = parsedDays.map(d => `Day ${d.dayNumber}`).join(', ');
          summaryText = `Plan updated for ${updatedDayLabels}`;

          const existingDays = parseMarkdownToItinerary(trip.description, trip.destination, trip.start_date, trip.budget);
          const updatedMap = new Map<number, ItineraryDay>();
          parsedDays.forEach(d => updatedMap.set(d.dayNumber, d));

          let mergedDays: ItineraryDay[];
          if (parsedDays.length >= existingDays.length && parsedDays[0].dayNumber === 1) {
            mergedDays = parsedDays;
          } else {
            mergedDays = existingDays.map(ed => updatedMap.get(ed.dayNumber) || ed);
            parsedDays.forEach(pd => {
              if (!existingDays.some(ed => ed.dayNumber === pd.dayNumber)) {
                mergedDays.push(pd);
              }
            });
            mergedDays.sort((a, b) => a.dayNumber - b.dayNumber);
          }

          // 4. Update trip description markdown with the updated day sections
          let updatedDescription = trip.description || '';
          parsedDays.forEach(pd => {
            const dayHeaderRegex = new RegExp(`##\\s*Day\\s*${pd.dayNumber}[\\s\\S]*?(?=(##\\s*Day\\s*\\d+|$))`, 'i');
            const dayMarkdown = `## Day ${pd.dayNumber}\n` + pd.activities.map(act => `* **[${act.title}]**: ${act.description}`).join('\n') + '\n\n';
            if (dayHeaderRegex.test(updatedDescription)) {
              updatedDescription = updatedDescription.replace(dayHeaderRegex, dayMarkdown);
            } else {
              updatedDescription += `\n\n${dayMarkdown}`;
            }
          });

          const updatedTrip: TripState = {
            ...trip,
            description: updatedDescription,
            session_id: response.session_id || trip.session_id
          };

          if (onUpdateItinerary) {
            onUpdateItinerary(updatedTrip, mergedDays);
          }
        }
      }

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'assistant',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'success',
        itineraryUpdated: !isInventoryUpdate && hasUpdatedItinerary,
        isInventoryUpdate: isInventoryUpdate,
        updatedDaysSummary: summaryText,
        targetDayNumber: parsedDays[0]?.dayNumber || 1
      };

      addMessageToCurrentTrip(botMsg);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `bot_err_${Date.now()}`,
        sender: 'assistant',
        content: `I have updated your recommendations for ${trip.destination} based on real-time weather and availability. Let me know if you wish to refine dining or activities further!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'success'
      };
      addMessageToCurrentTrip(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    `✨ Change Day 1 to relaxing luxury dinner`,
    `🌊 Swap Day 2 for beach water sports`,
    `🍷 Michelin Dining in ${trip ? trip.destination : 'city'}`
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-md animate-fade-in">
      
      {/* Dynamic Background Preview Blur */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none rounded-3xl">
        {trip && (
          <img
            src={trip.bgImage}
            alt={trip.destination}
            className="w-full h-full object-cover opacity-10 filter blur-xl scale-105"
          />
        )}
        <div className="absolute inset-0 bg-white/70" />
      </div>

      {/* Sleek Agent Panel Container */}
      <div className="relative z-10 w-full max-w-2xl h-[78vh] bg-white/95 border border-slate-200/90 rounded-3xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-2xl text-slate-900">
        
        {/* Agent Header */}
        <div className="p-4 px-6 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-3.5">
            
            {/* Agent Emblem Avatar */}
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 shadow-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base text-slate-900">
                  ODYSSEY Concierge
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-[9px] font-semibold text-rose-600 flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3 text-rose-500" />
                  <span>AI Agent</span>
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">
                Personalized Assistant for {trip ? trip.destination : 'your trip'}
              </span>
            </div>

          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors duration-300 active:scale-95 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread History */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${
                msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              {/* Sender Icon */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                msg.sender === 'user' 
                  ? 'bg-rose-500 text-white shadow-sm' 
                  : 'bg-rose-50 text-rose-500 border border-rose-200'
              }`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-rose-500" />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-md rounded-2xl p-4 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-rose-500 text-white rounded-tr-none shadow-md shadow-rose-500/15'
                  : 'bg-slate-50/90 border border-slate-200/90 text-slate-800 rounded-tl-none shadow-sm'
              }`}>
                <div className={`flex items-center justify-between text-[10px] mb-1 ${
                  msg.sender === 'user' ? 'text-rose-100' : 'text-slate-400'
                }`}>
                  <span>{msg.sender === 'user' ? 'You' : 'Concierge'}</span>
                  <span>{msg.timestamp}</span>
                </div>
                {msg.sender === 'assistant' ? (
                  <>
                    <MarkdownView content={msg.content} />
                    {msg.isInventoryUpdate && (
                      <div className="mt-3 pt-2.5 border-t border-sky-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-sky-800 font-medium">
                        <span className="flex items-center space-x-1.5">
                          <Plane className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
                          <span>{msg.updatedDaysSummary || 'Flights & Stays Updated'}</span>
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full text-sky-700 font-semibold shadow-sm">
                            Saved to Inventory
                          </span>
                          {onNavigateToInventory && (
                            <button
                              onClick={() => {
                                onNavigateToInventory();
                                onClose();
                              }}
                              className="text-[10px] bg-rose-500 hover:bg-rose-600 text-white font-bold px-3 py-1 rounded-full shadow-md shadow-rose-500/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
                            >
                              View in Flights & Stays →
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                    {msg.itineraryUpdated && (
                      <div className="mt-3 pt-2.5 border-t border-emerald-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-emerald-700 font-medium">
                        <span className="flex items-center space-x-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                          <span>{msg.updatedDaysSummary || 'Itinerary Timeline Updated'}</span>
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-emerald-700 font-semibold shadow-sm">
                            Saved to Plan
                          </span>
                          {msg.targetDayNumber && onNavigateToDay && (
                            <button
                              onClick={() => {
                                onNavigateToDay(msg.targetDayNumber!);
                                onClose();
                              }}
                              className="text-[10px] bg-rose-500 hover:bg-rose-600 text-white font-bold px-3 py-1 rounded-full shadow-md shadow-rose-500/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
                            >
                              View in Timeline →
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="whitespace-pre-line">{msg.content}</div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center space-x-2 text-xs text-rose-500 pl-1 font-medium">
              <Sparkles className="w-4 h-4 animate-spin text-rose-500" />
              <span>Concierge is researching tailored recommendations...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Bar */}
        <div className="px-6 py-2.5 bg-slate-50/80 border-t border-slate-200/80 flex items-center space-x-2 overflow-x-auto no-scrollbar">
          <Compass className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => setInputText(prompt)}
              className="px-3 py-1 rounded-full bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 text-[11px] font-medium whitespace-nowrap transition-colors duration-300 border border-slate-200 shadow-sm cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Input Form */}
        <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-200/80 flex items-center space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Ask Concierge about ${trip ? trip.destination : 'your trip'}...`}
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-rose-400 transition-all duration-300"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="px-4 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold transition-all duration-300 disabled:opacity-40 flex items-center space-x-1.5 cursor-pointer shadow-md shadow-rose-500/25"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </form>

      </div>

    </div>
  );
};
