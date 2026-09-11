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
  Luggage,
  MapPin,
  MessageSquare,
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
import { getItineraries } from "../lib/api";

const demoActiveTrip = {
  destination: "Tokyo, Japan",
  dates: "14–20 Oct 2026",
  country: "Japan",
  pace: "Vibrant & Balanced",
  stay: "Shinjuku & Yanaka",
  budget: "¥¥¥",
  coords: "35.6762° N, 139.6503° E",
  heroImage: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80",
  pulse: {
    title: "The pulse of Tokyo",
    catchline: "Neon dusk, quiet alley mornings.",
    note: "Early mornings in Yanaka feel like a village; evenings belong to Golden Gai jazz bars and subterranean ramen counters.",
    tip: "Train pass card on phone before 08:30 rush",
  },
  weather: {
    temp: "21°",
    desc: "Crisp autumn breeze, clear skies",
    rain: "5% chance",
    sunset: "17:15",
  },
  days: [
    {
      number: "01",
      title: "Touchdown & Neon Crossing",
      copy: "Check into Hotel Groove Shinjuku, grab hand-pulled udon at Shin, and wander the neon glow of Omoide Yokocho.",
      tag: "12 min walk",
      icon: Navigation,
    },
    {
      number: "02",
      title: "Old Edo lanes & Craft Coffee",
      copy: "Morning stroll through quiet Yanaka Ginza cemetery gardens, matcha tasting at Kayaba Coffee, and woodblock print galleries.",
      tag: "5 stops",
      icon: Landmark,
    },
    {
      number: "03",
      title: "Architecture, Art & Skyline Dusk",
      copy: "Nezu Museum bamboo gardens in Aoyama, Omotesando backstreet boutiques, and sunset views from Roppongi Hills Mori Tower.",
      tag: "Mori Art reservation",
      icon: Coffee,
    },
    {
      number: "04",
      title: "Coastal Temple Day in Kamakura",
      copy: "Scenic Enoden train along the Pacific coast, the Great Buddha at Kotoku-in, and sunset on Yuigahama beach.",
      tag: "Day rail journey",
      icon: Route,
    },
  ],
  packing: [
    { label: "Comfortable slip-on sneakers", status: "18k steps/day", done: true },
    { label: "Suica / Pasmo transit IC card", status: "Apple / Google Wallet", done: true },
    { label: "Pocket WiFi / eSIM active", status: "5G unlimited data", done: true },
    { label: "Coin pouch & small cash", status: "¥20,000 for shrines & street stalls", done: true },
    { label: "Light rain shell jacket", status: "Packable layer", done: false },
    { label: "Universal Type-A plug adapter", status: "100V compatible", done: true },
  ],
};

export default function JourneyPage() {
  const [hasTrip, setHasTrip] = useState(true);
  const [destination, setDestination] = useState(demoActiveTrip.destination);
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem("journey_custom_notes");
    return saved
      ? JSON.parse(saved)
      : [
        { id: 1, text: "Exchange ¥20,000 for shrines & street stalls", done: true },
        { id: 2, text: "Buy Suica / Pasmo transit IC card in Apple Wallet", done: true },
        { id: 3, text: "Pick up pocket WiFi at Haneda Airport", done: false },
      ];
  });
  const [newNote, setNewNote] = useState("");
  const [showAddNote, setShowAddNote] = useState(false);
  const [dayPlan, setDayPlan] = useState(demoActiveTrip.days);
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
        }
        setHasTrip(true);
      } catch {
        setHasTrip(true);
      }
    }

    loadLatestItinerary();
  }, [updateRouteData]);

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

  const handleAddNote = (e) => {
    if (e) e.preventDefault();
    const trimmed = newNote.trim();
    if (!trimmed) {
      setShowAddNote(false);
      return;
    }
    const updated = [...notes, { id: Date.now(), text: trimmed, done: false }];
    setNotes(updated);
    localStorage.setItem("journey_custom_notes", JSON.stringify(updated));
    setNewNote("");
    setShowAddNote(false);
    toast.success("Note added");
  };

  const toggleNote = (id) => {
    const updated = notes.map((n) => (n.id === id ? { ...n, done: !n.done } : n));
    setNotes(updated);
    localStorage.setItem("journey_custom_notes", JSON.stringify(updated));
  };

  const deleteNote = (id) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    localStorage.setItem("journey_custom_notes", JSON.stringify(updated));
    toast.info("Note deleted");
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

      <section className="planner-strip trip-info-strip" aria-label="Journey overview">
        <div className="plan-field">
          <span className="field-label">Destination</span>
          <span className="field-value">
            <MapPin size={15} />
            <input
              id="plan-start"
              className="destination-input"
              aria-label="Destination"
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              placeholder="Where to?"
            />
          </span>
        </div>
        <div className="plan-field">
          <span className="field-label">Dates</span>
          <span className="field-value">
            <CalendarDays size={15} />08 — 14 Sep
          </span>
        </div>
        <div className="plan-field">
          <span className="field-label">Travelers</span>
          <span className="field-value">
            <UsersRound size={15} />2 adults
          </span>
        </div>
      </section>

      <div className="board-grid">
        <div className="content-column">
          <section aria-labelledby="departure-heading">
            <div className="section-heading">
              <h2 id="departure-heading">Upcoming departure</h2>

              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
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
            <article className="trip-hero compact-hero">
              <div className="trip-summary">
                <div>
                  <span className="status-label">
                    <span className="status-pulse" />Route in progress
                  </span>
                  <h2 className="trip-place font-serif">{destination.split(',')[0]}</h2>
                  <p className="trip-dates">{demoActiveTrip.dates} · {destination.split(',')[1]?.trim() || demoActiveTrip.country}</p>
                </div>
                <div className="trip-data">
                  <div>
                    <span>Trip pace</span>
                    <strong>{demoActiveTrip.pace}</strong>
                  </div>
                  <div>
                    <span>Stay</span>
                    <strong>{demoActiveTrip.stay}</strong>
                  </div>
                  <div>
                    <span>Budget</span>
                    <strong>{demoActiveTrip.budget}</strong>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
                  <Link
                    to="/chat"
                    state={{
                      trip: {
                        destination,
                        startDate: "2026-10-14",
                        endDate: "2026-10-20",
                        origin: "Delhi, India",
                        budget: "medium",
                        guestCount: 2,
                      }
                    }}
                    className="route-tab"
                    style={{
                      height: 32,
                      padding: "0 14px",
                      borderRadius: 8,
                      fontSize: 12,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      color: "#ffffff",
                      background: "#e8533e",
                      border: "1px solid #e8533e",
                      textDecoration: "none",
                      fontWeight: 700,
                    }}
                  >
                    <MessageSquare size={13} /> Ask AI (Trip Doubts)
                  </Link>

                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(destination)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="route-tab"
                    style={{
                      height: 32,
                      padding: "0 14px",
                      borderRadius: 8,
                      fontSize: 12,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      color: "#172332",
                      background: "#f0ebe1",
                      border: "1px solid #ddd6cc",
                      textDecoration: "none",
                      fontWeight: 700,
                    }}
                  >
                    Visit on Google <ArrowUpRight size={13} />
                  </a>
                </div>
              </div>
            </article>
          </section>

          <section className="route-panel" aria-labelledby="route-heading">
            <div className="section-heading" style={{ marginBottom: 28 }}>
              <h2 id="route-heading">The route</h2>
              <button
                className="text-link"
                type="button"
                onClick={() => toast.info("The full itinerary is displayed below.")}
              >
                Open itinerary <ChevronRight size={13} />
              </button>
            </div>

            <div className="roadmap-timeline">
              <div className="roadmap-spine" />
              {dayPlan.map((day, idx) => {
                const Icon = day.icon;
                const isEven = idx % 2 === 0;
                return (
                  <div key={day.number} className={`roadmap-step ${isEven ? "step-left" : "step-right"}`}>
                    <div className="roadmap-node">{idx + 1}</div>
                    <article className="roadmap-card">
                      <div className="roadmap-card-header">
                        <span className="roadmap-tag">
                          <Icon size={12} />
                          {day.tag}
                        </span>
                        <span className="roadmap-day-badge">Day {day.number}</span>
                      </div>
                      <h3 className="roadmap-title font-serif">{day.title}</h3>
                      <p className="roadmap-copy">{day.copy}</p>
                      <div className="roadmap-footer">
                        <span className="roadmap-status">Scheduled stop</span>
                        <button
                          type="button"
                          className="roadmap-action-btn"
                          onClick={() => toast.info(`Day ${day.number} details opened.`)}
                        >
                          View details <ChevronRight size={12} />
                        </button>
                      </div>
                    </article>
                  </div>
                );
              })}
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
                <strong>{demoActiveTrip.weather.temp}</strong>
                <span>{demoActiveTrip.weather.desc}</span>
              </div>
            </div>
            <div className="weather-meta">
              <div>
                <span>Rain</span>
                <strong>{demoActiveTrip.weather.rain}</strong>
              </div>
              <div>
                <span>Sunset</span>
                <strong>{demoActiveTrip.weather.sunset}</strong>
              </div>
            </div>
          </section>

          <section className="note-card" aria-labelledby="notes-heading">
            <div className="note-card-header">
              <span className="note-card-title" id="notes-heading">
                <Luggage size={16} />Custom notes
              </span>
              <button
                type="button"
                onClick={() => {
                  if (showAddNote && newNote.trim()) {
                    handleAddNote();
                  } else {
                    setShowAddNote((prev) => !prev);
                  }
                }}
                style={{
                  height: 26,
                  padding: "0 10px",
                  background: "#e8533e",
                  color: "#ffffff",
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  cursor: "pointer",
                }}
              >
                Add a Note
              </button>
            </div>

            <div className={`note-input-container ${showAddNote ? "open" : ""}`}>
              <form onSubmit={handleAddNote} style={{ display: "flex", gap: 6 }}>
                <input
                  type="text"
                  autoFocus={showAddNote}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setShowAddNote(false);
                      setNewNote("");
                    }
                  }}
                  placeholder="Add a new note (press Enter)..."
                  style={{
                    flex: 1,
                    height: 32,
                    padding: "0 10px",
                    fontSize: 11,
                    borderRadius: 6,
                    border: "1px solid #ddd7ce",
                    background: "#fffdf8",
                    color: "#172332",
                    outline: "none",
                  }}
                />
                <button
                  type="submit"
                  style={{
                    height: 32,
                    padding: "0 10px",
                    background: "#e8533e",
                    color: "#ffffff",
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    cursor: "pointer",
                  }}
                >
                  <Plus size={13} /> Add
                </button>
              </form>
            </div>

            <div className="packing-list">
              {notes.length === 0 ? (
                <div style={{ padding: "16px 0", textAlign: "center", color: "#8a918e", fontSize: 11 }}>
                  No custom notes yet. Add one above!
                </div>
              ) : (
                notes.map((item) => (
                  <div className="pack-item" key={item.id} style={{ justifyContent: "space-between" }}>
                    <button
                      type="button"
                      onClick={() => toggleNote(item.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        background: "transparent",
                        border: 0,
                        padding: 0,
                        textAlign: "left",
                        flex: 1,
                        cursor: "pointer",
                      }}
                    >
                      <span className={`pack-check ${item.done ? "done" : ""}`}>
                        <Check size={11} />
                      </span>
                      <span
                        style={{
                          color: item.done ? "#9ba3a1" : "#263440",
                          textDecoration: item.done ? "line-through" : "none",
                          fontSize: 11,
                          lineHeight: 1.35,
                        }}
                      >
                        {item.text}
                      </span>
                    </button>
                    <button
                      type="button"
                      aria-label="Delete note"
                      onClick={() => deleteNote(item.id)}
                      style={{
                        background: "transparent",
                        border: 0,
                        padding: "4px 6px",
                        color: "#9ba3a1",
                        cursor: "pointer",
                        borderRadius: 4,
                        display: "flex",
                        alignItems: "center",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#b94839")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#9ba3a1")}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="note-card pulse-card" aria-labelledby="pulse-heading">
            <span className="note-card-title" id="pulse-heading">
              <Umbrella size={16} />{demoActiveTrip.pulse.title}
            </span>
            <div className="pulse-large font-serif">{demoActiveTrip.pulse.catchline}</div>
            <p>
              {demoActiveTrip.pulse.note}
            </p>
            <div className="pulse-footer">
              <span>
                <Coffee size={12} />{demoActiveTrip.pulse.tip}
              </span>
              <span>Local note</span>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
