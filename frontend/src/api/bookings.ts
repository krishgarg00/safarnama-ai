import { apiRequest } from "./client";
import type { StayItem } from "./stays";

export interface BookingItem {
  _id: string;
  customer?: {
    _id: string;
    name: string;
    email: string;
  };
  stay: StayItem;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "REJECTED";
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBookingData {
  stay: string;
  checkIn: string; // ISO date string or YYYY-MM-DD
  checkOut: string; // ISO date string or YYYY-MM-DD
  guests: number;
}

export const createBooking = async (
  data: CreateBookingData
): Promise<{ success: boolean; message: string; booking: BookingItem }> => {
  return apiRequest("/bookings", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const getMyBookings = async (): Promise<{
  success: boolean;
  bookings: BookingItem[];
}> => {
  return apiRequest("/bookings/my");
};

export const getHostBookings = async (): Promise<{
  success: boolean;
  bookings: BookingItem[];
}> => {
  return apiRequest("/bookings/host");
};

export const updateBookingStatus = async (
  id: string,
  status: "CONFIRMED" | "REJECTED"
): Promise<{ success: boolean; message: string; booking: BookingItem }> => {
  return apiRequest(`/bookings/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
};

export const cancelBooking = async (
  id: string
): Promise<{ success: boolean; message: string; booking: BookingItem }> => {
  return apiRequest(`/bookings/${id}/cancel`, {
    method: "PATCH",
  });
};

export const getBookingById = async (
  id: string
): Promise<{ success: boolean; booking: BookingItem }> => {
  return apiRequest(`/bookings/${id}`);
};
