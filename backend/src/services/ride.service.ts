import mongoose from "mongoose";
import Ride from "../models/Ride";
import { getIO } from "../socket";

interface CreateRideData {
  customer: string;
  pickupLocation: string;
  dropoffLocation: string;
  fare: number;
}

export const createRide = async (rideData: CreateRideData) => {
  const { customer, pickupLocation, dropoffLocation, fare } = rideData;

  if (!mongoose.Types.ObjectId.isValid(customer)) {
    throw new Error("Invalid customer ID");
  }

  if (!pickupLocation || !dropoffLocation) {
    throw new Error("Pickup and drop-off locations are required");
  }

  if (fare < 0) {
    throw new Error("Fare cannot be negative");
  }

  const ride = await Ride.create({
    customer,
    pickupLocation,
    dropoffLocation,
    fare,
    status: "REQUESTED",
  });

  return ride;
};

export const getAvailableRides = async () => {
  const rides = await Ride.find({
    status: "REQUESTED",
    driver: { $exists: false },
  })
    .populate("customer", "name email")
    .sort({ createdAt: -1 });

  return rides;
};

export const acceptRide = async (rideId: string, driverId: string) => {
  if (!mongoose.Types.ObjectId.isValid(rideId)) {
    throw new Error("Invalid ride ID");
  }

  if (!mongoose.Types.ObjectId.isValid(driverId)) {
    throw new Error("Invalid driver ID");
  }

  const ride = await Ride.findById(rideId);

  if (!ride) {
    throw new Error("Ride not found");
  }

  if (ride.status !== "REQUESTED") {
    throw new Error("Only requested rides can be accepted");
  }

  if (ride.driver) {
    throw new Error("This ride has already been assigned");
  }

  ride.driver = new mongoose.Types.ObjectId(driverId);
  ride.status = "ACCEPTED";

  await ride.save();

  // Send real-time update to the customer
  getIO().to(`user:${ride.customer.toString()}`).emit("ride-update", {
    rideId: ride._id.toString(),
    status: "ACCEPTED",
    message: "Your ride has been accepted 🚗",
  });

  return ride;
};

export const updateRideStatus = async (
  rideId: string,
  driverId: string,
  status: "DRIVER_ARRIVING" | "IN_PROGRESS" | "COMPLETED",
) => {
  if (!mongoose.Types.ObjectId.isValid(rideId)) {
    throw new Error("Invalid ride ID");
  }

  if (!mongoose.Types.ObjectId.isValid(driverId)) {
    throw new Error("Invalid driver ID");
  }

  const ride = await Ride.findById(rideId);

  if (!ride) {
    throw new Error("Ride not found");
  }

  if (!ride.driver || ride.driver.toString() !== driverId) {
    throw new Error("You can only update rides assigned to you");
  }

  const allowedTransitions: Record<string, string[]> = {
    ACCEPTED: ["DRIVER_ARRIVING"],
    DRIVER_ARRIVING: ["IN_PROGRESS"],
    IN_PROGRESS: ["COMPLETED"],
  };

  const allowedNextStatuses = allowedTransitions[ride.status] || [];

  if (!allowedNextStatuses.includes(status)) {
    throw new Error(
      `Invalid ride status transition from ${ride.status} to ${status}`,
    );
  }

  ride.status = status;

  await ride.save();

  // Send real-time update to the customer
  getIO()
    .to(`user:${ride.customer.toString()}`)
    .emit("ride-update", {
      rideId: ride._id.toString(),
      status: ride.status,
      message: `Your ride status is now ${ride.status}`,
    });

  return ride;
};

export const cancelRide = async (
  rideId: string,
  userId: string,
  userRole: "CUSTOMER" | "DRIVER",
) => {
  if (!mongoose.Types.ObjectId.isValid(rideId)) {
    throw new Error("Invalid ride ID");
  }

  const ride = await Ride.findById(rideId);

  if (!ride) {
    throw new Error("Ride not found");
  }

  if (userRole === "CUSTOMER") {
    if (ride.customer.toString() !== userId) {
      throw new Error("You can only cancel your own rides");
    }
  }

  if (userRole === "DRIVER") {
    if (!ride.driver || ride.driver.toString() !== userId) {
      throw new Error("You can only cancel rides assigned to you");
    }
  }

  if (ride.status === "COMPLETED" || ride.status === "CANCELLED") {
    throw new Error("Completed or already cancelled rides cannot be cancelled");
  }

  ride.status = "CANCELLED";

  await ride.save();

  // Send real-time update to the customer
  getIO().to(`user:${ride.customer.toString()}`).emit("ride-update", {
    rideId: ride._id.toString(),
    status: "CANCELLED",
    message: "Your ride has been cancelled 🚫",
  });

  return ride;
};

export const getMyRides = async (customerId: string) => {
  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    throw new Error("Invalid customer ID");
  }

  const rides = await Ride.find({
    customer: customerId,
  })
    .populate("driver", "name email")
    .sort({ createdAt: -1 });

  return rides;
};

export const getDriverRides = async (driverId: string) => {
  if (!mongoose.Types.ObjectId.isValid(driverId)) {
    throw new Error("Invalid driver ID");
  }

  const rides = await Ride.find({
    driver: driverId,
  })
    .populate("customer", "name email")
    .sort({ createdAt: -1 });

  return rides;
};

export const getRideById = async (
  rideId: string,
  userId: string,
  userRole: "CUSTOMER" | "DRIVER" | "ADMIN",
) => {
  if (!mongoose.Types.ObjectId.isValid(rideId)) {
    throw new Error("Invalid ride ID");
  }

  const ride = await Ride.findById(rideId)
    .populate("customer", "name email")
    .populate("driver", "name email");

  if (!ride) {
    throw new Error("Ride not found");
  }

  if (userRole === "CUSTOMER") {
    if (ride.customer._id.toString() !== userId) {
      throw new Error("You can only view your own rides");
    }
  }

  if (userRole === "DRIVER") {
    if (!ride.driver || ride.driver._id.toString() !== userId) {
      throw new Error("You can only view rides assigned to you");
    }
  }

  return ride;
};
