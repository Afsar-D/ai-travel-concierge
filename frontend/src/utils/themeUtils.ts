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
    // Tropical Emerald Theme
    return {
      primaryHex: '#059669',
      glowBg: 'from-white/95 via-white/85 to-slate-50/70',
      badgeBg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      badgeText: 'text-emerald-600',
      activeBorder: 'border-emerald-400 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-400/30',
      buttonAccent: 'bg-[#059669] hover:bg-[#10B981] text-white font-extrabold shadow-lg shadow-emerald-600/20',
      iconColor: 'text-[#059669]',
      tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      radialFlare: 'bg-emerald-500/10'
    };
  }
  
  if (d.includes('kerala') || d.includes('india') || d.includes('jungle') || d.includes('backwater')) {
    // Coastal Teal & Spice Theme
    return {
      primaryHex: '#0891B2',
      glowBg: 'from-white/95 via-white/85 to-slate-50/70',
      badgeBg: 'bg-cyan-50 border-cyan-200 text-cyan-700',
      badgeText: 'text-cyan-600',
      activeBorder: 'border-cyan-400 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-400/30',
      buttonAccent: 'bg-[#0891B2] hover:bg-[#06B6D4] text-white font-extrabold shadow-lg shadow-cyan-600/20',
      iconColor: 'text-[#0891B2]',
      tagColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      radialFlare: 'bg-cyan-500/10'
    };
  }
  
  if (d.includes('amalfi') || d.includes('italy') || d.includes('ocean') || d.includes('greece') || d.includes('mediterranean')) {
    // Mediterranean Azure Theme
    return {
      primaryHex: '#0284C7',
      glowBg: 'from-white/95 via-white/85 to-slate-50/70',
      badgeBg: 'bg-sky-50 border-sky-200 text-sky-700',
      badgeText: 'text-sky-600',
      activeBorder: 'border-sky-400 shadow-md shadow-sky-500/10 ring-1 ring-sky-400/30',
      buttonAccent: 'bg-[#0284C7] hover:bg-[#0EA5E9] text-white font-extrabold shadow-lg shadow-sky-600/20',
      iconColor: 'text-[#0284C7]',
      tagColor: 'bg-sky-50 text-sky-700 border-sky-200',
      radialFlare: 'bg-sky-500/10'
    };
  }
  
  // Default Sunset Coral & Vibrant Rose Theme
  return {
    primaryHex: '#F43F5E',
    glowBg: 'from-white/95 via-white/85 to-slate-50/70',
    badgeBg: 'bg-rose-50 border-rose-200 text-rose-700',
    badgeText: 'text-rose-600',
    activeBorder: 'border-rose-400 shadow-md shadow-rose-500/10 ring-1 ring-rose-400/30',
    buttonAccent: 'bg-[#F43F5E] hover:bg-[#E11D48] text-white font-extrabold shadow-lg shadow-rose-500/25',
    iconColor: 'text-[#F43F5E]',
    tagColor: 'bg-rose-50 text-rose-700 border-rose-200',
    radialFlare: 'bg-rose-500/10'
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
