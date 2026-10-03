import React from "react";

export interface Destination {
  id: string;
  name: string;
  state: string;
  tagline: string;
  image: string;
  stayCount: number;
  highlight: string;
}

interface PopularDestinationsProps {
  onSelectDestination: (destinationName: string) => void;
}

export const POPULAR_DESTINATIONS: Destination[] = [
  {
    id: "manali",
    name: "Manali",
    state: "Himachal Pradesh",
    tagline: "Snow peaks, Solang Valley & serene pines",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80",
    stayCount: 14,
    highlight: "🏔️ Mountain Adventure",
  },
  {
    id: "goa",
    name: "Goa",
    state: "Goa",
    tagline: "Golden beaches, sea breeze & coastal nightlife",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80",
    stayCount: 22,
    highlight: "🏖️ Beach & Sun",
  },
  {
    id: "jaipur",
    name: "Jaipur",
    state: "Rajasthan",
    tagline: "Royal palaces, historic forts & rich culture",
    image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80",
    stayCount: 18,
    highlight: "🏰 Royal Heritage",
  },
  {
    id: "kashmir",
    name: "Kashmir",
    state: "Jammu & Kashmir",
    tagline: "Dal Lake houseboats, meadows & snowy valleys",
    image: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=600&q=80",
    stayCount: 9,
    highlight: "❄️ Alpine Paradise",
  },
];

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
