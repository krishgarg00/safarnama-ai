import React, { useState } from "react";
import type { LoggedInUser } from "./Login";
import type { RideItem } from "../api/rides";
import CreateRide from "./CreateRide";

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
  const [showCreateForm, setShowCreateForm] = useState(Boolean(prefillDestination));

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
      <div className="container" style={{ padding: "64px 20px", textAlign: "center", maxWidth: "600px" }}>
        <div style={{ fontSize: "56px", marginBottom: "16px" }}>🚗</div>
        <h2 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "12px" }}>
          On-Demand Real-Time Rides
        </h2>
        <p style={{ color: "var(--muted)", marginBottom: "24px", lineHeight: "1.6" }}>
          Coordinate cab transportation directly to or from your stays. Track driver acceptance, arrival, and trip completion live via WebSockets.
        </p>
        <button className="btn-primary" onClick={onOpenAuth} style={{ padding: "12px 28px" }}>
          Sign In to Book or Drive
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "40px 20px" }}>
      {/* Live Ride Update Notification */}
      {rideUpdate && (
        <div className="live-alert-banner">
          <div className="live-alert-header">
            <span className="live-alert-title">
              <span>🚗</span> Live Ride Update
            </span>
            <span className="badge badge-success">{rideUpdate.status}</span>
          </div>
          <div className="live-alert-msg">{rideUpdate.message}</div>
          <small style={{ color: "#065f46", display: "block", marginTop: "4px" }}>
            Ride ID: <code>{rideUpdate.rideId}</code>
          </small>
        </div>
      )}

      {/* Customer Mode */}
      {currentUser.role === "CUSTOMER" && (
        <div>
          <div className="section-header">
            <div>
              <h1 className="section-title">My Rides &amp; Transportation</h1>
              <p className="section-subtitle">
                Book cabs to your hotels or destinations with instant driver matching.
              </p>
            </div>
            <button
              className="btn-accent"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? "← View My Rides" : "Book a New Ride 🚗"}
            </button>
          </div>

          {rideError && (
            <div style={{ color: "#dc2626", background: "#fef2f2", padding: "12px", borderRadius: "8px", marginBottom: "16px" }}>
              {rideError}
            </div>
          )}

          {showCreateForm ? (
            <div style={{ maxWidth: "560px", margin: "0 auto", background: "white", padding: "28px", borderRadius: "12px", border: "1px solid var(--border)", boxShadow: "var(--shadow-md)" }}>
              {prefillDestination && (
                <div style={{ background: "var(--primary-light)", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px", color: "var(--primary)" }}>
                  🚗 Pre-filled destination for your stay: <strong>{prefillDestination}</strong>
                </div>
              )}
              <CreateRide
                onRideCreated={() => {
                  onRideCreated();
                  setShowCreateForm(false);
                  if (onClearPrefill) onClearPrefill();
                }}
              />
            </div>
          ) : (
            <div>
              {rides.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px", background: "white", borderRadius: "12px", border: "1px dashed var(--border)" }}>
                  <div style={{ fontSize: "40px", marginBottom: "12px" }}>🚕</div>
                  <h3 style={{ fontSize: "18px", marginBottom: "6px" }}>No rides requested yet</h3>
                  <p style={{ color: "var(--muted)", marginBottom: "16px" }}>
                    Need a cab from the airport, railway station, or to your homestay?
                  </p>
                  <button className="btn-primary" onClick={() => setShowCreateForm(true)}>
                    Request Your First Ride
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {rides.map((ride) => (
                    <div key={ride._id} className="ride-card">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                        <div>
                          <div style={{ fontSize: "17px", fontWeight: 700, color: "var(--dark)" }}>
                            {ride.pickupLocation} &rarr; {ride.dropoffLocation}
                          </div>
                          <div style={{ fontSize: "13px", color: "var(--muted)", marginTop: "4px" }}>
                            Fare: <strong style={{ color: "var(--primary)", fontSize: "15px" }}>₹{ride.fare}</strong>
                            {ride.driver && (
                              <span style={{ marginLeft: "14px" }}>
                                👨‍✈️ Driver: <strong>{ride.driver.name}</strong> ({ride.driver.email})
                              </span>
                            )}
                          </div>
                        </div>
                        {getStatusBadge(ride.status)}
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "10px", marginTop: "10px" }}>
                        <small style={{ color: "var(--light-muted)" }}>ID: {ride._id}</small>
                        {["REQUESTED", "ACCEPTED", "DRIVER_ARRIVING"].includes(ride.status) && (
                          <button
                            className="btn-secondary"
                            style={{ color: "#dc2626", borderColor: "#fecaca", padding: "4px 12px", fontSize: "12px" }}
                            onClick={() => onCancelRide(ride._id)}
                          >
                            Cancel Ride
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Driver Mode */}
      {currentUser.role === "DRIVER" && (
        <div>
          <div className="section-header">
            <div>
              <h1 className="section-title">Driver Console 🚗</h1>
              <p className="section-subtitle">
                Accept requested trips and provide real-time updates to waiting passengers.
              </p>
            </div>
          </div>

          {rideError && (
            <div style={{ color: "#dc2626", background: "#fef2f2", padding: "12px", borderRadius: "8px", marginBottom: "16px" }}>
              {rideError}
            </div>
          )}

          <div className="rides-layout">
            {/* Available rides to accept */}
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "14px" }}>
                Available Ride Requests ({availableRides.length})
              </h3>

              {availableRides.length === 0 ? (
                <div style={{ padding: "32px", textAlign: "center", background: "white", borderRadius: "12px", border: "1px dashed var(--border)" }}>
                  <p style={{ color: "var(--muted)" }}>No requested rides available right now.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {availableRides.map((ride) => (
                    <div key={ride._id} className="ride-card">
                      <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "6px" }}>
                        {ride.pickupLocation} &rarr; {ride.dropoffLocation}
                      </div>
                      <div style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "12px" }}>
                        Fare: <strong style={{ color: "var(--primary)" }}>₹{ride.fare}</strong> | Customer: {ride.customer?.name || "Passenger"}
                      </div>
                      <button
                        className="btn-primary"
                        style={{ width: "100%", padding: "8px" }}
                        onClick={() => onAcceptRide(ride._id)}
                      >
                        Accept Ride 🚕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* My Active Assigned Rides */}
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "14px" }}>
                My Assigned Rides ({driverRides.length})
              </h3>

              {driverRides.length === 0 ? (
                <div style={{ padding: "32px", textAlign: "center", background: "white", borderRadius: "12px", border: "1px dashed var(--border)" }}>
                  <p style={{ color: "var(--muted)" }}>You have not accepted any rides yet.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {driverRides.map((ride) => (
                    <div key={ride._id} className="ride-card">
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span style={{ fontWeight: 700, fontSize: "15px" }}>
                          {ride.pickupLocation} &rarr; {ride.dropoffLocation}
                        </span>
                        {getStatusBadge(ride.status)}
                      </div>

                      <div style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "12px" }}>
                        Fare: <strong>₹{ride.fare}</strong> | Passenger: {ride.customer?.name} ({ride.customer?.email})
                      </div>

                      <div>
                        {ride.status === "ACCEPTED" && (
                          <button
                            className="btn-accent"
                            style={{ width: "100%" }}
                            onClick={() => onUpdateStatus(ride._id, "DRIVER_ARRIVING")}
                          >
                            Mark Driver Arriving 📍
                          </button>
                        )}
                        {ride.status === "DRIVER_ARRIVING" && (
                          <button
                            className="btn-primary"
                            style={{ width: "100%" }}
                            onClick={() => onUpdateStatus(ride._id, "IN_PROGRESS")}
                          >
                            Start Ride (In Progress) 🚗
                          </button>
                        )}
                        {ride.status === "IN_PROGRESS" && (
                          <button
                            className="btn-primary"
                            style={{ width: "100%", background: "#059669" }}
                            onClick={() => onUpdateStatus(ride._id, "COMPLETED")}
                          >
                            Complete Ride ✅
                          </button>
                        )}
                        {ride.status === "COMPLETED" && (
                          <div style={{ textAlign: "center", color: "#059669", fontWeight: 700 }}>
                            ✓ Trip Completed Successfully
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rides;
