import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import logo from "../assets/logo.png";
import { getItineraries } from "../lib/api";
import {
  Sparkles,
  ArrowRight,
  MapPin,
  Lock,
  Mail,
  User,
} from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    const userName = name.trim() || email.split("@")[0] || "Explorer";
    localStorage.setItem("wayfinder_user", JSON.stringify({ name: userName, email }));

    try {
      const itineraries = await getItineraries();
      toast.success(isLogin ? `Welcome back, ${userName}!` : `Account created! Welcome, ${userName}!`);
      navigate(itineraries.length ? "/journey" : "/plan");
    } catch {
      toast.success(isLogin ? `Welcome back, ${userName}!` : `Account created! Welcome, ${userName}!`);
      navigate(isLogin ? "/journey" : "/plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexWrap: "wrap",
        background: "var(--background)",
      }}
    >
      <div
        style={{
          flex: "1 1 500px",
          minHeight: "100vh",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px 56px",
          overflow: "hidden",
          color: "#fff",
          background: "linear-gradient(180deg, rgba(23,35,50,0.45) 0%, rgba(23,35,50,0.85) 100%), url('https://images.unsplash.com/photo-1509840144524-f679051874b2?auto=format&fit=crop&w=1400&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "#fff" }}>
          <img src={logo} alt="Wayfinder" style={{ width: 34, height: 34, objectFit: "contain" }} />
          <span>
            <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.04em", display: "block" }}>WayFinder</span>
            <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(255,255,255,0.7)" }}>AI travel planner</span>
          </span>
        </Link>

        <div style={{ maxWidth: 480, margin: "60px 0" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(232,83,62,0.9)", padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700, marginBottom: 20 }}>
            <Sparkles size={14} /> The Considered Way to Wander
          </span>
          <h1 className="font-serif" style={{ fontSize: 40, lineHeight: 1.2, marginBottom: 18 }}>
            Build a considered route, then let the details fall quietly into place.
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: "rgba(255,255,255,0.82)" }}>
            Sign in to retrieve your active journeys or start fresh with a new AI-architected trip.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.18)", paddingTop: 20, fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
          <span>© 2026 Wayfinder</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <MapPin size={13} /> 38.7223° N, 9.1393° W
          </span>
        </div>
      </div>

      <div
        style={{
          flex: "1 1 420px",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 36px",
          background: "var(--card)",
        }}
      >
        <div style={{ width: "100%", maxWidth: 380, display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <h2 className="font-serif" style={{ fontSize: 28, margin: "0 0 6px", color: "var(--foreground)" }}>
              {isLogin ? "Welcome back" : "Begin your journey"}
            </h2>
            <p style={{ fontSize: 13, color: "var(--muted-foreground)", margin: 0 }}>
              {isLogin ? "Sign in to open your active itineraries." : "Create your account to start planning."}
            </p>
          </div>

          <div className="route-tabs" style={{ margin: 0 }}>
            <button
              type="button"
              className={`route-tab ${isLogin ? "active" : ""}`}
              onClick={() => setIsLogin(true)}
              style={{ flex: 1 }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`route-tab ${!isLogin ? "active" : ""}`}
              onClick={() => setIsLogin(false)}
              style={{ flex: 1 }}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleAuth} className="stack-16">
            {!isLogin && (
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--muted-foreground)" }}>Full Name</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--background)", border: "1px solid var(--border)", borderRadius: 10, padding: "0 12px" }}>
                  <User size={16} color="#8a918e" />
                  <input
                    type="text"
                    placeholder="Rhea Singh"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: "100%", height: 42, background: "transparent", border: 0, outline: "none", color: "var(--foreground)" }}
                  />
                </div>
              </label>
            )}

            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--muted-foreground)" }}>Email</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--background)", border: "1px solid var(--border)", borderRadius: 10, padding: "0 12px" }}>
                <Mail size={16} color="#8a918e" />
                <input
                  type="email"
                  placeholder="rhea@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: "100%", height: 42, background: "transparent", border: 0, outline: "none", color: "var(--foreground)" }}
                  required
                />
              </div>
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--muted-foreground)" }}>Password</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--background)", border: "1px solid var(--border)", borderRadius: 10, padding: "0 12px" }}>
                <Lock size={16} color="#8a918e" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: "100%", height: 42, background: "transparent", border: 0, outline: "none", color: "var(--foreground)" }}
                  required
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="planner-button"
              style={{ height: 46, marginTop: 8, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              {loading ? "Checking journeys..." : (isLogin ? "Sign In" : "Continue to Planner")} <ArrowRight size={15} />
            </button>
          </form>

          <div style={{ textAlign: "center", fontSize: 12, color: "var(--muted-foreground)" }}>
            <Link to="/journey" style={{ color: "#e8533e", textDecoration: "none", fontWeight: 700 }}>
              Enter directly as Guest →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
