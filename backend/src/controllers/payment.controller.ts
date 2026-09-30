import { Request, Response } from "express";
import {
  createPayment,
  updatePaymentStatus,
  getPaymentById,
  getMyPayments,
} from "../services/payment.service";

export const createPaymentController = async (
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
      booking,
      ride,
      paymentMethod,
    } = req.body;

    if (!paymentMethod) {
      res.status(400).json({
        success: false,
        message: "Payment method is required",
      });
      return;
    }

    const allowedPaymentMethods = [
      "RAZORPAY",
      "STRIPE",
      "CASH",
    ];

    if (!allowedPaymentMethods.includes(paymentMethod)) {
      res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
      return;
    }

    const payment = await createPayment({
      user: req.user.userId,
      booking,
      ride,
      paymentMethod,
    });

    res.status(201).json({
      success: true,
      message: "Payment created successfully",
      payment,
    });
  } catch (error) {
    console.error("Error creating payment:", error);

    if (error instanceof Error) {
      const knownErrors = [
        "Invalid user ID",
        "Invalid booking ID",
        "Invalid ride ID",
        "Booking not found",
        "Ride not found",
        "Payment cannot belong to both booking and ride",
        "Payment must belong to a booking or ride",
        "You can only pay for your own booking",
        "You can only pay for your own ride",
        "Cancelled bookings cannot be paid for",
        "Only completed rides can be paid for",
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
      message: "Failed to create payment",
    });
  }
};

export const updatePaymentStatusController = async (
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

    const allowedStatuses = ["SUCCESS", "FAILED", "REFUNDED"];

    if (!allowedStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: "Invalid payment status",
      });
      return;
    }

    const payment = await updatePaymentStatus(
      id,
      req.user.userId,
      status as "SUCCESS" | "FAILED" | "REFUNDED"
    );

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      payment,
    });
  } catch (error) {
    console.error("Error updating payment status:", error);

    if (error instanceof Error) {
      const knownErrors = [
        "Invalid payment ID",
        "Payment not found",
        "You can only update your own payments",
        "Refunded payments cannot be updated",
        "Payment is already successful",
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
      message: "Failed to update payment status",
    });
  }
};

export const getPaymentByIdController = async (
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

    const payment = await getPaymentById(
      id,
      req.user.userId
    );

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error("Error getting payment:", error);

    if (error instanceof Error) {
      const knownErrors = [
        "Invalid payment ID",
        "Payment not found",
        "You can only view your own payments",
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
      message: "Failed to get payment",
    });
  }
};

export const getMyPaymentsController = async (
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

    const payments = await getMyPayments(req.user.userId);

    res.status(200).json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error("Error getting payment history:", error);

    if (error instanceof Error && error.message === "Invalid user ID") {
      res.status(400).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to get payment history",
    });
  }
};