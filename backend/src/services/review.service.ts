import mongoose from "mongoose";
import Booking from "../models/Booking";
import Review from "../models/Review";

interface CreateReviewData {
  customer: string;
  stay: string;
  booking: string;
  rating: number;
  comment: string;
}

export const createReview = async (reviewData: CreateReviewData) => {
  const { customer, stay, booking, rating, comment } = reviewData;

  // Validate IDs
  if (
    !mongoose.Types.ObjectId.isValid(customer) ||
    !mongoose.Types.ObjectId.isValid(stay) ||
    !mongoose.Types.ObjectId.isValid(booking)
  ) {
    throw new Error("Invalid customer, stay or booking ID");
  }

  // Validate rating
  if (rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  // Find the booking
  const bookingData = await Booking.findById(booking);

  if (!bookingData) {
    throw new Error("Booking not found");
  }

  // Make sure the booking belongs to this customer
  if (bookingData.customer.toString() !== customer) {
    throw new Error("You can only review your own bookings");
  }

  // Make sure the booking belongs to the specified stay
  if (bookingData.stay.toString() !== stay) {
    throw new Error("Booking does not belong to this stay");
  }

  // Only confirmed bookings can be reviewed
  if (bookingData.status !== "CONFIRMED") {
    throw new Error("Only confirmed bookings can be reviewed");
  }

  // Prevent duplicate reviews
  const existingReview = await Review.findOne({
    customer,
    booking,
  });

  if (existingReview) {
    throw new Error("You have already reviewed this booking");
  }

  const review = await Review.create({
    customer,
    stay,
    booking,
    rating,
    comment,
  });

  return review;
};

export const getReviewsForStay = async (stayId: string) => {
  if (!mongoose.Types.ObjectId.isValid(stayId)) {
    throw new Error("Invalid stay ID");
  }

  const reviews = await Review.find({
    stay: stayId,
  })
    .populate("customer", "name")
    .sort({ createdAt: -1 });

  return reviews;
};

export const getReviewStatsForStay = async (stayId: string) => {
  if (!mongoose.Types.ObjectId.isValid(stayId)) {
    throw new Error("Invalid stay ID");
  }

  const result = await Review.aggregate([
    {
      $match: {
        stay: new mongoose.Types.ObjectId(stayId),
      },
    },
    {
      $group: {
        _id: "$stay",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (result.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
    };
  }

  return {
    averageRating: Number(result[0].averageRating.toFixed(1)),
    totalReviews: result[0].totalReviews,
  };
};
