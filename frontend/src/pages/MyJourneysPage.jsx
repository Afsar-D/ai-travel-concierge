import { useState } from "react";
import { toast } from "sonner";
import {
  Calendar,
  MapPin,
  Plus,
  ArrowUpRight,
  MoreVertical,
} from "lucide-react";
import { Link } from "react-router-dom";

const initialJourneys = [
  {
    id: 1,
    title: "Lisbon Coast & Alfama Lanes",
    destination: "Lisbon, Portugal",
    dates: "08 — 14 Sep 2026",
    days: 6,
    status: "Upcoming",
    statusType: "active",
    image: "https://images.unsplash.com/photo-1509840144524-f679051874b2?auto=format&fit=crop&w=800&q=80",
    tags: ["Unhurried", "Cultural", "Coastal"],
  },
  {
    id: 2,
    title: "Kyoto Autumn & Tea Valleys",
    destination: "Kyoto, Japan",
    dates: "12 — 20 Nov 2026",
    days: 8,
    status: "Drafting",
    statusType: "draft",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
    tags: ["Temples", "Gastronomy", "Walking"],
  },
  {
    id: 3,
    title: "Dolomites High Routes & Refuges",
    destination: "Cortina d'Ampezzo, Italy",
    dates: "02 — 08 Jul 2026",
    days: 7,
    status: "Completed",
    statusType: "completed",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    tags: ["Trekking", "Alpine", "Scenic"],
  },
  {
    id: 4,
    title: "Oaxaca Culinary & Craft Trails",
    destination: "Oaxaca, Mexico",
    dates: "18 — 25 Feb 2026",
    days: 7,
    status: "Completed",
    statusType: "completed",
    image: "https://images.unsplash.com/photo-1512815046276-89d511154707?auto=format&fit=crop&w=800&q=80",
    tags: ["Street Food", "Artisans", "Warm"],
  },
];

export default function MyJourneysPage() {
  const [filter, setFilter] = useState("all");
  const journeys = initialJourneys;

  const filtered = journeys.filter((j) => {
    if (filter === "all") return true;
    return j.status.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="workspace">
      <section className="welcome-row">
        <div>
          <p className="eyebrow">
            <span className="eyebrow-line" />Itinerary Archive
          </p>
          <h1 className="page-title font-serif">My Journeys</h1>
        </div>
        <p className="welcome-copy">
          Every route planned, underway, or committed to memory.
        </p>
      </section>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div className="route-tabs" style={{ margin: 0 }}>
          {["all", "upcoming", "drafting", "completed"].map((tab) => (
            <button
              key={tab}
              type="button"
              className={`route-tab ${filter === tab ? "active" : ""}`}
              onClick={() => setFilter(tab)}
              style={{ textTransform: "capitalize" }}
            >
              {tab}
            </button>
          ))}
        </div>

        <Link
          to="/"
          className="planner-button"
          style={{ textDecoration: "none", height: 42, padding: "0 18px", fontSize: 13 }}
        >
          <Plus size={15} /> New Journey
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
        {filtered.map((item) => (
          <article
            key={item.id}
            style={{
              background: "var(--card)",
              borderRadius: "var(--radius)",
              overflow: "hidden",
              border: "1px solid var(--border)",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 4px 18px rgba(34, 53, 69, 0.04)",
              transition: "transform 200ms ease, box-shadow 200ms ease",
            }}
          >
            <div style={{ position: "relative", height: 180, overflow: "hidden" }}>
              <img
                src={item.image}
                alt={item.title}
                className="image-cover"
              />
              <span
                style={{
                  position: "absolute",
                  top: 12,
                  left: 12,
                  background: item.statusType === "active" ? "#e8533e" : "rgba(23, 35, 50, 0.75)",
                  color: "#fff",
                  padding: "4px 10px",
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 700,
                  backdropFilter: "blur(4px)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                {item.statusType === "active" && <span className="status-pulse" style={{ width: 6, height: 6, margin: 0 }} />}
                {item.status}
              </span>
            </div>

            <div className="card-copy">
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
                <span className="meta-row">
                  <MapPin size={13} /> {item.destination}
                </span>
                <span className="meta-row">
                  <Calendar size={13} /> {item.days} days
                </span>
              </div>

              <h3 className="font-serif" style={{ fontSize: 18, margin: "10px 0 8px", color: "var(--foreground)" }}>
                {item.title}
              </h3>
              <p style={{ fontSize: 13, color: "var(--muted-foreground)", margin: "0 0 16px" }}>
                {item.dates}
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
                {item.tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      background: "var(--secondary)",
                      color: "var(--secondary-foreground)",
                      padding: "3px 9px",
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="card-footer">
                <Link
                  to="/"
                  className="text-link"
                  style={{ fontSize: 13, fontWeight: 700 }}
                >
                  Open Itinerary <ArrowUpRight size={13} />
                </Link>
                <button
                  type="button"
                  style={{ background: "none", color: "#8a918e", padding: 4 }}
                  onClick={() => toast.info(`Options for ${item.title}`)}
                >
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
