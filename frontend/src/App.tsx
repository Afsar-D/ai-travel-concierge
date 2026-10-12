import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { LoadingScreen } from './components/LoadingScreen';
import { LoginPage } from './components/LoginPage';
import { TripDashboard } from './components/TripDashboard';
import { TripPlanView } from './components/TripPlanView';
import { ConciergeChatModal } from './components/ConciergeChatModal';
import { CreateTripModal } from './components/CreateTripModal';
import { ExportModal } from './components/ExportModal';

import { AuthErrorPage } from './components/AuthErrorPage';
import { NotFound404Page } from './components/NotFound404Page';

import type { UserProfile, TripState, ItineraryDay } from './types';
import { parseMarkdownToItinerary } from './utils/itineraryParser';
import { parseBackendReply } from './utils/parser';
import { fetchUserSessions, deleteUserSession } from './services/api';
import { getDestinationBackgroundImage } from './utils/themeUtils';

const sanitizeTripData = (t: TripState): TripState => {
  const cleaned: TripState = {
    ...t,
    bgImage: t.bgImage || getDestinationBackgroundImage(t.destination)
  };

  // If previous chat session corrupted description with flight or hotel text
  if (t.description && (/\[Outbound|\* \*\*Outbound|Price per night/i.test(t.description))) {
    const parsed = parseBackendReply(t.description, t.origin, t.destination);
    if (parsed.flights.length > 0 && (!t.flights || t.flights.length === 0)) {
      cleaned.flights = parsed.flights;
    }
    if (parsed.hotels.length > 0 && (!t.hotels || t.hotels.length === 0)) {
      cleaned.hotels = parsed.hotels;
    }
    cleaned.description = t.description
      .replace(/\[?(?:Outbound|Return Flight|Flight Options|Hotels?)[\s\S]*$/i, '')
      .trim();
  }
  return cleaned;
};

export function App() {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const token = localStorage.getItem('odyssey_token');
      if (!token) return null;
      const stored = localStorage.getItem('odyssey_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [authError, setAuthError] = useState<{ message?: string; statusCode?: number } | null>(null);

  const [viewMode, setViewMode] = useState<'dashboard' | 'planDetail' | '404'>(() => {
    try {
      const path = window.location.pathname;
      if (path === '/404' || (path !== '/' && path !== '' && path !== '/index.html')) {
        return '404';
      }
    } catch {}
    return 'dashboard';
  });

  useEffect(() => {
    const handleAuthErrorEvent = (e: any) => {
      setAuthError({
        statusCode: e.detail?.statusCode || 401,
        message: e.detail?.message || 'Your security session has expired. Please sign in again.'
      });
      setUser(null);
    };

    const handlePopState = () => {
      try {
        const path = window.location.pathname;
        if (path === '/404') {
          setViewMode('404');
        } else {
          setViewMode('dashboard');
        }
      } catch {}
    };

    window.addEventListener('odyssey_auth_error', handleAuthErrorEvent);
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('odyssey_auth_error', handleAuthErrorEvent);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const [isConciergeOpen, setIsConciergeOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const getTripStorageKey = (userEmail?: string | null) => {
    if (userEmail) {
      return `odyssey_trips_${userEmail.toLowerCase().trim()}`;
    }
    return 'odyssey_trips';
  };

  const [trips, setTrips] = useState<TripState[]>(() => {
    try {
      const storedUser = localStorage.getItem('odyssey_user');
      const email = storedUser ? JSON.parse(storedUser)?.email : null;
      const key = getTripStorageKey(email);
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed: TripState[] = JSON.parse(stored);
        return parsed.map(sanitizeTripData);
      }
      return [];
    } catch {
      return [];
    }
  });

  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      setIsInitialLoading(true);
      const storageKey = getTripStorageKey(user.email);
      
      // Load user-scoped local trips first
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed: TripState[] = JSON.parse(stored).map(sanitizeTripData);
          setTrips(parsed);
          if (parsed.length > 0) {
            setActiveTrip(parsed[0]);
            setItineraryDays(parseMarkdownToItinerary(parsed[0].description, parsed[0].destination, parsed[0].start_date, parsed[0].budget));
          } else {
            setActiveTrip(null);
            setItineraryDays([]);
          }
        } else {
          setTrips([]);
          setActiveTrip(null);
          setItineraryDays([]);
        }
      } catch {
        setTrips([]);
      }

      fetchUserSessions()
        .then(remoteTrips => {
          if (!localStorage.getItem('odyssey_token')) {
            setUser(null);
            return;
          }
          if (remoteTrips && remoteTrips.length > 0) {
            // Pre-load images in background for instant presentation
            remoteTrips.forEach(rt => {
              const url = rt.bgImage || getDestinationBackgroundImage(rt.destination);
              const img = new Image();
              img.src = url;
            });

            setTrips(prev => {
              const remoteKeys = new Set<string>();
              remoteTrips.forEach(rt => {
                if (rt.id) remoteKeys.add(rt.id);
                if (rt.session_id) remoteKeys.add(rt.session_id);
                if (rt.destination && rt.start_date) {
                  remoteKeys.add(`${rt.destination.toLowerCase().trim()}_${rt.start_date}`);
                }
              });

              const localOnly = prev.filter(pt => {
                const destKey = `${pt.destination.toLowerCase().trim()}_${pt.start_date}`;
                return !remoteKeys.has(pt.id) && !remoteKeys.has(pt.session_id) && !remoteKeys.has(destKey);
              });

              const cleanRemote = remoteTrips.map(sanitizeTripData);

              const merged = [...cleanRemote, ...localOnly];
              try {
                localStorage.setItem(storageKey, JSON.stringify(merged));
              } catch {}
              return merged;
            });
          }
        })
        .finally(() => {
          setTimeout(() => {
            setIsInitialLoading(false);
          }, 500);
        });
    } else {
      setTrips([]);
      setActiveTrip(null);
      setItineraryDays([]);
      setIsInitialLoading(false);
    }
  }, [user]);

  const [activeTrip, setActiveTrip] = useState<TripState | null>(() => {
    try {
      const storedUser = localStorage.getItem('odyssey_user');
      const email = storedUser ? JSON.parse(storedUser)?.email : null;
      const key = getTripStorageKey(email);
      const storedTrips = localStorage.getItem(key);
      if (storedTrips) {
        const parsed: TripState[] = JSON.parse(storedTrips);
        if (parsed.length > 0) {
          return sanitizeTripData(parsed[0]);
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
      const key = getTripStorageKey(userProfile.email);
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed: TripState[] = JSON.parse(stored);
        setTrips(parsed);
        if (parsed.length > 0) {
          setActiveTrip(parsed[0]);
          setItineraryDays(parseMarkdownToItinerary(parsed[0].description, parsed[0].destination, parsed[0].start_date, parsed[0].budget));
        } else {
          setActiveTrip(null);
          setItineraryDays([]);
        }
      } else {
        setTrips([]);
        setActiveTrip(null);
        setItineraryDays([]);
      }
    } catch (e) {
      // Storage quota fallback
    }
    setViewMode('dashboard');
  };

  const handleLogout = () => {
    const currentEmail = user?.email;
    setUser(null);
    setTrips([]);
    setActiveTrip(null);
    setItineraryDays([]);
    try {
      localStorage.removeItem('odyssey_user');
      localStorage.removeItem('odyssey_token');
      localStorage.removeItem('odyssey_trips');
      if (currentEmail) {
        localStorage.removeItem(getTripStorageKey(currentEmail));
      }
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
    setPlanActiveTab('itinerary');
    setViewMode('planDetail');
  };

  const handleBookmarkTrip = (tripId: string) => {
    setTrips(prev => {
      const updated = prev.map(t => t.id === tripId ? { ...t, isBookmarked: !t.isBookmarked } : t);
      try {
        localStorage.setItem(getTripStorageKey(user?.email), JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleCreateTrip = (newTrip: TripState) => {
    setTrips(prev => {
      const filtered = prev.filter(t => 
        t.id !== newTrip.id && 
        t.session_id !== newTrip.session_id &&
        !(t.destination.toLowerCase().trim() === newTrip.destination.toLowerCase().trim() && t.start_date === newTrip.start_date)
      );
      const updated = [newTrip, ...filtered];
      try {
        localStorage.setItem(getTripStorageKey(user?.email), JSON.stringify(updated));
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
      colors: ['#F43F5E', '#FB7185', '#FDA4AF', '#FFFFFF'],
    });
  };

  const [selectedTimelineDayIndex, setSelectedTimelineDayIndex] = useState<number>(0);
  const [lastUpdatedDayNumber, setLastUpdatedDayNumber] = useState<number | null>(null);
  const [planActiveTab, setPlanActiveTab] = useState<'itinerary' | 'inventory'>('itinerary');

  const handleNavigateToInventory = () => {
    setPlanActiveTab('inventory');
    setViewMode('planDetail');
  };

  const handleNavigateToDay = (dayNumber: number) => {
    const idx = Math.max(0, dayNumber - 1);
    setSelectedTimelineDayIndex(idx);
    setLastUpdatedDayNumber(dayNumber);
    setPlanActiveTab('itinerary');
    setViewMode('planDetail');
  };

  const handleUpdateItinerary = (updatedTrip: TripState, updatedDays: ItineraryDay[]) => {
    setActiveTrip(updatedTrip);
    setItineraryDays(updatedDays);
    setTrips(prev => {
      const updated = prev.map(t => 
        (t.id === updatedTrip.id || (t.session_id && t.session_id === updatedTrip.session_id)) 
          ? updatedTrip 
          : t
      );
      try {
        localStorage.setItem(getTripStorageKey(user?.email), JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleDeleteTrip = (tripId: string) => {
    deleteUserSession(tripId).catch(() => {});

    setTrips(prev => {
      const updated = prev.filter(t => t.id !== tripId);
      try {
        localStorage.setItem(getTripStorageKey(user?.email), JSON.stringify(updated));
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

  if (authError) {
    return (
      <AuthErrorPage
        statusCode={authError.statusCode}
        message={authError.message}
        onLoginAgain={() => {
          setAuthError(null);
          setUser(null);
          try {
            localStorage.removeItem('odyssey_token');
            localStorage.removeItem('odyssey_user');
          } catch {}
        }}
      />
    );
  }

  if (viewMode === '404') {
    return (
      <NotFound404Page
        onBackToDashboard={() => {
          try {
            window.history.pushState({}, '', '/');
          } catch {}
          setViewMode('dashboard');
        }}
        onCreateNewTrip={() => {
          try {
            window.history.pushState({}, '', '/');
          } catch {}
          setViewMode('dashboard');
          setIsCreateOpen(true);
        }}
      />
    );
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (isInitialLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen w-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased overflow-x-hidden selection:bg-rose-500/20">
      
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
      ) : activeTrip ? (
        <TripPlanView
          trip={activeTrip}
          days={itineraryDays}
          selectedDayIndex={selectedTimelineDayIndex}
          onSelectDayIndex={setSelectedTimelineDayIndex}
          lastUpdatedDayNumber={lastUpdatedDayNumber}
          activeTab={planActiveTab}
          onTabChange={setPlanActiveTab}
          onBack={() => setViewMode('dashboard')}
          onOpenConciergeChat={() => setIsConciergeOpen(true)}
          onOpenExport={() => setIsExportOpen(true)}
          onDeleteTrip={handleDeleteTrip}
        />
      ) : (
        <NotFound404Page
          customMessage="We could not locate this itinerary. It may have been removed or archived."
          onBackToDashboard={() => setViewMode('dashboard')}
          onCreateNewTrip={() => {
            setViewMode('dashboard');
            setIsCreateOpen(true);
          }}
        />
      )}

      <ConciergeChatModal
        isOpen={isConciergeOpen}
        onClose={() => setIsConciergeOpen(false)}
        trip={activeTrip}
        onUpdateItinerary={handleUpdateItinerary}
        onNavigateToDay={handleNavigateToDay}
        onNavigateToInventory={handleNavigateToInventory}
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
