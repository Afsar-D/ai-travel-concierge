import type { ItineraryDay, Activity } from '../types';

export function parseMarkdownToItinerary(
  markdownText: string,
  destination: string,
  startDateStr: string
): ItineraryDay[] {
  if (!markdownText || markdownText.trim().length === 0) {
    return generateFallbackItinerary(destination, startDateStr);
  }

  const days: ItineraryDay[] = [];
  const dayBlocks = markdownText.split(/(?:Day\s+\d+|###\s*Day\s+\d+|##\s*Day\s+\d+)/i);

  let dayIndex = 1;
  const startDate = new Date(startDateStr || Date.now());

  for (const block of dayBlocks) {
    if (!block.trim()) continue;

    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + (dayIndex - 1));
    const formattedDate = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });

    const activities: Activity[] = [];
    const isRainy = block.toLowerCase().includes('rain') || block.toLowerCase().includes('shower');
    const condition = isRainy ? 'Passing Showers' : 'Clear & Sunny';
    const temp = isRainy ? '16°C / 61°F' : '22°C / 72°F';
    const icon = isRainy ? '🌧️' : '☀️';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('*') || line.startsWith('-') || line.startsWith('•') || /^\d+\./.test(line)) {
        const cleanContent = line.replace(/^[\*\-•\d\.\s]+/, '').trim();
        
        let time = '10:00 AM';
        if (cleanContent.includes('Morning') || i === 0) time = '09:30 AM';
        else if (cleanContent.includes('Lunch') || cleanContent.includes('Afternoon')) time = '01:00 PM';
        else if (cleanContent.includes('Evening') || cleanContent.includes('Dinner')) time = '07:30 PM';

        const isIndoor = cleanContent.toLowerCase().includes('museum') || 
                         cleanContent.toLowerCase().includes('gallery') || 
                         cleanContent.toLowerCase().includes('dining') ||
                         cleanContent.toLowerCase().includes('bistro') ||
                         cleanContent.toLowerCase().includes('opera');

        let category: Activity['category'] = 'Culture';
        if (cleanContent.toLowerCase().includes('dinner') || cleanContent.toLowerCase().includes('lunch') || cleanContent.toLowerCase().includes('food')) {
          category = 'Dining';
        } else if (cleanContent.toLowerCase().includes('transfer') || cleanContent.toLowerCase().includes('flight') || cleanContent.toLowerCase().includes('train')) {
          category = 'Transit';
        } else if (cleanContent.toLowerCase().includes('walk') || cleanContent.toLowerCase().includes('park')) {
          category = 'Outdoor';
        }

        activities.push({
          id: `act_${dayIndex}_${i}`,
          time,
          title: cleanContent.split(':')[0] || cleanContent,
          description: cleanContent.includes(':') ? cleanContent.split(':').slice(1).join(':') : cleanContent,
          category,
          location: destination,
          estimatedCost: category === 'Dining' ? '$85' : category === 'Transit' ? '$45' : '$30',
          isIndoor
        });
      }
    }

    if (activities.length > 0) {
      days.push({
        dayNumber: dayIndex,
        date: formattedDate,
        weather: { temp, condition, icon, isRainy },
        activities: activities.slice(0, 5)
      });
      dayIndex++;
    }
  }

  return days.length > 0 ? days : generateFallbackItinerary(destination, startDateStr);
}

export function generateFallbackItinerary(destination: string, startDateStr: string): ItineraryDay[] {
  const dest = destination || 'Paris';
  const startDate = new Date(startDateStr || Date.now());

  const days: ItineraryDay[] = [
    {
      dayNumber: 1,
      date: new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' }),
      weather: { temp: '21°C / 70°F', condition: 'Clear Skies', icon: '☀️', isRainy: false },
      activities: [
        {
          id: 'act_1_1',
          time: '02:00 PM',
          title: `Private Chauffeur Arrival & Check-in`,
          description: `Luxury sedan transfer from airport to your residence in central ${dest}.`,
          category: 'Transit',
          location: `${dest} City Center`,
          estimatedCost: '$120',
          isIndoor: true
        },
        {
          id: 'act_1_2',
          time: '05:30 PM',
          title: `Sunset Welcome Cocktail & Orientation`,
          description: `Enjoy panoramic skyline views and meet your dedicated local host.`,
          category: 'Leisure',
          location: `Rooftop Lounge, ${dest}`,
          estimatedCost: '$95',
          isIndoor: false
        },
        {
          id: 'act_1_3',
          time: '08:00 PM',
          title: `Signature Chef Tasting Dinner`,
          description: `Multi-course seasonal pairing dinner highlighting authentic local gastronomy.`,
          category: 'Dining',
          location: `Grand Restaurant ${dest}`,
          estimatedCost: '$210',
          isIndoor: true
        }
      ]
    },
    {
      dayNumber: 2,
      date: new Date(startDate.setDate(startDate.getDate() + 1)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' }),
      weather: { temp: '17°C / 62°F', condition: 'Light Scattered Rain', icon: '🌧️', isRainy: true },
      activities: [
        {
          id: 'act_2_1',
          time: '09:30 AM',
          title: `Private VIP Museum & Art Collection Tour`,
          description: `Exclusive skip-the-line access guided by a renowned art historian.`,
          category: 'Culture',
          location: `National Art Gallery, ${dest}`,
          estimatedCost: '$150',
          isIndoor: true
        },
        {
          id: 'act_2_2',
          time: '01:00 PM',
          title: `Covered Market Tasting & Artisan Lunch`,
          description: `Sample vintage cheeses, warm pastries, and fine wines indoors away from the rain.`,
          category: 'Dining',
          location: `Historic Arcade Market`,
          estimatedCost: '$75',
          isIndoor: true
        },
        {
          id: 'act_2_3',
          time: '07:30 PM',
          title: `Private Opera Box Performance`,
          description: `Premium tier seating at the historic opera house.`,
          category: 'Culture',
          location: `Palais de Musique`,
          estimatedCost: '$280',
          isIndoor: true
        }
      ]
    },
    {
      dayNumber: 3,
      date: new Date(startDate.setDate(startDate.getDate() + 1)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' }),
      weather: { temp: '23°C / 73°F', condition: 'Sunny & Pleasant', icon: '🌤️', isRainy: false },
      activities: [
        {
          id: 'act_3_1',
          time: '10:00 AM',
          title: `Private Architectural Walking Tour`,
          description: `Explore historic neighborhood hidden courtyards and landmark vistas.`,
          category: 'Outdoor',
          location: `Old Quarter, ${dest}`,
          estimatedCost: '$60',
          isIndoor: false
        },
        {
          id: 'act_3_2',
          time: '02:30 PM',
          title: `Bespoke Fragrance & Artisan Workshop`,
          description: `Craft your custom signature scent under master perfumer guidance.`,
          category: 'Leisure',
          location: `Atelier Privé`,
          estimatedCost: '$180',
          isIndoor: true
        },
        {
          id: 'act_3_3',
          time: '08:30 PM',
          title: `Farewell Evening River Cruise`,
          description: `Private chartered launch featuring champagne, live jazz, and illuminated sights.`,
          category: 'Leisure',
          location: `Grand Promenade Launch`,
          estimatedCost: '$240',
          isIndoor: false
        }
      ]
    }
  ];

  return days;
}
