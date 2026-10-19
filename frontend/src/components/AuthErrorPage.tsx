import React, { useEffect, useRef, useState } from 'react';
import { Home } from 'lucide-react';
import lottie, { type AnimationItem } from 'lottie-web/build/player/lottie_light';

interface AuthErrorPageProps {
  statusCode?: number;
  message?: string;
  onLoginAgain: () => void;
  onReload?: () => void;
}

export const AuthErrorPage: React.FC<AuthErrorPageProps> = ({
  message,
  onLoginAgain,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let anim: AnimationItem | null = null;
    let isCancelled = false;

    async function initLottie() {
      if (!containerRef.current) return;
      try {
        const res = await fetch('/error.json');
        if (!res.ok) {
          throw new Error('Local error.json not accessible');
        }
        const data = await res.json();
        if (!isCancelled && containerRef.current) {
          containerRef.current.innerHTML = '';
          anim = lottie.loadAnimation({
            container: containerRef.current,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            animationData: data,
          });
        }
      } catch {
        if (!isCancelled && containerRef.current) {
          try {
            anim = lottie.loadAnimation({
              container: containerRef.current,
              renderer: 'svg',
              loop: true,
              autoplay: true,
              path: '/error.json',
            });
          } catch {
            setHasError(true);
          }
        }
      }
    }

    initLottie();

    return () => {
      isCancelled = true;
      try {
        if (anim) {
          anim.destroy();
        }
      } catch {}
    };
  }, []);

  const handleHomeClick = () => {
    if (onLoginAgain) {
      onLoginAgain();
    } else {
      try {
        localStorage.removeItem('laughtale_token');
        localStorage.removeItem('laughtale_user');
      } catch {}
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#080B11] text-slate-100 font-sans flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden selection:bg-sky-500/20">
      {/* Subtle ambient glow */}
      <div className="absolute w-[450px] h-[350px] bg-sky-500/5 rounded-full blur-[130px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-md mx-auto">
        {/* Lottie Animation */}
        <div className="w-64 h-64 sm:w-80 sm:h-80 mx-auto flex items-center justify-center">
          <div
            ref={containerRef}
            className="w-full h-full flex items-center justify-center pointer-events-none"
            aria-label="Error Animation"
          />
          {hasError && (
            <div className="text-6xl font-black text-sky-400/40 font-mono">
              401
            </div>
          )}
        </div>

        {/* Clean Message */}
        <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed mb-6">
          {message || 'Something error occurred. Please login again.'}
        </p>

        {/* Single Home Button */}
        <button
          type="button"
          onClick={handleHomeClick}
          className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-black/50 border border-white/20 active:scale-95 transition-all flex items-center space-x-2 cursor-pointer"
        >
          <Home className="w-4 h-4 text-slate-950" />
          <span>Home</span>
        </button>
      </div>
    </div>
  );
};
