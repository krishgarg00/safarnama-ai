import mongoose, { Document, Schema } from "mongoose";

export interface IBooking extends Document {
  customer: mongoose.Types.ObjectId;
  stay: mongoose.Types.ObjectId;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalPrice: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "REJECTED";
}

const bookingSchema = new Schema<IBooking>(
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

    checkIn: {
      type: Date,
      required: true,
    },

    checkOut: {
      type: Date,
      required: true,
    },

    guests: {
      type: Number,
      required: true,
      min: 1,
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "CANCELLED",
        "REJECTED",
      ],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model<IBooking>(
  "Booking",
  bookingSchema
);

export default Booking;