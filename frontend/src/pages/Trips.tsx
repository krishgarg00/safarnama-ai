import React, { useState } from "react";
import type { NavTab } from "../components/Navbar";

interface TripsProps {
  onNavigate: (tab: NavTab) => void;
  onSearchStayInDestination: (destName: string) => void;
}

export const Trips: React.FC<TripsProps> = ({ onNavigate, onSearchStayInDestination }) => {
  const [destination, setDestination] = useState("Manali");
  const [days, setDays] = useState(4);
  const [budget, setBudget] = useState("20,000");
  const [interest, setInterest] = useState("Adventure & Nature");
  const [generatedItinerary, setGeneratedItinerary] = useState<boolean>(true);

  const sampleItinerary = [
    {
      day: "Day 1",
      title: "Arrival, Mountain Check-in & Old Manali Stroll",
      activities: [
        "Check-in at Mountain View Homestay (coordinated via Safarnama Stay)",
        "Book doorstep cab from Bhuntar Airport to stay (Safarnama Ride ₹800)",
        "Evening walk along Mall Road, cafe hopping, and local Himachali Siddu tasting",
      ],
      estimatedCost: "₹3,200",
    },
    {
      day: "Day 2",
      title: "Solang Valley Thrills & Snow Activities",
      activities: [
        "Morning drive to Solang Valley via pre-booked Safarnama cab",
        "Paragliding, quad biking, and cable car ride",
        "Hot Maggi & ginger chai with views of the Pir Panjal range",
      ],
      estimatedCost: "₹4,500",
    },
    {
      day: "Day 3",
      title: "Heritage & Nature Walk: Hidimba Temple & Jogini Falls",
      activities: [
        "Visit historical 16th century Hidimba Devi Temple amidst cedar forests",
        "Short scenic trek to Jogini Waterfall near Vashisht village",
        "Natural hot sulfur springs soak and evening bonfire at stay",
      ],
      estimatedCost: "₹2,400",
    },
    {
      day: "Day 4",
      title: "Local Handicrafts, Souvenirs & Farewell",
      activities: [
        "Handloom woolen shawl & cedar wood craft shopping in Tibetan Market",
        "Check-out from homestay with auto-scheduled cab pickup",
        "Departure with scenic memories of Himachal",
      ],
      estimatedCost: "₹2,800",
    },
  ];

  return (
    <div className="container" style={{ padding: "40px 20px" }}>
      <div className="section-header">
        <div>
          <span className="badge badge-primary" style={{ marginBottom: "8px" }}>
            🤖 AI Travel Concierge (Preview)
          </span>
          <h1 className="section-title">AI Trip Planner &amp; Itinerary Generator</h1>
          <p className="section-subtitle">
            Tell Safarnama where you want to go and your budget—AI constructs the complete day-by-day plan with stay and cab suggestions.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "32px", alignItems: "flex-start" }}>
        {/* Planner Inputs Card */}
        <div style={{ background: "white", padding: "24px", borderRadius: "12px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px" }}>Trip Preferences</h3>

          <div className="form-group">
            <label className="form-label">Destination</label>
            <input
              type="text"
              className="form-input"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Manali, Goa, Jaipur..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Duration (Days): {days} days</label>
            <input
              type="range"
              min="1"
              max="7"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--primary)" }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Budget (₹)</label>
            <input
              type="text"
              className="form-input"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="e.g. ₹20,000"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Travel Vibe / Interests</label>
            <select
              className="form-input"
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
            >
              <option value="Adventure & Nature">Adventure &amp; Nature</option>
              <option value="Beaches & Leisure">Beaches &amp; Leisure</option>
              <option value="Culture & Heritage">Culture &amp; Heritage</option>
              <option value="Food & Nightlife">Food &amp; Nightlife</option>
              <option value="Peace & Wellness">Peace &amp; Wellness</option>
            </select>
          </div>

          <button
            className="btn-accent"
            style={{ width: "100%", marginTop: "12px" }}
            onClick={() => setGeneratedItinerary(true)}
          >
            ✨ Regenerate AI Itinerary
          </button>
        </div>

        {/* Itinerary Display */}
        <div>
          {generatedItinerary && (
            <div style={{ background: "white", padding: "28px", borderRadius: "12px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "16px", marginBottom: "20px" }}>
                <div>
                  <h2 style={{ fontSize: "22px", fontWeight: 800 }}>
                    {days}-Day {destination} Custom Itinerary
                  </h2>
                  <div style={{ fontSize: "13px", color: "var(--muted)", marginTop: "4px" }}>
                    Target Budget: <strong>₹{budget}</strong> &bull; Vibe: <strong>{interest}</strong>
                  </div>
                </div>
                <button
                  className="btn-primary"
                  onClick={() => {
                    onSearchStayInDestination(destination);
                    onNavigate("Home");
                  }}
                >
                  Find Stays in {destination} 🏨
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {sampleItinerary.slice(0, days).map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      borderLeft: "3px solid var(--primary)",
                      paddingLeft: "16px",
                      position: "relative",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className="badge badge-primary">{item.day}</span>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--muted)" }}>
                        Est. Cost: {item.estimatedCost}
                      </span>
                    </div>

                    <h4 style={{ fontSize: "16px", fontWeight: 700, margin: "8px 0 6px" }}>
                      {item.title}
                    </h4>

                    <ul style={{ paddingLeft: "20px", color: "var(--dark-muted)", fontSize: "14px", lineHeight: "1.6" }}>
                      {item.activities.map((act, aIdx) => (
                        <li key={aIdx}>{act}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Trips;
