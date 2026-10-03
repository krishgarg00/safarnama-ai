import React from "react";

interface ConnectedEcosystemBannerProps {
  onExploreRides: () => void;
  onExploreStays: () => void;
  onExploreTrips: () => void;
}

export const ConnectedEcosystemBanner: React.FC<ConnectedEcosystemBannerProps> = ({
  onExploreRides,
  onExploreStays,
  onExploreTrips,
}) => {
  return (
    <section className="ecosystem-banner">
      <div className="ecosystem-grid">
        <div className="ecosystem-content">
          <span className="badge badge-primary" style={{ marginBottom: "16px", color: "#2dd4bf" }}>
            ⚡ Why Safarnama AI?
          </span>
          <h3>An Integrated Travel Ecosystem Connecting Stays, Rides &amp; AI</h3>
          <p>
            Traditional travel planning is fragmented across 4 to 5 different apps. Safarnama AI unifies accommodation discovery, real-time transportation, and automated trip planning into one seamless experience.
          </p>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button className="btn-accent" onClick={onExploreRides}>
              Book a Ride 🚗
            </button>
            <button className="btn-secondary" onClick={onExploreStays}>
              Explore Stays 🏨
            </button>
            <button className="btn-secondary" onClick={onExploreTrips}>
              Plan Trip with AI 🤖
            </button>
          </div>
        </div>

        <div className="flow-steps">
          <div className="flow-step-card">
            <div className="flow-step-icon">🏠</div>
            <div>
              <div className="flow-step-title">1. Discover &amp; Book Stays</div>
              <div className="flow-step-desc">
                Verified homestays, hotels, and luxury villas across India.
              </div>
            </div>
          </div>

          <div className="flow-step-card">
            <div className="flow-step-icon">🚗</div>
            <div>
              <div className="flow-step-title">2. Seamless Ride Coordination</div>
              <div className="flow-step-desc">
                Direct cab booking to your stay with live driver status and WebSockets.
              </div>
            </div>
          </div>

          <div className="flow-step-card">
            <div className="flow-step-icon">🤖</div>
            <div>
              <div className="flow-step-title">3. AI Concierge &amp; Itineraries</div>
              <div className="flow-step-desc">
                Instant budget itineraries, review summaries, and custom recommendations.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConnectedEcosystemBanner;
