import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { LoginPage } from './components/LoginPage';
import { TripDashboard } from './components/TripDashboard';
import { TripPlanView } from './components/TripPlanView';
import { ConciergeChatModal } from './components/ConciergeChatModal';
import { CreateTripModal } from './components/CreateTripModal';
import { ExportModal } from './components/ExportModal';

import type { UserProfile, TripState, ItineraryDay } from './types';
import { parseMarkdownToItinerary } from './utils/itineraryParser';
import { fetchUserSessions, deleteUserSession } from './services/api';
import { getDestinationBackgroundImage } from './utils/themeUtils';

export function App() {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem('odyssey_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [viewMode, setViewMode] = useState<'dashboard' | 'planDetail'>('dashboard');

  const [isConciergeOpen, setIsConciergeOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const [trips, setTrips] = useState<TripState[]>(() => {
    try {
      const stored = localStorage.getItem('odyssey_trips');
      if (stored) {
        const parsed: TripState[] = JSON.parse(stored);
        return parsed.map(t => ({
          ...t,
          bgImage: t.bgImage || getDestinationBackgroundImage(t.destination)
        }));
      }
      return [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (user) {
      fetchUserSessions().then(remoteTrips => {
        if (remoteTrips && remoteTrips.length > 0) {
          setTrips(prev => {
            const mergedMap = new Map<string, TripState>();
            remoteTrips.forEach(t => mergedMap.set(t.id, {
              ...t,
              bgImage: t.bgImage || getDestinationBackgroundImage(t.destination)
            }));
            prev.forEach(t => mergedMap.set(t.id, {
              ...t,
              bgImage: t.bgImage || getDestinationBackgroundImage(t.destination)
            }));
            const merged = Array.from(mergedMap.values());
            try {
              localStorage.setItem('odyssey_trips', JSON.stringify(merged));
            } catch {}
            return merged;
          });
        }
      });
    }
  }, [user]);

  const [activeTrip, setActiveTrip] = useState<TripState | null>(() => {
    try {
      const storedTrips = localStorage.getItem('odyssey_trips');
      if (storedTrips) {
        const parsed: TripState[] = JSON.parse(storedTrips);
        if (parsed.length > 0) {
          return {
            ...parsed[0],
            bgImage: parsed[0].bgImage || getDestinationBackgroundImage(parsed[0].destination)
          };
        }
      }
    } catch {}
    return null;
  });

  const [itineraryDays, setItineraryDays] = useState<ItineraryDay[]>(() => {
    if (activeTrip && activeTrip.description) {
      return parseMarkdownToItinerary(activeTrip.description, activeTrip.destination, activeTrip.start_date, activeTrip.budget);
    }
    return [];
  });

  const handleLogin = (userProfile: UserProfile) => {
    setUser(userProfile);
    try {
      localStorage.setItem('odyssey_user', JSON.stringify(userProfile));
    } catch (e) {
      // Storage quota fallback
    }
    setViewMode('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setTrips([]);
    setActiveTrip(null);
    setItineraryDays([]);
    try {
      localStorage.removeItem('odyssey_user');
      localStorage.removeItem('odyssey_token');
      localStorage.removeItem('odyssey_trips');
    } catch (e) {
      // Storage quota fallback
    }
  };

  const handleSelectTrip = (selected: TripState) => {
    setActiveTrip(selected);
    setItineraryDays(parseMarkdownToItinerary(selected.description, selected.destination, selected.start_date, selected.budget));
  };

  const handleExploreTrip = (targetTrip: TripState) => {
    setActiveTrip(targetTrip);
    setItineraryDays(parseMarkdownToItinerary(targetTrip.description, targetTrip.destination, targetTrip.start_date, targetTrip.budget));
    setViewMode('planDetail');
  };

  const handleBookmarkTrip = (tripId: string) => {
    setTrips(prev => {
      const updated = prev.map(t => t.id === tripId ? { ...t, isBookmarked: !t.isBookmarked } : t);
      try {
        localStorage.setItem('odyssey_trips', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleCreateTrip = (newTrip: TripState) => {
    setTrips(prev => {
      const updated = [newTrip, ...prev];
      try {
        localStorage.setItem('odyssey_trips', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    setActiveTrip(newTrip);
    setItineraryDays(parseMarkdownToItinerary(newTrip.description, newTrip.destination, newTrip.start_date, newTrip.budget));
    setViewMode('planDetail');

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.8 },
      colors: ['#D4AF37', '#3B82F6', '#FFFFFF'],
    });
  };

  const handleUpdateItinerary = (updatedTrip: TripState, updatedDays: ItineraryDay[]) => {
    setActiveTrip(updatedTrip);
    setItineraryDays(updatedDays);
    setTrips(prev => {
      const updated = prev.map(t => t.id === updatedTrip.id ? updatedTrip : t);
      try {
        localStorage.setItem('odyssey_trips', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleDeleteTrip = (tripId: string) => {
    deleteUserSession(tripId).catch(() => {});

    setTrips(prev => {
      const updated = prev.filter(t => t.id !== tripId);
      try {
        localStorage.setItem('odyssey_trips', JSON.stringify(updated));
      } catch (e) {}

      if (activeTrip && activeTrip.id === tripId) {
        const nextActive = updated.length > 0 ? updated[0] : null;
        setActiveTrip(nextActive);
        if (nextActive) {
          setItineraryDays(parseMarkdownToItinerary(nextActive.description, nextActive.destination, nextActive.start_date, nextActive.budget));
        } else {
          setItineraryDays([]);
        }
        setViewMode('dashboard');
      }
      return updated;
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
          onDeleteTrip={handleDeleteTrip}
        />
      ) : (
        <TripPlanView
          trip={activeTrip!}
          days={itineraryDays}
          onBack={() => setViewMode('dashboard')}
          onOpenConciergeChat={() => setIsConciergeOpen(true)}
          onOpenExport={() => setIsExportOpen(true)}
          onDeleteTrip={handleDeleteTrip}
        />
      )}

      <ConciergeChatModal
        isOpen={isConciergeOpen}
        onClose={() => setIsConciergeOpen(false)}
        trip={activeTrip}
        onUpdateItinerary={handleUpdateItinerary}
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
