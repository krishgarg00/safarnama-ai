import React from "react";
import type { LoggedInUser } from "../pages/Login";
import logoImg from "../assets/logo.png";

export type NavTab = "Home" | "Explore" | "Stays" | "Rides" | "Trips" | "Profile" | "Host";

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  currentUser: LoggedInUser | null;
  onLogout: () => void;
  onOpenAuth: () => void;
  socketConnected: boolean;
  onOpenMyBookings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  currentUser,
  onLogout,
  onOpenAuth,
  socketConnected,
  onOpenMyBookings,
}) => {
  const tabs: { id: NavTab; label: string; icon: string }[] = [
    { id: "Home", label: "Home", icon: "🏠" },
    { id: "Explore", label: "Explore", icon: "🗺️" },
    { id: "Stays", label: "Stays", icon: "🏨" },
    { id: "Rides", label: "Rides", icon: "🚗" },
    { id: "Trips", label: "Trips", icon: "✨" },
    ...(currentUser?.role === "HOST" || currentUser?.role === "ADMIN"
      ? [{ id: "Host" as NavTab, label: "Host Portal", icon: "🏡" }]
      : []),
    { id: "Profile", label: "Profile", icon: "👤" },
  ];

  return (
    <header className="navbar">
      <div className="container">
        <div className="navbar-inner">
          {/* Brand Logo & Name */}
          <div className="navbar-brand" onClick={() => onTabChange("Home")}>
            <img src={logoImg} alt="Travel Nexus" className="brand-logo-img" />
            <div className="brand-text">
              <span className="brand-name">
                TRAVEL <span>NEXUS</span>
              </span>
              <span className="brand-tagline">Travel. Connect. Explore.</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav>
            <ul className="nav-links">
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <button
                    className={`nav-link ${activeTab === tab.id ? "active" : ""}`}
                    onClick={() => onTabChange(tab.id)}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Controls & Status */}
          <div className="navbar-actions">
            <span
              className={`socket-pill ${socketConnected ? "online" : "offline"}`}
              title={socketConnected ? "Socket.IO real-time sync active" : "Socket.IO disconnected"}
            >
              <span>{socketConnected ? "🟢" : "🔴"}</span>
              <span>{socketConnected ? "Live Sync" : "Offline"}</span>
            </span>

            {currentUser ? (
              <>
                <button
                  className="btn-secondary"
                  onClick={onOpenMyBookings}
                  style={{ padding: "6px 12px", fontSize: "13px" }}
                  title="View your confirmed stay bookings"
                >
                  🏨 My Bookings
                </button>
                <div
                  className="user-chip"
                  onClick={() => onTabChange("Profile")}
                  style={{ cursor: "pointer" }}
                >
                  <span className={`user-role-badge role-${currentUser.role}`}>
                    {currentUser.role}
                  </span>
                  <span>{currentUser.name}</span>
                </div>
                <button
                  className="btn-secondary"
                  onClick={onLogout}
                  style={{ padding: "6px 12px", fontSize: "13px" }}
                >
                  Logout
                </button>
              </>
            ) : (
              <button className="btn-primary" onClick={onOpenAuth}>
                <span>Sign In / Register</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
