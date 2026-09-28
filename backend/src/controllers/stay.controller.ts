import { Request, Response } from "express";
import { getAllStays, createStay } from "../services/stay.service";

export const createStayController = async (
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
      title,
      description,
      city,
      state,
      address,
      pricePerNight,
      maxGuests,
      amenities,
      images,
    } = req.body;

    if (
      !title ||
      !description ||
      !city ||
      !state ||
      !address ||
      pricePerNight === undefined ||
      maxGuests === undefined
    ) {
      res.status(400).json({
        success: false,
        message: "All required stay fields must be provided",
      });
      return;
    }

    const stay = await createStay({
      title,
      description,
      city,
      state,
      address,
      pricePerNight,
      maxGuests,
      amenities,
      images,
      host: req.user.userId,
    });

    res.status(201).json({
      success: true,
      message: "Stay created successfully",
      stay,
    });
  } catch (error) {
    console.error("Error creating stay:", error);

    if (
      error instanceof Error &&
      error.message === "Invalid host ID"
    ) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to create stay",
    });
  }
};

export const getStays = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const stays = await getAllStays();

    res.status(200).json({
      success: true,
      stays,
    });
  } catch (error) {
    console.error("Error fetching stays:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch stays",
    });
  }
};