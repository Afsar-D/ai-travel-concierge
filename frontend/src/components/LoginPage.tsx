import React, { useState } from 'react';
import { ArrowRight, Lock, Mail, User, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
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
  const [selectedAvatar, setSelectedAvatar] = useState<string>('/man.svg');
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
        try {
          localStorage.setItem(`laughtale_avatar_${loggedInUser.email}`, selectedAvatar);
        } catch {}
        loggedInUser.avatar = selectedAvatar;
        setSuccessMsg('Account created successfully!');
        setTimeout(() => {
          onLogin(loggedInUser);
        }, 400);
      } else {
        const loggedInUser = await loginUser(email.trim(), password);
        try {
          const savedAvatar = localStorage.getItem(`laughtale_avatar_${loggedInUser.email}`);
          if (savedAvatar) {
            loggedInUser.avatar = savedAvatar;
          }
        } catch {}
        onLogin(loggedInUser);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen min-h-[100dvh] w-full flex items-center justify-center p-4 sm:p-6 bg-[#FAF9F6] text-[#151516] font-sans overflow-x-hidden selection:bg-[#EBE7DC] selection:text-[#151516]">
      
      {/* Background Image Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden h-full w-full [transform:translateZ(0)]">
        <img
          src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=2000&q=90"
          alt="Luxury Travel Background"
          className="w-full h-full object-cover filter brightness-95 bg-scale-subtle"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#151516]/50 via-[#FAF9F6]/30 to-[#FAF9F6]/85" />
      </div>

      {/* Login Editorial Paper Card */}
      <div className="relative z-10 w-full max-w-md mx-auto paper-panel rounded-3xl p-6 sm:p-8 border border-[#E8E4DA] shadow-2xl space-y-5 sm:space-y-6 backdrop-blur-xl text-[#151516]">
        
        {/* Brand Header */}
        <div className="text-center space-y-2.5">
          <div className="w-14 h-14 rounded-2xl bg-white/80 border border-[#E8E4DA] shadow-sm mx-auto flex items-center justify-center p-2.5">
            <img src="/travel.svg" alt="Laugh Tale" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#151516] tracking-tight">
              Laugh Tale
            </h1>
            <p className="text-[10px] uppercase font-mono tracking-editorial-mono text-[#71717A] font-semibold mt-1">
              Private Expedition Dossier
            </p>
          </div>
        </div>

        {/* Tab Switcher (Sign In vs Sign Up) */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-[#F4F1EA] border border-[#E8E4DA] text-xs font-mono font-medium">
          <button
            type="button"
            onClick={() => { setAuthMode('signin'); setError(null); setSuccessMsg(null); }}
            className={`py-2 rounded-xl transition-all duration-200 cursor-pointer ${
              authMode === 'signin'
                ? 'bg-[#151516] text-white shadow-sm'
                : 'text-[#71717A] hover:text-[#151516]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('signup'); setError(null); setSuccessMsg(null); }}
            className={`py-2 rounded-xl transition-all duration-200 cursor-pointer ${
              authMode === 'signup'
                ? 'bg-[#151516] text-white shadow-sm'
                : 'text-[#71717A] hover:text-[#151516]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center space-x-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center space-x-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {authMode === 'signup' && (
            <>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono tracking-editorial-mono text-[#71717A] font-semibold">Full Name</label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-[#71717A] absolute left-3.5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-2xl bg-white border border-[#E8E4DA] text-xs text-[#151516] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#151516] focus:ring-1 focus:ring-[#151516] shadow-sm transition-all"
                    placeholder="e.g. Anney Vance"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono tracking-editorial-mono text-[#71717A] font-semibold">Choose Profile Icon</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedAvatar('/man.svg')}
                    className={`flex items-center gap-2.5 p-2 rounded-2xl border transition-all cursor-pointer ${
                      selectedAvatar === '/man.svg'
                        ? 'bg-[#FAF8F5] border-[#151516] ring-1 ring-[#151516] shadow-sm'
                        : 'bg-white border-[#E8E4DA] hover:bg-[#F4F1EA]'
                    }`}
                  >
                    <img src="/man.svg" alt="Gentleman" className="w-7 h-7 rounded-full object-cover p-0.5 bg-[#F4F1EA] border border-[#E8E4DA]" />
                    <span className={`text-xs font-mono ${selectedAvatar === '/man.svg' ? 'text-[#151516] font-semibold' : 'text-[#71717A] font-medium'}`}>
                      Gentleman
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedAvatar('/woman.svg')}
                    className={`flex items-center gap-2.5 p-2 rounded-2xl border transition-all cursor-pointer ${
                      selectedAvatar === '/woman.svg'
                        ? 'bg-[#FAF8F5] border-[#151516] ring-1 ring-[#151516] shadow-sm'
                        : 'bg-white border-[#E8E4DA] hover:bg-[#F4F1EA]'
                    }`}
                  >
                    <img src="/woman.svg" alt="Lady" className="w-7 h-7 rounded-full object-cover p-0.5 bg-[#F4F1EA] border border-[#E8E4DA]" />
                    <span className={`text-xs font-mono ${selectedAvatar === '/woman.svg' ? 'text-[#151516] font-semibold' : 'text-[#71717A] font-medium'}`}>
                      Lady
                    </span>
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-mono tracking-editorial-mono text-[#71717A] font-semibold">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-[#71717A] absolute left-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (error) setError(null); }}
                required
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-2xl bg-white border border-[#E8E4DA] text-xs text-[#151516] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#151516] focus:ring-1 focus:ring-[#151516] shadow-sm transition-all"
                placeholder="explorer@laughtale.voyage"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-mono tracking-editorial-mono text-[#71717A] font-semibold">Password</label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-[#71717A] absolute left-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (error) setError(null); }}
                required
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-2xl bg-white border border-[#E8E4DA] text-xs text-[#151516] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#151516] focus:ring-1 focus:ring-[#151516] shadow-sm transition-all"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          {authMode === 'signup' && (
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono tracking-editorial-mono text-[#71717A] font-semibold">Confirm Password</label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-[#71717A] absolute left-3.5" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); if (error) setError(null); }}
                  required
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-2xl bg-white border border-[#E8E4DA] text-xs text-[#151516] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#151516] focus:ring-1 focus:ring-[#151516] shadow-sm transition-all"
                  placeholder="••••••••••••"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 sm:py-4 rounded-2xl bg-[#151516] hover:bg-[#232326] disabled:opacity-50 text-white font-mono text-xs uppercase tracking-wider font-medium shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center space-x-2 mt-4 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 text-white animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>{authMode === 'signin' ? 'Sign In to Experience' : 'Create & Access Account'}</span>
                <ArrowRight className="w-4 h-4 text-sky-400" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};



