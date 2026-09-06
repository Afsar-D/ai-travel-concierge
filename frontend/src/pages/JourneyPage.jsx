import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CloudSun,
  Coffee,
  Landmark,
  ListChecks,
  Luggage,
  MapPin,
  MoreHorizontal,
  Navigation,
  Plus,
  Route,
  Sparkles,
  ThermometerSun,
  Trash2,
  Umbrella,
  UsersRound,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createItinerary, getItineraries } from "../lib/api";

const fallbackDayPlan = [
  { number: "01", title: "Arrive slowly", copy: "Baixa check-in, a late custard tart, then sunset from Miradouro da Senhora do Monte.", tag: "18 min walk", icon: Navigation },
  { number: "02", title: "Tiles, books & water", copy: "Azulejo Museum in the morning, time for Alfama lanes, and a Tagus-side table at dusk.", tag: "6 stops", icon: Landmark },
  { number: "03", title: "The long table", copy: "LX Factory browsing, a relaxed lunch in Estrela, and a reservation at Prado.", tag: "1 reservation", icon: Coffee },
];

const initialPacking = [
  { label: "Light layers", status: "3–4 pieces", done: true },
  { label: "Walking shoes", status: "12k steps/day", done: false },
  { label: "EU adapter", status: "Type C / F", done: true },
  { label: "Compact umbrella", status: "Low chance", done: false },
];

export default function JourneyPage() {
  const [hasTrip, setHasTrip] = useState(true);
  const [activeTab, setActiveTab] = useState("Route");
  const [destination, setDestination] = useState("Lisbon, Portugal");
  const [packingItems, setPackingItems] = useState(initialPacking);
  const [dayPlan, setDayPlan] = useState(fallbackDayPlan);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const updateRouteData = useCallback((itinerary) => {
    setDestination(itinerary.destination);
    if (itinerary.days) {
      const generatedDays = Array.from({ length: itinerary.days }, (_, i) => {
        const dayNum = String(i + 1).padStart(2, '0');
        if (i === 0) return { number: dayNum, title: "Arrive & Explore", copy: `Settle into your stay in ${itinerary.destination}, pick up local bites, and catch the sunset views.`, tag: "15 min walk", icon: Navigation };
        if (i === 1) return { number: dayNum, title: "Culture Walk", copy: "Visit landmark museums, wander historic lanes, and try traditional coffee.", tag: "4 stops", icon: Landmark };
        return { number: dayNum, title: "Leisure & Dining", copy: "Relaxed shopping, park walks, and dining at a recommended local hotspot.", tag: "1 reservation", icon: Coffee };
      });
      setDayPlan(generatedDays);
    }
  }, []);

  useEffect(() => {
    async function loadLatestItinerary() {
      try {
        const itineraries = await getItineraries();
        if (itineraries.length) {
          updateRouteData(itineraries[0]);
          setHasTrip(true);
        }
      } catch {
        setHasTrip(localStorage.getItem("has_active_journey") !== "false");
      }
    }

    loadLatestItinerary();
  }, [updateRouteData]);

  const generateRoute = async () => {
    const place = destination.trim() || "your destination";
    setLoading(true);

    try {
      const itinerary = await createItinerary({ destination: place, days: 3 });
      updateRouteData(itinerary);
      setHasTrip(true);
      localStorage.setItem("has_active_journey", "true");
      setActiveTab("Route");
      toast.success(`A fresh route for ${place} is ready to review.`);
    } catch {
      toast.error("Could not generate the route. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTrip = () => {
    toast.success(`Trip to ${destination} marked as Completed! Moved to My Journeys archive.`);
    setHasTrip(false);
    localStorage.setItem("has_active_journey", "false");
  };

  const handleDeleteTrip = () => {
    if (window.confirm(`Are you sure you want to delete the active journey to ${destination}?`)) {
      toast.info(`Active trip to ${destination} was deleted.`);
      setHasTrip(false);
      localStorage.setItem("has_active_journey", "false");
    }
  };

  const togglePackItem = (index) => {
    setPackingItems((items) =>
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, done: !item.done } : item
      )
    );
  };

  if (!hasTrip) {
    return (
      <div className="workspace" style={{ textAlign: "center", padding: "80px 24px" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--secondary)", display: "grid", placeItems: "center", margin: "0 auto 20px", color: "#e8533e" }}>
          <Sparkles size={28} />
        </div>
        <h2 className="font-serif" style={{ fontSize: 32, marginBottom: 12 }}>No Active Journey</h2>
        <p style={{ maxWidth: 440, margin: "0 auto 28px", color: "var(--muted-foreground)", fontSize: 14 }}>
          You don't have an active trip currently in progress. Start drafting your next horizon or explore curated places.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            to="/plan"
            className="planner-button"
            style={{ textDecoration: "none", height: 44, padding: "0 22px", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <Plus size={16} /> Plan a Trip
          </Link>
          <Link
            to="/my-journeys"
            className="route-tab"
            style={{ textDecoration: "none", height: 44, padding: "0 20px", display: "inline-flex", alignItems: "center", borderRadius: "var(--radius)", background: "var(--card)", border: "1px solid var(--border)", fontWeight: 700 }}
          >
            View Past Journeys
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="workspace">
      <section className="welcome-row" aria-labelledby="page-title">
        <div>
          <p className="eyebrow">
            <span className="eyebrow-line" />Your next departure
          </p>
          <h1 className="page-title font-serif" id="page-title">
            Make room for<br />the memorable parts.
          </h1>
        </div>
        <p className="welcome-copy">
          Build a considered route, then let the practical details fall quietly into place.
        </p>
      </section>

      <section className="planner-strip" aria-label="Start a new journey">
        <label className="plan-field">
          <span className="field-label">Where to?</span>
          <span className="field-value">
            <MapPin size={15} />
            <input
              id="plan-start"
              className="destination-input"
              aria-label="Destination"
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
            />
          </span>
        </label>
        <button
          className="plan-field"
          type="button"
          onClick={() => toast.info("Date picker coming in the full planning flow.")}
        >
          <span className="field-label">When</span>
          <span className="field-value">
            <CalendarDays size={15} />08 — 14 Sep
          </span>
        </button>
        <button
          className="plan-field"
          type="button"
          onClick={() => toast.info("Traveler details are saved for this route.")}
        >
          <span className="field-label">Travelers</span>
          <span className="field-value">
            <UsersRound size={15} />2 adults
          </span>
        </button>
        <button
          className="planner-button"
          type="button"
          disabled={loading}
          onClick={generateRoute}
        >
          <Sparkles size={15} />
          {loading ? "Generating..." : "Generate route"}
        </button>
      </section>

      <div className="board-grid">
        <div className="content-column">
          <section aria-labelledby="departure-heading">
            <div className="section-heading">
              <h2 id="departure-heading">Upcoming departure</h2>
              
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  type="button"
                  className="route-tab"
                  onClick={handleCompleteTrip}
                  style={{
                    height: 32,
                    padding: "0 12px",
                    borderRadius: 8,
                    fontSize: 12,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    color: "#2e7d32",
                    background: "rgba(46, 125, 50, 0.08)",
                    border: "1px solid rgba(46, 125, 50, 0.2)",
                  }}
                >
                  <CheckCircle2 size={13} /> Mark Completed
                </button>

                <button
                  type="button"
                  className="route-tab"
                  onClick={handleDeleteTrip}
                  style={{
                    height: 32,
                    padding: "0 12px",
                    borderRadius: 8,
                    fontSize: 12,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    color: "#b94839",
                    background: "rgba(185, 72, 57, 0.08)",
                    border: "1px solid rgba(185, 72, 57, 0.2)",
                  }}
                >
                  <Trash2 size={13} /> Delete Trip
                </button>

                <button
                  className="text-link"
                  type="button"
                  onClick={() => toast.info("Trip sharing is ready for your collaborators.")}
                >
                  Share <ArrowUpRight size={13} />
                </button>
              </div>
            </div>
            <article className="trip-hero">
              <div className="trip-summary">
                <div>
                  <span className="status-label">
                    <span className="status-pulse" />Route in progress
                  </span>
                  <h2 className="trip-place font-serif">{destination.split(',')[0]}</h2>
                  <p className="trip-dates">8–14 September 2026 · {destination.split(',')[1] || 'Portugal'}</p>
                </div>
                <div className="trip-data">
                  <div>
                    <span>Trip pace</span>
                    <strong>Unhurried</strong>
                  </div>
                  <div>
                    <span>Stay</span>
                    <strong>Alfama</strong>
                  </div>
                  <div>
                    <span>Budget</span>
                    <strong>€€</strong>
                  </div>
                </div>
              </div>
              <div className="trip-image">
                <img
                  src="https://images.unsplash.com/photo-1509840144524-f679051874b2?auto=format&fit=crop&w=1000&q=80"
                  alt="Lisbon rooftops overlooking the Tagus River at golden hour"
                />
                <span className="hero-image-note">38.7223° N, 9.1393° W</span>
              </div>
            </article>
          </section>

          <section className="route-panel" aria-labelledby="route-heading">
            <div className="section-heading" style={{ marginBottom: 0 }}>
              <h2 id="route-heading">The route</h2>
              <button
                className="text-link"
                type="button"
                onClick={() => toast.info("The full itinerary is displayed below.")}
              >
                Open itinerary <ChevronRight size={13} />
              </button>
            </div>
            <div className="route-tabs" role="tablist" aria-label="Itinerary display">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "Route"}
                className={`route-tab ${activeTab === "Route" ? "active" : ""}`}
                onClick={() => setActiveTab("Route")}
              >
                Route sketch
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "Schedule"}
                className={`route-tab ${activeTab === "Schedule" ? "active" : ""}`}
                onClick={() => setActiveTab("Schedule")}
              >
                Daily schedule
              </button>
            </div>

            {activeTab === "Route" ? (
              <div className="itinerary-list">
                {dayPlan.map((day) => {
                  const Icon = day.icon;
                  return (
                    <article className="day-row" key={day.number}>
                      <span className="day-marker">
                        <Route size={14} />
                      </span>
                      <span className="day-number">Day {day.number}</span>
                      <div className="day-content">
                        <h3>{day.title}</h3>
                        <p>{day.copy}</p>
                      </div>
                      <span className="day-tag">
                        <Icon size={11} />
                        {day.tag}
                      </span>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="schedule-note">
                <ListChecks size={18} />
                <div>
                  <h3>A schedule that still has space.</h3>
                  <p>
                    Three key moments are planned each day; the gaps are intentionally left
                    open for a slow coffee, a wrong turn, or a place you hear about on the
                    way.
                  </p>
                </div>
              </div>
            )}
          </section>

          <section className="collection" aria-labelledby="collection-heading">
            <div className="section-heading">
              <h2 id="collection-heading">On your horizon</h2>
              <Link
                className="text-link"
                to="/saved"
              >
                View all <ArrowUpRight size={13} />
              </Link>
            </div>
            <div className="collection-grid">
              <article className="collection-card">
                <div className="collection-photo">
                  <img
                    src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80"
                    alt="Quiet Kyoto lane with a vermilion shrine gate"
                  />
                </div>
                <div className="collection-info">
                  <span>Spring note</span>
                  <h3 className="font-serif">Kyoto</h3>
                  <p>Temples, tableware, early light</p>
                </div>
              </article>
              <article className="collection-card">
                <div className="collection-photo">
                  <img
                    src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80"
                    alt="Dolomites mountain ridgeline above a moss green valley"
                  />
                </div>
                <div className="collection-info">
                  <span>Long weekend</span>
                  <h3 className="font-serif">Dolomites</h3>
                  <p>Rain air, ridgelines, refuge tables</p>
                </div>
              </article>
            </div>
          </section>
        </div>

        <aside className="note-column" aria-label="Trip field notes">
          <section className="note-card weather-card" aria-labelledby="weather-heading">
            <div className="note-card-header">
              <span className="note-card-title" id="weather-heading">
                <ThermometerSun size={16} />Field weather
              </span>
              <button
                className="note-card-action"
                type="button"
                aria-label="Weather options"
                onClick={() => toast.info("Weather detail will update as your departure approaches.")}
              >
                <MoreHorizontal size={17} />
              </button>
            </div>
            <div className="weather-main">
              <div className="weather-icon">
                <CloudSun size={26} />
              </div>
              <div className="weather-copy">
                <strong>24°</strong>
                <span>Soft sun, light coastal air</span>
              </div>
            </div>
            <div className="weather-meta">
              <div>
                <span>Rain</span>
                <strong>12% chance</strong>
              </div>
              <div>
                <span>Sunset</span>
                <strong>19:46</strong>
              </div>
            </div>
          </section>

          <section className="note-card" aria-labelledby="packing-heading">
            <div className="note-card-header">
              <span className="note-card-title" id="packing-heading">
                <Luggage size={16} />Packing snapshot
              </span>
              <button
                className="note-card-action"
                type="button"
                aria-label="Packing options"
                onClick={() => toast.info("Your full packing list is ready to expand.")}
              >
                <MoreHorizontal size={17} />
              </button>
            </div>
            <div className="packing-list">
              {packingItems.map((item, index) => (
                <button
                  className="pack-item animate-none"
                  type="button"
                  key={item.label}
                  onClick={() => togglePackItem(index)}
                >
                  <span className={`pack-check ${item.done ? "done" : ""}`}>
                    <Check size={11} />
                  </span>
                  {item.label}
                  <span className="pack-status">{item.status}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="note-card pulse-card" aria-labelledby="pulse-heading">
            <span className="note-card-title" id="pulse-heading">
              <Umbrella size={16} />The pulse of Lisbon
            </span>
            <div className="pulse-large font-serif">Late, luminous.</div>
            <p>
              Dinner begins slowly, the steepest streets reward a pause, and the best tilework
              hides in plain sight.
            </p>
            <div className="pulse-footer">
              <span>
                <Coffee size={12} />Try before 10:00
              </span>
              <span>Local note</span>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
