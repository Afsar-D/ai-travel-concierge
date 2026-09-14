import React, { useState } from 'react';
import { X, Calendar, FileText, Copy, Check, Download, Sparkles } from 'lucide-react';
import type { ItineraryDay, TripState } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  days: ItineraryDay[];
  trip: TripState;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  days,
  trip
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateMarkdownString = () => {
    let md = `# ✈️ ODYSSEY AI Travel Itinerary: ${trip.origin} ➔ ${trip.destination}\n`;
    md += `**Dates:** ${trip.start_date} to ${trip.end_date} | **Travelers:** ${trip.guest_count} | **Tier:** ${trip.budget.toUpperCase()}\n\n`;

    days.forEach(day => {
      md += `### Day ${day.dayNumber} — ${day.date} (${day.weather.temp}, ${day.weather.condition})\n`;
      day.activities.forEach(act => {
        md += `- **${act.time}**: ${act.title} [${act.category}] — *${act.estimatedCost}*\n  ${act.description}\n`;
      });
      md += `\n`;
    });

    return md;
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generateMarkdownString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadICS = () => {
    let icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//ODYSSEY AI//Exclusive Luxury Travel Concierge//EN\n`;
    days.forEach(day => {
      day.activities.forEach(act => {
        icsContent += `BEGIN:VEVENT\nSUMMARY:${act.title} (${trip.destination})\nDESCRIPTION:${act.description}\nLOCATION:${act.location}\nEND:VEVENT\n`;
      });
    });
    icsContent += `END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Odyssey_${trip.destination}_Itinerary.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080B11]/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-[#121722] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6 text-white">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#3B82F6]" />
            <h3 className="font-bold text-lg text-white">
              Export Your Journey
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-3">
          
          {/* Copy Markdown */}
          <button
            onClick={handleCopyMarkdown}
            className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between hover:border-[#3B82F6] transition-all group text-left"
          >
            <div className="flex items-center space-x-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#3B82F6] shadow-sm">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-white block">
                  Copy Formatted Markdown
                </span>
                <span className="text-xs text-slate-400">
                  Ideal for pasting into Notion, Apple Notes, or email summaries.
                </span>
              </div>
            </div>
            {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5 text-slate-400 group-hover:text-[#3B82F6]" />}
          </button>

          {/* Download ICS Calendar */}
          <button
            onClick={handleDownloadICS}
            className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between hover:border-[#3B82F6] transition-all group text-left"
          >
            <div className="flex items-center space-x-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#3B82F6] shadow-sm">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-white block">
                  Export iCalendar File (.ics)
                </span>
                <span className="text-xs text-slate-400">
                  Imports directly into Apple Calendar, Google Calendar, or Outlook.
                </span>
              </div>
            </div>
            <Download className="w-5 h-5 text-slate-400 group-hover:text-[#3B82F6]" />
          </button>

        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/10 transition-all"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
};


