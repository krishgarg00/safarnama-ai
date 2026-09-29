import mongoose, { Document, Schema } from "mongoose";

export interface IReview extends Document {
  customer: mongoose.Types.ObjectId;
  stay: mongoose.Types.ObjectId;
  booking: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
}

const reviewSchema = new Schema<IReview>(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    stay: {
      type: Schema.Types.ObjectId,
      ref: "Stay",
      required: true,
    },

    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index(
  { customer: 1, booking: 1 },
  { unique: true }
);

const Review = mongoose.model<IReview>(
  "Review",
  reviewSchema
);

export default Review;