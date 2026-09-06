import { Outlet, NavLink } from "react-router-dom";
import { toast, Toaster } from "sonner";
import logo from "../assets/logo.png";
import {
  Sparkles,
  Compass,
  Map,
  Search,
  Heart,
  Plane,
  Settings2,
  ChevronDown,
  Menu,
  Bell,
  Plus,
} from "lucide-react";

const navItems = [
  { label: "Plan a Trip", path: "/plan", icon: Sparkles },
  { label: "Journey", path: "/journey", icon: Compass },
  { label: "My Journeys", path: "/my-journeys", icon: Map },
  { label: "Explore", path: "/explore", icon: Search },
  { label: "Saved", path: "/saved", icon: Heart },
];

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("wayfinder_user")) || { name: "Explorer" };
  } catch {
    return { name: "Explorer" };
  }
}

function initials(name = "Explorer") {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function NavItem({ item }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
    >
      <Icon size={17} />
      {item.label}
    </NavLink>
  );
}

export default function Layout() {
  const user = getUser();
  const today = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <div className="app-shell">
      <Toaster position="top-right" richColors />

      <aside className="sidebar" aria-label="Primary navigation">
        <NavLink className="brand-lockup" to="/" aria-label="Wayfinder home">
          <img className="brand-mark" src={logo} alt="Wayfinder" />
          <span>
            <span className="brand-name font-serif">WayFinder</span>
            <span className="brand-subtitle">AI travel planner</span>
          </span>
        </NavLink>

        <p className="rail-label">Your space</p>
        <nav className="nav-stack">
          {navItems.map((item) => <NavItem key={item.path} item={item} />)}
        </nav>

        <p className="rail-label">Tools</p>
        <nav className="nav-stack">
          <NavItem item={{ label: "Flight finder", path: "/flights", icon: Plane }} />
          <NavItem item={{ label: "Preferences", path: "/preferences", icon: Settings2 }} />
        </nav>

        <div className="nav-grow" />
        <NavLink to="/login" className="rail-profile" aria-label="Account">
          <div className="profile-circle" aria-hidden="true">{initials(user.name)}</div>
          <div>
            <span className="profile-name">{user.name}</span>
            <span className="profile-plan">Explorer plan</span>
          </div>
          <ChevronDown size={14} className="profile-chevron" />
        </NavLink>
      </aside>

      <main className="main-area" id="top">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-menu"
              type="button"
              aria-label="Open navigation"
              onClick={() => toast.info("Use the navigation bar below on mobile.")}
            >
              <Menu size={16} />
            </button>
            <NavLink className="topbar-identity" to="/" aria-label="Wayfinder home">
              <img className="topbar-brand-mark" src={logo} alt="Wayfinder" />
              <span className="topbar-brand-name font-serif">WayFinder</span>
            </NavLink>
            <div className="crumb">
              <strong>Planning desk</strong>
              <span className="crumb-dot" />
              {today}
            </div>
          </div>

          <div className="topbar-actions">
            <NavLink to="/explore" className="icon-button" aria-label="Explore">
              <Search size={16} />
            </NavLink>
            <button
              className="icon-button"
              type="button"
              aria-label="Notifications"
              onClick={() => toast.info("You are all caught up.")}
            >
              <Bell size={16} />
            </button>
            <NavLink to="/plan" className="icon-button" aria-label="Create a journey">
              <Plus size={16} />
            </NavLink>
          </div>
        </header>

        <Outlet />
      </main>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.path} to={item.path} className={({ isActive }) => isActive ? "active" : ""}>
              <Icon size={17} />
              {item.label === "My Journeys" ? "Journeys" : item.label}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
