import { Request, Response } from "express";
import {
  createBooking,
  getMyBookings,
  getHostBookings,
  updateBookingStatus,
  cancelBooking,
  getBookingById,
} from "../services/booking.service";

export const createBookingController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const { stay, checkIn, checkOut, guests } = req.body;

    if (!stay || !checkIn || !checkOut || guests === undefined) {
      res.status(400).json({
        success: false,
        message: "Stay, check-in, check-out and guests are required",
      });
      return;
    }

    const booking = await createBooking({
      customer: req.user.userId,
      stay,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      guests: Number(guests),
    });

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error("Error creating booking:", error);

    if (error instanceof Error) {
      const knownErrors = [
        "Invalid customer or stay ID",
        "Stay not found",
        "Check-out date must be after check-in date",
        "Guests must be at least 1",
        "This stay is already booked for the selected dates",
      ];

      if (
        knownErrors.includes(error.message) ||
        error.message.startsWith("This stay allows")
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
      message: "Failed to create booking",
    });
  }
};

export const getMyBookingsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const bookings = await getMyBookings(req.user.userId);

    res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
};

export const getHostBookingsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const bookings = await getHostBookings(req.user.userId);

    res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("Error fetching host bookings:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch host bookings",
    });
  }
};

export const updateBookingStatusController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const { id } = req.params;
    const { status } = req.body;

    if (status !== "CONFIRMED" && status !== "REJECTED") {
      res.status(400).json({
        success: false,
        message: "Status must be CONFIRMED or REJECTED",
      });
      return;
    }

    const booking = await updateBookingStatus(id, req.user.userId, status);

    res.status(200).json({
      success: true,
      message: `Booking ${status.toLowerCase()} successfully`,
      booking,
    });
  } catch (error) {
    console.error("Error updating booking status:", error);

    if (error instanceof Error) {
      const knownErrors = [
        "Invalid booking ID",
        "Booking not found",
        "You can only manage bookings for your own stays",
        "Only pending bookings can be updated",
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
      message: "Failed to update booking status",
    });
  }
};

export const cancelBookingController = async (
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

    const { id } = req.params;

    const booking = await cancelBooking(
      id,
      req.user.userId,
      req.user.role as "CUSTOMER" | "HOST"
    );

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);

    if (error instanceof Error) {
      const knownErrors = [
        "Invalid booking ID",
        "Booking not found",
        "You can only cancel your own bookings",
        "Stay not found",
        "You can only cancel bookings for your own stays",
        "Only pending or confirmed bookings can be cancelled",
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
      message: "Failed to cancel booking",
    });
  }
};

export const getBookingByIdController = async (
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

    const { id } = req.params;

    const booking = await getBookingById(
      id,
      req.user.userId,
      req.user.role
    );

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("Error fetching booking:", error);

    if (error instanceof Error) {
      const knownErrors = [
        "Invalid booking ID",
        "Booking not found",
        "You can only view your own bookings",
        "You can only view bookings for your own stays",
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
      message: "Failed to fetch booking",
    });
  }
};