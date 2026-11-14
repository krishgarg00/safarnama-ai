export interface Destination {
  id: string;
  name: string;
  state: string;
  tagline: string;
  image: string;
  stayCount: number;
  highlight: string;
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
    stayCount: 12,
    highlight: "❄️ Heaven on Earth",
  },
  {
    id: "rishikesh",
    name: "Rishikesh",
    state: "Uttarakhand",
    tagline: "Ganga aarti, river rafting & yoga ashrams",
    image: "https://images.unsplash.com/photo-1606214174585-fe31582dc6ee?auto=format&fit=crop&w=600&q=80",
    stayCount: 16,
    highlight: "🌊 Spiritual & Adventure",
  },
  {
    id: "udaipur",
    name: "Udaipur",
    state: "Rajasthan",
    tagline: "City of lakes, royal palaces & romantic sunsets",
    image: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80",
    stayCount: 20,
    highlight: "✨ Lake Panorama",
  },
];
