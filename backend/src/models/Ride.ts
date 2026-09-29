import mongoose, { Document, Schema } from "mongoose";

export interface IRide extends Document {
  customer: mongoose.Types.ObjectId;
  driver?: mongoose.Types.ObjectId;
  pickupLocation: string;
  dropoffLocation: string;
  fare: number;
  status:
    | "REQUESTED"
    | "ACCEPTED"
    | "DRIVER_ARRIVING"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED";
}

const rideSchema = new Schema<IRide>(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    driver: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    pickupLocation: {
      type: String,
      required: true,
      trim: true,
    },

    dropoffLocation: {
      type: String,
      required: true,
      trim: true,
    },

    fare: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "REQUESTED",
        "ACCEPTED",
        "DRIVER_ARRIVING",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "REQUESTED",
    },
  },
  {
    timestamps: true,
  }
);

const Ride = mongoose.model<IRide>("Ride", rideSchema);

export default Ride;    