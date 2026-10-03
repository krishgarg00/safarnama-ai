import { useState } from "react";
import type { FormEvent } from "react";
import { createRide } from "../api/rides";

interface CreateRideProps {
  onRideCreated: () => void;
  initialDropoff?: string;
}

function CreateRide({ onRideCreated, initialDropoff }: CreateRideProps) {
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState(initialDropoff || "");
  const [fare, setFare] = useState("450");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const result = await createRide({
        pickupLocation,
        dropoffLocation,
        fare: Number(fare),
      });

      console.log("Ride created:", result);

      setMessage("Ride requested successfully 🚗");
      onRideCreated();

      setPickupLocation("");
      setDropoffLocation("");
      setFare("450");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create ride"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: 800 }}>Book a Cab to Destination</h2>
        <p style={{ color: "var(--muted)", fontSize: "14px", marginTop: "4px" }}>
          Enter your pickup spot and destination. Available drivers will be notified in real-time.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Pickup Location</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Airport, Railway Station, or Current Location"
            value={pickupLocation}
            onChange={(event) => setPickupLocation(event.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Drop-off Location / Stay</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Mountain View Homestay, Manali"
            value={dropoffLocation}
            onChange={(event) => setDropoffLocation(event.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Offer Fare (₹)</label>
          <input
            type="number"
            min="0"
            className="form-input"
            placeholder="450"
            value={fare}
            onChange={(event) => setFare(event.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="btn-accent"
          style={{ width: "100%", padding: "12px", marginTop: "10px" }}
          disabled={loading}
        >
          {loading ? "Requesting Driver..." : "Request Ride 🚗"}
        </button>
      </form>

      {message && (
        <div style={{ marginTop: "14px", padding: "10px", background: "#ecfdf5", color: "#059669", borderRadius: "8px", fontSize: "14px", textAlign: "center" }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{ marginTop: "14px", padding: "10px", background: "#fef2f2", color: "#dc2626", borderRadius: "8px", fontSize: "14px", textAlign: "center" }}>
          {error}
        </div>
      )}
    </div>
  );
}

export default CreateRide;