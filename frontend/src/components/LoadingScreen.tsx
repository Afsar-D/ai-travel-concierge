import React, { useEffect, useRef, useState } from 'react';
import lottie, { type AnimationItem } from 'lottie-web/build/player/lottie_light';
import { Feather } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Curating your bespoke private dossiers...',
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
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-[#FAF9F6] text-[#151516] font-sans overflow-hidden select-none"
      role="status"
      aria-live="polite"
    >
      {/* Ambient Photographic Background with Linen Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-scale-subtle opacity-35"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=2600&q=85')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#151516]/40 via-[#FAF9F6]/85 to-[#FAF9F6]" />
        <div className="absolute inset-0 bg-[#FAF9F6]/30 mix-blend-multiply" />
      </div>

      {/* Editorial Paper Dossier Card from demo.html */}
      <div className="relative z-10 flex flex-col items-center max-w-md w-full mx-auto text-center space-y-6 paper-panel rounded-3xl p-8 sm:p-10 border border-[#E8E4DA] shadow-xl bg-[#FDFCF9]/95 backdrop-blur-md">
        
        {/* Brand Emblem */}
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-[#F4F1EA] border border-[#E8E4DA] flex items-center justify-center p-1.5 shadow-sm">
            <img src="/travel.svg" alt="Laugh Tale" className="w-full h-full object-contain" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-sans text-xs font-bold tracking-[0.28em] uppercase text-[#151516]">
              Laugh Tale
            </span>
            <span className="font-serif italic text-[#71717A] text-xs">
              // private dossier
            </span>
          </div>
        </div>

        {/* Lottie Animation or Editorial Spinner */}
        <div
          ref={containerRef}
          className="w-40 h-40 sm:w-48 sm:h-48 mx-auto flex items-center justify-center"
        >
          {hasError && (
            <div className="w-12 h-12 rounded-full border-2 border-t-[#151516] border-[#E8E4DA] animate-spin" />
          )}
        </div>

        {/* Caption & Status */}
        <div className="space-y-3 w-full">
          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-editorial-mono uppercase text-[#71717A] font-semibold block">
              Travel Intelligence Dispatch
            </span>
            <p className="text-xs text-[#525258] font-mono">
              {message}
            </p>
          </div>

          <div className="w-16 h-[1px] bg-[#E8E4DA] mx-auto my-3" />

          {/* One Piece-inspired poetic tagline */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-center gap-1.5 text-[#9A5B43] text-xs">
              <Feather className="w-3.5 h-3.5" />
              <span className="font-mono text-[10px] tracking-editorial-mono uppercase font-semibold">
                One Piece Lore
              </span>
            </div>
            <p className="font-serif italic text-sm sm:text-base leading-relaxed text-[#232326] font-normal">
              &ldquo;In every grand adventure, there&rsquo;s one final destination &mdash; a place where every journey finds its meaning. Laugh Tale is that destination.&rdquo;
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
