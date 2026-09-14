import React, { useState, useRef, useEffect } from 'react';
import { Send, Compass, Sparkles, Bot, User } from 'lucide-react';
import type { ChatMessage, TripState } from '../types';

interface ChatWorkspaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  trip: TripState;
  backendConnected: boolean;
}

export const ChatWorkspace: React.FC<ChatWorkspaceProps> = ({
  messages,
  onSendMessage,
  isLoading,
  trip,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const quickPrompts = [
    `🍷 Recommend top Michelin dining options in ${trip.destination}`,
    `☔ Suggest rain-proof indoor activities for our dates`,
    `🚖 How should we travel between ${trip.origin} and ${trip.destination}?`,
    `🏛️ Add iconic historical landmarks for Day 2`,
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAFAFA] dark:bg-[#0B0F17] overflow-hidden">
      
      {/* Backend Status Header Ribbon */}
      <div className="px-6 py-2 bg-white/80 dark:bg-[#141A26]/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            SOJOURN AI Concierge Engine
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono">
            FastAPI + LangGraph + Gemini 3.5
          </span>
        </div>
        <div className="flex items-center space-x-3 text-[11px] text-slate-500 dark:text-slate-400">
          <span>Target: <strong className="text-slate-900 dark:text-slate-200">{trip.origin} ➔ {trip.destination}</strong></span>
          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
          <span className="capitalize">{trip.budget} Tier</span>
        </div>
      </div>

      {/* Messages Scroll View */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#B38E46] flex items-center justify-center text-white shadow-xl shadow-[#D4AF37]/20 mb-4">
              <Compass className="w-8 h-8 animate-spin" style={{ animationDuration: '12s' }} />
            </div>
            <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Welcome to SOJOURN
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              Your bespoke multi-agent travel concierge. Specify your origin, destination, and budget parameters above, then click <strong>Generate Itinerary</strong> or ask any custom travel question below.
            </p>
            
            <div className="w-full space-y-2">
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider block mb-2">
                Quick Recommendations
              </span>
              <div className="grid grid-cols-1 gap-2 text-left">
                {quickPrompts.slice(0, 3).map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(prompt)}
                    className="p-3 rounded-xl bg-white dark:bg-[#141A26] border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 hover:border-[#D4AF37] dark:hover:border-[#D4AF37] transition-all shadow-sm flex items-center justify-between group"
                  >
                    <span>{prompt}</span>
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${
                msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'bg-[#D4AF37] text-white shadow-sm'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-3xl rounded-2xl p-4 text-xs leading-relaxed shadow-sm transition-colors ${
                  msg.sender === 'user'
                    ? 'bg-[#0F172A] text-white dark:bg-[#1E2638] dark:text-slate-100 rounded-tr-none'
                    : 'bg-white dark:bg-[#141A26] border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5 opacity-70">
                  <span className="font-semibold text-[10px] uppercase tracking-wider">
                    {msg.sender === 'user' ? 'You' : 'SOJOURN Concierge'}
                  </span>
                  <span className="text-[10px]">{msg.timestamp}</span>
                </div>

                {/* Content Renderer */}
                <div className="prose prose-xs dark:prose-invert max-w-none whitespace-pre-line">
                  {msg.content}
                </div>

                {msg.status === 'sending' && (
                  <div className="mt-2 flex items-center space-x-1.5 text-[10px] text-[#D4AF37]">
                    <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping" />
                    <span>Processing live weather & route data...</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-xl bg-[#D4AF37] flex items-center justify-center text-white shrink-0 shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white dark:bg-[#141A26] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm text-xs">
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 ml-2">
                  Synthesizing weather-aligned itinerary...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Dock */}
      {messages.length > 0 && (
        <div className="px-6 py-2 bg-white/60 dark:bg-[#141A26]/60 border-t border-slate-200/40 dark:border-slate-800 flex items-center space-x-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-semibold uppercase text-slate-400 dark:text-slate-400 shrink-0">
            Refine:
          </span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => onSendMessage(prompt)}
              className="px-3 py-1 rounded-full bg-slate-100 dark:bg-[#1E2638] text-slate-700 dark:text-slate-300 text-[11px] hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0 border border-slate-200/60 dark:border-slate-700/60"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input Form Bar */}
      <div className="p-4 bg-white dark:bg-[#141A26] border-t border-slate-200 dark:border-slate-800">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <textarea
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={`Ask SOJOURN about ${trip.destination}, dining, transport, or weather...`}
            className="w-full pl-4 pr-12 py-3 rounded-2xl bg-slate-50 dark:bg-[#1E2638] border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#D4AF37] dark:focus:border-[#D4AF37] transition-all resize-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="absolute right-2 p-2 rounded-xl bg-[#D4AF37] text-white hover:bg-[#B38E46] transition-all disabled:opacity-40 disabled:hover:bg-[#D4AF37] shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
