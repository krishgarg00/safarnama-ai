import React from "react";
import { POPULAR_DESTINATIONS } from "../data/destinations";
import type { NavTab } from "../components/Navbar";

interface ExploreProps {
  onSelectDestination: (destName: string) => void;
  onNavigate: (tab: NavTab) => void;
}

export const Explore: React.FC<ExploreProps> = ({ onSelectDestination, onNavigate }) => {
  const experiences = [
    {
      title: "Mountain Getaways & Trekking",
      icon: "🏔️",
      destinations: "Manali, Shimla, Kasol, Dharamshala",
      desc: "Fresh alpine air, snow slopes in Solang, river rafting on the Beas, and pine-clad valley homestays.",
    },
    {
      title: "Beaches & Coastal Sunsets",
      icon: "🏖️",
      destinations: "North & South Goa, Gokarna, Kerala",
      desc: "Golden sands, seaside shacks, coastal seafood, and sunset cruises with easy doorstep cab pickups.",
    },
    {
      title: "Royal Palaces & Forts",
      icon: "🏰",
      destinations: "Jaipur, Udaipur, Jodhpur, Jaisalmer",
      desc: "Spectacular forts, vibrant bazaars, Rajasthani thalis, and royal heritage homestay suites.",
    },
    {
      title: "Spiritual & Cultural Trails",
      icon: "🕉️",
      destinations: "Varanasi, Rishikesh, Amritsar, Haridwar",
      desc: "Sacred river ghats, yoga ashrams, evening aartis, and deeply immersive cultural traditions.",
    },
  ];

  return (
    <div className="container" style={{ padding: "40px 20px" }}>
      <div className="section-header">
        <div>
          <h1 className="section-title">Explore Indian Destinations</h1>
          <p className="section-subtitle">
            Curated travel guides, seasonal highlights, and stay + ride connectivity across top regions.
          </p>
        </div>
      </div>

      {/* Featured Destinations Grid */}
      <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "16px" }}>Top Travel Hubs</h3>
      <div className="destinations-grid">
        {POPULAR_DESTINATIONS.map((dest) => (
          <div
            key={dest.id}
            className="destination-card"
            onClick={() => {
              onSelectDestination(dest.name);
              onNavigate("Home");
            }}
          >
            <img src={dest.image} alt={dest.name} className="destination-card-bg" loading="lazy" />
            <div className="destination-overlay">
              <span className="destination-count">{dest.highlight}</span>
              <h3 className="destination-name">{dest.name}</h3>
              <p className="destination-desc">{dest.tagline}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Curated Experiences */}
      <h3 style={{ fontSize: "20px", fontWeight: 700, margin: "32px 0 16px" }}>Travel by Experience</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "48px" }}>
        {experiences.map((exp, idx) => (
          <div
            key={idx}
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "12px",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>{exp.icon}</div>
            <h4 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "6px" }}>{exp.title}</h4>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--primary)", marginBottom: "8px" }}>
              {exp.destinations}
            </div>
            <p style={{ fontSize: "14px", color: "var(--muted)", lineHeight: "1.5" }}>{exp.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Explore;
