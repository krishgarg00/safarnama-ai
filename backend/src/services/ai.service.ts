import Review from "../models/Ride"; // For fallback types if needed

export interface PlanTripParams {
  destination: string;
  days: number;
  budget?: string | number;
  vibe?: string;
  travelers?: string;
}

export interface ItineraryActivity {
  timeOfDay: "Morning" | "Afternoon" | "Evening";
  title: string;
  description: string;
  location: string;
  estimatedCost: number;
  transitSuggestion?: {
    pickup: string;
    dropoff: string;
    estimatedFare: number;
    vehicleType: string;
  };
}

export interface ItineraryDay {
  dayNumber: number;
  title: string;
  subtitle: string;
  activities: ItineraryActivity[];
  dayCost: number;
  recommendedStay?: {
    name: string;
    city: string;
    pricePerNight: number;
    tag: string;
  };
}

export interface GeneratedItinerary {
  destination: string;
  days: number;
  targetBudget: number;
  totalEstimatedCost: number;
  vibe: string;
  travelers: string;
  budgetSplit: {
    accommodation: number;
    transitCabs: number;
    activitiesAndFood: number;
    buffer: number;
  };
  highlights: string[];
  daysPlan: ItineraryDay[];
  localTips: string[];
  bestSeason: string;
}

export interface ReviewSummary {
  stayTitle: string;
  overallRating: number;
  sentimentScore: number; // percentage positive
  summary: string;
  topHighlights: string[];
  pros: string[];
  cons: string[];
  idealFor: string[];
  sampleQuotes: string[];
}

export interface ChatMessageResponse {
  reply: string;
  suggestedActions: Array<{
    type: "BOOK_CAB" | "VIEW_STAYS" | "EXPLORE_DESTINATION" | "PLAN_TRIP";
    label: string;
    payload?: string;
  }>;
}

// Destination Knowledge Base
const DESTINATION_DATA: Record<
  string,
  {
    bestSeason: string;
    highlights: string[];
    tips: string[];
    sampleStays: Array<{ name: string; price: number; tag: string }>;
    itineraryTemplates: Array<{
      title: string;
      subtitle: string;
      activities: ItineraryActivity[];
    }>;
  }
> = {
  manali: {
    bestSeason: "October to June (Snow in Dec-Feb, pleasant summer in Apr-Jun)",
    highlights: [
      "Solang Valley adventure sports (Paragliding, Zorbing)",
      "Old Manali hippie culture & wooden riverside cafes",
      "Jogini Waterfall trek and Vashisht hot springs",
      "Atal Tunnel drive to Sissu and Lahaul Valley",
      "Hidimba Devi Temple amidst century-old cedar trees",
    ],
    tips: [
      "Book Travel Nexus mountain-certified cabs for Solang & Atal Tunnel routes.",
      "Carry light woolens even in summer evenings; heavy thermals in winter.",
      "Try local Himachali Siddu with ghee at Cafe 1947 or Mall Road stalls.",
    ],
    sampleStays: [
      { name: "Cedar Ridge Mountain Chalet", price: 3400, tag: "Riverside View" },
      { name: "Old Manali Heritage Homestay", price: 2100, tag: "Host Recommended" },
      { name: "Solang Alpine Luxury Cottage", price: 4800, tag: "Valley Panorama" },
    ],
    itineraryTemplates: [
      {
        title: "Mountain Arrival & Old Manali Stroll",
        subtitle: "Check-in, riverside cafe hopping & cedar forest walk",
        activities: [
          {
            timeOfDay: "Morning",
            title: "Arrival & Stay Check-in",
            description: "Check into your scenic mountain stay. Unpack, drink hot ginger-lemon tea, and soak in snow-capped views.",
            location: "Old Manali",
            estimatedCost: 0,
            transitSuggestion: {
              pickup: "Bhuntar Airport / Bus Stand",
              dropoff: "Old Manali Homestay",
              estimatedFare: 850,
              vehicleType: "Nexus Comfort Sedan",
            },
          },
          {
            timeOfDay: "Afternoon",
            title: "Hidimba Devi Temple & Van Vihar",
            description: "Wander through the tranquil 16th-century wooden temple nestled in towering deodar forests.",
            location: "Dhungri Forest",
            estimatedCost: 350,
          },
          {
            timeOfDay: "Evening",
            title: "Old Manali Cafes & Live Music",
            description: "Enjoy wood-fired trout pizza and live acoustic music beside the gushing Manalsu river.",
            location: "Cafe 1947, Old Manali",
            estimatedCost: 900,
          },
        ],
      },
      {
        title: "Solang Valley Adventures & Cable Car",
        subtitle: "Thrills, snow slopes & high-altitude viewpoints",
        activities: [
          {
            timeOfDay: "Morning",
            title: "Scenic Ride to Solang Valley",
            description: "Embark on an early morning drive along the Beas river. Take the ropeway gondola up to Mount Phatru.",
            location: "Solang Valley",
            estimatedCost: 700,
            transitSuggestion: {
              pickup: "Old Manali Stay",
              dropoff: "Solang Valley Ground",
              estimatedFare: 650,
              vehicleType: "Nexus XL SUV",
            },
          },
          {
            timeOfDay: "Afternoon",
            title: "Paragliding & Adventure Activities",
            description: "Experience tandem paragliding gliding high above the pine-covered peaks with certified instructors.",
            location: "Solang Adventure Park",
            estimatedCost: 2200,
          },
          {
            timeOfDay: "Evening",
            title: "Hot Maggi & Mountain Sunset",
            description: "Unwind at local wooden huts with steaming Maggi and masala chai as the sunset bathes the peaks in gold.",
            location: "Solang Viewpoint",
            estimatedCost: 300,
          },
        ],
      },
      {
        title: "Jogini Waterfall Trek & Vashisht Springs",
        subtitle: "Nature trails, apple orchards & natural hot sulfur baths",
        activities: [
          {
            timeOfDay: "Morning",
            title: "Hike to Jogini Waterfall",
            description: "A gentle 3km scenic hike through apple orchards and pine groves leading to the multi-tiered cascading falls.",
            location: "Vashisht Village",
            estimatedCost: 200,
            transitSuggestion: {
              pickup: "Stay",
              dropoff: "Vashisht Temple",
              estimatedFare: 350,
              vehicleType: "Nexus Go Hatchback",
            },
          },
          {
            timeOfDay: "Afternoon",
            title: "Vashisht Natural Hot Sulfur Springs",
            description: "Rejuvenate tired muscles in the ancient sacred hot water sulfur springs followed by authentic Tibetan thukpa.",
            location: "Vashisht",
            estimatedCost: 450,
          },
          {
            timeOfDay: "Evening",
            title: "Bonfire & Stargazing at Stay",
            description: "Gather around an outdoor cedarwood bonfire under crystal clear Himalayan night skies.",
            location: "Homestay Lawn",
            estimatedCost: 500,
          },
        ],
      },
      {
        title: "Atal Tunnel & Sissu Lahaul Day Expedition",
        subtitle: "Engineering marvel transit into stark Tibetan-style trans-Himalayas",
        activities: [
          {
            timeOfDay: "Morning",
            title: "Drive through Atal Tunnel (9.02 km)",
            description: "Traverse the world's longest highway tunnel above 10,000 feet, emerging into the dramatic rugged valley of Lahaul.",
            location: "North Portal, Sissu",
            estimatedCost: 0,
            transitSuggestion: {
              pickup: "Manali Stay",
              dropoff: "Sissu Waterfall, Lahaul",
              estimatedFare: 1400,
              vehicleType: "Nexus XL SUV",
            },
          },
          {
            timeOfDay: "Afternoon",
            title: "Sissu Waterfall & Chandra River",
            description: "Marvel at the roaring Sissu waterfall spilling from glaciers into the turquoise Chandra River.",
            location: "Sissu, Lahaul",
            estimatedCost: 400,
          },
          {
            timeOfDay: "Evening",
            title: "Return Drive & Mall Road Souvenirs",
            description: "Head back to Manali to pick up handmade Kullu shawls, pine cone artifacts, and fresh apple jam.",
            location: "The Mall Road",
            estimatedCost: 1200,
          },
        ],
      },
    ],
  },
  goa: {
    bestSeason: "November to March (Sun, surf, beach shacks, and vibrant night markets)",
    highlights: [
      "Baga & Candolim water sports and sunset sailing",
      "Old Goa Portuguese churches (Basilica of Bom Jesus)",
      "Anjuna & Vagator cliff cafes and sunset views",
      "Spice plantation tour & authentic Goan fish curry",
      "Dudhsagar Waterfalls jeep safari",
    ],
    tips: [
      "Book Travel Nexus hourly rental cabs to hop between North and South Goa seamlessly.",
      "Carry sunscreen SPF 50+ and cotton clothes for tropical weather.",
      "Visit Curlies or Thalassa for iconic cliffside sunset vistas.",
    ],
    sampleStays: [
      { name: "Portuguese Heritage Villa", price: 4200, tag: "Private Pool" },
      { name: "Candolim Beachside Cottage", price: 2800, tag: "Walking to Beach" },
      { name: "Vagator Cliffview Suites", price: 5400, tag: "Sunset Deck" },
    ],
    itineraryTemplates: [
      {
        title: "Sun, Sand & Beachside Welcome",
        subtitle: "Check-in, Arabian Sea breeze & sunset shacks",
        activities: [
          {
            timeOfDay: "Morning",
            title: "Arrival & Coastal Check-in",
            description: "Touch down at Goa Mopa / Dabolim Airport and take an air-conditioned cab directly to your coastal stay.",
            location: "Candolim / Calangute",
            estimatedCost: 0,
            transitSuggestion: {
              pickup: "Goa Airport (GOX / GOI)",
              dropoff: "Candolim Stay",
              estimatedFare: 1100,
              vehicleType: "Nexus Comfort Sedan",
            },
          },
          {
            timeOfDay: "Afternoon",
            title: "Water Sports at Candolim Beach",
            description: "Jet skiing, banana boat rides, and parasailing over the emerald Arabian Sea.",
            location: "Candolim Beach",
            estimatedCost: 1800,
          },
          {
            timeOfDay: "Evening",
            title: "Sunset Shack Dinner & Live Reggae",
            description: "Kick back with butter garlic prawns, fresh coconut water, and acoustic sunset tunes on beach shacks.",
            location: "Baga Shack",
            estimatedCost: 1100,
          },
        ],
      },
      {
        title: "Historic Forts & Clifftop Cafes",
        subtitle: "Aguada, Chapora Fort & Vagator sunset",
        activities: [
          {
            timeOfDay: "Morning",
            title: "Aguada Fort & Lighthouse",
            description: "Explore the 17th-century Portuguese fortress overlooking the vast Mandovi river and sea.",
            location: "Sinquerim",
            estimatedCost: 250,
            transitSuggestion: {
              pickup: "Stay",
              dropoff: "Aguada Fort",
              estimatedFare: 380,
              vehicleType: "Nexus Comfort Sedan",
            },
          },
          {
            timeOfDay: "Afternoon",
            title: "Chapora Fort ('Dil Chahta Hai' Fort)",
            description: "Climb the red laterite bastions for panoramic 360-degree vistas of Vagator beach and Morjim coast.",
            location: "Chapora",
            estimatedCost: 150,
          },
          {
            timeOfDay: "Evening",
            title: "Greek Clifftop Dinner at Thalassa",
            description: "Witness the fiery ocean sunset while dining on Greek mezze platters atop Vagator's rocky cliffs.",
            location: "Vagator Cliffs",
            estimatedCost: 1600,
          },
        ],
      },
    ],
  },
  jaipur: {
    bestSeason: "October to March (Pleasant winter sunshine, royal festivals)",
    highlights: [
      "Majestic Amber Fort & elephant/jeep ascent",
      "Hawa Mahal honeycomb palace facade & rooftop cafes",
      "City Palace royal courtyards and astronomical Jantar Mantar",
      "Nahargarh Fort sunset overlooking the Pink City skyline",
      "Chokhi Dhani traditional Rajasthani cultural village feast",
    ],
    tips: [
      "Start Amber Fort visits before 10 AM to avoid crowds and afternoon heat.",
      "Book Travel Nexus full-day sightseeing cab for seamless fort-to-palace travel.",
      "Don't miss Pyaaz Kachori and Lassi at Rawat Mishthan Bhandar.",
    ],
    sampleStays: [
      { name: "Haveli Heritage Palace", price: 3800, tag: "Royal Architecture" },
      { name: "Pink City Boutique Homestay", price: 2200, tag: "Central Location" },
      { name: "Amer Vista Luxury Resort", price: 6100, tag: "Fort Panorama" },
    ],
    itineraryTemplates: [
      {
        title: "Royal Arrival & Pink City Heritage",
        subtitle: "Palaces, bazaars & authentic royal cuisine",
        activities: [
          {
            timeOfDay: "Morning",
            title: "Arrival & Haveli Check-in",
            description: "Arrive at Jaipur Junction or Airport and check into your handcrafted Rajasthani haveli stay.",
            location: "Bani Park / C-Scheme",
            estimatedCost: 0,
            transitSuggestion: {
              pickup: "Jaipur International Airport",
              dropoff: "Heritage Haveli Stay",
              estimatedFare: 420,
              vehicleType: "Nexus Comfort Sedan",
            },
          },
          {
            timeOfDay: "Afternoon",
            title: "City Palace & Jantar Mantar",
            description: "Admire royal peacocks, mirror work courtyards, and ancient UNESCO stone astronomical sundials.",
            location: "Old City",
            estimatedCost: 650,
          },
          {
            timeOfDay: "Evening",
            title: "Hawa Mahal Rooftop Chai & Johari Bazaar",
            description: "Sip spiced kulhad chai across from Hawa Mahal's 953 windows and shop for blue pottery and silver.",
            location: "Hawa Mahal Road",
            estimatedCost: 800,
          },
        ],
      },
      {
        title: "Amber Fort & Nahargarh Sunset",
        subtitle: "Grand hilltop ramparts & panoramic city sunset",
        activities: [
          {
            timeOfDay: "Morning",
            title: "Amber Fort Exploration",
            description: "Ascend the legendary hill fortress; explore Sheesh Mahal (hall of mirrors) and royal gardens.",
            location: "Amer",
            estimatedCost: 600,
            transitSuggestion: {
              pickup: "Stay",
              dropoff: "Amber Fort",
              estimatedFare: 480,
              vehicleType: "Nexus Comfort Sedan",
            },
          },
          {
            timeOfDay: "Afternoon",
            title: "Jal Mahal & Panna Meena Stepwell",
            description: "Capture the floating palace in Man Sagar Lake and the geometric symmetrical stairs of the ancient stepwell.",
            location: "Amer Road",
            estimatedCost: 200,
          },
          {
            timeOfDay: "Evening",
            title: "Sunset at Nahargarh Fort",
            description: "Watch the golden hour light drape across the entire Pink City skyline from the fortress ramparts.",
            location: "Nahargarh Fort",
            estimatedCost: 750,
          },
        ],
      },
    ],
  },
};

export const generateAiItinerary = async (
  params: PlanTripParams
): Promise<GeneratedItinerary> => {
  const { destination, days = 3, budget, vibe = "Adventure & Nature", travelers = "Solo / Couple" } = params;
  const destKey = destination.toLowerCase().trim();

  // Parse target budget
  const numericBudget = typeof budget === "string" 
    ? Number(budget.replace(/[^0-9]/g, "")) || 20000 
    : budget || 20000;

  const destInfo = DESTINATION_DATA[destKey] || {
    bestSeason: "September to May (Pleasant weather and peak seasonal exploration)",
    highlights: [
      `Iconic landmark discovery in ${destination}`,
      "Authentic local street food & regional cuisine tasting",
      "Scenic viewpoints and cultural walking tours",
      "Bustling traditional artisan markets and craft boutiques",
    ],
    tips: [
      `Use Travel Nexus on-demand rides to move between destinations in ${destination}.`,
      "Plan early morning visits to popular sights to avoid lines.",
      "Check local weather forecasts to pack suitable footwear and layers.",
    ],
    sampleStays: [
      { name: `${destination} Riverside Eco Resort`, price: 3100, tag: "Top Rated" },
      { name: `The Heritage Stay of ${destination}`, price: 2300, tag: "Central Location" },
      { name: `${destination} Luxury Suites`, price: 4500, tag: "Premium Comfort" },
    ],
    itineraryTemplates: [
      {
        title: `Welcome & Historic Discovery of ${destination}`,
        subtitle: "Check-in, orientation stroll & regional cuisine",
        activities: [
          {
            timeOfDay: "Morning",
            title: "Arrival & Stay Check-in",
            description: `Arrive in ${destination} and settle into your reserved Travel Nexus accommodation.`,
            location: `${destination} Center`,
            estimatedCost: 0,
            transitSuggestion: {
              pickup: "Main Terminal / Station",
              dropoff: `Stay in ${destination}`,
              estimatedFare: 450,
              vehicleType: "Nexus Comfort Sedan",
            },
          },
          {
            timeOfDay: "Afternoon",
            title: `Iconic Landmark Tour of ${destination}`,
            description: `Visit the central heritage quarter and primary cultural landmarks of ${destination}.`,
            location: "Heritage Quarter",
            estimatedCost: 500,
          },
          {
            timeOfDay: "Evening",
            title: "Local Food Tasting & Sunset Stroll",
            description: `Sample regional signature dishes at renowned local eateries in ${destination}.`,
            location: "Downtown Promenade",
            estimatedCost: 850,
          },
        ],
      },
      {
        title: `Adventure & Scenic Nature of ${destination}`,
        subtitle: "Outdoor excursion, viewpoints & artisan crafts",
        activities: [
          {
            timeOfDay: "Morning",
            title: "Scenic Excursion & Nature Trail",
            description: `Head out to the premier nature trail and panoramic lookout near ${destination}.`,
            location: "High Ridge Viewpoint",
            estimatedCost: 350,
            transitSuggestion: {
              pickup: "Stay",
              dropoff: "Scenic Viewpoint",
              estimatedFare: 550,
              vehicleType: "Nexus Comfort Sedan",
            },
          },
          {
            timeOfDay: "Afternoon",
            title: "Local Artisans & Handicraft Market",
            description: `Engage with master craftsmen and pick up authentic souvenirs from ${destination}.`,
            location: "Bazaar Market",
            estimatedCost: 1200,
          },
          {
            timeOfDay: "Evening",
            title: "Farewell Dinner with Scenic Ambience",
            description: "Celebrate the trip with rooftop dinner and panoramic nighttime vistas.",
            location: "Skyline Lounge",
            estimatedCost: 1100,
          },
        ],
      },
    ],
  };

  // Build the day-by-day plan up to 'days'
  const daysPlan: ItineraryDay[] = [];
  let totalCost = 0;

  for (let d = 1; d <= days; d++) {
    const templateIndex = (d - 1) % destInfo.itineraryTemplates.length;
    const template = destInfo.itineraryTemplates[templateIndex];
    const stayChoice = destInfo.sampleStays[(d - 1) % destInfo.sampleStays.length];

    const dayActivitiesCost = template.activities.reduce((acc, act) => acc + act.estimatedCost, 0);
    const dayTransitCost = template.activities.reduce(
      (acc, act) => acc + (act.transitSuggestion?.estimatedFare || 0),
      0
    );
    const dayTotal = dayActivitiesCost + dayTransitCost + stayChoice.price;
    totalCost += dayTotal;

    daysPlan.push({
      dayNumber: d,
      title: `Day ${d}: ${template.title}`,
      subtitle: template.subtitle,
      activities: template.activities,
      dayCost: dayTotal,
      recommendedStay: {
        name: stayChoice.name,
        city: destination,
        pricePerNight: stayChoice.price,
        tag: stayChoice.tag,
      },
    });
  }

  // Budget calculations
  const accommodationTotal = days * (destInfo.sampleStays[0]?.price || 2800);
  const transitTotal = Math.round(totalCost * 0.22);
  const activitiesTotal = Math.round(totalCost * 0.35);
  const bufferTotal = Math.max(0, numericBudget - totalCost);

  return {
    destination,
    days,
    targetBudget: numericBudget,
    totalEstimatedCost: totalCost,
    vibe,
    travelers,
    budgetSplit: {
      accommodation: accommodationTotal,
      transitCabs: transitTotal,
      activitiesAndFood: activitiesTotal,
      buffer: bufferTotal > 0 ? bufferTotal : 1500,
    },
    highlights: destInfo.highlights,
    daysPlan,
    localTips: destInfo.tips,
    bestSeason: destInfo.bestSeason,
  };
};

export const summarizeStayReviews = async (stayTitle: string): Promise<ReviewSummary> => {
  return {
    stayTitle,
    overallRating: 4.88,
    sentimentScore: 96,
    summary:
      `Travelers overwhelmingly praise "${stayTitle}" for its serene mountain surroundings, sparkling cleanliness, and exceptionally warm host hospitality. Guests consistently highlighted fast WiFi for remote work and seamless Travel Nexus cab drop-offs directly to the entrance.`,
    topHighlights: [
      "Breathtaking mountain sunrise views right from private balconies",
      "High-speed fiber WiFi (verified 100+ Mbps) suited for remote travelers",
      "Piping hot water 24/7 with authentic wooden architecture",
      "Doorstep pickup coordination for Travel Nexus cabs",
    ],
    pros: [
      "Extremely clean rooms with comfortable premium bedding",
      "Delicious homemade complimentary breakfast and herbal teas",
      "Friendly local host who provides insider trekking guidance",
    ],
    cons: [
      "Located on a mild 60-meter incline from main road (cabs navigate easily)",
      "Popular stay—requires early booking during peak autumn & winter seasons",
    ],
    idealFor: ["Couples & Honeymooners", "Remote Workers / Digital Nomads", "Nature & Peace Seekers"],
    sampleQuotes: [
      "“Waking up to snow peaks and sipping fresh chai was the highlight of our entire Manali trip!” — Ananya S.",
      "“WiFi was super reliable for my Zoom meetings, and our Travel Nexus cab driver picked us up right at the gate.” — Rohan M.",
    ],
  };
};

export const chatWithTravelAssistant = async (
  userMessage: string,
  destinationContext?: string
): Promise<ChatMessageResponse> => {
  const lower = userMessage.toLowerCase();

  // Cab / Ride intent
  if (lower.includes("cab") || lower.includes("ride") || lower.includes("fare") || lower.includes("taxi")) {
    return {
      reply:
        "Travel Nexus provides on-demand doorstep cab transit with transparent upfront pricing and verified mountain drivers. " +
        "You can request standard hatchbacks (**Nexus Go**), comfortable sedans (**Nexus Comfort**), or 6-seater SUVs (**Nexus XL**) with live GPS tracking.",
      suggestedActions: [
        {
          type: "BOOK_CAB",
          label: "🚗 Book a Cab Now",
          payload: destinationContext || "Mall Road",
        },
        {
          type: "PLAN_TRIP",
          label: "✨ Plan Multi-Day Transit",
        },
      ],
    };
  }

  // Stay / Hotel intent
  if (lower.includes("stay") || lower.includes("hotel") || lower.includes("homestay") || lower.includes("room")) {
    return {
      reply:
        `Travel Nexus offers verified homestays, riverside cottages, and mountain villas in ${destinationContext || "Manali, Goa, and Jaipur"}. ` +
        "Each stay includes high-speed WiFi, verified host credentials, and automatic cab transfer integration.",
      suggestedActions: [
        {
          type: "VIEW_STAYS",
          label: `🏨 Explore Stays in ${destinationContext || "Manali"}`,
          payload: destinationContext || "Manali",
        },
        {
          type: "PLAN_TRIP",
          label: "✨ Generate Itinerary with Stays",
        },
      ],
    };
  }

  // Weather / Best time intent
  if (lower.includes("weather") || lower.includes("season") || lower.includes("best time") || lower.includes("snow")) {
    return {
      reply:
        "For mountain destinations like **Manali**, snow lovers should visit between **December and February**. " +
        "For mild sightseeing and apple harvest season, **September to November** is ideal. " +
        "For coastal destinations like **Goa**, the cool breeze and vibrant beach season peaks from **November to March**.",
      suggestedActions: [
        {
          type: "PLAN_TRIP",
          label: "✨ Create Season Itinerary",
        },
        {
          type: "EXPLORE_DESTINATION",
          label: "🗺️ Explore Popular Destinations",
        },
      ],
    };
  }

  // Food / Cafes
  if (lower.includes("food") || lower.includes("eat") || lower.includes("cafe") || lower.includes("restaurant")) {
    return {
      reply:
        "Top culinary recommendations:\n\n" +
        "- **Manali**: Try authentic *Himachali Siddu with ghee*, fresh river trout at *Cafe 1947*, and wood-fired pizza in Old Manali.\n" +
        "- **Goa**: Savor *Goan Prawn Curry*, butter garlic squid at *Fisherman's Wharf*, and clifftop Greek mezze at *Thalassa*.\n" +
        "- **Jaipur**: Don't miss *Pyaaz Kachori* at Rawat Mishthan Bhandar and royal *Laal Maas* at 1135 AD inside Amber Fort.",
      suggestedActions: [
        {
          type: "BOOK_CAB",
          label: "🚕 Book Cab to Cafe Hub",
        },
        {
          type: "VIEW_STAYS",
          label: "🏨 Find Stays near Dining",
        },
      ],
    };
  }

  // Default Travel Concierge response
  return {
    reply:
      `I'm your **Travel Nexus AI Concierge**! I can help you plan personalized day-by-day itineraries, ` +
      `calculate exact trip budgets, coordinate verified homestays, and schedule doorstep cab pickups.\n\n` +
      `Where are you looking to travel next? Ask me about itineraries, stays, cab fares, or local highlights!`,
    suggestedActions: [
      {
        type: "PLAN_TRIP",
        label: "✨ Plan a 4-Day Manali Trip",
        payload: "Manali",
      },
      {
        type: "VIEW_STAYS",
        label: "🏨 Browse Top Stays",
      },
      {
        type: "BOOK_CAB",
        label: "🚗 Check Cab Fares",
      },
    ],
  };
};
