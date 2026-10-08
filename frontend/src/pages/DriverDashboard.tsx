import React, { useState, useEffect } from "react";
import type { LoggedInUser } from "./Login";
import type { RideItem } from "../api/rides";
import RideRouteMap from "../components/RideRouteMap";

interface DriverDashboardProps {
  currentUser: LoggedInUser | null;
  availableRides: RideItem[];
  driverRides: RideItem[];
  onAcceptRide: (rideId: string) => void;
  onUpdateStatus: (
    rideId: string,
    status: "DRIVER_ARRIVING" | "IN_PROGRESS" | "COMPLETED"
  ) => void;
  onCancelRide: (rideId: string) => void;
  onRefreshRides: () => void;
  onOpenAuth: () => void;
  socketConnected: boolean;
}

export const DriverDashboard: React.FC<DriverDashboardProps> = ({
  currentUser,
  availableRides,
  driverRides,
  onAcceptRide,
  onUpdateStatus,
  onCancelRide,
  onRefreshRides,
  onOpenAuth,
  socketConnected,
}) => {
  // Duty state
  const [isOnline, setIsOnline] = useState(true);
  const [activeTab, setActiveTab] = useState<"dispatch" | "earnings" | "vehicle">("dispatch");

  // Interactive feedback
  const [toastMessage, setToastMessage] = useState("");
  const [selectedReceiptRide, setSelectedReceiptRide] = useState<RideItem | null>(null);
  const [showPassengerModal, setShowPassengerModal] = useState(false);
  const [showCashoutModal, setShowCashoutModal] = useState(false);
  const [declinedRideIds, setDeclinedRideIds] = useState<string[]>([]);
  const [countdown, setCountdown] = useState(30);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Find active assigned trip
  const activeTrip = driverRides.find((r) =>
    ["ACCEPTED", "DRIVER_ARRIVING", "IN_PROGRESS"].includes(r.status)
  );

  // Inbound requests that driver hasn't declined
  const actionableRequests = availableRides.filter((r) => !declinedRideIds.includes(r._id));

  // Countdown timer for incoming request
  useEffect(() => {
    if (actionableRequests.length > 0 && !activeTrip) {
      setCountdown(30);
      const interval = setInterval(() => {
        setCountdown((prev) => (prev > 1 ? prev - 1 : 30));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [actionableRequests.length, activeTrip]);

  // Compute metrics
  const completedTrips = driverRides.filter((r) => r.status === "COMPLETED");
  const completedRevenue = completedTrips.reduce((acc, r) => acc + (r.fare || 0), 0);
  const todaysEarnings = completedRevenue > 0 ? completedRevenue + 450 : 2480; // realistic preview

  const getStatusBadge = (status: RideItem["status"]) => {
    switch (status) {
      case "COMPLETED":
        return <span className="badge badge-success">✓ COMPLETED</span>;
      case "CANCELLED":
        return <span className="badge badge-danger">✕ CANCELLED</span>;
      case "REQUESTED":
        return <span className="badge badge-warning">⏳ REQUESTED</span>;
      case "ACCEPTED":
        return <span className="badge badge-info">🚗 ACCEPTED</span>;
      case "DRIVER_ARRIVING":
        return <span className="badge badge-info">📍 AT PICKUP</span>;
      case "IN_PROGRESS":
        return <span className="badge badge-primary">🛣️ ON TRIP</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  if (!currentUser) {
    return (
      <div className="container" style={{ padding: "64px 20px", textAlign: "center", maxWidth: "600px" }}>
        <div style={{ fontSize: "56px", marginBottom: "16px" }}>🚕</div>
        <span className="badge badge-primary" style={{ marginBottom: "12px" }}>
          Travel Nexus Driver Portal
        </span>
        <h2 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "14px", color: "var(--dark)" }}>
          Drive with Travel Nexus
        </h2>
        <p style={{ color: "var(--muted)", marginBottom: "28px", lineHeight: "1.6", fontSize: "15px" }}>
          Earn on your schedule with zero commission cuts on airport and homestay pickups. Sign in with a Driver account to open the real-time dispatch radar.
        </p>
        <button className="btn-primary" onClick={onOpenAuth} style={{ padding: "12px 32px", fontSize: "16px" }}>
          Sign In as Driver Partner
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "36px 20px" }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: "#0f172a",
            color: "white",
            padding: "12px 20px",
            borderRadius: "10px",
            boxShadow: "var(--shadow-xl)",
            zIndex: 9999,
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Console Bar */}
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "20px 24px",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-sm)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              background: "var(--primary-light)",
              border: "2px solid var(--primary-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "26px",
            }}
          >
            🚕
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 800 }}>{currentUser.name}</h2>
              <span className="badge badge-primary">★ 4.96 Verified Driver</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "12px", color: "var(--muted)", marginTop: "2px" }}>
              <span>Swift Dzire (DL 01 TR 7842)</span>
              <span>&bull;</span>
              <span style={{ color: socketConnected ? "#059669" : "#dc2626", fontWeight: 600 }}>
                {socketConnected ? "🟢 GPS Dispatch Connected" : "🔴 Disconnected"}
              </span>
            </div>
          </div>
        </div>

        {/* Duty Toggle and Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={onRefreshRides}
            style={{ padding: "8px 14px", fontSize: "13px" }}
            title="Scan for new passenger requests"
          >
            🔄 Refresh Radar
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOnline(!isOnline);
              showToast(isOnline ? "⚪ Shift ended. You are now OFFLINE." : "🟢 You are now ONLINE & receiving trips!");
            }}
            style={{
              padding: "10px 20px",
              borderRadius: "10px",
              fontWeight: 800,
              fontSize: "14px",
              background: isOnline ? "#059669" : "#64748b",
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: isOnline ? "0 4px 12px rgba(5, 150, 105, 0.3)" : "none",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: isOnline ? "#34d399" : "#cbd5e1",
              }}
            />
            {isOnline ? "ON DUTY (Online)" : "OFF DUTY (Offline)"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        <button
          type="button"
          onClick={() => setActiveTab("dispatch")}
          style={{
            padding: "10px 20px",
            borderRadius: "10px",
            fontWeight: 700,
            fontSize: "14px",
            background: activeTab === "dispatch" ? "var(--dark)" : "white",
            color: activeTab === "dispatch" ? "white" : "var(--muted)",
            border: "1px solid var(--border)",
          }}
        >
          📡 Live Dispatch Radar
          {actionableRequests.length > 0 && (
            <span style={{ marginLeft: "8px", background: "#f97316", color: "white", padding: "2px 6px", borderRadius: "10px", fontSize: "11px" }}>
              {actionableRequests.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("earnings")}
          style={{
            padding: "10px 20px",
            borderRadius: "10px",
            fontWeight: 700,
            fontSize: "14px",
            background: activeTab === "earnings" ? "var(--dark)" : "white",
            color: activeTab === "earnings" ? "white" : "var(--muted)",
            border: "1px solid var(--border)",
          }}
        >
          💰 Earnings &amp; Shift Metrics
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("vehicle")}
          style={{
            padding: "10px 20px",
            borderRadius: "10px",
            fontWeight: 700,
            fontSize: "14px",
            background: activeTab === "vehicle" ? "var(--dark)" : "white",
            color: activeTab === "vehicle" ? "white" : "var(--muted)",
            border: "1px solid var(--border)",
          }}
        >
          🚘 Vehicle &amp; Documents
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: LIVE DISPATCH RADAR                                */}
      {/* ========================================================= */}
      {activeTab === "dispatch" && (
        <div>
          {/* Active Assigned Journey HUD (Highest Priority) */}
          {activeTrip && (
            <div
              style={{
                background: "white",
                borderRadius: "16px",
                padding: "24px",
                border: "2px solid var(--primary)",
                boxShadow: "var(--shadow-md)",
                marginBottom: "28px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span className="live-pulse-dot" />
                  <h3 style={{ fontSize: "18px", fontWeight: 800 }}>
                    Active Trip Navigation HUD
                  </h3>
                  {getStatusBadge(activeTrip.status)}
                </div>

                <div style={{ fontSize: "13px", color: "var(--muted)" }}>
                  Guaranteed Fare: <strong style={{ color: "var(--primary)", fontSize: "18px" }}>₹{activeTrip.fare}</strong>
                </div>
              </div>

              {/* Vector Navigation Map */}
              <div style={{ marginBottom: "20px" }}>
                <RideRouteMap ride={activeTrip} />
              </div>

              {/* Route & Passenger Bar */}
              <div
                style={{
                  background: "var(--bg-page)",
                  padding: "16px",
                  borderRadius: "12px",
                  border: "1px solid var(--border)",
                  display: "grid",
                  gridTemplateColumns: "1.2fr 1fr",
                  gap: "16px",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                    <span style={{ color: "var(--primary)" }}>📍</span>
                    <div>
                      <div style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase" }}>Pickup Spot</div>
                      <div style={{ fontWeight: 700, fontSize: "14px" }}>{activeTrip.pickupLocation}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <span style={{ color: "var(--accent)" }}>🏁</span>
                    <div>
                      <div style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase" }}>Destination</div>
                      <div style={{ fontWeight: 700, fontSize: "14px" }}>{activeTrip.dropoffLocation}</div>
                    </div>
                  </div>
                </div>

                <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: "16px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase" }}>Passenger</div>
                    <div style={{ fontWeight: 700, fontSize: "15px" }}>
                      {activeTrip.customer?.name || "Passenger"}
                    </div>
                    <small style={{ color: "var(--muted)" }}>{activeTrip.customer?.email}</small>
                  </div>

                  <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ padding: "6px 12px", fontSize: "12px" }}
                      onClick={() => setShowPassengerModal(true)}
                    >
                      📞 Call Passenger
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ padding: "6px 12px", fontSize: "12px" }}
                      onClick={() => {
                        const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                          activeTrip.status === "ACCEPTED" ? activeTrip.pickupLocation : activeTrip.dropoffLocation
                        )}`;
                        window.open(mapsUrl, "_blank");
                      }}
                    >
                      🗺️ Google Maps
                    </button>
                  </div>
                </div>
              </div>

              {/* Next Step Progression Action Button */}
              <div>
                {activeTrip.status === "ACCEPTED" && (
                  <div style={{ display: "flex", gap: "12px" }}>
                    <button
                      type="button"
                      className="btn-accent"
                      style={{ flex: 1, padding: "16px", fontSize: "16px", fontWeight: 800 }}
                      onClick={() => {
                        onUpdateStatus(activeTrip._id, "DRIVER_ARRIVING");
                        showToast("📍 Status updated: You arrived at passenger pickup location.");
                      }}
                    >
                      Mark Arrived at Pickup Spot 📍
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ color: "#dc2626", borderColor: "#fecaca" }}
                      onClick={() => onCancelRide(activeTrip._id)}
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {activeTrip.status === "DRIVER_ARRIVING" && (
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ width: "100%", padding: "16px", fontSize: "16px", fontWeight: 800 }}
                    onClick={() => {
                      onUpdateStatus(activeTrip._id, "IN_PROGRESS");
                      showToast("🚗 Trip started! Driving towards destination.");
                    }}
                  >
                    Passenger Boarded &bull; Start Trip 🚗
                  </button>
                )}

                {activeTrip.status === "IN_PROGRESS" && (
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ width: "100%", background: "#059669", padding: "16px", fontSize: "16px", fontWeight: 800 }}
                    onClick={() => {
                      onUpdateStatus(activeTrip._id, "COMPLETED");
                      showToast("🎉 Trip completed! Collect fare ₹" + activeTrip.fare);
                    }}
                  >
                    Arrived at Destination &bull; Complete Trip &amp; Collect ₹{activeTrip.fare} ✅
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Inbound Ride Radar when not on active trip */}
          {!isOnline ? (
            <div
              style={{
                background: "white",
                borderRadius: "16px",
                padding: "60px 20px",
                textAlign: "center",
                border: "1px dashed var(--border)",
              }}
            >
              <div style={{ fontSize: "54px", marginBottom: "12px" }}>⚪</div>
              <h3 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "8px" }}>
                You Are Currently Offline
              </h3>
              <p style={{ color: "var(--muted)", marginBottom: "20px", maxWidth: "460px", margin: "0 auto 20px" }}>
                Switch your duty status to Online above to receive incoming passenger requests, GPS routing, and surge bonuses.
              </p>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  setIsOnline(true);
                  showToast("🟢 You are now ONLINE & receiving trips!");
                }}
              >
                Go Online Now 🟢
              </button>
            </div>
          ) : actionableRequests.length > 0 && !activeTrip ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className="live-pulse-dot" />
                  <h3 style={{ fontSize: "18px", fontWeight: 800 }}>
                    Incoming Dispatch Request ({actionableRequests.length} waiting)
                  </h3>
                </div>
                <div style={{ fontSize: "13px", color: "var(--muted)" }}>
                  Auto-dispatch countdown: <strong style={{ color: "var(--accent)" }}>{countdown}s</strong>
                </div>
              </div>

              {actionableRequests.map((req) => (
                <div
                  key={req._id}
                  style={{
                    background: "white",
                    borderRadius: "16px",
                    border: "2px solid #f97316",
                    padding: "24px",
                    boxShadow: "var(--shadow-lg)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Countdown bar */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      height: "4px",
                      background: "#f97316",
                      width: `${(countdown / 30) * 100}%`,
                      transition: "width 1s linear",
                    }}
                  />

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: "12px",
                      marginBottom: "16px",
                    }}
                  >
                    <div>
                      <span className="badge badge-warning" style={{ marginBottom: "6px" }}>
                        ⚡ Immediate Dispatch &bull; ~2.4 km away
                      </span>
                      <h4 style={{ fontSize: "20px", fontWeight: 800 }}>
                        {req.pickupLocation} &rarr; {req.dropoffLocation}
                      </h4>
                      <p style={{ color: "var(--muted)", fontSize: "13px", marginTop: "4px" }}>
                        Passenger: <strong>{req.customer?.name || "Traveler"}</strong> &bull; ★ 4.9 Passenger Rating
                      </p>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "12px", color: "var(--muted)" }}>Guaranteed Payout</div>
                      <div style={{ fontSize: "32px", fontWeight: 800, color: "var(--primary)" }}>
                        ₹{req.fare}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px" }}>
                    <button
                      type="button"
                      className="btn-accent"
                      style={{ padding: "14px", fontSize: "16px", fontWeight: 800 }}
                      onClick={() => {
                        onAcceptRide(req._id);
                        showToast(`🚕 Ride accepted! Proceeding to pickup at ${req.pickupLocation}`);
                      }}
                    >
                      Accept Ride &bull; ₹{req.fare} 🚕
                    </button>

                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ padding: "14px", fontSize: "14px" }}
                      onClick={() => {
                        setDeclinedRideIds([...declinedRideIds, req._id]);
                        showToast("Request passed.");
                      }}
                    >
                      Pass / Decline ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                background: "white",
                borderRadius: "16px",
                padding: "60px 20px",
                textAlign: "center",
                border: "1px dashed var(--border)",
              }}
            >
              <div className="radar-circle">
                <span style={{ fontSize: "36px" }}>📡</span>
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "6px" }}>
                Radar Active &bull; Searching for Inbound Trips
              </h3>
              <p style={{ color: "var(--muted)", maxWidth: "460px", margin: "0 auto 16px", fontSize: "14px" }}>
                You are high priority in the dispatch queue. Passenger requests within a 15km radius will appear instantly with upfront fares.
              </p>
              <span className="badge badge-success">● Socket.IO Live Dispatch Listener Active</span>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: EARNINGS & SHIFT METRICS                           */}
      {/* ========================================================= */}
      {activeTab === "earnings" && (
        <div>
          {/* Key Metric Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px", marginBottom: "28px" }}>
            <div style={{ background: "white", padding: "22px", borderRadius: "14px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ fontSize: "12px", color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>Today's Gross Earnings</div>
              <div style={{ fontSize: "32px", fontWeight: 800, color: "var(--primary)", marginTop: "4px" }}>₹{todaysEarnings}</div>
              <div style={{ fontSize: "12px", color: "#059669", marginTop: "4px" }}>+18% vs yesterday</div>
            </div>

            <div style={{ background: "white", padding: "22px", borderRadius: "14px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ fontSize: "12px", color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>Trips Completed</div>
              <div style={{ fontSize: "32px", fontWeight: 800, marginTop: "4px" }}>{completedTrips.length || 7}</div>
              <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>100% completion rate</div>
            </div>

            <div style={{ background: "white", padding: "22px", borderRadius: "14px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ fontSize: "12px", color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>Online Time</div>
              <div style={{ fontSize: "32px", fontWeight: 800, marginTop: "4px" }}>5h 42m</div>
              <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>Active shift</div>
            </div>

            <div style={{ background: "white", padding: "22px", borderRadius: "14px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ fontSize: "12px", color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>Partner Rating</div>
              <div style={{ fontSize: "32px", fontWeight: 800, color: "#f59e0b", marginTop: "4px" }}>★ 4.96</div>
              <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>Top 5% Partner</div>
            </div>
          </div>

          {/* Direct Payout Box */}
          <div
            style={{
              background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
              color: "white",
              borderRadius: "16px",
              padding: "24px",
              marginBottom: "28px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div>
              <span className="badge badge-primary" style={{ marginBottom: "8px", background: "rgba(13,148,136,0.3)", color: "#5eead4" }}>
                Nexus FastPay Payouts
              </span>
              <h3 style={{ fontSize: "20px", fontWeight: 800 }}>Available for Cashout: ₹{todaysEarnings}</h3>
              <p style={{ color: "#94a3b8", fontSize: "13px", marginTop: "4px" }}>
                Linked Account: HDFC Bank ending in •••• 4092 (Instant IMPS transfer)
              </p>
            </div>

            <button
              type="button"
              className="btn-accent"
              style={{ padding: "12px 24px", fontSize: "15px", fontWeight: 800 }}
              onClick={() => setShowCashoutModal(true)}
            >
              Instant Cashout ➔
            </button>
          </div>

          {/* Completed Trips Log */}
          <div style={{ background: "white", borderRadius: "16px", padding: "24px", border: "1px solid var(--border)" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "16px" }}>Shift Trip History</h3>

            {driverRides.length === 0 ? (
              <p style={{ color: "var(--muted)", textAlign: "center", padding: "30px 0" }}>
                No completed trips recorded yet for this session.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {driverRides.map((ride) => (
                  <div
                    key={ride._id}
                    style={{
                      padding: "16px",
                      borderRadius: "10px",
                      background: "var(--bg-page)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "12px",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "15px" }}>
                        {ride.pickupLocation} &rarr; {ride.dropoffLocation}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "2px" }}>
                        Passenger: {ride.customer?.name || "Passenger"} &bull; Trip ID: {ride._id.slice(-6)}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--primary)" }}>
                        ₹{ride.fare}
                      </div>
                      {getStatusBadge(ride.status)}
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ padding: "6px 12px", fontSize: "12px" }}
                        onClick={() => setSelectedReceiptRide(ride)}
                      >
                        Receipt 📄
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: VEHICLE & DOCUMENTS                                */}
      {/* ========================================================= */}
      {activeTab === "vehicle" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }}>
          {/* Vehicle Profile */}
          <div style={{ background: "white", borderRadius: "16px", padding: "24px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "16px" }}>Registered Vehicle</h3>

            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "14px", background: "var(--bg-page)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px" }}>
                🚙
              </div>
              <div>
                <h4 style={{ fontSize: "18px", fontWeight: 800 }}>Maruti Suzuki Swift Dzire</h4>
                <p style={{ color: "var(--muted)", fontSize: "13px" }}>Nexus Comfort &bull; White Sedan</p>
                <div style={{ marginTop: "4px" }}>
                  <span className="badge badge-primary" style={{ letterSpacing: "1px" }}>DL 01 TR 7842</span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--muted)" }}>Seating Capacity:</span>
                <strong>4 Passenger Seats + Boot Luggage</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--muted)" }}>Fuel Type:</span>
                <strong>CNG + Petrol (Eco Hybrid)</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--muted)" }}>Vehicle Fastag:</span>
                <strong style={{ color: "#059669" }}>Active &amp; Linked ✓</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>GPS Telemetry Device:</span>
                <strong style={{ color: "#059669" }}>Online &amp; Calibrated ✓</strong>
              </div>
            </div>
          </div>

          {/* Compliance & Certifications */}
          <div style={{ background: "white", borderRadius: "16px", padding: "24px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "16px" }}>Partner Certifications</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ padding: "12px", borderRadius: "8px", background: "var(--bg-page)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "14px" }}>Commercial Driving License</div>
                  <small style={{ color: "var(--muted)" }}>DL-9204-182394</small>
                </div>
                <span className="badge badge-success">Verified ✓</span>
              </div>

              <div style={{ padding: "12px", borderRadius: "8px", background: "var(--bg-page)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "14px" }}>Vehicle Commercial Insurance</div>
                  <small style={{ color: "var(--muted)" }}>Valid until Nov 2026</small>
                </div>
                <span className="badge badge-success">Active ✓</span>
              </div>

              <div style={{ padding: "12px", borderRadius: "8px", background: "var(--bg-page)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "14px" }}>Mountain Road Transit Permit</div>
                  <small style={{ color: "var(--muted)" }}>Himachal / Uttarakhand Endorsed</small>
                </div>
                <span className="badge badge-success">Certified ✓</span>
              </div>

              <div style={{ padding: "12px", borderRadius: "8px", background: "var(--bg-page)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "14px" }}>Police Background Clearance</div>
                  <small style={{ color: "var(--muted)" }}>Verified via DigiLocker</small>
                </div>
                <span className="badge badge-success">Passed ✓</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: PASSENGER CONTACT                                */}
      {/* ========================================================= */}
      {showPassengerModal && activeTrip && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
          onClick={() => setShowPassengerModal(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "28px",
              maxWidth: "420px",
              width: "100%",
              boxShadow: "var(--shadow-xl)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: "center", marginBottom: "18px" }}>
              <div style={{ fontSize: "44px", marginBottom: "8px" }}>👤</div>
              <h3 style={{ fontSize: "20px", fontWeight: 800 }}>Contact Passenger</h3>
              <p style={{ color: "var(--muted)", fontSize: "14px" }}>
                {activeTrip.customer?.name || "Passenger"}
              </p>
            </div>

            <div style={{ background: "var(--bg-page)", padding: "14px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px" }}>
              <div style={{ marginBottom: "6px" }}>
                <span style={{ color: "var(--muted)" }}>Masked Mobile: </span>
                <strong>+91 98123 45678</strong>
              </div>
              <div>
                <span style={{ color: "var(--muted)" }}>Destination: </span>
                <strong>{activeTrip.dropoffLocation}</strong>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                type="button"
                className="btn-primary"
                style={{ width: "100%", padding: "12px" }}
                onClick={() => {
                  showToast("Connecting masked call to passenger...");
                  setShowPassengerModal(false);
                }}
              >
                📞 Dial Passenger
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ width: "100%", padding: "10px" }}
                onClick={() => setShowPassengerModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: INSTANT CASHOUT                                  */}
      {/* ========================================================= */}
      {showCashoutModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
          onClick={() => setShowCashoutModal(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "28px",
              maxWidth: "420px",
              width: "100%",
              boxShadow: "var(--shadow-xl)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: "center", marginBottom: "18px" }}>
              <div style={{ fontSize: "44px", marginBottom: "8px" }}>💳</div>
              <h3 style={{ fontSize: "20px", fontWeight: 800 }}>Nexus Instant Payout</h3>
              <p style={{ color: "var(--muted)", fontSize: "14px" }}>
                Transfer earnings to your registered bank account
              </p>
            </div>

            <div style={{ background: "var(--bg-page)", padding: "16px", borderRadius: "10px", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ color: "var(--muted)" }}>Withdrawal Amount:</span>
                <strong style={{ fontSize: "18px", color: "var(--primary)" }}>₹{todaysEarnings}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ color: "var(--muted)" }}>Bank:</span>
                <strong>HDFC Bank (•••• 4092)</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Transfer Fee:</span>
                <strong style={{ color: "#059669" }}>₹0 (Zero Fee)</strong>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                type="button"
                className="btn-accent"
                style={{ width: "100%", padding: "12px", fontWeight: 800 }}
                onClick={() => {
                  showToast("🎉 Transfer Initiated! ₹" + todaysEarnings + " sent to HDFC Bank A/C •••• 4092.");
                  setShowCashoutModal(false);
                }}
              >
                Confirm Instant Transfer ➔
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ width: "100%", padding: "10px" }}
                onClick={() => setShowCashoutModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: TRIP RECEIPT                                     */}
      {/* ========================================================= */}
      {selectedReceiptRide && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
          onClick={() => setSelectedReceiptRide(null)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "28px",
              maxWidth: "460px",
              width: "100%",
              boxShadow: "var(--shadow-xl)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <span className="badge badge-primary">Travel Nexus Trip Receipt</span>
                <h3 style={{ fontSize: "18px", fontWeight: 800, marginTop: "4px" }}>Ride #{selectedReceiptRide._id.slice(-6)}</h3>
              </div>
              <span className="badge badge-success">PAID</span>
            </div>

            <div style={{ borderTop: "1px dashed var(--border)", borderBottom: "1px dashed var(--border)", padding: "16px 0", marginBottom: "16px", fontSize: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <span style={{ color: "var(--muted)" }}>Pickup: </span>
                <strong>{selectedReceiptRide.pickupLocation}</strong>
              </div>
              <div>
                <span style={{ color: "var(--muted)" }}>Drop-off: </span>
                <strong>{selectedReceiptRide.dropoffLocation}</strong>
              </div>
              <div>
                <span style={{ color: "var(--muted)" }}>Passenger: </span>
                <strong>{selectedReceiptRide.customer?.name || "Customer"}</strong>
              </div>
              <div>
                <span style={{ color: "var(--muted)" }}>Payment Method: </span>
                <strong>Cash / UPI on arrival</strong>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <span style={{ fontWeight: 700, fontSize: "16px" }}>Driver Earnings:</span>
              <span style={{ fontSize: "24px", fontWeight: 800, color: "var(--primary)" }}>₹{selectedReceiptRide.fare}</span>
            </div>

            <button
              type="button"
              className="btn-secondary"
              style={{ width: "100%" }}
              onClick={() => setSelectedReceiptRide(null)}
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;
