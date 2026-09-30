import mongoose from "mongoose";
import Payment from "../models/Payment";
import Booking from "../models/Booking";
import Ride from "../models/Ride";

interface CreatePaymentData {
  user: string;
  booking?: string;
  ride?: string;
  paymentMethod: "RAZORPAY" | "STRIPE" | "CASH";
}

export const createPayment = async (
  paymentData: CreatePaymentData
) => {
  const {
    user,
    booking,
    ride,
    paymentMethod,
  } = paymentData;

  if (!mongoose.Types.ObjectId.isValid(user)) {
    throw new Error("Invalid user ID");
  }

  if (booking && ride) {
    throw new Error(
      "Payment cannot belong to both booking and ride"
    );
  }

  if (!booking && !ride) {
    throw new Error(
      "Payment must belong to a booking or ride"
    );
  }

  let amount = 0;

  if (booking) {
    if (!mongoose.Types.ObjectId.isValid(booking)) {
      throw new Error("Invalid booking ID");
    }

    const bookingData = await Booking.findById(booking);

    if (!bookingData) {
      throw new Error("Booking not found");
    }

    if (bookingData.customer.toString() !== user) {
      throw new Error(
        "You can only pay for your own booking"
      );
    }

    if (bookingData.status === "CANCELLED") {
      throw new Error(
        "Cancelled bookings cannot be paid for"
      );
    }

    amount = bookingData.totalPrice;
  }

  if (ride) {
    if (!mongoose.Types.ObjectId.isValid(ride)) {
      throw new Error("Invalid ride ID");
    }

    const rideData = await Ride.findById(ride);

    if (!rideData) {
      throw new Error("Ride not found");
    }

    if (rideData.customer.toString() !== user) {
      throw new Error(
        "You can only pay for your own ride"
      );
    }

    if (rideData.status !== "COMPLETED") {
      throw new Error(
        "Only completed rides can be paid for"
      );
    }

    amount = rideData.fare;
  }

  const payment = await Payment.create({
    user,
    booking,
    ride,
    amount,
    currency: "INR",
    status: "PENDING",
    paymentMethod,
  });

  return payment;
};