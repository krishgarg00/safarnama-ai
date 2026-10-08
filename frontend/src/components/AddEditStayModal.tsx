import React, { useState } from "react";
import { createStay, updateStay, type StayItem, type CreateStayData } from "../api/stays";

interface AddEditStayModalProps {
  stayToEdit?: StayItem | null;
  onClose: () => void;
  onSaveSuccess: () => void;
}

const COMMON_AMENITIES = [
  "Free WiFi",
  "Air Conditioning",
  "Swimming Pool",
  "Mountain View",
  "Beach Access",
  "Kitchen",
  "Free Parking",
  "Bonfire",
  "Room Heater",
  "Balcony",
];

export const AddEditStayModal: React.FC<AddEditStayModalProps> = ({
  stayToEdit,
  onClose,
  onSaveSuccess,
}) => {
  const [title, setTitle] = useState(stayToEdit?.title || "");
  const [city, setCity] = useState(stayToEdit?.city || "");
  const [state, setState] = useState(stayToEdit?.state || "");
  const [address, setAddress] = useState(stayToEdit?.address || "");
  const [pricePerNight, setPricePerNight] = useState(
    stayToEdit?.pricePerNight ? String(stayToEdit.pricePerNight) : "2500"
  );
  const [maxGuests, setMaxGuests] = useState(
    stayToEdit?.maxGuests ? String(stayToEdit.maxGuests) : "4"
  );
  const [description, setDescription] = useState(stayToEdit?.description || "");
  const [imageUrl, setImageUrl] = useState(
    stayToEdit?.images && stayToEdit.images[0] ? stayToEdit.images[0] : ""
  );
  const [amenities, setAmenities] = useState<string[]>(
    stayToEdit?.amenities || ["Free WiFi", "Mountain View"]
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleAmenity = (amenity: string) => {
    setAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload: CreateStayData = {
      title,
      city,
      state,
      address,
      pricePerNight: Number(pricePerNight),
      maxGuests: Number(maxGuests),
      description,
      amenities,
      images: imageUrl ? [imageUrl] : ["https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"],
    };

    try {
      if (stayToEdit) {
        await updateStay(stayToEdit._id, payload);
      } else {
        await createStay(payload);
      }
      onSaveSuccess();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save property listing"
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
          maxWidth: "600px",
          width: "100%",
          maxHeight: "90vh",
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
          {stayToEdit ? "Edit Property Listing" : "List a New Stay on Travel Nexus"}
        </h2>
        <p style={{ color: "var(--muted)", fontSize: "13px", marginBottom: "20px" }}>
          Share your homestay, hotel, or villa with travelers across the platform.
        </p>

        {error && (
          <div style={{ background: "#fef2f2", color: "#dc2626", padding: "10px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Property Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Pine Ridge Alpine Cottage"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group">
              <label className="form-label">City / Destination</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Manali"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Himachal Pradesh"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Log Huts Road, Old Manali"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group">
              <label className="form-label">Price / Night (₹)</label>
              <input
                type="number"
                min="0"
                className="form-input"
                placeholder="2500"
                value={pricePerNight}
                onChange={(e) => setPricePerNight(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Max Guests Allowed</label>
              <input
                type="number"
                min="1"
                className="form-input"
                placeholder="4"
                value={maxGuests}
                onChange={(e) => setMaxGuests(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Photo Image URL</label>
            <input
              type="url"
              className="form-input"
              placeholder="https://images.unsplash.com/photo-..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            <small style={{ color: "var(--muted)", fontSize: "11px" }}>
              Leave blank to use a default scenic photo.
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Highlight views, ambiance, nearby attractions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Amenities selector */}
          <div className="form-group">
            <label className="form-label">Select Amenities</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {COMMON_AMENITIES.map((a) => (
                <button
                  type="button"
                  key={a}
                  className={`cat-pill ${amenities.includes(a) ? "active" : ""}`}
                  style={{ fontSize: "12px", padding: "4px 10px" }}
                  onClick={() => toggleAmenity(a)}
                >
                  {amenities.includes(a) ? "✓ " : "+ "} {a}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="btn-accent"
            style={{ width: "100%", padding: "12px", marginTop: "12px", fontSize: "15px" }}
            disabled={loading}
          >
            {loading ? "Saving..." : stayToEdit ? "Update Listing" : "Publish Stay Listing 🏠"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddEditStayModal;
