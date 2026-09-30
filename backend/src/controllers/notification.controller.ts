import { Request, Response } from "express";
import {
  createNotification,
  getMyNotifications,
  markNotificationAsRead,
} from "../services/notification.service";

export const createNotificationController = async (
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

    const { user, title, message, type } = req.body || {};

    if (!user || !title || !message || !type) {
      res.status(400).json({
        success: false,
        message: "User, title, message and type are required",
      });
      return;
    }

    const allowedTypes = [
      "BOOKING",
      "RIDE",
      "PAYMENT",
      "REVIEW",
      "SYSTEM",
    ];

    if (!allowedTypes.includes(type)) {
      res.status(400).json({
        success: false,
        message: "Invalid notification type",
      });
      return;
    }

    const notification = await createNotification({
      user,
      title,
      message,
      type,
    });

    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      notification,
    });
  } catch (error) {
    console.error("Error creating notification:", error);

    if (error instanceof Error) {
      const knownErrors = [
        "Invalid user ID",
        "Notification title and message are required",
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
      message: "Failed to create notification",
    });
  }
};

export const getMyNotificationsController = async (
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

    const notifications = await getMyNotifications(req.user.userId);

    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("Error getting notifications:", error);

    if (error instanceof Error && error.message === "Invalid user ID") {
      res.status(400).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to get notifications",
    });
  }
};

export const markNotificationAsReadController = async (
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

    const notification = await markNotificationAsRead(
      id,
      req.user.userId
    );

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);

    if (error instanceof Error) {
      const knownErrors = [
        "Invalid notification ID",
        "Invalid user ID",
        "Notification not found",
        "You can only update your own notifications",
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
      message: "Failed to update notification",
    });
  }
};