import React, { useState, useEffect, useRef } from "react";
import type { NavTab } from "../components/Navbar";
import {
  generateAiItinerary,
  summarizeStayReviews,
  chatWithAiConcierge,
  type GeneratedItinerary,
  type ReviewSummary,
  type ChatAction,
} from "../api/ai";

interface TripsProps {
  onNavigate: (tab: NavTab) => void;
  onSearchStayInDestination: (destName: string) => void;
  onBookCabForTrip?: (dropoff: string) => void;
}

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  actions?: ChatAction[];
  timestamp: string;
}

export const Trips: React.FC<TripsProps> = ({
  onNavigate,
  onSearchStayInDestination,
  onBookCabForTrip,
}) => {
  // Navigation sub-tabs
  const [activeSubTab, setActiveSubTab] = useState<"planner" | "chat" | "reviews">("planner");

  // Planner inputs
  const [destination, setDestination] = useState("Manali");
  const [days, setDays] = useState(4);
  const [budget, setBudget] = useState("20000");
  const [vibe, setVibe] = useState("Adventure & Nature");
  const [travelers, setTravelers] = useState("Couple / Friends");
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [itinerary, setItinerary] = useState<GeneratedItinerary | null>(null);

  // Review synthesizer state
  const [stayTitleInput, setStayTitleInput] = useState("Mountain View Homestay, Manali");
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(null);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Hello! I'm your **Travel Nexus AI Concierge**. Tell me where you'd like to travel, or ask for stay, cab, and local dining suggestions!",
      timestamp: "Just now",
      actions: [
        { type: "PLAN_TRIP", label: "✨ Plan 4-Day Manali Trip", payload: "Manali" },
        { type: "VIEW_STAYS", label: "🏨 Explore Top Stays", payload: "Manali" },
        { type: "BOOK_CAB", label: "🚗 Check Cab Rates", payload: "Airport" },
      ],
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleGenerateItinerary = async () => {
    setLoadingPlan(true);
    try {
      const data = await generateAiItinerary({
        destination,
        days,
        budget,
        vibe,
        travelers,
      });
      setItinerary(data);
    } catch (err) {
      console.error("Failed to generate itinerary:", err);
      showToast("Unable to reach server. Using offline regional planner.");
    } finally {
      setLoadingPlan(false);
    }
  };

  const handleSynthesizeReviews = async () => {
    setLoadingReviews(true);
    try {
      const data = await summarizeStayReviews(stayTitleInput);
      setReviewSummary(data);
    } catch (err) {
      console.error("Failed to summarize reviews:", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Auto-generate initial itinerary on mount
  useEffect(() => {
    handleGenerateItinerary();
    handleSynthesizeReviews();
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatLoading]);

  const handleSendChat = async (msgText?: string) => {
    const textToSend = msgText || chatInput;
    if (!textToSend.trim() || chatLoading) return;

    const userMsg: ChatMessage = {
      id: `user_${Math.random().toString(36).substring(2, 9)}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await chatWithAiConcierge(textToSend, destination);
      const aiMsg: ChatMessage = {
        id: `ai_${Math.random().toString(36).substring(2, 9)}`,
        sender: "ai",
        text: res.reply,
        actions: res.suggestedActions,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages((prev) => [...prev, aiMsg]);
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `ai_${Math.random().toString(36).substring(2, 9)}`,
        sender: "ai",
        text: `Travel Nexus is ready to help you explore **${destination}**! You can book verified homestays or reserve on-demand mountain cabs directly from the platform.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleActionClick = (action: ChatAction) => {
    if (action.type === "BOOK_CAB") {
      if (onBookCabForTrip) {
        onBookCabForTrip(action.payload || destination);
      } else {
        onNavigate("Rides");
      }
    } else if (action.type === "VIEW_STAYS") {
      onSearchStayInDestination(action.payload || destination);
      onNavigate("Stays");
    } else if (action.type === "PLAN_TRIP") {
      if (action.payload) setDestination(action.payload);
      setActiveSubTab("planner");
      handleGenerateItinerary();
    } else if (action.type === "EXPLORE_DESTINATION") {
      onNavigate("Explore");
    }
  };

  const copyPlanSummary = () => {
    if (!itinerary) return;
    const summary = `${itinerary.days}-Day Itinerary for ${itinerary.destination}\nEstimated Cost: ₹${itinerary.totalEstimatedCost}\nTarget Budget: ₹${itinerary.targetBudget}\nHighlights:\n${itinerary.highlights.map((h) => `- ${h}`).join("\n")}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary);
      showToast("📋 Itinerary summary copied to clipboard!");
    }
  };

  const popularDestinations = ["Manali", "Goa", "Jaipur", "Rishikesh", "Srinagar"];

  return (
    <div className="container" style={{ padding: "36px 20px" }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: "#0f172a",
            color: "white",
            padding: "12px 20px",
            borderRadius: "10px",
            boxShadow: "var(--shadow-xl)",
            zIndex: 9999,
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
          <span className="badge badge-primary">Travel Nexus AI Suite</span>
          <span className="badge badge-info">Plan. Ride. Stay. Explore.</span>
        </div>
        <h1 style={{ fontSize: "32px", fontWeight: 800, color: "var(--dark)" }}>
          AI Travel Assistant &amp; Itinerary Planner
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "15px" }}>
          Intelligent trip creation, budget optimization, stay-and-ride coordination, and synthesized reviews.
        </p>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          borderBottom: "1px solid var(--border)",
          paddingBottom: "16px",
          marginBottom: "28px",
          overflowX: "auto",
        }}
      >
        <button
          type="button"
          onClick={() => setActiveSubTab("planner")}
          style={{
            padding: "10px 20px",
            borderRadius: "10px",
            fontWeight: 700,
            fontSize: "14px",
            background: activeSubTab === "planner" ? "var(--primary)" : "white",
            color: activeSubTab === "planner" ? "white" : "var(--dark)",
            border: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>✨</span> Smart Itinerary Generator
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("chat")}
          style={{
            padding: "10px 20px",
            borderRadius: "10px",
            fontWeight: 700,
            fontSize: "14px",
            background: activeSubTab === "chat" ? "var(--primary)" : "white",
            color: activeSubTab === "chat" ? "white" : "var(--dark)",
            border: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>🤖</span> AI Travel Concierge (Live Chat)
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("reviews")}
          style={{
            padding: "10px 20px",
            borderRadius: "10px",
            fontWeight: 700,
            fontSize: "14px",
            background: activeSubTab === "reviews" ? "var(--primary)" : "white",
            color: activeSubTab === "reviews" ? "white" : "var(--dark)",
            border: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>⭐</span> AI Stay Review Synthesizer
        </button>
      </div>

      {/* ========================================================= */}
      {/* SUB-TAB 1: SMART ITINERARY GENERATOR                     */}
      {/* ========================================================= */}
      {activeSubTab === "planner" && (
        <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: "28px", alignItems: "flex-start" }}>
          {/* Planner Control Sidebar */}
          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "16px",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <h3 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "16px" }}>Trip Parameters</h3>

            {/* Destination Input & Quick Chips */}
            <div className="form-group">
              <label className="form-label">Destination</label>
              <input
                type="text"
                className="form-input"
                style={{ width: "100%" }}
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Manali, Goa, Jaipur..."
              />
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
                {popularDestinations.map((d) => (
                  <button
                    type="button"
                    key={d}
                    className="cat-pill"
                    style={{
                      fontSize: "11px",
                      padding: "3px 8px",
                      background: destination.toLowerCase() === d.toLowerCase() ? "var(--primary-light)" : "white",
                      borderColor: destination.toLowerCase() === d.toLowerCase() ? "var(--primary)" : "var(--border)",
                    }}
                    onClick={() => setDestination(d)}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration Slider */}
            <div className="form-group" style={{ marginTop: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <label className="form-label">Duration</label>
                <strong style={{ color: "var(--primary)" }}>{days} Days</strong>
              </div>
              <input
                type="range"
                min="1"
                max="7"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--primary)" }}
              />
            </div>

            {/* Budget Input */}
            <div className="form-group" style={{ marginTop: "16px" }}>
              <label className="form-label">Total Target Budget (₹)</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "12px", top: "10px", color: "var(--muted)" }}>₹</span>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: "28px", width: "100%" }}
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="20000"
                />
              </div>
            </div>

            {/* Vibe Selection */}
            <div className="form-group" style={{ marginTop: "16px" }}>
              <label className="form-label">Travel Vibe / Theme</label>
              <select
                className="form-input"
                style={{ width: "100%" }}
                value={vibe}
                onChange={(e) => setVibe(e.target.value)}
              >
                <option value="Adventure & Nature">🏔️ Adventure &amp; Nature</option>
                <option value="Beaches & Leisure">🏖️ Beaches &amp; Leisure</option>
                <option value="Culture & Heritage">🏰 Culture &amp; Heritage</option>
                <option value="Food & Nightlife">🍸 Food &amp; Nightlife</option>
                <option value="Peace & Wellness">🧘 Peace &amp; Wellness</option>
              </select>
            </div>

            {/* Travelers */}
            <div className="form-group" style={{ marginTop: "16px" }}>
              <label className="form-label">Travel Group</label>
              <select
                className="form-input"
                style={{ width: "100%" }}
                value={travelers}
                onChange={(e) => setTravelers(e.target.value)}
              >
                <option value="Solo Traveler">👤 Solo Traveler</option>
                <option value="Couple / Romantic">💑 Couple / Romantic</option>
                <option value="Family with Kids">👨‍👩‍👦 Family with Kids</option>
                <option value="Group of Friends">👥 Group of Friends</option>
              </select>
            </div>

            <button
              type="button"
              className="btn-accent"
              style={{ width: "100%", padding: "14px", marginTop: "20px", fontWeight: 800 }}
              onClick={handleGenerateItinerary}
              disabled={loadingPlan}
            >
              {loadingPlan ? "Synthesizing Plan..." : "✨ Generate AI Itinerary"}
            </button>
          </div>

          {/* Itinerary Results Panel */}
          <div>
            {loadingPlan && (
              <div
                style={{
                  background: "white",
                  padding: "40px",
                  borderRadius: "16px",
                  border: "1px solid var(--border)",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "48px", marginBottom: "16px", animation: "pulseGlow 1.5s infinite" }}>
                  🧠
                </div>
                <h3 style={{ fontSize: "20px", fontWeight: 800 }}>Analyzing Travel Options in {destination}...</h3>
                <p style={{ color: "var(--muted)", fontSize: "14px", marginTop: "6px", marginBottom: "20px" }}>
                  Optimizing daily sightseeing routes, pairing verified homestays, and calculating cab fares.
                </p>
                <div
                  className="ai-shimmer-bar"
                  style={{ height: "6px", borderRadius: "4px", maxWidth: "340px", margin: "0 auto" }}
                />
              </div>
            )}

            {!loadingPlan && itinerary && (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {/* Itinerary Header Card */}
                <div
                  style={{
                    background: "white",
                    borderRadius: "16px",
                    padding: "28px",
                    border: "1px solid var(--border)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
                    <div>
                      <span className="badge badge-primary" style={{ marginBottom: "8px" }}>
                        ✨ AI Personalized Itinerary
                      </span>
                      <h2 style={{ fontSize: "26px", fontWeight: 800 }}>
                        {itinerary.days}-Day {itinerary.destination} Journey
                      </h2>
                      <div style={{ fontSize: "14px", color: "var(--muted)", marginTop: "4px" }}>
                        Vibe: <strong>{itinerary.vibe}</strong> &bull; Travelers: <strong>{itinerary.travelers}</strong>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "12px", color: "var(--muted)" }}>Total Estimated Cost</div>
                      <div style={{ fontSize: "32px", fontWeight: 800, color: "var(--primary)" }}>
                        ₹{itinerary.totalEstimatedCost.toLocaleString()}
                      </div>
                      <small style={{ color: "#059669", fontWeight: 600 }}>
                        {itinerary.totalEstimatedCost <= itinerary.targetBudget
                          ? `✓ ₹${(itinerary.targetBudget - itinerary.totalEstimatedCost).toLocaleString()} under target budget`
                          : "Within realistic seasonal range"}
                      </small>
                    </div>
                  </div>

                  {/* Budget Allocation Progress Bar */}
                  <div style={{ marginBottom: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 700, color: "var(--muted)", marginBottom: "8px" }}>
                      <span>BUDGET ALLOCATION</span>
                      <span>Target: ₹{itinerary.targetBudget.toLocaleString()}</span>
                    </div>

                    <div style={{ display: "flex", height: "10px", borderRadius: "6px", overflow: "hidden", background: "#e2e8f0" }}>
                      <div
                        style={{
                          width: `${(itinerary.budgetSplit.accommodation / itinerary.totalEstimatedCost) * 100}%`,
                          background: "#0d9488",
                        }}
                        title={`Stays: ₹${itinerary.budgetSplit.accommodation}`}
                      />
                      <div
                        style={{
                          width: `${(itinerary.budgetSplit.transitCabs / itinerary.totalEstimatedCost) * 100}%`,
                          background: "#f97316",
                        }}
                        title={`Cabs & Transit: ₹${itinerary.budgetSplit.transitCabs}`}
                      />
                      <div
                        style={{
                          width: `${(itinerary.budgetSplit.activitiesAndFood / itinerary.totalEstimatedCost) * 100}%`,
                          background: "#38bdf8",
                        }}
                        title={`Activities & Food: ₹${itinerary.budgetSplit.activitiesAndFood}`}
                      />
                      <div
                        style={{
                          width: `${(itinerary.budgetSplit.buffer / itinerary.totalEstimatedCost) * 100}%`,
                          background: "#10b981",
                        }}
                        title={`Buffer: ₹${itinerary.budgetSplit.buffer}`}
                      />
                    </div>

                    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "10px", fontSize: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#0d9488" }} />
                        <span>🏨 Stays: <strong>₹{itinerary.budgetSplit.accommodation.toLocaleString()}</strong></span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#f97316" }} />
                        <span>🚗 Cabs &amp; Rides: <strong>₹{itinerary.budgetSplit.transitCabs.toLocaleString()}</strong></span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#38bdf8" }} />
                        <span>🍽️ Activities &amp; Dining: <strong>₹{itinerary.budgetSplit.activitiesAndFood.toLocaleString()}</strong></span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#10b981" }} />
                        <span>🛡️ Buffer: <strong>₹{itinerary.budgetSplit.buffer.toLocaleString()}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div style={{ display: "flex", gap: "10px", borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={copyPlanSummary}
                      style={{ fontSize: "13px" }}
                    >
                      📋 Copy Summary
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => window.print()}
                      style={{ fontSize: "13px" }}
                    >
                      🖨️ Print Itinerary
                    </button>
                    <button
                      type="button"
                      className="btn-primary"
                      style={{ marginLeft: "auto", fontSize: "13px" }}
                      onClick={() => {
                        onSearchStayInDestination(itinerary.destination);
                        onNavigate("Stays");
                      }}
                    >
                      🏨 Browse Stays in {itinerary.destination} ➔
                    </button>
                  </div>
                </div>

                {/* Day-by-Day Timeline */}
                <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  {itinerary.daysPlan.map((day) => (
                    <div
                      key={day.dayNumber}
                      style={{
                        background: "white",
                        borderRadius: "16px",
                        padding: "24px",
                        border: "1px solid var(--border)",
                        boxShadow: "var(--shadow-sm)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <div>
                          <span className="badge badge-primary" style={{ marginBottom: "4px" }}>
                            Day {day.dayNumber}
                          </span>
                          <h3 style={{ fontSize: "18px", fontWeight: 800 }}>{day.title}</h3>
                          <p style={{ color: "var(--muted)", fontSize: "13px" }}>{day.subtitle}</p>
                        </div>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--dark)" }}>
                          Day Budget: <span style={{ color: "var(--primary)" }}>₹{day.dayCost.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Activities List */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "18px" }}>
                        {day.activities.map((act, actIdx) => (
                          <div
                            key={actIdx}
                            style={{
                              padding: "14px",
                              borderRadius: "10px",
                              background: "var(--bg-page)",
                              border: "1px solid var(--border)",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: 800,
                                  textTransform: "uppercase",
                                  color: act.timeOfDay === "Morning" ? "#0284c7" : act.timeOfDay === "Afternoon" ? "#ea580c" : "#7c3aed",
                                }}
                              >
                                {act.timeOfDay} &bull; {act.location}
                              </span>
                              {act.estimatedCost > 0 && (
                                <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--muted)" }}>
                                  ~₹{act.estimatedCost}
                                </span>
                              )}
                            </div>

                            <h4 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "4px" }}>{act.title}</h4>
                            <p style={{ fontSize: "13px", color: "var(--dark-muted)", lineHeight: "1.5" }}>{act.description}</p>

                            {/* Integrated Cab Transfer Recommendation */}
                            {act.transitSuggestion && (
                              <div
                                style={{
                                  marginTop: "10px",
                                  padding: "10px 14px",
                                  borderRadius: "8px",
                                  background: "#fff7ed",
                                  border: "1px solid #fed7aa",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  flexWrap: "wrap",
                                  gap: "8px",
                                }}
                              >
                                <div>
                                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#c2410c" }}>
                                    🚗 Suggested Cab Transit: {act.transitSuggestion.pickup} &rarr; {act.transitSuggestion.dropoff}
                                  </div>
                                  <div style={{ fontSize: "11px", color: "#9a3412" }}>
                                    {act.transitSuggestion.vehicleType} &bull; Est. Fare: ₹{act.transitSuggestion.estimatedFare}
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  className="btn-accent"
                                  style={{ padding: "6px 12px", fontSize: "12px" }}
                                  onClick={() => {
                                    if (onBookCabForTrip) {
                                      onBookCabForTrip(act.transitSuggestion!.dropoff);
                                    } else {
                                      onNavigate("Rides");
                                    }
                                  }}
                                >
                                  Book Cab ➔
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Recommended Stay for the Night */}
                      {day.recommendedStay && (
                        <div
                          style={{
                            padding: "12px 16px",
                            borderRadius: "10px",
                            background: "var(--primary-light)",
                            border: "1px solid var(--primary-border)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "10px",
                          }}
                        >
                          <div>
                            <div style={{ fontSize: "11px", color: "var(--primary)", fontWeight: 800, textTransform: "uppercase" }}>
                              Recommended Stay for Night {day.dayNumber}
                            </div>
                            <div style={{ fontWeight: 700, fontSize: "14px" }}>
                              {day.recommendedStay.name} &bull; ₹{day.recommendedStay.pricePerNight}/night
                            </div>
                          </div>

                          <button
                            type="button"
                            className="btn-primary"
                            style={{ padding: "6px 14px", fontSize: "12px" }}
                            onClick={() => {
                              onSearchStayInDestination(day.recommendedStay!.city);
                              onNavigate("Stays");
                            }}
                          >
                            View Stay Details 🏨
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Highlights and Tips Row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  <div style={{ background: "white", borderRadius: "16px", padding: "20px", border: "1px solid var(--border)" }}>
                    <h4 style={{ fontSize: "16px", fontWeight: 800, marginBottom: "12px" }}>Top Destination Highlights</h4>
                    <ul style={{ paddingLeft: "18px", fontSize: "13px", color: "var(--dark-muted)", display: "flex", flexDirection: "column", gap: "8px" }}>
                      {itinerary.highlights.map((h, hIdx) => (
                        <li key={hIdx}>{h}</li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ background: "white", borderRadius: "16px", padding: "20px", border: "1px solid var(--border)" }}>
                    <h4 style={{ fontSize: "16px", fontWeight: 800, marginBottom: "12px" }}>Local Insider Advice</h4>
                    <ul style={{ paddingLeft: "18px", fontSize: "13px", color: "var(--dark-muted)", display: "flex", flexDirection: "column", gap: "8px" }}>
                      {itinerary.localTips.map((t, tIdx) => (
                        <li key={tIdx}>{t}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 2: AI TRAVEL CONCIERGE (LIVE CHAT)                */}
      {/* ========================================================= */}
      {activeSubTab === "chat" && (
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-sm)",
            maxWidth: "880px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            height: "640px",
            overflow: "hidden",
          }}
        >
          {/* Chat Header */}
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "var(--bg-page)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  background: "var(--primary-light)",
                  border: "2px solid var(--primary-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                }}
              >
                🤖
              </div>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 800 }}>Travel Nexus AI Concierge</h3>
                <span style={{ fontSize: "12px", color: "#059669", display: "flex", alignItems: "center", gap: "4px" }}>
                  <span className="live-pulse-dot" style={{ width: "8px", height: "8px" }} /> Online &bull; Active in {destination}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="btn-secondary"
              style={{ fontSize: "12px", padding: "6px 12px" }}
              onClick={() => {
                setChatMessages([
                  {
                    id: "welcome-reset",
                    sender: "ai",
                    text: "Conversation refreshed. How can I assist your travels today?",
                    timestamp: "Just now",
                  },
                ]);
              }}
            >
              Clear Chat
            </button>
          </div>

          {/* Chat Message Thread */}
          <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: msg.sender === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div className={msg.sender === "user" ? "chat-bubble-user" : "chat-bubble-ai"}>
                  <div style={{ whiteSpace: "pre-wrap", fontSize: "14px" }}>{msg.text}</div>

                  {/* Contextual Action Buttons */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px" }}>
                      {msg.actions.map((act, actIdx) => (
                        <button
                          key={actIdx}
                          type="button"
                          className="btn-secondary"
                          style={{
                            fontSize: "12px",
                            padding: "6px 10px",
                            background: "white",
                            borderColor: "var(--primary)",
                            color: "var(--primary)",
                            fontWeight: 700,
                          }}
                          onClick={() => handleActionClick(act)}
                        >
                          {act.label} ➔
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <small style={{ color: "var(--light-muted)", fontSize: "10px", marginTop: "4px" }}>
                  {msg.timestamp}
                </small>
              </div>
            ))}

            {chatLoading && (
              <div style={{ display: "flex", gap: "8px", alignItems: "center", color: "var(--muted)", fontSize: "13px" }}>
                <span className="live-pulse-dot" />
                <span>AI Concierge is typing...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Pre-populated Questions Bar */}
          <div style={{ padding: "8px 16px", background: "var(--bg-page)", borderTop: "1px solid var(--border)", display: "flex", gap: "6px", overflowX: "auto" }}>
            {[
              "Best cafes in Old Manali?",
              "How much for 4 days in Goa?",
              "What is cab fare from airport?",
              "Is Solang paragliding safe?",
            ].map((q) => (
              <button
                key={q}
                type="button"
                className="cat-pill"
                style={{ fontSize: "11px", padding: "4px 10px", whiteSpace: "nowrap" }}
                onClick={() => handleSendChat(q)}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <div style={{ padding: "16px", borderTop: "1px solid var(--border)", display: "flex", gap: "10px" }}>
            <input
              type="text"
              className="form-input"
              style={{ flex: 1 }}
              placeholder="Ask about stays, cabs, food, sightseeing, or budget..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendChat();
              }}
            />
            <button
              type="button"
              className="btn-accent"
              style={{ padding: "0 22px", fontWeight: 700 }}
              onClick={() => handleSendChat()}
              disabled={chatLoading}
            >
              Send ➔
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 3: AI REVIEW SYNTHESIZER                          */}
      {/* ========================================================= */}
      {activeSubTab === "reviews" && (
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          {/* Search Card */}
          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "16px",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-sm)",
              marginBottom: "24px",
            }}
          >
            <h3 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "8px" }}>
              Synthesize Hundreds of Guest Reviews Instantly
            </h3>
            <p style={{ color: "var(--muted)", fontSize: "14px", marginBottom: "16px" }}>
              Instead of reading 150+ individual reviews, AI summarizes sentiment, key pros, and minor cautions in seconds.
            </p>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <input
                type="text"
                className="form-input"
                style={{ flex: 1, minWidth: "260px" }}
                value={stayTitleInput}
                onChange={(e) => setStayTitleInput(e.target.value)}
                placeholder="Enter stay name or location..."
              />
              <button
                type="button"
                className="btn-primary"
                onClick={handleSynthesizeReviews}
                disabled={loadingReviews}
              >
                {loadingReviews ? "Synthesizing..." : "Analyze Reviews 🤖"}
              </button>
            </div>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px", fontSize: "12px" }}>
              <span style={{ color: "var(--muted)" }}>Quick Try:</span>
              {[
                "Mountain View Homestay, Manali",
                "Portuguese Heritage Villa, Goa",
                "Haveli Heritage Palace, Jaipur",
              ].map((name) => (
                <button
                  key={name}
                  type="button"
                  className="cat-pill"
                  style={{ fontSize: "11px", padding: "2px 8px" }}
                  onClick={() => {
                    setStayTitleInput(name);
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Synthesis Display */}
          {reviewSummary && (
            <div
              style={{
                background: "white",
                borderRadius: "16px",
                padding: "28px",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              {/* Score Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "16px",
                  borderBottom: "1px solid var(--border)",
                  paddingBottom: "20px",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <span className="badge badge-primary" style={{ marginBottom: "6px" }}>
                    ⭐ AI Synthesized Sentiment
                  </span>
                  <h3 style={{ fontSize: "22px", fontWeight: 800 }}>{reviewSummary.stayTitle}</h3>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--primary)" }}>
                      ★ {reviewSummary.overallRating}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--muted)" }}>Average Guest Rating</div>
                  </div>
                  <div
                    style={{
                      background: "#ecfdf5",
                      border: "1px solid #a7f3d0",
                      borderRadius: "10px",
                      padding: "8px 14px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "18px", fontWeight: 800, color: "#059669" }}>
                      {reviewSummary.sentimentScore}%
                    </div>
                    <small style={{ color: "#047857", fontSize: "11px" }}>Positive Sentiment</small>
                  </div>
                </div>
              </div>

              {/* Executive Summary Paragraph */}
              <div
                style={{
                  background: "var(--bg-page)",
                  padding: "16px 20px",
                  borderRadius: "12px",
                  borderLeft: "4px solid var(--primary)",
                  fontSize: "14px",
                  lineHeight: "1.6",
                  marginBottom: "24px",
                  color: "var(--dark)",
                }}
              >
                <strong>AI Executive Summary: </strong>
                {reviewSummary.summary}
              </div>

              {/* Top Highlights */}
              <div style={{ marginBottom: "24px" }}>
                <h4 style={{ fontSize: "15px", fontWeight: 800, marginBottom: "12px" }}>
                  🏆 What Guests Loved Most
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {reviewSummary.topHighlights.map((hl, hlIdx) => (
                    <div
                      key={hlIdx}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "8px",
                        background: "var(--bg-page)",
                        fontSize: "13px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span style={{ color: "#059669" }}>✓</span>
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pros and Cons Split */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
                <div style={{ background: "#f0fdf4", padding: "16px", borderRadius: "12px", border: "1px solid #bbf7d0" }}>
                  <h5 style={{ color: "#166534", fontWeight: 800, marginBottom: "8px", fontSize: "14px" }}>
                    Key Strengths (Pros)
                  </h5>
                  <ul style={{ paddingLeft: "16px", fontSize: "13px", color: "#14532d", display: "flex", flexDirection: "column", gap: "6px" }}>
                    {reviewSummary.pros.map((p, pIdx) => (
                      <li key={pIdx}>{p}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ background: "#fff7ed", padding: "16px", borderRadius: "12px", border: "1px solid #fed7aa" }}>
                  <h5 style={{ color: "#9a3412", fontWeight: 800, marginBottom: "8px", fontSize: "14px" }}>
                    Things to Keep in Mind (Cons)
                  </h5>
                  <ul style={{ paddingLeft: "16px", fontSize: "13px", color: "#7c2d12", display: "flex", flexDirection: "column", gap: "6px" }}>
                    {reviewSummary.cons.map((c, cIdx) => (
                      <li key={cIdx}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Best Suited For Personas */}
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--muted)" }}>Best Suited For:</span>
                  {reviewSummary.idealFor.map((persona, prIdx) => (
                    <span
                      key={prIdx}
                      style={{
                        background: "var(--primary-light)",
                        color: "var(--primary)",
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: 700,
                      }}
                    >
                      {persona}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Trips;
