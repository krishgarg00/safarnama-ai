import { Request, Response } from "express";
import {
  generateAiItinerary,
  summarizeStayReviews,
  chatWithTravelAssistant,
} from "../services/ai.service";

export const planTripController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { destination, days, budget, vibe, travelers } = req.body;

    if (!destination) {
      res.status(400).json({
        success: false,
        message: "Destination is required to generate itinerary",
      });
      return;
    }

    const itinerary = await generateAiItinerary({
      destination,
      days: Number(days) || 3,
      budget,
      vibe,
      travelers,
    });

    res.status(200).json({
      success: true,
      message: "Itinerary generated successfully",
      itinerary,
    });
  } catch (error) {
    console.error("Error generating AI itinerary:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate itinerary",
    });
  }
};

export const summarizeReviewsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { stayTitle } = req.body;

    const summary = await summarizeStayReviews(stayTitle || "Mountain View Homestay");

    res.status(200).json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error("Error summarizing reviews:", error);
    res.status(500).json({
      success: false,
      message: "Failed to summarize reviews",
    });
  }
};

export const chatController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { message, destinationContext } = req.body;

    if (!message) {
      res.status(400).json({
        success: false,
        message: "User message is required",
      });
      return;
    }

    const result = await chatWithTravelAssistant(message, destinationContext);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error in AI chat concierge:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process chat message",
    });
  }
};
