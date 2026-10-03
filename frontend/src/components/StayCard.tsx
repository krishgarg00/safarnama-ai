import React from "react";
import type { StayItem } from "../api/stays";

interface StayCardProps {
  stay: StayItem;
  onBookClick?: (stay: StayItem) => void;
  onRideToStayClick?: (stay: StayItem) => void;
}

const DEFAULT_STAY_IMAGES: Record<string, string> = {
  manali: "https://images.unsplash.com/photo-1586375300773-8384e3e4916f?auto=format&fit=crop&w=600&q=80",
  goa: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80",
  delhi: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
  jaipur: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80",
  kashmir: "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?auto=format&fit=crop&w=600&q=80",
  default: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
};

export const StayCard: React.FC<StayCardProps> = ({
  stay,
  onBookClick,
  onRideToStayClick,
}) => {
  const cityKey = stay.city.toLowerCase().trim();
  const imageUrl =
    stay.images && stay.images.length > 0 && stay.images[0].startsWith("http")
      ? stay.images[0]
      : DEFAULT_STAY_IMAGES[cityKey] || DEFAULT_STAY_IMAGES.default;

  return (
    <div className="stay-card">
      <div className="stay-image-container">
        <img
          src={imageUrl}
          alt={stay.title}
          className="stay-image"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = DEFAULT_STAY_IMAGES.default;
          }}
        />
        <span className="stay-city-badge">📍 {stay.city}</span>
        <span className="stay-rating-badge">★ 4.9 (48)</span>
      </div>

      <div className="stay-body">
        <h4 className="stay-title">{stay.title}</h4>
        <p className="stay-address">
          <span>📍</span>
          <span>{stay.address || `${stay.city}, ${stay.state}`}</span>
        </p>

        {stay.amenities && stay.amenities.length > 0 && (
          <div className="stay-amenities">
            {stay.amenities.slice(0, 3).map((amenity, i) => (
              <span key={i} className="amenity-chip">
                ✓ {amenity}
              </span>
            ))}
            {stay.maxGuests && (
              <span className="amenity-chip">👥 Up to {stay.maxGuests} guests</span>
            )}
          </div>
        )}

        <div className="stay-footer">
          <div className="stay-price">
            <span className="stay-price-amount">₹{stay.pricePerNight}</span>
            <span className="stay-price-unit">/ night</span>
          </div>

          <div style={{ display: "flex", gap: "6px" }}>
            {onRideToStayClick && (
              <button
                className="btn-secondary"
                style={{ padding: "6px 10px", fontSize: "12px" }}
                title="Coordinate ride to this stay"
                onClick={() => onRideToStayClick(stay)}
              >
                🚗 Ride Here
              </button>
            )}

            <button
              className="btn-primary"
              style={{ padding: "6px 12px", fontSize: "12px" }}
              onClick={() => onBookClick && onBookClick(stay)}
            >
              Book Stay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StayCard;
