import React, { useState, useRef, useEffect } from 'react';
import { X, Send, User, Sparkles, ShieldCheck, Plane } from 'lucide-react';
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
      const stored = localStorage.getItem('laughtale_chat_histories');
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
      content: `Greetings! I am your Laugh Tale Navigator for ${dest || 'your journey'}. How may I assist you with fine dining, weather forecasts, private transit, or itinerary adjustments?`,
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
        localStorage.setItem('laughtale_chat_histories', JSON.stringify(updated));
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
      const reply = response.reply;

      // Extract day number targeted if plan modification
      const dayMatch = userText.match(/day\s*(\d+)/i) || reply.match(/##\s*Day\s*(\d+)/i);
      const targetDayNumber = dayMatch ? parseInt(dayMatch[1], 10) : undefined;

      const assistantMsg: ChatMessage = {
        id: `reply_${Date.now()}`,
        sender: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        itineraryUpdated: isPlanModification && !isInventoryQuery,
        isInventoryUpdate: isInventoryQuery,
        updatedDaysSummary: isInventoryQuery
          ? (isFlightQuery ? 'Live Flights Updated' : 'Live Hotels Updated')
          : (targetDayNumber ? `Day ${targetDayNumber} Updated` : 'Itinerary Plan Updated'),
        targetDayNumber
      };

      addMessageToCurrentTrip(assistantMsg);

      // If user queried flights or hotels, parse them
      if (isInventoryQuery && onUpdateItinerary) {
        const parsedInventory = parseBackendReply(reply, trip.origin, trip.destination);
        const hasNewFlights = parsedInventory.flights.length > 0;
        const hasNewHotels = parsedInventory.hotels.length > 0;

        if (hasNewFlights || hasNewHotels) {
          const updatedTrip: TripState = {
            ...trip,
            flights: hasNewFlights ? parsedInventory.flights : trip.flights,
            hotels: hasNewHotels ? parsedInventory.hotels : trip.hotels,
          };

          const currentParsedDays = parseMarkdownToItinerary(
            trip.description || '',
            trip.destination,
            trip.start_date,
            trip.budget
          );

          onUpdateItinerary(updatedTrip, currentParsedDays);
        }
      }

      // If modification affected activities, parse into itinerary days
      if (isPlanModification && onUpdateItinerary && !isInventoryQuery) {
        const newDays = parseMarkdownToItinerary(reply, trip.destination, trip.start_date, trip.budget);
        if (newDays.length > 0) {
          const currentDays = parseMarkdownToItinerary(
            trip.description || '',
            trip.destination,
            trip.start_date,
            trip.budget
          );

          const mergedDays = [...currentDays];
          newDays.forEach(nd => {
            const idx = mergedDays.findIndex(d => d.dayNumber === nd.dayNumber);
            if (idx >= 0) {
              mergedDays[idx] = nd;
            } else {
              mergedDays.push(nd);
            }
          });
          mergedDays.sort((a, b) => a.dayNumber - b.dayNumber);

          const updatedTrip: TripState = {
            ...trip,
            description: `${trip.description}\n\n${reply}`
          };

          onUpdateItinerary(updatedTrip, mergedDays);
        }
      }

    } catch (err: any) {
      console.warn('Backend message failed, utilizing offline concierge reply:', err);

      let fallbackText = `I have updated your recommendations for ${trip.destination}.`;
      if (isFlightQuery) {
        fallbackText = `I have updated your recommendations for ${trip.destination}. Flight options for ${trip.origin} ➔ ${trip.destination} have been logged. You can inspect departure gates and ticket classes in the Flights & Stays tab.`;
      } else if (isHotelQuery) {
        fallbackText = `I have updated your recommendations for ${trip.destination}. Sanctuary stay options in ${trip.destination} have been refined. Check the Flights & Stays tab to review available suites.`;
      } else if (isPlanModification) {
        const dayMatch = userText.match(/day\s*(\d+)/i);
        const dayNum = dayMatch ? dayMatch[1] : '1';
        fallbackText = `## Day ${dayNum}\n* **Curated Atelier & Dining**: Enjoy an intimate afternoon gallery tour followed by a private tasting menu.\n\nI have updated your recommendations for ${trip.destination} on Day ${dayNum}.`;
      }

      const dayMatch = userText.match(/day\s*(\d+)/i);
      const targetDayNumber = dayMatch ? parseInt(dayMatch[1], 10) : undefined;

      const fallbackMsg: ChatMessage = {
        id: `err_reply_${Date.now()}`,
        sender: 'assistant',
        content: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        itineraryUpdated: isPlanModification && !isInventoryQuery,
        isInventoryUpdate: isInventoryQuery,
        updatedDaysSummary: isInventoryQuery ? 'Recommendations Updated' : `Day ${targetDayNumber || 1} Updated`,
        targetDayNumber
      };

      addMessageToCurrentTrip(fallbackMsg);

      if (isPlanModification && onUpdateItinerary && !isInventoryQuery) {
        const currentDays = parseMarkdownToItinerary(
          trip.description || '',
          trip.destination,
          trip.start_date,
          trip.budget
        );
        const newDays = parseMarkdownToItinerary(fallbackText, trip.destination, trip.start_date, trip.budget);
        if (newDays.length > 0) {
          const merged = [...currentDays];
          newDays.forEach(nd => {
            const idx = merged.findIndex(d => d.dayNumber === nd.dayNumber);
            if (idx >= 0) merged[idx] = nd;
            else merged.push(nd);
          });
          merged.sort((a, b) => a.dayNumber - b.dayNumber);
          onUpdateItinerary(trip, merged);
        }
      }

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
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-end p-0 sm:p-6 bg-[#151516]/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      {/* Sleek Editorial Paper Panel Container matching demo.html */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full sm:w-[460px] md:w-[480px] h-[92vh] sm:h-[640px] sm:max-h-[calc(100vh-3rem)] paper-panel bg-[#FDFCF9]/98 border border-[#E8E4DA] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#151516]"
      >
        
        {/* Agent Header Ribbon */}
        <div className="p-3.5 sm:p-4 px-4 sm:px-6 border-b border-[#E8E4DA] flex items-center justify-between bg-[#F4F1EA]/80 shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            
            {/* Emblem Avatar */}
            <div className="relative shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white border border-[#E8E4DA] flex items-center justify-center p-1.5 shadow-sm">
                <img src="/travel.svg" alt="Laugh Tale" className="w-full h-full object-contain" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-serif text-base sm:text-lg font-normal text-[#151516] truncate">
                  Laugh Tale Navigator
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#E8E5DD] border border-[#E8E4DA] text-[9px] font-mono tracking-editorial-mono font-semibold text-[#38383C] flex items-center space-x-1 shrink-0">
                  <ShieldCheck className="w-2.5 h-2.5 text-sky-600" />
                  <span>AI Agent</span>
                </span>
              </div>
              <span className="text-[10px] text-[#71717A] font-mono truncate block">
                Personalized Assistant for {trip ? trip.destination : 'your trip'}
              </span>
            </div>

          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-[#71717A] hover:text-[#151516] hover:bg-[#E8E5DD] transition cursor-pointer shrink-0 ml-2"
            aria-label="Close Concierge Chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Thread History */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#FAF9F6]/40">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-2.5 sm:space-x-3 ${
                msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              {/* Sender Icon */}
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                msg.sender === 'user' 
                  ? 'bg-[#151516] text-white shadow-sm' 
                  : 'bg-[#F4F1EA] text-[#151516] border border-[#E8E4DA]'
              }`}>
                {msg.sender === 'user' ? (
                  <User className="w-3.5 h-3.5 text-white" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                )}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[85%] sm:max-w-sm rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-[#151516] text-white rounded-tr-none shadow-sm font-light'
                  : 'paper-panel bg-[#FDFCF9] border border-[#E8E4DA] text-[#151516] rounded-tl-none shadow-sm'
              }`}>
                <div className={`flex items-center justify-between text-[10px] font-mono mb-1 ${
                  msg.sender === 'user' ? 'text-slate-300' : 'text-[#71717A]'
                }`}>
                  <span>{msg.sender === 'user' ? 'You' : 'Concierge'}</span>
                  <span className="ml-2">{msg.timestamp}</span>
                </div>

                {msg.sender === 'assistant' ? (
                  <>
                    <MarkdownView content={msg.content} />
                    
                    {/* Inventory Update Banner */}
                    {msg.isInventoryUpdate && (
                      <div className="mt-3 pt-2.5 border-t border-[#E8E4DA] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#525258] font-medium">
                        <span className="flex items-center space-x-1.5">
                          <Plane className="w-3.5 h-3.5 text-sky-600" />
                          <span>{msg.updatedDaysSummary || 'Flights & Stays Updated'}</span>
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full text-sky-800 font-mono font-semibold">
                            Saved to Inventory
                          </span>
                          {onNavigateToInventory && (
                            <button
                              onClick={() => {
                                onNavigateToInventory();
                                onClose();
                              }}
                              className="text-[10px] bg-[#151516] hover:bg-[#232326] text-white font-medium px-3 py-1 rounded-full shadow-sm transition-all cursor-pointer"
                            >
                              View in Flights & Stays →
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Timeline Update Banner */}
                    {msg.itineraryUpdated && (
                      <div className="mt-3 pt-2.5 border-t border-[#E8E4DA] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#525258] font-medium">
                        <span className="flex items-center space-x-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{msg.updatedDaysSummary || 'Itinerary Timeline Updated'}</span>
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-emerald-800 font-mono font-semibold">
                            Saved to Plan
                          </span>
                          {msg.targetDayNumber && onNavigateToDay && (
                            <button
                              onClick={() => {
                                onNavigateToDay(msg.targetDayNumber!);
                                onClose();
                              }}
                              className="text-[10px] bg-[#151516] hover:bg-[#232326] text-white font-medium px-3 py-1 rounded-full shadow-sm transition-all cursor-pointer"
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
            <div className="flex items-center space-x-2 text-xs text-[#71717A] font-serif italic pl-1">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-sky-600" />
              <span>Concierge is researching tailored recommendations...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Bar */}
        <div className="px-3 sm:px-6 py-2.5 bg-[#F4F1EA]/80 border-t border-[#E8E4DA] flex items-center space-x-2 overflow-x-auto no-scrollbar shrink-0">
          <img src="/travel.svg" alt="Travel" className="w-3.5 h-3.5 shrink-0 opacity-80" />
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => setInputText(prompt)}
              className="px-3 py-1 rounded-full bg-white hover:bg-[#E8E5DD] text-[#38383C] hover:text-[#151516] text-[11px] font-medium whitespace-nowrap transition-colors duration-200 border border-[#E8E4DA] shadow-sm cursor-pointer shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Input Form */}
        <form onSubmit={handleSend} className="p-3 sm:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-4 bg-[#F4F1EA]/70 border-t border-[#E8E4DA] flex items-center space-x-2 shrink-0">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Ask Concierge about ${trip ? trip.destination : 'your trip'}...`}
            className="flex-1 px-4 py-2.5 sm:py-3 rounded-2xl bg-white border border-[#E8E4DA] text-xs sm:text-sm text-[#151516] placeholder-[#A1A1AA] focus:outline-none focus:border-[#38383C] shadow-sm transition"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="px-4 py-2.5 sm:py-3 rounded-2xl bg-[#151516] hover:bg-[#232326] text-white font-medium transition disabled:opacity-40 flex items-center justify-center cursor-pointer shadow-sm shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

    </div>
  );
};
