import React, { useEffect, useRef, useState } from 'react';
import lottie, { type AnimationItem } from 'lottie-web/build/player/lottie_light';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Curating your luxury itineraries...',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let anim: AnimationItem | null = null;
    let isCancelled = false;

    async function initLottie() {
      if (!containerRef.current) return;
      try {
        const res = await fetch('/loading.json');
        if (!res.ok) {
          throw new Error('Local loading.json not accessible');
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
              path: '/loading.json',
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
      if (anim) {
        anim.destroy();
      }
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-[#F8FAFC] text-slate-900 font-sans overflow-hidden select-none"
      role="status"
      aria-live="polite"
    >
      <div className="relative z-10 flex flex-col items-center max-w-sm w-full mx-auto text-center space-y-4">
        {/* Lottie Animation Container */}
        <div
          ref={containerRef}
          className="w-48 h-48 sm:w-56 sm:h-56 mx-auto flex items-center justify-center"
        >
          {hasError && (
            <div className="w-16 h-16 rounded-full border-2 border-t-rose-500 border-rose-500/20 animate-spin" />
          )}
        </div>

        {/* Minimal Luxury Caption */}
        <div className="space-y-1.5">
          <h2 className="text-sm font-semibold tracking-wide text-slate-900 uppercase drop-shadow-sm">
            ODYSSEY <span className="text-rose-500 font-bold">AI</span>
          </h2>
          <p className="text-xs text-slate-500 tracking-wide font-medium">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};
