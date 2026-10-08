import React, { useState, useEffect } from "react";
import type { LoggedInUser } from "./Login";
import type { RideItem } from "../api/rides";
import RideBookingCard from "../components/RideBookingCard";
import RideRouteMap from "../components/RideRouteMap";

interface RidesProps {
  currentUser: LoggedInUser | null;
  rides: RideItem[];
  availableRides: RideItem[];
  driverRides: RideItem[];
  rideError: string;
  rideUpdate: {
    rideId: string;
    status: string;
    message: string;
  } | null;
  onAcceptRide: (rideId: string) => void;
  onUpdateStatus: (
    rideId: string,
    status: "DRIVER_ARRIVING" | "IN_PROGRESS" | "COMPLETED"
  ) => void;
  onCancelRide: (rideId: string) => void;
  onRideCreated: () => void;
  onOpenAuth: () => void;
  prefillDestination?: string;
  onClearPrefill?: () => void;
}

export const Rides: React.FC<RidesProps> = ({
  currentUser,
  rides,
  availableRides,
  driverRides,
  rideError,
  rideUpdate,
  onAcceptRide,
  onUpdateStatus,
  onCancelRide,
  onRideCreated,
  onOpenAuth,
  prefillDestination,
  onClearPrefill,
}) => {
  // Find current active ride (requested, accepted, arriving, or in progress)
  const activeRide = rides.find((r) =>
    ["REQUESTED", "ACCEPTED", "DRIVER_ARRIVING", "IN_PROGRESS"].includes(r.status)
  );

  // Tab views for Customer
  const [selectedView, setSelectedView] = useState<"tracker" | "book" | "history">(
    prefillDestination ? "book" : activeRide ? "tracker" : "book"
  );

  // Re-switch to tracker if a new active ride is created/updated and not prefilling
  useEffect(() => {
    if (activeRide && !prefillDestination && selectedView !== "book") {
      setSelectedView("tracker");
    }
  }, [activeRide?.status]);

  // When prefillDestination changes, switch to book view
  useEffect(() => {
    if (prefillDestination) {
      setSelectedView("book");
    }
  }, [prefillDestination]);

  // Modals & UI interactive states
  const [showSosModal, setShowSosModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [historyFilter, setHistoryFilter] = useState<"all" | "COMPLETED" | "CANCELLED">("all");
  const [prefilledDropoff, setPrefilledDropoff] = useState(prefillDestination || "");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleShareTracking = (rideId: string) => {
    const url = `${window.location.origin}?trackRide=${rideId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        showToast("🔗 Live tracking link copied to clipboard!");
      });
    } else {
      showToast(`🔗 Tracking Link: ${url}`);
    }
  };

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
        return <span className="badge badge-info">📍 DRIVER ARRIVING</span>;
      case "IN_PROGRESS":
        return <span className="badge badge-primary">🛣️ IN PROGRESS</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  if (!currentUser) {
    return (
      <div className="container" style={{ padding: "64px 20px", textAlign: "center", maxWidth: "620px" }}>
        <div style={{ fontSize: "56px", marginBottom: "16px" }}>🚗</div>
        <span className="badge badge-primary" style={{ marginBottom: "12px" }}>
          Travel Nexus Rides
        </span>
        <h2 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "14px", color: "var(--dark)" }}>
          On-Demand Cab &amp; Stay Transit
        </h2>
        <p style={{ color: "var(--muted)", marginBottom: "28px", lineHeight: "1.6", fontSize: "15px" }}>
          Connect seamlessly from flights and trains directly to your homestays and hotels. Experience real-time GPS tracking, verified local drivers, and zero hidden fares.
        </p>
        <button className="btn-primary" onClick={onOpenAuth} style={{ padding: "12px 32px", fontSize: "16px" }}>
          Sign In to Book or Drive 🚀
        </button>
      </div>
    );
  }

  // Calculate past rides
  const pastRides = rides.filter((r) => ["COMPLETED", "CANCELLED"].includes(r.status));
  const filteredPastRides =
    historyFilter === "all" ? pastRides : pastRides.filter((r) => r.status === historyFilter);

  // Stepper helper for active ride
  const getStepIndex = (status: RideItem["status"]) => {
    switch (status) {
      case "REQUESTED":
        return 0;
      case "ACCEPTED":
        return 1;
      case "DRIVER_ARRIVING":
        return 2;
      case "IN_PROGRESS":
        return 3;
      case "COMPLETED":
        return 4;
      default:
        return 0;
    }
  };

  const steps = [
    { label: "Request Placed", desc: "Searching nearby drivers" },
    { label: "Driver Matched", desc: "Assigned partner confirmed" },
    { label: "Driver Arriving", desc: "En route to pickup point" },
    { label: "On Journey", desc: "Traveling towards stay" },
    { label: "Arrived", desc: "Reached destination" },
  ];

  return (
    <div className="container" style={{ padding: "36px 20px" }}>
      {/* Toast Alert */}
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

      {/* Live Ride Update Banner from WebSocket */}
      {rideUpdate && (
        <div className="live-alert-banner" style={{ marginBottom: "20px" }}>
          <div className="live-alert-header">
            <span className="live-alert-title">
              <span className="live-pulse-dot" /> Live Ride Event
            </span>
            <span className="badge badge-success">{rideUpdate.status}</span>
          </div>
          <div className="live-alert-msg">{rideUpdate.message}</div>
          <small style={{ color: "#065f46", display: "block", marginTop: "4px" }}>
            Ride ID: <code>{rideUpdate.rideId}</code>
          </small>
        </div>
      )}

      {rideError && (
        <div
          style={{
            color: "#dc2626",
            background: "#fef2f2",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "20px",
            border: "1px solid #fecaca",
          }}
        >
          {rideError}
        </div>
      )}

      {/* ========================================================= */}
      {/* CUSTOMER INTERFACE                                        */}
      {/* ========================================================= */}
      {currentUser.role === "CUSTOMER" && (
        <div>
          {/* Header & Tabs */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="badge badge-primary">Travel Nexus Transit</span>
                {activeRide && (
                  <span
                    className="badge badge-info"
                    style={{ background: "#ecfdf5", color: "#059669", borderColor: "#a7f3d0" }}
                  >
                    <span className="live-pulse-dot" style={{ marginRight: "6px" }} />
                    Active Journey
                  </span>
                )}
              </div>
              <h1 style={{ fontSize: "28px", fontWeight: 800, marginTop: "6px", color: "var(--dark)" }}>
                Rides &amp; Stay Transfers
              </h1>
              <p style={{ color: "var(--muted)", fontSize: "14px" }}>
                Book instant cabs, track driver arrivals in real time, or link rides to your reserved stays.
              </p>
            </div>

            {/* View Switcher Pills */}
            <div
              style={{
                display: "flex",
                background: "white",
                padding: "4px",
                borderRadius: "12px",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-sm)",
                gap: "4px",
              }}
            >
              {activeRide && (
                <button
                  type="button"
                  onClick={() => setSelectedView("tracker")}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "13px",
                    background: selectedView === "tracker" ? "var(--primary)" : "transparent",
                    color: selectedView === "tracker" ? "white" : "var(--dark)",
                  }}
                >
                  📍 Live Tracker
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedView("book")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "13px",
                  background: selectedView === "book" ? "var(--primary)" : "transparent",
                  color: selectedView === "book" ? "white" : "var(--dark)",
                }}
              >
                🚗 Book a Ride
              </button>
              <button
                type="button"
                onClick={() => setSelectedView("history")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "13px",
                  background: selectedView === "history" ? "var(--primary)" : "transparent",
                  color: selectedView === "history" ? "white" : "var(--dark)",
                }}
              >
                📋 Trip History ({rides.length})
              </button>
            </div>
          </div>

          {/* Sticky Mini Banner when active ride exists but user is on another view */}
          {activeRide && selectedView !== "tracker" && (
            <div
              onClick={() => setSelectedView("tracker")}
              style={{
                background: "linear-gradient(90deg, #0f172a, #1e293b)",
                color: "white",
                padding: "12px 20px",
                borderRadius: "12px",
                marginBottom: "24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
                boxShadow: "var(--shadow-md)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span className="live-pulse-dot" />
                <div>
                  <strong style={{ fontSize: "14px" }}>Active Trip in Progress:</strong>
                  <span style={{ fontSize: "13px", color: "#cbd5e1", marginLeft: "8px" }}>
                    {activeRide.pickupLocation} &rarr; {activeRide.dropoffLocation}
                  </span>
                </div>
              </div>
              <span style={{ color: "#38bdf8", fontWeight: 700, fontSize: "13px" }}>
                Open Live Map &rarr;
              </span>
            </div>
          )}

          {/* VIEW 1: LIVE JOURNEY TRACKER */}
          {selectedView === "tracker" && (
            <div>
              {activeRide ? (
                <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "24px" }}>
                  {/* Left Column: Interactive Map & Stepper */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {/* Live Vector Animated Map */}
                    <div
                      style={{
                        background: "white",
                        borderRadius: "16px",
                        padding: "16px",
                        border: "1px solid var(--border)",
                        boxShadow: "var(--shadow-md)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "12px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span className="live-pulse-dot" />
                          <h3 style={{ fontSize: "16px", fontWeight: 800 }}>
                            Live GPS Route Tracker
                          </h3>
                        </div>
                        {getStatusBadge(activeRide.status)}
                      </div>

                      <RideRouteMap ride={activeRide} />
                    </div>

                    {/* 5-Step Journey Progression Stepper */}
                    <div
                      style={{
                        background: "white",
                        borderRadius: "16px",
                        padding: "24px",
                        border: "1px solid var(--border)",
                        boxShadow: "var(--shadow-sm)",
                      }}
                    >
                      <h4 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "18px" }}>
                        Trip Progress Pipeline
                      </h4>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(5, 1fr)",
                          position: "relative",
                          textAlign: "center",
                        }}
                      >
                        {/* Connecting Line */}
                        <div
                          style={{
                            position: "absolute",
                            top: "16px",
                            left: "10%",
                            right: "10%",
                            height: "3px",
                            background: "var(--border)",
                            zIndex: 1,
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            top: "16px",
                            left: "10%",
                            width: `${(getStepIndex(activeRide.status) / 4) * 80}%`,
                            height: "3px",
                            background: "var(--primary)",
                            zIndex: 2,
                            transition: "width 0.4s ease",
                          }}
                        />

                        {steps.map((st, idx) => {
                          const currentStep = getStepIndex(activeRide.status);
                          const isDone = idx < currentStep;
                          const isCurrent = idx === currentStep;

                          return (
                            <div
                              key={st.label}
                              style={{
                                position: "relative",
                                zIndex: 3,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                              }}
                            >
                              <div
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "50%",
                                  background: isCurrent
                                    ? "var(--primary)"
                                    : isDone
                                    ? "#059669"
                                    : "white",
                                  border: isCurrent
                                    ? "3px solid #99f6e4"
                                    : isDone
                                    ? "2px solid #059669"
                                    : "2px solid var(--border)",
                                  color: isDone || isCurrent ? "white" : "var(--muted)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: 700,
                                  fontSize: "12px",
                                  marginBottom: "8px",
                                  boxShadow: isCurrent ? "0 0 0 4px rgba(13, 148, 136, 0.2)" : "none",
                                }}
                              >
                                {isDone ? "✓" : idx + 1}
                              </div>
                              <div
                                style={{
                                  fontSize: "12px",
                                  fontWeight: isCurrent ? 800 : 600,
                                  color: isCurrent ? "var(--primary)" : isDone ? "var(--dark)" : "var(--muted)",
                                }}
                              >
                                {st.label}
                              </div>
                              <div
                                style={{
                                  fontSize: "10px",
                                  color: "var(--light-muted)",
                                  marginTop: "2px",
                                  display: "none",
                                }}
                              >
                                {st.desc}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Current Status Message Display */}
                      <div
                        style={{
                          marginTop: "24px",
                          background: "var(--bg-page)",
                          borderRadius: "10px",
                          padding: "12px 16px",
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <span style={{ fontSize: "24px" }}>
                          {activeRide.status === "REQUESTED"
                            ? "📡"
                            : activeRide.status === "ACCEPTED"
                            ? "🤝"
                            : activeRide.status === "DRIVER_ARRIVING"
                            ? "🚖"
                            : activeRide.status === "IN_PROGRESS"
                            ? "🛣️"
                            : "🎉"}
                        </span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--dark)" }}>
                            {activeRide.status === "REQUESTED" && "Searching for drivers nearby..."}
                            {activeRide.status === "ACCEPTED" &&
                              `Driver ${activeRide.driver?.name || "assigned"} confirmed! Preparing vehicle.`}
                            {activeRide.status === "DRIVER_ARRIVING" &&
                              `Driver ${activeRide.driver?.name || ""} is arriving at your pickup spot!`}
                            {activeRide.status === "IN_PROGRESS" &&
                              `Trip in progress — Relax and enjoy your travel to ${activeRide.dropoffLocation}.`}
                            {activeRide.status === "COMPLETED" && "You have safely arrived at your destination!"}
                          </div>
                          <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "2px" }}>
                            {activeRide.status === "REQUESTED"
                              ? "Average dispatch time is under 1 minute. Sockets actively listening for driver acceptance."
                              : "Live journey telemetry is synchronized via Travel Nexus WebSocket network."}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Driver Details Card & Safety Controls */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {/* Driver Card */}
                    <div
                      style={{
                        background: "white",
                        borderRadius: "16px",
                        padding: "24px",
                        border: "1px solid var(--border)",
                        boxShadow: "var(--shadow-md)",
                      }}
                    >
                      <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "16px" }}>
                        Assigned Driver &amp; Vehicle
                      </h4>

                      {activeRide.driver ? (
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
                            <div
                              style={{
                                width: "54px",
                                height: "54px",
                                borderRadius: "50%",
                                background: "var(--primary-light)",
                                border: "2px solid var(--primary-border)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "26px",
                              }}
                            >
                              👨‍✈️
                            </div>
                            <div>
                              <div style={{ fontSize: "17px", fontWeight: 800 }}>
                                {activeRide.driver.name}
                              </div>
                              <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                                {activeRide.driver.email}
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                                <span style={{ color: "#f59e0b", fontSize: "13px" }}>★ 4.95</span>
                                <span style={{ color: "var(--light-muted)", fontSize: "12px" }}>
                                  (180+ trips) &bull; Verified Partner
                                </span>
                              </div>
                            </div>
                          </div>

                          <div
                            style={{
                              background: "var(--bg-page)",
                              padding: "12px",
                              borderRadius: "10px",
                              border: "1px solid var(--border)",
                              marginBottom: "18px",
                              fontSize: "13px",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                              <span style={{ color: "var(--muted)" }}>Vehicle:</span>
                              <strong>Nexus Comfort • Silver Sedan</strong>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span style={{ color: "var(--muted)" }}>Registration No:</span>
                              <strong style={{ letterSpacing: "1px" }}>DL 01 TR 7842</strong>
                            </div>
                          </div>

                          {/* Quick Contact Buttons */}
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                            <button
                              type="button"
                              className="btn-secondary"
                              onClick={() => setShowContactModal(true)}
                              style={{ padding: "10px", fontSize: "13px" }}
                            >
                              📞 Call Driver
                            </button>
                            <button
                              type="button"
                              className="btn-secondary"
                              onClick={() => setShowContactModal(true)}
                              style={{ padding: "10px", fontSize: "13px" }}
                            >
                              💬 Message
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ textAlign: "center", padding: "24px 10px" }}>
                          <div style={{ fontSize: "42px", marginBottom: "8px", animation: "pulseGlow 1.5s infinite" }}>
                            📡
                          </div>
                          <div style={{ fontWeight: 700, fontSize: "15px" }}>Looking for nearby drivers</div>
                          <p style={{ color: "var(--muted)", fontSize: "13px", marginTop: "4px" }}>
                            Broadcasting your trip to drivers near {activeRide.pickupLocation}...
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Trip Summary & Fare Card */}
                    <div
                      style={{
                        background: "white",
                        borderRadius: "16px",
                        padding: "24px",
                        border: "1px solid var(--border)",
                        boxShadow: "var(--shadow-sm)",
                      }}
                    >
                      <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "16px" }}>
                        Trip Summary
                      </h4>

                      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <span style={{ color: "var(--primary)", fontSize: "16px" }}>📍</span>
                          <div>
                            <div style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase" }}>Pickup Location</div>
                            <div style={{ fontWeight: 700, fontSize: "14px" }}>{activeRide.pickupLocation}</div>
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: "10px" }}>
                          <span style={{ color: "var(--accent)", fontSize: "16px" }}>🏁</span>
                          <div>
                            <div style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase" }}>Drop-off Destination</div>
                            <div style={{ fontWeight: 700, fontSize: "14px" }}>{activeRide.dropoffLocation}</div>
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          borderTop: "1px dashed var(--border)",
                          paddingTop: "12px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "18px",
                        }}
                      >
                        <div>
                          <div style={{ fontSize: "12px", color: "var(--muted)" }}>Total Estimated Fare</div>
                          <div style={{ fontSize: "11px", color: "var(--light-muted)" }}>Pay on arrival (Cash/UPI)</div>
                        </div>
                        <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--primary)" }}>
                          ₹{activeRide.fare}
                        </div>
                      </div>

                      {/* Safety & Action Controls */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => handleShareTracking(activeRide._id)}
                          style={{ width: "100%", justifyContent: "center" }}
                        >
                          🔗 Share Live Trip Link
                        </button>

                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => setShowSosModal(true)}
                          style={{
                            width: "100%",
                            justifyContent: "center",
                            color: "#dc2626",
                            borderColor: "#fecaca",
                            background: "#fef2f2",
                          }}
                        >
                          🚨 Emergency SOS Assist
                        </button>

                        {["REQUESTED", "ACCEPTED", "DRIVER_ARRIVING"].includes(activeRide.status) && (
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => onCancelRide(activeRide._id)}
                            style={{
                              width: "100%",
                              justifyContent: "center",
                              color: "var(--muted)",
                              fontSize: "12px",
                              marginTop: "4px",
                            }}
                          >
                            Cancel Ride Request
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "60px 20px",
                    background: "white",
                    borderRadius: "16px",
                    border: "1px dashed var(--border)",
                  }}
                >
                  <div style={{ fontSize: "48px", marginBottom: "12px" }}>🚗</div>
                  <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>
                    No Active Journey in Progress
                  </h3>
                  <p style={{ color: "var(--muted)", marginBottom: "20px" }}>
                    Request a cab to your hotel, airport, or favorite destination to start live GPS tracking.
                  </p>
                  <button className="btn-primary" onClick={() => setSelectedView("book")}>
                    Book a Cab Now ➔
                  </button>
                </div>
              )}
            </div>
          )}

          {/* VIEW 2: BOOK A RIDE CARD */}
          {selectedView === "book" && (
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "28px" }}>
              <RideBookingCard
                onRideCreated={() => {
                  onRideCreated();
                  setSelectedView("tracker");
                  if (onClearPrefill) onClearPrefill();
                  showToast("🚗 Ride requested! Searching for nearby drivers.");
                }}
                initialDestination={prefilledDropoff || prefillDestination}
              />

              {/* Informational Side Column: Stay + Ride Benefit */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div
                  style={{
                    background: "white",
                    borderRadius: "16px",
                    padding: "24px",
                    border: "1px solid var(--border)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <span className="badge badge-primary" style={{ marginBottom: "10px" }}>
                    Stay + Ride Integration
                  </span>
                  <h4 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "10px" }}>
                    Direct Transit to Your Accommodation
                  </h4>
                  <p style={{ color: "var(--muted)", fontSize: "14px", lineHeight: "1.6", marginBottom: "16px" }}>
                    Travel Nexus automatically coordinates cab drop-offs directly to the doorstep of your booked homestay or hotel in Manali, Goa, Jaipur, and beyond.
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ color: "var(--primary)", fontWeight: 700 }}>✓</span>
                      <span>Verified mountain and city fleet drivers</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ color: "var(--primary)", fontWeight: 700 }}>✓</span>
                      <span>Fixed, upfront estimates with zero surge traps</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ color: "var(--primary)", fontWeight: 700 }}>✓</span>
                      <span>Real-time WebSocket telemetry and safety monitoring</span>
                    </div>
                  </div>
                </div>

                {/* Quick Re-book from past trips */}
                {pastRides.length > 0 && (
                  <div
                    style={{
                      background: "white",
                      borderRadius: "16px",
                      padding: "24px",
                      border: "1px solid var(--border)",
                      boxShadow: "var(--shadow-sm)",
                    }}
                  >
                    <h4 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "14px" }}>
                      Recent Destinations
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {pastRides.slice(0, 3).map((r) => (
                        <div
                          key={r._id}
                          style={{
                            padding: "10px",
                            borderRadius: "8px",
                            background: "var(--bg-page)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontSize: "13px",
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600 }}>{r.dropoffLocation}</div>
                            <small style={{ color: "var(--muted)" }}>From: {r.pickupLocation}</small>
                          </div>
                          <button
                            type="button"
                            className="cat-pill"
                            style={{ fontSize: "11px", padding: "4px 8px" }}
                            onClick={() => {
                              setPrefilledDropoff(r.dropoffLocation);
                              showToast(`Destination set to ${r.dropoffLocation}`);
                            }}
                          >
                            Reuse ➔
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW 3: TRIP HISTORY */}
          {selectedView === "history" && (
            <div>
              {/* History Filters */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
                {(["all", "COMPLETED", "CANCELLED"] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setHistoryFilter(filter)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: 600,
                      background: historyFilter === filter ? "var(--dark)" : "white",
                      color: historyFilter === filter ? "white" : "var(--muted)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {filter === "all" ? "All Trips" : filter === "COMPLETED" ? "Completed ✓" : "Cancelled ✕"}
                  </button>
                ))}
              </div>

              {filteredPastRides.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "60px 20px",
                    background: "white",
                    borderRadius: "16px",
                    border: "1px dashed var(--border)",
                  }}
                >
                  <div style={{ fontSize: "40px", marginBottom: "12px" }}>📋</div>
                  <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "6px" }}>
                    No trips match this filter
                  </h3>
                  <p style={{ color: "var(--muted)" }}>
                    You can book a new ride any time with instant confirmation.
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {filteredPastRides.map((ride) => (
                    <div
                      key={ride._id}
                      style={{
                        background: "white",
                        borderRadius: "14px",
                        padding: "20px",
                        border: "1px solid var(--border)",
                        boxShadow: "var(--shadow-sm)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "14px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                        <div
                          style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "10px",
                            background: "var(--bg-page)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "22px",
                          }}
                        >
                          🚕
                        </div>
                        <div>
                          <div style={{ fontSize: "16px", fontWeight: 700 }}>
                            {ride.pickupLocation} &rarr; {ride.dropoffLocation}
                          </div>
                          <div style={{ fontSize: "13px", color: "var(--muted)", marginTop: "4px" }}>
                            Fare: <strong style={{ color: "var(--primary)" }}>₹{ride.fare}</strong>
                            {ride.driver && (
                              <span style={{ marginLeft: "12px" }}>
                                &bull; Driver: <strong>{ride.driver.name}</strong>
                              </span>
                            )}
                          </div>
                          <small style={{ color: "var(--light-muted)", display: "block", marginTop: "2px" }}>
                            Trip ID: {ride._id}
                          </small>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        {getStatusBadge(ride.status)}
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ padding: "6px 12px", fontSize: "12px" }}
                          onClick={() => {
                            setPrefilledDropoff(ride.dropoffLocation);
                            setSelectedView("book");
                            showToast(`Rebooking trip to ${ride.dropoffLocation}`);
                          }}
                        >
                          Book Again ➔
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* DRIVER CONSOLE INTERFACE                                  */}
      {/* ========================================================= */}
      {currentUser.role === "DRIVER" && (
        <div>
          <div className="section-header">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="badge badge-primary">Nexus Driver Partner</span>
                <span className="badge badge-success">● On Duty</span>
              </div>
              <h1 className="section-title">Driver Console &amp; GPS Dispatch</h1>
              <p className="section-subtitle">
                Accept requested trips, guide passengers to destinations, and manage trip lifecycles in real time.
              </p>
            </div>
          </div>

          <div className="rides-layout">
            {/* Left: Available Inbound Requests */}
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "14px" }}>
                Available Ride Requests ({availableRides.length})
              </h3>

              {availableRides.length === 0 ? (
                <div
                  style={{
                    padding: "36px",
                    textAlign: "center",
                    background: "white",
                    borderRadius: "14px",
                    border: "1px dashed var(--border)",
                  }}
                >
                  <div style={{ fontSize: "36px", marginBottom: "8px" }}>📡</div>
                  <h4 style={{ fontSize: "16px", fontWeight: 700 }}>No requests in radar</h4>
                  <p style={{ color: "var(--muted)", fontSize: "13px", marginTop: "4px" }}>
                    New passenger requests will appear automatically via WebSockets.
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {availableRides.map((ride) => (
                    <div
                      key={ride._id}
                      style={{
                        background: "white",
                        borderRadius: "14px",
                        padding: "18px",
                        border: "1px solid var(--border)",
                        boxShadow: "var(--shadow-sm)",
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: "16px", marginBottom: "6px" }}>
                        {ride.pickupLocation} &rarr; {ride.dropoffLocation}
                      </div>
                      <div style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "14px" }}>
                        Fare: <strong style={{ color: "var(--primary)", fontSize: "15px" }}>₹{ride.fare}</strong> &bull;
                        Passenger: <strong>{ride.customer?.name || "Customer"}</strong>
                      </div>
                      <button
                        type="button"
                        className="btn-accent"
                        style={{ width: "100%", padding: "10px", fontWeight: 700 }}
                        onClick={() => onAcceptRide(ride._id)}
                      >
                        Accept Ride &bull; ₹{ride.fare} 🚕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Assigned Driver Trips */}
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "14px" }}>
                My Assigned Trips ({driverRides.length})
              </h3>

              {driverRides.length === 0 ? (
                <div
                  style={{
                    padding: "36px",
                    textAlign: "center",
                    background: "white",
                    borderRadius: "14px",
                    border: "1px dashed var(--border)",
                  }}
                >
                  <p style={{ color: "var(--muted)" }}>You have no assigned trips in progress.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {driverRides.map((ride) => {
                    const isLive = ["ACCEPTED", "DRIVER_ARRIVING", "IN_PROGRESS"].includes(ride.status);

                    return (
                      <div
                        key={ride._id}
                        style={{
                          background: "white",
                          borderRadius: "14px",
                          padding: "20px",
                          border: isLive ? "2px solid var(--primary)" : "1px solid var(--border)",
                          boxShadow: "var(--shadow-sm)",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                          <span style={{ fontWeight: 700, fontSize: "16px" }}>
                            {ride.pickupLocation} &rarr; {ride.dropoffLocation}
                          </span>
                          {getStatusBadge(ride.status)}
                        </div>

                        <div style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "14px" }}>
                          Fare: <strong>₹{ride.fare}</strong> | Passenger: {ride.customer?.name} ({ride.customer?.email})
                        </div>

                        {/* Interactive HUD route map for active trip */}
                        {isLive && (
                          <div style={{ marginBottom: "16px" }}>
                            <RideRouteMap ride={ride} />
                          </div>
                        )}

                        {/* Lifecycle transition controls */}
                        <div>
                          {ride.status === "ACCEPTED" && (
                            <button
                              type="button"
                              className="btn-accent"
                              style={{ width: "100%", padding: "12px", fontWeight: 700 }}
                              onClick={() => onUpdateStatus(ride._id, "DRIVER_ARRIVING")}
                            >
                              Arrived at Pickup Location 📍
                            </button>
                          )}
                          {ride.status === "DRIVER_ARRIVING" && (
                            <button
                              type="button"
                              className="btn-primary"
                              style={{ width: "100%", padding: "12px", fontWeight: 700 }}
                              onClick={() => onUpdateStatus(ride._id, "IN_PROGRESS")}
                            >
                              Passenger Boarded &bull; Start Trip 🚗
                            </button>
                          )}
                          {ride.status === "IN_PROGRESS" && (
                            <button
                              type="button"
                              className="btn-primary"
                              style={{ width: "100%", background: "#059669", padding: "12px", fontWeight: 700 }}
                              onClick={() => onUpdateStatus(ride._id, "COMPLETED")}
                            >
                              Destination Reached &bull; Complete Trip ✅
                            </button>
                          )}
                          {ride.status === "COMPLETED" && (
                            <div style={{ textAlign: "center", color: "#059669", fontWeight: 700, padding: "8px" }}>
                              ✓ Trip Completed Successfully
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: CONTACT DRIVER                                   */}
      {/* ========================================================= */}
      {showContactModal && activeRide?.driver && (
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
          onClick={() => setShowContactModal(false)}
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
              <div style={{ fontSize: "48px", marginBottom: "8px" }}>👨‍✈️</div>
              <h3 style={{ fontSize: "20px", fontWeight: 800 }}>Contact Driver</h3>
              <p style={{ color: "var(--muted)", fontSize: "14px" }}>
                {activeRide.driver.name} &bull; Nexus Partner Driver
              </p>
            </div>

            <div
              style={{
                background: "var(--bg-page)",
                padding: "14px",
                borderRadius: "10px",
                marginBottom: "20px",
                fontSize: "14px",
              }}
            >
              <div style={{ marginBottom: "6px" }}>
                <span style={{ color: "var(--muted)" }}>Masked Phone: </span>
                <strong>+91 98765 43210</strong>
              </div>
              <div>
                <span style={{ color: "var(--muted)" }}>Email: </span>
                <strong>{activeRide.driver.email}</strong>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                type="button"
                className="btn-primary"
                style={{ width: "100%", padding: "12px" }}
                onClick={() => {
                  showToast("Connecting secure masked call to driver...");
                  setShowContactModal(false);
                }}
              >
                📞 Dial Driver Directly
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ width: "100%", padding: "10px" }}
                onClick={() => setShowContactModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: EMERGENCY SOS ASSIST                             */}
      {/* ========================================================= */}
      {showSosModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
          onClick={() => setShowSosModal(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "28px",
              maxWidth: "460px",
              width: "100%",
              boxShadow: "var(--shadow-xl)",
              border: "2px solid #ef4444",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: "center", marginBottom: "18px" }}>
              <div style={{ fontSize: "48px", marginBottom: "8px" }}>🚨</div>
              <h3 style={{ fontSize: "22px", fontWeight: 800, color: "#dc2626" }}>
                Emergency Safety &amp; SOS
              </h3>
              <p style={{ color: "var(--muted)", fontSize: "14px" }}>
                Your safety is our top priority. Choose an emergency action below:
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
              <a
                href="tel:112"
                className="btn-primary"
                style={{
                  background: "#dc2626",
                  padding: "12px",
                  justifyContent: "center",
                  fontSize: "15px",
                }}
              >
                🚓 Call Police Helpline (112)
              </a>

              <a
                href="tel:1091"
                className="btn-secondary"
                style={{
                  padding: "12px",
                  justifyContent: "center",
                  fontSize: "14px",
                  color: "#dc2626",
                }}
              >
                🛡️ Women Safety Helpline (1091)
              </a>

              <button
                type="button"
                className="btn-secondary"
                style={{ padding: "12px", justifyContent: "center", fontSize: "14px" }}
                onClick={() => {
                  showToast("Live telemetry & GPS coordinates shared with Nexus 24/7 Security Desk.");
                  setShowSosModal(false);
                }}
              >
                🛰️ Notify Travel Nexus 24/7 Safety Desk
              </button>
            </div>

            <button
              type="button"
              className="btn-secondary"
              style={{ width: "100%" }}
              onClick={() => setShowSosModal(false)}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rides;
