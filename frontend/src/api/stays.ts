import { apiRequest } from "./client";

export interface StayItem {
  _id: string;
  title: string;
  description: string;
  city: string;
  state: string;
  address: string;
  pricePerNight: number;
  maxGuests: number;
  amenities: string[];
  images: string[];
  host?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface StayFilters {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  maxGuests?: number;
  amenities?: string[];
}

export interface CreateStayData {
  title: string;
  description: string;
  city: string;
  state: string;
  address: string;
  pricePerNight: number;
  maxGuests: number;
  amenities?: string[];
  images?: string[];
}

export const getStays = async (filters: StayFilters = {}): Promise<{ success: boolean; stays: StayItem[] }> => {
  const queryParams = new URLSearchParams();

  if (filters.city) queryParams.append("city", filters.city);
  if (filters.minPrice !== undefined) queryParams.append("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined) queryParams.append("maxPrice", String(filters.maxPrice));
  if (filters.maxGuests !== undefined) queryParams.append("maxGuests", String(filters.maxGuests));
  if (filters.amenities && filters.amenities.length > 0) {
    queryParams.append("amenities", filters.amenities.join(","));
  }

  const queryString = queryParams.toString();
  const endpoint = `/stays${queryString ? `?${queryString}` : ""}`;

  return apiRequest(endpoint);
};

export const getStayById = async (id: string): Promise<{ success: boolean; stay: StayItem }> => {
  return apiRequest(`/stays/${id}`);
};

export const createStay = async (data: CreateStayData): Promise<{ success: boolean; stay: StayItem }> => {
  return apiRequest("/stays", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateStay = async (id: string, data: Partial<CreateStayData>): Promise<{ success: boolean; stay: StayItem }> => {
  return apiRequest(`/stays/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const deleteStay = async (id: string): Promise<{ success: boolean; message: string }> => {
  return apiRequest(`/stays/${id}`, {
    method: "DELETE",
  });
};
