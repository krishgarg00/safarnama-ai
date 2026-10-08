import React, { useEffect, useState } from "react";
import type { RideItem } from "../api/rides";

interface RideRouteMapProps {
  ride: RideItem;
}

export const RideRouteMap: React.FC<RideRouteMapProps> = ({ ride }) => {
  const [progress, setProgress] = useState(0);

  // Set animated progress position along the route based on status
  useEffect(() => {
    let target = 0;
    if (ride.status === "REQUESTED") target = 5;
    else if (ride.status === "ACCEPTED") target = 15;
    else if (ride.status === "DRIVER_ARRIVING") target = 25;
    else if (ride.status === "IN_PROGRESS") target = 65;
    else if (ride.status === "COMPLETED") target = 100;
    else if (ride.status === "CANCELLED") target = 0;

    const timer = setTimeout(() => setProgress(target), 200);
    return () => clearTimeout(timer);
  }, [ride.status]);

  // SVG Coordinates
  const startX = 80;
  const startY = 180;
  const controlX1 = 180;
  const controlY1 = 80;
  const controlX2 = 340;
  const controlY2 = 240;
  const endX = 460;
  const endY = 120;

  // Approximate position calculation along cubic bezier
  const t = progress / 100;
  const carX =
    Math.pow(1 - t, 3) * startX +
    3 * Math.pow(1 - t, 2) * t * controlX1 +
    3 * (1 - t) * Math.pow(t, 2) * controlX2 +
    Math.pow(t, 3) * endX;

  const carY =
    Math.pow(1 - t, 3) * startY +
    3 * Math.pow(1 - t, 2) * t * controlY1 +
    3 * (1 - t) * Math.pow(t, 2) * controlY2 +
    Math.pow(t, 3) * endY;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "280px",
        borderRadius: "14px",
        overflow: "hidden",
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        border: "1px solid var(--border)",
        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)",
      }}
    >
      {/* Background Stylized Grid & Land Features */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 540 280"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          </pattern>
          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0d9488" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="glow" />
            <feComposite in="SourceGraphic" in2="glow" operator="over" />
          </filter>
        </defs>

        {/* Map grid background */}
        <rect width="100%" height="100%" fill="url(#mapGrid)" />

        {/* Decorative Secondary Roads */}
        <path d="M 0 100 Q 200 130 540 60" stroke="rgba(255,255,255,0.07)" strokeWidth="4" fill="none" />
        <path d="M 40 280 Q 220 200 400 280" stroke="rgba(255,255,255,0.07)" strokeWidth="3" fill="none" />
        <path d="M 160 0 Q 180 160 140 280" stroke="rgba(255,255,255,0.07)" strokeWidth="2" fill="none" />
        <path d="M 380 0 Q 360 120 420 280" stroke="rgba(255,255,255,0.07)" strokeWidth="2" fill="none" />

        {/* Main Travel Nexus Active Route */}
        <path
          d={`M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`}
          stroke="url(#routeGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          filter="url(#glow)"
        />

        {/* Animated Dashed Pulse line along route */}
        <path
          d={`M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`}
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="8 12"
          fill="none"
          style={{ animation: "dash 1.5s linear infinite" }}
        />

        {/* Pickup Pin */}
        <g transform={`translate(${startX}, ${startY})`}>
          <circle r="14" fill="#0d9488" opacity="0.3" />
          <circle r="8" fill="#0d9488" />
          <circle r="3" fill="#ffffff" />
        </g>

        {/* Dropoff Pin */}
        <g transform={`translate(${endX}, ${endY})`}>
          <circle r="14" fill="#f97316" opacity="0.3" />
          <circle r="8" fill="#f97316" />
          <circle r="3" fill="#ffffff" />
        </g>

        {/* Animated Moving Car Icon along route */}
        {ride.status !== "CANCELLED" && (
          <g transform={`translate(${carX}, ${carY})`} style={{ transition: "all 1s ease" }}>
            <circle r="16" fill="rgba(14, 165, 233, 0.3)" filter="url(#glow)" />
            <circle r="12" fill="#0284c7" />
            <text x="0" y="4" textAnchor="middle" fontSize="12" fill="#ffffff">
              🚗
            </text>
          </g>
        )}
      </svg>

      {/* Floating HUD Badges on Map */}
      <div
        style={{
          position: "absolute",
          top: "12px",
          left: "14px",
          background: "rgba(15, 23, 42, 0.85)",
          backdropFilter: "blur(6px)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          borderRadius: "8px",
          padding: "6px 12px",
          color: "white",
          fontSize: "12px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span style={{ color: "#34d399", fontWeight: "bold" }}>● LIVE GPS</span>
        <span style={{ color: "#cbd5e1" }}>
          {ride.status === "REQUESTED"
            ? "Locating nearest driver..."
            : ride.status === "ACCEPTED"
            ? "Driver matched &bull; Preparing"
            : ride.status === "DRIVER_ARRIVING"
            ? "Driver arriving &bull; ~3 mins"
            : ride.status === "IN_PROGRESS"
            ? "En route to destination"
            : ride.status === "COMPLETED"
            ? "Trip completed 🎉"
            : "Ride cancelled"}
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "12px",
          left: "14px",
          right: "14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(15, 23, 42, 0.85)",
          backdropFilter: "blur(6px)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          borderRadius: "8px",
          padding: "8px 14px",
          color: "white",
          fontSize: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ color: "#14b8a6" }}>📍</span>
          <span style={{ fontWeight: 600 }}>{ride.pickupLocation}</span>
        </div>
        <span style={{ color: "#64748b" }}>&rarr;</span>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ color: "#f97316" }}>🏁</span>
          <span style={{ fontWeight: 600 }}>{ride.dropoffLocation}</span>
        </div>
      </div>
    </div>
  );
};

export default RideRouteMap;
