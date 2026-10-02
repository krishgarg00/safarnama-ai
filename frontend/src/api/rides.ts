import { apiRequest } from "./client";

export const getMyRides = async () => {
  return apiRequest("/rides/my");
};

interface CreateRideData {
  pickupLocation: string;
  dropoffLocation: string;
  fare: number;
}

export const createRide = async (data: CreateRideData) => {
  return apiRequest("/rides", {
    method: "POST",
    body: JSON.stringify(data),
  });
};