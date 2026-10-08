import React from "react";
import type { NavTab } from "./Navbar";
import logoImg from "../assets/logo.png";

interface FooterProps {
  onNavClick: (tab: NavTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavClick }) => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <div className="footer-col">
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <img
                src={logoImg}
                alt="Travel Nexus"
                style={{ width: "42px", height: "42px", borderRadius: "50%", objectFit: "cover" }}
              />
              <span style={{ fontSize: "20px", fontWeight: 800 }}>
                TRAVEL <span style={{ color: "var(--primary)" }}>NEXUS</span>
              </span>
            </div>
            <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.6", maxWidth: "340px", marginBottom: "8px" }}>
              <strong>Travel. Connect. Explore.</strong>
            </p>
            <p style={{ color: "#64748b", fontSize: "13px", lineHeight: "1.5", maxWidth: "340px" }}>
              The unified travel platform bringing stays, on-demand rides, and intelligent trip planning together in one connected experience.
            </p>
          </div>

          <div className="footer-col">
            <h4>Platform</h4>
            <ul>
              <li>
                <a href="#stays" onClick={(e) => { e.preventDefault(); onNavClick("Stays"); }}>
                  Browse Stays
                </a>
              </li>
              <li>
                <a href="#rides" onClick={(e) => { e.preventDefault(); onNavClick("Rides"); }}>
                  Book Rides
                </a>
              </li>
              <li>
                <a href="#trips" onClick={(e) => { e.preventDefault(); onNavClick("Trips"); }}>
                  AI Trip Planner
                </a>
              </li>
              <li>
                <a href="#explore" onClick={(e) => { e.preventDefault(); onNavClick("Explore"); }}>
                  Popular Destinations
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Roles &amp; Partners</h4>
            <ul>
              <li>
                <a href="#driver" onClick={(e) => { e.preventDefault(); onNavClick("Profile"); }}>
                  Driver Portal
                </a>
              </li>
              <li>
                <a href="#host" onClick={(e) => { e.preventDefault(); onNavClick("Profile"); }}>
                  Host Your Home
                </a>
              </li>
              <li>
                <a href="#admin" onClick={(e) => { e.preventDefault(); onNavClick("Profile"); }}>
                  Admin System
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Technology</h4>
            <ul>
              <li><span style={{ color: "#94a3b8", fontSize: "13px" }}>React + TypeScript</span></li>
              <li><span style={{ color: "#94a3b8", fontSize: "13px" }}>Node.js + Express</span></li>
              <li><span style={{ color: "#94a3b8", fontSize: "13px" }}>MongoDB Atlas</span></li>
              <li><span style={{ color: "#94a3b8", fontSize: "13px" }}>Socket.IO Real-Time</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div>&copy; {new Date().getFullYear()} Travel Nexus. All rights reserved. &bull; Plan. Ride. Stay. Explore.</div>
          <div style={{ display: "flex", gap: "16px" }}>
            <span>Built with ❤️ for Global Travelers</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
