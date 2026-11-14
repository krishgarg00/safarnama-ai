import React from "react";
import { POPULAR_DESTINATIONS, type Destination } from "../data/destinations";

export type { Destination };

interface PopularDestinationsProps {
  onSelectDestination: (destinationName: string) => void;
}

export const PopularDestinations: React.FC<PopularDestinationsProps> = ({
  onSelectDestination,
}) => {
  return (
    <section style={{ margin: "48px 0" }}>
      <div className="section-header">
        <div>
          <h2 className="section-title">Popular Destinations</h2>
          <p className="section-subtitle">
            Explore India&apos;s most loved vacation spots handpicked for unforgettable stays and seamless rides.
          </p>
        </div>
        <span
          className="section-action"
          onClick={() => onSelectDestination("")}
        >
          View all destinations &rarr;
        </span>
      </div>

      <div className="destinations-grid">
        {POPULAR_DESTINATIONS.map((dest) => (
          <div
            key={dest.id}
            className="destination-card"
            onClick={() => onSelectDestination(dest.name)}
          >
            <img
              src={dest.image}
              alt={dest.name}
              className="destination-card-bg"
              loading="lazy"
            />
            <div className="destination-overlay">
              <span className="destination-count">{dest.highlight}</span>
              <h3 className="destination-name">{dest.name}</h3>
              <p className="destination-desc">{dest.tagline}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PopularDestinations;
