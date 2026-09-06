import { useState } from "react";
import { toast } from "sonner";
import {
  Plane,
  ArrowRight,
  Calendar,
  Search,
} from "lucide-react";

const initialFlights = [
  {
    id: 1,
    airline: "TAP Air Portugal",
    flightNumber: "TP 214",
    from: "LHR (London Heathrow)",
    to: "LIS (Lisbon Humberto Delgado)",
    departTime: "07:20",
    arriveTime: "10:05",
    duration: "2h 45m",
    price: "£142",
    stops: "Direct",
    co2: "-14% lower emissions",
  },
  {
    id: 2,
    airline: "British Airways",
    flightNumber: "BA 498",
    from: "LHR (London Heathrow)",
    to: "LIS (Lisbon Humberto Delgado)",
    departTime: "11:40",
    arriveTime: "14:25",
    duration: "2h 45m",
    price: "£189",
    stops: "Direct",
    co2: "Standard emissions",
  },
  {
    id: 3,
    airline: "EasyJet",
    flightNumber: "U2 8412",
    from: "LGW (London Gatwick)",
    to: "LIS (Lisbon Humberto Delgado)",
    departTime: "15:15",
    arriveTime: "18:00",
    duration: "2h 45m",
    price: "£98",
    stops: "Direct",
    co2: "Eco rated",
  },
];

export default function FlightFinderPage() {
  const [origin, setOrigin] = useState("London (All Airports)");
  const [destination, setDestination] = useState("Lisbon (LIS)");
  const [dates, setDates] = useState("08 Sep — 14 Sep");
  const flights = initialFlights;

  return (
    <div className="workspace">
      <section className="welcome-row">
        <div>
          <p className="eyebrow">
            <span className="eyebrow-line" />Travel Logistics
          </p>
          <h1 className="page-title font-serif">Flight Finder</h1>
        </div>
        <p className="welcome-copy">
          Compare clean, low-stress flight connections that fit seamlessly into your itinerary.
        </p>
      </section>

      <section className="planner-strip" aria-label="Search flights" style={{ marginBottom: 32 }}>
        <label className="plan-field">
          <span className="field-label">From</span>
          <span className="field-value">
            <Plane size={15} />
            <input
              className="destination-input"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
            />
          </span>
        </label>
        <label className="plan-field">
          <span className="field-label">To</span>
          <span className="field-value">
            <Plane size={15} style={{ transform: "rotate(90deg)" }} />
            <input
              className="destination-input"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </span>
        </label>
        <button
          className="plan-field"
          type="button"
          onClick={() => toast.info("Flight dates sync with your active journey.")}
        >
          <span className="field-label">Dates</span>
          <span className="field-value">
            <Calendar size={15} /> {dates}
          </span>
        </button>
        <button
          className="planner-button"
          type="button"
          onClick={() => toast.success("Updated flight quotes for your dates.")}
        >
          <Search size={15} /> Search
        </button>
      </section>

      <div className="stack-16">
        {flights.map((flight) => (
          <article
            key={flight.id}
            style={{
              background: "var(--card)",
              borderRadius: "var(--radius)",
              border: "1px solid var(--border)",
              padding: "24px 28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 24,
              flexWrap: "wrap",
              boxShadow: "0 4px 18px rgba(34, 53, 69, 0.04)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 18, minWidth: 200 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: "var(--secondary)",
                  display: "grid",
                  placeItems: "center",
                  color: "#e8533e",
                }}
              >
                <Plane size={20} />
              </div>
              <div>
                <strong style={{ fontSize: 15, display: "block" }}>{flight.airline}</strong>
                <span style={{ fontSize: 12, color: "#8a918e" }}>{flight.flightNumber} · {flight.co2}</span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
              <div style={{ textAlign: "right" }}>
                <strong style={{ fontSize: 18, display: "block" }}>{flight.departTime}</strong>
                <span style={{ fontSize: 12, color: "#8a918e" }}>{flight.from.split(' ')[0]}</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 100 }}>
                <span style={{ fontSize: 11, color: "#8a918e", fontWeight: 700 }}>{flight.duration}</span>
                <div style={{ width: "100%", height: 2, background: "var(--border)", position: "relative", margin: "6px 0" }}>
                  <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", width: 6, height: 6, borderRadius: "50%", background: "#e8533e" }} />
                </div>
                <span style={{ fontSize: 11, color: "#2e7d32", fontWeight: 600 }}>{flight.stops}</span>
              </div>

              <div>
                <strong style={{ fontSize: 18, display: "block" }}>{flight.arriveTime}</strong>
                <span style={{ fontSize: 12, color: "#8a918e" }}>{flight.to.split(' ')[0]}</span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 20, marginLeft: "auto" }}>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: 11, color: "#8a918e", display: "block" }}>Per traveler</span>
                <strong style={{ fontSize: 22, color: "var(--foreground)" }}>{flight.price}</strong>
              </div>
              <button
                type="button"
                className="planner-button"
                style={{ height: 42, padding: "0 18px", fontSize: 13 }}
                onClick={() => toast.success(`Attached ${flight.airline} to your Lisbon route!`)}
              >
                Select <ArrowRight size={14} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
