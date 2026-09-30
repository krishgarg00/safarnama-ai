import { Request, Response } from "express";
import {
  createRide,
  getAvailableRides,
  acceptRide,
  updateRideStatus,
  cancelRide,
  getMyRides,
  getDriverRides,
  getRideById,
} from "../services/ride.service";

export const createRideController = async (
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
      pickupLocation,
      dropoffLocation,
      fare,
    } = req.body;

    if (
      !pickupLocation ||
      !dropoffLocation ||
      fare === undefined
    ) {
      res.status(400).json({
        success: false,
        message:
          "Pickup location, drop-off location and fare are required",
      });
      return;
    }

    const ride = await createRide({
      customer: req.user.userId,
      pickupLocation,
      dropoffLocation,
      fare: Number(fare),
    });

    res.status(201).json({
      success: true,
      message: "Ride requested successfully",
      ride,
    });
  } catch (error) {
    console.error("Error creating ride:", error);

    if (error instanceof Error) {
      const knownErrors = [
        "Invalid customer ID",
        "Pickup and drop-off locations are required",
        "Fare cannot be negative",
      ];

      if (knownErrors.includes(error.message)) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }
    }

    res.status(500).json({
      success: false,
      message: "Failed to request ride",
    });
  }
};

export const getAvailableRidesController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const rides = await getAvailableRides();

    res.status(200).json({
      success: true,
      rides,
    });
  } catch (error) {
    console.error("Error fetching available rides:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch available rides",
    });
  }
};

export const acceptRideController = async (
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

    const id = String(req.params.id);

    const ride = await acceptRide(
      id,
      req.user.userId
    );

    res.status(200).json({
      success: true,
      message: "Ride accepted successfully",
      ride,
    });
  } catch (error) {
    console.error("Error accepting ride:", error);

    if (error instanceof Error) {
      const knownErrors = [
        "Invalid ride ID",
        "Invalid driver ID",
        "Ride not found",
        "Only requested rides can be accepted",
        "This ride has already been assigned",
      ];

      if (knownErrors.includes(error.message)) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }
    }

    res.status(500).json({
      success: false,
      message: "Failed to accept ride",
    });
  }
};

export const updateRideStatusController = async (
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

    const id = String(req.params.id);
    const { status } = req.body || {};

    const allowedStatuses = [
      "DRIVER_ARRIVING",
      "IN_PROGRESS",
      "COMPLETED",
    ];

    if (!allowedStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: "Invalid ride status",
      });
      return;
    }

    const ride = await updateRideStatus(
      id,
      req.user.userId,
      status
    );

    res.status(200).json({
      success: true,
      message: "Ride status updated successfully",
      ride,
    });
  } catch (error) {
    console.error("Error updating ride status:", error);

    if (error instanceof Error) {
      if (
        error.message === "Invalid ride ID" ||
        error.message === "Invalid driver ID" ||
        error.message === "Ride not found" ||
        error.message ===
          "You can only update rides assigned to you"
      ) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }

      if (
        error.message.startsWith(
          "Invalid ride status transition"
        )
      ) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }
    }

    res.status(500).json({
      success: false,
      message: "Failed to update ride status",
    });
  }
};

export const cancelRideController = async (
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

    const id = String(req.params.id);

    const ride = await cancelRide(
      id,
      req.user.userId,
      req.user.role as "CUSTOMER" | "DRIVER"
    );

    res.status(200).json({
      success: true,
      message: "Ride cancelled successfully",
      ride,
    });
  } catch (error) {
    console.error("Error cancelling ride:", error);

    if (error instanceof Error) {
      const knownErrors = [
        "Invalid ride ID",
        "Ride not found",
        "You can only cancel your own rides",
        "You can only cancel rides assigned to you",
        "Completed or already cancelled rides cannot be cancelled",
      ];

      if (knownErrors.includes(error.message)) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }
    }

    res.status(500).json({
      success: false,
      message: "Failed to cancel ride",
    });
  }
};

export const getMyRidesController = async (
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

    const rides = await getMyRides(req.user.userId);

    res.status(200).json({
      success: true,
      rides,
    });
  } catch (error) {
    console.error("Error fetching customer rides:", error);

    if (
      error instanceof Error &&
      error.message === "Invalid customer ID"
    ) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch rides",
    });
  }
};

export const getDriverRidesController = async (
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

    const rides = await getDriverRides(req.user.userId);

    res.status(200).json({
      success: true,
      rides,
    });
  } catch (error) {
    console.error("Error fetching driver rides:", error);

    if (
      error instanceof Error &&
      error.message === "Invalid driver ID"
    ) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch driver rides",
    });
  }
};

export const getRideByIdController = async (
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

    const id = String(req.params.id);

    const ride = await getRideById(
      id,
      req.user.userId,
      req.user.role as "CUSTOMER" | "DRIVER" | "ADMIN"
    );

    res.status(200).json({
      success: true,
      ride,
    });
  } catch (error) {
    console.error("Error fetching ride:", error);

    if (error instanceof Error) {
      const knownErrors = [
        "Invalid ride ID",
        "Ride not found",
        "You can only view your own rides",
        "You can only view rides assigned to you",
      ];

      if (knownErrors.includes(error.message)) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch ride",
    });
  }
};  