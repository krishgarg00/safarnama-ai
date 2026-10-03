import React, { useEffect, useState } from "react";
import { getStays, type StayItem } from "../api/stays";
import StayCard from "../components/StayCard";

interface StaysProps {
  onRideToStay: (stay: StayItem) => void;
  onBookStay: (stay: StayItem) => void;
}

export const Stays: React.FC<StaysProps> = ({ onRideToStay, onBookStay }) => {
  const [stays, setStays] = useState<StayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState("");
  const [maxPriceFilter, setMaxPriceFilter] = useState<number | "">("");

  const fetchStaysData = async () => {
    try {
      setLoading(true);
      const data = await getStays({
        city: cityFilter || undefined,
        maxPrice: typeof maxPriceFilter === "number" ? maxPriceFilter : undefined,
      });
      setStays(data.stays || []);
    } catch (err) {
      console.error("Failed to load stays:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaysData();
  }, [cityFilter, maxPriceFilter]);

  return (
    <div className="container" style={{ padding: "40px 20px" }}>
      <div className="section-header">
        <div>
          <h1 className="section-title">Explore All Accommodations</h1>
          <p className="section-subtitle">
            Find homestays, hotels, resorts, and villas with direct cab connectivity.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div
        style={{
          background: "white",
          padding: "18px 24px",
          borderRadius: "12px",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-sm)",
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: "32px",
        }}
      >
        <div style={{ flex: "1 1 200px" }}>
          <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: "4px" }}>
            City / Location
          </label>
          <input
            type="text"
            className="form-input"
            style={{ width: "100%" }}
            placeholder="e.g. Manali, Goa, Delhi..."
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
          />
        </div>

        <div style={{ flex: "1 1 180px" }}>
          <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: "4px" }}>
            Max Price / Night (₹)
          </label>
          <input
            type="number"
            className="form-input"
            style={{ width: "100%" }}
            placeholder="e.g. 3500"
            value={maxPriceFilter}
            onChange={(e) => setMaxPriceFilter(e.target.value ? Number(e.target.value) : "")}
          />
        </div>

        <div style={{ display: "flex", gap: "8px", alignSelf: "flex-end" }}>
          <button
            className="btn-secondary"
            onClick={() => {
              setCityFilter("");
              setMaxPriceFilter("");
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "48px", color: "var(--muted)" }}>
          Loading stays...
        </div>
      ) : stays.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 20px",
            background: "white",
            borderRadius: "12px",
            border: "1px dashed var(--border)",
          }}
        >
          <h3>No stays match your filters</h3>
          <p style={{ color: "var(--muted)", marginTop: "6px" }}>
            Try clearing the filters or searching for another destination.
          </p>
        </div>
      ) : (
        <div className="stays-grid">
          {stays.map((stay) => (
            <StayCard
              key={stay._id}
              stay={stay}
              onBookClick={onBookStay}
              onRideToStayClick={onRideToStay}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Stays;
