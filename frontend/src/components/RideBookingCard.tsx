import React, { useState } from "react";
import { createRide } from "../api/rides";

interface RideBookingCardProps {
  onRideCreated: () => void;
  initialDestination?: string;
}

interface VehicleOption {
  id: "mini" | "sedan" | "xl";
  name: string;
  category: string;
  icon: string;
  capacity: string;
  baseFare: number;
  eta: string;
  desc: string;
}

const VEHICLES: VehicleOption[] = [
  {
    id: "mini",
    name: "Nexus Go",
    category: "Compact Hatchback",
    icon: "🚗",
    capacity: "4 Seats",
    baseFare: 350,
    eta: "3 mins",
    desc: "Fastest pickup for daily city and short transfers",
  },
  {
    id: "sedan",
    name: "Nexus Comfort",
    category: "Premium Sedan",
    icon: "🚙",
    capacity: "4 Seats",
    baseFare: 480,
    eta: "5 mins",
    desc: "Spacious trunk, air-conditioned comfortable ride",
  },
  {
    id: "xl",
    name: "Nexus XL",
    category: "6-Seater SUV",
    icon: "🚐",
    capacity: "6 Seats",
    baseFare: 720,
    eta: "8 mins",
    desc: "Perfect for group travel, mountains, and heavy luggage",
  },
];

const QUICK_PICKUPS = [
  "✈️ Airport Terminal",
  "🚆 Railway Station",
  "🏙️ City Center",
  "📍 Current Stay / Hotel",
];

const QUICK_DROPOFFS = [
  "🏔️ Mall Road",
  "🏖️ Candolim Beach",
  "🏰 Amber Fort",
  "📍 Chitkara University",
];

export const RideBookingCard: React.FC<RideBookingCardProps> = ({
  onRideCreated,
  initialDestination,
}) => {
  const [pickup, setPickup] = useState("Delhi Airport Terminal 3");
  const [dropoff, setDropoff] = useState(initialDestination || "Old Manali Road, Manali");
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleOption["id"]>("sedan");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const activeVehicle = VEHICLES.find((v) => v.id === selectedVehicle) || VEHICLES[1];
  const finalFare = activeVehicle.baseFare;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await createRide({
        pickupLocation: pickup,
        dropoffLocation: dropoff,
        fare: finalFare,
      });
      onRideCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to request ride");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "white",
        borderRadius: "16px",
        border: "1px solid var(--border)",
        padding: "28px",
        boxShadow: "var(--shadow-md)",
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <span className="badge badge-primary" style={{ marginBottom: "6px" }}>
          🚗 Travel Nexus On-Demand Rides
        </span>
        <h3 style={{ fontSize: "22px", fontWeight: 800 }}>Book a Cab to Anywhere</h3>
        <p style={{ color: "var(--muted)", fontSize: "14px" }}>
          Doorstep cab pickup with live GPS tracking, verified drivers, and transparent fares.
        </p>
      </div>

      {error && (
        <div style={{ background: "#fef2f2", color: "#dc2626", padding: "10px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Pickup Input */}
        <div className="form-group">
          <label className="form-label">Pickup Location</label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: "12px", top: "11px", color: "#0d9488" }}>📍</span>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: "36px", width: "100%" }}
              placeholder="Enter pickup spot, airport, station..."
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              required
            />
          </div>

          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
            {QUICK_PICKUPS.map((p) => (
              <button
                type="button"
                key={p}
                className="cat-pill"
                style={{ fontSize: "11px", padding: "3px 8px" }}
                onClick={() => setPickup(p.replace(/^[^\s]+\s/, ""))}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Dropoff Input */}
        <div className="form-group" style={{ marginTop: "14px" }}>
          <label className="form-label">Drop-off Destination</label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: "12px", top: "11px", color: "#f97316" }}>🏁</span>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: "36px", width: "100%" }}
              placeholder="Enter destination, homestay, hotel..."
              value={dropoff}
              onChange={(e) => setDropoff(e.target.value)}
              required
            />
          </div>

          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
            {QUICK_DROPOFFS.map((d) => (
              <button
                type="button"
                key={d}
                className="cat-pill"
                style={{ fontSize: "11px", padding: "3px 8px" }}
                onClick={() => setDropoff(d.replace(/^[^\s]+\s/, ""))}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Vehicle Selection Grid */}
        <div style={{ marginTop: "20px", marginBottom: "16px" }}>
          <label className="form-label" style={{ marginBottom: "8px" }}>Select Vehicle Class</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
            {VEHICLES.map((v) => (
              <div
                key={v.id}
                onClick={() => setSelectedVehicle(v.id)}
                style={{
                  border: selectedVehicle === v.id ? "2px solid var(--primary)" : "1px solid var(--border)",
                  borderRadius: "10px",
                  padding: "12px 10px",
                  cursor: "pointer",
                  background: selectedVehicle === v.id ? "var(--primary-light)" : "white",
                  transition: "all 0.2s ease",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "28px", marginBottom: "4px" }}>{v.icon}</div>
                <div style={{ fontSize: "14px", fontWeight: 700 }}>{v.name}</div>
                <div style={{ fontSize: "11px", color: "var(--muted)" }}>{v.capacity}</div>
                <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--primary)", marginTop: "4px" }}>
                  ₹{v.baseFare}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fare & Trip Estimates Box */}
        <div
          style={{
            background: "var(--bg-page)",
            padding: "14px",
            borderRadius: "10px",
            border: "1px solid var(--border)",
            fontSize: "13px",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", color: "var(--dark-muted)" }}>
            <span>Estimated Distance &amp; Duration:</span>
            <strong>~18.4 km &bull; {activeVehicle.eta} away</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px dashed var(--border)", paddingTop: "8px", marginTop: "6px" }}>
            <div>
              <span style={{ fontWeight: 700 }}>Total Fare:</span>
              <span style={{ fontSize: "11px", color: "var(--muted)", marginLeft: "4px" }}>(includes GST &amp; tolls)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "20px", fontWeight: 800, color: "var(--primary)" }}>
                ₹{finalFare}
              </span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="btn-accent"
          style={{ width: "100%", padding: "14px", fontSize: "16px", fontWeight: 700 }}
          disabled={loading}
        >
          {loading ? "Matching with nearby drivers..." : `Request ${activeVehicle.name} (₹${finalFare}) 🚗`}
        </button>
      </form>
    </div>
  );
};

export default RideBookingCard;
