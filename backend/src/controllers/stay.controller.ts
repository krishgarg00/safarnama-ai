import { Request, Response } from "express";

import {
  createStay,
  getAllStays,
  getStayById,
  updateStay,
  deleteStay,
} from "../services/stay.service";

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
    const city =
      typeof req.query.city === "string"
        ? req.query.city
        : undefined;

    const minPrice =
      typeof req.query.minPrice === "string"
        ? Number(req.query.minPrice)
        : undefined;

    const maxPrice =
      typeof req.query.maxPrice === "string"
        ? Number(req.query.maxPrice)
        : undefined;

    const maxGuests =
      typeof req.query.maxGuests === "string"
        ? Number(req.query.maxGuests)
        : undefined;

    const amenities =
      typeof req.query.amenities === "string"
        ? req.query.amenities
            .split(",")
            .map((amenity) => amenity.trim())
            .filter(Boolean)
        : undefined;

    // Validate numeric search parameters
    if (
      (minPrice !== undefined &&
        !Number.isFinite(minPrice)) ||
      (maxPrice !== undefined &&
        !Number.isFinite(maxPrice)) ||
      (maxGuests !== undefined &&
        !Number.isFinite(maxGuests))
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid search parameters",
      });
      return;
    }

    // Validate negative values
    if (
      (minPrice !== undefined && minPrice < 0) ||
      (maxPrice !== undefined && maxPrice < 0) ||
      (maxGuests !== undefined && maxGuests < 1)
    ) {
      res.status(400).json({
        success: false,
        message: "Search parameters cannot be negative",
      });
      return;
    }

    // Validate price range
    if (
      minPrice !== undefined &&
      maxPrice !== undefined &&
      minPrice > maxPrice
    ) {
      res.status(400).json({
        success: false,
        message: "minPrice cannot be greater than maxPrice",
      });
      return;
    }

    const stays = await getAllStays(
      city,
      minPrice,
      maxPrice,
      maxGuests,
      amenities
    );

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

export const getStay = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id;

    if (typeof id !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid stay ID",
      });
      return;
    }

    const stay = await getStayById(id);

    res.status(200).json({
      success: true,
      stay,
    });
  } catch (error) {
    console.error("Error fetching stay:", error);

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

    if (
      error instanceof Error &&
      error.message === "Stay not found"
    ) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch stay",
    });
  }
};

export const updateStayController = async (
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

    const id = req.params.id;

    if (typeof id !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid stay ID",
      });
      return;
    }

    if (
      req.user.role !== "HOST" &&
      req.user.role !== "ADMIN"
    ) {
      res.status(403).json({
        success: false,
        message: "Only HOST or ADMIN can update stays",
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

    const updateData = {
      title,
      description,
      city,
      state,
      address,
      pricePerNight,
      maxGuests,
      amenities,
      images,
    };

    const cleanedUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(
        ([, value]) => value !== undefined
      )
    );

    const stay = await updateStay(
      id,
      req.user.userId,
      req.user.role,
      cleanedUpdateData
    );

    res.status(200).json({
      success: true,
      message: "Stay updated successfully",
      stay,
    });
  } catch (error) {
    console.error("Error updating stay:", error);

    if (error instanceof Error) {
      if (error.message === "Invalid stay ID") {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }

      if (error.message === "Stay not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }

      if (
        error.message ===
        "You can only update your own stays"
      ) {
        res.status(403).json({
          success: false,
          message: error.message,
        });
        return;
      }
    }

    res.status(500).json({
      success: false,
      message: "Failed to update stay",
    });
  }
};

export const deleteStayController = async (
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

    const id = req.params.id;

    if (typeof id !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid stay ID",
      });
      return;
    }

    if (
      req.user.role !== "HOST" &&
      req.user.role !== "ADMIN"
    ) {
      res.status(403).json({
        success: false,
        message: "Only HOST or ADMIN can delete stays",
      });
      return;
    }

    await deleteStay(
      id,
      req.user.userId,
      req.user.role
    );

    res.status(200).json({
      success: true,
      message: "Stay deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting stay:", error);

    if (error instanceof Error) {
      if (error.message === "Invalid stay ID") {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }

      if (error.message === "Stay not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }

      if (
        error.message ===
        "You can only delete your own stays"
      ) {
        res.status(403).json({
          success: false,
          message: error.message,
        });
        return;
      }
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete stay",
    });
  }
};