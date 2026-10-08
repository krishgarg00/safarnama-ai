import React, { useEffect, useState } from "react";
import { getMyBookings, cancelBooking, type BookingItem } from "../api/bookings";
import type { StayItem } from "../api/stays";

interface MyBookingsModalProps {
  onClose: () => void;
  onCoordinateRide: (stay: StayItem) => void;
}

export const MyBookingsModal: React.FC<MyBookingsModalProps> = ({
  onClose,
  onCoordinateRide,
}) => {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await getMyBookings();
      setBookings(res.bookings || []);
    } catch (err) {
      console.error("Failed to load customer bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await cancelBooking(bookingId);
      await fetchBookings();
    } catch (err) {
      alert("Failed to cancel booking: " + (err instanceof Error ? err.message : String(err)));
    }
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
        zIndex: 1050,
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
          maxWidth: "680px",
          width: "100%",
          maxHeight: "85vh",
          overflowY: "auto",
          padding: "32px",
          position: "relative",
          boxShadow: "var(--shadow-xl)",
        }}
      >
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

        <h2 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "4px" }}>
          My Stay Reservations 🏨
        </h2>
        <p style={{ color: "var(--muted)", fontSize: "13px", marginBottom: "20px" }}>
          View and manage your confirmed hotel and homestay bookings.
        </p>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
            Loading reservations...
          </div>
        ) : bookings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", background: "var(--bg-page)", borderRadius: "12px", border: "1px dashed var(--border)" }}>
            <div style={{ fontSize: "36px", marginBottom: "8px" }}>🏨</div>
            <h3 style={{ fontSize: "16px", marginBottom: "4px" }}>No reservations yet</h3>
            <p style={{ color: "var(--muted)", fontSize: "13px" }}>
              Explore our stays and book your next trip!
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {bookings.map((b) => (
              <div
                key={b._id}
                style={{
                  background: "var(--bg-page)",
                  padding: "18px",
                  borderRadius: "12px",
                  border: "1px solid var(--border)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <div>
                    <h4 style={{ fontSize: "16px", fontWeight: 700 }}>
                      {b.stay?.title || "Reserved Property"}
                    </h4>
                    <p style={{ color: "var(--muted)", fontSize: "13px" }}>
                      📍 {b.stay?.city}, {b.stay?.state}
                    </p>
                  </div>

                  <span
                    className={`badge ${
                      b.status === "CONFIRMED"
                        ? "badge-success"
                        : b.status === "CANCELLED"
                        ? "badge-danger"
                        : "badge-warning"
                    }`}
                  >
                    {b.status}
                  </span>
                </div>

                <div style={{ fontSize: "13px", color: "var(--dark-muted)", marginBottom: "12px" }}>
                  Dates: <strong>{new Date(b.checkIn).toLocaleDateString()}</strong> &rarr; <strong>{new Date(b.checkOut).toLocaleDateString()}</strong> &bull; {b.guests} Guests &bull; Paid: <strong style={{ color: "var(--primary)" }}>₹{b.totalPrice}</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "10px" }}>
                  <small style={{ color: "var(--light-muted)" }}>ID: {b._id}</small>

                  <div style={{ display: "flex", gap: "8px" }}>
                    {b.status !== "CANCELLED" && (
                      <>
                        <button
                          className="btn-accent"
                          style={{ padding: "5px 12px", fontSize: "12px" }}
                          onClick={() => {
                            onClose();
                            onCoordinateRide(b.stay);
                          }}
                        >
                          🚗 Book Cab to Stay
                        </button>

                        <button
                          className="btn-secondary"
                          style={{ color: "#dc2626", borderColor: "#fecaca", padding: "5px 12px", fontSize: "12px" }}
                          onClick={() => handleCancelBooking(b._id)}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookingsModal;
