import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronRight,
  Sparkles,
  Route,
  Compass,
} from "lucide-react";
import logo from "../assets/logo.png";

const principles = [
  {
    number: "01",
    title: "Start with a feeling",
    copy: "Tell Wayfinder what you want the journey to feel like, not just where you want it to go.",
    icon: Sparkles,
  },
  {
    number: "02",
    title: "Shape the route",
    copy: "A thoughtful first draft brings together neighborhoods, pacing, food, and the moments worth making room for.",
    icon: Route,
  },
  {
    number: "03",
    title: "Keep the good gaps",
    copy: "Edit what matters, leave breathing room, and arrive with a plan that still feels like yours.",
    icon: Compass,
  },
];

export default function HomePage() {
  const navigate = useNavigate();

  const handleSecondaryAction = () => {
    document.getElementById("approach")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="marketing-shell">
      <header className="marketing-nav">
        <div className="nav-container">
          <Link className="marketing-brand" to="/">
            <img src={logo} alt="Wayfinder Logo" />
            <div className="brand-text">
              <strong>WayFinder</strong>
              <small>AI TRAVEL PLANNER</small>
            </div>
          </Link>

          <nav className="marketing-links" aria-label="Main navigation">
            <a href="#approach">Our approach</a>
            <a href="#signals">What we notice</a>
            <a href="#inspiration">Inspiration</a>
            <Link className="marketing-login-link" to="/login">
              Open planner <ArrowUpRight size={14} className="inline-icon" />
            </Link>
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="marketing-hero">
          <div className="hero-copy">
            <p className="marketing-kicker">
              <span className="kicker-dash" /> A CALMER WAY TO TRAVEL
            </p>
            <h1 className="hero-title">
              A better route<br />to the places<br />
              <span className="serif-italic-highlight">you haven’t met<br />yet.</span>
            </h1>
            <p className="hero-lede">
              Wayfinder turns a loose idea into a considered trip — with the details that make the days feel effortless and the space to follow your curiosity.
            </p>

            <div className="hero-actions">
              <Link className="marketing-primary-btn" to="/login">
                <span className="btn-icon">⚡</span> Plan my journey <ArrowUpRight size={15} />
              </Link>
              <button className="marketing-secondary-btn" type="button" onClick={handleSecondaryAction}>
                <ArrowDownRight size={15} /> See how it works
              </button>
            </div>

            <div className="hero-note">
              <span className="hero-note-dot" /> Designed for thoughtful travelers, not packed schedules.
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-image-frame">
              <img
                src="https://images.unsplash.com/photo-1509840144524-f679051874b2?auto=format&fit=crop&w=1200&q=80"
                alt="Lisbon rooftops meeting the Tagus River at golden hour"
              />
              <div className="hero-coordinates">
                38.7223° N<br />9.1393° W
              </div>

              <svg className="route-curve-svg" viewBox="0 0 400 300" fill="none">
                <path
                  d="M 120 40 Q 260 40 280 200"
                  stroke="rgba(255, 255, 255, 0.75)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <circle cx="120" cy="40" r="4.5" fill="#e8533e" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="270" cy="140" r="4.5" fill="#e8533e" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="265" cy="200" r="4.5" fill="#e8533e" stroke="#ffffff" strokeWidth="1.5" />
              </svg>

              <div className="hero-image-watermark">
                rtugal
              </div>
            </div>

            <div className="hero-trip-card">
              <div className="trip-card-top">
                <span>NEXT JOURNEY</span>
                <span className="trip-card-status">
                  <i /> DRAFT ROUTE
                </span>
              </div>
              <h3 className="trip-card-title">Lisbon in six days</h3>
              <p className="trip-card-date">
                <CalendarDays size={13} /> 08 — 14 September 2026
              </p>
              <div className="trip-card-footer">
                <span><Check size={13} color="#2e7d32" /> Alfama base</span>
                <span>Unhurried pace</span>
              </div>
            </div>

            <div className="hero-stamp">
              <span>Make<br />room</span>
            </div>
          </div>
        </section>

        <section className="principle-section" id="signals">
          <div className="principle-container">
            <div className="principle-header-col">
              <p className="marketing-kicker">
                <span className="kicker-dash" /> THE WAYFINDER WAY
              </p>
              <h2 className="section-serif-title">
                Planning should<br />give you <em>more</em> of<br />the trip.
              </h2>
            </div>

            <div className="principle-cols">
              {principles.map(({ number, title, copy, icon: Icon }) => (
                <div className="principle-card" key={number}>
                  <div className="principle-card-top">
                    <span className="principle-card-num">{number}</span>
                    <Icon size={18} className="principle-card-icon" />
                  </div>
                  <h4 className="principle-card-title">{title}</h4>
                  <p className="principle-card-copy">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="approach-section" id="approach">
          <div className="approach-container">
            <div className="approach-map-wrapper">
              <div className="approach-topo-map">
                <svg className="topo-lines-svg" viewBox="0 0 400 350">
                  <ellipse cx="200" cy="180" rx="170" ry="120" stroke="#d5cebe" strokeWidth="1" fill="none" />
                  <ellipse cx="200" cy="180" rx="120" ry="85" stroke="#d5cebe" strokeWidth="1" fill="none" />
                  <ellipse cx="200" cy="180" rx="70" ry="50" stroke="#d5cebe" strokeWidth="1" fill="none" />
                  <line x1="50" y1="50" x2="350" y2="300" stroke="#cfc7b5" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="30" y1="180" x2="370" y2="180" stroke="#cfc7b5" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="200" y1="20" x2="200" y2="330" stroke="#e0533c" strokeWidth="1" strokeDasharray="4 4" />
                  <circle cx="120" cy="110" r="5" fill="#e8533e" stroke="#fff" strokeWidth="2" />
                  <circle cx="110" cy="245" r="5" fill="#e8533e" stroke="#fff" strokeWidth="2" />
                </svg>

                <div className="approach-brief-card">
                  <span className="brief-tag">TRIP BRIEF</span>
                  <blockquote className="brief-quote font-serif">
                    “A city with salt in the air<br />and room for long<br />lunches.”
                  </blockquote>
                  <span className="brief-meta">Lisbon · 6 nights · 2 travelers</span>
                </div>
              </div>
            </div>

            <div className="approach-copy-col">
              <p className="marketing-kicker">
                <span className="kicker-dash" /> FROM THOUGHT TO ROUTE
              </p>
              <h2 className="section-serif-title">
                Less admin.<br />
                <em>More atmosphere.</em>
              </h2>
              <p className="approach-lede">
                Most travel tools ask for decisions before you have a sense of the place. Wayfinder starts with your intention, then brings the practical choices into focus one at a time.
              </p>

              <div className="approach-steps">
                <div className="approach-step-item">
                  <span className="step-num">01</span>
                  <p>
                    <strong>Describe the mood.</strong> City break, slow coast, food-first weekend, or a little bit of everything.
                  </p>
                </div>
                <div className="approach-step-item">
                  <span className="step-num">02</span>
                  <p>
                    <strong>Review the shape.</strong> See a route with a human pace, not a spreadsheet of obligations.
                  </p>
                </div>
                <div className="approach-step-item">
                  <span className="step-num">03</span>
                  <p>
                    <strong>Make it yours.</strong> Keep the anchors, move the edges, and leave the right spaces blank.
                  </p>
                </div>
              </div>

              <Link className="approach-desk-link" to="/login">
                Open your planning desk <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        <section className="inspiration-section" id="inspiration">
          <div className="inspiration-container">
            <div className="inspiration-top-row">
              <div>
                <p className="marketing-kicker">
                  <span className="kicker-dash" /> PLACES TO BEGIN
                </p>
                <h2 className="section-serif-title">
                  A first page, not a bucket list.
                </h2>
              </div>
              <Link className="inspiration-link" to="/login">
                Explore in planner <ArrowUpRight size={14} />
              </Link>
            </div>

            <div className="inspiration-cards-grid">
              <article className="destination-photo-card" onClick={() => { toast.info("Opening Kyoto in planning desk..."); navigate("/login"); }}>
                <img
                  src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=900&q=80"
                  alt="Quiet Kyoto lane with cherry blossom and pagodas"
                />
                <div className="card-overlay" />
                <div className="destination-card-content">
                  <span className="dest-sub">FOR EARLY LIGHT</span>
                  <h3 className="dest-title font-serif">Kyoto</h3>
                  <p className="dest-copy">Temples, tableware, and streets that ask you to slow down.</p>
                  <button type="button" className="dest-action-btn">
                    Start with Kyoto <ArrowUpRight size={13} />
                  </button>
                </div>
              </article>

              <article className="destination-photo-card" onClick={() => { toast.info("Opening Dolomites in planning desk..."); navigate("/login"); }}>
                <img
                  src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80"
                  alt="Dolomites mountain ridgeline above green alpine valley"
                />
                <div className="card-overlay" />
                <div className="destination-card-content">
                  <span className="dest-sub">FOR OPEN AIR</span>
                  <h3 className="dest-title font-serif">Dolomites</h3>
                  <p className="dest-copy">Ridgelines, refuge tables, and the long way around.</p>
                  <button type="button" className="dest-action-btn">
                    Start with the mountains <ArrowUpRight size={13} />
                  </button>
                </div>
              </article>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
