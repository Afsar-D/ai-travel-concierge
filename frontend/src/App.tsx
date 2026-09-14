import { useState } from 'react';
import confetti from 'canvas-confetti';
import { LoginPage } from './components/LoginPage';
import { TripDashboard } from './components/TripDashboard';
import { TripPlanView } from './components/TripPlanView';
import { ConciergeChatModal } from './components/ConciergeChatModal';
import { CreateTripModal } from './components/CreateTripModal';
import { ExportModal } from './components/ExportModal';

import type { UserProfile, TripState, ItineraryDay } from './types';
import { generateFallbackItinerary } from './utils/itineraryParser';

export function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [viewMode, setViewMode] = useState<'dashboard' | 'planDetail'>('dashboard');

  const [isConciergeOpen, setIsConciergeOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const [trips, setTrips] = useState<TripState[]>([
    {
      id: 'trip_1',
      origin: 'London',
      destination: 'INDONESIA',
      country: 'Southeast Asia',
      description: 'As the largest archipelagic country in the world, Indonesia is blessed with so many different people, cultures, customs, traditions, artworks, food, animals, plants, landscapes, and everything that made it almost like 100 (or even 200) countries melted beautifully into one.',
      bgImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=90',
      start_date: '2026-10-15',
      end_date: '2026-10-22',
      budget: 'high',
      guest_count: 2,
      session_id: 'sess_indonesia_1',
      status: 'active',
      isBookmarked: true
    },
    {
      id: 'trip_2',
      origin: 'London',
      destination: 'Thailand',
      country: 'Buddha temple, Thailand',
      description: 'Experience golden royal palaces, ancient Buddhist temples, artisan night markets, and tropical pristine island beaches.',
      bgImage: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1600&q=80',
      start_date: '2026-11-05',
      end_date: '2026-11-12',
      budget: 'high',
      guest_count: 2,
      session_id: 'sess_thailand_2',
      status: 'active',
      isBookmarked: true
    },
    {
      id: 'trip_3',
      origin: 'London',
      destination: 'Bali',
      country: 'Broken Beach, Bali',
      description: 'Explore dramatic limestone cliff formations, crystal turquoise ocean lagoons, sacred monkey forests, and luxury private pool villas.',
      bgImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1600&q=80',
      start_date: '2026-12-01',
      end_date: '2026-12-08',
      budget: 'high',
      guest_count: 2,
      session_id: 'sess_bali_3',
      status: 'active',
      isBookmarked: false
    },
    {
      id: 'trip_4',
      origin: 'London',
      destination: 'Kerala',
      country: 'God’s Own Country, India',
      description: 'Sail through serene palm-fringed backwaters on a luxury private houseboat, sample authentic spices, and rejuvenate with holistic spa retreats.',
      bgImage: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1600&q=80',
      start_date: '2027-01-10',
      end_date: '2027-01-18',
      budget: 'high',
      guest_count: 2,
      session_id: 'sess_kerala_4',
      status: 'past',
      isBookmarked: true
    }
  ]);

  const [activeTrip, setActiveTrip] = useState<TripState | null>(trips[0] || null);

  const [itineraryDays, setItineraryDays] = useState<ItineraryDay[]>(() =>
    generateFallbackItinerary(trips[0]?.destination || 'INDONESIA', trips[0]?.start_date || '2026-10-15')
  );

  const handleLogin = (userProfile: UserProfile) => {
    setUser(userProfile);
    setViewMode('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleSelectTrip = (selected: TripState) => {
    setActiveTrip(selected);
    setItineraryDays(generateFallbackItinerary(selected.destination, selected.start_date));
  };

  const handleExploreTrip = (targetTrip: TripState) => {
    setActiveTrip(targetTrip);
    setItineraryDays(generateFallbackItinerary(targetTrip.destination, targetTrip.start_date));
    setViewMode('planDetail');
  };

  const handleBookmarkTrip = (tripId: string) => {
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, isBookmarked: !t.isBookmarked } : t));
  };

  const handleCreateTrip = (newTrip: TripState) => {
    setTrips(prev => [newTrip, ...prev]);
    setActiveTrip(newTrip);
    setItineraryDays(generateFallbackItinerary(newTrip.destination, newTrip.start_date));
    setViewMode('planDetail');

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.8 },
      colors: ['#D4AF37', '#3B82F6', '#FFFFFF'],
    });
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen w-screen bg-slate-950 text-white font-sans antialiased overflow-x-hidden selection:bg-[#D4AF37]/30">
      
      {viewMode === 'dashboard' ? (
        <TripDashboard
          user={user}
          trips={trips}
          activeTrip={activeTrip}
          onSelectTrip={handleSelectTrip}
          onExploreTrip={handleExploreTrip}
          onOpenCreateModal={() => setIsCreateOpen(true)}
          onOpenConciergeChat={() => setIsConciergeOpen(true)}
          onLogout={handleLogout}
          onBookmarkTrip={handleBookmarkTrip}
        />
      ) : (
        <TripPlanView
          trip={activeTrip!}
          days={itineraryDays}
          onBack={() => setViewMode('dashboard')}
          onOpenConciergeChat={() => setIsConciergeOpen(true)}
          onOpenExport={() => setIsExportOpen(true)}
        />
      )}

      <ConciergeChatModal
        isOpen={isConciergeOpen}
        onClose={() => setIsConciergeOpen(false)}
        trip={activeTrip}
      />

      <CreateTripModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreateTrip={handleCreateTrip}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        days={itineraryDays}
        trip={activeTrip!}
      />

    </div>
  );
}
