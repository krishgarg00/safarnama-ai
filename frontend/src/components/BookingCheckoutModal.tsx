import React, { useState } from "react";
import type { StayItem } from "../api/stays";
import { createBooking, type BookingItem } from "../api/bookings";

interface BookingCheckoutData {
  stay: StayItem;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  stayPrice: number;
  taxes: number;
  totalPrice: number;
}

interface BookingCheckoutModalProps {
  data: BookingCheckoutData | null;
  onClose: () => void;
  onBookingConfirmed: (booking: BookingItem) => void;
  onCoordinateRide: (stay: StayItem) => void;
}

export const BookingCheckoutModal: React.FC<BookingCheckoutModalProps> = ({
  data,
  onClose,
  onBookingConfirmed,
  onCoordinateRide,
}) => {
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [loading, setLoading] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<BookingItem | null>(null);
  const [error, setError] = useState("");

  if (!data) return null;

  const handleConfirmPayment = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await createBooking({
        stay: data.stay._id,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        guests: data.guests,
      });

      setConfirmedBooking(res.booking);
      onBookingConfirmed(res.booking);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create booking"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1100,
        padding: "20px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !confirmedBooking) onClose();
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          maxWidth: "540px",
          width: "100%",
          padding: "32px",
          boxShadow: "var(--shadow-xl)",
          position: "relative",
        }}
      >
        {!confirmedBooking && (
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              background: "transparent",
              border: "none",
              fontSize: "18px",
              cursor: "pointer",
              color: "var(--muted)",
            }}
          >
            ✕
          </button>
        )}

        {/* 1. Confirmed Success State */}
        {confirmedBooking ? (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "#ecfdf5",
                color: "#059669",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "32px",
                margin: "0 auto 16px",
              }}
            >
              ✓
            </div>

            <h2 style={{ fontSize: "24px", fontWeight: 800, color: "var(--dark)", marginBottom: "6px" }}>
              Booking Confirmed! 🎉
            </h2>
            <p style={{ color: "var(--muted)", fontSize: "14px", marginBottom: "20px" }}>
              Your reservation at <strong>{data.stay.title}</strong> is confirmed.
            </p>

            <div
              style={{
                background: "var(--bg-page)",
                padding: "16px 20px",
                borderRadius: "12px",
                border: "1px solid var(--border)",
                textAlign: "left",
                fontSize: "14px",
                marginBottom: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div>
                <strong>Booking ID:</strong> <code>{confirmedBooking._id}</code>
              </div>
              <div>
                <strong>Dates:</strong> {data.checkIn} &rarr; {data.checkOut} ({data.nights} nights)
              </div>
              <div>
                <strong>Guests:</strong> {data.guests}
              </div>
              <div>
                <strong>Total Paid:</strong> <strong style={{ color: "var(--primary)" }}>₹{data.totalPrice}</strong>
              </div>
              <div>
                <strong>Status:</strong> <span className="badge badge-success">CONFIRMED</span>
              </div>
            </div>

            {/* Seamless Stay + Ride Integration Callout */}
            <div
              style={{
                background: "#fffbeb",
                border: "1px solid #fde68a",
                padding: "14px",
                borderRadius: "10px",
                marginBottom: "20px",
                fontSize: "13px",
                color: "#b45309",
              }}
            >
              🚗 <strong>Need transportation to this stay?</strong><br />
              Safely coordinate a real-time cab directly to {data.stay.title} now!
            </div>

            <div style={{ display: "flex", gap: "10px", flexDirection: "column" }}>
              <button
                className="btn-accent"
                style={{ padding: "12px", fontSize: "15px" }}
                onClick={() => {
                  onClose();
                  onCoordinateRide(data.stay);
                }}
              >
                🚗 Coordinate Cab to Stay
              </button>

              <button
                className="btn-secondary"
                style={{ padding: "10px" }}
                onClick={onClose}
              >
                Done / Back to Exploring
              </button>
            </div>
          </div>
        ) : (
          /* 2. Review & Checkout State */
          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "4px" }}>
              Review &amp; Complete Booking
            </h2>
            <p style={{ color: "var(--muted)", fontSize: "13px", marginBottom: "20px" }}>
              Travel Nexus Secure Checkout
            </p>

            {/* Summary Box */}
            <div
              style={{
                background: "var(--bg-page)",
                padding: "16px",
                borderRadius: "10px",
                border: "1px solid var(--border)",
                marginBottom: "20px",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: "16px", marginBottom: "4px" }}>
                {data.stay.title}
              </div>
              <div style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "10px" }}>
                📍 {data.stay.city}, {data.stay.state}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "var(--dark-muted)", marginBottom: "4px" }}>
                <span>{data.checkIn} &rarr; {data.checkOut} ({data.nights} nights)</span>
                <span>{data.guests} guests</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "16px", borderTop: "1px dashed var(--border)", paddingTop: "8px", marginTop: "8px" }}>
                <span>Total Due</span>
                <span style={{ color: "var(--primary)" }}>₹{data.totalPrice}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <h4 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "10px" }}>
              Select Payment Method (Simulated)
            </h4>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
              {[
                { id: "upi", label: "📱 UPI (Google Pay, PhonePe, Paytm)", desc: "Instant zero fee payment" },
                { id: "card", label: "💳 Credit / Debit Card", desc: "Visa, Mastercard, RuPay" },
                { id: "netbanking", label: "🏦 Net Banking", desc: "All Indian banks supported" },
                { id: "property", label: "🏨 Pay at Check-in", desc: "Pay cash or card upon arrival" },
              ].map((opt) => (
                <label
                  key={opt.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 14px",
                    border: paymentMethod === opt.id ? "2px solid var(--primary)" : "1px solid var(--border)",
                    borderRadius: "8px",
                    cursor: "pointer",
                    background: paymentMethod === opt.id ? "var(--primary-light)" : "white",
                  }}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={opt.id}
                    checked={paymentMethod === opt.id}
                    onChange={() => setPaymentMethod(opt.id)}
                    style={{ accentColor: "var(--primary)" }}
                  />
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 600 }}>{opt.label}</div>
                    <div style={{ fontSize: "11px", color: "var(--muted)" }}>{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>

            {error && (
              <div style={{ background: "#fef2f2", color: "#dc2626", padding: "10px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
                {error}
              </div>
            )}

            <button
              className="btn-accent"
              style={{ width: "100%", padding: "12px", fontSize: "16px" }}
              disabled={loading}
              onClick={handleConfirmPayment}
            >
              {loading ? "Processing Reservation..." : `Confirm & Pay ₹${data.totalPrice}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingCheckoutModal;
