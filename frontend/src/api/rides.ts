import { apiRequest } from "./client";

export interface RideItem {
  _id: string;
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
  customer?: {
    _id: string;
    name: string;
    email: string;
  };
  driver?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

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

export const getAvailableRides = async () => {
  return apiRequest("/rides/available");
};

export const acceptRide = async (rideId: string) => {
  return apiRequest(`/rides/${rideId}/accept`, {
    method: "PATCH",
  });
};

export const updateRideStatus = async (
  rideId: string,
  status: "DRIVER_ARRIVING" | "IN_PROGRESS" | "COMPLETED"
) => {
  return apiRequest(`/rides/${rideId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
};

export const getDriverRides = async () => {
  return apiRequest("/rides/driver");
};

export const cancelRide = async (rideId: string) => {
  return apiRequest(`/rides/${rideId}/cancel`, {
    method: "PATCH",
  });
};