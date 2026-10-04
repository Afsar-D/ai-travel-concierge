import type { ItineraryDay, Activity, BudgetTier } from '../types';

function cleanActivityTitle(rawTitle: string): string {
  if (!rawTitle) return 'Local Experience';

  let cleaned = rawTitle
    .replace(/^(?:Visit|Explore|Head to|Stroll through|Check into|Check-in at|Arrive at|Enjoy|Experience|Discover|Dine at|Sample|Take a|Relax at|Walk through|Tour|Have dinner at|Have lunch at|Stop by)\s+/i, '')
    .trim();

  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  cleaned = cleaned.replace(/\*/g, '').trim();

  if (cleaned.length > 45) {
    cleaned = cleaned.slice(0, 42).trim() + '...';
  }

  return cleaned || 'Local Experience';
}

function getRealisticEstimatedCost(
  cleanContent: string,
  category: Activity['category'],
  budgetTier: BudgetTier = 'medium',
  index: number = 0
): string {
  // 1. Check if AI text explicitly mentions Free
  if (/\b(free|no charge|complimentary|free entry)\b/i.test(cleanContent)) {
    return 'Free Entry';
  }

  // 2. Check if AI text explicitly mentions INR / ₹ cost
  const inrMatch = cleanContent.match(/(?:₹|INR)\s*([\d,]+)(?:\s*[\-–—]\s*(?:₹|INR)?\s*([\d,]+))?/i);
  if (inrMatch) {
    if (inrMatch[2]) {
      return `₹${inrMatch[1]} – ₹${inrMatch[2]}`;
    }
    return `₹${inrMatch[1]}`;
  }

  // 3. Check if AI text explicitly mentions USD / $ cost
  const usdMatch = cleanContent.match(/\$\s*([\d,]+)(?:\s*[\-–—]\s*\$?\s*([\d,]+))?/i);
  if (usdMatch) {
    if (usdMatch[2]) {
      return `$${usdMatch[1]} – $${usdMatch[2]}`;
    }
    return `$${usdMatch[1]}`;
  }

  const v = (index % 3) * 50;

  if (budgetTier === 'low') {
    switch (category) {
      case 'Dining':
        return `₹${200 + v} – ₹${400 + v}`;
      case 'Outdoor':
        return index % 2 === 0 ? 'Free Entry' : `₹50 – ₹${150 + v}`;
      case 'Transit':
        return `₹50 – ₹${150 + v}`;
      case 'Culture':
        return `₹${100 + v} – ₹${300 + v}`;
    }
  } else if (budgetTier === 'high') {
    switch (category) {
      case 'Dining':
        return `₹${1800 + v * 4} – ₹${4200 + v * 4}`;
      case 'Outdoor':
        return `₹${800 + v * 2} – ₹${2000 + v * 2}`;
      case 'Transit':
        return `₹${1000 + v * 2} – ₹${2400 + v * 2}`;
      case 'Culture':
        return `₹${1500 + v * 3} – ₹${3500 + v * 3}`;
    }
  }

  // Medium / Signature Tier
  switch (category) {
    case 'Dining':
      return `₹${450 + v * 2} – ₹${1100 + v * 2}`;
    case 'Outdoor':
      return index % 2 === 0 ? 'Free Entry' : `₹${150 + v} – ₹${450 + v}`;
    case 'Transit':
      return `₹${150 + v} – ₹${400 + v}`;
    case 'Culture':
    default:
      return `₹${250 + v} – ₹${750 + v}`;
  }
}

export function parseMarkdownToItinerary(
  markdownText: string,
  destination: string,
  startDateStr: string,
  budgetTier: BudgetTier = 'medium'
): ItineraryDay[] {
  if (!markdownText || markdownText.trim().length === 0) {
    return [];
  }

  // Check if response indicates a location error from backend
  const lowerText = markdownText.toLowerCase();
  if (lowerText.includes('error:') || lowerText.includes('not found') || lowerText.includes('could not be found')) {
    return [];
  }

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

  const dayHeaderRegex = /(?:^|\n)(?:#{1,4}\s*)?Day\s+(\d+)[^\n]*/gi;
  const matches = [...markdownText.matchAll(dayHeaderRegex)];

  if (matches.length === 0) {
    return [];
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

      // Handle table rows (e.g., | 🌤️ Clear | • Beach walks | • Bakery visits |)
      if (line.startsWith('|')) {
        const lowerTable = line.toLowerCase();
        if (lowerTable.includes('weather condition') || lowerTable.includes('best outdoor') || lowerTable.includes(':---')) {
          continue; // Skip table header and separator rows
        }

        const cells = line.split('|').map(c => c.trim()).filter(Boolean);
        for (const cell of cells) {
          const subItems = cell.split(/<br\s*\/?>|•|\*/).map(s => s.trim()).filter(Boolean);
          for (const sub of subItems) {
            if (sub.length < 5 || sub.toLowerCase().includes('clear') || sub.toLowerCase().includes('overcast') || sub.toLowerCase().includes('rain')) {
              continue; // Skip weather condition status cells
            }

            const finalTitle = cleanActivityTitle(sub.split(/[,.:]/)[0]);
            const description = sub.replace(/\*\*/g, '').trim();

            let category: Activity['category'] = 'Culture';
            const lowerSub = sub.toLowerCase();
            if (lowerSub.includes('dine') || lowerSub.includes('lunch') || lowerSub.includes('food') || lowerSub.includes('bakery') || lowerSub.includes('cafe')) {
              category = 'Dining';
            } else if (lowerSub.includes('walk') || lowerSub.includes('beach') || lowerSub.includes('fort') || lowerSub.includes('park')) {
              category = 'Outdoor';
            }

            const estimatedCost = getRealisticEstimatedCost(sub, category, budgetTier, activities.length);
            activities.push({
              id: `act_${dayNum}_tbl_${activities.length}`,
              time: '',
              title: finalTitle,
              description: description,
              category,
              location: `${finalTitle}, ${destination}`,
              estimatedCost,
              isIndoor: lowerSub.includes('museum') || lowerSub.includes('indoor') || lowerSub.includes('bakery') || lowerSub.includes('cafe')
            });
          }
        }
        continue;
      }

      if (line.startsWith('*') || line.startsWith('-') || line.startsWith('•') || /^\d+\./.test(line)) {
        let cleanContent = line.replace(/^[\*\-•\d\.\s]+/, '').trim();
        const lowerRaw = cleanContent.toLowerCase();

        // Skip metadata / summary bullet lines that are not real activities
        if (
          lowerRaw.startsWith('date:') ||
          lowerRaw.startsWith('weather:') ||
          lowerRaw.startsWith('theme:') ||
          lowerRaw.startsWith('overview:') ||
          lowerRaw.startsWith('note:') ||
          lowerRaw.startsWith('day ') ||
          lowerRaw.includes('estimated daily cost') ||
          lowerRaw.includes('daily spend') ||
          lowerRaw.includes('total spend')
        ) {
          continue;
        }

        // Cleanly strip time-of-day prefixes (e.g., Morning/Afternoon:, Morning:, Evening:)
        cleanContent = cleanContent
          .replace(/^\*{0,2}\s*(?:Early\s+|Late\s+)?(?:Morning|Afternoon|Evening|Night|Daytime|Lunch|Dinner|Breakfast)(?:[\/\-]\s*(?:Morning|Afternoon|Evening|Night|Daytime|Lunch|Dinner|Breakfast))?\s*\*{0,2}\s*:\s*/i, '')
          .trim();

        if (!cleanContent || cleanContent.length < 5) continue;

        let placeName = '';
        const boldMatch = cleanContent.match(/\*\*([^*]+)\*\*/);
        
        if (boldMatch && boldMatch[1]) {
          placeName = boldMatch[1].trim();
        } else {
          const prepMatch = cleanContent.match(/(?:at the|at|visit|explore|in|to|head to|stroll through|check into|check-in at)\s+([A-Z][A-Za-z0-9\s'’-]+)/);
          if (prepMatch && prepMatch[1]) {
            const extracted = prepMatch[1].split(/(?:,|\.|\s+and\s+|\s+or\s+|\s+for\s+)/)[0].trim();
            if (extracted.length > 3 && extracted.length < 40) {
              placeName = extracted;
            }
          }
        }

        if (!placeName || placeName.length < 3) {
          if (cleanContent.includes(':')) {
            const beforeColon = cleanContent.split(':')[0].trim();
            if (!/^(?:Date|Weather|Morning|Afternoon|Evening|Night|Daytime|Lunch|Dinner|Breakfast)$/i.test(beforeColon)) {
              placeName = beforeColon;
            }
          }
          if (!placeName && cleanContent.includes(' - ')) {
            placeName = cleanContent.split(' - ')[0].trim();
          }
          if (!placeName) {
            const firstClause = cleanContent.split(/[,.]/)[0].trim();
            placeName = firstClause.length <= 35 ? firstClause : firstClause.split(' ').slice(0, 4).join(' ');
          }
        }

        let finalTitle = cleanActivityTitle(placeName);
        if (/^(?:Date|Weather|Morning|Afternoon|Evening|Night|Daytime|Lunch|Dinner|Breakfast|Morning\/Afternoon)$/i.test(finalTitle)) {
          finalTitle = 'Local Experience';
        }

        const description = cleanContent.replace(/\*\*/g, '').trim();

        let locationCapsule = `${destination}`;
        if (finalTitle && !finalTitle.toLowerCase().startsWith('spend') && !finalTitle.toLowerCase().startsWith('enjoy') && !finalTitle.toLowerCase().startsWith('head') && !finalTitle.toLowerCase().startsWith('arrive')) {
          locationCapsule = `${finalTitle}, ${destination}`;
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

        const estimatedCost = getRealisticEstimatedCost(cleanContent, category, budgetTier, i);

        activities.push({
          id: `act_${dayNum}_${i}`,
          time: '',
          title: finalTitle,
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

  return days;
}

export function generateFallbackItinerary(_destination?: string, _startDateStr?: string): ItineraryDay[] {
  return [];
}
