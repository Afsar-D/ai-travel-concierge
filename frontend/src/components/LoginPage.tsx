import React, { useState } from 'react';
import { Globe, ArrowRight, Lock, Mail, User, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import type { UserProfile } from '../types';
import { loginUser, registerUser } from '../services/api';

interface LoginPageProps {
  onLogin: (user: UserProfile) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      if (authMode === 'signup') {
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          setIsLoading(false);
          return;
        }
        const displayName = name.trim() || email.split('@')[0];
        const loggedInUser = await registerUser(displayName, email.trim(), password);
        setSuccessMsg('Account created successfully!');
        setTimeout(() => {
          onLogin(loggedInUser);
        }, 400);
      } else {
        const loggedInUser = await loginUser(email.trim(), password);
        onLogin(loggedInUser);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
      <div className="relative z-10 w-full max-w-md glass-panel-dark rounded-3xl p-8 border border-white/15 shadow-2xl space-y-6 backdrop-blur-2xl">
        
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

        {/* Tab Switcher (Sign In vs Sign Up) */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setAuthMode('signin'); setError(null); setSuccessMsg(null); }}
            className={`py-2.5 rounded-xl transition-all duration-300 cursor-pointer ${
              authMode === 'signin'
                ? 'bg-white/20 text-white font-bold shadow-md border border-white/15'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('signup'); setError(null); setSuccessMsg(null); }}
            className={`py-2.5 rounded-xl transition-all duration-300 cursor-pointer ${
              authMode === 'signup'
                ? 'bg-white/20 text-white font-bold shadow-md border border-white/15'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center space-x-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center space-x-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {authMode === 'signup' && (
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Full Name</label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-white/30 transition-all duration-300"
                  placeholder="e.g. Anney Vance"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (error) setError(null); }}
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
                onChange={(e) => { setPassword(e.target.value); if (error) setError(null); }}
                required
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-white/30 transition-all duration-300"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          {authMode === 'signup' && (
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Confirm Password</label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); if (error) setError(null); }}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-white/30 transition-all duration-300"
                  placeholder="••••••••••••"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-2xl bg-white/15 hover:bg-white/25 disabled:opacity-50 border border-white/20 text-white font-bold text-sm shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex items-center justify-center space-x-2 mt-4 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 text-[#D4B886] animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>{authMode === 'signin' ? 'Sign In to Experience' : 'Create & Access Account'}</span>
                <ArrowRight className="w-4 h-4 text-[#D4B886]" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};



