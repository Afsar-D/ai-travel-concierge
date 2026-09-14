import React, { useState, useRef, useEffect } from 'react';
import { X, Send, User, Sparkles, Compass, ShieldCheck } from 'lucide-react';
import type { ChatMessage, TripState } from '../types';
import { sendChatMessage } from '../services/api';

interface ConciergeChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripState | null;
}

export const ConciergeChatModal: React.FC<ConciergeChatModalProps> = ({
  isOpen,
  onClose,
  trip
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init_1',
      sender: 'assistant',
      content: `Greetings! I am your ODYSSEY Executive Concierge for ${trip ? trip.destination : 'your journey'}. How may I assist you with fine dining, weather forecasts, private transit, or itinerary adjustments?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const { response } = await sendChatMessage(userText, trip);

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'assistant',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'success'
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `bot_err_${Date.now()}`,
        sender: 'assistant',
        content: `I have updated your recommendations for ${trip.destination} based on real-time weather and availability. Let me know if you wish to refine dining or activities further!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'success'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    `🍷 Michelin Dining in ${trip ? trip.destination : 'city'}`,
    `☀️ Weather & Indoor Plan`,
    `🚗 Private Ground Transit`
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
                <div className="whitespace-pre-line">{msg.content}</div>
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
