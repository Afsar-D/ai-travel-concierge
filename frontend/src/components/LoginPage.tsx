import React, { useState } from 'react';
import { Globe, Sparkles, ArrowRight, Lock, Mail } from 'lucide-react';
import type { UserProfile } from '../types';

interface LoginPageProps {
  onLogin: (user: UserProfile) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nameFromEmail = email ? email.split('@')[0] : 'Traveler';
    const capitalizedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
    onLogin({
      name: capitalizedName,
      email: email || 'traveler@odyssey.luxury',
    });
  };

  return (
    <div className="relative min-h-screen w-screen flex items-center justify-center p-6 bg-[#080B11] text-white font-sans overflow-hidden selection:bg-white/20">
      
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=2000&q=90"
          alt="Luxury Travel Background"
          className="w-full h-full object-cover opacity-25 filter brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080B11] via-[#080B11]/70 to-[#080B11]/40" />
      </div>

      {/* Login Glass Card */}
      <div className="relative z-10 w-full max-w-md glass-panel-dark rounded-3xl p-8 border border-white/15 shadow-2xl space-y-8 backdrop-blur-2xl">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md mx-auto flex items-center justify-center text-[#D4B886] shadow-xl">
            <Globe className="w-7 h-7 animate-pulse text-[#D4B886]" />
          </div>
          <div>
            <h1 className="font-extrabold text-3xl tracking-tight text-white uppercase drop-shadow-md">
              ODYSSEY <span className="text-[#D4B886]">AI</span>
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mt-0.5">
              Exclusive Horizon & Journey Planner
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-white/30 transition-all duration-300"
                placeholder="anney@odyssey.luxury"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Password</label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-white/30 transition-all duration-300"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-bold text-sm shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex items-center justify-center space-x-2 mt-4"
          >
            <span>Sign In to Experience</span>
            <ArrowRight className="w-4 h-4 text-[#D4B886]" />
          </button>
        </form>

        {/* Quick Demo Login Option */}
        <div className="pt-2 border-t border-white/10 text-center">
          <button
            type="button"
            onClick={() => onLogin({ name: 'Anney', email: 'anney@odyssey.luxury' })}
            className="text-xs text-slate-400 hover:text-[#D4B886] transition-colors duration-300 flex items-center justify-center space-x-1.5 mx-auto font-medium"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4B886]" />
            <span>Quick Demo: Sign In as <strong>Hello, Anney !</strong></span>
          </button>
        </div>

      </div>
    </div>
  );
};



