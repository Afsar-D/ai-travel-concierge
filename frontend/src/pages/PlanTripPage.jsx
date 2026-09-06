import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { createItinerary } from "../lib/api";
import {
  Sparkles,
  MapPin,
  CalendarDays,
  UsersRound,
} from "lucide-react";

export default function PlanTripPage() {
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("2026-09-08");
  const [endDate, setEndDate] = useState("2026-09-14");
  const [travelers, setTravelers] = useState(2);
  const [tripPace, setTripPace] = useState("unhurried");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    const place = destination.trim();

    if (!place) {
      toast.error("Please enter a destination to start planning.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.max(1, Math.ceil((end - start) / 86400000) + 1);

    setLoading(true);
    try {
      await createItinerary({ destination: place, days });
      localStorage.setItem("has_active_journey", "true");
      toast.success(`Trip to ${place} planned successfully!`);
      navigate("/journey");
    } catch {
      toast.error("Could not save the trip. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="workspace">
      <section className="welcome-row">
        <div>
          <p className="eyebrow">
            <span className="eyebrow-line" />AI Trip Architect
          </p>
          <h1 className="page-title font-serif">Plan a New Trip</h1>
        </div>
        <p className="welcome-copy">
          Define your destination and cadence. The AI agent will assemble routes, daily pacing, and local recommendations.
        </p>
      </section>

      <form onSubmit={handleCreateTrip} className="page-form">
        <div className="form-card">
          <h3 className="font-serif" style={{ fontSize: 18, marginBottom: 16 }}>1. Where & When</h3>
          <div className="form-grid">
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--muted-foreground)" }}>Destination</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--background)", border: "1px solid var(--border)", borderRadius: 10, padding: "0 12px" }}>
                <MapPin size={16} color="#e8533e" />
                <input
                  type="text"
                  placeholder="e.g. Florence, Italy"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  style={{ width: "100%", height: 42, background: "transparent", border: 0, outline: "none", color: "var(--foreground)" }}
                  required
                />
              </div>
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--muted-foreground)" }}>Dates</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--background)", border: "1px solid var(--border)", borderRadius: 10, padding: "0 12px" }}>
                <CalendarDays size={16} color="#e8533e" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{ width: "100%", height: 42, background: "transparent", border: 0, outline: "none", color: "var(--foreground)" }}
                />
              </div>
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--muted-foreground)" }}>Travelers</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--background)", border: "1px solid var(--border)", borderRadius: 10, padding: "0 12px" }}>
                <UsersRound size={16} color="#e8533e" />
                <select
                  value={travelers}
                  onChange={(e) => setTravelers(Number(e.target.value))}
                  style={{ width: "100%", height: 42, background: "transparent", border: 0, outline: "none", color: "var(--foreground)" }}
                >
                  <option value={1}>Solo (1 traveler)</option>
                  <option value={2}>Couple / Pair (2 travelers)</option>
                  <option value={4}>Small Group (3–4 travelers)</option>
                  <option value={6}>Family / Group (5+ travelers)</option>
                </select>
              </div>
            </label>
          </div>
        </div>

        <div className="form-card">
          <h3 className="font-serif" style={{ fontSize: 18, marginBottom: 16 }}>2. Cadence & Tone</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            {[
              { id: "unhurried", title: "Unhurried & Slow", desc: "Late starts, quiet cafes, afternoon downtime" },
              { id: "balanced", title: "Balanced Rhythm", desc: "Curated key moments with room for serendipity" },
              { id: "explorer", title: "Full Discovery", desc: "Dawn-to-dusk highlights & neighborhood walks" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTripPace(item.id)}
                style={{
                  padding: "14px 16px",
                  borderRadius: 12,
                  border: tripPace === item.id ? "2px solid #e8533e" : "1px solid var(--border)",
                  background: tripPace === item.id ? "rgba(232, 83, 62, 0.04)" : "var(--background)",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <strong style={{ fontSize: 13, display: "block", color: tripPace === item.id ? "#e8533e" : "var(--foreground)" }}>{item.title}</strong>
                <span style={{ fontSize: 11, color: "var(--muted-foreground)", display: "block", marginTop: 4 }}>{item.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="planner-button"
            style={{ height: 48, padding: "0 28px", fontSize: 14, display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <Sparkles size={16} />
            {loading ? "Constructing Route..." : "Generate Custom Trip"}
          </button>
        </div>
      </form>
    </div>
  );
}
