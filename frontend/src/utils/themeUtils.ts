export interface TripTheme {
  primaryHex: string;
  glowBg: string;
  badgeBg: string;
  badgeText: string;
  activeBorder: string;
  buttonAccent: string;
  iconColor: string;
  tagColor: string;
  radialFlare: string;
}

export function getTripTheme(destination: string = '', country: string = ''): TripTheme {
  const d = (destination + ' ' + country).toLowerCase();
  
  if (d.includes('indonesia') || d.includes('bali') || d.includes('thailand') || d.includes('island')) {
    // Tropical Emerald & Pearl Theme (Clean Luxury)
    return {
      primaryHex: '#10B981',
      glowBg: 'from-[#06080E] via-[#06080E]/60 to-black/30',
      badgeBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
      badgeText: 'text-emerald-400',
      activeBorder: 'border-emerald-500/60 shadow-xl shadow-emerald-500/15 ring-1 ring-emerald-500/30',
      buttonAccent: 'bg-[#10B981] hover:bg-[#34D399] text-slate-950 font-extrabold shadow-xl shadow-[#10B981]/25',
      iconColor: 'text-[#10B981]',
      tagColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
      radialFlare: 'bg-emerald-500/10'
    };
  }
  
  if (d.includes('japan') || d.includes('tokyo') || d.includes('kyoto') || d.includes('cherry')) {
    // Sakura Rose & Satin Pearl Theme
    return {
      primaryHex: '#F43F5E',
      glowBg: 'from-[#06080E] via-[#06080E]/60 to-black/30',
      badgeBg: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
      badgeText: 'text-rose-400',
      activeBorder: 'border-rose-500/60 shadow-xl shadow-rose-500/15 ring-1 ring-rose-500/30',
      buttonAccent: 'bg-[#F43F5E] hover:bg-[#FB7185] text-white font-extrabold shadow-xl shadow-[#F43F5E]/25',
      iconColor: 'text-[#F43F5E]',
      tagColor: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
      radialFlare: 'bg-rose-500/10'
    };
  }
  
  if (d.includes('kerala') || d.includes('india') || d.includes('jungle') || d.includes('backwater')) {
    // Warm Amber & Spice Gold Theme
    return {
      primaryHex: '#EAB308',
      glowBg: 'from-[#06080E] via-[#06080E]/60 to-black/30',
      badgeBg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
      badgeText: 'text-amber-400',
      activeBorder: 'border-amber-500/60 shadow-xl shadow-amber-500/15 ring-1 ring-amber-500/30',
      buttonAccent: 'bg-[#EAB308] hover:bg-[#FACC15] text-slate-950 font-extrabold shadow-xl shadow-[#EAB308]/25',
      iconColor: 'text-[#EAB308]',
      tagColor: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
      radialFlare: 'bg-amber-500/10'
    };
  }
  
  if (d.includes('amalfi') || d.includes('italy') || d.includes('ocean') || d.includes('greece') || d.includes('mediterranean')) {
    // Mediterranean Azure & Sapphire Theme
    return {
      primaryHex: '#0EA5E9',
      glowBg: 'from-[#06080E] via-[#06080E]/60 to-black/30',
      badgeBg: 'bg-sky-500/15 border-sky-500/30 text-sky-300',
      badgeText: 'text-sky-400',
      activeBorder: 'border-sky-500/60 shadow-xl shadow-sky-500/15 ring-1 ring-sky-500/30',
      buttonAccent: 'bg-[#0EA5E9] hover:bg-[#38BDF8] text-slate-950 font-extrabold shadow-xl shadow-[#0EA5E9]/25',
      iconColor: 'text-[#0EA5E9]',
      tagColor: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
      radialFlare: 'bg-sky-500/10'
    };
  }
  
  // Default Minimal Champagne & Crystal Dark Theme
  return {
    primaryHex: '#D4B886',
    glowBg: 'from-[#06080E] via-[#06080E]/60 to-black/30',
    badgeBg: 'bg-[#D4B886]/15 border-[#D4B886]/30 text-[#E2CB9F]',
    badgeText: 'text-[#D4B886]',
    activeBorder: 'border-[#D4B886]/60 shadow-xl shadow-[#D4B886]/15 ring-1 ring-[#D4B886]/30',
    buttonAccent: 'bg-[#D4B886] hover:bg-[#E2CB9F] text-slate-950 font-extrabold shadow-xl shadow-[#D4B886]/25',
    iconColor: 'text-[#D4B886]',
    tagColor: 'bg-[#D4B886]/10 text-[#E2CB9F] border-[#D4B886]/20',
    radialFlare: 'bg-[#D4B886]/10'
  };
}
