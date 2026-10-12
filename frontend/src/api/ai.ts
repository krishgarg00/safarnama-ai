import { apiRequest } from "./client";

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
  sentimentScore: number;
  summary: string;
  topHighlights: string[];
  pros: string[];
  cons: string[];
  idealFor: string[];
  sampleQuotes: string[];
}

export interface ChatAction {
  type: "BOOK_CAB" | "VIEW_STAYS" | "EXPLORE_DESTINATION" | "PLAN_TRIP";
  label: string;
  payload?: string;
}

export interface ChatMessageResponse {
  reply: string;
  suggestedActions: ChatAction[];
}

export const generateAiItinerary = async (
  params: PlanTripParams
): Promise<GeneratedItinerary> => {
  const res = await apiRequest("/ai/plan-trip", {
    method: "POST",
    body: JSON.stringify(params),
  });
  return res.itinerary;
};

export const summarizeStayReviews = async (
  stayTitle: string
): Promise<ReviewSummary> => {
  const res = await apiRequest("/ai/summarize-reviews", {
    method: "POST",
    body: JSON.stringify({ stayTitle }),
  });
  return res.summary;
};

export const chatWithAiConcierge = async (
  message: string,
  destinationContext?: string
): Promise<ChatMessageResponse> => {
  const res = await apiRequest("/ai/chat", {
    method: "POST",
    body: JSON.stringify({ message, destinationContext }),
  });
  return {
    reply: res.reply,
    suggestedActions: res.suggestedActions || [],
  };
};
