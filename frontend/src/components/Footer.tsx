import React from "react";
import type { NavTab } from "./Navbar";

interface FooterProps {
  onNavClick: (tab: NavTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavClick }) => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <div className="footer-col">
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <span style={{ fontSize: "22px" }}>🧭</span>
              <span style={{ fontSize: "20px", fontWeight: 800 }}>
                Safarnama<span style={{ color: "var(--primary)" }}>AI</span>
              </span>
            </div>
            <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.6", maxWidth: "340px" }}>
              The unified AI travel platform bringing stays, on-demand rides, and intelligent trip planning together in one seamless experience.
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
          <div>&copy; {new Date().getFullYear()} Safarnama AI. All rights reserved.</div>
          <div style={{ display: "flex", gap: "16px" }}>
            <span>Built with ❤️ for Indian Travelers</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
