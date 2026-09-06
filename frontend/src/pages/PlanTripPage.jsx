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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function PlanTripPage() {
  const today = new Date().toISOString().split("T")[0];
  const [origin, setOrigin] = useState("");
  const [budget, setBudget] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState("");
  const [viewDate, setViewDate] = useState(new Date());
  const [travelers, setTravelers] = useState(2);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const startParsed = startDate ? new Date(startDate) : null;
  const endParsed = endDate ? new Date(endDate) : null;
  const calculatedDays =
    startParsed && endParsed && endParsed >= startParsed
      ? Math.round((endParsed - startParsed) / 86400000) + 1
      : 0;

  const handleDateClick = (isoString) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(isoString);
      setEndDate("");
    } else if (startDate && !endDate) {
      if (isoString < startDate) {
        setStartDate(isoString);
      } else {
        setEndDate(isoString);
      }
    }
  };

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
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--muted-foreground)" }}>
                  Select Travel Dates ({startDate ? startDate : "Select start"} → {endDate ? endDate : "Select end"})
                </span>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button
                    type="button"
                    onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
                    style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: "var(--foreground)" }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>
                    {viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </span>
                  <button
                    type="button"
                    onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
                    style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: "var(--foreground)" }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Single calendar date table */}
              <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 12, background: "var(--background)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", textAlign: "center", fontWeight: 600, fontSize: 11, color: "var(--muted-foreground)", marginBottom: 8 }}>
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                    <div key={d} style={{ padding: "4px 0" }}>{d}</div>
                  ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
                  {(() => {
                    const year = viewDate.getFullYear();
                    const month = viewDate.getMonth();
                    const firstDay = new Date(year, month, 1).getDay();
                    const daysInMonth = new Date(year, month + 1, 0).getDate();
                    const cells = [];

                    for (let i = 0; i < firstDay; i++) {
                      cells.push(<div key={`empty-${i}`} />);
                    }

                    for (let d = 1; d <= daysInMonth; d++) {
                      const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                      const isStart = startDate === iso;
                      const isEnd = endDate === iso;
                      const inRange = startDate && endDate && iso > startDate && iso < endDate;

                      let bg = "transparent";
                      let color = "var(--foreground)";
                      let borderRadius = "8px";

                      if (isStart || isEnd) {
                        bg = "#e8533e";
                        color = "#ffffff";
                      } else if (inRange) {
                        bg = "rgba(232, 83, 62, 0.18)";
                        color = "#e8533e";
                      }

                      cells.push(
                        <button
                          key={iso}
                          type="button"
                          onClick={() => handleDateClick(iso)}
                          style={{
                            height: 36,
                            border: 0,
                            background: bg,
                            color: color,
                            borderRadius: borderRadius,
                            fontWeight: isStart || isEnd || inRange ? 700 : 500,
                            cursor: "pointer",
                            fontSize: 13,
                            transition: "background 0.15s ease",
                          }}
                        >
                          {d}
                        </button>
                      );
                    }
                    return cells;
                  })()}
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 14, fontSize: 13, color: "var(--muted-foreground)" }}>
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
