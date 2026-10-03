import React, { useEffect, useState, useMemo } from "react";
import Hero from "../components/Hero";
import PopularDestinations from "../components/PopularDestinations";
import StayCard from "../components/StayCard";
import ConnectedEcosystemBanner from "../components/ConnectedEcosystemBanner";
import { getStays, type StayItem } from "../api/stays";
import type { NavTab } from "../components/Navbar";

// Fallback stays in case backend has few stays or is loading
const FALLBACK_STAYS: StayItem[] = [
  {
    _id: "stay-manali-1",
    title: "Mountain View Homestay & Chalet",
    description: "Cozy wooden cottage offering panoramic views of snow-capped Himalayan peaks.",
    city: "Manali",
    state: "Himachal Pradesh",
    address: "Old Manali Road, near Hidimba Temple",
    pricePerNight: 2500,
    maxGuests: 4,
    amenities: ["Mountain View", "Bonfire", "Free WiFi", "Heater"],
    images: ["https://images.unsplash.com/photo-1586375300773-8384e3e4916f?auto=format&fit=crop&w=600&q=80"],
  },
  {
    _id: "stay-goa-1",
    title: "Beachside Luxury Villa & Pool",
    description: "Private 3BHK villa with private plunge pool, just 2 minutes walking distance from Candolim beach.",
    city: "Goa",
    state: "Goa",
    address: "Candolim Beach Road, North Goa",
    pricePerNight: 4000,
    maxGuests: 6,
    amenities: ["Private Pool", "Beach Access", "Air Conditioning", "Kitchen"],
    images: ["https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80"],
  },
  {
    _id: "stay-jaipur-1",
    title: "Royal Heritage Haveli Suite",
    description: "Step into Rajasthani royalty with traditional courtyards, jharokhas, and authentic cuisine.",
    city: "Jaipur",
    state: "Rajasthan",
    address: "Bani Park, Pink City",
    pricePerNight: 3200,
    maxGuests: 3,
    amenities: ["Heritage Decor", "Rooftop Dining", "AC", "Cultural Events"],
    images: ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80"],
  },
  {
    _id: "stay-delhi-1",
    title: "Urban Boutique Hotel & Lounge",
    description: "Modern minimalist hotel located next to metro connectivity and prime shopping hubs.",
    city: "Delhi",
    state: "Delhi",
    address: "Aerocity Hospitality District, New Delhi",
    pricePerNight: 3000,
    maxGuests: 2,
    amenities: ["High-speed WiFi", "Airport Shuttle", "Gym", "Breakfast Included"],
    images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80"],
  },
];

interface HomeProps {
  onNavigate: (tab: NavTab) => void;
  onRideToStay: (stay: StayItem) => void;
  onBookStay: (stay: StayItem) => void;
}

export const Home: React.FC<HomeProps> = ({
  onNavigate,
  onRideToStay,
  onBookStay,
}) => {
  const [stays, setStays] = useState<StayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    let isMounted = true;
    const fetchStays = async () => {
      try {
        setLoading(true);
        const data = await getStays();
        if (isMounted) {
          if (data && data.stays && data.stays.length > 0) {
            setStays(data.stays);
          } else {
            setStays(FALLBACK_STAYS);
          }
        }
      } catch (err) {
        console.warn("Could not fetch stays from API, using curated fallbacks:", err);
        if (isMounted) {
          setStays(FALLBACK_STAYS);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchStays();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredStays = useMemo(() => {
    return stays.filter((stay) => {
      // Search query check
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !query ||
        stay.city.toLowerCase().includes(query) ||
        stay.title.toLowerCase().includes(query) ||
        stay.state.toLowerCase().includes(query);

      // Category check
      let matchesCategory = true;
      if (selectedCategory === "mountains") {
        matchesCategory = ["manali", "kashmir", "shimla", "rishikesh"].some((c) =>
          stay.city.toLowerCase().includes(c)
        );
      } else if (selectedCategory === "beaches") {
        matchesCategory = ["goa", "kerala", "pondicherry", "gokarna"].some((c) =>
          stay.city.toLowerCase().includes(c)
        );
      } else if (selectedCategory === "heritage") {
        matchesCategory = ["jaipur", "udaipur", "agra", "varanasi"].some((c) =>
          stay.city.toLowerCase().includes(c)
        );
      } else if (selectedCategory === "city") {
        matchesCategory = ["delhi", "mumbai", "bangalore", "chandigarh"].some((c) =>
          stay.city.toLowerCase().includes(c)
        );
      }

      return matchesQuery && matchesCategory;
    });
  }, [stays, searchQuery, selectedCategory]);

  return (
    <div>
      {/* 1. Hero Section with Search & Categories */}
      <Hero
        onSearch={(query, cat) => {
          setSearchQuery(query);
          setSelectedCategory(cat);
        }}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
        selectedCategory={selectedCategory}
      />

      <div className="container" style={{ paddingTop: "24px", paddingBottom: "48px" }}>
        {/* 2. Popular Destinations */}
        <PopularDestinations
          onSelectDestination={(destName) => {
            setSearchQuery(destName);
            // Scroll smoothly down to the stays section
            const staysSec = document.getElementById("recommended-stays");
            if (staysSec) staysSec.scrollIntoView({ behavior: "smooth" });
          }}
        />

        {/* 3. Recommended Stays Section */}
        <section id="recommended-stays" style={{ marginBottom: "64px" }}>
          <div className="section-header">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h2 className="section-title">Recommended Stays</h2>
                {searchQuery && (
                  <span className="badge badge-primary">
                    Filtered by: &quot;{searchQuery}&quot;
                    <button
                      onClick={() => setSearchQuery("")}
                      style={{ background: "transparent", marginLeft: "6px", fontWeight: "bold" }}
                    >
                      ✕
                    </button>
                  </span>
                )}
              </div>
              <p className="section-subtitle">
                Comfortable hotels, cozy homestays, and unique getaways ready for instant booking.
              </p>
            </div>
            <span className="section-action" onClick={() => onNavigate("Stays")}>
              Explore all stays &rarr;
            </span>
          </div>

          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
              Loading recommended stays...
            </div>
          ) : filteredStays.length === 0 ? (
            <div
              style={{
                padding: "48px 24px",
                textAlign: "center",
                background: "white",
                borderRadius: "12px",
                border: "1px dashed #cbd5e1",
              }}
            >
              <div style={{ fontSize: "36px", marginBottom: "8px" }}>🔍</div>
              <h3 style={{ fontSize: "18px", marginBottom: "6px" }}>No stays found matching your criteria</h3>
              <p style={{ color: "#64748b", marginBottom: "16px" }}>
                Try searching for other popular destinations like Manali, Goa, Jaipur, or Delhi.
              </p>
              <button
                className="btn-secondary"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="stays-grid">
              {filteredStays.map((stay) => (
                <StayCard
                  key={stay._id}
                  stay={stay}
                  onBookClick={onBookStay}
                  onRideToStayClick={onRideToStay}
                />
              ))}
            </div>
          )}
        </section>

        {/* 4. Connected Ecosystem Banner */}
        <ConnectedEcosystemBanner
          onExploreRides={() => onNavigate("Rides")}
          onExploreStays={() => onNavigate("Stays")}
          onExploreTrips={() => onNavigate("Trips")}
        />
      </div>
    </div>
  );
};

export default Home;
