import { Request, Response } from "express";
import {
  createReview,
  getReviewsForStay,
  getReviewStatsForStay,
} from "../services/review.service";

export const createReviewController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const {
      stay,
      booking,
      rating,
      comment,
    } = req.body;

    if (
      !stay ||
      !booking ||
      rating === undefined ||
      !comment
    ) {
      res.status(400).json({
        success: false,
        message:
          "Stay, booking, rating and comment are required",
      });
      return;
    }

    const review = await createReview({
      customer: req.user.userId,
      stay,
      booking,
      rating: Number(rating),
      comment,
    });

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      review,
    });
  } catch (error) {
    console.error("Error creating review:", error);

    if (error instanceof Error) {
      const knownErrors = [
        "Invalid customer, stay or booking ID",
        "Booking not found",
        "You can only review your own bookings",
        "Booking does not belong to this stay",
        "Only confirmed bookings can be reviewed",
        "You have already reviewed this booking",
      ];

      if (knownErrors.includes(error.message)) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }

      if (error.message.startsWith("Rating must be")) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }
    }

    res.status(500).json({
      success: false,
      message: "Failed to create review",
    });
  }
};

export const getReviewsForStayController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const stayId = String(req.params.stayId);

    const reviews = await getReviewsForStay(stayId);

    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error("Error fetching stay reviews:", error);

    if (
      error instanceof Error &&
      error.message === "Invalid stay ID"
    ) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
    });
  }
};

export const getReviewStatsForStayController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const stayId = String(req.params.stayId);

    const stats = await getReviewStatsForStay(stayId);

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Error fetching review statistics:", error);

    if (
      error instanceof Error &&
      error.message === "Invalid stay ID"
    ) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch review statistics",
    });
  }
};