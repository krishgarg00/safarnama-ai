import mongoose from "mongoose";
import Stay from "../models/Stay";

interface CreateStayData {
  title: string;
  description: string;
  city: string;
  state: string;
  address: string;
  pricePerNight: number;
  maxGuests: number;
  amenities?: string[];
  images?: string[];
  host: string;
}

export const createStay = async (stayData: CreateStayData) => {
  const {
    title,
    description,
    city,
    state,
    address,
    pricePerNight,
    maxGuests,
    amenities,
    images,
    host,
  } = stayData;

  if (!mongoose.Types.ObjectId.isValid(host)) {
    throw new Error("Invalid host ID");
  }

  const stay = await Stay.create({
    title,
    description,
    city,
    state,
    address,
    pricePerNight,
    maxGuests,
    amenities: amenities || [],
    images: images || [],
    host,
  });

  return stay;
};

export const getAllStays = async () => {
  const stays = await Stay.find()
    .populate("host", "name email")
    .sort({ createdAt: -1 });   

  return stays;
};