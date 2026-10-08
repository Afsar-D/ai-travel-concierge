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

export function capitalizeWords(str: string = ''): string {
  if (!str) return '';
  return str
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function formatLocationName(destination: string = '', country: string = ''): string {
  const cleanDest = capitalizeWords(destination);
  let cleanCountry = capitalizeWords(country);

  if (!cleanCountry || cleanDest.toLowerCase() === cleanCountry.toLowerCase()) {
    cleanCountry = 'India';
  }

  if (cleanDest.toLowerCase() === cleanCountry.toLowerCase()) {
    return cleanDest;
  }

  return `${cleanDest}, ${cleanCountry}`;
}

export function getDestinationBackgroundImage(dest: string = ''): string {
  if (!dest) return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=75';

  const d = dest.toLowerCase().trim();

  // 1. Curated Destination Image Library (Optimized 1200px / 75q for instant loading)
  if (d.includes('bali') || d.includes('indonesia')) return 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=75';
  if (d.includes('paris') || d.includes('france')) return 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=75';
  if (d.includes('tokyo') || d.includes('japan') || d.includes('kyoto')) return 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=75';
  if (d.includes('london') || d.includes('uk') || d.includes('england')) return 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=75';
  if (d.includes('rome') || d.includes('italy') || d.includes('venice') || d.includes('florence')) return 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=75';
  if (d.includes('amalfi')) return 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=75';
  if (d.includes('santorini') || d.includes('greece') || d.includes('mykonos')) return 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=75';
  if (d.includes('new york') || d.includes('nyc') || d.includes('usa')) return 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=75';
  if (d.includes('dubai') || d.includes('uae')) return 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=75';
  if (d.includes('switzerland') || d.includes('swiss') || d.includes('alps') || d.includes('zermatt')) return 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=75';
  if (d.includes('maldives')) return 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=75';
  if (d.includes('iceland') || d.includes('reykjavik')) return 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1200&q=75';
  if (d.includes('singapore')) return 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=75';
  if (d.includes('cairo') || d.includes('egypt')) return 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1200&q=75';
  if (d.includes('thailand') || d.includes('bangkok') || d.includes('phuket')) return 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=75';
  if (d.includes('delhi') || d.includes('new delhi') || d.includes('dilli') || d.includes('ncr') || d.includes('newdelhi')) return 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=75';
  if (d.includes('mumbai')) return 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=75';
  if (d.includes('goa') || d.includes('kerala') || d.includes('jaipur') || d.includes('india')) return 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=75';
  if (d.includes('barcelona') || d.includes('spain') || d.includes('madrid')) return 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1200&q=75';
  if (d.includes('amsterdam') || d.includes('netherlands')) return 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=1200&q=75';
  if (d.includes('sydney') || d.includes('australia')) return 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=75';
  if (d.includes('cape town') || d.includes('south africa')) return 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1200&q=75';
  if (d.includes('prague')) return 'https://images.unsplash.com/photo-1541849546-216549ae216d?auto=format&fit=crop&w=1200&q=75';
  if (d.includes('istanbul') || d.includes('turkey')) return 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=75';
  if (d.includes('hawaii') || d.includes('honolulu')) return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=75';

  // 2. Hash-seeded Unsplash Image Array for any custom destination
  const fallbacks = [
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=75',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=75',
    'https://images.unsplash.com/photo-1476514525535-ce74f4528991?auto=format&fit=crop&w=1200&q=75',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=75',
    'https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=1200&q=75',
    'https://images.unsplash.com/photo-1433838552652-f9a46b332c40?auto=format&fit=crop&w=1200&q=75'
  ];

  let hash = 0;
  for (let i = 0; i < d.length; i++) {
    hash = d.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % fallbacks.length;
  return fallbacks[index];
}
