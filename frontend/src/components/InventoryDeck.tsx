import React from 'react';
import { Plane, Building, Star, ExternalLink } from 'lucide-react';
import type { TripState, FlightOption, HotelOption } from '../types';

interface InventoryDeckProps {
  trip: TripState;
}

export const InventoryDeck: React.FC<InventoryDeckProps> = ({ trip }) => {
  const destination = trip.destination || 'Paris';

  const mockFlights: FlightOption[] = [
    {
      id: 'fl_1',
      airline: 'Air France / British Airways',
      flightNumber: 'AF 1681',
      departureTime: '08:45 AM',
      arrivalTime: '11:05 AM',
      duration: '1h 20m',
      price: '$340',
      stops: 'Direct non-stop',
      class: 'Business'
    },
    {
      id: 'fl_2',
      airline: 'Emirates / Codeshare',
      flightNumber: 'EK 304',
      departureTime: '01:15 PM',
      arrivalTime: '03:40 PM',
      duration: '1h 25m',
      price: '$520',
      stops: 'Direct non-stop',
      class: 'First'
    }
  ];

  const mockHotels: HotelOption[] = [
    {
      id: 'ht_1',
      name: `Le Grand Palace Hotel ${destination}`,
      rating: 5,
      pricePerNight: '$680',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
      amenities: ['Private Spa', 'Butler Service', 'Rooftop Bar', 'Michelin Dining'],
      neighborhood: `Central Historic Quarter, ${destination}`,
      badge: 'Concierge Choice'
    },
    {
      id: 'ht_2',
      name: `Boutique Maison & Suites`,
      rating: 4.9,
      pricePerNight: '$420',
      image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80',
      amenities: ['Garden Terrace', 'Artisan Breakfast', 'Airport Transfer', 'High-Speed Wi-Fi'],
      neighborhood: `Arts & Fashion District, ${destination}`,
      badge: 'Boutique Luxury'
    }
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAFAFA] dark:bg-[#0B0F17] overflow-y-auto p-6 space-y-8">
      
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] uppercase font-semibold text-[#D4AF37] tracking-widest">Curated Inventory</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{destination} Options</span>
        </div>
        <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-slate-100">
          Flights & Luxury Accommodations
        </h1>
      </div>

      {/* Flights Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <Plane className="w-5 h-5 text-[#D4AF37]" />
            <span>Recommended Flight Routes ({trip.origin} ➔ {destination})</span>
          </h2>
          <span className="text-xs text-slate-500">Prices aligned to {trip.budget} tier</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockFlights.map((flight) => (
            <div
              key={flight.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#141A26] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 hover:border-[#D4AF37] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-serif font-bold text-sm text-slate-900 dark:text-slate-100 block">
                    {flight.airline}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{flight.flightNumber}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#D4AF37]/15 text-[#B38E46] dark:text-[#D4AF37] font-semibold text-xs">
                  {flight.class} Class
                </span>
              </div>

              <div className="flex items-center justify-between text-xs py-2 border-y border-slate-100 dark:border-slate-800">
                <div className="text-left">
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100 block">{flight.departureTime}</span>
                  <span className="text-[10px] text-slate-400">{trip.origin}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-slate-400">{flight.duration}</span>
                  <div className="w-20 h-0.5 bg-[#D4AF37] relative my-1">
                    <Plane className="w-3 h-3 text-[#D4AF37] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <span className="text-[9px] text-emerald-600 font-semibold">{flight.stops}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100 block">{flight.arrivalTime}</span>
                  <span className="text-[10px] text-slate-400">{destination}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 block">Estimated Fare</span>
                  <span className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">{flight.price}</span>
                </div>
                <a
                  href={`https://www.google.com/travel/flights?q=${encodeURIComponent(trip.origin + ' to ' + destination)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition-opacity flex items-center space-x-1"
                >
                  <span>Check Seats</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Accommodations Section */}
      <div className="space-y-4">
        <h2 className="font-serif font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center space-x-2">
          <Building className="w-5 h-5 text-[#D4AF37]" />
          <span>Selected Stays in {destination}</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockHotels.map((hotel) => (
            <div
              key={hotel.id}
              className="rounded-2xl bg-white dark:bg-[#141A26] border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {hotel.badge && (
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#0F172A]/80 backdrop-blur-md text-[#D4AF37] font-semibold text-[10px] tracking-wide">
                    {hotel.badge}
                  </span>
                )}
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">
                      {hotel.name}
                    </h3>
                    <div className="flex items-center space-x-1 text-amber-500 font-bold text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      <span>{hotel.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                    {hotel.neighborhood}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {hotel.amenities.map((amenity, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-[#1E2638] text-slate-600 dark:text-slate-300 text-[10px] font-medium"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Nightly Rate</span>
                    <span className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">{hotel.pricePerNight}</span>
                  </div>
                  <a
                    href={`https://www.google.com/travel/hotels?q=${encodeURIComponent(hotel.name + ' ' + destination)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-[#D4AF37] text-white text-xs font-semibold hover:bg-[#B38E46] transition-colors flex items-center space-x-1"
                  >
                    <span>View Property</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
