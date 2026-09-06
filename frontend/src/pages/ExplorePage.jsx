import { useState } from "react";
import { toast } from "sonner";
import {
  Search,
  MapPin,
  Heart,
  ArrowUpRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const destinations = [
  {
    id: 1,
    title: "Kyoto & Arashiyama",
    region: "Kansai, Japan",
    season: "Autumn / Spring",
    desc: "Zen gardens, vermilion torii paths, bamboo groves, and meditative tea ceremonies.",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
    tags: ["Culture", "Zen", "Food"],
  },
  {
    id: 2,
    title: "Dolomites Alta Via",
    region: "South Tyrol, Italy",
    season: "Summer / Early Autumn",
    desc: "Jagged limestone peaks, alpine wildflower meadows, and rustic high-mountain rifugios.",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    tags: ["Nature", "Trekking", "Views"],
  },
  {
    id: 3,
    title: "Lisbon & Sintra",
    region: "Estremadura, Portugal",
    season: "All Year",
    desc: "Cobblestone hills, pastel palaces, melancholic Fado chords, and Atlantic breezes.",
    image: "https://images.unsplash.com/photo-1509840144524-f679051874b2?auto=format&fit=crop&w=800&q=80",
    tags: ["Architecture", "Coastal", "Pastries"],
  },
  {
    id: 4,
    title: "Oaxaca Highlands",
    region: "Southern Mexico",
    season: "Winter / Spring",
    desc: "Indigenous textile weaving, smoky mezcal palenques, and legendary mole recipes.",
    image: "https://images.unsplash.com/photo-1512815046276-89d511154707?auto=format&fit=crop&w=800&q=80",
    tags: ["Gastronomy", "Artisan", "Heritage"],
  },
  {
    id: 5,
    title: "Reykjavik & South Coast",
    region: "Iceland",
    season: "Winter (Auroras) / Summer",
    desc: "Black volcanic sands, towering glacial waterfalls, and geothermal hot springs.",
    image: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=800&q=80",
    tags: ["Adventure", "Geothermal", "Glaciers"],
  },
  {
    id: 6,
    title: "Cape Town & Winelands",
    region: "Western Cape, South Africa",
    season: "Nov — Mar",
    desc: "Table Mountain sunsets, penguin coves, rugged coastal drives, and world-class vineyards.",
    image: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80",
    tags: ["Wine", "Ocean", "Wildlife"],
  },
];

export default function ExplorePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [savedIds, setSavedIds] = useState(new Set([1, 3]));
  const navigate = useNavigate();
  const allTags = ["All", "Culture", "Nature", "Gastronomy", "Coastal", "Architecture", "Adventure"];
  const filtered = destinations.filter((dest) => {
    const matchesSearch =
      dest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dest.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dest.desc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag === "All" || dest.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const toggleSave = (id, e) => {
    e.stopPropagation();
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast.info("Removed from saved places.");
      } else {
        next.add(id);
        toast.success("Saved to your horizon!");
      }
      return next;
    });
  };

  return (
    <div className="workspace">
      <section className="welcome-row">
        <div>
          <p className="eyebrow">
            <span className="eyebrow-line" />Curated Horizons
          </p>
          <h1 className="page-title font-serif">Explore Places</h1>
        </div>
        <p className="welcome-copy">
          Discover handpicked destinations, local rhythms, and AI-crafted departure ideas.
        </p>
      </section>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
        <div style={{ position: "relative", maxWidth: 480 }}>
          <Search size={16} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
          <input
            type="text"
            placeholder="Search regions, moods, or cities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              height: 48,
              padding: "0 18px 0 44px",
              borderRadius: "var(--radius)",
              border: "1px solid var(--border)",
              background: "var(--card)",
              color: "var(--foreground)",
              fontSize: 14,
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`route-tab ${selectedTag === tag ? "active" : ""}`}
              onClick={() => setSelectedTag(tag)}
              style={{ padding: "6px 14px", borderRadius: 999, fontSize: 12 }}
            >
              {tag}
            </button>
          ))}
        </div>
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
              cursor: "pointer",
            }}
            onClick={() => {
              toast.info(`Generating a journey plan for ${item.title}...`);
              navigate("/");
            }}
          >
            <div style={{ position: "relative", height: 200, overflow: "hidden" }}>
              <img
                src={item.image}
                alt={item.title}
                className="image-cover"
              />
              <button
                type="button"
                onClick={(e) => toggleSave(item.id, e)}
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.85)",
                  backdropFilter: "blur(6px)",
                  display: "grid",
                  placeItems: "center",
                  color: savedIds.has(item.id) ? "#e8533e" : "#172332",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                }}
              >
                <Heart size={16} fill={savedIds.has(item.id) ? "#e8533e" : "none"} />
              </button>
              <span
                style={{
                  position: "absolute",
                  bottom: 12,
                  left: 12,
                  background: "rgba(23, 35, 50, 0.72)",
                  color: "#fff",
                  padding: "4px 10px",
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  backdropFilter: "blur(4px)",
                }}
              >
                {item.season}
              </span>
            </div>

            <div className="card-copy">
              <span className="meta-row">
                <MapPin size={13} /> {item.region}
              </span>

              <h3 className="font-serif" style={{ fontSize: 19, margin: "8px 0 6px", color: "var(--foreground)" }}>
                {item.title}
              </h3>

              <p style={{ fontSize: 13, color: "var(--muted-foreground)", margin: "0 0 16px", lineHeight: 1.5 }}>
                {item.desc}
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
                <span className="text-link" style={{ fontSize: 13, fontWeight: 700 }}>
                  Plan this Journey <ArrowUpRight size={13} />
                </span>
                <span style={{ fontSize: 12, color: "#8a918e" }}>AI Ready</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
