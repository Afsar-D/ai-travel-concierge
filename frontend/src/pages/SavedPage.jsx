import { useState } from "react";
import { toast } from "sonner";
import {
  Heart,
  MapPin,
  Trash2,
  ArrowUpRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const initialSaved = [
  {
    id: 1,
    title: "Kyoto",
    subtitle: "Temples, tableware, early light",
    region: "Japan",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
    note: "Recommended by travel editor for early autumn light in Higashiyama.",
    type: "Destination",
  },
  {
    id: 2,
    title: "Dolomites",
    subtitle: "Rain air, ridgelines, refuge tables",
    region: "Northern Italy",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    note: "High-altitude hut hike Alta Via 1 segment.",
    type: "Destination",
  },
  {
    id: 3,
    title: "Prado Restaurant",
    subtitle: "Farm-to-table dining near Sé",
    region: "Lisbon, Portugal",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
    note: "Must try sourdough and seasonal line-caught fish.",
    type: "Place to eat",
  },
  {
    id: 4,
    title: "LX Factory Sunday Market",
    subtitle: "Antiques, books & indie designer stalls",
    region: "Lisbon, Portugal",
    image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80",
    note: "Best visited between 11:00 and 15:00.",
    type: "Experience",
  },
];

export default function SavedPage() {
  const [savedItems, setSavedItems] = useState(initialSaved);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  const removeItem = (id, e) => {
    e.stopPropagation();
    setSavedItems((items) => items.filter((item) => item.id !== id));
    toast.info("Removed item from saved list.");
  };

  const filtered = savedItems.filter((item) => {
    if (filter === "all") return true;
    return item.type.toLowerCase().includes(filter.toLowerCase());
  });

  return (
    <div className="workspace">
      <section className="welcome-row">
        <div>
          <p className="eyebrow">
            <span className="eyebrow-line" />Curated Collection
          </p>
          <h1 className="page-title font-serif">Saved Places & Notes</h1>
        </div>
        <p className="welcome-copy">
          Articles, spots, and quiet recommendations tucked away for future journeys.
        </p>
      </section>

      <div className="route-tabs" style={{ marginBottom: 28 }}>
        {["all", "destination", "place to eat", "experience"].map((tab) => (
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

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--muted-foreground)" }}>
          <Heart size={36} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
          <h3 className="font-serif" style={{ fontSize: 18, color: "var(--foreground)" }}>No saved items here yet</h3>
          <p>Explore places and tap the heart icon to save them to your horizon.</p>
        </div>
      ) : (
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
                    background: "rgba(23, 35, 50, 0.75)",
                    color: "#fff",
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    backdropFilter: "blur(4px)",
                  }}
                >
                  {item.type}
                </span>
                <button
                  type="button"
                  onClick={(e) => removeItem(item.id, e)}
                  aria-label="Remove item"
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.85)",
                    backdropFilter: "blur(6px)",
                    display: "grid",
                    placeItems: "center",
                    color: "#b94839",
                  }}
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="card-copy">
                <span className="meta-row">
                  <MapPin size={13} /> {item.region}
                </span>

                <h3 className="font-serif" style={{ fontSize: 18, margin: "8px 0 4px", color: "var(--foreground)" }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: 13, color: "var(--foreground)", fontWeight: 600, margin: "0 0 10px" }}>
                  {item.subtitle}
                </p>

                <p style={{ fontSize: 12, color: "var(--muted-foreground)", margin: "0 0 18px", fontStyle: "italic", background: "var(--secondary)", padding: "8px 12px", borderRadius: 8 }}>
                  "{item.note}"
                </p>

                <div className="card-footer">
                  <button
                    type="button"
                    className="text-link"
                    style={{ fontSize: 13, fontWeight: 700 }}
                    onClick={() => {
                      toast.info(`Creating route incorporating ${item.title}...`);
                      navigate("/");
                    }}
                  >
                    Add to Route <ArrowUpRight size={13} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
