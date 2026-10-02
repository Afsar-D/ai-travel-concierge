import type { FlightOption, HotelOption } from '../types';

export interface ParsedBackendData {
  flights: FlightOption[];
  hotels: HotelOption[];
  itinerarySummary: string;
}

export function parseBackendReply(reply: string, origin: string, destination: string): ParsedBackendData {
  const flights: FlightOption[] = [];
  const hotels: HotelOption[] = [];

  if (!reply) {
    return { flights, hotels, itinerarySummary: '' };
  }

  const lines = reply.split('\n');

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Flight pattern matching: e.g. "Chhatrapati Shivaji Maharaj...[08:45 AM] --> Indira Gandhi...[11:05 AM], price : ₹10,412/-"
    if (trimmed.includes('-->') || (trimmed.includes('[') && trimmed.includes(']') && (trimmed.includes('₹') || trimmed.toLowerCase().includes('price')))) {
      try {
        const parts = trimmed.split('-->');
        const depPart = parts[0] || '';
        const arrPart = parts[1] || '';

        const depMatch = depPart.match(/^(.*?)\s*\[(.*?)\]/);
        const arrMatch = arrPart.match(/^(.*?)\s*\[(.*?)\]/);
        const priceMatch = trimmed.match(/price\s*:\s*([^/\-\n]+)/i) || trimmed.match(/₹\s*[\d,]+/);

        const depAirport = depMatch ? depMatch[1].replace(/^[-*\s]+/, '').trim() : origin;
        const depTime = depMatch ? depMatch[2].trim() : '08:00 AM';
        const arrAirport = arrMatch ? arrMatch[1].trim() : destination;
        const arrTime = arrMatch ? arrMatch[2].split(',')[0].trim() : '10:30 AM';
        const rawPrice = priceMatch ? (priceMatch[1] ? priceMatch[1].trim() : priceMatch[0].trim()) : '₹5,499';

        flights.push({
          id: `flight_${idx}`,
          airline: depAirport.length > 30 ? depAirport.substring(0, 30) + '...' : depAirport,
          flightNumber: `AI-${Math.floor(100 + Math.random() * 900)}`,
          departureTime: depTime,
          arrivalTime: arrTime,
          duration: '2h 15m',
          price: rawPrice.includes('₹') ? rawPrice : `₹${rawPrice}`,
          stops: 'Non-stop',
          class: 'Economy',
          departureAirport: depAirport,
          arrivalAirport: arrAirport
        });
      } catch (err) {
        // Fallback parser ignore
      }
    }

    // Hotel pattern matching: e.g. "Lemon Tree Premier... Rating : 4.2 ... Rate Per Night : ₹10,412 ... Amenities : Free Wi-Fi..."
    if (trimmed.includes('Rating') || trimmed.includes('Rate Per Night')) {
      try {
        const hotelName = trimmed.replace(/^[-*\s\d.]+/, '').split('\n')[0].split('-')[0].trim();
        if (hotelName.length > 3 && !hotelName.toLowerCase().includes('rating')) {
          const ratingMatch = reply.match(new RegExp(`${hotelName}.*?Rating\\s*:\\s*([\\d.]+)`, 'i'));
          const rateMatch = reply.match(new RegExp(`${hotelName}.*?Rate Per Night\\s*:\\s*([^\\n]+)`, 'i'));
          const amenitiesMatch = reply.match(new RegExp(`${hotelName}.*?Amenities\\s*:\\s*([^\\n]+)`, 'i'));

          const rating = ratingMatch ? parseFloat(ratingMatch[1]) : 4.5;
          const rate = rateMatch ? rateMatch[1].replace(/[-/]/g, '').trim() : '₹6,500';
          const amenitiesStr = amenitiesMatch ? amenitiesMatch[1].trim() : 'Free Wi-Fi, Air Conditioning, Restaurant';
          const amenities = amenitiesStr.split(',').map(a => a.trim()).slice(0, 5);

          if (!hotels.some(h => h.name === hotelName)) {
            hotels.push({
              id: `hotel_${idx}`,
              name: hotelName,
              rating: isNaN(rating) ? 4.2 : rating,
              pricePerNight: rate.includes('₹') ? rate : `₹${rate}`,
              image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
              amenities: amenities.length > 0 ? amenities : ['Free Wi-Fi', 'Breakfast', 'Pool'],
              neighborhood: `${destination} City Center`,
              badge: rating >= 4.4 ? 'Luxury Top Rated' : 'Popular Choice'
            });
          }
        }
      } catch (err) {
        // Fallback parser ignore
      }
    }
  });

  return {
    flights,
    hotels,
    itinerarySummary: reply
  };
}
