import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { createItinerary } from "../lib/api";
import {
  Sparkles,
  MapPin,
  CalendarDays,
  IndianRupee,
  UsersRound,
} from "lucide-react";

export default function PlanTripPage() {
  const [origin, setOrigin] = useState("");
  const [budget, setBudget] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("2026-09-08");
  const [endDate, setEndDate] = useState("2026-09-14");
  const [travelers, setTravelers] = useState(2);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const calculatedDays = Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / 86400000) + 1);

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    const place = destination.trim();

    if (!place) {
      toast.error("Please enter a destination to start planning.");
      return;
    }

    const days = calculatedDays;

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
          <h3 className="font-serif" style={{ fontSize: 18, marginBottom: 16 }}>Trip Basics</h3>
          <div className="form-grid">
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--muted-foreground)" }}>Origin</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--background)", border: "1px solid var(--border)", borderRadius: 10, padding: "0 12px" }}>
                <MapPin size={16} color="#e8533e" />
                <input
                  type="text"
                  placeholder="e.g. New York, USA"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  style={{ width: "100%", height: 42, background: "transparent", border: 0, outline: "none", color: "var(--foreground)" }}
                />
              </div>
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--muted-foreground)" }}>Approx. Budget</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--background)", border: "1px solid var(--border)", borderRadius: 10, padding: "0 12px" }}>
                <IndianRupee size={16} color="#e8533e" />
                <input
                  type="text"
                  placeholder="e.g. ₹50,000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  style={{ width: "100%", height: 42, background: "transparent", border: 0, outline: "none", color: "var(--foreground)" }}
                />
              </div>
            </label>
          </div>
        </div>

        <div className="form-card">
          <h3 className="font-serif" style={{ fontSize: 18, marginBottom: 16 }}>Where & When</h3>
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
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--muted-foreground)" }}>From</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--background)", border: "1px solid var(--border)", borderRadius: 10, padding: "0 12px" }}>
                <CalendarDays size={16} color="#e8533e" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{ width: "100%", height: 42, background: "transparent", border: 0, outline: "none", color: "var(--foreground)" }}
                  required
                />
              </div>
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--muted-foreground)" }}>To</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--background)", border: "1px solid var(--border)", borderRadius: 10, padding: "0 12px" }}>
                <CalendarDays size={16} color="#e8533e" />
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{ width: "100%", height: 42, background: "transparent", border: 0, outline: "none", color: "var(--foreground)" }}
                  required
                />
              </div>
            </label>
          </div>

          <div style={{ marginTop: 12, fontSize: 13, color: "var(--muted-foreground)" }}>
            Total duration: <strong style={{ color: "#e8533e" }}>{calculatedDays} {calculatedDays === 1 ? "day" : "days"}</strong>
          </div>
        </div>

        <div className="form-card">
          <h3 className="font-serif" style={{ fontSize: 18, marginBottom: 16 }}>Travelers</h3>
          <div style={{ maxWidth: 320 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--muted-foreground)" }}>Total Number of Travelers</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--background)", border: "1px solid var(--border)", borderRadius: 10, padding: "0 12px" }}>
                <UsersRound size={16} color="#e8533e" />
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={travelers}
                  onChange={(e) => setTravelers(Math.max(1, Number(e.target.value) || 1))}
                  style={{ width: "100%", height: 42, background: "transparent", border: 0, outline: "none", color: "var(--foreground)" }}
                  required
                />
              </div>
            </label>
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
