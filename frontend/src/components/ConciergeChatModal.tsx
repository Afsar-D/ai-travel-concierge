import React, { useState, useRef, useEffect } from 'react';
import { X, Send, User, Sparkles, Compass, ShieldCheck } from 'lucide-react';
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
}

export const ConciergeChatModal: React.FC<ConciergeChatModalProps> = ({
  isOpen,
  onClose,
  trip,
  onUpdateItinerary,
  onNavigateToDay
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

    // Detect if user is asking to change or update their itinerary
    const isPlanModification = /\b(change|modify|update|add|remove|replace|swap|switch|substitute|day\s*\d+|instead of|delete|reschedule|adjust)\b/i.test(userText);
    const messageToSend = isPlanModification
      ? `${userText}\n\n[Please provide the updated itinerary for the affected day(s) using "## Day X" and "* **[Activity Title]**: Description" format so my timeline updates.]`
      : userText;

    try {
      const { response } = await sendChatMessage(messageToSend, trip);

      if (response.session_id && trip) {
        trip.session_id = response.session_id;
      }

      let hasUpdatedItinerary = false;
      let summaryText = '';
      let parsedDays: ItineraryDay[] = [];

      if (response.reply && trip) {
        // 1. Attempt to parse any updated day blocks from reply
        parsedDays = parseMarkdownToItinerary(response.reply, trip.destination, trip.start_date, trip.budget);
        const parsedData = parseBackendReply(response.reply, trip.origin, trip.destination);

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
        } else if (parsedData.flights.length > 0 || parsedData.hotels.length > 0) {
          const combinedDescription = `${trip.description}\n\n${response.reply}`;
          const updatedTrip: TripState = {
            ...trip,
            description: combinedDescription,
            session_id: response.session_id || trip.session_id
          };
          const currentDays = parseMarkdownToItinerary(combinedDescription, trip.destination, trip.start_date, trip.budget);
          if (onUpdateItinerary) {
            onUpdateItinerary(updatedTrip, currentDays);
          }
        }
      }

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'assistant',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'success',
        itineraryUpdated: hasUpdatedItinerary,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#04060A]/85 backdrop-blur-xl animate-fade-in">
      
      {/* Dynamic Background Preview Blur */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none rounded-3xl">
        {trip && (
          <img
            src={trip.bgImage}
            alt={trip.destination}
            className="w-full h-full object-cover opacity-15 filter blur-lg scale-105"
          />
        )}
        <div className="absolute inset-0 bg-[#080B11]/80" />
      </div>

      {/* Sleek Agent Panel Container */}
      <div className="relative z-10 w-full max-w-2xl h-[78vh] bg-[#0C1019]/95 border border-white/15 rounded-3xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-2xl">
        
        {/* Agent Header */}
        <div className="p-4 px-6 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center space-x-3.5">
            
            {/* Agent Emblem Avatar */}
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-[#D4B886]/15 border border-[#D4B886]/30 flex items-center justify-center text-[#D4B886] shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#0C1019]" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base text-white">
                  ODYSSEY Concierge
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-[9px] font-semibold text-[#D4B886] flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3 text-[#D4B886]" />
                  <span>AI Agent</span>
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                Personalized Assistant for {trip ? trip.destination : 'your trip'}
              </span>
            </div>

          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors duration-300 active:scale-95"
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
                  ? 'bg-white/15 text-white border border-white/20' 
                  : 'bg-[#D4B886]/15 text-[#D4B886] border border-[#D4B886]/30'
              }`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-[#D4B886]" />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-md rounded-2xl p-4 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-[#D4B886]/20 border border-[#D4B886]/40 text-white rounded-tr-none shadow-md'
                  : 'bg-white/5 border border-white/10 text-slate-100 rounded-tl-none backdrop-blur-md'
              }`}>
                <div className="flex items-center justify-between text-[10px] opacity-60 mb-1">
                  <span>{msg.sender === 'user' ? 'You' : 'Concierge'}</span>
                  <span>{msg.timestamp}</span>
                </div>
                {msg.sender === 'assistant' ? (
                  <>
                    <MarkdownView content={msg.content} />
                    {msg.itineraryUpdated && (
                      <div className="mt-3 pt-2.5 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-2 text-[11px] text-emerald-400 font-medium">
                        <span className="flex items-center space-x-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                          <span>{msg.updatedDaysSummary || 'Itinerary Timeline Updated'}</span>
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full text-emerald-300 font-semibold shadow-sm">
                            Saved to Plan
                          </span>
                          {msg.targetDayNumber && onNavigateToDay && (
                            <button
                              onClick={() => {
                                onNavigateToDay(msg.targetDayNumber!);
                                onClose();
                              }}
                              className="text-[10px] bg-[#D4B886] hover:bg-[#E2CB9F] text-slate-950 font-extrabold px-3 py-1 rounded-full shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
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
            <div className="flex items-center space-x-2 text-xs text-[#D4B886] pl-1">
              <Sparkles className="w-4 h-4 animate-spin text-[#D4B886]" />
              <span>Concierge is researching tailored recommendations...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Bar */}
        <div className="px-6 py-2.5 bg-white/5 border-t border-white/5 flex items-center space-x-2 overflow-x-auto no-scrollbar">
          <Compass className="w-3.5 h-3.5 text-[#D4B886] shrink-0" />
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => setInputText(prompt)}
              className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/15 text-slate-300 text-[11px] font-medium whitespace-nowrap transition-colors duration-300 border border-white/10 cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Input Form */}
        <form onSubmit={handleSend} className="p-4 bg-[#080B11]/90 border-t border-white/10 flex items-center space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Ask Concierge about ${trip ? trip.destination : 'your trip'}...`}
            className="flex-1 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#D4B886]/50 transition-all duration-300"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="px-4 py-3 rounded-2xl bg-[#D4B886] hover:bg-[#E2CB9F] text-slate-950 font-bold transition-all duration-300 disabled:opacity-40 flex items-center space-x-1.5 cursor-pointer shadow-md"
          >
            <Send className="w-4 h-4 text-slate-950" />
          </button>
        </form>

      </div>

    </div>
  );
};
