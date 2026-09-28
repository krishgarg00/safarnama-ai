import mongoose, { Document, Schema } from "mongoose";

export interface IStay extends Document {
  title: string;
  description: string;
  city: string;
  state: string;
  address: string;
  pricePerNight: number;
  maxGuests: number;
  amenities: string[];
  images: string[];
  host: mongoose.Types.ObjectId;
}

const staySchema = new Schema<IStay>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    pricePerNight: {
      type: Number,
      required: true,
      min: 0,
    },

    maxGuests: {
      type: Number,
      required: true,
      min: 1,
    },

    amenities: {
      type: [String],
      default: [],
    },

    images: {
      type: [String],
      default: [],
    },

    host: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Stay = mongoose.model<IStay>("Stay", staySchema);

export default Stay;