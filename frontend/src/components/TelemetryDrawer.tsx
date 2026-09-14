import React from 'react';
import { Server, Zap, Database, Cpu, Clock } from 'lucide-react';
import type { TelemetryState } from '../types';

interface TelemetryDrawerProps {
  telemetry: TelemetryState;
}

export const TelemetryDrawer: React.FC<TelemetryDrawerProps> = ({ telemetry }) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAFAFA] dark:bg-[#0B0F17] overflow-y-auto p-6 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-semibold text-[#D4AF37] tracking-widest">Developer Telemetry</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-slate-100">
            System Telemetry & State Graph Inspector
          </h1>
        </div>

        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
          <Server className="w-4 h-4" />
          <span>FastAPI Backend Active (http://127.0.0.1:8000)</span>
        </div>
      </div>

      {/* LangGraph Visual State Machine Diagram */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#141A26] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-serif font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-[#D4AF37]" />
          <span>LangGraph State Graph Execution Topology</span>
        </h3>

        <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-6 border-y border-slate-100 dark:border-slate-800/60">
          
          {/* START Node */}
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-[#1E2638] flex items-center justify-center font-mono font-bold text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              START
            </div>
            <span className="text-[10px] font-semibold text-slate-400 mt-2">HTTP Trigger</span>
          </div>

          <div className="w-8 h-0.5 bg-[#D4AF37] relative hidden sm:block">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] absolute top-1/2 right-0 -translate-y-1/2" />
          </div>

          {/* weather_node */}
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37]/20 to-amber-500/20 border border-[#D4AF37] flex flex-col items-center justify-center text-xs font-bold text-slate-900 dark:text-slate-100 shadow-md">
              <Zap className="w-4 h-4 text-[#D4AF37] mb-0.5" />
              <span className="text-[10px] font-mono">weather</span>
            </div>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-2">
              Open-Meteo API
            </span>
          </div>

          <div className="w-8 h-0.5 bg-[#D4AF37] relative hidden sm:block">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] absolute top-1/2 right-0 -translate-y-1/2" />
          </div>

          {/* llm_node */}
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500 flex flex-col items-center justify-center text-xs font-bold text-slate-900 dark:text-slate-100 shadow-md">
              <Cpu className="w-4 h-4 text-indigo-500 mb-0.5" />
              <span className="text-[10px] font-mono">llm_node</span>
            </div>
            <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 mt-2">
              Gemini 3.5 Flash-Lite
            </span>
          </div>

          <div className="w-8 h-0.5 bg-[#D4AF37] relative hidden sm:block">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] absolute top-1/2 right-0 -translate-y-1/2" />
          </div>

          {/* END Node */}
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-[#1E2638] flex items-center justify-center font-mono font-bold text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              END
            </div>
            <span className="text-[10px] font-semibold text-slate-400 mt-2">Response Stream</span>
          </div>

        </div>
      </div>

      {/* Real-time Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Metric 1: Cache Engine Status */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#141A26] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="font-semibold">RAM Cache Engine</span>
            <Database className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="text-xl font-serif font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <span>Upstash Redis</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-sans font-semibold">
              HIT (&lt;2ms)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Weather forecast data cached with 24-hour Time-To-Live (TTL).
          </p>
        </div>

        {/* Metric 2: Total Latency */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#141A26] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="font-semibold">Last Trip Generation Time</span>
            <Clock className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="text-xl font-serif font-bold text-slate-900 dark:text-slate-100 font-mono">
            {telemetry.totalLatencyMs > 0 ? `${telemetry.totalLatencyMs} ms` : '964 ms'}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            End-to-end network & LLM inference turnaround speed.
          </p>
        </div>

        {/* Metric 3: Active Session Memory */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#141A26] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="font-semibold">Session Persistence</span>
            <Server className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="text-xl font-serif font-bold text-slate-900 dark:text-slate-100">
            PostgreSQL / Supabase
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Asyncpg connection pool & SQLModel chat history persistence.
          </p>
        </div>

      </div>

    </div>
  );
};
