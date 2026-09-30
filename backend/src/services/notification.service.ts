import mongoose from "mongoose";
import Notification from "../models/Notification";

interface CreateNotificationData {
  user: string;
  title: string;
  message: string;
  type: "BOOKING" | "RIDE" | "PAYMENT" | "REVIEW" | "SYSTEM";
}

export const createNotification = async ({
  user,
  title,
  message,
  type,
}: CreateNotificationData) => {
  if (!mongoose.Types.ObjectId.isValid(user)) {
    throw new Error("Invalid user ID");
  }

  if (!title || !message) {
    throw new Error("Notification title and message are required");
  }

  return Notification.create({
    user,
    title,
    message,
    type,
    isRead: false,
  });
};

export const getMyNotifications = async (userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  return Notification.find({ user: userId })
    .sort({ createdAt: -1 });
};

export const markNotificationAsRead = async (
  notificationId: string,
  userId: string
) => {
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    throw new Error("Invalid notification ID");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const notification = await Notification.findById(notificationId);

  if (!notification) {
    throw new Error("Notification not found");
  }

  if (notification.user.toString() !== userId) {
    throw new Error("You can only update your own notifications");
  }

  notification.isRead = true;

  await notification.save();

  return notification;
};