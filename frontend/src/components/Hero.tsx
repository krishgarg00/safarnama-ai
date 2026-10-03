import React, { useState } from "react";

interface HeroProps {
  onSearch: (query: string, category: string) => void;
  onSelectCategory: (category: string) => void;
  selectedCategory: string;
}

export const Hero: React.FC<HeroProps> = ({
  onSearch,
  onSelectCategory,
  selectedCategory,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const categories = [
    { id: "all", label: "All Experiences", icon: "✨" },
    { id: "mountains", label: "Mountains", icon: "🏔️" },
    { id: "beaches", label: "Beaches", icon: "🏖️" },
    { id: "heritage", label: "Heritage", icon: "🏰" },
    { id: "city", label: "City Escapes", icon: "🏙️" },
  ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm, selectedCategory);
  };

  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-pill">
          <span>🤖 AI-Powered Travel Assistant Active</span>
        </div>

        <h1 className="hero-title">
          Where do you want to <span className="gradient-text">go next?</span>
        </h1>

        <p className="hero-subtitle">
          Discover handpicked stays, hail real-time rides, and plan your journey with intelligent travel assistance in one unified platform.
        </p>

        {/* Search Card */}
        <div className="search-card">
          <form onSubmit={handleFormSubmit}>
            <div className="search-input-group">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Search destination, city, or stay (e.g., Manali, Goa, Jaipur, Kashmir)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="btn-primary" style={{ padding: "10px 24px" }}>
                Explore Now
              </button>
            </div>
          </form>

          {/* Category Filter Pills */}
          <div className="search-category-pills">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`cat-pill ${selectedCategory === cat.id ? "active" : ""}`}
                onClick={() => {
                  onSelectCategory(cat.id);
                  onSearch(searchTerm, cat.id);
                }}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
