import React, { useEffect, useState } from "react";
import { getStays, deleteStay, type StayItem } from "../api/stays";
import { getHostBookings, updateBookingStatus, type BookingItem } from "../api/bookings";
import type { LoggedInUser } from "./Login";
import AddEditStayModal from "../components/AddEditStayModal";

interface HostDashboardProps {
  currentUser: LoggedInUser | null;
  onOpenAuth: () => void;
}

export const HostDashboard: React.FC<HostDashboardProps> = ({
  currentUser,
  onOpenAuth,
}) => {
  const [activeHostTab, setActiveHostTab] = useState<"listings" | "bookings">("listings");
  const [myStays, setMyStays] = useState<StayItem[]>([]);
  const [hostBookings, setHostBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [stayToEdit, setStayToEdit] = useState<StayItem | null>(null);

  const loadHostData = async () => {
    if (!currentUser) return;
    setLoading(true);

    try {
      // 1. Fetch stays and filter by current user's host ID
      const staysRes = await getStays();
      const allStays = staysRes.stays || [];
      const userStays = allStays.filter(
        (s) => s.host && (s.host._id === currentUser._id || (s.host as unknown as string) === currentUser._id)
      );
      // If host doesn't have any created stays yet, show all stays they can manage or an empty list
      setMyStays(userStays.length > 0 ? userStays : allStays);

      // 2. Fetch bookings for this host
      try {
        const bookingsRes = await getHostBookings();
        setHostBookings(bookingsRes.bookings || []);
      } catch (err) {
        console.warn("Could not load host bookings:", err);
      }
    } catch (err) {
      console.error("Failed to load host data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHostData();
  }, [currentUser]);

  const handleDeleteStay = async (stayId: string) => {
    if (!window.confirm("Are you sure you want to delete this property listing?")) return;
    try {
      await deleteStay(stayId);
      await loadHostData();
    } catch (err) {
      alert("Failed to delete stay: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: "CONFIRMED" | "REJECTED") => {
    try {
      await updateBookingStatus(bookingId, status);
      await loadHostData();
    } catch (err) {
      alert("Failed to update booking status: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  if (!currentUser) {
    return (
      <div className="container" style={{ padding: "64px 20px", textAlign: "center", maxWidth: "600px" }}>
        <div style={{ fontSize: "56px", marginBottom: "16px" }}>🏠</div>
        <h2 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "12px" }}>
          Travel Nexus Host Portal
        </h2>
        <p style={{ color: "var(--muted)", marginBottom: "24px" }}>
          Sign in as a Host to list homestays, hotels, or apartments and manage guest reservations.
        </p>
        <button className="btn-primary" onClick={onOpenAuth}>
          Sign In as Host
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "40px 20px" }}>
      <div className="section-header">
        <div>
          <span className="badge badge-primary" style={{ marginBottom: "6px" }}>
            🏠 Host Portal
          </span>
          <h1 className="section-title">Host Dashboard &amp; Property Management</h1>
          <p className="section-subtitle">
            Manage your accommodations, pricing, availability, and inbound reservations.
          </p>
        </div>

        <button
          className="btn-accent"
          onClick={() => {
            setStayToEdit(null);
            setShowAddModal(true);
          }}
        >
          + Add New Property 🏠
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "10px", borderBottom: "1px solid var(--border)", marginBottom: "24px" }}>
        <button
          className={`nav-link ${activeHostTab === "listings" ? "active" : ""}`}
          style={{ borderRadius: "8px 8px 0 0", padding: "10px 20px" }}
          onClick={() => setActiveHostTab("listings")}
        >
          My Listed Properties ({myStays.length})
        </button>
        <button
          className={`nav-link ${activeHostTab === "bookings" ? "active" : ""}`}
          style={{ borderRadius: "8px 8px 0 0", padding: "10px 20px" }}
          onClick={() => setActiveHostTab("bookings")}
        >
          Guest Reservations ({hostBookings.length})
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "48px", color: "var(--muted)" }}>
          Loading host data...
        </div>
      ) : activeHostTab === "listings" ? (
        /* Listings Tab */
        <div>
          {myStays.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px", background: "white", borderRadius: "12px", border: "1px dashed var(--border)" }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>🏡</div>
              <h3 style={{ fontSize: "18px", marginBottom: "6px" }}>No properties listed yet</h3>
              <p style={{ color: "var(--muted)", marginBottom: "16px" }}>
                Ready to welcome travelers? List your homestay, hotel, or villa now.
              </p>
              <button
                className="btn-primary"
                onClick={() => {
                  setStayToEdit(null);
                  setShowAddModal(true);
                }}
              >
                + List Your First Property
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
              {myStays.map((stay) => (
                <div
                  key={stay._id}
                  style={{
                    background: "white",
                    borderRadius: "12px",
                    border: "1px solid var(--border)",
                    overflow: "hidden",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <div style={{ position: "relative", height: "180px" }}>
                    <img
                      src={
                        stay.images && stay.images[0]
                          ? stay.images[0]
                          : "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80"
                      }
                      alt={stay.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <span className="stay-city-badge">📍 {stay.city}</span>
                  </div>

                  <div style={{ padding: "18px" }}>
                    <h4 style={{ fontSize: "17px", fontWeight: 700, marginBottom: "4px" }}>
                      {stay.title}
                    </h4>
                    <p style={{ color: "var(--muted)", fontSize: "13px", marginBottom: "12px" }}>
                      {stay.address} &bull; Up to {stay.maxGuests} guests
                    </p>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
                      <div>
                        <span style={{ fontSize: "18px", fontWeight: 800, color: "var(--primary)" }}>
                          ₹{stay.pricePerNight}
                        </span>
                        <span style={{ fontSize: "12px", color: "var(--muted)" }}> / night</span>
                      </div>

                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          className="btn-secondary"
                          style={{ padding: "6px 12px", fontSize: "12px" }}
                          onClick={() => {
                            setStayToEdit(stay);
                            setShowAddModal(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-secondary"
                          style={{ padding: "6px 12px", fontSize: "12px", color: "#dc2626", borderColor: "#fecaca" }}
                          onClick={() => handleDeleteStay(stay._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Inbound Reservations Tab */
        <div>
          {hostBookings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px", background: "white", borderRadius: "12px", border: "1px dashed var(--border)" }}>
              <p style={{ color: "var(--muted)" }}>No guest bookings received yet.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {hostBookings.map((b) => (
                <div
                  key={b._id}
                  style={{
                    background: "white",
                    padding: "20px",
                    borderRadius: "12px",
                    border: "1px solid var(--border)",
                    boxShadow: "var(--shadow-sm)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "16px",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "16px", fontWeight: 700 }}>
                      {b.stay?.title || "Property"} &bull; Guest: {b.customer?.name || "Customer"} ({b.customer?.email})
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--muted)", marginTop: "4px" }}>
                      Dates: {new Date(b.checkIn).toLocaleDateString()} &rarr; {new Date(b.checkOut).toLocaleDateString()} &bull; {b.guests} Guests &bull; Total: <strong>₹{b.totalPrice}</strong>
                    </div>
                    <small style={{ color: "var(--light-muted)" }}>Booking ID: {b._id}</small>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span
                      className={`badge ${
                        b.status === "CONFIRMED"
                          ? "badge-success"
                          : b.status === "REJECTED" || b.status === "CANCELLED"
                          ? "badge-danger"
                          : "badge-warning"
                      }`}
                    >
                      {b.status}
                    </span>

                    {b.status === "PENDING" && (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          className="btn-primary"
                          style={{ padding: "6px 14px", fontSize: "12px" }}
                          onClick={() => handleUpdateBookingStatus(b._id, "CONFIRMED")}
                        >
                          Confirm
                        </button>
                        <button
                          className="btn-secondary"
                          style={{ padding: "6px 14px", fontSize: "12px", color: "#dc2626" }}
                          onClick={() => handleUpdateBookingStatus(b._id, "REJECTED")}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Property Modal */}
      {showAddModal && (
        <AddEditStayModal
          stayToEdit={stayToEdit}
          onClose={() => {
            setShowAddModal(false);
            setStayToEdit(null);
          }}
          onSaveSuccess={loadHostData}
        />
      )}
    </div>
  );
};

export default HostDashboard;
