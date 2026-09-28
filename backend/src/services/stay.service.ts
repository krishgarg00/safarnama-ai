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

export const getStayById = async (stayId: string) => {
  if (!mongoose.Types.ObjectId.isValid(stayId)) {
    throw new Error("Invalid stay ID");
  }

  const stay = await Stay.findById(stayId)
    .populate("host", "name email");

  if (!stay) {
    throw new Error("Stay not found");
  }

  return stay;
};

export const updateStay = async (
  stayId: string,
  userId: string,
  userRole: "HOST" | "ADMIN",
  updateData: Partial<CreateStayData>
) => {
  if (!mongoose.Types.ObjectId.isValid(stayId)) {
    throw new Error("Invalid stay ID");
  }

  const stay = await Stay.findById(stayId);

  if (!stay) {
    throw new Error("Stay not found");
  }

  // HOST can update only their own stay
  if (
    userRole === "HOST" &&
    stay.host.toString() !== userId
  ) {
    throw new Error("You can only update your own stays");
  }

  const updatedStay = await Stay.findByIdAndUpdate(
    stayId,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  ).populate("host", "name email");

  return updatedStay;
};