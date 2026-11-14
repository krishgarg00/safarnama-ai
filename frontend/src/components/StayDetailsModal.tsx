import React, { useState, useMemo } from "react";
import type { StayItem } from "../api/stays";

interface StayDetailsModalProps {
  stay: StayItem | null;
  onClose: () => void;
  onProceedToBooking: (bookingData: {
    stay: StayItem;
    checkIn: string;
    checkOut: string;
    guests: number;
    nights: number;
    stayPrice: number;
    taxes: number;
    totalPrice: number;
  }) => void;
  onRideToStay: (stay: StayItem) => void;
}

export const StayDetailsModal: React.FC<StayDetailsModalProps> = ({
  stay,
  onClose,
  onProceedToBooking,
  onRideToStay,
}) => {
  // Dates: default to tomorrow and 3 days from now
  const todayStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }, []);

  const defaultCheckoutStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toISOString().split("T")[0];
  }, []);

  const [checkIn, setCheckIn] = useState(todayStr);
  const [checkOut, setCheckOut] = useState(defaultCheckoutStr);
  const [guests, setGuests] = useState(1);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Calculate nights
  const nights = useMemo(() => {
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [checkIn, checkOut]);

  if (!stay) return null;

  const images =
    stay.images && stay.images.length > 0
      ? stay.images
      : ["https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"];

  const stayPrice = nights * stay.pricePerNight;
  const taxes = Math.round(stayPrice * 0.12); // 12% GST
  const totalPrice = stayPrice + taxes;

  const handleBook = () => {
    if (nights <= 0) {
      alert("Please select a check-out date after check-in date.");
      return;
    }
    onProceedToBooking({
      stay,
      checkIn,
      checkOut,
      guests,
      nights,
      stayPrice,
      taxes,
      totalPrice,
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.7)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
        overflowY: "auto",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          maxWidth: "880px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
          boxShadow: "var(--shadow-xl)",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "rgba(0,0,0,0.4)",
            color: "white",
            border: "none",
            borderRadius: "50%",
            width: "36px",
            height: "36px",
            fontSize: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 10,
          }}
        >
          ✕
        </button>

        {/* Photo Gallery Header */}
        <div style={{ position: "relative", height: "340px", backgroundColor: "#0f172a" }}>
          <img
            src={images[activeImageIdx]}
            alt={stay.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "16px",
              left: "20px",
              display: "flex",
              gap: "8px",
            }}
          >
            <span className="stay-city-badge">📍 {stay.city}, {stay.state}</span>
            <span className="stay-rating-badge">★ 4.9 (48 reviews)</span>
          </div>
        </div>

        {/* Thumbnail Selector */}
        {images.length > 1 && (
          <div style={{ display: "flex", gap: "10px", padding: "12px 24px", background: "var(--bg-page)", borderBottom: "1px solid var(--border)" }}>
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt=""
                style={{
                  width: "60px",
                  height: "44px",
                  borderRadius: "6px",
                  objectFit: "cover",
                  cursor: "pointer",
                  border: activeImageIdx === i ? "2px solid var(--primary)" : "1px solid var(--border)",
                }}
                onClick={() => setActiveImageIdx(i)}
              />
            ))}
          </div>
        )}

        {/* Modal Content Grid */}
        <div style={{ padding: "28px", display: "grid", gridTemplateColumns: "1.6fr 1.2fr", gap: "32px" }}>
          {/* Left Details Column */}
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "8px", color: "var(--dark)" }}>
              {stay.title}
            </h2>
            <p style={{ color: "var(--muted)", fontSize: "14px", marginBottom: "16px" }}>
              📍 {stay.address} &bull; Up to <strong>{stay.maxGuests} guests</strong>
            </p>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px", marginBottom: "20px" }}>
              <h4 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>About this property</h4>
              <p style={{ color: "var(--dark-muted)", fontSize: "14px", lineHeight: "1.6" }}>
                {stay.description}
              </p>
            </div>

            {/* Amenities */}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px", marginBottom: "20px" }}>
              <h4 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "12px" }}>What this place offers</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {stay.amenities && stay.amenities.length > 0 ? (
                  stay.amenities.map((amenity, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "var(--dark-muted)" }}>
                      <span style={{ color: "var(--primary)", fontWeight: "bold" }}>✓</span>
                      <span>{amenity}</span>
                    </div>
                  ))
                ) : (
                  <p style={{ color: "var(--muted)", fontSize: "13px" }}>Free WiFi, Parking, Mountain View</p>
                )}
              </div>
            </div>

            {/* Host info */}
            {stay.host && (
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
                <h4 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "6px" }}>Hosted by</h4>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "var(--primary)" }}>
                    🏠
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "14px" }}>{stay.host.name}</div>
                    <div style={{ color: "var(--muted)", fontSize: "12px" }}>{stay.host.email}</div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Review Summary Synthesis */}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "16px" }}>🤖</span>
                  <h4 style={{ fontSize: "15px", fontWeight: 700 }}>AI Review Synthesis</h4>
                </div>
                <span className="badge badge-success">96% Positive Sentiment</span>
              </div>
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--dark-muted)",
                  lineHeight: "1.5",
                  background: "var(--bg-page)",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                }}
              >
                Guests consistently praise this stay for its sparkling cleanliness, authentic wooden architecture, superfast remote-work WiFi, and seamless Travel Nexus cab drop-offs directly to the entrance.
              </p>
            </div>
          </div>

          {/* Right Booking Card Column */}
          <div
            style={{
              background: "var(--bg-page)",
              padding: "24px",
              borderRadius: "16px",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-sm)",
              height: "fit-content",
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "16px" }}>
              <div>
                <span style={{ fontSize: "26px", fontWeight: 800, color: "var(--primary)" }}>
                  ₹{stay.pricePerNight}
                </span>
                <span style={{ color: "var(--muted)", fontSize: "14px" }}> / night</span>
              </div>
              <span className="badge badge-success">Available</span>
            </div>

            {/* Date Pickers */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: "12px" }}>Check-in Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={checkIn}
                  min={todayStr}
                  onChange={(e) => setCheckIn(e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: "12px" }}>Check-out Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={checkOut}
                  min={checkIn}
                  onChange={(e) => setCheckOut(e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: "12px" }}>Guests</label>
                <select
                  className="form-input"
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  style={{ width: "100%" }}
                >
                  {Array.from({ length: stay.maxGuests || 4 }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? "Guest" : "Guests"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Calculation Breakdown */}
            {nights > 0 ? (
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "14px", marginBottom: "18px", fontSize: "13px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", color: "var(--dark-muted)" }}>
                  <span>₹{stay.pricePerNight} &times; {nights} {nights === 1 ? "night" : "nights"}</span>
                  <span>₹{stayPrice}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", color: "var(--dark-muted)" }}>
                  <span>Taxes &amp; GST (12%)</span>
                  <span>₹{taxes}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "16px", color: "var(--dark)", borderTop: "1px dashed var(--border)", paddingTop: "8px" }}>
                  <span>Total Amount</span>
                  <span style={{ color: "var(--primary)" }}>₹{totalPrice}</span>
                </div>
              </div>
            ) : (
              <p style={{ color: "#dc2626", fontSize: "12px", marginBottom: "14px" }}>
                Select valid dates to calculate total price.
              </p>
            )}

            <button
              className="btn-accent"
              style={{ width: "100%", padding: "12px", fontSize: "15px" }}
              onClick={handleBook}
            >
              Reserve &amp; Book Stay 🏨
            </button>

            <button
              className="btn-secondary"
              style={{ width: "100%", marginTop: "10px", padding: "10px", fontSize: "13px" }}
              onClick={() => {
                onClose();
                onRideToStay(stay);
              }}
            >
              🚗 Coordinate Ride to Here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StayDetailsModal;
