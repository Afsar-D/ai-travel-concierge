import { useState } from "react";
import { toast } from "sonner";
import {
  Check,
  Compass,
  DollarSign,
  Sliders,
} from "lucide-react";

const PACE_OPTIONS = [
  { id: "unhurried", title: "Unhurried", desc: "2-3 anchor stops. Plenty of room for wandering." },
  { id: "balanced", title: "Balanced", desc: "4-5 structured moments with afternoon downtime." },
  { id: "packed", title: "Immersive", desc: "Full day schedules to see everything possible." },
];

const INTERESTS = [
  "Architecture", "Artisan crafts", "Scenic viewpoints", "Wine & Coffee",
  "Historic walks", "Local markets", "Museums", "Nature",
];

export default function PreferencesPage() {
  const [pace, setPace] = useState("unhurried");
  const [budget, setBudget] = useState("moderate");
  const [interests, setInterests] = useState(["Architecture", "Artisan crafts", "Scenic viewpoints"]);

  const toggleInterest = (item) => {
    setInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSave = (e) => {
    e.preventDefault();
    toast.success("Travel preferences saved for future AI generation.");
  };

  return (
    <div className="workspace">
      <section className="welcome-row">
        <div>
          <p className="eyebrow">
            <span className="eyebrow-line" />Personalization
          </p>
          <h1 className="page-title font-serif">Travel Preferences</h1>
        </div>
        <p className="welcome-copy">
          Fine-tune the AI agent's intuition for pace, lodging style, and moments that matter to you.
        </p>
      </section>

      <form onSubmit={handleSave} style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: 28 }}>
        <div style={{ background: "var(--card)", padding: "24px 28px", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
          <h3 className="font-serif" style={{ fontSize: 18, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
            <Compass size={18} color="#e8533e" /> Preferred Trip Pace
          </h3>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginBottom: 16 }}>
            How dense should each day's planned activities be?
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
            {PACE_OPTIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPace(item.id)}
                style={{
                  padding: "14px 16px",
                  borderRadius: 12,
                  border: pace === item.id ? "2px solid #e8533e" : "1px solid var(--border)",
                  background: pace === item.id ? "rgba(232, 83, 62, 0.04)" : "var(--background)",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <strong style={{ fontSize: 14, display: "block", color: pace === item.id ? "#e8533e" : "var(--foreground)" }}>{item.title}</strong>
                <span style={{ fontSize: 12, color: "#8a918e", display: "block", marginTop: 4 }}>{item.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ background: "var(--card)", padding: "24px 28px", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
          <h3 className="font-serif" style={{ fontSize: 18, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
            <DollarSign size={18} color="#e8533e" /> Budget Comfort Level
          </h3>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
            {[
              { id: "smart", label: "Smart & Accessible (€)" },
              { id: "moderate", label: "Refined & Comfortable (€€)" },
              { id: "luxury", label: "Luxury & Heritage (€€€)" },
            ].map((b) => (
              <button
                key={b.id}
                type="button"
                className={`route-tab ${budget === b.id ? "active" : ""}`}
                onClick={() => setBudget(b.id)}
                style={{ padding: "8px 18px", borderRadius: 999 }}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ background: "var(--card)", padding: "24px 28px", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
          <h3 className="font-serif" style={{ fontSize: 18, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
            <Sliders size={18} color="#e8533e" /> What excites you when traveling?
          </h3>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginBottom: 16 }}>
            Select topics for the AI agent to prioritize in itinerary suggestions.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {INTERESTS.map((interest) => {
              const active = interests.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: active ? "1px solid #e8533e" : "1px solid var(--border)",
                    background: active ? "#e8533e" : "var(--secondary)",
                    color: active ? "#fff" : "var(--foreground)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {active && <Check size={14} />} {interest}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <button type="submit" className="planner-button" style={{ height: 46, padding: "0 28px" }}>
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
}
