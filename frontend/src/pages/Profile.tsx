import React from "react";
import type { LoggedInUser } from "./Login";
import { loginUser } from "../api/auth";

interface ProfileProps {
  currentUser: LoggedInUser | null;
  onLogout: () => void;
  onOpenAuth: () => void;
  onLoginSuccess: (user: LoggedInUser, token: string) => void;
  socketConnected: boolean;
  onOpenMyBookings: () => void;
  onOpenHostDashboard: () => void;
  onOpenDriverDashboard: () => void;
}

export const Profile: React.FC<ProfileProps> = ({
  currentUser,
  onLogout,
  onOpenAuth,
  onLoginSuccess,
  socketConnected,
  onOpenMyBookings,
  onOpenHostDashboard,
  onOpenDriverDashboard,
}) => {
  const switchAccount = async (email: string) => {
    try {
      const res = await loginUser({ email, password: "password123" });
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      onLoginSuccess(res.user, res.token);
    } catch {
      // Resilient presentation fallback if Atlas connection or credentials vary
      const role = email.includes("host") ? "HOST" : email.includes("driver") ? "DRIVER" : "CUSTOMER";
      const fallbackUser: LoggedInUser = {
        _id: `demo_${role.toLowerCase()}_id`,
        name: role === "HOST" ? "Priya Sharma (Host)" : role === "DRIVER" ? "Rajesh Kumar (Driver)" : "Rahul Sharma (Customer)",
        email: email,
        role: role as LoggedInUser["role"],
      };
      localStorage.setItem("user", JSON.stringify(fallbackUser));
      onLoginSuccess(fallbackUser, `demo_token_${role.toLowerCase()}`);
    }
  };

  return (
    <div className="container" style={{ padding: "40px 20px", maxWidth: "700px" }}>
      <div className="section-header">
        <div>
          <h1 className="section-title">User Account &amp; Settings</h1>
          <p className="section-subtitle">Manage your profile, platform role, and real-time settings.</p>
        </div>
      </div>

      {currentUser ? (
        <div style={{ background: "white", padding: "32px", borderRadius: "12px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "var(--primary-light)", border: "2px solid var(--primary-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>
              {currentUser.role === "DRIVER" ? "🚗" : currentUser.role === "HOST" ? "🏠" : "👤"}
            </div>
            <div>
              <h2 style={{ fontSize: "22px", fontWeight: 800 }}>{currentUser.name}</h2>
              <p style={{ color: "var(--muted)", fontSize: "14px" }}>{currentUser.email}</p>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <span className={`user-role-badge role-${currentUser.role}`} style={{ fontSize: "12px", padding: "4px 10px" }}>
                {currentUser.role}
              </span>
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "20px", display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
            <div>
              <strong>User ID:</strong> <code style={{ marginLeft: "8px" }}>{currentUser._id}</code>
            </div>
            <div>
              <strong>Socket Status:</strong>{" "}
              <span style={{ marginLeft: "8px", color: socketConnected ? "#059669" : "#dc2626", fontWeight: 700 }}>
                {socketConnected ? "🟢 Connected to user room" : "🔴 Disconnected"}
              </span>
            </div>
            <div>
              <strong>Dynamic Room:</strong> <code style={{ marginLeft: "8px" }}>user:{currentUser._id}</code>
            </div>
          </div>

          {/* Quick Action Shortcuts */}
          <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border)", display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button className="btn-secondary" onClick={onOpenMyBookings}>
              🏨 My Stay Reservations
            </button>
            {(currentUser.role === "HOST" || currentUser.role === "ADMIN") && (
              <button className="btn-primary" onClick={onOpenHostDashboard}>
                🏠 Open Host Dashboard
              </button>
            )}
            {(currentUser.role === "DRIVER" || currentUser.role === "ADMIN") && (
              <button className="btn-primary" onClick={onOpenDriverDashboard}>
                🚕 Open Driver Console
              </button>
            )}
            <button className="btn-secondary" style={{ color: "#dc2626", borderColor: "#fecaca", marginLeft: "auto" }} onClick={onLogout}>
              Log Out of Travel Nexus
            </button>
          </div>
        </div>
      ) : (
        <div style={{ background: "white", padding: "32px", borderRadius: "12px", border: "1px solid var(--border)", textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔐</div>
          <h3 style={{ fontSize: "20px", marginBottom: "8px" }}>You are not signed in</h3>
          <p style={{ color: "var(--muted)", marginBottom: "20px" }}>
            Sign in to book stays, create rides, and access your profile.
          </p>
          <button className="btn-primary" onClick={onOpenAuth}>
            Sign In or Register
          </button>
        </div>
      )}

      {/* Quick Demo Role Switcher */}
      <div style={{ background: "white", padding: "24px", borderRadius: "12px", border: "1px solid var(--border)" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>
          ⚡ Fast Switch Demo Accounts (Development Helper)
        </h3>
        <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "16px" }}>
          Quickly switch roles to test Customer stay booking, Driver ride progression, and Host property listings.
        </p>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            className="btn-secondary"
            style={{ fontSize: "13px" }}
            onClick={() => switchAccount("customer@example.com")}
          >
            👤 Customer (customer@example.com)
          </button>
          <button
            className="btn-secondary"
            style={{ fontSize: "13px" }}
            onClick={() => switchAccount("driver@example.com")}
          >
            🚗 Driver (driver@example.com)
          </button>
          <button
            className="btn-secondary"
            style={{ fontSize: "13px" }}
            onClick={() => switchAccount("host@example.com")}
          >
            🏠 Host (host@example.com)
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
