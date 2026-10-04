import type { ItineraryDay, Activity } from '../types';

export function parseMarkdownToItinerary(
  markdownText: string,
  destination: string,
  startDateStr: string
): ItineraryDay[] {
  if (!markdownText || markdownText.trim().length === 0) {
    return generateFallbackItinerary(destination, startDateStr);
  }

  // Parse YYYY-MM-DD safely without UTC timezone shift
  let baseYear = new Date().getFullYear();
  let baseMonth = new Date().getMonth();
  let baseDay = new Date().getDate();

  if (startDateStr && startDateStr.includes('-')) {
    const parts = startDateStr.split('-').map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      baseYear = parts[0];
      baseMonth = parts[1] - 1;
      baseDay = parts[2];
    }
  }

  // Regex to match "Day X" or "# Day X" headers specifically
  const dayHeaderRegex = /(?:^|\n)(?:#{1,4}\s*)?Day\s+(\d+)[^\n]*/gi;
  const matches = [...markdownText.matchAll(dayHeaderRegex)];

  if (matches.length === 0) {
    return generateFallbackItinerary(destination, startDateStr);
  }

  const days: ItineraryDay[] = [];

  for (let m = 0; m < matches.length; m++) {
    const match = matches[m];
    const dayNum = parseInt(match[1], 10);
    const startIdx = match.index! + match[0].length;
    const endIdx = m + 1 < matches.length ? matches[m + 1].index! : markdownText.length;
    const block = markdownText.slice(startIdx, endIdx);

    const currentDate = new Date(baseYear, baseMonth, baseDay + (dayNum - 1));
    const formattedDate = currentDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    });

    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    const activities: Activity[] = [];

    const isRainy = block.toLowerCase().includes('rain') || block.toLowerCase().includes('shower') || block.toLowerCase().includes('drizzle');
    const condition = isRainy ? 'Passing Showers' : 'Clear & Sunny';
    const temp = isRainy ? '16°C / 61°F' : '22°C / 72°F';
    const icon = isRainy ? '🌧️' : '☀️';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('*') || line.startsWith('-') || line.startsWith('•') || /^\d+\./.test(line)) {
        let cleanContent = line.replace(/^[\*\-•\d\.\s]+/, '').trim();
        
        // Strip out time period prefixes like **Morning:**, **Afternoon:**, **Evening:**, **Night:**
        cleanContent = cleanContent.replace(/^\*{0,2}\s*(?:Morning|Afternoon|Evening|Night|Daytime|Lunch|Dinner|Breakfast)\s*\*{0,2}\s*:\s*/i, '').trim();

        if (!cleanContent) continue;

        // Skip daily summary cost lines in activity list
        if (cleanContent.toLowerCase().includes('estimated daily cost') || cleanContent.toLowerCase().includes('daily spend')) {
          continue;
        }

        // 1. Extract Place Name Title from bold text or preposition match
        let placeName = '';
        const boldMatch = cleanContent.match(/\*\*([^*]+)\*\*/);
        
        if (boldMatch && boldMatch[1]) {
          placeName = boldMatch[1].trim();
        } else {
          const prepMatch = cleanContent.match(/(?:at the|at|visit|explore|in|to|head to|stroll through|check into)\s+([A-Z][A-Za-z0-9\s'’-]+)/);
          if (prepMatch && prepMatch[1]) {
            const extracted = prepMatch[1].split(/(?:,|\.|\s+and\s+|\s+or\s+|\s+for\s+)/)[0].trim();
            if (extracted.length > 3 && extracted.length < 40) {
              placeName = extracted;
            }
          }
        }

        if (!placeName || placeName.length < 3) {
          if (cleanContent.includes(':')) {
            placeName = cleanContent.split(':')[0].trim();
          } else if (cleanContent.includes(' - ')) {
            placeName = cleanContent.split(' - ')[0].trim();
          } else {
            const firstClause = cleanContent.split(/[,.]/)[0].trim();
            placeName = firstClause.length <= 35 ? firstClause : firstClause.split(' ').slice(0, 4).join(' ');
          }
        }

        placeName = placeName.replace(/\*/g, '').trim();

        // 2. Full Activity Description
        const description = cleanContent.replace(/\*\*/g, '').trim();

        // 3. Clean Location Capsule
        let locationCapsule = `${destination}`;
        if (placeName && !placeName.toLowerCase().startsWith('spend') && !placeName.toLowerCase().startsWith('enjoy') && !placeName.toLowerCase().startsWith('head') && !placeName.toLowerCase().startsWith('arrive')) {
          locationCapsule = `${placeName}, ${destination}`;
        } else {
          locationCapsule = `Central ${destination}`;
        }

        const lowerDesc = description.toLowerCase();
        let category: Activity['category'] = 'Culture';
        if (lowerDesc.includes('dinner') || lowerDesc.includes('lunch') || lowerDesc.includes('food') || lowerDesc.includes('meal') || lowerDesc.includes('tasting') || lowerDesc.includes('bistro') || lowerDesc.includes('restaurant') || lowerDesc.includes('snack') || lowerDesc.includes('breakfast')) {
          category = 'Dining';
        } else if (lowerDesc.includes('transfer') || lowerDesc.includes('flight') || lowerDesc.includes('train') || lowerDesc.includes('cab') || lowerDesc.includes('taxi') || lowerDesc.includes('rickshaw') || lowerDesc.includes('bus') || lowerDesc.includes('arrival')) {
          category = 'Transit';
        } else if (lowerDesc.includes('walk') || lowerDesc.includes('park') || lowerDesc.includes('beach') || lowerDesc.includes('outdoor') || lowerDesc.includes('garden') || lowerDesc.includes('fort') || lowerDesc.includes('tomb') || lowerDesc.includes('temple') || lowerDesc.includes('market')) {
          category = 'Outdoor';
        }

        const isIndoor = lowerDesc.includes('museum') || 
                         lowerDesc.includes('gallery') || 
                         lowerDesc.includes('dining') ||
                         lowerDesc.includes('bistro') ||
                         lowerDesc.includes('mall') ||
                         lowerDesc.includes('spa') ||
                         lowerDesc.includes('opera');

        const estimatedCost = category === 'Dining' ? '₹1,500 – ₹2,500' : category === 'Transit' ? '₹800 – ₹1,500' : category === 'Outdoor' ? '₹500 – ₹1,200' : '₹1,000 – ₹2,000';

        activities.push({
          id: `act_${dayNum}_${i}`,
          time: '',
          title: placeName,
          description: description,
          category,
          location: locationCapsule,
          estimatedCost,
          isIndoor
        });
      }
    }

    if (activities.length > 0) {
      days.push({
        dayNumber: dayNum,
        date: formattedDate,
        weather: { temp, condition, icon, isRainy },
        activities: activities.slice(0, 5)
      });
    }
  }

  return days.length > 0 ? days : generateFallbackItinerary(destination, startDateStr);
}

export function generateFallbackItinerary(destination: string, startDateStr: string): ItineraryDay[] {
  const dest = destination || 'Paris';
  let baseYear = new Date().getFullYear();
  let baseMonth = new Date().getMonth();
  let baseDay = new Date().getDate();

  if (startDateStr && startDateStr.includes('-')) {
    const parts = startDateStr.split('-').map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      baseYear = parts[0];
      baseMonth = parts[1] - 1;
      baseDay = parts[2];
    }
  }

  const d1 = new Date(baseYear, baseMonth, baseDay);
  const d2 = new Date(baseYear, baseMonth, baseDay + 1);
  const d3 = new Date(baseYear, baseMonth, baseDay + 2);

  const days: ItineraryDay[] = [
    {
      dayNumber: 1,
      date: d1.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' }),
      weather: { temp: '21°C / 70°F', condition: 'Clear Skies', icon: '☀️', isRainy: false },
      activities: [
        {
          id: 'act_1_1',
          time: '',
          title: `Chauffeur Arrival & Residence Check-in`,
          description: `Luxury private transfer from arrival terminal directly to your residence in ${dest}.`,
          category: 'Transit',
          location: `${dest} City Center`,
          estimatedCost: '₹3,500',
          isIndoor: true
        },
        {
          id: 'act_1_2',
          time: '',
          title: `Panoramas & Welcome Cocktails`,
          description: `Enjoy panoramic skyline views over ${dest} with curated welcome beverages.`,
          category: 'Leisure',
          location: `Rooftop Lounge, ${dest}`,
          estimatedCost: '₹2,200',
          isIndoor: false
        },
        {
          id: 'act_1_3',
          time: '',
          title: `Chef's Tasting Menu Dinner`,
          description: `Multi-course seasonal pairing dinner highlighting authentic regional gastronomy.`,
          category: 'Dining',
          location: `Grand Bistro, ${dest}`,
          estimatedCost: '₹4,500',
          isIndoor: true
        }
      ]
    },
    {
      dayNumber: 2,
      date: d2.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' }),
      weather: { temp: '17°C / 62°F', condition: 'Light Scattered Rain', icon: '🌧️', isRainy: true },
      activities: [
        {
          id: 'act_2_1',
          time: '',
          title: `National Art Gallery VIP Tour`,
          description: `Exclusive skip-the-line access guided by a master art historian.`,
          category: 'Culture',
          location: `National Art Gallery, ${dest}`,
          estimatedCost: '₹2,800',
          isIndoor: true
        },
        {
          id: 'act_2_2',
          time: '',
          title: `Covered Market Tasting & Lunch`,
          description: `Sample regional specialties, warm pastries, and fine beverages indoors.`,
          category: 'Dining',
          location: `Historic Arcade Market, ${dest}`,
          estimatedCost: '₹1,800',
          isIndoor: true
        },
        {
          id: 'act_2_3',
          time: '',
          title: `Palais de Musique Evening Concert`,
          description: `Premium seating at the historic music hall for an acoustic performance.`,
          category: 'Culture',
          location: `Palais de Musique, ${dest}`,
          estimatedCost: '₹5,200',
          isIndoor: true
        }
      ]
    },
    {
      dayNumber: 3,
      date: d3.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' }),
      weather: { temp: '23°C / 73°F', condition: 'Sunny & Pleasant', icon: '🌤️', isRainy: false },
      activities: [
        {
          id: 'act_3_1',
          time: '',
          title: `Old Quarter Architectural Walk`,
          description: `Explore historic neighborhood hidden courtyards and landmark vistas.`,
          category: 'Outdoor',
          location: `Old Quarter, ${dest}`,
          estimatedCost: '₹1,200',
          isIndoor: false
        },
        {
          id: 'act_3_2',
          time: '',
          title: `Artisan Perfume & Craft Workshop`,
          description: `Craft your custom signature scent under master artisan guidance.`,
          category: 'Leisure',
          location: `Atelier Privé, ${dest}`,
          estimatedCost: '₹3,200',
          isIndoor: true
        },
        {
          id: 'act_3_3',
          time: '',
          title: `Illuminated Sunset River Cruise`,
          description: `Private chartered launch featuring live jazz, champagne, and illuminated city views.`,
          category: 'Leisure',
          location: `Grand Promenade Launch, ${dest}`,
          estimatedCost: '₹4,800',
          isIndoor: false
        }
      ]
    }
  ];

  return days;
}
